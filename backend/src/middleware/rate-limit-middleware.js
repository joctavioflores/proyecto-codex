import { AppError } from "../errors/app-error.js";

export function createRateLimitMiddleware({ windowMs, maxRequests }) {
  const buckets = new Map();

  return (request, _response, next) => {
    const key = request.ip || request.headers["x-forwarded-for"] || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
      buckets.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (bucket.count >= maxRequests) {
      return next(new AppError("Demasiadas solicitudes. Intenta nuevamente en unos minutos.", 429));
    }

    bucket.count += 1;
    next();
  };
}
