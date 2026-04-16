import { createApp } from "./app.js";
import { config } from "./config.js";
import { createDatabase } from "./database/connection.js";

const database = await createDatabase(config.databaseFile);
const app = createApp(database);

app.listen(config.backendPort, config.backendHost, () => {
  console.log(`Backend escuchando en http://${config.backendHost}:${config.backendPort}`);
});
