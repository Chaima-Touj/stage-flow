import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const normalizeType = (value) => {
  if (!value) return "stage";
  const t = String(value).trim();

  if (t.toLowerCase() === "stage pfe") return "PFE";
  if (t.toLowerCase() === "stage") return "stage";
  if (t.toLowerCase() === "pfe") return "PFE";
  if (t.toLowerCase() === "alternance") return "alternance";

  // Legacy/Free text: keep as-is so we remain backwards compatible
  // (frontend will display it and filters may still work if it matches).
  return t;
};

const normalizePayload = (body) => {
  let {
    title,
    description,
    companyName,
    domain,
    location,
    duration,
    type,
    skills,
    salary,
    deadline,

    // legacy accepted
    company,
    specialite,
    skillsRequired,
    motsCles,
    desc,
  } = body || {};

  // legacy → new
  if (!description && desc) description = desc;
  if (!companyName && company) companyName = company;
  if (!domain && specialite) domain = specialite;

  const normalizedSkills =
    (Array.isArray(skills) && skills.length ? skills : undefined) ||
    (Array.isArray(skillsRequired) && skillsRequired.length ? skillsRequired : undefined) ||
    (Array.isArray(motsCles) && motsCles.length ? motsCles : []) ||
    [];

  return {
    title,
    description,
    companyName,
    domain,
    location,
    duration,
    type: normalizeType(type),
    skills: normalizedSkills,
    salary,
    deadline,
  };
};

// GET /api/offers
export const getOffers = asyncHandler(async (req, res) => {
  let { domain, type, location, search, page = 1, limit = 9, sort = "-createdAt" } = req.query;

  const filter = {
    $or: [{ isActive: true }, { isActive: { $exists: false } }],
  };

  if (domain) filter.domain = domain;

  // CORRECTION ICI : Normaliser le type reçu dans la requête de recherche
  if (type) {
    // Si le front envoie "Stage PFE", cela devient "PFE" pour correspondre à la BD
    const normalizedType = normalizeType(type); 
    filter.type = normalizedType;
  }

  if (location) filter.location = { $regex: location, $options: "i" };

  // ... reste du code (search, pagination, etc.) ...
  
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [offers, total] = await Promise.all([
    Offer.find(filter).sort(sort).skip(skip).limit(limitNum),
    Offer.countDocuments(filter),
  ]);

  res.json({
    offers,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
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

  // IMPORTANT: incrément sans validation complète (compatibilité documents legacy)
  await Offer.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { runValidators: false }
  );

  res.json({ offer });
});

// POST /api/offers — réservé aux entreprises
export const createOffer = asyncHandler(async (req, res) => {
  if (req.user.role !== "entreprise") {
    const err = new Error("Seules les entreprises peuvent publier des offres");
    err.statusCode = 403;
    throw err;
  }

  const payload = normalizePayload(req.body);

  if (!payload.title || !payload.description || !payload.companyName) {
    const err = new Error("Titre, description et nom d'entreprise requis");
    err.statusCode = 400;
    throw err;
  }

  const offer = await Offer.create({
    ...payload,
    companyId: req.user._id,
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

  const payload = normalizePayload(req.body);

  // Keep validators for real updates, but schema is now tolerant.
  const updated = await Offer.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

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

