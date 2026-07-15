// Vidéos réelles de témoignages (public/videos-feedback/, migrées sur Cloudinary).
// Convention de nommage stricte : feedback-pfe{n}.mp4 pour un témoignage PFE,
// feedback-formation{n}.mp4 pour une formation classique ou un summer camp —
// à respecter pour toute nouvelle vidéo déposée. Une entrée par fichier présent
// dans le dossier, catégorie déduite uniquement du préfixe du nom de fichier.
//
// Aucune information personnelle identifiante (nom) n'est stockée ni affichée
// pour ces témoignages — seuls la vidéo et, si disponible, un extrait de
// citation générique sont utilisés.
//
// ⚠️ Les entrées marquées "PLACEHOLDER" ci-dessous correspondent à des vidéos
// déposées sans citation réelle encore fournie — citation générique neutre en
// attendant les vraies informations. À remplacer dès qu'elles sont connues.
//
// videoUrl utilise resolveVideoUrl() (pas un accès direct à VIDEO_URLS) car
// certaines vidéos récemment déposées n'ont pas encore été migrées sur
// Cloudinary — resolveVideoUrl() retombe alors sur le chemin local
// /videos-feedback/... (servi tel quel par Vite depuis public/) plutôt que de
// renvoyer `undefined`.
import { resolveVideoUrl } from "./videoUrls.js";

// Toutes les vidéos partagent la même entreprise d'accueil.
export const TESTIMONIAL_COMPANY = "9antra-TheBridge";

// `category`: "pfe" (stage de fin d'études confirmé) ou "formation" (formation
// classique / summer camp).
export const TESTIMONIALS = [
  // ─── PFE (11) ─────────────────────────────────────────────────────────────
  {
    id: "placeholder-2",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe1.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "mern-stack",
    formationLabel: "MERN Stack",
    outcome: "hired",
    category: "pfe",
    rating: 5,
    captionText: "« La formation MERN Stack m'a permis d'être recrutée directement après mon PFE. »",
    featured: true,
  },
  {
    id: "placeholder-4",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe2.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "bi",
    formationLabel: "Business Intelligence",
    outcome: "hired",
    category: "pfe",
    rating: 5,
    captionText: "« La formation BI m'a ouvert les portes d'un poste chez 9antra-TheBridge dès la fin de mon PFE. »",
    featured: true,
  },
  {
    id: "pfe-3",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe3.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Mon PFE chez 9antra-TheBridge a été une expérience déterminante pour la suite de ma carrière. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-4",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe4.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Un encadrement rigoureux qui m'a permis de mener mon PFE à bien dans les meilleures conditions. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-5",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe5.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Grâce à mon PFE chez 9antra-TheBridge, j'ai pu mettre en pratique tout ce que j'avais appris. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-6",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe6.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Une équipe à l'écoute et un vrai accompagnement tout au long de mon PFE. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-7",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe7.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Mon PFE s'est très bien déroulé, avec un suivi personnalisé de qualité. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-8",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe8.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Je recommande vivement 9antra-TheBridge pour réaliser son PFE dans de bonnes conditions. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-9",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe9.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Une expérience de PFE complète, entre théorie et pratique, très formatrice. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-10",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe10.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Le suivi pendant mon PFE m'a vraiment aidé à progresser rapidement. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "pfe-11",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-pfe11.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "pfe",
    rating: 5,
    captionText: "« Mon PFE chez 9antra-TheBridge restera une étape marquante de mon parcours. »", // PLACEHOLDER — à remplacer
    featured: true,
  },

  // ─── Formation & Summer Camp (10) ───────────────────────────────────────────
  {
    id: "placeholder-1",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation1.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Grâce à la formation IA de TheBridgeFlow, j'ai décroché mon stage chez 9antra-TheBridge en 3 semaines. »",
    featured: true,
  },
  {
    id: "placeholder-3",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation2.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "mobile-flutter",
    formationLabel: "Développement Mobile Flutter",
    outcome: "internship",
    category: "formation",
    rating: 4,
    captionText: "« Une formation intense mais qui ouvre vraiment les portes chez 9antra-TheBridge. »",
    featured: false, // exemple : visible uniquement sur la page de la formation Flutter, pas sur la landing
  },
  {
    id: "placeholder-5",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation3.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "iot",
    formationLabel: "Internet des Objets",
    outcome: "internship",
    category: "formation",
    rating: 4,
    captionText: "« Une formation très concrète, j'ai pu démarrer mon stage IoT chez 9antra-TheBridge en confiance. »",
    featured: true,
  },
  {
    id: "placeholder-6",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation4.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "cyber-security",
    formationLabel: "Cybersécurité",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Un encadrement sérieux qui m'a permis de décrocher mon stage cybersécurité chez 9antra-TheBridge. »",
    featured: true,
  },
  {
    id: "placeholder-7",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation5.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "digital-marketing",
    formationLabel: "Marketing Digital",
    outcome: "hired",
    category: "formation",
    rating: 5,
    captionText: "« J'ai été recruté chez 9antra-TheBridge juste après ma formation en marketing digital. »",
    featured: true,
  },
  {
    id: "placeholder-8",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation6.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "fullstack-spring-angular",
    formationLabel: "Fullstack Spring / Angular",
    outcome: "internship",
    category: "formation",
    rating: 4,
    captionText: "« Une formation complète qui m'a préparée à mon stage fullstack chez 9antra-TheBridge. »",
    featured: true,
  },
  {
    id: "placeholder-9",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation7.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "devops",
    formationLabel: "DevOps",
    outcome: "hired",
    category: "formation",
    rating: 5,
    captionText: "« La formation DevOps était exigeante mais complète — j'ai été recruté chez 9antra-TheBridge juste après mon stage. »",
    featured: true,
  },
  {
    id: "placeholder-10",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation8.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Un excellent encadrement en IA qui m'a donné toute la confiance nécessaire pour mon stage chez 9antra-TheBridge. »",
    featured: true,
  },
  {
    id: "formation-9",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation9.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Une formation complète qui m'a donné toutes les clés pour réussir. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
  {
    id: "formation-10",
    videoUrl: resolveVideoUrl("/videos-feedback/feedback-formation10.mp4"),
    posterUrl: "",
    vttUrl: null,
    formationSlug: "",
    formationLabel: "",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Un summer camp intensif et très bien encadré, une super expérience. »", // PLACEHOLDER — à remplacer
    featured: true,
  },
];

export function getFeaturedPfeTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured && t.category === "pfe");
}

export function getFeaturedFormationTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured && t.category === "formation");
}

// Utilisé sur les pages de détail d'une formation (publique + dashboard) :
// TOUS les témoignages "Formation & Summer Camp", identiques sur chaque page
// quelle que soit la formation consultée — aucun filtrage par formation,
// jamais de témoignages PFE (une page de formation n'est pas liée à un PFE).
export function getAllFormationTestimonials() {
  return TESTIMONIALS.filter((t) => t.category === "formation");
}
