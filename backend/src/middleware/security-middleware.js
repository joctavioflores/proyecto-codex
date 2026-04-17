import { AppError } from "../errors/app-error.js";

export function securityHeadersMiddleware(request, response, next) {
  response.header("X-Content-Type-Options", "nosniff");
  response.header("X-Frame-Options", "DENY");
  response.header("Referrer-Policy", "no-referrer");
  response.header("Cross-Origin-Opener-Policy", "same-origin");
  response.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (request.path.startsWith("/api/auth")) {
    response.header("Cache-Control", "no-store");
  }

  next();
}

export function corsMiddleware(allowedOrigins) {
  const normalizedOrigins = new Set(allowedOrigins.filter(Boolean));

  return (request, response, next) => {
    const origin = request.headers.origin;

    if (!origin) {
      return next();
    }

    if (!normalizedOrigins.has(origin)) {
      return next(new AppError("Origen no permitido.", 403));
    }

    response.header("Access-Control-Allow-Origin", origin);
    response.header("Vary", "Origin");
    response.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");

    if (request.method === "OPTIONS") {
      return response.status(204).send();
    }

    next();
  };
}
