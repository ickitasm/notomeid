# Rencana Desain & Optimasi Khusus Mobile (Android & iPhone)

Mendefinisikan arsitektur antarmuka dan pengalaman pengguna (UX) terfokus mobile (*touch-first mobile web application*) untuk Notome di perangkat Android dan iPhone, merapikan kepadatan bilah atas, menata kalender mini dengan sistem tab adaptif, serta mengonsolidasi bingkai kontainer mobile yang proporsional.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Pengguna yang Telah Dikonfirmasi (Fase 1):**
> 1. **Penyederhanaan Bilah Atas (Header Mobile)**: Tampilkan hanya logo Notome, pemilih bahasa (`ID`/`EN`), dan avatar profil di bilah atas. Ikon utilitas sekunder (Notifikasi, Mode Gelap/Terang, Log Update, Pengaturan, dan Panel Admin) dipindahkan ke dalam laci menu profil (*profile drawer*) yang lapang dan sentuh-ramah (*touch-friendly*).
> 2. **Penataan Kalender Mini & Jadwal**: Mengganti penumpukan vertikal kalender di bawah daftar konten dengan **sistem beralih tab segmen mobile** (misal: `[🎬 Daftar Tayangan]` vs `[📅 Kalender Nonton]`). Pengguna dapat beralih dengan 1 sentuhan tanpa harus menggulir jauh ke bagian bawah layar.
> 3. **Format Lebar Tampilan Utama**: Mengadopsi **bingkai aplikasi mobile terpusat** (`max-w-md sm:max-w-lg`) yang ramping dan ergonomis di semua layar, memberikan kenyamanan genggam optimal dengan safe area atas dan bawah.

---

## 1. Overview & Core Concept

- **Tujuan Utama**: Mengubah pengalaman Notome dari situs bergaya desktop yang dipaksa responsif menjadi **aplikasi web mobile murni (Mobile Web App Experience)** yang mulus, ringan, dan pas di genggaman satu tangan pada ponsel Android dan iPhone.
- **Masalah yang Diatasi**:
  - Bilah atas (*header*) di layar ponsel sebelumnya memuat 7 ikon horizontal berjejer (`Logo`, `ID`, `Lonceng`, `Matahari/Bulan`, `Admin`, `Log Update`, `Pengaturan`, `Avatar`) yang menyebabkan tabrakan visual dan desakan horizontal di layar sempit.
  - Di modul Film, Nutrisi, dan Hewan, kalender mini dan jadwal bertumpuk di paling bawah layar setelah daftar item yang panjang, membuat navigasi tanggal tersembunyi dan tidak seimbang.
  - Footer bertingkat bergaya desktop yang memenuhi layar bawah di atas bilah navigasi jempol (*thumb navigation bar*).
- **Nilai Bagi Pengguna**: Pengalaman visual tenang, bersih, dengan target sentuh minimal 44px–48px dan pemanfaatan vertikal layar ponsel yang efisien.

---

## 2. User Experience & Visual Design

### Key User Flows & Penataan Tata Letak Mobile

```
[ ANATOMI LAYAR MOBILE NOTOME ]

+---------------------------------------------------+
|  [N] Notome                  [🌐 ID]  [(M) Profil] |  <- Header Ramping (52px)
+---------------------------------------------------+
|  [ SUB-VIEW TABS:  🎬 Koleksi  |  📅 Kalender   ]  |  <- Switcher Segmen Praktis
+---------------------------------------------------+
|                                                   |
|   • Konten Aktif Terpilih                         |
|   • Kartu Ringkasan KPI (Grid 2 Kolom Kompak)     |
|   • Formulir & Kartu Konten Proporsional          |  <- Zona Gulir Nyaman
|   • Ruang Kosong Bernapas (Padding seimbang)      |
|                                                   |
+---------------------------------------------------+
|  [ 🎬 ]  [ 🍽️ ]  [ 🐾 ]  [ 📅 ]  [ 📝 ]  [ 🌙 ]   |  <- Bilah Navigasi Bawah
|  Film    Nutrisi  Hewan   Kalender Catatan Mimpi  |     (Zona Sentuh Jempol)
+---------------------------------------------------+
```

### Visual Identity & Theme Tokens

- **Aesthetic Direction**: *Warm Editorial Japanese Minimalism* dipadukan dengan kenyamanan *Native Mobile App*.
- **Warna & Kontras**:
  - Latar Belakang: `#FAF7F2` (Hangat Krem) / `#161311` (Roast Espresso Gelap).
  - Aksen Primer: Terracotta Notome `#C85A32`, Forest Olive `#5B7A58`, Honey Amber `#D9822B`, Indigo `#6366F1`.
  - Garis Pemisah: Hairline halus (`border-[#E5DDD2]` / `border-[#2D2722]`), membuang efek bayangan berat yang memadati layar kecil.
- **Tipografi & Skala Teks Mobile**:
  - Ukuran dasar HTML dinormalisasi ke `16px` (skala standar browser mobile untuk mencegah auto-zoom iOS Safari saat fokus input).
  - Teks metadata menggunakan tipografi tak berkotak (*unboxed text*) dengan pemisah `·`, menjaga kebersihan visual kartu.
