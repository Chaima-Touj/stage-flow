import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadNewsImage } from "../middleware/upload.middleware.js";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/news.controller.js";

const router = express.Router();

// ─── Lecture — publique (Blog + Landing) ────────────────────────────────────
router.get("/", getAllNews);
router.get("/:id", getNewsById);

// ─── Écriture — réservée à l'admin ──────────────────────────────────────────
router.post("/",   protect, authorize("admin"), uploadNewsImage, createNews);
router.put("/:id", protect, authorize("admin"), uploadNewsImage, updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
