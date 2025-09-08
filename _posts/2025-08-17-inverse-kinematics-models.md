---
layout: post
title: "Interactive Inverse Kinematics: CCD, FABRIK, and Jacobian Transpose"
date: 2025-08-17
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

## Why I Built This

IK sits at a beautiful intersection of robotics, character animation, and human–computer interaction. I wanted a hands‑on way to feel how classic solvers behave under constraints, limits, and moving targets—so you can build intuition, not just read formulas. This playground lets you drag a target and immediately see solver trade‑offs in stability, speed, and path smoothness.

## Where IK Shows Up

If you’ve ever dragged a character’s hand onto a doorknob in an animation tool, or watched a robot smoothly align a gripper with a bolt, you’ve seen IK at work. Games lean on it to plant feet on uneven ground; VR headsets use it to guess a whole body from a few tracked points; mocap artists use it to tame jitter and fill gaps. The point isn’t just “reaching a position” — it’s doing so while staying within joint limits, preferring comfortable poses, and moving in a way that looks intentional.

## How The Demo Works

Drag the orange crosshair and the arm tries to follow. Under the hood, forward kinematics turns the current joint angles into points in space; then, several times per frame, the chosen solver nudges those angles to shrink the gap to the target. After each nudge, we respect joint limits if you’ve enabled them, and we can gently bias the motion back toward a rest pose so things don’t collapse into awkward shapes. You can switch algorithms on the fly to feel how each one “thinks,” and turn on metrics to watch the error curve settle as the arm converges.

## Complexity & Scaling

Not all IK steps cost the same. CCD in this simple form touches one joint at a time and re‑does forward kinematics after each tweak, which makes a full sweep scale roughly like n² for n links. FABRIK runs two clean passes along the chain and lands at O(n) per iteration. Jacobian‑based methods also build O(n) updates in this 2D setup; the transpose variant takes a smart step in the gradient’s direction, while Damped Least Squares solves a tiny 2×2 system to stay stable near straightened‑out poses. In practice, you can raise Iterations/Frame until the error curve gets calm, then balance snappiness vs. smoothness with JT’s γ or DLS’s λ plus the global damping.

## Visual Intuition

The end‑effector wants to reach the target. CCD swings one joint at a time so the segment points more toward the target. FABRIK slides points along lines to keep segment lengths while pulling the end to the goal. Jacobian methods compute how small angle changes move the end point, then nudge all joints together.

<!-- Visual diagram removed for a cleaner look; keeping narrative explanation. -->

## Three Ways To Solve It

There isn’t one “right” way to do IK — there are families of approaches with different personalities. CCD feels like a careful hand guiding each joint in turn. FABRIK acts like a strand of beads that slides into shape. Jacobian methods think locally: “if I turn joints this much, the end will move that way.” Real rigs mix these ideas with limits, damping, and sometimes orientation goals; the core intuition carries through.

## Play With It

Start simple: drag the target a short distance and watch how each solver approaches it. CCD will send a ripple down the chain, joint by joint, like a snake finding its way. FABRIK tends to straighten segments into clean lines and snaps into place in just a few passes. Jacobian‑Transpose moves everything together in smooth, coordinated nudges — turn the step down if it starts to overshoot.

Make it harder. Hold Shift and move the green base to change what’s reachable, then try pulling the target beyond the reach circle to see how each solver hugs the boundary. Turn on joint limits and show limit arcs; you’ll notice how CCD inches along the constraints, FABRIK rebalances lengths gracefully, and Jacobian methods slow down near singular poses unless you give them a bit more damping or λ.

Finally, give the system a rhythm. Put the target on a circle or figure‑8, enable trace, and compare how closely each solver tracks the path. You’ll feel the trade‑off: faster steps react quickly but can ring; heavier damping and DLS stay composed but lag a touch.

## Appendix: Shareable Presets

The demo reads settings from the URL, so you can share a preset. Example:

```text
?algo=dls&n=6&L=80&it=16&la=3&d=0.7&rg=1&tr=1&mv=eight&sp=1.2
```

