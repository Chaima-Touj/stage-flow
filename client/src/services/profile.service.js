import api from "./api";

export const profileService = {
  // Récupérer le profil de l'utilisateur connecté
  getMyProfile: () => api.get("/profile/me"),

  // Mettre à jour le profil complet
  updateProfile: (data) => api.put("/profile/me", data),

  // Upload du CV (multipart/form-data)
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append("cv", file);
    return api.post("/profile/me/cv", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Ajouter une expérience
  addExperience: (data) => api.post("/profile/me/experience", data),

  // Supprimer une expérience
  deleteExperience: (id) => api.delete(`/profile/me/experience/${id}`),

  // Ajouter une compétence
  addSkill: (data) => api.post("/profile/me/skills", data),

  // Supprimer une compétence
  deleteSkill: (id) => api.delete(`/profile/me/skills/${id}`),
};