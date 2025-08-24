---
layout: post
title: "Energy Drift Playground — Simple Pendulum"
date: 2024-08-24
description: Interactive exploration of numerical integration schemes and energy conservation in physics simulations.
tags: physics simulation numerical-methods energy-conservation
categories: blog
---

# Introduction: Why Energy Drift Matters

When we simulate physical systems on computers, we face a fundamental challenge: representing continuous mathematics with discrete numbers. This discretization introduces **numerical errors** that can accumulate dramatically over time, leading to completely unphysical behavior.

**Energy drift** is one of the most critical manifestations of this problem. In conservative systems (like a frictionless pendulum), total mechanical energy should remain constant forever. However, poor numerical integration schemes cause the energy to artificially grow or decay, fundamentally violating the laws of physics.

## Real-World Impact

Energy drift isn't just an academic curiosity—it has profound practical consequences:

### 🌍 **Climate Modeling**
Long-term climate simulations must conserve energy to prevent artificial heating or cooling trends that could invalidate decades of predictions.

### 🚀 **Orbital Mechanics** 
Spacecraft trajectories computed over years must maintain energy conservation. Non-conservative methods could accumulate enough error to miss planetary encounters entirely.

### 🧬 **Molecular Dynamics**
Simulating atomic systems over nanosecond timescales requires energy conservation to maintain realistic thermodynamic behavior and prevent the simulation from "exploding" or "freezing."

### 🎮 **Game Physics**
While games prioritize visual plausibility over accuracy, symplectic integrators provide stable, predictable behavior for rigid body dynamics without energy "leakage."

### 💊 **Drug Discovery**
Protein folding simulations depend on accurate long-term dynamics where energy conservation ensures realistic molecular behavior.

## The Test Case: Simple Pendulum

The simple pendulum provides an ideal testbed because:
- **Conservative system**: Energy should remain constant
- **Nonlinear dynamics**: Small errors can compound dramatically  
- **Well-understood physics**: We know the correct behavior
- **Rich dynamics**: Exhibits diverse behavior based on initial conditions

### Mathematical Foundation

For a pendulum with length $$L$$ and mass $$m$$ under gravity $$g$$, the equation of motion is:

$$\frac{d^2\theta}{dt^2} = -\frac{g}{L}\sin(\theta)$$

where $$\theta$$ is the angle from vertical.

The total mechanical energy is:

$$E = \frac{1}{2}mL^2\omega^2 + mgL(1 - \cos(\theta))$$

where $$\omega = d\theta/dt$$ is the angular velocity.

In a frictionless system, this energy **must remain constant** for all time.

---

# Numerical Integration Schemes

We'll explore four different approaches to solving the pendulum equation numerically, each with distinct characteristics:

## 1. Explicit Euler Method

The **Explicit Euler** method is the simplest approach: use current values to predict future values.

### Mathematical Formulation
$$\omega_{n+1} = \omega_n + h \cdot a(\theta_n, \omega_n)$$

$$\theta_{n+1} = \theta_n + h \cdot \omega_n$$

### Characteristics
- **Order**: First-order accurate (error ∝ h)
- **Stability**: Poor - requires very small time steps
- **Energy behavior**: Usually increases energy dramatically
- **Problem**: Uses "stale" velocity information, systematically over-predicting kinetic energy

<div id="euler-demo" style="max-width: 100%; margin: 30px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
    <div style="background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3a 100%); border-radius: 16px; padding: 30px; color: white; border: 1px solid #3a3a4a;">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #ef4444, #dc2626); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #ef4444; font-size: 1.4em; font-weight: 600;">Explicit Euler Method</h4>
            <span style="margin-left: auto; background: rgba(239, 68, 68, 0.15); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Energy Growth</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="euler-canvas" width="280" height="280" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="euler-energy" width="280" height="280" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: #e5e5e5; font-weight: 500;">Time Step: <span id="euler-timestep" style="color: #ef4444; font-weight: 600;">10</span> ms</label>
                <input type="range" id="euler-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #ef4444;">
            </div>
            <button id="euler-reset" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="euler-error" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

