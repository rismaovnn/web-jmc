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
