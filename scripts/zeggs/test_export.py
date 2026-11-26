"""Round trip of the page's motion clip format (run with the zeggs venv: pytest scripts/zeggs)."""
import json
import os
from pathlib import Path

import numpy as np
import pytest

from export import BODY_JOINTS, body_parents, body_positions, write_clip
from zeggs.anim import bvh

DATA = Path(os.environ.get("ZEGGS_DATA", Path.home() / "Desktop/motion-coherence/real/data/clean"))
TAKE = DATA / "001_Neutral_0_x_1_0.bvh"


@pytest.mark.skipif(not TAKE.exists(), reason="ZEGGS clean takes not found (set ZEGGS_DATA)")
def test_round_trip(tmp_path):
    anim = bvh.load(TAKE)
    anim = dict(anim, rotations=anim["rotations"][:120], positions=anim["positions"][:120])
    pos = body_positions(anim)
    tracks = [dict(id="a", label="A", color="#ffa100", positions=pos),
              dict(id="b", label="B", color="#3d3d3d", positions=pos + 10.0)]

    write_clip(tmp_path / "clip", tracks, fps=30, audio=None, contacts=None)

    header = json.loads((tmp_path / "clip.json").read_text())
    data = np.fromfile(tmp_path / "clip.bin", "<i2").reshape(2, header["frames"], len(header["joints"]), 3)
    assert data.shape == (2, 60, len(BODY_JOINTS), 3)
    assert np.abs(data[0] - pos).max() <= 0.5
    assert np.abs(data[1] - (pos + 10.0)).max() <= 0.5
    assert header["parents"][0] == -1
    assert len(header["parents"]) == len(header["joints"])
    assert header["parents"] == body_parents()
    assert [t["id"] for t in header["tracks"]] == ["a", "b"]
