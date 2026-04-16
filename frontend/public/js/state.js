import { defaultPageSize } from "./config.js";

export const state = {
  authToken: "",
  activeModule: "users",
  message: "",
  pagination: {
    users: { page: 1, pageSize: defaultPageSize },
    clients: { page: 1, pageSize: defaultPageSize },
    suppliers: { page: 1, pageSize: defaultPageSize }
  }
};
