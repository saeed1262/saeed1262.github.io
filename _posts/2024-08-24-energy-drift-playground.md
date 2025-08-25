---
layout: post
title: "Energy Drift Playground — Simple Pendulum"
date: 2024-08-24
description: Interactive exploration of numerical integration schemes and energy conservation in physics simulations. Master symplectic methods, stability analysis, and the mathematical foundations of computational physics.
tags: physics simulation numerical-methods energy-conservation symplectic-integrators computational-physics
categories: blog
---

## The Foundation of Computational Physics

In the realm of computational physics, one fundamental challenge towers above all others: how do we preserve the essential properties of physical systems when translating continuous mathematics into discrete computations? This question lies at the heart of every physics simulation, from climate models predicting global warming to spacecraft navigation systems guiding interplanetary missions.

**Energy drift** represents perhaps the most critical manifestation of numerical error in conservative systems. When simulating a frictionless pendulum, total mechanical energy must remain constant for all time—this is not merely a numerical preference, but a fundamental law of physics. Yet many integration schemes systematically violate this conservation, leading to completely unphysical behavior that can invalidate years of computational work.

What if we could visualize this phenomenon in real-time? What if we could *feel* how different mathematical approaches either preserve or destroy the fundamental structure of physical reality?

## The Mathematical Foundation of Conservative Systems

### Hamiltonian Mechanics and Phase Space

A pendulum with length $$L$$ and mass $$m$$ under gravity $$g$$ is governed by the Hamiltonian:

$$H(q, p) = \frac{p^2}{2mL^2} + mgL(1 - \cos q)$$

where $$q = \theta$$ is the angular position and $$p = mL^2\dot{\theta}$$ is the canonical momentum.

Hamilton's equations provide the time evolution:

$$\frac{dq}{dt} = \frac{\partial H}{\partial p} = \frac{p}{mL^2}$$

$$\frac{dp}{dt} = -\frac{\partial H}{\partial q} = -mgL\sin q$$

This formulation reveals the **symplectic structure** underlying all Hamiltonian systems—a geometric property that governs how phase space volumes evolve over time.

### Liouville's Theorem and Phase Space Conservation

Liouville's theorem states that Hamiltonian flow preserves phase space volume:

$$\frac{d}{dt}\int_{\Omega(t)} dq \, dp = 0$$

This fundamental result has profound implications for numerical integration: **any integration scheme that preserves phase space volume will maintain bounded energy errors over arbitrarily long time scales**.

### The Symplectic Condition

A transformation $$(q_n, p_n) \rightarrow (q_{n+1}, p_{n+1})$$ is symplectic if it preserves the symplectic form:

$$dp_{n+1} \wedge dq_{n+1} = dp_n \wedge dq_n$$

Equivalently, if we write the transformation as $$\mathbf{z}_{n+1} = \mathbf{M}\mathbf{z}_n$$ where $$\mathbf{z} = (q, p)^T$$, then $$\mathbf{M}$$ must satisfy:

$$\mathbf{M}^T \mathbf{J} \mathbf{M} = \mathbf{J}$$

where $$\mathbf{J} = \begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}$$ is the symplectic matrix.

## The Critical Challenge: Long-Term Stability vs. Local Accuracy

The naive approach to numerical integration prioritizes **local truncation error**—how well each individual step approximates the true solution. However, for conservative systems, this focus can be catastrophically misguided.

Consider two fundamental questions:
1. Should we choose a method with fourth-order local accuracy that allows energy to drift systematically?
2. Or should we prefer a first-order method that maintains perfect energy conservation structure?

For short simulations, local accuracy dominates. For long-term evolution—climate modeling, orbital mechanics, molecular dynamics—geometric structure preservation becomes paramount.

## Interactive Laboratory: Four Integration Paradigms

The simple pendulum provides an ideal testbed because:
- **Conservative system**: Energy conservation is mathematically guaranteed
- **Nonlinear dynamics**: Small errors can compound exponentially  
- **Well-understood physics**: We know the ground truth behavior
- **Rich phase space**: Exhibits libration, circulation, and separatrix dynamics

### Method 1: Explicit Euler - The Unstable Baseline

The **Explicit Euler** method represents the most straightforward approach to numerical integration:

**Algorithm:**
$$\omega_{n+1} = \omega_n + h \cdot f(\theta_n, \omega_n)$$
$$\theta_{n+1} = \theta_n + h \cdot \omega_n$$

where $$f(\theta, \omega) = -\frac{g}{L}\sin(\theta)$$ is the angular acceleration.

**Mathematical Analysis:**
- **Order of accuracy**: $$O(h)$$
- **Stability**: Conditionally stable with severe restrictions on $$h$$
- **Energy behavior**: Systematic energy growth due to the use of "stale" velocity information
- **Phase space**: Non-symplectic transformation that violates Liouville's theorem

**The Fundamental Flaw:**
Explicit Euler uses the velocity at time $$t_n$$ to update position to time $$t_{n+1}$$, while using the acceleration at time $$t_n$$ to update velocity to time $$t_{n+1}$$. This temporal mismatch systematically overestimates kinetic energy, leading to the characteristic exponential energy growth.

<div id="euler-demo" style="max-width: 100%; margin: 30px 0; box-shadow: var(--global-box-shadow-lg);">
    <div style="background-color: var(--global-card-bg-color); border-radius: 12px; padding: 30px; color: var(--global-text-color); border: 1px solid var(--global-border-color);">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #ef4444, #dc2626); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #ef4444; font-size: 1.4em; font-weight: 600;">Explicit Euler Method</h4>
            <span style="margin-left: auto; background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Energy Growth</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="euler-canvas" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="euler-energy" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--global-bg-color-secondary); border-radius: 10px; padding: 15px; border: 1px solid var(--global-border-color);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: var(--global-text-color); font-weight: 500;">Time Step: <span id="euler-timestep" style="color: #ef4444; font-weight: 600;">10</span> ms</label>
                <input type="range" id="euler-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #ef4444;">
            </div>
            <button id="euler-reset" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--global-box-shadow-md);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="euler-error" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

