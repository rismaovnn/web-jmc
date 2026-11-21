# JUARAMETACORP — Paket lengkap perbaikan backend Vercel (21 November 2026)

## Yang diperbaiki berdasarkan Vercel Runtime Logs

Vercel menampilkan `ERR_MODULE_NOT_FOUND` untuk `file:///var/task/server/app`. API Function gagal **sebelum** Express/Supabase aktif. Versi paket terdahulu memakai *dynamic import* `await import('../server/app')` di `api/index.ts`; memperbaiki patch melalui `git apply` gagal karena file lokal tidak identik dengan dasar patch.

**Versi ini menggunakan static ESM import** `import app from '../server/app.js'` agar Vercel builder dapat melacak seluruh dependency server. Relative import internal backend diubah menjadi ekstensi `.js` (Node.js ESM). Endpoint liveness `/api/ping` sekarang berada di `server/app.ts`. `vercel.json` memprioritaskan `/api/*` sebelum SPA fallback; pembaruan CMS tetap memakai Supabase Storage/Database.

## Penting: jangan hilangkan perubahan frontend terbaru

Paket ini adalah **snapshot proyek lengkap dari ZIP terakhir yang tersedia di chat**, diperbarui untuk Vercel. Paket sumber tersebut **belum berisi** `src/components/InteractiveMascot.tsx` yang muncul dalam log build proyek lokalmu belakangan. Jadi, **jangan hapus seluruh folder proyek lokal lalu menggantinya dengan ZIP** bila ada fitur frontend yang lebih baru.

Untuk proyek lokal terbaru, cara paling aman adalah menjalankan **`INSTALL_FIX_KE_PROYEK_TERBARU.ps1`** dari folder hasil ekstraksi ZIP. Script ini mengedit import backend dan entrypoint Vercel secara terbatas; file komponen React baru tidak disentuh, dan versi backend sebelumnya dibackup ke `%TEMP%`.

### Instal di Windows PowerShell 5.1 — tanpa git apply

1. Ekstrak ZIP ke folder baru (contoh `Downloads\JMC-Fixed`).
2. Buka PowerShell dan jalankan (ganti lokasi ekstrak sesuai folder di komputermu):

   ```powershell
   powershell -ExecutionPolicy Bypass -File "C:\Users\USERNAME\Downloads\JMC-Fixed\INSTALL_FIX_KE_PROYEK_TERBARU.ps1" -ProjectRoot "D:\JUARAMETA\JUARAMETA CORP\WEB JMC"
   ```

3. Kemudian di folder proyek lama yang terhubung ke GitHub:

   ```powershell
   node scripts/check-esm-imports.mjs
   npx tsc --noEmit
   npm run build
   git diff
   ```

4. Jika semua tes lulus, lakukan commit dan push dari folder proyek GitHub.

### Jika ingin memakai snapshot ZIP sebagai proyek baru

- Salin source ZIP ke repository kosong, **bukan** menimpanya di atas repository yang sudah punya file terbaru.
- Jalankan `npm ci`, `npm test`, `npm run build`, `npm run dev`.
- **Node 22**; root Vercel adalah folder repository berisi `package.json` (`./`), bukan path lokal Windows.
- Vercel: Framework `Vite`, Build `npm run build`, Output `dist`. Periksa `vercel.json`.
- Jalankan `supabase/schema.sql` pada Supabase SQL Editor.
- Atur environment server di Vercel: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (atau `SUPABASE_SERVICE_ROLE_KEY`), `CMS_ADMIN_PASSWORD_HASH`, `PUBLIC_ORIGIN`. Jangan masukkan secret ke `VITE_*` atau GitHub.
- Jika ingin mempertahankan data lokal lama yang belum dimigrasi: `node --env-file=.env scripts/migrate-local-cms.mjs` setelah mengambil backup.

### Setelah Vercel deployment berstatus Ready

- `/api/ping` → status **200** JSON `{ "status": "ok", "service": "juarametacorp-api" }`.
- `/api/health` → 200 JSON jika Supabase dan password CMS siap; 503 JSON jika belum siap.
- `/api/content` → 200 JSON CMS, atau 503 JSON jika koneksi database gagal.
- `/api/admin/session` → 401 JSON kalau belum login (normal), bukan 500.
- Buka `/admin` untuk login, ubah 1 teks, upload 1 gambar, refresh website, kemudian redeploy. Data harus tetap ada di Supabase.

**Status pengujian paket ini:** `node scripts/check-esm-imports.mjs` dan `tsc --noEmit` menggunakan TypeScript global 5.8.3 **lulus** pada lingkungan audit. Build Vite/esbuild penuh dan Vercel produksi **belum dapat diuji** karena dependency dalam ZIP lama berisi binary Windows, sedangkan runtime audit adalah Linux tanpa akses instalasi npm yang lengkap; koneksi Supabase user juga tidak tersedia. Keberhasilan Production harus dikonfirmasi melalui Vercel deployment dan logs.

Baca juga `DEPLOY_PRODUCTION.md` untuk setup Supabase, SMTP, CMS, keamanan, dan smoke test lengkap.
