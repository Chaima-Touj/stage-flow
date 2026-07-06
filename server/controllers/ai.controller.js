import groqService from "../services/groq.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/users.model.js";
import Application from "../models/applications.model.js";
import Interview from "../models/interview.model.js";
import Notification from "../models/notification.model.js";
import Conversation from "../models/conversation.model.js";
import Formation from "../models/formation.model.js";
import Offer from "../models/offers.model.js";

// ─── Context builder ────────────────────────────────────────────────────────

async function buildUserContext(userId) {
  const [user, applications, interviews, unreadCount, conversationCount, formations] =
    await Promise.all([
      User.findById(userId).select("-password -verifyCode -verifyCodeExpires").lean(),
      Application.find({ studentId: userId })
        .populate("offerId", "title companyName domain type")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Interview.find({ studentId: userId })
        .populate({ path: "applicationId", populate: { path: "offerId", select: "title companyName" } })
        .sort({ scheduledAt: 1 })
        .limit(5)
        .lean(),
      Notification.countDocuments({ userId, isRead: false }),
      Conversation.countDocuments({ participants: userId }),
      Formation.find({}).select("title level duration domain").limit(8).lean(),
    ]);

  let favorites = [];
  if (user?.favorites?.length) {
    favorites = await Offer.find({ _id: { $in: user.favorites } })
      .select("title companyName domain")
      .limit(5)
      .lean();
  }

  const completionChecks = [
    !!user?.university,
    !!user?.specialty,
    !!user?.bio,
    !!(user?.skills?.length),
    !!(user?.languages?.length),
    !!(user?.cv?.fileUrl),
    !!(user?.socialLinks?.linkedin),
    !!(user?.experience?.length),
    !!(user?.education?.institution),
  ];
  const profileCompletion = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );

  const appStats = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return {
    user,
    applications,
    appStats,
    interviews,
    unreadCount,
    conversationCount,
    favorites,
    formations,
    profileCompletion,
  };
}

// ─── System prompt builder ───────────────────────────────────────────────────

