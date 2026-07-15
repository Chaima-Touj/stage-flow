import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiTrendingUp, FiBookOpen, FiPercent, FiClipboard } from "react-icons/fi";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { adminService } from "../../services/admin.service.js";
import "./StudentDashboard.css";

const COLORS = ["#2563EB", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#0EA5E9"];
const STATUS_COLORS = { en_attente: "#F59E0B", "acceptée": "#10B981", "refusée": "#EF4444" };

export default function AdminStatistics() {
  const { t } = useTranslation();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let active = true;
    adminService.getAdvancedStats()
      .then(({ data }) => { if (active) setStats(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const pipelineByMonth      = stats?.pipelineByMonth || [];
  const enrollmentsByFormation = stats?.enrollmentsByFormation || [];
  const requestsByStatus     = stats?.requestsByStatus || { en_attente: 0, "acceptée": 0, "refusée": 0 };
  const statusData = Object.entries(requestsByStatus).map(([status, count]) => ({ status, count }));
  const totalStatus = statusData.reduce((sum, d) => sum + d.count, 0);

  const statCards = [
    { label: t("adminStats.statConversionRate"), value: loading ? "—" : `${stats?.conversionRate ?? 0}%`, color: "#10B981", icon: <FiPercent size={20} /> },
    { label: t("adminStats.statTotalRequests"),   value: loading ? "—" : (stats?.totalRequests ?? 0),     color: "#F59E0B", icon: <FiClipboard size={20} /> },
    { label: t("adminStats.statTopFormation"),    value: loading ? "—" : (enrollmentsByFormation[0]?.title || "—"), color: "#2563EB", icon: <FiBookOpen size={20} /> },
  ];

  return (
    <DashboardLayout title={t("sidebar.admin.stats")} subtitle={t("adminStats.pageSubtitle")}>
      <div className="sd-root">

        {/* ── Indicateurs clés ─────────────────────────────────────────── */}
        <div className="sd-stats">
          {statCards.map((s, i) => (
            <div key={i} className="sd-stat-card">
              <div className="sd-stat-top">
                <div className="sd-stat-icon" style={{ background: s.color + "18", color: s.color }}>
                  {s.icon}
                </div>
                <div className="sd-stat-dot" style={{ background: s.color }} />
              </div>
              <div className="sd-stat-value" style={{ fontSize: typeof s.value === "string" && s.value.length > 12 ? "1rem" : undefined }}>
                {s.value}
              </div>
              <div className="sd-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Graphiques ───────────────────────────────────────────────── */}
        <div className="sd-split-grid">

          {/* Demandes vs Inscriptions dans le temps */}
          <div className="sd-card">
            <h2 className="sd-card-title" style={{ marginBottom: "1.25rem" }}>
              {t("adminStats.pipelineChartTitle")}
            </h2>
            {loading ? (
              <div className="sd-skeleton" style={{ height: 220 }} />
            ) : error ? (
              <div className="sd-empty-box"><p>{t("adminStats.errorStats")}</p></div>
            ) : pipelineByMonth.length === 0 ? (
              <div className="sd-empty-box">
                <FiTrendingUp size={28} style={{ opacity: .3 }} />
                <p>{t("adminStats.noData")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={pipelineByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="requests"    name={t("adminStats.legendRequests")}    stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="enrollments" name={t("adminStats.legendEnrollments")} stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Statut des demandes */}
          <div className="sd-card">
            <h2 className="sd-card-title" style={{ marginBottom: "1.25rem" }}>
              {t("adminStats.statusChartTitle")}
            </h2>
            {loading ? (
              <div className="sd-skeleton" style={{ height: 220 }} />
            ) : error ? (
              <div className="sd-empty-box"><p>{t("adminStats.errorStats")}</p></div>
            ) : totalStatus === 0 ? (
              <div className="sd-empty-box">
                <FiClipboard size={28} style={{ opacity: .3 }} />
                <p>{t("adminStats.noData")}</p>
              </div>
            ) : (
              <div className="sd-pie-row">
                <ResponsiveContainer width="48%" height={190}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                    >
                      {statusData.map((d, i) => (
                        <Cell key={i} fill={STATUS_COLORS[d.status] || COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="sd-pie-legend">
                  {statusData.map((d, i) => (
                    <div key={i} className="sd-pie-item">
                      <span className="sd-pie-dot" style={{ background: STATUS_COLORS[d.status] || COLORS[i % COLORS.length] }} />
                      <span className="sd-pie-name">{t(`mesDemandes.status${d.status === "en_attente" ? "Pending" : d.status === "acceptée" ? "Accepted" : "Rejected"}`)}</span>
                      <strong>{d.count}</strong>
                      <span className="sd-pie-pct" style={{ color: STATUS_COLORS[d.status] || COLORS[i % COLORS.length] }}>
                        ({totalStatus > 0 ? Math.round((d.count / totalStatus) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── Répartition des inscriptions par formation ──────────────────── */}
        <div className="sd-card" style={{ marginTop: "1.5rem" }}>
          <h2 className="sd-card-title" style={{ marginBottom: "1.25rem" }}>
            {t("adminStats.byFormationChartTitle")}
          </h2>
          {loading ? (
            <div className="sd-skeleton" style={{ height: 260 }} />
          ) : error ? (
            <div className="sd-empty-box"><p>{t("adminStats.errorStats")}</p></div>
          ) : enrollmentsByFormation.length === 0 ? (
            <div className="sd-empty-box">
              <FiBookOpen size={28} style={{ opacity: .3 }} />
              <p>{t("adminStats.noData")}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(200, enrollmentsByFormation.length * 42)}>
              <BarChart data={enrollmentsByFormation} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="title" tick={{ fontSize: 12 }} width={220} />
                <Tooltip />
                <Bar dataKey="count" name={t("sidebar.admin.inscriptions")} fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
