import api from "./api.js";

export const formationsService = {
  getAll:      ()     => api.get("/formations"),
  getOne:      (id)   => api.get(`/formations/${id}`),
  getBySlug:   (slug) => api.get(`/formations/slug/${slug}`),
};
