import api from "./api.js";

export const notificationsService = {
  getAll:       ()      => api.get("/notifications"),
  markAsRead:   (id)    => api.put(`/notifications/${id}/read`),
  markAllRead:  ()      => api.put("/notifications/read-all"),
  delete:       (id)    => api.delete(`/notifications/${id}`),
};
