import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:    { type: String, required: true },
    isRead:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index pour getConversation — filtre sur les deux participants
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: 1 });
// Index pour getConversations — toutes les conversations d'un utilisateur
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
