import api from "./api.js";

export const formationsService = {
  getAll:      ()     => api.get("/formations"),
  getOne:      (id)   => api.get(`/formations/${id}`),
  getBySlug:   (slug) => api.get(`/formations/slug/${slug}`),

  createFormation: (data)     => api.post("/formations", data),
  updateFormation: (id, data) => api.patch(`/formations/${id}`, data),
  deleteFormation: (id)       => api.delete(`/formations/${id}`),
};
