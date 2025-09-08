---
layout: post
title: "BVH Collision Detection & Correction"
date: 2025-09-05
description: "A practical deep‑dive into the Bounding Volume Hierarchy (BVH) system powering fast overlap detection and robust correction."
tags: [layout, algorithms, collision-detection, BVH, performance]
categories: blog
---

Modern layout tools nee d to keep hundreds of items responsive without letting them overlap. In one of my projects, collision detection and correction are handled by a dynamic Bounding Volume Hierarchy (BVH) built over axis‑aligned bounding boxes (AABBs). This post explains how the BVH is constructed, updated, queried for overlaps, and how overlaps are corrected reliably and fast.


## Why BVH (and not a grid)?

- Uniform grids shine with similarly sized objects. Layouts often have mixed sizes and clustered elements, where grids either over‑bucket or under‑bucket.
- BVH adapts to spatial distribution: nearby items share tight parent AABBs; far items barely interact during traversal.
- Dynamic refitting makes per‑frame updates cheap: when an item moves, only O(log n) parent AABBs update.


## Objects and Bounds

- Item shape: treated as rectangles aligned to the canvas axes (AABBs). Rotations, if present visually, use their axis‑aligned bounding box for broad‑phase.
- Node: either a leaf (stores one item index) or an internal node with two children and an AABB enclosing them.

```ts
// Pseudocode/TypeScript‑ish for clarity
type AABB = { minX: number; minY: number; maxX: number; maxY: number };

type Node = {
  aabb: AABB;
  left?: number;  // index into nodes array
  right?: number; // index into nodes array
  parent?: number;
  item?: number;  // leaf: index into items array
  height: number; // leaf = 0, internal = 1 + max(children)
};
```


## Building the BVH

For static scenes, a top‑down build using a surface‑area heuristic (SAH) is ideal. LD V2 prioritizes dynamic interaction, so it uses a fast incremental insertion with periodic rebuilds:

- Initial build: sort items along the longer world axis, recursively split by median; compute AABBs bottom‑up.
- Incremental insert: new item picks a leaf that minimizes the growth in parent surface area; split leaf into a new internal node with two children.
- Refit: when an item moves, update its leaf AABB, then recompute ancestors’ AABBs up to the root.
- Rebalance: occasionally rotate local subtrees (AVL‑like) or trigger a full rebuild if the tree gets too tall (e.g., `height > 2 * log2(n) + c`).

```ts
function merge(a: AABB, b: AABB): AABB {
  return {
    minX: Math.min(a.minX, b.minX), minY: Math.min(a.minY, b.minY),
    maxX: Math.max(a.maxX, b.maxX), maxY: Math.max(a.maxY, b.maxY)
  };
}

function perimeter(b: AABB) { return 2 * ((b.maxX - b.minX) + (b.maxY - b.minY)); }

// Greedy insertion: choose the subtree that minimally increases perimeter
function chooseInsertion(node: number, box: AABB): number {
  let n = node;
  while (!nodes[n].item) {
    const L = nodes[nodes[n].left!], R = nodes[nodes[n].right!];
    const costL = perimeter(merge(L.aabb, box)) - perimeter(L.aabb);
    const costR = perimeter(merge(R.aabb, box)) - perimeter(R.aabb);
    n = costL <= costR ? nodes[n].left! : nodes[n].right!;
  }
  return n; // leaf index
}
```


## Broad‑Phase Overlap Query

Traversal uses a stack (or small array) and prunes subtrees whose AABBs don’t intersect the query box. Two common queries:

1) All pairs (global): enumerate every overlapping pair once.
2) Single item: find overlaps against one moving item to resolve on the fly.

```ts
function aabbOverlap(a: AABB, b: AABB): boolean {
  return !(a.maxX <= b.minX || b.maxX <= a.minX ||
           a.maxY <= b.minY || b.maxY <= a.minY);
}

// 1) Global pairs via self‑overlap traversal
function collectPairs(root: number): [number, number][] {
  const out: [number, number][] = [];
  const stack: [number, number][] = [[root, root]];
  while (stack.length) {
    const [i, j] = stack.pop()!;
    if (i === j) {
      const n = nodes[i];
      if (!n.item) {
        stack.push([n.left!, n.left!]);
        stack.push([n.right!, n.right!]);
        stack.push([n.left!, n.right!]);
      }
      continue;
    }
    const A = nodes[i], B = nodes[j];
    if (!aabbOverlap(A.aabb, B.aabb)) continue;
    if (A.item && B.item) { // two leaves
      out.push([A.item, B.item]);
    } else if (A.item || (!B.item && A.aabbArea <= B.aabbArea)) {
      // descend the non‑leaf or the larger box
      stack.push([A.item ? i : A.left!, j]);
      stack.push([A.item ? i : A.right!, j]);
    } else {
      stack.push([i, B.left!]);
      stack.push([i, B.right!]);
    }
  }
  return out;
}

// 2) Single item query
function queryOverlaps(root: number, box: AABB, hits: number[] = []): number[] {
  const stack = [root];
  while (stack.length) {
    const n = nodes[stack.pop()!];
    if (!aabbOverlap(n.aabb, box)) continue;
    if (n.item) hits.push(n.item); else { stack.push(n.left!, n.right!); }
  }
  return hits;
}
```

