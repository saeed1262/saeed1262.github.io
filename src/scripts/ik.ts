// Two-bone IK in 2D, for the ZeroEGGS page's leg toy. It follows zeggs.postprocess: the hip and knee are re-solved
// with the law of cosines so the ankle reaches the target, and when the target is further than `reach` of the full
// leg length, the hip is lowered (straight down) instead of over-stretching the leg. x is forward, y is up.

export type Vec2 = [number, number];
export interface LegPose { hip: Vec2; knee: Vec2; ankle: Vec2; drop: number }

export function solveLeg(hip: Vec2, target: Vec2, upper: number, lower: number, reach = 0.995): LegPose {
  const max = reach * (upper + lower);
  const dx = target[0] - hip[0];
  let drop = 0;
  if (Math.hypot(dx, target[1] - hip[1]) > max) {
    // Lower the hip until the target is exactly `max` away (or down to the target's height if even that can't).
    drop = Math.abs(dx) < max ? hip[1] - target[1] - Math.sqrt(max * max - dx * dx) : hip[1] - target[1];
    drop = Math.max(0, drop);
  }
  const h: Vec2 = [hip[0], hip[1] - drop];
  const vx = target[0] - h[0];
  const vy = target[1] - h[1];
  const d = Math.min(Math.max(Math.hypot(vx, vy), Math.abs(upper - lower) + 1e-9), max);
  const ux = vx / Math.hypot(vx, vy);
  const uy = vy / Math.hypot(vx, vy);
  // Angle at the hip between the hip-to-target line and the thigh; turning it counter-clockwise puts the knee in
  // front for a leg that points down.
  const a = Math.acos(Math.min(1, Math.max(-1, (upper * upper + d * d - lower * lower) / (2 * upper * d))));
  const kx = ux * Math.cos(a) - uy * Math.sin(a);
  const ky = ux * Math.sin(a) + uy * Math.cos(a);
  const knee: Vec2 = [h[0] + upper * kx, h[1] + upper * ky];
  const ankle: Vec2 = [h[0] + ux * d, h[1] + uy * d];
  return { hip: h, knee, ankle, drop };
}
