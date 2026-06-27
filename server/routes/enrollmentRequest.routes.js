import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { createRequest, getMyRequests } from "../controllers/enrollmentRequest.controller.js";

const router = express.Router();

router.use(protect);
router.use(authorize("étudiant"));

router.get("/",  getMyRequests);
router.post("/", createRequest);

export default router;
