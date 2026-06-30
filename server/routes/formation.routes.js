import express from "express";
import {
  getAllFormations,
  getFormationBySlug,
  getFormationById,
  patchFormationSupervision,
} from "../controllers/formation.controller.js";

const router = express.Router();

router.get("/",                           getAllFormations);
router.get("/slug/:slug",                 getFormationBySlug);
router.patch("/slug/:slug/supervision",   patchFormationSupervision);
router.get("/:id",                        getFormationById);

export default router;
