import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Spring } from '../engine/spring.js';
import { PoseGraph } from '../engine/poses.js';

const manifest = JSON.parse(fs.readFileSync(new URL('../assets/manifest.json', import.meta.url)));
test('source video metadata is preserved for all 190 frames', () => {
  assert.equal(manifest.source.width,720);
  assert.equal(manifest.source.height,1280);
  assert.equal(manifest.source.frameCount,190);
  assert.equal(manifest.frames.length,190);
  assert.equal(manifest.atlas.pageCount,24);
  assert.equal(manifest.source.hasAlpha,false);
  for (const f of manifest.frames) {
    assert.ok(fs.existsSync(new URL(`../assets/atlases/atlas-${String(f.page).padStart(2,'0')}.webp`,import.meta.url)));
    assert.ok(f.page*8+f.local===f.index);
  }
});

test('spring converges with finite inertia at 60 / 120 Hz', () => {
  for (const hz of [60,120]) {
    const s = new Spring(0,{stiffness:145,damping:24});
    s.setTarget(1);
    for (let i=0;i<hz*3;i++) {
      s.update(1/hz);
      assert.ok(Number.isFinite(s.value));
      assert.ok(s.value>=-0.2 && s.value<=1.2);
    }
    assert.ok(Math.abs(s.value-1)<.002);
  }
});

test('pose graph returns to neutral before switching direction', () => {
  const g = new PoseGraph(manifest.poseMap);
  let frame=104;
  for(let i=0;i<180;i++) frame=g.update(1/60,-1,0,true);
  assert.ok(frame<84);
  let maxDelta=0, prev=frame;
  for(let i=0;i<300;i++) {
    frame=g.update(1/60,0,1,true);
    maxDelta=Math.max(maxDelta,Math.abs(frame-prev));
    prev=frame;
  }
  assert.ok(frame>130);
  assert.ok(maxDelta<9);
});

test('idle remains in a tiny neutral range without autoplaying the full video', () => {
  const g = new PoseGraph(manifest.poseMap);
  let lo=Infinity,hi=-Infinity;
  for(let i=0;i<600;i++) {
    const f=g.update(1/60,0,0,false);
    lo=Math.min(lo,f); hi=Math.max(hi,f);
  }
  assert.ok(lo>=101 && hi<=107,{lo,hi});
});
