---
layout: post
title: "Interactive 3D N-Body Gravity Simulation with Barnes-Hut Optimization"
description: "Explore the dynamics of gravitational systems with this interactive 3D simulation featuring both Barnes-Hut (O(N log N)) and direct-sum (O(N²)) methods."
date: 2025-08-10
categories: physics simulation
tags: [n-body, barnes-hut, galaxy, gravitational, astrophysics]
img: /assets/img/galaxy.png
---

## Why I Built This

I've always been fascinated by gravity. Not just the everyday kind that keeps us grounded, but the cosmic choreography that shapes entire galaxies. How do billions of stars dance together to form those beautiful spiral arms we see in Hubble images? What happens when two galaxies collide? These questions led me down a rabbit hole that eventually resulted in this interactive 3D simulation.

The **N-body problem** is basically this: if you have N objects all pulling on each other with gravity, how do they move? For two objects (like Earth and Moon), we can solve this exactly. But add just one more object and suddenly the math becomes... well, let's just say there's no clean solution. You need to simulate it step by step.

I wanted to show you two different approaches:
- **Barnes-Hut Algorithm**: A clever trick that makes the simulation blazing fast
- **Direct Summation**: The brute-force approach where every particle feels every other particle

But here's what really excites me about this project...

## The Real Story of Galaxy Formation

Before we dive into the simulation, let me clear up a common misconception. Galaxies didn't form from explosions—that's actually way cooler than that.

Picture this: About 13.8 billion years ago, the Big Bang created a universe that was almost perfectly smooth, but not quite. There were tiny density fluctuations—some regions had just a little bit more matter than others. These tiny differences were like seeds.

