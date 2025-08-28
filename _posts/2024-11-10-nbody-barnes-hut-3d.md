---
layout: post
title: "Interactive 3D N-Body Gravity Simulation with Barnes-Hut Optimization"
description: "Explore the dynamics of gravitational systems with this interactive 3D simulation featuring both Barnes-Hut (O(N log N)) and direct-sum (O(N²)) methods."
date: 2024-11-10
categories: physics simulation
---

## Introduction

The **N-body problem** is one of the most fascinating challenges in computational physics and astronomy. It involves predicting the motion of N celestial objects (stars, planets, particles) under their mutual gravitational influence. While we can solve the two-body problem analytically, systems with three or more bodies require sophisticated numerical methods.

This interactive simulation demonstrates two approaches to solving the N-body problem:
- **Barnes-Hut Algorithm**: An efficient O(N log N) approximation method
- **Direct Summation**: The exact O(N²) brute-force approach

## The Physics Behind the Simulation

### Gravitational N-Body Dynamics

Each particle in our simulation follows Newton's laws under gravitational forces from all other particles. The gravitational force between two particles with masses $m_i$ and $m_j$ separated by distance $r_{ij}$ is:

$$\vec{F}_{ij} = -G \frac{m_i m_j}{|\vec{r}_{ij}|^3} \vec{r}_{ij}$$

Where:
- $G$ is the gravitational constant
- $\vec{r}_{ij} = \vec{r}_j - \vec{r}_i$ is the separation vector
- The negative sign indicates attraction

The total force on particle $i$ is the sum over all other particles:

$$\vec{F}_i = \sum_{j \neq i} \vec{F}_{ij}$$

This leads to the equation of motion:

$$m_i \frac{d^2\vec{r}_i}{dt^2} = \vec{F}_i$$

### The Computational Challenge

For N particles, computing all pairwise forces requires $\frac{N(N-1)}{2} \approx \frac{N^2}{2}$ calculations per time step. This **O(N²) scaling** becomes prohibitively expensive for large systems:

- **1,000 particles**: ~500,000 force calculations
- **10,000 particles**: ~50,000,000 force calculations
- **100,000 particles**: ~5,000,000,000 force calculations

Real astrophysical simulations often involve millions or billions of particles, making direct methods impractical.

## The Barnes-Hut Algorithm

### Core Principle

The Barnes-Hut algorithm, developed by Josh Barnes and Piet Hut in 1986, reduces computational complexity from O(N²) to **O(N log N)** using a clever approximation: distant groups of particles can be treated as single massive particles located at their center of mass.

### Spatial Decomposition with Octrees

The algorithm works by:

1. **Spatial Subdivision**: Recursively divide 3D space into octants (8 cubic regions)
2. **Hierarchical Tree**: Build an octree where each node represents a spatial region
3. **Mass Distribution**: Store total mass and center of mass for each node
4. **Multipole Approximation**: Use the multipole acceptance criterion to decide when to approximate

### The Multipole Acceptance Criterion

For each particle, we traverse the octree and at each node ask: *"Can I treat this entire subtree as a single particle?"*

The criterion is: $\frac{s}{d} < \theta$

Where:
- $s$ = size of the tree node (spatial extent)
- $d$ = distance from particle to node's center of mass
- $\theta$ = **theta parameter** (accuracy threshold)

**If the criterion is satisfied**: Treat the entire node as a single particle
**If not**: Descend into child nodes and repeat

### Theta Parameter Trade-off

- **Small θ (0.3-0.5)**: High accuracy, more computations, approaches direct method
- **Large θ (1.0-1.5)**: Fast computation, lower accuracy, more approximation error

Typically θ ≈ 0.5-0.8 provides good balance between speed and accuracy.

## Numerical Integration: Leapfrog Method

We use the **leapfrog integration** scheme, which is symplectic (energy-conserving) and second-order accurate:

