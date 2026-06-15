import express from "express";
import { register, login, getMe } from "../controllers/auth.controllers.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Routes publiques ─────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login",    login);

// ─── Routes protégées ─────────────────────────────────────────────────────────
router.get("/me", protect, getMe);

export default router;