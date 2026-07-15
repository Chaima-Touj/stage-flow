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
 *
 * Détection volontairement PAS basée sur matchMedia('(pointer: fine)') seul :
 * certains laptops hybrides / pilotes de trackpad rapportent `pointer: coarse`
 * alors qu'un vrai pointeur précis est utilisé, ce qui désactivait le curseur
 * à tort sur ces appareils. La source de vérité est l'événement réel reçu en
 * premier : un `mousemove` authentique active le curseur, un `touchstart`
 * authentique le désactive (et empêche toute activation ultérieure). Les
 * `mousemove` fantômes que les navigateurs synthétisent juste après un tap
 * tactile (~300-500ms, pour compat avec le code souris legacy) sont ignorés
 * une fois qu'un vrai touchstart a été vu.
 */
export default function CustomCursor() {
  const [active, setActive] = useState(false);
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const lastMouse = useRef({ x: -100, y: -100 });

  useEffect(() => {
    let touched = false;

    const onTouchStart = () => {
      touched = true;
      setActive(false);
    };

    const onMouseMove = (e) => {
      if (touched) return; // mousemove fantôme post-tap — pas une vraie souris
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setActive(true);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mousemove", onMouseMove);
    };
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
    // On démarre déjà à la position réelle connue lors de l'activation — pas
    // de saut visible depuis (-100,-100) au premier frame.
    const { x: startX, y: startY } = lastMouse.current;
    const pos = { mouseX: startX, mouseY: startY, dotX: startX, dotY: startY, ringX: startX, ringY: startY };
    let rafId;

    dot.classList.remove("cc-hidden");
    ring.classList.remove("cc-hidden");

    const setHoverState = (mode) => {
      dot.classList.toggle("cc-dot--interactive", mode === "interactive");
      dot.classList.toggle("cc-dot--text", mode === "text");
      ring.classList.toggle("cc-ring--interactive", mode === "interactive");
      ring.classList.toggle("cc-ring--text", mode === "text");
    };

    const onMouseMove = (e) => {
      pos.mouseX = e.clientX;
      pos.mouseY = e.clientY;
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
