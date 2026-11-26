// In-browser motion player for the ZeroEGGS page: simple capsule bodies on a light checkered floor, with speech in
// sync, a scrubber, an optional track switcher (style blending) and foot trails. three.js is loaded only when a player
// comes near the viewport, and everything is disposed before a client-side navigation.
import { onEachPage } from '@/scripts/viz';
import { decodeClip, floorRuns, frameAt, nextState, type Clip, type ClipHeader, type FloorRun, type PlayerState } from '@/scripts/motion-clip';

type Three = typeof import('three');

interface Switcher { label: string; ids: string[]; names: string[] }

const LANE = 1.25; // metres between characters
const SVGNS = 'http://www.w3.org/2000/svg';
const RADIUS: Record<string, number> = {
  Hips: 0.08,
  Spine: 0.085, Spine1: 0.095, Spine2: 0.1, Spine3: 0.1, Neck: 0.045, Neck1: 0.045,
  RightShoulder: 0.055, LeftShoulder: 0.055, RightArm: 0.048, LeftArm: 0.048, RightForeArm: 0.04, LeftForeArm: 0.04,
  RightHand: 0.035, LeftHand: 0.035, RightUpLeg: 0.07, LeftUpLeg: 0.07, RightLeg: 0.055, LeftLeg: 0.055,
  RightFoot: 0.04, LeftFoot: 0.04, RightToeBase: 0.035, LeftToeBase: 0.035,
};
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

onEachPage('[data-motion-player]', (el) => {
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      start(el).catch((err) => {
        console.error(err);
        fallback(el);
      });
    }
  }, { rootMargin: '200px' });
  io.observe(el);
  document.addEventListener('astro:before-swap', () => io.disconnect(), { once: true });
});

