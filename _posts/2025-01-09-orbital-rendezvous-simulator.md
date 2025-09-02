---
layout: post
title: "Interactive Orbital Rendezvous Simulator"
date: 2025-09-01
description: "Explore the counter-intuitive nature of orbital mechanics through interactive 3D simulations. Learn why speeding up can make you drop and master spacecraft rendezvous techniques."
img: /assets/img/galaxy.png
tags: [orbital-mechanics, physics, simulation, aerospace, interactive, three-js]
categories: blog
---

## Why “Speeding Up” Can Make You Fall Behind

Here’s one of the most counter-intuitive facts about orbital mechanics: **a short prograde burn (speeding up) makes you instantly faster at the burn point, but it raises the opposite side of your orbit**. That higher apoapsis means that **later** in the orbit—especially near apoapsis—you’ll be **moving more slowly** than before.

On Earth, pressing the gas just makes you go faster. In orbit, impulsive burns reshape your **entire** path by changing energy and angular momentum, so the long-term effect can be the opposite of your gut feel. This is exactly why, to catch a target that’s ahead of you, the right move is often to **go to a lower orbit** (via a retrograde burn) so you lap faster and **phase** into position.

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

.units-legend {
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(15,23,42,0.3) 100%);
  border: 1px solid rgba(59,130,246,0.25);
  border-radius: 10px;
}

/* Toast messages for educational callouts */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(30, 58, 138, 0.98) 100%);
  border: 1px solid rgba(59, 130, 246, 0.8);
  border-radius: 12px;
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.6);
  transform: translateX(450px);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  backdrop-filter: blur(10px);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.toast.show {
  transform: translateX(0);
}

.toast .toast-icon {
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.1em;
}

