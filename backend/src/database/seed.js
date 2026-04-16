import { generateId, hashPassword } from "../utils/crypto.js";

export function seedDatabase(database) {
  const existingUsers = database.prepare("SELECT COUNT(*) AS count FROM users").get();
  if (existingUsers.count > 0) {
    return;
  }

  const timestamp = new Date().toISOString();
  const adminUser = {
    id: generateId("usr"),
    name: "Administrador",
    email: "admin@local.dev",
    passwordHash: hashPassword("Admin1234"),
    role: "admin",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  database
    .prepare(`
      INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      adminUser.id,
      adminUser.name,
      adminUser.email,
      adminUser.passwordHash,
      adminUser.role,
      adminUser.createdAt,
      adminUser.updatedAt
    );
}
