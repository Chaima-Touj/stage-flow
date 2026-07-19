import { FiTool } from "react-icons/fi";
import SiteNavbar from "../../components/common/SiteNavbar.jsx";
import "../FormationsPage.css";
import "./LegalPage.css";

export default function PrivacyPolicy() {
  return (
    <div className="fp-page">
      <SiteNavbar />
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-hero__badge"><FiTool size={14} /> Légal</span>
          <h1 className="fp-hero__title">Politique de confidentialité</h1>
        </div>
      </section>

      <div className="legal-content">
        <p className="legal-content__intro">
          Bienvenue sur TheBridgeFlow ! Nous accordons une grande importance à votre vie privée et nous engageons à
          protéger vos informations personnelles. Cette politique de confidentialité décrit comment nous collectons,
          utilisons et protégeons vos données lorsque vous visitez notre site web.
        </p>

        <h2>Informations que nous collectons</h2>

        <h3>Informations personnelles</h3>
        <p>
          Lorsque vous vous inscrivez sur notre site, souscrivez à notre newsletter ou remplissez un formulaire, nous
          pouvons collecter des informations personnelles telles que votre nom, votre adresse e-mail, votre numéro
          de téléphone et d'autres détails que vous fournissez.
        </p>

        <h3>Informations non personnelles</h3>
        <p>
          Nous pouvons collecter des informations non personnelles sur les visiteurs lorsqu'ils interagissent avec
          notre site. Cela peut inclure le nom du navigateur, le type d'ordinateur et des informations techniques
          sur les moyens de connexion utilisés pour accéder à notre site, comme le système d'exploitation et les
          fournisseurs d'accès Internet.
        </p>

        <h3>Cookies et technologies de suivi</h3>
        <p>
          Notre site peut utiliser des « cookies » pour améliorer l'expérience utilisateur. Les navigateurs web des
          utilisateurs placent des cookies sur leur disque dur pour des besoins d'enregistrement et parfois pour
          suivre des informations les concernant. Les utilisateurs peuvent choisir de configurer leur navigateur
          pour refuser les cookies ou les alerter lorsqu'un cookie est envoyé. Notez que certaines parties du site
          peuvent ne pas fonctionner correctement en cas de désactivation des cookies.
        </p>

        <h2>Comment nous utilisons les informations collectées</h2>
        <p>TheBridgeFlow peut collecter et utiliser les informations personnelles des utilisateurs aux fins suivantes :</p>
        <ul>
          <li><strong>Améliorer le service client :</strong> les informations que vous fournissez nous aident à répondre plus efficacement à vos demandes de support et à vos besoins.</li>
          <li><strong>Personnaliser l'expérience utilisateur :</strong> nous pouvons utiliser des informations agrégées pour comprendre comment nos utilisateurs, en tant que groupe, utilisent les services et ressources fournis sur notre site.</li>
          <li><strong>Améliorer notre site :</strong> nous pouvons utiliser les retours que vous fournissez pour améliorer nos produits et services.</li>
          <li><strong>Traiter les paiements :</strong> nous pouvons utiliser les informations fournies par les utilisateurs au moment de passer une commande uniquement pour fournir le service lié à cette commande. Nous ne partageons ces informations avec des tiers que dans la mesure nécessaire à la fourniture du service.</li>
          <li><strong>Envoyer des e-mails périodiques :</strong> nous pouvons utiliser l'adresse e-mail pour envoyer aux utilisateurs des informations et des mises à jour concernant leur commande. Elle peut également être utilisée pour répondre à leurs questions et/ou autres demandes.</li>
        </ul>

        <h2>Comment nous protégeons vos informations</h2>
        <p>
          Nous adoptons des pratiques de collecte, de stockage et de traitement des données appropriées, ainsi que
          des mesures de sécurité pour protéger contre tout accès non autorisé, altération, divulgation ou
          destruction de vos informations personnelles, nom d'utilisateur, mot de passe, informations de
          transaction et données stockées sur notre site.
        </p>

        <p className="legal-content__updated">Dernière mise à jour : 2026.</p>
      </div>
    </div>
  );
}
