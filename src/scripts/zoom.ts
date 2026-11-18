// Click-to-zoom for images in articles and project pages: click (or Enter/Space
// on a focused image) opens it full screen; a click or Escape closes it.
// Images that are links (cards, thumbnails) are left alone.

const SELECTOR = '.post__body img, .project__body img, .project__hero, .pp-page__hero img';

export function initZoom(): void {
  document.querySelectorAll<HTMLImageElement>(SELECTOR).forEach((img) => {
    if (img.dataset.zoomReady || img.closest('a')) return;
    img.dataset.zoomReady = '1';
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `${img.alt || 'Image'} (open full size)`);
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img);
      }
    });
  });
}

function open(img: HTMLImageElement): void {
  const overlay = document.createElement('div');
  overlay.className = 'zoom-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', img.alt || 'Image');
  overlay.tabIndex = -1;

  const big = document.createElement('img');
  // With a srcset, ask for the largest version that fits the screen.
  if (img.srcset) {
    big.srcset = img.srcset;
    big.sizes = '100vw';
  }
  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  overlay.append(big);
  document.body.append(overlay);
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  overlay.focus();

  const close = () => {
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('astro:before-swap', close);
    overlay.classList.remove('is-open');
    setTimeout(() => overlay.remove(), 200);
    img.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  };
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.addEventListener('astro:before-swap', close);
}
