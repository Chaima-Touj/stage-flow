import Application from "../models/applications.model.js";
import Offer from "../models/offers.model.js";
import User from "../models/users.model.js";
import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import emailService from "../services/email.service.js";

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

  const offer = await Offer.findById(offerId);
  if (!offer) {
    const err = new Error("Offre non trouvée");
    err.statusCode = 404;
    throw err;
  }

  const cvUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const application = await Application.create({
    offerId,
    studentId: req.user._id,
    coverLetter,
    cvUrl,
  });

  // Email à l'étudiant — confirmation d'envoi
  emailService.sendApplicationSent(req.user.email, {
    studentName: req.user.name,
    offerTitle:  offer.title,
    companyName: offer.companyName,
  });

  // Email à l'entreprise — nouvelle candidature reçue
  if (offer.companyId) {
    const company = await User.findById(offer.companyId).select("email name").lean();
    if (company?.email) {
      emailService.sendApplicationReceived(company.email, {
        companyName:  company.name,
        studentName:  req.user.name,
        studentEmail: req.user.email,
        offerTitle:   offer.title,
      });
    }
  }

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
    .populate("offerId",   "title companyName location type companyId")
    .populate("studentId", "name email university specialty")
    .sort({ createdAt: -1 })
    .lean();

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

  const isOwnerStudent = application.studentId._id.toString() === req.user._id.toString();
  const isOwnerCompany = application.offerId.companyId?.toString() === req.user._id.toString();

  if (!isOwnerStudent && !isOwnerCompany) {
    const err = new Error("Vous n'êtes pas autorisé à consulter cette candidature");
    err.statusCode = 403;
    throw err;
  }

  res.json({ application });
});

// PUT /api/applications/:id/status — réservé à l'entreprise propriétaire
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

  // Notification in-app
  const statusMessages = {
    "acceptée": `Bonne nouvelle ! Ta candidature pour "${application.offerId.title}" a été acceptée.`,
    "refusée":  `Ta candidature pour "${application.offerId.title}" n'a pas été retenue cette fois.`,
    "en cours": `Ta candidature pour "${application.offerId.title}" est en cours d'examen.`,
  };

  if (statusMessages[status]) {
    await Notification.create({
      userId:  application.studentId,
      title:   "Mise à jour de candidature",
      message: statusMessages[status],
      type:    status === "acceptée" ? "success" : status === "refusée" ? "warning" : "info",
      link:    "/dashboard/student/applications",
    });
  }

  // Email à l'étudiant — statut mis à jour
  if (status !== "en attente") {
    const student = await User.findById(application.studentId).select("email name").lean();
    if (student?.email) {
      emailService.sendApplicationStatus(student.email, {
        studentName: student.name,
        offerTitle:  application.offerId.title,
        companyName: application.offerId.companyName,
        status,
      });
    }
  }

  res.json({ application });
});