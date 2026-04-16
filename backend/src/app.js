import express from "express";
import { createContactPayloadDto, toContactDto } from "./dtos/contact-dto.js";
import { createUserPayloadDto, updateUserPayloadDto } from "./dtos/user-dto.js";
import { authContextMiddleware } from "./middleware/auth-middleware.js";
import { ContactRepository } from "./repositories/contact-repository.js";
import { PasswordResetTokenRepository } from "./repositories/password-reset-token-repository.js";
import { UserRepository } from "./repositories/user-repository.js";
import { createAuthRouter } from "./routes/auth-router.js";
import { createEntityRouter } from "./routes/entity-router.js";
import { AuthService } from "./services/auth-service.js";
import { CrudService } from "./services/crud-service.js";
import { UserService } from "./services/user-service.js";
import { config } from "./config.js";
import { notFound } from "./utils/http.js";

export function createApp(database) {
  const app = express();
  const userRepository = new UserRepository(database);
  const passwordResetTokenRepository = new PasswordResetTokenRepository(database);
  const clientRepository = new ContactRepository(database, "clients", ["email", "phone"]);
  const supplierRepository = new ContactRepository(database, "suppliers", ["contact", "phone"]);

  const authService = new AuthService({
    userRepository,
    passwordResetTokenRepository,
    tokenSecret: config.tokenSecret,
    resetTokenTtlMs: config.resetTokenTtlMs
  });

  const userService = new UserService(userRepository);
  const clientService = new CrudService({
    repository: clientRepository,
    entityName: "cliente",
    dtoMapper: (row) => toContactDto(row, ["email", "phone"]),
    inputFields: ["email", "phone"]
  });
  const supplierService = new CrudService({
    repository: supplierRepository,
    entityName: "proveedor",
    dtoMapper: (row) => toContactDto(row, ["contact", "phone"]),
    inputFields: ["contact", "phone"]
  });

  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    if (request.method === "OPTIONS") {
      return response.status(204).send();
    }

    next();
  });

  app.use(express.json());
  app.use(authContextMiddleware(config.tokenSecret));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.use("/api/auth", createAuthRouter(authService));
  app.use(
    "/api/users",
    createEntityRouter(userService, {
      createDto: createUserPayloadDto,
      updateDto: updateUserPayloadDto
    })
  );
  app.use(
    "/api/clients",
    createEntityRouter(clientService, {
      createDto: (payload) => createContactPayloadDto(payload, ["email", "phone"])
    })
  );
  app.use(
    "/api/suppliers",
    createEntityRouter(supplierService, {
      createDto: (payload) => createContactPayloadDto(payload, ["contact", "phone"])
    })
  );

  app.use((request, response) => {
    notFound(response);
  });

  app.use((error, _request, response, _next) => {
    const statusCode = error.statusCode || 500;
    response.status(statusCode).json({
      message: statusCode === 500 ? "Error interno del servidor." : error.message
    });
  });

  return app;
}
