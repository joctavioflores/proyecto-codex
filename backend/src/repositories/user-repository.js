import { BaseSqliteRepository } from "./base-sqlite-repository.js";

export class UserRepository extends BaseSqliteRepository {
  constructor(database) {
    super(database, "users");
  }

  findByEmail(email) {
    return this.database.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
  }

  create(user) {
    this.database
      .prepare(`
        INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(user.id, user.name, user.email, user.passwordHash, user.role, user.createdAt, user.updatedAt);

    return this.findById(user.id);
  }

  update(user) {
    this.database
      .prepare(`
        UPDATE users
        SET name = ?, email = ?, password_hash = ?, role = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(user.name, user.email, user.passwordHash, user.role, user.updatedAt, user.id);

    return this.findById(user.id);
  }
}
