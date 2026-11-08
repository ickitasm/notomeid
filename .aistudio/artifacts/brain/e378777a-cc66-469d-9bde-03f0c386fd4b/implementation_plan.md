# Tema Baru: Halloween Horror & Retro Arcade 8-Bit (Low-Spec Optimized)

Implementasi dua tema visual baru dengan animasi atmosferik yang sangat ringan dan mulus untuk perangkat berspesifikasi rendah (*low-spec mobile & desktop*): tema **Halloween** bernuansa *Midnight ungu gelap horor* dengan partikel bara api dan kelelawar melayang, serta tema **Retro** bernuansa *Arcade 8-bit gelap* dengan efek pendar garis scanline CRT halus dan bintang piksel berkelip.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Pilihan Terkonfirmasi Pengguna**:
>   - **Gaya Halloween**: *Midnight ungu gelap dengan kelelawar dan bara api melayang* (`#0D0914` background canvas, `#161022` kartu elevasi, aksen oranye labu/bara `#FF7518` dan ungu spektral `#A855F7`).
>   - **Gaya Retro**: *Arcade 8-bit gelap dengan bintang piksel dan garis scanline CRT halus* (`#0A0D14` arcade black, `#101726` kartu terminal, aksen neon cyan fosfor `#00F5D4` dan kuning retro arcade).
> - **Prinsip Kinerja Tertinggi (Low-Spec Hardware Guarantee)**:
>   - Partikel animasi strictly digerakkan oleh **CSS 3D Transforms (`translate3d`)** dan **`opacity`** yang diproses di GPU (Compositor Thread), bukan kalkulasi CPU JavaScript atau Canvas rerender berkala.
>   - Jumlah partikel dibatasi secara deterministik (hanya 8–10 partikel bara/bintang dan 2–3 siluet kelelawar), menjamin framerate stabil 60 FPS tanpa konsumsi baterai berlebih.
>   - Seluruh lapisan partikel memiliki properti `pointer-events-none` dan mematuhi aturan aksesibilitas `prefers-reduced-motion`.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Memperluas sistem tema Notome dengan menghadirkan dua preset visual tematik imersif:
  1. **Halloween Night**: Atmosfer misterius yang elegan dan sedikit menyeramkan dengan siluet kelelawar terbang lembut dan bara api ungu-oranye yang melayang.
  2. **Retro 8-Bit Arcade**: Sensasi nostalgia konsol dan arcade klasik dengan scanline tabung CRT yang halus, bit piksel geometris, dan palet neon fosfor.
- **Audiens Target**: Pengguna yang menginginkan variasi estetika musiman atau nuansa retro klasik tanpa mengorbankan kelancaran navigasi di ponsel Android/iOS spek terjangkau.
- **Nilai Utama**: Transformasi visual menyeluruh (header, tab navigasi, kartu film, status, kalender, dan modal) dengan latensi 0ms dan zero frame drops.

---

### 2. User Experience & Visual Design

- **Alur Interaksi Pengguna**:
  1. Pengguna membuka menu profil avatar atau mengetuk ikon siklus tema di bilah navigasi header.
  2. Di pemilih tema, terdapat 2 pilihan baru: **Halloween Night** (ikon Ghost/Hantu) dan **Arcade 8-Bit** (ikon Gamepad/Terminal).
  3. Saat tema dipilih:
     - Latar belakang, kartu, pembatas, dan teks bertransformasi seketika tanpa refresh halaman.
     - Efek partikel atmosferik muncul dengan transisi *fade-in* yang halus.
     - Pilihan tema tersimpan otomatis di penyimpanan lokal (*local preferences*) pengguna.

