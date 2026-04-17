import { moduleDefinitions } from "./config.js";
import { fieldInputType, labelize } from "./helpers.js";
import { state } from "./state.js";

const messageNode = document.querySelector("#appFeedback");
const dashboardNode = document.querySelector("#dashboard");
const layoutNode = document.querySelector(".layout");
const modulesContainer = document.querySelector("#modulesContainer");
const menuNode = document.querySelector("#dashboardMenu");
const currentUserNode = document.querySelector("#currentUser");
const overviewNode = document.querySelector("#overviewCards");

export function setMessage(message, type = "info") {
  state.message = { text: message, type };

  if (!message) {
    messageNode.textContent = "";
    messageNode.className = "feedback hidden";
    return;
  }

  messageNode.textContent = message;
  messageNode.className = `feedback feedback-${type}`;
}

export function showDashboard() {
  layoutNode.classList.add("hidden");
  dashboardNode.classList.remove("hidden");
}

export function showAuthLayout() {
  layoutNode.classList.remove("hidden");
  dashboardNode.classList.add("hidden");
}

export function setCurrentUser(user) {
  currentUserNode.textContent = user
    ? `Sesion activa: ${user.name} · ${user.role} · ${user.email}`
    : "Sin sesion activa";
}

export function renderDashboardShell() {
  menuNode.innerHTML = Object.values(moduleDefinitions)
    .map(
      (definition) => `
        <button
          type="button"
          class="menu-link ${definition.key === state.activeModule ? "active" : ""}"
          data-module="${definition.key}"
        >
          <span class="menu-link-main">
            <span class="menu-link-icon">${definition.icon}</span>
            <span>
              <strong>${definition.title}</strong>
              <small>${definition.description}</small>
            </span>
          </span>
          <span class="menu-link-count" data-count-for="${definition.key}">${state.moduleSummaries[definition.key]}</span>
        </button>
      `
    )
    .join("");

  modulesContainer.innerHTML = Object.values(moduleDefinitions)
    .map(
      (definition) => `
        <section
          id="module-${definition.key}"
          class="module-view ${definition.key === state.activeModule ? "active" : ""}"
        >
          <article class="panel module-header">
            <p class="eyebrow">Modulo</p>
            <div class="module-header-grid">
              <div>
                <h3>${definition.title}</h3>
                <p>${definition.description}</p>
              </div>
              <div class="module-badge-stack">
                <span class="module-badge">Paginado</span>
                <span class="module-badge">Acceso autenticado</span>
              </div>
            </div>
          </article>
          <article class="panel module-body">
            <div class="module-columns">
              <section class="module-form-section">
                <div class="section-title">
                  <h4>Formulario de ${definition.singularTitle.toLowerCase()}</h4>
                </div>
                ${definition.note ? `<p class="panel-note">${definition.note}</p>` : ""}
                <form id="${definition.key}Form" class="mini-form"></form>
              </section>
              <section class="module-list-section">
                <div class="section-title section-title-spaced">
                  <h4>Listado paginado</h4>
                  <span class="page-size-note">5 registros por pagina</span>
                </div>
                <div id="${definition.key}List" class="list"></div>
                <div id="${definition.key}Pagination" class="pagination"></div>
              </section>
            </div>
          </article>
        </section>
      `
    )
    .join("");
}

export function renderModuleForm(moduleKey) {
  const definition = moduleDefinitions[moduleKey];
  const form = document.querySelector(`#${definition.key}Form`);

  form.innerHTML =
    definition.fields.map((field) => buildField(field)).join("") +
    `
      <div class="form-actions">
        <button type="submit">Guardar</button>
        <button type="button" class="secondary" data-action="cancel-edit">Cancelar</button>
      </div>
    `;
}

export function setFormPending(form, pending, text = "Guardando...") {
  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) {
    return;
  }

  if (!submitButton.dataset.defaultText) {
    submitButton.dataset.defaultText = submitButton.textContent;
  }

  submitButton.disabled = pending;
  submitButton.textContent = pending ? text : submitButton.dataset.defaultText;
}

export function bindMenu(onChangeModule) {
  menuNode.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => onChangeModule(button.dataset.module));
  });
}

export function switchModule(moduleKey) {
  state.activeModule = moduleKey;

  menuNode.querySelectorAll("[data-module]").forEach((button) => {
    button.classList.toggle("active", button.dataset.module === moduleKey);
  });

  document.querySelectorAll(".module-view").forEach((view) => {
    view.classList.toggle("active", view.id === `module-${moduleKey}`);
  });
}

