import Application from "../models/applications.model.js";
import Offer from "../models/offers.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import Notification from "../models/notification.model.js";

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
    studentEmail: req.user.email || "",
    companyId: offer.companyId,
    companyName: offer.companyName || "",
    coverLetter: coverLetter || "",
    resumeUrl: resumeUrl || "",
    attachments: Array.isArray(attachments) ? attachments : [],
    status: "pending",
  });

  // Notify company about new application
  try {
    await Notification.create({
      userId: offer.companyId,
      actorId: req.user._id,
      type: "application:new",
      data: { applicationId: appDoc._id, offerId: offer._id, studentId: req.user._id },
      link: `/applications/${appDoc._id}`,
    });
  } catch (e) {
    console.warn("Failed to create notification:", e.message);
  }

  res.status(201).json({ application: appDoc });
});

// GET /api/applications - list des candidatures (student/company/admin)
export const getApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
  const skip = (page - 1) * limit;

  const { status, offerId, studentId } = req.query;
  const filter = {};

  // RBAC: étudiants voient leurs candidatures, entreprises voient candidatures pour leurs offres
  if (req.user.role === "étudiant") filter.studentId = req.user._id;
  else if (req.user.role === "entreprise") filter.companyId = req.user._id;
  else {
    // admin can filter via query
    if (studentId) filter.studentId = studentId;
  }

  if (status) filter.status = status;
  if (offerId) filter.offerId = offerId;

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

  const isAdmin = req.user.role === "admin";
  const isStudentOwner = application.studentId && (application.studentId._id ? application.studentId._id.toString() === req.user._id.toString() : application.studentId.toString() === req.user._id.toString());
  const isCompanyOwner = application.companyId && application.companyId.toString() === req.user._id.toString();

  if (!isAdmin && !isStudentOwner && !isCompanyOwner) {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  res.json({ application });
});

// PATCH /api/applications/:id/status - mettre à jour le statut
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, feedback, interviewDate } = req.body;
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

  const isStudentOwner = application.studentId && application.studentId.toString() === req.user._id.toString();
  const isCompanyOwner = application.companyId && application.companyId.toString() === req.user._id.toString();

  // Student can only withdraw
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

  // Company or admin can change status
  if (req.user.role === "entreprise" && !isCompanyOwner && req.user.role !== "admin") {
    const err = new Error("Accès refusé");
    err.statusCode = 403;
    throw err;
  }

  application.status = status;
  if (typeof feedback !== "undefined") application.feedback = feedback;
  if (interviewDate) application.interview.date = new Date(interviewDate);
  await application.save();

  // Notify applicant about status change
  try {
    await Notification.create({
      userId: application.studentId,
      actorId: req.user._id,
      type: "application:status",
      data: { applicationId: application._id, status },
      link: `/applications/${application._id}`,
    });
  } catch (e) {
    console.warn("Failed to create notification:", e.message);
  }

  // If interview scheduled, also create an interview reminder notification
  if (status === "interview" && application.interview && application.interview.date) {
    try {
      await Notification.create({
        userId: application.studentId,
        actorId: req.user._id,
        type: "interview:reminder",
        data: { applicationId: application._id, interviewDate: application.interview.date },
        link: `/applications/${application._id}`,
      });
    } catch (e) {
      console.warn("Failed to create interview notification:", e.message);
    }
  }

  res.json({ application });
});

// DELETE /api/applications/:id - retrait par l'étudiant (withdraw) ou suppression admin
export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    const err = new Error("Candidature introuvable");
    err.statusCode = 404;
    throw err;
  }

  const isStudentOwner = application.studentId && application.studentId.toString() === req.user._id.toString();

  if (req.user.role === "étudiant" && isStudentOwner) {
    application.status = "withdrawn";
    await application.save();
    return res.json({ message: "Candidature retirée", application });
  }

  if (req.user.role === "admin") {
    await application.deleteOne();
    return res.json({ message: "Candidature supprimée" });
  }

  const err = new Error("Accès refusé");
  err.statusCode = 403;
  throw err;
});
