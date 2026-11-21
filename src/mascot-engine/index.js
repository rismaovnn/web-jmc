import { MascotController } from './controller.js';

/**
 * Framework-agnostic entry point. Can be mounted in React's useEffect or in HTML.
 * A single cleanup() stops timers, observers, decoders and pointer listeners.
 */
export async function mountSpriteMascot(root, options = {}) {
  const hero = options.hero || root.closest('.sprite-hero') || root;
  const stage = root.querySelector('[data-sprite-stage]');
  const canvas = root.querySelector('[data-sprite-canvas]');
  const poster = root.querySelector('[data-sprite-poster]');
  if (!stage || !canvas || !poster) throw new Error('Sprite mascot markup is incomplete');
  const manifestUrl = options.manifestUrl || root.dataset.manifest || './assets/manifest.json';
  const controller = new MascotController({ hero, stage, canvas, poster, manifestUrl });
  try { await controller.init(); }
  catch (error) { console.error('Sprite mascot initialization failed:', error); }
  return () => controller.destroy();
}
