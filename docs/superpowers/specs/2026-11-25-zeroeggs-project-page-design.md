# ZeroEGGS project page: design

Date: 2026-11-25. Branch: `zeggs-page`.

## Intent

Turn `/projects/zeggs/` from a short Markdown page into an in-depth, interactive page in the same style as the
UPose3D, Aether Weaver and Probing Physics pages. It tells two stories:

1. **The paper** (Computer Graphics Forum 2023, Ghorbani, Ferstl, Holden, Troje, Carbonneau): gestures from speech,
   with style given by a short example clip.
2. **What is new in the code (November 2026)**, all Saeed's own work: the package modernised for Python 3.12 and
   PyTorch 2.x, foot sliding cleanup (`--fix_feet`), heading drift correction (`--fix_heading`), and the GenoView
   viewer and recorder with ZEGGS-to-Geno retargeting.

The thread that joins them: the paper's limitations section says ZeroEGGS "generates small amounts of foot sliding"
that "can be addressed with IK-based post-processing". The 2026 update does exactly that.

Readers are researchers, engineers and recruiters. The page should show that the work is solid, careful and still
maintained, and let readers see the motion rather than read about it.

## Goals

- Same look and structure as the other in-depth project pages: tile ribbon with metadata, plain accent
  "Read the paper →" button, contents list, figures as wide as the text (48 rem column), BibTeX citation, numbered
  references.
- Motion readers can play with: an in-browser 3D player for blending, variation and the feet comparison.
- Short videos recorded with GenoView, to show the new viewer itself.
- Every number on the page comes from the paper, the README, or a script run on the released models and data.

## Non-goals

- No model inference in the browser.
- No changes to the ZeroEGGS repository.
- The Geno mesh is not shown in the web player (it is not ours to redistribute). The web player draws a simple
  capsule body. Geno appears only in the recorded videos.

## Anti-goals (a failure even if it works)

- A slow or heavy page: the 3D library and motion data must load only on this page, only when a player scrolls into
  view.
