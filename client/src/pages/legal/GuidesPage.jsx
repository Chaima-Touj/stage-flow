import { FiUserPlus, FiSend, FiClipboard, FiCalendar, FiBookOpen } from "react-icons/fi";
import SiteNavbar from "../../components/common/SiteNavbar.jsx";
import "../FormationsPage.css";
import "./LegalPage.css";

const GUIDES = [
  {
    icon: FiUserPlus,
    title: "Créer son compte étudiant",
    steps: [
      "Cliquez sur « Commencer maintenant » depuis la page d'accueil",
      "Renseignez vos informations (nom, e-mail, mot de passe)",
      "Confirmez votre adresse e-mail via le lien reçu",
      "Complétez votre profil depuis votre tableau de bord",
    ],
  },
  {
    icon: FiSend,
    title: "Postuler à une offre de stage",
    steps: [
      "Parcourez les offres disponibles depuis votre tableau de bord",
      "Ouvrez le détail de l'offre qui vous intéresse",
      "Cliquez sur « Postuler » et complétez votre candidature",
      "Suivez la confirmation d'envoi dans vos notifications",
    ],
  },
  {
    icon: FiClipboard,
    title: "Suivre l'état de sa candidature",
    steps: [
      "Rendez-vous dans la section « Mes candidatures »",
      "Consultez le statut mis à jour en temps réel",
      "Recevez une notification à chaque changement de statut",
    ],
  },
  {
    icon: FiCalendar,
    title: "Planifier un entretien",
    steps: [
      "Une fois votre candidature acceptée, un entretien vous est proposé",
      "Confirmez le créneau proposé depuis « Mes entretiens »",
      "Rejoignez la visio directement depuis la plateforme le jour J",
    ],
  },
  {
    icon: FiBookOpen,
    title: "Suivre sa progression de formation",
    steps: [
      "Accédez à votre formation depuis « Mes formations »",
      "Cochez chaque semaine complétée pour mettre à jour votre progression",
      "Consultez votre avancement global depuis le tableau de bord",
    ],
  },
];

export default function GuidesPage() {
  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge">📘 Guides</span>
          <h1 className="fp-hero__title">Guides & tutoriels</h1>
          <p className="fp-hero__subtitle">
            Des explications courtes et pratiques pour tirer le meilleur parti de TheBridgeFlow.
          </p>
        </div>
      </section>

      <div className="guides-grid">
        {GUIDES.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="guide-card">
              <div className="guide-card__icon"><Icon size={20} /></div>
              <h3 className="guide-card__title">{g.title}</h3>
              <ol className="guide-card__steps">
                {g.steps.map((s, i) => (
                  <li key={i}>
                    <span className="guide-card__step-num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </div>
  );
}
