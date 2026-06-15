import express from "express";
import { getNotifications, markRead, markAllRead, deleteNotification } from "../controllers/notifications.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markRead);
router.patch("/read-all", protect, markAllRead);
router.delete("/:id", protect, deleteNotification);

export default router;
