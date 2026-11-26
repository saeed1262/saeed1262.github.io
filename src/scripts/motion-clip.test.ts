import { describe, expect, it } from 'vitest';
import { audioShouldPlay, decodeClip, floorRuns, frameAt, jointPosition, nextState, type ClipHeader } from './motion-clip';

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

describe('nextState', () => {
  const start = { time: 4.2, playing: true, track: 'w0' };

  it('switchTrack keeps time', () => {
    const s = nextState(start, { type: 'track', id: 'w50' }, 10);
    expect(s.track).toBe('w50');
    expect(s.time).toBe(4.2);
    expect(s.playing).toBe(true);
  });

  it('loops time on tick', () => {
    expect(nextState({ ...start, time: 9.9 }, { type: 'tick', dt: 0.2 }, 10).time).toBeCloseTo(0.1);
  });

  it('does not advance while paused', () => {
    expect(nextState({ ...start, playing: false }, { type: 'tick', dt: 0.5 }, 10).time).toBe(4.2);
  });

  it('wraps seeks into the clip', () => {
    expect(nextState(start, { type: 'seek', time: 12 }, 10).time).toBeCloseTo(2);
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

describe('audioShouldPlay', () => {
  const on = { playing: true, sound: true, onScreen: true, pageHidden: false };

  it('plays when the clip plays with sound on, on screen, in a visible tab', () => {
    expect(audioShouldPlay(on)).toBe(true);
  });

  it('resumes after the tab becomes visible again', () => {
    expect(audioShouldPlay({ ...on, pageHidden: true })).toBe(false);
    expect(audioShouldPlay({ ...on, pageHidden: false })).toBe(true);
  });

  it('stays silent when paused, muted or off screen', () => {
    expect(audioShouldPlay({ ...on, playing: false })).toBe(false);
    expect(audioShouldPlay({ ...on, sound: false })).toBe(false);
    expect(audioShouldPlay({ ...on, onScreen: false })).toBe(false);
  });
});
