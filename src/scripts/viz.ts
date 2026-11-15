// Tiny, dependency-free helpers for the blog's interactive charts.
// Charts draw SVG into a container, redraw on resize, and start on every
// astro:page-load (view transitions) without double-initialising.

export const SVGNS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number | undefined>;

export function svgEl<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  parent?: Element,
): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) n.setAttribute(k, String(v));
  parent?.appendChild(n);
  return n;
}

export function svgText(parent: Element, x: number, y: number, text: string, attrs: Attrs = {}) {
  const t = svgEl('text', { x, y, ...attrs }, parent);
  t.textContent = text;
  return t;
}

export interface Scale {
  (v: number): number;
  invert(p: number): number;
}

export function linear(d0: number, d1: number, r0: number, r1: number): Scale {
  const f = ((v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)) as Scale;
  f.invert = (p: number) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0);
  return f;
}

export function log10Scale(d0: number, d1: number, r0: number, r1: number): Scale {
  const l = linear(Math.log10(d0), Math.log10(d1), r0, r1);
  const f = ((v: number) => l(Math.log10(Math.max(v, d0 * 1e-3)))) as Scale;
  f.invert = (p: number) => 10 ** l.invert(p);
  return f;
}

/** Start `init` once per element matching `selector`, on every page load. */
export function onEachPage(selector: string, init: (el: HTMLElement) => void) {
  const run = () =>
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      if (el.dataset.vizReady) return;
      el.dataset.vizReady = '1';
      init(el);
    });
  document.addEventListener('astro:page-load', run);
}

/** Call `draw(width)` now and whenever the element's width changes. */
export function responsive(el: HTMLElement, draw: (width: number) => void) {
  let last = -1;
  // Draw right away (don't wait for the first resize callback), then on resize.
  const w0 = Math.round(el.clientWidth);
  if (w0 > 0) {
    last = w0;
    draw(w0);
  }
  const ro = new ResizeObserver(() => {
    const w = Math.round(el.clientWidth);
    if (w !== last && w > 0) {
      last = w;
      draw(w);
    }
  });
  ro.observe(el);
}

export interface TooltipRow {
  value: string;
  label: string;
  color?: string; // CSS colour for the line key
}

/** One tooltip per chart, positioned inside `host` (position: relative). */
export function makeTooltip(host: HTMLElement) {
  const tip = document.createElement('div');
  tip.className = 'viz-tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  host.appendChild(tip);
  return {
    /** The tooltip element; re-append it after clearing the host. */
    el: tip,
    show(x: number, y: number, title: string, rows: TooltipRow[]) {
      tip.replaceChildren();
      if (title) {
        const h = document.createElement('div');
        h.className = 'viz-tip__title';
        h.textContent = title;
        tip.appendChild(h);
      }
      for (const r of rows) {
        const row = document.createElement('div');
        row.className = 'viz-tip__row';
        if (r.color) {
          const key = document.createElement('span');
          key.className = 'viz-tip__key';
          key.style.background = r.color;
          row.appendChild(key);
        }
        const v = document.createElement('strong');
        v.textContent = r.value;
        const l = document.createElement('span');
        l.textContent = r.label;
        row.append(v, l);
        tip.appendChild(row);
      }
      tip.hidden = false;
      const hw = host.clientWidth;
      const tw = tip.offsetWidth;
      const left = Math.min(Math.max(8, x + 14), hw - tw - 8);
      tip.style.left = `${x + 14 + tw > hw - 8 ? Math.max(8, x - tw - 14) : left}px`;
      tip.style.top = `${Math.max(4, y - tip.offsetHeight - 10)}px`;
    },
    hide() {
      tip.hidden = true;
    },
  };
}

export const fmt = (v: number, d = 2) => v.toFixed(d);
export const fmtSigned = (v: number, d = 2) => {
  const mag = Math.abs(v).toFixed(d);
  if (Number(mag) === 0) return mag; // no "−0.00"
  return (v > 0 ? '+' : '−') + mag;
};

/** Seeded random numbers, so demos look the same on every load. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(r: () => number) {
  const u = Math.max(r(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
