export class PasswordResetTokenRepository {
  constructor(database) {
    this.database = database;
  }

  replaceForUser(tokenRecord) {
    this.database.prepare("DELETE FROM password_reset_tokens WHERE user_id = ?").run(tokenRecord.userId);
    this.database
      .prepare(`
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        tokenRecord.id,
        tokenRecord.userId,
        tokenRecord.token,
        tokenRecord.expiresAt,
        tokenRecord.createdAt
      );

    return this.findByToken(tokenRecord.token);
  }

  findByToken(token) {
    return this.database.prepare("SELECT * FROM password_reset_tokens WHERE token = ?").get(token) || null;
  }

  deleteByToken(token) {
    this.database.prepare("DELETE FROM password_reset_tokens WHERE token = ?").run(token);
  }
}
