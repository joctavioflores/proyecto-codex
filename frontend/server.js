import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../backend/src/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "public");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const server = http.createServer(async (request, response) => {
  const pathname = request.url === "/" ? "/index.html" : request.url;
  const filePath = path.join(rootDir, pathname);

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "text/plain" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("No encontrado");
  }
});

server.listen(config.frontendPort, config.frontendHost, () => {
  console.log(`Frontend escuchando en http://${config.frontendHost}:${config.frontendPort}`);
});
