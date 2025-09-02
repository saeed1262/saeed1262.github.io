---
layout: post
title: "Fast Collision in Games: Spatial Hashing vs. Naïve"
date: 2025-09-02
description: "An interactive broad‑phase collision demo showing why uniform grids (spatial hashing) beat O(n²) for many moving objects in real‑time games."
tags: [game-dev, algorithms, collision-detection, performance, interactive]
categories: blog
---

When hundreds of objects move every frame, naïvely checking all pairs is O(n²) and quickly tanks performance. Games use a broad‑phase to prune most pairs before precise (narrow‑phase) checks. A simple and effective broad‑phase is a uniform grid, also called spatial hashing.

Below you can toggle between Naïve and Spatial Hashing, adjust object counts, and visualize grid cells and candidate pairs. Watch the collision‑checks counter as n scales.

<div id="hash-container">
  <div id="hash-controls">
    <div class="control-group">
      <label>Algorithm</label>
      <div class="control-row">
        <select id="algo">
          <option value="hash">Spatial Hash</option>
          <option value="naive">Naïve O(n²)</option>
        </select>
      </div>
    </div>

    <div class="control-group">
      <label>Objects: <span class="value" id="countLabel">300</span></label>
      <input id="count" type="range" min="50" max="1200" step="10" value="300" />
    </div>

    <div class="control-group">
      <label>Cell Size: <span class="value" id="cellLabel">32</span> px</label>
      <input id="cell" type="range" min="12" max="80" step="4" value="32" />
    </div>

    <div class="control-group">
      <label>Speed: <span class="value" id="speedLabel">1.0x</span></label>
      <input id="speed" type="range" min="0.25" max="2.0" step="0.25" value="1.0" />
    </div>

    <div class="control-group">
      <label>Visuals</label>
      <div class="control-row">
        <label class="checkbox"><input id="showGrid" type="checkbox" checked /> Grid</label>
        <label class="checkbox"><input id="showCandidates" type="checkbox" /> Candidates</label>
        <label class="checkbox"><input id="pause" type="checkbox" /> Pause</label>
      </div>
    </div>
  </div>

  <div id="hash-viz-container">
    <canvas id="hash-viz" width="1280" height="720" aria-label="Spatial hashing collision demo"></canvas>
    <div class="loading" id="loading">Preparing simulation…</div>
    <div class="no-canvas" id="noCanvas" hidden>Your browser does not support Canvas.</div>
  </div>

  <div id="hash-hud">
    <div class="hud-panel">
      <h4>Performance</h4>
      <div class="hud-value"><span class="label">Algorithm</span><span class="value" id="hudAlgo">Spatial Hash</span></div>
      <div class="hud-value"><span class="label">Objects</span><span class="value" id="hudCount">300</span></div>
      <div class="hud-value"><span class="label">Cell Size</span><span class="value" id="hudCell">32 px</span></div>
      <div class="hud-value"><span class="label">Broad‑phase Pairs</span><span class="value" id="hudPairs">0</span></div>
      <div class="hud-value"><span class="label">Collision Checks</span><span class="value" id="hudChecks">0</span></div>
      <div class="hud-value"><span class="label">FPS</span><span class="value" id="hudFps">0</span></div>
    </div>
    <div class="hud-panel">
      <h4>Notes</h4>
      <ul class="notes">
        <li>Uniform grid partitions space; objects visit only nearby cells.</li>
        <li>Broad‑phase prunes pairs; narrow‑phase confirms actual overlaps.</li>
        <li>Best grid size ≈ 1–2× object diameter for circles/AABBs.</li>
      </ul>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/assets/css/spatial-hash.css">
<script defer src="/assets/js/spatial-hash.js"></script>

### Why Spatial Hashing Works

- Broad‑phase reduces pair candidates from O(n²) toward O(n) on average by restricting checks to neighbors in the same or adjacent cells.
- The grid key can be computed with integer division; a small hash map keeps cell→object lists per frame.
- For robustness, only emit pairs with i < j to avoid duplicates; optionally use a small seen‑set if objects span multiple cells.

This pattern scales well and is a staple in physics, AI sensing, particle systems, and effects. In production, you may switch to a quadtree, BVH, or clustered grids for heterogeneous sizes, but a uniform hash is hard to beat for simplicity and speed.


### Naïve vs. Hashing: Mental Model

- Naïve O(n²): Every frame, compare each object with every other. Work ~ n(n-1)/2; doubling n ~4× comparisons.
- Spatial Hash O(n + k): Insert all objects into a grid (O(n)), then only test neighbors inside the same/adjacent cells. If objects are fairly evenly distributed and cell size matches object size, each object sees a constant number of neighbors on average, so k ~ c·n.
- Worst case still exists: If everything piles into one cell, you’re back to O(n²). Good parameters and mild randomness avoid this.


### Choosing Cell Size

- Rule of thumb: cell size ≈ object diameter (for circles/spheres) or the larger dimension of the AABB.
- Too small: each object touches many cells; higher bookkeeping and deduplication work.
- Too large: too many unrelated objects share a cell; more false candidate pairs.
- 2D vs 3D: neighbors are 9 cells in 2D (3×3 around you) and 27 in 3D (3×3×3).


### Core Pseudocode (2D circles/AABBs)

