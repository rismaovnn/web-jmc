import { clamp } from './spring.js';

/** Draws native-resolution atlas tiles into a contained, DPR-aware 2D canvas. */
export class SpriteRenderer {
  constructor(canvas, cache, manifest) {
    this.canvas = canvas;
    this.cache = cache;
    this.manifest = manifest;
    this.context = canvas.getContext('2d', { alpha: manifest.source.hasAlpha, desynchronized: true });
    if (!this.context) throw new Error('Canvas 2D is unavailable');
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
    this.lastFrame = manifest.poseMap.center;
    this.hasPainted = false;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }
  resize() {
    const bounds = this.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const maxScale = matchMedia('(max-width: 640px)').matches ? 1.4 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, maxScale);
    const w = Math.round(bounds.width * dpr);
    const h = Math.round(bounds.height * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.context.imageSmoothingEnabled = true;
      this.context.imageSmoothingQuality = 'high';
    }
  }
  render(frameNumber, alphaBlend = true) {
    const { source, atlas } = this.manifest;
    const lastIndex = source.frameCount - 1;
    const floatFrame = clamp(frameNumber, 0, lastIndex);
    const lo = Math.floor(floatFrame);
    const hi = Math.min(lo + 1, lastIndex);
    const mix = alphaBlend ? (floatFrame - lo) : 0;
    const aPage = Math.floor(lo / atlas.framesPerPage);
    const bPage = Math.floor(hi / atlas.framesPerPage);
    const a = this.cache.get(aPage);
    const b = mix > 0.003 ? this.cache.get(bPage) : a;
    if (!a || !b) {
      this.cache.load(aPage);
      if (mix > 0.003) this.cache.load(bPage);
      return false;
    }
    const ctx = this.context;
    const cw = this.canvas.width, ch = this.canvas.height;
    if (!cw || !ch) return false;
    const scale = Math.min(cw / source.width, ch / source.height);
    const dw = source.width * scale, dh = source.height * scale;
    const x = (cw - dw) / 2, y = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.globalAlpha = 1;
    ctx.drawImage(a, (lo % atlas.framesPerPage) * source.width, 0, source.width, source.height, x, y, dw, dh);
    if (mix > 0.003) {
      ctx.globalAlpha = mix;
      ctx.drawImage(b, (hi % atlas.framesPerPage) * source.width, 0, source.width, source.height, x, y, dw, dh);
      ctx.globalAlpha = 1;
    }
    this.hasPainted = true;
    this.lastFrame = floatFrame;
    return true;
  }
  destroy() { this.resizeObserver.disconnect(); }
}
