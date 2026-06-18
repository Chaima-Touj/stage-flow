import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiCalendar, FiFileText } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import api from "../../services/api.js";
import "./Applications.css";

export default function MyApplications() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [statusFilter,  setStatusFilter]  = useState("");

  useEffect(() => {
    api.get("/applications")
      .then(({ data }) => setApplications(data.applications))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter
    ? applications.filter((a) => a.status === statusFilter)
    : applications;

  const statuses = ["", "en attente", "en cours", "acceptée", "refusée"];

  return (
    <DashboardLayout
      title={t("sidebar.student.applications")}
      subtitle={`${applications.length} candidature${applications.length !== 1 ? "s" : ""}`}
    >
      <div className="apps-filters card">
        {statuses.map((s) => (
          <button key={s}
            className={`filter-chip ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}>
            {s ? t(`status.${s}`) : t("offers.all")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="offers-loading">{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="apps-empty card">
          <FiFileText size={32} color="var(--text-muted)"/>
          <p>{t("dashboard.student.noApplications")}</p>
        </div>
      ) : (
        <div className="apps-list">
          {filtered.map((a) => (
            <div key={a._id} className="card apps-item">
              <div className="apps-item-logo">
                {a.offerId?.companyName?.[0]?.toUpperCase() || "?"}
              </div>

              <div className="apps-item-info">
                <h3>{a.offerId?.title || "Offre supprimée"}</h3>
                <span className="apps-item-company">{a.offerId?.companyName}</span>
                <div className="apps-item-meta">
                  {a.offerId?.location && (
                    <span><FiMapPin size={12}/> {a.offerId.location}</span>
                  )}
                  <span><FiCalendar size={12}/> {new Date(a.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <span className={`badge ${
                a.status === "acceptée" ? "badge-success" :
                a.status === "refusée"  ? "badge-danger"  :
                a.status === "en cours" ? "badge-purple"  : "badge-warning"
              }`}>
                {t(`status.${a.status}`)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
