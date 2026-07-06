import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getAllFormations,
  getFormationBySlug,
  getFormationById,
  patchFormationWeeks,
  patchFormationSupervision,
} from "../controllers/formation.controller.js";

const router = express.Router();

// ─── Lecture — publique ─────────────────────────────────────────────────────
router.get("/",                           getAllFormations);
router.get("/slug/:slug",                 getFormationBySlug);

// ─── Écriture — réservée à l'admin ──────────────────────────────────────────
router.patch("/slug/:slug/weeks",         protect, authorize("admin"), patchFormationWeeks);
router.patch("/slug/:slug/supervision",   protect, authorize("admin"), patchFormationSupervision);

router.get("/:id",                        getFormationById);

export default router;
