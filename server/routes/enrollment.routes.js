import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getMyEnrollments,
  getMyEnrollment,
  enroll,
  updateWeekStatus,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// Toutes les routes nécessitent un token étudiant valide
router.use(protect);
router.use(authorize("étudiant"));

router.get("/",                                   getMyEnrollments);
router.get("/:formationId",                       getMyEnrollment);
router.post("/",                                  enroll);
router.patch("/:formationId/weeks/:weekNum",      updateWeekStatus);

export default router;
