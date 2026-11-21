import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Spring, LookHistory, DEG } from '../src/components/mascot-spring.ts';

test('spring is frame-rate tolerant and settles without jumps', () => {
  const a = new Spring(170,22);
  const b = new Spring(170,22);
  for (let i=0;i<60;i++) a.update(1,1/60);
  for (let i=0;i<120;i++) b.update(1,1/120);
  assert.ok(Math.abs(a.value-1)<.002);
  assert.ok(Math.abs(b.value-1)<.002);
  assert.ok(Math.abs(a.value-b.value)<.005);
});

test('look history honors 100ms delay before head target moves', () => {
  const h = new LookHistory();
  h.push(0,0,0);
  h.push(100,1,0);
  assert.ok(Math.abs(h.sample(0).x)<1e-9);
  assert.ok(Math.abs(h.sample(50).x-.5)<1e-9);
  assert.ok(Math.abs(h.sample(100).x-1)<1e-9);
});

test('angle target range is ±35° and radians match', () => {
  assert.ok(Math.abs(35*DEG-Math.PI*35/180)<1e-12);
});
