---
layout: post
title: "Energy Drift Playground — Simple Pendulum"
date: 2024-08-24
description: Interactive pendulum simulation comparing numerical integrators.
tags: physics simulation react
categories: blog
---

This post showcases an interactive React playground that compares energy drift across different numerical integrators for a simple pendulum.

## Why energy drift matters

When we simulate physical systems on a computer, tiny numerical errors can accumulate. In conservative systems like a frictionless pendulum, total mechanical energy should remain constant. Poor numerical integrators, however, cause the energy to steadily grow or decay—this is known as *energy drift*. Understanding and controlling this drift is crucial for long-term simulations in fields ranging from orbital mechanics to game physics.

## Four integrators, four behaviors

The playground lets you switch among four time-stepping schemes:

- **Explicit Euler** – easy to implement but notoriously unstable; energy often explodes unless time steps are very small.
- **Symplectic Euler** – a minor tweak that preserves the geometric structure of Hamiltonian systems, keeping energy bounded.
- **Velocity Verlet** – another symplectic method that tends to be more accurate per step than Symplectic Euler.
- **Runge–Kutta 4 (RK4)** – a high-order method that is very accurate locally but does not conserve energy over long simulations.

Watching the energy chart as the pendulum swings makes these characteristics visible at a glance.

## Using the playground

Tweak the initial angle, pendulum length, gravity, damping and time step from the control panel. Each integrator runs in parallel and the chart tracks how far its total energy strays from the starting value. You can pause, resume, or reset the simulation at any time, and choose which integrator's pendulum is rendered in 3D.

The full React component is included below for reference:

