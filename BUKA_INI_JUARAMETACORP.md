# WEBSITE JUARAMETACORP — HERO MASKOT MP4 SUDAH TERPASANG

INI ADALAH PAKET WEBSITE LENGKAP, BUKAN DEMO TERPISAH.

## Perubahan yang langsung terlihat di halaman utama

- `src/components/Hero.tsx` menggunakan `<SpriteMascot />` sebagai visual utama di sisi kanan.
- `src/components/SpriteMascot.tsx` memasang mesin Vanilla JavaScript ke area Hero website.
- `src/components/sprite-mascot.css` mengintegrasikan visual maskot dengan background JuaraMetaCorp dan responsivitas.
- `src/mascot-engine/` berisiii physics, tracking kursor, pose selection, atlas loader, dan renderer.
- `public/mascot-sprite/` berisi frame atlas hasil MP4 asli, poster, dan manifest metadata.
- CMS, tombol Hero, navigasi, halaman lain, API, dan aset website dipertahankan.

Video Anda tidak memiliki transparansi: latar asli rekaman akan tetap terlihat pada portrait maskot. Framing 9:16 tidak dipotong atau didistorsi. Pose yang tidak direkam tidak bisa diciptakan dari sprite sheet.

## Cara menjalankan (Windows / VS Code)

1. Ekstrak ZIP WEBSITE ini ke folder baru.
2. Buka folder tersebut di VS Code (pastikan `package.json` terlihat di root).
3. Buka terminal:

```sh
npm install
npm run dev
```

4. Buka `http://localhost:3000/` dan arahkan mouse ke area Hero.

Untuk administrasi CMS kunjungi `/admin`. Ikuti panduan CMS dan `.env.example` yang tersedia. Jangan mengganti `.env` lama dengan file kosong; simpan konfigurasi rahasia di komputer/server Anda sendiri.

## Penting

Mengunggah ZIP ke Google Drive tidak otomatis mengubah website online. Ini adalah source code **JuaraMetaCorp dengan maskot sudah terpasang**. Untuk membuat perubahan terlihat di domain publik, source versi ini perlu di-deploy ke hosting website. Proses deploy memerlukan akses hosting/repository, yang tidak termasuk dalam file ZIP.

## Kualitas dan performa

- `requestAnimationFrame` menargetkan refresh layar (umumnya 60 Hz), tidak menjamin 60 fps di setiap perangkat.
- 190 frame dari MP4 720 x 1280 @24 fps dipetakan ke 24 atlas halaman horizontal.
- Canvas menampilkan frame berdasarkan posisi mouse dan spring; bukan memutar video terus menerus.
- Kode mendukung lazy load atlas, fallback poster, resize responsif, reduced-motion, pause offscreen.
- Background asli MP4 tetap ada (video tidak mempunyai alpha).
