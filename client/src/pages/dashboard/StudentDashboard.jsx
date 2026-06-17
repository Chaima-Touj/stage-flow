import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FiFileText, FiClock, FiCheckCircle, FiArrowRight, FiMapPin } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { offersService } from "../../services/offers.service.js";

const COLORS = ["#F59E0B", "#2563EB", "#8B5CF6", "#10B981", "#EF4444"];

// Normalise les deux formats d'offres (ancien et nouveau schéma)
const normalizeOffer = (o) => ({
  ...o,
  companyName: o.companyName || o.company || "Entreprise",
  description: o.description || o.desc || "",
  skills:      (o.skills?.length ? o.skills : o.motsCles) || [],
  location:    o.location || "",
});

export default function StudentDashboard() {
  const { user } = useAuth();
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    offersService.getAll().then(({ data }) => {
      setOffers(data.offers.slice(0, 3).map(normalizeOffer));
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Candidatures envoyées", value: 12, icon: <FiFileText/>, color: "#2563EB" },
    { label: "En attente",            value: 5,  icon: <FiClock/>,    color: "#F59E0B" },
    { label: "Entretiens",            value: 3,  icon: <FiClock/>,    color: "#8B5CF6" },
    { label: "Offres acceptées",      value: 2,  icon: <FiCheckCircle/>, color: "#10B981" },
  ];

  const pieData = [
    { name: "En attente",  value: 5 },
    { name: "En revue",    value: 3 },
    { name: "Entretiens",  value: 2 },
    { name: "Acceptées",   value: 1 },
    { name: "Refusées",    value: 1 },
  ];

  return (
    <DashboardLayout title={`Bonjour, ${user?.name?.split(" ")[0]} 👋`} subtitle="Voici un aperçu de votre activité">
      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="card stat-box">
            <div className="stat-box-icon" style={{ background: s.color + "15", color: s.color }}>{s.icon}</div>
            <div>
              <span className="stat-box-value">{s.value}</span>
              <span className="stat-box-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card section-card">
        <div className="section-card-header">
          <h2>Offres recommandées pour vous</h2>
          <Link to="/dashboard/student/offers" className="link-more">Voir toutes <FiArrowRight size={14}/></Link>
        </div>
        <div className="offers-grid">
          {loading ? <p>Chargement...</p> : offers.map((o) => (
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
                {o.skills.length === 0 && <span className="badge badge-primary">Stage</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="card">
          <h2 className="card-title">Suivi de mes candidatures</h2>
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
        </div>

        <div className="card">
          <h2 className="card-title">Prochains entretiens</h2>
          <div className="interview-list">
            <div className="interview-item">
              <div className="interview-icon">📅</div>
              <div>
                <h4>Entretien technique - TechNova</h4>
                <span>Mercredi 22 Mai 2026 - 10:00</span>
              </div>
              <span className="badge badge-primary">À venir</span>
            </div>
            <div className="interview-item">
              <div className="interview-icon">📅</div>
              <div>
                <h4>Entretien RH - DataVision</h4>
                <span>Vendredi 24 Mai 2026 - 14:00</span>
              </div>
              <span className="badge badge-primary">À venir</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
