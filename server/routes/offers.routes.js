import express from "express";
import { getOffers, getOffer, createOffer, updateOffer, deleteOffer } from "../controllers/offers.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/",      getOffers);
router.get("/:id",   getOffer);
router.post("/",     protect, createOffer);
router.put("/:id",   protect, updateOffer);
router.delete("/:id",protect, deleteOffer);

export default router;
