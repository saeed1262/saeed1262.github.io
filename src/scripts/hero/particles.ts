import {
  Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute,
  ShaderMaterial, Points, Color, AdditiveBlending, Vector2,
} from 'three';

export class ParticleField {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera: PerspectiveCamera;
  private points!: Points;
  private material!: ShaderMaterial;
  private raf = 0;
  private pointer = new Vector2(0, 0);
  private clockStart = 0;

  constructor(private canvas: HTMLCanvasElement, private count = 4000) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera = new PerspectiveCamera(60, 1, 0.1, 100);
    this.camera.position.z = 6;
    this.build();
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointer);
  }

  private build() {
    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      seeds[i] = Math.random();
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    geo.setAttribute('seed', new BufferAttribute(seeds, 1));

    this.material = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPointer: { value: this.pointer },
        uFrom: { value: new Color('#22d3ee') },
        uTo: { value: new Color('#818cf8') },
      },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform vec2 uPointer; attribute float seed; varying float vMix;
        void main() {
          vec3 p = position;
          float t = uTime * 0.15 + seed * 6.2831;
          p.x += sin(t + p.y * 0.4) * 0.4;
          p.y += cos(t + p.x * 0.4) * 0.4;
          p.xy += uPointer * (0.4 + seed * 0.6);
          vMix = seed;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = (12.0 / -mv.z) * (0.5 + seed);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uFrom; uniform vec3 uTo; varying float vMix;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = smoothstep(0.5, 0.0, length(c));
          gl_FragColor = vec4(mix(uFrom, uTo, vMix), d * 0.7);
        }
      `,
    });
    this.points = new Points(geo, this.material);
    this.scene.add(this.points);
  }

  private resize = () => {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  private onPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2);
  };

  private loop = (now: number) => {
    if (!this.clockStart) this.clockStart = now;
    this.material.uniforms.uTime.value = (now - this.clockStart) / 1000;
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.loop);
  };

  start() { if (!this.raf) this.raf = requestAnimationFrame(this.loop); }
  stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    this.points.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
