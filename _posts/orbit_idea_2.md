# What the blog will include (reader-facing)

1. **Hook & intuition**

   * “Why speeding up can make you drop.”
   * Show that a **prograde impulse** at circular orbit raises the *opposite* side of the orbit (apoapsis), so locally you might momentarily speed up, but if you drop to a **lower phasing orbit** you actually go *faster* and catch up.

2. **Model you’re using**

   * **Two-body, coplanar** motion (central body + two spacecraft).
   * **Patched conics with impulsive burns** (instant Δv, no finite-burn arcs).
   * No J2/drag/perturbations; constant μ.

3. **Interactive viz**

   * 3D scene (flat orbital plane) with the planet, target, chaser, and their **orbits as trails**.
   * **HUD vectors**: position **r**, velocity **v**, local **LVLH axes** (R-bar = radial, V-bar = prograde).
   * **Burn controls**: prograde/retrograde (±V-bar), radial in/out (±R-bar), burn magnitude slider, and a Δv budget readout.
   * **Ghost prediction**: after any burn, draw a translucent predicted path and show **closest approach** (range & time).
   * **Scenarios**: “Catch-up (phasing)”, “Hohmann + circularize”, “R-bar approach” buttons that pre-seed initial states.

4. **Mini lessons in the post text**

   * Circular orbit facts (period, speed).
   * What an **impulsive burn** changes (energy & angular momentum → a, e).
   * **Rendezvous logic**: drop to lower orbit to gain phase, execute transfer when phase angle is right, circularize near the target.
   * **LVLH frame** (Hill frame) and why operators say “V-bar”/“R-bar”.

5. **Stretch content**

   * CW (Clohessy–Wiltshire) linearized relative motion view.
   * Autopilot: two-impulse **Hohmann** planner with computed Δv’s.

---

# What you need to implement (dev-facing checklist)

## 0) Tech setup (static-friendly)

* One Jekyll post with front-matter + `<div id="viz">` + a `<script type="module">`.
* Pin three.js (e.g., `three@0.160.0`) and `OrbitControls`.
* Use `ResizeObserver`; cap pixel ratio to 2 for performance.

## 1) Core state & units

* Choose normalized units, e.g. **μ = 1**, planet radius `R=1`. (Or set Earth: μ=398600.4418 km³/s², but normalized is simpler.)
* Keep two spacecraft: **target** (T) and **chaser** (C).
* Store each as **orbital elements** (a, e, ω, ν) because we’re coplanar (i=Ω=0), or keep full vectors and convert as needed.

## 2) Kepler propagation (elliptic)

Implement fast, allocation-free functions:

* From elements → state:

  ```
  r(ν) = a(1 − e²) / (1 + e cosν)
  position = r [cos(ω+ν), sin(ω+ν)]
  speed V = sqrt( μ (2/r − 1/a) )
  velocity direction is rotated 90° from radius; compute via perifocal formulas
  ```
* Time update:

  ```
  n = sqrt(μ / a³)                (mean motion)
  E from ν: tan(E/2) = sqrt((1−e)/(1+e)) tan(ν/2)
  M = E − e sinE
  Advance by Δt: M' = M + n Δt
  Solve Kepler: M' = E' − e sinE'  (Newton’s method, few iters)
  ν' from E', then recompute r, position, velocity
  ```
* Provide **state↔elements** conversion so burns can update a,e,ω consistently.

> Tip: keep a “propagate(elements, t)” that returns `r,v` without mutating global arrays; then a fast per-frame “advance(dt)” that updates ν (or M) in place for each body.

## 3) Impulsive burns (Δv)

* When the user presses a burn button, compute unit vectors at chaser’s current state:

  * **R-bar** (radial) = `r̂ = r / |r|`
  * **V-bar** (prograde) = `v̂ = v / |v|`
* Apply Δv = magnitude × chosen axis (±V-bar or ±R-bar):

  ```
  v_new = v + Δv
  ```
* Convert (r, v\_new) → new elements (a, e, ω, ν). Reset the chaser’s mean anomaly M (or E) to match the current true anomaly so propagation continues smoothly.
* Accumulate **Δv budget**.

## 4) Rendering

* Planet: shaded sphere (or a simple disc if you prefer 2D).
* Orbits: dynamic **line**/tube segments drawn from recent propagated positions (a circular buffer) for both T and C.
* **Ghost prediction**:

  * Copy current chaser state; apply a trial Δv; then sample future times (e.g., 0…N periods) to draw a translucent curve.
  * Simultaneously sample target future positions; compute **min range** and time of closest approach; display in HUD.

## 5) HUD & overlays

Show:

