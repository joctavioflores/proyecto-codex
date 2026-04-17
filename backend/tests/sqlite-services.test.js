import test from "node:test";
import assert from "node:assert/strict";
import { createDatabase } from "../src/database/connection.js";
import { toContactDto } from "../src/dtos/contact-dto.js";
import { ContactRepository } from "../src/repositories/contact-repository.js";
import { PasswordResetTokenRepository } from "../src/repositories/password-reset-token-repository.js";
import { UserRepository } from "../src/repositories/user-repository.js";
import { AuthService } from "../src/services/auth-service.js";
import { CrudService } from "../src/services/crud-service.js";
import { UserService } from "../src/services/user-service.js";
import { signAuthToken, verifyAuthToken } from "../src/utils/token.js";

async function createTestContext() {
  const database = await createDatabase(":memory:", { seed: false });
  const userRepository = new UserRepository(database);
  const passwordResetTokenRepository = new PasswordResetTokenRepository(database);

  return {
    authService: new AuthService({
      userRepository,
      passwordResetTokenRepository,
      tokenSecret: "test-secret",
      resetTokenTtlMs: 1000 * 60,
      authTokenTtlMs: 1000 * 60 * 60
    }),
    userService: new UserService(userRepository),
    clientService: new CrudService({
      repository: new ContactRepository(database, "clients", ["email", "phone"]),
      entityName: "cliente",
      dtoMapper: (row) => toContactDto(row, ["email", "phone"]),
      inputFields: ["email", "phone"]
    }),
    supplierService: new CrudService({
      repository: new ContactRepository(database, "suppliers", ["contact", "phone"]),
      entityName: "proveedor",
      dtoMapper: (row) => toContactDto(row, ["contact", "phone"]),
      inputFields: ["contact", "phone"]
    })
  };
}

test("registro y login de usuario con SQLite", async () => {
  const { authService } = await createTestContext();

  const createdUser = await authService.register({
    name: "Ana",
    email: "ana@test.dev",
    password: "Password123",
    role: "admin"
  });

  assert.equal(createdUser.email, "ana@test.dev");
  assert.equal(createdUser.role, "admin");

  const session = await authService.login({
    email: "ana@test.dev",
    password: "Password123"
  });

  assert.ok(session.token);
  assert.equal(session.user.name, "Ana");
});

test("recuperacion y restablecimiento de contrasena con SQLite", async () => {
  const { authService } = await createTestContext();

  await authService.register({
    name: "Luis",
    email: "luis@test.dev",
    password: "Password123"
  });

  const recovery = await authService.requestPasswordReset({
    email: "luis@test.dev"
  });

  assert.ok(recovery.resetToken);

  const reset = await authService.resetPassword({
    token: recovery.resetToken,
    password: "NewPassword123"
  });

  assert.equal(reset.message, "Contrasena actualizada correctamente.");

  const session = await authService.login({
    email: "luis@test.dev",
    password: "NewPassword123"
  });

  assert.ok(session.token);
});

test("crud de clientes y proveedores con SQLite", async () => {
  const { clientService, supplierService } = await createTestContext();

  const client = await clientService.create({
    name: "Cliente Uno",
    email: "cliente@empresa.dev",
    phone: "5551234567"
  });

  const supplier = await supplierService.create({
    name: "Proveedor Uno",
    contact: "Mario",
    phone: "5557654321"
  });

  const updatedClient = await clientService.update(client.id, {
    name: "Cliente Actualizado",
    email: "nuevo@empresa.dev",
    phone: "5559990000"
  });

  assert.equal(updatedClient.name, "Cliente Actualizado");

  const suppliers = await supplierService.list({ page: 1, pageSize: 5 });
  assert.equal(suppliers.items.length, 1);
  assert.equal(suppliers.pagination.totalItems, 1);

  await supplierService.remove(supplier.id);
  const finalSuppliers = await supplierService.list({ page: 1, pageSize: 5 });
  assert.equal(finalSuppliers.items.length, 0);
});

test("crud de usuarios no expone passwordHash y permite login posterior en SQLite", async () => {
  const { userService, authService } = await createTestContext();

  const user = await userService.create({
    name: "Marta",
    email: "marta@test.dev",
    role: "user",
    password: "Password123"
  });

  assert.equal("passwordHash" in user, false);

  const users = await userService.list({ page: 1, pageSize: 5 });
  assert.equal(users.items.length, 1);
  assert.equal("passwordHash" in users.items[0], false);

  await userService.update(user.id, {
    name: "Marta Ruiz",
    email: "marta@test.dev",
    role: "admin",
    password: "NewPassword123"
  });

  const session = await authService.login({
    email: "marta@test.dev",
    password: "NewPassword123"
  });

  assert.equal(session.user.role, "admin");
});

test("listados paginados devuelven metadata consistente con SQLite", async () => {
  const { clientService } = await createTestContext();

  for (let index = 1; index <= 12; index += 1) {
    await clientService.create({
      name: `Cliente ${index}`,
      email: `cliente${index}@empresa.dev`,
      phone: `55500000${index}`
    });
  }

  const pageOne = await clientService.list({ page: 1, pageSize: 5 });
  const pageThree = await clientService.list({ page: 3, pageSize: 5 });

  assert.equal(pageOne.items.length, 5);
  assert.equal(pageOne.pagination.totalItems, 12);
  assert.equal(pageOne.pagination.totalPages, 3);
  assert.equal(pageOne.pagination.hasNextPage, true);
  assert.equal(pageThree.items.length, 2);
  assert.equal(pageThree.pagination.page, 3);
  assert.equal(pageThree.pagination.hasNextPage, false);
});

test("token expirado ya no es valido", () => {
  const token = signAuthToken(
    {
      sub: "usr_test",
      exp: Date.now() - 1000
    },
    "test-secret"
  );

  const payload = verifyAuthToken(token, "test-secret");
  assert.equal(payload, null);
});
