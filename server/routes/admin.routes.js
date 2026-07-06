import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const router = express.Router();

// ─── Toutes les routes de ce fichier sont réservées à l'admin ──────────────
router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard-stats", getDashboardStats);

export default router;
