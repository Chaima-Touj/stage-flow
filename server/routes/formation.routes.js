import express from "express";
import {
  getAllFormations,
  getFormationBySlug,
  getFormationById,
} from "../controllers/formation.controller.js";

const router = express.Router();

router.get("/",            getAllFormations);
router.get("/slug/:slug",  getFormationBySlug);
router.get("/:id",         getFormationById);

export default router;
