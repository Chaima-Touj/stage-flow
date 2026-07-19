// Mock data pour NewsSection (Feature 5) — facile à remplacer par un vrai
// appel API/CMS plus tard (même forme d'objet à respecter côté backend si un
// modèle Article est ajouté : title, image, category, date, author, slug).
// `link` est optionnel : absent = card non cliquable, { type:"external", href }
// = ouvre un nouvel onglet, { type:"internal", to } = navigation React Router.
export const NEWS_ARTICLES = [
  {
    id: "n2",
    title: "Retrouvez-nous à Wajahni, salon d'orientation étudiante",
    excerpt: "TheBridgeFlow sera présent au salon Wajahni pour présenter ses formations et échanger avec les étudiants sur leurs projets de stage et de PFE.",
    image: "/images/news-thumbs/wajahni-event.jpg",
    category: "Événements",
    date: "2026-07-08",
    author: "admin",
    slug: "wajahni-salon-orientation-2026",
    link: { type: "external", href: "https://wajahni.tn/" },
    imgFit: "cover",
  },
  {
    id: "n3",
    title: "Summer Camp 2026 : formation intensive multi-tech",
    excerpt: "Un programme intensif pour découvrir plusieurs stacks techniques (MERN, Spring/Angular, Flutter...) avec un encadrement personnalisé sur toute la durée du camp.",
    image: "/images/news-thumbs/summer-camp-2026.jpg",
    category: "Summer Camp",
    date: "2026-06-20",
    author: "admin",
    slug: "summer-camp-2026-formation-intensive",
    link: { type: "internal", to: "/formations" },
    imgFit: "cover",
    imgPosition: "top",
  },
  {
    id: "n4",
    title: "Nos formations techniques : la liste complète",
    excerpt: "MERN, Spring/Angular, Flutter, DevOps, BI, IA, cybersécurité... découvrez l'ensemble du catalogue de formations disponibles sur la plateforme.",
    image: "/images/news-thumbs/stage-ete-2026.jpg",
    category: "Éducation",
    date: "2026-05-04",
    author: "admin",
    slug: "formations-techniques-liste-complete",
    link: { type: "internal", to: "/formations" },
    imgFit: "cover",
    imgPosition: "top",
  },
];