```
1. Kick (half step):    v(t+dt/2) = v(t) + a(t) × dt/2
2. Drift (full step):   x(t+dt) = x(t) + v(t+dt/2) × dt
3. Compute forces:      a(t+dt) = F(x(t+dt))/m
4. Kick (half step):    v(t+dt) = v(t+dt/2) + a(t+dt) × dt/2
```

This method preserves energy much better than simple Euler integration, crucial for long-term stability.

## Simulation Setup: Rotating Galactic Disc

Our initial conditions create a **rotating disc** that mimics galaxy formation:

### Position Distribution
Particles are distributed with radius $r \propto \sqrt{\text{random}}$ to create realistic density profiles, with small vertical dispersion to form a thin disc.

### Velocity Profile
Each particle receives approximately circular velocity plus perturbations:
- **Circular velocity**: $v_{\text{circ}} = \sqrt{\frac{GM_{\text{enc}}(r)}{r}}$
- **Bar-like shear**: Creates spiral arm instabilities
- **Random velocities**: Adds realistic velocity dispersion

This setup naturally evolves into spiral galaxy structures through gravitational interactions.

## Parameter Guide

### **Theta (θ): Barnes-Hut Accuracy**
- **Range**: 0.3 - 1.5
- **Effect**: Controls speed vs. accuracy trade-off
- **Low values** (0.3-0.5): More accurate, slower computation
- **High values** (1.0-1.5): Faster computation, more approximation
- **Recommended**: 0.5-0.8 for good balance

### **Time Step (dt): Integration Precision**
- **Range**: 0.001 - 0.03
- **Effect**: Smaller steps = better accuracy but slower simulation
- **Too large**: Energy drift, numerical instabilities
- **Too small**: Unnecessarily slow computation
- **Recommended**: 0.01 for stable evolution

### **Softening (ε): Gravitational Smoothing**
- **Range**: 0.002 - 0.05
- **Purpose**: Prevents singular forces when particles get very close
- **Physics**: Represents finite particle size or quantum effects
- **Effect**: Larger values make forces smoother but less realistic
- **Recommended**: 0.01 for stable dynamics

### **Particles (N): System Size**
- **Range**: 1,000 - 8,000
- **Performance**:
  - Barnes-Hut scales as O(N log N)
  - Direct method scales as O(N²)
- **Memory**: Higher N requires more RAM
- **Visual**: More particles show finer structure

## What to Observe

### **Spiral Arm Formation**
Watch how the initially smooth disc develops spiral density waves through gravitational instabilities. This mirrors real galaxy evolution.

### **Performance Comparison**
Switch between Barnes-Hut and Direct methods to see the dramatic performance difference. With 3000+ particles, Barnes-Hut runs ~10-100× faster while maintaining good accuracy.

### **Energy Conservation**
Monitor the energy drift graph. Good simulations maintain energy to within ~1-5%. Larger drift indicates numerical problems or inadequate time resolution.


Total energy: $E = K + U$

**Kinetic energy**: 
$$K = \frac{1}{2}\sum_{i=1}^{N} m_i |\vec{v}_i|^2$$

**Potential energy**: 
$$U = -\frac{1}{2}\sum_{i=1}^{N}\sum_{j \neq i} \frac{G m_i m_j}{|\vec{r}_{ij}|}$$

**Energy drift**: 
$$\Delta E = \frac{E(t) - E(0)}{|E(0)|} \times 100\%$$

Good simulations maintain $$\|\Delta E\| < 1$$ over hundreds of dynamical times.

### **Dynamic Range**
Observe both:
- **Large-scale structure**: Overall spiral pattern evolution
- **Small-scale dynamics**: Individual particle orbits and interactions

---

## Try the Simulation!

Use the controls below to explore different parameter regimes and observe how gravitational physics shapes the evolution of particle systems. Notice how the Barnes-Hut algorithm enables real-time simulation of thousands of particles while maintaining remarkable accuracy.

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #0a0a0a;
  color: #e0e0e0;
}

#container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

#controls {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.control-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

button {
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #444;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #3a3a3a;
}

button:active {
  background: #1a1a1a;
}

select {
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #444;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.slider-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slider-group label {
  font-size: 0.9rem;
  min-width: 80px;
  font-weight: bold;
  color: #fff;
}

