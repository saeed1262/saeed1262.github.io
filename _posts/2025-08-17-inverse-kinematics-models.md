---
layout: post
title: "Interactive Inverse Kinematics: CCD, FABRIK, and Jacobian Transpose"
date: 2025-09-02
description: "Play with three classic IK solvers on a 2D arm: CCD, FABRIK, and Jacobian‑transpose. Drag the target, tweak links, and watch convergence."
tags: [robotics, animation, kinematics, algorithms, interactive]
categories: blog
img: /assets/img/icon-interactive-cursor.svg
---

Inverse kinematics (IK) asks: given a desired end‑effector position, what joint angles produce it? Below you can compare three widely used IK solvers side‑by‑side on a planar arm. Drag the target, switch algorithms, and tune parameters to feel their behavior.

<div id="ik-container">
  <div id="ik-controls">
    <div class="control-panel">
      <h5>Algorithm Selection</h5>
      <div class="control-group">
        <div class="control-row">
          <select id="ikAlgo">
            <option value="ccd">CCD (Cyclic Coordinate Descent)</option>
            <option value="fabrik">FABRIK (Forward/Backward)</option>
            <option value="jt">Jacobian Transpose</option>
            <option value="dls">DLS (Damped Least Squares)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="control-panel">
      <h5>Basic Parameters</h5>
      <div class="control-group">
        <label>Links: <span class="value" id="linksLabel">4</span></label>
        <input id="links" type="range" min="2" max="12" step="1" value="4" />
      </div>
      <div class="control-group">
        <label>Link Length: <span class="value" id="lenLabel">90</span> px</label>
        <input id="len" type="range" min="30" max="140" step="5" value="90" />
      </div>
      <div class="control-group">
        <label>Iterations/Frame: <span class="value" id="itersLabel">8</span></label>
        <input id="iters" type="range" min="1" max="64" step="1" value="8" />
      </div>
    </div>

    <div class="control-panel">
      <h5>Algorithm Settings</h5>
      <div class="control-group" id="jt-only">
        <label>JT Step (γ): <span class="value" id="gammaLabel">0.3</span></label>
        <input id="gamma" type="range" min="0.02" max="1.0" step="0.02" value="0.3" />
      </div>
      <div class="control-group" id="dls-only">
        <label>DLS λ: <span class="value" id="lambdaLabel">2.0</span></label>
        <input id="lambda" type="range" min="0.0" max="10.0" step="0.1" value="2.0" />
      </div>
      <div class="control-group">
        <label>Damping: <span class="value" id="dampLabel">0.6</span></label>
        <input id="damp" type="range" min="0.05" max="1.0" step="0.05" value="0.6" />
      </div>
    </div>

    <div class="control-panel">
      <h5>Joint Limits</h5>
      <div class="control-group">
        <div class="control-row">
          <label class="checkbox"><input id="limitsEnabled" type="checkbox" /> Enable</label>
          <label>±<span class="value" id="limitDegLabel">160</span>°</label>
        </div>
        <input id="limitDeg" type="range" min="10" max="180" step="5" value="160" />
        <div class="control-row">
          <label class="checkbox"><input id="showLimits" type="checkbox" /> Show Limit Arcs</label>
        </div>
      </div>
    </div>

    <div class="control-panel">
      <h5>Rest Pose</h5>
      <div class="control-group">
        <label>Rest Pose Bias: <span class="value" id="restLabel">0.00</span></label>
        <input id="restBias" type="range" min="0.00" max="0.50" step="0.01" value="0.00" />
        <div class="control-row">
          <button class="button" id="setRest">Set Rest = Current</button>
          <button class="button" id="resetRest">Reset Rest</button>
        </div>
      </div>
    </div>

    <div class="control-panel">
      <h5>Moving Target</h5>
      <div class="control-group">
        <div class="control-row">
          <button class="button" id="moveNone">Stop</button>
          <button class="button" id="moveCircle">Circle</button>
          <button class="button" id="moveEight">Figure‑8</button>
        </div>
        <label>Speed: <span class="value" id="speed2Label">1.0</span>x</label>
        <input id="targetSpeed" type="range" min="0.2" max="3.0" step="0.1" value="1.0" />
      </div>
    </div>

    <div class="control-panel">
      <h5>Visualization & Utilities</h5>
      <div class="control-group">
        <div class="control-row">
          <label class="checkbox"><input id="pauseIK" type="checkbox" /> Pause</label>
          <label class="checkbox"><input id="showGhost" type="checkbox" checked /> Show Reach Circle</label>
        </div>
        <div class="control-row">
          <label class="checkbox"><input id="showTrace" type="checkbox" /> Trace End‑Effector</label>
          <label class="checkbox"><input id="showMetrics" type="checkbox" checked /> Show Metrics</label>
        </div>
        <div class="control-row">
          <button class="button" id="toggleHelp">Help</button>
        </div>
      </div>
    </div>
  </div>

  <div id="ik-viz-container" aria-label="Inverse kinematics playground">
    <canvas id="ik-canvas" width="1400" height="900"></canvas>
    <div class="loading" id="ik-loading">Loading IK demo…</div>
  </div>

  <div id="ik-hud">
    <div class="hud-panel">
      <h4>Status</h4>
      <div class="hud-value"><span class="label">Algorithm</span><span class="value" id="hudAlgo">CCD</span></div>
      <div class="hud-value"><span class="label">End‑Effector Error</span><span class="value" id="hudErr">0.0 px</span></div>
      <div class="hud-value"><span class="label">Iterations</span><span class="value" id="hudIters">0</span></div>
      <div class="hud-value"><span class="label">FPS</span><span class="value" id="hudFps">0</span></div>
    </div>
    <div class="hud-panel">
      <h4>Tips</h4>
      <ul class="notes">
        <li>Drag anywhere to move the target; hold Shift to move the base.</li>
        <li>CCD: simple and robust; converges gradually joint‑by‑joint.</li>
        <li>FABRIK: geometric, fast convergence in many cases.</li>
        <li>Jacobian‑Transpose: gradient‑like; tune γ for stability.</li>
      </ul>
    </div>
  </div>
