---
layout: post
title: "Interactive Orbital Rendezvous Simulator"
date: 2025-09-01
description: "Explore the counter-intuitive nature of orbital mechanics through interactive 3D simulations. Learn why speeding up can make you drop and master spacecraft rendezvous techniques."
img: /assets/img/galaxy.png
tags: [orbital-mechanics, physics, simulation, aerospace, interactive, three-js]
categories: blog
---

## Why Speeding Up Can Make You Drop

Here's one of the most counter-intuitive facts about orbital mechanics: **if you're in orbit and fire your engines to speed up, you'll actually end up going slower**. Not only that, but you might drop to a lower orbit entirely.

This seems to defy common sense. On Earth, when you accelerate your car, you go faster and get ahead. But in orbit, the rules are fundamentally different, and understanding this paradox is key to mastering spacecraft rendezvous operations.

Let me show you exactly what happens:

## The Orbital Speed Paradox

When you fire your engines **prograde** (in the direction of your velocity), you don't just speed up locally—you actually **raise the opposite side of your orbit**. This is because orbital energy and angular momentum are conserved quantities that determine your entire orbital shape, not just your instantaneous motion.

Here's the physics: A prograde burn increases your **orbital energy**, which raises your **apoapsis** (the highest point of your orbit). But here's the kicker—if that higher apoapsis means you're now in a less favorable position relative to your target, you might actually need to drop to a **lower, faster orbit** to catch up.

This is exactly how real spacecraft rendezvous works. The Apollo missions, Space Shuttle dockings with the ISS, and every cargo resupply mission use this "counter-intuitive" approach to orbital mechanics.

## Interactive Orbital Mechanics Simulator

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#orbit-container {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--global-bg-color) 0%, rgba(15, 23, 42, 0.8) 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

#orbit-controls {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.control-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

.control-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
}

.burn-button {
  background: linear-gradient(135deg, var(--global-theme-color) 0%, rgba(59, 130, 246, 0.8) 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 70px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.burn-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.burn-button:hover::before {
  left: 100%;
}

.burn-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4);
}

.burn-button:active {
  transform: translateY(0) scale(0.98);
}

.burn-button.prograde {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.burn-button.prograde:hover {
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.6);
}

.burn-button.retrograde {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.burn-button.retrograde:hover {
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4), 0 0 20px rgba(239, 68, 68, 0.6);
}

.burn-button.radial-out {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.burn-button.radial-out:hover {
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.6);
}

.burn-button.radial-in {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.burn-button.radial-in:hover {
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4), 0 0 20px rgba(245, 158, 11, 0.6);
}

button {
  background: linear-gradient(135deg, var(--global-theme-color) 0%, rgba(59, 130, 246, 0.8) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4);
}

select {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
  color: var(--global-text-color);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

select:hover {
  border-color: rgba(59, 130, 246, 0.6);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
}

.slider-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.slider-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.slider-group input[type="range"] {
  width: 140px;
  height: 6px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.8) 100%);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
}

.slider-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
}

.slider-group input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
}

.slider-group .value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.85rem;
  color: #3b82f6;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

#orbit-viz-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: radial-gradient(ellipse at center, #0f172a 0%, #000000 70%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

#orbit-viz {
  width: 100%;
  height: 100%;
}

#orbit-hud {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.hud-panel {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.hud-panel:hover {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.hud-panel h4 {
  color: #60a5fa;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  padding-bottom: 0.5rem;
}

.hud-value {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 0.9rem;
  color: var(--global-text-color);
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hud-value:last-child {
  border-bottom: none;
}

.hud-value .label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.hud-value .value {
  color: #60a5fa;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

#orbit-status {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: 1rem;
  color: #60a5fa;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(30, 58, 138, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  text-align: center;
  grid-column: 1 / -1;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.scenario-button {
  background: linear-gradient(135deg, var(--global-theme-color) 0%, rgba(59, 130, 246, 0.8) 100%);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.scenario-button:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.4);
}

.burn-info {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  width: 100%;
}

.scenario-grid .scenario-button {
  padding: 0.6rem 0.4rem;
  font-size: 0.75rem;
  line-height: 1.2;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.burn-effect {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  animation: burnPulse 0.6s ease-out;
}

@keyframes burnPulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

@media (max-width: 768px) {
  #orbit-container {
    margin: 1rem;
    padding: 1rem;
  }
  
  #orbit-controls {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .control-group {
    align-items: stretch;
  }
  
  .control-row {
    justify-content: stretch;
  }
  
  .burn-button {
    flex: 1;
    padding: 1rem;
  }
  
  #orbit-hud {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}

.no-webgl {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
}

/* Loading animation */
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #60a5fa;
  font-size: 1.2rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.loading::after {
  content: '';
  animation: loadingDots 1.5s infinite;
}

@keyframes loadingDots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}
</style>