.slider-group input[type="range"] {
  width: 120px;
}

.slider-group .value {
  font-family: monospace;
  min-width: 60px;
  text-align: right;
  color: #8cf;
  font-weight: bold;
}

#status {
  font-family: monospace;
  font-size: 0.9rem;
  color: #8cf;
  padding: 0.5rem;
  background: #1a1a1a;
  border-radius: 4px;
  flex: 1 1 100%;
  text-align: center;
}

#viz-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
}

#viz {
  width: 100%;
  height: 100%;
}

#energy-container {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

#energy-container h3 {
  color: #fff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

#energy {
  border: 1px solid #333;
  background: #0a0a0a;
  display: block;
  margin: 0 auto;
  max-width: 100%;
  width: 100%;
  height: 120px;
  max-height: 120px;
}

@media (max-width: 768px) {
  .control-group {
    flex: 1 1 100%;
  }
  
  .slider-group input[type="range"] {
    width: 100px;
  }
}

.no-webgl {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: #f88;
  text-align: center;
  padding: 2rem;
}
</style>

<div id="container">
  <div id="controls">
    <div class="control-group">
      <button id="play-pause">Pause</button>
      <button id="reset">Reset</button>
      <button id="reseed">Re-seed</button>
    </div>
    
    <div class="control-group">
      <label for="mode">Mode:</label>
      <select id="mode">
        <option value="barnes-hut">Barnes–Hut (O(N log N))</option>
        <option value="direct">Direct (O(N²))</option>
      </select>
    </div>
    
    <div class="slider-group">
      <label for="theta">Theta (θ):</label>
      <input type="range" id="theta" min="0.3" max="1.5" step="0.05" value="0.8">
      <span class="value" id="theta-value">0.8</span>
    </div>
    
    <div class="slider-group">
      <label for="dt">Time Step (dt):</label>
      <input type="range" id="dt" min="0.001" max="0.03" step="0.001" value="0.01">
      <span class="value" id="dt-value">0.010</span>
    </div>
    
    <div class="slider-group">
      <label for="eps">Softening (ε):</label>
      <input type="range" id="eps" min="0.002" max="0.05" step="0.001" value="0.01">
      <span class="value" id="eps-value">0.010</span>
    </div>
    
    <div class="slider-group">
      <label for="npart">Particles (N):</label>
      <input type="range" id="npart" min="1000" max="8000" step="500" value="3000">
      <span class="value" id="npart-value">3000</span>
    </div>
    
    <div id="status">t=0.00 drift=0.00% mode=BH | step=0ms fps≈0</div>
  </div>
  
  <div id="viz-container">
    <div id="viz"></div>
  </div>
  
  <div id="energy-container">
    <h3>Energy Drift</h3>
    <canvas id="energy" width="800" height="120"></canvas>
  </div>
</div>

<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>

<script type="module">
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Check WebGL support
if (!WebGLRenderingContext) {
  document.getElementById('viz').innerHTML = '<div class="no-webgl">WebGL is not supported in your browser</div>';
  throw new Error('WebGL not supported');
}

// Simulation parameters
let params = {
  theta: 0.8,
  dt: 0.01,
  eps: 0.01,
  N: 3000,
  mode: 'barnes-hut',
  playing: true
};

// Simulation state
let time = 0;
let frameCount = 0;
let lastFrameTime = performance.now();
let stepTime = 0;
let fps = 0;
let E0 = null;
let energyDrift = 0;

// Arrays for physics
let x, y, z, vx, vy, vz, ax, ay, az, m;
let positions, speeds;

// Energy tracking
const energyHistory = new Float32Array(800);
let energyIndex = 0;
let energyCount = 0;

// Three.js objects
let scene, camera, renderer, controls, points, geometry;

// Octree for Barnes-Hut
class OctreeNode {
  constructor(cx, cy, cz, hs) {
    this.cx = cx;
    this.cy = cy;
    this.cz = cz;
    this.hs = hs;
    this.m = 0;
    this.comx = 0;
    this.comy = 0;
    this.comz = 0;
    this.body = -1;
    this.children = null;
  }
}