In practice this runs near O(n log n) for well‑shaped trees, with very small constants thanks to cache‑friendly AABBs and branch pruning.


## Narrow‑Phase and Minimal Translation Vector (MTV)

Once a candidate pair is produced, we confirm overlap with an AABB‑AABB test and compute the minimal translation vector to separate them. For axis‑aligned rectangles:

```ts
type MTV = { dx: number; dy: number; depth: number };

function aabbMTV(a: AABB, b: AABB): MTV | null {
  const overlapX = Math.min(a.maxX - b.minX, b.maxX - a.minX);
  const overlapY = Math.min(a.maxY - b.minY, b.maxY - a.minY);
  if (overlapX <= 0 || overlapY <= 0) return null;
  // move along the smaller penetration
  if (overlapX < overlapY) {
    const dir = (a.minX + a.maxX) / 2 < (b.minX + b.maxX) / 2 ? -1 : 1;
    return { dx: dir * overlapX, dy: 0, depth: overlapX };
  } else {
    const dir = (a.minY + a.maxY) / 2 < (b.minY + b.maxY) / 2 ? -1 : 1;
    return { dx: 0, dy: dir * overlapY, depth: overlapY };
  }
}
```


## Correction: Stable Separation Without Jitter

LD V2 resolves overlaps immediately after detection using a symmetric, bias‑aware push:

- Compute MTV between `A` and `B`.
- Split correction based on “priority” (e.g., locked/anchored items get 0, draggable gets 1) or mass (both 0.5 by default).
- Apply positional slop and a softness factor to avoid oscillation.
- Refit BVH along the paths of the moved leaves.

```ts
function resolvePair(aIdx: number, bIdx: number) {
  const a = items[aIdx], b = items[bIdx];
  const mtv = aabbMTV(a.aabb, b.aabb); if (!mtv) return;

  // Bias: anchored items don’t move; otherwise split 50/50
  const wa = a.anchored ? 0 : 0.5;
  const wb = b.anchored ? 0 : 0.5;

  // Positional slop to reduce jitter on grazing contacts
  const SLOP = 0.5; // pixels
  const DEPTH = Math.max(0, mtv.depth - SLOP);
  const SOFTNESS = 0.9; // 1.0 = full separation, <1 damps

  const dx = SOFTNESS * (mtv.dx === 0 ? 0 : Math.sign(mtv.dx) * DEPTH);
  const dy = SOFTNESS * (mtv.dy === 0 ? 0 : Math.sign(mtv.dy) * DEPTH);

  a.translate(-wa * dx, -wa * dy);
  b.translate( wb * dx,  wb * dy);

  // Update their leaf AABBs and refit paths to root
  refitLeaf(aIdx);
  refitLeaf(bIdx);
}
```

To avoid chain reactions, the solver iterates over current overlaps a small, bounded number of times (e.g., 2–4 iterations), which is usually sufficient for layouts. Detect‑correct‑refit repeats per iteration.


## Update Loop

Two common modes are used depending on interaction type:

- Dragging live: on each pointer move, query BVH against the dragged item’s AABB, resolve overlaps immediately, refit, repeat until no overlaps or max iterations reached.
- Batch settle: after bulk edits (e.g., paste 50 items), collect global pairs, then iterate resolve passes.

```ts
function settle(maxIters = 3) {
  for (let it = 0; it < maxIters; it++) {
    const pairs = collectPairs(root);
    if (pairs.length === 0) break;
    for (const [a, b] of pairs) resolvePair(a, b);
  }
}
```


## Dynamic Considerations

- Fast motion: inflate the moving item’s query box by its frame delta (swept AABB) to avoid tunneling through small gaps.
- Large size differences: BVH handles this better than a uniform grid, but keep an eye on tree height; trigger local rotations or rebuilds when needed.
- Precision: use integer math for positions where possible; keep AABB computations consistent to avoid 1‑pixel “thrash.”
- Ordering: for deterministic results, sort candidate pairs (e.g., by minX, then minY) before resolving.


## Complexity & Performance

- Query: typical O(log n + k) where k is number of true overlaps; worst‑case can degenerate but is rare in practice with occasional rebalancing.
- Update: leaf refit is O(log n); incremental inserts and removals are similar.
- Correction: per‑pair O(1) math; bounded passes keep total under control in interactive scenarios.


## Pitfalls and Fixes

