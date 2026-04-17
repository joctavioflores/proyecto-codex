import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createSchema } from "./schema.js";
import { seedDatabase } from "./seed.js";

export async function createDatabase(fileUrl, options = {}) {
  const filePath = resolveDatabasePath(fileUrl);

  if (filePath !== ":memory:") {
    // Garantiza que el directorio exista antes de abrir SQLite en disco.
    await fs.mkdir(path.dirname(filePath), { recursive: true });
  }

  const database = new DatabaseSync(filePath);
  database.exec("PRAGMA foreign_keys = ON;");
  createSchema(database);

  if (options.seed !== false) {
    seedDatabase(database);
  }

  return database;
}

function resolveDatabasePath(fileUrl) {
  if (fileUrl === ":memory:") {
    return fileUrl;
  }

  if (typeof fileUrl === "string") {
    return fileUrl;
  }

  return fileURLToPath(fileUrl);
}
