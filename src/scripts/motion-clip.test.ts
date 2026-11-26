import { describe, expect, it } from 'vitest';
import { decodeClip, floorRuns, frameAt, jointPosition, tileOffset, videoShouldPlay, type ClipHeader } from './motion-clip';

// Two tracks, three frames, two joints (Hips, LeftFoot). Values are millimetres in the binary.
const header: ClipHeader = {
  fps: 30,
  frames: 3,
  joints: ['Hips', 'LeftFoot'],
  parents: [-1, 0],
  tracks: [
    { id: 'raw', label: 'Raw', color: '#ffa100' },
    { id: 'fixed', label: '--fix_feet', color: '#3d3d3d' },
  ],
  audio: null,
  contacts: { raw: { left: [[1, 3]], right: [] }, fixed: { left: [], right: [] } },
};

function buffer(): ArrayBuffer {
  const values: number[] = [];
  for (let t = 0; t < 2; t++)
    for (let f = 0; f < 3; f++)
      for (let j = 0; j < 2; j++) values.push(1000 * (t + 1), 100 * f + j, -10 * f);
  return new Int16Array(values).buffer;
}

describe('decodeClip', () => {
  it('converts millimetres to metres and splits tracks in header order', () => {
    const clip = decodeClip(header, buffer());
    expect(clip.tracks).toHaveLength(2);
    expect(jointPosition(clip, 0, 0, 0)).toEqual([1, 0, 0]);
    expect(jointPosition(clip, 1, 2, 1)[0]).toBeCloseTo(2);
    expect(jointPosition(clip, 1, 2, 1)[1]).toBeCloseTo(0.201);
    expect(jointPosition(clip, 1, 2, 1)[2]).toBeCloseTo(-0.02);
  });

  it('rejects a buffer of the wrong size', () => {
    expect(() => decodeClip(header, new ArrayBuffer(10))).toThrow();
  });
});

describe('frameAt', () => {
  it('maps seconds to a looped frame index', () => {
    expect(frameAt(0, 30, 300)).toBe(0);
    expect(frameAt(9.99, 30, 300)).toBe(299);
    expect(frameAt(10, 30, 300)).toBe(0);
    expect(frameAt(-1, 30, 300)).toBe(270);
  });
});

describe('floorRuns', () => {
  it('returns each contact run with the ankle on the floor, in time order', () => {
    const clip = decodeClip(header, buffer());
    const runs = floorRuns(clip, 0);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ foot: 'left', start: 1, end: 3 });
    expect(runs[0].points).toHaveLength(2); // frames 1 and 2
    expect(runs[0].points[0][0]).toBeCloseTo(1);
    expect(runs[0].points[0][1]).toBeCloseTo(-0.01);
    expect(floorRuns(clip, 1)).toEqual([]);
  });
});

describe('tileOffset', () => {
  it('finds a tile in a grid, row by row', () => {
    expect(tileOffset(0, 2)).toEqual({ col: 0, row: 0 });
    expect(tileOffset(1, 2)).toEqual({ col: 1, row: 0 });
    expect(tileOffset(2, 2)).toEqual({ col: 0, row: 1 });
    expect(tileOffset(3, 2)).toEqual({ col: 1, row: 1 });
  });
});

describe('videoShouldPlay', () => {
  const on = { wanted: true, onScreen: true, pageHidden: false };

  it('plays when wanted, on screen, in a visible tab', () => {
    expect(videoShouldPlay(on)).toBe(true);
  });

  it('resumes when the tab is visible again', () => {
    expect(videoShouldPlay({ ...on, pageHidden: true })).toBe(false);
    expect(videoShouldPlay({ ...on, pageHidden: false })).toBe(true);
  });

  it('stays paused when paused by the reader or off screen', () => {
    expect(videoShouldPlay({ ...on, wanted: false })).toBe(false);
    expect(videoShouldPlay({ ...on, onScreen: false })).toBe(false);
  });
});
