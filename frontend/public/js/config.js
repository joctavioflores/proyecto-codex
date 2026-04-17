export const apiBaseUrl = "http://localhost:4000/api";

export const moduleDefinitions = {
  users: {
    key: "users",
    endpoint: "users",
    title: "Usuarios",
    singularTitle: "Usuario",
    icon: "US",
    description: "Administra cuentas internas y perfiles de acceso.",
    note: "La contrasena es obligatoria al crear. En edicion solo se envia si deseas cambiarla.",
    emptyState: "No hay usuarios registrados. Crea el primer acceso operativo desde este modulo.",
    fields: [
      { name: "name", required: true, label: "Nombre", autocomplete: "name" },
      { name: "email", required: true, label: "Correo", autocomplete: "email" },
      { name: "role", required: true, label: "Rol", tag: "select", options: ["user", "admin"] },
      {
        name: "password",
        required: false,
        label: "Contrasena",
        placeholder: "Contrasena nueva o inicial",
        autocomplete: "new-password"
      }
    ]
  },
  clients: {
    key: "clients",
    endpoint: "clients",
    title: "Clientes",
    singularTitle: "Cliente",
    icon: "CL",
    description: "Consulta y mantiene la cartera comercial de clientes.",
    emptyState: "No hay clientes para mostrar. Registra un cliente para iniciar seguimiento.",
    fields: [
      { name: "name", required: true, label: "Nombre", autocomplete: "name" },
      { name: "email", required: true, label: "Correo", autocomplete: "email" },
      { name: "phone", required: true, label: "Telefono", autocomplete: "tel" }
    ]
  },
  suppliers: {
    key: "suppliers",
    endpoint: "suppliers",
    title: "Proveedores",
    singularTitle: "Proveedor",
    icon: "PR",
    description: "Gestiona proveedores y datos de contacto operativo.",
    emptyState: "No hay proveedores registrados. Incorpora uno para continuar con compras u operaciones.",
    fields: [
      { name: "name", required: true, label: "Nombre", autocomplete: "organization" },
      { name: "contact", required: true, label: "Contacto", autocomplete: "name" },
      { name: "phone", required: true, label: "Telefono", autocomplete: "tel" }
    ]
  }
};

export const defaultPageSize = 5;
