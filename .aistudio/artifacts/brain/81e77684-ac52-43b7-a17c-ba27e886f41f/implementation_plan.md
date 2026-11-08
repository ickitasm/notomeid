# [Integrasi Video Bumper Notomee Looping pada Layar Login]

Mengganti grid statis 6 modul pada halaman autentikasi/login (*AuthView*) dengan video animasi bumper Notomee (`/assets/aistudio/notomee_bumper__1__0f92ea37.mp4`) yang berputar secara berulang (*looping*), terbungkus dalam kartu berbingkai elegan dan proporsional.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Keputusan Suara**: Video akan dimulai secara otomatis (*autoplay*) dengan mode awal ramah peramban (tanpa blokir kebijakan *autoplay* iOS/Android), kemudian suara aktif setelah sentuhan/interaksi pertama pengguna, disertai tombol pengalih audio (*Mute / Unmute*) interaktif di sudut video.
> - **Format Bingkai**: Kartu elegan dengan sudut membulat (`rounded-2xl`), rasio proporsional 16:9 yang pas dengan resolusi video asli, border halus adaptif terhadap 5 tema, dan efek bayangan lembut.
> - **Penggantian Komponen**: Seluruh blok grid 6 kartu modul statis (*Cinema, Nutrition, Pets, Calendar, Notes, Dreams*) dihapus dan digantikan secara utuh oleh pemutar video bumper looping ini.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Mengubah tampilan landing page / login Notomee menjadi lebih dinamis, hidup, dan premium dengan menampilkan animasi transisi logo Notomee ke seluruh pilar kehidupan secara berulang.
- **Audiens Target**: Pengguna santuari personal yang membuka aplikasi melalui perangkat seluler (iPhone, Android, dan Tablet).
- **Nilai Utama**: Memperkenalkan seluruh pilar Notomee secara visual bergerak dan sinematik sebelum pengguna masuk ke santuari, menggantikan teks kartu statis yang monoton.

---

### 2. User Experience & Visual Design

- **Alur Interaksi Pengguna**:
  1. Pengguna membuka Notomee di ponsel/tablet.
  2. Video bumper Notomee langsung berputar mulus tanpa jeda (*infinite loop*), menampilkan urutan logo Notomee $\rightarrow$ bioskop $\rightarrow$ nutrisi $\rightarrow$ kesehatan hewan $\rightarrow$ kalender $\rightarrow$ catatan $\rightarrow$ mimpi $\rightarrow$ logo Notomee.
  3. Terdapat tombol kontrol audio kecil transparan di sudut kanan atas video (ikon speaker dengan status suara).
  4. Sentuhan pertama pengguna pada layar atau video langsung mengaktifkan audio yang kaya dan jernih.
  5. Pengguna dapat langsung menekan tombol Google Sign-In di kartu sebelah kanan untuk masuk ke aplikasi.

- **Identitas Visual & Penataan Komponen**:
  - **Kontainer Video**: Dibungkus dalam elemen kartu `<div className="relative rounded-2xl overflow-hidden border border-[#E4DCDB] dark:border-[#352F2B] bg-black/5 dark:bg-black/30 shadow-lg">`.
  - **Atribut Video**: `autoPlay`, `loop`, `playsInline`, `muted` (secara default agar lulus kebijakan peramban seluler, dapat di-unmute dengan satu sentuhan).
  - **Aspek Rasio**: `aspect-video` (16:9) yang selaras sempurna dengan dimensi rekaman video bumper Notomee asli.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Mekanisme Autoplay & Kebijakan Browser Seluler**:
  - *Pendekatan*: Menggunakan atribut `muted playsInline autoPlay loop` pada pemuatan awal, lalu mendengarkan interaksi pengguna pertama (`touchstart` / `click`) untuk mengaktifkan audio dan menyediakan tombol toggle suara manual.
  - *Alasan*: Kebijakan WebKit iOS dan Chromium Android akan secara otomatis menolak dan memblokir pemutaran video jika video mencoba memutar suara sebelum ada interaksi pengguna (*user gesture requirement*).
- **Keputusan 2: Penempatan Komponen**:
  - *Pendekatan*: Menggantikan secara spesifik elemen `<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">...</div>` di kolom kiri `AuthView.tsx`.
  - *Alasan*: Mempertahankan judul santuari (*headline*), deskripsi sambutan, dan kartu login Google OAuth di sisi kanan tetap utuh dan fungsional.

---

### 4. Technical Architecture & Component Structure

```
┌──────────────────────────────────────────────────────────┐
│                   AuthView (Landing/Login)               │
├────────────────────────────┬─────────────────────────────┤
│   Kolom Kiri (Brand Story) │  Kolom Kanan (Akses Akun)   │
│ ┌────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ Notomee Sanctuary Tag  │ │ │ Kartu Google OAuth      │ │
│ │ Headline & Subheadline │ │ │ Invite-Only Badge       │ │
│ ├────────────────────────┤ │ │ Tombol Masuk Google     │ │
│ │ [BARU] BumperVideoCard │ │ │ Verifikasi Email Notice │ │
│ │ - Video looping 16:9   │ │ └─────────────────────────┘ │
│ │ - Autoplay + unmuted   │ │                             │
│ │   on first interaction │ │                             │
│ │ - Mute / Unmute toggle │ │                             │
│ ├────────────────────────┤ │                             │
│ │ Guarantee Banner       │ │                             │
│ └────────────────────────┘ │                             │
└────────────────────────────┴─────────────────────────────┘
```

- **Komponen Target**: `src/components/Auth/BumperVideoCard.tsx` (baru) dan `src/components/Auth/AuthView.tsx` (modifikasi penggantian kartu).
- **Aset Video**: `/public/assets/aistudio/notomee_bumper__1__0f92ea37.mp4` (diakses via path lokal browser `/assets/aistudio/notomee_bumper__1__0f92ea37.mp4`).
