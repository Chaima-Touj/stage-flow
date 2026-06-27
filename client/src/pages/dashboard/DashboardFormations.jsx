import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiClock, FiUsers, FiMonitor, FiAlertCircle } from "react-icons/fi";
import {
  FaReact, FaAngular, FaNodeJs, FaDocker,
  FaMobileAlt, FaChartBar, FaShieldAlt, FaRobot, FaCogs,
} from "react-icons/fa";
import { SiSpringboot, SiFlutter } from "react-icons/si";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { formationsService } from "../../services/formations.service.js";
import "./DashboardFormations.css";

const ICON_MAP = {
  react:        { Comp: FaReact,      color: "#61DAFB" },
  angular:      { Comp: FaAngular,    color: "#DD0031" },
  spring:       { Comp: SiSpringboot, color: "#6DB33F" },
  node:         { Comp: FaNodeJs,     color: "#339933" },
  flutter:      { Comp: SiFlutter,    color: "#02569B" },
  bi:           { Comp: FaChartBar,   color: "#F59E0B" },
  intelligence: { Comp: FaRobot,      color: "#8B5CF6" },
  devops:       { Comp: FaDocker,     color: "#2496ED" },
  cyber:        { Comp: FaShieldAlt,  color: "#10B981" },
  marketing:    { Comp: FaCogs,       color: "#6366F1" },
  iot:          { Comp: FaMobileAlt,  color: "#3B82F6" },
};

function getIconEntry(title = "") {
  const lower = title.toLowerCase();
  for (const [key, entry] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return entry;
  }
  return ICON_MAP.react;
}

function SkeletonCard() {
  return (
    <div className="df-card df-card--skel" aria-hidden="true">
      <div className="df-skel df-skel--icon" />
      <div className="df-skel df-skel--title" />
      <div className="df-skel df-skel--desc" />
      <div className="df-skel df-skel--desc df-skel--desc-sm" />
      <div className="df-skel df-skel--chips" />
      <div className="df-skel df-skel--btn" />
    </div>
  );
}

export default function DashboardFormations() {
  const { t } = useTranslation();
  const [formations, setFormations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);

  useEffect(() => {
    let active = true;
    formationsService.getAll()
      .then(({ data }) => { if (active) setFormations(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const countText = formations.length === 1
    ? t("dashboardFormations.countOne")
    : t("dashboardFormations.countMany", { count: formations.length });

  return (
    <DashboardLayout
      title={t("dashboardFormations.title")}
      subtitle={t("dashboardFormations.subtitle")}
    >
      <div className="df-page">

        <div className="df-header">
          <h1 className="df-header__title">{t("dashboardFormations.heading")}</h1>
          <p className="df-header__sub">{loading ? "" : countText}</p>
        </div>

        {error && (
          <div className="df-error">
            <FiAlertCircle size={18} />
            <span>{t("dashboardFormations.error")}</span>
          </div>
        )}

        {loading ? (
          <div className="df-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : formations.length === 0 ? (
          <div className="df-empty">
            <p className="df-empty__sub">{t("dashboardFormations.empty")}</p>
          </div>
        ) : (
          <div className="df-grid">
            {formations.map((f) => {
              const { Comp: IconComp, color } = getIconEntry(f.title);
              return (
                <article key={f._id} className="df-card">

                  <div className="df-card__icon" style={{ background: `${color}18`, color }}>
                    <IconComp size={28} />
                  </div>

                  <h2 className="df-card__title">{f.title}</h2>

                  {f.description && (
                    <p className="df-card__desc">{f.description}</p>
                  )}

                  <div className="df-card__meta">
                    {f.duration && (
                      <span className="df-chip"><FiClock size={12}/>{f.duration}</span>
                    )}
                    {f.level && (
                      <span className="df-chip"><FiUsers size={12}/>{f.level}</span>
                    )}
                    {f.mode && (
                      <span className="df-chip"><FiMonitor size={12}/>{f.mode}</span>
                    )}
                  </div>

                  {(f.price?.onsite || f.price?.online) && (
                    <div className="df-card__prices">
                      {f.price.onsite && (
                        <span className="df-price">
                          <FiUsers size={11}/> {f.price.onsite}
                        </span>
                      )}
                      {f.price.online && (
                        <span className="df-price">
                          <FiMonitor size={11}/> {f.price.online}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/dashboard/student/formations/${f.slug}`}
                    className="df-card__btn"
                  >
                    {t("dashboardFormations.viewDetails")}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
