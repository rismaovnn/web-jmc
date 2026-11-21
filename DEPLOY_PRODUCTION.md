# JuaraMetaCorp — Vercel + Supabase production deployment

## Apa yang diperbaiki
- Vite frontend remains static in `dist/`; `api/index.ts` exports the Express app as a Vercel Node.js Function. **Do not point Vercel at a Windows path.** `server/index.ts` is used only for local development / standalone Node and has `app.listen()`; it is NOT the Vercel Function.
- `vercel.json` sends `/api` and `/api/*` to `/api/index` before the SPA fallback routes to `/index.html`. Vercel Functions preserve the original request URL for Express route matching. SPA routes `/admin`, `/about`, `/partners`, etc. remain accessible on refresh.
- `/api/*` application responses have JSON Content-Type, including 404, malformed JSON 400, payload too large 413, auth 401/403, and service errors. **Platform-level failures before the Function runs can still be HTML**, so frontend now checks Content-Type before parsing.
- CMS writes are stored in Supabase Postgres; images in public Supabase Storage; sessions and login limit are shared across instances. No writes to Vercel's ephemeral filesystem.
- New `sb_secret_*` API keys can be used; legacy `service_role` JWTs are supported as a fallback. Never add secrets to `VITE_*` or commit `.env`.

## 1. Repositori dan Vercel
1. Extract the project ZIP into the **root of your GitHub repo** (same folder as `package.json`). Preserve `api/index.ts`, `server/`, `src/`, `public/`, `supabase/`, `package-lock.json` and `vercel.json`.
2. Vercel project **Settings → Build and Deployment**: Framework Preset **Vite**, Root Directory **`./`** (repository root containing `package.json`), Install Command **`npm ci`** (or default `npm install`), Build Command **`npm run build`**, Output Directory **`dist`**. **Never** enter `D:\...` as Root Directory.
3. In project **Settings → General**, set Node.js version to **22.x** if available; `package.json` also specifies Node 22.
4. Keep `vercel.json` from this package. `api/index.ts` must exist and export the Express `app` as default. Do not use a rewrite that sends `/api/*` to `/index.html`.

## 2. Supabase (before deploying CMS)
1. Create a Supabase project, SQL Editor → run `supabase/schema.sql` in full. Re-run on existing Supabase projects to create the new rate limiter schema.
2. In Supabase Project Settings → API Keys, copy **Secret key** (`sb_secret_...`, recommended) or **Legacy service_role** JWT. Do NOT use publishable or anon key. Store only in Vercel server Environment Variables:

   ```dotenv
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_YOUR_SECRET
   CMS_ADMIN_PASSWORD_HASH=scrypt$...$...
   PUBLIC_ORIGIN=https://yourdomain.com
   ```

   For a legacy project, use `SUPABASE_SERVICE_ROLE_KEY` *instead of* `SUPABASE_SECRET_KEY`. `PUBLIC_ORIGIN` must match the actual browser origin for login/saves. On preview domains, either omit `PUBLIC_ORIGIN` in Preview env or use separate Preview settings; don't allow arbitrary origins.
3. Generate the CMS password hash locally with `npm run cms:setup`; copy **only** `CMS_ADMIN_PASSWORD_HASH` (not the plaintext password) from local `.env` to Vercel Environment Variables. Set variables for the Production environment; Preview if needed.
4. If using contact form email, set server-only `SMTP_USER` and `SMTP_APP_PASSWORD`. Without SMTP, `POST /api/inquiries` reports 503 JSON, not a silent success.
5. Before migration, take a backup of old `data/cms.json`, `data/uploads`, and current Supabase database if already used. Then run one-time migration **from the project folder that contains the old data**:

   ```bash
   # Windows PowerShell after adding values to .env
   node --env-file=.env scripts/migrate-local-cms.mjs
   ```

   The script refuses to overwrite existing Supabase CMS rows unless explicitly invoked with `--force` (which is risky). Confirm migrated images resolve via public Supabase Storage URLs. `data/cms.json` and uploaded files are excluded from Git intentionally.

## 3. Tests before pushing

```bash
node --version    # use Node 22.x
npm ci            # clean cross-platform install
npm run typecheck
npm test
npm run build     # generates dist/ and server-dist/
npm run dev       # local http://localhost:3000 (Vite and Express)
```

A Windows `node_modules` directory MUST NOT be copied to Linux or committed. Vercel installs Linux-native `sharp`, `esbuild`, and Rollup binaries with `npm ci`.

`npm run preview` serves only Vite's static assets and **does not run CMS API**. To test the built site with Node locally, use `npm start` (on `http://localhost:3000`).

## 4. Deploy and verify

```bash
git add .
git commit -m "Fix Vercel CMS routing and Supabase persistence"
git push
```

Vercel will deploy from its connected Git branch. Check deployment **Build Logs** and **Functions**. After the status is **Ready**:

```bash
npm run test:smoke -- https://YOUR-VERCEL-DOMAIN.vercel.app
```

This read-only smoke test checks `/api/health`, `/api/content`, a 404 route, `/api/admin/session`, and SPA deep routes. **Then manually open `/admin`**, login, edit a text, upload an image, save, reload, and redeploy. The uploaded image and updated text must remain. Follow browser Network tab for JSON Content-Type. Use Vercel Function Logs for Supabase errors.

## 5. Common failure diagnosis

| Symptom | Likely problem | Fix |
|---|---|---|
| Vercel looks for `D:\...\package.json` | Root Directory misconfigured | Set Vercel Root Directory to repository root `./` |
| `API ... returned non-JSON` | Vercel platform returned HTML (Function missing/crashed/rewrite) | Check Vercel build, Functions and `api/index.ts`, then `vercel.json` |
| `/api/health` 503 JSON | Supabase credentials/schema or admin hash missing | Run SQL schema, validate env, redeploy |
| `/api/content` 503 JSON | Supabase query failed | Check Supabase database, key and Vercel Function Logs |
| Login 401 JSON | Wrong admin password | Generate correct `CMS_ADMIN_PASSWORD_HASH` and deploy |
| Login 403 JSON | Origin mismatch | Check `PUBLIC_ORIGIN` and domain/preview env |
| Login 429 JSON | Shared login limiter triggered | Wait 15 minutes; don't brute force |
| Upload 413 | Request too large at Vercel edge | Frontend auto-compresses; retry after resizing |
| Upload 503 JSON | Storage permission/bucket error | Run SQL and verify `cms-images` bucket |
| Preview works but live domain fails | Environment variables scoped only to Preview | Add Production env values and redeploy |
| UI shows old content | data migration not executed, or stale tabs | Check `/api/content`, Supabase rows and reload |

## 6. Operations/security

- Never expose `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `CMS_ADMIN_PASSWORD_HASH` to frontend/browser. Do not set `VITE_` variables for secrets.
- Only images are publicly readable. CMS JSON and session tables are protected by RLS and server-only keys.
- Use secure HTTPS on Vercel; CMS uses httpOnly SameSite=Strict session cookies + CSRF, origin validation, and shared login rate limits.
- If you deploy multiple custom domains, designate ONE admin origin or configure the allowed origin for your admin domain. `PUBLIC_ORIGIN` must be an exact scheme + host match.
- Back up Supabase Postgres and Storage periodically. Deleting an image file deliberately requires separate cleanup logic, not included here (to avoid deleting images still referenced by content).
- The project uses `npm ci` and GitHub Actions to catch build/test errors on Linux. Actual Vercel success and Supabase CRUD still require live project credentials.

Official references:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/frameworks/backend/express
- https://vercel.com/docs/project-configuration/vercel-json
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys
