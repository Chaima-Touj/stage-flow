import api from "./api.js";

export const aiService = {
  chat:               (messages, temperature) => api.post("/ai/chat", { messages, temperature }),
  recommendations:    (studentId)             => api.post("/ai/recommendations", { studentId }),
  analyzeCV:          (text)                  => api.post("/ai/analyze-cv", { text }),
  generateMotivation: (offerId, tone)         => api.post("/ai/generate-motivation", { offerId, tone }),
};
