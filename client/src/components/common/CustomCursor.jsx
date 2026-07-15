import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

// Éléments dont le survol déclenche l'état "interactive" (anneau qui grossit
// et se remplit). [tabindex] couvre les cartes cliquables custom qui ne sont
// ni <a> ni <button> mais restent accessibles au clavier.
const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="button"], ' +
  'input[type="checkbox"], input[type="radio"], select, summary, label, ' +
  '[tabindex]:not([tabindex="-1"])';

// Champs de saisie de texte — le curseur custom s'efface entièrement au
// profit du curseur "text" natif (comportement le plus lisible/prévisible
// pour taper, pas de superposition avec le caret clignotant).
const TEXT_SELECTOR =
  'input:not([type="submit"]):not([type="button"]):not([type="checkbox"])' +
  ':not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]), ' +
  'textarea, [contenteditable="true"]';

const DOT_EASE  = 0.35; // rattrapage quasi immédiat — précision
const RING_EASE = 0.15; // rattrapage plus lent — effet "traînée" premium
// prefers-reduced-motion: le "lag" traînant est un effet de mouvement non
// essentiel — on le supprime (rattrapage instantané) sans désactiver le
// curseur lui-même, qui reste fonctionnel.
const REDUCED_EASE = 1;

/**
 * Curseur personnalisé (point + anneau dégradé traînant) — desktop uniquement.
 * Se désactive intégralement si aucun pointeur précis n'est détecté (tactile).
 */
export default function CustomCursor() {
  const [active, setActive] = useState(false);
  const dotRef  = useRef(null);
  const ringRef = useRef(null);

  // Détecte la présence d'une vraie souris/trackpad (pointer: fine), et
  // réagit si l'utilisateur bascule (ex: tablette hybride avec souris branchée).
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setActive(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (!active) {
      html.classList.remove("cc-active");
      return;
    }
    html.classList.add("cc-active");

    const dot  = dotRef.current;
    const ring = ringRef.current;
    const pos = { mouseX: -100, mouseY: -100, dotX: -100, dotY: -100, ringX: -100, ringY: -100 };
    let rafId;
    let hasMoved = false;

    const setHoverState = (mode) => {
      dot.classList.toggle("cc-dot--interactive", mode === "interactive");
      dot.classList.toggle("cc-dot--text", mode === "text");
      ring.classList.toggle("cc-ring--interactive", mode === "interactive");
      ring.classList.toggle("cc-ring--text", mode === "text");
    };

    const onMouseMove = (e) => {
      pos.mouseX = e.clientX;
      pos.mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        dot.classList.remove("cc-hidden");
        ring.classList.remove("cc-hidden");
      }
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (target.closest?.(TEXT_SELECTOR)) setHoverState("text");
      else if (target.closest?.(INTERACTIVE_SELECTOR)) setHoverState("interactive");
      else setHoverState(null);
    };

    const onMouseLeaveDoc = () => {
      dot.classList.add("cc-hidden");
      ring.classList.add("cc-hidden");
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveDoc);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dotEase  = reduceMotion ? REDUCED_EASE : DOT_EASE;
    const ringEase = reduceMotion ? REDUCED_EASE : RING_EASE;

    const tick = () => {
      pos.dotX  += (pos.mouseX - pos.dotX)  * dotEase;
      pos.dotY  += (pos.mouseY - pos.dotY)  * dotEase;
      pos.ringX += (pos.mouseX - pos.ringX) * ringEase;
      pos.ringY += (pos.mouseY - pos.ringY) * ringEase;

      dot.style.setProperty("--x", `${pos.dotX}px`);
      dot.style.setProperty("--y", `${pos.dotY}px`);
      ring.style.setProperty("--x", `${pos.ringX}px`);
      ring.style.setProperty("--y", `${pos.ringY}px`);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveDoc);
      html.classList.remove("cc-active");
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <div ref={dotRef}  className="cc-dot cc-hidden"  aria-hidden="true" />
      <div ref={ringRef} className="cc-ring cc-hidden" aria-hidden="true" />
    </>
  );
}
