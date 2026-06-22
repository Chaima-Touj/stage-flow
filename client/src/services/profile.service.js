import api from "./api";

export const profileService = {
  getMyProfile: () => api.get("/auth/me"),

  updateProfile: (data) => api.put("/auth/profile", data),
};