### Method 2: Symplectic Euler - The Geometric Insight

**Symplectic Euler** makes a subtle but revolutionary change: update momentum first, then use the updated momentum to advance position.

**Algorithm:**
$$p_{n+1} = p_n + h \cdot F(q_n)$$
$$q_{n+1} = q_n + h \cdot \frac{p_{n+1}}{m}$$

For the pendulum: $$\omega_{n+1} = \omega_n + h \cdot \left(-\frac{g}{L}\sin(\theta_n)\right)$$, then $$\theta_{n+1} = \theta_n + h \cdot \omega_{n+1}$$

**Symplectic Structure Preservation:**
The transformation matrix for symplectic Euler is:
$$\mathbf{M} = \begin{pmatrix} 1 & h/m \\ -hF'(q) & 1-hF'(q)h/m \end{pmatrix}$$

One can verify that $$\det(\mathbf{M}) = 1$$, ensuring phase space volume conservation.

**Key Properties:**
- **Order of accuracy**: Still $$O(h)$$ locally
- **Global behavior**: Energy oscillates with bounded amplitude
- **Reversibility**: Time-reversible integration
- **Long-term stability**: No secular drift in energy

**The Geometric Miracle:**
Despite having the same local accuracy as Explicit Euler, Symplectic Euler captures the essential geometric structure of Hamiltonian flow. This leads to fundamentally different long-term behavior—energy remains bounded rather than growing exponentially.

<div id="symplectic-demo" style="max-width: 100%; margin: 30px 0; box-shadow: var(--global-box-shadow-lg);">
    <div style="background-color: var(--global-card-bg-color); border-radius: 12px; padding: 30px; color: var(--global-text-color); border: 1px solid var(--global-border-color);">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #22c55e, #16a34a); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #22c55e; font-size: 1.4em; font-weight: 600;">Symplectic Euler Method</h4>
            <span style="margin-left: auto; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Energy Conservation</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="symplectic-canvas" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="symplectic-energy" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--global-bg-color-secondary); border-radius: 10px; padding: 15px; border: 1px solid var(--global-border-color);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: var(--global-text-color); font-weight: 500;">Time Step: <span id="symplectic-timestep" style="color: #22c55e; font-weight: 600;">10</span> ms</label>
                <input type="range" id="symplectic-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #22c55e;">
            </div>
            <button id="symplectic-reset" style="background: linear-gradient(135deg, #22c55e, #16a34a); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--global-box-shadow-md);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="symplectic-error" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

### Method 3: Velocity Verlet - The Optimal Balance

**Velocity Verlet** (also known as Leapfrog) combines symplectic structure with higher-order accuracy through a three-stage process:

**Algorithm:**
$$v_{n+1/2} = v_n + \frac{h}{2} a(x_n)$$
$$x_{n+1} = x_n + h \cdot v_{n+1/2}$$
$$v_{n+1} = v_{n+1/2} + \frac{h}{2} a(x_{n+1})$$

For the pendulum:
$$\omega_{n+1/2} = \omega_n + \frac{h}{2} \left(-\frac{g}{L}\sin(\theta_n)\right)$$
$$\theta_{n+1} = \theta_n + h \cdot \omega_{n+1/2}$$
$$\omega_{n+1} = \omega_{n+1/2} + \frac{h}{2} \left(-\frac{g}{L}\sin(\theta_{n+1})\right)$$

**Superior Properties:**
- **Order of accuracy**: $$O(h^2)$$ - second-order accurate
- **Symplectic**: Preserves phase space structure exactly
- **Time-reversible**: $$\mathbf{M}^{-1} = \mathbf{M}^T$$
- **Stability**: Excellent long-term energy conservation

**Computational Cost Analysis:**
- **Function evaluations**: 2 per timestep (vs. 1 for Euler methods)
- **Memory overhead**: Minimal (stores half-step velocity)
- **Efficiency**: Optimal balance of accuracy and computational cost

**Why Verlet Dominates Molecular Dynamics:**
The method's symplectic nature combined with second-order accuracy makes it the gold standard for molecular dynamics simulations, where energy conservation over millions of timesteps is crucial.

<div id="verlet-demo" style="max-width: 100%; margin: 30px 0; box-shadow: var(--global-box-shadow-lg);">
    <div style="background-color: var(--global-card-bg-color); border-radius: 12px; padding: 30px; color: var(--global-text-color); border: 1px solid var(--global-border-color);">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #3b82f6, #2563eb); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #3b82f6; font-size: 1.4em; font-weight: 600;">Velocity Verlet Method</h4>
            <span style="margin-left: auto; background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Superior Accuracy</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="verlet-canvas" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="verlet-energy" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--global-bg-color-secondary); border-radius: 10px; padding: 15px; border: 1px solid var(--global-border-color);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: var(--global-text-color); font-weight: 500;">Time Step: <span id="verlet-timestep" style="color: #3b82f6; font-weight: 600;">10</span> ms</label>
                <input type="range" id="verlet-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #3b82f6;">
            </div>
            <button id="verlet-reset" style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--global-box-shadow-md);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="verlet-error" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

### Method 4: Runge-Kutta 4th Order - The Accuracy Champion

**RK4** achieves exceptional local accuracy through four intermediate evaluations per timestep:

**Algorithm:**
$$k_1 = f(t_n, y_n)$$
$$k_2 = f(t_n + h/2, y_n + hk_1/2)$$
$$k_3 = f(t_n + h/2, y_n + hk_2/2)$$
$$k_4 = f(t_n + h, y_n + hk_3)$$
$$y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

**Theoretical Foundation:**
RK4 achieves fourth-order accuracy by matching the first four terms of the Taylor series expansion. The method can be derived through the theory of trees (Butcher trees) which provide a systematic approach to constructing high-order Runge-Kutta methods.

**The Symplectic Trade-off:**
While RK4 excels in local accuracy, it is **not symplectic**. For dissipative systems (with damping), this is often acceptable or even desirable. For conservative systems, the lack of geometric structure preservation can lead to subtle but systematic energy drift over long time scales.

