# Perubahan source code JuaraMetaCorp — API/Vercel ESM

Berikut adalah **diff** terhadap paket audit yang tersedia sebelumnya. File lengkap tersedia pada folder yang sesuai di ZIP.

## api/index.ts

```diff
--- a/api/index.ts
+++ b/api/index.ts
@@ -1,45 +1,13 @@
 /**
- * Vercel Function entrypoint for all /api/* requests.
- * This guard avoids an opaque HTML 500 when importing the Express app fails.
- * It does not mask the root cause: the full error is logged in Vercel Functions.
+ * Vercel Node.js Function for all /api/* routes.
+ *
+ * IMPORTANT: use a STATIC ESM import. A lazy dynamic import of
+ * '../server/app' previously became an unresolved runtime path
+ * (/var/task/server/app) and caused HTTP 500 before Express could start.
+ *
+ * A static import lets the Vercel builder discover and include the entire
+ * Express dependency tree. The .js specifier matches emitted ESM output.
  */
-import type { IncomingMessage, ServerResponse } from 'node:http';
+import app from '../server/app.js';
 
-type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void;
-let appHandler: HttpHandler | null = null;
-
-function sendJson(res: ServerResponse, status: number, data: Record<string, unknown>) {
-  if (res.headersSent) return;
-  res.statusCode = status;
-  res.setHeader('Content-Type', 'application/json; charset=utf-8');
-  res.setHeader('Cache-Control', 'no-store');
-  res.setHeader('X-Content-Type-Options', 'nosniff');
-  res.end(JSON.stringify(data));
-}
-
-export default async function handler(req: IncomingMessage, res: ServerResponse) {
-  const pathname = (req.url || '').split('?')[0];
-
-  // Independent diagnostic: succeeds even if Supabase or the Express app cannot load.
-  if (req.method === 'GET' && pathname === '/api/ping') {
-    sendJson(res, 200, { status: 'ok', runtime: 'vercel-function', version: 'jmc-diagnostic-1' });
-    return;
-  }
-
-  try {
-    // Lazy import makes module-load failures observable from inside the function.
-    if (!appHandler) {
-      const { default: app } = await import('../server/app');
-      appHandler = app;
-    }
-    appHandler(req, res);
-  } catch (error) {
-    const err = error instanceof Error ? error : new Error(String(error));
-    console.error('[JMC_BACKEND_STARTUP_FAILED]', err.stack || err.message);
-    sendJson(res, 503, {
-      status: 'error',
-      code: 'BACKEND_STARTUP_FAILED',
-      message: 'The CMS API could not start. Inspect Vercel Function Logs.',
-    });
-  }
-}
+export default app;

```

## server/app.ts

```diff
--- a/server/app.ts
+++ b/server/app.ts
@@ -2,9 +2,9 @@
 import 'dotenv/config';
 import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express';
 import nodemailer from 'nodemailer';
-import { validateInquiry } from './validation';
-import { cmsRouter, cmsPublic, uploadsRouter, readContent } from './cms';
-import { getSections, useSupabase, validateSupabaseConfig } from './supabase';
+import { validateInquiry } from './validation.js';
+import { cmsRouter, cmsPublic, uploadsRouter, readContent } from './cms.js';
+import { getSections, useSupabase, validateSupabaseConfig } from './supabase.js';
 
 const app = express();
 const defaultDestination = 'juarametacorp@gmail.com';
@@ -88,6 +88,11 @@
   }
 });
 
+// Liveness check: does not require Supabase or CMS credentials.
+app.get('/api/ping', (_req, res) => {
+  res.status(200).json({ status: 'ok', service: 'juarametacorp-api' });
+});
+
 app.get('/api/health', async (_req, res) => {
   try {
     if (useSupabase) { validateSupabaseConfig(); await getSections(); }

```

## server/cms.ts

