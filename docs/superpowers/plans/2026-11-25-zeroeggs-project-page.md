# ZeroEGGS Project Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Markdown ZeroEGGS page with an in-depth interactive page: the paper, then the 2026 code updates
(foot cleanup, heading fix, GenoView, modernisation), with an in-browser 3D motion player and GenoView videos.

**Architecture:** A Python script, run once against a local checkout of the ZeroEGGS repository, writes compact
motion clips (JSON header plus Int16 binary), chart data and videos into the site. The Astro page renders SVG charts
(the site's `viz.ts` helpers) and a three.js player that loads lazily and only on this page.

**Tech Stack:** Astro 6, TypeScript, vitest, three.js (new dependency), Python 3.12 with the `zeggs` package
(PyTorch 2.x), ffmpeg, GenoView (raylib).

**Spec:** `docs/superpowers/specs/2026-11-25-zeroeggs-project-page-design.md`

## Global Constraints

- Figures and text share the 48 rem column (PostLayout). No gradient buttons; the primary button is solid accent.
- British spelling in page copy. "We" for the paper, "I" for the 2026 work.
- Every number comes from the paper (named table), the README, or `scripts/zeggs/make_page_data.py` output.
- `three` is imported only by the player script, with dynamic `import()`, after a player nears the viewport.
- New assets under about 10 MB total (videos ≤ 6 MB, motion data ≤ 3 MB, audio ≤ 1 MB).
- Player stage is light in all four palettes; colours raw `#ffa100`, fixed `#3d3d3d`, third `#00a087`.
- Charts: validated colours, legend for two or more series, tooltips, table view, no dual axes.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Navigating away with ClientRouter while a player runs: renderers, animation loops and audio must stop and be
   disposed (`astro:before-swap`), or audio keeps playing on the next page. Test: Task 4 step "navigation disposal".
2. Sound on, then scrub, pause, or switch tabs: motion and speech stay in sync and loop together. Test: `frameAt`
   cases in Task 4.
3. Blend slider moved during playback: the new track continues from the same time, not from zero. Test: Task 4
   `switchTrack keeps time`.
4. Reduced motion or no WebGL: no autoplay; a poster and caption show instead of a blank box. Test: Task 4 browser
   check with emulated reduced motion and `getContext('webgl2')` stubbed to null.
5. Phone width and palette change while a player is visible: no sideways scroll, labels readable. Test: Task 8
   browser checks at 375 px in all four palettes.

---

### Task 1: ZeroEGGS environment and clip export library

**Files:**
- Create: `scripts/zeggs/README.md` (how to set up and run), `scripts/zeggs/export.py`, `scripts/zeggs/test_export.py`

**Interfaces:**
- Produces (Python, `export.py`):
  - `BODY_JOINTS: list[str]` — the ZEGGS joints without fingers (names checked against a ZEGGS BVH).
  - `body_positions(anim: dict, fps_out: int = 30) -> np.ndarray` — global positions (frames, len(BODY_JOINTS), 3)
    in millimetres, y up, resampled from 60 fps by taking every second frame.
  - `body_parents() -> list[int]` — parent index of each kept joint (nearest kept ancestor, −1 for the root).
  - `contact_runs(anim: dict, fps_out: int = 30) -> dict[str, list[tuple[int, int]]]` — `{"left": [...], "right": [...]}`
    [start, end) frame runs at `fps_out`, from `zeggs.postprocess.detect_contacts` with its default thresholds.
  - `write_clip(stem: Path, tracks: list[dict], fps: int, audio: str | None, contacts: dict | None) -> None` — writes
    `<stem>.json` and `<stem>.bin`. Each track dict has `id`, `label`, `color`, `positions` (ndarray).
- Clip format (consumed by Task 4): JSON `{ "fps", "frames", "joints", "parents", "tracks": [{"id","label","color"}],
  "audio": "<file>.m4a" | null, "contacts": {"<trackId>": {"left": [[s,e],...], "right": [...]}} | null }`;
  binary: little-endian Int16, tracks in header order, each `frames × joints × 3`, millimetres.

- [ ] **Step 1:** Clone ubisoft-laforge-ZeroEGGS (main, commit `5225afd` or later) into the scratchpad, create a
  venv with `/Users/saeedghorbani/Desktop/motion-coherence/real/env/bin/python -m venv` (Python 3.12), and run
  `pip install -e ".[viewer]"`. Check: `python -c "import zeggs.postprocess, zeggs.retarget"` exits 0.
- [ ] **Step 2: Write the failing test** `test_export.py::test_round_trip`: build a 2-track clip from
  `data/clean/001_Neutral_0.bvh` (first 120 frames), `write_clip` it, read the binary back with `np.fromfile(...,
  "<i2")`, and assert shape `(2, 60, len(BODY_JOINTS), 3)`, max error ≤ 0.5 mm against `body_positions`, and that the
  header's `parents[0] == -1` and `len(parents) == len(joints)`.
- [ ] **Step 3:** Run `pytest scripts/zeggs/test_export.py -v`. Expected: FAIL (module missing).
- [ ] **Step 4:** Implement `export.py` per the Interfaces block (forward kinematics via `zeggs.anim.quat.fk`).
- [ ] **Step 5:** Run the test. Expected: PASS.
- [ ] **Step 6:** Commit `scripts/zeggs/`.

### Task 2: Page data script

**Files:**
- Create: `scripts/zeggs/make_page_data.py`
- Output: `public/data/zeggs/{blend,variation,feet}.json|.bin`, `public/data/zeggs/speech.m4a`,
  `public/data/zeggs/feet.m4a`, `src/data/projects/zeggs-measured.json`

**Interfaces:**
- Consumes: Task 1 `export.py`; `zeggs.generate.generate_gesture`, `zeggs.postprocess.{fix_foot_sliding,
  fix_heading_drift, foot_skating, heading}`.
- Produces `zeggs-measured.json` with keys:
  - `styleMap: { points: {x,y,style,take}[], pc1RootSpeedR: number, pc2HandHeightR: number }`
  - `timeline: { fps, height: number[], speed: number[], heightThresh, speedThresh, contacts: [s,e][] }` (left ankle,
    cm and cm/s, over the feet clip window)
  - `heading: { fps: 10, raw: number[], fixed: number[], limit: 20 }` (degrees from start, whole feet run)
  - `skating: { runs: {label, before: {speed, moving}, after: {speed, moving}}[], mocap: {min, max} }`
  - `clips: { speechTake, blendStyles: [a, b], variationStyle, feetPair: {style, speech}, feetWindow: [s, e] }`

- [ ] **Step 1:** Speech excerpt: among the Neutral takes, the 10 s window with the highest mean RMS; cut it to WAV
  for generation and to `speech.m4a` (AAC 64 kbps mono) for the page.
- [ ] **Step 2:** Blend: v1 model, style examples Old and Oration (first 8 s of a take of each), `blend_type="add"`,
  ratios `[1−w, w]` for w in 0, 0.25, 0.5, 0.75, 1, seed 1234 → `blend` clip with 5 tracks (ids `w0`…`w100`).
- [ ] **Step 3:** Variation: one style (Happy), same speech, seeds 1, 2, 3 → `variation` clip, 3 tracks, colours
  per Global Constraints, side-by-side offsets left to the player.
- [ ] **Step 4:** Feet: for each Happy take as example against each Angry take's audio (v1, seed 1234), measure raw
  `foot_skating`; keep the worst pair. Write raw and `fix_feet` (after `fix_heading_drift`) BVHs, export the 10 s
  window with the highest raw low-foot speed as `feet` (tracks `raw`, `fixed`, with contacts), and its audio.
- [ ] **Step 5:** Charts: style map (v1 style encoder mean over non-overlapping 8 s windows of all 67 takes, PCA to
  2D with numpy SVD; Pearson r of PC1 with mean root speed and of PC2 with mean wrist height); timeline (left ankle
  of the raw feet window); heading (raw and fixed of the whole worst run, 10 fps); skating for three runs (v1
  example on its own speech, v2 label Happy, worst pair) and the mocap min/max over all 67 takes.
- [ ] **Step 6:** Run the script. Expected: it prints every number above, and `du -sh public/data/zeggs` ≤ 4 MB.
  If |r| < 0.5 for either PC, note it; the page then describes the axes without the sway/height claim.
- [ ] **Step 7:** Commit the script and outputs.

### Task 3: GenoView videos and social image

**Files:**
- Output: `public/videos/projects/zeggs/feet.mp4` + `feet.jpg`, `public/videos/projects/zeggs/styles.mp4` +
  `styles.jpg`, `public/images/projects/zeggs.jpg` (1200×630)

- [ ] **Step 1:** Record raw against fixed for the worst pair's window: `genoview.py raw.bvh fixed.bvh --labels raw
  fix_feet --foot-markers --start s --end e --record feet.mp4`. Expected: an MP4 of about 10 s.
- [ ] **Step 2:** Record a style comparison: three takes of the same speech (Old, Neutral, Oration), labelled.
- [ ] **Step 3:** Re-encode both with ffmpeg (H.264, CRF 28, 960 px wide, no audio track, `+faststart`), grab
  posters from frame 1 s, and make the 1200×630 social image from a frame. Expected: videos ≤ 6 MB total.
- [ ] **Step 4:** If recording fails on this Mac: convert the repository's `media/foot_fix.gif` to `feet.mp4` and
  drop the styles video; note this in the PR.
- [ ] **Step 5:** Commit the media.

### Task 4: Motion player

**Files:**
- Create: `src/scripts/motion-clip.ts`, `src/scripts/motion-clip.test.ts`, `src/scripts/motion-player.ts`,
  `src/components/projects/zeggs/MotionPlayer.astro`
- Modify: `package.json` (add `three` and `@types/three`, exact current versions)

**Interfaces:**
- Produces (pure, `motion-clip.ts`):
  - `interface ClipHeader` (the Task 1 format) and `interface Clip { header: ClipHeader; tracks: Float32Array[] }`
    (metres).
  - `decodeClip(header: ClipHeader, buffer: ArrayBuffer): Clip`
  - `frameAt(seconds: number, fps: number, frames: number): number` — looped, integer, 0 ≤ result < frames.
  - `jointPosition(clip: Clip, track: number, frame: number, joint: number): [number, number, number]`
  - `trailPoints(clip: Clip, track: number, foot: 'left' | 'right'): [number, number][]` — floor (x, z) of the ankle
    over that track's contact frames.
- Produces (component): `<MotionPlayer src="/data/zeggs/feet" show={['raw','fixed']} switcher?={{label, ids}}
  trails?={true} label="..." poster="..." />` with the figure head, caption slot and controls.

- [ ] **Step 1: Write failing tests** in `motion-clip.test.ts`: `decodeClip` turns Int16 1000 into 1.0 m and splits
  tracks in order; `frameAt(0, 30, 300) === 0`, `frameAt(10, 30, 300) === 0` (loops), `frameAt(9.99, 30, 300) ===
  299`, `frameAt(-1, 30, 300) === 270`; `switchTrack keeps time` (the player state's time is unchanged when the
  active track id changes — test the pure reducer `nextState(state, {type:'track', id})`); `trailPoints` returns
  only frames inside contact runs.
- [ ] **Step 2:** Run `npx vitest run src/scripts/motion-clip.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `motion-clip.ts`.
- [ ] **Step 4:** Run the tests. Expected: PASS.
- [ ] **Step 5:** Implement `motion-player.ts`: on `astro:page-load`, find `[data-motion-player]`; an
  IntersectionObserver (rootMargin 200 px) fetches the clip and `import('three')`; capsules per bone and a sphere
  head; checkered light floor; contact-shadow blobs; trails as flat discs; limited orbit drag; the audio element as
  clock when sound is on; pause when off screen; no autoplay under `prefers-reduced-motion`; poster if WebGL is
  missing. On `astro:before-swap`: stop loops, pause audio, `renderer.dispose()`.
- [ ] **Step 6:** Implement `MotionPlayer.astro` (figure markup, buttons with names, track switcher as a range input
  with step labels, `data-*` attributes for the script).
- [ ] **Step 7: Browser check** on a scratch page using the `feet` and `blend` clips: plays, scrubs, sound in sync,
  slider keeps time, reduced motion shows a still frame, stubbed WebGL shows the poster, and after navigating to
  another page no audio plays and `performance` shows no running loop (navigation disposal).
- [ ] **Step 8:** Commit.

### Task 5: IK toy

**Files:**
- Create: `src/scripts/ik.ts`, `src/scripts/ik.test.ts`, `src/components/projects/zeggs/IkToy.astro`

**Interfaces:**
- Produces: `solveLeg(hip: Vec2, target: Vec2, upper: number, lower: number, reach = 0.995): { hip: Vec2; knee: Vec2;
  ankle: Vec2; drop: number }` — knee bends forward (+x); if the target is beyond `reach × (upper + lower)` the hip
  moves straight down by `drop` so the leg just reaches.

- [ ] **Step 1: Failing tests:** reachable target → `ankle` equals target within 1e-6 and `drop === 0`; bone lengths
  preserved; knee x > hip x for a target straight below; unreachable target → `drop > 0` and
  |ankle − target| < 1e-6.
- [ ] **Step 2:** Run `npx vitest run src/scripts/ik.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `solveLeg` (law of cosines, as in `zeggs.postprocess._two_bone_ik`).
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** `IkToy.astro`: SVG leg with a draggable foot target (pointer and arrow keys), floor line, readout of
  hip drop in cm, caption.
- [ ] **Step 6:** Commit.

### Task 6: Paper figures

**Files:**
- Create: `src/components/projects/zeggs/Architecture.astro`, `StyleMap.astro`, `DatasetChart.astro`,
  `StudyChart.astro`; `src/data/projects/zeggs.ts`

**Interfaces:**
- Produces in `zeggs.ts`: `authors`, `bibtex`, `datasetMinutes: {style, minutes}[]` (paper Table 1),
  `study: {measure: 'Naturalness'|'Appropriateness'|'Style', dataset: 'ZEGGS'|'TSG', zeggs: [mean, sd], moglow:
  [mean, sd]}[]` (paper Table 2), `modelStats` (25 M / 86 M parameters, 4 ms / 29 ms per frame), `references`.

- [ ] **Step 1:** `Architecture.astro`: the blog diagram's three parts as buttons; the selected part's panel lists
  inputs, outputs and sizes from spec section 2. Keyboard and touch work.
- [ ] **Step 2:** `StyleMap.astro`: SVG scatter from `zeggs-measured.json`; grey points; style chips highlight one
  style in the accent; tooltip names take and style; table of per-style means. Axis titles per Task 2 step 6.
- [ ] **Step 3:** `DatasetChart.astro`: horizontal bars, one colour, sorted by minutes, total in the subtitle,
  table view.
- [ ] **Step 4:** `StudyChart.astro`: three small panels (measures) × two datasets, ZEGGS and MoGlow bars with ± sd
  whiskers, legend, note that scores are relative; two stat tiles for size and speed.
- [ ] **Step 5:** Run the palette validator (dataviz skill script) on the two series colours for light and dark.
  Expected: PASS.
- [ ] **Step 6:** Commit.

### Task 7: 2026 figures

**Files:**
- Create: `src/components/projects/zeggs/ContactTimeline.astro`, `SkatingChart.astro`, `HeadingChart.astro`

- [ ] **Step 1:** `ContactTimeline.astro`: two stacked small charts sharing time (height cm; speed cm/s), threshold
  lines labelled, contact runs shaded, crosshair tooltip. Two charts, not two axes.
- [ ] **Step 2:** `SkatingChart.astro`: dot plot per run, before → after with an arrow, the mocap range as a band;
  table view includes "% of low-foot frames moving".
- [ ] **Step 3:** `HeadingChart.astro`: two lines (raw, fixed) over time with the ±20° band, legend and direct
  labels, crosshair tooltip.
- [ ] **Step 4:** Commit.

### Task 8: The page

**Files:**
- Create: `src/pages/projects/zeggs.astro`
- Modify: `src/content/projects/zeggs.md` (add `customPage: true`; keep front matter, drop nothing else needed)

- [ ] **Step 1:** Write the page per the spec outline (sections 1–12), using PostLayout with the ribbon (Authors,
  Venue "Computer Graphics Forum, 2023", Affiliations "Ubisoft La Forge · York University", Tags), buttons
  ("Read the paper →" to `https://doi.org/10.1111/cgf.14734`, "Code", "Cite"), the YouTube embed, contents list,
  Clip component for the GenoView videos, Code blocks for the CLI, citation with copy button, references.
- [ ] **Step 2:** `npx astro check && npx vitest run && npm run build`. Expected: 0 errors, all tests pass, build
  completes, and `grep -l "three" dist/_astro/*.js` matches only chunks loaded by the ZeroEGGS page.
- [ ] **Step 3:** Browser checks: all four palettes, 375 px (no sideways scroll), reduced motion, every tooltip and
  table view, sound sync, players pausing off screen, navigation disposal.
- [ ] **Step 4:** Commit, push, open the PR (with the PR footer), and ask before merging.
