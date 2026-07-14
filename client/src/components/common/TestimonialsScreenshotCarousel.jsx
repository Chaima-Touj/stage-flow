import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { SCREENSHOT_TESTIMONIALS } from "../../constants/screenshotTestimonials.js";
import "./TestimonialsScreenshotCarousel.css";

/**
 * Carousel de témoignages "capture d'écran" (style feedback card) — section
 * distincte du VideoTestimonialCarousel, ne partage ni données ni état avec
 * lui. Scroll natif + snap, flèches prev/next pour la navigation desktop.
 */
export default function TestimonialsScreenshotCarousel({ title, subtitle }) {
  const { t } = useTranslation();
  const trackRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    setHasOverflow(scrollWidth > clientWidth + 4);
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateScrollState]);

  const scrollByCard = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".stc-card-wrap");
    const step = card ? card.getBoundingClientRect().width + 24 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (SCREENSHOT_TESTIMONIALS.length === 0) return null;

  return (
    <section id="screenshot-testimonials" className="stc-section">
      <div className="stc-section__inner">
        <div className="stc-header">
          <span className="stc-header__badge">💬 {t("testimonials.screenshotEyebrow")}</span>
          <h2 className="stc-header__title">{title}</h2>
          {subtitle && <p className="stc-header__sub">{subtitle}</p>}
        </div>

        <div className="stc-carousel">
          {hasOverflow && (
            <button
              type="button"
              className="stc-arrow"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label={t("testimonials.prev")}
            >
              <FiChevronLeft size={20} />
            </button>
          )}

          <div className="stc-track" ref={trackRef} onScroll={updateScrollState}>
            {SCREENSHOT_TESTIMONIALS.map((item) => (
              <div className="stc-card-wrap" key={item.id}>
                <div className="stc-card">
                  <div className="stc-card__top">
                    <span className="stc-card__logo">S</span>
                    <span className="stc-card__feedback-label">{t("testimonials.feedbackLabel")}</span>
                  </div>

                  <img src={item.photo} alt={item.name} className="stc-card__photo" loading="lazy" />
                  <div className="stc-card__name">{item.name}</div>
                  <p className="stc-card__text">{item.text}</p>

                  <div className="stc-card__stars" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FiStar key={i} size={15} className={i < item.rating ? "stc-star stc-star--filled" : "stc-star"} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasOverflow && (
            <button
              type="button"
              className="stc-arrow"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label={t("testimonials.next")}
            >
              <FiChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
