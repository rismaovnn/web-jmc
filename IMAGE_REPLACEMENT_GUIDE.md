# Cara Mengganti Gambar Project — JuaraMetaCorp

**Anda tidak perlu mengubah gambar menjadi SVG ataupun mengedit komponen React.**

1. Buka folder `WEB/public/images/projects/` di project website yang sudah berjalan.
2. Masukkan gambar proyek ke folder tersebut, contoh: `360.jpeg` dan `metaschool.jpeg`.
3. Buka `WEB/public/images/projects/project-images.json` dan tulis nama file yang ingin ditampilkan:

```json
{
  "rumah-adat-lampung": "360.jpeg",
  "metaschool-smkn-4": "metaschool.jpeg"
}
```

4. Jika ingin mengganti dengan PNG, cukup simpan `rumah-adat-baru.png` di folder yang sama, lalu ubah nilai JSON menjadi `"rumah-adat-baru.png"`. Anda juga dapat menggunakan `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, atau `.svg`.
5. Simpan file JSON, buka `/product` lalu refresh browser (`Ctrl + Shift + R` bila gambar lama masih tersimpan di cache).

Gambar yang sama akan muncul pada kartu di halaman Products dan pada pop-up **View Project**. Gambar ideal berasio **16:9**, misalnya **1600 x 900** atau **1920 x 1080**. Format **WebP** atau JPG umumnya sesuai untuk ukuran file lebih ringan.

**Jika nama file salah / file belum tersedia**, tampilan otomatis memakai ilustrasi SVG bawaan sebagai *fallback* agar kartu tidak menjadi blank. SVG bukan format wajib; itu hanya cadangan bawaan.

**Catatan:** `preview.html` hanya preview statis, bukan source website React yang tampil di `localhost:3000/product`. Konten website React diambil dari `project-images.json`. Jangan meletakkan URL dengan `public/` di depannya; masukkan **nama file saja** di JSON.

Patch ini tidak mengubah konfigurasi Gmail, backend, `.env`, marquee partner, atau CSS animasi.
