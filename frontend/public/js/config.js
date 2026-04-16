export const apiBaseUrl = "http://localhost:4000/api";

export const moduleDefinitions = {
  users: {
    key: "users",
    endpoint: "users",
    title: "Usuarios",
    singularTitle: "Usuario",
    description: "Administra cuentas internas y perfiles de acceso.",
    note: "La contrasena es obligatoria al crear. En edicion solo se envia si deseas cambiarla.",
    fields: [
      { name: "name", required: true, label: "Nombre" },
      { name: "email", required: true, label: "Correo" },
      { name: "role", required: true, label: "Rol", tag: "select", options: ["user", "admin"] },
      {
        name: "password",
        required: false,
        label: "Contrasena",
        placeholder: "Contrasena nueva o inicial"
      }
    ]
  },
  clients: {
    key: "clients",
    endpoint: "clients",
    title: "Clientes",
    singularTitle: "Cliente",
    description: "Consulta y mantiene la cartera comercial de clientes.",
    fields: [
      { name: "name", required: true, label: "Nombre" },
      { name: "email", required: true, label: "Correo" },
      { name: "phone", required: true, label: "Telefono" }
    ]
  },
  suppliers: {
    key: "suppliers",
    endpoint: "suppliers",
    title: "Proveedores",
    singularTitle: "Proveedor",
    description: "Gestiona proveedores y datos de contacto operativo.",
    fields: [
      { name: "name", required: true, label: "Nombre" },
      { name: "contact", required: true, label: "Contacto" },
      { name: "phone", required: true, label: "Telefono" }
    ]
  }
};

export const defaultPageSize = 5;