<div id="orbit-container">
  <div id="orbit-controls">
    <div class="control-group">
      <label><strong>Simulation Control</strong></label>
      <div class="control-row">
        <button id="orbit-play-pause">Pause</button>
        <button id="orbit-reset">Reset</button>
      </div>
    </div>
    
    <div class="control-group">
      <label><strong>Burn Controls</strong></label>
      <div class="burn-info">
        <small>+V: Prograde (speed up) | -V: Retrograde (slow down)<br>
        +R: Radial out (away from Earth) | -R: Radial in (toward Earth)</small>
      </div>
      <div class="control-row">
        <button class="burn-button prograde" id="burn-prograde">+V</button>
        <button class="burn-button retrograde" id="burn-retrograde">-V</button>
      </div>
      <div class="control-row">
        <button class="burn-button radial-out" id="burn-radial-out">+R</button>
        <button class="burn-button radial-in" id="burn-radial-in">-R</button>
      </div>
    </div>
    
    <div class="slider-group">
      <label>Burn Magnitude</label>
      <input type="range" id="burn-magnitude" min="0.01" max="0.2" step="0.01" value="0.05">
      <span class="value" id="burn-magnitude-value">0.05</span>
    </div>
    
    <div class="slider-group">
      <label>Time Scale</label>
      <input type="range" id="time-scale" min="0.1" max="10" step="0.1" value="1.0">
      <span class="value" id="time-scale-value">1.0×</span>
    </div>
    
    <div class="control-group">
      <label><strong>Scenarios</strong></label>
      <div class="scenario-grid">
        <button class="scenario-button" id="scenario-basic">Basic<br>Phasing</button>
        <button class="scenario-button" id="scenario-hohmann">Hohmann<br>Transfer</button>
        <button class="scenario-button" id="scenario-rendezvous">R-bar<br>Approach</button>
      </div>
    </div>
  </div>
  
  <div id="orbit-viz-container">
    <div id="orbit-viz"></div>
  </div>
  
  <div id="orbit-hud">
    <div class="hud-panel">
      <h4>Chaser Spacecraft</h4>
      <div class="hud-value">
        <span class="label">Semi-major axis:</span>
        <span class="value" id="chaser-a">1.000 R⊕</span>
      </div>
      <div class="hud-value">
        <span class="label">Eccentricity:</span>
        <span class="value" id="chaser-e">0.000</span>
      </div>
      <div class="hud-value">
        <span class="label">Period:</span>
        <span class="value" id="chaser-period">1.00 TU</span>
      </div>
      <div class="hud-value">
        <span class="label">Speed:</span>
        <span class="value" id="chaser-speed">1.000 VU</span>
      </div>
    </div>
    
    <div class="hud-panel">
      <h4>Target Spacecraft</h4>
      <div class="hud-value">
        <span class="label">Semi-major axis:</span>
        <span class="value" id="target-a">1.000 R⊕</span>
      </div>
      <div class="hud-value">
        <span class="label">Eccentricity:</span>
        <span class="value" id="target-e">0.000</span>
      </div>
      <div class="hud-value">
        <span class="label">Period:</span>
        <span class="value" id="target-period">1.00 TU</span>
      </div>
      <div class="hud-value">
        <span class="label">Phase angle:</span>
        <span class="value" id="phase-angle">0.0°</span>
      </div>
    </div>
    
    <div class="hud-panel">
      <h4>Relative Motion</h4>
      <div class="hud-value">
        <span class="label">Range:</span>
        <span class="value" id="relative-range">0.000 R⊕</span>
      </div>
      <div class="hud-value">
        <span class="label">Closing rate:</span>
        <span class="value" id="closing-rate">0.000 VU</span>
      </div>
      <div class="hud-value">
        <span class="label">ΔV budget used:</span>
        <span class="value" id="dv-budget">0.000 VU</span>
      </div>
      <div class="hud-value">
        <span class="label">Time to CA:</span>
        <span class="value" id="time-to-ca">-- TU</span>
      </div>
      <div class="hud-value">
        <span class="label">Min range:</span>
        <span class="value" id="min-range">-- R⊕</span>
      </div>
    </div>
  </div>
  
  <div id="orbit-status">Simulation ready. Use burn controls to maneuver the chaser spacecraft.</div>
</div>

## The Mathematics of Orbital Motion

Understanding orbital rendezvous requires mastering several key equations. Let's break down the fundamental mathematics that governs spacecraft motion:

### Vis-Viva Equation

The relationship between orbital velocity, position, and energy:

$$V = \sqrt{\mu\left(\frac{2}{r} - \frac{1}{a}\right)}$$

Where:
- $V$ = orbital velocity
- $\mu$ = gravitational parameter (GM)
- $r$ = current distance from center
- $a$ = semi-major axis

This equation tells us why **lower orbits are faster**—as $a$ decreases, $V$ increases.

### Kepler's Third Law

The relationship between orbital period and size:

$$T = 2\pi\sqrt{\frac{a^3}{\mu}}$$

This is why phasing maneuvers work: the spacecraft in the lower orbit completes more revolutions and can "catch up" to a target in a higher orbit.

### Mean Motion and Kepler's Equation

**Mean motion** (average angular velocity):
$$n = \sqrt{\frac{\mu}{a^3}}$$

**Kepler's equation** (relating time to orbital position):
$$M = E - e \sin E$$

Where:
- $M$ = mean anomaly (average position)
- $E$ = eccentric anomaly
- $e$ = eccentricity

### Eccentric Anomaly Relations

Converting between eccentric and true anomaly:

$$\tan\left(\frac{E}{2}\right) = \sqrt{\frac{1-e}{1+e}} \tan\left(\frac{\nu}{2}\right)$$

Where $\nu$ is the **true anomaly** (actual angular position in orbit).

## Orbital Elements and State Vectors

Every orbit can be described by six **orbital elements**:

1. **Semi-major axis (a)**: Size of the orbit
2. **Eccentricity (e)**: Shape of the orbit (0 = circular, >0 = elliptical)
3. **Inclination (i)**: Angle relative to equatorial plane
4. **Right ascension of ascending node (Ω)**: Orientation in space
5. **Argument of periapsis (ω)**: Orientation of ellipse in orbital plane
6. **True anomaly (ν)**: Position along the orbit

For our **coplanar** simulation, we simplify to just $(a, e, ω, ν)$ since $i = Ω = 0$.

### Converting Between Elements and State Vectors

**Position in orbital plane:**
$$r = \frac{a(1-e^2)}{1 + e\cos\nu}$$

$$\vec{r} = r[\cos(\omega + \nu), \sin(\omega + \nu), 0]$$

**Velocity magnitude:**
$$V = \sqrt{\mu\left(\frac{2}{r} - \frac{1}{a}\right)}$$

**Velocity direction** (perpendicular to radius, adjusted for eccentricity):
$$\vec{v} = \sqrt{\frac{\mu}{a(1-e^2)}}[-\sin(\omega + \nu), e + \cos(\omega + \nu), 0]$$

