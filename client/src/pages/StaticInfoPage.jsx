import { useTranslation } from "react-i18next";
import { FiTool } from "react-icons/fi";
import SiteNavbar from "../components/common/SiteNavbar.jsx";
import "./FormationsPage.css";

// Page générique pour les liens footer dont le contenu réel (FAQ, guides,
// CGU, mentions légales...) n'est pas encore rédigé. Évite les liens morts
// "#" qui renvoyaient silencieusement en haut de page sans rien afficher.
export default function StaticInfoPage({ titleKey }) {
  const { t } = useTranslation();

  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge"><FiTool size={14} /> {t("staticInfo.badge")}</span>
          <h1 className="fp-hero__title">{t(titleKey)}</h1>
          <p className="fp-hero__subtitle">{t("staticInfo.comingSoon")}</p>
        </div>
      </section>
    </div>
  );
}
