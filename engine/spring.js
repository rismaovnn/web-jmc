/** Damped spring physics in seconds. Semi-implicit Euler + microsteps prevents large-frame instability. */
export class Spring {
  constructor(value = 0, { stiffness = 145, damping = 24 } = {}) {
    this.value = value;
    this.velocity = 0;
    this.target = value;
    this.stiffness = stiffness;
    this.damping = damping;
  }
  setTarget(value) { this.target = value; }
  update(dt) {
    const steps = Math.max(1, Math.ceil(Math.min(Math.max(dt, 0), 0.06) / (1 / 120)));
    const h = Math.min(dt, 0.06) / steps;
    for (let n = 0; n < steps; n += 1) {
      const accel = (this.target - this.value) * this.stiffness - this.velocity * this.damping;
      this.velocity += accel * h;
      this.value += this.velocity * h;
    }
    if (Math.abs(this.target - this.value) < 0.00005 && Math.abs(this.velocity) < 0.0005) {
      this.value = this.target;
      this.velocity = 0;
    }
    return this.value;
  }
  reset(value = 0) { this.value = value; this.velocity = 0; this.target = value; }
}
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
