import User             from "../models/users.model.js";
import Formation         from "../models/formation.model.js";
import Enrollment        from "../models/enrollment.model.js";
import EnrollmentRequest from "../models/enrollmentRequest.model.js";
import Application       from "../models/applications.model.js";
import Interview         from "../models/interview.model.js";
import Conversation      from "../models/conversation.model.js";
import asyncHandler      from "../utils/asyncHandler.js";

const USER_SELECT = "-password -verifyCode -verifyCodeExpires";
const ASSIGNABLE_ROLES = ["étudiant", "entreprise", "encadrant", "admin"];

/* ── GET /api/admin/dashboard-stats ───────────────────────────────────────────
   Agrégats pour la page Tableau de bord admin.                                */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalFormations,
    pendingRequests,
    activeEnrollments,
    enrollmentsByMonth,
    formationsByLevel,
  ] = await Promise.all([
    User.countDocuments({ role: "étudiant" }),
    Formation.countDocuments({}),
    EnrollmentRequest.countDocuments({ status: "en_attente" }),
    Enrollment.countDocuments({ overallStatus: "in_progress" }),

    // Évolution des inscriptions par mois (line chart)
    Enrollment.aggregate([
      {
        $group: {
          _id:   { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", count: 1 } },
    ]),

    // Répartition des formations par niveau (donut chart).
    // Note : Formation n'a pas de champ "domain"/"catégorie" — "level" est le
    // seul champ catégoriel existant, utilisé ici comme meilleur proxy disponible.
    Formation.aggregate([
      { $group: { _id: "$level", count: { $sum: 1 } } },
      { $project: { _id: 0, level: "$_id", count: 1 } },
    ]),
  ]);

  res.json({
    totalStudents,
    totalFormations,
    pendingRequests,
    activeEnrollments,
    enrollmentsByMonth,
    formationsByLevel,
  });
});

/* ── GET /api/admin/users ──────────────────────────────────────────────────────
   Liste complète — pas de pagination serveur, même choix que getAllFormations :
   le volume actuel ne le justifie pas, le tri/filtre/pagination se fait côté
   client (cohérent avec AdminFormations.jsx).                                 */
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(USER_SELECT)
    .sort({ createdAt: -1 })
    .lean();
  res.json(users);
});

/* ── GET /api/admin/users/:id ──────────────────────────────────────────────── */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(USER_SELECT).lean();
  if (!user) {
    const err = new Error("Utilisateur introuvable.");
    err.statusCode = 404;
    throw err;
  }
  res.json(user);
});

/* ── PATCH /api/admin/users/:id/status — activer / désactiver ───────────────── */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    const err = new Error("Le champ isActive doit être un booléen.");
    err.statusCode = 400;
    throw err;
  }

  if (!isActive && String(req.params.id) === String(req.user._id)) {
    const err = new Error("Vous ne pouvez pas désactiver votre propre compte.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select(USER_SELECT);

  if (!user) {
    const err = new Error("Utilisateur introuvable.");
    err.statusCode = 404;
    throw err;
  }

  res.json({ message: isActive ? "Compte activé." : "Compte désactivé.", user });
});

/* ── PATCH /api/admin/users/:id/role — changer le rôle ───────────────────────── */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!ASSIGNABLE_ROLES.includes(role)) {
    const err = new Error(`Rôle invalide. Attendu : ${ASSIGNABLE_ROLES.join(", ")}.`);
    err.statusCode = 400;
    throw err;
  }

  if (role !== "admin" && String(req.params.id) === String(req.user._id)) {
    const err = new Error("Vous ne pouvez pas retirer votre propre rôle admin.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select(USER_SELECT);

  if (!user) {
    const err = new Error("Utilisateur introuvable.");
    err.statusCode = 404;
    throw err;
  }

  res.json({ message: "Rôle mis à jour.", user });
});

/* ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
   Même garde-fou que deleteFormation : bloque (409) si des données liées
   existent, plutôt que de supprimer en cascade silencieusement.               */
export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) {
    const err = new Error("Vous ne pouvez pas supprimer votre propre compte depuis cette page.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error("Utilisateur introuvable.");
    err.statusCode = 404;
    throw err;
  }

  const [applicationCount, interviewCount, conversationCount] = await Promise.all([
    Application.countDocuments({ studentId: user._id }),
    Interview.countDocuments({ $or: [{ studentId: user._id }, { companyId: user._id }] }),
    Conversation.countDocuments({ participants: user._id }),
  ]);

  if (applicationCount > 0 || interviewCount > 0 || conversationCount > 0) {
    const parts = [];
    if (applicationCount > 0)  parts.push(`${applicationCount} candidature(s)`);
    if (interviewCount > 0)    parts.push(`${interviewCount} entretien(s)`);
    if (conversationCount > 0) parts.push(`${conversationCount} conversation(s)`);
    const err = new Error(`Impossible de supprimer : ${parts.join(", ")} lié(s) à ce compte.`);
    err.statusCode = 409;
    throw err;
  }

  await user.deleteOne();
  res.json({ message: "Utilisateur supprimé.", id: user._id });
});