## LVLH Coordinate Frame

In spacecraft operations, engineers use the **Local Vertical Local Horizontal (LVLH)** frame, also called the **Hill frame**:

- **R-bar**: Radial direction (toward/away from Earth)
- **V-bar**: Velocity direction (prograde/retrograde)  
- **H-bar**: Angular momentum direction (out-of-plane)

**Why This Matters**: When mission controllers say "burn prograde" or "approach along the R-bar," they're using this coordinate system. It's the natural reference frame for orbital operations.

### LVLH Unit Vectors

At any point in orbit:

$$\hat{R} = \frac{\vec{r}}{|\vec{r}|} \quad \text{(radial)}$$

$$\hat{V} = \frac{\vec{v}}{|\vec{v}|} \quad \text{(prograde)}$$  

$$\hat{H} = \frac{\vec{r} \times \vec{v}}{|\vec{r} \times \vec{v}|} \quad \text{(normal)}$$

## Rendezvous Strategy: The Three-Phase Approach

Real spacecraft rendezvous follows a systematic approach:

### Phase 1: Phasing
- Lower the chaser's orbit to make it faster
- Wait for proper phase alignment
- Multiple revolutions may be required

### Phase 2: Transfer
- Execute Hohmann transfer or similar maneuver
- Time the burn for intercept geometry
- Monitor closest approach predictions

### Phase 3: Final Approach
- Small, precise burns in LVLH frame
- Approach along R-bar or V-bar for safety
- Maintain relative motion control

## Advanced Topic: Clohessy-Wiltshire Equations

For **close-proximity operations**, we can linearize the relative motion equations around a circular orbit. This gives us the **Clohessy-Wiltshire equations**:

$$\ddot{x} - 3n^2 x - 2n\dot{y} = 0$$
$$\ddot{y} + 2n\dot{x} = 0$$
$$\ddot{z} + n^2 z = 0$$

Where:
- $x$ = radial separation (R-bar)
- $y$ = along-track separation (V-bar)  
- $z$ = cross-track separation (H-bar)
- $n$ = target's mean motion

These equations predict that **small relative motions follow elliptical paths** in the orbital plane—exactly what you see in the final phases of ISS approaches.

### Physical Interpretation

The CW equations reveal fascinating physics:
- **Radial motion couples to along-track motion** through Coriolis effects
- **A radial impulse creates a closed elliptical trajectory**
- **Along-track motion has a secular drift component**

This is why spacecraft approaching the ISS follow specific **R-bar** or **V-bar** approach corridors—it's the safest way to maintain predictable relative motion.

## Real-World Applications

This isn't just theoretical—every spacecraft rendezvous uses these principles:

### International Space Station (ISS)
- **Cargo Dragon**: Approaches along V-bar from below
- **Crew Dragon**: Similar approach profile with abort capabilities
- **Progress/Soyuz**: Russian vehicles use automated rendezvous
- **Cygnus**: Approaches from below, grappled by robotic arm

### Historical Missions
- **Apollo**: Lunar Module rendezvous with Command Module
- **Space Shuttle**: Dozens of ISS construction flights
- **Hubble Servicing**: Precision rendezvous for maintenance

### Future Applications
- **Artemis**: Lunar Gateway rendezvous operations
- **Commercial stations**: Multiple private stations planned
- **On-orbit servicing**: Satellite refueling and repair
- **Debris removal**: Active cleanup missions

## Understanding the Simulation Scenarios

The simulator includes three key scenarios that demonstrate different aspects of orbital rendezvous. Each represents a real technique used in spaceflight operations:

### 1. Basic Phasing: The Catch-Up Game

**What it is:** Phasing maneuvers are used when two spacecraft are in the same orbital altitude but at different positions around their orbit. The goal is to "catch up" to the target.

**The Setup:** Your chaser spacecraft starts 60° behind the target in the same circular orbit.

**The Counter-Intuitive Solution:**
- **Don't** speed up to catch up! This will raise your apoapsis and make you slower on average.
- **Instead**, execute a **retrograde burn (-V)** to slow down and drop to a lower orbit.
- In the lower orbit, you'll move faster and gradually catch up to the target.
- Once you're ahead of the target, execute a **prograde burn (+V)** to raise your orbit back to the target's altitude.

**Real-World Example:** This is exactly how SpaceX Dragon capsules catch up to the ISS after launch.

### 2. Hohmann Transfer: The Classic Orbital Ballet

**What it is:** The Hohmann transfer is the most fuel-efficient way to move between two circular orbits of different altitudes. It uses exactly two burns and follows an elliptical transfer orbit.

**The Setup:** Your chaser starts in a lower orbit while the target is in a higher orbit on the opposite side of Earth.

**The Two-Burn Sequence:**
1. **First Burn (+V):** Execute a prograde burn at your periapsis (lowest point) to raise your apoapsis to the target's orbital altitude.
2. **Coast Phase:** Follow the elliptical transfer orbit for half an orbit until you reach apoapsis.
3. **Second Burn (+V):** Execute another prograde burn at apoapsis to circularize your orbit and match the target's altitude.

**Timing is Everything:** The burns must be timed so you arrive at the target's orbital altitude when the target is also there.

**Real-World Example:** This technique was used by Apollo spacecraft to reach the Moon and is still used for satellite deployments to different orbital altitudes.

### 3. R-bar Approach: The Final Precision Phase

**What it is:** The R-bar approach is the final phase of rendezvous, used when you're very close to the target (within a few kilometers). "R-bar" refers to the radial direction—directly toward or away from Earth.

**The Setup:** Your chaser starts in a slightly elliptical orbit very close to the target, simulating the final approach phase.

