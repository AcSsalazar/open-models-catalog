import gsap from 'gsap';

// Animaciones sobrias: solo fundidos cortos, sin rebotes ni escalas.

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Muestra los movimientos del scramble con un fundido breve. */
export function revealMoves(elements) {
  if (reduceMotion() || !elements.length) return;
  gsap.fromTo(
    elements,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.25, ease: 'power1.out', stagger: 0.012 },
  );
}

/** Marca discretamente un valor que cambió. */
export function pop(element) {
  if (reduceMotion() || !element) return;
  gsap.fromTo(element, { autoAlpha: 0.35 }, { autoAlpha: 1, duration: 0.3, ease: 'power1.out' });
}

export function fadeIn(element) {
  if (reduceMotion() || !element) return;
  gsap.fromTo(element, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power1.out' });
}
