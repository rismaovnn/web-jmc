/** Frame-rate independent semi-implicit spring physics, with independent inertia per joint. */
export class Spring {
  value = 0;
  velocity = 0;
  stiffness: number;
  damping: number;
  constructor(stiffness: number, damping: number) { this.stiffness = stiffness; this.damping = damping; }
  update(target: number, dt: number) {
    const steps = Math.max(1, Math.ceil(Math.min(dt, 0.066) / (1 / 120)));
    const h = Math.min(dt, 0.066) / steps;
    for (let i = 0; i < steps; i++) {
      this.velocity += (this.stiffness * (target - this.value) - this.damping * this.velocity) * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
  reset() { this.value = 0; this.velocity = 0; }
}

export type LookSample = { time: number; x: number; y: number };
export class LookHistory {
  private samples: LookSample[] = [];
  push(time: number, x: number, y: number) {
    this.samples.push({ time, x, y });
    while (this.samples.length > 3 && this.samples[1].time < time - 450) this.samples.shift();
  }
  sample(time: number): { x: number; y: number } {
    const points = this.samples;
    if (!points.length) return { x: 0, y: 0 };
    if (time <= points[0].time) return points[0];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if (time <= b.time) {
        const f = (time - a.time) / Math.max(1, b.time - a.time);
        return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
      }
    }
    return points[points.length - 1];
  }
  clear() { this.samples = []; }
}

export const DEG = Math.PI / 180;
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
