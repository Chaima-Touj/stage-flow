import api from "./api.js";

export const adminService = {
  getDashboardStats: () => api.get("/admin/dashboard-stats"),
};
