# JuaraMetaCorp — Isi Lengkap Seluruh File yang Diperbaiki dan Ditambahkan

Berikut adalah isi utuh setiap file yang berbeda dari ZIP sebelumnya. Bukan hanya snippet atau ringkasan.
File diubah: 17. File baru: 7.

## Daftar File

- `.env.example`
- `CMS_SETUP_GUIDE.md`
- `README.md`
- `README_MULAI_DI_SINI.md`
- `VERCEL_SUPABASE_SETUP.md`
- `package.json`
- `scripts/migrate-local-cms.mjs`
- `server/app.ts`
- `server/cms.ts`
- `server/supabase.ts`
- `src/cms/ContentContext.tsx`
- `src/components/MotionExperience.tsx`
- `src/components/PartnerMarquee.tsx`
- `src/pages/AdminPage.tsx`
- `src/pages/ContactPage.tsx`
- `supabase/schema.sql`
- `vercel.json`
- `.github/workflows/ci.yml`
- `AUDIT_REPORT.md`
- `DEPLOY_PRODUCTION.md`
- `scripts/smoke-production.mjs`
- `server/api.test.ts`
- `src/lib/http.test.ts`
- `src/lib/http.ts`

## `.env.example`

``````dotenv
# Copy to .env for LOCAL development. Do not commit .env or put any secret in VITE_*.
PORT=3000
# Local CMS initially uses data/cms.json and data/uploads. After migration, enable Supabase:
# CMS_STORAGE=supabase
# REQUIRED in Vercel (auto uses Supabase when VERCEL=1):
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
# Preferred secret key (Supabase > Project Settings > API Keys; sb_secret_...)
SUPABASE_SECRET_KEY=
# Alternative for legacy projects ONLY; do not fill in both:
# SUPABASE_SERVICE_ROLE_KEY=
# Generate the hash locally: npm run cms:setup
CMS_ADMIN_PASSWORD_HASH=
# Your deployed production origin (no slash), used for cross-site protection:
# PUBLIC_ORIGIN=https://your-domain.com
# Optional, for contact form email:
SMTP_USER=juarametacorp@gmail.com
SMTP_APP_PASSWORD=
# Only behind a trusted reverse proxy outside Vercel:
TRUST_PROXY_HOPS=0
``````

## `CMS_SETUP_GUIDE.md`

``````markdown
> Untuk **Vercel + Supabase**, gunakan `DEPLOY_PRODUCTION.md`. Dokumen ini membahas mode file-backed lokal dan hosting dengan persistent disk.

# JuaraMetaCorp CMS 2.0 — Installation & administration

This version extends the existing React + Vite + Express website. It intentionally **does not migrate to Next.js**: it offers a lightweight, file-backed CMS (database migration can come later) while preserving the existing email inquiry endpoint and site design.

## Upgrade safely on Windows / VS Code

1. **Back up your working `WEB` folder**, especially `.env`, `public/images/projects`, and any custom assets.
2. Extract the CMS full website ZIP. Copy the files inside `WEB` into your existing `WEB` project, replacing source files. **Do not overwrite/delete your working `.env`.**
3. In the project directory containing `package.json`, run `npm install`. This adds `sharp` (image optimization) and `sanitize-html` (safe rich text).
4. Set a strong admin password: `npm run cms:setup` and follow the prompts. The script appends a **scrypt password hash** to the existing `.env` without touching Gmail credentials.
5. Stop any running dev server (`Ctrl+C`), then run `npm run dev`.
6. Open `http://localhost:3000/admin`. Sign in with your new password. Your original public website remains at `/`.
7. Upload images using the Upload button in the dashboard. Content changes save automatically after ~1.2 seconds of no editing, or with **Save now**.

The CMS works entirely on the server for authoring; public pages load content from `GET /api/content`. Uploaded images are stored under `data/uploads/` and served as `/uploads/*.webp`.

## Existing photo links / projects

The three project entries and four original partners are preloaded. To use your existing JPG/JPEG/PNG/WebP thumbnails, upload them through the CMS. A legacy file such as `public/images/projects/360.jpeg` can also be entered directly as `/images/projects/360.jpeg` if present in your local project. Both original live URLs are pre-populated:

- Rumah Adat Lampung: Google Drive link from the previous site
- SMK Al Kautsar: Roblox experience link from the previous site

The MetaSchool SMKN 4 product remains separate (no external link has been supplied). **External project links open in a new tab**; the CMS accepts HTTPS/HTTP URLs, not arbitrary JavaScript.

## Security

- All editing, uploading and login actions are server-owned under `/api/admin`.
- The admin password is stored only as a **scrypt hash** in `.env`, never in Vite/client code.
- Sessions are random 256-bit tokens in **httpOnly, SameSite=Strict** cookies, with `Secure` in production. They expire after 12 hours and reset on restart (single-instance memory sessions).
- Mutations check same-origin requests and a session-specific CSRF token. Login attempts are limited by IP.
- Rich text is allowlist-sanitized on the server; uploads are size/pixel-limited, decoded with Sharp and recompressed as WebP, removing source metadata.
- Never commit `.env` or the `data/` folder. The included `.gitignore` excludes live site content and uploads.
- For public deployment use HTTPS, configure `PUBLIC_ORIGIN=https://your-domain.example`, and host on a **writable persistent disk**. Most serverless/read-only deployments will not preserve JSON edits and uploaded images.
- File-based CMS is intended for a single Node process and a small number of admins. For multiple replicas/admins, migrate `data/cms.json` to PostgreSQL, persist images in object storage, and use a shared session store. The React content components can continue consuming `/api/content`.
- Back up both `data/cms.json` and `data/uploads/` before deployment or upgrades. Uploaded images are intentionally not deleted automatically, to avoid breaking references; clean unused files manually after backups.

## Troubleshooting

- “Admin password not configured” → run `npm run cms:setup` from `WEB` and restart `npm run dev`.
- “Unable to save data” → make sure the Node process has write permission to `data/` or set `CMS_DATA_DIR` to a writable persistent folder.
- “Image could not be processed” → use genuine JPG, PNG, WebP or AVIF, below 8 MB and 30 megapixels.
- “CSRF token invalid” → refresh `/admin`, sign in again and retry.
- Gmail SMTP is separate and keeps using `SMTP_USER` / `SMTP_APP_PASSWORD` in your existing `.env`. The recipient address on the contact page is now editable in CMS Contact, but the default is `juarametacorp@gmail.com`.
- If public content seems stale, refocus the browser tab (or reload); pages refresh CMS content on focus and every 30 seconds.

## Commands

```bash
npm install
npm run cms:setup
npm run dev
npm run lint
npm run build
```
``````

## `README.md`

``````markdown
# JuaraMetaCorp Website + CMS v2.0

**New:** Secure `/admin` dashboard for Hero, About, Products, Partners, Leadership, Contact and Footer. See **[CMS_SETUP_GUIDE.md](CMS_SETUP_GUIDE.md)** before updating your current website. Keep your existing `.env` (Gmail SMTP credentials) and back up your custom images before copying source files. This edition remains React + Vite + Express. Local CMS can use file persistence; Vercel CMS uses Supabase Postgres and Storage. See `DEPLOY_PRODUCTION.md`. The `preview.html` is a legacy static mockup; use `npm run dev` to view the actual CMS-powered website.

---

# JuaraMetaCorp — Premium Corporate Website

React 19 + Vite 8 website with an Express/Nodemailer 10 inquiry endpoint and interactive partner marquee.

## What's new in this release

### Real project inquiry form

`/contact` now offers **Send Project Inquiry** instead of Copy Project Brief. It submits to the server-side `POST /api/inquiries` endpoint. Nodemailer sends mail through Gmail SMTP to **juarametacorp@gmail.com**, with the sender's email set as `Reply-To`.

- Required: name, email, project type, details.
- Email subject: `New Project Inquiry – [Project Type]`.
- Email body: Name, Email, Project Type, Project Details.
- Client/server validation, accessible loading/success/error messages, 30-second client timeout.
- Honeypot + per-IP rate limiting and controlled recipient/project-type allowlist.
- App Password is read from **server-only** `.env` values; no SMTP credentials appear in frontend files.

**Email sending requires configuring an App Password yourself.** The downloaded project does not include credentials, and cannot transmit emails until it runs on an SMTP-enabled Node server.

### Partner marquee

The Partners page replaces four tall logo cards with small navy-gradient pills, yellow accent icons, logos, and partner names. Two identical strips animate continuously from right to left on a **36-second CSS transform loop**. Hover/focus pauses the animation; desktop drag and mobile swipe can reposition it. Reduced-motion preferences are honored.

Partners remain:

1. PT Bukit Asam Tbk
2. SMKN 4 Bandar Lampung
3. STKIP PGRI Bandar Lampung
4. Universitas Teknokrat Indonesia

The logo images retain their pre-existing public-source URLs and fall back to visible initials if a remote image fails. For production/offline reliability, replace these remote URLs with approved original logo files under `public/images/partners/`. Do not recreate or distort official partner marks.

### Preserved visual design

- White section → dark navy cards; navy section → white/light glass cards.
- English text throughout.
- About **Our Vision & Our Mission** preserved; only the old Journey timeline was removed.
- Product showcase, official JuaraMetaCorp logo, leadership hierarchy, and footer wordmark preserved.

## Getting started (Node.js 22+)

1. Install Node.js 22+ and npm.
2. In terminal, change into the `WEB` directory.
3. Run `npm install`.
4. Copy `.env.example` to `.env` (on Windows: `copy .env.example .env`; on macOS/Linux: `cp .env.example .env`).
5. Set `SMTP_USER=juarametacorp@gmail.com` and `SMTP_APP_PASSWORD` to an **actual Google App Password** in `.env`.
6. Run `npm run dev`, then open `http://localhost:3000/contact`.
7. Send a real test project inquiry and check the JuaraMetaCorp mailbox.

**Never share your App Password in chat, push `.env` to Git, or use a `VITE_` prefix for email credentials.** An App Password usually requires Google 2-Step Verification.

This ZIP **includes** `package-lock.json`. Use `npm ci` for reproducible installs; never commit Windows `node_modules` to a Linux Vercel deployment. GitHub Actions runs `npm ci`, tests and build on Linux.

## Build and deploy

```bash
npm run build
npm start
```

`npm run build` produces the static Vite bundle **and** the bundled Express server in `server-dist/`. `npm start` serves both UI and API on port `PORT` (default `3000`). A **Node-capable host** is required; static file hosting alone cannot send email. For HTTPS deployments, configure `PUBLIC_ORIGIN=https://your-domain.com` and set `TRUST_PROXY_HOPS` only when required by your trusted reverse proxy.

## Useful files

| File | Purpose |
|---|---|
| `src/pages/ContactPage.tsx` | Contact form UI and client-side validation |
| `server/index.ts` | Protected API route and Nodemailer SMTP delivery |
| `server/validation.ts` | Reusable server-side validation |
| `server/inquiries.test.mjs` | Unit tests for inquiry validation |
| `src/components/PartnerMarquee.tsx` | Infinite marquee, hover pause, pointer drag |
| `src/pages/PartnersPage.tsx` | Partner-page layout and secondary content |
| `src/site.css` | Global design tokens, contact and marquee styles |
| `.env.example` | Non-secret configuration template |
| `CONTACT_SETUP.md` | Full Gmail App Password / API / deployment guide |
| `preview.html` | Static visual preview only, no live backend |

Check validation logic with `npm run test:api`. Test the whole React/Node stack with `npm run dev` after dependencies are installed.

## Limits / assets

- **SMTP live send and production build have not been exercised in this environment**: npm registry access is blocked, and no Gmail App Password was provided. TypeScript/TSX syntax and isolated validation tests were checked.
- `preview.html` is not a functional app: to send mail use the Node server.
- Partner logos are linked remotely; production should use original official downloadable logo assets with permission.
- Project showcase graphics are concept artwork until official screenshots are supplied. Leadership portraits originated from the supplied organizational chart; replace with approved high-resolution portraits for production.
- The official Instagram handle has not been verified and remains unset in `src/config/company.ts`.


## Motion & transitions (2026 update)

The website now includes restrained premium motion across all pages:
- Staggered scroll reveals for headings, cards, partner marquee, and section links.
- Smooth route transitions and a 3px scroll-progress line above the navbar.
- Soft floating aurora and glowing text accents in hero/page banners.
- Hover spotlight and subtle pointer tilt on project cards, animated project-image sheen, and button micro-interactions.
- Animated form success/error feedback; the email API, endpoint, validation, and `.env` format are unchanged.
- Respects **prefers-reduced-motion**; moving backgrounds, scroll reveal, parallax micro-animations, and marquee stop for users who request reduced motion.

Motion lives in `src/components/MotionExperience.tsx`, `src/App.tsx`, and `src/site.css`. The application uses the already-installed `motion` dependency, so no extra animation library is required.

