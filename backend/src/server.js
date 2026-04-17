import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDatabase } from "./database/connection.js";

const database = await createDatabase(config.databaseFile);
const app = createApp(database);
const resolvedDatabasePath =
  typeof config.databaseFile === "string" ? config.databaseFile : config.databaseFile.pathname;

app.listen(config.backendPort, config.backendHost, () => {
  console.log(`Backend escuchando en http://${config.backendHost}:${config.backendPort}`);
  console.log(`Base SQLite activa: ${resolvedDatabasePath}`);
});
