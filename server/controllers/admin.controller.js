import User             from "../models/users.model.js";
import Formation         from "../models/formation.model.js";
import Enrollment        from "../models/enrollment.model.js";
import EnrollmentRequest from "../models/enrollmentRequest.model.js";
import asyncHandler      from "../utils/asyncHandler.js";

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
