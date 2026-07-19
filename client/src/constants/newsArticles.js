// Mock data pour NewsSection (Feature 5) — facile à remplacer par un vrai
// appel API/CMS plus tard (même forme d'objet à respecter côté backend si un
// modèle Article est ajouté : image, category, date, author, slug).
// `link` est optionnel : absent = card non cliquable, { type:"external", href }
// = ouvre un nouvel onglet, { type:"internal", to } = navigation React Router.
// title/category/excerpt ne sont PAS stockés ici : ce sont des clés i18n
// (namespace "news.<id>") résolues par NewsSection.jsx, pour rester
// traduisibles en FR/EN/AR comme le reste du site.
export const NEWS_ARTICLES = [
  {
    id: "n2",
    image: "/images/news-thumbs/wajahni-event.jpg",
    date: "2026-07-08",
    author: "admin",
    slug: "wajahni-salon-orientation-2026",
    link: { type: "external", href: "https://wajahni.tn/" },
    imgFit: "cover",
  },
  {
    id: "n3",
    image: "/images/news-thumbs/summer-camp-2026.jpg",
    date: "2026-06-20",
    author: "admin",
    slug: "summer-camp-2026-formation-intensive",
    link: { type: "internal", to: "/formations" },
    imgFit: "cover",
    imgPosition: "top",
  },
  {
    id: "n4",
    image: "/images/news-thumbs/stage-ete-2026.jpg",
    date: "2026-05-04",
    author: "admin",
    slug: "formations-techniques-liste-complete",
    link: { type: "internal", to: "/formations" },
    imgFit: "cover",
    imgPosition: "top",
  },
];
