// Players for the ZeroEGGS page's GenoView recordings: play/pause, a scrubber, sound (the speech is in the video), an
// optional slider across the tiles of a tiled video (the style blend), and an optional floor view kept in step with
// the video. Videos play only while on screen and the tab is visible, never by themselves under reduced motion, and
// stop before a client-side navigation.
import { onEachPage } from '@/scripts/viz';
import { decodeClip, frameAt, tileOffset, videoShouldPlay, type ClipHeader } from '@/scripts/motion-clip';
import { createFloorView } from '@/scripts/floor-view';

onEachPage('[data-video-player]', (root) => {
  const video = root.querySelector<HTMLVideoElement>('video')!;
  const play = root.querySelector<HTMLButtonElement>('[data-play]')!;
  const scrub = root.querySelector<HTMLInputElement>('[data-scrub]')!;
  const time = root.querySelector<HTMLElement>('[data-time]')!;
  const sound = root.querySelector<HTMLButtonElement>('[data-sound]')!;
  const tiles = root.querySelector<HTMLInputElement>('[data-tile]');
  const tileName = root.querySelector<HTMLElement>('[data-tile-name]');
  let wanted = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let onScreen = false;
  let raf = 0;
  let floor: { update: (frame: number) => void; header: ClipHeader } | null = null;

  const render = () => {
    play.dataset.state = video.paused ? 'paused' : 'playing';
    play.setAttribute('aria-label', video.paused ? 'Play' : 'Pause');
    const d = Number.isFinite(video.duration) ? video.duration : 0;
    if (d && document.activeElement !== scrub) scrub.value = String(Math.round((video.currentTime / d) * 1000));
    time.textContent = `${video.currentTime.toFixed(1)} s`;
    if (floor) floor.update(frameAt(video.currentTime, floor.header.fps, floor.header.frames));
  };
  const tick = () => {
    render();
    if (!video.paused) raf = requestAnimationFrame(tick);
  };
  const sync = () => {
    if (videoShouldPlay({ wanted, onScreen, pageHidden: document.hidden })) {
      if (video.paused) video.play().catch(() => { wanted = false; render(); });
    } else if (!video.paused) video.pause();
    render();
  };

  video.addEventListener('play', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); });
  video.addEventListener('pause', render);
  video.addEventListener('seeked', render);
  play.addEventListener('click', () => { wanted = video.paused; sync(); });
  scrub.addEventListener('input', () => {
    if (Number.isFinite(video.duration)) video.currentTime = (Number(scrub.value) / 1000) * video.duration;
    render();
  });
  sound.addEventListener('click', () => {
    video.muted = !video.muted;
    sound.setAttribute('aria-pressed', String(!video.muted));
    sound.textContent = video.muted ? 'Sound off' : 'Sound on';
    if (!video.muted) wanted = true;
    sync();
  });
  if (tiles) {
    const cols = Number(root.dataset.cols);
    const names = JSON.parse(root.dataset.names ?? '[]') as string[];
    tiles.addEventListener('input', () => {
      const { col, row } = tileOffset(Number(tiles.value), cols);
      video.style.setProperty('--col', String(col));
      video.style.setProperty('--row', String(row));
      if (tileName) tileName.textContent = names[Number(tiles.value)];
    });
  }
  if (root.dataset.floor) {
    const src = root.dataset.floor;
    Promise.all([
      fetch(`${src}.json`).then((r) => r.json() as Promise<ClipHeader>),
      fetch(`${src}.bin`).then((r) => r.arrayBuffer()),
    ]).then(([header, buffer]) => {
      const host = root.querySelector<HTMLElement>('[data-floor-view]')!;
      floor = { update: createFloorView(host.querySelector('[data-floor-panels]')!, decodeClip(header, buffer)), header };
      host.hidden = false;
      render();
    }).catch((err) => console.error(err));
  }

  const io = new IntersectionObserver((entries) => {
    onScreen = entries.some((e) => e.isIntersecting);
    sync();
  }, { threshold: 0.25 });
  io.observe(video);
  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('astro:before-swap', () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    video.pause();
    document.removeEventListener('visibilitychange', onVisibility);
  }, { once: true });
  render();
});
