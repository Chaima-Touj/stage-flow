import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiCalendar, FiClock, FiMapPin, FiVideo, FiCheck, FiX } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { interviewsService } from "../../services/interviews.service.js";
import "./Interviews.css";

const statusBadge = {
  "proposé":  "badge-warning",
  "confirmé": "badge-success",
  "annulé":   "badge-danger",
  "terminé":  "badge-primary",
};

export default function Interviews() {
  const { t } = useTranslation();
  const [interviews, setInterviews] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const load = () => {
    interviewsService.getAll()
      .then(({ data }) => setInterviews(data.interviews))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    await interviewsService.updateStatus(id, "confirmé");
    load();
  };

  const handleCancel = async (id) => {
    await interviewsService.updateStatus(id, "annulé");
    load();
  };

  return (
    <DashboardLayout
      title={t("sidebar.student.interviews")}
      subtitle={`${interviews.length} entretien${interviews.length !== 1 ? "s" : ""}`}
    >
      {loading ? (
        <div className="offers-loading">{t("common.loading")}</div>
      ) : interviews.length === 0 ? (
        <div className="apps-empty card">
          <FiCalendar size={32} color="var(--text-muted)"/>
          <p>Aucun entretien planifié pour le moment.</p>
        </div>
      ) : (
        <div className="interviews-list">
          {interviews.map((iv) => (
            <div key={iv._id} className="card interview-card">
              <div className="interview-card-icon">
                {iv.mode === "en ligne" ? <FiVideo/> : <FiMapPin/>}
              </div>

              <div className="interview-card-info">
                <h3>{iv.applicationId?.offerId?.title || "Offre"}</h3>
                <span className="interview-card-company">
                  {iv.applicationId?.offerId?.companyName}
                </span>
                <div className="interview-card-meta">
                  <span><FiCalendar size={12}/> {new Date(iv.scheduledAt).toLocaleDateString()}</span>
                  <span><FiClock size={12}/> {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                {iv.location && (
                  <a href={iv.location} target="_blank" rel="noreferrer" className="interview-card-link">
                    {iv.mode === "en ligne" ? "Rejoindre le lien" : iv.location}
                  </a>
                )}
              </div>

              <div className="interview-card-actions">
                <span className={`badge ${statusBadge[iv.status]}`}>{iv.status}</span>
                {iv.status === "proposé" && (
                  <div className="interview-card-buttons">
                    <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(iv._id)}>
                      <FiCheck size={13}/> Confirmer
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(iv._id)}>
                      <FiX size={13}/> Refuser
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
