import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  FiArrowRight, FiMoon, FiSun, FiPlay, FiX,
  FiMapPin, FiPhone, FiMail, FiSend,
  FiFacebook, FiLinkedin, FiInstagram,
  FiUsers, FiAward, FiTarget, FiBookOpen,
  FiClock, FiCheckCircle, FiTrendingUp, FiMessageCircle,
  FiGlobe, FiLink,
  // eslint-disable-next-line no-unused-vars
  FiShield,
  FiCpu, FiLock,
} from "react-icons/fi";
import { FaChartBar, FaRobot } from "react-icons/fa";
import { SiFlutter, SiSpringboot, SiAngular, SiReact, SiNodedotjs, SiDocker, SiKubernetes } from "react-icons/si";
import { useTheme } from "../context/ThemeContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LangFlags from "../components/common/LangFlags.jsx";
import { useAdaptiveNav } from "../hooks/useAdaptiveNav.js";
import { VIDEO_URLS } from "../constants/videoUrls.js";
import { getFeaturedSummerCampTestimonials, getFeaturedPfeTestimonials, getFeaturedFormationTestimonials } from "../constants/testimonials.js";
import VideoTestimonialCarousel from "../components/common/VideoTestimonialCarousel.jsx";
import TestimonialsScreenshotCarousel from "../components/common/TestimonialsScreenshotCarousel.jsx";
import TechMarquee from "../components/common/TechMarquee.jsx";
import FormationCategories from "../components/common/FormationCategories.jsx";
import NewsSection from "../components/common/NewsSection.jsx";
import { FORMATION_CATEGORIES } from "../constants/formationCategories.js";
import api from "../services/api.js";
import "./LandingPage.css";

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home",         type: "anchor",   href: "#hero" },
  { key: "offers",       type: "route",    to: "/offers" },
  { key: "formations",   type: "route",    to: "/formations" },
  { key: "about",        type: "anchor",   href: "#about" },
  { key: "testimonials", type: "anchor",   href: "#testimonials" },
  { key: "contact",      type: "anchor",   href: "#contact" },
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

