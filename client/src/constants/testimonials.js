// Vidéos réelles de témoignages (public/videos-feedback/, migrées sur Cloudinary).
// Convention de nommage stricte — catégorie déduite uniquement du préfixe du
// nom de fichier, une entrée par fichier présent dans le dossier :
//   summer-camp{n}.mp4     → category "summer-camp"
//   feedback-pfe{n}.mp4    → category "pfe"
//   feedback-formation{n}.mp4 → category "formation"
//
// Aucune information inventée : ni nom, ni citation, ni formation associée,
// ni note. Ces vidéos ont été déposées sans aucune métadonnée réelle — seule
// la vidéo elle-même est donc affichée pour chaque entrée. À enrichir au cas
// par cas dès que de vraies informations sont fournies.
//
// videoUrl utilise resolveVideoUrl() (pas un accès direct à VIDEO_URLS) car
// certaines vidéos récemment déposées n'ont pas encore été migrées sur
// Cloudinary — resolveVideoUrl() retombe alors sur le chemin local
// /videos-feedback/... (servi tel quel par Vite depuis public/) plutôt que de
// renvoyer `undefined`.
import { resolveVideoUrl } from "./videoUrls.js";

// Toutes les vidéos partagent la même entreprise d'accueil.
export const TESTIMONIAL_COMPANY = "9antra-TheBridge";

function makeEntry(prefix, n, category) {
  return {
    id: `${prefix}${n}`,
    videoUrl: resolveVideoUrl(`/videos-feedback/${prefix}${n}.mp4`),
    posterUrl: "",
    vttUrl: null,
    category,
    featured: true,
  };
}

// `category`: "summer-camp" (stage d'été), "pfe" (stage de fin d'études) ou
// "formation" (formation classique). L'ordre d'affichage dans chaque carrousel
// suit l'ordre d'apparition ici (Array.filter préserve l'ordre).
export const TESTIMONIALS = [
  // ─── Summer Camp (10) ───────────────────────────────────────────────────────
  ...Array.from({ length: 10 }, (_, i) => makeEntry("summer-camp", i + 1, "summer-camp")),

  // ─── PFE (8) ──────────────────────────────────────────────────────────────
  ...Array.from({ length: 8 }, (_, i) => makeEntry("feedback-pfe", i + 1, "pfe")),

  // ─── Formation (10) ───────────────────────────────────────────────────────
  // n=3 et n=4 en tête d'affichage (demande explicite), reste dans l'ordre habituel.
  ...[3, 4, 1, 2, 5, 6, 7, 8, 9, 10].map((n) => makeEntry("feedback-formation", n, "formation")),
];

export function getFeaturedSummerCampTestimonials() {
  return TESTIMONIALS.filter((t) => t.featured && t.category === "summer-camp");
}

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