function buildSystemPrompt(ctx) {
  const { user, applications, appStats, interviews, unreadCount, conversationCount, favorites, formations, profileCompletion } = ctx;

  const skills = user.skills?.map((s) => `${s.name} (${s.level})`).join(", ") || "Aucune compétence renseignée";
  const languages = user.languages?.map((l) => `${l.name} (${l.level})`).join(", ") || "Non renseignées";

  const appsText =
    applications.length === 0
      ? "  Aucune candidature pour le moment."
      : applications
          .slice(0, 5)
          .map((a) => `  • ${a.offerId?.title || "Offre inconnue"} chez ${a.offerId?.companyName || "?"} — Statut: ${a.status}`)
          .join("\n");

  const interviewsText =
    interviews.length === 0
      ? "  Aucun entretien planifié."
      : interviews
          .slice(0, 3)
          .map((i) => {
            const date = i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString("fr-FR") : "Date inconnue";
            return `  • ${date} — ${i.mode} — Statut: ${i.status}`;
          })
          .join("\n");

  const favText =
    favorites.length === 0
      ? "  Aucun favori."
      : favorites.map((f) => `  • ${f.title} — ${f.companyName || "?"} (${f.domain || "?"})`).join("\n");

  const formationsText =
    formations.length === 0
      ? "  Aucune formation disponible."
      : formations.map((f) => `  • ${f.title} — Niveau: ${f.level || "?"} — Durée: ${f.duration || "?"}`).join("\n");

  return `Tu es SAGE, l'assistant IA officiel de StageFlow — la plateforme tunisienne de stages, PFE et formations pour étudiants.

PÉRIMÈTRE EXCLUSIF:
Tu réponds UNIQUEMENT aux sujets liés à StageFlow : offres de stage/PFE/alternance, formations, candidatures, entretiens, profil utilisateur, messagerie, notifications, recommandations personnalisées, et fonctionnalités de la plateforme.

HORS PÉRIMÈTRE:
Si la question ne concerne pas StageFlow, réponds exactement ceci :
"Je suis SAGE, l'assistant IA de StageFlow. Je suis spécialisé uniquement dans cette plateforme et ses services. Pour des questions générales ou hors-sujet, je vous invite à utiliser un assistant IA généraliste comme ChatGPT."

RÈGLES ABSOLUES:
1. N'invente JAMAIS d'informations. Si une donnée n'est pas disponible, dis-le clairement.
2. Utilise UNIQUEMENT les données du contexte ci-dessous pour personnaliser tes réponses.
3. Sois concis, professionnel, encourageant et bienveillant.
4. Réponds en français par défaut (adapte-toi si l'utilisateur écrit en anglais ou arabe).
5. Formate tes réponses avec des listes à puces et du gras quand c'est utile pour la lisibilité.
6. Ne mémorise jamais les données d'une session précédente ou d'un autre utilisateur.

━━━ CONTEXTE UTILISATEUR CONNECTÉ ━━━

👤 PROFIL:
  Nom: ${user.name}
  Rôle: ${user.role}
  Université: ${user.university || "Non renseignée"}
  Spécialité: ${user.specialty || "Non renseignée"}
  Bio: ${user.bio || "Non renseignée"}
  Complétude du profil: ${profileCompletion}%
  CV uploadé: ${user.cv?.fileUrl ? "Oui ✓" : "Non"}
  LinkedIn: ${user.socialLinks?.linkedin || "Non renseigné"}
  GitHub: ${user.socialLinks?.github || "Non renseigné"}
  Portfolio: ${user.socialLinks?.portfolio || "Non renseigné"}
  Compétences: ${skills}
  Langues: ${languages}

📋 CANDIDATURES (${applications.length} total — ${appStats["en attente"] || 0} en attente, ${appStats["acceptée"] || 0} acceptée(s), ${appStats["refusée"] || 0} refusée(s), ${appStats["en cours"] || 0} en cours):
${appsText}

🎤 ENTRETIENS (${interviews.length}):
${interviewsText}

🔔 NOTIFICATIONS NON LUES: ${unreadCount}

💬 CONVERSATIONS ACTIVES: ${conversationCount}

⭐ OFFRES EN FAVORIS:
${favText}

📚 FORMATIONS DISPONIBLES SUR STAGEFLOW:
${formationsText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ce contexte est reconstruit depuis MongoDB à chaque requête. Il est unique à l'utilisateur connecté.`;
}

// ─── Controllers ────────────────────────────────────────────────────────────

// POST /api/ai/chat — contexte MongoDB injecté automatiquement
export const chat = asyncHandler(async (req, res) => {
  const { messages, temperature } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    const err = new Error("messages array requis");
    err.statusCode = 400;
    throw err;
  }

  const ctx = await buildUserContext(req.user._id);
  const systemPrompt = buildSystemPrompt(ctx);

  const allMessages = [{ role: "system", content: systemPrompt }, ...messages];
  const result = await groqService.chat(allMessages, { temperature });
  res.json({ result });
});

// GET /api/ai/user-context — snapshot du contexte pour la sidebar frontend
export const getUserContext = asyncHandler(async (req, res) => {
  const ctx = await buildUserContext(req.user._id);
  res.json(ctx);
});

// POST /api/ai/recommendations
export const recommendations = asyncHandler(async (req, res) => {
  const limit = parseInt(req.body.limit, 10) || 5;
  const out   = await groqService.recommendInternships(req.user._id, limit);
  res.json(out);
});

// POST /api/ai/analyze-cv
export const analyzeCv = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const out = await groqService.analyzeCV({ text });
  res.json(out);
});

// POST /api/ai/generate-motivation
export const generateMotivation = asyncHandler(async (req, res) => {
  const { offerId, tone } = req.body;

  if (!offerId) {
    const err = new Error("offerId requis");
    err.statusCode = 400;
    throw err;
  }

  const out = await groqService.generateMotivationLetter(req.user._id, offerId, { tone });
  res.json(out);
});
