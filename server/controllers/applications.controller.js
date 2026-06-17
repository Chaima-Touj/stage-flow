import Application from "../models/applications.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/applications
export const createApplication = asyncHandler(async (req, res) => {
  const { offerId, coverLetter } = req.body;

  if (!offerId) {
    const err = new Error("offerId requis");
    err.statusCode = 400;
    throw err;
  }

  const existing = await Application.findOne({ offerId, studentId: req.user._id });
  if (existing) {
    const err = new Error("Tu as déjà postulé à cette offre");
    err.statusCode = 409;
    throw err;
  }

  // req.file est rempli par le middleware uploadCV s'il y a un fichier valide
  const cvUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const application = await Application.create({
    offerId,
    studentId: req.user._id,
    coverLetter,
    cvUrl,
  });

  res.status(201).json({ application });
});

// GET /api/applications
export const getApplications = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.user.role === "étudiant")   filter.studentId = req.user._id;
  if (req.user.role === "entreprise") {
    const { default: Offer } = await import("../models/offers.model.js");
    const offers = await Offer.find({ companyId: req.user._id }).select("_id");
    filter.offerId = { $in: offers.map((o) => o._id) };
  }

  const applications = await Application.find(filter)
    .populate("offerId", "title companyName location type")
    .populate("studentId", "name email university specialty")
    .sort({ createdAt: -1 });

  res.json({ count: applications.length, applications });
});

// GET /api/applications/:id
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("offerId")
    .populate("studentId", "name email university specialty phone");

  if (!application) {
    const err = new Error("Candidature non trouvée");
    err.statusCode = 404;
    throw err;
  }

  res.json({ application });
});

// PUT /api/applications/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["en attente", "acceptée", "refusée", "en cours"];

  if (!validStatuses.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!application) {
    const err = new Error("Candidature non trouvée");
    err.statusCode = 404;
    throw err;
  }

  res.json({ application });
});
