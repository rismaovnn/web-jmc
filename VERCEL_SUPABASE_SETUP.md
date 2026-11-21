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
