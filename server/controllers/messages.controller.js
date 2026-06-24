import Message from "../models/messages.model.js";
import User from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import emailService from "../services/email.service.js";

// POST /api/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    const err = new Error("receiverId et content requis");
    err.statusCode = 400;
    throw err;
  }

  const receiver = await User.findById(receiverId).select("email name").lean();
  if (!receiver) {
    const err = new Error("Destinataire introuvable");
    err.statusCode = 404;
    throw err;
  }

  const message = await Message.create({
    senderId:   req.user._id,
    receiverId,
    content,
  });

  // Email au destinataire — nouveau message reçu
  emailService.sendNewMessage(receiver.email, {
    recipientName: receiver.name,
    senderName:    req.user.name,
    preview:       content,
  });

  res.status(201).json({ message });
});

// GET /api/messages/:userId
export const getConversation = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId,   receiverId: userId },
      { senderId: userId, receiverId: myId   },
    ],
  })
    .populate("senderId",   "name role")
    .populate("receiverId", "name role")
    .sort({ createdAt: 1 })
    .lean();

  await Message.updateMany(
    { senderId: userId, receiverId: myId, isRead: false },
    { isRead: true }
  );

  res.json({ count: messages.length, messages });
});

// GET /api/messages
export const getConversations = asyncHandler(async (req, res) => {
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [{ senderId: myId }, { receiverId: myId }],
  })
    .populate("senderId",   "name role")
    .populate("receiverId", "name role")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ messages });
});