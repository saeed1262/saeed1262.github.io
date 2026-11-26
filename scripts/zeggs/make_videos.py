"""Record the GenoView clips for the ZeroEGGS page (run after make_page_data.py, with the same environment).

    ZEGGS_REPO=path/to/ubisoft-laforge-ZeroEGGS python make_videos.py

Each clip is cut to the page's 10 s window first, so the characters start in their lanes. The recordings are
re-encoded small, without sound (the page's players carry the speech), with a poster frame each.
"""
import json
import subprocess
import sys
from pathlib import Path

from zeggs.anim import bvh

from make_page_data import FPS, OUT_JSON, REPO, SITE, cut

WORK = Path(__file__).resolve().parent / "work"
OUT = SITE / "public/videos/projects/zeggs"
RAW = WORK / "videos"


def window(src, start_s, name):
    dst = RAW / f"{name}.bvh"
    bvh.save(dst, cut(bvh.load(src), int(round(start_s * FPS))))
    return dst


def record(bvhs, labels, colors, dst, distance, markers=False):
    cmd = [sys.executable, str(REPO / "tools/genoview/genoview.py"), *map(str, bvhs), "--labels", *labels,
           "--colors", *colors, "--record", str(dst), "--distance", str(distance), "--altitude", "0.2"]
    subprocess.run(cmd + (["--foot-markers"] if markers else []), check=True, cwd=REPO, capture_output=True)


def encode(src, name):
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-an", "-vf", "scale=960:-2",
                    "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p",
                    "-movflags", "+faststart", str(OUT / f"{name}.mp4")], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1", "-i", str(src), "-frames:v", "1",
                    "-vf", "scale=960:-2", "-q:v", "4", str(OUT / f"{name}.jpg")], check=True)


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    clips = json.loads(OUT_JSON.read_text())["clips"]
    pair = clips["feetPair"]

    raw = window(WORK / f"pair_{pair['style']}_on_{pair['speech']}.bvh", clips["feetStart"], "feet_raw")
    fixed = window(WORK / "feet_fixed.bvh", clips["feetStart"], "feet_fixed")
    record([raw, fixed], ["raw", "fix_feet"], ["#ffa100", "#00a087"], RAW / "feet.mp4", 4.2, markers=True)
    encode(RAW / "feet.mp4", "feet")

    styles = [window(WORK / f"blend_w{w}.bvh", clips["speechStart"], f"styles_w{w}") for w in (0, 50, 100)]
    record(styles, ["Old", "Halfway", "Oration"], ["#3d3d3d"] * 3, RAW / "styles.mp4", 5.2)
    encode(RAW / "styles.mp4", "styles")

    # Social preview: 1200 x 630 from the styles clip.
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "4", "-i", str(RAW / "styles.mp4"), "-frames:v", "1",
                    "-vf", "scale=1200:-2,crop=1200:630", "-q:v", "3", str(SITE / "public/images/projects/zeggs.jpg")],
                   check=True)
    for f in sorted(OUT.iterdir()):
        print(f"{f.name}: {f.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
