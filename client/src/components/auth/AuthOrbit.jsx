import { TECH_LOGOS } from "../../constants/techLogos.js";
import "./AuthOrbit.css";

// Icônes technos affichées en orbite — sous-ensemble volontairement réduit du
// dictionnaire partagé techLogos.js (mêmes technos que la stack du projet).
const ORBIT_TECHS = [
  { slug: "react",      radius: 150, size: 46, duration: 18, delay: 0,  reverse: false },
  { slug: "nodejs",     radius: 150, size: 46, duration: 18, delay: -6, reverse: false },
  { slug: "mongodb",    radius: 150, size: 46, duration: 18, delay: -12, reverse: false },
  { slug: "express",    radius: 95,  size: 36, duration: 13, delay: 0,  reverse: true },
  { slug: "javascript", radius: 95,  size: 36, duration: 13, delay: -6.5, reverse: true },
  { slug: "html",       radius: 205, size: 34, duration: 24, delay: -8,  reverse: false },
  { slug: "css3",       radius: 205, size: 34, duration: 24, delay: -16, reverse: false },
];

const RIPPLE_COUNT = 4;

/**
 * Fond animé du panneau gauche Login/Register : anneaux Ripple pulsants +
 * icônes technos en orbite. Purement décoratif (aria-hidden), en CSS pur —
 * remplace les anciennes <div class="auth-shape--*"> statiques.
 */
export default function AuthOrbit() {
  return (
    <div className="auth-orbit" aria-hidden="true">
      <div className="auth-orbit__ripple">
        {Array.from({ length: RIPPLE_COUNT }, (_, i) => (
          <span
            key={i}
            className="auth-orbit__ripple-ring"
            style={{
              "--ripple-size": `${140 + i * 90}px`,
              "--ripple-delay": `${i * 0.35}s`,
            }}
          />
        ))}
      </div>

      {ORBIT_TECHS.map(({ slug, radius, size, duration, delay, reverse }) => {
        const logo = TECH_LOGOS[slug];
        if (!logo) return null;
        return (
          <span
            key={slug}
            className={`auth-orbit__icon${reverse ? " auth-orbit__icon--reverse" : ""}`}
            style={{
              "--orbit-radius": `${radius}px`,
              "--orbit-size": `${size}px`,
              "--orbit-duration": `${duration}s`,
              "--orbit-delay": `${delay}s`,
            }}
            title={logo.label}
          >
            <logo.Comp size={size * 0.5} color={logo.color} />
          </span>
        );
      })}
    </div>
  );
}