To run: `npm install` then `npm run dev`. Set `SMTP_USER` and `SMTP_APP_PASSWORD` in a local `.env` (never commit it) to keep live inquiries working.

## Editable project images (JPG/PNG/WebP supported)

Edit `public/images/projects/project-images.json` with the image filenames stored under `public/images/projects/`. The Products page and modal both use this manifest. No image conversion to SVG or React source edit is needed. Missing images fall back to bundled SVG concept artwork. See `IMAGE_REPLACEMENT_GUIDE.md`.


## Live project links

See [PROJECT_LIVE_LINKS_GUIDE.md](PROJECT_LIVE_LINKS_GUIDE.md) to change which Google Drive or Roblox project opens when visitors click **View Project**.

## Deployment ke Vercel + Supabase (CMS persisten)

**PENTING:** Untuk Vercel, ikuti **`DEPLOY_PRODUCTION.md`** (ringkasan: `VERCEL_SUPABASE_SETUP.md`) terlebih dahulu. Dokumentasi `CMS_SETUP_GUIDE.md` mendeskripsikan mode lokal/hosting persistent disk; Vercel menggunakan Supabase Database dan Storage sebagai penyimpanan permanen. Sebelum upgrade dari versi lama, migrasikan `data/cms.json` dan `data/uploads` memakai `scripts/migrate-local-cms.mjs`.
``````

## `README_MULAI_DI_SINI.md`

``````markdown
# JUARAMETACORP — WEBSITE LENGKAP + CMS ADMIN

**Ini paket website lengkap, BUKAN patch.** Folder ini berisi `package.json`, `src/`, `server/`, `public/`, website yang telah didesain, dan CMS di `/admin`.

## Pemasangan paling aman di Windows

1. Ekstrak ZIP sehingga terlihat folder **`JuaraMetaCorp-WEB-CMS`**.
2. Di VS Code pilih **File → Open Folder... → JuaraMetaCorp-WEB-CMS**. **Jangan buka folder `src`** dan jangan jalankan `npm` di folder website lama.
3. Jika website lama sudah bisa mengirim email, **salin file `.env` lama** (file tersembunyi di folder yang sama dengan `package.json` lama) ke folder ini. **Jangan kirim file `.env` kepada siapa pun.** Jika tidak punya `.env` lama, salin `.env.example` menjadi `.env` dan isi pengaturan SMTP secara privat.
4. Salin gambar pribadi yang sebelumnya Anda tambahkan (misalnya `360.jpeg` dan `metaschool.jpeg`) dari folder lama `public/images/projects/` ke folder baru dengan path yang sama. Bila pernah memakai CMS dan memiliki `data/cms.json` serta `data/uploads/`, salin kedua data tersebut agar perubahan lama tetap ada.
5. Hentikan server website lama (`Ctrl+C` pada terminal server sebelumnya), supaya port **3000** tidak bentrok.
6. Buka terminal baru dalam VS Code, jalankan:

   ```powershell
   npm run
   ```

   Hasil yang benar harus menampilkan **`juarametacorp-website@2.0.0`**, serta `cms:setup`, `dev`, `build` dan lainnya. Jika masih tertulis **`react-example@0.0.0`**, folder yang dibuka SALAH.

7. Instal paket lalu buat password CMS:

   ```powershell
   npm install
   npm run cms:setup
   ```

   Buat password admin minimal 12 karakter, ketik ulang untuk konfirmasi. Password **tidak memiliki nilai default**. Script akan menambahkan hash password ke `.env` tanpa mengganti konfigurasi Gmail.

8. Jalankan website:

   ```powershell
   npm run dev
   ```

9. Buka:
   - Website: **http://localhost:3000/**
   - Products: **http://localhost:3000/product**
   - Admin CMS: **http://localhost:3000/admin**
   - Contact: **http://localhost:3000/contact**

## Pilihan tanpa mengetik alamat folder

- Klik dua kali `CEK-PROJECT-WINDOWS.cmd` untuk memeriksa apakah Anda menjalankan folder yang benar.
- Klik dua kali `SETUP-CMS-WINDOWS.cmd` untuk memasang dependency dan mengatur password.
- Klik dua kali `JALANKAN-WEBSITE-WINDOWS.cmd` untuk menyalakan server.

**Catatan:** Kode memang lengkap, tetapi paket `node_modules` tidak disertakan; `npm install` memerlukan koneksi internet. Jangan memindahkan `.env` ke dalam folder `src` atau `public`.

## Isi website

- Premium Hero, Services, Our Products, Partners Marquee, About + Vision/Mission, Leadership, Contact, Footer.
- Tiga project awal: Rumah Adat Lampung 360 (Google Drive), MetaSchool SMKN 4 Bandar Lampung, dan SMK Al Kautsar (Roblox).
- Empat partner tetap tersedia: PT Bukit Asam, SMKN 4 Bandar Lampung, STKIP PGRI Bandar Lampung, Universitas Teknokrat Indonesia.
- CMS aman dengan Supabase Database/Storage di Vercel (mode file JSON hanya untuk lokal), login password scrypt, cookie httpOnly, CSRF, upload WebP, dan autosave.
- Contact API melalui Gmail SMTP (kredensial hanya di `.env` pada server).

**Penting untuk hosting:** CMS file-based perlu penyimpanan permanen (`data/`) dan satu proses Node.js; untuk deployment serverless gunakan database/object storage.

Baca juga `CMS_SETUP_GUIDE.md`, `CONTACT_SETUP.md`, dan `PROJECT_LIVE_LINKS_GUIDE.md` untuk rincian teknis.

## Deploy Vercel (penting)

Untuk Vercel **jangan** mengandalkan `data/uploads/` atau `data/cms.json`. Gunakan Supabase Database/Storage. Panduan baru ada di **`DEPLOY_PRODUCTION.md`**. Setting Root Directory Vercel adalah repository root `./`, **bukan** path Windows.
``````

## `VERCEL_SUPABASE_SETUP.md`

``````markdown
# Panduan terbaru: Vercel + Supabase untuk CMS JuaraMetaCorp

**Gunakan `DEPLOY_PRODUCTION.md` sebagai panduan resmi untuk versi ini.** Panduan tersebut menjelaskan pengaturan Root Directory Git repository, cara kerja `api/index.ts` sebagai Vercel Function, Environment Variables, migrasi konten/foto, serta pengujian produksi.

## Ringkasan cepat

1. Vercel: pilih **Vite**, Root Directory **`./`** (folder `package.json` di root repo, **BUKAN path lokal `D:\...`**), Build **`npm run build`**, Output **`dist`**.
2. `api/index.ts` adalah **Vercel Function entrypoint** yang mengimpor aplikasi Express dari `server/app.ts`. `server/index.ts` hanya menjalankan server pada Node lokal.
3. Jalankan `supabase/schema.sql` di SQL Editor Supabase (termasuk tabel pembatas login baru).
4. Isi Environment Variables server di Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (rekomendasi; `sb_secret_...`) atau `SUPABASE_SERVICE_ROLE_KEY` (legacy JWT), `CMS_ADMIN_PASSWORD_HASH`, dan opsional `PUBLIC_ORIGIN`, `SMTP_USER`, `SMTP_APP_PASSWORD`.
5. Migrasikan foto/konten dari `data/` menggunakan `node --env-file=.env scripts/migrate-local-cms.mjs` **sebelum** mengganti website live. Jangan gunakan `--force` tanpa backup.
6. Jalankan `npm ci`, `npm test`, dan `npm run build`; push ke Git. Setelah deploy jalankan `npm run test:smoke -- https://domain-kamu.vercel.app`.
7. Uji login, edit teks, upload foto, refresh, dan redeploy. Setelah upgrade satu kali, perubahan CMS disimpan di Supabase tanpa redeploy.

**Keamanan:** Jangan commit `.env`, jangan pakai `VITE_` untuk API secret, dan jangan menggunakan anon/publishable key untuk server. Preview yang memakai kredensial production dapat mengubah database live.

**Detail troubleshooting, daftar error dan langkah deploy lengkap:** [`DEPLOY_PRODUCTION.md`](DEPLOY_PRODUCTION.md).
``````

## `package.json`

``````json
{
  "name": "juarametacorp-website",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "npm run typecheck && vite build && npm run build:server",
    "build:server": "esbuild server/index.ts --bundle --platform=node --format=esm --packages=external --target=node22 --outfile=server-dist/index.mjs",
    "start": "node -e \"process.env.NODE_ENV='production'; import('./server-dist/index.mjs')\"",
    "preview": "vite preview",
    "lint": "npm run typecheck",
    "test:api": "tsx --test server/api.test.ts server/inquiries.test.mjs",
    "clean": "node -e \"require('fs').rmSync('dist',{recursive:true,force:true});require('fs').rmSync('server-dist',{recursive:true,force:true})\"",
    "cms:setup": "node server/setup-admin.mjs",
    "cms:check": "node server/verify-package.mjs",
    "typecheck": "tsc --noEmit",
    "test:smoke": "node scripts/smoke-production.mjs",
    "test:unit": "tsx --test src/lib/http.test.ts",
    "test": "npm run typecheck && npm run test:api && npm run test:unit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "react-icons": "^5.7.0",
    "react-router-dom": "^7.0.0",
    "three": "^0.186.1",
    "vite": "^8.3.0",
    "nodemailer": "^10.6.0",
    "sharp": "^0.34.5",
    "sanitize-html": "^2.17.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@types/three": "^0.186.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.28.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/sanitize-html": "^2.16.0"
  },
  "engines": {
    "node": "22.x"
  }
}
``````

## `scripts/migrate-local-cms.mjs`

``````javascript
/** One-time migration from data/cms.json + data/uploads to Supabase.
 * From project root: node --env-file=.env scripts/migrate-local-cms.mjs
 * Refuses to overwrite existing CMS rows unless --force is supplied.
 */
import 'node:process';
import { readFile } from 'node:fs/promises';
import { resolve, basename } from 'node:path';
const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
const serviceKey = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
if (!url || !serviceKey || !/^https:\/\//.test(url)) {
 console.error('Missing SUPABASE_URL / SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY). Load .env with: node --env-file=.env scripts/migrate-local-cms.mjs');
 process.exit(1);
}
const sections=['hero','about','products','partners','leadership','contact','footer'];
const http = async (route, method, body, extra={}) => {
 const resp = await fetch(`${url}${route}`, {
  method, headers:{apikey:serviceKey,...(!serviceKey.startsWith('sb_secret_')?{Authorization:`Bearer ${serviceKey}`}:{}) ,Accept:'application/json',...extra},
  ...(body===undefined?{}:{body}), signal:AbortSignal.timeout(30000),
 });
 if (!resp.ok) { const msg=await resp.text(); throw Error(`Supabase ${method} ${route.split('?')[0]}: HTTP ${resp.status} (${msg.slice(0,180)})`); }
 const text=await resp.text(); return text?JSON.parse(text):undefined;
};
const original=JSON.parse(await readFile(resolve('data/cms.json'),'utf8'));
const rows=await http('/rest/v1/cms_sections?select=section&limit=1','GET');
if (rows.length && !process.argv.includes('--force')) {
 console.error('Supabase CMS already contains data. Migration stopped to prevent overwriting production edits.');
 console.error('Export/backup the database first. Only use --force if you INTENTIONALLY want to replace live content.');
 process.exit(1);
}
const memo=new Map();
async function convertImage(value){
 if(typeof value !== 'string' || !/^\/uploads\/[a-z0-9-]+\.webp$/i.test(value))return value;
 if(memo.has(value))return memo.get(value);
 const filename=basename(value);
 const buffer=await readFile(resolve('data/uploads',filename));
 // Keep the original basename in a dedicated legacy/ prefix for predictable migration.
 const key=`legacy/${filename}`;
 try {
  await http(`/storage/v1/object/cms-images/${key}`,'POST',buffer,{
   'Content-Type':'image/webp','x-upsert':'false',
  });
  console.log(`Uploaded: ${filename}`);
 } catch (err) {
  // 409 means it already exists from a previous partial run; reuse it.
  if(!String(err).includes('HTTP 409'))throw err;
  console.log(`Already exists: ${filename}`);
 }
 const publicUrl=`${url}/storage/v1/object/public/cms-images/${key}`;
 memo.set(value,publicUrl);
 return publicUrl;
}
if(original.hero)original.hero.image=await convertImage(original.hero.image);
for(const entry of original.products||[])entry.image=await convertImage(entry.image);
for(const entry of original.partners||[])entry.logo=await convertImage(entry.logo);
for(const entry of original.leadership||[])entry.photo=await convertImage(entry.photo);
const body=JSON.stringify(sections.filter(section=>section in original).map(section=>({section,value:original[section]})));
await http('/rest/v1/cms_sections?on_conflict=section','POST',body,{
 'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal',
});
console.log('Migration complete! Images:',memo.size,'Sections:',sections.filter(s=>s in original).length);
console.log('Now set CMS_STORAGE=supabase in local .env and SUPABASE_URL / SUPABASE_SECRET_KEY in Vercel.');
``````