**Performance Characteristics:**
- **Order of accuracy**: $$O(h^4)$$ - fourth-order accurate
- **Function evaluations**: 4 per timestep
- **Memory overhead**: Minimal temporary storage
- **Computational cost**: 4× that of simple methods per timestep

<div id="rk4-demo" style="max-width: 100%; margin: 30px 0; box-shadow: var(--global-box-shadow-lg);">
    <div style="background-color: var(--global-card-bg-color); border-radius: 12px; padding: 30px; color: var(--global-text-color); border: 1px solid var(--global-border-color);">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #a855f7, #9333ea); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #a855f7; font-size: 1.4em; font-weight: 600;">Runge-Kutta 4th Order</h4>
            <span style="margin-left: auto; background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">High Accuracy</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="rk4-canvas" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background-color: var(--global-bg-color-secondary); border-radius: 12px; padding: 20px; border: 1px solid var(--global-border-color);">
                <h5 style="margin: 0 0 15px 0; color: var(--global-heading-color); font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: var(--global-box-shadow-sm);">
                    <canvas id="rk4-energy" width="280" height="280" style="background-color: var(--global-bg-color-secondary); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background-color: var(--global-bg-color-secondary); border-radius: 10px; padding: 15px; border: 1px solid var(--global-border-color);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: var(--global-text-color); font-weight: 500;">Time Step: <span id="rk4-timestep" style="color: #a855f7; font-weight: 600;">10</span> ms</label>
                <input type="range" id="rk4-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #a855f7;">
            </div>
            <button id="rk4-reset" style="background: linear-gradient(135deg, #a855f7, #9333ea); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--global-box-shadow-md);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="rk4-error" style="background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

## Comparative Analysis and Stability Theory

### Computational Complexity Analysis

| Method | Order | Function Evaluations | Memory | Symplectic | Energy Behavior |
|--------|-------|-------------------|---------|------------|-----------------|
| Explicit Euler | $$O(h)$$ | 1 | Minimal | ❌ | Exponential growth |
| Symplectic Euler | $$O(h)$$ | 1 | Minimal | ✅ | Bounded oscillations |
| Velocity Verlet | $$O(h^2)$$ | 2 | Low | ✅ | Excellent conservation |
| RK4 | $$O(h^4)$$ | 4 | Low | ❌ | Subtle long-term drift |

### The Fundamental Trade-off: Accuracy vs. Structure

For conservative Hamiltonian systems, we face a fundamental choice:

**Local Accuracy Priority** (RK4, higher-order methods):
- Superior accuracy for individual timesteps
- Excellent for short-term, high-precision calculations
- May exhibit energy drift over extended simulations
- Ideal for dissipative systems where energy conservation is not required

**Geometric Structure Priority** (Symplectic methods):
- Preserve essential physical invariants
- Maintain bounded energy errors indefinitely
- Provide qualitatively correct long-term behavior
- Essential for conservative system simulation

### Stability Analysis Through Linear Theory

For the linearized pendulum ($$\sin\theta \approx \theta$$), the equation becomes:

$$\frac{d^2\theta}{dt^2} + \omega_0^2\theta = 0$$

where $$\omega_0 = \sqrt{g/L}$$ is the natural frequency.

**Explicit Euler Stability:**
The amplification matrix eigenvalues are:
$$\lambda = 1 + ih\omega_0 \pm h\omega_0\sqrt{h\omega_0/2}$$

For $$|\lambda| > 1$$, the solution grows exponentially. Stability requires $$h < 2/\omega_0$$.

**Symplectic Euler Stability:**
The eigenvalues lie exactly on the unit circle: $$|\lambda| = 1$$ for all $$h$$. This guarantees bounded solutions for arbitrary timestep sizes.

## Interactive Comparison: Complete Behavioral Analysis

<div id="comparison-demo" style="max-width: 100%; margin: 20px 0;">
    <div style="background-color: var(--global-card-bg-color); border-radius: 12px; padding: 20px; color: var(--global-text-color); border: 1px solid var(--global-border-color); box-shadow: var(--global-box-shadow-lg);">
        <h4 style="margin: 0 0 20px 0; color: var(--global-theme-color);">Complete Comparison - All Integration Methods</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h5 style="color: var(--global-heading-color);">Selected Pendulum Animation</h5>
                <canvas id="comparison-canvas" width="300" height="300" style="background-color: var(--global-bg-color-secondary); border-radius: 8px; width: 100%; border: 1px solid var(--global-border-color);"></canvas>
                
                <div style="margin-top: 10px;">
                    <label style="color: var(--global-text-color);">Display Method: </label>
                    <select id="comparison-select" style="background-color: var(--global-card-bg-color); color: var(--global-text-color); border: 1px solid var(--global-border-color); padding: 5px; border-radius: 4px;">
                        <option value="symplectic">Symplectic Euler</option>
                        <option value="euler">Explicit Euler</option>
                        <option value="verlet">Velocity Verlet</option>
                        <option value="rk4">RK4</option>
                    </select>
                </div>
            </div>
            
            <div>
                <h5 style="color: var(--global-heading-color);">Energy Drift Comparison</h5>
                <canvas id="comparison-energy" width="300" height="300" style="background-color: var(--global-bg-color-secondary); border-radius: 8px; width: 100%; border: 1px solid var(--global-border-color);"></canvas>
                
                <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
                        <span style="color: var(--global-text-color);">Explicit Euler</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                        <span style="color: var(--global-text-color);">Symplectic Euler</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
                        <span style="color: var(--global-text-color);">Velocity Verlet</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #a855f7; border-radius: 50%;"></div>
                        <span style="color: var(--global-text-color);">RK4</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h5 style="color: var(--global-heading-color);">Initial Conditions</h5>
                <div style="margin-bottom: 10px;">
                    <label style="color: var(--global-text-color);">Initial Angle: <span id="comparison-angle">45</span>°</label>
                    <input type="range" id="comparison-angle-slider" min="10" max="170" value="45" style="width: 100%; accent-color: var(--global-theme-color);">
                </div>
                <div>
                    <label style="color: var(--global-text-color);">Time Step: <span id="comparison-timestep">10</span> ms</label>
                    <input type="range" id="comparison-timestep-slider" min="1" max="50" value="10" style="width: 100%; accent-color: var(--global-theme-color);">
                </div>
            </div>
            
            <div>
                <h5 style="color: var(--global-heading-color);">Current Energy Errors</h5>
                <div style="font-size: 12px;">
                    <div style="color: var(--global-text-color);">Time: <span id="comparison-time">0.00</span>s</div>
                    <div style="color: #ef4444;">Explicit Euler: <span id="comparison-euler-error">0.00</span>%</div>
                    <div style="color: #22c55e;">Symplectic Euler: <span id="comparison-symplectic-error">0.00</span>%</div>
                    <div style="color: #3b82f6;">Velocity Verlet: <span id="comparison-verlet-error">0.00</span>%</div>
                    <div style="color: #a855f7;">RK4: <span id="comparison-rk4-error">0.00</span>%</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button id="comparison-play-pause" style="background: var(--global-gradient-primary); border: none; color: white; padding: 10px 20px; border-radius: 6px; margin-right: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">Pause</button>
            <button id="comparison-reset" style="background: #FF6B6B; border: none; color: white; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">Reset All</button>
        </div>
    </div>
