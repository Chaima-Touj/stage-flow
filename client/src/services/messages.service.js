import api from "./api.js";

export const messagesService = {
  // ── Conversation-based API ───────────────────────────────────────────────
  getConversations:        ()                  => api.get("/conversations"),
  getConversationMessages: (convId, page = 1)  => api.get(`/conversations/${convId}/messages?page=${page}&limit=50`),
  getStudents:             ()                  => api.get("/conversations/students"),

  // ── Message-based API (rétro-compatibilité) ──────────────────────────────
  getAll:          ()         => api.get("/messages"),
  getConversation: (userId)   => api.get(`/messages/${userId}`),

  // ── Envoi ────────────────────────────────────────────────────────────────
  send: (data) => api.post("/messages", data),
  // data = { receiverId, content, conversationId? }
};