## `server/app.ts`

``````typescript
/** Express API shared between local Node and the Vercel Node.js Function. */
import 'dotenv/config';
import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express';
import nodemailer from 'nodemailer';
import { validateInquiry } from './validation';
import { cmsRouter, cmsPublic, uploadsRouter, readContent } from './cms';
import { getSections, useSupabase, validateSupabaseConfig } from './supabase';

const app = express();
const defaultDestination = 'juarametacorp@gmail.com';
// Vercel supplies the trusted edge proxy. On other infrastructure, default to zero.
app.set('trust proxy', process.env.VERCEL === '1' ? 1 : Number(process.env.TRUST_PROXY_HOPS || 0));
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
// No wildcard CORS: frontend & CMS use the same Vercel origin.
app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
app.use('/api', express.json({ limit: '256kb', type: 'application/json' }));
app.get('/api/content', cmsPublic);
app.use('/api/admin', cmsRouter);
app.use('/uploads', uploadsRouter);

// Per-instance inquiry limiter, supplemental to spam honeypot; for high volume use a shared store.
const attempts = new Map<string, { count: number; resetAt: number }>();
function inquiryLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const ip = req.ip || 'unknown';
  const item = attempts.get(ip);
  const current = !item || item.resetAt < now ? {count: 0, resetAt: now + 15 * 60_000} : item;
  if (current.count >= 5) {
    res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
    res.status(429).json({ message: 'Too many inquiries. Please try again later.' }); return;
  }
  current.count++; attempts.set(ip, current); next();
}
const inquiryCleanup = setInterval(() => {
  for (const [ip, value] of attempts) if (value.resetAt < Date.now()) attempts.delete(ip);
}, 15 * 60_000);
inquiryCleanup.unref();

app.post('/api/inquiries', inquiryLimit, async (req: Request, res: Response) => {
  const origin = req.get('Origin');
  const expected = process.env.PUBLIC_ORIGIN?.trim().replace(/\/$/, '') || `https://${req.get('host')}`;
  if ((origin && origin !== expected) || req.get('sec-fetch-site') === 'cross-site') {
    res.status(403).json({ message: 'Origin not allowed.' }); return;
  }
  if (!req.is('application/json')) {
    res.status(415).json({ message: 'Please submit the form as JSON.' }); return;
  }
  if (req.body && typeof req.body.website === 'string' && req.body.website.trim()) {
    res.json({ message: 'Your message was sent successfully.' }); return;
  }
  const inquiry = validateInquiry(req.body);
  if (!inquiry) {
    res.status(400).json({ message: 'Please enter a valid name, email, project type, and project details (20–5000 characters).' }); return;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!smtpUser || !smtpPassword) {
    res.status(503).json({ message: 'Email service is not configured. Please contact us directly.' }); return;
  }
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: smtpUser, pass: smtpPassword },
      connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000,
      disableFileAccess: true, disableUrlAccess: true,
    });
    await transporter.sendMail({
      from: { name: 'JuaraMetaCorp Website', address: smtpUser },
      to: (await readContent()).contact.email || defaultDestination,
      replyTo: { name: inquiry.name, address: inquiry.email },
      subject: `New Project Inquiry – ${inquiry.projectType}`,
      text: [
        `Name: ${inquiry.name}`, `Email: ${inquiry.email}`,
        `Project Type: ${inquiry.projectType}`, 'Project Details:', inquiry.details,
      ].join('\n'),
    });
    res.status(200).json({ message: 'Your project inquiry has been sent successfully. We will be in touch soon.' });
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
    console.error('Inquiry delivery failed:', code);
    res.status(502).json({ message: 'We could not send your message. Please try again later or email us directly.' });
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    if (useSupabase) { validateSupabaseConfig(); await getSections(); }
    if (!process.env.CMS_ADMIN_PASSWORD_HASH) throw new Error('CMS_ADMIN_PASSWORD_HASH missing.');
    res.json({ status: 'ok', storage: useSupabase ? 'supabase' : 'local' });
  } catch (error) {
    console.error('API readiness failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({ status: 'error', message: 'CMS storage unavailable. Check server environment and Supabase schema.' });
  }
});

// API never falls through into Vite or a browser HTML error page.
app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
const apiErrorHandler: ErrorRequestHandler = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (res.headersSent) return _next(error);
  const e = error as { type?: string; status?: number; message?: string } | null;
  const isBodyError = !!e && (
    e.type === 'entity.parse.failed' || e.type === 'entity.too.large' || e.type === 'encoding.unsupported'
  );
  const status = isBodyError ? (e?.type === 'entity.too.large' ? 413 : 400) : 500;
  if (status === 500) console.error('API unhandled error:', req.method, req.path, error instanceof Error ? error.message : 'unknown');
  res.status(status).json({ message: status === 413 ? 'Request body too large.' : status === 400 ? 'Invalid JSON request body.' : 'An unexpected server error occurred.' });
};
app.use(apiErrorHandler);
export default app;
``````

## `server/cms.ts`

``````typescript
/** Persistent Supabase CMS on Vercel; optional local file CMS in development. */
import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs/promises';
import express from 'express';
import sharp from 'sharp';
import sanitizeHtml from 'sanitize-html';
import { defaultContent } from '../src/cms/defaultContent';
import type { CMSContent, SectionKey } from '../src/cms/schema';
import { useSupabase, getSections, putSection, getSession, putSession, deleteSession, uploadCmsImage, publicCmsImageUrl, getLoginFailures, recordLoginFailure, clearLoginFailures } from './supabase';

