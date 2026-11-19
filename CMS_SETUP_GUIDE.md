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
