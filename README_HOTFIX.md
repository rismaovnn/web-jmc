# HOTFIX — Vercel `ERR_MODULE_NOT_FOUND` (`/var/task/server/app`)

Berdasarkan screenshot runtime logs 21 November 2026, Vercel mengembalikan HTTP 500 karena entrypoint API mencoba dynamic import `../server/app` tanpa ekstensi file saat dieksekusi sebagai Node.js ESM.

## Cara paling aman (direkomendasikan)

Dari root repository proyek terbaru kamu (pastikan `git status` bersih atau simpan perubahan dulu), terapkan file `JMC_ESM_HOTFIX.patch`:

```bash
git apply --check JMC_ESM_HOTFIX.patch
git apply JMC_ESM_HOTFIX.patch
```

Copy file patch ke root repo sebelum menjalankan perintah; file patch tersedia di paket ZIP ini. Jika `git apply --check` gagal karena proyek terbaru sudah berbeda, JANGAN menimpa source dengan file lama. Edit hanya baris import terkait sesuai patch. File lengkap di `api/`, `server/` dan `src/cms/` disediakan sebagai referensi untuk versi source audit sebelumnya.

Perubahan: Semua relative ESM imports yang dilewati oleh Vercel Function sekarang menggunakan suffix `.js`, walaupun source adalah `.ts`. TypeScript mengenali `.js` specifier yang sesuai dengan source TypeScript; runtime hasil transpile dapat meresolusi hasil `.js`.

## Tes

```bash
npm ci
npm run typecheck
npm run build
npm run test:api
```

Commit/push ke GitHub setelah tes lulus. Vercel akan menjalankan deploy baru sesuai integrasi Git. Setelah status Ready, buka:

- https://juarametacorp.vercel.app/api/ping  (harus 200 JSON)
- https://juarametacorp.vercel.app/api/health  (harus 200 JSON apabila Supabase dan password hash tersedia)
- https://juarametacorp.vercel.app/api/content (harus 200 JSON jika tabel CMS tersedia)
- https://juarametacorp.vercel.app/api/admin/session (normal bila belum login: 401 JSON, BUKAN 500)

Jika 500 masih muncul, ambil stack trace terbaru dari Vercel -> Logs. Fix ini memperbaiki import `server/app` yang terkonfirmasi pada screenshot, tetapi tidak membuktikan sendiri bahwa Supabase, environment, atau dependencies production sudah benar.

> Patch ini diturunkan dari source `JuaraMetaCorp_Production_Audit_Fixed.zip` yang sebelumnya dikirim. Tidak mengubah UI, kredensial, atau data CMS. Tidak perlu mengganti `vercel.json` untuk kasus error spesifik ini.
