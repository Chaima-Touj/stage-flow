import express from "express";
import { sendMessage, getThread, getThreads, markAsRead } from "../controllers/messages.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/threads", protect, getThreads);
router.get("/thread/:userId", protect, getThread);
router.patch("/:id/read", protect, markAsRead);

export default router;