**The Technique:**
- Use small **radial-in burns (-R)** to gradually approach the target along the Earth-pointing direction.
- The radial approach is safer because any errors won't cause you to collide with the target at high speed.
- Radial burns create predictable, controlled relative motion patterns.

**Why R-bar is Safe:**
- If you burn too much, you'll drop below the target rather than crash into it.
- The relative motion follows predictable elliptical patterns described by the Clohessy-Wiltshire equations.
- Ground controllers can easily abort by commanding opposite radial burns.

**Real-World Example:** This is the exact approach corridor used by visiting vehicles to the International Space Station, including SpaceX Dragon, Boeing Starliner, and cargo ships.

## Try the Scenarios

Now use the simulation to practice these real spaceflight techniques:

1. **Basic Phasing**: Click the scenario, then try a **-V burn** to drop to a lower, faster orbit. Watch your phase angle change over several orbits until you catch up.

2. **Hohmann Transfer**: Click the scenario, then execute **+V burns** at the right orbital positions. Time your burns to intercept the target's orbit when it arrives there.

3. **R-bar Approach**: Click the scenario, then use small **-R burns** to approach along the radial corridor. Notice how the relative motion stays controlled and predictable.

## The Counter-Intuitive Truth

Now you understand why "speeding up makes you drop": 

- A **prograde burn raises your apoapsis** but may put you in a less favorable position
- **Lower orbits are faster**, so dropping down can help you catch up  
- **Orbital mechanics is about energy and angular momentum**, not just instantaneous velocity

This is the beautiful complexity of orbital mechanics—it requires thinking in terms of entire orbital paths, not just local motion. Every real spacecraft mission depends on these principles, from the smallest CubeSat to the largest space station.

The next time you see a cargo ship approaching the ISS, you'll know exactly why it takes that specific curved approach path and why the maneuvers seem so deliberate and careful. It's not just caution—it's the fundamental physics of orbital motion at work.

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
  document.getElementById('orbit-viz').innerHTML = '<div class="no-webgl">WebGL is not supported in your browser</div>';
  throw new Error('WebGL not supported');
}

// Show loading indicator
document.getElementById('orbit-viz').innerHTML = '<div class="loading">Loading Orbital Simulator</div>';

// Normalized units: Earth radius = 1, μ = 1
const EARTH_RADIUS = 1.0;
const MU = 1.0; // Gravitational parameter

// Simulation parameters
let params = {
  playing: true,
  timeScale: 1.0,
  burnMagnitude: 0.05,
  dt: 0.01
};

// Simulation state
let time = 0;
let dvBudget = 0;

// Orbital elements for chaser and target [a, e, omega, nu]
let chaserElements = [1.0, 0.0, 0.0, 0.0];
let targetElements = [1.0, 0.0, 0.0, Math.PI/6]; // Start target ahead

// Three.js objects
let scene, camera, renderer, controls;
let earthMesh, chaserMesh, targetMesh;
let chaserTrail, targetTrail, ghostTrail;
let chaserTrailGeometry, targetTrailGeometry, ghostTrailGeometry;
let starField, ambientLight, directionalLight, pointLight;
let particleSystem, burnParticles = [];
let chaserGlow, targetGlow, earthGlow;