- **Visual Identity & Color Palette**:
  - **Halloween Night**:
    - *Canvas Base*: `#0D0914` (Deep Midnight Void).
    - *Card & Container Surfaces*: `#161022` / `#1F162E` (Plum Velvet).
    - *Borders & Dividers*: `#342247` (Ghostly Amethyst Hairline).
    - *Accents & Highlights*: `#FF7518` (Pumpkin Ember) & `#A855F7` (Spiritual Violet).
    - *Animasi Efek*: 8 bara api berpendar melayang perlahan ke atas + 2 siluet kelelawar bersayap tipis melintasi langit malam secara berkala.
  - **Retro 8-Bit Arcade**:
    - *Canvas Base*: `#080B10` (CRT Phosphor Black).
    - *Card & Container Surfaces*: `#0F1523` / `#162035` (Arcade Console Blue-Black).
    - *Borders & Dividers*: `#1E2D4A` (Digital Grid Line).
    - *Accents & Highlights*: `#00F5D4` (Phosphor Cyan) & `#FFBE0B` (Coin Arcade Amber).
    - *Animasi Efek*: Lapisan garis scanline CRT statis ultra-ringan (CSS gradient opacity 4%) + 8 partikel bit piksel kotak yang berkelip santai (*pixel twinkle*).

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Arsitektur Animasi Berbasis CSS GPU vs HTML5 Canvas**:
  - *Pendekatan Terpilih*: Menggunakan elemen DOM terisolasi dengan animasi CSS `@keyframes` memanfaatkan `transform: translate3d(...)` dan `will-change: transform`.
  - *Alasan*: Pada HP berspesifikasi rendah, render loop Canvas `requestAnimationFrame` membebani memori dan baterai. CSS Compositor Thread dieksekusi langsung oleh GPU tanpa menyita *main thread* JavaScript aplikasi.
  - *Alternatif Ditolak*: Partikel JS Canvas dinamis (menimbulkan *garbage collection pauses* dan *battery drain*).

- **Keputusan 2: Pemetaan Warna Semantik Melalui Selector `data-theme`**:
  - *Pendekatan Terpilih*: Mendeklarasikan aturan spesifik di stylesheet global `src/index.css` di bawah atribut `html[data-theme="halloween"]` dan `html[data-theme="retro"]`.
  - *Alasan*: Menjamin seluruh modul yang ada (Film, Kalender, Nutrisi, Anabul, Catatan, Impian) langsung mewarisi warna tema baru secara konsisten tanpa merombak satu per satu file komponen.

---

### 4. Technical Architecture & System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       useStorage Hook (Preferences)                    │
│ • theme: 'light' | 'dark' | 'cinema' | 'romantic' | 'christmas'         │
│          | 'halloween' | 'retro'                                        │
│ • sinkronisasi data-theme attribute pada <html> dan class .dark         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐
│        Navigation & Profile Menu     │    │            App Layout Root           │
├──────────────────────────────────────┤    ├──────────────────────────────────────┤
│ • Swatch Halloween (#0D0914/#FF7518) │    │ {theme === 'halloween' &&            │
│ • Swatch Retro (#080B10/#00F5D4)     │    │    <HalloweenEffect />}              │
│ • Siklus tema cepat & icon indikator │    │ {theme === 'retro' &&                │
│                                      │    │    <RetroPixelEffect />}             │
└──────────────────────────────────────┘    └──────────────────┬───────────────────┘
                                                               │
                                                               ▼
                                            ┌──────────────────────────────────────┐
                                            │            Global CSS Tokens         │
                                            ├──────────────────────────────────────┤
                                            │ html[data-theme="halloween"] { ... } │
                                            │ html[data-theme="retro"] { ... }     │
                                            │ @keyframes ember-rise, bat-fly       │
                                            │ @keyframes pixel-twinkle, crt-drift  │
                                            └──────────────────────────────────────┘
```

- **Rencana Pengujian & Verifikasi**:
  1. Verifikasi transisi tema dari menu profil dan tombol siklus navigasi.
  2. Verifikasi keterbacaan teks dan kontras tombol di seluruh modul (Film, Catatan, Kalender, dll.).
  3. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tipe data TypeScript valid dan nihil error linting.
  4. Pengujian performa dev server dengan HTTP status 200.