// Initialize arrays
function initArrays(n) {
  x = new Float32Array(n);
  y = new Float32Array(n);
  z = new Float32Array(n);
  vx = new Float32Array(n);
  vy = new Float32Array(n);
  vz = new Float32Array(n);
  ax = new Float32Array(n);
  ay = new Float32Array(n);
  az = new Float32Array(n);
  m = new Float32Array(n);
  positions = new Float32Array(n * 3);
  speeds = new Float32Array(n);
}

// Seed the system - rotating disc
function seedSystem() {
  const n = params.N;
  const Rmax = 2.2;
  const totalMass = 1.0;
  const mi = totalMass / n;
  
  for (let i = 0; i < n; i++) {
    // Biased radial distribution
    const r = Rmax * Math.sqrt(Math.random());
    const phi = Math.random() * 2 * Math.PI;
    
    // Position
    x[i] = r * Math.cos(phi);
    y[i] = r * Math.sin(phi);
    z[i] = gaussianRandom() * 0.06;
    
    // Mass
    m[i] = mi;
    
    // Velocity - approximate circular with noise
    const Menc = totalMass * (r / Rmax) * (r / Rmax); // Simplified enclosed mass
    const vcirc = Math.sqrt(Menc / r);
    
    // Add slight bar-like shear for spiral arms
    const shear = 0.1 * Math.sin(2 * phi);
    
    vx[i] = -vcirc * Math.sin(phi) * (1 + shear) + gaussianRandom() * 0.01;
    vy[i] = vcirc * Math.cos(phi) * (1 + shear) + gaussianRandom() * 0.01;
    vz[i] = gaussianRandom() * 0.01;
  }
}

// Gaussian random number generator
function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Build octree
function buildOctree() {
  const n = params.N;
  
  // Find bounds
  let minX = x[0], maxX = x[0];
  let minY = y[0], maxY = y[0];
  let minZ = z[0], maxZ = z[0];
  
  for (let i = 1; i < n; i++) {
    minX = Math.min(minX, x[i]);
    maxX = Math.max(maxX, x[i]);
    minY = Math.min(minY, y[i]);
    maxY = Math.max(maxY, y[i]);
    minZ = Math.min(minZ, z[i]);
    maxZ = Math.max(maxZ, z[i]);
  }
  
  // Create cubic root with padding
  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  const hs = Math.max(maxX - minX, maxY - minY, maxZ - minZ) * 0.5 * 1.1;
  
  const root = new OctreeNode(cx, cy, cz, hs);
  
  // Insert bodies
  for (let i = 0; i < n; i++) {
    insertBody(root, i);
  }
  
  return root;
}

// Insert body into octree
function insertBody(node, i) {
  // If node is empty, place body here
  if (node.body === -1 && node.children === null) {
    node.body = i;
    node.m = m[i];
    node.comx = x[i];
    node.comy = y[i];
    node.comz = z[i];
    return;
  }
  
  // If node has a body, need to subdivide
  if (node.body !== -1) {
    const oldBody = node.body;
    node.body = -1;
    
    // Create children
    node.children = new Array(8);
    for (let j = 0; j < 8; j++) {
      const hs2 = node.hs * 0.5;
      const cx2 = node.cx + ((j & 1) ? hs2 : -hs2);
      const cy2 = node.cy + ((j & 2) ? hs2 : -hs2);
      const cz2 = node.cz + ((j & 4) ? hs2 : -hs2);
      node.children[j] = new OctreeNode(cx2, cy2, cz2, hs2);
    }
    
    // Reinsert old body
    insertBody(node, oldBody);
  }
  
  // Insert new body into appropriate child
  const idx = ((x[i] > node.cx) ? 1 : 0) |
               ((y[i] > node.cy) ? 2 : 0) |
               ((z[i] > node.cz) ? 4 : 0);
  insertBody(node.children[idx], i);
  
  // Update mass and center of mass
  const oldMass = node.m;
  node.m += m[i];
  node.comx = (node.comx * oldMass + x[i] * m[i]) / node.m;
  node.comy = (node.comy * oldMass + y[i] * m[i]) / node.m;
  node.comz = (node.comz * oldMass + z[i] * m[i]) / node.m;
}

