// Vidéos réelles de témoignages (public/videos-feedback/, migrées sur Cloudinary).
// Convention de nommage : feedback-pfe{n}.mp4 pour un témoignage PFE,
// feedback-formation{n}.mp4 pour une formation classique ou un summer camp —
// à respecter pour toute nouvelle vidéo déposée (feedback-pfe3.mp4, etc.).
// Le nom/formation/légende de chaque carte restent des données de contexte à
// valider avec les vrais participants filmés.
import { VIDEO_URLS } from "./videoUrls.js";

// Toutes les vidéos partagent la même entreprise d'accueil.
export const TESTIMONIAL_COMPANY = "9antra-TheBridge";

// `category`: "pfe" (stage de fin d'études confirmé) ou "formation" (formation
// classique / summer camp — catégorie par défaut quand la nature exacte du
// stage n'est pas précisée dans le témoignage).
export const TESTIMONIALS = [
  {
    id: "placeholder-1",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation1.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Yassine Mabrouki",
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship", // "internship" | "hired"
    category: "formation",
    rating: 5,
    captionText: "« Grâce à la formation IA de TheBridgeFlow, j'ai décroché mon stage chez 9antra-TheBridge en 3 semaines. »",
    featured: true,
  },
  {
    id: "placeholder-2",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-pfe1.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Salma Rekik",
    formationSlug: "mern-stack",
    formationLabel: "MERN Stack",
    outcome: "hired",
    category: "pfe",
    rating: 5,
    captionText: "« La formation MERN Stack m'a permis d'être recrutée directement après mon PFE. »",
    featured: true,
  },
  {
    id: "placeholder-3",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation2.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Anis Kchaou",
    formationSlug: "mobile-flutter",
    formationLabel: "Développement Mobile Flutter",
    outcome: "internship",
    category: "formation",
    rating: 4,
    captionText: "« Une formation intense mais qui ouvre vraiment les portes chez 9antra-TheBridge. »",
    featured: false, // exemple : visible uniquement sur la page de la formation Flutter, pas sur la landing
  },
  // ⚠️ Les 5 entrées ci-dessous sont ajoutées uniquement pour tester le
  // carousel avec davantage de cartes (scroll mobile, comportement desktop,
  // navigation modale) — toujours des données factices.
  {
    id: "placeholder-4",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-pfe2.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Ines Ben Slimane",
    formationSlug: "bi",
    formationLabel: "Business Intelligence",
    outcome: "hired",
    category: "pfe",
    rating: 5,
    captionText: "« La formation BI m'a ouvert les portes d'un poste chez 9antra-TheBridge dès la fin de mon PFE. »",
    featured: true,
  },
  {
    id: "placeholder-5",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation3.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Karim Jaziri",
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation4.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Nour Chaabane",
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation5.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Mehdi Trabelsi",
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation6.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Rania Gharbi",
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation7.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Ahmed Ben Youssef",
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback-formation8.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Sarra Ben Amor",
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship",
    category: "formation",
    rating: 5,
    captionText: "« Un excellent encadrement en IA qui m'a donné toute la confiance nécessaire pour mon stage chez 9antra-TheBridge. »",
    featured: true,
  },
];

export function getFeaturedPfeTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured && t.category === "pfe");
}

export function getFeaturedFormationTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured && t.category === "formation");
}

export function getTestimonialsForFormation(formationSlug) {
  return TESTIMONIALS.filter((t) => t.formationSlug === formationSlug);
}

// Utilisé sur les pages de détail d'une formation (publique + dashboard) :
// témoignages "Formation & Summer Camp" spécifiques à la formation si
// disponibles, sinon repli sur les témoignages "Formation & Summer Camp"
// featured — jamais sur des témoignages PFE (une page de formation n'est pas
// liée à un PFE).
export function getTestimonialsForFormationWithFallback(formationSlug) {
  const specific = TESTIMONIALS.filter(
    (t) => t.category === "formation" && t.formationSlug === formationSlug
  );
  return specific.length > 0 ? specific : getFeaturedFormationTestimonials();
}
