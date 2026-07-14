import { useTranslation } from "react-i18next";
import { SCREENSHOT_FEEDBACKS } from "../../constants/screenshotTestimonials.js";
import "./TestimonialsScreenshotCarousel.css";

/**
 * Bande de captures d'écran de témoignages en défilement infini — même
 * logique/mécanique que TechMarquee (liste dupliquée x2, boucle CSS
 * translateX pure, pause au survol). Section indépendante du
 * VideoTestimonialCarousel, aucun état/donnée partagé.
 */
export default function TestimonialsScreenshotCarousel({ title, subtitle }) {
  const { t } = useTranslation();

  if (SCREENSHOT_FEEDBACKS.length === 0) return null;

  const track = [...SCREENSHOT_FEEDBACKS, ...SCREENSHOT_FEEDBACKS];

  return (
    <section id="screenshot-testimonials" className="stc-section">
      <div className="stc-section__inner">
        <div className="stc-header">
          <span className="stc-header__badge">💬 {t("testimonials.screenshotEyebrow")}</span>
          <h2 className="stc-header__title">{title}</h2>
          {subtitle && <p className="stc-header__sub">{subtitle}</p>}
        </div>

        <div className="stc-marquee">
          <div className="stc-marquee__track">
            {track.map((item, i) => (
              <div className="stc-badge" key={`${item.id}-${i}`}>
                <img src={item.src} alt="" className="stc-badge__img" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