export const dataDir = path.resolve(process.env.CMS_DATA_DIR || path.join(process.cwd(), 'data'));
const imageDir = path.join(dataDir, 'uploads');
const contentFile = path.join(dataDir, 'cms.json');
// Existing /uploads paths are served locally or redirected to their migrated Supabase legacy objects.
export const uploadsRouter = Router();
if (!useSupabase) uploadsRouter.use(express.static(imageDir, { index:false, immutable:true, maxAge:'30d', dotfiles:'deny', fallthrough:true }));
if (useSupabase) uploadsRouter.get('/:filename', (req, res) => {
 const file=req.params.filename;
 if (!/^[a-f0-9-]{36}\.webp$/i.test(file)) {res.status(404).json({message:'Image not found.'});return;}
 res.redirect(302, publicCmsImageUrl(`legacy/${file}`));
});
uploadsRouter.use((_req, res) => res.status(404).json({message:'Image not found.'}));
const admin = Router();
const sessions = new Map<string,{csrf:string;expires:number}>();
const loginAttempts = new Map<string,{count:number;reset:number}>(); // local mode only
const sessionDuration = 12*60*60*1000;
const sections:SectionKey[]=['hero','about','products','partners','leadership','contact','footer'];
const validSectionValue=(key:SectionKey,v:unknown)=>['products','partners','leadership'].includes(key) ? Array.isArray(v) : !!v && typeof v==='object' && !Array.isArray(v);
const cleanText=(v:unknown,max=1500)=>typeof v==='string'?v.trim().slice(0,max):'';
const url=(v:unknown, allowInternal=false)=>{
 if(typeof v!=='string'||!v.trim())return '';
 const value=v.trim().slice(0,2000);
 if(allowInternal && /^\/(?!\/)[a-zA-Z0-9_./%?=&-]*$/.test(value) && !value.includes('..'))return value;
 try { const parsed=new URL(value); return (parsed.protocol==='https:' || parsed.protocol==='http:')?parsed.href:''; } catch { return ''; }
};
const html=(v:unknown)=>sanitizeHtml(cleanText(v,10000),{
 allowedTags:['p','br','strong','b','em','i','ul','ol','li','a','h3','h4','blockquote'],
 allowedAttributes:{a:['href','target','rel']},allowedSchemes:['https','http','mailto'],transformTags:{a:(_tag,attrs)=>({tagName:'a',attribs:{href:attrs.href||'',target:'_blank',rel:'noopener noreferrer'}})},
});
const safeId=(v:unknown)=>typeof v==='string'&&/^[a-z0-9][a-z0-9-]{0,75}$/.test(v)?v:crypto.randomUUID();
const list=(v:unknown,max=60)=>Array.isArray(v)?v.slice(0,max):[];
const normalize = (section:SectionKey, v:unknown): CMSContent[SectionKey] => {
 const o=v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
 if(section==='hero')return {
  eyebrow:cleanText(o.eyebrow,100),headline:cleanText(o.headline,100),tagline:cleanText(o.tagline,180),description:cleanText(o.description,2000),
  primaryLabel:cleanText(o.primaryLabel,80),primaryHref:url(o.primaryHref,true),secondaryLabel:cleanText(o.secondaryLabel,80),secondaryHref:url(o.secondaryHref,true),image:url(o.image,true)
 } as CMSContent['hero'];
 if(section==='about')return {description:html(o.description),vision:html(o.vision),mission:html(o.mission)} as CMSContent['about'];
 if(section==='products')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),title:cleanText(p.title,150),subtitle:cleanText(p.subtitle,200),category:cleanText(p.category,80),description:html(p.description),image:url(p.image,true),link:url(p.link),technologies:list(p.technologies,20).map(x=>cleanText(x,60)).filter(Boolean),order:i};
 }) as CMSContent['products'];
 if(section==='partners')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),name:cleanText(p.name,150),logo:url(p.logo,true),category:cleanText(p.category,80),website:url(p.website),order:i};
 }) as CMSContent['partners'];
 if(section==='leadership')return list(v).map((item,i)=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {id:safeId(p.id),name:cleanText(p.name,150),role:cleanText(p.role,120),bio:html(p.bio),photo:url(p.photo,true),group:['board','ceo','management'].includes(String(p.group))?p.group:'management',order:i};
 }) as CMSContent['leadership'];
 if(section==='contact')return {email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(o.email,254))?cleanText(o.email,254):defaultContent.contact.email,phone:cleanText(o.phone,50),address:cleanText(o.address,600),mapsUrl:url(o.mapsUrl),instagram:url(o.instagram),linkedin:url(o.linkedin),website:url(o.website)} as CMSContent['contact'];
 return {description:html(o.description),copyright:cleanText(o.copyright,240),tagline:cleanText(o.tagline,120),socialLinks:list(o.socialLinks,15).map(item=>{
  const p=item&&typeof item==='object'?item as Record<string,unknown>:{};
  return {label:cleanText(p.label,60),url:url(p.url)};
 })} as CMSContent['footer'];
};
/** On the first launch, respect JPEG/PNG and live-link edits made in earlier versions. */
async function migrateLegacyManifests(content:CMSContent){
 const folder=path.join(process.cwd(),'public','images','projects');
 try {
  const manifest=JSON.parse(await fs.readFile(path.join(folder,'project-images.json'),'utf8')) as Record<string,unknown>;
  for(const product of content.products){
   const file=manifest[product.id];
   if(typeof file!=='string' || !/^[a-z0-9][a-z0-9 _().-]*\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(file) || file.includes('..'))continue;
   try{await fs.access(path.join(folder,file));product.image=`/images/projects/${encodeURIComponent(file)}`;}catch{/* keep built-in SVG */}
  }
 }catch{/* no legacy image manifest */}
 try {
  const links=JSON.parse(await fs.readFile(path.join(folder,'project-links.json'),'utf8')) as Record<string,unknown>;
  for(const product of content.products)if(Object.prototype.hasOwnProperty.call(links,product.id))product.link=url(links[product.id]);
 }catch{/* no legacy project links */}
}
let cache:CMSContent|null=null;
export async function readContent():Promise<CMSContent> {
 if(useSupabase) {
  // No process cache: every Vercel instance reads the same permanent database.
  const rows=await getSections();
  const content=structuredClone(defaultContent);
  for(const row of rows) if(sections.includes(row.section)) (content as any)[row.section]=normalize(row.section,row.value);
  return content;
 }
 if(cache)return cache;
 await fs.mkdir(dataDir,{recursive:true});
 try {
  const parsed=JSON.parse(await fs.readFile(contentFile,'utf8')) as CMSContent;
  const data={...defaultContent};
  for(const s of sections) if(Object.prototype.hasOwnProperty.call(parsed,s)) (data as any)[s]=normalize(s,parsed[s]);
  cache=data;return data;
 } catch(err) {
  if((err as NodeJS.ErrnoException).code!=='ENOENT') console.warn('CMS content unreadable; using defaults. Preserve data/cms.json for recovery.');
  cache=structuredClone(defaultContent);
  if((err as NodeJS.ErrnoException).code==='ENOENT'){await migrateLegacyManifests(cache);await atomicWrite(cache);}
  return cache;
 }
}
async function atomicWrite(value:CMSContent){
 await fs.mkdir(dataDir,{recursive:true});
 const temp=path.join(dataDir,`.cms-${crypto.randomUUID()}.tmp`);
 try {await fs.writeFile(temp,JSON.stringify(value,null,2)+'\n',{mode:0o600});await fs.rename(temp,contentFile);}finally {await fs.rm(temp,{force:true}).catch(()=>{});}
}
let writeQueue=Promise.resolve();
function updateSection(key:SectionKey,payload:unknown){
 if(useSupabase) {
  const value=normalize(key,payload);
  // Sections live in separate rows: concurrent edits to distinct sections do not overwrite each other.
  return putSection(key,value).then(()=>value);
 }
 const operation=writeQueue.then(async()=>{
  const current=await readContent();
  const updated={...current,[key]:normalize(key,payload)} as CMSContent;
  await atomicWrite(updated);cache=updated;
  return updated[key];
 });
 writeQueue=operation.then(()=>undefined,()=>undefined);
 return operation;
}
function parseCookies(req:Request){return Object.fromEntries((req.headers.cookie||'').split(';').map(part=>{const i=part.indexOf('=');return i<0?['','']:[part.slice(0,i).trim(),part.slice(i+1).trim()]}));}
async function currentSession(req:Request){
 const raw=parseCookies(req).jmc_cms_sid;
 if(!raw || !/^[a-f0-9]{64}$/.test(raw))return null;
 if(useSupabase){
  const row=await getSession(crypto.createHash('sha256').update(raw).digest('hex'));
  return row && Date.parse(row.expires_at)>Date.now()?{csrf:row.csrf,expires:Date.parse(row.expires_at)}:null;
 }
 const session=sessions.get(raw);
 if(!session)return null;
 if(session.expires<Date.now()){sessions.delete(raw);return null}
 return session;
}
async function requireSession(req:Request,res:Response,next:NextFunction){
 try {
  const sess=await currentSession(req);
  if(!sess){res.status(401).json({message:'Please sign in.'});return;}
  res.locals.session=sess;next();
 }catch(err){next(err)}
}
function sameOrigin(req:Request,res:Response,next:NextFunction){
 const origin=req.get('origin');const expected=process.env.PUBLIC_ORIGIN?.replace(/\/$/,'')||`${process.env.VERCEL==='1'?'https':req.protocol}://${req.get('host')}`;
 if((origin && origin!==expected)||req.get('sec-fetch-site')==='cross-site'){res.status(403).json({message:'Cross-site requests are blocked.'});return;}next();
}
function csrf(req:Request,res:Response,next:NextFunction){
 const token=req.get('x-cms-csrf')||'';
 const sess=res.locals.session as {csrf:string};
 const left=Buffer.from(token);const right=Buffer.from(sess.csrf);
 if(left.length!==right.length||!crypto.timingSafeEqual(left,right)){res.status(403).json({message:'CSRF token invalid. Refresh the admin dashboard.'});return;}
 next();
}
function verifyPassword(pass:string){
 const stored=process.env.CMS_ADMIN_PASSWORD_HASH||'';
 const match=/^scrypt\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(stored);
 if(!match)return false;
 const actual=crypto.scryptSync(pass,Buffer.from(match[1],'hex'),64,{N:16384,r:8,p:1});
 const expected=Buffer.from(match[2],'hex');return crypto.timingSafeEqual(actual,expected);
}
const noStore=(_req:Request,res:Response,next:NextFunction)=>{res.setHeader('Cache-Control','no-store');next();};
function cookie(req:Request,value:string,maxAge:number){
 const secure = process.env.VERCEL==='1' || req.secure ? '; Secure' : '';
 return `jmc_cms_sid=${value}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${secure}`;
}
admin.use(noStore);
admin.get('/session',async(req,res,next)=>{try{const sess=await currentSession(req);if(!sess){res.status(401).json({authenticated:false});return;}res.json({authenticated:true,csrfToken:sess.csrf});}catch(err){next(err)}});
admin.post('/login',sameOrigin,async(req,res,next)=>{
 try {
  if(!process.env.CMS_ADMIN_PASSWORD_HASH){res.status(503).json({message:'CMS password hash missing in Vercel Environment Variables. Run npm run cms:setup.'});return;}
  const key=crypto.createHmac('sha256',process.env.CMS_ADMIN_PASSWORD_HASH||'local').update(req.ip||'unknown').digest('hex');
  const now=Date.now();
  const local=loginAttempts.get(key);
  const failures=useSupabase?await getLoginFailures(key):(local&&local.reset>now?local.count:0);
  if(failures>=8){res.setHeader('Retry-After','900');res.status(429).json({message:'Too many login attempts. Try again in 15 minutes.'});return;}
  const password=typeof req.body?.password==='string'?req.body.password:'';
  if(!password || password.length>1024 || !verifyPassword(password)){
   if(useSupabase)await recordLoginFailure(key);
   else loginAttempts.set(key,{count:failures+1,reset:now+15*60_000});
   res.status(401).json({message:'Incorrect password.'});return;
  }
  const sid=crypto.randomBytes(32).toString('hex');
  const session={csrf:crypto.randomBytes(32).toString('hex'),expires:now+sessionDuration};
  if(useSupabase){await putSession(crypto.createHash('sha256').update(sid).digest('hex'),session.csrf,new Date(session.expires).toISOString());await clearLoginFailures(key);}
  else{sessions.set(sid,session);loginAttempts.delete(key);}
  res.setHeader('Set-Cookie',cookie(req,sid,sessionDuration/1000));
  res.status(200).json({authenticated:true,csrfToken:session.csrf});
 }catch(err){next(err)}
});
admin.post('/logout',sameOrigin,requireSession,csrf,async(req,res,next)=>{
 try {
  const sid=parseCookies(req).jmc_cms_sid;
  if(useSupabase) await deleteSession(crypto.createHash('sha256').update(sid).digest('hex'));
  else sessions.delete(sid);
  res.setHeader('Set-Cookie',cookie(req,'',0));res.json({success:true});
 }catch(err){next(err)}
});
admin.put('/content/:section',sameOrigin,requireSession,csrf,async(req,res)=>{
 const section=req.params.section as SectionKey;
 if(!sections.includes(section)){res.status(404).json({message:'Unknown section.'});return;}
 if(!req.body||typeof req.body!=='object'||Array.isArray(req.body)||!validSectionValue(section,req.body.value)){res.status(400).json({message:'Invalid content section or value.'});return;}
 try {const result=await updateSection(section,req.body.value);res.json({saved:true,value:result});}catch(err){console.error('CMS save failed:',(err as Error).message);res.status(503).json({message:'Unable to save CMS data. Check Supabase configuration/table and function logs.'});}
});
admin.post('/upload',sameOrigin,requireSession,csrf,express.raw({type:['image/png','image/jpeg','image/webp','image/avif'],limit:'4mb'}),async(req,res)=>{
 const body=req.body;
 if(!Buffer.isBuffer(body)||!body.length){res.status(400).json({message:'Choose a JPG, PNG, WebP, or AVIF image below 4 MB (browser auto-compresses larger images).'});return;}
 try {
  const processed=await sharp(body,{limitInputPixels:30_000_000,failOn:'error'}).rotate().resize({width:1920,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:82,effort:4}).toBuffer();
  const id=crypto.randomUUID();
  if(useSupabase){
   try {
    const imageUrl=await uploadCmsImage(`${id}.webp`,processed);
    res.status(201).json({url:imageUrl,bytes:processed.length});
   }catch(err){console.error('CMS image storage failed:',(err as Error).message);res.status(503).json({message:'Unable to save image in Supabase Storage.'});}
  }else{
   await fs.mkdir(imageDir,{recursive:true});await fs.writeFile(path.join(imageDir,`${id}.webp`),processed,{flag:'wx',mode:0o644});
   res.status(201).json({url:`/uploads/${id}.webp`,bytes:processed.length});
  }
 }catch{res.status(415).json({message:'Image could not be processed. Upload a valid image file.'});}
});
export const cmsRouter=admin;
export async function cmsPublic(_req:Request,res:Response){
 try {res.json(await readContent());}
 catch(err){console.error('CMS content read failed:',err instanceof Error?err.message:'unknown');res.status(503).json({message:'CMS content unavailable. Check Supabase environment and schema.'});}
}
setInterval(()=>{const now=Date.now();for(const [key,v] of sessions)if(v.expires<=now)sessions.delete(key);for(const [key,v] of loginAttempts)if(v.reset<=now)loginAttempts.delete(key);},15*60*1000).unref();
``````

## `server/supabase.ts`

``````typescript
/** Server-only Supabase REST and Storage transport. NEVER import from src/. */
import type { SectionKey } from '../src/cms/schema';

export const useSupabase = process.env.VERCEL === '1' || process.env.CMS_STORAGE === 'supabase';
export const BUCKET = 'cms-images';
type CmsRow = { section: SectionKey; value: unknown };
type CmsSessionRow = { id: string; csrf: string; expires_at: string };
type LoginRow = { failures: number; updated_at: string };

function settings() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  // Prefer Supabase's current sb_secret_* API keys; legacy JWTs still work.
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !/^https:\/\/[\w.-]+(?::\d+)?$/.test(url) || !key || key.startsWith('sb_publishable_')) {
    throw new Error('Supabase storage is not configured: set SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) on the server.');
  }
  return { url, key };
}
export function validateSupabaseConfig() { settings(); }

