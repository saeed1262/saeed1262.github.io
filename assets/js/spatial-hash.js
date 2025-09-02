(() => {
  'use strict';

  const canvas = document.getElementById('hash-viz');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const loadingEl = document.getElementById('loading');
  const noCanvasEl = document.getElementById('noCanvas');

  if (!canvas || !ctx) {
    if (loadingEl) loadingEl.hidden = true;
    if (noCanvasEl) noCanvasEl.hidden = false;
    return;
  }

  // Controls
  const algoSel = document.getElementById('algo');
  const countRange = document.getElementById('count');
  const cellRange = document.getElementById('cell');
  const speedRange = document.getElementById('speed');
  const showGridCb = document.getElementById('showGrid');
  const showCandCb = document.getElementById('showCandidates');
  const pauseCb = document.getElementById('pause');

  // HUD
  const hud = {
    algo: document.getElementById('hudAlgo'),
    count: document.getElementById('hudCount'),
    cell: document.getElementById('hudCell'),
    pairs: document.getElementById('hudPairs'),
    checks: document.getElementById('hudChecks'),
    fps: document.getElementById('hudFps'),
  };

  // Labels
  const labels = {
    count: document.getElementById('countLabel'),
    cell: document.getElementById('cellLabel'),
    speed: document.getElementById('speedLabel'),
  };

  // Resize canvas to container (maintain CSS aspect ratio via CSS, but set DPR for crispness)
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // Simulation state
  let objects = [];
  let gridSize = parseInt(cellRange.value, 10) || 32;
  let algo = algoSel.value; // 'hash' | 'naive'
  let speedScale = parseFloat(speedRange.value) || 1.0;
  let bounds = { w: 1280, h: 720 };
  let lastTs = 0;
  let fps = 0;

  // Metrics per frame
  let checks = 0;
  let bpPairs = 0;

  // Broad-phase candidate lines for visualization
  let candLines = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function initObjects(n) {
    const radiusMin = 4, radiusMax = 8;
    objects = new Array(n).fill(0).map(() => {
      const r = rand(radiusMin, radiusMax);
      return {
        x: rand(r + 2, bounds.w - r - 2),
        y: rand(r + 2, bounds.h - r - 2),
        vx: rand(-60, 60),
        vy: rand(-60, 60),
        r,
        hue: Math.floor(rand(180, 260)),
        colliding: false,
      };
    });
  }

  function updateBoundsFromCss() {
    const rect = canvas.getBoundingClientRect();
    bounds.w = rect.width;
    bounds.h = rect.height;
  }

  // Spatial hash using integer grid keys "gx,gy"
  function buildSpatialHash(objs, cell) {
    const map = new Map();
    const inv = 1 / cell;
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      const minGX = Math.floor((o.x - o.r) * inv);
      const minGY = Math.floor((o.y - o.r) * inv);
      const maxGX = Math.floor((o.x + o.r) * inv);
      const maxGY = Math.floor((o.y + o.r) * inv);
      for (let gy = minGY; gy <= maxGY; gy++) {
        for (let gx = minGX; gx <= maxGX; gx++) {
          const key = gx + ',' + gy;
          let arr = map.get(key);
          if (!arr) { arr = []; map.set(key, arr); }
          arr.push(i);
        }
      }
    }
    return map;
  }

  // Broad-phase using spatial hash; returns unique candidate pairs
  function broadPhaseHash(objs, cell) {
    const grid = buildSpatialHash(objs, cell);
    const pairs = [];
    const seen = new Set();
    // neighbor offsets to cover same and adjacent cells (Moore neighborhood)
    const N = [-1, 0, 1];
    for (const [key, indices] of grid.entries()) {
      const [gx, gy] = key.split(',').map(Number);
      for (let dy of N) {
        for (let dx of N) {
          const k2 = (gx + dx) + ',' + (gy + dy);
          const arr = grid.get(k2);
          if (!arr) continue;
          for (let i = 0; i < indices.length; i++) {
            for (let j = 0; j < arr.length; j++) {
              const a = indices[i];
              const b = arr[j];
              if (a >= b) continue; // enforce i<j
              const code = (a << 20) + b; // compact pair key for set (safe up to ~1M objs)
              if (seen.has(code)) continue;
              seen.add(code);
              pairs.push([a, b]);
            }
          }
        }
      }
    }
    return pairs;
  }

  function broadPhaseNaive(objs) {
    const pairs = [];
    const n = objs.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        pairs.push([i, j]);
      }
    }
    return pairs;
  }

  function narrowPhase(objs, pairs) {
    checks = 0;
    let collisions = 0;
    // Reset colliding flags
    for (let o of objs) o.colliding = false;

    for (let k = 0; k < pairs.length; k++) {
      const [i, j] = pairs[k];
      const a = objs[i], b = objs[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const r = a.r + b.r;
      checks++;
      if (dx * dx + dy * dy <= r * r) {
        a.colliding = b.colliding = true;
        collisions++;
      }
    }
    return collisions;
  }

  function step(dt) {
    const s = speedScale;
    const w = bounds.w, h = bounds.h;
    for (let o of objects) {
      o.x += o.vx * s * dt;
      o.y += o.vy * s * dt;
      // Bounce on walls
      if (o.x < o.r) { o.x = o.r; o.vx *= -1; }
      if (o.x > w - o.r) { o.x = w - o.r; o.vx *= -1; }
      if (o.y < o.r) { o.y = o.r; o.vy *= -1; }
      if (o.y > h - o.r) { o.y = h - o.r; o.vy *= -1; }
    }
  }

  function drawGrid(cell) {
    if (!showGridCb.checked) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(96,165,250,0.15)';
    ctx.lineWidth = 1;
    const w = bounds.w, h = bounds.h;
    for (let x = 0; x <= w; x += cell) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += cell) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0, 0, bounds.w, bounds.h);
    drawGrid(gridSize);

    // Candidate pair lines (broad-phase)
    if (showCandCb && showCandCb.checked && candLines.length) {
      ctx.save();
      ctx.strokeStyle = 'rgba(148,163,184,0.22)';
      ctx.lineWidth = 0.8;
      for (let [x1, y1, x2, y2] of candLines) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // (Removed) narrow-phase pair lines; collisions still highlighted via circle color

    // Circles
    for (let o of objects) {
      const fill = o.colliding ? `hsla(350, 85%, 60%, 0.95)` : `hsla(${o.hue}, 70%, 60%, 0.9)`;
      const stroke = o.colliding ? 'rgba(239,68,68,0.9)' : 'rgba(148,163,184,0.6)';
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.033, (ts - lastTs) / 1000);
    lastTs = ts;

    // FPS (EMA)
    const inst = 1 / Math.max(dt, 1e-6);
    fps = fps ? fps * 0.9 + inst * 0.1 : inst;

    if (!pauseCb.checked) step(dt);

    // Broad-phase
    let pairs;
    if (algo === 'hash') {
      pairs = broadPhaseHash(objects, gridSize);
    } else {
      pairs = broadPhaseNaive(objects);
    }
    bpPairs = pairs.length;
    // Candidate pair lines (broad-phase visualization)
    candLines.length = 0;
    if (showCandCb && showCandCb.checked && pairs.length) {
      for (let k = 0; k < pairs.length; k++) {
        const [i, j] = pairs[k];
        const a = objects[i], b = objects[j];
        candLines.push([a.x, a.y, b.x, b.y]);
      }
    }

    // Narrow-phase
    narrowPhase(objects, pairs);

    // Draw
    render();

    // HUD
    hud.algo.textContent = algo === 'hash' ? 'Spatial Hash' : 'Naïve';
    hud.count.textContent = String(objects.length);
    hud.cell.textContent = `${gridSize} px`;
    hud.pairs.textContent = String(bpPairs);
    hud.checks.textContent = String(checks);
    hud.fps.textContent = Math.round(fps).toString();

    requestAnimationFrame(tick);
  }

  function syncLabels() {
    labels.count.textContent = countRange.value;
    labels.cell.textContent = cellRange.value;
    labels.speed.textContent = `${parseFloat(speedRange.value).toFixed(2)}x`.replace('.00', '.0');
  }

  function rebuildCount() {
    const n = parseInt(countRange.value, 10) || 300;
    initObjects(n);
  }

  // Wire controls
  algoSel.addEventListener('change', () => { algo = algoSel.value; });
  countRange.addEventListener('input', () => { syncLabels(); rebuildCount(); });
  cellRange.addEventListener('input', () => { gridSize = parseInt(cellRange.value, 10) || 32; syncLabels(); });
  speedRange.addEventListener('input', () => { speedScale = parseFloat(speedRange.value) || 1.0; syncLabels(); });

  // Init
  function init() {
    updateBoundsFromCss();
    resizeCanvas();
    rebuildCount();
    syncLabels();
    if (loadingEl) loadingEl.hidden = true;
    requestAnimationFrame(tick);
  }

  // Delay init to ensure layout CSS is applied
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0));
  }
})();