Parameters:
- `algo`: ccd | fabrik | jt | dls
- `n`: number of links
- `L`: link length (px)
- `it`: iterations per frame
- `g`: JT step gamma (γ)
- `la`: DLS lambda (λ)
- `d`: damping [0..1]
- `px`: pause (0 or 1)
- `rg`: show reach circle (0 or 1)
- `tr`: show trace (0 or 1)
- `lm`: enable joint limits (0 or 1)
- `ld`: joint limit degrees (±)
- `sl`: show limit arcs (0 or 1)
- `rb`: rest pose bias [0..0.5]
- `mv`: target motion mode: none | circle | eight
- `sp`: target speed multiplier
- `mx,my`: base position (px)
- `tx,ty`: target position (px)

## What It Feels Like

CCD progresses joint‑by‑joint from the end — you can literally watch the “wave” of corrections travel back to the base. FABRIK often finds a clean, nearly straight path in just a few sweeps. Jacobian‑Transpose updates everything at once; it’s wonderfully smooth when the step is tamed, and a little exuberant if you let γ run wild. Outside the reach circle, all methods settle on the boundary in the closest direction they can manage.

### Problem Setup (2D Planar Chain)

We’re solving for joint angles `θ = [θ1..θn]` so the end‑effector position `p(θ)` matches a target `t`. Each link has length `L` and we keep the base fixed, so forward kinematics is just a sum of rotations and offsets along the chain. All the solvers below chase the same objective — reduce the position error `e = t − p(θ)` — but they update `θ` in different ways.

### CCD (Cyclic Coordinate Descent)

CCD is the “one joint at a time” approach. Starting from the tip and walking back to the base, each joint turns just enough to make the end‑effector point more directly at the target. It’s dead simple and very forgiving — great when you just need something that works — but on long chains you’ll see a characteristic wiggle and a bit more time to settle.

Geometrically, for joint i with position p_i, end‑effector e, and target t, define

$$\mathbf{u} = e - p_i,\quad \mathbf{v} = t - p_i.$$

The signed rotation that best aligns u to v in 2D is

$$\Delta\theta_i = \operatorname{atan2}(\,u_x v_y - u_y v_x,\; u_x v_x + u_y v_y\,)$$

and we apply a damped update

$$\theta_i \leftarrow \theta_i + \eta\,\Delta\theta_i, \quad 0<\eta\le 1.$$

After changing θ_i we recompute forward kinematics so the next joint acts on the new end‑effector position. CCD naturally handles unreachable targets: the chain aligns toward t and settles at the boundary of the reach circle.

Pseudo‑steps per sweep:

```text
for i = n-1 down to 0:
  a1 = angle(j_i → end_effector)
  a2 = angle(j_i → target)
  θ_i += wrap_to_pi(a2 - a1) * damping
  forward_kinematics()
```

### FABRIK (Forward And Backward Reaching IK)

FABRIK works directly in position space with two elegant passes. First it fixes the end at the target and drags joints backward along straight lines while keeping segment lengths. Then it pins the base and pushes forward the same way. The result is fast, stable convergence without building Jacobians — you get clean motion with very little fuss.

Let joints be positions p_0, …, p_n with segment lengths L_i = ||p_{i+1}-p_i|| (kept constant).

- If the target t is unreachable, set every segment to point toward t:

$$p_{i+1} \leftarrow p_i + L_i\,\frac{t-p_i}{\lVert t-p_i\rVert}.$$

- Otherwise, do two passes per iteration:
  - Backward (anchor end at t): set p_n ← t, then for i = n−1…0

    $$p_i \leftarrow p_{i+1} + L_{i}\,\frac{p_i - p_{i+1}}{\lVert p_i - p_{i+1}\rVert}.$$

  - Forward (anchor base at p_0^0): set p_0 ← p_0^0, then for i = 0…n−1

    $$p_{i+1} \leftarrow p_{i} + L_{i}\,\frac{p_{i+1} - p_{i}}{\lVert p_{i+1} - p_{i}\rVert}.$$

Angles θ are then recovered from adjacent positions. Constraints like joint limits fit by clamping angles after each iteration.

Pseudo‑steps per iteration:

```text
// If unreachable: point segments toward target and stop.
end = target
for i = n-1..0:  j_i = j_{i+1} + L * normalize(j_i - j_{i+1})
base stays fixed
for i = 0..n-1:  j_{i+1} = j_i + L * normalize(j_{i+1} - j_i)
```

### Jacobian Transpose (JT)

