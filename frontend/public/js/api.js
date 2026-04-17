import { apiBaseUrl } from "./config.js";
import { state } from "./state.js";

export async function request(path, method, body, requiresAuth = false) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(requiresAuth && state.authToken ? { Authorization: `Bearer ${state.authToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || "Error en la solicitud.");
    error.status = response.status;

    if (requiresAuth && response.status === 401) {
      state.authToken = "";
      state.currentUser = null;
      window.dispatchEvent(new CustomEvent("session:expired"));
    }

    throw error;
  }

  return data;
}