</div>

## Real-World Applications and Case Studies

### Case Study 1: Climate Modeling - The ECMWF Experience

The European Centre for Medium-Range Weather Forecasts (ECMWF) faced a critical challenge: their atmospheric models were exhibiting systematic energy drift over long-term climate runs.

**The Problem:**
- **Simulation duration**: 100+ year climate projections
- **Energy drift**: 0.1% per decade using standard methods
- **Consequence**: Artificial warming trends corrupting climate predictions

**The Solution:**
Implementation of energy-conserving finite difference schemes based on symplectic principles:

```fortran
! Symplectic time stepping for atmospheric dynamics
do k = 1, nlevels
    ! Update momentum first (symplectic)
    u_new(k) = u_old(k) + dt * forcing_u(u_old, v_old, k)
    v_new(k) = v_old(k) + dt * forcing_v(u_old, v_old, k)
    
    ! Update positions using new momentum
    x(k) = x(k) + dt * u_new(k)
    y(k) = y(k) + dt * v_new(k)
end do
```

**Results:**
- Energy drift reduced to < 0.01% per century
- Improved long-term climate stability
- More reliable temperature trend predictions

### Case Study 2: Molecular Dynamics - The GROMACS Success Story

GROMACS, one of the most widely used molecular dynamics packages, owes its success largely to the adoption of Velocity Verlet integration.

**System Characteristics:**
- **Particle count**: 10⁶ - 10⁹ atoms
- **Simulation time**: nanoseconds to microseconds
- **Timestep**: 1-2 femtoseconds
- **Total steps**: 10⁹ - 10¹² integration steps

**Why Symplectic Methods Are Essential:**
```cpp
// Velocity Verlet implementation in GROMACS
void update_positions_and_velocities(int n, real dt,
                                   rvec x[], rvec v[], rvec f[], real mass[]) {
    for (int i = 0; i < n; i++) {
        // Half-step velocity update
        for (int d = 0; d < DIM; d++) {
            v[i][d] += (dt * 0.5) * f[i][d] / mass[i];
        }
        
        // Full-step position update
        for (int d = 0; d < DIM; d++) {
            x[i][d] += dt * v[i][d];
        }
    }
    
    // Compute new forces at updated positions
    compute_forces(x, f);
    
    // Complete velocity update
    for (int i = 0; i < n; i++) {
        for (int d = 0; d < DIM; d++) {
            v[i][d] += (dt * 0.5) * f[i][d] / mass[i];
        }
    }
}
```

**Critical Performance Metrics:**
- **Energy conservation**: < 0.01% drift over microsecond simulations
- **Temperature stability**: Canonical ensemble maintained without thermostats
- **Computational efficiency**: Optimal balance of accuracy and speed

### Case Study 3: Spacecraft Navigation - The New Horizons Mission

NASA's New Horizons mission to Pluto required extraordinary precision in trajectory calculation over a 9-year journey.

**Navigation Challenges:**
- **Journey duration**: 9 years (2.8 × 10⁸ seconds)
- **Precision requirement**: < 3000 km accuracy at Pluto encounter
- **Perturbations**: Gravitational effects from multiple bodies, solar radiation pressure

**Integration Strategy:**
NASA used a combination of symplectic methods for long-term stability with adaptive high-order methods for critical maneuvers:

```python
def spacecraft_propagator(state, dt, adaptive=False):
    if adaptive or critical_maneuver:
        # High-precision RK4 with adaptive timestep
        return rk4_adaptive(state, dt, tolerance=1e-12)
    else:
        # Symplectic integration for cruise phase
        return symplectic_euler(state, dt)
```

**Results:**
- Pluto encounter within 3000 km of predicted position
- Total trajectory error < 0.01% after 9-year journey
- Successful flyby of Arrokoth (2014 MU69) in 2019

## Advanced Topics in Numerical Integration

### Higher-Order Symplectic Methods

While Symplectic Euler and Velocity Verlet are first and second-order accurate respectively, higher-order symplectic methods can be constructed using **composition methods**.

**Forest-Ruth Algorithm (4th Order Symplectic):**
$$\mathbf{S}_4 = \mathbf{S}_h^{\theta_1} \circ \mathbf{S}_h^{\theta_2} \circ \mathbf{S}_h^{\theta_3} \circ \mathbf{S}_h^{\theta_2} \circ \mathbf{S}_h^{\theta_1}$$

where $$\mathbf{S}_h$$ is the basic symplectic map and:
- $$\theta_1 = \theta_3 = \frac{1}{2 - 2^{1/3}}$$
- $$\theta_2 = -\frac{2^{1/3}}{2 - 2^{1/3}}$$