// Orbital mechanics functions
function keplerSolve(M, e, tolerance = 1e-8) {
  let E = M; // Initial guess
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

function elementsToState(elements) {
  const [a, e, omega, nu] = elements;
  
  // Position magnitude
  const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
  
  // Position vector
  const cosOmegaNu = Math.cos(omega + nu);
  const sinOmegaNu = Math.sin(omega + nu);
  const position = new THREE.Vector3(r * cosOmegaNu, r * sinOmegaNu, 0);
  
  // Velocity vector
  const h = Math.sqrt(MU * a * (1 - e * e)); // Angular momentum
  const cosNu = Math.cos(nu);
  const sinNu = Math.sin(nu);
  const cosOmega = Math.cos(omega);
  const sinOmega = Math.sin(omega);
  
  const vx = -(MU / h) * Math.sin(omega + nu);
  const vy = (MU / h) * (e + Math.cos(omega + nu));
  const velocity = new THREE.Vector3(vx, vy, 0);
  
  return { position, velocity, r, speed: velocity.length() };
}

function stateToElements(position, velocity) {
  const r = position.length();
  const v = velocity.length();
  
  // Angular momentum vector
  const h_vec = new THREE.Vector3().crossVectors(position, velocity);
  const h = h_vec.length();
  
  // Eccentricity vector
  const mu_r = MU / r;
  const e_vec = new THREE.Vector3()
    .crossVectors(velocity, h_vec)
    .divideScalar(MU)
    .sub(position.clone().normalize());
  const e = e_vec.length();
  
  // Semi-major axis
  const energy = 0.5 * v * v - mu_r;
  const a = -MU / (2 * energy);
  
  // Argument of periapsis
  const omega = Math.atan2(e_vec.y, e_vec.x);
  
  // True anomaly
  let nu;
  if (e < 1e-6) {
    // Circular orbit case - calculate true anomaly directly from position
    nu = Math.atan2(position.y, position.x) - omega;
    // Normalize to [0, 2π]
    while (nu < 0) nu += 2 * Math.PI;
    while (nu > 2 * Math.PI) nu -= 2 * Math.PI;
  } else {
    // Elliptical orbit case
    const cos_nu = e_vec.dot(position) / (e * r);
    const sin_nu = h_vec.dot(new THREE.Vector3().crossVectors(e_vec, position)) / (h * e * r);
    nu = Math.atan2(sin_nu, cos_nu);
  }
  
  return [a, e, omega, nu];
}

function propagateOrbit(elements, dt) {
  const [a, e, omega, nu_old] = elements;
  
  // Convert to eccentric anomaly
  const cos_E_old = (e + Math.cos(nu_old)) / (1 + e * Math.cos(nu_old));
  const sin_E_old = Math.sqrt(1 - e * e) * Math.sin(nu_old) / (1 + e * Math.cos(nu_old));
  const E_old = Math.atan2(sin_E_old, cos_E_old);
  
  // Mean anomaly
  const M_old = E_old - e * Math.sin(E_old);
  
  // Advance mean anomaly
  const n = Math.sqrt(MU / (a * a * a)); // Mean motion
  const M_new = M_old + n * dt;
  
  // Solve Kepler's equation
  const E_new = keplerSolve(M_new, e);
  
  // Convert back to true anomaly
  const cos_nu_new = (Math.cos(E_new) - e) / (1 - e * Math.cos(E_new));
  const sin_nu_new = Math.sqrt(1 - e * e) * Math.sin(E_new) / (1 - e * Math.cos(E_new));
  const nu_new = Math.atan2(sin_nu_new, cos_nu_new);
  
  return [a, e, omega, nu_new];
}

function applyBurn(elements, deltaV) {
  // Get current state
  const state = elementsToState(elements);
  
  // Apply delta-V
  const newVelocity = state.velocity.clone().add(deltaV);
  
  // Convert back to elements
  return stateToElements(state.position, newVelocity);
}

function computePhaseAngle(chaserElements, targetElements) {
  const chaserNu = chaserElements[3];
  const targetNu = targetElements[3];
  let phase = targetNu - chaserNu;
  
  // Normalize to [0, 2π]
  while (phase < 0) phase += 2 * Math.PI;
  while (phase > 2 * Math.PI) phase -= 2 * Math.PI;
  
  return phase;
}

function predictClosestApproach(chaserElements, targetElements, maxTime = 10) {
  let minRange = Infinity;
  let timeToCA = 0;
  let minRangeTime = 0;
  
  const dt = 0.01;
  const steps = Math.floor(maxTime / dt);
  
  let currentChaserElements = [...chaserElements];
  let currentTargetElements = [...targetElements];
  
  for (let i = 0; i < steps; i++) {
    const chaserState = elementsToState(currentChaserElements);
    const targetState = elementsToState(currentTargetElements);
    
    const range = chaserState.position.distanceTo(targetState.position);
    
    if (range < minRange) {
      minRange = range;
      timeToCA = i * dt;
    }
    
    // Propagate orbits
    currentChaserElements = propagateOrbit(currentChaserElements, dt);
    currentTargetElements = propagateOrbit(currentTargetElements, dt);
  }
  
  return { minRange, timeToCA };
}

function createTrailGeometry(maxPoints = 500) {
  const positions = new Float32Array(maxPoints * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0); // Initially draw no points
  return geometry;
}

function updateTrail(trailGeometry, newPosition, maxPoints = 500) {
  const positions = trailGeometry.attributes.position.array;
  const currentCount = trailGeometry.drawRange.count;
  
  if (currentCount < maxPoints) {
    // Add new point
    const index = currentCount * 3;
    positions[index] = newPosition.x;
    positions[index + 1] = newPosition.y;
    positions[index + 2] = newPosition.z;
    trailGeometry.setDrawRange(0, currentCount + 1);
  } else {
    // Shift array and add new point
    for (let i = 0; i < (maxPoints - 1) * 3; i++) {
      positions[i] = positions[i + 3];
    }
    const lastIndex = (maxPoints - 1) * 3;
    positions[lastIndex] = newPosition.x;
    positions[lastIndex + 1] = newPosition.y;
    positions[lastIndex + 2] = newPosition.z;
  }
  
  trailGeometry.attributes.position.needsUpdate = true;
}

function getLVLHBasis(position, velocity) {
  const rBar = position.clone().normalize(); // Radial (away from Earth)
  const hBar = new THREE.Vector3().crossVectors(position, velocity).normalize(); // Normal (out of plane)
  const vBar = new THREE.Vector3().crossVectors(hBar, rBar); // Prograde (velocity direction)
  
  return { rBar, vBar, hBar };
}

// Add orbital collision detection and prevention
function isOrbitValid(elements) {
  const [a, e] = elements;
  const periapsis = a * (1 - e);
  const EARTH_RADIUS = 1.0;
  const MIN_ALTITUDE = 0.01; // Minimum safe altitude above Earth
  
  return periapsis > (EARTH_RADIUS + MIN_ALTITUDE);
}

// Enhanced simulation step with visual effects
function step() {
  if (!params.playing) return;
  
  const dt = params.dt * params.timeScale;
  
  // Propagate orbits
  chaserElements = propagateOrbit(chaserElements, dt);
  targetElements = propagateOrbit(targetElements, dt);
  
  time += dt;
  
  // Update spacecraft positions
  const chaserState = elementsToState(chaserElements);
  const targetState = elementsToState(targetElements);
  
  chaserMesh.position.copy(chaserState.position);
  targetMesh.position.copy(targetState.position);
  
  // Update trails with enhanced effects
  updateTrail(chaserTrailGeometry, chaserState.position);
  updateTrail(targetTrailGeometry, targetState.position);
  
  // Update particle systems
  updateParticles();
  
  // Animate glow effects
  if (chaserGlow) {
    chaserGlow.material.opacity = 0.3 + 0.1 * Math.sin(time * 5);
  }
  if (targetGlow) {
    targetGlow.material.opacity = 0.3 + 0.1 * Math.sin(time * 3);
  }
  if (earthGlow) {
    earthGlow.material.opacity = 0.2 + 0.05 * Math.sin(time * 2);
  }
  
  // Rotate Earth slowly
  if (earthMesh) {
    earthMesh.rotation.y += 0.001 * params.timeScale;
  }
  
  // Animate starfield
  if (starField) {
    starField.rotation.y += 0.0001 * params.timeScale;
  }
  
  // Update directional light position (simulating sun)
  if (directionalLight) {
    const angle = time * 0.1;
    directionalLight.position.set(
      Math.cos(angle) * 10,
      3,
      Math.sin(angle) * 10
    );
  }
  
  // Update HUD
  updateHUD();
}

function updateHUD() {
  const chaserState = elementsToState(chaserElements);
  const targetState = elementsToState(targetElements);
  
  // Chaser parameters
  const [chaserA, chaserE] = chaserElements;
  const chaserPeriod = 2 * Math.PI * Math.sqrt(chaserA * chaserA * chaserA / MU);
  
  document.getElementById('chaser-a').textContent = `${chaserA.toFixed(3)} R⊕`;
  document.getElementById('chaser-e').textContent = chaserE.toFixed(3);
  document.getElementById('chaser-period').textContent = `${chaserPeriod.toFixed(2)} TU`;
  document.getElementById('chaser-speed').textContent = `${chaserState.speed.toFixed(3)} VU`;
  
  // Target parameters
  const [targetA, targetE] = targetElements;
  const targetPeriod = 2 * Math.PI * Math.sqrt(targetA * targetA * targetA / MU);
  
  document.getElementById('target-a').textContent = `${targetA.toFixed(3)} R⊕`;
  document.getElementById('target-e').textContent = targetE.toFixed(3);
  document.getElementById('target-period').textContent = `${targetPeriod.toFixed(2)} TU`;
  
  // Phase angle
  const phaseAngle = computePhaseAngle(chaserElements, targetElements);
  document.getElementById('phase-angle').textContent = `${(phaseAngle * 180 / Math.PI).toFixed(1)}°`;
  
  // Relative motion
  const range = chaserState.position.distanceTo(targetState.position);
  const relativeVel = new THREE.Vector3().subVectors(chaserState.velocity, targetState.velocity);
  const closingRate = -relativeVel.dot(new THREE.Vector3().subVectors(targetState.position, chaserState.position).normalize());
  
  document.getElementById('relative-range').textContent = `${range.toFixed(3)} R⊕`;
  document.getElementById('closing-rate').textContent = `${closingRate.toFixed(3)} VU`;
  document.getElementById('dv-budget').textContent = `${dvBudget.toFixed(3)} VU`;
  
  // Closest approach prediction
  const ca = predictClosestApproach(chaserElements, targetElements);
  document.getElementById('time-to-ca').textContent = ca.timeToCA > 0 ? `${ca.timeToCA.toFixed(1)} TU` : '-- TU';
  document.getElementById('min-range').textContent = ca.minRange < 1 ? `${(ca.minRange * 1000).toFixed(1)} m` : `${ca.minRange.toFixed(3)} R⊕`;
  
  // Status
  const mode = params.playing ? 'Running' : 'Paused';
  document.getElementById('orbit-status').textContent = 
    `${mode} | Time: ${time.toFixed(1)} TU | Range: ${(range * 1000).toFixed(1)} m`;
}

// Create starfield background
function createStarField() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.003,
    transparent: true,
    opacity: 1.0,
    sizeAttenuation: false
  });

  const starsVertices = [];
  for (let i = 0; i < 2000; i++) {
    const x = (Math.random() - 0.5) * 200;
    const y = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    starsVertices.push(x, y, z);
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
  return new THREE.Points(starsGeometry, starsMaterial);
}