// Compute forces using Barnes-Hut
function computeForcesBH() {
  const n = params.N;
  const root = buildOctree();
  const theta = params.theta;
  const eps2 = params.eps * params.eps;
  
  // Clear accelerations
  ax.fill(0);
  ay.fill(0);
  az.fill(0);
  
  // For each body, traverse tree
  for (let i = 0; i < n; i++) {
    const stack = [root];
    
    while (stack.length > 0) {
      const node = stack.pop();
      
      // Skip empty nodes
      if (node.m === 0) continue;
      
      // If leaf with self, skip
      if (node.body === i) continue;
      
      // Compute distance to COM
      const dx = node.comx - x[i];
      const dy = node.comy - y[i];
      const dz = node.comz - z[i];
      const dist2 = dx * dx + dy * dy + dz * dz + eps2;
      const dist = Math.sqrt(dist2);
      
      // Check multipole acceptance criterion
      if (node.children === null || (2 * node.hs) / dist < theta) {
        // Treat as single mass
        const f = node.m / (dist2 * dist);
        ax[i] += f * dx;
        ay[i] += f * dy;
        az[i] += f * dz;
      } else {
        // Descend into children
        for (let j = 0; j < 8; j++) {
          if (node.children[j].m > 0) {
            stack.push(node.children[j]);
          }
        }
      }
    }
  }
}

// Compute forces using direct summation
function computeForcesDirect() {
  const n = params.N;
  const eps2 = params.eps * params.eps;
  
  // Clear accelerations
  ax.fill(0);
  ay.fill(0);
  az.fill(0);
  
  // O(N²) pairwise forces
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      
      const dx = x[j] - x[i];
      const dy = y[j] - y[i];
      const dz = z[j] - z[i];
      const dist2 = dx * dx + dy * dy + dz * dz + eps2;
      const dist = Math.sqrt(dist2);
      const f = m[j] / (dist2 * dist);
      
      ax[i] += f * dx;
      ay[i] += f * dy;
      az[i] += f * dz;
    }
  }
}

// Compute potential energy using tree
function computePotential() {
  const n = params.N;
  const root = buildOctree();
  const theta = params.theta;
  const eps = params.eps;
  let U = 0;
  
  for (let i = 0; i < n; i++) {
    const stack = [root];
    
    while (stack.length > 0) {
      const node = stack.pop();
      
      if (node.m === 0) continue;
      if (node.body === i) continue;
      
      const dx = node.comx - x[i];
      const dy = node.comy - y[i];
      const dz = node.comz - z[i];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + eps * eps);
      
      if (node.children === null || (2 * node.hs) / dist < theta) {
        U -= m[i] * node.m / dist;
      } else {
        for (let j = 0; j < 8; j++) {
          if (node.children[j].m > 0) {
            stack.push(node.children[j]);
          }
        }
      }
    }
  }
  
  return U * 0.5; // Avoid double counting
}

// Compute total energy
function computeEnergy() {
  const n = params.N;
  
  // Kinetic energy
  let K = 0;
  for (let i = 0; i < n; i++) {
    const v2 = vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i];
    K += 0.5 * m[i] * v2;
  }
  
  // Potential energy
  const U = computePotential();
  
  return K + U;
}

