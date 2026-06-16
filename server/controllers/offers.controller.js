import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/offers
export const getOffers = asyncHandler(async (req, res) => {
  const { domain, type, search } = req.query;
  const filter = { isActive: true };

  if (domain) filter.domain = domain;
  if (type)   filter.type   = type;
  if (search) filter.$or = [
    { title:       { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
    { companyName: { $regex: search, $options: "i" } },
  ];

  const offers = await Offer.find(filter).sort({ createdAt: -1 });
  res.json({ count: offers.length, offers });
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

// POST /api/offers
export const createOffer = asyncHandler(async (req, res) => {
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

// PUT /api/offers/:id
export const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }

  const updated = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ offer: updated });
});

// DELETE /api/offers/:id
export const deleteOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }

  await offer.deleteOne();
  res.json({ message: "Offre supprimée" });
});
