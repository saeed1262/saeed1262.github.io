Goal

Implement an interactive 3D N-body gravity demo with a Barnes–Hut octree (approximate) and a direct-sum (exact) mode. Render stars as additive, glowing point sprites in Three.js, colored by speed. Include UI to toggle modes and tune parameters, and draw an energy-drift graph.

Deliverable

Return one HTML file that can be saved as _posts/2025-09-01-nbody-barnes-hut-3d.md in a Jekyll site and will run as-is on GitHub Pages.

Technical constraints

Use Three.js via pinned CDN:

three@0.160.0 (ES modules)

examples/jsm/controls/OrbitControls.js from the same version

No TypeScript. No npm. No GLSL includes. Everything inline.

Use <script type="module"> and ES modules only.

Works on desktop and mobile; handle resizes with ResizeObserver.

Keep GPU/CPU load modest; aim for ~60 FPS with 3k–5k particles in BH mode on a modern laptop.

UI (exact)

Place a responsive viz container and controls above it:

Buttons: Play/Pause, Reset, Re-seed

Select: Mode = Barnes–Hut (O(N log N)) | Direct (O(N²))

Sliders with live values:

θ (#theta): 0.3–1.5, step 0.05, default 0.8

dt (#dt): 0.001–0.03, step 0.001, default 0.01

ε (#eps): 0.002–0.05, step 0.001, default 0.01

N (#npart): 1000–8000, step 500, default 3000 (reseeds on change)

A monospace status span showing: t=… drift=…% mode=… | step=…ms fps≈…

Below the viz, a small <canvas id="energy" width="900" height="160"> plotting normalized energy drift over time (see “Energy” below).

Rendering

Scene: dark background, PerspectiveCamera, OrbitControls (damped).

Stars: THREE.Points with a custom ShaderMaterial:

Vertex: size attenuated by distance (use uSize, uDevicePixelRatio); pass per-particle speed attribute to fragment.

Fragment: radial falloff using gl_PointCoord; AdditiveBlending, transparent: true, depthWrite: false.

Color ramp by speed (cool → white → warm).

Use DynamicDrawUsage for buffer attributes and mark needsUpdate each frame.

Seeding the system (initial conditions)

One thick rotating disc:

Planar radius r: biased toward center (e.g., r = Rmax * sqrt(rand)), with Rmax≈2.2.

Angle φ: uniform [0, 2π).

Height z: small Gaussian (σ≈0.06).

Masses equal and sum to 1 (so G=1 works).

Velocities: approximate circular (vθ ≈ sqrt(G * M(<r) / r)) with tiny Gaussian noise and a gentle bar-like shear to encourage spiral arms.

Physics

Units: normalized, G = 1.

Softening: replace r^2 with r^2 + ε^2 everywhere in force and potential.

Integrator: leapfrog (kick–drift–kick):

v += 0.5*dt*a

x += dt*v

recompute a

v += 0.5*dt*a

Recompute accelerations each step using the selected mode.

Barnes–Hut (octree)

Node fields: cx, cy, cz, hs (center & half-size), m, comx, comy, comz, body (index or -1), child[8] or null.

Build bounds from current positions; create a cubic root with padding; insert bodies; update mass/COM on descent.

Multipole acceptance: treat node as a single mass if (2*hs)/dist < θ, else descend.

Iterative tree traversal (use your own stack) for both force and potential (no recursion).

In leaf nodes, skip self-interaction.

Direct mode

O(N²) summation; skip self; same softening.

Energy (for drift plot)

Kinetic: K = 0.5 * Σ m_i * |v_i|^2.

Potential: approximate using the tree traversal (same θ as forces) even in direct mode for speed; sum -G*m/r; multiply by 0.5 to avoid double-counting.

Record initial total energy E0 after the first acceleration compute; plot (E - E0)/|E0| over time in the energy canvas (simple 2D line).

Update a small, fixed-length ring buffer (e.g., last 600–800 samples).

Performance notes

Reuse arrays (Float32Array) for x,y,z, vx,vy,vz, ax,ay,az, m.

Use a single pass to update geometry buffers each frame.

Cap pixel ratio to 2 (renderer.setPixelRatio(min(devicePixelRatio, 2))).

Edge cases & UX

Reseeding reallocates buffers to the chosen N and reinitializes energy baseline.

Changing N triggers reseed automatically; other sliders take effect next step.

Guard against extremely small distances (+1e-9) in denominators.

If WebGL is unavailable, show a friendly message in the viz container.

Styling

Responsive container with aspect-ratio: 16/9.

Lightweight CSS; no frameworks. Monospace for stats; subtle borders; dark theme.

Acceptance criteria (check your output)

Page loads locally via bundle exec jekyll serve or on GitHub Pages and shows stars orbiting with visible spiral structure after a few seconds.

Toggling Direct vs Barnes–Hut clearly changes step time; BH is much faster at N≥3000.

θ slider affects accuracy/speed (smaller θ → slower; energy drift curve flattens).

ε slider stabilizes close encounters (very small ε produces more chaotic drift).

Energy drift plot updates continuously and the status bar shows time, drift %, step ms, and approximate FPS.

No runtime errors in console; no external assets beyond the pinned CDNs.

Output format

Return exactly one HTML document that includes:

Valid Jekyll front-matter (layout, title, description)

Controls markup, viz <div id="viz">, energy canvas

Inline <style> with minimal CSS

One <script type="module"> containing all JS and GLSL

Comment your code where it clarifies algorithms (octree build, acceptance test, integrator).