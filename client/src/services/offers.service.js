import api from "./api.js";

export const offersService = {
  getAll:   (params) => api.get("/offers", { params }),
  getOne:   (id)     => api.get(`/offers/${id}`),
  create:   (data)   => api.post("/offers", data),
  update:   (id, data) => api.put(`/offers/${id}`, data),
  delete:   (id)     => api.delete(`/offers/${id}`),
};
