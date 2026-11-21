import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, requestJson } from './http';

// Node test environment supplies fetch, while this transport intentionally uses browser timers.
(globalThis as any).window = globalThis;
test('frontend JSON parser detects HTML response without throwing Unexpected token', async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () => new Response('<html>A server error</html>', {
    status: 500, headers: {'content-type':'text/html; charset=utf-8'},
  });
  try {
    await assert.rejects(requestJson('/api/admin/login'), (error: unknown) =>
      error instanceof ApiError && error.status === 500 && /non-JSON/.test(error.message));
  } finally { globalThis.fetch = previous; }
});

test('frontend JSON parser handles successful and failed JSON responses', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('{"status":"ok"}', {
    status: 200, headers: {'content-type':'application/json'},
  });
  try { assert.deepEqual(await requestJson('/api/health'), {status:'ok'}); }
  finally { globalThis.fetch = original; }
  globalThis.fetch = async () => new Response('{"message":"Login failed"}', {
    status: 401, headers: {'content-type':'application/json'},
  });
  try { await assert.rejects(requestJson('/api/admin/login'), (error:unknown) =>
    error instanceof ApiError && error.status === 401 && error.message === 'Login failed'); }
  finally { globalThis.fetch = original; }
});
