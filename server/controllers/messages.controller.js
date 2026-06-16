import Message from "../models/messages.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/messages
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    const err = new Error("receiverId et content requis");
    err.statusCode = 400;
    throw err;
  }

  const message = await Message.create({
    senderId: req.user._id,
    receiverId,
    content,
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
    .sort({ createdAt: 1 });

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
    .sort({ createdAt: -1 });

  res.json({ messages });
});