export function populateForm(moduleKey, item) {
  const definition = moduleDefinitions[moduleKey];
  const form = document.querySelector(`#${definition.key}Form`);
  form.dataset.editingId = item.id;

  definition.fields.forEach((field) => {
    form.elements[field.name].value = field.name === "password" ? "" : (item[field.name] || "");
  });
}

export function resetModuleForm(moduleKey) {
  const form = document.querySelector(`#${moduleKey}Form`);
  form.reset();
  delete form.dataset.editingId;
}

export function updateModuleSummary(moduleKey, pagination) {
  state.moduleSummaries[moduleKey] = pagination.totalItems;
  const badge = menuNode.querySelector(`[data-count-for="${moduleKey}"]`);
  if (badge) {
    badge.textContent = String(pagination.totalItems);
  }

  renderOverview();
}

export function renderModuleList(moduleKey, response, onEdit, onDelete, onPageChange) {
  const definition = moduleDefinitions[moduleKey];
  const list = document.querySelector(`#${moduleKey}List`);
  const pagination = document.querySelector(`#${moduleKey}Pagination`);

  list.innerHTML = "";
  pagination.innerHTML = "";

  if (!response.items.length) {
    list.innerHTML = `<article class="empty-state">${definition.emptyState}</article>`;
  }

  for (const item of response.items) {
    const article = document.createElement("article");
    article.className = "list-item";
    article.innerHTML = `
      <div class="list-item-header">
        <div>
          <h4>${item.name}</h4>
          <p class="list-item-subtitle">${definition.singularTitle} operativo</p>
        </div>
        <span class="list-item-tag">${definition.icon}</span>
      </div>
      <dl class="list-item-grid">
        ${definition.fields
          .filter((field) => field.name !== "name" && field.name !== "password")
          .map(
            (field) => `
              <div>
                <dt>${field.label || labelize(field.name)}</dt>
                <dd>${item[field.name] || "-"}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
      <div class="actions">
        <button type="button" data-action="edit">Editar</button>
        <button type="button" data-action="delete">Eliminar</button>
      </div>
    `;

    article.querySelector('[data-action="edit"]').addEventListener("click", () => onEdit(item));
    article.querySelector('[data-action="delete"]').addEventListener("click", () => onDelete(item));
    list.appendChild(article);
  }

  const meta = response.pagination;
  pagination.innerHTML = `
    <div class="pagination-summary">
      Pagina ${meta.page} de ${meta.totalPages} · Total ${meta.totalItems}
    </div>
    <div class="pagination-actions">
      <button type="button" class="secondary" data-page="prev" ${meta.hasPreviousPage ? "" : "disabled"}>Anterior</button>
      <button type="button" class="secondary" data-page="next" ${meta.hasNextPage ? "" : "disabled"}>Siguiente</button>
    </div>
  `;

  pagination.querySelector('[data-page="prev"]')?.addEventListener("click", () => onPageChange(meta.page - 1));
  pagination.querySelector('[data-page="next"]')?.addEventListener("click", () => onPageChange(meta.page + 1));
}

function buildField(field) {
  if (field.tag === "select") {
    return `
      <label class="field">
        <span>${field.label || labelize(field.name)}</span>
        <select name="${field.name}" ${field.required ? "required" : ""}>
          ${field.options.map((option) => `<option value="${option}">${labelize(option)}</option>`).join("")}
        </select>
      </label>
    `;
  }

  return `
    <label class="field">
      <span>${field.label || labelize(field.name)}</span>
      <input
        type="${fieldInputType(field.name)}"
        name="${field.name}"
        placeholder="${field.placeholder || field.label || labelize(field.name)}"
        autocomplete="${field.autocomplete || "off"}"
        ${field.name === "password" ? 'minlength="8"' : ""}
        ${field.required ? "required" : ""}
      />
    </label>
  `;
}

function renderOverview() {
  overviewNode.innerHTML = Object.values(moduleDefinitions)
    .map(
      (definition) => `
        <article class="panel overview-card ${definition.key === state.activeModule ? "active" : ""}">
          <span class="overview-icon">${definition.icon}</span>
          <div>
            <strong>${definition.title}</strong>
            <p>${state.moduleSummaries[definition.key]} registros disponibles</p>
          </div>
        </article>
      `
    )
    .join("");
}
