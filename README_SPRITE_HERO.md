# Interactive Mascot Sprite Hero — Vanilla JavaScript

A complete static hero section driven by **actual recorded poses** from the uploaded 7.93-second MP4. The original footage is **720 × 1280, 24 fps, 190 frames, H.264, no alpha**. It features front-facing, left-looking, and upward-looking poses. There is **no clean full right-looking or down-looking pose**, and the visor obscures the eyes. Thus these directions cannot honestly be implemented as fully independent gaze or blink animation.

## Run

```sh
node server.mjs
# open http://localhost:4173
```

No npm install required. Or serve the folder with any static HTTP server. Opening `index.html` with `file://` does **not** work because ES modules and `fetch` require HTTP.

## Files

- `index.html`, `styles.css`: responsive hero and cinematic sprite card; never crops or stretches the original 9:16 composition
- `engine/spring.js`: frame-independent damped spring with velocity
- `engine/pointer.js`: hero-level pointer tracking and history for delayed reactions
- `engine/poses.js`: pose graph, always passing through neutral when switching directions
- `engine/assets.js`: lazy atlas decoding and limited LRU page cache
- `engine/renderer.js`: DPR-aware contain rendering, adjacent-frame blending
- `engine/controller.js`: 60 Hz `requestAnimationFrame` target, offscreen pause, reduced-motion
- `engine/index.js`: reusable `mountSpriteMascot` setup and cleanup API
- `assets/manifest.json`: 190 timecoded frame records and recorded pose ranges
- `assets/atlases/atlas-00.webp` ... `atlas-23.webp`: 24 native-resolution 8-frame horizontal atlases
- `assets/all-frames-horizontal.png`: **one full-timeline horizontal overview**, 13,680 × 128, meant for reviewing, not full-quality playback
- `assets/poster.png`: native-resolution static first-display image

A full-resolution single horizontal PNG atlas (`Mascot-AllFrames-Horizontal-FullRes.png`, 136,800 × 1,280) is supplied separately as an archival asset, but is not browser-compatible at that width.

The **190 lossless decoded PNGs** are supplied in a separate `Mascot-Original-PNG-Frames.zip` archive so production bundles don't ship ~172 MB of unused frames.

## Why the atlas is paginated

A single native-resolution horizontal sheet would be **136,800 × 1,280 px** and would exceed common GPU texture size limits (typically 8,192 or 16,384 px). A `72 × 128 px` overview sheet (all 190 frames) satisfies single-sheet indexing but would look blurry at hero scale. The actual site instead uses **24 sheets, each ≤ 5,760 × 1,280 px**, and loads only nearby pages. Every native frame is preserved as an original PNG separately.

## Quality and performance

Production atlases use visually high-quality **WebP quality 94** (slightly lossy). The complete original decoded PNGs are retained unchanged as a separate archive. Rendering uses canvas `drawImage` and compositor optimizations when supported; it **targets** 60 Hz rAF but cannot guarantee 60 fps on every device, especially given a 24 fps original. Blending adjacent source frames provides intermediate appearance but cannot synthesize missing views or guarantee artifact-free motion.

- No background removal, cropping, or frame stretching.
- A poster remains visible while atlases load.
- `ResizeObserver`, `IntersectionObserver`, `visibilitychange`, reduced-motion support.
- DPR capped to reduce mobile GPU/memory overhead.
- Lazy, at-most-five-page atlas cache.
- Vanilla JS modules, framework-agnostic. React integration is included in the website package.

## Replace the video later

Run `python scripts/prepare_sprite.py path/to/video.mp4 --out ./new-assets`. This extracts frames, writes horizontal atlases, and creates timecode/size metadata automatically. **Semantic pose annotation is not universal**: the generated `poseMap` sample values are curated for the supplied clip and must be re-annotated if a different clip has different motion. This cannot be reliably inferred from arbitrary MP4 frames without a pose-estimation model.

## Reuse inside React

```js
import { mountSpriteMascot } from './engine/index.js';

// Inside React useEffect after markup exists:
let cleanup;
mountSpriteMascot(rootRef.current, {
  hero: heroRef.current,
  manifestUrl: '/mascot-sprite/manifest.json'
}).then(fn => { cleanup = fn; });
return () => cleanup?.();
```

You can find the React wrapper and page integration in `JuaraMetaCorp-Sprite-Hero.zip`.

## JuaraMetaCorp integration notes

`src/components/Hero.tsx` now uses `<SpriteMascot />`, which mounts the exact same Vanilla JS engine. Existing CMS copy, hero buttons, navigation, secondary pages, and API server remain unchanged. The original PNG-based maskot components were left in the source for compatibility but are no longer used on the homepage. Hero image changes in CMS no longer replace the video sprite animation; edit the `SpriteMascot` asset manifest path to choose a different animation.
