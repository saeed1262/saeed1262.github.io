import { describe, expect, it } from 'vitest';
import { solveLeg, type Vec2 } from './ik';

const dist = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

describe('solveLeg', () => {
  it('puts the ankle on a reachable target without moving the hip', () => {
    const r = solveLeg([0, 1], [0.1, 0.2], 0.45, 0.45);
    expect(dist(r.ankle, [0.1, 0.2])).toBeLessThan(1e-6);
    expect(r.drop).toBe(0);
    expect(r.hip).toEqual([0, 1]);
  });

  it('keeps both bone lengths', () => {
    const r = solveLeg([0, 1], [0.15, 0.25], 0.45, 0.42);
    expect(dist(r.hip, r.knee)).toBeCloseTo(0.45, 9);
    expect(dist(r.knee, r.ankle)).toBeCloseTo(0.42, 9);
  });

  it('bends the knee forward for a target straight below', () => {
    const r = solveLeg([0, 1], [0, 0.3], 0.45, 0.45);
    expect(r.knee[0]).toBeGreaterThan(0);
  });

  it('lowers the hip when the target is out of reach', () => {
    const r = solveLeg([0, 1], [0.2, 0], 0.45, 0.45);
    expect(r.drop).toBeGreaterThan(0);
    expect(r.hip[1]).toBeCloseTo(1 - r.drop, 12);
    expect(dist(r.ankle, [0.2, 0])).toBeLessThan(1e-6);
    expect(dist(r.hip, r.ankle)).toBeCloseTo(0.995 * 0.9, 9);
  });
});