// Create particle system for burn effects
function createParticleSystem() {
  const particleCount = 100;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
  
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.01,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });
  
  return new THREE.Points(geometry, material);
}

// Create glow effect
function createGlow(color, size) {
  const glowGeometry = new THREE.SphereGeometry(size, 16, 16);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  return new THREE.Mesh(glowGeometry, glowMaterial);
}

// Initialize Three.js scene
function initThree() {
  const container = document.getElementById('orbit-viz');
  
  // Clear loading indicator
  container.innerHTML = '';
  
  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000510, 10, 100);
  
  // Starfield background
  starField = createStarField();
  scene.add(starField);
  
  // Camera
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 500);
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);
  
  // Renderer with enhanced settings
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);
  
  // Enhanced lighting system - brighter for better visibility
  ambientLight = new THREE.AmbientLight(0x6080a0, 0.7);
  scene.add(ambientLight);
  
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(5, 3, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
  
  pointLight = new THREE.PointLight(0x80b5ff, 1.2, 50);
  pointLight.position.set(0, 0, 0);
  scene.add(pointLight);
  
  // Enhanced Earth with realistic materials
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  
  // Create enhanced Earth texture
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Earth base with realistic colors
  const earthGradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 400);
  earthGradient.addColorStop(0, '#2563eb');
  earthGradient.addColorStop(0.3, '#1d4ed8');
  earthGradient.addColorStop(0.7, '#1e40af');
  earthGradient.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = earthGradient;
  ctx.fillRect(0, 0, 1024, 512);
  
  // Add continents
  ctx.fillStyle = '#065f46';
  ctx.beginPath();
  ctx.ellipse(200, 200, 80, 50, Math.PI/4, 0, 2*Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(600, 300, 120, 70, -Math.PI/6, 0, 2*Math.PI);
  ctx.fill();
  
  // Add coordinate grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 16; i++) {
    const x = (i * 1024) / 16;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let i = 0; i <= 8; i++) {
    const y = (i * 512) / 8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  
  const earthTexture = new THREE.CanvasTexture(canvas);
  earthTexture.wrapS = THREE.RepeatWrapping;
  earthTexture.wrapT = THREE.RepeatWrapping;
  
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    transparent: true,
    opacity: 1.0,
    shininess: 30,
    specular: 0x222222
  });
  
  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earthMesh.castShadow = true;
  earthMesh.receiveShadow = true;
  scene.add(earthMesh);
  
  // Earth glow effect
  earthGlow = createGlow(0x60a5fa, 1.1);
  earthMesh.add(earthGlow);
  
  // Enhanced Chaser spacecraft - larger and more visible
  const chaserGeometry = new THREE.SphereGeometry(0.06, 16, 16);
  const chaserMaterial = new THREE.MeshPhongMaterial({
    color: 0xff4444,
    emissive: 0x330000,
    shininess: 100,
    specular: 0x555555
  });
  chaserMesh = new THREE.Mesh(chaserGeometry, chaserMaterial);
  chaserMesh.castShadow = true;
  scene.add(chaserMesh);
  
  // Chaser glow - larger
  chaserGlow = createGlow(0xff4444, 0.12);
  chaserMesh.add(chaserGlow);
  
  // Enhanced Target spacecraft - larger and more visible
  const targetGeometry = new THREE.SphereGeometry(0.06, 16, 16);
  const targetMaterial = new THREE.MeshPhongMaterial({
    color: 0x44ff44,
    emissive: 0x003300,
    shininess: 100,
    specular: 0x555555
  });
  targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
  targetMesh.castShadow = true;
  scene.add(targetMesh);
  
  // Target glow - larger
  targetGlow = createGlow(0x44ff44, 0.12);
  targetMesh.add(targetGlow);
  
  // Enhanced orbital trails with gradient
  chaserTrailGeometry = createTrailGeometry();
  const chaserTrailMaterial = new THREE.LineBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.8,
    linewidth: 2
  });
  chaserTrail = new THREE.Line(chaserTrailGeometry, chaserTrailMaterial);
  scene.add(chaserTrail);
  
  targetTrailGeometry = createTrailGeometry();
  const targetTrailMaterial = new THREE.LineBasicMaterial({
    color: 0x44ff44,
    transparent: true,
    opacity: 0.8,
    linewidth: 2
  });
  targetTrail = new THREE.Line(targetTrailGeometry, targetTrailMaterial);
  scene.add(targetTrail);
  
  // Enhanced ghost trail with dashed line effect
  ghostTrailGeometry = createTrailGeometry();
  const ghostTrailMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    dashSize: 0.05,
    gapSize: 0.03,
    linewidth: 1
  });
  ghostTrail = new THREE.Line(ghostTrailGeometry, ghostTrailMaterial);
  ghostTrail.computeLineDistances();
  scene.add(ghostTrail);
  
  // Particle system for burn effects
  particleSystem = createParticleSystem();
  scene.add(particleSystem);
  
  // Enhanced controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minDistance = 1.5;
  controls.maxDistance = 15;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.5;
  
  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
  resizeObserver.observe(container);
  
  // Initial positions
  resetSimulation();
}