function fallback(el: HTMLElement) {
  el.querySelector<HTMLElement>('[data-canvas]')?.setAttribute('hidden', '');
  el.querySelector<HTMLElement>('[data-fallback]')?.removeAttribute('hidden');
  el.querySelector<HTMLElement>('[data-controls]')?.setAttribute('hidden', '');
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function start(el: HTMLElement) {
  if (!webglAvailable()) return fallback(el);
  const src = el.dataset.src!;
  const [THREE, header, buffer] = await Promise.all([
    import('three'),
    fetch(`${src}.json`).then((r) => r.json() as Promise<ClipHeader>),
    fetch(`${src}.bin`).then((r) => r.arrayBuffer()),
  ]);
  const clip = decodeClip(header, buffer);
  const switcher: Switcher | null = el.dataset.switcher ? JSON.parse(el.dataset.switcher) : null;
  const shown = switcher ? [switcher.ids[0]] : (el.dataset.show ?? header.tracks.map((t) => t.id).join(',')).split(',');
  new Player(THREE, el, clip, shown, switcher, el.dataset.trails === '1', src.slice(0, src.lastIndexOf('/') + 1));
}

class Player {
  private renderer: import('three').WebGLRenderer;
  private scene: import('three').Scene;
  private camera: import('three').PerspectiveCamera;
  private bodies: { track: number; meshes: { bone: import('three').Mesh; joint: number; parent: number }[]; head: import('three').Mesh }[] = [];
  private floor: { run: FloorRun; line: SVGPolylineElement; dot: SVGCircleElement; cx: number; cz: number }[] = [];
  private state: PlayerState;
  private duration: number;
  private audio: HTMLAudioElement | null = null;
  private sound = false;
  private raf = 0;
  private last = 0;
  private visible = true;
  private az = 0.38;
  private el = 0.12;
  private home = { az: 0.38, el: 0.12 };
  private disposed = false;
  private cleanups: (() => void)[] = [];

  constructor(
    private THREE: Three,
    private root: HTMLElement,
    private clip: Clip,
    shown: string[],
    private switcher: Switcher | null,
    trails: boolean,
    dir: string,
  ) {
    const h = clip.header;
    this.duration = h.frames / h.fps;
    this.state = { time: 0, playing: !reduceMotion(), track: shown[0] };
    const canvas = root.querySelector<HTMLCanvasElement>('[data-canvas]')!;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap; // softened by the light's shadow.radius
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#eef0f3');
    this.scene.fog = new THREE.Fog('#eef0f3', 7, 16);
    this.camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 50);
    this.buildWorld();
    const shownTracks = shown.map((id) => h.tracks.findIndex((t) => t.id === id));
    shownTracks.forEach((track, lane) => this.buildBody(track, lane, shown.length));
    const floorHost = root.querySelector<HTMLElement>('[data-floor]');
    if (trails && floorHost && h.contacts) this.buildFloor(floorHost, shownTracks);
    // Names above the characters (a switcher names its track in its own readout instead).
    const labels = root.querySelector('[data-labels]');
    if (labels && !switcher) {
      labels.replaceChildren(...this.bodies.map((b) => {
        const span = document.createElement('span');
        span.className = 'mp__label';
        span.dataset.label = '';
        span.textContent = h.tracks[b.track].label;
        return span;
      }));
    }
    const audio = root.querySelector<HTMLAudioElement>('audio[data-audio]');
    if (h.audio && audio) {
      audio.src = dir + h.audio;
      this.audio = audio;
    }
    this.bindControls();
    this.resize();
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(root.querySelector('[data-stage]')!);
    const io = new IntersectionObserver((e) => {
      this.visible = e.some((x) => x.isIntersecting);
      if (!this.visible) this.audio?.pause();
      else if (this.state.playing && this.sound) this.playAudio();
      this.loop();
    });
    io.observe(root);
    const onHide = () => { if (document.hidden) this.audio?.pause(); };
    document.addEventListener('visibilitychange', onHide);
    const onSwap = () => this.dispose();
    document.addEventListener('astro:before-swap', onSwap, { once: true });
    this.cleanups.push(() => ro.disconnect(), () => io.disconnect(),
      () => document.removeEventListener('visibilitychange', onHide));
    root.dataset.playerReady = '1';
    this.draw();
    this.loop();
  }

  private buildWorld() {
    const T = this.THREE;
    // Checkered floor, like GenoView's.
    const size = 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d')!;
    g.fillStyle = '#e6e8eb';
    g.fillRect(0, 0, size, size);
    g.fillStyle = '#dadde1';
    g.fillRect(0, 0, size / 2, size / 2);
    g.fillRect(size / 2, size / 2, size / 2, size / 2);
    g.strokeStyle = '#f7f8f9';
    g.lineWidth = 3;
    g.strokeRect(0, 0, size, size);
    const tex = new T.CanvasTexture(c);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(20, 20); // the 20 m floor shows 1 m tiles, each of four 0.5 m squares
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 4;
    const floor = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshLambertMaterial({ map: tex }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.scene.add(new T.HemisphereLight('#ffffff', '#b9bec6', 2.2));
    const sun = new T.DirectionalLight('#ffffff', 1.6);
    sun.position.set(-2.5, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -3;
    sun.shadow.camera.right = sun.shadow.camera.top = 3;
    sun.shadow.radius = 4;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);
  }

  private buildBody(track: number, lane: number, lanes: number) {
    const T = this.THREE;
    const { joints, parents, tracks } = this.clip.header;
    const material = new T.MeshStandardMaterial({ color: tracks[track].color, roughness: 0.75, metalness: 0 });
    const group = new T.Group();
    group.position.x = (lane - (lanes - 1) / 2) * (lanes > 2 ? 1.05 : LANE);
    const meshes: { bone: import('three').Mesh; joint: number; parent: number }[] = [];
    joints.forEach((name, j) => {
      const p = parents[j];
      if (p < 0 || name === 'HeadEnd') return;
      const r = RADIUS[joints[p]] ?? 0.035;
      const bone = new T.Mesh(new T.CapsuleGeometry(r, 1, 4, 10), material);
      bone.castShadow = true;
      group.add(bone);
      meshes.push({ bone, joint: j, parent: p });
    });
    const head = new T.Mesh(new T.SphereGeometry(0.105, 20, 14), material);
    head.castShadow = true;
    group.add(head);
    this.scene.add(group);
    const body: (typeof this.bodies)[number] = { track, meshes, head };
    this.bodies.push(body);
  }

  private pose(frame: number) {
    const T = this.THREE;
    const n = this.clip.header.joints.length;
    const up = new T.Vector3(0, 1, 0);
    const a = new T.Vector3();
    const b = new T.Vector3();
    const headIndex = this.clip.header.joints.indexOf('Head');
    const headEnd = this.clip.header.joints.indexOf('HeadEnd');
    for (const body of this.bodies) {
      const track = this.switcher
        ? this.clip.header.tracks.findIndex((t) => t.id === this.state.track)
        : body.track;
      const p = this.clip.tracks[track];
      for (const { bone, joint, parent } of body.meshes) {
        a.fromArray(p, (frame * n + parent) * 3);
        b.fromArray(p, (frame * n + joint) * 3);
        const len = a.distanceTo(b);
        bone.position.copy(a).add(b).multiplyScalar(0.5);
        bone.scale.set(1, Math.max(len, 1e-4), 1);
        if (len > 1e-6) bone.quaternion.setFromUnitVectors(up, b.sub(a).normalize());
      }
      a.fromArray(p, (frame * n + headIndex) * 3);
      b.fromArray(p, (frame * n + headEnd) * 3);
      body.head.position.copy(a).lerp(b, 0.45);
    }
  }

  private draw() {
    if (this.disposed) return;
    const { fps, frames } = this.clip.header;
    const frame = frameAt(this.state.time, fps, frames);
    this.pose(frame);
    this.updateFloor(frame);
    const lanes = this.bodies.length;
    const dist = lanes > 2 ? 5.4 : 3.9 + 1.3 * (lanes - 1);
    const target = new this.THREE.Vector3(0, 0.92, 0);
    this.camera.position.set(
      target.x + dist * Math.sin(this.az) * Math.cos(this.el),
      target.y + dist * Math.sin(this.el),
      target.z + dist * Math.cos(this.az) * Math.cos(this.el),
    );
    this.camera.lookAt(target);
    this.renderer.render(this.scene, this.camera);
    this.updateLabels();
    const scrub = this.root.querySelector<HTMLInputElement>('[data-scrub]');
    if (scrub && document.activeElement !== scrub) scrub.value = String(Math.round((this.state.time / this.duration) * 1000));
    const time = this.root.querySelector<HTMLElement>('[data-time]');
    if (time) time.textContent = `${this.state.time.toFixed(1)} s`;
  }

  /** Top-down view of each track's planted ankles: one line per contact, as long as the foot slid. */
  private buildFloor(host: HTMLElement, tracks: number[]) {
    const { tracks: meta } = this.clip.header;
    const runs = tracks.map((t) => floorRuns(this.clip, t));
    const centres = runs.map((rs) => {
      const pts = rs.flatMap((r) => r.points);
      return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
    });
    const half = 0.06 + Math.max(0.2, ...runs.map((rs, i) => Math.max(...rs.flatMap((r) => r.points)
      .map(([x, z]) => Math.max(Math.abs(x - centres[i][0]), Math.abs(z - centres[i][1]))))));
    const panels = host.querySelector<HTMLElement>('[data-floor-panels]')!;
    panels.replaceChildren();
    const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
      parent.appendChild(n);
      return n;
    };
    tracks.forEach((t, i) => {
      const panel = document.createElement('div');
      panel.className = 'mp__floor-panel';
      const title = document.createElement('p');
      title.textContent = meta[t].label;
      const svg = el('svg', { viewBox: `${-half} ${-half} ${2 * half} ${2 * half}`, role: 'img',
        'aria-label': `${meta[t].label}: planted ankles seen from above` }, panel);
      for (let g = -Math.floor(half * 10) / 10; g <= half; g += 0.1) {
        el('line', { x1: g, x2: g, y1: -half, y2: half, class: 'mp__floor-grid' }, svg);
        el('line', { x1: -half, x2: half, y1: g, y2: g, class: 'mp__floor-grid' }, svg);
      }
      el('line', { x1: half - 0.14, x2: half - 0.04, y1: half - 0.04, y2: half - 0.04, class: 'mp__floor-scale' }, svg);
      const label = el('text', { x: half - 0.09, y: half - 0.06, class: 'mp__floor-scale-text' }, svg);
      label.textContent = '10 cm';
      for (const run of runs[i]) {
        const line = el('polyline', { fill: 'none', stroke: meta[t].color, class: 'mp__floor-line' }, svg);
        const dot = el('circle', { r: 0.011, fill: meta[t].color }, svg);
        this.floor.push({ run, line, dot, cx: centres[i][0], cz: centres[i][1] });
      }
      panel.prepend(title);
      panels.appendChild(panel);
    });
    host.hidden = false;
  }

  private updateFloor(frame: number) {
    for (const { run, line, dot, cx, cz } of this.floor) {
      const n = Math.max(0, Math.min(run.end, frame + 1) - run.start);
      const pts = run.points.slice(0, n);
      line.setAttribute('points', pts.map(([x, z]) => `${(x - cx).toFixed(4)},${(z - cz).toFixed(4)}`).join(' '));
      dot.style.display = n ? '' : 'none';
      if (n) {
        dot.setAttribute('cx', (pts[n - 1][0] - cx).toFixed(4));
        dot.setAttribute('cy', (pts[n - 1][1] - cz).toFixed(4));
      }
    }
  }

  private updateLabels() {
    const labels = this.root.querySelectorAll<HTMLElement>('[data-label]');
    const stage = this.root.querySelector<HTMLElement>('[data-stage]')!;
    const v = new this.THREE.Vector3();
    this.bodies.forEach((body, i) => {
      const label = labels[i];
      if (!label) return;
      v.copy(body.head.position).add(new this.THREE.Vector3(0, 0.32, 0));
      body.head.parent!.localToWorld(v);
      v.project(this.camera);
      label.style.left = `${((v.x + 1) / 2) * stage.clientWidth}px`;
      label.style.top = `${((1 - v.y) / 2) * stage.clientHeight}px`;
    });
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    if (this.disposed || !this.visible || !this.state.playing) {
      this.last = 0;
      this.setPlayButton();
      return;
    }
    this.raf = requestAnimationFrame((now) => {
      const dt = this.last ? (now - this.last) / 1000 : 0;
      this.last = now;
      if (this.sound && this.audio && !this.audio.paused) {
        // The speech is the clock while it plays; loop both at the clip's length.
        if (this.audio.currentTime >= this.duration) this.audio.currentTime = 0;
        this.state = nextState(this.state, { type: 'seek', time: this.audio.currentTime }, this.duration);
      } else {
        this.state = nextState(this.state, { type: 'tick', dt: Math.min(dt, 0.1) }, this.duration);
      }
      this.draw();
      this.loop();
    });
    this.setPlayButton();
  };

  private playAudio() {
    if (!this.audio) return;
    this.audio.currentTime = this.state.time;
    this.audio.play().catch(() => {
      this.sound = false;
      this.setSoundButton();
    });
  }

  private setPlayButton() {
    const b = this.root.querySelector<HTMLButtonElement>('[data-play]');
    if (!b) return;
    b.dataset.state = this.state.playing ? 'playing' : 'paused';
    b.setAttribute('aria-label', this.state.playing ? 'Pause' : 'Play');
  }

  private setSoundButton() {
    const b = this.root.querySelector<HTMLButtonElement>('[data-sound]');
    if (!b) return;
    b.setAttribute('aria-pressed', String(this.sound));
    b.textContent = this.sound ? 'Sound on' : 'Sound off';
  }

  private toggle() {
    this.state = nextState(this.state, { type: this.state.playing ? 'pause' : 'play' }, this.duration);
    if (this.state.playing && this.sound) this.playAudio();
    else this.audio?.pause();
    this.loop();
  }

  private bindControls() {
    const r = this.root;
    const on = <K extends keyof HTMLElementEventMap>(t: EventTarget, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      t.addEventListener(type, fn as EventListener);
      this.cleanups.push(() => t.removeEventListener(type, fn as EventListener));
    };
    const play = r.querySelector('[data-play]');
    if (play) on(play, 'click', () => this.toggle());
    const scrub = r.querySelector<HTMLInputElement>('[data-scrub]');
    if (scrub) on(scrub, 'input', () => {
      this.state = nextState(this.state, { type: 'seek', time: (Number(scrub.value) / 1000) * this.duration }, this.duration);
      if (this.audio && this.sound) this.audio.currentTime = this.state.time;
      this.draw();
    });
    const sound = r.querySelector<HTMLButtonElement>('[data-sound]');
    if (sound) {
      if (!this.audio) sound.hidden = true;
      on(sound, 'click', () => {
        this.sound = !this.sound;
        this.setSoundButton();
        if (this.sound) {
          if (!this.state.playing) this.state = nextState(this.state, { type: 'play' }, this.duration);
          this.playAudio();
        } else this.audio?.pause();
        this.loop();
      });
    }
    const sw = r.querySelector<HTMLInputElement>('[data-switch]');
    const swLabel = r.querySelector<HTMLElement>('[data-switch-label]');
    if (sw && this.switcher) {
      const s = this.switcher;
      on(sw, 'input', () => {
        const i = Number(sw.value);
        this.state = nextState(this.state, { type: 'track', id: s.ids[i] }, this.duration);
        if (swLabel) swLabel.textContent = s.names[i];
        this.draw();
      });
    }
    const canvas = r.querySelector<HTMLCanvasElement>('[data-canvas]')!;
    on(canvas, 'keydown', (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
    // Drag to look around, within limits; double-click to reset.
    let drag: { x: number; y: number; az: number; el: number } | null = null;
    on(canvas, 'pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY, az: this.az, el: this.el };
      canvas.setPointerCapture(e.pointerId);
    });
    on(canvas, 'pointermove', (e) => {
      if (!drag) return;
      this.az = Math.max(-1.2, Math.min(1.2, drag.az - (e.clientX - drag.x) * 0.008));
      this.el = Math.max(0.02, Math.min(0.6, drag.el + (e.clientY - drag.y) * 0.005));
      if (!this.state.playing) this.draw();
    });
    on(canvas, 'pointerup', () => { drag = null; });
    on(canvas, 'dblclick', () => {
      this.az = this.home.az;
      this.el = this.home.el;
      if (!this.state.playing) this.draw();
    });
  }

  private resize() {
    const stage = this.root.querySelector<HTMLElement>('[data-stage]')!;
    // The stage's CSS aspect ratio sets the size (16:9, or 4:3 on phones); the canvas buffer follows it.
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.draw();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
    this.cleanups.forEach((f) => f());
    this.scene.traverse((o) => {
      const m = o as import('three').Mesh;
      m.geometry?.dispose();
      const mat = m.material as import('three').Material | import('three').Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
        (x as import('three').MeshLambertMaterial).map?.dispose();
        x.dispose();
      });
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
