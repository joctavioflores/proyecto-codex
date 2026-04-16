import { BaseSqliteRepository } from "./base-sqlite-repository.js";

export class ContactRepository extends BaseSqliteRepository {
  constructor(database, tableName, fields) {
    super(database, tableName);
    this.fields = fields;
  }

  create(entity) {
    const columns = ["id", "name", ...this.fields, "created_at", "updated_at"];
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((column) => entity[this.toPropertyName(column)]);

    this.database
      .prepare(`INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${placeholders})`)
      .run(...values);

    return this.findById(entity.id);
  }

  update(entity) {
    const setClauses = ["name = ?", ...this.fields.map((field) => `${field} = ?`), "updated_at = ?"];
    const values = ["name", ...this.fields, "updatedAt"].map((field) => entity[field]);

    this.database
      .prepare(`UPDATE ${this.tableName} SET ${setClauses.join(", ")} WHERE id = ?`)
      .run(...values, entity.id);

    return this.findById(entity.id);
  }

  toPropertyName(column) {
    if (column === "created_at") {
      return "createdAt";
    }

    if (column === "updated_at") {
      return "updatedAt";
    }

    return column;
  }
}
