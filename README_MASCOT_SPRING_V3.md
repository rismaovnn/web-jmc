# JuaraMetaCorp — Interactive Mascot V3 (Spring + 2.5D Mesh)

This release changes the animation mechanics, not just the CSS rotation values.

## What actually changed

The mascot is rendered in a Three.js `ShaderMaterial` on a **subdivided plane mesh** (72 × 108 segments). The source remains the original transparent PNG. Rather than rotating an entire flat image with CSS, the vertex shader applies different virtual deformation regions for **head, neck, shoulders, hair, and the visor/eye area**. The head transformation is applied **around a neck pivot** using 3D yaw, pitch and roll matrices with local facial depth; shoulders and hair deform independently.

Those regions are *virtual skin-weight masks*, not distinct raster-image layers. They intentionally overlap softly to avoid cutout gaps. Real 3D side/back geometry is not present in a single PNG; a 35° yaw looks more like depth-aware 2.5D deformation than a genuinely rigged 3D character.

## Spring and latency

| Response | Movement range | Target delay | Spring constants |
| --- | --- | --- | --- |
| Eyes/gaze proxy | normalized ±1 | 0 ms | stiffness 680, damping 40 |
| Head | yaw ±35°, pitch ±25°, roll ±8° | 100 ms | stiffness 164–170, damping 22–23 |
| Neck | yaw ±17°, pitch ±10° | 185 ms | stiffness 86–90, damping 17 |
| Shoulders | yaw ±5.5°, counter-rotation ±3.2° | 212 ms | stiffness 70–74, damping 18–19 |
| Hair | independent delayed inertia | 285 ms | stiffness 42–47, damping 10–11 |

Spring integration is semi-implicit Euler with fixed small internal substeps, driven by frame delta. All joints have their **own position and velocity** and therefore their own inertia. Head and neck are not just one shared CSS transform.

Idle motion includes breathing, head micro-nods, hair movement and subtle periodic gaze drift. Clicking applies a small nod/roll and smile emphasis. Floating happens on the container and does not replace head deformation.

## IMPORTANT: the VR visor covers both eyes

The supplied picture has **no visible irises or eyelids**, so the output **cannot visibly track eyes or blink in the literal sense**. A small faster-moving visor region suggests eye attention, but it is **not** a fabricated moving pupil. To activate visible eyes, pass `eyesSrc`, a transparent eye-only PNG with the **same canvas dimensions, positioning and transparency** as the main image. When provided, eyes gain independent local gaze movement, blink deformation, and inherit the head's transformation.

```tsx
<InteractiveMascot
  src="/images/mascot-vr.png"
  // Only if your mascot has visible eyes provided separately:
  eyesSrc="/images/mascot-eyes.png"
/>
```

For truly convincing ±35° sideward head turns with visible side profile, use a **3D rigged `.glb/.gltf` model** or separated rendered views. A single PNG cannot reveal missing pixels.

## Reuse with a different PNG

1. Replace `public/images/mascot-vr.png` with a transparent PNG.
2. For a similarly posed character, the default rig can work unchanged.
3. If facial proportions change, adjust `rig` anchors below (normalized UV, (0,0) bottom-left):

```tsx
<InteractiveMascot
  src="/images/mascot-vr.png"
  rig={{
    head: [0.53, 0.835],
    neck: [0.535, 0.700],
    shoulder: [0.525, 0.625],
    hair: [0.53, 0.930],
    eyes: [0.525, 0.845],
    mouth: [0.49, 0.765],
  }}
/>
```

This architecture preserves the animation engine when swapping PNG files, although **very different silhouettes still require adjusting anchors and zone dimensions**. The image is cropped via a camera framing of its upper 50% at desktop proportions, showing head, neck, shoulders and upper chest. For a completely different image ratio, adjust `viewHeight` in the component and the fallback image's corresponding CSS size.

## Install and launch

From the **website archive** folder in VS Code:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Run TypeScript checks with `npm run lint`, and spring tests with:

```bash
node --experimental-strip-types --test tests/mascot-spring.test.mjs
```

Use a supported Node 22 release (Node 22.12+ recommended for Vite 8) and reinstall `node_modules` on your own OS. Do not move Windows `node_modules` to Linux or vice versa.

## Files

- `src/components/InteractiveMascot.tsx` — Three.js rig, GL shaders, independent spring-based gaze tracking, web interactions, lifecycle and fallback.
- `src/components/mascot-spring.ts` — reusable physics spring + gaze history utility.
- `src/components/interactive-mascot.css` — portrait frame, 4-second floating, halo/parallax and responsive styling.
- `src/components/Hero.tsx` — existing Hero embeds the mascot, CMS and navigation unchanged.
- `public/images/mascot-vr.png` — source PNG unchanged at 1024 × 1536 resolution.
- `tests/mascot-spring.test.mjs` — physics tests.

## Performance and accessibility

- `requestAnimationFrame` integrates all joints once per frame; pointer listeners only cache positions.
- WebGL one draw call per frame (plus optional eyes layer), no React state updates for joint angles.
- Mesh is 72 × 108 segments, avoids oversized buffer churn.
- Limits pixel ratio to 2 on fine pointers and 1.5 on coarse pointers.
- Stops the loop when the page is hidden or the section is offscreen.
- Falls back to an original PNG if WebGL is disabled or texture loading fails.
- Honors `prefers-reduced-motion`; interaction also works with Enter / Space.
- Mobile supports touch-driven look input followed by idle.

## Verification status

- TypeScript `npm run lint`: **passed**.
- Spring unit tests: **3 passed**.
- Full Linux Vite production build: **not verified**; the original ZIP contains Windows-specific native dependencies. The locally extracted Windows `node_modules` lacks Linux rolldown binaries. Run clean `npm install` on your computer before testing.
- Browser WebGL rendering in this environment could not be visually tested because its headless renderer is denied a GPU/WebGL context. The screenshot included, if any, is a static crop reference rather than evidence of a running shader.

## Next quality step

For full Mindframes-like character acting, create layered assets (actual head/eyes/hair sprites) or a rigged 3D model. This release pushes a *single existing PNG* further, but it does not pretend to synthesize missing side views or hidden eyes.