</div>

<style>
.container {
    max-width: 1200px;
    margin: 0 auto;
}

.post {
    max-width: 1200px;
    margin: 0 auto;
}

.post-content {
    max-width: 1200px;
    margin: 0 auto;
}
</style>

<link rel="stylesheet" href="/assets/css/ik-playground.css?v=4">
<script defer src="/assets/js/ik-playground.js?v=4"></script>

<div id="ik-help" hidden>
  <div class="ik-help-content">
    <h3>IK Playground Help</h3>
    <p>Drag to move the target; hold Shift to drag the base. Use the controls to change solver, link count/length, iterations, damping, joint limits, and add a rest‑pose bias.</p>
    <p>Moving targets let you compare tracking behavior.</p>
    <ul>
      <li>Shortcuts: 1=CCD, 2=FABRIK, 3=JT, 4=DLS, p=pause, t=trace, g=reach, k=metrics, ?=help, c=circle, l=figure‑8, s=stop</li>
    </ul>
    <button class="button" id="closeHelp">Close</button>
  </div>
  <div class="ik-help-backdrop"></div>
</div>

### The Three Solvers At A Glance

- CCD: rotate each joint (from tip to base) to reduce the angle between the joint‑to‑effector and joint‑to‑target vectors. Repeat until close enough.
- FABRIK: move joints along the line segments in two passes (end→base, then base→end) while keeping segment lengths fixed.
- Jacobian‑Transpose: compute `J^T (target − effector)` to nudge angles in the direction that reduces error; a scalar step γ controls stability.

These are great building blocks. Real rigs add joint limits, damping, orientation goals, and regularization; but the core intuition transfers.

### What You Can Do

- Drag the orange crosshair to set a new target; the arm follows.
- Hold Shift while dragging to reposition the green base and change reach.
- Toggle Reach Circle to see the maximum reachable radius `≈ sum(link lengths)`.
- Enable Trace to visualize the end‑effector path while the solver converges.
- Experiment with links, length, and iterations to stress each algorithm.
- Switch algorithms mid‑motion to compare convergence style and stability.

