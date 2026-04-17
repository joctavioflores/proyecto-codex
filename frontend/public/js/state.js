import { defaultPageSize } from "./config.js";

export const state = {
  authToken: "",
  currentUser: null,
  activeModule: "users",
  message: { text: "", type: "info" },
  moduleSummaries: {
    users: 0,
    clients: 0,
    suppliers: 0
  },
  pagination: {
    users: { page: 1, pageSize: defaultPageSize },
    clients: { page: 1, pageSize: defaultPageSize },
    suppliers: { page: 1, pageSize: defaultPageSize }
  }
};