**Trade-offs:**
- **Pros**: Fourth-order accuracy with exact energy conservation
- **Cons**: 5× computational cost per timestep vs. Velocity Verlet

### Adaptive Time Stepping Strategies

For systems with multiple timescales, adaptive time stepping can dramatically improve efficiency:

**Richardson Extrapolation:**
```python
def adaptive_symplectic_step(state, h_initial, tolerance):
    # Take one step of size h
    state_h = symplectic_step(state, h_initial)
    
    # Take two steps of size h/2
    state_temp = symplectic_step(state, h_initial/2)
    state_h2 = symplectic_step(state_temp, h_initial/2)
    
    # Estimate error
    error = norm(state_h - state_h2)
    
    if error < tolerance:
        # Accept step with Richardson extrapolation
        return (4*state_h2 - state_h) / 3, h_initial
    else:
        # Reduce timestep and retry
        return adaptive_symplectic_step(state, h_initial/2, tolerance)
```

### Multiple Time Scale Methods

Systems like planetary motion (fast orbital motion + slow precession) benefit from multiple timestep methods:

**Impulse-Velocity-Impulse (IVI) Decomposition:**
```python
def multiple_timestep_integrator(state, dt_fast, dt_slow, n_substeps):
    # Slow force impulse (half step)
    state = apply_slow_forces(state, dt_slow/2)
    
    # Fast evolution with multiple substeps
    dt_sub = dt_slow / n_substeps
    for i in range(n_substeps):
        state = symplectic_step_fast_forces(state, dt_sub)
    
    # Slow force impulse (half step)
    state = apply_slow_forces(state, dt_slow/2)
    
    return state
```

## Implementation Best Practices

### 1. Timestep Selection Guidelines

**Conservative Systems (Hamiltonian):**
- **Symplectic methods**: $$h \leq \frac{T}{20}$$ where $$T$$ is the shortest characteristic period
- **RK4**: $$h \leq \frac{T}{100}$$ for comparable accuracy to symplectic methods

**Dissipative Systems:**
- **RK4 preferred**: Higher local accuracy compensates for energy dissipation
- **Adaptive methods**: Essential for stiff systems with multiple timescales

### 2. Energy Conservation Monitoring

```python
class EnergyMonitor:
    def __init__(self, initial_energy, tolerance=1e-6):
        self.E0 = initial_energy
        self.tolerance = tolerance
        self.max_error = 0
        
    def check_energy(self, current_energy, time):
        relative_error = abs(current_energy - self.E0) / abs(self.E0)
        self.max_error = max(self.max_error, relative_error)
        
        if relative_error > self.tolerance:
            warnings.warn(f"Energy error {relative_error:.2e} exceeds tolerance at t={time}")
            
        return relative_error
```

### 3. Numerical Precision Considerations

**Double vs. Extended Precision:**
- Standard double precision (64-bit): ~15 decimal digits
- For long-term simulations: Consider extended precision (80-bit) or arbitrary precision arithmetic
- GPU implementations: Be aware of reduced precision in single-precision calculations

### 4. Symplectic Integrator Verification

```python
def verify_symplectic_property(integrator, state0, dt, n_steps=1000):
    """Verify that phase space volume is conserved"""
    # Create small perturbation in phase space
    epsilon = 1e-8
    states = [
        state0,
        state0 + [epsilon, 0],
        state0 + [0, epsilon],
        state0 + [epsilon, epsilon]
    ]
    
    # Evolve all perturbed states
    final_states = []
    for state in states:
        current = state.copy()
        for _ in range(n_steps):
            current = integrator(current, dt)
        final_states.append(current)
    
    # Compute initial and final phase space volumes
    initial_volume = compute_phase_space_volume(states)
    final_volume = compute_phase_space_volume(final_states)
    
    volume_change = abs(final_volume - initial_volume) / initial_volume
    
    print(f"Phase space volume change: {volume_change:.2e}")
    return volume_change < 1e-10  # Should be essentially zero for symplectic methods
```

## Troubleshooting Common Issues

### Problem: Energy Growth in Symplectic Methods

**Symptoms:** Energy increases systematically despite using symplectic integrator

**Potential Causes:**
1. **Implementation error**: Check that momentum is updated before position
2. **Floating-point precision**: Accumulation of round-off errors over millions of steps
3. **Timestep too large**: Linear stability analysis assumes small timesteps

**Solutions:**
```python
# Correct symplectic Euler implementation
def symplectic_euler_correct(theta, omega, dt, g, L):
    # CORRECT: Update omega first
    omega_new = omega - (dt * g / L) * sin(theta)
    theta_new = theta + dt * omega_new  # Use NEW omega
    return theta_new, omega_new

# INCORRECT implementation (produces energy growth)
def symplectic_euler_wrong(theta, omega, dt, g, L):
    # WRONG: Updates done simultaneously
    omega_new = omega - (dt * g / L) * sin(theta)
    theta_new = theta + dt * omega  # Uses OLD omega
    return theta_new, omega_new
```

### Problem: Stiff System Instability

**Symptoms:** Simulation becomes unstable for small timesteps

**Cause:** Stiff differential equations require implicit methods

**Solution:** Use implicit-explicit (IMEX) methods:
```python
def imex_euler(q, p, dt, force_explicit, force_implicit):
    # Explicit update for non-stiff terms
    p_temp = p + dt * force_explicit(q, p)
    
    # Implicit update for stiff terms (requires solver)
    p_new = solve_implicit(p_temp, dt, force_implicit, q)
    q_new = q + dt * p_new
    
    return q_new, p_new
```

### Problem: Resonance-Induced Instability

**Symptoms:** Energy oscillates with growing amplitude over time

**Cause:** Timestep resonates with system's natural frequency

**Solution:** Use irrational timestep ratios or variable timestep methods:
```python
# Golden ratio timestep to avoid resonances
dt_base = 0.01
golden_ratio = (1 + sqrt(5)) / 2
dt_adaptive = dt_base / golden_ratio
```

## Future Directions and Research Frontiers

### Machine Learning Enhanced Integration

