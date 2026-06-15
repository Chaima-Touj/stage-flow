import Offer from "../models/offers.model.js";
import User from "../models/users.model.js";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-1.0";
const BASE = process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com/v1beta2/models";

async function callGemini(prompt, opts = {}) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY not configured in environment");
  const url = `${BASE}/${MODEL}:generateText?key=${API_KEY}`;
  const payload = {
    prompt: { text: prompt },
    temperature: typeof opts.temperature === "number" ? opts.temperature : 0.2,
    maxOutputTokens: opts.maxTokens || 512,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json.error?.message || JSON.stringify(json);
    throw new Error(`Gemini API error: ${msg}`);
  }

  // Robust extraction of text from possible Gemini response shapes
  let text = null;
  if (json.candidates && json.candidates.length) {
    text = json.candidates.map((c) => c.output || c.content || c.text || JSON.stringify(c)).join("\n");
  } else if (json.outputText) text = json.outputText;
  else if (json.choices && json.choices[0]) {
    const c = json.choices[0];
    text = c.message?.content || c.text || JSON.stringify(c);
  } else {
    text = JSON.stringify(json);
  }

  return { raw: json, text };
}

async function chat(messages = [], options = {}) {
  const prompt = messages.map((m) => `${m.role || 'user'}: ${m.content}`).join("\n");
  return callGemini(prompt, options);
}

async function recommendInternships(studentId, limit = 5) {
  const student = await User.findById(studentId).lean();
  if (!student) throw new Error("Student not found");

  const offers = await Offer.findActive().lean();

  const tokenize = (s) => (s || "").toString().toLowerCase().split(/\W+/).filter(Boolean);
  const profileTokens = [...tokenize(student.specialty), ...tokenize(student.university)];

  const scored = offers.map((offer) => {
    const tokens = [...tokenize(offer.title), ...tokenize(offer.description), ...(offer.skills || []).map((s) => s.toLowerCase()), ...tokenize(offer.domain)];
    const common = tokens.filter((t) => profileTokens.includes(t)).length;
    return { offer, score: common };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit).map((s) => s.offer);

  const prompt = `Recommande et explique brièvement (2-3 phrases chacune) pourquoi les offres suivantes conviennent au profil étudiant. Donne aussi 3 conseils pour améliorer la candidature.\n\nProfil étudiant:\nNom: ${student.name}\nSpecialty: ${student.specialty}\nUniversity: ${student.university}\n\nOffres:\n${top
    .map((o, i) => `${i + 1}. ${o.title} - ${o.companyName || ''} - domain: ${o.domain} - skills: ${(o.skills || []).join(', ')}\nDescription: ${o.description}`)
    .join('\n\n')}`;

  const result = await callGemini(prompt, { temperature: 0.2, maxTokens: 600 });

  // Try to return JSON-friendly structure (text + raw offers)
  return { offers: top, analysis: result.text, raw: result.raw };
}

async function analyzeCV({ text, fileUrl }) {
  let cvText = text || "";
  if (!cvText && fileUrl) {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Failed to fetch CV from URL: ${res.statusText}`);
    cvText = await res.text();
  }
  if (!cvText) throw new Error("No CV text or fileUrl provided");

  const prompt = `Analyse ce CV en français et retourne un JSON avec les champs: summary, skills (liste), experiences (liste avec role, company, years), education, recommendations (3 conseils). Voici le CV:\n\n${cvText}`;

  const result = await callGemini(prompt, { temperature: 0.0, maxTokens: 800 });
  // Try to parse JSON from assistant
  let parsed = null;
  try {
    // attempt to extract JSON block
    const textOut = result.text;
    const jsonMatch = textOut.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    parsed = null;
  }
  return { raw: result.raw, text: result.text, parsed };
}

async function generateMotivationLetter(studentId, offerId, { tone = 'formel', length = 300 } = {}) {
  const student = await User.findById(studentId).lean();
  const offer = await Offer.findById(offerId).lean();
  if (!student) throw new Error('Student not found');
  if (!offer) throw new Error('Offer not found');

  const prompt = `Rédige une lettre de motivation en français, de ton ${tone}, d'environ ${length} mots, pour l'étudiant suivant et l'offre ci-dessous. Inclure les points forts pertinents et une phrase de conclusion appelant à un entretien.\n\nÉtudiant:\nNom: ${student.name}\nSpecialty: ${student.specialty}\nUniversity: ${student.university}\nProfil court: ${student.meta?.summary || ''}\n\nOffre:\nTitre: ${offer.title}\nEntreprise: ${offer.companyName || ''}\nDescription: ${offer.description}\n\nLettre:`;

  const result = await callGemini(prompt, { temperature: 0.3, maxTokens: 700 });
  return { letter: result.text, raw: result.raw };
}

export default { callGemini, chat, recommendInternships, analyzeCV, generateMotivationLetter };
