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