```tsx
'use client';
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Html, Grid, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/**
 * Energy Drift Playground — Simple Pendulum
 *
 * Topics: Explicit Euler vs Semi-Implicit (Symplectic) Euler vs Velocity Verlet vs RK4
 * Visuals: 3D pendulum for selected integrator + live energy plot comparing all integrators
 * Stack: react-three-fiber + drei + shadcn/ui + Tailwind + framer-motion
 *
 * Notes:
 * - Uses a fixed-time-step accumulator so visual FPS does not affect physics.
 * - Mass m=1 by default. Length L, gravity g, and damping c are user-controlled.
 * - Energy: E = m g L (1 - cos θ) + 1/2 m (L^2) ω^2. With m=1 -> E = gL (1 - cos θ) + 1/2 (L^2) ω^2.
 * - Damping is off by default (c = 0). For clean energy conservation comparisons, keep c = 0.
 */

// ---------- Math helpers ----------
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function accel(theta, omega, g, L, c) {
  // θ¨ = - (g/L) sin θ - c ω  (c is a simple viscous damping coefficient)
  return - (g / L) * Math.sin(theta) - c * omega;
}

function energy(theta, omega, g, L) {
  // E = gL (1 - cos θ) + 0.5 * (L^2) * ω^2   (m=1)
  return g * L * (1 - Math.cos(theta)) + 0.5 * (L * L) * omega * omega;
}

// ---------- Integrators ----------
const Integrators = {
  euler: {
    name: "Explicit Euler",
    step: (s, h, g, L, c) => {
      // s = {theta, omega}
      const domega = accel(s.theta, s.omega, g, L, c);
      const theta = s.theta + h * s.omega;
      const omega = s.omega + h * domega;
      return { theta, omega };
    },
    color: "#ef4444", // red
  },
  symplectic: {
    name: "Symplectic Euler",
    step: (s, h, g, L, c) => {
      let omega = s.omega + h * accel(s.theta, s.omega, g, L, c);
      let theta = s.theta + h * omega;
      return { theta, omega };
    },
    color: "#22c55e", // green
  },
  verlet: {
    name: "Velocity Verlet",
    step: (s, h, g, L, c) => {
      const a0 = accel(s.theta, s.omega, g, L, c);
      const omegaHalf = s.omega + 0.5 * h * a0;
      const theta = s.theta + h * omegaHalf;
      const a1 = accel(theta, omegaHalf, g, L, c);
      const omega = omegaHalf + 0.5 * h * a1;
      return { theta, omega };
    },
    color: "#3b82f6", // blue
  },
  rk4: {
    name: "RK4",
    step: (s, h, g, L, c) => {
      // State y = [theta, omega]; y' = [omega, accel(theta, omega)]
      const f = (th, om) => [om, accel(th, om, g, L, c)];
      const k1 = f(s.theta, s.omega);
      const k2 = f(s.theta + 0.5 * h * k1[0], s.omega + 0.5 * h * k1[1]);
      const k3 = f(s.theta + 0.5 * h * k2[0], s.omega + 0.5 * h * k2[1]);
      const k4 = f(s.theta + h * k3[0], s.omega + h * k3[1]);
      const theta = s.theta + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      const omega = s.omega + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      return { theta, omega };
    },
    color: "#a855f7", // purple
  },
};

function useSims({ L, g, c, h, theta0, omega0, running, sampleEverySteps = 3, maxSamples = 600 }) {
  /**
   * Manages four simulations in parallel, each with its own state & energy history.
   */
  const simsRef = useRef({});
  const historiesRef = useRef({});
  const tRef = useRef(0);
  const accRef = useRef(0);
  const stepCountRef = useRef(0);

  const reset = React.useCallback(() => {
    tRef.current = 0; accRef.current = 0; stepCountRef.current = 0;
    simsRef.current = Object.fromEntries(
      Object.entries(Integrators).map(([k]) => [k, { theta: theta0, omega: omega0 }])
    );
    historiesRef.current = Object.fromEntries(
      Object.entries(Integrators).map(([k]) => [k, {
        e0: energy(theta0, omega0, g, L),
        e: [{ t: 0, E: energy(theta0, omega0, g, L) }],
        // Store also rel error for quick access
        relErr: 0,
      }])
    );
  }, [L, g, theta0, omega0]);

  useEffect(() => { reset(); }, [reset]);

  useFrame((_, delta) => {
    if (!running) return;
    // Cap delta to avoid spiral of death when tab is hidden
    const clamped = Math.min(delta, 0.05);
    accRef.current += clamped;
    while (accRef.current >= h) {
      for (const key of Object.keys(Integrators)) {
        const s = simsRef.current[key];
        const stepper = Integrators[key].step;
        const n = stepper(s, h, g, L, c);
        // Keep angles within [-pi, pi] for numeric stability/pretty charts
        let theta = ((n.theta + Math.PI) % (2 * Math.PI)) - Math.PI;
        simsRef.current[key] = { theta, omega: n.omega };
        // Sample energy
        if (stepCountRef.current % sampleEverySteps === 0) {
          const H = historiesRef.current[key];
          const E = energy(theta, n.omega, g, L);
          const t = tRef.current;
          H.e.push({ t, E });
          if (H.e.length > maxSamples) H.e.shift();
          H.relErr = (E - H.e0) / H.e0;
        }
      }
      tRef.current += h;
      stepCountRef.current++;
      accRef.current -= h;
    }
  });

  return {
    simsRef,
    historiesRef,
    tRef,
    reset,
  };
}

function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2 text-xs">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: it.color }} />
          <span className="text-muted-foreground">{it.label}</span>
        </div>
      ))}
    </div>
  );
}

function EnergyChart({ histories, tMax }) {
  // histories: { key: {e: [{t,E}], e0, relErr}, ... }
  // Simple responsive SVG line chart
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 220 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setSize({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const padding = { l: 40, r: 15, t: 20, b: 24 };
  const w = Math.max(200, size.w);
  const h = Math.max(140, size.h);
  const innerW = w - padding.l - padding.r;
  const innerH = h - padding.t - padding.b;

  // Compute domain across all series
  let tMin = Infinity, tMaxLocal = -Infinity, eMin = Infinity, eMax = -Infinity;
  Object.values(histories).forEach((H) => {
    if (!H?.e?.length) return;
    tMin = Math.min(tMin, H.e[0].t);
    tMaxLocal = Math.max(tMaxLocal, H.e[H.e.length - 1].t);
    for (const p of H.e) {
      eMin = Math.min(eMin, p.E);
      eMax = Math.max(eMax, p.E);
    }
  });
  if (!isFinite(tMin)) tMin = 0;
  if (!isFinite(tMaxLocal)) tMaxLocal = tMax ?? 1;
  if (!isFinite(eMin)) { eMin = 0; eMax = 1; }
  const x = (t) => padding.l + ((t - tMin) / Math.max(1e-6, (tMaxLocal - tMin))) * innerW;
  const y = (E) => padding.t + (1 - (E - eMin) / Math.max(1e-9, eMax - eMin)) * innerH;

  // Build paths
  const series = Object.entries(histories).map(([key, H]) => {
    const d = (H.e || []).map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t)},${y(p.E)}`).join(" ");
    return { key, d, color: Integrators[key].color, relErr: H.relErr };
  });

  // Axis ticks (simple)
  const xTicks = 5;
  const yTicks = 4;
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) => tMin + (i / xTicks) * (tMaxLocal - tMin));
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => eMin + (i / yTicks) * (eMax - eMin));

  return (
    <div ref={ref} className="w-full h-[240px]">
      <svg width={w} height={h} className="rounded-xl bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 ring-1 ring-border">
        {/* Axes */}
        <g>
          {/* X axis */}
          <line x1={padding.l} y1={h - padding.b} x2={w - padding.r} y2={h - padding.b} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          {xTickVals.map((tv, i) => (
            <g key={i}>
              <line x1={x(tv)} y1={h - padding.b} x2={x(tv)} y2={padding.t} stroke="hsl(var(--muted)/0.4)" strokeWidth={0.5} />
              <text x={x(tv)} y={h - padding.b + 16} textAnchor="middle" fontSize={10} fill="hsl(var(--muted-foreground))">{tv.toFixed(1)}</text>
            </g>
          ))}
          {/* Y axis */}
          <line x1={padding.l} y1={padding.t} x2={padding.l} y2={h - padding.b} stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
          {yTickVals.map((ev, i) => (
            <g key={i}>
              <line x1={padding.l} y1={y(ev)} x2={w - padding.r} y2={y(ev)} stroke="hsl(var(--muted)/0.4)" strokeWidth={0.5} />
              <text x={padding.l - 6} y={y(ev) + 3} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">{ev.toFixed(2)}</text>
            </g>
          ))}
          <text x={w - padding.r} y={h - 4} textAnchor="end" fontSize={10} fill="hsl(var(--muted-foreground))">time (s)</text>
          <text x={padding.l + 4} y={padding.t + 10} textAnchor="start" fontSize={10} fill="hsl(var(--muted-foreground))">total energy</text>
        </g>
        {/* Series */}
        <g>
          {series.map((s) => (
            <path key={s.key} d={s.d} fill="none" stroke={s.color} strokeWidth={2} />
          ))}
        </g>
      </svg>
      <div className="mt-2 flex gap-3 flex-wrap">
        {series.map((s) => (
          <Badge key={s.key} variant="secondary" className="gap-2">
            <span className="inline-block w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="font-mono text-xs">{Integrators[s.key].name}</span>
            <span className="text-xs text-muted-foreground">ΔE/E₀ ≈ { (s.relErr * 100).toFixed(2) }%</span>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Pendulum3D({ state, L = 1, color = "#22c55e" }) {
  // Compute bob position from angle θ
  const x = L * Math.sin(state.theta);
  const y = -L * Math.cos(state.theta);
  const bobRef = useRef();

  useFrame(() => {
    if (bobRef.current) {
      bobRef.current.position.set(x, y, 0);
    }
  });

  return (
    <group>
      {/* Rod */}
      <mesh position={[0, -L / 2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, L, 16]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.4} />
      </mesh>
      {/* Bob */}
      <mesh ref={bobRef} position={[x, y, 0]} castShadow>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.3} />
      </mesh>
      {/* Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
    </group>
  );
}

function Scene({ simsRef, selectedKey, L }) {
  const color = Integrators[selectedKey].color;
  const s = simsRef.current?.[selectedKey] ?? { theta: 0, omega: 0 };

  return (
    <Canvas shadows camera={{ position: [2.8, 1.8, 2.8], fov: 45 }} className="rounded-2xl">
      <ambientLight intensity={0.6} />
      <directionalLight castShadow position={[5, 6, 5]} intensity={1.1} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* Reference grid */}
      <Grid args={[6, 6]} cellSize={0.25} cellColor="#444" sectionColor="#666" sectionThickness={1} infiniteGrid position={[0, -L - 0.2, 0]} />

      <group position={[0, 0, 0]}>
        <Pendulum3D state={s} L={L} color={color} />
      </group>

      <ContactShadows opacity={0.5} scale={10} blur={1.5} far={10} resolution={512} color="#000" />
      <Environment preset="city" />
      <OrbitControls enablePan={false} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  );
}

export default function EnergyDriftPlayground() {
  const [L, setL] = useState(1.0);
  const [g, setG] = useState(9.81);
  const [c, setC] = useState(0.0); // damping
  const [h, setH] = useState(1/240); // fixed time step (s)
  const [theta0Deg, setTheta0Deg] = useState(45);
  const [omega0, setOmega0] = useState(0);
  const [selectedKey, setSelectedKey] = useState("symplectic");
  const [running, setRunning] = useState(true);

  const theta0 = useMemo(() => (theta0Deg * Math.PI) / 180, [theta0Deg]);

  const { simsRef, historiesRef, tRef, reset } = useSims({ L, g, c, h, theta0, omega0, running });

  const handleReset = () => {
    reset();
  };

  return (
    <div className="min-h-[640px] w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted rounded-3xl">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3D Scene */}
        <Card className="border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/40 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Energy Drift Playground — Pendulum</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex">{Integrators[selectedKey].name}</Badge>
              <Switch checked={running} onCheckedChange={setRunning} />
              <span className="text-xs text-muted-foreground">{running ? "Running" : "Paused"}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <Scene simsRef={simsRef} selectedKey={selectedKey} L={L} />
            </div>
          </CardContent>
        </Card>

        {/* Right: Controls + Chart */}
        <Card className="border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Energy over time (all integrators)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <Legend
                items={Object.entries(Integrators).map(([k, v]) => ({ key: k, color: v.color, label: v.name }))}
              />
            </div>
            <EnergyChart histories={historiesRef.current} tMax={tRef.current} />

            <div className="mt-6 grid grid-cols-2 gap-4">
              {/* Initial conditions */}
              <div className="col-span-2">
                <h3 className="text-sm font-medium mb-2">Initial Conditions</h3>
                <div className="space-y-3">
                  <LabeledSlider label={`θ₀ (deg): ${theta0Deg.toFixed(0)}`} value={theta0Deg} min={-170} max={170} step={1} onChange={setTheta0Deg} />
                  <LabeledSlider label={`ω₀ (rad/s): ${omega0.toFixed(2)}`} value={omega0} min={-5} max={5} step={0.01} onChange={setOmega0} />
                </div>
              </div>
              {/* Physical params */}
              <div>
                <h3 className="text-sm font-medium mb-2">Physical Params</h3>
                <div className="space-y-3">
                  <LabeledSlider label={`Length L: ${L.toFixed(2)} m`} value={L} min={0.3} max={2.0} step={0.01} onChange={setL} />
                  <LabeledSlider label={`Gravity g: ${g.toFixed(2)} m/s²`} value={g} min={0.5} max={25} step={0.01} onChange={setG} />
                  <LabeledSlider label={`Damping c: ${c.toFixed(3)}`} value={c} min={0} max={0.2} step={0.001} onChange={setC} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Tip: set c = 0 for clean energy drift comparisons.</p>
              </div>
              {/* Integration */}
              <div>
                <h3 className="text-sm font-medium mb-2">Integration</h3>
                <div className="space-y-3">
                  <LabeledSlider label={`Δt (fixed): ${(h*1000).toFixed(1)} ms`} value={h} min={1/1000} max={1/30} step={1/1000} onChange={setH} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Show in 3D:</span>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Integrator" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(Integrators).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button onClick={() => setRunning((r) => !r)} variant="default">{running ? "Pause" : "Resume"}</Button>
              <Button onClick={handleReset} variant="secondary">Reset</Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              <strong>What to look for:</strong> Explicit Euler (red) tends to drift in energy (often upwards) and can explode for large Δt.
              Symplectic Euler (green) keeps total energy bounded and oscillatory over long times.
              Velocity Verlet (blue) is also symplectic and typically more accurate.
              RK4 (purple) is very accurate per step but not symplectic — over very long runs, energy may drift subtly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LabeledSlider({ label, value, onChange, min, max, step }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="w-full"
      />
    </div>
  );
}
```