- Jitter on grazing contacts: add positional slop and soften the correction.
- Oscillation between neighbors: bias movement by “anchored” or “priority” flags; damp corrections slightly.
- Deep or skewed trees: rotate local subtrees, or rebuild on a height/imbalance threshold.
- Over‑correction near walls: clamp movement against fixed bounds before applying MTV.


## Minimal Example (All Together)

```ts
// Move an item, then keep it overlap‑free
function moveItem(idx: number, dx: number, dy: number) {
  const item = items[idx];
  item.translate(dx, dy);
  refitLeaf(idx);

  // Query neighbors against inflated box (swept AABB)
  const q = inflate(item.aabb, Math.abs(dx), Math.abs(dy));
  const neighbors = queryOverlaps(root, q);

  // Resolve locally a few times
  for (let it = 0; it < 3; it++) {
    let any = false;
    for (const j of neighbors) {
      if (j === idx) continue;
      const before = items[idx].aabb;
      resolvePair(idx, j);
      any = any || aabbOverlap(before, items[j].aabb);
    }
    if (!any) break;
  }
}
```


## Takeaways

- BVH provides robust, distribution‑aware broad‑phase for heterogeneous layouts.
- Local refits keep updates cheap; occasional rebalancing maintains query speed.
- MTV‑based correction with slop/softness yields stable, overlap‑free arrangements without visible jitter.

## Interactive BVH Demo

Below is an interactive canvas showing the BVH broad‑phase along with collision detection and correction between draggable rectangles. Toggle BVH boxes, candidate pairs, and pause; drag rectangles to see local queries and on‑the‑fly resolution.

<div id="bvh-container">
  <div id="bvh-controls">
    <div class="control-group">
      <label>Objects: <span class="value" id="bvhCountLabel">60</span></label>
      <input id="bvhCount" type="range" min="10" max="200" step="5" value="60" />
    </div>

    <div class="control-group">
      <label>Animation Speed: <span class="value" id="bvhSpeedLabel">1.0x</span></label>
      <input id="bvhSpeed" type="range" min="0.1" max="3.0" step="0.1" value="1.0" />
    </div>

    <div class="control-group">
      <label>Visuals</label>
      <div class="control-row">
        <label class="checkbox"><input id="bvhShowTree" type="checkbox" checked /> BVH Tree</label>
        <label class="checkbox"><input id="bvhShowPairs" type="checkbox" /> Collision Pairs</label>
      </div>
      <div class="control-row">
        <label class="checkbox"><input id="bvhShowTrails" type="checkbox" checked /> Velocity Trails</label>
        <label class="checkbox"><input id="bvhShowQuery" type="checkbox" /> Query Boxes</label>
      </div>
      <div class="control-row">
        <label class="checkbox"><input id="bvhPause" type="checkbox" /> Pause Animation</label>
      </div>
    </div>

    <div class="control-group">
      <label>Actions</label>
      <div class="control-row">
        <button id="bvhReset">Reset Scene</button>
        <button id="bvhShuffle">Shuffle + Settle</button>
      </div>
    </div>
  </div>

  <div id="bvh-viz-container">
    <canvas id="bvh-viz" width="1280" height="720" aria-label="Enhanced BVH collision detection demo"></canvas>
    <div class="loading" id="bvhLoading">Preparing Enhanced BVH…</div>
    <div class="no-canvas" id="bvhNoCanvas" hidden>Your browser does not support Canvas.</div>
  </div>

  <div id="bvh-hud">
    <div class="hud-panel">
      <h4>BVH Statistics</h4>
      <div class="hud-value"><span class="label">Nodes</span><span class="value" id="bvhHudNodes">0</span></div>
      <div class="hud-value"><span class="label">Tree Height</span><span class="value" id="bvhHudHeight">0</span></div>
      <div class="hud-value"><span class="label">Collision Pairs</span><span class="value" id="bvhHudPairs">0</span></div>
      <div class="hud-value"><span class="label">Queries/Frame</span><span class="value" id="bvhHudQueries">0</span></div>
      <div class="hud-value"><span class="label">FPS</span><span class="value" id="bvhHudFps">0</span></div>
    </div>
    <div class="hud-panel">
      <h4>Interactive Features</h4>
      <ul class="notes">
        <li><strong>Drag objects</strong> — Real-time collision resolution with MTV</li>
        <li><strong>3 object types</strong> — Normal (colorful), heavy (thick border), light (thin border)</li>
        <li><strong>Visual effects</strong> — Collision sparks, velocity trails, query highlighting</li>
        <li><strong>Dynamic BVH</strong> — Tree updates locally as objects move</li>
        <li><strong>Performance</strong> — Efficient O(log n) queries with pruning</li>
      </ul>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/assets/css/bvh-layout.css?v=1">
<script defer src="/assets/js/bvh-layout.js?v=1"></script>
