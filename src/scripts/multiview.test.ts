import { describe, expect, it } from 'vitest';
import { JOINTS, LEFT_WRIST, closestOnLine, dist3, epipolarLine, project, ring, triangulate, type V2 } from './multiview';

const X = JOINTS[LEFT_WRIST].p;

describe('multi-view geometry', () => {
  const cams = ring(6);

  it('projects the subject into the middle of every image', () => {
    for (const cam of cams) {
      const [u, v] = project(cam, [0, 1.0, 0]);
      expect(u).toBeCloseTo(cam.cx, 6);
      expect(v).toBeCloseTo(cam.cy, 6);
    }
  });

  it('recovers a 3D point exactly from noise-free projections', () => {
    const est = triangulate(cams.map((cam) => ({ cam, u: project(cam, X), w: 1 })));
    expect(dist3(est, X)).toBeLessThan(1e-6);
  });

  it('puts the epipolar line through the true point in the reference view', () => {
    const [ref, other] = cams;
    const [a, b] = epipolarLine(ref, other, project(other, X));
    const truth = project(ref, X);
    const foot = closestOnLine(a, b, truth);
    expect(Math.hypot(foot[0] - truth[0], foot[1] - truth[1])).toBeLessThan(1e-6);
  });

  it('downweights a bad view when weights follow its uncertainty', () => {
    const obs = cams.map((cam, i) => {
      const u = project(cam, X);
      const bad: V2 = [u[0] + 40, u[1] - 25];
      return { cam, u: i === 2 ? bad : u, sigma: i === 2 ? 40 : 2 };
    });
    const plain = triangulate(obs.map((o) => ({ cam: o.cam, u: o.u, w: 1 })));
    const weighted = triangulate(obs.map((o) => ({ cam: o.cam, u: o.u, w: 1 / o.sigma })));
    expect(dist3(weighted, X)).toBeLessThan(dist3(plain, X) / 5);
  });
});
