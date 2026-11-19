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
- CMS aman berbasis file JSON, login password scrypt, session cookie httpOnly, CSRF, upload gambar WebP, dan autosave.
- Contact API melalui Gmail SMTP (kredensial hanya di `.env` pada server).

**Penting untuk hosting:** CMS file-based perlu penyimpanan permanen (`data/`) dan satu proses Node.js; untuk deployment serverless gunakan database/object storage.

Baca juga `CMS_SETUP_GUIDE.md`, `CONTACT_SETUP.md`, dan `PROJECT_LIVE_LINKS_GUIDE.md` untuk rincian teknis.
