import express from "express";
import { getConversations, getConversationMessages, getStudents } from "../controllers/conversations.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/",                          protect, getConversations);
router.get("/students",                  protect, getStudents);
router.get("/:conversationId/messages", protect, getConversationMessages);

export default router;
