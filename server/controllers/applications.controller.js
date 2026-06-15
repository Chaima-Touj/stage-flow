import Application from "../models/applications.model.js";
import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const ALLOWED_STATUSES = [
  "pending",
  "under_review",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
  "withdrawn",
];

// POST /api/applications - étudiant postule à une offre
export const createApplication = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { offerId, coverLetter, resumeUrl } = req.body;

  if (!offerId) {
    const err = new Error("offerId requis");
    err.statusCode = 400;
    throw err;
  }

  const offer = await Offer.findById(offerId);
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Empêcher doublons
  const existing = await Application.findOne({ offerId, studentId });
  if (existing) {
    const err = new Error("Vous avez déjà postulé à cette offre");
    err.statusCode = 409;
    throw err;
  }

  const application = await Application.create({
    offerId,
    studentId,
    studentName: req.user.name || "",
    companyId: offer.companyId,
    companyName: offer.companyName || "",
    coverLetter: coverLetter || "",
    resumeUrl: resumeUrl || "",
    status: "pending",
  });

  res.status(201).json({ application });
});

// GET /api/applications - lister les candidatures selon rôle et filtres
export const getApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const filter = {};

  // RBAC: étudiants voient leurs candidatures, entreprises voient candidatures pour leurs offres
  if (req.user.role === "étudiant") {
    filter.studentId = req.user._id;
  } else if (req.user.role === "entreprise") {
    filter.companyId = req.user._id;
  } else {
    // admin ou autres peuvent filtrer via query
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.companyId) filter.companyId = req.query.companyId;
  }

  if (req.query.offerId) filter.offerId = req.query.offerId;
  if (req.query.status) filter.status = req.query.status;

  const total = await Application.countDocuments(filter);

  const applications = await Application.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("studentId", "name email university specialty")
    .populate("offerId", "title domain companyId");

  const pages = Math.max(1, Math.ceil(total / limit));
  res.json({ total, page, pages, limit, applications });
});

// GET /api/applications/:id - détail candidature (RBAC)
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("studentId", "name email university specialty")
    .populate("offerId", "title domain companyId");

  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  const isStudentOwner = application.studentId && application.studentId._id && application.studentId._id.toString() === req.user._id.toString();
  const isCompanyOwner = application.companyId && application.companyId.toString() === req.user._id.toString();

  if (req.user.role === "admin" || isStudentOwner || isCompanyOwner) {
    return res.json({ application });
  }

  const err = new Error("Accès refusé");
  err.statusCode = 403;
  throw err;
});

// PATCH /api/applications/:id/status - mettre à jour le statut (entreprise/admin ou étudiant pour withdraw)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback, interviewDate } = req.body;

  if (!status) {
    const err = new Error("status requis");
    err.statusCode = 400;
    throw err;
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  const isStudentOwner = application.studentId && application.studentId.toString() === req.user._id.toString();
  const isCompanyOwner = application.companyId && application.companyId.toString() === req.user._id.toString();

  // Étudiant peut seulement se retirer
  if (req.user.role === "étudiant") {
    if (status !== "withdrawn" || !isStudentOwner) {
      const err = new Error("Action non autorisée pour l'étudiant");
      err.statusCode = 403;
      throw err;
    }
    application.status = "withdrawn";
    await application.save();
    return res.json({ application });
  }

  // Entreprise ou admin peut changer le statut
  if (req.user.role === "entreprise" && !isCompanyOwner && req.user.role !== "admin") {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  // Appliquer le changement
  application.status = status;
  if (typeof feedback !== "undefined") application.notes = feedback;
  if (interviewDate) application.interviewDate = new Date(interviewDate);
  await application.save();

  res.json({ application });
});

// DELETE /api/applications/:id - suppression / retrait (étudiant ou admin)
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  const isStudentOwner = application.studentId && application.studentId.toString() === req.user._id.toString();

  if (req.user.role !== "admin" && !isStudentOwner) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  await application.deleteOne();
  res.json({ message: "Candidature supprimée" });
});
import Application from "../models/applications.model.js";
import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const ALLOWED_STATUSES = ["pending", "under_review", "shortlisted", "rejected", "accepted", "withdrawn"];

