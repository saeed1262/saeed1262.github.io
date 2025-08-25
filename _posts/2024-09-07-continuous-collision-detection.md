---
layout: post
title: "PID Controllers for Humans"
date: 2024-09-07
description: Understanding PID control through an interactive spacecraft docking simulation. Tune P, I, and D parameters to master the art of feedback control.
tags: control-systems pid simulation spacecraft
categories: blog
---

## The Invisible Hand of Control

PID controllers are everywhere. They keep your drone hovering steady in windy conditions, smooth out your camera's autofocus, and fire the precise thrusters that guide spacecraft to dock with the International Space Station. Yet for most people, PID remains a mysterious black box of mathematical coefficients.

What if we could see PID in action? What if we could *feel* how each parameter shapes the behavior of a control system?

## The Mathematical Foundation

A PID controller combines three fundamental control strategies into a single, elegant algorithm:

$$u(t) = K_p e(t) + K_i \int_0^t e(\tau) d\tau + K_d \frac{d}{dt}e(t)$$

Where:
- **u(t)** is the control output
- **e(t) = r(t) - y(t)** is the error between reference and actual values
- $$K_p, K_i, K_d$$ are the proportional, integral, and derivative gains

This deceptively simple equation powers everything from the thermostat in your home to the guidance systems of interplanetary spacecraft.

## The Challenge: Docking in Space

Imagine you're piloting a spacecraft approaching a space station. You need to bring your velocity to zero at exactly the right position - overshoot and you crash, undershoot and you drift away. This is a classic control problem that demonstrates the essential challenge of feedback control: how do you smoothly guide a dynamic system to a desired state?

The physics are unforgiving. In space, there's no friction to naturally slow you down. Every thrust burns precious fuel. The slightest miscalculation can send you spinning into the void. This is where PID control shines - it provides a systematic, mathematically grounded approach to this complex problem.

## Interactive Spacecraft Docking Simulator

Try adjusting the PID parameters below. Watch how **P** (Proportional) responds to current error, **I** (Integral) eliminates steady-state error, and **D** (Derivative) dampens oscillations. Toggle wind gusts to see how the controller adapts to disturbances.

<style>
/* Enhanced PID Demo Styles with WCAG Compliance */
.pid-demo-container {
  max-width: 1200px;
  margin: 30px auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--global-card-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--global-box-shadow-lg);
  border: 1px solid var(--global-border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.control-panel {
  background-color: var(--global-bg-color-secondary);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: var(--global-box-shadow-sm);
  border: 1px solid var(--global-border-color);
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 20px;
}

.control-group {
  background-color: var(--global-card-bg-color);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--global-border-color);
  box-shadow: var(--global-box-shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.control-group:hover {
  border-color: var(--global-theme-color);
  box-shadow: var(--global-box-shadow-md);
  transform: translateY(-2px);
  background-color: var(--global-card-hover-bg);
}

.control-label {
  font-weight: 700;
  font-size: 18px;
  color: var(--global-heading-color);
  margin-bottom: 12px;
  display: block;
  text-shadow: none;
  letter-spacing: 0.5px;
}

.control-value {
  background: var(--global-theme-color);
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 16px;
  min-width: 70px;
  display: inline-block;
  text-align: center;
  margin-left: 12px;
  box-shadow: var(--global-box-shadow-sm);
  transition: all 0.2s ease;
}

.control-description {
  color: var(--global-text-color-light);
  font-size: 14px;
  margin-top: 8px;
  font-weight: 500;
}

.pid-slider {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: var(--global-border-color);
  outline: none;
  margin-top: 12px;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  transition: background 0.3s ease;
}

.pid-slider:focus {
  background: var(--global-text-color-light);
  box-shadow: 0 0 0 3px rgba(var(--global-theme-color-rgb), 0.25);
}

.pid-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--global-theme-color);
  cursor: pointer;
  border: 4px solid var(--global-card-bg-color);
  box-shadow: var(--global-box-shadow-md);
  transition: all 0.2s ease;
}

.pid-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: var(--global-box-shadow-lg);
  background: var(--global-theme-color-dark);
}

.pid-slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--global-theme-color);
  cursor: pointer;
  border: 4px solid var(--global-card-bg-color);
  box-shadow: var(--global-box-shadow-md);
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.reset-btn {
  background: var(--global-gradient-primary);
  color: #FFFFFF;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--global-box-shadow-md);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.reset-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--global-box-shadow-lg);
}

.preset-btn {
  background-color: var(--global-card-bg-color);
  color: var(--global-text-color);
  border: 2px solid var(--global-border-color);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--global-box-shadow-sm);
}

