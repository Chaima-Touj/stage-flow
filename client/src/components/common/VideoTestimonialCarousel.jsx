import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  FiVolume2, FiVolumeX, FiX, FiChevronLeft, FiChevronRight, FiPlay, FiArrowRight,
} from "react-icons/fi";
import "./VideoTestimonialCarousel.css";

const OUTCOME_LABEL_KEY = {
  internship: "testimonials.outcomeInternship",
  hired:      "testimonials.outcomeHired",
};

/* ─── Une carte "story" (9:16) — autoplay muet quand visible, pause sinon ──── */
function TestimonialCard({ item, index, onOpen }) {
  const { t } = useTranslation();
  const videoRef     = useRef(null);
  const containerRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    const video = videoRef.current;
    if (!el || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    setMuted((m) => !m);
  };

  return (
    <div className="vtc-card-wrap">
      <div
        className="vtc-card"
        ref={containerRef}
        onClick={() => onOpen(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(index); } }}
        aria-label={t("testimonials.openAria", { name: item.studentName })}
      >
        <video
          ref={videoRef}
          className="vtc-card__video"
          src={item.videoUrl}
          poster={item.posterUrl || undefined}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        >
          {item.vttUrl && <track kind="subtitles" src={item.vttUrl} default />}
        </video>

        <div className="vtc-card__scrim" />

        <div className="vtc-card__top">
          <span className="vtc-card__badge">🎓 {t("testimonials.badgeCompany")}</span>
          <button
            type="button"
            className="vtc-card__mute"
            onClick={toggleMute}
            aria-label={t(muted ? "testimonials.unmute" : "testimonials.mute")}
          >
            {muted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
          </button>
        </div>

        <div className="vtc-card__play-hint" aria-hidden="true"><FiPlay size={20} /></div>

        <div className="vtc-card__info">
          <div className="vtc-card__name-row">
            <span className="vtc-card__name">{item.studentName}</span>
            {item.outcome && (
              <span className="vtc-outcome-pill">{t(OUTCOME_LABEL_KEY[item.outcome] || item.outcome)}</span>
            )}
          </div>
          <div className="vtc-card__formation">{item.formationLabel}</div>
          {!!item.rating && (
            <div className="vtc-card__stars" aria-hidden="true">
              {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}
            </div>
          )}
        </div>
      </div>

      {!item.vttUrl && item.captionText && (
        <p className="vtc-card-wrap__caption">{item.captionText}</p>
      )}
    </div>
  );
}

/* ─── Modale plein écran — son activé, navigation précédent/suivant ────────── */
function TestimonialModal({ items, activeIndex, onClose, onNavigate }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const item = items[activeIndex];

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft")  onNavigate(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNavigate]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [activeIndex]);

  if (!item) return null;

  return (
    <div className="vtc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="vtc-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="vtc-modal__close" onClick={onClose} aria-label={t("applications.closeModal")}>
          <FiX size={20} />
        </button>

        {items.length > 1 && (
          <button
            type="button"
            className="vtc-modal__nav vtc-modal__nav--prev"
            onClick={() => onNavigate(-1)}
            aria-label={t("testimonials.prev")}
          >
            <FiChevronLeft size={22} />
          </button>
        )}

        <div className="vtc-modal__video-wrap">
          <video
            ref={videoRef}
            key={item.id}
            className="vtc-modal__video"
            src={item.videoUrl}
            poster={item.posterUrl || undefined}
            controls
            playsInline
            autoPlay
          >
            {item.vttUrl && <track kind="subtitles" src={item.vttUrl} default />}
          </video>

          <div className="vtc-modal__info">
            <span className="vtc-modal__badge">🎓 {t("testimonials.badgeCompany")}</span>
            <div className="vtc-modal__name-row">
              <span className="vtc-modal__name">{item.studentName}</span>
              {item.outcome && (
                <span className="vtc-outcome-pill">{t(OUTCOME_LABEL_KEY[item.outcome] || item.outcome)}</span>
              )}
            </div>
            <div className="vtc-modal__formation">{item.formationLabel}</div>
            {!item.vttUrl && item.captionText && (
              <p className="vtc-modal__caption">{item.captionText}</p>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <button
            type="button"
            className="vtc-modal__nav vtc-modal__nav--next"
            onClick={() => onNavigate(1)}
            aria-label={t("testimonials.next")}
          >
            <FiChevronRight size={22} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Composant réutilisable — carousel de témoignages vidéo format "story".
   `items` doit déjà être filtré par l'appelant (featured pour la landing,
   par formationSlug sur une page FormationDetail). Ne rend rien si vide.
═══════════════════════════════════════════════════════════════════════════ */
export default function VideoTestimonialCarousel({ items, title, subtitle, ctaLabel, ctaHref, sectionId }) {
  const { t } = useTranslation();
  const [modalIndex, setModalIndex] = useState(null); // null | index dans `items`

  const openModal = useCallback((idx) => setModalIndex(idx), []);
  const closeModal = useCallback(() => setModalIndex(null), []);
  const navigate = useCallback(
    (delta) => setModalIndex((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length]
  );

  if (!items || items.length === 0) return null;

  return (
    <section id={sectionId} className="vtc-section">
      <div className="vtc-section__inner">
        <div className="vtc-header">
          <span className="vtc-header__badge">🎬 {t("testimonials.eyebrow")}</span>
          <h2 className="vtc-header__title">{title}</h2>
          {subtitle && <p className="vtc-header__sub">{subtitle}</p>}
        </div>

        <div className="vtc-row">
          {items.map((item, i) => (
            <TestimonialCard key={item.id} item={item} index={i} onOpen={openModal} />
          ))}
        </div>

        {ctaHref && (
          <div className="vtc-cta">
            <Link to={ctaHref} className="btn btn-primary vtc-cta__btn">
              {ctaLabel || t("testimonials.ctaDefault")} <FiArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {modalIndex !== null && (
        <TestimonialModal items={items} activeIndex={modalIndex} onClose={closeModal} onNavigate={navigate} />
      )}
    </section>
  );
}
