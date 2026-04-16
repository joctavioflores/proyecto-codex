import { request } from "./api.js";
import { state } from "./state.js";
import { setMessage, showDashboard } from "./ui.js";

export function bindAuthForms({ onAuthenticated }) {
  const resetForm = document.querySelector("#resetForm");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`#${tab.dataset.view}Form`).classList.add("active");
    });
  });

  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/login", "POST", payload);
      state.authToken = response.token;
      setMessage(`Sesion iniciada para ${response.user.name}.`);
      showDashboard();
      await onAuthenticated();
    } catch (error) {
      setMessage(error.message);
    }
  });

  document.querySelector("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/register", "POST", payload);
      setMessage(`Usuario ${response.user.email} registrado correctamente.`);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message);
    }
  });

  document.querySelector("#forgotForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/forgot-password", "POST", payload);
      setMessage(`Token generado en entorno local: ${response.resetToken}`);
      resetForm.classList.add("visible");
    } catch (error) {
      setMessage(error.message);
    }
  });

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/reset-password", "POST", payload);
      setMessage(response.message);
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message);
    }
  });
}
