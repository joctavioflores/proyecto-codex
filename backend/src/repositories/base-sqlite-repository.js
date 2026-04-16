export class BaseSqliteRepository {
  constructor(database, tableName) {
    this.database = database;
    this.tableName = tableName;
  }

  countAll() {
    const result = this.database.prepare(`SELECT COUNT(*) AS count FROM ${this.tableName}`).get();
    return result.count;
  }

  listPaginated({ page, pageSize }) {
    const offset = (page - 1) * pageSize;
    return this.database
      .prepare(
        `SELECT * FROM ${this.tableName} ORDER BY datetime(created_at) DESC, id DESC LIMIT ? OFFSET ?`
      )
      .all(pageSize, offset);
  }

  findById(id) {
    return this.database.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`).get(id) || null;
  }

  deleteById(id) {
    const result = this.database.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
    return result.changes > 0;
  }
}
