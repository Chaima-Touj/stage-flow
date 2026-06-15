import express from "express";
import {
  createOffer,
  getOffers,
  getOffer,
  updateOffer,
  deleteOffer,
  closeOffer,
} from "../controllers/offers.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getOffers);
router.post("/", protect, createOffer);
router.get("/:id", getOffer);
router.put("/:id", protect, updateOffer);
router.delete("/:id", protect, deleteOffer);
router.patch("/:id/close", protect, closeOffer);

export default router;