function resetSimulation() {
  // Reset to initial conditions - start at LEO altitude
  chaserElements = [1.3, 0.0, 0.0, 0.0];
  targetElements = [1.3, 0.0, 0.0, Math.PI/6];
  time = 0;
  dvBudget = 0;
  
  // Clear trails
  chaserTrailGeometry.setDrawRange(0, 0);
  targetTrailGeometry.setDrawRange(0, 0);
  ghostTrailGeometry.setDrawRange(0, 0);
  
  // Update positions
  const chaserState = elementsToState(chaserElements);
  const targetState = elementsToState(targetElements);
  
  chaserMesh.position.copy(chaserState.position);
  targetMesh.position.copy(targetState.position);
  
  updateHUD();
}

// Scenario presets with detailed setups
function loadScenario(scenario) {
  switch (scenario) {
    case 'basic':
      // Basic Phasing: Chaser starts behind target in same circular orbit
      // Goal: Use retrograde burn to lower orbit and catch up
      chaserElements = [1.3, 0.0, 0.0, -Math.PI/3]; // 60° behind
      targetElements = [1.3, 0.0, 0.0, 0.0];
      document.getElementById('orbit-status').textContent =
        'Basic Phasing: Try a -V burn to lower orbit and catch up to target';
      break;
      
    case 'hohmann':
      // Hohmann Transfer: Chaser in lower orbit, target in higher orbit
      // Goal: Execute two-burn transfer maneuver
      chaserElements = [1.2, 0.0, 0.0, 0.0]; // Lower orbit
      targetElements = [1.4, 0.0, 0.0, Math.PI]; // Higher orbit, opposite side
      document.getElementById('orbit-status').textContent =
        'Hohmann Transfer: Use +V at periapsis, then +V again at apoapsis to circularize';
      break;
      
    case 'rendezvous':
      // R-bar Approach: Close proximity with slight eccentricity
      // Goal: Use small radial burns for final approach
      chaserElements = [1.295, 0.02, 0.0, Math.PI + Math.PI/12]; // Slightly elliptical, near target
      targetElements = [1.3, 0.0, 0.0, 0.0];
      document.getElementById('orbit-status').textContent =
        'R-bar Approach: Use small -R burns to approach target along radial corridor';
      break;
  }
  
  // Clear trails for new scenario
  chaserTrailGeometry.setDrawRange(0, 0);
  targetTrailGeometry.setDrawRange(0, 0);
  ghostTrailGeometry.setDrawRange(0, 0);
  
  time = 0;
  dvBudget = 0;
  
  // Update positions
  const chaserState = elementsToState(chaserElements);
  const targetState = elementsToState(targetElements);
  
  chaserMesh.position.copy(chaserState.position);
  targetMesh.position.copy(targetState.position);
  
  updateHUD();
}

// Create burn particle effect
function createBurnEffect(position, direction, burnType) {
  const particleCount = 50;
  const particles = new THREE.Group();
  
  for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.002, 4, 4);
    let particleColor;
    switch (burnType) {
      case 'prograde': particleColor = 0x22c55e; break;
      case 'retrograde': particleColor = 0xef4444; break;
      case 'radial-out': particleColor = 0x3b82f6; break;
      case 'radial-in': particleColor = 0xf59e0b; break;
      default: particleColor = 0xffffff;
    }
    
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: particleColor,
      transparent: true,
      opacity: 0.8
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    
    // Random position around burn point
    const spread = 0.1;
    particle.position.copy(position);
    particle.position.add(new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    ));
    
    // Velocity opposite to burn direction
    const velocity = direction.clone().multiplyScalar(-0.02 * (0.5 + Math.random()));
    velocity.add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ));
    
    particle.userData = {
      velocity: velocity,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.02
    };
    
    particles.add(particle);
  }
  
  scene.add(particles);
  burnParticles.push({
    group: particles,
    life: 1.0
  });
}

