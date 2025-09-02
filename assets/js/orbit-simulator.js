// Orbital Rendezvous Simulator (module)
// Extracted and scoped for page-level inclusion

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function initOrbitSimulator(root = document) {
  const container = root.getElementById('orbit-viz');
  if (!container) return;

  // WebGL check
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    container.innerHTML = '<div class="no-webgl">WebGL is not supported in your browser</div>';
    return;
  }

  container.innerHTML = '<div class="loading">Loading Orbital Simulator</div>';

  const EARTH_RADIUS = 1.0;
  const MU = 1.0;

  const EARTH_RADIUS_KM = 6371.0;
  const TU_TO_SECONDS = Math.sqrt(EARTH_RADIUS_KM * EARTH_RADIUS_KM * EARTH_RADIUS_KM / 398600.4418);
  const VU_TO_KM_S = EARTH_RADIUS_KM / TU_TO_SECONDS;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let params = { playing: true, timeScale: 1.0, burnMagnitude: 0.03, dt: 0.01, realWorldUnits: false };
  let time = 0; let dvBudget = 0; let currentScenario = null;

  let chaserElements = [1.0, 0.0, 0.0, 0.0];
  let targetElements = [1.0, 0.0, 0.0, Math.PI/6];

  let scene, camera, renderer, controls;
  let earthMesh, chaserMesh, targetMesh;
  let chaserTrail, targetTrail, ghostTrail;
  let chaserTrailGeometry, targetTrailGeometry, ghostTrailGeometry;
  let particleSystem, chaserGlow, targetGlow, earthGlow;
  let periMarker, apoMarker, periLabel, apoLabel;
  let periBurnArrow, apoBurnArrow;

  // Cache for expensive prediction
  let caCache = { result: null, lastAt: -Infinity, interval: 0.3 }; // seconds of sim time

  function keplerSolve(M, e, tolerance = 1e-8) {
    let E = M;
    for (let i = 0; i < 10; i++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      E -= dE; if (Math.abs(dE) < tolerance) break;
    }
    return E;
  }

  function elementsToState(elements) {
    const [a, e, omega, nu] = elements;
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    const cosOmegaNu = Math.cos(omega + nu); const sinOmegaNu = Math.sin(omega + nu);
    const position = new THREE.Vector3(r * cosOmegaNu, r * sinOmegaNu, 0);
    const h = Math.sqrt(MU * a * (1 - e * e));
    const vx = -(MU / h) * Math.sin(omega + nu);
    const vy = (MU / h) * (e + Math.cos(omega + nu));
    const velocity = new THREE.Vector3(vx, vy, 0);
    return { position, velocity, r, speed: velocity.length() };
  }

  function stateToElements(position, velocity) {
    const r = position.length();
    const v = velocity.length();
    const h_vec = new THREE.Vector3().crossVectors(position, velocity);
    const h = h_vec.length();
    const e_vec = new THREE.Vector3().crossVectors(velocity, h_vec).divideScalar(MU).sub(position.clone().normalize());
    let e = e_vec.length();
    const energy = 0.5 * v * v - (MU / r);
    const a = -MU / (2 * energy);
    let omega, nu;
    if (e < 1e-6) { omega = 0; nu = Math.atan2(position.y, position.x); }
    else {
      omega = Math.atan2(e_vec.y, e_vec.x);
      const cos_nu = e_vec.dot(position) / (e * r);
      const sin_nu = h_vec.dot(new THREE.Vector3().crossVectors(e_vec, position)) / (h * e * r);
      nu = Math.atan2(sin_nu, cos_nu);
    }
    while (nu < 0) nu += 2 * Math.PI; while (nu > 2 * Math.PI) nu -= 2 * Math.PI;
    if (e < 1e-6) e = 0; // clamp tiny eccentricities
    return [a, e, omega, nu];
  }

  function propagateOrbit(elements, dt) {
    const [a, e, omega, nu_old] = elements;
    const cos_E_old = (e + Math.cos(nu_old)) / (1 + e * Math.cos(nu_old));
    const sin_E_old = Math.sqrt(1 - e * e) * Math.sin(nu_old) / (1 + e * Math.cos(nu_old));
    const E_old = Math.atan2(sin_E_old, cos_E_old);
    const M_old = E_old - e * Math.sin(E_old);
    const n = Math.sqrt(MU / (a * a * a));
    const M_new = M_old + n * dt;
    const E_new = keplerSolve(M_new, e);
    const cos_nu_new = (Math.cos(E_new) - e) / (1 - e * Math.cos(E_new));
    const sin_nu_new = Math.sqrt(1 - e * e) * Math.sin(E_new) / (1 - e * Math.cos(E_new));
    const nu_new = Math.atan2(sin_nu_new, cos_nu_new);
    return [a, e, omega, nu_new];
  }

  function applyBurn(elements, deltaV) {
    const state = elementsToState(elements);
    const newVelocity = state.velocity.clone().add(deltaV);
    return stateToElements(state.position, newVelocity);
  }

  function computePhaseAngle(chaserElements, targetElements) {
    const phase = targetElements[3] - chaserElements[3];
    let p = phase; while (p < 0) p += 2 * Math.PI; while (p > 2 * Math.PI) p -= 2 * Math.PI; return p;
  }

  function predictClosestApproach(chaserE, targetE, maxTime = null) {
    if (maxTime === null) {
      const [a] = chaserE; const P = 2 * Math.PI * Math.sqrt(a * a * a / MU); maxTime = 1.5 * P;
    }
    let minRange = Infinity; let timeToCA = 0; let chaserStateAtCA = null; let targetStateAtCA = null;
    const dt = 0.01; const steps = Math.floor(maxTime / dt);
    let cE = [...chaserE]; let tE = [...targetE];
    for (let i = 0; i < steps; i++) {
      const cS = elementsToState(cE); const tS = elementsToState(tE);
      const range = cS.position.distanceTo(tS.position);
      if (range < minRange) { minRange = range; timeToCA = i * dt; chaserStateAtCA = { ...cS }; targetStateAtCA = { ...tS }; }
      cE = propagateOrbit(cE, dt); tE = propagateOrbit(tE, dt);
    }
    return { minRange, timeToCA, chaserStateAtCA, targetStateAtCA };
  }

  function createTrailGeometry(maxPoints = 500) {
    const positions = new Float32Array(maxPoints * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0); return geometry;
  }

  function updateTrail(trailGeometry, newPosition, maxPoints = 500) {
    const positions = trailGeometry.attributes.position.array; const currentCount = trailGeometry.drawRange.count;
    if (currentCount < maxPoints) {
      const index = currentCount * 3; positions[index] = newPosition.x; positions[index+1] = newPosition.y; positions[index+2] = newPosition.z; trailGeometry.setDrawRange(0, currentCount + 1);
    } else {
      for (let i = 0; i < (maxPoints - 1) * 3; i++) { positions[i] = positions[i + 3]; }
      const index = (maxPoints - 1) * 3; positions[index] = newPosition.x; positions[index+1] = newPosition.y; positions[index+2] = newPosition.z;
    }
    trailGeometry.attributes.position.needsUpdate = true;
  }

  function updateHUD() {
    const chaserState = elementsToState(chaserElements);
    const targetState = elementsToState(targetElements);
    const [chaserA, chaserE] = chaserElements; const chaserPeriod = 2 * Math.PI * Math.sqrt(chaserA * chaserA * chaserA / MU);
    const [targetA, targetE] = targetElements; const targetPeriod = 2 * Math.PI * Math.sqrt(targetA * targetA * targetA / MU);

    if (params.realWorldUnits) {
      document.getElementById('chaser-a').textContent = `${(chaserA * EARTH_RADIUS_KM).toFixed(0)} km`;
      document.getElementById('chaser-period').textContent = `${(chaserPeriod * TU_TO_SECONDS / 60).toFixed(1)} min`;
      document.getElementById('chaser-speed').textContent = `${(chaserState.speed * VU_TO_KM_S).toFixed(2)} km/s`;
      document.getElementById('target-a').textContent = `${(targetA * EARTH_RADIUS_KM).toFixed(0)} km`;
      document.getElementById('target-period').textContent = `${(targetPeriod * TU_TO_SECONDS / 60).toFixed(1)} min`;
    } else {
      document.getElementById('chaser-a').textContent = `${chaserA.toFixed(3)} R⊕`;
      document.getElementById('chaser-period').textContent = `${chaserPeriod.toFixed(2)} TU`;
      document.getElementById('chaser-speed').textContent = `${chaserState.speed.toFixed(3)} VU`;
      document.getElementById('target-a').textContent = `${targetA.toFixed(3)} R⊕`;
      document.getElementById('target-period').textContent = `${targetPeriod.toFixed(2)} TU`;
    }
    document.getElementById('chaser-e').textContent = chaserE.toFixed(3);
    document.getElementById('target-e').textContent = targetE.toFixed(3);

    const phaseAngle = computePhaseAngle(chaserElements, targetElements);
    document.getElementById('phase-angle').textContent = `${(phaseAngle * 180 / Math.PI).toFixed(1)}°`;

    const range = chaserState.position.distanceTo(targetState.position);
    const relativeVel = new THREE.Vector3().subVectors(chaserState.velocity, targetState.velocity);
    const closingRate = -relativeVel.dot(new THREE.Vector3().subVectors(targetState.position, chaserState.position).normalize());
    if (params.realWorldUnits) {
      document.getElementById('relative-range').textContent = `${(range * EARTH_RADIUS_KM).toFixed(1)} km`;
      document.getElementById('closing-rate').textContent = `${(closingRate * VU_TO_KM_S).toFixed(3)} km/s`;
      document.getElementById('dv-budget').textContent = `${(dvBudget * VU_TO_KM_S).toFixed(2)} km/s`;
    } else {
      document.getElementById('relative-range').textContent = `${range.toFixed(3)} R⊕`;
      document.getElementById('closing-rate').textContent = `${closingRate.toFixed(3)} VU`;
      document.getElementById('dv-budget').textContent = `${dvBudget.toFixed(3)} VU`;
    }

    // Throttled closest-approach prediction
    if (!caCache.result || (time - caCache.lastAt) >= caCache.interval) {
      caCache.result = predictClosestApproach(chaserElements, targetElements);
      caCache.lastAt = time;
    }
    const ca = caCache.result;
    if (params.realWorldUnits) {
      document.getElementById('time-to-ca').textContent = ca.timeToCA > 0 ? `${(ca.timeToCA * TU_TO_SECONDS / 60).toFixed(1)} min` : '-- min';
      document.getElementById('min-range').textContent = `${(ca.minRange * EARTH_RADIUS_KM).toFixed(1)} km`;
    } else {
      document.getElementById('time-to-ca').textContent = ca.timeToCA > 0 ? `${ca.timeToCA.toFixed(1)} TU` : '-- TU';
      document.getElementById('min-range').textContent = `${ca.minRange.toFixed(3)} R⊕`;
    }

    const mode = params.playing ? 'Running' : 'Paused';
    document.getElementById('orbit-status').textContent = params.realWorldUnits
      ? `${mode} | Time: ${(time * TU_TO_SECONDS / 60).toFixed(1)} min | Range: ${(range * EARTH_RADIUS_KM).toFixed(1)} km`
      : `${mode} | Time: ${time.toFixed(1)} TU | Range: ${range.toFixed(3)} R⊕`;
  }

  function positionAtTrueAnomaly(a, e, omega, nu) {
    const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
    const ang = omega + nu; return new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0);
  }

  function createBurnArrow(color = 0x22c55e, size = 0.08) {
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, size, 8), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 }));
    shaft.rotation.z = Math.PI / 2; group.add(shaft);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.04, 8), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 }));
    head.position.x = size / 2 + 0.02; head.rotation.z = -Math.PI / 2; group.add(head);
    return group;
  }

  function updateGhostBurnArrows() {
    if (!periBurnArrow || !apoBurnArrow) return;
    const show = (currentScenario === 'hohmann');
    periBurnArrow.visible = show; apoBurnArrow.visible = show;
    if (show) {
      const [a, e, omega] = chaserElements;
      const periPos = positionAtTrueAnomaly(a, e, omega, 0);
      const apoPos = positionAtTrueAnomaly(a, e, omega, Math.PI);
      periBurnArrow.position.copy(periPos); apoBurnArrow.position.copy(apoPos);
      const periTangent = Math.atan2(periPos.y, periPos.x) + Math.PI/2;
      const apoTangent = Math.atan2(apoPos.y, apoPos.x) + Math.PI/2;
      periBurnArrow.rotation.z = periTangent; apoBurnArrow.rotation.z = apoTangent;
      const pulse = prefersReducedMotion ? 1.0 : 0.8 + 0.2 * Math.sin(time * 4);
      periBurnArrow.scale.setScalar(pulse); apoBurnArrow.scale.setScalar(pulse);
    }
  }

  function createGlow(color, size) {
    const glow = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.BackSide }));
    return glow;
  }
  function createMarker(color = 0x00e5ff, size = 0.035) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), new THREE.MeshPhongMaterial({ color, emissive: 0x000000, shininess: 80, specular: 0x444444 }));
    mesh.castShadow = true; return mesh;
  }
  function makeTextSprite(text, color = '#e5e7eb', fontSize = 48) {
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const pad = 16;
    ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
    const w = Math.ceil(ctx.measureText(text).width) + pad * 2; const h = fontSize + pad * 2;
    canvas.width = w; canvas.height = h;
    const grd = ctx.createLinearGradient(0,0,w,h); grd.addColorStop(0, 'rgba(30,41,59,0.8)'); grd.addColorStop(1, 'rgba(15,23,42,0.8)');
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h); ctx.strokeStyle = 'rgba(59,130,246,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(1,1,w-2,h-2);
    ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`; ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.fillText(text, w/2, h/2);
    const texture = new THREE.CanvasTexture(canvas); texture.anisotropy = 4; texture.needsUpdate = true;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    const scale = 0.45; sprite.scale.set(canvas.width / 200 * scale, canvas.height / 200 * scale, 1);
    sprite.userData.canvasTexture = texture; sprite.renderOrder = 999; return sprite;
  }

  function updatePAOMarkers() {
    if (!periMarker || !apoMarker || !periLabel || !apoLabel) return;
    const [a, e, omega] = chaserElements;
    const periPos = positionAtTrueAnomaly(a, e, omega, 0);
    const apoPos = positionAtTrueAnomaly(a, e, omega, Math.PI);
    periMarker.position.copy(periPos); apoMarker.position.copy(apoPos);
    periLabel.position.copy(periPos.clone().multiplyScalar(1.06));
    apoLabel.position.copy(apoPos.clone().multiplyScalar(1.06));
  }

  function wrapPi(theta) { while (theta > Math.PI) theta -= 2*Math.PI; while (theta < -Math.PI) theta += 2*Math.PI; return theta; }
  function desiredPhaseHohmann(a1, a2) {
    if (a1 <= 0 || a2 <= 0) return null; const tTrans = Math.PI * Math.sqrt(Math.pow((a1 + a2)/2, 3)); const n2 = Math.sqrt(1 / Math.pow(a2, 3)); return wrapPi(Math.PI - n2 * tTrans);
  }

  function updatePhaseGauge() {
    const [a1] = chaserElements; const [a2] = targetElements;
    const phi = desiredPhaseHohmann(a1, a2);
    const current = computePhaseAngle(chaserElements, targetElements);
    const desiredText = phi == null ? '—' : `${(phi * 180/Math.PI).toFixed(1)}°`;
    const error = (phi == null) ? '—' : `${((wrapPi(phi - current)) * 180/Math.PI).toFixed(1)}°`;
    document.getElementById('phase-current').textContent = `${(current * 180/Math.PI).toFixed(1)}°`;
    document.getElementById('phase-desired').textContent = desiredText;
    document.getElementById('phase-error').textContent = error;
    const fill = document.getElementById('phase-fill');
    let status = document.getElementById('phase-status');
    if (phi == null) { fill.style.width = '0%'; status.textContent = 'N/A'; status.className = 'phase-status na'; return false; }
    const err = Math.abs(wrapPi(phi - current)); const pct = Math.max(0, 100 - (err * 180/Math.PI)); fill.style.width = `${pct}%`;
    if (err < 5 * Math.PI/180) { status.textContent = 'Ready'; status.className = 'phase-status good'; }
    else if (err < 20 * Math.PI/180) { status.textContent = 'Close'; status.className = 'phase-status warn'; }
    else { status.textContent = 'Poor'; status.className = 'phase-status bad'; }
    return err < 5 * Math.PI/180;
  }

  function showToast(message) {
    const prev = document.querySelector('.orbit-toast'); if (prev) prev.remove();
    const toast = document.createElement('div'); toast.className = 'orbit-toast';
    toast.innerHTML = `<span class="toast-icon">💡</span>${message}`;
    document.body.appendChild(toast); setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
  }

  function showEducationalCallout(direction, chaserState, elements) {
    const [a, e] = elements; const r = chaserState.r; const periapsisR = a * (1 - e); const apoapsisR = a * (1 + e);
    const nearPeriapsis = Math.abs(r - periapsisR) < 0.1 * a; const nearApoapsis = Math.abs(r - apoapsisR) < 0.1 * a; let message = '';
    if (direction === 'prograde') {
      if (nearPeriapsis) message = '🚀 Apoapsis ↑, current speed ↑ (instant), average speed ↓ after apoapsis';
      else if (nearApoapsis) message = '🌍 Periapsis ↑, current speed ↑ (instant), higher orbit is slower overall';
      else message = '⬆️ Prograde raises opposite side — energy increases, effects are delayed';
    } else if (direction === 'retrograde') {
      if (nearPeriapsis) message = '⬇️ Apoapsis ↓, current speed ↓ (instant), lower orbit is faster overall';
      else if (nearApoapsis) message = '🎯 Periapsis ↓, dropping to a lower, faster orbit — great for catching up';
      else message = '🔻 Retrograde lowers opposite side — less energy, faster average speed';
    } else if (direction === 'radial-out') message = '📡 +R: raise periapsis while lowering apoapsis — circularizing from below';
    else if (direction === 'radial-in') message = '🎯 -R: lower periapsis while raising apoapsis — circularizing from above';
    if (message) showToast(message);
  }

  function resetSimulation() {
    chaserElements = [1.3, 0.0, 0.0, 0.0]; targetElements = [1.3, 0.0, 0.0, Math.PI/6];
    time = 0; dvBudget = 0; caCache.result = null; currentScenario = null;
    if (chaserTrailGeometry) chaserTrailGeometry.setDrawRange(0, 0);
    if (targetTrailGeometry) targetTrailGeometry.setDrawRange(0, 0);
    if (ghostTrailGeometry) ghostTrailGeometry.setDrawRange(0, 0);
    if (chaserMesh && targetMesh) {
      const cs = elementsToState(chaserElements); const ts = elementsToState(targetElements);
      chaserMesh.position.copy(cs.position); targetMesh.position.copy(ts.position);
    }
    updateHUD(); updatePAOMarkers(); updatePhaseGauge(); updateGhostBurnArrows();
  }

  function loadScenario(scenario) {
    switch (scenario) {
      case 'basic':
        chaserElements = [1.3, 0.0, 0.0, -Math.PI/3]; targetElements = [1.3, 0.0, 0.0, 0.0];
        currentScenario = 'basic'; document.getElementById('orbit-status').textContent = 'Basic Phasing: Try a -V burn to lower orbit and catch up'; break;
      case 'hohmann':
        chaserElements = [1.2, 0.0, 0.0, 0.0]; targetElements = [1.4, 0.0, 0.0, Math.PI];
        currentScenario = 'hohmann'; document.getElementById('orbit-status').textContent = 'Hohmann: +V at periapsis, then +V at apoapsis to circularize'; break;
      case 'rendezvous':
        chaserElements = [1.295, 0.02, 0.0, Math.PI + Math.PI/12]; targetElements = [1.3, 0.0, 0.0, 0.0];
        currentScenario = 'rendezvous'; document.getElementById('orbit-status').textContent = 'R-bar Approach: Use small -R burns for radial corridor approach'; break;
      default:
        return;
    }
    if (chaserTrailGeometry) chaserTrailGeometry.setDrawRange(0, 0);
    if (targetTrailGeometry) targetTrailGeometry.setDrawRange(0, 0);
    if (ghostTrailGeometry) ghostTrailGeometry.setDrawRange(0, 0);
    time = 0; dvBudget = 0; caCache.result = null;
    if (chaserMesh && targetMesh) {
      const cs = elementsToState(chaserElements); const ts = elementsToState(targetElements);
      chaserMesh.position.copy(cs.position); targetMesh.position.copy(ts.position);
    }
    updateHUD(); updatePAOMarkers(); updatePhaseGauge(); updateGhostBurnArrows();
  }

  function periapsisRadius(elements) {
    const [a, e] = elements; return a * (1 - e);
  }

  function executeBurn(direction) {
    const state = elementsToState(chaserElements);
    const rHat = state.position.clone().normalize(); const vHat = state.velocity.clone().normalize();
    let dv = new THREE.Vector3();
    switch (direction) {
      case 'prograde': dv.copy(vHat).multiplyScalar(params.burnMagnitude); break;
      case 'retrograde': dv.copy(vHat).multiplyScalar(-params.burnMagnitude); break;
      case 'radial-out': dv.copy(rHat).multiplyScalar(params.burnMagnitude); break;
      case 'radial-in': dv.copy(rHat).multiplyScalar(-params.burnMagnitude); break;
    }
    // Safety clamp: avoid periapsis below planet radius (with small buffer)
    const MIN_RP = EARTH_RADIUS * 1.02; // 2% margin above surface
    let appliedDV = dv.clone();
    let candidate = applyBurn(chaserElements, appliedDV);
    if (periapsisRadius(candidate) < MIN_RP) {
      // Scale down dv by binary search for safe factor
      let lo = 0.0, hi = 1.0, best = 0.0;
      for (let i = 0; i < 16; i++) {
        const mid = 0.5 * (lo + hi);
        const testDV = dv.clone().multiplyScalar(mid);
        const testEl = applyBurn(chaserElements, testDV);
        if (periapsisRadius(testEl) >= MIN_RP) { best = mid; lo = mid; } else { hi = mid; }
      }
      appliedDV = dv.clone().multiplyScalar(best);
      candidate = applyBurn(chaserElements, appliedDV);
      showToast(`⚠️ Burn reduced to avoid surface intercept (rp ≥ ${(MIN_RP).toFixed(2)} R⊕)`);
    }

    chaserElements = candidate; dvBudget += appliedDV.length();
    // Ghost projection of new path
    if (ghostTrailGeometry) {
      const positions = ghostTrailGeometry.attributes.position.array; let cE = [...chaserElements];
      for (let i = 0; i < 200; i++) { const s = elementsToState(cE); positions[i*3] = s.position.x; positions[i*3+1] = s.position.y; positions[i*3+2] = s.position.z; cE = propagateOrbit(cE, 0.02); }
      ghostTrailGeometry.setDrawRange(0, 200); ghostTrailGeometry.attributes.position.needsUpdate = true;
      if (ghostTrail && ghostTrail.computeLineDistances) ghostTrail.computeLineDistances();
    }
    showEducationalCallout(direction, state, chaserElements);
    updateHUD(); updatePAOMarkers(); updatePhaseGauge();
  }

  function initThree() {
    const wrapper = document.getElementById('orbit-viz-container');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    container.innerHTML = ''; container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, wrapper.clientWidth / wrapper.clientHeight, 0.01, 100);
    camera.position.set(0, -4.2, 3.2); camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.2); scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1); directionalLight.position.set(5, -5, 8); scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0x4499ff, 0.6, 50); pointLight.position.set(0, 0, 2); scene.add(pointLight);

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024; const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(512, 512, 100, 512, 512, 512); grad.addColorStop(0, '#00111f'); grad.addColorStop(1, '#0b1a2b');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; for (let i=0;i<64;i++){ const y = Math.floor((i+1)*1024/65); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1024,y); ctx.stroke(); }
    const earthTexture = new THREE.CanvasTexture(canvas); earthTexture.wrapS = earthTexture.wrapT = THREE.RepeatWrapping;
    const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, transparent: true, opacity: 1.0, shininess: 30, specular: 0x222222 });
    earthMesh = new THREE.Mesh(earthGeometry, earthMaterial); earthMesh.castShadow = true; earthMesh.receiveShadow = true; scene.add(earthMesh);
    earthGlow = createGlow(0x60a5fa, 1.1); earthMesh.add(earthGlow);

    const chaserGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const chaserMaterial = new THREE.MeshPhongMaterial({ color: 0xff4444, emissive: 0x330000, shininess: 100, specular: 0x555555 });
    chaserMesh = new THREE.Mesh(chaserGeometry, chaserMaterial); chaserMesh.castShadow = true; scene.add(chaserMesh);
    chaserGlow = createGlow(0xff4444, 0.12); chaserMesh.add(chaserGlow);

    const targetGeometry = new THREE.SphereGeometry(0.06, 16, 16);
    const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x44ff44, emissive: 0x003300, shininess: 100, specular: 0x555555 });
    targetMesh = new THREE.Mesh(targetGeometry, targetMaterial); targetMesh.castShadow = true; scene.add(targetMesh);
    targetGlow = createGlow(0x44ff44, 0.12); targetMesh.add(targetGlow);

    periMarker = createMarker(0x3b82f6, 0.04); apoMarker = createMarker(0xa855f7, 0.04); scene.add(periMarker, apoMarker);
    periLabel = makeTextSprite('Periapsis', '#bfdbfe', 48); apoLabel = makeTextSprite('Apoapsis',  '#e9d5ff', 48); scene.add(periLabel, apoLabel);
    updatePAOMarkers();

    chaserTrailGeometry = createTrailGeometry(); targetTrailGeometry = createTrailGeometry(); ghostTrailGeometry = createTrailGeometry();
    const chaserTrailMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.8, linewidth: 2 });
    const targetTrailMaterial = new THREE.LineBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.8, linewidth: 2 });
    const ghostTrailMaterial = new THREE.LineDashedMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, dashSize: 0.05, gapSize: 0.03, linewidth: 1 });
    chaserTrail = new THREE.Line(chaserTrailGeometry, chaserTrailMaterial); scene.add(chaserTrail);
    targetTrail = new THREE.Line(targetTrailGeometry, targetTrailMaterial); scene.add(targetTrail);
    ghostTrail = new THREE.Line(ghostTrailGeometry, ghostTrailMaterial); ghostTrail.computeLineDistances(); scene.add(ghostTrail);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.05; controls.enablePan = true; controls.enableZoom = true;
    controls.minDistance = 1.5; controls.maxDistance = 15; controls.autoRotate = false;

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = wrapper.clientWidth / wrapper.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    }); resizeObserver.observe(wrapper);

    periBurnArrow = createBurnArrow(0x22c55e, 0.12); apoBurnArrow = createBurnArrow(0x22c55e, 0.12);
    periBurnArrow.visible = false; apoBurnArrow.visible = false; scene.add(periBurnArrow, apoBurnArrow);

    resetSimulation();
  }

  function step() {
    if (!params.playing) return;
    const dtSim = params.dt * params.timeScale; time += dtSim;
    chaserElements = propagateOrbit(chaserElements, dtSim); targetElements = propagateOrbit(targetElements, dtSim);
    const cs = elementsToState(chaserElements); const ts = elementsToState(targetElements);
    chaserMesh.position.copy(cs.position); targetMesh.position.copy(ts.position);
    updateTrail(chaserTrailGeometry, cs.position); updateTrail(targetTrailGeometry, ts.position);
    updateHUD(); updatePAOMarkers(); updateGhostBurnArrows();
  }

  function animate() {
    if (document.hidden) { requestAnimationFrame(animate); return; }
    requestAnimationFrame(animate); step(); controls.update(); renderer.render(scene, camera);
  }

  function bindUI() {
    const playPause = document.getElementById('orbit-play-pause');
    if (playPause) playPause.addEventListener('click', () => { params.playing = !params.playing; playPause.textContent = params.playing ? 'Pause' : 'Play'; });
    const resetBtn = document.getElementById('orbit-reset'); if (resetBtn) resetBtn.addEventListener('click', resetSimulation);

    const burnMag = document.getElementById('burn-magnitude'); if (burnMag) burnMag.addEventListener('input', (e) => { params.burnMagnitude = parseFloat(e.target.value); document.getElementById('burn-magnitude-value').textContent = params.burnMagnitude.toFixed(2); });
    const timeScale = document.getElementById('time-scale'); if (timeScale) timeScale.addEventListener('input', (e) => { params.timeScale = parseFloat(e.target.value); document.getElementById('time-scale-value').textContent = `${params.timeScale.toFixed(1)}×`; });

    const unitToggle = document.getElementById('real-world-units'); if (unitToggle) unitToggle.addEventListener('change', (e) => { params.realWorldUnits = !!e.target.checked; updateHUD(); });

    const map = { 'scenario-basic': 'basic', 'scenario-hohmann': 'hohmann', 'scenario-rendezvous': 'rendezvous' };
    Object.entries(map).forEach(([id, sc]) => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => { loadScenario(sc); history.replaceState(null, '', `${location.pathname}#${sc}`); }); });

    // Burn buttons
    const burns = [ ['burn-prograde','prograde'], ['burn-retrograde','retrograde'], ['burn-radial-out','radial-out'], ['burn-radial-in','radial-in'] ];
    burns.forEach(([id, dir]) => { const el = document.getElementById(id); if (el) el.addEventListener('click', () => executeBurn(dir)); });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); playPause?.click(); break;
        case '[': e.preventDefault(); if (timeScale) { const v = Math.max(0.1, params.timeScale - 0.1); timeScale.value = v; timeScale.dispatchEvent(new Event('input')); } break;
        case ']': e.preventDefault(); if (timeScale) { const v = Math.min(10, params.timeScale + 0.1); timeScale.value = v; timeScale.dispatchEvent(new Event('input')); } break;
        case 'z': e.preventDefault(); executeBurn('prograde'); break;
        case 'x': e.preventDefault(); executeBurn('retrograde'); break;
        case 'c': e.preventDefault(); executeBurn('radial-out'); break;
        case 'v': e.preventDefault(); executeBurn('radial-in'); break;
        case 'r': e.preventDefault(); resetBtn?.click(); break;
        case '?': case 'h': e.preventDefault(); toggleKeyboardHelp(); break;
      }
    });

    // Keyboard help
    document.body.insertAdjacentHTML('beforeend', `
      <div id="keyboard-help" class="keyboard-shortcuts" aria-live="polite">
        <h5>Keyboard Shortcuts</h5>
        <div><kbd>Space</kbd>Play/Pause</div>
        <div><kbd>[</kbd><kbd>]</kbd>Time Scale</div>
        <div><kbd>Z</kbd>+V (Prograde)</div>
        <div><kbd>X</kbd>-V (Retrograde)</div>
        <div><kbd>C</kbd>+R (Radial Out)</div>
        <div><kbd>V</kbd>-R (Radial In)</div>
        <div><kbd>R</kbd>Reset</div>
        <div><kbd>?</kbd>Toggle Help</div>
      </div>`);
  }

  let keyboardHelpVisible = false;
  function toggleKeyboardHelp() {
    const helpDiv = document.getElementById('keyboard-help'); if (helpDiv) { keyboardHelpVisible = !keyboardHelpVisible; helpDiv.classList.toggle('show', keyboardHelpVisible); }
  }

  // Lazy init when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.disconnect(); initThree(); bindUI(); animate();
        // Load scenario from hash
        const hash = location.hash.replace('#',''); if (hash) loadScenario(hash);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(document.getElementById('orbit-viz-container'));
}

// Auto-init on DOM ready for this page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initOrbitSimulator(document));
} else {
  initOrbitSimulator(document);
}
