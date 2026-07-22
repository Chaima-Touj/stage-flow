import express from "express";
import {
  getOffers, getOffer, createOffer, updateOffer, deleteOffer, getDomains
} from "../controllers/offers.controller.js";
import { protect, authorize, validateObjectId } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/meta/domains", getDomains);
router.get("/",             getOffers);
router.get("/:id",          validateObjectId("id"), getOffer);
router.post("/",            protect, authorize("admin"), createOffer);
router.put("/:id",          protect, validateObjectId("id"), authorize("admin"), updateOffer);
router.delete("/:id",       protect, validateObjectId("id"), authorize("admin"), deleteOffer);

export default router;
