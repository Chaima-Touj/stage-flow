import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./AnimatedNavBar.css";

/**
 * AnimatedNavBar — pilule flottante translucide avec glow animé sur l'onglet
 * actif (dégradé magenta → orange) et point lumineux qui rebondit au-dessus.
 * Adapté d'un composant de référence Next.js/Tailwind vers React Router +
 * CSS pur (le projet n'utilise pas Tailwind) — l'animation reste portée par
 * framer-motion (déjà une dépendance du projet).
 *
 * items: [{ key, label, icon: LucideIcon, type: "route" | "anchor", to?, href? }]
 */
export default function AnimatedNavBar({ items, activeKey, onAnchorClick }) {
  return (
    <div className="anb-pill">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;
        const content = (
          <>
            {isActive && (
              <motion.span
                layoutId="anb-active-pill"
                className="anb-item__pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {isActive && (
              <motion.span
                layoutId="anb-active-dot"
                className="anb-item__dot-wrap"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <motion.span
                  className="anb-item__dot"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.span>
            )}
            <span className="anb-item__icon"><Icon size={15} strokeWidth={2.25} /></span>
            <span className="anb-item__label">{item.label}</span>
          </>
        );

        return item.type === "route" ? (
          <Link key={item.key} to={item.to} className={`anb-item ${isActive ? "anb-item--active" : ""}`}>
            {content}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            className={`anb-item ${isActive ? "anb-item--active" : ""}`}
            onClick={() => onAnchorClick(item)}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Clone statique (mêmes classes, sans les couches d'animation) utilisé
 * uniquement pour la mesure de largeur par useAdaptiveNav — même principe
 * que le reste de la sonde .lp-nav__probe (spans inertes, pas de vrais
 * Link/button ni de calques motion dupliqués).
 */
export function AnimatedNavBarProbe({ items }) {
  return (
    <div className="anb-pill">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span key={item.key} className="anb-item">
            <span className="anb-item__icon"><Icon size={15} strokeWidth={2.25} /></span>
            <span className="anb-item__label">{item.label}</span>
          </span>
        );
      })}
    </div>
  );
}
