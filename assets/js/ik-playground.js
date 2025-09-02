(() => {
  'use strict';

  // DOM references
  const canvas = document.getElementById('ik-canvas');
  const loading = document.getElementById('ik-loading');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const hasCanvas = !!ctx;

  const el = (id) => document.getElementById(id);
  const algoSel = el('ikAlgo');
  const linksInput = el('links');
  const lenInput = el('len');
  const itersInput = el('iters');
  const gammaInput = el('gamma');
  const lambdaInput = el('lambda');
  const dampInput = el('damp');
  const pauseBox = el('pauseIK');
  const showGhost = el('showGhost');
  const showTrace = el('showTrace');
  const limitsEnabled = el('limitsEnabled');
  const limitDeg = el('limitDeg');
  const limitDegLabel = el('limitDegLabel');
  const showLimits = el('showLimits');
  const restBiasInput = el('restBias');
  const restLabel = el('restLabel');
  const setRestBtn = el('setRest');
  const resetRestBtn = el('resetRest');
  const moveNoneBtn = el('moveNone');
  const moveCircleBtn = el('moveCircle');
  const moveEightBtn = el('moveEight');
  const targetSpeed = el('targetSpeed');
  const speed2Label = el('speed2Label');
  const toggleHelpBtn = el('toggleHelp');
  const showMetrics = el('showMetrics');
  const help = el('ik-help');
  const closeHelp = el('closeHelp');

  const hudAlgo = el('hudAlgo');
  const hudErr = el('hudErr');
  const hudIters = el('hudIters');
  const hudFps = el('hudFps');

  const labels = {
    linksLabel: el('linksLabel'),
    lenLabel: el('lenLabel'),
    itersLabel: el('itersLabel'),
    gammaLabel: el('gammaLabel'),
    lambdaLabel: el('lambdaLabel'),
    dampLabel: el('dampLabel'),
  };

  const jtOnly = document.getElementById('jt-only');
  const dlsOnly = document.getElementById('dls-only');

  // World state
  let base = { x: (canvas ? canvas.width * 0.5 : 600), y: (canvas ? canvas.height * 0.5 : 350) };
  let target = { x: (canvas ? canvas.width * 0.75 : 900), y: (canvas ? canvas.height * 0.45 : 315) };
  let n = parseInt(linksInput.value, 10);
  let L = parseFloat(lenInput.value);
  let angles = new Float64Array(n).fill(0);
  let pts = new Array(n + 1).fill(0).map(() => ({ x: 0, y: 0 }));
  let cumAngles = new Float64Array(n).fill(0);
  let trace = [];
  let restAngles = new Float64Array(n).fill(0);
  let moveMode = 'none'; // 'none' | 'circle' | 'eight'
  let tAccum = 0;
  const errHistory = [];
  const ERR_CAP = 360;

  // Utilities
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const lerp = (a, b, t) => a + (b - a) * t;
  const toDeg = (r) => (r * 180) / Math.PI;

  function forwardKinematics() {
    let x = base.x, y = base.y, theta = 0;
    pts[0].x = x; pts[0].y = y;
    for (let i = 0; i < n; i++) {
      theta += angles[i];
      cumAngles[i] = theta;
      x += Math.cos(theta) * L;
      y += Math.sin(theta) * L;
      pts[i + 1].x = x; pts[i + 1].y = y;
    }
  }

  function clampAnglesToLimits() {
    if (!limitsEnabled || !limitsEnabled.checked) return false;
    const lim = (parseFloat(limitDeg.value || limitDeg) || 160) * Math.PI / 180;
    let changed = false;
    for (let i = 0; i < n; i++) {
      const before = angles[i];
      angles[i] = clamp(angles[i], -lim, lim);
      if (angles[i] !== before) changed = true;
    }
    if (changed) forwardKinematics();
    return changed;
  }

  function ccdStep(damping) {
    // one CCD sweep from tip back to base
    const iters = parseInt(itersInput.value, 10);
    for (let step = 0; step < iters; step++) {
      for (let i = n - 1; i >= 0; i--) {
        const jx = pts[i].x, jy = pts[i].y;
        const ex = pts[n].x, ey = pts[n].y;
        const v1x = ex - jx, v1y = ey - jy;
        const v2x = target.x - jx, v2y = target.y - jy;
        const a1 = Math.atan2(v1y, v1x);
        const a2 = Math.atan2(v2y, v2x);
        let dtheta = a2 - a1;
        // wrap to [-pi, pi]
        dtheta = Math.atan2(Math.sin(dtheta), Math.cos(dtheta));
        angles[i] += dtheta * damping;
        forwardKinematics();
        clampAnglesToLimits();
      }
      // Rest pose regularization (pull gently toward rest)
      const rb = parseFloat(restBiasInput ? restBiasInput.value : '0');
      if (rb > 0) {
        for (let i = 0; i < n; i++) angles[i] += (restAngles[i] - angles[i]) * rb;
        forwardKinematics();
        clampAnglesToLimits();
      }
    }
    return iters;
  }

  function fabrikStep() {
    const iters = parseInt(itersInput.value, 10);
    const damping = parseFloat(dampInput.value);
    // Copy positions
    const joints = pts.map(p => ({ x: p.x, y: p.y }));
    const base0 = { x: joints[0].x, y: joints[0].y };
    const totalLen = n * L;
    const distBT = dist(base0.x, base0.y, target.x, target.y);
    for (let k = 0; k < iters; k++) {
      if (distBT > totalLen + 1e-6) {
        // Unreachable: point all segments toward target
        for (let i = 0; i < n; i++) {
          const dirx = (target.x - joints[i].x);
          const diry = (target.y - joints[i].y);
          const d = Math.hypot(dirx, diry) || 1;
          joints[i + 1].x = joints[i].x + (dirx / d) * L;
          joints[i + 1].y = joints[i].y + (diry / d) * L;
        }
      } else {
        // Backward reaching: set end effector to target, then go to base
        joints[n].x = target.x; joints[n].y = target.y;
        for (let i = n - 1; i >= 0; i--) {
          const dirx = joints[i].x - joints[i + 1].x;
          const diry = joints[i].y - joints[i + 1].y;
          const d = Math.hypot(dirx, diry) || 1;
          const r = L / d;
          joints[i].x = joints[i + 1].x + dirx * r;
          joints[i].y = joints[i + 1].y + diry * r;
        }
        // Forward reaching: set base to original, then go to end
        joints[0].x = base0.x; joints[0].y = base0.y;
        for (let i = 0; i < n; i++) {
          const dirx = joints[i + 1].x - joints[i].x;
          const diry = joints[i + 1].y - joints[i].y;
          const d = Math.hypot(dirx, diry) || 1;
          const r = L / d;
          joints[i + 1].x = joints[i].x + dirx * r;
          joints[i + 1].y = joints[i].y + diry * r;
        }
      }
    }
    // Blend joints into pts for a mild damping effect
    for (let i = 0; i <= n; i++) {
      pts[i].x = lerp(pts[i].x, joints[i].x, damping);
      pts[i].y = lerp(pts[i].y, joints[i].y, damping);
    }
    // Update angles from positions
    for (let i = 0; i < n; i++) {
      const ax = pts[i].x, ay = pts[i].y;
      const bx = pts[i + 1].x, by = pts[i + 1].y;
      const vx = bx - ax, vy = by - ay;
      const theta = Math.atan2(vy, vx);
      // angle relative to previous global theta
      if (i === 0) angles[0] = theta;
      else {
        let prev = 0; for (let k2 = 0; k2 < i; k2++) prev += angles[k2];
        angles[i] = theta - prev;
      }
    }
    clampAnglesToLimits();
    const rb = parseFloat(restBiasInput ? restBiasInput.value : '0');
    if (rb > 0) { for (let i = 0; i < n; i++) angles[i] += (restAngles[i] - angles[i]) * rb; forwardKinematics(); clampAnglesToLimits(); }
    return iters;
  }

  function jacobianTransposeStep() {
    // Adaptive JT step: u = J^T r, v = J u, alpha = (r·v)/(v·v + eps)
    const iters = parseInt(itersInput.value, 10);
    const gammaMax = parseFloat(gammaInput.value); // cap on alpha
    const damping = parseFloat(dampInput.value);
    const eps = 1e-8;
    for (let k = 0; k < iters; k++) {
      const ex = pts[n].x, ey = pts[n].y;
      const rx = target.x - ex, ry = target.y - ey;
      const err2 = rx * rx + ry * ry;
      if (err2 < 0.25) break;

      // Build columns of J implicitly via joint positions
      // col_i = [- (ey - p_i.y), (ex - p_i.x)]
      const u = new Float64Array(n);
      let vx_sum = 0, vy_sum = 0; // v = J u (2D)
      for (let i = 0; i < n; i++) {
        const pix = pts[i].x, piy = pts[i].y;
        const colx = -(ey - piy);
        const coly = (ex - pix);
        const ui = colx * rx + coly * ry; // u_i = col_i^T r
        u[i] = ui;
        vx_sum += colx * ui;
        vy_sum += coly * ui;
      }

      const num = rx * vx_sum + ry * vy_sum; // r · v
      const den = vx_sum * vx_sum + vy_sum * vy_sum + eps; // ||v||^2
      let alpha = num / den;
      // Clamp alpha to a reasonable range
      alpha = clamp(alpha, 0, gammaMax);

      // Update angles with optional damping
      for (let i = 0; i < n; i++) angles[i] += (alpha * u[i]) * damping;
      clampAnglesToLimits();
      // Rest bias
      const rb = parseFloat(restBiasInput ? restBiasInput.value : '0');
      if (rb > 0) { for (let i = 0; i < n; i++) angles[i] += (restAngles[i] - angles[i]) * rb; }
      forwardKinematics();
    }
    return iters;
  }

  function dlsStep() {
    // Damped Least Squares: Δθ = J^T (J J^T + λ^2 I)^{-1} r
    const iters = parseInt(itersInput.value, 10);
    const lambda = parseFloat(lambdaInput.value);
    const damping = parseFloat(dampInput.value);
    const lam2 = lambda * lambda;
    const eps = 1e-9;
    for (let k = 0; k < iters; k++) {
      const ex = pts[n].x, ey = pts[n].y;
      const rx = target.x - ex, ry = target.y - ey;
      const err2 = rx * rx + ry * ry;
      if (err2 < 0.25) break;

      // Accumulate JJ^T (2x2) via columns of J
      let a11 = lam2, a12 = 0, a22 = lam2; // start with λ^2 I
      // We also need J^T * y later; store columns for reuse
      const cols = new Array(n);
      for (let i = 0; i < n; i++) {
        const colx = -(ey - pts[i].y);
        const coly = (ex - pts[i].x);
        cols[i] = [colx, coly];
        a11 += colx * colx;
        a12 += colx * coly;
        a22 += coly * coly;
      }

      // Invert A = [[a11, a12],[a12, a22]]
      const det = a11 * a22 - a12 * a12;
      const inv11 = (det ?  a22 / (det + eps) : 0);
      const inv12 = (det ? -a12 / (det + eps) : 0);
      const inv22 = (det ?  a11 / (det + eps) : 0);

      // y = A^{-1} r
      const yx = inv11 * rx + inv12 * ry;
      const yy = inv12 * rx + inv22 * ry;

      // Δθ = J^T y
      for (let i = 0; i < n; i++) {
        const col = cols[i];
        const ui = col[0] * yx + col[1] * yy;
        angles[i] += ui * damping;
      }
      clampAnglesToLimits();
      const rb = parseFloat(restBiasInput ? restBiasInput.value : '0');
      if (rb > 0) { for (let i = 0; i < n; i++) angles[i] += (restAngles[i] - angles[i]) * rb; }
      forwardKinematics();
    }
    return iters;
  }

  function resetChain() {
    n = parseInt(linksInput.value, 10);
    L = parseFloat(lenInput.value);
    angles = new Float64Array(n).fill(0);
    cumAngles = new Float64Array(n).fill(0);
    restAngles = new Float64Array(n).fill(0);
    pts = new Array(n + 1).fill(0).map(() => ({ x: 0, y: 0 }));
    forwardKinematics();
  }

  // Input wiring
  function updateLabels() {
    labels.linksLabel.textContent = linksInput.value;
    labels.lenLabel.textContent = lenInput.value;
    labels.itersLabel.textContent = itersInput.value;
    if (labels.gammaLabel && gammaInput) labels.gammaLabel.textContent = gammaInput.value;
    if (labels.lambdaLabel && lambdaInput) labels.lambdaLabel.textContent = lambdaInput.value;
    if (limitDegLabel && limitDeg) limitDegLabel.textContent = limitDeg.value;
    if (restLabel && restBiasInput) restLabel.textContent = parseFloat(restBiasInput.value).toFixed(2);
    if (speed2Label && targetSpeed) speed2Label.textContent = parseFloat(targetSpeed.value).toFixed(1);
    labels.dampLabel.textContent = dampInput.value;
    hudAlgo.textContent = algoSel.options[algoSel.selectedIndex].text;
  }
  [linksInput, lenInput].filter(Boolean).forEach(inp => inp.addEventListener('input', () => { resetChain(); updateLabels(); }));
  [itersInput, gammaInput, lambdaInput, dampInput, algoSel].filter(Boolean).forEach(inp => inp.addEventListener('input', updateLabels));
  algoSel.addEventListener('change', () => {
    jtOnly.style.display = algoSel.value === 'jt' ? 'flex' : 'none';
    dlsOnly.style.display = algoSel.value === 'dls' ? 'flex' : 'none';
  });

  if (setRestBtn) setRestBtn.addEventListener('click', () => { for (let i = 0; i < n; i++) restAngles[i] = angles[i]; });
  if (resetRestBtn) resetRestBtn.addEventListener('click', () => { restAngles = new Float64Array(n).fill(0); });
  if (moveNoneBtn) moveNoneBtn.addEventListener('click', () => moveMode = 'none');
  if (moveCircleBtn) moveCircleBtn.addEventListener('click', () => moveMode = 'circle');
  if (moveEightBtn) moveEightBtn.addEventListener('click', () => moveMode = 'eight');
  if (toggleHelpBtn) toggleHelpBtn.addEventListener('click', () => { if (help) help.hidden = false; });
  if (closeHelp) closeHelp.addEventListener('click', () => { if (help) help.hidden = true; });
  
  // Help modal backdrop click and escape key to close
  if (help) {
    help.addEventListener('click', (e) => {
      if (e.target === help || e.target.classList.contains('ik-help-backdrop')) {
        help.hidden = true;
      }
    });
  }

  // Event delegation fallback so buttons always work
  document.addEventListener('click', (e) => {
    if (!e.target || !e.target.closest) return;
    const ids = ['setRest','resetRest','moveNone','moveCircle','moveEight','toggleHelp','closeHelp'];
    let id = null;
    for (const key of ids) { if (e.target.closest('#' + key)) { id = key; break; } }
    if (!id) return;
    e.preventDefault();
    if (id === 'setRest') {
      for (let i = 0; i < n; i++) restAngles[i] = angles[i];
      updateLabels();
    } else if (id === 'resetRest') {
      restAngles = new Float64Array(n).fill(0);
      updateLabels();
    } else if (id === 'moveNone') {
      moveMode = 'none';
    } else if (id === 'moveCircle') {
      moveMode = 'circle';
    } else if (id === 'moveEight') {
      moveMode = 'eight';
    } else if (id === 'toggleHelp') {
      if (help) help.hidden = false;
    } else if (id === 'closeHelp') {
      if (help) help.hidden = true;
    }
  });

  // Mouse interaction: drag target; Shift to drag base
  let dragging = null; // 'target' | 'base' | null
  const getMouse = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  };
  if (canvas) canvas.addEventListener('pointerdown', (e) => {
    const m = getMouse(e);
    const db = dist(m.x, m.y, base.x, base.y);
    const dt = dist(m.x, m.y, target.x, target.y);
    if (e.shiftKey || db < 20) dragging = 'base';
    else dragging = 'target';
    if (dragging === 'base') { base.x = m.x; base.y = m.y; }
    else { target.x = m.x; target.y = m.y; }
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const m = getMouse(e);
    if (dragging === 'base') { base.x = m.x; base.y = m.y; }
    else { target.x = m.x; target.y = m.y; }
  });
  window.addEventListener('pointerup', () => dragging = null);

  // Rendering
  function draw() {
    if (!hasCanvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // backdrop grid
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#0ea5a5';
    ctx.lineWidth = 1;
    const s = 40;
    for (let x = 0; x < canvas.width; x += s) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y < canvas.height; y += s) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    ctx.restore();

    // reach circle
    if (showGhost.checked) {
      ctx.save();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(base.x, base.y, n * L, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // target, color by reachability
    ctx.save();
    const reachable = dist(base.x, base.y, target.x, target.y) <= n * L + 1e-6;
    ctx.fillStyle = reachable ? '#f59e0b' : '#ef4444';
    ctx.beginPath();
    ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = reachable ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.45)';
    ctx.beginPath(); ctx.moveTo(target.x - 12, target.y); ctx.lineTo(target.x + 12, target.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(target.x, target.y - 12); ctx.lineTo(target.x, target.y + 12); ctx.stroke();
    ctx.restore();

    // trace
    if (showTrace.checked && trace.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(59,130,246,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trace[0].x, trace[0].y);
      for (let i = 1; i < trace.length; i++) ctx.lineTo(trace[i].x, trace[i].y);
      ctx.stroke();
      ctx.restore();
    }

    // links
    ctx.save();
    for (let i = 0; i < n; i++) {
      // bone
      ctx.lineCap = 'round';
      ctx.lineWidth = 10;
      ctx.strokeStyle = i === n - 1 ? '#60a5fa' : '#34d399';
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
      // joint
      ctx.fillStyle = '#0ea5a5';
      ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, 6, 0, Math.PI * 2); ctx.fill();

      // joint limit arcs
      if (showLimits && showLimits.checked && limitsEnabled && limitsEnabled.checked) {
        const lim = (parseFloat(limitDeg.value || '160') * Math.PI / 180);
        const a0 = i === 0 ? 0 : cumAngles[i - 1]; // parent global angle
        const start = a0 - lim;
        const end = a0 + lim;
        ctx.strokeStyle = 'rgba(16,185,129,0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 18, start, end);
        ctx.stroke();
      }
    }
    // end effector marker
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(pts[n].x, pts[n].y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // metrics mini-plot (error over time)
    if (showMetrics && showMetrics.checked) {
      const w = 240, h = 80, pad = 8;
      const x0 = canvas.width - w - 12, y0 = 12;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(2,6,23,0.75)';
      ctx.strokeStyle = 'rgba(16,185,129,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, w, h, 8) : ctx.rect(x0, y0, w, h); ctx.fill(); ctx.stroke();
      const maxErr = Math.max(10, ...errHistory);
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      errHistory.forEach((e, i) => {
        const x = x0 + pad + (i / Math.max(1, ERR_CAP - 1)) * (w - 2 * pad);
        const y = y0 + h - pad - (e / maxErr) * (h - 2 * pad);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '12px ui-monospace, SF Mono, monospace';
      ctx.fillText('Error', x0 + 10, y0 + 16);
      ctx.restore();
    }
  }

  // Main loop
  let lastT = performance.now();
  let fps = 0;
  function tick(t) {
    const dt = (t - lastT) / 1000; lastT = t;
    fps = lerp(fps, 1 / Math.max(1e-3, dt), 0.1);

    // Moving target presets
    const sp = targetSpeed ? parseFloat(targetSpeed.value) : 1.0;
    tAccum += dt * sp;
    if (moveMode === 'circle') {
      const A = n * L * 0.65;
      target.x = base.x + A * Math.cos(1.2 * tAccum);
      target.y = base.y + A * Math.sin(1.2 * tAccum);
    } else if (moveMode === 'eight') {
      const A = n * L * 0.55;
      target.x = base.x + A * Math.sin(1.2 * tAccum);
      target.y = base.y + A * Math.sin(2.4 * tAccum) * 0.6;
    }

    if (!pauseBox.checked) {
      let iterations = 0;
      if (algoSel.value === 'ccd') iterations = ccdStep(parseFloat(dampInput.value));
      else if (algoSel.value === 'fabrik') iterations = fabrikStep();
      else if (algoSel.value === 'jt') iterations = jacobianTransposeStep();
      else iterations = dlsStep();
      hudIters.textContent = iterations.toString();
    }

    const e = dist(pts[n].x, pts[n].y, target.x, target.y);
    hudErr.textContent = e.toFixed(2) + ' px';
    hudFps.textContent = Math.round(fps).toString();
    errHistory.push(e);
    if (errHistory.length > ERR_CAP) errHistory.shift();

    // trace
    if (showTrace.checked) {
      trace.push({ x: pts[n].x, y: pts[n].y });
      if (trace.length > 1000) trace.shift();
    } else trace.length = 0;

    draw();
    requestAnimationFrame(tick);
  }

  // Init
  updateLabels();
  if (jtOnly) jtOnly.style.display = algoSel.value === 'jt' ? 'flex' : 'none';
  if (dlsOnly) dlsOnly.style.display = algoSel.value === 'dls' ? 'flex' : 'none';
  forwardKinematics();
  if (loading) loading.style.display = 'none';
  requestAnimationFrame(tick);

  // Keyboard shortcuts: p=pause, t=trace, g=ghost, 1..4 algo
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
    if (e.key === 'p') { pauseBox.checked = !pauseBox.checked; }
    else if (e.key === 't') { showTrace.checked = !showTrace.checked; }
    else if (e.key === 'g') { showGhost.checked = !showGhost.checked; }
    else if (e.key === 'k') { if (showMetrics) showMetrics.checked = !showMetrics.checked; }
    else if (e.key === '?') { if (help) help.hidden = !help.hidden; }
    else if (e.key === 'Escape') { if (help && !help.hidden) help.hidden = true; }
    else if (e.key === 'c') { moveMode = 'circle'; }
    else if (e.key === 'l') { moveMode = 'eight'; }
    else if (e.key === 's') { moveMode = 'none'; }
    else if (e.key === '1') { algoSel.value = 'ccd'; algoSel.dispatchEvent(new Event('change')); }
    else if (e.key === '2') { algoSel.value = 'fabrik'; algoSel.dispatchEvent(new Event('change')); }
    else if (e.key === '3') { algoSel.value = 'jt'; algoSel.dispatchEvent(new Event('change')); }
    else if (e.key === '4') { algoSel.value = 'dls'; algoSel.dispatchEvent(new Event('change')); }
  });

  // Load state from URL (share links)
  try {
    const q = new URLSearchParams(location.search);
    const get = (k, def) => q.has(k) ? q.get(k) : def;
    const setIf = (el, k) => { if (el && q.has(k)) el.value = q.get(k); };
    if (q.size) {
      const algo = get('algo', null); if (algo) algoSel.value = algo;
      setIf(linksInput, 'n'); setIf(lenInput, 'L'); setIf(itersInput, 'it');
      setIf(gammaInput, 'g'); setIf(lambdaInput, 'la'); setIf(dampInput, 'd');
      if (pauseBox) pauseBox.checked = get('px','0') === '1';
      if (showGhost) showGhost.checked = get('rg','1') === '1';
      if (showTrace) showTrace.checked = get('tr','0') === '1';
      if (limitsEnabled) limitsEnabled.checked = get('lm','0') === '1';
      setIf(limitDeg, 'ld');
      if (showLimits) showLimits.checked = get('sl','0') === '1';
      setIf(restBiasInput, 'rb');
      const mx = parseFloat(get('mx', NaN)), my = parseFloat(get('my', NaN));
      const tx = parseFloat(get('tx', NaN)), ty = parseFloat(get('ty', NaN));
      if (Number.isFinite(mx) && Number.isFinite(my)) { base.x = mx; base.y = my; }
      if (Number.isFinite(tx) && Number.isFinite(ty)) { target.x = tx; target.y = ty; }
      const mv = get('mv', 'none'); if (['none','circle','eight'].includes(mv)) moveMode = mv;
      setIf(targetSpeed, 'sp');
      resetChain();
      updateLabels();
      algoSel.dispatchEvent(new Event('change'));
    }
  } catch {}
})();