New tricks:
- Turn on Joint Limits, adjust ±deg, and optionally show limit arcs at each joint.
- Add Rest Pose Bias and set/reset the current configuration as the preferred pose.
- Drive the target along a Circle or Figure‑8 and tune the speed.
- Show Metrics to plot the error over time in the top‑right.

### Try These Presets

- Many short links: set `Links=10`, `Link Length=40–60`, `Iterations=16+`; compare CCD vs. FABRIK convergence speed and smoothness.
- Unreachable target: drag outside the reach circle; observe boundary behavior across solvers.
- Tracking a path: enable Figure‑8 at moderate speed; compare lag/overshoot for JT vs. DLS while tuning `γ` and `λ`.
- Joint limits: enable limits at ±60–90° and toggle “Show Limit Arcs”; note how each solver adapts.

### Share a Setup

The demo reads settings from the URL, so you can share a preset. Example:

```text
?algo=dls&n=6&L=80&it=16&la=3&d=0.7&rg=1&tr=1&mv=eight&sp=1.2
```

Parameters: `algo` (ccd|fabrik|jt|dls), `n` (links), `L` (link length), `it` (iterations/frame), `g` (JT γ), `la` (DLS λ), `d` (damping), `px` (pause 0/1), `rg` (reach circle 0/1), `tr` (trace 0/1), `lm` (limits 0/1), `ld` (limit degrees), `sl` (show limit arcs 0/1), `rb` (rest bias), `mv` (none|circle|eight), `sp` (target speed), `mx,my` (base), `tx,ty` (target).

### What To Look For

- CCD progresses joint‑by‑joint from the end: you’ll see a “snake‑like” motion.
- FABRIK tends to straighten lines and converge quickly in a few passes.
- Jacobian‑Transpose makes smooth, simultaneous angle updates; with a too‑large step it can overshoot or oscillate—reduce γ or increase damping.
- When the target is outside the reach circle, the end‑effector settles on the boundary in the closest direction.

### Problem Setup (2D Planar Chain)

- Goal: find angles `θ = [θ1..θn]` so the end‑effector position `p(θ)` matches a target `t`.
- Links are length `L` with a fixed base, so forward kinematics sums rotations and offsets.
- We minimize position error `e = t − p(θ)`; different methods update `θ` differently.

### CCD (Cyclic Coordinate Descent)

- Idea: for joint `i` (from end to base), rotate to reduce the angle between vectors `(joint_i → effector)` and `(joint_i → target)`.
- Pros: dead simple, robust, no matrices; handles unreachable cases gracefully.
- Cons: can be slow for long chains; path can look “wiggly”.

Pseudo‑steps per sweep:

```text
for i = n-1 down to 0:
  a1 = angle(j_i → end_effector)
  a2 = angle(j_i → target)
  θ_i += wrap_to_pi(a2 - a1) * damping
  forward_kinematics()
```

### FABRIK (Forward And Backward Reaching IK)

- Idea: operate in position space, preserving segment lengths with two passes.
- Backward: place the end at the target and pull joints back along lines to keep lengths.
- Forward: pin the base, then push joints forward to keep lengths.
- Pros: fast convergence, numerically stable, no Jacobians.
- Cons: handling joint limits and constraints needs extra steps.

Pseudo‑steps per iteration:

```text
// If unreachable: point segments toward target and stop.
end = target
for i = n-1..0:  j_i = j_{i+1} + L * normalize(j_i - j_{i+1})
base stays fixed
for i = 0..n-1:  j_{i+1} = j_i + L * normalize(j_{i+1} - j_i)
```

### Jacobian Transpose (JT)

- Idea: small changes in angles `Δθ` change the end position `Δp ≈ J Δθ`, where `J` is the 2×n Jacobian. Use the gradient direction `Δθ = α J^T (t − p)`.
- In this demo we use an adaptive step `α = (r·(J J^T r)) / (||J J^T r||² + ε)` and clamp it to `γ` for stability.
- Pros: smooth simultaneous joint updates; extensible to orientation, weights, damping.
- Cons: can oscillate near singularities without step control; needs tuning.