// ─── Scroll helper ─────────────────────────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t }                       = useTranslation();
  const { theme, toggleTheme }      = useTheme();
  const { lang } = useLang();
  // eslint-disable-next-line no-unused-vars
  const { user }                    = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate                    = useNavigate();
  const location                    = useLocation();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [form,        setForm]        = useState({ name: "", email: "", subject: "", message: "" });
  const [sent,        setSent]        = useState(false);
  const [newsletter,  setNewsletter]  = useState("");
  const [allFormations, setAllFormations] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [promoOpen,   setPromoOpen]   = useState(false);

  const navRef       = useRef(null);
  const navInnerRef  = useRef(null);
  const navProbeRef  = useRef(null);
  const navCollapsed = useAdaptiveNav(navInnerRef, navProbeRef, [lang]);

  // Sync html lang attribute
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  // Smart scroll: when landing via navigate('/', { state: { scrollTo: 'about' } })
  useEffect(() => {
    const target = location.state?.scrollTo;
    if (!target) return;
    // Small delay to let page render
    const t = setTimeout(() => scrollToSection(target), 120);
    return () => clearTimeout(t);
  }, [location.state]);

  // Fetch all formations once — filtering/slicing happens client-side below
  useEffect(() => {
    api.get("/formations")
      .then(res => setAllFormations(res.data || []))
      .catch(() => {});
  }, []);

  // Formations Populaires : 3-4 max, filtrées par catégorie si une est sélectionnée
  const displayedFormations = useMemo(() => {
    if (!selectedCategory) return allFormations.slice(0, 4);
    const slugs = FORMATION_CATEGORIES.find(c => c.key === selectedCategory)?.slugs || [];
    return allFormations.filter(f => slugs.includes(f.slug)).slice(0, 4);
  }, [allFormations, selectedCategory]);

  const handleSelectCategory = (key) => {
    setSelectedCategory(key);
    scrollToSection("formations-populaires");
  };

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

  /* Promo modal: ESC to close + scroll lock */
  useEffect(() => {
    if (!promoOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setPromoOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [promoOpen]);

  const handleContact = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  const handleNavAnchor = (href) => {
    const id = href.replace("#", "");
    scrollToSection(id);
    setMenuOpen(false);
  };

  return (
    <div className="landing" dir={lang === "ar" ? "rtl" : "ltr"}>

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
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
                  <Link to={item.to} className="lp-nav__link">
                    {t(`nav.${item.key}`)}
                  </Link>
                ) : (
                  <button
                    className="lp-nav__link lp-nav__link--btn"
                    onClick={() => handleNavAnchor(item.href)}
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

            <Link to="/login"    className="btn btn-ghost   lp-btn-sm">{t("nav.signIn")}</Link>
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

        {/* Off-screen probe: an exact, unwrapped copy of the row above, used only
            to measure the width the desktop nav would need. Invisible (not
            display:none, so it still lays out) and inert — see useAdaptiveNav. */}
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
            <span className="btn btn-ghost   lp-btn-sm">{t("nav.signIn")}</span>
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
                  onClick={() => handleNavAnchor(item.href)}
                >
                  {t(`nav.${item.key}`)}
                </button>
              )
            )}
            <div className="fp-mobile-actions">
              <Link to="/login"    className="btn btn-ghost   lp-btn-sm" onClick={() => setMenuOpen(false)}>{t("nav.signIn")}</Link>
              <Link to="/register" className="btn btn-primary lp-btn-sm" onClick={() => setMenuOpen(false)}>{t("nav.signUp")}</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="lp-hero">
        <div className="lp-hero__inner">
          <motion.div
            className="lp-hero__content"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <span className="lp-badge">🚀 {t("landing.heroBadge")}</span>
            <h1 className="lp-hero__title">
              <span>{t("landing.heroTitle1")}</span><br />
              <span className="lp-accent">{t("landing.heroTitle2")}</span>
            </h1>
            <p className="lp-hero__desc">{t("landing.heroDesc")}</p>
            <div className="lp-hero__ctas">
              <Link to="/formations" className="btn btn-primary btn-lg">
                {t("landing.ctaFormations")} <FiArrowRight />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                {t("landing.ctaStart")}
              </Link>
            </div>
            <div className="lp-hero__badges">
              {["badge1","badge2","badge3"].map(k => (
                <span key={k} className="lp-hero__badge-item">{t(`landing.${k}`)}</span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lp-hero__visual"
            initial={{ opacity: 0, x: lang === "ar" ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            <div className="lp-hero__illustration">
              <div className="lp-hero__avatar-wrap">
                <img src="/hero-girl.png" alt={t("landing.heroImgAlt")} className="lp-hero__img" />
              </div>
              <div className="lp-float lp-float--tl">
                <span className="lp-float__icon">💼</span>
                <div>
                  <div className="lp-float__label">{t("landing.floatStages")}</div>
                  <div className="lp-float__val">{t("landing.floatStagesVal")}</div>
                </div>
              </div>
              <div className="lp-float lp-float--tr">
                <span className="lp-float__icon">📊</span>
                <div>
                  <div className="lp-float__label">{t("landing.floatReports")}</div>
                  <div className="lp-float__val">{t("landing.floatReportsVal")}</div>
                </div>
              </div>
              <div className="lp-float lp-float--bl">
                <span className="lp-float__icon">✅</span>
                <div>
                  <div className="lp-float__label">{t("landing.floatTasks")}</div>
                  <div className="lp-float__val">{t("landing.floatTasksVal")}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BANDE DE LOGOS TECHS — vitrine statique complète, indépendante de
          formation.technologies (utilisé uniquement sur FormationDetail) ── */}
      <TechMarquee
        title={t("landing.techMarqueeTitle")}
        subtitle={t("landing.techMarqueeSub")}
      />

      {/* ── CATÉGORIES DE FORMATIONS ──────────────────────────────────────── */}
      {allFormations.length > 0 && (
        <FormationCategories
          formations={allFormations}
          activeCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* ── FORMATIONS POPULAIRES ─────────────────────────────────────────── */}
      {allFormations.length > 0 && (
        <section id="formations-populaires" className="lp-popular">
          <div className="lp-popular__inner">
            <div className="lp-section-header">
              <span className="lp-section-badge">{t("landing.popularBadge")}</span>
              <h2 className="lp-section-title">{t("landing.popularTitle")}</h2>
              <p className="lp-section-sub">{t("landing.popularSub")}</p>
            </div>
            {displayedFormations.length === 0 && (
              <p className="lp-popular__empty">{t("landing.popularEmptyCategory")}</p>
            )}
            <div className="lp-popular__grid">
              {displayedFormations.map((f, i) => {
                const icons = getIconEntry(f.slug);
                return (
                  <motion.div
                    key={f._id}
                    className="lp-pop-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.4 }}
                  >
                    <div className="lp-pop-card__icons">
                      {icons.map(({ Comp: Ic, color: c }, j) => (
                        <div
                          key={j}
                          className="lp-pop-card__icon"
                          style={{
                            background: `${c}18`,
                            color: c,
                            ...(icons.length >= 3 && { width: 38, height: 38 }),
                          }}
                        >
                          <Ic size={icons.length >= 3 ? 17 : 24} />
                        </div>
                      ))}
                    </div>
                    <h3 className="lp-pop-card__title">{f.title}</h3>
                    <p className="lp-pop-card__desc">
                      {f.description
                        ? f.description.slice(0, 100) + (f.description.length > 100 ? "…" : "")
                        : ""}
                    </p>
                    <div className="lp-pop-card__meta">
                      <span className="lp-pop-chip">
                        <FiClock size={12} /> {f.duration}
                      </span>
                      {f.price?.onsite && (
                        <span className="lp-pop-chip lp-pop-chip--price">
                          {f.price.onsite}
                        </span>
                      )}
                    </div>
                    <Link to={`/formations/${f.slug}`} className="lp-pop-card__cta">
                      {t("landing.viewDetails")} <FiArrowRight size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="lp-popular__footer">
              <Link to="/formations" className="btn btn-outline">
                {t("landing.viewAllFormations")}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS (vidéo) — 3 carrousels distincts : Summer Camp, PFE, puis Formation ── */}
      <VideoTestimonialCarousel
        sectionId="testimonials"
        items={getFeaturedSummerCampTestimonials()}
        title={t("landing.testiSummerCampTitle")}
        subtitle={t("landing.testiSummerCampSub")}
        ctaLabel={t("testimonials.ctaDefault")}
        ctaHref="/formations"
      />
      <VideoTestimonialCarousel
        sectionId="testimonials-pfe"
        items={getFeaturedPfeTestimonials()}
        title={t("landing.testiPfeTitle")}
        subtitle={t("landing.testiPfeSub")}
        ctaLabel={t("testimonials.ctaDefault")}
        ctaHref="/formations"
      />
      <VideoTestimonialCarousel
        sectionId="testimonials-formation"
        items={getFeaturedFormationTestimonials()}
        title={t("landing.testiFormationTitle")}
        subtitle={t("landing.testiFormationSub")}
        ctaLabel={t("testimonials.ctaDefault")}
        ctaHref="/formations"
      />

      {/* ── TÉMOIGNAGES (screenshots) — section distincte, indépendante du
          carousel vidéo ci-dessus ─────────────────────────────────────── */}
      <TestimonialsScreenshotCarousel
        title={t("landing.screenshotTestiTitle")}
        subtitle={t("landing.screenshotTestiSub")}
      />

      {/* ── PRÉSENTATION VIDÉO ──────────────────────────────────────────── */}
      <section className="lp-promo-video">
        <div className="lp-promo-video__inner">

          {/* Header */}
          <motion.div
            className="lp-section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="lp-badge">🎥 {t("landing.promoBadge")}</span>
            <h2 className="lp-section-title" style={{ marginTop: "1rem" }}>{t("landing.promoTitle")}</h2>
            <p className="lp-section-sub">
              {t("landing.promoSub")}
            </p>
          </motion.div>

          {/* Video card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <button
              className="lp-promo-video__card"
              onClick={() => setPromoOpen(true)}
              aria-label={t("landing.promoPlayAriaLabel")}
            >
              {/* Autoplay preview — muted, loop, no controls */}
              <video
                className="lp-promo-video__preview"
                src={VIDEO_URLS["/stageflow-promo.mp4"]}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                tabIndex={-1}
              />
              {/* Subtle gradient overlay (glassmorphism feel) */}
              <div className="lp-promo-video__card-overlay" />
              <div className="lp-promo-video__play-ring">
                <FiPlay size={28} />
              </div>
              <div className="lp-promo-video__caption">
                <span className="lp-promo-video__caption-label">{t("landing.promoVideoLabel")}</span>
                <span className="lp-promo-video__caption-sub">{t("landing.promoVideoSub")}</span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Promo modal */}
        {promoOpen && (
          <div
            className="lp-promo-video__overlay"
            onClick={() => setPromoOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t("landing.promoModalAriaLabel")}
          >
            <motion.div
              className="lp-promo-video__modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22 }}
            >
              <button
                className="lp-promo-video__modal-close"
                onClick={() => setPromoOpen(false)}
                aria-label={t("applications.closeModal")}
              >
                <FiX size={18} />
              </button>
              <video
                className="lp-promo-video__modal-video"
                src={VIDEO_URLS["/stageflow-promo.mp4"]}
                controls
                autoPlay
                preload="metadata"
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
              >
                <track kind="captions" />
              </video>
            </motion.div>
          </div>
        )}
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" className="lp-about">
        <div className="lp-about__inner">
          <motion.div
            className="lp-about__left"
            initial={{ opacity: 0, x: lang === "ar" ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <span className="lp-section-badge">{t("landing.aboutBadge")}</span>
            <h2 className="lp-about__title">{t("landing.aboutTitle")}</h2>
            <p className="lp-about__sub">{t("landing.aboutSub")}</p>

            <div className="lp-about__pillars">
              <div className="lp-pillar">
                <div className="lp-pillar__icon"><FiTarget size={18} /></div>
                <div>
                  <div className="lp-pillar__label">{t("landing.missionLabel")}</div>
                  <div className="lp-pillar__text">{t("landing.missionText")}</div>
                </div>
              </div>
              <div className="lp-pillar">
                <div className="lp-pillar__icon lp-pillar__icon--green"><FiTrendingUp size={18} /></div>
                <div>
                  <div className="lp-pillar__label">{t("landing.visionLabel")}</div>
                  <div className="lp-pillar__text">{t("landing.visionText")}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lp-about__right">
            {[
              { title: t("landing.aboutCard1Title"), desc: t("landing.aboutCard1Desc"), icon: <FiUsers size={22} />, color: "#2563EB" },
              { title: t("landing.aboutCard2Title"), desc: t("landing.aboutCard2Desc"), icon: <FiMessageCircle size={22} />, color: "#10B981" },
              { title: t("landing.aboutCard3Title"), desc: t("landing.aboutCard3Desc"), icon: <FiAward size={22} />, color: "#F59E0B" },
              { title: t("landing.aboutCard4Title"), desc: t("landing.aboutCard4Desc"), icon: <FiBookOpen size={22} />, color: "#8B5CF6" },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                className="lp-about-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="lp-about-card__icon" style={{ background: `${card.color}18`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div className="lp-about-card__title">{card.title}</div>
                  <div className="lp-about-card__desc">{card.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="lp-why">
        <div className="lp-why__inner">
          <div className="lp-section-header">
            <span className="lp-section-badge">{t("landing.whyBadge")}</span>
            <h2 className="lp-section-title">{t("landing.whyTitle")}</h2>
            <p className="lp-section-sub">{t("landing.whySub")}</p>
          </div>
          <div className="lp-why__grid">
            {[
              { key: "why1", icon: <FiCheckCircle size={24} />, color: "#2563EB" },
              { key: "why2", icon: <FiBookOpen     size={24} />, color: "#10B981" },
              { key: "why3", icon: <FiUsers        size={24} />, color: "#F59E0B" },
              { key: "why4", icon: <FiTrendingUp   size={24} />, color: "#EF4444" },
              { key: "why5", icon: <FiMessageCircle size={24}/>, color: "#8B5CF6" },
              { key: "why6", icon: <FiAward        size={24} />, color: "#06B6D4" },
              { key: "why7", icon: <FiGlobe        size={24} />, color: "#0EA5E9" },
              { key: "why8", icon: <FiClock        size={24} />, color: "#F97316" },
              { key: "why9", icon: <FiLink         size={24} />, color: "#22C55E" },
            ].map((f, i) => (
              <motion.div
                key={f.key}
                className="lp-why-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
              >
                <div className="lp-why-card__icon" style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="lp-why-card__title">{t(`landing.${f.key}Title`)}</h3>
                <p className="lp-why-card__desc">{t(`landing.${f.key}Desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ACTUALITÉS & BLOGS ──────────────────────────────────────────────── */}
      <NewsSection lang={lang} />

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section id="contact" className="lp-contact">
        <div className="lp-contact__inner">

          {/* Left: form */}
          <div className="lp-contact__form-wrap">
            <span className="lp-section-badge">{t("landing.contactBadge")}</span>
            <h2 className="lp-contact__title">{t("landing.contactTitle")}</h2>
            <p className="lp-contact__sub">{t("landing.contactSub")}</p>

            {sent && (
              <div className="lp-contact__success">
                ✅ {t("landing.contactSuccess")}
              </div>
            )}

            <form className="lp-contact__form" onSubmit={handleContact}>
              <div className="lp-form-row">
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">👤</span>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="lp-input"
                    placeholder={t("landing.contactName")}
                  />
                </div>
                <div className="lp-input-wrap">
                  <span className="lp-input-icon">✉️</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="lp-input"
                    placeholder={t("landing.contactEmail")}
                  />
                </div>
              </div>
              <div className="lp-input-wrap">
                <span className="lp-input-icon">📌</span>
                <input
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  className="lp-input"
                  placeholder={t("landing.contactSubject")}
                />
              </div>
              <div className="lp-input-wrap lp-input-wrap--textarea">
                <span className="lp-input-icon lp-input-icon--top">✏️</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="lp-input lp-textarea"
                  placeholder={t("landing.contactMessage")}
                />
              </div>
              <button type="submit" className="btn btn-primary lp-contact__submit">
                {t("landing.contactSend")} <FiSend size={16} />
              </button>
            </form>
          </div>

          {/* Right: info + map */}
          <div className="lp-contact__info-wrap">
            <div className="lp-contact__info-card--full">
              {/* Brand */}
              <div className="lp-contact__brand">
                <img src="/favicon.png" alt="Logo" className="lp-nav__logo-icon" />
                <span className="lp-contact__brand-name">TheBridge<span className="lp-accent">Flow</span></span>
              </div>
              <p className="lp-contact__info-desc">{t("landing.contactSub")}</p>

              {/* Info list */}
              <div className="lp-contact__info-list">
                {[
                  { icon: <FiPhone size={16} />, label: t("landing.contactPhone"), val: "+216 58 840 064" },
                  { icon: <FiMail  size={16} />, label: t("profile.email"),        val: "contact@9antra.tn" },
                ].map(info => (
                  <div key={info.label} className="lp-contact__info-item">
                    <div className="lp-contact__info-icon">{info.icon}</div>
                    <div>
                      <div className="lp-contact__info-label">{info.label}</div>
                      <div className="lp-contact__info-val">{info.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="lp-contact__socials">
                <a href="https://www.facebook.com/9antra.tn" target="_blank" rel="noopener noreferrer" aria-label="Facebook"  className="lp-contact__social-btn"><FiFacebook  size={17} /></a>
                <a href="https://www.linkedin.com/company/9antra-tn-the-bridge/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"  className="lp-contact__social-btn"><FiLinkedin  size={17} /></a>
                <a href="https://www.instagram.com/9antra.tn_the_bridge/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="lp-contact__social-btn"><FiInstagram size={17} /></a>
              </div>

              {/* Adresses — 2 localisations, chacune avec un lien Google Maps */}
              <div className="lp-contact__addresses">
                <div className="lp-contact__map-label">
                  <FiMapPin size={14} /> {t("landing.mapTitle")}
                </div>
                {[
                  { city: "Lac 1, Tunis", place: "Level 1", href: "https://maps.app.goo.gl/fapcW6wn8dZgZaFX9" },
                  { city: "Sahloul, Sousse", place: "Rockets", href: "https://maps.app.goo.gl/YJY6vKBw1RJJ9XEo7" },
                ].map(addr => (
                  <div key={addr.city} className="lp-contact__address-card">
                    <div className="lp-contact__address-icon"><FiMapPin size={16} /></div>
                    <div className="lp-contact__address-text">
                      <div className="lp-contact__address-city">{addr.city}</div>
                      <div className="lp-contact__address-place">{addr.place}</div>
                    </div>
                    <a href={addr.href} target="_blank" rel="noopener noreferrer" className="lp-contact__address-link">
                      {t("landing.viewOnMaps")}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="lp-newsletter">
        <div className="lp-newsletter__inner">
          <div>
            <div className="lp-newsletter__icon">✈️</div>
            <h3 className="lp-newsletter__title">{t("landing.newsletterTitle")}</h3>
            <p className="lp-newsletter__sub">{t("landing.newsletterSub")}</p>
          </div>
          <div className="lp-newsletter__form">
            <input
              value={newsletter}
              onChange={e => setNewsletter(e.target.value)}
              className="lp-newsletter__input"
              placeholder={t("landing.newsletterInput")}
            />
            <button className="btn btn-primary" onClick={() => setNewsletter("")}>
              {t("landing.newsletterBtn")}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__brand">
            <Link to="/" className="lp-nav__logo" style={{ color: "#94A3B8" }}>
              <img src="/favicon.png" alt="Logo" className="lp-nav__logo-icon" />
              <span>TheBridge<span className="lp-accent">Flow</span></span>
            </Link>
            <p className="lp-footer__tagline">{t("landing.footerTagline")}</p>
            <div className="lp-footer__socials">
              <a href="https://www.facebook.com/9antra.tn" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FiFacebook   size={17} /></a>
              <a href="https://www.linkedin.com/company/9antra-tn-the-bridge/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FiLinkedin   size={17} /></a>
              <a href="https://www.instagram.com/9antra.tn_the_bridge/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FiInstagram size={17} /></a>
            </div>
          </div>

          <div className="lp-footer__col">
            <h4>{t("landing.footerNav")}</h4>
            <a href="#hero"         onClick={e => { e.preventDefault(); scrollToSection("hero"); }}>{t("landing.footerHome")}</a>
            <a href="#about"        onClick={e => { e.preventDefault(); scrollToSection("about"); }}>{t("landing.footerAbout")}</a>
            <Link to="/formations">{t("landing.footerFeatures")}</Link>
            <Link to="/formations">{t("landing.footerPricing")}</Link>
            <a href="#">{t("landing.footerTerms")}</a>
          </div>

          <div className="lp-footer__col">
            <h4>{t("landing.footerResources")}</h4>
            <a href="#">{t("landing.footerFAQ")}</a>
            <a href="#news"         onClick={e => { e.preventDefault(); scrollToSection("news"); }}>{t("landing.footerBlog")}</a>
            <a href="#">{t("landing.footerGuides")}</a>
            <a href="#">{t("landing.footerHelp")}</a>
          </div>

          <div className="lp-footer__col">
            <h4>{t("landing.footerLegal")}</h4>
            <a href="#">{t("landing.footerMentions")}</a>
            <a href="#">{t("landing.footerPrivacy")}</a>
            <a href="#">{t("landing.footerCGU")}</a>
          </div>

          <div className="lp-footer__col">
            <h4>{t("nav.contact")}</h4>
            <span><FiMapPin size={13} /> Lac 1, Tunis — Level 1</span>
            <span><FiMapPin size={13} /> Sahloul, Sousse — Rockets</span>
            <span><FiPhone  size={13} /> +216 58 840 064</span>
            <span><FiMail   size={13} /> contact@9antra.tn</span>
          </div>
        </div>

        <div className="lp-footer__bottom">
          © 2026 TheBridgeFlow. {t("landing.copyright")}.
        </div>
      </footer>

    </div>
  );
}