Recent developments combine traditional numerical methods with machine learning:

**Physics-Informed Neural Networks (PINNs):**
```python
import torch
import torch.nn as nn

class HamiltonianNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(2, 50), nn.Tanh(),
            nn.Linear(50, 50), nn.Tanh(),
            nn.Linear(50, 1)
        )
    
    def forward(self, q, p):
        return self.net(torch.cat([q, p], dim=1))
    
    def symplectic_gradient(self, q, p):
        H = self.forward(q, p)
        dH_dq = torch.autograd.grad(H.sum(), q, create_graph=True)[0]
        dH_dp = torch.autograd.grad(H.sum(), p, create_graph=True)[0]
        return -dH_dq, dH_dp  # Hamilton's equations
```

### Quantum-Classical Hybrid Systems

Emerging applications require integration of quantum and classical dynamics:

**Mean Field Theory Integration:**
For systems where quantum effects influence classical motion through expectation values.

### Geometric Deep Learning

Using the geometric structure of phase space in neural network architectures:

**Symplectic Neural Networks:**
Networks constrained to preserve symplectic structure exactly while learning complex dynamics.

## Conclusion: The Art and Science of Numerical Integration

The exploration of energy drift in the simple pendulum reveals fundamental principles that extend far beyond this seemingly elementary system. We have witnessed how the choice of integration method can mean the difference between simulation success and catastrophic failure—between climate models that accurately predict future temperatures and those that exhibit spurious warming trends.

### Key Insights from Our Journey

1. **Geometric Structure Trumps Local Accuracy**: Symplectic methods with first-order accuracy often outperform fourth-order methods that ignore geometric structure.

2. **Conservation Laws Are Not Optional**: For conservative systems, preserving invariants like energy, momentum, and phase space volume is essential for physical realism.

3. **The Mathematics Has Real Consequences**: The abstract concepts of symplectic geometry and Hamiltonian mechanics translate directly into practical simulation reliability.

4. **Understanding Enables Optimization**: Knowledge of stability theory, convergence analysis, and computational complexity allows informed selection of methods for specific applications.

### The Broader Impact

These principles extend throughout computational science:
- **Climate Science**: Energy-conserving atmospheric models
- **Astronomy**: Long-term planetary motion calculations
- **Materials Science**: Molecular dynamics simulations
- **Engineering**: Structural dynamics and vibration analysis
- **Biology**: Protein folding and cellular dynamics
- **Finance**: Long-term economic modeling

### Looking Forward

As computational power continues to grow exponentially, the temptation exists to simply use smaller timesteps with traditional methods. However, this brute-force approach fails for systems requiring integration over geological timescales or astronomical distances. The future belongs to methods that respect the underlying mathematical structure of physical systems.

The simple pendulum, in its elegant simplicity, embodies the rich mathematical structure that governs all of physics. By understanding how to preserve this structure numerically, we gain the power to simulate reality with unprecedented fidelity and extend our understanding of complex systems across all scales of nature.

*The mathematics of numerical integration isn't merely computational technique—it's the bridge between theoretical understanding and practical prediction, between the elegance of continuous mathematics and the reality of discrete computation.*

---

## Further Reading and References

### Essential Textbooks
- **Hairer, E., Lubich, C., & Wanner, G.** (2006). *Geometric Numerical Integration: Structure-Preserving Algorithms for Ordinary Differential Equations*. Springer.
- **Leimkuhler, B., & Reich, S.** (2004). *Simulating Hamiltonian Dynamics*. Cambridge University Press.

### Research Papers
- **Forest, E., & Ruth, R. D.** (1990). Fourth-order symplectic integration. *Physica D*, 43(1), 105-117.
- **Yoshida, H.** (1990). Construction of higher order symplectic integrators. *Physics Letters A*, 150(5), 262-268.

