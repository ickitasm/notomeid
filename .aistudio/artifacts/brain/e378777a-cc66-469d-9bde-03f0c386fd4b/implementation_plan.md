# Tombol Notifikasi Kalender Terintegrasi di Header

Implementasi tombol notifikasi terpusat pada bilah navigasi header yang selalu dapat diakses di ponsel maupun desktop, menampilkan seluruh jadwal dan agenda dari semua fitur yang terintegrasi dengan kalender dalam rentang waktu 7 hari ke depan (minggu ini).

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Visibilitas Seluler Penuh**: Tombol lonceng notifikasi dipindahkan dari blok yang sebelumnya disembunyikan di HP (`hidden md:flex`) ke area aksi utama header yang selalu terlihat di samping tombol bahasa (`ID/EN`).
> - **Rentang Waktu Notifikasi**: Menampilkan acara hingga **7 hari ke depan (minggu ini)** sesuai jawaban pengguna, mengelompokkan acara berdasarkan: *Hari Ini*, *Besok*, dan *Mendatang (2–7 hari lagi)*.
> - **Desain Popover Ringkas**: Tampilan dropdown muncul tepat di bawah tombol lonceng header (`origin-top-right w-80 sm:w-96 max-w-[92vw]`) dengan efek kaca lembut (*backdrop blur*), lencana jumlah acara belum dibaca (*unread badge*), dan scroll halus.
> - **Cakupan Integrasi Kalender Lengkap**:
>   1. **Kalender Utama**: Agenda dan janji temu kustom pengguna (*General, Personal, Health, Work*).
>   2. **Film & Serial TV**: Jadwal sesi menonton film (*movie night*) dan tanggal rilis premiere.
>   3. **Kesehatan Hewan**: Tenggat vaksinasi (*booster due*) dan jadwal konsultasi klinik dokter hewan.

- **Keputusan 1**: Rentang waktu 7 hari ke depan (minggu ini) diterapkan pada kalkulasi notifikasi di `App.tsx`.
- **Keputusan 2**: Popover dropdown ringkas tepat di bawah lonceng header dioptimalkan untuk layar sentuh HP dan kursor desktop.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Memungkinkan pengguna melihat ringkasan seluruh komitmen waktu dan jadwal hidup mereka dalam satu panel sentral yang dapat dibuka kapan saja melalui bilah navigasi atas tanpa harus berpindah halaman.
- **Audiens Target**: Pengguna santuari Notome di ponsel, tablet, dan komputer.
- **Nilai Utama**: Tidak ada jadwal penting yang terlewat, baik agenda harian pribadi, jadwal tayang serial favorit, maupun vaksin anabul tersayang.

---

### 2. User Experience & Visual Design

- **Alur Interaksi Pengguna**:
  1. Pengguna melihat tombol lonceng di header atas (di samping tombol bahasa). Jika ada acara dalam 7 hari ke depan, terdapat dot/lencana indikator jumlah acara.
  2. Mengetuk tombol lonceng membuka dropdown popover berbingkai elegan tepat di bawah ikon lonceng.
  3. Acara dikelompokkan secara hierarkis:
     - 🔴 **Hari Ini**: Acara darurat / hari H.
     - 🟠 **Besok (H-1)**: Persiapan satu hari sebelumnya.
     - 🟡 **Minggu Ini (2–7 Hari)**: Pratinjau minggu berjalan.
  4. Setiap kartu notifikasi menampilkan:
     - Ikon & warna pilar (Kamera untuk Film, Stetoskop untuk Hewan, Kalender untuk Agenda).
     - Judul acara, tanggal, jam (jika ada), dan deskripsi singkat.
     - Tombol 1-klik sinkronisasi instan ke Google Calendar HP/Android.
     - Tombol tutup/abaikan (*dismiss*).
  5. Pengguna dapat mengetuk luar popover atau tombol tutup untuk menutup kembali panel.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Letak Tombol di Header**:
  - *Pendekatan*: Menempatkan tombol lonceng tepat di samping tombol bahasa `[ID/EN]` dan tombol tema, sehingga di layar HP yang sempit tetap proporsional dan tidak memakan ruang logo.
  - *Alasan*: Menjamin konsistensi posisi di semua resolusi layar seluler.
- **Keputusan 2: Navigasi dan Filter Sumber**:
  - *Pendekatan*: Mengagregasi data dari 3 sumber reaktif (`mediaItems`, `medicalRecords`, `calendarEvents`) secara langsung melalui memo hook dengan window `maxDaysAhead = 7`.
  - *Alasan*: Menjaga performa tetap instan tanpa query jaringan tambahan, reaktif terhadap setiap penambahan atau perubahan data baru.

---

### 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                      Navigation.tsx (Header Bar)                │
├────────────────────────────────┬────────────────────────────────┤
│ Brand Logo (Notomee)           │ Header Actions (Mobile & Desk) │
│                                │ • Tombol Bahasa (ID/EN)        │
│                                │ • [UPDATE] Lonceng Notifikasi  │
│                                │ • Ganti Tema & Menu Profil     │
└────────────────────────────────┴────────────────┬───────────────┘
                                                  │ (klik lonceng)
                                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                 NotificationPanel.tsx (Popover Ringkas)         │
├─────────────────────────────────────────────────────────────────┤
│ Header: Notifikasi Kalender Terpadu (Minggu Ini: 7 Hari)       │
├─────────────────────────────────────────────────────────────────┤
│ Daftar Acara (Urut Hari Ini -> Besok -> Minggu Ini):           │
│ • [Film] Movie Night: Blade Runner 2049 (Besok 20:00)          │
│ • [Hewan] Mochi: Vaksin Rabies Booster (3 hari lagi)            │
│ • [Agenda] Meeting Evaluasi Bulanan (5 hari lagi 14:00)         │
├─────────────────────────────────────────────────────────────────┤
│ Tombol Aksi: Tambah ke Google Calendar & Dismiss                │
└─────────────────────────────────────────────────────────────────┘
```

- **Komponen yang Dimodifikasi**:
  1. `src/App.tsx`: Ubah parameter `getUpcomingAlerts` dari `3` menjadi `7` hari.
  2. `src/components/Navigation.tsx`: Pindahkan `NotificationPanel` keluar dari pembungkus `hidden md:flex` agar selalu tampil di semua ukuran layar di sebelah tombol bahasa.
  3. `src/components/Notifications/NotificationPanel.tsx`:
     - Perbarui teks dan label (bahasa Indonesia & Inggris).
     - Optimalkan posisi dropdown popover (`right-0 mt-2`) agar tidak terpotong di tepi layar HP.
     - Tampilkan badge pengelompokan waktu (Hari Ini, Besok, Minggu Ini).
