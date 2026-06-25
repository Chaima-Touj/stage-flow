import Formation from "../models/formation.model.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllFormations = asyncHandler(async (req, res) => {
  const formations = await Formation.find().select("-__v");
  res.json(formations);
});

export const getFormationBySlug = asyncHandler(async (req, res) => {
  const formation = await Formation.findOne({ slug: req.params.slug }).select("-__v");
  if (!formation) return res.status(404).json({ message: "Formation introuvable." });
  res.json(formation);
});

export const getFormationById = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id).select("-__v");
  if (!formation) return res.status(404).json({ message: "Formation introuvable." });
  res.json(formation);
});