- Claims the paper or our own measurements do not support. The current page has some (a "hierarchical variational
  autoencoder with attention for speech-gesture alignment", robotics uses); they go.
- Gradient buttons, or figures wider or narrower than the text.

## Approaches considered

| Approach | Trade-off |
|---|---|
| **In-browser player plus GenoView videos (chosen by Saeed)** | Most work. Interactive figures like the other pages, and still shows off the viewer. |
| GenoView videos only | Fast, but the blending, variation and feet sections become videos to watch, not things to try. |
| In-browser player only | Interactive, but would not show the new viewer, which is one of the updates. |

## Page outline

Header (PostLayout with `ribbon`):

- Ribbon: Authors (Saeed Ghorbani, Ylva Ferstl, Daniel Holden, Nikolaus F. Troje, Marc-André Carbonneau);
  Venue: Computer Graphics Forum, 2023; Affiliations: Ubisoft La Forge · York University; Tags (from the Markdown).
- Buttons: "Read the paper →" (DOI 10.1111/cgf.14734, solid accent, no gradient), "Code" (GitHub), "Cite".
- The existing YouTube video under the header.

Sections (British spelling, as on the other pages; "we" for the paper, "I" for the 2026 work):

1. **Overview.** Speech is a weak signal for gestures (one line fits many motions); styles are hard to name but
   easy to show. So ZeroEGGS takes the style from an example clip, including styles it never saw in training.
2. **How it works.** Clickable diagram of the speech encoder, style encoder and gesture generator. Clicking a part
   shows what it takes in and puts out, with sizes from the paper (80 mel bands plus energy at 60 fps; 64-number
   speech embedding; 64-number sampled style embedding; two GRU layers of 1024; hidden-state initialiser; target
   facing direction). Extends the blog's `ZeroEggsDiagram`.
3. **The style space.** Scatter of style embeddings for windows of all 67 takes, projected to 2D with PCA.
   Nineteen styles are too many to colour apart, so all points are a neutral grey and a row of style chips
   highlights one style at a time in the accent colour; hovering a point names its take and style, and a table view
   lists each style's mean position. The paper found the first direction tracks body sway and the second hand
   height; the page states this only if our own measurement agrees (see Data).
4. **Blending and variation.** Player figure A: one speech line, a slider from one style to another in five
   steps. Player figure B: three takes of the same speech and style side by side, sampled with different seeds.
5. **The dataset.** Minutes per style for the 19 styles (135 minutes, one actor, 60 fps, 75 joints with fingers).
6. **Results.** The user study against MoGlow: naturalness, appropriateness and style on both datasets, with the
   ± spread from the paper's Table 2, and a note that MUSHRA-style scores are relative. Two small stat tiles: 25 M
   against 86 M parameters, 4 ms against 29 ms per frame.
7. **Clean feet (2026).** Why generated feet slide, then the method step by step: find planted feet (low and slow,
   short gaps filled, short contacts dropped); remove whole-body skating by moving the root back by the planted
   feet's drift; pin each contact to one position and orientation, easing in and out; re-solve hip and knee with
   two-bone IK; lower the hips when a pinned foot is out of reach. Figures:
   - Player figure C: raw (orange) and fixed (charcoal) side by side, with foot trails on the floor during
     contacts (raw smears, fixed stays put).
   - Contact timeline: ankle height and horizontal speed for one foot over the same clip, with both thresholds and
     the contact runs shaded.
   - IK toy: a 2D leg in SVG; drag the foot target and see the hip and knee solve; past reach, the hips drop.
   - Results: low-foot speed before and after for three runs measured by the data script (see Data), against the
     range of the real mocap takes, with the "% of low-foot frames moving" in the table view. A note that the score
     counts real steps too.
8. **Turning away from the camera (2026).** Why it happens (the model integrates its own turning speed). Chart of
   heading over time for the worst README clip, raw against `--fix_heading`, with the ±20° band.
9. **Seeing it on a character: GenoView (2026).** Two or three recorded clips (Clip component, looping, muted):
   raw against fixed with foot markers, and one style comparison. Text on what the viewer does (side by side,
   labels and colours, audio in sync, timeline, onion skinning, recording to MP4 or GIF) and on `zeggs-retarget`
   (constant rotation offset per joint, fitted on Maya-retargeted takes, within 0.04° per joint). Credit to
   Daniel Holden's GenoViewPython.
10. **Modernised (2026).** Python 3.10+ (tested on 3.12), PyTorch 2.4+, CUDA or Apple MPS or CPU, installable
    package with command-line tools, checkpoints loaded safely, regression tests against the original code. Quickstart
    code block.
11. **Limitations.** From the paper (behind mocap; subtle style motions like Agreement head nods are rare; beat
    gestures only, no meaning from the words; less suited to speakers who walk around) and from the update (the
    skating score counts real steps; heading fix is a cap, not a cure).
12. **Citation** (BibTeX with copy button) and **References**.

## The motion player

- **Library:** `three` added as a dependency, loaded with a dynamic `import()` only by this page's player script, and
  only once a player is near the viewport (IntersectionObserver). Players pause when off screen.
- **Body:** capsules along each bone and a sphere head, flat-shaded, in the GenoView colours (orange `#ffa100`,
  charcoal `#3d3d3d`, teal `#00a087`), on a light grey checkered floor with soft contact shadows. The stage stays
  light in every palette, like the Probing Physics clips.
- **Camera:** fixed front three-quarter view; drag to orbit within a limited range; double-click resets.
- **Controls** (HTML over the canvas): play/pause, a scrubber, sound on/off (muted by default; browsers block
  autoplayed sound), labels above each character. Space toggles play when focused.
- **Clock:** with sound on, the audio element's time drives the frame; with sound off, the page clock does.
- **Overlays:** foot trails (ankle positions on the floor during contact frames) for the feet figure.
- **Reduced motion:** no autoplay; the first frame shows with a play button.
- **No WebGL:** a poster image and the caption.
- **Accessibility:** each player has a text label of what it shows, and the controls are buttons with names.

## Data (offline, run once)

A Python script in the site repo, `scripts/zeggs/make_page_data.py`, run against a local checkout of
ubisoft-laforge-ZeroEGGS at the November 2026 commit, in its own virtual environment
(`pip install -e ".[viewer]"`). Inputs: the released v1 model in the repository's `data/outputs/v1`, and the clean
ZEGGS takes already on this machine at `~/Desktop/motion-coherence/real/data/clean` (67 BVH and WAV files).
Seeds are fixed, and the script prints every number the page uses.

It writes:

- **Player clips**, to `public/data/zeggs/`: one JSON header per figure (joint names and parents, fps, frame count,
  labels, contact runs) and one binary file of joint positions (Int16, millimetres, 30 fps, body joints only; the
  fingers are dropped because they are not visible at this size). Speech excerpts as small AAC files.
  - Speech excerpt: about 10 s of continuous speech (highest average loudness among 10 s windows) from one
    Neutral take, used for both blending and variation.
  - Blending: five style weights between two styles with clearly different posture (proposed: Old and Oration,
    as in the paper's Figure 7). The page does not claim either style was unseen by the released model.
  - Variation: the same excerpt and one style, three seeds.
  - Feet: the README's worst case used a Happy example on Angry speech, but does not name the files. The script
    tries Happy examples against Angry takes, keeps the pair with the highest raw low-foot speed, and cuts the 10 s
    window where skating is clearest; raw and `--fix_feet` versions.
- **Chart data**, to `src/data/projects/zeggs.ts` (or a JSON next to it): style-space points (PCA of the style
  encoder's mean over 8 s windows of all takes) with their style and take; the correlation of PC1 with root speed and
  PC2 with hand height; the contact timeline series (left foot); the heading series for raw and fixed over the whole
  feet run (downsampled); and the skating numbers for three runs (v1 example-based, v2 label-based Happy, the
  worst pair) plus the mocap range measured over all 67 takes. These are measured by the script, labelled as such,
  and may differ slightly from the README's.
- **GenoView videos**, to `public/videos/projects/zeggs/`: recorded with
  `genoview.py ... --record` (H.264, about 10 s each, with posters). GenoView fetches the Geno mesh itself from the
  pinned GenoViewPython commit and checks its SHA-256. If recording fails on this Mac, the fallback is the
  repository's `media/foot_fix.gif` converted to MP4.

Paper numbers (user study, model size, speed, dataset minutes, BibTeX) are typed into `src/data/projects/zeggs.ts`
with a comment naming the table they come from.

## Files

- `src/pages/projects/zeggs.astro` (new), and `customPage: true` in `src/content/projects/zeggs.md`.
- `src/components/projects/zeggs/`: `MotionPlayer.astro`, `StyleMap.astro`, `ContactTimeline.astro`,
  `IkToy.astro`, `SkatingChart.astro`, `HeadingChart.astro`, `StudyChart.astro`, `DatasetChart.astro`, and the
  extended diagram.
- `src/scripts/motion-player.ts` (player), `src/scripts/ik.ts` (two-bone solver for the toy), each with vitest tests.
- `public/images/projects/zeggs.jpg` (social preview, from a GenoView frame).

## Budgets

- New assets under about 10 MB in total (videos up to 6 MB, motion data up to 3 MB, audio up to 1 MB).
- Nothing from `three` on any other page.

## Checks before the PR

- `astro check`, `vitest`, `npm run build` all pass.
- In the browser: all four palettes, phone width (375 px, no sideways scroll), reduced motion, sound sync, players
  pausing off screen, every chart's tooltip and table view.
- Charts follow the dataviz rules (validated colours, legend for two or more series, no dual axes).

## Calls made by Claude (please check)

- Speech audio: short excerpts from the ZEGGS dataset play in the players, muted until the reader turns sound on,
  with the dataset credited.
- Blend endpoints Old and Oration; variation and style choices are picked by the script and can be changed.
- Fingers dropped from the web player; they remain in the GenoView videos.
- The page uses "we" for the paper and "I" for the 2026 work.
- One PR for the whole page.
