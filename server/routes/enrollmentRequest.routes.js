import express from "express";
import { protect, authorize, validateObjectId } from "../middleware/auth.middleware.js";
import {
  createRequest,
  getMyRequests,
  acceptRequest,
  rejectRequest,
} from "../controllers/enrollmentRequest.controller.js";

const router = express.Router();

// ─── Traitement des demandes — réservé à l'admin ────────────────────────────
router.patch("/:id/accept", protect, authorize("admin"), validateObjectId("id"), acceptRequest);
router.patch("/:id/reject", protect, authorize("admin"), validateObjectId("id"), rejectRequest);

// ─── Routes étudiant ─────────────────────────────────────────────────────────
router.use(protect);
router.use(authorize("étudiant"));

router.get("/",  getMyRequests);
router.post("/", createRequest);

export default router;