// Update particle systems
function updateParticles() {
  for (let i = burnParticles.length - 1; i >= 0; i--) {
    const burnEffect = burnParticles[i];
    burnEffect.life -= 0.02;
    
    if (burnEffect.life <= 0) {
      scene.remove(burnEffect.group);
      burnParticles.splice(i, 1);
      continue;
    }
    
    burnEffect.group.children.forEach(particle => {
      particle.userData.life -= particle.userData.decay;
      particle.position.add(particle.userData.velocity);
      particle.material.opacity = particle.userData.life;
      particle.scale.setScalar(particle.userData.life);
      
      if (particle.userData.life <= 0) {
        particle.visible = false;
      }
    });
  }
}

// Enhanced execute burn with visual effects and collision detection
function executeBurn(direction) {
  const chaserState = elementsToState(chaserElements);
  const basis = getLVLHBasis(chaserState.position, chaserState.velocity);
  
  let deltaV;
  switch (direction) {
    case 'prograde':
      deltaV = basis.vBar.clone().multiplyScalar(params.burnMagnitude);
      break;
    case 'retrograde':
      deltaV = basis.vBar.clone().multiplyScalar(-params.burnMagnitude);
      break;
    case 'radial-out':
      deltaV = basis.rBar.clone().multiplyScalar(params.burnMagnitude);
      break;
    case 'radial-in':
      deltaV = basis.rBar.clone().multiplyScalar(-params.burnMagnitude);
      break;
  }
  
  // Test the burn before applying it
  const testElements = applyBurn(chaserElements, deltaV);
  
  // Check if the resulting orbit would be valid (not crash into Earth)
  if (!isOrbitValid(testElements)) {
    // Warn user and prevent dangerous burn
    document.getElementById('orbit-status').textContent =
      `⚠️ Burn rejected: Would cause orbit to intersect with Earth! Try smaller magnitude.`;
    document.getElementById('orbit-status').style.color = '#ef4444';
    
    // Reset color after 3 seconds
    setTimeout(() => {
      document.getElementById('orbit-status').style.color = '#60a5fa';
    }, 3000);
    
    return; // Don't execute the burn
  }
  
  // Create visual burn effect
  createBurnEffect(chaserState.position, deltaV.clone().normalize(), direction);
  
  // Flash effect on chaser
  chaserMesh.material.emissive.setHex(0x444444);
  setTimeout(() => {
    chaserMesh.material.emissive.setHex(0x330000);
  }, 200);
  
  // Apply the burn (we know it's safe now)
  chaserElements = testElements;
  dvBudget += params.burnMagnitude;
  
  // Update ghost trail with prediction
  updateGhostTrail();
  
  // Update status with burn confirmation
  const burnNames = {
    'prograde': '+V (Prograde)',
    'retrograde': '-V (Retrograde)',
    'radial-out': '+R (Radial Out)',
    'radial-in': '-R (Radial In)'
  };
  document.getElementById('orbit-status').textContent =
    `✓ ${burnNames[direction]} burn executed. ΔV: ${params.burnMagnitude.toFixed(3)} VU`;
  
  // Add UI feedback
  const button = document.getElementById(`burn-${direction.replace('-', '-')}`);
  if (button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  }
}

function updateGhostTrail() {
  // Clear previous ghost trail
  ghostTrailGeometry.setDrawRange(0, 0);
  
  // Predict future trajectory
  let tempElements = [...chaserElements];
  const positions = ghostTrailGeometry.attributes.position.array;
  
  for (let i = 0; i < 200; i++) {
    const state = elementsToState(tempElements);
    positions[i * 3] = state.position.x;
    positions[i * 3 + 1] = state.position.y;
    positions[i * 3 + 2] = state.position.z;
    
    tempElements = propagateOrbit(tempElements, 0.05);
  }
  
  ghostTrailGeometry.setDrawRange(0, 200);
  ghostTrailGeometry.attributes.position.needsUpdate = true;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  step();
  controls.update();
  renderer.render(scene, camera);
}

// Event listeners
document.getElementById('orbit-play-pause').addEventListener('click', () => {
  params.playing = !params.playing;
  document.getElementById('orbit-play-pause').textContent = params.playing ? 'Pause' : 'Play';
});

document.getElementById('orbit-reset').addEventListener('click', resetSimulation);

document.getElementById('burn-prograde').addEventListener('click', () => executeBurn('prograde'));
document.getElementById('burn-retrograde').addEventListener('click', () => executeBurn('retrograde'));
document.getElementById('burn-radial-out').addEventListener('click', () => executeBurn('radial-out'));
document.getElementById('burn-radial-in').addEventListener('click', () => executeBurn('radial-in'));

document.getElementById('burn-magnitude').addEventListener('input', (e) => {
  params.burnMagnitude = parseFloat(e.target.value);
  document.getElementById('burn-magnitude-value').textContent = params.burnMagnitude.toFixed(2);
});

document.getElementById('time-scale').addEventListener('input', (e) => {
  params.timeScale = parseFloat(e.target.value);
  document.getElementById('time-scale-value').textContent = `${params.timeScale.toFixed(1)}×`;
});

document.getElementById('scenario-basic').addEventListener('click', () => loadScenario('basic'));
document.getElementById('scenario-hohmann').addEventListener('click', () => loadScenario('hohmann'));
document.getElementById('scenario-rendezvous').addEventListener('click', () => loadScenario('rendezvous'));

// Initialize
initThree();
animate();
</script>