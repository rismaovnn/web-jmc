> Versi paling baru: lihat **README_MASCOT_SPRING_V3.md** untuk implementasi Spring + 2.5D head tracking.

# Interactive Portrait Mascot — JuaraMetaCorp

Hero section telah direvisi agar tampil **lebih dekat, lebih premium, dan lebih fokus ke karakter**, dengan framing **setengah badan** (kepala, leher, bahu, dan dada) seperti pendekatan website modern ala Mindframes.

Maskot PNG transparan yang Anda unggah tetap dipakai sebagai sumber visual utama, namun kini ditampilkan sebagai **portrait hero mascot** di sisi kanan Hero Section.

## Ringkasan hasil revisi

- **Full body dihilangkan dari tampilan Hero**.
- Karakter ditampilkan **besar** sebagai fokus utama visual.
- Frame karakter dibuat seperti **portrait glass card** dengan glow, ring, dan ambient halo.
- Animasi diarahkan ke pengalaman **hidup dan interaktif**:
  - head tracking
  - neck follow-through
  - subtle shoulder response
  - idle breathing
  - hover curiosity
  - click reaction
  - floating motion
  - parallax ambience
- Struktur animasi dibuat dengan **virtual layer masking** di shader untuk area:
  - head
  - neck
  - shoulders
  - chest
  - hair
  - mouth

## Menjalankan proyek

1. Ekstrak `JuaraMetaCorp-Mascot-Interactive.zip`
2. Buka folder hasil ekstraksi di VS Code
3. Jalankan:

```bash
npm install
npm run dev
```

4. Buka `http://localhost:3000`

> Gunakan Node.js yang kompatibel dengan Vite 8 (Node 20.19+ atau Node 22.12+).

## File yang diubah

| File | Fungsi |
| --- | --- |
| `src/components/InteractiveMascot.tsx` | Komponen reusable maskot portrait interaktif dengan Three.js + shader deformation + requestAnimationFrame loop |
| `src/components/interactive-mascot.css` | Styling portrait frame, glow, crop setengah badan, floating, shadow, parallax ambience |
| `src/components/Hero.tsx` | Penyesuaian ukuran visual hero agar mascot portrait tampil dominan di sisi kanan |
| `public/images/mascot-vr.png` | PNG maskot transparan asli |

## Arsitektur animasi

Karena sumber visual berasal dari **satu PNG**, maka pemisahan `Head Layer`, `Neck Layer`, `Shoulder Layer`, `Hair Layer`, dan `Chest Layer` dibuat sebagai **masked deformation regions** pada mesh, bukan sebagai file layer Photoshop terpisah.

Secara teknis, sistem ini tetap reusable karena logika animasi tidak tergantung pada satu desain saja. Jika Anda mengganti karakter, biasanya cukup:

1. ganti file PNG
2. sesuaikan koordinat `rig`

Contoh:

```tsx
<InteractiveMascot
  src="/images/mascot-vr.png"
  rig={{
    head: [0.53, 0.84],
    neck: [0.53, 0.72],
    shoulders: [0.52, 0.64],
    chest: [0.52, 0.55],
    hair: [0.53, 0.94],
    mouth: [0.50, 0.785],
    leftHand: [0.25, 0.74],
    rightHand: [0.83, 0.59],
  }}
/>
```

## Interaksi yang diterapkan

### 1. Mouse tracking

- Kepala mengikuti cursor secara halus
- Rotasi horizontal lebih dominan daripada vertikal
- Leher ikut bergerak sedikit
- Bahu bereaksi tipis agar lebih natural
- Badan bagian dada ikut bernapas dan sedikit sway
- Semua motion dihaluskan dengan **damping** berbasis `deltaTime`

### 2. Idle animation

Saat cursor diam, karakter tetap hidup melalui:

- breathing
- subtle head sway
- nod kecil
- rambut bergerak halus
- ekspresi mulut sedikit hidup
- floating 4 detik ease-in-out

### 3. Hover reaction

Saat cursor mendekati area wajah:

- karakter sedikit condong ke depan
- senyum terasa lebih hangat
- kepala lebih responsif
- kesan “penasaran” meningkat

### 4. Click reaction

Saat diklik:

- karakter memberi reaksi ringan
- nod / bounce kecil
- ekspresi lebih cerah
- lalu kembali ke idle

### 5. Performance

- `requestAnimationFrame`
- pointer event hanya menyimpan koordinat
- render dibatasi satu loop aktif
- stop saat tab tidak aktif / komponen offscreen
- fallback ke PNG normal jika WebGL tidak tersedia
- tetap usable pada mobile

## Batasan penting dari aset yang Anda unggah

Karakter yang Anda kirim menggunakan **VR headset yang menutupi mata**.

Artinya:

- **eye tracking asli tidak bisa terlihat**, karena bola mata tidak terlihat
- **blinking visual pada mata juga tidak bisa terlihat nyata**, karena area kelopak tertutup visor

Saya tetap menambahkan **blink timing** dan mikro-ekspresi untuk membantu ritme karakter terasa hidup, tetapi secara visual hasil utama tetap datang dari:

- gerak kepala
- leher
- bahu
- rambut
- senyum / mouth emphasis
- hover curiosity

Jika Anda ingin hasil yang benar-benar seperti maskot yang **menatap cursor dengan mata yang jelas terlihat dan bisa berkedip**, maka solusi terbaik adalah salah satu dari berikut:

1. kirim PNG karakter tanpa penutup mata
2. kirim versi layered (head / eyes / hair terpisah)
3. gunakan model 3D `.glb/.gltf` dengan rig

## Catatan kualitas hasil

Pendekatan ini adalah **2.5D interactive portrait**: jauh lebih hidup daripada gambar statis, tetapi belum setara dengan karakter 3D rigged penuh.

Untuk kebutuhan landing page modern, hasil ini sudah sangat cocok untuk memberi kesan:

- premium
- interaktif
- modern
- wow effect
- reusable

## Penggantian maskot di masa depan

Agar reusable, Anda cukup mengganti file PNG di:

`public/images/mascot-vr.png`

Jika framing karakter baru berbeda jauh, sesuaikan nilai `rig` pada komponen.

---

Jika Anda ingin tahap berikutnya, yang paling direkomendasikan adalah **saya bantu buat versi dengan aset layered** (misalnya head, eyes, hair terpisah), sehingga eye tracking dan blink bisa benar-benar terlihat, bukan hanya disimulasikan secara tidak langsung.
