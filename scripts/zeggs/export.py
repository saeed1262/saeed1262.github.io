"""Motion clips for the ZeroEGGS project page's in-browser player.

A clip is <stem>.json (header) plus <stem>.bin: little-endian Int16 global joint positions in millimetres, y up,
laid out as tracks x frames x joints x 3, in the header's track order. Fingers are dropped (too small to see in the
player); each hand keeps one point along the middle finger so its direction shows.
"""
import json
from pathlib import Path

import numpy as np

from zeggs.anim import quat
from zeggs.postprocess import detect_contacts

BODY_JOINTS = [
    "Hips", "Spine", "Spine1", "Spine2", "Spine3", "Neck", "Neck1", "Head", "HeadEnd",
    "RightShoulder", "RightArm", "RightForeArm", "RightHand", "RightHandMiddle2",
    "LeftShoulder", "LeftArm", "LeftForeArm", "LeftHand", "LeftHandMiddle2",
    "RightUpLeg", "RightLeg", "RightFoot", "RightToeBase", "RightToeBaseEnd",
    "LeftUpLeg", "LeftLeg", "LeftFoot", "LeftToeBase", "LeftToeBaseEnd",
]
# Parents in the full 75-joint ZEGGS skeleton, for the joints above (checked against the dataset's BVH files).
_FULL_PARENT = {
    "Hips": None, "Spine": "Hips", "Spine1": "Spine", "Spine2": "Spine1", "Spine3": "Spine2", "Neck": "Spine3",
    "Neck1": "Neck", "Head": "Neck1", "HeadEnd": "Head",
    "RightShoulder": "Spine3", "RightArm": "RightShoulder", "RightForeArm": "RightArm", "RightHand": "RightForeArm",
    "RightHandMiddle2": "RightHand",  # via RightHandMiddle1, which is dropped
    "LeftShoulder": "Spine3", "LeftArm": "LeftShoulder", "LeftForeArm": "LeftArm", "LeftHand": "LeftForeArm",
    "LeftHandMiddle2": "LeftHand",
    "RightUpLeg": "Hips", "RightLeg": "RightUpLeg", "RightFoot": "RightLeg", "RightToeBase": "RightFoot",
    "RightToeBaseEnd": "RightToeBase",
    "LeftUpLeg": "Hips", "LeftLeg": "LeftUpLeg", "LeftFoot": "LeftLeg", "LeftToeBase": "LeftFoot",
    "LeftToeBaseEnd": "LeftToeBase",
}
ANKLES = {"left": "LeftFoot", "right": "RightFoot"}


def body_parents():
    """Parent index of each joint in BODY_JOINTS (-1 for the root)."""
    return [-1 if _FULL_PARENT[n] is None else BODY_JOINTS.index(_FULL_PARENT[n]) for n in BODY_JOINTS]


def _global_positions(anim):
    lrot = quat.from_euler(np.radians(anim["rotations"]), anim["order"])
    _, gpos = quat.fk(lrot, anim["positions"], anim["parents"])
    return gpos


def body_positions(anim, fps_out=30):
    """Global positions (frames, len(BODY_JOINTS), 3) in millimetres, resampled from the BVH's 60 fps."""
    step = int(round(1.0 / anim["frametime"] / fps_out))
    names = list(anim["names"])
    gpos = _global_positions(anim)[:, [names.index(n) for n in BODY_JOINTS]]
    return gpos[::step] * 10.0  # BVH units are cm


def contact_runs(anim, fps_out=30, height_margin=3.0, speed_thresh=30.0):
    """[start, end) contact runs per ankle at fps_out, with zeggs.postprocess's default thresholds."""
    fps = 1.0 / anim["frametime"]
    step = int(round(fps / fps_out))
    names = list(anim["names"])
    gpos = _global_positions(anim)
    out = {}
    for side, ankle in ANKLES.items():
        p = gpos[:, names.index(ankle)]
        speed = np.concatenate([[0.0], np.linalg.norm(np.diff(p, axis=0), axis=-1) * fps])
        contact = detect_contacts(p[:, 1], speed, np.percentile(p[:, 1], 5) + height_margin, speed_thresh)
        d = np.diff(np.concatenate([[0], contact.astype(np.int8), [0]]))
        starts, ends = np.flatnonzero(d == 1), np.flatnonzero(d == -1)
        out[side] = [(int(s // step), int(-(-e // step))) for s, e in zip(starts, ends)]
    return out


def write_clip(stem, tracks, fps, audio, contacts):
    """Write <stem>.json and <stem>.bin. Tracks: dicts with id, label, color and positions (frames, joints, 3) mm."""
    stem = Path(stem)
    stem.parent.mkdir(parents=True, exist_ok=True)
    frames = {len(t["positions"]) for t in tracks}
    assert len(frames) == 1, "all tracks need the same number of frames"
    data = np.stack([t["positions"] for t in tracks])
    assert np.abs(data).max() < 32767, "positions overflow Int16 millimetres; re-centre the tracks"
    np.rint(data).astype("<i2").tofile(stem.with_suffix(".bin"))
    header = dict(
        fps=fps, frames=frames.pop(), joints=BODY_JOINTS, parents=body_parents(),
        tracks=[dict(id=t["id"], label=t["label"], color=t["color"]) for t in tracks],
        audio=audio, contacts=contacts,
    )
    stem.with_suffix(".json").write_text(json.dumps(header, separators=(",", ":")))
