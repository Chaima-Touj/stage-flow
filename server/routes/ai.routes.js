import express from "express";
import { chat, recommendations, analyzeCv, generateMotivation } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/chat",                protect, chat);
router.post("/recommendations",     protect, recommendations);
router.post("/analyze-cv",          protect, analyzeCv);
router.post("/generate-motivation", protect, generateMotivation);

export default router;
