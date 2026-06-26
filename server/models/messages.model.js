import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Référence à la Conversation parente (null sur les anciens messages, rétro-compatible)
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
    senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:        { type: String, required: true, maxlength: 1000 },
    isRead:         { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Requête principale : messages d'une conversation, triés chronologiquement
messageSchema.index({ conversationId: 1, createdAt: 1 });
// Backward-compat : getConversation par paire de users
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