/* --- Phase gauge panel --- */
.phase-gauge {
  background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(30,58,138,0.05) 100%);
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.phase-gauge h4 {
  color: #60a5fa;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  border-bottom: 2px solid rgba(59,130,246,0.3);
  padding-bottom: 0.5rem;
}
.phase-gauge .row {
  display: flex; justify-content: space-between;
  font-family: 'SF Mono','Monaco','Inconsolata','Roboto Mono',monospace;
  font-size: 0.9rem; margin: 0.25rem 0;
}
.phase-bar {
  position: relative; height: 10px; border-radius: 6px;
  background: rgba(255,255,255,0.08); margin-top: 0.5rem; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
}
.phase-fill {
  position: absolute; top:0; left:0; bottom:0; width:0%;
  background: linear-gradient(90deg, rgba(34,197,94,0.8), rgba(59,130,246,0.8));
}
.phase-status {
  margin-top: 0.5rem; text-align: center; font-weight: 700;
}
.phase-status.ready { color: #22c55e; }
.phase-status.wait { color: #f59e0b; }
.phase-status.na { color: rgba(255,255,255,0.6); }

/* --- Optional: make marker labels a tad crisper --- */
.sprite-label {
  filter: drop-shadow(0 0 2px rgba(0,0,0,0.7));
}

/* Performance mode - reduced effects */
body.performance-mode .burn-button {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}
body.performance-mode .hud-panel {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}
body.performance-mode .toast {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: none !important;
}
body.performance-mode #orbit-container {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: none !important;
}

/* Keyboard shortcuts helper */
.keyboard-shortcuts {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 200px;
  transform: translateY(200px);
  transition: transform 0.3s ease;
  z-index: 999;
}
.keyboard-shortcuts.show {
  transform: translateY(0);
}
.keyboard-shortcuts h5 {
  color: #60a5fa;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.keyboard-shortcuts div {
  margin: 0.25rem 0;
}
.keyboard-shortcuts kbd {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 3px;
  padding: 0.1rem 0.3rem;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}


/* Keyboard shortcuts helper */
.keyboard-shortcuts {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 200px;
  transform: translateY(200px);
  transition: transform 0.3s ease;
  z-index: 999;
}
.keyboard-shortcuts.show {
  transform: translateY(0);
}
.keyboard-shortcuts h5 {
  color: #60a5fa;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.keyboard-shortcuts div {
  margin: 0.25rem 0;
}
.keyboard-shortcuts kbd {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 3px;
  padding: 0.1rem 0.3rem;
  font-size: 0.75rem;
  margin-right: 0.5rem;
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
  
  <div class="units-legend">
    <strong>Units:</strong> Earth radius R⊕ = 1, gravitational parameter μ = 1,
    time unit TU satisfies \(T=2\pi\sqrt{a^3/\mu}\), and speeds are in VU from vis-viva.
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
        <span class="label">Time to closest approach:</span>
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
- **Cargo Dragon**: Approaches along the **R-bar** (from below/radial) to a capture point near the station.
- **Crew Dragon**: Similar R-bar profile with multiple hold points and built-in abort options.
- **Progress/Soyuz**: Russian vehicles use largely automated rendezvous along established corridors.
- **Cygnus**: Also follows an R-bar approach and is grappled by the robotic arm.


### Historical Missions
- **Apollo**: Lunar Module rendezvous with Command Module
- **Space Shuttle**: Dozens of ISS construction flights
- **Hubble Servicing**: Precision rendezvous for maintenance

### Future Applications
- **Artemis**: Lunar Gateway rendezvous operations
- **Commercial stations**: Multiple private stations planned
- **On-orbit servicing**: Satellite refueling and repair
- **Debris removal**: Active cleanup missions

## Why I Love Teaching This

Here's the thing that absolutely blows my mind about orbital mechanics: it's completely backwards from everything we experience on Earth. I've spent countless hours watching spacecraft approach the ISS, and every single time I'm amazed by how they do it.

When I first learned about orbital rendezvous, I thought it would work like driving a car—speed up to catch up, right? **Wrong.** So incredibly wrong. And that's exactly why I built this simulation.

## The Stories Behind Each Scenario

I've included three different scenarios that represent real missions I've watched unfold. Each one teaches you something different about the beautiful, frustrating, counter-intuitive world of orbital mechanics.

### Scenario 1: "The Chase" (Basic Phasing)

**This is my favorite one to mess with people's heads.**

Picture this: You're an astronaut in a spacecraft, and you can see your target—maybe the ISS—ahead of you in the same orbit. Your instinct? Fire the engines and speed up to catch it, obviously.

**Here's what actually happens:** You speed up, which raises the back half of your orbit, which means you're now in a bigger orbit, which means you're actually going *slower* on average. The target pulls further ahead. Congratulations, you just made things worse.

**The mind-bending solution?** Slow down. Seriously. Hit that **-V button** and drop into a lower orbit. Now you're closer to Earth, moving faster, and you'll gradually catch up over the next few orbits. It's like taking the inside lane on a racetrack.

**Real talk:** This is exactly how every SpaceX Dragon mission catches up to the ISS. They launch into a lower orbit and spend about a day chasing the station from below. Every time I watch a launch, I think about how this breaks everyone's brain the first time they learn it.

### Scenario 2: "The Elegant Dance" (Hohmann Transfer)

**This one is pure poetry in motion.**

Walter Hohmann figured this out in 1925—before we'd even put anything in orbit—and it's still the most elegant way to change altitudes in space. It's like orbital ballroom dancing: two perfectly timed moves, separated by a graceful coast through space.

**Here's how the dance works:**
1. **First move (+V):** Burn prograde at your lowest point. This raises the top of your orbit to match your target's altitude.
2. **The coast:** Follow your new elliptical path for exactly half an orbit. This is where patience pays off.
3. **Second move (+V):** Another prograde burn at the high point to circularize. Now you're dancing at the same altitude.

**The magic is in the timing.** You have to time that first burn so that when you arrive at the high point, your target is waiting there for you. Miss the timing, and you're playing cosmic tag in the worst possible way.

**This blew my mind:** Apollo’s trans-lunar injection used a **Hohmann-like** transfer timed with the Moon’s motion; the same elegant, energy-efficient idea shows up everywhere in mission design.


### Scenario 3: "The Final Approach" (R-bar Approach)

**This is where it gets really precise—and really nerve-wracking.**

Imagine you're the pilot of a cargo ship approaching the ISS. You're close now—maybe a few kilometers away. Every move you make could be your last if you mess it up. There are people inside that station, and you're carrying tons of supplies hurtling through space at 17,500 mph.

**Why the R-bar approach is brilliant:**
Instead of approaching directly (which would be terrifying), you approach along the "R-bar"—the imaginary line pointing straight down toward Earth. If something goes wrong, you don't crash into the station—you just drop away toward Earth.

**The technique:** Tiny **-R burns** that nudge you inward along this safe corridor. The relative motion follows these beautiful, predictable patterns that mathematicians call Clohessy-Wiltshire equations (don't worry about the math—just know it works).

**I've watched this happen live:** During ISS approaches, NASA's mission control guides the spacecraft along this exact path. You can see it on their live streams—the slow, careful approach from directly below the station. It looks almost gentle, but it's the result of decades of learning how to do this safely.

## Ready to Break Your Brain?

Here's what I want you to try. Start with these scenarios and prepare to have your Earth-based intuition completely shattered:

**Start with "The Chase":** Click Basic Phasing, then resist every instinct you have. When you see that target ahead of you, hit **-V** instead of +V. Watch the magic happen over several orbits. It feels wrong, but it works.

**Try "The Dance":** Load up Hohmann Transfer and practice the two-burn sequence. Hit **+V** at the bottom of your orbit, coast patiently, then **+V** again at the top. Time it right and you'll intercept your target perfectly.

**Master "The Approach":** R-bar Approach lets you practice the final phase that every ISS visitor uses. Small **-R burns** only. Watch how controlled and predictable everything stays.

The first time I got these right, I felt like I'd unlocked some secret of the universe. Because in a way, I had.

## "Wait, Why Does +V Sometimes Shrink My Orbit?"

**This question breaks everyone's brain the first time.** You're not going crazy, and it's definitely not a bug. This is orbital mechanics being its beautifully weird self.

Here's what's actually happening when you hit +V (prograde burn):

### The Energy Distribution Dance

When you fire prograde, you're adding energy to your orbit. But here's the kicker—**that energy doesn't just make you go faster where you are**. Instead, it gets distributed around your entire orbital path in a very specific way.

**The fundamental rule:** A prograde burn raises the *opposite side* of your orbit from where you're currently located.

### Why This Happens

Think of your orbit like a rubber band around Earth. When you "stretch" one part by adding energy, the opposite part moves further out. So:

- **Burn at the bottom of your orbit?** You raise the top
- **Burn at the top of your orbit?** You raise the bottom
- **Burn anywhere in between?** You raise the opposite side

### What You're Actually Seeing

The "Semi-major axis" in the HUD shows your orbit's average radius—and yes, +V *always* increases this. But here's where it gets weird:

1. **Right after the burn:** Your current position might show a smaller radius if you were at a high point and the burn raised the opposite (low) point more than your current position
2. **As you continue orbiting:** You'll see your altitude vary more dramatically because your orbit is now more elliptical

### The Real-World Example

This is exactly why the Apollo Command Module had to do **two** separate burns to reach the Moon:
1. First burn raised their apoapsis to lunar distance
2. But they were still at low altitude—they had to coast all the way around to that high point
3. Second burn at the high point raised their periapsis to complete the transfer

### Pro Tip for the Simulation

Watch both the **semi-major axis** (average orbit size) and your **current altitude** as you orbit. The semi-major axis tells you the real story—it always increases with +V burns. The current radius changes as you move around your now-elliptical orbit.

**This behavior is pure physics, not a bug—and it's exactly why orbital mechanics is so beautifully counter-intuitive!**

## "Help! My Hohmann Transfer Went Crazy!"

**You're discovering why rocket scientists do so much math before pressing buttons!**

If your second +V burn in the Hohmann Transfer scenario is sending your orbit into the stratosphere, you're experiencing one of the most important lessons in spaceflight: **burn magnitude matters. A lot.**

### What's Actually Happening

The Hohmann transfer is incredibly sensitive to burn timing and magnitude. Here's what's going wrong:

1. **Your first burn was probably too big**: This created a transfer orbit that's larger than intended
2. **When you reached apoapsis**: You're now much higher than the target orbit
3. **The second burn**: Instead of circularizing at the target altitude, it's adding energy to an already high orbit

### The Real-World Parallel

This is exactly why SpaceX and NASA spend months calculating precise burn values. Get it wrong by even a few meters per second, and you miss your target by thousands of kilometers.

### How to Get It Right

For the Hohmann Transfer scenario, try this:

1. **Reduce your burn magnitude to ~0.02** using the slider
2. **First burn**: One quick +V tap at your lowest point (periapsis)
3. **Coast**: Wait exactly half an orbit until you're at the highest point
4. **Second burn**: Another small +V tap to circularize

### The Math Behind It

In the real world, the exact burn values for a Hohmann transfer are calculated using:
- First burn: ΔV₁ = √(μ/r₁) × (√(2r₂/(r₁+r₂)) - 1)
- Second burn: ΔV₂ = √(μ/r₂) × (1 - √(2r₁/(r₁+r₂)))

For our scenario (1.2 to 1.4 Earth radii), these work out to much smaller values than the default 0.05 burn magnitude.

### Pro Tip

**Watch the ghost trail!** After your first burn, you'll see a dashed line showing your predicted orbit. It should just barely touch the target's orbital altitude. If it goes way beyond, your burn was too big.

**This is why orbital mechanics is both beautiful and terrifying—tiny changes have huge consequences!**

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

// Check WebGL support with actual context creation
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (!gl) {
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
  dt: 0.01,
  realWorldUnits: false
};

// Real-world unit conversions
const EARTH_RADIUS_KM = 6371.0; // km
const TU_TO_SECONDS = Math.sqrt(EARTH_RADIUS_KM * EARTH_RADIUS_KM * EARTH_RADIUS_KM / 398600.4418); // √(R³/μ_Earth)
const VU_TO_KM_S = EARTH_RADIUS_KM / TU_TO_SECONDS; // km/s

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

// Markers for chaser periapsis/apoapsis
let periMarker, apoMarker, periLabel, apoLabel;

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
  
  // Argument of periapsis and true anomaly
  let omega, nu;
  if (e < 1e-6) {
    // Circular orbit case - omega is undefined, set to 0 for consistency
    omega = 0;
    // True anomaly is just the position angle
    nu = Math.atan2(position.y, position.x);
    // Normalize to [0, 2π]
    while (nu < 0) nu += 2 * Math.PI;
    while (nu > 2 * Math.PI) nu -= 2 * Math.PI;
  } else {
    // Elliptical orbit case
    omega = Math.atan2(e_vec.y, e_vec.x);
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

function predictClosestApproach(chaserElements, targetElements, maxTime = null) {
  // Use scale-invariant prediction horizon based on chaser's period
  if (maxTime === null) {
    const [a] = chaserElements;
    const P = 2 * Math.PI * Math.sqrt(a * a * a / MU);
    maxTime = 1.5 * P;
  }
  
  let minRange = Infinity;
  let timeToCA = 0;
  let chaserStateAtCA = null;
  let targetStateAtCA = null;
  
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
      chaserStateAtCA = { ...chaserState };
      targetStateAtCA = { ...targetState };
    }
    
    // Propagate orbits
    currentChaserElements = propagateOrbit(currentChaserElements, dt);
    currentTargetElements = propagateOrbit(currentTargetElements, dt);
  }
  
  return {
    minRange,
    timeToCA,
    chaserStateAtCA,
    targetStateAtCA
  };
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
  
  // Check for hyperbolic orbits (energy >= 0, a < 0)
  if (a <= 0) {
    return false; // Hyperbolic or parabolic orbit
  }
  
  // Check periapsis against Earth intersection
  const periapsis = a * (1 - e);
  const EARTH_RADIUS = 1.0;
  const MIN_ALTITUDE = 0.01; // Minimum safe altitude above Earth
  
  if (periapsis <= (EARTH_RADIUS + MIN_ALTITUDE)) {
    return false; // Would crash into Earth
  }
  
  // Check apoapsis to avoid near-parabolic numerical weirdness
  const apoapsis = a * (1 + e);
  const MAX_APOAPSIS = 10.0; // Reasonable limit for simulation
  
  if (apoapsis > MAX_APOAPSIS) {
    return false; // Orbit too large, numerical issues likely
  }
  
  return true;
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
  
  updatePAOMarkers();
  updatePhaseGauge();
  updateGhostBurnArrows();
  
  updatePAOMarkers();
  updatePhaseGauge();
  
  updatePAOMarkers();
  updatePhaseGauge();
  
  updatePAOMarkers();
  updatePhaseGauge();
  
  updatePAOMarkers();
  updatePhaseGauge();
}

function updateHUD() {
  const chaserState = elementsToState(chaserElements);
  const targetState = elementsToState(targetElements);
  
  // Chaser parameters
  const [chaserA, chaserE] = chaserElements;
  const chaserPeriod = 2 * Math.PI * Math.sqrt(chaserA * chaserA * chaserA / MU);
  
  if (params.realWorldUnits) {
    document.getElementById('chaser-a').textContent = `${(chaserA * EARTH_RADIUS_KM).toFixed(0)} km`;
    document.getElementById('chaser-period').textContent = `${(chaserPeriod * TU_TO_SECONDS / 60).toFixed(1)} min`;
    document.getElementById('chaser-speed').textContent = `${(chaserState.speed * VU_TO_KM_S).toFixed(2)} km/s`;
  } else {
    document.getElementById('chaser-a').textContent = `${chaserA.toFixed(3)} R⊕`;
    document.getElementById('chaser-period').textContent = `${chaserPeriod.toFixed(2)} TU`;
    document.getElementById('chaser-speed').textContent = `${chaserState.speed.toFixed(3)} VU`;
  }
  document.getElementById('chaser-e').textContent = chaserE.toFixed(3);
  
  // Target parameters
  const [targetA, targetE] = targetElements;
  const targetPeriod = 2 * Math.PI * Math.sqrt(targetA * targetA * targetA / MU);
  
  if (params.realWorldUnits) {
    document.getElementById('target-a').textContent = `${(targetA * EARTH_RADIUS_KM).toFixed(0)} km`;
    document.getElementById('target-period').textContent = `${(targetPeriod * TU_TO_SECONDS / 60).toFixed(1)} min`;
  } else {
    document.getElementById('target-a').textContent = `${targetA.toFixed(3)} R⊕`;
    document.getElementById('target-period').textContent = `${targetPeriod.toFixed(2)} TU`;
  }
  document.getElementById('target-e').textContent = targetE.toFixed(3);
  
  // Phase angle (same in both unit systems)
  const phaseAngle = computePhaseAngle(chaserElements, targetElements);
  document.getElementById('phase-angle').textContent = `${(phaseAngle * 180 / Math.PI).toFixed(1)}°`;
  
  // Relative motion
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
  
  // Closest approach prediction
  const ca = predictClosestApproach(chaserElements, targetElements);
  if (params.realWorldUnits) {
    document.getElementById('time-to-ca').textContent =
      ca.timeToCA > 0 ? `${(ca.timeToCA * TU_TO_SECONDS / 60).toFixed(1)} min` : '-- min';
    document.getElementById('min-range').textContent = `${(ca.minRange * EARTH_RADIUS_KM).toFixed(1)} km`;
  } else {
    document.getElementById('time-to-ca').textContent =
      ca.timeToCA > 0 ? `${ca.timeToCA.toFixed(1)} TU` : '-- TU';
    document.getElementById('min-range').textContent = `${ca.minRange.toFixed(3)} R⊕`;
  }

  // Status
  const mode = params.playing ? 'Running' : 'Paused';
  if (params.realWorldUnits) {
    document.getElementById('orbit-status').textContent =
      `${mode} | Time: ${(time * TU_TO_SECONDS / 60).toFixed(1)} min | Range: ${(range * EARTH_RADIUS_KM).toFixed(1)} km`;
  } else {
    document.getElementById('orbit-status').textContent =
      `${mode} | Time: ${time.toFixed(1)} TU | Range: ${range.toFixed(3)} R⊕`;
  }
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

// Create a small colored marker sphere
function createMarker(color = 0x00e5ff, size = 0.035) {
  const geo = new THREE.SphereGeometry(size, 16, 16);
  const mat = new THREE.MeshPhongMaterial({ color, emissive: 0x000000, shininess: 80, specular: 0x444444 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

// Make a simple text sprite (canvas-based) so it always faces camera
function makeTextSprite(text, color = '#e5e7eb', fontSize = 48) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const pad = 16;
  ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fontSize + pad * 2;
  canvas.width = w; canvas.height = h;
  // background glow
  const grd = ctx.createLinearGradient(0,0,w,h);
  grd.addColorStop(0, 'rgba(30,41,59,0.8)'); grd.addColorStop(1, 'rgba(15,23,42,0.8)');
  ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = 'rgba(59,130,246,0.6)'; ctx.lineWidth = 2; ctx.strokeRect(1,1,w-2,h-2);
  // text
  ctx.font = `bold ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`;
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText(text, w/2, h/2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4; texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  const scale = 0.45; // world units scale
  sprite.scale.set(canvas.width / 200 * scale, canvas.height / 200 * scale, 1);
  sprite.userData.canvasTexture = texture;
  sprite.renderOrder = 999;
  return sprite;
}

// Position vector for a given (a, e, omega) at specified true anomaly nu (z=0 plane)
function positionAtTrueAnomaly(a, e, omega, nu) {
  const r = a * (1 - e * e) / (1 + e * Math.cos(nu));
  const ang = omega + nu;
  return new THREE.Vector3(r * Math.cos(ang), r * Math.sin(ang), 0);
}

// Create burn arrow indicator
function createBurnArrow(color = 0x22c55e, size = 0.08) {
  const group = new THREE.Group();
  
  // Arrow shaft
  const shaftGeometry = new THREE.CylinderGeometry(0.008, 0.008, size, 8);
  const shaftMaterial = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
  const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
  shaft.rotation.z = Math.PI / 2; // Point right initially
  group.add(shaft);
  
  // Arrow head
  const headGeometry = new THREE.ConeGeometry(0.02, 0.04, 8);
  const head = new THREE.Mesh(headGeometry, shaftMaterial);
  head.position.x = size / 2 + 0.02;
  head.rotation.z = -Math.PI / 2; // Point right
  group.add(head);
  
  return group;
}

// Update ghost burn arrows visibility and positioning
function updateGhostBurnArrows() {
  // Return early if arrows haven't been created yet
  if (!periBurnArrow || !apoBurnArrow) return;
  
  const showArrows = (currentScenario === 'hohmann');
  
  periBurnArrow.visible = showArrows;
  apoBurnArrow.visible = showArrows;
  
  if (showArrows) {
    const [a, e, omega] = chaserElements;
    
    // Position arrows at periapsis and apoapsis
    const periPos = positionAtTrueAnomaly(a, e, omega, 0);
    const apoPos = positionAtTrueAnomaly(a, e, omega, Math.PI);
    
    periBurnArrow.position.copy(periPos);
    apoBurnArrow.position.copy(apoPos);
    
    // Orient arrows tangentially (prograde direction)
    const periTangent = Math.atan2(periPos.y, periPos.x) + Math.PI/2;
    const apoTangent = Math.atan2(apoPos.y, apoPos.x) + Math.PI/2;
    
    periBurnArrow.rotation.z = periTangent;
    apoBurnArrow.rotation.z = apoTangent;
    
    // Animate the arrows
    const pulse = 0.8 + 0.2 * Math.sin(time * 4);
    periBurnArrow.scale.setScalar(pulse);
    apoBurnArrow.scale.setScalar(pulse);
  }
}

// Update periapsis/apoapsis markers (for chaser)
function updatePAOMarkers() {
  const [a, e, omega] = chaserElements;
  const periPos = positionAtTrueAnomaly(a, e, omega, 0);
  const apoPos  = positionAtTrueAnomaly(a, e, omega, Math.PI);
  periMarker.position.copy(periPos);
  apoMarker.position.copy(apoPos);
  // Offset labels slightly outward
  periLabel.position.copy(periPos.clone().multiplyScalar(1.06));
  apoLabel.position.copy(apoPos.clone().multiplyScalar(1.06));
}

// Wrap angle to [-π, π]
function wrapPi(theta) {
  while (theta > Math.PI) theta -= 2*Math.PI;
  while (theta < -Math.PI) theta += 2*Math.PI;
  return theta;
}

// Desired target lead angle (radians) for Hohmann-style transfer between *nearly circular* orbits
// Positive = target ahead of chaser at departure
function desiredPhaseHohmann(a1, a2) {
  if (a1 <= 0 || a2 <= 0) return null;
  // transfer time = π * sqrt( ((a1+a2)/2)^3 / μ ), μ = 1
  const tTrans = Math.PI * Math.sqrt(Math.pow((a1 + a2)/2, 3));
  const n2 = Math.sqrt(1 / Math.pow(a2, 3)); // mean motion of target
  // Lower -> Higher: φ = π - n2*tTrans (target should lead by φ)
  // Higher -> Lower: same formula still yields correct sign; interpret positive as "target ahead"
  const phi = Math.PI - n2 * tTrans;
  return wrapPi(phi);
}

// Update gauge UI; returns readiness boolean
function updatePhaseGauge() {
  const [a1, e1] = chaserElements;
  const [a2, e2] = targetElements;

  // Current phase (target relative to chaser)
  const phase = computePhaseAngle(chaserElements, targetElements); // 0..2π
  const phaseSigned = wrapPi(phase); // -π..π

  // Show current
  document.getElementById('phase-current').textContent = `${(phase * 180/Math.PI).toFixed(1)}°`;

  // Only meaningful for near-circular orbits
  if (e1 > 0.05 || e2 > 0.05) {
    document.getElementById('phase-desired').textContent = '— (non-circular)';
    document.getElementById('phase-error').textContent = '—';
    document.getElementById('phase-status').textContent = 'N/A for eccentric orbits';
    document.getElementById('phase-status').className = 'phase-status na';
    document.getElementById('phase-fill').style.width = '0%';
    return false;
  }

  const phi = desiredPhaseHohmann(a1, a2);
  if (phi === null) {
    document.getElementById('phase-desired').textContent = '—';
    document.getElementById('phase-error').textContent = '—';
    document.getElementById('phase-status').textContent = 'N/A';
    document.getElementById('phase-status').className = 'phase-status na';
    document.getElementById('phase-fill').style.width = '0%';
    return false;
  }

  // desired lead (signed): positive = target ahead; negative = target behind
  const desiredDeg = phi * 180/Math.PI;
  document.getElementById('phase-desired').textContent =
    `${desiredDeg >= 0 ? '' : '−'}${Math.abs(desiredDeg).toFixed(1)}° ${desiredDeg >= 0 ? '(ahead)' : '(behind)'}`;

  // Error: difference between current phase and desired lead
  const err = wrapPi(phaseSigned - phi);
  const errDeg = err * 180/Math.PI;
  document.getElementById('phase-error').textContent = `${errDeg >= 0 ? '' : '−'}${Math.abs(errDeg).toFixed(1)}°`;

  // Bar shows "how close" (0° = full bar)
  const tol = 5; // degrees
  const closeness = Math.max(0, 1 - Math.min(Math.abs(errDeg)/90, 1)); // crude visualization
  document.getElementById('phase-fill').style.width = `${(closeness*100).toFixed(0)}%`;

  const ready = Math.abs(errDeg) <= tol;
  const statusEl = document.getElementById('phase-status');
  if (ready) {
    statusEl.textContent = `READY (|error| ≤ ${tol}°)`;
    statusEl.className = 'phase-status ready';
  } else {
    statusEl.textContent = `WAIT (need |error| ≤ ${tol}°)`;
    statusEl.className = 'phase-status wait';
  }
  return ready;
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
  
  // --- Periapsis / Apoapsis markers & labels for the chaser ---
  periMarker = createMarker(0x3b82f6, 0.04);   // blue-ish
  apoMarker  = createMarker(0xa855f7, 0.04);   // purple-ish
  scene.add(periMarker, apoMarker);

  periLabel = makeTextSprite('Periapsis', '#bfdbfe', 48);
  apoLabel  = makeTextSprite('Apoapsis',  '#e9d5ff', 48);
  periLabel.className = 'sprite-label';
  apoLabel.className  = 'sprite-label';
  scene.add(periLabel, apoLabel);

  // Position them once at startup
  updatePAOMarkers();
  
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
  
  // --- Ghost burn arrows for Hohmann guidance ---
  periBurnArrow = createBurnArrow(0x22c55e, 0.12); // Green prograde arrow
  apoBurnArrow = createBurnArrow(0x22c55e, 0.12);  // Green prograde arrow
  periBurnArrow.visible = false; // Initially hidden
  apoBurnArrow.visible = false;
  scene.add(periBurnArrow, apoBurnArrow);
  
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
  updatePAOMarkers();
  updatePhaseGauge();
  currentScenario = null; // Reset scenario
  updateGhostBurnArrows();
}

// Scenario presets with detailed setups
function loadScenario(scenario) {
  switch (scenario) {
    case 'basic':
      // Basic Phasing: Chaser starts behind target in same circular orbit
      // Goal: Use retrograde burn to lower orbit and catch up
      chaserElements = [1.3, 0.0, 0.0, -Math.PI/3]; // 60° behind
      targetElements = [1.3, 0.0, 0.0, 0.0];
      currentScenario = 'basic';
      document.getElementById('orbit-status').textContent =
        'Basic Phasing: Try a -V burn to lower orbit and catch up to target';
      break;
      
    case 'hohmann':
      // Hohmann Transfer: Chaser in lower orbit, target in higher orbit
      // Goal: Execute two-burn transfer maneuver
      chaserElements = [1.2, 0.0, 0.0, 0.0]; // Lower orbit
      targetElements = [1.4, 0.0, 0.0, Math.PI]; // Higher orbit, opposite side
      currentScenario = 'hohmann';
      document.getElementById('orbit-status').textContent =
        'Hohmann Transfer: Use +V at periapsis, then +V again at apoapsis to circularize';
      break;
      
    case 'rendezvous':
      // R-bar Approach: Close proximity with slight eccentricity
      // Goal: Use small radial burns for final approach
      chaserElements = [1.295, 0.02, 0.0, Math.PI + Math.PI/12]; // Slightly elliptical, near target
      targetElements = [1.3, 0.0, 0.0, 0.0];
      currentScenario = 'rendezvous';
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
  updatePAOMarkers();
  updatePhaseGauge();
  updateGhostBurnArrows();
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
  dvBudget += deltaV.length();
  
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
  const button = document.getElementById(`burn-${direction}`);
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
  
  // Recompute line distances so dashes render correctly after updates
  if (ghostTrail && ghostTrail.computeLineDistances) {
    ghostTrail.computeLineDistances();
  }
}

// Educational callouts for counter-intuitive moments
function showEducationalCallout(direction, chaserState, elements) {
  const [a, e, omega, nu] = elements;
  const r = chaserState.r;
  
  // Determine orbital position relative to periapsis/apoapsis
  const periapsisR = a * (1 - e);
  const apoapsisR = a * (1 + e);
  const nearPeriapsis = Math.abs(r - periapsisR) < 0.1 * a;
  const nearApoapsis = Math.abs(r - apoapsisR) < 0.1 * a;
  
  let message = '';
  
  if (direction === 'prograde') {
    if (nearPeriapsis) {
      message = '🚀 Apoapsis ↑, current speed ↑ (instant), average speed ↓ after you reach apoapsis';
    } else if (nearApoapsis) {
      message = '🌍 Periapsis ↑, current speed ↑ (instant), you\'re now in a higher, slower orbit';
    } else {
      message = '⬆️ Prograde burn raises opposite side of orbit - energy increases but effects are delayed';
    }
  } else if (direction === 'retrograde') {
    if (nearPeriapsis) {
      message = '⬇️ Apoapsis ↓, current speed ↓ (instant), but you\'ll be faster on average in this lower orbit';
    } else if (nearApoapsis) {
      message = '🎯 Periapsis ↓, dropping to a lower, faster orbit - perfect for catching up';
    } else {
      message = '🔻 Retrograde burn lowers opposite side - less energy means faster average speed';
    }
  } else if (direction === 'radial-out') {
    message = '📡 Radial-out burn: raising periapsis while lowering apoapsis - circularizing from below';
  } else if (direction === 'radial-in') {
    message = '🎯 Radial-in burn: lowering periapsis while raising apoapsis - circularizing from above';
  }
  
  if (message) {
    showToast(message);
  }
}

// Show toast message
let currentToast = null;
function showToast(message) {
  // Remove existing toast
  if (currentToast) {
    currentToast.remove();
  }
  
  // Create new toast
  currentToast = document.createElement('div');
  currentToast.className = 'toast';
  currentToast.innerHTML = `<span class="toast-icon">💡</span>${message}`;
  document.body.appendChild(currentToast);
  
  // Show animation
  setTimeout(() => {
    currentToast.classList.add('show');
  }, 50);
  
  // Auto-hide after 4 seconds
  setTimeout(() => {
    if (currentToast) {
      currentToast.classList.remove('show');
      setTimeout(() => {
        if (currentToast) {
          currentToast.remove();
          currentToast = null;
        }
      }, 400);
    }
  }, 4000);
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

document.getElementById('real-world-units').addEventListener('change', (e) => {
  params.realWorldUnits = e.target.checked;
  updateHUD();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Don't interfere if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      document.getElementById('orbit-play-pause').click();
      break;
    case '[':
      e.preventDefault();
      const timeScale = Math.max(0.1, params.timeScale - 0.1);
      document.getElementById('time-scale').value = timeScale;
      document.getElementById('time-scale').dispatchEvent(new Event('input'));
      break;
    case ']':
      e.preventDefault();
      const timeScaleUp = Math.min(10, params.timeScale + 0.1);
      document.getElementById('time-scale').value = timeScaleUp;
      document.getElementById('time-scale').dispatchEvent(new Event('input'));
      break;
    case 'z':
      e.preventDefault();
      executeBurn('prograde');
      break;
    case 'x':
      e.preventDefault();
      executeBurn('retrograde');
      break;
    case 'c':
      e.preventDefault();
      executeBurn('radial-out');
      break;
    case 'v':
      e.preventDefault();
      executeBurn('radial-in');
      break;
    case 'r':
      e.preventDefault();
      document.getElementById('orbit-reset').click();
      break;
    case '?':
    case 'h':
      e.preventDefault();
      toggleKeyboardHelp();
      break;
  }
});

// Show/hide keyboard shortcuts help
let keyboardHelpVisible = false;
function toggleKeyboardHelp() {
  const helpDiv = document.getElementById('keyboard-help');
  if (helpDiv) {
    keyboardHelpVisible = !keyboardHelpVisible;
    helpDiv.classList.toggle('show', keyboardHelpVisible);
  }
}

// Add keyboard shortcuts helper to page
document.body.insertAdjacentHTML('beforeend', `
<div id="keyboard-help" class="keyboard-shortcuts">
  <h5>Keyboard Shortcuts</h5>
  <div><kbd>Space</kbd>Play/Pause</div>
  <div><kbd>[</kbd><kbd>]</kbd>Time Scale</div>
  <div><kbd>Z</kbd>+V (Prograde)</div>
  <div><kbd>X</kbd>-V (Retrograde)</div>
  <div><kbd>C</kbd>+R (Radial Out)</div>
  <div><kbd>V</kbd>-R (Radial In)</div>
  <div><kbd>R</kbd>Reset</div>
  <div><kbd>?</kbd>Toggle Help</div>
</div>
`);

// Initialize
initThree();
animate();
</script>