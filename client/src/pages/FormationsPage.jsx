import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiMoon, FiSun, FiClock, FiMonitor, FiUsers, FiCpu, FiLock, FiTrendingUp } from "react-icons/fi";
import { FaChartBar, FaRobot } from "react-icons/fa";
import { SiFlutter, SiSpringboot, SiAngular, SiReact, SiNodedotjs, SiDocker, SiKubernetes } from "react-icons/si";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LangFlags from "../components/common/LangFlags.jsx";
import Loader from "../components/common/Loader.jsx";
import { useAdaptiveNav } from "../hooks/useAdaptiveNav.js";
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

// ─── Icon map (keyed by slug for exact matching) ──────────────────────────────
const ICON_MAP = {
  "fullstack-spring-angular": [
    { Comp: SiSpringboot, color: "#6DB33F" },
    { Comp: SiAngular,    color: "#DD0031" },
  ],
  "mern-stack": [
    { Comp: SiReact,     color: "#61DAFB" },
    { Comp: SiNodedotjs, color: "#339933" },
  ],
  "mobile-flutter": [
    { Comp: SiFlutter,    color: "#54C5F8" },
    { Comp: SiNodedotjs,  color: "#339933" },
    { Comp: SiSpringboot, color: "#6DB33F" },
  ],
  "bi":                [{ Comp: FaChartBar,   color: "#F59E0B" }],
  "devops": [
    { Comp: SiDocker,     color: "#2496ED" },
    { Comp: SiKubernetes, color: "#326CE5" },
  ],
  "ai":                [{ Comp: FaRobot,       color: "#8B5CF6" }],
  "iot":               [{ Comp: FiCpu,         color: "#3B82F6" }],
  "cyber-security":    [{ Comp: FiLock,        color: "#10B981" }],
  "digital-marketing": [{ Comp: FiTrendingUp,  color: "#6366F1" }],
};

const getIconEntry = (slug = "") => ICON_MAP[slug] ?? [{ Comp: SiReact, color: "#61DAFB" }];

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
  const { t, i18n }      = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [formations, setFormations] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const navRef       = useRef(null);
  const navInnerRef  = useRef(null);
  const navProbeRef  = useRef(null);
  const navCollapsed = useAdaptiveNav(navInnerRef, navProbeRef, [i18n.language]);

  /* Mobile nav menu: outside-click to close + body scroll lock while open */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

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
      <nav className={`lp-nav${navCollapsed ? " lp-nav--collapsed" : ""}`} ref={navRef}>
        <div className="lp-nav__inner" ref={navInnerRef}>
          {/* Logo */}
          <Link to="/" className="lp-nav__logo">
            <img src="/favicon.png" alt="Logo" className="lp-nav__logo-icon" />
            <span>TheBridge<span className="lp-accent">Flow</span></span>
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
            <button onClick={toggleTheme} className="lp-theme-btn" aria-label={t("landing.themeToggleAriaLabel")}>
              {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>

            <Link to="/login"    className="btn btn-ghost lp-btn-sm">{t("nav.signIn")}</Link>
            <Link to="/register" className="btn btn-primary lp-btn-sm">{t("nav.signUp")}</Link>

            {/* Mobile hamburger */}
            <button
              className="fp-hamburger"
              aria-label={t("landing.menuAriaLabel")}
              onClick={() => setMenuOpen(v => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Off-screen probe: measures the width the desktop nav would need
            (see useAdaptiveNav). Sibling of .lp-nav__inner, never a descendant,
            so its own collapsed/expanded class never affects the measurement. */}
        <div className="lp-nav__probe" ref={navProbeRef} aria-hidden="true">
          <span className="lp-nav__logo">
            <img src="/favicon.png" alt="Logo" className="lp-nav__logo-icon" />
            <span>TheBridge<span className="lp-accent">Flow</span></span>
          </span>
          <ul className="lp-nav__links">
            {NAV_ITEMS.map(item => (
              <li key={item.key}><span className="lp-nav__link">{t(`nav.${item.key}`)}</span></li>
            ))}
          </ul>
          <div className="lp-nav__actions">
            <LangFlags/>
            <span className="lp-theme-btn">{theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}</span>
            <span className="btn btn-ghost lp-btn-sm">{t("nav.signIn")}</span>
            <span className="btn btn-primary lp-btn-sm">{t("nav.signUp")}</span>
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
            <Loader size="lg" label={t("formations.loading")} />
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
              const icons = getIconEntry(f.slug);
              return (
                <motion.article
                  key={f._id}
                  custom={index}
                  variants={cardVariants}
                  className="fp-card"
                >
                  {/* Icons */}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {icons.map(({ Comp: Ic, color: c }, i) => (
                      <div
                        key={i}
                        className="fp-card__icon"
                        style={{
                          background: `${c}18`,
                          color: c,
                          ...(icons.length >= 3 && { width: 38, height: 38 }),
                        }}
                      >
                        <Ic size={icons.length >= 3 ? 17 : 22} />
                      </div>
                    ))}
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
                      {Array.isArray(f.supervision) && f.supervision.length > 0 && (
                        <p className="fp-supervision">
                          <strong>{t("formations.supervision")} :</strong>{" "}
                          {f.supervision.length} session{f.supervision.length > 1 ? "s" : ""} d'encadrement
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
