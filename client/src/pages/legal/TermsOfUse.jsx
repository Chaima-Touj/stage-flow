import { FiTool } from "react-icons/fi";
import SiteNavbar from "../../components/common/SiteNavbar.jsx";
import "../FormationsPage.css";
import "./LegalPage.css";

export default function TermsOfUse() {
  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge"><FiTool size={14} /> Légal</span>
          <h1 className="fp-hero__title">Conditions générales d'utilisation</h1>
        </div>
      </section>

      <div className="legal-content">
        <p className="legal-content__intro">
          Veuillez lire attentivement ces Conditions Générales. Votre accès et votre utilisation du Service sont
          conditionnés par votre acceptation et votre respect de ces Conditions. Ces Conditions s'appliquent à tous
          les visiteurs, utilisateurs et autres personnes qui accèdent ou utilisent le Service.
        </p>
        <p>
          En accédant ou en utilisant le Service, vous acceptez d'être lié par ces Conditions. Si vous n'êtes pas
          d'accord avec une partie quelconque de ces termes, vous ne devez pas accéder au Service.
        </p>

        <h2>Comptes</h2>
        <p>
          Lorsque vous créez un compte chez nous, vous devez fournir des informations exactes, complètes et à jour
          à tout moment. Le non-respect de cette obligation constitue une violation des Conditions, ce qui peut
          entraîner la résiliation immédiate de votre compte sur notre Service.
        </p>
        <p>
          Vous êtes responsable de la sécurité du mot de passe que vous utilisez pour accéder au Service et de
          toute activité ou action effectuée avec votre mot de passe, que ce soit sur notre Service ou un service
          tiers.
        </p>
        <p>
          Vous acceptez de ne pas divulguer votre mot de passe à un tiers. Vous devez nous informer immédiatement
          dès que vous prenez connaissance d'une violation de la sécurité ou d'une utilisation non autorisée de
          votre compte.
        </p>

        <h2>Liens vers d'autres sites web</h2>
        <p>
          Notre Service peut contenir des liens vers des sites web ou des services tiers qui ne sont pas détenus
          ou contrôlés par TheBridgeFlow.
        </p>
        <p>
          TheBridgeFlow n'a aucun contrôle sur, et n'assume aucune responsabilité quant au contenu, aux politiques
          de confidentialité ou aux pratiques de tout site web ou service tiers. Vous reconnaissez et acceptez
          également que TheBridgeFlow ne sera pas responsable, directement ou indirectement, de tout dommage ou
          perte causé ou supposé être causé par ou en relation avec l'utilisation ou la dépendance à tout contenu,
          bien ou service disponible sur ou via ces sites web ou services.
        </p>
        <p>
          Nous vous conseillons fortement de lire les conditions générales et les politiques de confidentialité de
          tout site web ou service tiers que vous visitez.
        </p>

        <h2>Résiliation</h2>
        <p>
          Nous pouvons suspendre ou résilier l'accès à notre Service immédiatement, sans préavis ni responsabilité,
          pour quelque raison que ce soit, y compris, sans s'y limiter, si vous violez les Conditions.
        </p>
        <p>
          Toutes les dispositions des Conditions qui, par leur nature, devraient survivre à la résiliation,
          survivront à la résiliation, y compris, sans s'y limiter, les dispositions relatives à la propriété, les
          exclusions de garantie, les indemnisations et les limitations de responsabilité.
        </p>
        <p>
          Nous pouvons suspendre ou résilier votre compte immédiatement, sans préavis ni responsabilité, pour
          quelque raison que ce soit, y compris, sans s'y limiter, si vous violez les Conditions.
        </p>
        <p>
          Après la résiliation, votre droit d'utiliser le Service cessera immédiatement. Si vous souhaitez résilier
          votre compte, vous pouvez simplement cesser d'utiliser le Service.
        </p>

        <p className="legal-content__updated">Dernière mise à jour : 2026.</p>
      </div>
    </div>
  );
}
