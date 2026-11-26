"""Record the GenoView clips for the ZeroEGGS page (run after make_page_data.py, with the same environment).

    ZEGGS_REPO=path/to/ubisoft-laforge-ZeroEGGS python make_videos.py

Every clip is cut to the page's 10 s window and turned to face the camera on average (a rigid turn, see
export.face_camera), so the characters start in their lanes and face the reader. The players' videos carry the speech;
the opening clip is silent. The four blend steps are recorded separately and tiled 2 x 2 into one 1920 x 1080 video,
so the page's slider can show one tile while all four stay in sync.
"""
import json
import subprocess
import sys
from pathlib import Path

from zeggs.anim import bvh

from export import face_camera
from make_page_data import DATA, FPS, OUT_JSON, REPO, SITE, cut

WORK = Path(__file__).resolve().parent / "work"
OUT = SITE / "public/videos/projects/zeggs"
RAW = WORK / "videos"
CHARCOAL, ORANGE, TEAL = "#3d3d3d", "#ffa100", "#00a087"


def window(src, start_s, name):
    dst = RAW / f"{name}.bvh"
    bvh.save(dst, face_camera(cut(bvh.load(src), int(round(start_s * FPS)))))
    return dst


def record(bvhs, labels, colors, dst, distance, size=(1280, 720), markers=False):
    cmd = [sys.executable, str(REPO / "tools/genoview/genoview.py"), *map(str, bvhs), "--labels", *labels,
           "--colors", *colors, "--record", str(dst), "--distance", str(distance), "--altitude", "0.2",
           "--size", str(size[0]), str(size[1])]
    subprocess.run(cmd + (["--foot-markers"] if markers else []), check=True, cwd=REPO, capture_output=True)
    return dst


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, args)], check=True)


def encode(src, name, audio=None, width=960):
    """H.264 for the page, with a poster; `audio` is (wav, start seconds) to mux in, or None for a silent clip."""
    OUT.mkdir(parents=True, exist_ok=True)
    video = ["-vf", f"scale={width}:-2", "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p"]
    if audio:
        wav, start = audio
        ffmpeg("-i", src, "-ss", f"{start:.3f}", "-t", "10", "-i", wav, "-map", "0:v", "-map", "1:a", *video,
               "-c:a", "aac", "-b:a", "64k", "-ac", "1", "-shortest", "-movflags", "+faststart", OUT / f"{name}.mp4")
    else:
        ffmpeg("-i", src, "-an", *video, "-movflags", "+faststart", OUT / f"{name}.mp4")
    ffmpeg("-ss", "1", "-i", src, "-frames:v", "1", "-vf", f"scale={width}:-2", "-q:v", "4", OUT / f"{name}.jpg")


def main():
    RAW.mkdir(parents=True, exist_ok=True)
    clips = json.loads(OUT_JSON.read_text())["clips"]
    speech = (DATA / f"{clips['speechTake']}_x_1_0.wav", clips["speechStart"])

    # Opening clip: three styles on one line of speech (silent, loops).
    styles = [window(WORK / f"blend_w{w}.bvh", clips["speechStart"], f"styles_w{w}") for w in (0, 50, 100)]
    encode(record(styles, ["Old", "Halfway", "Oration"], [CHARCOAL] * 3, RAW / "styles.mp4", 4.6), "styles")

    # Blending: one character per tile, the same camera, tiled 2 x 2 (Old, 1/3, 2/3, Oration).
    names = {0: "Old", 33: "1/3 Oration", 67: "2/3 Oration", 100: "Oration"}
    tiles = [record([window(WORK / f"blend_w{w}.bvh", clips["speechStart"], f"blend_w{w}")], [names[w]], [CHARCOAL],
                    RAW / f"blend_w{w}.mp4", 2.7, size=(960, 540)) for w in clips["blendWeights"]]
    ffmpeg(*sum((["-i", t] for t in tiles), []), "-filter_complex",
           "[0:v][1:v][2:v][3:v]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[v]", "-map", "[v]",
           "-c:v", "libx264", "-crf", "18", RAW / "blend.mp4")
    encode(RAW / "blend.mp4", "blend", audio=speech, width=1920)

    # Variation: three takes of the same speech and style.
    takes = [window(WORK / f"variation_s{s}.bvh", clips["speechStart"], f"variation_s{s}") for s in (1, 2, 3)]
    encode(record(takes, ["Take 1", "Take 2", "Take 3"], [CHARCOAL] * 3, RAW / "variation.mp4", 4.6), "variation",
           audio=speech)

    # Feet: raw and fixed, with GenoView's foot-slide markers.
    pair = clips["feetPair"]
    raw = window(WORK / f"pair_{pair['style']}_on_{pair['speech']}.bvh", clips["feetStart"], "feet_raw")
    fixed = window(WORK / "feet_fixed.bvh", clips["feetStart"], "feet_fixed")
    encode(record([raw, fixed], ["raw", "fix_feet"], [ORANGE, TEAL], RAW / "feet.mp4", 3.8, markers=True), "feet",
           audio=(DATA / f"{pair['speech']}_x_1_0.wav", clips["feetStart"]))

    # Social preview: 1200 x 630 from the opening clip.
    ffmpeg("-ss", "4", "-i", RAW / "styles.mp4", "-frames:v", "1", "-vf", "scale=1200:-2,crop=1200:630", "-q:v", "3",
           SITE / "public/images/projects/zeggs.jpg")
    for f in sorted(OUT.iterdir()):
        print(f"{f.name}: {f.stat().st_size / 1e6:.2f} MB")


if __name__ == "__main__":
    main()
