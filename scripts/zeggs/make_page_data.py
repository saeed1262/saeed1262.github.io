"""Make the motion clips, audio and chart data for the ZeroEGGS project page.

    ZEGGS_REPO=path/to/ubisoft-laforge-ZeroEGGS python make_page_data.py [--work DIR]

Generation results are cached in the work folder (default: ./work, git-ignored), so reruns only redo the exports.
Every number the page uses is printed at the end and written to src/data/projects/zeggs-measured.json.
"""
import argparse
import json
import os
import subprocess
from pathlib import Path

import numpy as np
import torch

from export import BODY_JOINTS, body_positions, contact_runs, face_camera, write_clip

BODY_JOINTS_INDEX = [BODY_JOINTS.index("LeftFoot"), BODY_JOINTS.index("RightFoot")]
from zeggs.anim import bvh
from zeggs.audio.audio_files import read_wavfile
from zeggs.generate import anim_features, generate_gesture, load_module, get_device
from zeggs.modules import example_feature_vector
from zeggs.postprocess import fix_foot_sliding, fix_heading_drift, foot_skating, heading

SITE = Path(__file__).resolve().parents[2]
REPO = Path(os.environ.get("ZEGGS_REPO", "zeggs-repo")).resolve()
DATA = Path(os.environ.get("ZEGGS_DATA", Path.home() / "Desktop/motion-coherence/real/data/clean"))
OUT_CLIPS = SITE / "public/data/zeggs"
OUT_JSON = SITE / "src/data/projects/zeggs-measured.json"

FPS = 60
WINDOW = 10 * FPS          # player clips: 10 s
SKIP = 5 * FPS             # never start a window in a take's first 5 s
STYLE_FRAMES = [600, 1080]  # style examples: 8 s from 10 s into the take
COLORS = {"raw": "#ffa100", "fixed": "#00a087", "neutral": "#3d3d3d"}  # GenoView's orange, teal, charcoal
NAMES = {"Speech": "Oration"}  # the dataset's file names call Oration "Speech"
# The styles in the paper's Figure 8a; the style map's PCA is fitted on these, and the others are projected into it.
PAPER_STYLES = ["Neutral", "Happy", "Angry", "Relaxed", "Tired", "Sad", "Oration", "Still"]
BLEND_WEIGHTS = (0, 33, 67, 100)  # % Oration; a 2 x 2 grid of video tiles


def take(name):
    return DATA / f"{name}_x_1_0.bvh"


def takes(style):
    return sorted(p.name[:-len("_x_1_0.bvh")] for p in DATA.glob(f"*_{style}_*_x_1_0.bvh"))


def model(version):
    base = REPO / "data"
    return dict(network_path=base / f"outputs/{version}/saved_models", data_path=base / f"processed_{version}")


def generate(work, name, audio, styles, version="v1", **kw):
    """Cached generate_gesture; returns the raw BVH path."""
    out = work / f"{name}.bvh"
    if not out.exists():
        generate_gesture(audio_file=str(audio), styles=styles, results_path=str(work), file_name=name,
                         **model(version), **kw)
    return out


def cut(anim, start, length=WINDOW):
    return dict(anim, rotations=anim["rotations"][start:start + length],
                positions=anim["positions"][start:start + length])


def recentred(pos):
    """Move the first frame's hips to x = z = 0 (positions in mm, frames x joints x 3)."""
    return pos - pos[0, 0] * np.array([1, 0, 1])


def cut_runs(runs, start, end):
    """Contact runs (30 fps frames) clipped to [start, end) and shifted to start at 0."""
    return {side: [[max(s, start) - start, min(e, end) - start] for s, e in r if e > start and s < end]
            for side, r in runs.items()}


def audio_excerpt(wav, start_s, seconds, dst):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{start_s:.3f}", "-t", f"{seconds}", "-i", str(wav),
                    "-ac", "1", "-c:a", "aac", "-b:a", "64k", str(dst)], check=True)


