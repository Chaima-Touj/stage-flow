import Interview from "../models/interview.model.js";
import Application from "../models/applications.model.js";
import Notification from "../models/notification.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// POST /api/interviews — réservé à l'entreprise propriétaire de l'offre liée à la candidature
export const proposeInterview = asyncHandler(async (req, res) => {
  const { applicationId, scheduledAt, mode, location, notes } = req.body;

  if (!applicationId || !scheduledAt) {
    const err = new Error("applicationId et scheduledAt requis");
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.findById(applicationId).populate("offerId");
  if (!application) {
    const err = new Error("Candidature non trouvée");
    err.statusCode = 404;
    throw err;
  }

  if (application.offerId.companyId?.toString() !== req.user._id.toString()) {
    const err = new Error("Vous n'êtes pas autorisé à proposer un entretien pour cette candidature");
    err.statusCode = 403;
    throw err;
  }

  const interview = await Interview.create({
    applicationId,
    studentId: application.studentId,
    companyId: req.user._id,
    scheduledAt,
    mode,
    location,
    notes,
  });

  await Notification.create({
    userId:  application.studentId,
    title:   "Entretien proposé",
    message: `${req.user.name} vous propose un entretien le ${new Date(scheduledAt).toLocaleDateString()}.`,
    type:    "info",
    link:    "/dashboard/student/interviews",
  });

  res.status(201).json({ interview });
});

// GET /api/interviews — chacun voit uniquement les entretiens où il est concerné
export const getInterviews = asyncHandler(async (req, res) => {
  const filter = req.user.role === "entreprise"
    ? { companyId: req.user._id }
    : { studentId: req.user._id };

  const interviews = await Interview.find(filter)
    .populate({ path: "applicationId", populate: { path: "offerId", select: "title companyName" } })
    .populate("studentId", "name email")
    .populate("companyId", "name")
    .sort({ scheduledAt: 1 });

  res.json({ count: interviews.length, interviews });
});

// PUT /api/interviews/:id/status — confirmer ou annuler, réservé aux deux parties concernées
export const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["proposé", "confirmé", "annulé", "terminé"];

  if (!validStatuses.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const interview = await Interview.findById(req.params.id);
  if (!interview) {
    const err = new Error("Entretien non trouvé");
    err.statusCode = 404;
    throw err;
  }

  const isStudent = interview.studentId.toString() === req.user._id.toString();
  const isCompany = interview.companyId.toString() === req.user._id.toString();

  if (!isStudent && !isCompany) {
    const err = new Error("Vous n'êtes pas autorisé à modifier cet entretien");
    err.statusCode = 403;
    throw err;
  }

  interview.status = status;
  await interview.save();

  res.json({ interview });
});
