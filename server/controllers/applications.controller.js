import Application from "../models/applications.model.js";
import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/applications — réservé aux étudiants
export const createApplication = asyncHandler(async (req, res) => {
  if (req.user.role !== "étudiant") {
    const err = new Error("Seuls les étudiants peuvent postuler à une offre");
    err.statusCode = 403;
    throw err;
  }

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
    const offers = await Offer.find({ companyId: req.user._id }).select("_id");
    filter.offerId = { $in: offers.map((o) => o._id) };
  }

  const applications = await Application.find(filter)
    .populate("offerId", "title companyName location type companyId")
    .populate("studentId", "name email university specialty")
    .sort({ createdAt: -1 });

  res.json({ count: applications.length, applications });
});

// GET /api/applications/:id — désormais vérifié : seul l'étudiant candidat
// ou l'entreprise propriétaire de l'offre peut consulter cette candidature
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("offerId")
    .populate("studentId", "name email university specialty phone");

  if (!application) {
    const err = new Error("Candidature non trouvée");
    err.statusCode = 404;
    throw err;
  }

  const isOwnerStudent  = application.studentId._id.toString() === req.user._id.toString();
  const isOwnerCompany  = application.offerId.companyId?.toString() === req.user._id.toString();

  if (!isOwnerStudent && !isOwnerCompany) {
    const err = new Error("Vous n'êtes pas autorisé à consulter cette candidature");
    err.statusCode = 403;
    throw err;
  }

  res.json({ application });
});

// PUT /api/applications/:id/status — réservé à l'entreprise propriétaire de l'offre
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["en attente", "acceptée", "refusée", "en cours"];

  if (!validStatuses.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.findById(req.params.id).populate("offerId");
  if (!application) {
    const err = new Error("Candidature non trouvée");
    err.statusCode = 404;
    throw err;
  }

  if (application.offerId.companyId?.toString() !== req.user._id.toString()) {
    const err = new Error("Vous n'êtes pas autorisé à modifier cette candidature");
    err.statusCode = 403;
    throw err;
  }

  application.status = status;
  await application.save();

  res.json({ application });
});
