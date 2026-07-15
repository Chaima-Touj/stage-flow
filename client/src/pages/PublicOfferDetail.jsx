import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  FiMoon, FiSun, FiArrowLeft, FiMapPin, FiBriefcase, FiClock,
  FiCalendar, FiCode, FiSend, FiAlertCircle,
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LangFlags from "../components/common/LangFlags.jsx";
import { useAdaptiveNav } from "../hooks/useAdaptiveNav.js";
import { useFormationsTechMap } from "../hooks/useFormationsTechMap.js";
import { buildSkillFormationMatcher } from "../utils/techMatch.js";
import { offersService } from "../services/offers.service.js";
import "./PublicOfferDetail.css";

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",         type: "route",       to: "/" },
  { key: "offers",       type: "route",       to: "/offers" },
  { key: "formations",   type: "route",       to: "/formations" },
  { key: "about",        type: "home-anchor", scrollTo: "about" },
  { key: "testimonials", type: "home-anchor", scrollTo: "testimonials" },
  { key: "contact",      type: "home-anchor", scrollTo: "contact" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LOGO_PALETTES = [
  { bg: "#4F46E5", color: "#fff" },
  { bg: "#0EA5E9", color: "#fff" },
  { bg: "#10B981", color: "#fff" },
  { bg: "#F59E0B", color: "#fff" },
  { bg: "#EF4444", color: "#fff" },
  { bg: "#8B5CF6", color: "#fff" },
  { bg: "#EC4899", color: "#fff" },
  { bg: "#6366F1", color: "#fff" },
];

function logoStyle(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return LOGO_PALETTES[Math.abs(h) % LOGO_PALETTES.length];
}

function formatDate(dateStr, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const days = Math.floor((Date.now() - date) / 86400000);
  if (days === 0) return { fr: "Aujourd'hui", en: "Today", ar: "اليوم" }[lang] ?? "Today";
  if (days === 1) return { fr: "Hier",         en: "Yesterday", ar: "أمس" }[lang] ?? "Yesterday";
  if (days < 7)  return { fr: `Il y a ${days} j.`, en: `${days}d ago`, ar: `منذ ${days} أيام` }[lang] ?? `${days}d`;
  const localeMap = { fr: "fr-FR", en: "en-US", ar: "ar-TN" };
  return date.toLocaleDateString(localeMap[lang] ?? "fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonDetail = () => (
  <div className="pod-skeleton" aria-hidden="true">
    <div className="pod-sk-header">
      <div className="pod-sk pod-sk-logo" />
      <div className="pod-sk-hinfo">
        <div className="pod-sk pod-sk-badge" />
        <div className="pod-sk pod-sk-title" />
        <div className="pod-sk pod-sk-sub" />
        <div className="pod-sk-chips">
          <div className="pod-sk pod-sk-chip" />
          <div className="pod-sk pod-sk-chip" />
          <div className="pod-sk pod-sk-chip" />
        </div>
      </div>
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="pod-sk pod-sk-line" style={{ width: `${75 + Math.random() * 25}%` }} />
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const PublicOfferDetail = () => {
  const { id }                 = useParams();
  const { t }                  = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { lang } = useLang();
  const { user }               = useAuth();
  const navigate               = useNavigate();
  const location               = useLocation();

  const [offer,   setOffer]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [menuOpen,setMenuOpen]= useState(false);
  const navRef       = useRef(null);
  const navInnerRef  = useRef(null);
  const navProbeRef  = useRef(null);
  const navCollapsed = useAdaptiveNav(navInnerRef, navProbeRef, [lang]);
  const formations    = useFormationsTechMap();
  const matchFormationForSkill = buildSkillFormationMatcher(formations);

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
    setLoading(true);
    setError(null);
    offersService.getOne(id)
      .then(res => {
        if (!active) return;
        const o = res.data?.offer ?? res.data?.offers?.[0] ?? res.data;
        if (!o?._id) throw new Error(t("offers.offerNotFound"));
        setOffer(o);
      })
      .catch(err => {
        if (!active) return;
        setError(err?.response?.data?.message ?? err.message ?? t("offers.error"));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, t]);

  const handleApply = () => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
    } else {
      navigate(`/dashboard/student/offers/${id}/apply`);
    }
  };

  const ls     = offer ? logoStyle(offer.companyName ?? "") : { bg: "#4F46E5", color: "#fff" };
  const skills = offer && Array.isArray(offer.skills) ? offer.skills : [];
  const desc   = offer ? (offer.description ?? offer.desc ?? "") : "";

  return (
    <div className="pod-page">

      {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav className={`lp-nav${navCollapsed ? " lp-nav--collapsed" : ""}`} ref={navRef}>
        <div className="lp-nav__inner" ref={navInnerRef}>
          <Link to="/" className="lp-nav__logo">
            <img src="/favicon.png" alt="Logo" className="lp-nav__logo-icon" />
            <span>TheBridge<span className="lp-accent">Flow</span></span>
          </Link>

          <ul className="lp-nav__links">
            {NAV_ITEMS.map(item => (
              <li key={item.key}>
                {item.type === "route" ? (
                  <Link
                    to={item.to}
                    className={`lp-nav__link${item.to === "/offers" ? " lp-nav__link--active" : ""}`}
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

          <div className="lp-nav__actions">
            <LangFlags/>

            <button onClick={toggleTheme} className="lp-theme-btn" aria-label={t("landing.themeToggleAriaLabel")}>
              {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>

            <Link to="/login"    className="btn btn-ghost lp-btn-sm">{t("nav.signIn")}</Link>
            <Link to="/register" className="btn btn-primary lp-btn-sm">{t("nav.signUp")}</Link>

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

        {menuOpen && (
          <div className="fp-mobile-menu">
            {NAV_ITEMS.map(item =>
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
            )}
            <div className="fp-mobile-actions">
              <Link to="/login"    className="btn btn-ghost lp-btn-sm"  onClick={() => setMenuOpen(false)}>{t("nav.signIn")}</Link>
              <Link to="/register" className="btn btn-primary lp-btn-sm" onClick={() => setMenuOpen(false)}>{t("nav.signUp")}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── CONTENT ─────────────────────────────────────────────────────── */}
      <main className="pod-main">

        {/* Back link */}
        <Link to="/offers" className="pod-back">
          <FiArrowLeft size={15} /> {t("offers.backToOffers")}
        </Link>

        {/* Loading */}
        {loading && <SkeletonDetail />}

        {/* Error */}
        {!loading && error && (
          <div className="pod-error">
            <FiAlertCircle size={36} />
            <p>{error}</p>
            <Link to="/offers" className="op-btn op-btn--outline">{t("offers.backToOffers")}</Link>
          </div>
        )}

        {/* Offer detail */}
        {!loading && !error && offer && (
          <motion.div
            className="pod-layout"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* ── LEFT COLUMN ─────────────────────────────────────────── */}
            <div className="pod-left">

              {/* Header card */}
              <div className="pod-card pod-card--header">
                <div className="pod-header-top">
                  <div className="pod-logo" style={{ background: ls.bg, color: ls.color }}>
                    {(offer.companyName ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="pod-header-info">
                    {offer.type && <span className="pod-type-badge">{offer.type}</span>}
                    <h1 className="pod-title">{offer.title}</h1>
                    <p className="pod-company">{offer.companyName}</p>
                    <div className="pod-chips">
                      {offer.location && (
                        <span className="pod-chip"><FiMapPin size={12} />{offer.location}</span>
                      )}
                      {offer.duration && (
                        <span className="pod-chip"><FiClock size={12} />{offer.duration}</span>
                      )}
                      {offer.domain && (
                        <span className="pod-chip"><FiBriefcase size={12} />{offer.domain}</span>
                      )}
                      {offer.createdAt && (
                        <span className="pod-chip"><FiCalendar size={12} />{formatDate(offer.createdAt, lang)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {desc && (
                <div className="pod-card">
                  <h2 className="pod-section-title">{t("offers.stageInfo")}</h2>
                  <div className="pod-desc">
                    {desc.split("\n").filter(Boolean).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="pod-card">
                  <h2 className="pod-section-title">
                    <FiCode size={16} style={{ marginInlineEnd: "0.4rem" }} />
                    {t("offers.skills")}
                  </h2>
                  <div className="pod-skills">
                    {skills.map(s => {
                      const formation = matchFormationForSkill(s);
                      return formation ? (
                        <Link
                          key={s}
                          to={`/formations/${formation.slug}`}
                          className="pod-skill pod-skill--link"
                          title={t("offers.skillLinkedToFormation", { formation: formation.title })}
                        >
                          {s}
                        </Link>
                      ) : (
                        <span key={s} className="pod-skill">{s}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="pod-card">
                <h2 className="pod-section-title">{t("offers.stageInfo")}</h2>
                <div className="pod-info-grid">
                  {[
                    { icon: <FiBriefcase size={15} />, label: t("offers.typeLabel"), value: offer.type },
                    { icon: <FiMapPin size={15} />,    label: t("offers.cityPlaceholder").replace("...", ""), value: offer.location },
                    { icon: <FiClock size={15} />,     label: t("offers.durationLabel"), value: offer.duration },
                    { icon: <FiBriefcase size={15} />, label: t("offers.domainLabel"), value: offer.domain },
                    { icon: <FiCalendar size={15} />,  label: t("offers.publishedAt"), value: formatDate(offer.createdAt, lang) },
                    offer.nbrInterns
                      ? { icon: <FiBriefcase size={15} />, label: t("offers.internsLabel"), value: offer.nbrInterns }
                      : null,
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="pod-info-item">
                      <div className="pod-info-item__icon">{item.icon}</div>
                      <div>
                        <div className="pod-info-item__label">{item.label}</div>
                        <div className="pod-info-item__value">{item.value || "—"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
            <aside className="pod-right">

              {/* Apply card */}
              <div className="pod-card pod-card--apply">
                <div className="pod-apply-logo" style={{ background: ls.bg, color: ls.color }}>
                  {(offer.companyName ?? "?")[0].toUpperCase()}
                </div>
                <h3 className="pod-apply-title">{offer.companyName}</h3>
                {offer.domain && <p className="pod-apply-domain">{offer.domain}</p>}
                <p className="pod-apply-prompt">{t("offers.applyPrompt")}</p>

                <button className="pod-btn-apply" onClick={handleApply}>
                  <FiSend size={15} />
                  {user ? t("offers.applyNow") : t("offers.loginToApply")}
                </button>

                <Link to="/offers" className="pod-btn-back">
                  ‹ {t("offers.backToOffers")}
                </Link>
              </div>

              {/* Meta card */}
              <div className="pod-card pod-card--meta">
                <div className="pod-meta-row">
                  <FiBriefcase size={14} className="pod-meta-icon" />
                  <span className="pod-meta-label">{t("offers.typeLabel")}</span>
                  <span className="pod-meta-value">{offer.type || "—"}</span>
                </div>
                {offer.location && (
                  <div className="pod-meta-row">
                    <FiMapPin size={14} className="pod-meta-icon" />
                    <span className="pod-meta-label">{t("offers.cityPlaceholder").replace("...", "")}</span>
                    <span className="pod-meta-value">{offer.location}</span>
                  </div>
                )}
                {offer.duration && (
                  <div className="pod-meta-row">
                    <FiClock size={14} className="pod-meta-icon" />
                    <span className="pod-meta-label">{t("offers.durationLabel")}</span>
                    <span className="pod-meta-value">{offer.duration}</span>
                  </div>
                )}
                {offer.deadline && (
                  <div className="pod-meta-row">
                    <FiCalendar size={14} className="pod-meta-icon" />
                    <span className="pod-meta-label">{t("offers.deadlineLabel")}</span>
                    <span className="pod-meta-value">
                      {new Date(offer.deadline).toLocaleDateString(
                        lang === "ar" ? "ar-TN" : lang === "en" ? "en-US" : "fr-FR",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>
                )}
              </div>

            </aside>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PublicOfferDetail;
