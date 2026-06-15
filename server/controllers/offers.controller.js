import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/offers - créer une nouvelle offre (entreprise/admin)
export const createOffer = asyncHandler(async (req, res) => {
  const companyId = req.user._id;
  const companyName = req.user.name || req.user.companyName || "";

  const {
    title,
    description,
    domain,
    specialty,
    skills,
    location,
    duration,
    type,
    deadline,
    numberOfPlaces,
    status,
  } = req.body;

  const skillsArray = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
    ? skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const offer = await Offer.create({
    title,
    description,
    domain,
    specialty,
    skills: skillsArray,
    location,
    duration,
    type,
    deadline: deadline ? new Date(deadline) : null,
    numberOfPlaces: numberOfPlaces || 1,
    status: status || "active",
    companyId,
    companyName,
  });

  res.status(201).json({ offer });
});

// GET /api/offers - lister les offres (filtres, recherche, pagination)
export const getOffers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const { search, domain, type, status, companyId, skills } = req.query;

  const filter = {};
  if (domain) filter.domain = domain;
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (companyId) filter.companyId = companyId;
  if (skills) {
    const s = skills.split(",").map((x) => x.trim()).filter(Boolean);
    if (s.length) filter.skills = { $all: s };
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const total = await Offer.countDocuments(filter);

  let query = Offer.find(filter).populate("companyId", "name email");
  if (search) {
    query = Offer.find(filter, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).populate("companyId", "name email");
  } else {
    query = Offer.find(filter).sort({ createdAt: -1 }).populate("companyId", "name email");
  }

  const offers = await query.skip(skip).limit(limit);
  const pages = Math.ceil(total / limit) || 1;

  res.json({ total, page, pages, limit, offers });
});

// GET /api/offers/:id - récupérer une offre
export const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate("companyId", "name email");
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }
  res.json({ offer });
});

// PUT /api/offers/:id - modifier une offre (seulement propriétaire ou admin)
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Autorisation: admin ou entreprise propriétaire
  if (req.user.role !== "admin" && offer.companyId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  const updatable = [
    "title",
    "description",
    "domain",
    "specialty",
    "skills",
    "location",
    "duration",
    "type",
    "deadline",
    "numberOfPlaces",
    "status",
  ];

  updatable.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      if (field === "skills") {
        offer.skills = Array.isArray(req.body.skills)
          ? req.body.skills
          : String(req.body.skills).split(",").map((s) => s.trim()).filter(Boolean);
      } else if (field === "deadline") {
        offer.deadline = req.body.deadline ? new Date(req.body.deadline) : null;
      } else {
        offer[field] = req.body[field];
      }
    }
  });

  await offer.save();
  res.json({ offer });
});

// DELETE /api/offers/:id - supprimer une offre (propriétaire ou admin)
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (req.user.role !== "admin" && offer.companyId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  await offer.deleteOne();
  res.json({ message: "Offre supprimée" });
});

// PATCH /api/offers/:id/close - fermer une offre
export const closeOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }

  if (req.user.role !== "admin" && offer.companyId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  await offer.markClosed();
  res.json({ offer });
});