.preset-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--global-box-shadow-md);
  background: var(--global-gradient-primary);
  color: #FFFFFF;
  border-color: transparent;
}

.wind-toggle-container {
  display: flex;
  align-items: center;
  background-color: var(--global-card-bg-color);
  padding: 14px 24px;
  border-radius: 8px;
  border: 1px solid var(--global-border-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wind-toggle-container:hover {
  border-color: var(--global-accent-color);
  background-color: var(--global-card-hover-bg);
  transform: translateY(-1px);
}

.wind-checkbox {
  width: 22px;
  height: 22px;
  margin-right: 12px;
  cursor: pointer;
}

.wind-label {
  font-weight: 600;
  color: var(--global-text-color);
  font-size: 16px;
  cursor: pointer;
  margin: 0;
}

.visualization-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.simulation-container {
  height: 350px;
  background-color: var(--global-bg-color-secondary);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--global-border-color);
  box-shadow: var(--global-box-shadow-sm);
}

.plots-container {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
  height: 350px;
}

.error-plot-container, .control-plot-container {
  background-color: var(--global-card-bg-color);
  border: 1px solid var(--global-border-color);
  border-radius: 8px;
  box-shadow: var(--global-box-shadow-sm);
  position: relative;
}

.plot-title {
  position: absolute;
  top: 8px;
  left: 12px;
  font-weight: 700;
  font-size: 14px;
  color: var(--global-heading-color);
  z-index: 10;
  background-color: var(--global-bg-color-secondary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--global-border-color);
}

.status-display {
  background-color: var(--global-bg-color-secondary);
  padding: 16px;
  border-radius: 8px;
  margin-top: 16px;
  border: 1px solid var(--global-border-color);
  box-shadow: var(--global-box-shadow-sm);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  text-align: center;
}

.status-item {
  background-color: var(--global-card-bg-color);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--global-border-color);
}

.status-label {
  font-weight: 600;
  color: var(--global-text-color-light);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-weight: 700;
  color: var(--global-heading-color);
  font-size: 18px;
  margin-top: 4px;
}

.preset-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 16px;
}

