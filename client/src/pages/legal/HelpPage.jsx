import { FiMail } from "react-icons/fi";
import { TbBrandWhatsapp } from "react-icons/tb";
import SiteNavbar from "../../components/common/SiteNavbar.jsx";
import "../FormationsPage.css";
import "./LegalPage.css";

const FAQ_ITEMS = [
  {
    q: "Comment créer un compte sur TheBridgeFlow ?",
    a: "Cliquez sur « Commencer maintenant » depuis la page d'accueil, renseignez vos informations puis confirmez votre e-mail via le lien reçu.",
  },
  {
    q: "Comment postuler à une offre de stage ?",
    a: "Depuis votre tableau de bord, ouvrez l'offre qui vous intéresse et cliquez sur « Postuler ». Vous pourrez suivre l'état de votre candidature dans « Mes candidatures ».",
  },
  {
    q: "Comment s'inscrire à une formation ?",
    a: "Parcourez le catalogue de formations, choisissez la formule En ligne ou Présentiel, puis suivez les instructions d'inscription depuis votre tableau de bord.",
  },
  {
    q: "Comment contacter l'équipe TheBridgeFlow ?",
    a: "Par e-mail à contact@9antra.tn, par WhatsApp au +216 58 840 064, ou via le formulaire de contact en bas de la page d'accueil.",
  },
];

export default function HelpPage() {
  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge">🆘 Aide</span>
          <h1 className="fp-hero__title">Centre d'aide</h1>
          <p className="fp-hero__subtitle">Les réponses aux questions les plus fréquentes.</p>
        </div>
      </section>

      <div className="help-content">
        <div className="help-faq">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <div className="help-contact">
          <h2>Besoin d'aide supplémentaire ?</h2>
          <p>Notre équipe vous répond rapidement.</p>
          <div className="help-contact__actions">
            <a href="mailto:contact@9antra.tn" className="btn btn-outline">
              <FiMail size={16} /> contact@9antra.tn
            </a>
            <a href="https://wa.me/21658840064" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <TbBrandWhatsapp size={17} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