```diff
--- a/server/cms.ts
+++ b/server/cms.ts
@@ -6,9 +6,9 @@
 import express from 'express';
 import sharp from 'sharp';
 import sanitizeHtml from 'sanitize-html';
-import { defaultContent } from '../src/cms/defaultContent';
-import type { CMSContent, SectionKey } from '../src/cms/schema';
-import { useSupabase, getSections, putSection, getSession, putSession, deleteSession, uploadCmsImage, publicCmsImageUrl, getLoginFailures, recordLoginFailure, clearLoginFailures } from './supabase';
+import { defaultContent } from '../src/cms/defaultContent.js';
+import type { CMSContent, SectionKey } from '../src/cms/schema.js';
+import { useSupabase, getSections, putSection, getSession, putSession, deleteSession, uploadCmsImage, publicCmsImageUrl, getLoginFailures, recordLoginFailure, clearLoginFailures } from './supabase.js';
 
 export const dataDir = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), 'data'));
 const imageDir = path.join(dataDir, 'uploads');

```

## server/supabase.ts

```diff
--- a/server/supabase.ts
+++ b/server/supabase.ts
@@ -1,5 +1,5 @@
 /** Server-only Supabase REST and Storage transport. NEVER import from src/. */
-import type { SectionKey } from '../src/cms/schema';
+import type { SectionKey } from '../src/cms/schema.js';
 
 export const useSupabase = process.env.VERCEL === '1' || process.env.CMS_STORAGE === 'supabase';
 export const BUCKET = 'cms-images';

```

## server/index.ts

```diff
--- a/server/index.ts
+++ b/server/index.ts
@@ -3,7 +3,7 @@
 import express from 'express';
 import path from 'node:path';
 import { fileURLToPath } from 'node:url';
-import app from './app';
+import app from './app.js';
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
 const port=Number(process.env.PORT||3000);
 if (process.env.NODE_ENV === 'production') {

```

## src/cms/defaultContent.ts

```diff
--- a/src/cms/defaultContent.ts
+++ b/src/cms/defaultContent.ts
@@ -1,4 +1,4 @@
-import type { CMSContent } from './schema';
+import type { CMSContent } from './schema.js';
 export const defaultContent: CMSContent = {
   hero:{eyebrow:'Creative Technology Studio',headline:'JuaraMetaCorp',tagline:'Immersive Digital Experiences',description:'We build metaverse worlds, virtual environments, websites, applications, and interactive digital experiences for education, businesses, entrepreneurs, and public institutions.',primaryLabel:'Start Project',primaryHref:'/contact',secondaryLabel:'Explore Products',secondaryHref:'/product',image:''},
   about:{description:'We bring creativity, digital innovation, and immersive experiences together to shape new possibilities.',vision:'To be a leading creative technology company delivering immersive digital worlds for Indonesia and beyond.',mission:'<ul><li>Deliver high-quality metaverse worlds, virtual environments, and interactive digital experiences.</li><li>Help education, businesses, small enterprises, and public institutions benefit from creative technology.</li><li>Build relevant, intuitive solutions that create meaningful value for the people using them.</li></ul>'},

```

## package.json

```diff
--- a/package.json
+++ b/package.json
@@ -5,7 +5,7 @@
   "type": "module",
   "scripts": {
     "dev": "tsx watch server/index.ts",
-    "build": "npm run typecheck && vite build && npm run build:server",
+    "build": "npm run check:esm && npm run typecheck && vite build && npm run build:server",
     "build:server": "esbuild server/index.ts --bundle --platform=node --format=esm --packages=external --target=node22 --outfile=server-dist/index.mjs",
     "start": "node -e \"process.env.NODE_ENV='production'; import('./server-dist/index.mjs')\"",
     "preview": "vite preview",
@@ -17,7 +17,8 @@
     "typecheck": "tsc --noEmit",
     "test:smoke": "node scripts/smoke-production.mjs",
     "test:unit": "tsx --test src/lib/http.test.ts",
-    "test": "npm run typecheck && npm run test:api && npm run test:unit"
+    "test": "npm run check:esm && npm run typecheck && npm run test:api && npm run test:unit",
+    "check:esm": "node scripts/check-esm-imports.mjs"
   },
   "dependencies": {
     "@google/genai": "^2.4.0",

```

## File baru

- `scripts/check-esm-imports.mjs`: pemeriksaan ESM, entrypoint, dan rewrite order tanpa dependency.
- `INSTALL_FIX_KE_PROYEK_TERBARU.ps1`: menerapkan perbaikan backend di repository lokal terbaru dengan backup otomatis.
- `README_MULAI_VERSI_TERBARU.md`: tutorial lengkap instalasi serta batasan sumber terbaru.
