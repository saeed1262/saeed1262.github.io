// Top-down view of planted ankles for the ZeroEGGS feet player: one panel per track, one line per contact, as long as
// the foot slid. Lines grow with the video; `update(frame)` draws everything up to that frame.
import { floorRuns, type Clip, type FloorRun } from '@/scripts/motion-clip';

const SVGNS = 'http://www.w3.org/2000/svg';

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  parent.appendChild(n);
  return n;
}

export function createFloorView(panels: HTMLElement, clip: Clip): (frame: number) => void {
  const tracks = clip.header.tracks;
  const runs = tracks.map((_, t) => floorRuns(clip, t));
  const centres = runs.map((rs) => {
    const pts = rs.flatMap((r) => r.points);
    return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  });
  // One scale for every panel, so line lengths compare across them.
  const half = 0.06 + Math.max(0.2, ...runs.map((rs, i) => Math.max(...rs.flatMap((r) => r.points)
    .map(([x, z]) => Math.max(Math.abs(x - centres[i][0]), Math.abs(z - centres[i][1]))))));
  const marks: { run: FloorRun; line: SVGPolylineElement; dot: SVGCircleElement; cx: number; cz: number }[] = [];
  panels.replaceChildren();
  tracks.forEach((track, i) => {
    const panel = document.createElement('div');
    panel.className = 'vp__floor-panel';
    const title = document.createElement('p');
    title.textContent = track.label;
    panel.appendChild(title);
    const svg = el('svg', { viewBox: `${-half} ${-half} ${2 * half} ${2 * half}`, role: 'img',
      'aria-label': `${track.label}: planted ankles seen from above` }, panel);
    for (let g = -Math.floor(half * 10) / 10; g <= half; g += 0.1) {
      el('line', { x1: g, x2: g, y1: -half, y2: half, class: 'vp__floor-grid' }, svg);
      el('line', { x1: -half, x2: half, y1: g, y2: g, class: 'vp__floor-grid' }, svg);
    }
    el('line', { x1: half - 0.14, x2: half - 0.04, y1: half - 0.04, y2: half - 0.04, class: 'vp__floor-scale' }, svg);
    el('text', { x: half - 0.09, y: half - 0.06, class: 'vp__floor-scale-text' }, svg).textContent = '10 cm';
    for (const run of runs[i]) {
      const line = el('polyline', { fill: 'none', stroke: track.color, class: 'vp__floor-line' }, svg);
      const dot = el('circle', { r: 0.011, fill: track.color }, svg);
      marks.push({ run, line, dot, cx: centres[i][0], cz: centres[i][1] });
    }
    panels.appendChild(panel);
  });

  return (frame: number) => {
    for (const { run, line, dot, cx, cz } of marks) {
      const n = Math.max(0, Math.min(run.end, frame + 1) - run.start);
      const pts = run.points.slice(0, n);
      line.setAttribute('points', pts.map(([x, z]) => `${(x - cx).toFixed(4)},${(z - cz).toFixed(4)}`).join(' '));
      dot.style.display = n ? '' : 'none';
      if (n) {
        dot.setAttribute('cx', (pts[n - 1][0] - cx).toFixed(4));
        dot.setAttribute('cy', (pts[n - 1][1] - cz).toFixed(4));
      }
    }
  };
}