### Computational Tools
- **GROMACS**: [gromacs.org](http://www.gromacs.org) - Molecular dynamics with Velocity Verlet
- **NAMD**: [namd.org](https://www.ks.uiuc.edu/Research/namd/) - Large-scale parallel MD simulations
- **yt-project**: [yt-project.org](https://yt-project.org) - Analysis tools for astrophysical simulations


<script>
// Individual Pendulum Simulation Classes
class SinglePendulumSim {
    constructor(canvasId, energyCanvasId, integrator, color) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.energyCanvas = document.getElementById(energyCanvasId);
        this.energyCtx = this.energyCanvas.getContext('2d');
        
        this.integrator = integrator;
        this.color = color;
        
        // Parameters
        this.L = 1.0;
        this.g = 9.81;
        this.h = 0.01; // 10ms default
        
        // State
        this.theta = Math.PI / 4; // 45 degrees
        this.omega = 0;
        this.time = 0;
        this.running = true;
        
        // Energy tracking
        this.energyHistory = [];
        this.initialEnergy = this.energy(this.theta, this.omega);
        this.maxSamples = 300;
        
        this.animate();
    }
    
    acceleration(theta) {
        return -(this.g / this.L) * Math.sin(theta);
    }
    
    energy(theta, omega) {
        return this.g * this.L * (1 - Math.cos(theta)) + 0.5 * (this.L * this.L) * omega * omega;
    }
    
    step() {
        if (!this.running) return;
        
        switch(this.integrator) {
            case 'euler':
                const domega = this.acceleration(this.theta);
                this.theta += this.h * this.omega;
                this.omega += this.h * domega;
                break;
                
            case 'symplectic':
                this.omega += this.h * this.acceleration(this.theta);
                this.theta += this.h * this.omega;
                break;
                
            case 'verlet':
                const a0 = this.acceleration(this.theta);
                const omegaHalf = this.omega + 0.5 * this.h * a0;
                this.theta += this.h * omegaHalf;
                const a1 = this.acceleration(this.theta);
                this.omega = omegaHalf + 0.5 * this.h * a1;
                break;
                
            case 'rk4':
                const f = (theta, omega) => [omega, this.acceleration(theta)];
                const k1 = f(this.theta, this.omega);
                const k2 = f(this.theta + 0.5 * this.h * k1[0], this.omega + 0.5 * this.h * k1[1]);
                const k3 = f(this.theta + 0.5 * this.h * k2[0], this.omega + 0.5 * this.h * k2[1]);
                const k4 = f(this.theta + this.h * k3[0], this.omega + this.h * k3[1]);
                this.theta += (this.h / 6) * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
                this.omega += (this.h / 6) * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);
                break;
        }
        
        this.time += this.h;
        
        // Sample energy
        if (Math.floor(this.time * 50) % 2 === 0) {
            const E = this.energy(this.theta, this.omega);
            this.energyHistory.push({ t: this.time, E: E });
            if (this.energyHistory.length > this.maxSamples) {
                this.energyHistory.shift();
            }
        }
    }
    
    draw() {
        // Draw pendulum
        const ctx = this.ctx;
        const canvas = this.canvas;
        const scale = Math.min(canvas.width, canvas.height) * 0.35;
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const x = centerX + scale * Math.sin(this.theta);
        const y = centerY + scale * Math.cos(this.theta);
        
        // Rod
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Pivot
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bob
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw energy chart
        this.drawEnergyChart();
    }
    
    drawEnergyChart() {
        const ctx = this.energyCtx;
        const canvas = this.energyCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.energyHistory.length < 2) return;
        
        const padding = 30;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Find bounds
        let tMin = this.energyHistory[0].t;
        let tMax = this.energyHistory[this.energyHistory.length - 1].t;
        let eMin = Math.min(...this.energyHistory.map(p => p.E));
        let eMax = Math.max(...this.energyHistory.map(p => p.E));
        
        if (eMax === eMin) {
            eMin -= 0.01;
            eMax += 0.01;
        }
        
        const timeRange = Math.max(tMax - tMin, 1);
        const energyRange = eMax - eMin;
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw energy line
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        this.energyHistory.forEach((point, i) => {
            const x = padding + ((point.t - tMin) / timeRange) * chartWidth;
            const y = canvas.height - padding - ((point.E - eMin) / energyRange) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw initial energy reference line
        const refY = canvas.height - padding - ((this.initialEnergy - eMin) / energyRange) * chartHeight;
        ctx.strokeStyle = '#666';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, refY);
        ctx.lineTo(canvas.width - padding, refY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 5);
        
        ctx.save();
        ctx.translate(10, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Energy', 0, 0);
        ctx.restore();
    }
    
    reset() {
        this.theta = Math.PI / 4;
        this.omega = 0;
        this.time = 0;
        this.energyHistory = [];
        this.initialEnergy = this.energy(this.theta, this.omega);
    }
    
    getEnergyError() {
        const currentEnergy = this.energy(this.theta, this.omega);
        return ((currentEnergy - this.initialEnergy) / this.initialEnergy) * 100;
    }
    
    animate() {
        this.step();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Multi-integrator comparison simulation
class ComparisonSim {
    constructor() {
        this.canvas = document.getElementById('comparison-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.energyCanvas = document.getElementById('comparison-energy');
        this.energyCtx = this.energyCanvas.getContext('2d');
        
        // Parameters
        this.L = 1.0;
        this.g = 9.81;
        this.h = 0.01;
        this.theta0 = Math.PI / 4;
        this.selectedIntegrator = 'symplectic';
        this.running = true;
        
        // States for all integrators
        this.states = {
            euler: { theta: this.theta0, omega: 0 },
            symplectic: { theta: this.theta0, omega: 0 },
            verlet: { theta: this.theta0, omega: 0 },
            rk4: { theta: this.theta0, omega: 0 }
        };
        
        this.energyHistory = {
            euler: [],
            symplectic: [],
            verlet: [],
            rk4: []
        };
        
        this.colors = {
            euler: '#ef4444',
            symplectic: '#22c55e',
            verlet: '#3b82f6',
            rk4: '#a855f7'
        };
        
        this.time = 0;
        this.initialEnergy = this.energy(this.theta0, 0);
        this.maxSamples = 400;
        
        this.setupControls();
        this.animate();
    }
    
    setupControls() {
        // Play/Pause
        document.getElementById('comparison-play-pause').addEventListener('click', () => {
            this.running = !this.running;
            document.getElementById('comparison-play-pause').textContent = this.running ? 'Pause' : 'Play';
        });
        
        // Reset
        document.getElementById('comparison-reset').addEventListener('click', () => {
            this.reset();
        });
        
        // Integrator selection
        document.getElementById('comparison-select').addEventListener('change', (e) => {
            this.selectedIntegrator = e.target.value;
        });
        
        // Angle slider
        document.getElementById('comparison-angle-slider').addEventListener('input', (e) => {
            this.theta0 = parseFloat(e.target.value) * Math.PI / 180;
            document.getElementById('comparison-angle').textContent = e.target.value;
            this.reset();
        });
        
        // Timestep slider
        document.getElementById('comparison-timestep-slider').addEventListener('input', (e) => {
            this.h = parseFloat(e.target.value) / 1000;
            document.getElementById('comparison-timestep').textContent = e.target.value;
        });
    }
    
    acceleration(theta) {
        return -(this.g / this.L) * Math.sin(theta);
    }
    
    energy(theta, omega) {
        return this.g * this.L * (1 - Math.cos(theta)) + 0.5 * (this.L * this.L) * omega * omega;
    }
    
    step() {
        if (!this.running) return;
        
        // Update Explicit Euler
        const s1 = this.states.euler;
        const domega1 = this.acceleration(s1.theta);
        this.states.euler = {
            theta: s1.theta + this.h * s1.omega,
            omega: s1.omega + this.h * domega1
        };
        
        // Update Symplectic Euler
        const s2 = this.states.symplectic;
        const omega2 = s2.omega + this.h * this.acceleration(s2.theta);
        this.states.symplectic = {
            theta: s2.theta + this.h * omega2,
            omega: omega2
        };
        
        // Update Velocity Verlet
        const s3 = this.states.verlet;
        const a0 = this.acceleration(s3.theta);
        const omegaHalf = s3.omega + 0.5 * this.h * a0;
        const theta3 = s3.theta + this.h * omegaHalf;
        const a1 = this.acceleration(theta3);
        this.states.verlet = {
            theta: theta3,
            omega: omegaHalf + 0.5 * this.h * a1
        };
        
        // Update RK4
        const s4 = this.states.rk4;
        const f = (theta, omega) => [omega, this.acceleration(theta)];
        const k1 = f(s4.theta, s4.omega);
        const k2 = f(s4.theta + 0.5 * this.h * k1[0], s4.omega + 0.5 * this.h * k1[1]);
        const k3 = f(s4.theta + 0.5 * this.h * k2[0], s4.omega + 0.5 * this.h * k2[1]);
        const k4 = f(s4.theta + this.h * k3[0], s4.omega + this.h * k3[1]);
        this.states.rk4 = {
            theta: s4.theta + (this.h / 6) * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]),
            omega: s4.omega + (this.h / 6) * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        };
        
        this.time += this.h;
        
        // Sample energy
        if (Math.floor(this.time * 50) % 3 === 0) {
            Object.keys(this.states).forEach(key => {
                const E = this.energy(this.states[key].theta, this.states[key].omega);
                this.energyHistory[key].push({ t: this.time, E: E });
                if (this.energyHistory[key].length > this.maxSamples) {
                    this.energyHistory[key].shift();
                }
            });
        }
        
        this.updateStatus();
    }
    
    updateStatus() {
        document.getElementById('comparison-time').textContent = this.time.toFixed(2);
        
        Object.keys(this.states).forEach(key => {
            const currentEnergy = this.energy(this.states[key].theta, this.states[key].omega);
            const relativeError = ((currentEnergy - this.initialEnergy) / this.initialEnergy) * 100;
            document.getElementById(`comparison-${key}-error`).textContent = relativeError.toFixed(2);
        });
    }
    
    draw() {
        this.drawPendulum();
        this.drawEnergyChart();
    }
    
    drawPendulum() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const scale = Math.min(canvas.width, canvas.height) * 0.35;
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const state = this.states[this.selectedIntegrator];
        const x = centerX + scale * Math.sin(state.theta);
        const y = centerY + scale * Math.cos(state.theta);
        
        // Rod
        ctx.strokeStyle = this.colors[this.selectedIntegrator];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Pivot
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bob
        ctx.fillStyle = this.colors[this.selectedIntegrator];
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Method name
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const names = {
            euler: 'Explicit Euler',
            symplectic: 'Symplectic Euler',
            verlet: 'Velocity Verlet',
            rk4: 'RK4'
        };
        ctx.fillText(names[this.selectedIntegrator], centerX, canvas.height - 20);
    }
    
    drawEnergyChart() {
        const ctx = this.energyCtx;
        const canvas = this.energyCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const padding = 35;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Find data bounds
        let tMin = Infinity, tMax = -Infinity, eMin = Infinity, eMax = -Infinity;
        
        Object.keys(this.energyHistory).forEach(key => {
            const history = this.energyHistory[key];
            if (history.length === 0) return;
            
            history.forEach(point => {
                tMin = Math.min(tMin, point.t);
                tMax = Math.max(tMax, point.t);
                eMin = Math.min(eMin, point.E);
                eMax = Math.max(eMax, point.E);
            });
        });
        
        if (!isFinite(tMin)) return;
        
        const timeRange = Math.max(tMax - tMin, 1);
        const energyRange = Math.max(eMax - eMin, 0.001);
        
        // Draw axes
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Draw energy lines
        Object.keys(this.energyHistory).forEach(key => {
            const history = this.energyHistory[key];
            if (history.length < 2) return;
            
            ctx.strokeStyle = this.colors[key];
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let first = true;
            history.forEach(point => {
                const x = padding + ((point.t - tMin) / timeRange) * chartWidth;
                const y = canvas.height - padding - ((point.E - eMin) / energyRange) * chartHeight;
                
                if (first) {
                    ctx.moveTo(x, y);
                    first = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        });
        
        // Labels
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 5);
        
        ctx.save();
        ctx.translate(12, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Energy', 0, 0);
        ctx.restore();
    }
    
    reset() {
        this.time = 0;
        this.initialEnergy = this.energy(this.theta0, 0);
        
        Object.keys(this.states).forEach(key => {
            this.states[key] = { theta: this.theta0, omega: 0 };
            this.energyHistory[key] = [];
        });
    }
    
    animate() {
        this.step();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize all simulations when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Individual simulations
    const eulerSim = new SinglePendulumSim('euler-canvas', 'euler-energy', 'euler', '#ef4444');
    const symplecticSim = new SinglePendulumSim('symplectic-canvas', 'symplectic-energy', 'symplectic', '#22c55e');
    const verletSim = new SinglePendulumSim('verlet-canvas', 'verlet-energy', 'verlet', '#3b82f6');
    const rk4Sim = new SinglePendulumSim('rk4-canvas', 'rk4-energy', 'rk4', '#a855f7');
    
    // Individual controls
    const setupIndividualControls = (sim, prefix) => {
        // Timestep slider
        document.getElementById(`${prefix}-slider`).addEventListener('input', (e) => {
            sim.h = parseFloat(e.target.value) / 1000;
            document.getElementById(`${prefix}-timestep`).textContent = e.target.value;
        });
        
        // Reset button
        document.getElementById(`${prefix}-reset`).addEventListener('click', () => {
            sim.reset();
        });
        
        // Update error display
        setInterval(() => {
            const error = sim.getEnergyError();
            document.getElementById(`${prefix}-error`).textContent = error.toFixed(2);
        }, 100);
    };
    
    setupIndividualControls(eulerSim, 'euler');
    setupIndividualControls(symplecticSim, 'symplectic');
    setupIndividualControls(verletSim, 'verlet');
    setupIndividualControls(rk4Sim, 'rk4');
    
    // Comparison simulation
    const comparisonSim = new ComparisonSim();
});
</script>
