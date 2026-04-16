export const config = {
  backendHost: process.env.BACKEND_HOST || "127.0.0.1",
  backendPort: Number(process.env.BACKEND_PORT || 4000),
  frontendHost: process.env.FRONTEND_HOST || "127.0.0.1",
  frontendPort: Number(process.env.FRONTEND_PORT || 3000),
  databaseFile: process.env.DATABASE_FILE || new URL("../data/app.sqlite", import.meta.url),
  tokenSecret: process.env.TOKEN_SECRET || "local-dev-secret",
  resetTokenTtlMs: 1000 * 60 * 15
};
