import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/offers
export const getOffers = asyncHandler(async (req, res) => {
  const { domain, type, location, search, page = 1, limit = 9, sort = "-createdAt" } = req.query;
  const filter = { isActive: true };

  if (domain)   filter.domain = domain;
  if (type)     filter.type   = type;
  if (location) filter.location = { $regex: location, $options: "i" };
  if (search) filter.$or = [
    { title:       { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { companyName: { $regex: search, $options: "i" } },
    { skills:       { $regex: search, $options: "i" } },
  ];

  const pageNum  = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip     = (pageNum - 1) * limitNum;

  const [offers, total] = await Promise.all([
    Offer.find(filter).sort(sort).skip(skip).limit(limitNum),
    Offer.countDocuments(filter),
  ]);

  res.json({
    offers,
    pagination: {
      total, page: pageNum, limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: skip + offers.length < total,
      hasPrev: pageNum > 1,
    },
  });
});

// GET /api/offers/:id
export const getOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }
  offer.views += 1;
  await offer.save();
  res.json({ offer });
});

// POST /api/offers — réservé aux entreprises
export const createOffer = asyncHandler(async (req, res) => {
  if (req.user.role !== "entreprise") {
    const err = new Error("Seules les entreprises peuvent publier des offres");
    err.statusCode = 403;
    throw err;
  }

  const { title, description, companyName, domain, location, duration, type, skills, salary, deadline } = req.body;

  if (!title || !description || !companyName) {
    const err = new Error("Titre, description et nom d'entreprise requis");
    err.statusCode = 400;
    throw err;
  }

  const offer = await Offer.create({
    title, description, companyName,
    companyId: req.user._id,
    domain, location, duration, type, skills, salary, deadline,
  });

  res.status(201).json({ offer });
});

// PUT /api/offers/:id — réservé au propriétaire (entreprise)
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }

  if (offer.companyId?.toString() !== req.user._id.toString()) {
    const err = new Error("Vous n'êtes pas autorisé à modifier cette offre");
    err.statusCode = 403;
    throw err;
  }

  const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ offer: updated });
});

// DELETE /api/offers/:id — réservé au propriétaire (entreprise)
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }

  if (offer.companyId?.toString() !== req.user._id.toString()) {
    const err = new Error("Vous n'êtes pas autorisé à supprimer cette offre");
    err.statusCode = 403;
    throw err;
  }

  await offer.deleteOne();
  res.json({ message: "Offre supprimée" });
});

// GET /api/offers/meta/domains
export const getDomains = asyncHandler(async (req, res) => {
  const domains = await Offer.distinct("domain", { isActive: true, domain: { $ne: "" } });
  res.json({ domains });
});
