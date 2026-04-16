import { moduleDefinitions } from "./config.js";
import { fieldInputType, labelize } from "./helpers.js";
import { state } from "./state.js";

const messageNode = document.querySelector("#message");
const dashboardNode = document.querySelector("#dashboard");
const layoutNode = document.querySelector(".layout");
const modulesContainer = document.querySelector("#modulesContainer");
const menuNode = document.querySelector("#dashboardMenu");

export function setMessage(message) {
  state.message = message;
  messageNode.textContent = message;
}

export function showDashboard() {
  layoutNode.classList.add("hidden");
  dashboardNode.classList.remove("hidden");
}

export function showAuthLayout() {
  layoutNode.classList.remove("hidden");
  dashboardNode.classList.add("hidden");
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
          ${definition.title}
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
            <h3>${definition.title}</h3>
            <p>${definition.description}</p>
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

export function renderModuleList(moduleKey, response, onEdit, onDelete, onPageChange) {
  const definition = moduleDefinitions[moduleKey];
  const list = document.querySelector(`#${moduleKey}List`);
  const pagination = document.querySelector(`#${moduleKey}Pagination`);

  list.innerHTML = "";
  pagination.innerHTML = "";

  if (!response.items.length) {
    list.innerHTML = `<article class="empty-state">No hay registros para mostrar.</article>`;
  }

  for (const item of response.items) {
    const article = document.createElement("article");
    article.className = "list-item";
    article.innerHTML = `
      <h4>${item.name}</h4>
      <p>${definition.fields
        .filter((field) => field.name !== "name" && field.name !== "password")
        .map((field) => `${field.label || labelize(field.name)}: ${item[field.name] || "-"}`)
        .join("<br/>")}</p>
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
        ${field.required ? "required" : ""}
      />
    </label>
  `;
}
