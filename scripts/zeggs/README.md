# ZeroEGGS page data

Scripts that make the motion clips, chart data and videos for `/projects/zeggs/`. They run once, offline; the
outputs are committed (`public/data/zeggs/`, `public/videos/projects/zeggs/`, `src/data/projects/zeggs-measured.json`).

## Setup

```sh
git clone https://github.com/ubisoft/ubisoft-laforge-ZeroEGGS.git zeggs-repo   # main, commit 5225afd or later
python3.12 -m venv zenv && zenv/bin/pip install -e "zeggs-repo[viewer,dev]"
```

The clean ZEGGS takes (67 BVH and WAV files) are read from `ZEGGS_DATA`
(default `~/Desktop/motion-coherence/real/data/clean`).

## Run

```sh
cd scripts/zeggs
../../zenv/bin/python -m pytest -p no:cacheprovider test_export.py
ZEGGS_REPO=path/to/zeggs-repo ../../zenv/bin/python make_page_data.py
```

`export.py` holds the clip format: `<stem>.json` (fps, frames, joints, parents, tracks, audio, contacts) and
`<stem>.bin` (little-endian Int16 positions in millimetres, tracks × frames × joints × 3).
