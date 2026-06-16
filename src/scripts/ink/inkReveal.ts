export interface InkRevealOptions {
  color?: string; // ink color
  opacity?: number; // initial ink alpha (0..1)
  brush?: number; // brush radius in CSS px
}

export class InkReveal {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private w = 0;
  private h = 0;
  private color: string;
  private opacity: number;
  private brush: number;
  private ro: ResizeObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    private host: HTMLElement,
    opts: InkRevealOptions = {},
  ) {
    this.color = opts.color ?? '#0a0b0f';
    this.opacity = opts.opacity ?? 0.6;
    this.brush = opts.brush ?? 30;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.resizeAndFill();
    this.ro = new ResizeObserver(() => this.resizeAndFill());
    this.ro.observe(host);
    host.addEventListener('pointermove', this.onMove);
  }

  private resizeAndFill() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.host.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height;
    if (this.w === 0 || this.h === 0) return;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = this.opacity;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(0, 0, this.w, this.h);
    this.ctx.globalAlpha = 1;
  }

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 3; i++) {
      const ox = x + (Math.random() - 0.5) * this.brush * 0.6;
      const oy = y + (Math.random() - 0.5) * this.brush * 0.6;
      const rad = this.brush * (0.7 + Math.random() * 0.6);
      const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rad);
      g.addColorStop(0, 'rgba(0,0,0,0.85)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(ox, oy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  dispose() {
    this.host.removeEventListener('pointermove', this.onMove);
    this.ro.disconnect();
  }
}