.comparison-mode {
  background: rgba(var(--global-accent-color-rgb), 0.1);
  border: 2px solid var(--global-accent-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .visualization-grid {
    grid-template-columns: 1fr;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
  }
  
  .simulation-container,
  .plots-container {
    height: 300px;
  }
  
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Animation effects */
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.loading {
  animation: pulse 2s infinite;
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(var(--global-theme-color-rgb), 0.4); }
  50% { box-shadow: 0 0 20px rgba(var(--global-theme-color-rgb), 0.7); }
  100% { box-shadow: 0 0 5px rgba(var(--global-theme-color-rgb), 0.4); }
}

.active-control {
  animation: glow 2s infinite;
}
</style>

<div class="pid-demo-container" id="pid-demo">
  <div class="control-panel">
    <div class="control-grid">
      <div class="control-group" id="p-control">
        <label class="control-label">
          P (Proportional)
          <span class="control-value" id="p-value">1.0</span>
        </label>
        <div class="control-description">Current error response strength</div>
        <input type="range" class="pid-slider" id="p-slider" min="0" max="5" step="0.1" value="1.0" aria-label="Proportional gain control">
      </div>
      <div class="control-group" id="i-control">
        <label class="control-label">
          I (Integral)
          <span class="control-value" id="i-value">0.1</span>
        </label>
        <div class="control-description">Accumulated error correction</div>
        <input type="range" class="pid-slider" id="i-slider" min="0" max="2" step="0.05" value="0.1" aria-label="Integral gain control">
      </div>
      <div class="control-group" id="d-control">
        <label class="control-label">
          D (Derivative)
          <span class="control-value" id="d-value">0.3</span>
        </label>
        <div class="control-description">Error change rate damping</div>
        <input type="range" class="pid-slider" id="d-slider" min="0" max="2" step="0.05" value="0.3" aria-label="Derivative gain control">
      </div>
    </div>
    
    <div class="control-buttons">
      <button class="reset-btn" id="reset-btn" aria-label="Reset simulation">🔄 Reset</button>
      <button class="preset-btn" id="oscillating-btn">Oscillating</button>
      <button class="preset-btn" id="overdamped-btn">Overdamped</button>
      <button class="preset-btn" id="critically-damped-btn">Critical</button>
      <label class="wind-toggle-container">
        <input type="checkbox" class="wind-checkbox" id="wind-toggle" aria-label="Toggle wind disturbances">
        <span class="wind-label">🌪️ Disturbances</span>
      </label>
    </div>
  </div>
  
  <div class="visualization-grid">
    <div class="simulation-container" id="simulation-container">
      <canvas id="spacecraft-canvas" style="width: 100%; height: 100%;"></canvas>
    </div>
    <div class="plots-container">
      <div class="error-plot-container" id="error-plot">
        <div class="plot-title">Position Error Over Time</div>
      </div>
      <div class="control-plot-container" id="control-plot">
        <div class="plot-title">Control Signal (Thrust)</div>
      </div>
    </div>
  </div>
  
  <div class="status-display">
    <div class="status-grid">
      <div class="status-item">
        <div class="status-label">Position</div>
        <div class="status-value" id="position-value">-8.00</div>
      </div>
      <div class="status-item">
        <div class="status-label">Velocity</div>
        <div class="status-value" id="velocity-value">0.00</div>
      </div>
      <div class="status-item">
        <div class="status-label">Error</div>
        <div class="status-value" id="error-value">8.00</div>
      </div>
      <div class="status-item">
        <div class="status-label">Thrust</div>
        <div class="status-value" id="thrust-value">0.00</div>
      </div>
      <div class="status-item">
        <div class="status-label">Integral</div>
        <div class="status-value" id="integral-value">0.00</div>
      </div>
      <div class="status-item">
        <div class="status-label">Derivative</div>
        <div class="status-value" id="derivative-value">0.00</div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js"></script>

{% raw %}
<script>
// Enhanced PID Controller with detailed component tracking
class PIDController {
  constructor(kp = 1.0, ki = 0.1, kd = 0.3) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
    this.integral = 0;
    this.previousError = 0;
    this.dt = 0.016; // ~60fps
    this.maxIntegral = 10; // Prevent integral windup
    
    // Track individual components for visualization
    this.pComponent = 0;
    this.iComponent = 0;
    this.dComponent = 0;
  }
  
  update(error) {
    // Proportional component
    this.pComponent = this.kp * error;
    
    // Integral component with windup protection
    this.integral += error * this.dt;
    this.integral = Math.max(-this.maxIntegral, Math.min(this.maxIntegral, this.integral));
    this.iComponent = this.ki * this.integral;
    
    // Derivative component with smoothing
    const derivative = (error - this.previousError) / this.dt;
    this.dComponent = this.kd * derivative;
    
    // Total PID output
    const output = this.pComponent + this.iComponent + this.dComponent;
    
    this.previousError = error;
    return output;
  }
  
  reset() {
    this.integral = 0;
    this.previousError = 0;
    this.pComponent = 0;
    this.iComponent = 0;
    this.dComponent = 0;
  }
  
  setGains(kp, ki, kd) {
    this.kp = kp;
    this.ki = ki;
    this.kd = kd;
  }
}

// Enhanced simulation state with detailed tracking
const sim = {
  position: -8,
  velocity: 0,
  target: 0,
  pid: new PIDController(),
  time: 0,
  errorHistory: [],
  controlHistory: [],
  positionHistory: [],
  velocityHistory: [],
  windEnabled: false,
  maxHistory: 400,
  canvas: null,
  ctx: null,
  animationId: null
};

// Preset configurations to demonstrate different behaviors
const presets = {
  oscillating: { p: 3.0, i: 0.1, d: 0.1 },
  overdamped: { p: 0.5, i: 0.2, d: 1.5 },
  criticallyDamped: { p: 1.5, i: 0.3, d: 0.8 }
};

// Initialize enhanced 2D simulation
function initEnhanced2DSimulation() {
  const container = document.getElementById('simulation-container');
  sim.canvas = document.getElementById('spacecraft-canvas');
  sim.ctx = sim.canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    sim.canvas.width = rect.width;
    sim.canvas.height = rect.height;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Start animation
  animate2D();
}

function animate2D() {
  // Update physics
  const error = sim.target - sim.position;
  const windForce = sim.windEnabled ? (Math.random() - 0.5) * 0.3 : 0;
  const controlSignal = sim.pid.update(error);
  const thrust = Math.max(-2, Math.min(2, controlSignal));
  
  // Physics integration
  sim.velocity += (thrust + windForce) * 0.016;
  sim.velocity *= 0.98; // damping
  sim.position += sim.velocity * 0.016;
  sim.time += 0.016;
  
  // Record history
  sim.errorHistory.push({ time: sim.time, value: Math.abs(error) });
  sim.controlHistory.push({ time: sim.time, value: thrust });
  sim.positionHistory.push({ time: sim.time, value: sim.position });
  sim.velocityHistory.push({ time: sim.time, value: sim.velocity });
  
  // Limit history
  if (sim.errorHistory.length > sim.maxHistory) {
    sim.errorHistory.shift();
    sim.controlHistory.shift();
    sim.positionHistory.shift();
    sim.velocityHistory.shift();
  }
  
  // Render simulation
  render2D();
  
  // Update status display
  updateStatusDisplay(error, thrust);
  
  sim.animationId = requestAnimationFrame(animate2D);
}

