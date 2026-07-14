// Vidéos réelles de témoignages (public/videos-feedback/feedback1.mp4 à
// feedback10.mp4, migrées sur Cloudinary). 8 cartes existantes mappées dans
// l'ordre sur feedback1-8 ; feedback9/feedback10 ne sont pas encore utilisées
// (pas assez de cartes pour l'instant — à ajouter si besoin).
// Le nom/formation/légende de chaque carte restent des données de contexte à
// valider avec les vrais participants filmés.
import { VIDEO_URLS } from "./videoUrls.js";

// Toutes les vidéos partagent la même entreprise d'accueil.
export const TESTIMONIAL_COMPANY = "QantraTheBridge";

export const TESTIMONIALS = [
  {
    id: "placeholder-1",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback1.mp4"],
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback2.mp4"],
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
    videoUrl: VIDEO_URLS["/videos-feedback/feedback3.mp4"],
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
  // ⚠️ Les 5 entrées ci-dessous sont ajoutées uniquement pour tester le
  // carousel avec davantage de cartes (scroll mobile, comportement desktop,
  // navigation modale) — toujours des données factices.
  {
    id: "placeholder-4",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback4.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Ines Ben Slimane",
    formationSlug: "bi",
    formationLabel: "Business Intelligence",
    outcome: "hired",
    rating: 5,
    captionText: "« La formation BI m'a ouvert les portes d'un poste chez QantraTheBridge dès la fin de mon PFE. »",
    featured: true,
  },
  {
    id: "placeholder-5",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback5.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Karim Jaziri",
    formationSlug: "iot",
    formationLabel: "Internet des Objets",
    outcome: "internship",
    rating: 4,
    captionText: "« Une formation très concrète, j'ai pu démarrer mon stage IoT chez QantraTheBridge en confiance. »",
    featured: true,
  },
  {
    id: "placeholder-6",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback6.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Nour Chaabane",
    formationSlug: "cyber-security",
    formationLabel: "Cybersécurité",
    outcome: "internship",
    rating: 5,
    captionText: "« Un encadrement sérieux qui m'a permis de décrocher mon stage cybersécurité chez QantraTheBridge. »",
    featured: true,
  },
  {
    id: "placeholder-7",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback7.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Mehdi Trabelsi",
    formationSlug: "digital-marketing",
    formationLabel: "Marketing Digital",
    outcome: "hired",
    rating: 5,
    captionText: "« J'ai été recruté chez QantraTheBridge juste après ma formation en marketing digital. »",
    featured: true,
  },
  {
    id: "placeholder-8",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback8.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Rania Gharbi",
    formationSlug: "fullstack-spring-angular",
    formationLabel: "Fullstack Spring / Angular",
    outcome: "internship",
    rating: 4,
    captionText: "« Une formation complète qui m'a préparée à mon stage fullstack chez QantraTheBridge. »",
    featured: true,
  },
  {
    id: "placeholder-9",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback9.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Ahmed Ben Youssef",
    formationSlug: "devops",
    formationLabel: "DevOps",
    outcome: "hired",
    rating: 5,
    captionText: "« La formation DevOps était exigeante mais complète — j'ai été recruté chez QantraTheBridge juste après mon stage. »",
    featured: true,
  },
  {
    id: "placeholder-10",
    videoUrl: VIDEO_URLS["/videos-feedback/feedback10.mp4"],
    posterUrl: "",
    vttUrl: null,
    studentName: "Sarra Ben Amor",
    formationSlug: "ai",
    formationLabel: "Intelligence Artificielle",
    outcome: "internship",
    rating: 5,
    captionText: "« Un excellent encadrement en IA qui m'a donné toute la confiance nécessaire pour mon stage chez QantraTheBridge. »",
    featured: true,
  },
];

export function getFeaturedTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured);
}

export function getTestimonialsForFormation(formationSlug) {
  return TESTIMONIALS.filter((t) => t.formationSlug === formationSlug);
}

// Utilisé sur les pages de détail d'une formation (publique + dashboard) :
// témoignages spécifiques à la formation si disponibles, sinon repli sur les
// témoignages "featured" plutôt que de masquer la section.
export function getTestimonialsForFormationWithFallback(formationSlug) {
  const specific = getTestimonialsForFormation(formationSlug);
  return specific.length > 0 ? specific : getFeaturedTestimonials();
}
