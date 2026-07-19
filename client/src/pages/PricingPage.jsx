import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../components/common/SiteNavbar.jsx";
import "./FormationsPage.css";
import "./PricingPage.css";

const PLANS = [
  {
    key: "online",
    name: "En ligne",
    price: "390",
    desc: "Suivez votre formation à distance, à votre rythme, avec un accompagnement complet.",
    features: [
      "Accès complet à la plateforme TheBridgeFlow",
      "Suivi personnalisé de la progression semaine par semaine",
      "Encadrement par un mentor dédié",
      "Support via messagerie et assistant IA SAGE",
      "Préparation aux entretiens",
      "Certificat de formation à l'issue du programme",
    ],
    highlight: false,
  },
  {
    key: "onsite",
    name: "Présentiel",
    price: "490",
    desc: "La même formation, en présentiel dans nos locaux, avec un accompagnement renforcé.",
    features: [
      "Tout ce qui est inclus dans la formule En ligne",
      "Accès à nos espaces de travail (Tunis & Sousse)",
      "Sessions d'encadrement en présentiel",
      "Networking avec les autres promotions",
      "Accompagnement renforcé pour les candidatures et entretiens",
      "Certificat de formation à l'issue du programme",
    ],
    highlight: true,
  },
];

export default function PricingPage() {
  return (
    <div className="fp-page">
      <SiteNavbar />

      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge">💳 Tarifs</span>
          <h1 className="fp-hero__title">Des formules simples et transparentes</h1>
          <p className="fp-hero__subtitle">
            Choisissez la formule qui correspond le mieux à votre façon d'apprendre — en ligne ou en présentiel.
          </p>
        </div>
      </section>

      <main className="pr-main">
        <div className="pr-grid">
          {PLANS.map((plan) => (
            <div key={plan.key} className={`pr-card${plan.highlight ? " pr-card--highlight" : ""}`}>
              {plan.highlight && <span className="pr-card__badge">Le plus populaire</span>}
              <p className="pr-card__name">{plan.name}</p>
              <div className="pr-card__price">
                <span className="pr-card__price-value">{plan.price} DT</span>
              </div>
              <p className="pr-card__desc">{plan.desc}</p>
              <ul className="pr-card__features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <FiCheck size={18} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className={`btn ${plan.highlight ? "btn-primary" : "btn-outline"} pr-card__cta`}>
                Choisir cette formule
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