function render2D() {
  const canvas = sim.canvas;
  const ctx = sim.ctx;
  
  // Get CSS custom properties for consistent theming
  const computedStyle = getComputedStyle(document.documentElement);
  const bgColor = computedStyle.getPropertyValue('--global-bg-color-secondary').trim();
  const borderColor = computedStyle.getPropertyValue('--global-border-color').trim();
  const textColor = computedStyle.getPropertyValue('--global-text-color-light').trim();
  const themeColor = computedStyle.getPropertyValue('--global-theme-color').trim();
  const headingColor = computedStyle.getPropertyValue('--global-heading-color').trim();
  
  // Clear canvas with theme background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid for reference
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const scale = Math.min(canvas.width, canvas.height) / 20;
  
  // Draw horizontal position line
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, centerY);
  ctx.lineTo(canvas.width - 50, centerY);
  ctx.stroke();
  
  // Draw position scale markings
  ctx.fillStyle = textColor;
  ctx.font = '12px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  for (let i = -10; i <= 10; i += 2) {
    const x = centerX + i * scale;
    if (x >= 50 && x <= canvas.width - 50) {
      ctx.strokeStyle = textColor;
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
      ctx.fillText(i.toString(), x, centerY + 20);
    }
  }
  
  // Draw target position (setpoint)
  ctx.fillStyle = '#ff6b6b';
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 40);
  ctx.lineTo(centerX, centerY + 40);
  ctx.stroke();
  
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 14px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TARGET', centerX, centerY - 50);
  ctx.fillText('(Setpoint = 0)', centerX, centerY + 60);
  
  // Draw current position
  const currentX = centerX + sim.position * scale;
  if (currentX >= 30 && currentX <= canvas.width - 30) {
    // Position marker (circle)
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.arc(currentX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Position indicator line
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(currentX, centerY - 35);
    ctx.lineTo(currentX, centerY + 35);
    ctx.stroke();
    
    // Position label
    ctx.fillStyle = themeColor;
    ctx.font = 'bold 14px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CURRENT', currentX, centerY - 70);
    ctx.fillText(`Position: ${sim.position.toFixed(2)}`, currentX, centerY + 80);
  }
  
  // Error visualization (distance between target and current)
  const error = sim.target - sim.position;
  if (Math.abs(error) > 0.1) {
    const startX = Math.min(centerX, currentX);
    const endX = Math.max(centerX, currentX);
    const width = endX - startX;
    
    // Error area
    ctx.fillStyle = 'rgba(255, 212, 59, 0.4)';
    ctx.fillRect(startX, centerY - 12, width, 24);
    
    // Error border
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, centerY - 12, width, 24);
    
    // Error value label
    ctx.fillStyle = headingColor;
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Error: ${error.toFixed(2)}`, (startX + endX) / 2, centerY - 20);
  }
  
  // Velocity vector (shows system momentum)
  if (Math.abs(sim.velocity) > 0.01) {
    ctx.strokeStyle = '#51cf66';
    ctx.fillStyle = '#51cf66';
    ctx.lineWidth = 4;
    
    const velEndX = currentX + sim.velocity * 200;
    const clampedVelEndX = Math.max(30, Math.min(canvas.width - 30, velEndX));
    
    // Velocity arrow
    ctx.beginPath();
    ctx.moveTo(currentX, centerY - 100);
    ctx.lineTo(clampedVelEndX, centerY - 100);
    ctx.stroke();
    
    // Arrow head
    if (Math.abs(sim.velocity) > 0.05) {
      const direction = sim.velocity > 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(clampedVelEndX, centerY - 100);
      ctx.lineTo(clampedVelEndX - 8 * direction, centerY - 105);
      ctx.lineTo(clampedVelEndX - 8 * direction, centerY - 95);
      ctx.fill();
    }
    
    // Velocity label
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Velocity: ${sim.velocity.toFixed(3)}`, currentX, centerY - 115);
  }
  
  // Control output visualization (thrust/force applied)
  const thrust = sim.controlHistory[sim.controlHistory.length - 1]?.value || 0;
  if (Math.abs(thrust) > 0.01) {
    const barHeight = Math.abs(thrust) * 60;
    const barY = centerY + 120;
    
    // Control signal bar
    ctx.fillStyle = thrust > 0 ? themeColor : '#ff6b6b';
    ctx.fillRect(currentX - 15, barY - (thrust > 0 ? barHeight : 0), 30, barHeight);
    
    // Bar outline
    ctx.strokeStyle = headingColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(currentX - 15, barY - (thrust > 0 ? barHeight : 0), 30, barHeight);
    
    // Control signal label
    ctx.fillStyle = headingColor;
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Control: ${thrust.toFixed(3)}`, currentX, barY + 20);
    ctx.fillText(thrust > 0 ? '(Forward)' : '(Backward)', currentX, barY + 35);
  }
  
  // Success indicator
  const distance = Math.abs(sim.position);
  if (distance < 0.1 && Math.abs(sim.velocity) < 0.05) {
    ctx.fillStyle = 'rgba(81, 207, 102, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#51cf66';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ TARGET ACHIEVED!', canvas.width/2, 40);
    ctx.fillText('Position and Velocity at Zero', canvas.width/2, 70);
  }
  
  // System diagram labels
  ctx.fillStyle = textColor;
  ctx.font = 'bold 11px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PID Position Control System', 10, 20);
  
  // Legend
  ctx.fillStyle = textColor;
  ctx.font = '10px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  const legendY = canvas.height - 60;
  ctx.fillText('• Theme circle: Current position', 10, legendY);
  ctx.fillText('• Red line: Target setpoint', 10, legendY + 12);
  ctx.fillText('• Yellow area: Position error', 10, legendY + 24);
  ctx.fillText('• Green arrow: Velocity', 10, legendY + 36);
  ctx.fillText('• Theme/Red bar: Control output', 200, legendY + 24);
}

function updateStatusDisplay(error, thrust) {
  document.getElementById('position-value').textContent = sim.position.toFixed(2);
  document.getElementById('velocity-value').textContent = sim.velocity.toFixed(2);
  document.getElementById('error-value').textContent = error.toFixed(2);
  document.getElementById('thrust-value').textContent = thrust.toFixed(2);
  document.getElementById('integral-value').textContent = sim.pid.integral.toFixed(2);
  document.getElementById('derivative-value').textContent = ((error - sim.pid.previousError) / sim.pid.dt).toFixed(2);
}

// Enhanced plotting with D3.js
function updatePlots() {
  updateErrorPlot();
  updateControlPlot();
}

function updateErrorPlot() {
  if (sim.errorHistory.length < 2) return;
  
  const container = document.getElementById('error-plot');
  container.innerHTML = '<div class="plot-title">Position Error Over Time</div>';
  
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  
  if (width <= 0 || height <= 0) return;
  
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const xScale = d3.scaleLinear()
    .domain(d3.extent(sim.errorHistory, d => d.time))
    .range([0, width]);
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(sim.errorHistory, d => d.value) || 1])
    .range([height, 0]);
  
  // Area chart
  const area = d3.area()
    .x(d => xScale(d.time))
    .y0(height)
    .y1(d => yScale(d.value))
    .curve(d3.curveMonotoneX);
  
  g.append("path")
    .datum(sim.errorHistory)
    .attr("fill", "rgba(220, 53, 69, 0.2)")
    .attr("d", area);
  
  // Line chart
  const line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);
  
  g.append("path")
    .datum(sim.errorHistory)
    .attr("fill", "none")
    .attr("stroke", "#dc3545")
    .attr("stroke-width", 2)
    .attr("d", line);
  
  // Axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll("text")
    .style("font-size", "11px");
  
  g.append("g")
    .call(d3.axisLeft(yScale).ticks(4))
    .selectAll("text")
    .style("font-size", "11px");
}

function updateControlPlot() {
  if (sim.controlHistory.length < 2) return;
  
  const container = document.getElementById('control-plot');
  container.innerHTML = '<div class="plot-title">Control Signal (Thrust)</div>';
  
  const margin = { top: 30, right: 20, bottom: 40, left: 50 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  
  if (width <= 0 || height <= 0) return;
  
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
  
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const xScale = d3.scaleLinear()
    .domain(d3.extent(sim.controlHistory, d => d.time))
    .range([0, width]);
  
  const yExtent = d3.extent(sim.controlHistory, d => d.value);
  const yScale = d3.scaleLinear()
    .domain([Math.min(yExtent[0], -0.5), Math.max(yExtent[1], 0.5)])
    .range([height, 0]);
  
  // Zero line
  g.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "#666")
    .attr("stroke-dasharray", "3,3");
  
  // Area chart (positive and negative)
  const area = d3.area()
    .x(d => xScale(d.time))
    .y0(yScale(0))
    .y1(d => yScale(d.value))
    .curve(d3.curveMonotoneX);
  
  g.append("path")
    .datum(sim.controlHistory)
    .attr("fill", "rgba(0, 123, 255, 0.3)")
    .attr("d", area);
  
  // Line chart
  const line = d3.line()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);
  
  g.append("path")
    .datum(sim.controlHistory)
    .attr("fill", "none")
    .attr("stroke", "#007bff")
    .attr("stroke-width", 2)
    .attr("d", line);
  
  // Axes
  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll("text")
    .style("font-size", "11px");
  
  g.append("g")
    .call(d3.axisLeft(yScale).ticks(4))
    .selectAll("text")
    .style("font-size", "11px");
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
  initEnhanced2DSimulation();
  setInterval(updatePlots, 250);
});

// Controls
const pSlider = document.getElementById('p-slider');
const iSlider = document.getElementById('i-slider');
const dSlider = document.getElementById('d-slider');
const pValue = document.getElementById('p-value');
const iValue = document.getElementById('i-value');
const dValue = document.getElementById('d-value');
const resetBtn = document.getElementById('reset-btn');
const windToggle = document.getElementById('wind-toggle');

function updatePID() {
  sim.pid.setGains(
    parseFloat(pSlider.value),
    parseFloat(iSlider.value),
    parseFloat(dSlider.value)
  );
}

function highlightActiveControl(controlId) {
  // Remove active class from all controls
  document.querySelectorAll('.control-group').forEach(el => {
    el.classList.remove('active-control');
  });
  
  // Add active class to current control
  document.getElementById(controlId).classList.add('active-control');
  
  // Remove after 2 seconds
  setTimeout(() => {
    document.getElementById(controlId).classList.remove('active-control');
  }, 2000);
}

pSlider.addEventListener('input', (e) => {
  pValue.textContent = e.target.value;
  updatePID();
  highlightActiveControl('p-control');
});

iSlider.addEventListener('input', (e) => {
  iValue.textContent = e.target.value;
  updatePID();
  highlightActiveControl('i-control');
});

dSlider.addEventListener('input', (e) => {
  dValue.textContent = e.target.value;
  updatePID();
  highlightActiveControl('d-control');
});

resetBtn.addEventListener('click', () => {
  sim.position = -8;
  sim.velocity = 0;
  sim.time = 0;
  sim.errorHistory = [];
  sim.controlHistory = [];
  sim.positionHistory = [];
  sim.velocityHistory = [];
  sim.pid.reset();
});

windToggle.addEventListener('change', (e) => {
  sim.windEnabled = e.target.checked;
});

// Preset buttons
document.getElementById('oscillating-btn').addEventListener('click', () => {
  const preset = presets.oscillating;
  pSlider.value = preset.p;
  iSlider.value = preset.i;
  dSlider.value = preset.d;
  pValue.textContent = preset.p;
  iValue.textContent = preset.i;
  dValue.textContent = preset.d;
  updatePID();
});

document.getElementById('overdamped-btn').addEventListener('click', () => {
  const preset = presets.overdamped;
  pSlider.value = preset.p;
  iSlider.value = preset.i;
  dSlider.value = preset.d;
  pValue.textContent = preset.p;
  iValue.textContent = preset.i;
  dValue.textContent = preset.d;
  updatePID();
});

document.getElementById('critically-damped-btn').addEventListener('click', () => {
  const preset = presets.criticallyDamped;
  pSlider.value = preset.p;
  iSlider.value = preset.i;
  dSlider.value = preset.d;
  pValue.textContent = preset.p;
  iValue.textContent = preset.i;
  dValue.textContent = preset.d;
  updatePID();
});

</script>
{% endraw %}

## Deep Dive: Understanding Each Parameter

### Proportional Control (P): The Immediate Response

The proportional term provides an output that is directly proportional to the current error:

$$u_p(t) = K_p \cdot e(t)$$

**Behavior Characteristics:**
- **Low P gain (< 1.0)**: Sluggish response, slow convergence to target
- **Moderate P gain (1.0-2.0)**: Good balance of speed and stability
- **High P gain (> 3.0)**: Fast response but prone to oscillations and overshoot

The proportional term is like a rubber band - the further you stretch it (larger error), the stronger it pulls back. However, pure proportional control has a fundamental limitation: **steady-state error**. If there's any constant disturbance (like friction or gravity), the system will settle at a position where the P output exactly balances the disturbance, leaving a permanent error.

### Integral Control (I): The Memory Keeper

The integral term accumulates error over time, providing a corrective action based on the history of errors:

$$u_i(t) = K_i \int_0^t e(\tau) d\tau$$

**Key Properties:**
- **Eliminates steady-state error**: By continuously accumulating error, it ensures the system eventually reaches the target
- **Slow response**: Takes time to build up sufficient corrective action
- **Integral windup**: Can become excessively large, causing instability and overshoot

**Integral Windup Prevention:**
```
if (integral > maxIntegral) integral = maxIntegral;
if (integral < -maxIntegral) integral = -maxIntegral;
```

### Derivative Control (D): The Predictor

The derivative term responds to the rate of change of error, providing predictive control:

$$u_d(t) = K_d \frac{d}{dt}e(t)$$

**Benefits:**
- **Damping**: Reduces oscillations and overshoot
- **Anticipatory action**: Responds to trends in error change
- **Stability improvement**: Helps stabilize systems that would otherwise be unstable

**Challenges:**
- **Noise sensitivity**: Amplifies high-frequency noise in the error signal
- **Derivative kick**: Can cause sudden jumps in output when the setpoint changes

## The Mathematics of Stability

The stability of a PID-controlled system can be analyzed using classical control theory. The characteristic equation of a second-order system with PID control is:

$$s^3 + \frac{K_d}{m}s^2 + \frac{K_p}{m}s + \frac{K_i}{m} = 0$$

For stability, all poles must be in the left half-plane. This constrains the relationship between P, I, and D gains.

### Ziegler-Nichols Tuning Method

One of the most famous tuning methods, developed in 1942:

1. **Step 1**: Set I=0, D=0, increase P until the system oscillates
2. **Step 2**: Record the critical gain K_c and oscillation period T_c
3. **Step 3**: Apply the tuning rules:
   - P-only: K_p = 0.5 × K_c
   - PI: K_p = 0.45 × K_c, K_i = 1.2 × K_p / T_c
   - PID: K_p = 0.6 × K_c, K_i = 2 × K_p / T_c, K_d = K_p × T_c / 8

## Modern PID Variants and Enhancements

### Anti-Windup Mechanisms

**Back-calculation method:**
```
if (output > outputMax) {
    integral = integral - (output - outputMax) / Ki;
    output = outputMax;
}
```

**Conditional integration:**
```
if (abs(error) < errorThreshold && abs(output) < outputMax) {
    integral += error * dt;
}
```

### Derivative on Measurement (DoM)

Instead of differentiating the error (which causes derivative kick), differentiate the process variable:

$$u_d(t) = -K_d \frac{d}{dt}y(t)$$

This eliminates derivative kick when the setpoint changes.

### Setpoint Weighting

Allows different responses to setpoint changes vs. disturbances:

$$u(t) = K_p(b \cdot r(t) - y(t)) + K_i \int_0^t e(\tau) d\tau - K_d \frac{d}{dt}y(t)$$

Where b is the setpoint weighting factor (typically 0.5-1.0).

## Real-World Applications and Case Studies

### Case Study 1: Quadrotor Drone Stabilization

Modern quadrotor drones use cascaded PID controllers:

**Attitude Control Loop (Inner):**
- **Input**: Desired vs. actual roll/pitch/yaw angles
- **Output**: Motor thrust commands
- **Typical gains**: Kp=4.0, Ki=0.1, Kd=0.8
- **Update rate**: 1000 Hz

**Position Control Loop (Outer):**
- **Input**: Desired vs. actual position
- **Output**: Attitude commands to inner loop
- **Typical gains**: Kp=1.5, Ki=0.3, Kd=1.2
- **Update rate**: 100 Hz

### Case Study 2: Industrial Temperature Control

A pharmaceutical reactor requires ±0.1°C temperature control:

**System characteristics:**
- **Time constant**: 45 seconds (thermal mass)
- **Dead time**: 8 seconds (sensor delay)
- **Disturbances**: Ambient temperature, cooling water temperature

**PID Configuration:**
- **Kp**: 2.5 (moderate for stability)
- **Ki**: 0.08 (slow integration to prevent overshoot)
- **Kd**: 15.0 (high derivative to counteract thermal lag)
- **Sample time**: 1 second

### Case Study 3: Spacecraft Attitude Control

The International Space Station uses PID control for attitude maintenance:

**Challenges:**
- **Microgravity environment**: No gravitational restoring torque
- **Flexible structure**: Solar panels and modules create structural resonances
- **Fuel conservation**: Minimize thruster usage

**Solution**: Multi-mode PID with gain scheduling
- **Fine pointing mode**: High precision for experiments
- **Coarse pointing mode**: Fuel-efficient for normal operations
- **Maneuver mode**: Fast response for orbit adjustments

## Advanced Topics

### Gain Scheduling

PID gains can be adjusted based on operating conditions:

```javascript
function updateGains(operatingPoint) {
    if (operatingPoint.velocity < 0.1) {
        // Fine control near target
        pid.setGains(1.5, 0.2, 0.8);
    } else {
        // Aggressive control far from target
        pid.setGains(3.0, 0.1, 0.3);
    }
}
```

### Fuzzy PID Control

Combines fuzzy logic with PID control for non-linear systems:

```
IF error is Large AND error_rate is Positive 
THEN Kp is High AND Ki is Low AND Kd is Medium
```

### Model Predictive Control (MPC)

The next evolution beyond PID, MPC optimizes control actions over a prediction horizon:

$$\min_{u} \sum_{k=0}^{N-1} ||y(k+1) - r(k+1)||^2 + \lambda ||u(k)||^2$$

Subject to constraints on inputs and outputs.

## Implementation Best Practices

### 1. Sample Time Selection
- **Rule of thumb**: Sample time should be 1/10 to 1/20 of the dominant time constant
- **Too fast**: Wasted computation, noise amplification
- **Too slow**: Poor performance, potential instability

### 2. Integral Term Management
```javascript
// Reset integral term when switching modes
if (modeChanged) {
    pid.reset();
}

// Limit integral accumulation
const maxIntegral = outputRange / Ki;
integral = Math.max(-maxIntegral, Math.min(maxIntegral, integral));
```

### 3. Derivative Term Filtering
```javascript
// Low-pass filter for derivative term
const alpha = 0.1; // Filter coefficient
derivativeFiltered = alpha * derivative + (1 - alpha) * derivativeFiltered;
```

### 4. Output Saturation Handling
```javascript
let output = pTerm + iTerm + dTerm;
if (output > outputMax) {
    output = outputMax;
    // Back-calculate integral to prevent windup
    iTerm = outputMax - pTerm - dTerm;
    integral = iTerm / Ki;
}
```

## Troubleshooting Common Issues

### Problem: System Oscillates
**Symptoms**: Continuous oscillation around setpoint
**Causes**: 
- P gain too high
- I gain too high
- Insufficient D gain
**Solutions**:
- Reduce P gain by 25%
- Reduce I gain by 50%
- Increase D gain by 25%

### Problem: Slow Response
**Symptoms**: Takes too long to reach setpoint
**Causes**:
- P gain too low
- I gain too low
**Solutions**:
- Increase P gain gradually
- Increase I gain moderately

### Problem: Steady-State Error
**Symptoms**: System settles away from setpoint
**Causes**:
- No integral term (I=0)
- Integral saturation
- Output saturation
**Solutions**:
- Add integral term
- Implement anti-windup
- Check actuator limits

### Problem: Derivative Kick
**Symptoms**: Large output spike when setpoint changes
**Causes**:
- Derivative acting on error instead of measurement
**Solutions**:
- Use derivative-on-measurement
- Add setpoint ramping

## The Future of Control

While PID control remains the workhorse of industrial automation, modern control strategies are emerging:

### Machine Learning Enhanced PID
Neural networks can learn optimal PID gains for different operating conditions:

```python
# Simplified concept
pid_gains = neural_network.predict([
    current_error,
    system_state,
    disturbance_estimate
])
```

### Adaptive Control
Controllers that automatically adjust to changing system dynamics:

```javascript
// Recursive least squares parameter estimation
function updateSystemModel(input, output) {
    // Update internal model of system
    // Adjust PID gains based on new model
}
```

### Digital Twin Integration
Real-time system models that predict optimal control actions:

```javascript
function predictiveControl() {
    const futureStates = digitalTwin.simulate(currentState, proposedActions);
    return optimizeActions(futureStates, objectives);
}
```

## Conclusion

PID control represents one of the most successful engineering solutions ever developed. Its mathematical elegance, practical effectiveness, and broad applicability have made it indispensable across countless industries. From the precision docking of spacecraft to the smooth operation of your car's cruise control, PID controllers quietly work behind the scenes, providing the stable, predictable behavior we've come to expect from modern technology.

The beauty of PID lies not just in its mathematical foundation, but in its intuitive nature - proportional action for immediate response, integral action for long-term accuracy, and derivative action for smooth, stable behavior. These three simple concepts, when properly tuned and combined, can control everything from the temperature in your home to the attitude of satellites in orbit.

As we move toward an increasingly automated future, understanding PID control becomes ever more valuable. Whether you're designing the next generation of autonomous vehicles, developing precision manufacturing equipment, or simply trying to understand how the technology around you works, PID control provides a fundamental framework for thinking about feedback, stability, and control.

The interactive simulation above is just the beginning. Try experimenting with different parameter combinations, observe how each component contributes to the overall behavior, and you'll gain an intuitive understanding of one of engineering's most powerful tools.

