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

export const patchFormationSupervision = asyncHandler(async (req, res) => {
  const { supervision } = req.body;
  if (!Array.isArray(supervision)) {
    return res.status(400).json({ message: "supervision doit être un tableau." });
  }
  const formation = await Formation.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: { supervision } },
    { new: true }
  ).select("-__v");
  if (!formation) return res.status(404).json({ message: "Formation introuvable." });
  res.json({ message: "supervision mis à jour.", slug: formation.slug, count: formation.supervision.length });
});
