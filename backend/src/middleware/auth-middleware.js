import { unauthorized } from "../utils/http.js";
import { verifyAuthToken } from "../utils/token.js";

export function authContextMiddleware(tokenSecret) {
  return (request, _response, next) => {
    const token = request.headers.authorization?.replace("Bearer ", "");
    request.user = token ? verifyAuthToken(token, tokenSecret) : null;
    next();
  };
}

export function requireAuth(request, response, next) {
  if (!request.user) {
    return unauthorized(response);
  }

  next();
}