// Leapfrog integration step
function step() {
  const n = params.N;
  const dt = params.dt;
  
  const t0 = performance.now();
  
  // Kick (half step)
  for (let i = 0; i < n; i++) {
    vx[i] += 0.5 * dt * ax[i];
    vy[i] += 0.5 * dt * ay[i];
    vz[i] += 0.5 * dt * az[i];
  }
  
  // Drift
  for (let i = 0; i < n; i++) {
    x[i] += dt * vx[i];
    y[i] += dt * vy[i];
    z[i] += dt * vz[i];
  }
  
  // Recompute accelerations
  if (params.mode === 'barnes-hut') {
    computeForcesBH();
  } else {
    computeForcesDirect();
  }
  
  // Kick (half step)
  for (let i = 0; i < n; i++) {
    vx[i] += 0.5 * dt * ax[i];
    vy[i] += 0.5 * dt * ay[i];
    vz[i] += 0.5 * dt * az[i];
  }
  
  stepTime = performance.now() - t0;
  time += dt;
  
  // Update energy drift
  const E = computeEnergy();
  if (E0 === null) E0 = E;
  energyDrift = (E - E0) / Math.abs(E0);
  
  // Store in history
  energyHistory[energyIndex] = energyDrift;
  energyIndex = (energyIndex + 1) % energyHistory.length;
  if (energyCount < energyHistory.length) energyCount++;
}

// Update geometry buffers
function updateGeometry() {
  const n = params.N;
  
  for (let i = 0; i < n; i++) {
    positions[i * 3] = x[i];
    positions[i * 3 + 1] = y[i];
    positions[i * 3 + 2] = z[i];
    
    const v = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
    speeds[i] = v;
  }
  
  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.speed.needsUpdate = true;
}

// Draw energy drift graph
function drawEnergyGraph() {
  const canvas = document.getElementById('energy');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);
  
  if (energyCount < 2) return;
  
  // Find min/max for adaptive scaling
  let minDrift = Infinity, maxDrift = -Infinity;
  for (let i = 0; i < energyCount; i++) {
    const idx = (energyIndex - energyCount + i + energyHistory.length) % energyHistory.length;
    const drift = energyHistory[idx];
    minDrift = Math.min(minDrift, drift);
    maxDrift = Math.max(maxDrift, drift);
  }
  
  // Ensure reasonable range
  const range = Math.max(Math.abs(minDrift), Math.abs(maxDrift), 0.001);
  const yScale = (height * 0.4) / range;
  
  // Draw axes
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();
  
  // Draw grid lines
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 0.5;
  const gridLines = 4;
  for (let i = 1; i <= gridLines; i++) {
    const y1 = height / 2 - (i / gridLines) * height * 0.4;
    const y2 = height / 2 + (i / gridLines) * height * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, y1);
    ctx.lineTo(width, y1);
    ctx.moveTo(0, y2);
    ctx.lineTo(width, y2);
    ctx.stroke();
  }
  
  // Draw drift curve
  ctx.strokeStyle = '#8cf';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let i = 0; i < energyCount; i++) {
    const idx = (energyIndex - energyCount + i + energyHistory.length) % energyHistory.length;
    const xPos = (i / Math.max(energyCount - 1, 1)) * width;
    const yPos = height / 2 - energyHistory[idx] * yScale;
    
    if (i === 0) {
      ctx.moveTo(xPos, yPos);
    } else {
      ctx.lineTo(xPos, yPos);
    }
  }
  ctx.stroke();
  
  // Draw labels with better positioning
  ctx.fillStyle = '#ccc';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('0%', 5, height / 2 - 5);
  
  ctx.textAlign = 'right';
  ctx.fillText(`${(energyDrift * 100).toFixed(3)}%`, width - 5, 15);
  
  // Draw scale indicators
  ctx.fillStyle = '#888';
  ctx.font = '10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`+${(range * 100).toFixed(2)}%`, width - 5, 25);
  ctx.fillText(`-${(range * 100).toFixed(2)}%`, width - 5, height - 5);
}

// Update status display
function updateStatus() {
  frameCount++;
  const now = performance.now();
  if (now - lastFrameTime > 1000) {
    fps = Math.round(frameCount * 1000 / (now - lastFrameTime));
    frameCount = 0;
    lastFrameTime = now;
  }
  
  const mode = params.mode === 'barnes-hut' ? 'BH' : 'Direct';
  const status = `t=${time.toFixed(2)} drift=${(energyDrift * 100).toFixed(2)}% mode=${mode} | step=${stepTime.toFixed(1)}ms fps≈${fps}`;
  document.getElementById('status').textContent = status;
}

