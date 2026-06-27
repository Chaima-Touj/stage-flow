import api from "./api.js";

export const enrollmentRequestsService = {
  create:   (formationId, mode, message) =>
    api.post("/enrollment-requests", { formationId, mode, message }),
  getAll:   () => api.get("/enrollment-requests"),
};
