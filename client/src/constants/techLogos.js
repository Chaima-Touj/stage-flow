// Dictionnaire centralisé slug technologie -> logo, réutilisé par TechMarquee
// (Landing + FormationDetail) et par la grille "Formations Populaires" pour
// les badges technos. Deux sources possibles :
//   - "image": réutilise les PNG déjà présents dans course-placeholders/
//   - "icon" : composant react-icons/si (simple-icons), pour les technos qui
//     n'ont pas de PNG dédié dans le projet
//
// Logos volontairement absents (aucun asset dans le projet, aucune icône
// simple-icons correspondante — licence Adobe non distribuée par
// simple-icons, et aucun logo Microsoft générique n'existe non plus) :
// Photoshop, Illustrator, Lightroom, Premiere Pro, After Effects, Microsoft.
import {
  SiExpress, SiCss, SiWordpress, SiGoogleads, SiFlutter, SiSpringboot,
  SiArduino, SiEspressif, SiMqtt,
  SiKubernetes, SiJenkins, SiGithubactions, SiAnsible, SiTerraform, SiArgo,
} from "react-icons/si";
import { FiDatabase } from "react-icons/fi";

export const TECH_LOGOS = {
  react:      { type: "image", source: "/images/course-placeholders/react.png",      label: "React",      color: "#61DAFB" },
  nodejs:     { type: "image", source: "/images/course-placeholders/nodejs.png",     label: "Node.js",    color: "#339933" },
  mongodb:    { type: "image", source: "/images/course-placeholders/mongodb.png",    label: "MongoDB",    color: "#47A248" },
  javascript: { type: "image", source: "/images/course-placeholders/javascript.png", label: "JavaScript", color: "#F7DF1E" },
  typescript: { type: "image", source: "/images/course-placeholders/typescript.png", label: "TypeScript", color: "#3178C6" },
  python:     { type: "image", source: "/images/course-placeholders/python.png",     label: "Python",     color: "#3776AB" },
  docker:     { type: "image", source: "/images/course-placeholders/docker.png",     label: "Docker",     color: "#2496ED" },
  html:       { type: "image", source: "/images/course-placeholders/html.png",       label: "HTML5",      color: "#E34F26" },
  vue:        { type: "image", source: "/images/course-placeholders/vue.png",        label: "Vue.js",     color: "#4FC08D" },
  angular:    { type: "image", source: "/images/course-placeholders/angular.png",    label: "Angular",    color: "#DD0031" },
  php:        { type: "image", source: "/images/course-placeholders/php.png",        label: "PHP",        color: "#777BB4" },

  // Pas de PNG dédié pour ceux-ci -> icône react-icons/si
  express:   { type: "icon", Comp: SiExpress,   label: "Express",    color: "#000000" },
  sql:       { type: "icon", Comp: FiDatabase,  label: "SQL",        color: "#4479A1" }, // pas de logo SQL générique dans simple-icons
  css3:      { type: "icon", Comp: SiCss,       label: "CSS3",       color: "#1572B6" },
  wordpress: { type: "icon", Comp: SiWordpress, label: "WordPress",  color: "#21759B" },
  googleads: { type: "icon", Comp: SiGoogleads, label: "Google Ads", color: "#4285F4" },

  // Technologies réellement utilisées par des formations existantes mais
  // absentes de la liste initialement demandée (mobile-flutter,
  // fullstack-spring-angular) — icônes déjà utilisées ailleurs dans le
  // projet (ICON_MAP de LandingPage/FormationDetail), donc sûres.
  flutter:    { type: "icon", Comp: SiFlutter,    label: "Flutter",    color: "#54C5F8" },
  springboot: { type: "icon", Comp: SiSpringboot, label: "Spring Boot",color: "#6DB33F" },

  // Formation IoT — technologies réellement enseignées (weeks[].content).
  // Pas d'icône "ESP32" dédiée dans simple-icons -> Espressif (fabricant de
  // l'ESP32) est le logo le plus proche disponible.
  arduino:   { type: "icon", Comp: SiArduino,   label: "Arduino",   color: "#00979D" },
  espressif: { type: "icon", Comp: SiEspressif, label: "Espressif", color: "#E7352C" },
  mqtt:      { type: "icon", Comp: SiMqtt,      label: "MQTT",      color: "#660066" },

  // Formation DevOps — technologies réellement enseignées. SonarQube n'a pas
  // d'icône dans simple-icons, omis.
  kubernetes:    { type: "icon", Comp: SiKubernetes,    label: "Kubernetes",     color: "#326CE5" },
  jenkins:       { type: "icon", Comp: SiJenkins,       label: "Jenkins",        color: "#D33833" },
  githubactions: { type: "icon", Comp: SiGithubactions, label: "GitHub Actions", color: "#2088FF" },
  ansible:       { type: "icon", Comp: SiAnsible,       label: "Ansible",        color: "#EE0000" },
  terraform:     { type: "icon", Comp: SiTerraform,     label: "Terraform",      color: "#7B42BC" },
  argocd:        { type: "icon", Comp: SiArgo,          label: "ArgoCD",         color: "#EF7B4D" },
};

// Liste ordonnée pour la bande statique de la Landing Page (Feature 3A).
// Adobe Suite + Microsoft omis (voir note en tête de fichier).
export const LANDING_MARQUEE_SLUGS = [
  "react", "nodejs", "express", "mongodb", "sql", "javascript", "html", "css3",
  "wordpress", "googleads", "php", "python", "typescript", "vue", "angular", "docker",
];

export function getTechLogo(slug) {
  return TECH_LOGOS[slug] || null;
}