- **Ergonomi Sentuh (Thumb-Zone & Safe Areas)**:
  - Header tetap (*sticky top*) dengan tinggi pas 52px–54px.
  - Bilah navigasi bawah (*bottom bar*) memiliki tinggi 64px dengan `pb-safe` untuk perangkat bertakik (iPhone Home Indicator).
  - Padding bawah kontainer utama disesuaikan (`pb-24`) agar konten terbawah tidak tertutup bilah navigasi.

---

## 3. Key Product Decisions & Trade-Offs

### Keputusan 1: Restrukturisasi Bilah Atas Mobile (Streamlined Header)
- **Pendekatan Terpilih**: Header mobile hanya mempertahankan elemen identitas dan navigasi akun utama: Brand Logo `[N] Notome`, Tombol Bahasa Cepat `[🌐 ID/EN]`, dan Avatar `[(M)]`.
- **Lokasi Utilitas Sekunder**:
  - Tombol **Mode Gelap/Terang**, **Log Pembaruan**, **Pengaturan & Sinkronisasi**, **Panel Admin** (jika Primary Admin), dan **Notifikasi** dikelompokkan ke dalam dropdown menu profil yang terbuka ke bawah dengan padding dan ikon yang besar serta mudah disentuh.
- **Alasan**: Menghilangkan 100% risiko ikon berhimpitan atau teks terpotong di layar ponsel Android (resolusi 360px–412px) maupun iPhone (375px–393px).

### Keputusan 2: Tab Segmen Pengganti Stack Kalender Vertikal (Adaptive View Switcher)
- **Pendekatan Terpilih**:
  - **Media View**: Pengguna memilih antara tab `[🎬 Daftar Tayangan]` atau `[📅 Kalender Nonton]`.
  - **Nutrition View**: Pengguna memilih antara tab `[🍽️ Log Makanan]` atau `[📅 Kalender & Tren Nutrisi]`.
  - **Pet View**: Pengguna memilih antara tab `[📋 Linimasa Medis]` atau `[📅 Jadwal Dokter & Vaksin]`.
- **Alasan**: Menghilangkan masalah di mana kalender terdorong ke dasar halaman setelah puluhan item daftar makanan atau serial TV, sekaligus membuat pengalaman navigasi terasa instan layaknya aplikasi mobile native.

### Keputusan 3: Bingkai Kontainer & Penataan Footer
- **Pendekatan Terpilih**:
  - Seluruh layout utama dibungkus dalam kontainer berukuran `max-w-md sm:max-w-lg mx-auto w-full px-4 pt-4 pb-24`.
  - Menghapus footer teks bergaya desktop yang berulang di layar mobile, cukup menyisakan catatan hak cipta minimal di dalam menu pengaturan agar ruang gulir ponsel tetap maksimal.

---

## 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────┐
│                        App.tsx                         │
│   (State & Auth, Preferences, Theme, Storage Hook)     │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            ▼                                ▼
┌───────────────────────┐        ┌───────────────────────┐
│     Navigation.tsx    │        │  Mobile App Shell     │
│  - Clean Mobile Bar   │        │  (max-w-md / lg)      │
│  - Profile Action Menu│        └───────────┬───────────┘
│  - Bottom Tab Anchor  │                    │
└───────────────────────┘                    ▼
                     ┌───────────────────────────────────────┐
                     │ Active Mobile View Controller         │
                     │  ├─ MediaView (Segment Switcher)      │
                     │  ├─ NutritionView (Segment Switcher)  │
                     │  ├─ PetView (Segment Switcher)        │
                     │  ├─ MasterCalendarView (Mobile Grid)  │
                     │  ├─ NotesView (Touch List)            │
                     │  └─ DreamCatcherView (KPI + Cards)    │
                     └───────────────────────────────────────┘
```

### Rencana File & Modifikasi:
1. `src/components/Navigation.tsx`:
   - Memodifikasi baris header pada breakpoint mobile: hanya menampilkan Brand, Switcher Bahasa, dan Profil Avatar.
   - Mengintegrasikan toggle tema, log pembaruan, panel admin, dan pengaturan ke dalam popover menu profil yang lega.
2. `src/App.tsx`:
   - Menyesuaikan kontainer `<main>` menjadi format mobile shell (`max-w-md sm:max-w-lg mx-auto px-4 py-4 pb-28`).
   - Menyederhanakan footer agar tidak memakan ruang gulir mobile di atas bilah bawah.
3. `src/components/MediaTracker/MediaView.tsx`:
   - Menambahkan switch segmen tab `['list', 'calendar']` untuk mobile view.
4. `src/components/NutritionTracker/NutritionView.tsx`:
   - Menambahkan switch segmen tab `['meals', 'calendar']` untuk mobile view.
5. `src/components/PetTracker/PetView.tsx`:
   - Menambahkan switch segmen tab `['records', 'calendar']` untuk mobile view.
6. `src/index.css`:
   - Memastikan font root HTML stabil pada `16px` di mobile viewport agar proporsional dan tidak memicu pergeseran layout.
