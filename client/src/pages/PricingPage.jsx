import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCheck } from "react-icons/fi";
import SiteNavbar from "../components/common/SiteNavbar.jsx";
import "./FormationsPage.css";
import "./PricingPage.css";

// Prix volontairement en dehors de i18next : "390"/"490" et le suffixe "DT"
// doivent rester strictement identiques dans les 3 langues (voir consigne).
const PLAN_KEYS = [
  { key: "online", price: "390", highlight: false },
  { key: "onsite", price: "490", highlight: true },
];

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="fp-page">
      <SiteNavbar />

      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge">💳 {t("tarifs.badge")}</span>
          <h1 className="fp-hero__title">{t("tarifs.title")}</h1>
          <p className="fp-hero__subtitle">{t("tarifs.subtitle")}</p>
        </div>
      </section>

      <main className="pr-main">
        <div className="pr-grid">
          {PLAN_KEYS.map((plan) => {
            const features = t(`tarifs.${plan.key}.features`, { returnObjects: true });
            return (
              <div key={plan.key} className={`pr-card${plan.highlight ? " pr-card--highlight" : ""}`}>
                {plan.highlight && <span className="pr-card__badge">{t("tarifs.popularBadge")}</span>}
                <p className="pr-card__name">{t(`tarifs.${plan.key}.name`)}</p>
                <div className="pr-card__price">
                  {/* dir="ltr" isolé : évite que le bidi arabe inverse "490 DT" en "DT 490" */}
                  <span className="pr-card__price-value" dir="ltr">{plan.price} DT</span>
                </div>
                <p className="pr-card__desc">{t(`tarifs.${plan.key}.desc`)}</p>
                <ul className="pr-card__features">
                  {features.map((f) => (
                    <li key={f}>
                      <FiCheck size={18} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${plan.highlight ? "btn-primary" : "btn-outline"} pr-card__cta`}>
                  {t("tarifs.cta")}
                </Link>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