def loudest_window(wav):
    """Start (in 60 fps frames) of the 10 s window with the highest RMS, on whole seconds, after SKIP."""
    fs, x = read_wavfile(str(wav), rescale=True, desired_nb_channels=1, out_type="float32")
    x = np.asarray(x).reshape(-1)
    sec = np.sqrt(np.add.reduceat(x.astype(np.float64) ** 2, np.arange(0, len(x) - fs, fs)) / fs)
    best = max(range(SKIP // FPS, len(sec) - 10), key=lambda i: sec[i:i + 10].mean())
    return best * FPS, float(sec[best:best + 10].mean())


def low_foot_speed(anim, height_margin=3.0):
    """Per-frame mean horizontal speed (cm/s) of the feet that are near the floor (as zeggs.postprocess.foot_skating)."""
    from zeggs.anim import quat
    names, fps = list(anim["names"]), 1.0 / anim["frametime"]
    lrot = quat.from_euler(np.radians(anim["rotations"]), anim["order"])
    _, gpos = quat.fk(lrot, anim["positions"], anim["parents"])
    total, count = np.zeros(len(gpos) - 1), np.zeros(len(gpos) - 1)
    for joint in ("LeftFoot", "LeftToeBase", "RightFoot", "RightToeBase"):
        p = gpos[:, names.index(joint)]
        low = p[1:, 1] < np.percentile(p[:, 1], 5) + height_margin
        v = np.linalg.norm(np.diff(p[:, [0, 2]], axis=0), axis=-1) * fps
        total += v * low
        count += low
    return np.concatenate([[0.0], total / np.maximum(count, 1)])


def skating(anim):
    speed, moving = foot_skating(anim)
    turn = float(np.abs(heading(anim) - heading(anim)[0]).max())
    return dict(speed=round(speed, 2), moving=round(100 * moving, 1), turn=round(turn))


def style_map():
    """PCA of the v1 style encoder's mean embedding over non-overlapping 8 s windows of every take.

    As in the paper's Figure 8a, the PCA is fitted on the windows of eight styles; the other styles are projected into
    the same two directions. Signs are arbitrary, so the first direction points towards more sway and the second
    towards higher hands."""
    device = get_device(True)
    paths = model("v1")
    encoder = load_module(paths["network_path"] / "style_encoder.pt", device)
    stats = np.load(paths["data_path"] / "stats.npz")
    mean = torch.as_tensor(stats["anim_input_mean"], dtype=torch.float32, device=device)
    std = torch.as_tensor(stats["anim_input_std"], dtype=torch.float32, device=device)
    rows, meta = [], []
    for path in sorted(DATA.glob("*_x_1_0.bvh")):
        anim = bvh.load(path)
        name = path.name[:-len("_x_1_0.bvh")]
        style = NAMES.get(name.split("_")[1], name.split("_")[1])
        for s in range(0, len(anim["rotations"]) - 480 + 1, 480):
            window = cut(anim, s, 480)
            pose = anim_features(window, device)
            example = example_feature_vector(*(pose[k] for k in ("root_vel", "root_vrt", "lpos", "ltxy", "lvel", "lvrt")))
            with torch.no_grad():
                _, mu, _ = encoder(((example - mean) / std)[None], 1.0)
            rows.append(mu[0].cpu().numpy())
            pos = body_positions(window) / 10.0  # cm, 30 fps
            hips = pos[:, 0]
            sway = np.linalg.norm(np.diff(hips[:, [0, 2]], axis=0), axis=-1).mean() * 30
            hands = pos[:, [12, 17], 1].mean(1) - hips[:, 1]  # RightHand, LeftHand height above the hips
            meta.append(dict(style=style, take=name, start=s // FPS, sway=sway, hand=hands.mean()))
    X = np.array(rows)
    fit = np.array([m["style"] in PAPER_STYLES for m in meta])
    centre = X[fit].mean(0)
    _, svals, vt = np.linalg.svd(X[fit] - centre, full_matrices=False)
    pcs = (X - centre) @ vt[:2].T
    sway = np.array([m["sway"] for m in meta])
    hand = np.array([m["hand"] for m in meta])
    r1, r2 = np.corrcoef(pcs[fit, 0], sway[fit])[0, 1], np.corrcoef(pcs[fit, 1], hand[fit])[0, 1]
    pcs[:, 0] *= np.sign(r1)  # the sign of a principal component is arbitrary: point it along the measure
    pcs[:, 1] *= np.sign(r2)
    explained = (svals ** 2 / (svals ** 2).sum())[:2]
    points = [dict(x=round(float(x), 3), y=round(float(y), 3), style=m["style"], take=m["take"], start=m["start"],
                   fit=bool(f)) for (x, y), m, f in zip(pcs, meta, fit)]
    means = {s: [round(float(pcs[[m["style"] == s for m in meta], k].mean()), 2) for k in (0, 1)] for s in PAPER_STYLES}
    return dict(points=points, fitStyles=PAPER_STYLES, pc1SwayR=round(abs(float(r1)), 2),
                pc2HandR=round(abs(float(r2)), 2), explained=[round(float(e), 3) for e in explained], means=means)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--work", default=Path(__file__).parent / "work", type=Path)
    args = parser.parse_args()
    work = args.work.resolve()
    work.mkdir(parents=True, exist_ok=True)
    OUT_CLIPS.mkdir(parents=True, exist_ok=True)
    measured = {}

    # Speech excerpt for blending and variation: the loudest 10 s of a Neutral take.
    best = max(((t, *loudest_window(DATA / f"{t}_x_1_0.wav")) for t in takes("Neutral")), key=lambda r: r[2])
    speech_take, speech_start, _ = best
    speech_wav = DATA / f"{speech_take}_x_1_0.wav"

    def example(style, i=0):
        return (str(take(takes(style)[i])), STYLE_FRAMES)

    common = dict(first_pose=str(take(speech_take)), seed=1234)

    # Blending Old and Oration, and three takes of one style. The page shows them as GenoView recordings
    # (make_videos.py); here they are only generated (and cached).
    for w in BLEND_WEIGHTS:
        generate(work, f"blend_w{w}", speech_wav, [example("Old"), example("Speech")],
                 blend_type="add", blend_ratio=[1 - w / 100, w / 100], **common)
    for seed in (1, 2, 3):
        generate(work, f"variation_s{seed}", speech_wav, [example("Happy")], **dict(common, seed=seed))

    # Feet: the Happy-example / Angry-speech pair with the most raw foot skating.
    pairs = []
    for h in takes("Happy"):
        for a in takes("Angry"):
            path = generate(work, f"pair_{h}_on_{a}", DATA / f"{a}_x_1_0.wav", [(str(take(h)), None)], seed=1234)
            pairs.append((foot_skating(bvh.load(path))[0], h, a, path))
            print(f"pair {h} on {a}: {pairs[-1][0]:.2f} cm/s")
    _, happy, angry, raw_path = max(pairs)
    raw = bvh.load(raw_path)
    fixed = fix_foot_sliding(fix_heading_drift(raw))
    bvh.save(work / "feet_fixed.bvh", fixed)
    speed = low_foot_speed(raw)
    rolling = np.convolve(speed, np.ones(WINDOW) / WINDOW, mode="valid")
    feet_start = SKIP + int(np.argmax(rolling[SKIP:]))
    feet_start -= feet_start % 2  # on a 30 fps frame
    s30, e30 = feet_start // 2, (feet_start + WINDOW) // 2
    feet_tracks, feet_contacts = [], {}
    for tid, label, anim in (("raw", "Raw", raw), ("fixed", "--fix_feet", fixed)):
        # Turned to face the camera on average, as in the recorded video (a rigid turn: sliding is unchanged).
        feet_tracks.append(dict(id=tid, label=label, color=COLORS[tid],
                                positions=recentred(body_positions(face_camera(cut(anim, feet_start))))))
        feet_contacts[tid] = cut_runs(contact_runs(anim), s30, e30)
    # The floor views draw each track in its own re-centred coordinates; contacts are frame indices only.
    write_clip(OUT_CLIPS / "feet", feet_tracks, fps=30, audio=None, contacts=feet_contacts)

    # Contact timeline: raw left ankle over the feet window, as the first detection pass sees it.
    from zeggs.anim import quat
    lrot = quat.from_euler(np.radians(raw["rotations"]), raw["order"])
    _, gpos = quat.fk(lrot, raw["positions"], raw["parents"])
    ankle = gpos[:, list(raw["names"]).index("LeftFoot")]
    rest = np.percentile(ankle[:, 1], 5)
    vel = np.concatenate([[0.0], np.linalg.norm(np.diff(ankle, axis=0), axis=-1) * FPS])
    win = slice(feet_start, feet_start + WINDOW, 2)
    measured["timeline"] = dict(
        fps=30, height=[round(float(v), 2) for v in ankle[win, 1] - rest], speed=[round(float(v), 1) for v in vel[win]],
        heightThresh=3.0, speedThresh=30.0, contacts=cut_runs(contact_runs(raw), s30, e30)["left"])

    # Heading over the whole worst run, 10 fps.
    h_raw, h_fix = heading(raw), heading(fixed)
    measured["heading"] = dict(fps=10, raw=[round(float(v), 1) for v in (h_raw - h_raw[0])[::6]],
                               fixed=[round(float(v), 1) for v in (h_fix - h_fix[0])[::6]], limit=20)

    # Foot skating before and after, three runs, and the real mocap's range.
    own = generate(work, "v1_own_speech", DATA / "067_Speech_2_x_1_0.wav", [(str(take("067_Speech_2")), None)],
                   seed=1234)
    label = generate(work, "v2_happy", DATA / "067_Speech_2_x_1_0.wav", ["Happy"], version="v2",
                     style_encoding_type="label", first_pose=str(take("067_Speech_2")), seed=1234)
    runs = []
    for text, anim, fix in (
        ("v1, example-based", bvh.load(own), fix_foot_sliding),
        ("v2, label-based (Happy)", bvh.load(label), fix_foot_sliding),
        ("v1, Happy example on Angry speech (worst pair)", raw, lambda a: fix_foot_sliding(fix_heading_drift(a))),
    ):
        runs.append(dict(label=text, seconds=round(len(anim["rotations"]) / FPS), before=skating(anim),
                         after=skating(fix(anim))))
    # The score counts real steps too, so lively mocap takes score high: report the spread, and the Happy takes.
    mocap = {p.name[:-len("_x_1_0.bvh")]: foot_skating(bvh.load(p))[0] for p in sorted(DATA.glob("*_x_1_0.bvh"))}
    values = np.array(list(mocap.values()))
    happy_mocap = [v for k, v in mocap.items() if "_Happy_" in k]
    p25, p50, p75 = np.percentile(values, [25, 50, 75])
    measured["skating"] = dict(runs=runs, mocap=dict(
        p25=round(float(p25), 2), median=round(float(p50), 2), p75=round(float(p75), 2),
        min=round(float(values.min()), 2), max=round(float(values.max()), 2),
        happyMin=round(min(happy_mocap), 1), happyMax=round(max(happy_mocap), 1),
        example=round(mocap[happy], 1)))

    # How far a planted ankle drifts during each contact of the feet clip (cm), raw and fixed.
    def drifts(track):
        pos = track["positions"][:, BODY_JOINTS_INDEX] / 10.0
        out = []
        for side, runs_ in feet_contacts[track["id"]].items():
            p = pos[:, 0 if side == "left" else 1]
            for s_, e_ in runs_:
                if e_ - s_ >= 10:
                    seg = p[s_:e_][:, [0, 2]]
                    out.append(float(np.linalg.norm(seg - seg[0], axis=-1).max()))
        return out
    measured["feetDrift"] = {t["id"]: dict(median=round(float(np.median(drifts(t))), 1), max=round(max(drifts(t)), 1))
                             for t in feet_tracks}

    measured["styleMap"] = style_map()
    measured["clips"] = dict(speechTake=speech_take, speechStart=speech_start / FPS, blendStyles=["Old", "Oration"],
                             blendWeights=list(BLEND_WEIGHTS),
                             blendTakes=[takes("Old")[0], takes("Speech")[0]], variationStyle="Happy",
                             variationTake=takes("Happy")[0], styleFrames=STYLE_FRAMES,
                             feetPair=dict(style=happy, speech=angry), feetPairs=len(pairs),
                             feetStart=feet_start / FPS)
    OUT_JSON.write_text(json.dumps(measured, separators=(",", ":")))

    sm = measured["styleMap"]
    print(f"speech excerpt: {speech_take} from {speech_start / FPS:.0f} s")
    print(f"feet pair: {happy} on {angry}, window from {feet_start / FPS:.1f} s")
    for r in runs:
        print(f"skating {r['label']} ({r['seconds']} s): {r['before']} -> {r['after']}")
    print(f"mocap skating: {measured['skating']['mocap']}")
    print(f"feet clip drift during contacts (cm): {measured['feetDrift']}")
    print(f"style map: {len(sm['points'])} windows ({sum(p['fit'] for p in sm['points'])} fitted), |r| PC1~sway "
          f"{sm['pc1SwayR']}, PC2~hand {sm['pc2HandR']}, explained {sm['explained']}, means {sm['means']}")
    print(f"heading: raw max {np.abs(h_raw - h_raw[0]).max():.0f} deg, fixed max {np.abs(h_fix - h_fix[0]).max():.0f}")


if __name__ == "__main__":
    main()