## 2. Symplectic Euler Method

**Symplectic Euler** makes a small but crucial change: update velocity first, then use the new velocity to update position.

### Mathematical Formulation
$$\omega_{n+1} = \omega_n + h \cdot a(\theta_n, \omega_n)$$

$$\theta_{n+1} = \theta_n + h \cdot \omega_{n+1} \quad \leftarrow \text{Uses updated velocity!}$$

### Characteristics
- **Order**: First-order accurate (same as Explicit Euler)
- **Stability**: Much better than Explicit Euler
- **Energy behavior**: Bounded oscillations, no secular drift
- **Key insight**: Preserves the **symplectic structure** of Hamiltonian systems

<div id="symplectic-demo" style="max-width: 100%; margin: 30px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
    <div style="background: linear-gradient(135deg, #1e2e1e 0%, #2a3a2a 100%); border-radius: 16px; padding: 30px; color: white; border: 1px solid #3a4a3a;">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #22c55e, #16a34a); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #22c55e; font-size: 1.4em; font-weight: 600;">Symplectic Euler Method</h4>
            <span style="margin-left: auto; background: rgba(34, 197, 94, 0.15); color: #22c55e; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Energy Conservation</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="symplectic-canvas" width="280" height="280" style="background: linear-gradient(135deg, #1a2e1a 0%, #16213e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="symplectic-energy" width="280" height="280" style="background: linear-gradient(135deg, #1a2e1a 0%, #16213e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: #e5e5e5; font-weight: 500;">Time Step: <span id="symplectic-timestep" style="color: #22c55e; font-weight: 600;">10</span> ms</label>
                <input type="range" id="symplectic-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #22c55e;">
            </div>
            <button id="symplectic-reset" style="background: linear-gradient(135deg, #22c55e, #16a34a); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="symplectic-error" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

## 3. Velocity Verlet Method

**Velocity Verlet** (also called Leapfrog) uses a more sophisticated approach with half-step calculations.

### Mathematical Formulation
$$\omega_{n+1/2} = \omega_n + \frac{h}{2} \cdot a(\theta_n, \omega_n)$$

$$\theta_{n+1} = \theta_n + h \cdot \omega_{n+1/2}$$

$$\omega_{n+1} = \omega_{n+1/2} + \frac{h}{2} \cdot a(\theta_{n+1}, \omega_{n+1/2})$$

### Characteristics
- **Order**: Second-order accurate (error ∝ h²)
- **Stability**: Excellent long-term stability
- **Energy behavior**: Superior energy conservation
- **Key insight**: Time-reversible and symplectic

<div id="verlet-demo" style="max-width: 100%; margin: 30px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
    <div style="background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3a 100%); border-radius: 16px; padding: 30px; color: white; border: 1px solid #3a3a4a;">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #3b82f6, #2563eb); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #3b82f6; font-size: 1.4em; font-weight: 600;">Velocity Verlet Method</h4>
            <span style="margin-left: auto; background: rgba(59, 130, 246, 0.15); color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">Superior Accuracy</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="verlet-canvas" width="280" height="280" style="background: linear-gradient(135deg, #1a1a2e 0%, #162a3e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="verlet-energy" width="280" height="280" style="background: linear-gradient(135deg, #1a1a2e 0%, #162a3e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: #e5e5e5; font-weight: 500;">Time Step: <span id="verlet-timestep" style="color: #3b82f6; font-weight: 600;">10</span> ms</label>
                <input type="range" id="verlet-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #3b82f6;">
            </div>
            <button id="verlet-reset" style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="verlet-error" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

## 4. Runge-Kutta 4th Order (RK4)

**RK4** uses four intermediate calculations to achieve high local accuracy.

### Mathematical Formulation
$$k_1 = f(\theta_n, \omega_n)$$

$$k_2 = f(\theta_n + \frac{h k_1}{2}, \omega_n + \frac{h k_1}{2})$$

$$k_3 = f(\theta_n + \frac{h k_2}{2}, \omega_n + \frac{h k_2}{2})$$

$$k_4 = f(\theta_n + h k_3, \omega_n + h k_3)$$

$$[\theta_{n+1}, \omega_{n+1}] = [\theta_n, \omega_n] + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

### Characteristics
- **Order**: Fourth-order accurate (error ∝ h⁴)
- **Stability**: Excellent local accuracy
- **Energy behavior**: Subtle long-term drift (not symplectic)
- **Trade-off**: High accuracy per step vs. energy conservation

<div id="rk4-demo" style="max-width: 100%; margin: 30px 0; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
    <div style="background: linear-gradient(135deg, #2e1e2e 0%, #3a2a3a 100%); border-radius: 16px; padding: 30px; color: white; border: 1px solid #4a3a4a;">
        <div style="display: flex; align-items: center; margin-bottom: 25px;">
            <div style="width: 4px; height: 30px; background: linear-gradient(to bottom, #a855f7, #9333ea); border-radius: 2px; margin-right: 15px;"></div>
            <h4 style="margin: 0; color: #a855f7; font-size: 1.4em; font-weight: 600;">Runge-Kutta 4th Order</h4>
            <span style="margin-left: auto; background: rgba(168, 85, 247, 0.15); color: #a855f7; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 500;">High Accuracy</span>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Pendulum Animation</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="rk4-canvas" width="280" height="280" style="background: linear-gradient(135deg, #2a1a2e 0%, #21163e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h5 style="margin: 0 0 15px 0; color: #e5e5e5; font-size: 1.1em;">Energy Over Time</h5>
                <div style="position: relative; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);">
                    <canvas id="rk4-energy" width="280" height="280" style="background: linear-gradient(135deg, #2a1a2e 0%, #21163e 100%); width: 100%; display: block;"></canvas>
                </div>
            </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.08); border-radius: 10px; padding: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <label style="color: #e5e5e5; font-weight: 500;">Time Step: <span id="rk4-timestep" style="color: #a855f7; font-weight: 600;">10</span> ms</label>
                <input type="range" id="rk4-slider" min="1" max="50" value="10" style="width: 200px; accent-color: #a855f7;">
            </div>
            <button id="rk4-reset" style="background: linear-gradient(135deg, #a855f7, #9333ea); border: none; color: white; padding: 8px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);">Reset</button>
        </div>
        
        <div style="margin-top: 15px; text-align: center; font-size: 14px;">
            Energy Error: <span id="rk4-error" style="background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 12px; border-radius: 20px; font-weight: 600;">0.00%</span>
        </div>
    </div>
</div>

---

# Summary and Analysis

## The Symplectic Advantage

The key insight from these experiments is that **geometric structure matters more than local accuracy** for long-term simulations:

### Symplectic Methods (Euler, Verlet)
- **Preserve phase space volume** (Liouville's theorem)
- **Maintain bounded energy errors** instead of secular drift
- **Are time-reversible** - running backwards recovers initial state
- **Provide stable long-term behavior** even with larger time steps

### Non-Symplectic Methods (Explicit Euler, RK4)
- May achieve **higher local accuracy** (especially RK4)
- Can exhibit **energy drift** over long times
- Are **not time-reversible**
- Excel for **dissipative systems** with damping

## Performance Comparison

| Method | Order | Energy Conservation | Stability | Cost per Step |
|--------|-------|-------------------|-----------|---------------|
| Explicit Euler | O(h) | ❌ Poor | ❌ Poor | ⭐ Lowest |
| Symplectic Euler | O(h) | ✅ Excellent | ✅ Good | ⭐ Lowest |
| Velocity Verlet | O(h²) | ✅ Superior | ✅ Excellent | ⭐⭐ Low |
| RK4 | O(h⁴) | ⚠️ Subtle drift | ✅ Good | ⭐⭐⭐⭐ High |

---

# Interactive Comparison: All Methods Together

Now let's see all four methods running simultaneously to directly compare their energy behavior:

<div id="comparison-demo" style="max-width: 100%; margin: 20px 0;">
    <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; color: white;">
        <h4 style="margin: 0 0 20px 0; color: #4ECDC4;">Complete Comparison - All Integration Methods</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h5>Selected Pendulum Animation</h5>
                <canvas id="comparison-canvas" width="300" height="300" style="background: #2a2a2a; border-radius: 8px; width: 100%;"></canvas>
                
                <div style="margin-top: 10px;">
                    <label>Display Method: </label>
                    <select id="comparison-select" style="background: #333; color: white; border: 1px solid #555; padding: 5px;">
                        <option value="symplectic">Symplectic Euler</option>
                        <option value="euler">Explicit Euler</option>
                        <option value="verlet">Velocity Verlet</option>
                        <option value="rk4">RK4</option>
                    </select>
                </div>
            </div>
            
            <div>
                <h5>Energy Drift Comparison</h5>
                <canvas id="comparison-energy" width="300" height="300" style="background: #2a2a2a; border-radius: 8px; width: 100%;"></canvas>
                
                <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
                        <span>Explicit Euler</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                        <span>Symplectic Euler</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
                        <span>Velocity Verlet</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <div style="width: 12px; height: 12px; background: #a855f7; border-radius: 50%;"></div>
                        <span>RK4</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <h5>Initial Conditions</h5>
                <div style="margin-bottom: 10px;">
                    <label>Initial Angle: <span id="comparison-angle">45</span>°</label>
                    <input type="range" id="comparison-angle-slider" min="10" max="170" value="45" style="width: 100%;">
                </div>
                <div>
                    <label>Time Step: <span id="comparison-timestep">10</span> ms</label>
                    <input type="range" id="comparison-timestep-slider" min="1" max="50" value="10" style="width: 100%;">
                </div>
            </div>
            
            <div>
                <h5>Current Energy Errors</h5>
                <div style="font-size: 12px;">
                    <div>Time: <span id="comparison-time">0.00</span>s</div>
                    <div style="color: #ef4444;">Explicit Euler: <span id="comparison-euler-error">0.00</span>%</div>
                    <div style="color: #22c55e;">Symplectic Euler: <span id="comparison-symplectic-error">0.00</span>%</div>
                    <div style="color: #3b82f6;">Velocity Verlet: <span id="comparison-verlet-error">0.00</span>%</div>
                    <div style="color: #a855f7;">RK4: <span id="comparison-rk4-error">0.00</span>%</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center;">
            <button id="comparison-play-pause" style="background: #4ECDC4; border: none; color: #1a1a1a; padding: 10px 20px; border-radius: 6px; margin-right: 10px;">Pause</button>
            <button id="comparison-reset" style="background: #FF6B6B; border: none; color: white; padding: 10px 20px; border-radius: 6px;">Reset All</button>
        </div>
    </div>
</div>

---

# Conclusion

This exploration reveals fundamental principles that guide computational physics:

## Key Takeaways

1. **Geometric structure preservation trumps local accuracy** for conservative systems
2. **Symplectic integrators maintain physical realism** over long time scales
3. **The choice of integrator can make or break** long-term simulations
4. **Understanding the mathematics behind the methods** enables informed algorithmic decisions

## When to Use Each Method

- **Explicit Euler**: Educational purposes only, or very short simulations with tiny time steps
- **Symplectic Euler**: Long-term conservative simulations where simplicity matters
- **Velocity Verlet**: High-precision physics simulations requiring excellent energy conservation
- **RK4**: Non-conservative systems with dissipation, or short-term high-accuracy calculations

The simple pendulum, despite its apparent simplicity, embodies the rich mathematical structure that underlies all of computational physics. By visualizing energy drift in real-time, we develop intuition for phenomena that affect everything from climate models to spacecraft navigation.

### Further Exploration

Try these experiments with the comparison tool above:
- Set θ₀ = 170° and Δt = 30ms - watch Explicit Euler explode!
- Compare long-term behavior (let it run for 100+ seconds)
- Notice how symplectic methods maintain physical behavior even with large time steps

*The mathematics of numerical integration isn't just academic theory—it's the foundation that determines whether our simulations reflect reality or fantasy.*

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
