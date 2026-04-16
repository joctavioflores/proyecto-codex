export function jsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  });
  response.end(JSON.stringify(payload));
}

export async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
  }

  if (!body) {
    return {};
  }

  return JSON.parse(body);
}

export function notFound(response) {
  return jsonResponse(response, 404, { message: "Recurso no encontrado." });
}

export function badRequest(response, message) {
  return jsonResponse(response, 400, { message });
}

export function unauthorized(response, message = "No autorizado.") {
  return jsonResponse(response, 401, { message });
}
