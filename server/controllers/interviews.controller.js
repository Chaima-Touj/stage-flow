import Interview from "../models/interview.model.js";
import Application from "../models/applications.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/users.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import emailService from "../services/email.service.js";

// POST /api/interviews — réservé à l'entreprise propriétaire de l'offre
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
    studentId:   application.studentId,
    companyId:   req.user._id,
    scheduledAt,
    mode,
    location,
    notes,
  });

  // Notification in-app
  await Notification.create({
    userId:  application.studentId,
    title:   "Entretien proposé",
    message: `${req.user.name} vous propose un entretien le ${new Date(scheduledAt).toLocaleDateString("fr-FR")}.`,
    type:    "info",
    link:    "/dashboard/student/interviews",
  });

  // Email à l'étudiant — entretien proposé
  const student = await User.findById(application.studentId).select("email name").lean();
  if (student?.email) {
    emailService.sendInterviewProposed(student.email, {
      studentName: student.name,
      companyName: req.user.name,
      offerTitle:  application.offerId.title,
      scheduledAt,
      mode:        mode || "en ligne",
      location:    location || "",
    });
  }

  res.status(201).json({ interview });
});

// GET /api/interviews
export const getInterviews = asyncHandler(async (req, res) => {
  const filter = req.user.role === "entreprise"
    ? { companyId: req.user._id }
    : { studentId: req.user._id };

  const interviews = await Interview.find(filter)
    .populate({ path: "applicationId", populate: { path: "offerId", select: "title companyName" } })
    .populate("studentId", "name email")
    .populate("companyId", "name")
    .sort({ scheduledAt: 1 })
    .lean();

  res.json({ count: interviews.length, interviews });
});

// PUT /api/interviews/:id/status
export const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["proposé", "confirmé", "annulé", "terminé"];

  if (!validStatuses.includes(status)) {
    const err = new Error("Statut invalide");
    err.statusCode = 400;
    throw err;
  }

  const interview = await Interview.findById(req.params.id)
    .populate({ path: "applicationId", populate: { path: "offerId", select: "title companyName" } });

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

  // Email aux deux parties concernées si statut important
  if (["confirmé", "annulé", "terminé"].includes(status)) {
    const offerTitle  = interview.applicationId?.offerId?.title || "Stage";
    const scheduledAt = interview.scheduledAt;

    const [student, company] = await Promise.all([
      User.findById(interview.studentId).select("email name").lean(),
      User.findById(interview.companyId).select("email name").lean(),
    ]);

    if (student?.email) {
      emailService.sendInterviewStatus(student.email, {
        recipientName: student.name,
        status,
        offerTitle,
        scheduledAt,
      });
    }

    if (company?.email && status === "confirmé") {
      emailService.sendInterviewStatus(company.email, {
        recipientName: company.name,
        status,
        offerTitle,
        scheduledAt,
      });
    }
  }

  res.json({ interview });
});