// POST /api/applications - étudiant postule à une offre
export const createApplication = asyncHandler(async (req, res) => {
  if (!req.user) {
    const err = new Error("Non authentifié");
    err.statusCode = 401;
    throw err;
  }
  if (req.user.role !== "étudiant") {
    const err = new Error("Seuls les étudiants peuvent postuler");
    err.statusCode = 403;
    throw err;
  }

  const { offerId, coverLetter, resumeUrl, attachments } = req.body;
  if (!offerId) {
    const err = new Error("offerId requis");
    err.statusCode = 400;
    throw err;
  }

  const offer = await Offer.findById(offerId);
  if (!offer) {
    const err = new Error("Offre introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Empêcher doublon
  const existing = await Application.findOne({ offerId, studentId: req.user._id });
  if (existing) {
    const err = new Error("Vous avez déjà postulé à cette offre");
    err.statusCode = 409;
    throw err;
  }

  const appDoc = await Application.create({
    offerId,
    studentId: req.user._id,
    studentName: req.user.name || "",
    companyId: offer.companyId,
    companyName: offer.companyName || "",
    coverLetter: coverLetter || "",
    resumeUrl: resumeUrl || "",
    attachments: Array.isArray(attachments) ? attachments : [],
    status: "pending",
  });

  res.status(201).json({ application: appDoc });
});

// GET /api/applications - list des candidatures (student/company/admin)
export const getApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const { status, offerId, studentId } = req.query;
  const filter = {};

  // RBAC: étudiants voient leurs candidatures, entreprises voient candidatures pour leurs offres, admin voit tout
  if (req.user.role === "étudiant") filter.studentId = req.user._id;
  else if (req.user.role === "entreprise") filter.companyId = req.user._id;
  // admin: aucun filtre automatique

  if (status) filter.status = status;
  if (offerId) filter.offerId = offerId;
  if (studentId && req.user.role === "admin") filter.studentId = studentId;

  const total = await Application.countDocuments(filter);
  const applications = await Application.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("studentId", "name email university specialty")
    .populate("offerId", "title companyId");

  const pages = Math.max(1, Math.ceil(total / limit));
  res.json({ total, page, pages, limit, applications });
});

// GET /api/applications/:id - détail candidature
export const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("studentId", "name email university specialty")
    .populate("offerId", "title companyId");
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Autorisation
  const isAdmin = req.user.role === "admin";
  const isStudentOwner = application.studentId && application.studentId._id
    ? application.studentId._id.toString() === req.user._id.toString()
    : application.studentId.toString() === req.user._id.toString();
  const isCompanyOwner = application.companyId && application.companyId.toString() === req.user._id.toString();

  if (!isAdmin && !isStudentOwner && !isCompanyOwner) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  res.json({ application });
});

// PATCH /api/applications/:id/status - mettre à jour le statut (entreprise/admin)
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback } = req.body;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Seulement l'entreprise propriétaire ou admin
  if (req.user.role !== "admin" && req.user.role !== "entreprise") {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }
  if (req.user.role === "entreprise" && application.companyId.toString() !== req.user._id.toString()) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  application.status = status;
  if (typeof feedback === "string") application.feedback = feedback;
  application.viewedByCompany = true;
  await application.save();

  res.json({ application });
});

// DELETE /api/applications/:id - retrait par l'étudiant (mark withdrawn) ou suppression admin
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  // Étudiant propriétaire peut retirer (statut withdrawn)
  if (req.user.role === "étudiant" && application.studentId.toString() === req.user._id.toString()) {
    application.status = "withdrawn";
    await application.save();
    return res.json({ message: "Candidature retirée", application });
  }

  // Admin peut supprimer
  if (req.user.role === "admin") {
    await application.deleteOne();
    return res.json({ message: "Candidature supprimée" });
  }

  const err = new Error("Accès refusé");
  err.statusCode = 403;
  throw err;
});