Jacobian‑Transpose thinks like a gradient step: if small changes in angles move the end by `Δp ≈ J Δθ`, then turning in the direction of `J^T (t − p)` should make the error shrink. Here it takes an adaptive step and clamps it by `γ` for stability. The payoff is coordinated, smooth updates and an easy path to richer goals (like mixing position and orientation) — as long as you keep the step size in check near singular poses.

We minimize position error r = t − p(θ). Linearizing

$$\Delta\mathbf{p} \approx J(\theta)\,\Delta\boldsymbol{\theta}.$$

Gradient descent on E = 1/2 ||r||^2 gives

$$\Delta\boldsymbol{\theta} = -\alpha\,\nabla_{\theta}E = \alpha\,J^T r.$$

Choosing the step by projecting the desired motion r onto the predicted motion v = J J^T r yields

$$\alpha = \frac{r^\top v}{v^\top v + \varepsilon} = \frac{r^\top J J^T r}{\lVert J J^T r\rVert^2 + \varepsilon},$$

then clamp 0 ≤ α ≤ γ for stability (as done in the demo). In 2D, the Jacobian column for joint i is a perpendicular to the joint→end vector; see the dedicated section below.

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

DLS is the calm one. It takes a regularized least‑squares step `Δθ = J^T (J J^T + λ^2 I)^{-1} r`, which naturally tempers directions that would otherwise explode near singularities. Turn λ up for composure, down for responsiveness, and you’ll get graceful behavior even when the target or base won’t sit still.

Formally, solve the Tikhonov‑regularized problem

$$\min_{\Delta\theta}\;\lVert J\,\Delta\theta - r\rVert^2 + \lambda^2\,\lVert \Delta\theta\rVert^2,$$

whose normal equations give

$$\Delta\theta = (J^T J + \lambda^2 I)^{-1} J^T r.$$

Using the matrix identity (Woodbury), this equals the dual form we implement efficiently in 2D task‑space:

$$\Delta\theta = J^T\,(J J^T + \lambda^2 I)^{-1} r.$$

As λ → 0 you recover least‑squares (fast but sensitive); as λ grows you get smaller, more conservative steps. Combine with a global damping factor to smooth motion frame‑to‑frame.

Pseudo‑step (2D task):

```text
A = J J^T + λ^2 I    // 2×2 in this demo
y = A^{-1} r
Δθ = J^T y
θ ← θ + Δθ * damping
```

Tuning: raise `λ` for stability (less aggressive updates), lower it for responsiveness. Combine with global `Damping` for smooth paths.

## When Things Get Tricky

Outside the reach circle, all methods will align toward the target and rest on the boundary — that’s expected. Near straight‑line (singular) poses, gradient‑based updates can wobble unless you rein them in; that’s why the JT step is clamped by `γ`, and why DLS’s λ exists at all. If you see ringing, ease γ up or add damping; if things feel sluggish, give the solver a few more iterations per frame. Joint limits add realism but also resistance — clamp after each update and let the solvers negotiate their way along the arcs rather than fighting them.

## Which Solver When

Use CCD when you want a tiny, dependable hammer and don’t mind a little wiggle on long chains. Reach for FABRIK when you care about fast, stable convergence and clean paths — it’s a favorite for character rigs. Choose Jacobian methods when you want to combine objectives (position now, orientation later) and tune behavior; DLS, in particular, shines when you need robustness over raw snap.

## Beyond This Demo

There’s plenty more to explore: per‑joint limits and soft preferences, stronger regularization, end‑effector orientation, even obstacle avoidance by projecting joints away between passes. The math scales naturally to 3D, and the same ideas power everything from robotic arms to full‑body avatars.

### References and Further Reading

- Aristidou & Lasenby, “FABRIK: A fast, iterative solver for the Inverse Kinematics problem” (2011)
- Buss, “Introduction to Inverse Kinematics with Jacobian Methods” (2004)
- Tolani, Goswami, & Badler, “Real-Time Inverse Kinematics Techniques for Anthropomorphic Limbs” (2000)
- Wampler, “Manipulator Inverse Kinematic Solutions Based on Vector Formulations and Damped Least‑Squares Methods” (1986)
- Nakamura & Hanafusa, “Inverse kinematics solutions with singularity avoidance for robot manipulator control” (1986)
- Maciejewski & Klein, “Obstacle avoidance for kinematically redundant manipulators in dynamically varying environments” (1985)
