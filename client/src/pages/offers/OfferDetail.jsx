import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiMapPin, FiClock, FiBriefcase, FiArrowLeft, FiCheck } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { offersService } from "../../services/offers.service.js";
import "./Offers.css";

const normalizeOffer = (o) => ({
  ...o,
  companyName:  o.companyName || o.company || "Entreprise",
  description:  o.description || o.desc || "",
  skills:       (o.skills?.length ? o.skills : o.motsCles) || [],
  requirements: o.requirements || "",
  type:         o.type || "Stage",
});

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer,   setOffer]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offersService.getOne(id)
      .then(({ data }) => setOffer(normalizeOffer(data.offer)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout title="Chargement..."><p>Chargement...</p></DashboardLayout>;
  if (!offer)  return <DashboardLayout title="Offre introuvable"><p>Cette offre n'existe pas.</p></DashboardLayout>;

  return (
    <DashboardLayout title={offer.title} subtitle={offer.companyName}>
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        <FiArrowLeft/> Retour aux offres
      </button>

      <div className="offer-detail-grid">
        <div className="card offer-detail-main">
          <div className="offer-detail-header">
            <div className="offer-card-logo offer-detail-logo">{offer.companyName?.[0]?.toUpperCase()}</div>
            <div>
              <h2>{offer.title}</h2>
              <span className="offer-detail-company">{offer.companyName}</span>
            </div>
          </div>

          <div className="offer-detail-tags">
            <span className="badge badge-purple"><FiBriefcase size={12}/> {offer.type}</span>
            {offer.location && <span className="badge badge-primary"><FiMapPin size={12}/> {offer.location}</span>}
            {offer.duration && <span className="badge badge-warning"><FiClock size={12}/> {offer.duration}</span>}
          </div>

          <h3 className="offer-detail-subtitle">Description du poste</h3>
          <p className="offer-detail-text">{offer.description}</p>

          {offer.requirements && (
            <>
              <h3 className="offer-detail-subtitle">Compétences requises</h3>
              <p className="offer-detail-text">{offer.requirements}</p>
            </>
          )}

          {offer.skills.length > 0 && (
            <div className="offer-detail-skills">
              {offer.skills.map((s) => (
                <span key={s} className="badge badge-primary"><FiCheck size={11}/> {s}</span>
              ))}
            </div>
          )}
        </div>

        <div className="card offer-detail-side">
          <h3 className="card-title">Postuler à cette offre</h3>
          <p className="offer-side-text">Envoyez votre candidature en quelques clics.</p>
          <Link to={`/dashboard/student/offers/${offer._id}/apply`} className="btn btn-primary btn-block">
            Postuler maintenant
          </Link>

          <div className="offer-side-divider"/>

          <div className="offer-side-info">
            <span>Entreprise</span>
            <strong>{offer.companyName}</strong>
          </div>
          <div className="offer-side-info">
            <span>Type</span>
            <strong>{offer.type}</strong>
          </div>
          {offer.duration && (
            <div className="offer-side-info">
              <span>Durée</span>
              <strong>{offer.duration}</strong>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
