// ⚠️ DONNÉES FACTICES — à remplacer une fois les vraies vidéos de témoignages
// tournées et uploadées sur Cloudinary (voir scripts/upload-to-cloudinary.js).
// En attendant, `videoUrl` réutilise 3 vidéos déjà migrées comme simples
// stand-ins visuels pour valider le design du carousel — ce ne sont PAS de
// vrais témoignages.
import { VIDEO_URLS } from "./videoUrls.js";

// Toutes les vidéos partagent la même entreprise d'accueil.
export const TESTIMONIAL_COMPANY = "QantraTheBridge";

export const TESTIMONIALS = [
  {
    id: "placeholder-1",
    videoUrl: VIDEO_URLS["/videos-AI/AI1-form-month1.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Yassine Mabrouki",
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship", // "internship" | "hired"
    rating: 5,
    captionText: "« Grâce à la formation IA de StageFlow, j'ai décroché mon stage chez QantraTheBridge en 3 semaines. »",
    featured: true,
  },
  {
    id: "placeholder-2",
    videoUrl: VIDEO_URLS["/videos-MERN/encad1.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Salma Rekik",
    formationSlug: "mern-stack",
    formationLabel: "MERN Stack",
    outcome: "hired",
    rating: 5,
    captionText: "« La formation MERN Stack m'a permis d'être recrutée directement après mon PFE. »",
    featured: true,
  },
  {
    id: "placeholder-3",
    videoUrl: VIDEO_URLS["/videos-FLUTTER/sem1-form-flutter.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Anis Kchaou",
    formationSlug: "mobile-flutter",
    formationLabel: "Développement Mobile Flutter",
    outcome: "internship",
    rating: 4,
    captionText: "« Une formation intense mais qui ouvre vraiment les portes chez QantraTheBridge. »",
    featured: false, // exemple : visible uniquement sur la page de la formation Flutter, pas sur la landing
  },
];

export function getFeaturedTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured);
}

export function getTestimonialsForFormation(formationSlug) {
  return TESTIMONIALS.filter((t) => t.formationSlug === formationSlug);
}
