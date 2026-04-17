export const config = {
  backendHost: process.env.BACKEND_HOST || "127.0.0.1",
  backendPort: Number(process.env.BACKEND_PORT || 4000),
  frontendHost: process.env.FRONTEND_HOST || "127.0.0.1",
  frontendPort: Number(process.env.FRONTEND_PORT || 3000),
  // La base activa del backend es SQLite. Ya no se usa backend/src/data/database.json.
  databaseFile: process.env.DATABASE_FILE || new URL("../data/app.sqlite", import.meta.url),
  tokenSecret: process.env.TOKEN_SECRET || "local-dev-secret",
  authTokenTtlMs: Number(process.env.AUTH_TOKEN_TTL_MS || 1000 * 60 * 60 * 8),
  resetTokenTtlMs: 1000 * 60 * 15,
  allowedOrigins: [
    process.env.FRONTEND_ORIGIN || `http://${process.env.FRONTEND_HOST || "127.0.0.1"}:${Number(process.env.FRONTEND_PORT || 3000)}`,
    `http://localhost:${Number(process.env.FRONTEND_PORT || 3000)}`
  ],
  authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 1000 * 60 * 5),
  authRateLimitMaxRequests: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 25)
};
