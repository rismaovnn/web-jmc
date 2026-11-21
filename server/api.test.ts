/** Run with npm run test:api. Real HTTP tests, with file-backed CMS and local storage. */
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import type { Server } from 'node:http';

let server: Server;
let base = '';
let workDir = '';
const PASSWORD = 'a-strong-testing-password-only';
before(async () => {
  workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jmc-cms-test-'));
  const salt = crypto.randomBytes(16);
  const digest = crypto.scryptSync(PASSWORD, salt, 64);
  process.env.CMS_DATA_DIR = workDir;
  process.env.CMS_ADMIN_PASSWORD_HASH = `scrypt$${salt.toString('hex')}$${digest.toString('hex')}`;
  delete process.env.VERCEL;
  delete process.env.CMS_STORAGE;
  delete process.env.PUBLIC_ORIGIN;
  const { default: app } = await import('./app');
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (server) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (workDir) await fs.rm(workDir, { recursive: true, force: true });
});
async function json(pathname: string, init: RequestInit = {}) {
  const response = await fetch(base + pathname, init);
  assert.match(response.headers.get('content-type') || '', /application\/json/);
  return { response, data: await response.json() as Record<string, unknown> };
}

test('health, content, API 404, malformed body, session without cookie all return JSON', async () => {
  const health = await json('/api/health');
  assert.equal(health.response.status, 200); assert.equal(health.data.status, 'ok');
  const content = await json('/api/content');
  assert.equal(content.response.status, 200); assert.ok(content.data.hero);
  const missing = await json('/api/does-not-exist');
  assert.equal(missing.response.status, 404);
  const noSession = await json('/api/admin/session');
  assert.equal(noSession.response.status, 401);
  const malformed = await json('/api/admin/login', {method: 'POST', headers: {'Content-Type':'application/json'}, body:'{broken'});
  assert.equal(malformed.response.status, 400);
});

test('admin login, CSRF, CRUD and image upload persist on disk', async () => {
  const login = await json('/api/admin/login', {
    method: 'POST', headers: {'Content-Type':'application/json', Origin:base}, body:JSON.stringify({password:PASSWORD}),
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.data.authenticated, true);
  const csrf = login.data.csrfToken as string;
  const cookie = login.response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie);
  const session = await json('/api/admin/session', {headers:{Cookie:cookie}});
  assert.equal(session.data.authenticated,true);
  const bad = await json('/api/admin/content/hero',{method:'PUT',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({value:{headline:'Changed'}})});
  assert.equal(bad.response.status,403);
  const saved = await json('/api/admin/content/hero', {
    method:'PUT', headers:{Cookie:cookie,'X-CMS-CSRF':csrf,'Content-Type':'application/json',Origin:base},
    body:JSON.stringify({value:{headline:'Test headline'}}),
  });
  assert.equal(saved.response.status,200);
  const afterSave = await json('/api/content');
  assert.equal((afterSave.data.hero as {headline:string}).headline,'Test headline');
  const image=await sharp({create:{width:16,height:16,channels:4,background:'#445566'}}).png().toBuffer();
  const upload=await json('/api/admin/upload', {
    method:'POST',headers:{Cookie:cookie,'X-CMS-CSRF':csrf,'Content-Type':'image/png',Origin:base},body:new Uint8Array(image),
  });
  assert.equal(upload.response.status,201);
  assert.match(String(upload.data.url), /^\/uploads\/[\w-]+\.webp$/);
  const file=await fetch(base+upload.data.url);
  assert.equal(file.status,200);
  assert.match(file.headers.get('content-type') || '',/image\/webp/);
  await file.arrayBuffer();
  const logout=await json('/api/admin/logout', {method:'POST',headers:{Cookie:cookie,'X-CMS-CSRF':csrf,Origin:base}});
  assert.equal(logout.response.status,200);
});