```text
// Integer cell coordinate from world position
cell(p, size) = (floor(p.x / size), floor(p.y / size))

// Build the grid (hash map from (cx,cy) -> list of indices)
grid.clear()
for i in 0..n-1:
  aabb = bounds(i)               // center + radius or min/max
  (cx0, cy0) = cell(aabb.min, S)
  (cx1, cy1) = cell(aabb.max, S)
  for cy in cy0..cy1:
    for cx in cx0..cx1:
      grid[(cx,cy)].push(i)

// Emit pairs from each occupied cell
pairs.clear()
for each (cx,cy) in grid.keys():
  for ny in cy-1..cy+1:
    for nx in cx-1..cx+1:
      let A = grid[(cx,cy)]
      let B = grid[(nx,ny)]
      // order rule avoids duplicates: only if (nx,ny) >= (cx,cy)
      if (ny < cy) or (ny == cy and nx < cx): continue
      for each i in A:
        for each j in B:
          if (A == B and j <= i): continue  // keep i<j
          if narrowPhaseOverlap(i, j):
            pairs.add((i,j))
```

Notes:
- The “order rule” prevents the same pair from being emitted from multiple neighboring cells.
- If objects are small relative to S, each object spans 1–4 cells in 2D (1–8 in 3D).
- Use contiguous arrays and reuse buffers to avoid per‑frame allocation.


### Hashing Implementation Details

- Key packing: convert `(cx, cy)` to a single integer key, e.g., `(int64(cx) << 32) ^ (cy & 0xffffffff)` or use a proper hash of the pair.
- Data layout: prefer `struct of arrays` (SoA) for positions/radii to be cache‑friendly in the tight loops.
- Frame clearing: instead of freeing maps, keep capacity and reset lengths; pool cell lists for reuse.
- Stable ordering: keep object indices stable to improve cache locality across frames.


### Handling High Speeds (CCD)

- Broad‑phase with static AABBs can miss fast objects that tunnel through each other between frames.
- Common fixes:
  - Inflate AABBs by velocity over the timestep (swept AABB) before broad‑phase.
  - Integrate in substeps when speeds are high relative to object size.
  - Use time‑of‑impact narrow‑phase for critical objects only.


### Variable Sizes and Density

- Mixed scales: large and tiny objects together degrade uniform grids. Options:
  - Multi‑level grids (different S per tier; insert by size class).
  - Insert big objects into all cells overlapped; cap per‑cell occupancy.
  - Hybrid broad‑phase: grid for smalls, sweep‑and‑prune or BVH for larges.
- Crowding: if a cell exceeds a threshold, adapt (split cell, switch to secondary structure) or increase S slightly.


### Performance Tips

- Avoid hash map churn: precompute world‑to‑cell bounds and allocate a fixed window when the world is limited. For infinite worlds, use a custom open‑addressing hash.
- SIMD: distance checks for circles/AABBs vectorize well; batch candidate pairs.
- Parallelism: split space into strips or blocks; merge pairs afterward. Be careful with duplicates across boundaries.
- Metrics: track “broad‑phase pairs per object” and “narrow‑phase hits” to tune S.


### How It Compares

- Sweep and Prune (SAP): great along one axis when motion is coherent; widely used in physics engines.
- Quad/Octrees: adapt to non‑uniform densities but cost more to update with many movers.
- BVH: excellent for static or semi‑static geometry; dynamic rebuilds are pricier.
- Uniform Grid/Hash: minimal code, fast updates, shines with many similar‑sized dynamic objects.


### Tiny JavaScript Example

```js
// 64-bit style key using two 32-bit signed ints
const key = (cx, cy) => (BigInt(cx) << 32n) ^ (BigInt(cy) & 0xffffffffn);

function buildGrid(objs, S, grid) {
  grid.clear();
  for (let i = 0; i < objs.length; i++) {
    const o = objs[i];
    const minx = Math.floor((o.x - o.r) / S);
    const maxx = Math.floor((o.x + o.r) / S);
    const miny = Math.floor((o.y - o.r) / S);
    const maxy = Math.floor((o.y + o.r) / S);
    for (let cy = miny; cy <= maxy; cy++)
      for (let cx = minx; cx <= maxx; cx++) {
        const k = key(cx, cy);
        let arr = grid.get(k);
        if (!arr) grid.set(k, (arr = []));
        arr.push(i);
      }
  }
}

function emitPairs(grid, objs, S, outPairs) {
  outPairs.length = 0;
  for (const [k, A] of grid) {
    const cy = Number((k & 0xffffffffn) << 32n >> 32n); // sign-extend
    const cx = Number(k >> 32n);
    for (let ny = cy - 1; ny <= cy + 1; ny++)
      for (let nx = cx - 1; nx <= cx + 1; nx++) {
        // order rule to avoid duplicates
        if (ny < cy || (ny === cy && nx < cx)) continue;
        const B = grid.get(key(nx, ny));
        if (!B) continue;
        for (let ai = 0; ai < A.length; ai++) {
          const i = A[ai];
          for (let bj = 0; bj < B.length; bj++) {
            const j = B[bj];
            if (A === B && j <= i) continue;
            // circle narrow-phase
            const dx = objs[i].x - objs[j].x;
            const dy = objs[i].y - objs[j].y;
            const rr = objs[i].r + objs[j].r;
            if (dx*dx + dy*dy <= rr*rr) outPairs.push([i, j]);
          }
        }
      }
  }
}
```


### When Not To Use It

- Extremely non‑uniform sizes or densities dominate runtime: prefer BVH or hybrid.
- Highly coherent 1D motion (e.g., stacks, axis‑aligned sweeps): SAP can be faster.
- Very small n (<50): the constant factors of hashing may outweigh benefits; naïve is fine.


### Takeaways

- Pick a cell size that matches your object scale, watch per‑cell occupancy, and use a clear dedup rule.
- Measure candidate pairs and FPS as you tune; grids can deliver near‑linear scaling for typical game scenes.
