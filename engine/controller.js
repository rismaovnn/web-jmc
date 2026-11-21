import { Spring, clamp } from './spring.js';
import { PointerTracker } from './pointer.js';
import { PoseGraph } from './poses.js';
import { AtlasCache, loadManifest } from './assets.js';
import { SpriteRenderer } from './renderer.js';

export class MascotController {
  constructor({ hero, stage, canvas, poster, manifestUrl }) {
    this.hero = hero;
    this.stage = stage;
    this.canvas = canvas;
    this.poster = poster;
    this.manifestUrl = manifestUrl;
    this.pointer = new PointerTracker(hero);
    this.gazeX = new Spring(0, { stiffness: 420, damping: 33 });
    this.gazeY = new Spring(0, { stiffness: 420, damping: 33 });
    this.headX = new Spring(0, { stiffness: 160, damping: 24 });
    this.headY = new Spring(0, { stiffness: 160, damping: 24 });
    this.bodyX = new Spring(0, { stiffness: 85, damping: 20 });
    this.proximity = new Spring(0, { stiffness: 120, damping: 21 });
    this.running = false;
    this.visible = true;
    this.disposed = false;
    this.rafId = 0;
    this.lastTick = 0;
    this.motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
    this.onVisibility = () => this.setRunning(document.visibilityState === 'visible' && this.visible);
    this.onMotionChange = () => this.setRunning(!this.motionQuery.matches && this.visible);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.motionQuery.addEventListener('change', this.onMotionChange);
    this.intersection = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.setRunning(this.visible && !this.motionQuery.matches && !document.hidden);
    }, { threshold: 0.01 });
    this.intersection.observe(this.stage);
  }
  async init() {
    const { manifest, base } = await loadManifest(this.manifestUrl);
    if (this.disposed) return;
    this.manifest = manifest;
    this.cache = new AtlasCache(manifest, base, { cachePages: matchMedia('(max-width: 640px)').matches ? 3 : 5 });
    this.renderer = new SpriteRenderer(this.canvas, this.cache, manifest);
    this.graph = new PoseGraph(manifest.poseMap);
    this.currentFrame = manifest.poseMap.center;
    const page = Math.floor(this.currentFrame / manifest.atlas.framesPerPage);
    await this.cache.load(page);
    if (this.disposed) return;
    if (this.renderer.render(this.currentFrame, false)) {
      this.stage.classList.add('sprite-is-ready');
      this.poster.setAttribute('aria-hidden', 'true');
    }
    this.cache.load(page - 1);
    this.cache.load(page + 1);
    if (!this.motionQuery.matches && this.visible && !document.hidden) this.setRunning(true);
  }
  setRunning(on) {
    if (this.disposed || !this.renderer) return;
    if (this.running === on) return;
    this.running = on;
    if (on) {
      this.lastTick = 0;
      this.rafId = requestAnimationFrame(now => this.tick(now));
    } else {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.lastTick = 0;
    }
  }
  tick(now) {
    if (!this.running || this.disposed) return;
    const dt = this.lastTick ? clamp((now - this.lastTick) / 1000, 0.001, 0.05) : 1 / 60;
    this.lastTick = now;
    const eyeTarget = this.pointer.sample(now, 0);
    const headTarget = this.pointer.sample(now, 105);
    const bodyTarget = this.pointer.sample(now, 200);
    this.gazeX.setTarget(eyeTarget.x); this.gazeY.setTarget(eyeTarget.y);
    this.headX.setTarget(headTarget.x); this.headY.setTarget(headTarget.y);
    this.bodyX.setTarget(bodyTarget.x);
    this.gazeX.update(dt); this.gazeY.update(dt);
    this.headX.update(dt); this.headY.update(dt);
    this.bodyX.update(dt);

    // Hover visuals are separate from the recorded character pixels.
    const last = this.pointer.samples.at(-1);
    const rect = this.stage.getBoundingClientRect();
    const distance = last?.clientX !== undefined
      ? Math.hypot((last.clientX - rect.left - rect.width / 2) / (rect.width * 0.75),
                   (last.clientY - rect.top - rect.height * 0.45) / (rect.height * 0.75))
      : 2;
    const targetProximity = this.pointer.active && now - this.pointer.lastMove < 1750 ? clamp(1 - distance, 0, 1) : 0;
    this.proximity.setTarget(targetProximity);
    this.proximity.update(dt);
    this.stage.style.setProperty('--ambient-x', `${(this.gazeX.value * 15).toFixed(2)}px`);
    this.stage.style.setProperty('--ambient-y', `${(-this.gazeY.value * 12).toFixed(2)}px`);
    this.stage.style.setProperty('--ambient-glow', `${(0.32 + this.proximity.value * 0.34).toFixed(3)}`);
    this.stage.style.setProperty('--ambient-body', `${(this.bodyX.value * 5).toFixed(2)}px`);

    const desired = this.graph.update(dt, this.headX.value, this.headY.value, headTarget.active);
    const velocity = desired - this.currentFrame;
    // Bounded frame travel avoids missing poses during rapid pointer jumps.
    const maxDelta = 80 * dt;
    const next = this.currentFrame + clamp(velocity, -maxDelta, maxDelta);
    const page = Math.floor(next / this.manifest.atlas.framesPerPage);
    this.cache.load(page);
    this.cache.load(page + (velocity >= 0 ? 1 : -1));
    if (this.renderer.render(next, true)) {
      this.currentFrame = next;
    }
    this.rafId = requestAnimationFrame(t => this.tick(t));
  }
  destroy() {
    this.disposed = true;
    this.running = false;
    cancelAnimationFrame(this.rafId);
    this.pointer.destroy();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.motionQuery.removeEventListener('change', this.onMotionChange);
    this.renderer?.destroy();
    this.cache?.dispose();
  }
}