async function request<T>(route: string, method: string, body?: string | Uint8Array, extraHeaders: Record<string, string> = {}): Promise<T> {
  const { url, key } = settings();
  const response = await fetch(`${url}${route}`, {
    method,
    headers: {
      apikey: key,
      // sb_secret_* keys are NOT JWTs; sending them as Authorization Bearer causes Invalid JWT.
      ...(!key.startsWith('sb_secret_') ? { Authorization: `Bearer ${key}` } : {}),
      Accept: 'application/json',
      ...(typeof body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    ...(body === undefined ? {} : { body: body as BodyInit }),
    signal: AbortSignal.timeout(15_000),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Supabase ${method} ${route.split('?')[0]} failed (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.text();
  return (payload ? JSON.parse(payload) : undefined) as T;
}

export async function getSections(): Promise<CmsRow[]> {
  return request<CmsRow[]>('/rest/v1/cms_sections?select=section,value', 'GET');
}
export async function putSection(section: SectionKey, value: unknown): Promise<void> {
  await request('/rest/v1/cms_sections?on_conflict=section', 'POST', JSON.stringify([{ section, value }]), {
    Prefer: 'resolution=merge-duplicates,return=minimal',
  });
}
export async function getSession(id: string): Promise<CmsSessionRow | null> {
  const rows = await request<CmsSessionRow[]>(
    `/rest/v1/cms_sessions?select=id,csrf,expires_at&id=eq.${encodeURIComponent(id)}&limit=1`, 'GET');
  return rows[0] ?? null;
}
export async function putSession(id: string, csrf: string, expires_at: string): Promise<void> {
  // Cleanup stale sessions/limits opportunistically on each admin login; no cron dependency.
  await request(`/rest/v1/cms_sessions?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, 'DELETE');
  await request(`/rest/v1/cms_login_attempts?updated_at=lt.${encodeURIComponent(new Date(Date.now()-24*60*60_000).toISOString())}`, 'DELETE');
  await request('/rest/v1/cms_sessions', 'POST', JSON.stringify([{ id, csrf, expires_at }]), {
    Prefer: 'return=minimal',
  });
}
export async function deleteSession(id: string): Promise<void> {
  await request(`/rest/v1/cms_sessions?id=eq.${encodeURIComponent(id)}`, 'DELETE');
}
// Shared rate-limiting between Vercel instances. RPC uses an atomic INSERT .. ON CONFLICT.
export async function getLoginFailures(key: string): Promise<number> {
  const rows = await request<LoginRow[]>(
    `/rest/v1/cms_login_attempts?select=failures,updated_at&key=eq.${encodeURIComponent(key)}&limit=1`, 'GET');
  const row = rows[0];
  return row && Date.parse(row.updated_at) > Date.now() - 15 * 60_000 ? row.failures : 0;
}
export async function recordLoginFailure(key: string): Promise<void> {
  await request('/rest/v1/rpc/cms_record_login_failure', 'POST', JSON.stringify({ p_key: key }));
}
export async function clearLoginFailures(key: string): Promise<void> {
  await request(`/rest/v1/cms_login_attempts?key=eq.${encodeURIComponent(key)}`, 'DELETE');
}
export async function uploadCmsImage(filename: string, body: Buffer): Promise<string> {
  const key = `uploads/${filename}`;
  await request(`/storage/v1/object/${BUCKET}/${key}`, 'POST', new Uint8Array(body), {
    'Content-Type': 'image/webp',
    'Cache-Control': 'max-age=31536000',
    'x-upsert': 'false',
  });
  return publicCmsImageUrl(key);
}
export function publicCmsImageUrl(objectKey: string): string {
  const { url } = settings();
  return `${url}/storage/v1/object/public/${BUCKET}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}
``````

## `src/cms/ContentContext.tsx`

``````tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultContent } from './defaultContent';
import type { CMSContent } from './schema';
import { requestJson } from '../lib/http';
const ContentContext = createContext<CMSContent>(defaultContent);
export const useContent = () => useContext(ContentContext);
export function ContentProvider({children}:{children:ReactNode}) {
  const [content,setContent] = useState<CMSContent>(defaultContent);
  useEffect(()=>{
    let alive = true;
    const refresh=()=>requestJson<CMSContent>('/api/content').then(data=>{if(alive)setContent(data)}).catch(()=>{/* Leave last known/default content visible if API is temporarily down. */});
    refresh();
    const t=window.setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    return ()=>{alive=false;window.clearInterval(t);window.removeEventListener('focus',refresh)};
  },[]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
``````

## `src/components/MotionExperience.tsx`

``````tsx
import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Progressive motion enhancement for non-hero sections.
 * Uses one IntersectionObserver, one pointer listener, and CSS transforms/opacity.
 * Nothing stays invisible if JS, IntersectionObserver, or animations are disabled.
 * The container is keyed by route in App, so every new page gets fresh reveals.
 */
export default function MotionExperience({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) return;

    const completionTimers = new Set<ReturnType<typeof setTimeout>>();
    const animationFrames = new Set<number>();
    const intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        intersection.unobserve(element);
        const id = requestAnimationFrame(() => { animationFrames.delete(id); element.classList.add('jmc-motion-in'); });
        animationFrames.add(id);
        const delay = Number(element.dataset.jmcRevealDelay || '0');
        const timer = setTimeout(() => {
          element.classList.remove('jmc-motion-pending', 'jmc-motion-in');
          element.style.removeProperty('--jmc-motion-delay');
          completionTimers.delete(timer);
        }, delay + 900);
        completionTimers.add(timer);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    const selectors = [
      '.jmc-section .jmc-eyebrow',
      '.jmc-section .jmc-title',
      '.jmc-section .jmc-description',
      '.jmc-section .jmc-section-link',
      '.jmc-section .jmc-card',
      '.jmc-section .jmc-partner-trust-label',
      '.jmc-section .jmc-partner-marquee',
    ].join(',');

    function enhance() {
      if (!container) return;
      container.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        if (el.dataset.jmcMotionRegistered) return;
        el.dataset.jmcMotionRegistered = 'true';
        // Do not animate copy nested inside a card independently, and do not
        // double-animate leadership profiles (their React Motion handles them).
        if (el.closest('.jmc-card') && !el.classList.contains('jmc-card')) return;
        if (el.classList.contains('jmc-card') && el.closest('#leadership')) return;

        let delay = 0;
        if (el.classList.contains('jmc-card')) {
          const siblings = [...(el.parentElement?.children || [])].filter((node) => (node as Element).classList?.contains('jmc-card'));
          delay = Math.min(siblings.indexOf(el), 4) * 85;
          el.classList.add('jmc-spotlight');
        }
        el.dataset.jmcRevealDelay = String(delay);
        el.style.setProperty('--jmc-motion-delay', `${delay}ms`);
        el.classList.add('jmc-motion-pending');
        intersection.observe(el);
      });
    }

    // The app is lazy-loaded, so observe newly rendered content as well.
    enhance();
    const changes = new MutationObserver(enhance);
    changes.observe(container, { childList: true, subtree: true });

    // Update the hover spotlight and restrained 3D tilt using CSS variables;
    // no React rerender occurs during pointer movement.
    function onMove(e: PointerEvent) {
      if (e.pointerType !== 'mouse') return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('.jmc-card.jmc-hover');
      if (!card || !container?.contains(card)) return;
      const rect = card.getBoundingClientRect();
      const fx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const fy = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      card.style.setProperty('--jmc-pointer-x', `${Math.round(fx * 100)}%`);
      card.style.setProperty('--jmc-pointer-y', `${Math.round(fy * 100)}%`);
      // The spotlight follows the pointer, but avoid moving entire cards
      // on small touch screens or inside the contact form.
      if (card.closest('#projects')) {
        card.classList.add('jmc-tilt');
        card.style.setProperty('--jmc-tilt-x', `${((0.5 - fy) * 2.4).toFixed(2)}deg`);
        card.style.setProperty('--jmc-tilt-y', `${((fx - 0.5) * 2.4).toFixed(2)}deg`);
      }
    }
    function onOut(e: PointerEvent) {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('.jmc-card.jmc-hover');
      if (!card || !container?.contains(card)) return;
      if (e.relatedTarget instanceof Node && card.contains(e.relatedTarget)) return;
      card.style.removeProperty('--jmc-tilt-x');
      card.style.removeProperty('--jmc-tilt-y');
    }
    container.addEventListener('pointermove', onMove, { passive: true });
    container.addEventListener('pointerout', onOut);
    return () => {
      changes.disconnect();
      intersection.disconnect();
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerout', onOut);
      for (const timer of completionTimers) clearTimeout(timer);
      for (const frame of animationFrames) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={containerRef} className="jmc-motion-experience">{children}</div>;
}
``````

## `src/components/PartnerMarquee.tsx`

``````tsx
import { useEffect, useRef, type PointerEvent, type MouseEvent } from 'react';
import { ArrowUpRight, BriefcaseBusiness, GraduationCap, Landmark, School } from 'lucide-react';
import { useContent } from '../cms/ContentContext';
import type { Partner } from '../cms/schema';

const LOOP_DURATION_SECONDS = 36;

function PartnerBadge({ partner, duplicate }: { partner: Partner; duplicate: boolean }) {
  const Icon = /school/i.test(partner.name)?School:/university|universitas|stkip/i.test(partner.name)?GraduationCap:/government/i.test(partner.category)?Landmark:BriefcaseBusiness;
  return <a
    className="jmc-partner-badge"
    href={partner.website}
    target="_blank"
    rel="noopener noreferrer"
    tabIndex={duplicate ? -1 : 0}
    aria-hidden={duplicate ? true : undefined}
    draggable={false}
    title={`Visit ${partner.name}`}
  >
    <span className="jmc-partner-gold-icon"><Icon size={17} aria-hidden="true" /></span>
    <span className="jmc-partner-logo-box">
      <span className="jmc-partner-logo-initials" aria-hidden="true">{partner.name.substring(0,5)}</span>
      <img loading="lazy" src={partner.logo} alt="" draggable={false} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.display = 'none'; }} />
    </span>
    <span className="jmc-partner-name">{partner.name}</span>
    <ArrowUpRight size={15} aria-hidden="true" className="jmc-partner-arrow" />
  </a>;
}

interface DragSession { startX: number; startTranslate: number; currentTranslate: number; groupWidth: number; pointerId: number; moved: boolean }
const normalize = (x: number, width: number) => width > 0 ? ((x % width) + width) % width - width : x;
function xTranslation(transform: string) {
  if (!transform || transform === 'none') return 0;
  const coords = transform.match(/matrix(?:3d)?\(([^)]+)\)/)?.[1]?.split(',').map(Number);
  if (!coords) return 0;
  return transform.startsWith('matrix3d') ? coords[12] ?? 0 : coords[4] ?? 0;
}

/**
 * Two identical equal-width groups create a gapless CSS -50% loop.
 * Drag pauses CSS animation, moves via transform only, and resumes from its
 * new phase using a negative animation-delay (no React renders per frame).
 */
export default function PartnerMarquee() {
  const { partners } = useContent();
  const sorted = [...partners].sort((a,b)=>a.order-b.order);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const groupRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragSession | null>(null);
  const suppressClickRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  function pointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const track = trackRef.current;
    const width = groupRef.current?.getBoundingClientRect().width || 0;
    if (!track || !width) return;
    suppressClickRef.current = false;
    const translate = normalize(xTranslation(getComputedStyle(track).transform), width);
    track.style.animation = 'none';
    track.style.transform = `translate3d(${translate}px, 0, 0)`;
    dragRef.current = { startX: e.clientX, startTranslate: translate, currentTranslate: translate, groupWidth: width, pointerId: e.pointerId, moved: false };
    // Capture only after a real drag, so normal clicks still open partner sites.
  }
  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !track) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 5 && !drag.moved) {
      drag.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.classList.add('is-dragging');
    }
    const next = normalize(drag.startTranslate + dx, drag.groupWidth);
    drag.currentTranslate = next;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      track.style.transform = `translate3d(${next}px, 0, 0)`;
      rafRef.current = null;
    });
  }
  function pointerUp(e: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const track = trackRef.current;
    if (!drag || drag.pointerId !== e.pointerId || !track) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    e.currentTarget.classList.remove('is-dragging');
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    // Negative delay aligns the CSS timeline with the end of the drag.
    track.style.animationDelay = `${(drag.currentTranslate / drag.groupWidth) * LOOP_DURATION_SECONDS}s`;
    track.style.transform = '';
    track.style.animation = '';
  }
  function blockClickAfterDrag(e: MouseEvent<HTMLDivElement>) {
    if (suppressClickRef.current) { e.preventDefault(); e.stopPropagation(); suppressClickRef.current = false; }
  }

  return <div className="jmc-partner-marquee" aria-label="JuaraMetaCorp trusted partner logos">
    <div className="jmc-partner-marquee-fade jmc-partner-marquee-fade-left" aria-hidden="true" />
    <div className="jmc-partner-marquee-fade jmc-partner-marquee-fade-right" aria-hidden="true" />
    <div className="jmc-partner-marquee-viewport" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onClickCapture={blockClickAfterDrag}>
      <div ref={trackRef} className="jmc-partner-marquee-track">
        <div ref={groupRef} className="jmc-partner-marquee-group">
          {sorted.map(partner => <PartnerBadge partner={partner} key={partner.id} duplicate={false} />)}
        </div>
        <div className="jmc-partner-marquee-group" aria-hidden="true">
          {sorted.map(partner => <PartnerBadge partner={partner} key={`${partner.id}-duplicate`} duplicate />)}
        </div>
      </div>
    </div>
  </div>;
}
``````

## `src/pages/AdminPage.tsx`

