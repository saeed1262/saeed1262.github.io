// Gentle fade-in for [data-reveal] elements, with native scrolling.
// Content is never hidden by default: only elements that start below the
// viewport are faded, and print or no-JS always shows everything.
// initMotion() is idempotent: safe to call on every astro:page-load.

let observer: IntersectionObserver | null = null;

export function initMotion(): void {
  observer?.disconnect();
  observer = null;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const below = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => el.getBoundingClientRect().top > window.innerHeight,
  );
  if (below.length === 0) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('is-pending');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );

  below.forEach((el) => {
    el.classList.add('is-pending');
    io.observe(el);
  });
  observer = io;
}
