import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Module-level Lenis ref so repeated initMotion() calls (e.g. after a view
// transition) don't stack instances / duplicate ScrollTriggers.
let lenis: Lenis | null = null;

export function initMotion(): void {
  // Tear down anything created by a previous call before recreating.
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal elements regardless; with reduced motion we just show them immediately.
  const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');

  if (prefersReduced) {
    revealEls.forEach((el) => (el.style.opacity = '1'));
    return;
  }

  const instance = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis = instance;
  function raf(time: number) {
    // Stop the loop once this instance has been destroyed/replaced.
    if (lenis !== instance) return;
    instance.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  instance.on('scroll', ScrollTrigger.update);

  revealEls.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' },
      },
    );
  });

  // Parallax for any [data-parallax] element.
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      yPercent: -15,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}
