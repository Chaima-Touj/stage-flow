import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiMoon, FiSun, FiClock, FiMonitor, FiUsers } from "react-icons/fi";
import {
  FaReact, FaAngular, FaNodeJs, FaDocker,
  FaMobileAlt, FaChartBar, FaShieldAlt, FaRobot, FaCogs,
} from "react-icons/fa";
import { SiSpringboot, SiFlutter } from "react-icons/si";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LangFlags from "../components/common/LangFlags.jsx";
import api from "../services/api.js";
import "./FormationsPage.css";

// ─── Nav items (keys resolved by i18n) ───────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",         type: "route",       to: "/" },
  { key: "offers",       type: "route",       to: "/offers" },
  { key: "formations",   type: "route",       to: "/formations" },
  { key: "about",        type: "home-anchor", scrollTo: "about" },
  { key: "testimonials", type: "home-anchor", scrollTo: "testimonials" },
  { key: "contact",      type: "home-anchor", scrollTo: "contact" },
];

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  react:        { Comp: FaReact,     color: "#61DAFB" },
  angular:      { Comp: FaAngular,   color: "#DD0031" },
  spring:       { Comp: SiSpringboot,color: "#6DB33F" },
  node:         { Comp: FaNodeJs,    color: "#339933" },
  flutter:      { Comp: SiFlutter,   color: "#02569B" },
  bi:           { Comp: FaChartBar,  color: "#F59E0B" },
  intelligence: { Comp: FaRobot,     color: "#8B5CF6" },
  devops:       { Comp: FaDocker,    color: "#2496ED" },
  cyber:        { Comp: FaShieldAlt, color: "#10B981" },
  marketing:    { Comp: FaCogs,      color: "#6366F1" },
  iot:          { Comp: FaMobileAlt, color: "#3B82F6" },
};

const getIconEntry = (title = "") => {
  const lower = title.toLowerCase();
  for (const [key, entry] of Object.entries(ICON_MAP)) {
    if (lower.includes(key)) return entry;
  }
  return ICON_MAP.react;
};

// ─── Subtle entry animation only ─────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

// ─────────────────────────────────────────────────────────────────────────────
const FormationsPage = () => {
  const { t }            = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [formations, setFormations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/formations")
      .then(res => { if (active) setFormations(res.data); })
      .catch(err => console.error("Erreur chargement formations", err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleEnroll = (formationId) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname, formationId } });
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="fp-page">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-nav__inner">
          {/* Logo */}
          <Link to="/" className="lp-nav__logo">
            <span className="lp-nav__logo-icon">S</span>
            <span>Stage<span className="lp-accent">Flow</span></span>
          </Link>

          {/* Links — desktop */}
          <ul className="lp-nav__links">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                {item.type === "route" ? (
                  <Link
                    to={item.to}
                    className={`lp-nav__link${item.key === "formations" ? " lp-nav__link--active" : ""}`}
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                ) : (
                  <button
                    className="lp-nav__link lp-nav__link--btn"
                    onClick={() => { navigate("/", { state: { scrollTo: item.scrollTo } }); setMenuOpen(false); }}
                  >
                    {t(`nav.${item.key}`)}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="lp-nav__actions">
            {/* Language selector */}
            <LangFlags/>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="lp-theme-btn" aria-label="toggle theme">
              {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>

            <Link to="/login"    className="btn btn-ghost lp-btn-sm">{t("nav.signIn")}</Link>
            <Link to="/register" className="btn btn-primary lp-btn-sm">{t("nav.signUp")}</Link>

            {/* Mobile hamburger */}
            <button
              className="fp-hamburger"
              aria-label="menu"
              onClick={() => setMenuOpen(v => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="fp-mobile-menu">
            {NAV_ITEMS.map(item => (
              item.type === "route" ? (
                <Link key={item.key} to={item.to} className="fp-mobile-link" onClick={() => setMenuOpen(false)}>
                  {t(`nav.${item.key}`)}
                </Link>
              ) : (
                <button
                  key={item.key}
                  className="fp-mobile-link lp-nav__link--btn"
                  style={{ textAlign: "start" }}
                  onClick={() => { navigate("/", { state: { scrollTo: item.scrollTo } }); setMenuOpen(false); }}
                >
                  {t(`nav.${item.key}`)}
                </button>
              )
            ))}
            <div className="fp-mobile-actions">
              <Link to="/login"    className="btn btn-ghost lp-btn-sm"  onClick={() => setMenuOpen(false)}>{t("nav.signIn")}</Link>
              <Link to="/register" className="btn btn-primary lp-btn-sm" onClick={() => setMenuOpen(false)}>{t("nav.signUp")}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <motion.div
            className="fp-hero__content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="fp-hero__badge">
              {t("nav.formations")}
            </span>
            <h1 className="fp-hero__title">{t("formations.pageTitle")}</h1>
            <p className="fp-hero__subtitle">{t("formations.subtitle")}</p>
            <p className="fp-hero__tagline">{t("formations.tagline")}</p>
          </motion.div>
        </div>
      </section>

      {/* ─── GRID ────────────────────────────────────────────────────────────── */}
      <main className="fp-main">
        {loading ? (
          <div className="fp-loader">
            <div className="fp-spinner" />
            <p>{t("formations.loading")}</p>
          </div>
        ) : formations.length === 0 ? (
          <p className="fp-empty">{t("formations.empty")}</p>
        ) : (
          <motion.div
            className="fp-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {formations.map((f, index) => {
              const { Comp: IconComp, color } = getIconEntry(f.title);
              return (
                <motion.article
                  key={f._id}
                  custom={index}
                  variants={cardVariants}
                  className="fp-card"
                >
                  {/* Icon */}
                  <div
                    className="fp-card__icon"
                    style={{ background: `${color}18`, color }}
                  >
                    <IconComp size={26} />
                  </div>

                  {/* Title */}
                  <h2 className="fp-card__title">{f.title}</h2>

                  {/* Description */}
                  <p className="fp-card__desc">
                    {f.description || t("formations.subtitle")}
                  </p>

                  {/* Meta chips */}
                  <div className="fp-card__meta">
                    <span className="fp-chip">
                      <FiClock size={12} />
                      {f.duration}
                    </span>
                    <span className="fp-chip">
                      <FiUsers size={12} />
                      {t("formations.onsite")} {f.price.onsite}
                    </span>
                    <span className="fp-chip">
                      <FiMonitor size={12} />
                      {t("formations.online")} {f.price.online}
                    </span>
                  </div>

                  {/* Curriculum accordion */}
                  {f.weeks?.length > 0 && (
                    <details className="fp-details">
                      <summary>{t("formations.viewProgram")}</summary>
                      <ul className="fp-weeks">
                        {f.weeks.map((w, idx) => (
                          <li key={idx}>
                            <span className="fp-week-badge">
                              {t("formations.week")} {w.week}
                            </span>
                            <span className="fp-week-text">{w.content}</span>
                          </li>
                        ))}
                      </ul>
                      {f.supervision && (
                        <p className="fp-supervision">
                          <strong>{t("formations.supervision")} :</strong> {f.supervision}
                        </p>
                      )}
                    </details>
                  )}

                  {/* Actions */}
                  <div className="fp-card__actions">
                    <Link to={`/formations/${f.slug}`} className="fp-card__details">
                      {t("formations.viewDetails")}
                    </Link>
                    <button
                      className="fp-card__cta"
                      onClick={() => handleEnroll(f._id)}
                    >
                      {user ? t("formations.enroll") : t("formations.loginToEnroll")}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default FormationsPage;
