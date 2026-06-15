import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/notifications - list notifications for current user
export const getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = { userId: req.user._id };
  if (req.query.unread === "true") filter.read = false;

  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const pages = Math.max(1, Math.ceil(total / limit));
  res.json({ total, page, pages, limit, notifications });
});

// PATCH /api/notifications/:id/read - mark single notification read
export const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) {
    const err = new Error("Notification introuvable");
    err.statusCode = 404;
    throw err;
  }
  if (notif.userId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }
  notif.read = true;
  await notif.save();
  res.json({ notification: notif });
});

// PATCH /api/notifications/read-all - mark all as read
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ message: "All notifications marked read" });
});

// DELETE /api/notifications/:id
export const deleteNotification = asyncHandler(async (req, res) => {
  const notif = await Notification.findById(req.params.id);
  if (!notif) {
    const err = new Error("Notification introuvable");
    err.statusCode = 404;
    throw err;
  }
  if (notif.userId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }
  await notif.deleteOne();
  res.json({ message: "Notification supprimée" });
});
