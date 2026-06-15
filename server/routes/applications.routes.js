import express from "express";
import {
  createApplication,
  getApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applications.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createApplication);
router.get("/", protect, getApplications);
router.get("/:id", protect, getApplication);
router.patch("/:id/status", protect, updateApplicationStatus);
router.delete("/:id", protect, deleteApplication);

export default router;
