import { FiTool } from "react-icons/fi";
import SiteNavbar from "../../components/common/SiteNavbar.jsx";
import "../FormationsPage.css";
import "./LegalPage.css";

export default function LegalNotice() {
  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge"><FiTool size={14} /> Légal</span>
          <h1 className="fp-hero__title">Mentions légales</h1>
        </div>
      </section>

      <div className="legal-content">
        <h2>Éditeur du site</h2>
        <p>
          La plateforme TheBridgeFlow est éditée par 9antra.tn — The Bridge, dont le siège social est situé à Lac 1,
          Tunis (Level 1), avec un second espace à Sahloul, Sousse (Rockets).
        </p>
        <ul>
          <li><strong>Adresse :</strong> Lac 1, Tunis — Level 1</li>
          <li><strong>Téléphone :</strong> +216 58 840 064</li>
          <li><strong>E-mail :</strong> contact@9antra.tn</li>
        </ul>

        <h2>Hébergement</h2>
        <p>
          Les informations relatives à l'hébergement du site peuvent être obtenues sur simple demande auprès de
          contact@9antra.tn, conformément à la réglementation en vigueur.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur TheBridgeFlow (textes, logos, visuels, vidéos, structure du site)
          est protégé par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou
          partielle, sans autorisation préalable, est interdite.
        </p>

        <h2>Contact</h2>
        <p>
          Pour toute question relative au site ou à son contenu, vous pouvez nous contacter à l'adresse
          contact@9antra.tn ou au +216 58 840 064.
        </p>

        <p className="legal-content__updated">Dernière mise à jour : 2026.</p>
      </div>
    </div>
  );
}
