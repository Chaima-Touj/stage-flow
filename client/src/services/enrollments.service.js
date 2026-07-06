import api from "./api.js";

export const enrollmentsService = {
  getAll:           ()                          => api.get("/enrollments"),
  getOne:           (formationId)               => api.get(`/enrollments/${formationId}`),
  enroll:           (formationId)               => api.post("/enrollments", { formationId }),
  updateWeekStatus: (formationId, weekNum, status) =>
    api.patch(`/enrollments/${formationId}/weeks/${weekNum}`, { status }),
};