Over millions of years, gravity did its thing. The denser regions attracted more matter, growing slowly but steadily. Dark matter (which we can't see but makes up most of the universe) clumped together first, forming invisible scaffolding called "dark matter halos."

Then regular matter—hydrogen and helium gas—fell into these dark matter halos like water flowing into a bowl. As the gas collapsed, it started spinning (conservation of angular momentum), forming rotating discs. When the gas became dense and hot enough, stars began to form.

**This is exactly what you'll see in the simulation!** Those rotating discs that emerge aren't just pretty patterns—they're recreating billions of years of cosmic evolution in fast-forward. The spiral arms that develop naturally from gravitational instabilities? That's how we think our own Milky Way got its iconic shape.

The galaxy merger scenarios I included show another crucial part of the story. Galaxies aren't isolated islands—they're constantly interacting, merging, and growing. Most large galaxies, including ours, are thought to be the result of many smaller galaxies merging over cosmic time.

So no explosions—just gravity, time, and the universe's incredible ability to build structure from simplicity.

## This Is How We Study the Universe

When I started building this simulation, I didn't realize I was essentially recreating the same methods that astronomers use to understand cosmic evolution. It turns out the algorithms running in your browser right now are the same ones powering some of the most ambitious scientific endeavors in human history.

### **Galaxy Formation in Your Browser**
That rotating disc you'll see in the simulation? That's not just a pretty pattern—it's how we think the Milky Way formed billions of years ago. Astrophysicists run massive versions of this simulation with millions of particles to understand how spiral arms emerge and evolve.

The "Galaxy Merger" preset I included recreates one of the most dramatic events in cosmic history. In about 4.5 billion years, our Milky Way will collide with Andromeda—and this is exactly how scientists study what will happen.

### **Cosmic Web Formation**
The same Barnes-Hut algorithm I implemented here scales up to track dark matter particles forming the largest structures in the universe—the cosmic web of filaments that spans hundreds of millions of light-years. When you watch particles clumping together in the simulation, you're seeing the same physics that created every galaxy cluster we observe.

### **A 1986 Revolution**
Josh Barnes and Piet Hut published their breakthrough algorithm in 1986, and it completely transformed computational astrophysics. Before their work, simulations were limited to a few thousand particles—nowhere near enough to model realistic galaxies. Their clever insight about treating distant groups of particles as single masses suddenly made simulations with millions of particles possible.

### **Modern Supercomputing**
Today's astrophysics codes like GADGET, AREPO, and RAMSES use GPU acceleration to simulate systems with *billions* of particles. The Millennium Simulation—one of the most famous—followed 21.6 billion particles over the entire history of the universe, from shortly after the Big Bang to today.

### **What You're Really Experiencing**
When you play with this simulation, you're not just watching pretty dots move around. You're experiencing the same fundamental physics that governs:
- How the cosmic web formed after the Big Bang
- Why our galaxy has spiral arms
- What will happen when Milky Way and Andromeda collide
- How globular clusters evolve over billions of years

Every time you adjust the parameters and watch the system evolve, you're doing the same kind of experiments that help us understand our place in the cosmos.

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

<div style="text-align: center; margin: 2rem 0;">
  <svg width="700" height="450" viewBox="0 0 700 450" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border: 1px solid #333; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
    <!-- Title -->
    <text x="350" y="30" fill="#64ffda" font-size="18" font-weight="bold" text-anchor="middle" style="text-shadow: 0 0 10px rgba(100,255,218,0.5);">Barnes-Hut Octree Structure</text>
    
    <!-- 3D Space visualization -->
    <g transform="translate(60, 60)">
      <!-- Background for space region -->
      <rect x="-5" y="-5" width="210" height="210" fill="rgba(0,0,0,0.2)" stroke="none" rx="8"/>
      
      <!-- Main cube outline -->
      <rect x="0" y="0" width="200" height="200" fill="none" stroke="#64ffda" stroke-width="3" rx="4"/>
      
      <!-- Primary subdivision lines (main octant divisions) -->
      <line x1="100" y1="0" x2="100" y2="200" stroke="#4caf50" stroke-width="2" opacity="0.8"/>
      <line x1="0" y1="100" x2="200" y2="100" stroke="#4caf50" stroke-width="2" opacity="0.8"/>
      
      <!-- Secondary subdivision lines (finer divisions) -->
      <line x1="50" y1="50" x2="150" y2="50" stroke="#ff9800" stroke-width="1.5" opacity="0.6"/>
      <line x1="50" y1="150" x2="150" y2="150" stroke="#ff9800" stroke-width="1.5" opacity="0.6"/>
      <line x1="50" y1="50" x2="50" y2="150" stroke="#ff9800" stroke-width="1.5" opacity="0.6"/>
      <line x1="150" y1="50" x2="150" y2="150" stroke="#ff9800" stroke-width="1.5" opacity="0.6"/>
      
      <!-- Octant labels for clarity -->
      <text x="50" y="50" fill="#64ffda" font-size="10" text-anchor="middle" opacity="0.7">I</text>
      <text x="150" y="50" fill="#64ffda" font-size="10" text-anchor="middle" opacity="0.7">II</text>
      <text x="50" y="150" fill="#64ffda" font-size="10" text-anchor="middle" opacity="0.7">III</text>
      <text x="150" y="150" fill="#64ffda" font-size="10" text-anchor="middle" opacity="0.7">IV</text>
      
      <!-- Particles with glow effect -->
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <circle cx="30" cy="30" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="80" cy="40" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="120" cy="70" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="160" cy="120" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="40" cy="160" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="180" cy="180" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="70" cy="180" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      <circle cx="170" cy="40" r="3.5" fill="#ff6b6b" filter="url(#glow)"/>
      
      <!-- Center of mass indicators with enhanced visibility -->
      <circle cx="55" cy="35" r="5" fill="#4caf50" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
      <circle cx="145" cy="80" r="5" fill="#4caf50" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
      <circle cx="125" cy="150" r="5" fill="#4caf50" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
      <circle cx="55" cy="170" r="5" fill="#4caf50" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
      
      <!-- Space region label -->
      <text x="100" y="220" fill="#ccc" font-size="12" text-anchor="middle" font-weight="bold">3D Space Subdivision</text>
    </g>
    
    <!-- Tree structure with improved layout -->
    <g transform="translate(340, 70)">
      <!-- Tree background -->
      <rect x="-10" y="-10" width="180" height="140" fill="rgba(0,0,0,0.15)" stroke="none" rx="8"/>
      
      <!-- Root node -->
      <rect x="65" y="0" width="50" height="30" fill="#64ffda" stroke="#fff" stroke-width="2" rx="4"/>
      <text x="90" y="20" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">Root</text>
      
      <!-- Connection lines with better styling -->
      <line x1="90" y1="30" x2="90" y2="50" stroke="#ccc" stroke-width="2"/>
      <line x1="30" y1="55" x2="150" y2="55" stroke="#ccc" stroke-width="2"/>
      <line x1="30" y1="50" x2="30" y2="55" stroke="#ccc" stroke-width="2"/>
      <line x1="70" y1="50" x2="70" y2="55" stroke="#ccc" stroke-width="2"/>
      <line x1="110" y1="50" x2="110" y2="55" stroke="#ccc" stroke-width="2"/>
      <line x1="150" y1="50" x2="150" y2="55" stroke="#ccc" stroke-width="2"/>
      
      <!-- Level 1 nodes with consistent styling -->
      <rect x="10" y="60" width="35" height="25" fill="#4caf50" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="27.5" y="76" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Q1</text>
      
      <rect x="55" y="60" width="35" height="25" fill="#4caf50" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="72.5" y="76" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Q2</text>
      
      <rect x="100" y="60" width="35" height="25" fill="#4caf50" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="117.5" y="76" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Q3</text>
      
      <rect x="145" y="60" width="35" height="25" fill="#4caf50" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="162.5" y="76" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">Q4</text>
      
      <!-- Level 2 subdivision example -->
      <line x1="72.5" y1="85" x2="72.5" y2="100" stroke="#ccc" stroke-width="2"/>
      <line x1="55" y1="105" x2="90" y2="105" stroke="#ccc" stroke-width="2"/>
      <line x1="55" y1="100" x2="55" y2="105" stroke="#ccc" stroke-width="2"/>
      <line x1="90" y1="100" x2="90" y2="105" stroke="#ccc" stroke-width="2"/>
      
      <rect x="40" y="110" width="25" height="20" fill="#ff9800" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="52.5" y="123" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">2.1</text>
      
      <rect x="75" y="110" width="25" height="20" fill="#ff9800" stroke="#fff" stroke-width="1.5" rx="3"/>
      <text x="87.5" y="123" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">2.2</text>
      
      <!-- Tree structure label -->
      <text x="90" y="150" fill="#ccc" font-size="12" text-anchor="middle" font-weight="bold">Hierarchical Tree</text>
    </g>
    
    <!-- Enhanced Legend -->
    <g transform="translate(60, 320)">
      <rect x="-10" y="0" width="220" height="60" fill="rgba(0,0,0,0.2)" stroke="#333" stroke-width="1" rx="8"/>
      <text x="0" y="20" fill="#64ffda" font-size="14" font-weight="bold">Legend</text>
      
      <circle cx="15" cy="40" r="4" fill="#ff6b6b" filter="url(#glow)"/>
      <text x="25" y="45" fill="#fff" font-size="12" font-weight="500">Particles</text>
      
      <circle cx="90" cy="40" r="5" fill="#4caf50" stroke="#fff" stroke-width="2" filter="url(#glow)"/>
      <text x="103" y="45" fill="#fff" font-size="12" font-weight="500">Center of Mass</text>
    </g>


    <!-- Enhanced Explanation -->
    <g transform="translate(300, 320)">
      <rect x="-10" y="0" width="380" height="100" fill="rgba(0,0,0,0.2)" stroke="#333" stroke-width="1" rx="8"/>
      <text x="0" y="20" fill="#64ffda" font-size="14" font-weight="bold">How It Works</text>
      <text x="0" y="40" fill="#fff" font-size="12">• 3D space recursively subdivided into octants (shown in 2D)</text>
      <text x="0" y="55" fill="#fff" font-size="12">• Each tree node stores total mass and center of mass</text>
      <text x="0" y="70" fill="#fff" font-size="12">• Subdivisions continue until each leaf contains ≤1 particle</text>
      <text x="0" y="85" fill="#fff" font-size="12">• Enables O(N log N) force calculations vs O(N²) direct method</text>
    </g>
  </svg>
</div>

### The Multipole Acceptance Criterion

For each particle, we traverse the octree and at each node ask: *"Can I treat this entire subtree as a single particle?"*

The criterion is: $\frac{s}{d} < \theta$

Where:
- $s$ = size of the tree node (spatial extent)
- $d$ = distance from particle to node's center of mass
- $\theta$ = **theta parameter** (accuracy threshold)

**If the criterion is satisfied**: Treat the entire node as a single particle
**If not**: Descend into child nodes and repeat

<div style="text-align: center; margin: 2rem 0;">
  <svg width="800" height="420" viewBox="0 0 800 420" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border: 1px solid #333; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
    <!-- Title -->
    <text x="400" y="30" fill="#64ffda" font-size="18" font-weight="bold" text-anchor="middle" style="text-shadow: 0 0 10px rgba(100,255,218,0.5);">Multipole Acceptance Criterion: s/d &lt; θ</text>
    
    <!-- Glow filter for enhanced visuals -->
    <defs>
      <filter id="glow-criterion">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Case 1: Accept approximation (s/d < θ) -->
    <g transform="translate(70, 70)">
      <!-- Background box for clean organization -->
      <rect x="-20" y="-20" width="300" height="180" fill="rgba(76,175,80,0.1)" stroke="#4caf50" stroke-width="1" rx="12"/>
      
      <!-- Title with cleaner styling -->
      <text x="130" y="0" fill="#4caf50" font-size="16" font-weight="bold" text-anchor="middle">✓ ACCEPT</text>
      <text x="130" y="18" fill="#ccc" font-size="12" text-anchor="middle">s/d &lt; θ</text>
      
      <!-- Particle with glow -->
      <circle cx="30" cy="70" r="6" fill="#ff6b6b" filter="url(#glow-criterion)"/>
      <text x="30" y="95" fill="#fff" font-size="11" font-weight="500" text-anchor="middle">Particle</text>
      
      <!-- Tree node (distant) with cleaner design -->
      <rect x="180" y="50" width="60" height="60" fill="rgba(100,255,218,0.1)" stroke="#64ffda" stroke-width="2" rx="6"/>
      <circle cx="210" cy="80" r="5" fill="#4caf50" filter="url(#glow-criterion)"/>
      <text x="210" y="125" fill="#ccc" font-size="11" text-anchor="middle">Tree Node</text>
      
      <!-- Distance indicator with better styling -->
      <line x1="36" y1="70" x2="174" y2="80" stroke="#fff" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>
      <text x="105" y="65" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">d (large)</text>
      
      <!-- Size indicator -->
      <line x1="180" y1="40" x2="240" y2="40" stroke="#64ffda" stroke-width="3"/>
      <text x="210" y="35" fill="#64ffda" font-size="12" font-weight="bold" text-anchor="middle">s</text>
      
      <!-- Result with cleaner presentation -->
      <text x="130" y="140" fill="#4caf50" font-size="12" font-weight="bold" text-anchor="middle">Single Mass Approximation ⚡</text>
    </g>
    
    <!-- Case 2: Reject approximation (s/d ≥ θ) -->
    <g transform="translate(430, 70)">
      <!-- Background box for clean organization -->
      <rect x="-20" y="-20" width="300" height="180" fill="rgba(244,67,54,0.1)" stroke="#f44336" stroke-width="1" rx="12"/>
      
      <!-- Title with cleaner styling -->
      <text x="130" y="0" fill="#f44336" font-size="16" font-weight="bold" text-anchor="middle">✗ REJECT</text>
      <text x="130" y="18" fill="#ccc" font-size="12" text-anchor="middle">s/d ≥ θ</text>
      
      <!-- Particle (closer) -->
      <circle cx="70" cy="70" r="6" fill="#ff6b6b" filter="url(#glow-criterion)"/>
      <text x="70" y="95" fill="#fff" font-size="11" font-weight="500" text-anchor="middle">Particle</text>
      
      <!-- Tree node (close) with subdivision -->
      <rect x="140" y="50" width="60" height="60" fill="rgba(244,67,54,0.1)" stroke="#f44336" stroke-width="2" rx="6"/>
      <circle cx="170" cy="80" r="5" fill="#4caf50" filter="url(#glow-criterion)"/>
      <text x="170" y="125" fill="#ccc" font-size="11" text-anchor="middle">Tree Node</text>
      
      <!-- Subdivision lines with better visibility -->
      <line x1="170" y1="50" x2="170" y2="110" stroke="#ff9800" stroke-width="2" opacity="0.8"/>
      <line x1="140" y1="80" x2="200" y2="80" stroke="#ff9800" stroke-width="2" opacity="0.8"/>
      
      <!-- Distance indicator -->
      <line x1="76" y1="70" x2="134" y2="80" stroke="#fff" stroke-width="2" stroke-dasharray="5,5" opacity="0.8"/>
      <text x="105" y="65" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">d (small)</text>
      
      <!-- Size indicator -->
      <line x1="140" y1="40" x2="200" y2="40" stroke="#f44336" stroke-width="3"/>
      <text x="170" y="35" fill="#f44336" font-size="12" font-weight="bold" text-anchor="middle">s</text>
      
      <!-- Result with cleaner presentation -->
      <text x="130" y="140" fill="#f44336" font-size="12" font-weight="bold" text-anchor="middle">Must Subdivide 🎯</text>
    </g>
    
    <!-- Simplified theta parameter explanation -->
    <g transform="translate(100, 280)">
      <!-- Background for better organization -->
      <rect x="-20" y="-10" width="640" height="100" fill="rgba(0,0,0,0.2)" stroke="#333" stroke-width="1" rx="12"/>
      
      <text x="300" y="15" fill="#ff9800" font-size="16" font-weight="bold" text-anchor="middle">Theta Parameter Balance</text>
      
      <!-- Three clear zones with better spacing -->
      <g transform="translate(0, 30)">
        <!-- Small theta zone -->
        <rect x="0" y="0" width="180" height="50" fill="rgba(76,175,80,0.1)" stroke="#4caf50" stroke-width="1" rx="8"/>
        <text x="90" y="20" fill="#4caf50" font-size="12" font-weight="bold" text-anchor="middle">Small θ (0.3-0.5)</text>
        <text x="90" y="35" fill="#ccc" font-size="10" text-anchor="middle">High accuracy, slower</text>
        
        <!-- Optimal theta zone -->
        <rect x="210" y="0" width="180" height="50" fill="rgba(100,255,218,0.1)" stroke="#64ffda" stroke-width="2" rx="8"/>
        <text x="300" y="20" fill="#64ffda" font-size="12" font-weight="bold" text-anchor="middle">Optimal θ (0.5-0.8)</text>
        <text x="300" y="35" fill="#ccc" font-size="10" text-anchor="middle">Best balance, ~1% error</text>
        
        <!-- Large theta zone -->
        <rect x="420" y="0" width="180" height="50" fill="rgba(244,67,54,0.1)" stroke="#f44336" stroke-width="1" rx="8"/>
        <text x="510" y="20" fill="#f44336" font-size="12" font-weight="bold" text-anchor="middle">Large θ (1.0-1.5)</text>
        <text x="510" y="35" fill="#ccc" font-size="10" text-anchor="middle">Fast, lower accuracy</text>
      </g>
    </g>
  </svg>
</div>

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

## Ready to Play God with Gravity?

I've spent way too many hours tweaking this simulation (my browser history can confirm), and now it's your turn! The controls below let you experiment with the same physics that shapes galaxies.

**Here's what I love doing:**
- Start with the "Single Disc" and watch spiral arms emerge naturally—it's mesmerizing
- Switch to "Galaxy Merger" and witness cosmic destruction in real-time
- Crank up the particle count and watch Barnes-Hut work its magic (try comparing it with Direct mode... if you dare)
- Play with the theta parameter—you'll see the accuracy vs. speed trade-off in action

The energy drift graph at the bottom is my favorite debugging tool. If it stays flat, you're doing physics right. If it goes crazy, well... that's when things get interesting.

Go ahead, break the universe. I've already done it countless times while building this!

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
    
    <div class="control-group">
      <label for="seed-type">Setup:</label>
      <select id="seed-type">
        <option value="single">Single Disc</option>
        <option value="merger">Galaxy Merger</option>
      </select>
    </div>
    
    <div class="control-group">
      <label for="render-mode">Render:</label>
      <select id="render-mode">
        <option value="shader">Custom Shader</option>
        <option value="halo">Soft Halo</option>
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
    
    <div class="slider-group">
      <label for="mass">Mass Scale:</label>
      <input type="range" id="mass" min="0.5" max="5.0" step="0.1" value="1.0">
      <span class="value" id="mass-value">1.0×</span>
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
  mass: 1.0,
  mode: 'barnes-hut',
  playing: true,
  seedType: 'single',
  renderMode: 'shader'
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

// Seed the system - rotating disc or galaxy merger
function seedSystem() {
  if (params.seedType === 'single') {
    seedSingleDisc();
  } else {
    seedGalaxyMerger();
  }
}

// Seed single rotating disc
function seedSingleDisc() {
  const n = params.N;
  const Rmax = 2.2;
  const totalMass = 1.0 * params.mass;
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

// Seed galaxy merger - two offset discs with different spins
function seedGalaxyMerger() {
  const n = params.N;
  const n1 = Math.floor(n * 0.6); // First galaxy gets 60% of particles
  const n2 = n - n1; // Second galaxy gets 40%
  
  const Rmax1 = 1.8;
  const Rmax2 = 1.4;
  const totalMass = 1.0 * params.mass;
  
  // Galaxy 1 - larger, positioned at (-1.5, 0, 0), counter-clockwise rotation
  for (let i = 0; i < n1; i++) {
    const r = Rmax1 * Math.sqrt(Math.random());
    const phi = Math.random() * 2 * Math.PI;
    
    // Position - offset left
    x[i] = -1.5 + r * Math.cos(phi);
    y[i] = r * Math.sin(phi);
    z[i] = gaussianRandom() * 0.05;
    
    // Mass
    m[i] = (totalMass * 0.6) / n1;
    
    // Velocity - counter-clockwise
    const Menc = totalMass * 0.6 * (r / Rmax1) * (r / Rmax1);
    const vcirc = Math.sqrt(Menc / Math.max(r, 0.1));
    
    vx[i] = -vcirc * Math.sin(phi) + gaussianRandom() * 0.02 + 0.3; // Approach velocity
    vy[i] = vcirc * Math.cos(phi) + gaussianRandom() * 0.02;
    vz[i] = gaussianRandom() * 0.01;
  }
  
  // Galaxy 2 - smaller, positioned at (1.5, 0, 0), clockwise rotation
  for (let i = n1; i < n; i++) {
    const r = Rmax2 * Math.sqrt(Math.random());
    const phi = Math.random() * 2 * Math.PI;
    
    // Position - offset right
    x[i] = 1.5 + r * Math.cos(phi);
    y[i] = r * Math.sin(phi);
    z[i] = gaussianRandom() * 0.04;
    
    // Mass
    m[i] = (totalMass * 0.4) / n2;
    
    // Velocity - clockwise (opposite rotation)
    const Menc = totalMass * 0.4 * (r / Rmax2) * (r / Rmax2);
    const vcirc = Math.sqrt(Menc / Math.max(r, 0.1));
    
    vx[i] = vcirc * Math.sin(phi) + gaussianRandom() * 0.02 - 0.3; // Approach velocity
    vy[i] = -vcirc * Math.cos(phi) + gaussianRandom() * 0.02;
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

// Create halo texture for soft particles
function createHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.2)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  return new THREE.CanvasTexture(canvas);
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
  
  // Create materials for both render modes
  createPointsMaterials();
  
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

// Create materials for different render modes
function createPointsMaterials() {
  // Custom shader material
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
  
  const shaderMaterial = new THREE.ShaderMaterial({
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
  
  // Enhanced halo shader with texture and speed-based coloring
  const haloVertexShader = `
    attribute float speed;
    varying float vSpeed;
    uniform float uSize;
    uniform float uDevicePixelRatio;
    
    void main() {
      vSpeed = speed;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = uSize * 1.5 * uDevicePixelRatio * (1.0 / -mvPosition.z);
    }
  `;
  
  const haloFragmentShader = `
    varying float vSpeed;
    uniform sampler2D uTexture;
    
    void main() {
      vec4 texColor = texture2D(uTexture, gl_PointCoord);
      
      // Color by speed with enhanced vibrancy
      float t = clamp(vSpeed * 1.5, 0.0, 1.0);
      vec3 cool = vec3(0.3, 0.7, 1.0);
      vec3 white = vec3(1.0, 1.0, 1.0);
      vec3 warm = vec3(1.0, 0.6, 0.2);
      
      vec3 color;
      if (t < 0.5) {
        color = mix(cool, white, t * 2.0);
      } else {
        color = mix(white, warm, (t - 0.5) * 2.0);
      }
      
      // Enhanced glow effect
      float glow = texColor.a * (0.8 + 0.4 * sin(vSpeed * 10.0));
      gl_FragColor = vec4(color * glow, glow * 0.7);
    }
  `;
  
  const haloTexture = createHaloTexture();
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: 25.0 },
      uDevicePixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uTexture: { value: haloTexture }
    },
    vertexShader: haloVertexShader,
    fragmentShader: haloFragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  });
  
  // Create points with current material
  const currentMaterial = params.renderMode === 'halo' ? haloMaterial : shaderMaterial;
  points = new THREE.Points(geometry, currentMaterial);
  scene.add(points);
  
  // Store materials for switching
  points.userData = {
    shaderMaterial,
    haloMaterial
  };
}

// Switch render mode
function switchRenderMode() {
  if (!points || !points.userData) return;
  
  const newMaterial = params.renderMode === 'halo'
    ? points.userData.haloMaterial
    : points.userData.shaderMaterial;
    
  points.material = newMaterial;
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

document.getElementById('mass').addEventListener('input', (e) => {
  params.mass = parseFloat(e.target.value);
  document.getElementById('mass-value').textContent = params.mass.toFixed(1) + '×';
  console.log('Mass parameter changed to:', params.mass);
  reset(); // Reset simulation with new mass scaling
});

// New stretch goal event handlers
document.getElementById('seed-type').addEventListener('change', (e) => {
  params.seedType = e.target.value;
  reset(); // Reseed with new configuration
});

document.getElementById('render-mode').addEventListener('change', (e) => {
  params.renderMode = e.target.value;
  switchRenderMode();
});

// Initialize display values
document.getElementById('mass-value').textContent = params.mass.toFixed(1) + '×';

// Start
initThree();
init();
updateGeometry();  // Populate geometry with initial particle positions
animate();
</script>