Update rule used here:

```text
u = J^T r          // per-joint update direction
v = J u            // predicted end-effector motion
α = clamp( (r·v) / (v·v + ε), 0, γ )
θ ← θ + α u * damping
```

### Jacobian for a Planar Chain (2D)

- For joint i at position `p_i = (x_i, y_i)` and the end‑effector at `e = (x_e, y_e)`, the Jacobian column with respect to `θ_i` is `[−(y_e − y_i), (x_e − x_i)]`.
- This geometric form (a perpendicular to the joint→end vector) is what the demo uses for both JT and DLS updates.

### Damped Least Squares (DLS)

- Idea: take a regularized least‑squares step `Δθ = J^T (J J^T + λ^2 I)^{-1} r` to temper ill‑conditioned directions near singularities.
- Pros: very robust near straight chains and during fast motions; reduces oscillations.
- Cons: requires tuning `λ` (too large = sluggish, too small = oscillation like plain LS).

Pseudo‑step (2D task):

```text
A = J J^T + λ^2 I    // 2×2 in this demo
y = A^{-1} r
Δθ = J^T y
θ ← θ + Δθ * damping
```

Tuning: raise `λ` for stability (less aggressive updates), lower it for responsiveness. Combine with global `Damping` for smooth paths.

### Reachability and Behavior at the Limits

- If the target is outside the reach circle, all methods align the chain toward the target and settle on the boundary.
- With very short link lengths and many segments, JT can take smaller steps—raise `iterations` or lower `γ` to avoid oscillations.
- FABRIK quickly finds boundary solutions; CCD will crawl along the boundary as joints adjust.

### Singularities & Stability

- Near singular configurations (e.g., a straight chain), the Jacobian is ill‑conditioned and naive gradient steps can oscillate.
- Jacobian‑Transpose here uses an adaptive step `α` clamped by `γ` (JT Step) to curb overshoot; lower `γ` or raise `Damping` if you see ringing.
- DLS regularizes with `λ` inside `(J J^T + λ^2 I)^{-1}`; increase `λ` near singularities for stable tracking.
- With moving targets, compare lag vs. robustness: JT with tuned `γ` reacts quickly; DLS trades a bit of lag for smoother motion.

### Practical Tips

- Increase `Iterations/Frame` to accelerate convergence at the cost of CPU.
- Lower `γ` and/or increase `Damping` if JT jitters; raise `γ` if progress is too slow.
- More links can make CCD slower; FABRIK scales well; JT prefers well‑scaled lengths.
- For smooth paths, enable Trace and compare the motion across solvers.

### Extensions You Might Add

- Joint limits: clamp per‑joint `θ_i` after each update.
- Regularization: add damping in JT/DLS to handle singularities better.
- Orientation goals: extend to 3D and include end‑effector orientation constraints.
- Obstacles: project joints away from obstacles between passes.
- Targets over time: follow a moving target and compare lag/overshoot.

### When to Use Which

- Use CCD for small rigs, quick prototypes, or when simplicity wins.
- Use FABRIK for character rigs and many‑link chains where fast, stable convergence is desired.
- Use Jacobian methods for combining multiple objectives (position + orientation + soft constraints) and when you’ll need weights or task‑space control.

### References and Further Reading

- Aristidou & Lasenby, “FABRIK: A fast, iterative solver for the Inverse Kinematics problem” (2011)
- Buss, “Introduction to Inverse Kinematics with Jacobian Methods” (2004)
- Tolani, Goswami, & Badler, “Real-Time Inverse Kinematics Techniques for Anthropomorphic Limbs” (2000)
- Wampler, “Manipulator Inverse Kinematic Solutions Based on Vector Formulations and Damped Least‑Squares Methods” (1986)
- Nakamura & Hanafusa, “Inverse kinematics solutions with singularity avoidance for robot manipulator control” (1986)
- Maciejewski & Klein, “Obstacle avoidance for kinematically redundant manipulators in dynamically varying environments” (1985)
