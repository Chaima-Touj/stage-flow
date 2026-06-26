import Conversation from "../models/conversation.model.js";
import Message      from "../models/messages.model.js";
import User         from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/conversations
export const getConversations = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const conversations = await Conversation.find({ participants: myId })
    .populate("participants", "name role")
    .populate({
      path:     "lastMessage",
      populate: { path: "senderId", select: "name" },
    })
    .sort({ lastMessageAt: -1 })
    .lean();

  const result = conversations.map((conv) => {
    const otherUser   = conv.participants.find((p) => String(p._id) !== String(myId));
    const unreadCount = conv.unreadCounts?.[String(myId)] || 0;
    return { ...conv, otherUser, unreadCount };
  });

  res.json({ conversations: result });
});

// GET /api/conversations/:conversationId/messages?page=1&limit=50
export const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const myId  = req.user._id;
  const page  = Math.max(1, parseInt(req.query.page  || "1",  10));
  const limit = Math.min(100, parseInt(req.query.limit || "50", 10));
  const skip  = (page - 1) * limit;

  // Vérifier que l'utilisateur est bien participant
  const conv = await Conversation.findOne({
    _id: conversationId,
    participants: myId,
  }).lean();

  if (!conv) {
    const err = new Error("Conversation introuvable");
    err.statusCode = 404;
    throw err;
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate("senderId",   "name role")
      .populate("receiverId", "name role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ conversationId }),
  ]);

  // Marquer les messages reçus comme lus + réinitialiser le compteur
  await Promise.all([
    Message.updateMany(
      { conversationId, receiverId: myId, isRead: false },
      { isRead: true }
    ),
    Conversation.updateOne(
      { _id: conversationId },
      { $set: { [`unreadCounts.${myId}`]: 0 } }
    ),
  ]);

  res.json({
    messages,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// GET /api/conversations/students — liste des étudiants actifs (hors soi-même)
export const getStudents = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const students = await User.find({
    _id:      { $ne: myId },
    role:     "étudiant",
    isActive: true,
  })
    .select("_id name role university specialty bio skills")
    .sort({ name: 1 })
    .lean();

  res.json({ students });
});
