import { clamp, lerp } from './spring.js';

/** One pointer stream and a tiny history buffer, so each body part can react at a different delay. */
export class PointerTracker {
  constructor(element) {
    this.element = element;
    this.samples = [];
    this.active = false;
    this.lastMove = -Infinity;
    this.onMove = this.onMove.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.onBlur = this.onLeave.bind(this);
    element.addEventListener('pointermove', this.onMove, { passive: true });
    element.addEventListener('pointerleave', this.onLeave, { passive: true });
    window.addEventListener('blur', this.onBlur);
  }
  onMove(event) {
    // Never intercept touch scroll; taps still work on mobile.
    if (event.pointerType === 'touch') return;
    const rect = this.element.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width - 0.56) * 2.05, -1, 1);
    const y = clamp((0.5 - (event.clientY - rect.top) / rect.height) * 2, -1, 1);
    const now = performance.now();
    this.samples.push({ x, y, clientX: event.clientX, clientY: event.clientY, time: now });
    if (this.samples.length > 90) this.samples.shift();
    this.active = true;
    this.lastMove = now;
  }
  onLeave() {
    this.active = false;
    const now = performance.now();
    this.samples.push({ x: 0, y: 0, time: now });
    if (this.samples.length > 90) this.samples.shift();
  }
  sample(now, delayMs = 0) {
    // Idle settles after the visitor stops interacting, even if their pointer remains over the hero.
    if (!this.active || now - this.lastMove > 1750) return { x: 0, y: 0, active: false };
    const t = now - delayMs;
    const history = this.samples;
    if (!history.length) return { x: 0, y: 0, active: false };
    if (t <= history[0].time) return { ...history[0], active: true };
    for (let i = history.length - 1; i > 0; i--) {
      if (history[i - 1].time <= t) {
        const prev = history[i - 1];
        const next = history[i];
        const f = clamp((t - prev.time) / Math.max(1, next.time - prev.time), 0, 1);
        return { x: lerp(prev.x, next.x, f), y: lerp(prev.y, next.y, f), active: true };
      }
    }
    return { ...history[history.length - 1], active: true };
  }
  destroy() {
    this.element.removeEventListener('pointermove', this.onMove);
    this.element.removeEventListener('pointerleave', this.onLeave);
    window.removeEventListener('blur', this.onBlur);
  }
}
