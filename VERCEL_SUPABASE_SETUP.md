# JuaraMetaCorp CMS — Deployment Vercel + Supabase

## Apa yang berubah

- React UI/Admin tetap sama; `/api/content` tetap dipakai website.
- Backend Express diekspor melalui `api/index.ts` sebagai Vercel Function.
- `vercel.json` mengarahkan `/api/*` ke Function dan seluruh rute React ke `index.html`.
- Setiap section disimpan sebagai row `public.cms_sections` (bukan `data/cms.json` di serverless).
- Foto yang diupload diolah dengan Sharp lalu disimpan di Supabase Storage (bukan `data/uploads` di serverless).
- Session admin disimpan di table `cms_sessions`, dengan SID di-cookie dan hash SID dalam database.
- Local development tanpa Supabase tetap memakai file; `CMS_STORAGE=supabase` mengaktifkan mode Supabase di local.
- Sebelum request upload, browser mengecilkan gambar besar menjadi WebP agar berada di bawah batas request Vercel standar 4.5MB.

## Persiapan (sekali saja)

1. Backup folder proyek sekarang, khususnya `.env`, `data/cms.json`, dan seluruh `data/uploads`.
2. Buat project di <https://supabase.com/dashboard>. Pilih region dekat pengunjung atau Vercel Function.
3. Buka **SQL Editor**, paste isi `supabase/schema.sql` lalu **Run**. Ini membuat `cms_sections`, `cms_sessions`, dan bucket publik `cms-images`.
4. Di Supabase **Project Settings > API Keys**, ambil **Project URL** dan **legacy service_role key**. Simpan privat; JANGAN pakai `VITE_`, jangan commit `.env`. Key ini sangat sensitif dan harus tetap di server saja.
5. Pada folder lokal, buat/perbarui `.env` (jangan hapus konfigurasi SMTP atau CMS password yang sudah ada):

```dotenv
SUPABASE_URL=https://project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ISI_LEGACY_SERVICE_ROLE_SECRET
# PENTING: tidak perlu CMS_STORAGE=supabase sampai migrasi selesai
```

6. Untuk mengirim **dua gambar lama beserta seluruh perubahan konten** di `data/cms.json`, jalankan dari terminal pada folder root:

```sh
node --env-file=.env scripts/migrate-local-cms.mjs
```

Perintah akan **menolak menimpa** konten bila database sudah terisi. Jangan gunakan `--force` tanpa backup; opsi itu dapat mengganti perubahan website production.

7. Tambahkan ini ke `.env` lokal agar melihat konten yang sama dengan production:

```dotenv
CMS_STORAGE=supabase
```

8. Di Vercel: Project > Settings > Environment Variables. Tambahkan:

```dotenv
SUPABASE_URL=https://project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ISI_LEGACY_SERVICE_ROLE_SECRET
CMS_ADMIN_PASSWORD_HASH=scrypt$...$...
PUBLIC_ORIGIN=https://DOMAIN-PRODUCTION-MU
SMTP_USER=...
SMTP_APP_PASSWORD=...
```

`CMS_ADMIN_PASSWORD_HASH` ambil dari `.env` hasil `npm run cms:setup`; jangan masukkan password plaintext. `PUBLIC_ORIGIN` untuk production URL yang benar; pada Preview deployment, jika menggunakan host berbeda, sesuaikan environment/aturan origin agar request Admin diterima. Jangan menggunakan `VITE_` pada secret.

9. Pastikan pengaturan deployment **Framework: Vite**, **Root Directory: folder berisi package.json**, Build command: `npm run build`, Output directory: `dist` (sudah tertulis di `vercel.json`). Push perubahan kode ini ke Git lalu deploy sekali untuk upgrade backend. **Setelah upgrade, perubahan foto/konten tidak memerlukan deploy ulang.**
10. Kunjungi `https://DOMAIN/api/health` → JSON `{"status":"ok"}` dan `https://DOMAIN/api/content` → JSON CMS (bukan HTML). Buka `https://DOMAIN/admin`, login, ubah salah satu teks dan upload satu foto; lihat website publik dan cek konten tetap ada setelah refresh/redeploy.

## Penting

- **Tidak bisa mengubah konten hosting yang saat ini aktif tanpa minimal satu deployment awal.** Deployment tersebut memasang kode API/DB yang baru; berikutnya perubahan konten lewat admin tidak perlu deploy.
- `data/uploads/*.webp` tidak pernah ikut Git karena `.gitignore`. Script migrasi membawa file gambar tersebut dari komputer ke Supabase; **jalankan sebelum deploy jika ingin foto lama tetap tampil**.
- Jangan menjadikan `data/cms.json` sebagai database production pada Vercel; data lama hanya dipakai untuk migrasi.
- Rute `/uploads/xxx.webp` lama tidak lagi menjadi tujuan gambar CMS baru; setelah migrasi, URL gambar berganti menjadi `https://...supabase.co/storage/v1/object/public/cms-images/...`.
- Bucket bersifat **publik untuk membaca gambar**. Jangan masukkan materi rahasia ke bucket. Service role key hanya boleh di backend dan dapat melewati RLS.
- Gambar 8MB bisa diterima melalui UI asalkan browser berhasil melakukan kompresi sebelum upload. Untuk browser yang tidak bisa kompresi, gunakan gambar lebih kecil; request >4.5MB biasanya ditolak Vercel.
- Preview deployments juga membaca database production jika memakai env yang sama; **jangan edit lewat Preview** kecuali bermaksud mengubah konten live. Untuk isolasi gunakan project Supabase terpisah.
- Batasi brute-force login di Vercel Firewall/rate limiting pada `/api/admin/login`: Map limit sebelumnya masih hanya per-instance dan tidak cukup sebagai proteksi terdistribusi.
- Lakukan backup Supabase database serta Storage secara rutin, dan cek kuota layanan; permanen berarti tidak hilang pada redeploy, bukan pengganti backup.

## Troubleshooting

- `/api/content` menampilkan HTML: cek `vercel.json` urutan rewrites / API Function deployment.
- `/api/content` 500: cek Supabase env, nama tabel, dan Vercel Function Logs.
- Admin login 503/500: cek `CMS_ADMIN_PASSWORD_HASH`, `cms_sessions`, dan service role key.
- Upload 413: gambar melewati limit body request Function; kompres / resize sebelum upload.
- Upload 503: cek bucket `cms-images` benar-benar dibuat, `SUPABASE_SERVICE_ROLE_KEY`, dan Supabase Function logs.
- Gambar lama 404: jalankan migrasi dan pastikan URL gambar di `cms_sections` telah berubah dari `/uploads/...` ke Supabase public URL.
- `403 Cross-site requests are blocked`: `PUBLIC_ORIGIN` harus sama **persis** dengan URL halaman admin, misalnya `https://www.example.com` vs `https://example.com`.
- Upload berhasil tetapi admin belum sempat menyimpan field: tunggu label 'Saved successfully' atau klik **Save now**; file yang belum direferensikan tetap berada di bucket.
