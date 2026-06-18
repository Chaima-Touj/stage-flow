import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiFileText, FiClock, FiCheckCircle, FiArrowRight, FiMapPin } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { offersService } from "../../services/offers.service.js";
import api from "../../services/api.js";

const COLORS = ["#F59E0B", "#2563EB", "#8B5CF6", "#10B981", "#EF4444"];

const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  description: o.description || o.desc || "",
  skills:      (o.skills?.length ? o.skills : o.motsCles) || [],
  location:    o.location || "",
});

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [offers,       setOffers]       = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading,       setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      offersService.getAll(),
      api.get("/applications"),
    ]).then(([offersRes, appsRes]) => {
      setOffers(offersRes.data.offers.slice(0, 3).map(normalizeOffer));
      setApplications(appsRes.data.applications);
    }).finally(() => setLoading(false));
  }, []);

  const counts = {
    total:      applications.length,
    enAttente:  applications.filter((a) => a.status === "en attente").length,
    enCours:    applications.filter((a) => a.status === "en cours").length,
    acceptee:   applications.filter((a) => a.status === "acceptée").length,
    refusee:    applications.filter((a) => a.status === "refusée").length,
  };

  const stats = [
    { label: t("dashboard.student.statsApplications"), value: counts.total,     icon: <FiFileText/>,    color: "#2563EB" },
    { label: t("dashboard.student.statsPending"),       value: counts.enAttente, icon: <FiClock/>,       color: "#F59E0B" },
    { label: t("dashboard.student.statsInProgress"),    value: counts.enCours,   icon: <FiClock/>,       color: "#8B5CF6" },
    { label: t("dashboard.student.statsAccepted"),      value: counts.acceptee,  icon: <FiCheckCircle/>, color: "#10B981" },
  ];

  const pieData = [
    { name: t("status.en attente"), value: counts.enAttente },
    { name: t("status.en cours"),   value: counts.enCours },
    { name: t("status.acceptée"),   value: counts.acceptee },
    { name: t("status.refusée"),    value: counts.refusee },
  ].filter((d) => d.value > 0);

  return (
    <DashboardLayout
      title={t("dashboard.student.greeting", { name: user?.name?.split(" ")[0] })}
      subtitle={t("dashboard.student.subtitle")}
    >
      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="card stat-box">
            <div className="stat-box-icon" style={{ background: s.color + "15", color: s.color }}>{s.icon}</div>
            <div>
              <span className="stat-box-value">{loading ? "…" : s.value}</span>
              <span className="stat-box-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card section-card">
        <div className="section-card-header">
          <h2>{t("dashboard.student.recommendedOffers")}</h2>
          <Link to="/dashboard/student/offers" className="link-more">
            {t("dashboard.student.viewAll")} <FiArrowRight size={14}/>
          </Link>
        </div>
        <div className="offers-grid">
          {loading ? <p>{t("common.loading")}</p> : offers.map((o) => (
            <div key={o._id} className="offer-mini-card">
              <div className="offer-mini-header">
                <div className="offer-mini-logo">{o.companyName?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <h4>{o.title}</h4>
                  <span>{o.companyName}</span>
                </div>
              </div>
              {o.location && <span className="offer-mini-location"><FiMapPin size={12}/> {o.location}</span>}
              <div className="offer-mini-skills">
                {o.skills.slice(0, 3).map((s) => <span key={s} className="badge badge-primary">{s}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="card">
          <h2 className="card-title">{t("dashboard.student.applicationTracking")}</h2>
          {pieData.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              {t("dashboard.student.noApplications")}
            </p>
          ) : (
            <div className="pie-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map((d, i) => (
                  <div key={d.name} className="pie-legend-item">
                    <span className="pie-dot" style={{ background: COLORS[i] }}/>
                    {d.name} <strong>{d.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">{t("dashboard.student.recentApplications")}</h2>
          <div className="interview-list">
            {applications.slice(0, 3).map((a) => (
              <div key={a._id} className="interview-item">
                <div className="interview-icon">📄</div>
                <div>
                  <h4>{a.offerId?.title || "Offre"}</h4>
                  <span>{a.offerId?.companyName || ""}</span>
                </div>
                <span className={`badge ${
                  a.status === "acceptée" ? "badge-success" :
                  a.status === "refusée"  ? "badge-danger"  : "badge-primary"
                }`}>{t(`status.${a.status}`)}</span>
              </div>
            ))}
            {applications.length === 0 && !loading && (
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                {t("dashboard.student.noApplications")}
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
