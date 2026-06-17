// Site chrome behaviors that must survive client-side (View Transitions) navigation.
// initChrome() is idempotent: safe to call on every astro:page-load.

declare global {
  interface Window {
    __chromeScroll?: () => void;
    __navObs?: IntersectionObserver;
  }
}

const SECTION_IDS = ['about', 'news', 'publications', 'projects'];

function setupScrollProgress(): void {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  // Remove the previous handler so repeated calls don't stack listeners.
  if (window.__chromeScroll) {
    window.removeEventListener('scroll', window.__chromeScroll);
  }

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrollTop / max) * 100 : 0;
    bar.style.width = `${pct}%`;
  };

  window.__chromeScroll = update;
  window.addEventListener('scroll', update, { passive: true });
  update(); // run once immediately
}

function setupActiveNav(): void {
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.nav__links a'),
  );

  const clearActive = () => {
    navLinks.forEach((a) => {
      a.classList.remove('is-current');
      a.removeAttribute('aria-current');
    });
  };

  // Disconnect any observer from a previous page.
  if (window.__navObs) {
    window.__navObs.disconnect();
    window.__navObs = undefined;
  }

  const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => el !== null,
  );

  // Non-home pages have no section anchors: just clear all active states.
  if (sections.length === 0) {
    clearActive();
    return;
  }

  const markActive = (id: string) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const isMatch = href.endsWith(`#${id}`);
      a.classList.toggle('is-current', isMatch);
      if (isMatch) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      // Pick the most-visible intersecting section.
      let best: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (!best || entry.intersectionRatio > best.intersectionRatio) {
          best = entry;
        }
      }
      if (best) markActive(best.target.id);
    },
    { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
  );

  sections.forEach((s) => observer.observe(s));
  window.__navObs = observer;
}

export function initChrome(): void {
  setupScrollProgress();
  setupActiveNav();
}
