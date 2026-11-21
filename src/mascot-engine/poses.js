import { Spring, clamp, lerp } from './spring.js';

/**
 * Pose graph: every turn travels through the neutral pose. This avoids a timeline
 * teleport when changing from an upward look to a left look. Only actual recorded
 * directions are represented; right/down are deliberately subtle (see manifest).
 */
export class PoseGraph {
  constructor(poseMap) {
    this.map = poseMap;
    this.branch = 'idle';
    this.progress = new Spring(0, { stiffness: 115, damping: 22 });
    this.time = 0;
  }
  static frameAlong(frames, strength) {
    const pos = clamp(strength, 0, 1) * (frames.length - 1);
    const lo = Math.floor(pos);
    return lerp(frames[lo], frames[Math.min(frames.length - 1, lo + 1)], pos - lo);
  }
  update(dt, x, y, active) {
    this.time += dt;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    let nextBranch = 'idle';
    let nextStrength = 0;
    if (active && Math.max(absX, absY) > 0.055) {
      if (absY > absX * 1.2) {
        nextBranch = y >= 0 ? 'up' : 'down';
        nextStrength = absY;
      } else {
        nextBranch = x < 0 ? 'left' : 'right';
        nextStrength = absX;
      }
    }

    if (nextBranch !== this.branch) {
      this.progress.setTarget(0);
      if (Math.abs(this.progress.value) <= 0.014 && Math.abs(this.progress.velocity) < 0.08) {
        this.branch = nextBranch;
      }
    } else {
      this.progress.setTarget(nextStrength);
    }
    const amount = clamp(this.progress.update(dt), 0, 1);
    if (this.branch === 'idle' || amount <= 0.014) {
      const subtle = Math.sin(this.time * 1.27) * 1.5 + Math.sin(this.time * 0.74) * 0.35;
      return this.map.center + subtle;
    }
    const frames = this.map[this.branch]?.frames || [this.map.center];
    return PoseGraph.frameAlong(frames, amount);
  }
}