// Initialize Three.js
function initThree() {
  const container = document.getElementById('viz');
  
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  
  // Camera
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // Initialize arrays before creating geometry
  if (!positions || !speeds) {
    initArrays(params.N);
    seedSystem();
  }
  
  // Create points geometry with initialized arrays
  geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));
  
  // Shader material
  const vertexShader = `
    attribute float speed;
    varying float vSpeed;
    uniform float uSize;
    uniform float uDevicePixelRatio;
    
    void main() {
      vSpeed = speed;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = uSize * uDevicePixelRatio * (1.0 / -mvPosition.z);
    }
  `;
  
  const fragmentShader = `
    varying float vSpeed;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float r = length(xy);
      if (r > 0.5) discard;
      
      float intensity = 1.0 - 2.0 * r;
      intensity = intensity * intensity;
      
      // Color by speed: cool -> white -> warm
      float t = clamp(vSpeed * 2.0, 0.0, 1.0);
      vec3 cool = vec3(0.2, 0.5, 1.0);
      vec3 white = vec3(1.0, 1.0, 1.0);
      vec3 warm = vec3(1.0, 0.8, 0.3);
      
      vec3 color;
      if (t < 0.5) {
        color = mix(cool, white, t * 2.0);
      } else {
        color = mix(white, warm, (t - 0.5) * 2.0);
      }
      
      gl_FragColor = vec4(color * intensity, intensity);
    }
  `;
  
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 20.0 },
      uDevicePixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });
  
  points = new THREE.Points(geometry, material);
  scene.add(points);
  
  // Mark attributes as dynamic
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  geometry.attributes.speed.setUsage(THREE.DynamicDrawUsage);
  
  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
  resizeObserver.observe(container);
}

// Initialize simulation
function init() {
  // Only reinitialize if needed (arrays already initialized in initThree)
  if (!x || x.length !== params.N) {
    initArrays(params.N);
    seedSystem();
  }
  
  // Initial force computation
  if (params.mode === 'barnes-hut') {
    computeForcesBH();
  } else {
    computeForcesDirect();
  }
  
  // Reset energy baseline
  E0 = null;
  time = 0;
  energyCount = 0;
  energyIndex = 0;
  energyHistory.fill(0);
}

// Reset simulation
function reset() {
  seedSystem();
  init();
  updateGeometry();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (params.playing) {
    step();
    updateGeometry();
    updateStatus();
    drawEnergyGraph();
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// UI event handlers
document.getElementById('play-pause').addEventListener('click', () => {
  params.playing = !params.playing;
  document.getElementById('play-pause').textContent = params.playing ? 'Pause' : 'Play';
});

document.getElementById('reset').addEventListener('click', reset);

document.getElementById('reseed').addEventListener('click', () => {
  seedSystem();
  reset();
});

document.getElementById('mode').addEventListener('change', (e) => {
  params.mode = e.target.value;
});

document.getElementById('theta').addEventListener('input', (e) => {
  params.theta = parseFloat(e.target.value);
  document.getElementById('theta-value').textContent = params.theta.toFixed(1);
});

document.getElementById('dt').addEventListener('input', (e) => {
  params.dt = parseFloat(e.target.value);
  document.getElementById('dt-value').textContent = params.dt.toFixed(3);
});

document.getElementById('eps').addEventListener('input', (e) => {
  params.eps = parseFloat(e.target.value);
  document.getElementById('eps-value').textContent = params.eps.toFixed(3);
});

document.getElementById('npart').addEventListener('input', (e) => {
  const newN = parseInt(e.target.value);
  document.getElementById('npart-value').textContent = newN;
  
  if (newN !== params.N) {
    params.N = newN;
    initArrays(params.N);
    
    // Update geometry with new size
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1).setUsage(THREE.DynamicDrawUsage));
    
    reset();
  }
});

// Start
initThree();
init();
updateGeometry();  // Populate geometry with initial particle positions
animate();
</script>