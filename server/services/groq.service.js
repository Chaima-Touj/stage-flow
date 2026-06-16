import Groq from "groq-sdk";
import Offer from "../models/offers.model.js";
import User from "../models/users.model.js";

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY non configurée dans .env");
  return new Groq({ apiKey });
};

// ─── Chat simple ──────────────────────────────────────────────────────────────
async function chat(messages = [], options = {}) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model:       "llama-3.1-8b-instant",
    messages:    messages.map((m) => ({
      role:    m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
    temperature: options.temperature ?? 0.7,
    max_tokens:  options.maxTokens  ?? 512,
  });

  const text = completion.choices[0]?.message?.content || "";
  return { text };
}

// ─── Recommandation de stages ─────────────────────────────────────────────────
async function recommendInternships(studentId, limit = 5) {
  const student = await User.findById(studentId).lean();
  if (!student) throw new Error("Étudiant non trouvé");

  const offers = await Offer.find({ isActive: true }).lean();

  const tokenize = (s) => (s || "").toLowerCase().split(/\W+/).filter(Boolean);
  const profileTokens = [
    ...tokenize(student.specialty),
    ...tokenize(student.university),
  ];

  const scored = offers.map((offer) => {
    const tokens = [
      ...tokenize(offer.title),
      ...tokenize(offer.description),
      ...(offer.skills || []).map((s) => s.toLowerCase()),
      ...tokenize(offer.domain),
    ];
    const common = tokens.filter((t) => profileTokens.includes(t)).length;
    return { offer, score: common };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).map((s) => s.offer);

  const prompt = `Tu es un conseiller en orientation professionnelle.
Explique en 2-3 phrases pourquoi chaque offre convient à cet étudiant.
Donne aussi 3 conseils pour améliorer sa candidature.

Profil étudiant:
- Nom: ${student.name}
- Spécialité: ${student.specialty}
- Université: ${student.university}

Offres recommandées:
${top.map((o, i) => `${i + 1}. ${o.title} - ${o.companyName || ""} | Domaine: ${o.domain} | Compétences: ${(o.skills || []).join(", ")}`).join("\n")}

Réponds en français.`;

  const result = await chat([{ role: "user", content: prompt }], { temperature: 0.3, maxTokens: 800 });
  return { offers: top, analysis: result.text };
}

// ─── Analyse de CV ────────────────────────────────────────────────────────────
async function analyzeCV({ text }) {
  if (!text) throw new Error("Aucun texte de CV fourni");

  const prompt = `Analyse ce CV en français et retourne UNIQUEMENT un JSON valide avec cette structure:
{
  "summary": "résumé du profil",
  "skills": ["compétence1", "compétence2"],
  "experiences": [{"role": "", "company": "", "years": ""}],
  "education": "formation principale",
  "recommendations": ["conseil1", "conseil2", "conseil3"]
}

CV à analyser:
${text}`;

  const result = await chat([{ role: "user", content: prompt }], { temperature: 0.0, maxTokens: 1000 });

  let parsed = null;
  try {
    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    parsed = null;
  }

  return { text: result.text, parsed };
}

// ─── Génération de lettre de motivation ───────────────────────────────────────
async function generateMotivationLetter(studentId, offerId, { tone = "formel", length = 300 } = {}) {
  const student = await User.findById(studentId).lean();
  const offer   = await Offer.findById(offerId).lean();

  if (!student) throw new Error("Étudiant non trouvé");
  if (!offer)   throw new Error("Offre non trouvée");

  const prompt = `Rédige une lettre de motivation en français, ton ${tone}, environ ${length} mots.
Mentionne les compétences pertinentes et termine par un appel à l'entretien.

Étudiant:
- Nom: ${student.name}
- Spécialité: ${student.specialty}
- Université: ${student.university}

Offre:
- Titre: ${offer.title}
- Entreprise: ${offer.companyName || ""}
- Description: ${offer.description}

Lettre de motivation:`;

  const result = await chat([{ role: "user", content: prompt }], { temperature: 0.4, maxTokens: 700 });
  return { letter: result.text };
}

export default { chat, recommendInternships, analyzeCV, generateMotivationLetter };
