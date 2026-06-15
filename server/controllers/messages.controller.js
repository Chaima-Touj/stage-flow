import Message from "../models/messages.model.js";
import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// POST /api/messages - send a message
export const sendMessage = asyncHandler(async (req, res) => {
  const from = req.user._id;
  const { to, offerId, applicationId, subject, body, attachments } = req.body;
  if (!to || !body) {
    const err = new Error("Destinataire et corps du message requis");
    err.statusCode = 400;
    throw err;
  }

  const msg = await Message.create({ from, to, offerId: offerId || null, applicationId: applicationId || null, subject: subject || "", body, attachments: Array.isArray(attachments) ? attachments : [] });

  // Create a notification for recipient
  try {
    await Notification.create({
      userId: to,
      actorId: from,
      type: "message:new",
      data: { messageId: msg._id, offerId: offerId || null, applicationId: applicationId || null },
      link: `/messages/thread/${msg.conversationId}`,
    });
  } catch (e) {
    // non-fatal
    console.warn("Notification creation failed:", e.message);
  }

  res.status(201).json({ message: msg });
});

// GET /api/messages/thread/:userId - get conversation with a partner
export const getThread = asyncHandler(async (req, res) => {
  const userA = req.user._id;
  const userB = req.params.userId;
  if (!mongoose.Types.ObjectId.isValid(userB)) {
    const err = new Error("userId invalide");
    err.statusCode = 400;
    throw err;
  }
  const messages = await Message.find({ $or: [{ from: userA, to: userB }, { from: userB, to: userA }] })
    .sort({ createdAt: 1 })
    .populate("from", "name email")
    .populate("to", "name email");

  res.json({ messages });
});

// GET /api/messages/threads - list conversation partners with last message
export const getThreads = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const msgs = await Message.find({ $or: [{ from: userId }, { to: userId }] })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("from", "name email")
    .populate("to", "name email");

  const map = new Map();
  for (const m of msgs) {
    const partner = m.from._id.toString() === userId ? m.to : m.from;
    if (!map.has(partner._id.toString())) {
      map.set(partner._id.toString(), { partner, lastMessage: m });
    }
  }

  const threads = Array.from(map.values());
  res.json({ threads });
});

// PATCH /api/messages/:id/read - mark message as read (recipient only)
export const markAsRead = asyncHandler(async (req, res) => {
  const msg = await Message.findById(req.params.id);
  if (!msg) {
    const err = new Error("Message introuvable");
    err.statusCode = 404;
    throw err;
  }
  if (msg.to.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }
  msg.read = true;
  await msg.save();
  res.json({ message: msg });
});
