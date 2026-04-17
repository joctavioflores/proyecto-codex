import { bindAuthForms } from "./js/auth.js";
import { request } from "./js/api.js";
import { moduleDefinitions } from "./js/config.js";
import { formToObject } from "./js/helpers.js";
import { state } from "./js/state.js";
import {
  bindMenu,
  populateForm,
  renderDashboardShell,
  renderModuleForm,
  renderModuleList,
  resetModuleForm,
  setCurrentUser,
  setFormPending,
  setMessage,
  showAuthLayout,
  switchModule,
  updateModuleSummary
} from "./js/ui.js";

renderDashboardShell();

for (const moduleKey of Object.keys(moduleDefinitions)) {
  renderModuleForm(moduleKey);
}

bindDashboard();

bindAuthForms({
  onAuthenticated: async () => {
    setCurrentUser(state.currentUser);
    await loadAllModules();
  }
});

document.querySelector("#logoutButton").addEventListener("click", () => {
  state.authToken = "";
  state.currentUser = null;
  setCurrentUser(null);
  showAuthLayout();
  setMessage("Sesion finalizada.", "info");
});

window.addEventListener("session:expired", () => {
  setCurrentUser(null);
  showAuthLayout();
  setMessage("La sesion expiro o ya no es valida. Ingresa nuevamente.", "error");
});

function bindDashboard() {
  bindMenu(async (moduleKey) => {
    switchModule(moduleKey);
    await loadModule(moduleKey);
  });

  for (const moduleKey of Object.keys(moduleDefinitions)) {
    bindModuleForm(moduleKey);
  }
}

function bindModuleForm(moduleKey) {
  const definition = moduleDefinitions[moduleKey];
  const form = document.querySelector(`#${moduleKey}Form`);

  if (form.dataset.bound === "true") {
    return;
  }

  form.dataset.bound = "true";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormPending(event.currentTarget, true, "Guardando...");

    try {
      const payload = formToObject(event.currentTarget);
      const editingId = event.currentTarget.dataset.editingId;
      const method = editingId ? "PUT" : "POST";
      const path = editingId ? `/${definition.endpoint}/${editingId}` : `/${definition.endpoint}`;

      await request(path, method, payload, true);
      resetModuleForm(moduleKey);
      state.pagination[moduleKey].page = 1;
      await loadModule(moduleKey);
      setMessage(`${definition.singularTitle} guardado correctamente.`, "success");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setFormPending(event.currentTarget, false);
    }
  });

  form.querySelector('[data-action="cancel-edit"]').addEventListener("click", () => {
    resetModuleForm(moduleKey);
    setMessage(`Edicion de ${definition.singularTitle.toLowerCase()} cancelada.`, "info");
  });
}

async function loadAllModules() {
  for (const moduleKey of Object.keys(moduleDefinitions)) {
    await loadModule(moduleKey);
  }
}

async function loadModule(moduleKey) {
  const definition = moduleDefinitions[moduleKey];
  const { page, pageSize } = state.pagination[moduleKey];

  try {
    const response = await request(
      `/${definition.endpoint}?page=${page}&pageSize=${pageSize}`,
      "GET",
      undefined,
      true
    );

    state.pagination[moduleKey].page = response.pagination.page;
    updateModuleSummary(moduleKey, response.pagination);

    renderModuleList(
      moduleKey,
      response,
      (item) => {
        populateForm(moduleKey, item);
        switchModule(moduleKey);
        setMessage(`Editando ${definition.singularTitle.toLowerCase()}: ${item.name}`, "info");
      },
      async (item) => {
        await request(`/${definition.endpoint}/${item.id}`, "DELETE", undefined, true);
        const currentPage = state.pagination[moduleKey].page;
        state.pagination[moduleKey].page = Math.max(1, currentPage);
        await loadModule(moduleKey);
        setMessage(`${definition.singularTitle} eliminado correctamente.`, "success");
      },
      async (nextPage) => {
        state.pagination[moduleKey].page = nextPage;
        await loadModule(moduleKey);
      }
    );
  } catch (error) {
    setMessage(error.message, "error");
  }
}
