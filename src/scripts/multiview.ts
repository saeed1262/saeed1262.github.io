// Small multi-view geometry toolkit for the UPose3D page: a standing 3D
// skeleton, pinhole cameras on a ring, projection, epipolar lines (the
// paper's cross-view projection) and weighted linear triangulation.
// World units are metres, y is up; image units are pixels, v grows downward.

export type V3 = [number, number, number];
export type V2 = [number, number];

/** Human3.6M-style 17-joint skeleton in a relaxed standing pose (metres). */
export const JOINTS: { name: string; side: 'L' | 'R' | 'C'; p: V3 }[] = [
  { name: 'pelvis', side: 'C', p: [0, 0.95, 0] },
  { name: 'right hip', side: 'R', p: [-0.11, 0.93, 0] },
  { name: 'right knee', side: 'R', p: [-0.12, 0.52, 0.03] },
  { name: 'right ankle', side: 'R', p: [-0.13, 0.08, -0.02] },
  { name: 'left hip', side: 'L', p: [0.11, 0.93, 0] },
  { name: 'left knee', side: 'L', p: [0.14, 0.52, 0.05] },
  { name: 'left ankle', side: 'L', p: [0.16, 0.08, 0.02] },
  { name: 'spine', side: 'C', p: [0, 1.18, 0.01] },
  { name: 'thorax', side: 'C', p: [0, 1.42, 0.02] },
  { name: 'neck', side: 'C', p: [0, 1.52, 0.03] },
  { name: 'head', side: 'C', p: [0, 1.66, 0.05] },
  { name: 'left shoulder', side: 'L', p: [0.19, 1.42, 0.01] },
  { name: 'left elbow', side: 'L', p: [0.32, 1.17, 0.08] },
  { name: 'left wrist', side: 'L', p: [0.38, 0.98, 0.22] },
  { name: 'right shoulder', side: 'R', p: [-0.19, 1.42, 0.01] },
  { name: 'right elbow', side: 'R', p: [-0.3, 1.16, -0.06] },
  { name: 'right wrist', side: 'R', p: [-0.33, 0.93, 0.06] },
];
export const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [0, 7], [7, 8], [8, 9], [9, 10],
  [8, 11], [11, 12], [12, 13], [8, 14], [14, 15], [15, 16],
];
export const LEFT_WRIST = 13;

export interface Camera {
  id: number;
  C: V3; // centre
  R: [V3, V3, V3]; // rows: camera x (right), y (up), z (forward) axes in world
  f: number;
  cx: number;
  cy: number;
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** A camera at `C` looking at `target`, with the world's up direction kept upright. */
export function lookAt(id: number, C: V3, target: V3, f = 520, w = 400, h = 300): Camera {
  const z = norm(sub(target, C));
  const x = norm(cross([0, 1, 0], z));
  const y = cross(z, x);
  return { id, C, R: [x, y, z], f, cx: w / 2, cy: h / 2 };
}

/** `n` cameras evenly spaced on a ring around the subject. */
export function ring(n: number, radius = 3.2, height = 1.7, offset = 0.35): Camera[] {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i / n) * Math.PI * 2;
    return lookAt(i + 1, [Math.sin(a) * radius, height, Math.cos(a) * radius], [0, 1.0, 0]);
  });
}

export function project(cam: Camera, X: V3): V2 {
  const d = sub(X, cam.C);
  const xc = dot(cam.R[0], d), yc = dot(cam.R[1], d), zc = dot(cam.R[2], d);
  return [cam.cx + (cam.f * xc) / zc, cam.cy - (cam.f * yc) / zc];
}

/** World point at `depth` along the ray through pixel `u`. */
export function backProject(cam: Camera, u: V2, depth: number): V3 {
  const dc: V3 = [(u[0] - cam.cx) / cam.f, -(u[1] - cam.cy) / cam.f, 1];
  const [x, y, z] = cam.R;
  const dw: V3 = [x[0] * dc[0] + y[0] * dc[1] + z[0] * dc[2], x[1] * dc[0] + y[1] * dc[1] + z[1] * dc[2], x[2] * dc[0] + y[2] * dc[1] + z[2] * dc[2]];
  return [cam.C[0] + dw[0] * depth, cam.C[1] + dw[1] * depth, cam.C[2] + dw[2] * depth];
}

/**
 * The epipolar line in `ref` of pixel `u` seen by `other`, as two image points.
 * Sampling the ray near the subject keeps both points in front of `ref`.
 */
export function epipolarLine(ref: Camera, other: Camera, u: V2): [V2, V2] {
  const dist = Math.hypot(...sub([0, 1, 0], other.C));
  return [project(ref, backProject(other, u, dist * 0.55)), project(ref, backProject(other, u, dist * 1.45))];
}

/** The point on line (a, b) closest to p: UPose3D's projection of another view's keypoint. */
export function closestOnLine(a: V2, b: V2, p: V2): V2 {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1);
  return [a[0] + t * dx, a[1] + t * dy];
}

/**
 * Linear triangulation of one point from several views, each weighted by
 * `w` (1 = plain DLT-style least squares; 1/σ = trust each view by its uncertainty).
 */
export function triangulate(obs: { cam: Camera; u: V2; w: number }[]): V3 {
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const b = [0, 0, 0];
  for (const { cam, u, w } of obs) {
    // Rows of P = K [R | -R C]; K flips v so the image's y axis points down.
    const t = cam.R.map((r) => -dot(r, cam.C));
    const P = [
      [cam.f * cam.R[0][0] + cam.cx * cam.R[2][0], cam.f * cam.R[0][1] + cam.cx * cam.R[2][1], cam.f * cam.R[0][2] + cam.cx * cam.R[2][2], cam.f * t[0] + cam.cx * t[2]],
      [-cam.f * cam.R[1][0] + cam.cy * cam.R[2][0], -cam.f * cam.R[1][1] + cam.cy * cam.R[2][1], -cam.f * cam.R[1][2] + cam.cy * cam.R[2][2], -cam.f * t[1] + cam.cy * t[2]],
      [cam.R[2][0], cam.R[2][1], cam.R[2][2], t[2]],
    ];
    for (const [k, coord] of [[0, u[0]], [1, u[1]]] as const) {
      const row = [0, 1, 2, 3].map((j) => (coord * P[2][j] - P[k][j]) * w);
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) A[r][c] += row[r] * row[c];
        b[r] -= row[r] * row[3];
      }
    }
  }
  return solve3(A, b);
}

function solve3(A: number[][], b: number[]): V3 {
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A) || 1e-12;
  const col = (i: number) => A.map((row, r) => row.map((v, c) => (c === i ? b[r] : v)));
  return [det(col(0)) / D, det(col(1)) / D, det(col(2)) / D];
}

export const dist3 = (a: V3, b: V3) => Math.hypot(...sub(a, b));

/** Seeded random numbers so the demos look the same on every visit. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gauss(r: () => number) {
  return Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
}
