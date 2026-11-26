// Motion clips for the ZeroEGGS page's video players: decoding, timing and the floor view's data, with no DOM so
// they can be tested.
// Format (scripts/zeggs/export.py): a JSON header and a little-endian Int16 binary of global joint positions in
// millimetres, y up, laid out as tracks x frames x joints x 3.

export interface ClipTrack { id: string; label: string; color: string }
export type Runs = [number, number][];
export interface ClipHeader {
  fps: number;
  frames: number;
  joints: string[];
  parents: number[];
  tracks: ClipTrack[];
  audio: string | null;
  contacts: Record<string, { left: Runs; right: Runs }> | null;
}
/** Positions in metres, one Float32Array (frames x joints x 3) per track. */
export interface Clip { header: ClipHeader; tracks: Float32Array[] }

export function decodeClip(header: ClipHeader, buffer: ArrayBuffer): Clip {
  const per = header.frames * header.joints.length * 3;
  const all = new Int16Array(buffer);
  if (all.length !== per * header.tracks.length) {
    throw new Error(`clip size mismatch: ${all.length} values for ${header.tracks.length} tracks of ${per}`);
  }
  const tracks = header.tracks.map((_, t) => {
    const out = new Float32Array(per);
    for (let i = 0; i < per; i++) out[i] = all[t * per + i] / 1000;
    return out;
  });
  return { header, tracks };
}

/** Frame shown at `seconds`, looping over the clip. */
export function frameAt(seconds: number, fps: number, frames: number): number {
  const f = Math.floor(seconds * fps + 1e-6);
  return ((f % frames) + frames) % frames;
}

export function jointPosition(clip: Clip, track: number, frame: number, joint: number): [number, number, number] {
  const i = (frame * clip.header.joints.length + joint) * 3;
  const p = clip.tracks[track];
  return [p[i], p[i + 1], p[i + 2]];
}

const ANKLE = { left: 'LeftFoot', right: 'RightFoot' } as const;

export interface FloorRun { foot: 'left' | 'right'; start: number; end: number; points: [number, number][] }

/** Each contact run of one track, with the ankle's floor position (x, z) on its frames, in time order. */
export function floorRuns(clip: Clip, track: number): FloorRun[] {
  const contacts = clip.header.contacts?.[clip.header.tracks[track].id];
  const out: FloorRun[] = [];
  for (const foot of ['left', 'right'] as const) {
    const joint = clip.header.joints.indexOf(ANKLE[foot]);
    for (const [start, end] of contacts?.[foot] ?? []) {
      const points: [number, number][] = [];
      for (let f = start; f < end; f++) {
        const [x, , z] = jointPosition(clip, track, f, joint);
        points.push([x, z]);
      }
      out.push({ foot, start, end, points });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Column and row of tile `index` in a grid `cols` wide, filled row by row (the blend video is 2 x 2). */
export function tileOffset(index: number, cols: number): { col: number; row: number } {
  return { col: index % cols, row: Math.floor(index / cols) };
}

/** A player's video runs only while the reader wants it playing, it is on screen and the tab is visible. */
export function videoShouldPlay(s: { wanted: boolean; onScreen: boolean; pageHidden: boolean }): boolean {
  return s.wanted && s.onScreen && !s.pageHidden;
}
