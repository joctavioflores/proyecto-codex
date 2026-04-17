import { request } from "./api.js";
import { state } from "./state.js";
import { setCurrentUser, setFormPending, setMessage, showDashboard } from "./ui.js";

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
    setFormPending(event.currentTarget, true, "Ingresando...");
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/login", "POST", payload);
      state.authToken = response.token;
      state.currentUser = response.user;
      setCurrentUser(response.user);
      setMessage(`Sesion iniciada para ${response.user.name}.`, "success");
      showDashboard();
      await onAuthenticated();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setFormPending(event.currentTarget, false);
    }
  });

  document.querySelector("#registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormPending(event.currentTarget, true, "Registrando...");
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/register", "POST", payload);
      setMessage(`Usuario ${response.user.email} registrado correctamente.`, "success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setFormPending(event.currentTarget, false);
    }
  });

  document.querySelector("#forgotForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormPending(event.currentTarget, true, "Generando token...");
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/forgot-password", "POST", payload);
      setMessage(`Token generado en entorno local: ${response.resetToken}`, "info");
      resetForm.classList.add("visible");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setFormPending(event.currentTarget, false);
    }
  });

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormPending(event.currentTarget, true, "Actualizando...");
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await request("/auth/reset-password", "POST", payload);
      setMessage(response.message, "success");
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setFormPending(event.currentTarget, false);
    }
  });
}