``````tsx
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronDown, ExternalLink, GripVertical, ImagePlus, LoaderCircle, Lock, LogOut, Plus, Save, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultContent } from '../cms/defaultContent';
import type { CMSContent, SectionKey } from '../cms/schema';
import { ApiError, requestJson } from '../lib/http';
import '../cms/admin.css';
const tabs: {key:SectionKey;label:string;icon:string}[]=[
 {key:'hero',label:'Hero Section',icon:'✦'}, {key:'about',label:'About & Mission',icon:'◎'},
 {key:'products',label:'Products',icon:'◈'},{key:'partners',label:'Partners',icon:'◉'},
 {key:'leadership',label:'Leadership',icon:'♟'},{key:'contact',label:'Contact',icon:'✉'},
 {key:'footer',label:'Footer',icon:'▤'}
];
const api=<T,>(path:string,init?:RequestInit)=>requestJson<T>(`/api/admin${path}`,init);
const uniqueId=()=>`cms-${crypto.randomUUID()}`;
function Field({label,value,onChange,placeholder='',multiline=false,type='text'}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;multiline?:boolean;type?:string}){
 return <label className="cms-field"><span>{label}</span>{multiline?<textarea rows={4} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>:<input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</label>;
}
function RichEditor({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current && !ref.current.contains(document.activeElement) && ref.current.innerHTML!==(value||''))ref.current.innerHTML=value||'';},[value]);
 const action=(command:string)=>{document.execCommand(command,false);onChange(ref.current?.innerHTML||'');ref.current?.focus()};
 return <div className="cms-field cms-rich"><span>{label}</span><div className="cms-editor-toolbar"><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('bold')} title="Bold"><b>B</b></button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('italic')} title="Italic"><i>I</i></button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('insertUnorderedList')} title="Bulleted list">• List</button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('insertOrderedList')} title="Numbered list">1. List</button></div>
   <div className="cms-editable" contentEditable suppressContentEditableWarning role="textbox" aria-label={label} aria-multiline="true" ref={ref} onInput={e=>onChange(e.currentTarget.innerHTML)} onBlur={e=>onChange(e.currentTarget.innerHTML)} onPaste={e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))}}/>
   <small>Basic formatting supported. Unsafe HTML is removed by the server when saved.</small>
 </div>;
}
// Standard Vercel Functions accept 4.5MB requests by default.
// Compress oversized camera photos in the browser BEFORE sending to /api/admin/upload.
async function prepareImageForVercel(file: File): Promise<Blob> {
 const limit = 3.6 * 1024 * 1024; // leave room below Vercel's 4.5 MB request cap
 if (file.size <= limit) return file;
 const bitmap = await createImageBitmap(file);
 try {
  const scale = Math.min(1, 1920 / bitmap.width, 1200 / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw Error('Cannot process image on this browser');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.86, 0.76, 0.62, 0.48]) {
   const output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
   if (output && output.type === 'image/webp' && output.size <= limit) return output;
  }
  throw Error('Image is still too large. Please resize it and try again.');
 } finally { bitmap.close(); }
}
function Upload({label,value,onChange,csrf}:{label:string;value:string;onChange:(v:string)=>void;csrf:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file:File){if(!file)return;if(file.size>8*1024*1024){setError('Maximum image size: 8 MB');return;}setBusy(true);setError('');try{
 const prepared=await prepareImageForVercel(file);
 const result=await api<{url:string;bytes:number}>('/upload',{method:'POST',headers:{'Content-Type':prepared.type,'X-CMS-CSRF':csrf},body:prepared});
 onChange(result.url);
 }catch(err){setError(err instanceof Error?err.message:'Upload failed');}finally{setBusy(false)}}
 return <div className="cms-field cms-upload"><span>{label}</span><div className="cms-upload-layout"><div className="cms-upload-preview">{value?<img src={value} alt="Uploaded image preview" onError={e=>{e.currentTarget.style.opacity='.1'}}/>:<ImagePlus size={27}/>}</div><div className="cms-upload-actions"><label className="cms-btn cms-btn-subtle cms-file-label">{busy?<LoaderCircle size={16} className="cms-spin"/>:<ImagePlus size={16}/>} {busy?'Optimizing…':'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label><small>JPG, PNG, WebP, AVIF • Up to 8 MB • Auto-optimized before upload</small></div></div>
 <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or enter an existing image URL /images/..." aria-label={`${label} URL`}/>{error&&<small role="alert" className="cms-error">{error}</small>}</div>;
}
function CollectionEditor<T extends {id:string;order:number}>({items,onChange,create,render,section}:{items:T[];onChange:(v:T[])=>void;create:()=>T;render:(item:T,update:(v:T)=>void)=>ReactNode;section:string}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState(''),[dragging,setDragging]=useState(-1);
 const categories=useMemo(()=>[...new Set(items.map(item=>String('category' in item?item.category:'group' in item?item.group:'')).filter(Boolean))],[items]);
 const visible=useMemo(()=>items.map((item,index)=>({item,index})).filter(({item})=>JSON.stringify(item).toLowerCase().includes(query.toLowerCase()) && (!filter || String('category' in item?item.category:'group' in item?item.group:'')===filter)),[items,query,filter]);
 function reorder(from:number,to:number){if(from===to||from<0||to<0)return;const updated=[...items];const [moved]=updated.splice(from,1);updated.splice(to,0,moved);onChange(updated.map((x,i)=>({...x,order:i})));}
 function remove(id:string){if(!window.confirm(`Delete this ${section} item? This action will be saved automatically.`))return;onChange(items.filter(x=>x.id!==id).map((x,i)=>({...x,order:i})));}
 return <><div className="cms-list-head"><label className="cms-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${section}…`}/></label>{categories.length>0&&<select aria-label={`Filter ${section} by category`} className="cms-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All categories</option>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select>}<button type="button" className="cms-btn cms-btn-primary" onClick={()=>{onChange([...items,{...create(),order:items.length}]);setQuery('');setFilter('')}}><Plus size={17}/> Add {section}</button></div>
 <div className="cms-collection">{visible.map(({item,index})=><div key={item.id} className="cms-record" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();reorder(dragging,index);setDragging(-1)}}><div className="cms-record-top"><span className="cms-drag" draggable onDragStart={e=>{setDragging(index);e.dataTransfer.effectAllowed='move'}} onDragEnd={()=>setDragging(-1)} title="Drag to reorder"><GripVertical size={19}/></span><span className="cms-record-title">{('title' in item?String(item.title):'name' in item?String(item.name):'Item')||'New item'} <small>#{index+1}</small></span><button className="cms-delete" type="button" onClick={()=>remove(item.id)} aria-label="Delete item"><Trash2 size={17}/></button></div>
 <div className="cms-record-fields">{render(item,v=>onChange(items.map(x=>x.id===item.id?v:x)))}</div></div>)}{!visible.length&&<p className="cms-empty">No matching entries.</p>}</div>
 </>;
}
function Editor({section,content,setSection,csrf}:{section:SectionKey;content:CMSContent;setSection:(v:CMSContent[SectionKey])=>void;csrf:string}){
 const updateObj=(key:string,val:unknown)=>setSection({...content[section], [key]:val} as CMSContent[SectionKey]);
 if(section==='hero'){const v=content.hero;return <div className="cms-fields"><Field label="Eyebrow" value={v.eyebrow} onChange={x=>updateObj('eyebrow',x)}/><Field label="Main headline" value={v.headline} onChange={x=>updateObj('headline',x)}/><Field label="Gradient tagline" value={v.tagline} onChange={x=>updateObj('tagline',x)}/><Field label="Description" value={v.description} multiline onChange={x=>updateObj('description',x)}/><div className="cms-two"><Field label="Primary button label" value={v.primaryLabel} onChange={x=>updateObj('primaryLabel',x)}/><Field label="Primary URL" value={v.primaryHref} onChange={x=>updateObj('primaryHref',x)}/><Field label="Secondary button label" value={v.secondaryLabel} onChange={x=>updateObj('secondaryLabel',x)}/><Field label="Secondary URL" value={v.secondaryHref} onChange={x=>updateObj('secondaryHref',x)}/></div><Upload csrf={csrf} label="Hero image (leave empty to keep 3D animation)" value={v.image} onChange={x=>updateObj('image',x)}/></div>}
 if(section==='about'){const v=content.about;return <div className="cms-fields"><RichEditor label="Company description" value={v.description} onChange={x=>updateObj('description',x)}/><RichEditor label="Our Vision" value={v.vision} onChange={x=>updateObj('vision',x)}/><RichEditor label="Our Mission" value={v.mission} onChange={x=>updateObj('mission',x)}/></div>}
 if(section==='products')return <CollectionEditor section="product" items={content.products} onChange={setSection as (v:typeof content.products)=>void} create={()=>({id:uniqueId(),title:'New Product',subtitle:'',category:'PROJECT',description:'',technologies:[],image:'',link:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Product title" value={v.title} onChange={x=>update({...v,title:x})}/><Field label="Category" value={v.category} onChange={x=>update({...v,category:x})}/></div><Field label="Subtitle" value={v.subtitle} onChange={x=>update({...v,subtitle:x})}/><RichEditor label="Description" value={v.description} onChange={x=>update({...v,description:x})}/><Field label="Technologies (comma separated)" value={v.technologies.join(', ')} onChange={x=>update({...v,technologies:x.split(',').map(s=>s.trim()).filter(Boolean)})}/><Field label="External project link (https://)" value={v.link} onChange={x=>update({...v,link:x})}/><Upload label="Product thumbnail" csrf={csrf} value={v.image} onChange={x=>update({...v,image:x})}/></>}/>;
 if(section==='partners')return <CollectionEditor section="partner" items={content.partners} onChange={setSection as (v:typeof content.partners)=>void} create={()=>({id:uniqueId(),name:'New Partner',category:'Education',logo:'',website:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Partner name" value={v.name} onChange={x=>update({...v,name:x})}/><Field label="Category" value={v.category} onChange={x=>update({...v,category:x})}/></div><Field label="Partner website" value={v.website} onChange={x=>update({...v,website:x})}/><Upload label="Partner logo" csrf={csrf} value={v.logo} onChange={x=>update({...v,logo:x})}/></>}/>;
 if(section==='leadership')return <CollectionEditor section="team member" items={content.leadership} onChange={setSection as (v:typeof content.leadership)=>void} create={()=>({id:uniqueId(),name:'New Member',role:'',bio:'',group:'management' as const,photo:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Full name" value={v.name} onChange={x=>update({...v,name:x})}/><Field label="Position" value={v.role} onChange={x=>update({...v,role:x})}/></div><label className="cms-field"><span>Organization group</span><select value={v.group} onChange={e=>update({...v,group:e.target.value as typeof v.group})}><option value="board">Board of Directors</option><option value="ceo">CEO</option><option value="management">Management Team</option></select></label><RichEditor label="Biography" value={v.bio} onChange={x=>update({...v,bio:x})}/><Upload label="Profile photo" value={v.photo} csrf={csrf} onChange={x=>update({...v,photo:x})}/></>}/>;
 if(section==='contact'){const v=content.contact;return <div className="cms-fields">{([['email','Company email'],['phone','Phone number'],['address','Address'],['mapsUrl','Google Maps link'],['instagram','Instagram URL'],['linkedin','LinkedIn URL'],['website','Website URL']] as const).map(([k,label])=><Field key={k} label={label} value={v[k]} onChange={x=>updateObj(k,x)}/>)}</div>}
 const v=content.footer;return <div className="cms-fields"><RichEditor label="Footer description" value={v.description} onChange={x=>updateObj('description',x)}/><Field label="Copyright text (year is prepended automatically)" value={v.copyright} onChange={x=>updateObj('copyright',x)}/><Field label="Tagline" value={v.tagline} onChange={x=>updateObj('tagline',x)}/><h3>Additional social links</h3>{v.socialLinks.map((link,i)=><div className="cms-inline" key={i}><Field label="Label" value={link.label} onChange={x=>updateObj('socialLinks',v.socialLinks.map((y,j)=>j===i?{...y,label:x}:y))}/><Field label="URL" value={link.url} onChange={x=>updateObj('socialLinks',v.socialLinks.map((y,j)=>j===i?{...y,url:x}:y))}/><button type="button" onClick={()=>{if(window.confirm('Remove social link?'))updateObj('socialLinks',v.socialLinks.filter((_,j)=>j!==i))}} title="Remove"><Trash2 size={17}/></button></div>)}<button className="cms-btn cms-btn-subtle" onClick={()=>updateObj('socialLinks',[...v.socialLinks,{label:'',url:''}])} type="button"><Plus size={16}/> Add social link</button></div>;
}
export default function AdminPage(){
 const [password,setPassword]=useState(''),[csrf,setCsrf]=useState(''),[initializing,setInitializing]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [section,setSection]=useState<SectionKey>('hero'),[content,setContent]=useState<CMSContent>(defaultContent),[saved,setSaved]=useState<CMSContent>(defaultContent),[status,setStatus]=useState('All changes saved');
 const [mobileNav,setMobileNav]=useState(false);
 async function load(){
  try {const c=await requestJson<CMSContent>('/api/content');setContent(c);setSaved(c);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Content unavailable');}
 }
 useEffect(()=>{
  let active=true;
  api<{authenticated:boolean;csrfToken:string}>('/session').then(async data=>{
   if(active && data.authenticated){setCsrf(data.csrfToken);await load();}
  }).catch(e=>{
   if(active && !(e instanceof ApiError && e.status===401)) setError(e instanceof Error?e.message:'Unable to reach CMS API.');
  }).finally(()=>{if(active)setInitializing(false)});
  return ()=>{active=false};
 },[]);
 async function signIn(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try {
   const data=await api<{authenticated:boolean;csrfToken:string}>('/login',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})
   });
   setCsrf(data.csrfToken);setPassword('');await load();
  }catch(e){setError(e instanceof Error?e.message:'Login failed')}
  finally{setBusy(false)}
 }
 async function logout(){
  try {await api<{success:boolean}>('/logout',{method:'POST',headers:{'X-CMS-CSRF':csrf}});setCsrf('');setContent(defaultContent);}
  catch(e){setError(e instanceof Error?e.message:'Logout failed')}
 }
 const pending=useMemo(()=>tabs.filter(({key})=>JSON.stringify(content[key])!==JSON.stringify(saved[key])).map(t=>t.key),[content,saved]);
 const saving=useRef(new Set<SectionKey>());
 const latest=useRef(content);
 latest.current=content;
 async function saveOne(key:SectionKey,value:CMSContent[SectionKey]){
  if(saving.current.has(key))return;
  saving.current.add(key);setStatus('Saving changes…');
  let success=false;
  try {
   const result=await api<{saved:boolean;value:CMSContent[SectionKey]}>(`/content/${key}`,{
    method:'PUT',headers:{'Content-Type':'application/json','X-CMS-CSRF':csrf},body:JSON.stringify({value})
   });
   setSaved(old=>({...old,[key]:result.value}));
   // Keep the canonical server value in sync when the user has not typed again.
   setContent(old=>JSON.stringify(old[key])===JSON.stringify(value)?{...old,[key]:result.value}:old);
   setStatus('Saved successfully');setError('');success=true;
  }catch(e){setError(e instanceof Error?e.message:'Save failed');setStatus('Save failed')}
  finally{
   saving.current.delete(key);
   // A user may have typed while the previous save was in flight: persist the latest snapshot.
   if(success && JSON.stringify(latest.current[key])!==JSON.stringify(value)) {
    window.setTimeout(()=>void saveOne(key,latest.current[key]),300);
   }
  }
 }
 useEffect(()=>{
  if(!csrf||!pending.length)return;
  const timeout=window.setTimeout(()=>{
   for(const key of pending) if(!saving.current.has(key)) void saveOne(key,content[key]);
  },1200);
  return ()=>window.clearTimeout(timeout);
 },[content,saved,csrf,pending.join(',')]);
 async function saveAll(){for(const key of pending)await saveOne(key,content[key]);}
 function changeSection(value:CMSContent[SectionKey]){setContent(old=>({...old,[section]:value}));setStatus('Unsaved changes…')}
 if(initializing)return <div className="cms-app cms-center"><LoaderCircle className="cms-spin"/> Checking administrator session…</div>;
 if(!csrf)return <div className="cms-app cms-login-shell"><div className="cms-login"><span className="cms-logo">JM</span><p className="cms-overline">JUARAMETACORP / ADMIN</p><h1>Welcome back.</h1><p>Sign in to manage your website content securely.</p><form onSubmit={signIn}><label className="cms-field"><span>Administrator password</span><input autoFocus type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"/></label>{error&&<p className="cms-error" role="alert">{error}</p>}<button className="cms-btn cms-btn-primary cms-login-button" disabled={busy}>{busy?<LoaderCircle className="cms-spin" size={18}/>:<Lock size={18}/>} Sign in</button></form><Link to="/" className="cms-back"><ArrowLeft size={16}/> Back to website</Link></div></div>;
 return <div className="cms-app cms-layout"><aside className={`cms-sidebar ${mobileNav?'cms-sidebar-open':''}`}><div className="cms-logo-line"><span className="cms-logo">JM</span><div><b>JuaraMetaCorp</b><small>Content Studio</small></div></div><div className="cms-side-label">CONTENT MANAGEMENT</div><nav className="cms-nav">{tabs.map(tab=><button type="button" key={tab.key} onClick={()=>{setSection(tab.key);setMobileNav(false)}} className={section===tab.key?'selected':''}><span>{tab.icon}</span> {tab.label}{pending.includes(tab.key)&&<span className="cms-dot"/>}</button>)}</nav><div className="cms-side-bottom"><Link to="/" target="_blank"><ExternalLink size={16}/> View live website</Link><button type="button" onClick={logout}><LogOut size={16}/> Sign out</button></div></aside>
  <div className="cms-main"><header className="cms-header"><button type="button" className="cms-mobile-trigger" onClick={()=>setMobileNav(!mobileNav)}>Sections <ChevronDown size={16}/></button><div><div className="cms-overline">CONTENT DASHBOARD</div><h1>{tabs.find(t=>t.key===section)?.label}</h1></div><div className="cms-header-actions"><span className="cms-save-label"><Check size={15}/>{status}</span><button disabled={!pending.length} type="button" onClick={()=>void saveAll()} className="cms-btn cms-btn-primary"><Save size={16}/> Save now</button></div></header>
   <main className="cms-content"><div className="cms-intro"><div><h2>Edit {tabs.find(t=>t.key===section)?.label}</h2><p>Changes save automatically after you stop typing. Drag the handle to reorder collections.</p></div><span className="cms-live"><span/> LIVE CONTENT</span></div>{error&&<div className="cms-alert" role="alert">{error}</div>}<div className="cms-panel" key={section}><Editor section={section} content={content} setSection={changeSection} csrf={csrf}/></div><p className="cms-bottom-note"><ShieldCheck size={16}/> On Vercel, content and images are stored permanently in Supabase. Keep regular Supabase backups.</p></main>
  </div>
 </div>;
}
``````

## `src/pages/ContactPage.tsx`

``````tsx
import { requestJson } from '../lib/http';
import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, LoaderCircle, Mail, MessageSquareText, AlertCircle } from 'lucide-react';
import PageHero from '../components/PageHero';
import BrandLogo from '../components/BrandLogo';
import { useContent } from '../cms/ContentContext';

const projectTypes = ['Virtual Tour / 360', 'Metaverse / Virtual World', 'XR & Interactive Learning', 'Website / Application', 'Other Creative Technology'];
type Notice = { kind: 'success' | 'error'; text: string } | null;

export default function ContactPage() {
  const reduced = useReducedMotion();
  const { contact } = useContent();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const [details, setDetails] = useState('');
  const [website, setWebsite] = useState(''); // spam honeypot
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    setNotice(null);
    if (!form.reportValidity() || name.trim().length < 2 || details.trim().length < 20) {
      setNotice({ kind: 'error', text: 'Please enter your name and at least 20 characters describing your project.' });
      return;
    }
    setSending(true);
    try {
      const result = await requestJson<{message?:string}>('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), projectType, details: details.trim(), website }),
      });
      setNotice({ kind: 'success', text: result.message || 'Your project inquiry has been sent successfully.' });
      setName(''); setEmail(''); setProjectType(projectTypes[0]); setDetails(''); setWebsite('');
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error && error.name === 'AbortError'
        ? 'The request timed out. Please try again.'
        : error instanceof Error ? error.message : 'Unable to send your message. Please try again.' });
    } finally { setSending(false); }
  }

  return <>
    <PageHero badge="Get in Touch" title={<>Let's make ideas <span className="jmc-title-gradient">happen.</span></>}
      description="Tell us about your idea and send a project inquiry directly to the JuaraMetaCorp team." />
    <section className="jmc-section jmc-section-light jmc-top-border">
      <div className="jmc-wrap grid lg:grid-cols-[.88fr_1.12fr] gap-6 lg:gap-10 items-start">
        <div className="jmc-card p-8 sm:p-10">
          <BrandLogo />
          <h2 className="mt-10 text-3xl font-extrabold leading-tight tracking-tight">Create something <span className="jmc-title-gradient">extraordinary.</span></h2>
          <p className="jmc-description mt-5">From 360° tours to metaverse worlds and digital learning spaces, great projects begin with the right conversation.</p>
          <div className="mt-9 pt-7 border-t border-white/10 space-y-5">
            <div className="flex items-center gap-3"><span className="grid place-items-center p-3 rounded-xl bg-blue-500/15 text-cyan-300"><MessageSquareText size={20}/></span><span className="text-sm text-[#b3c8e5]">Project discovery &amp; creative technology</span></div>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sky-300 hover:text-white break-all"><span className="grid place-items-center p-3 rounded-xl bg-blue-500/15"><Mail size={20}/></span>{contact.email}</a>
            {contact.phone && <a href={`tel:${contact.phone.replace(/[^0-9+]/g,'')}`} className="text-sky-300 text-sm block">{contact.phone}</a>}
            {contact.address && <p className="text-sm text-[#b3c8e5]">{contact.address}</p>}
            {contact.mapsUrl && <a href={contact.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 text-sm">View on Google Maps ↗</a>}
          </div>
        </div>
        <div className="jmc-card p-8 sm:p-10">
          <span className="jmc-eyebrow">Start a Conversation</span>
          <h2 className="mt-5 text-2xl sm:text-3xl tracking-tight font-extrabold">Tell us about your project</h2>
          <p className="mt-3 text-sm text-[#a4b9dc] leading-7">Complete the form below and your inquiry will be sent directly to JuaraMetaCorp.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate={false}>
            <div className="grid sm:grid-cols-2 gap-5">
              <label htmlFor="inquiry-name" className="block text-xs font-semibold text-slate-300">Your Name
                <input id="inquiry-name" value={name} onChange={e => setName(e.target.value)} required minLength={2} maxLength={100} disabled={sending} autoComplete="name" placeholder="Full name" className="jmc-form-field mt-2 text-sm" />
              </label>
              <label htmlFor="inquiry-email" className="block text-xs font-semibold text-slate-300">Email Address
                <input id="inquiry-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} disabled={sending} autoComplete="email" placeholder="email@example.com" className="jmc-form-field mt-2 text-sm" />
              </label>
            </div>
            <label htmlFor="inquiry-type" className="block text-xs font-semibold text-slate-300">Project Type
              <select id="inquiry-type" className="jmc-form-field mt-2 text-sm" value={projectType} onChange={e => setProjectType(e.target.value)} disabled={sending} required>
                {projectTypes.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label htmlFor="inquiry-details" className="block text-xs font-semibold text-slate-300">Project Details
              <textarea id="inquiry-details" required minLength={20} maxLength={5000} rows={5} value={details} onChange={e => setDetails(e.target.value)} disabled={sending} placeholder="Tell us about your idea, goals, audience, and timeline..." className="jmc-form-field mt-2 text-sm resize-y" />
              <span className="mt-2 block text-[11px] text-[#91a9c9]">{details.trim().length}/5000 characters · minimum 20</span>
            </label>
            <div aria-hidden="true" className="jmc-honeypot"><label htmlFor="company-website">Company website</label><input id="company-website" type="text" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)} autoComplete="off" /></div>
            <button type="submit" disabled={sending} aria-busy={sending} className="jmc-button w-full sm:w-auto disabled:opacity-65 disabled:cursor-wait">
              {sending ? <><LoaderCircle size={17} className="animate-spin"/> Sending Inquiry...</> : <>Send Project Inquiry <ArrowUpRight size={17}/></>}
            </button>
            <AnimatePresence mode="wait">
              {notice && <motion.div key={`${notice.kind}-${notice.text}`} role={notice.kind === 'error' ? 'alert' : 'status'} aria-live="polite"
                initial={reduced ? false : { opacity: 0, y: 10, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: reduced ? 0 : .28 }} className={`jmc-inquiry-notice ${notice.kind === 'success' ? 'jmc-inquiry-success' : 'jmc-inquiry-error'}`}>
                {notice.kind === 'success' ? <CheckCircle2 size={19} className="shrink-0"/> : <AlertCircle size={19} className="shrink-0"/>}<span>{notice.text}</span>
              </motion.div>}
            </AnimatePresence>
            <p className="text-xs text-[#91a9c9] leading-5">Your inquiry is delivered securely through our email server. We use the information solely to respond to your project request.</p>
          </form>
        </div>
      </div>
    </section>
  </>;
}
``````

## `supabase/schema.sql`

``````sql
-- Idempotent setup: run in Supabase SQL Editor, including when upgrading an existing project.
create table if not exists public.cms_sections (
  section text primary key check (section in ('hero','about','products','partners','leadership','contact','footer')),
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists public.cms_sessions (
  id text primary key,
  csrf text not null,
  expires_at timestamptz not null
);
create index if not exists cms_sessions_expires_at_idx on public.cms_sessions(expires_at);
create table if not exists public.cms_login_attempts (
  key text primary key,
  failures integer not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists cms_login_attempts_updated_at_idx on public.cms_login_attempts(updated_at);
-- Safe atomic limiter for concurrent requests on different serverless instances.
create or replace function public.cms_record_login_failure(p_key text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.cms_login_attempts (key, failures, updated_at) values (p_key, 1, now())
  on conflict (key) do update set
    failures = case when public.cms_login_attempts.updated_at < now() - interval '15 minutes' then 1 else least(10000, public.cms_login_attempts.failures + 1) end,
    updated_at = now();
end;
$$;

alter table public.cms_sections enable row level security;
alter table public.cms_sessions enable row level security;
alter table public.cms_login_attempts enable row level security;
revoke all on table public.cms_sections, public.cms_sessions, public.cms_login_attempts from anon, authenticated;
revoke all on function public.cms_record_login_failure(text) from public, anon, authenticated;
grant all on table public.cms_sections, public.cms_sessions, public.cms_login_attempts to service_role;
grant execute on function public.cms_record_login_failure(text) to service_role;

-- Public read-only images; upload/write only via server secret key.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('cms-images','cms-images',true,8388608,array['image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
``````

## `vercel.json`

``````json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api", "destination": "/api/index" },
    { "source": "/api/:path*", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    { "source": "/api/(.*)", "headers": [
      { "key": "Cache-Control", "value": "no-store" },
      { "key": "X-Content-Type-Options", "value": "nosniff" }
    ] }
  ]
}
``````

## `.github/workflows/ci.yml`

``````yaml
name: Verify JuaraMetaCorp
on:
  push:
  pull_request:
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - name: Install reproducibly
        run: npm ci
      - name: TypeScript and integration tests
        run: npm test
      - name: Production build
        run: npm run build
``````

## `AUDIT_REPORT.md`

``````markdown
# Audit Teknis JuaraMetaCorp — React/Vite/Express/Supabase/Vercel

Tanggal audit: 21 November 2026. Sumber: `JuaraMetaCorp_CMS_Vercel_Supabase.zip` terbaru yang dikirim sebelumnya dalam percakapan. Ini **audit terhadap source code yang tersedia**, bukan klaim akses ke Vercel, Supabase, atau GitHub milik pengguna.

## Ringkasan keputusan

Pertahankan React+Vite dan Express. Di Vercel, kode `api/index.ts` adalah **Vercel Function** yang mengekspor aplikasi `server/app.ts` (Express tidak perlu `.listen()` di dalam Function). `server/index.ts` tetap untuk Node lokal / standalone. Rewrite `/api/*` harus diarahkan ke fungsi `/api/index` **sebelum** catch-all SPA `/index.html`. `npm run build` tetap membuat frontend statis `dist` dan standalone server `server-dist` untuk `npm start`. Vercel menggunakan entrypoint `api/index.ts` sebagai Function, bukan `server-dist`.

Storage di Vercel wajib Supabase Postgres dan Supabase Storage. Local file mode boleh dipakai selama development. Root Directory **`./`** hanya bila `package.json` ada pada root repo Git yang terhubung; pengaturan Root Directory di dashboard Vercel tetap harus diperiksa secara manual.

## Temuan utama, dampak, dan perbaikan

| Prioritas | Temuan | Dampak | Perbaikan |
|---|---|---|---|
| P0 | Frontend login menggunakan `response.json()` tanpa validasi Content-Type | HTML 404/500 Vercel muncul sebagai `Unexpected token` | `src/lib/http.ts`: response non-JSON ditangani dengan pesan error diagnostik; diterapkan ke admin/content/contact |
| P0 | Root Directory Vercel sebelumnya menggunakan absolute Windows path | Tidak menemukan `package.json` saat build | Dokumentasi langkah Vercel `Root Directory ./`, bukan drive lokal; tidak dapat diubah dari file repo saja |
| P0 | Server normal Node `.listen()` berbeda dengan Vercel Function | API bisa tidak terbentuk jika salah entrypoint | `api/index.ts` export default Express app tetap digunakan dan dijelaskan; rewrites `/api`/`/api/*` didahulukan |
| P0 | File CMS lokal tidak persisten pada serverless | Gambar/teks hilang setelah deploy | `cms_sections`, `cms_sessions`, `cms-images` tetap di Supabase; validasi readiness |
| P0 | Transport Supabase sebelumnya selalu mengisi `Authorization: Bearer` dari API key | `sb_secret_...` gagal sebagai JWT | Server mendukung `SUPABASE_SECRET_KEY` baru lewat header `apikey`; legacy JWT tetap didukung |
| P1 | In-memory rate-limit login tidak berbagi state antar Vercel Function | Brute-force tidak dibatasi secara konsisten | Tabel `cms_login_attempts` dan RPC atomik `cms_record_login_failure` dalam SQL |
| P1 | CMS Supabase error baru tampak setelah login; `/api/health` tidak mengecek DB | Deploy terlihat sehat padahal database rusak | Health membaca Supabase dan mengecek admin password hash, JSON 503 jika gagal |
| P1 | Cookie `Secure` ditetapkan berdasarkan NODE_ENV | Login di mode produksi lokal via HTTP berpotensi gagal | Cookie `Secure` berdasarkan request HTTPS atau Vercel |
| P1 | CMS menerima bentuk section yang salah dan menormalkan ke kosong | Bisa menghapus collection tidak sengaja | Cek array untuk collections dan object untuk sections lainnya, kembalikan JSON 400 |
| P1 | Autosave bisa terus mengirim ulang jika server menormalisasi string | Request berulang dan status save tidak stabil | Sinkronisasi hasil normalisasi server ke state yang tidak berubah, simpan perubahan terbaru dalam-flight |
| P1 | Syntax/body errors Express tidak diklasifikasi tepat | JSON invalid & payload besar dapat menjadi 500 | Middleware JSON 400/413, API 404 JSON, error 500 JSON |
| P1 | Tidak ada CI/smoke test siap pakai | Kesalahan native Linux/route baru diketahui di produksi | Workflow GitHub Actions, test integration dan smoke command read-only |
| P2 | requestAnimationFrame di beberapa komponen tidak dibersihkan ketika unmount | Potensi callback setelah halaman berubah | Cleanup RAF di MotionExperience & PartnerMarquee |
| P2 | Dokumen sebelumnya menyebut lockfile tidak ada dan legacy key wajib | Setup/Debug membingungkan | `DEPLOY_PRODUCTION.md`, update README, setup guide |

## Daftar endpoint dan kode status

- `GET /api/health`: 200 JSON `{"status":"ok","storage":"supabase"}` (atau `local`); 503 JSON bila storage/config/password hash gagal.
- `GET /api/content`: 200 JSON CMS; 503 JSON bila DB gagal.
- `GET /api/admin/session`: 200 JSON bila autentik; 401 JSON jika belum login.
- `POST /api/admin/login`: 200 JSON + httpOnly cookie; 401 invalid password; 403 cross-origin; 429 rate-limited; 503 untuk password hash hilang; middleware error berbentuk JSON.
- `POST /api/admin/logout`: 200 JSON; 401/403 jika sesi/CSRF salah.
- `PUT /api/admin/content/:section`: 200 JSON; 400 invalid data; 401/403 auth; 404 section tidak dikenal; 503 jika storage gagal.
- `POST /api/admin/upload`: 201 JSON `{url,bytes}`; 400 file kosong; 401/403 auth; 413 body terlalu besar; 415 invalid image; 503 Storage gagal.
- `POST /api/inquiries`: 200 JSON setelah email terkirim; 400 validasi; 403 cross-site; 415 non-JSON; 429 rate limit; 502 SMTP gagal; 503 SMTP belum diatur.
- Unknown `/api/*`: 404 JSON. Platform-level error Vercel **sebelum Function berjalan** dapat mengembalikan HTML; frontend tidak lagi mem-parsingnya sebagai JSON.

## Pengujian yang benar-benar dilakukan di lingkungan audit ini

| Pemeriksaan | Hasil |
|---|---|
| TypeScript semua source: `tsc --noEmit --noUnusedLocals --noUnusedParameters` (compiler global TS 5.8.3) | PASS |
| `node server/verify-package.mjs` | PASS |
| `node --experimental-strip-types --test server/inquiries.test.mjs` (2 kasus) | PASS |
| Tes parser HTTP (2 test, TypeScript transpile dengan global compiler lalu `node --test`) | PASS |
| Pemindaian relative import, circular dependency (42 TypeScript modules) | 0 circular cycles ditemukan |
| Validasi syntax scripts `.mjs` | PASS |
| Validasi package-lock terhadap nama dan versi dependency package.json | PASS |
| `npm ci` / `npm install` yang sepenuhnya bersih | BELUM BERHASIL: registry npm tidak bisa di-resolve dari lingkungan audit |
| `npm run build` | BELUM BERHASIL: `node_modules` yang tersedia berasal dari Windows, TypeScript Linux native binding tidak tersedia |
| `npm run dev` | BELUM BERHASIL: esbuild Windows binary tidak kompatibel di lingkungan Linux audit |
| Tes Express+Sharp upload end-to-end di lingkungan audit | BELUM BERJALAN karena native dependencies di atas. Tests sudah disiapkan untuk Linux CI |
| Vercel actual deploy, Supabase real CRUD, CMS login real, browser console dan jaringan di domain production | BELUM DIUJI: akses server, kredensial dan deployment belum tersedia |

**Ini bukan jaminan deploy pasti sukses**, tetapi paket sudah dikoreksi secara statis, dengan CI yang memblokir build/test gagal di mesin Linux online. Jalankan `npm ci && npm test && npm run build` pada Node 22 dengan internet dan native package sesuai OS, lalu smoke test Vercel.

## Audit tambahan dan risiko tersisa

- Frontend relative API path `/api/...` tanpa hardcoded localhost untuk request produksi. `src/components` tetap bisa memakai external image URLs; gambar partner dari sumber pihak ketiga tidak dapat dijamin availability atau hak penggunaan.
- Tidak ada CORS wildcard. API didesain same-origin dengan auth cookie, origin validation dan CSRF.
- Semua konten HTML yang disimpan melalui CMS disanitasi di server memakai sanitize-html sebelum dirender.
- Image upload diproses dengan Sharp dan dikonversi WebP, sementara UI mengoptimalkan sebelum dikirim untuk batas Vercel.
- Inquiry form masih memakai per-instance Map rate limiting (proteksi ringan), bukan distributed rate-limiter. Untuk traffic publik tinggi atau abusive traffic, tambah WAF/Vercel Firewall atau Redis/Upstash distributed limiter dan CAPTCHA; jangan klaim rate-limit inquiry sudah global.
- File gambar yang tidak direferensikan CMS tidak dihapus otomatis; perlu proses cleanup manual/terjadwal setelah backup supaya Storage tidak terus tumbuh.
- Multi-editor CMS memakai last-write-wins per section, belum locking versi/optimistic concurrency.
- `npm audit`, browser functional/E2E, external CDN URLs, Lighthouse, bundle size final, warning build dan deployment tidak dapat diverifikasi tanpa `npm ci` online dan akses produksi.
- Preview yang memakai credentials Supabase production akan mengedit database live. Gunakan Preview env/project terpisah.

## Langkah wajib pengguna

1. Backup `.env`, foto CMS lama, `data/cms.json`, dan Supabase production jika sudah terisi.
2. Ekstrak ZIP ke root repository yang digunakan Vercel. Jangan copy `node_modules` Windows; gunakan `npm ci` dari registry.
3. Supabase SQL Editor: jalankan `supabase/schema.sql` **ulang** walaupun sudah ada schema sebelumnya.
4. Tambahkan `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (sb_secret) atau legacy service_role JWT, `CMS_ADMIN_PASSWORD_HASH`, dan `PUBLIC_ORIGIN` di Vercel Production Environment.
5. Migrasikan file lama sekali melalui `scripts/migrate-local-cms.mjs` bila belum dimigrasikan.
6. Vercel → Settings → Build and Deployment → Root Directory `./` hanya jika `package.json` berada di root repo; Framework Vite, `npm run build`, `dist`.
7. Push Git, pantau build dan Functions logs, jalankan `npm run test:smoke -- https://DOMAIN`, lalu uji login/save/upload dan redeploy secara manual.

Untuk source code yang berubah secara **lengkap**, buka `SOURCE_CHANGES_COMPLETE.md` di paket ZIP. Untuk langkah deploy terperinci buka `DEPLOY_PRODUCTION.md`.
``````

## `DEPLOY_PRODUCTION.md`

``````markdown
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
``````

## `scripts/smoke-production.mjs`

``````javascript
/** Read-only verification of a deployed Vercel website: npm run test:smoke -- https://your-domain */
const raw = process.argv[2] || process.env.SMOKE_BASE_URL;
if (!raw || !/^https?:\/\//.test(raw)) {
 console.error('Usage: npm run test:smoke -- https://YOUR-VERCEL-URL'); process.exit(2);
}
const base = raw.replace(/\/+$/, '');
let problems = 0;
async function check(p, expectedCode, expectedType, inspect) {
 try {
  const response = await fetch(base + p, {redirect:'manual',signal:AbortSignal.timeout(15000)});
  const type=response.headers.get('content-type')||'';
  const passed=response.status===expectedCode && type.includes(expectedType);
  const content=type.includes('application/json') ? await response.json() : await response.text();
  const valid=passed && (!inspect || inspect(content));
  console.log(`${valid?'PASS':'FAIL'} ${p} → ${response.status} ${type}`);
  if(!valid)problems++;
 }catch(e){console.error(`FAIL ${p}: ${e instanceof Error ? e.message : 'request failed'}`);problems++}
}
await check('/api/health',200,'application/json',data=>data?.status==='ok');
await check('/api/content',200,'application/json',data=>!!data?.hero && Array.isArray(data?.products));
await check('/api/does-not-exist',404,'application/json',data=>typeof data?.message==='string');
await check('/api/admin/session',401,'application/json',data=>data?.authenticated===false);
await check('/admin',200,'text/html');
await check('/about',200,'text/html');
await check('/product',200,'text/html');
await check('/contact',200,'text/html');
if(problems){console.error(`${problems} smoke tests failed. Check Vercel logs, env and Supabase schema.`);process.exitCode=1;}
else console.log('Smoke tests passed. Next verify login, save and upload manually in /admin.');
``````

## `server/api.test.ts`

``````typescript
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
``````

## `src/lib/http.test.ts`

``````typescript
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
``````

## `src/lib/http.ts`

``````typescript
/** Single JSON transport for the same-origin API. Never parse a Vercel HTML error as JSON. */
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'ApiError'; }
}

export async function requestJson<T>(path: `/api/${string}`, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(path, {
      credentials: 'same-origin', cache: 'no-store', ...options, signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    if (!/\bapplication\/(?:[a-z0-9.+-]*\+)?json\b/i.test(contentType)) {
      throw new ApiError(
        `API ${path} returned a non-JSON response (HTTP ${response.status}). Check Vercel Functions, rewrites and deployment logs.`,
        response.status,
      );
    }
    let body: unknown;
    try { body = await response.json(); }
    catch { throw new ApiError(`API ${path} returned malformed JSON (HTTP ${response.status}).`, response.status); }
    if (!response.ok) {
      const detail = body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
        ? body.message : `API request failed (HTTP ${response.status}).`;
      throw new ApiError(detail, response.status);
    }
    return body as T;
  } catch (error) {
    if (controller.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(`API ${path} timed out. Please try again.`, 0);
    }
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError) throw new ApiError(`Cannot reach API ${path}. Check your connection and Vercel deployment.`, 0);
    throw error;
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
``````