* **Chaser**: a, e, period `T = 2π/√(μ) * a^{3/2}`, perigee/apogee altitudes, speed |v|.
* **Target**: same basics + current **phase angle** Δθ = angle(T) − angle(C) around the planet.
* **Relative**: range |r\_T − r\_C|, closing speed, predicted closest approach (range & Δt).
* Vector gizmos (short arrows) for **r**, **v**, **R-bar**, **V-bar**.

## 6) Controls (UI)

* **Play/Pause**, **Reset**, **Time scale** slider (e.g., 0.1×…50×).
* **Burn axis** buttons:

  * `+V` (prograde), `−V` (retrograde),
  * `+R` (radial out), `−R` (radial in).
* **Magnitude** slider (e.g., 0.001…0.2 in normalized units) and a **Tap/Hold** interaction (single tap = one impulse, hold = repeat).
* **Scenarios** dropdown:

  * “Start slightly behind target” (same a, small phase lag).
  * “Phasing orbit” (chaser starts with slightly smaller a).
  * “Hohmann setup” (auto-compute first burn to put chaser on transfer ellipse to target’s radius; user executes circularize at intercept).

## 7) Intercept & Hohmann helpers (optional but great)

* **Hohmann planner (coplanar, circular target)**:

  1. Given target radius `r_t` and chaser radius `r_c`, compute transfer semi-major `a_t = 0.5 (r_t + r_c)`.
  2. Δv1 (at r\_c, prograde) to enter transfer; time of flight `TOF = π √(a_t³/μ)`.
  3. Δv2 at r\_t to circularize.
  4. To manage **phase**, recommend starting burn when target lead angle ≈ the transfer angle (compute required **phase angle** and wait).
* **Closest-approach search**:

  * Sample both trajectories over \[0, k·T\_target]; track min |r\_T(t)−r\_C(t)|; mark the time and point in the scene.

## 8) LVLH / Hill frame (educational overlay)

* Draw a small inset showing the **relative ellipse** predicted by **Clohessy–Wiltshire** for small separations around a circular target orbit:

  ```
  ẍ − 3n² x − 2n ẏ = 0
  ÿ + 2n ẋ = 0
  ```

  where x (radial), y (along-track), n = target mean motion.
  This is optional but gives a great “engineer’s view” of R-bar vs V-bar behavior.

---

# Math snippets you’ll code

**State → elements (planar):**

* `h = |r × v|`, `e_vec = (v×h)/μ − r/|r|`, `e = |e_vec|`
* `a = 1 / (2/|r| − |v|²/μ)`
* `ν = atan2( (h·k) * (r·v) / (h |e| |r|), (1/|e|)( (h²/μ)/|r| − 1 ) )` (or use dot products with `e_vec`/`r`)

**Elements → state (perifocal):**

* `r_pf = (a(1−e²)) / (1 + e cosν) * [cosν, sinν]`
* `v_pf = √(μ/a)/(1−e cosE) * [−sinE, √(1−e²) cosE]` (or use standard p = a(1−e²) formulas)
* Since coplanar: world = perifocal.

**Advance mean anomaly:**

* `M' = M + n Δt`, solve `M' = E' − e sinE'` (Newton).
* `ν' = 2 atan( √((1+e)/(1−e)) tan(E'/2) )`.

---

# Minimal file structure (static Jekyll)

* Front-matter, controls, viz container, small `<canvas>` for a **closest-approach/time** strip chart (optional).
* One `<script type="module">` with:

  * `propagate()`, `stateToElems()`, `elemsToState()`, `keplerSolve()`
  * `applyImpulse(axis, magnitude)`
  * `sampleFuture(state, dt, steps)` for ghost paths & CA search
  * Scene setup & draw loop

---

# Suggested UI IDs (so it’s easy to wire)

* `#viz`, `#play`, `#reset`, `#scenario`
* `#burnMag`, `#burnPlusV`, `#burnMinusV`, `#burnPlusR`, `#burnMinusR`
* HUD spans: `#a`, `#e`, `#period`, `#phase`, `#range`, `#closing`, `#dvBudget`, `#tca`, `#rmin`

---

# Test scenarios you’ll include in the post

1. **Why speeding up drops you**: Tap `+V` at circular orbit—watch apoapsis rise on the far side; tap `−V` to drop periapsis (and see the chaser lap the target).
2. **Phasing**: Start behind; do a small `−V` to enter a slightly lower, faster orbit; wait; `+V` to recircularize near the target; note the saved Δv vs brute forcing.
3. **Hohmann transfer**: Use the helper to compute Δv’s; execute two burns; circularize.

---

# Nice polish

* Ghost path fades with time; intercept marker with label “CA: 2.1 km in 23.4 min”.
* Trail lengths scale with period (e.g., one orbit).
* Time-warp shows “true” orbital periods (so users see why lower = faster).
* Toggle: **show LVLH inset** and **show CW ellipse**.