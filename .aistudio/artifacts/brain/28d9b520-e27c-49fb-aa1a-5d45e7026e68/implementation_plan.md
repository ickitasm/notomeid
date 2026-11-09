# Rencana Implementasi: Pembaruan Panel Profil & Halaman Penuh Pengaturan (Settings & Sync)

Menyesuaikan panel profil dengan baris ikon tema yang ringkas, mengubah popup Pengaturan menjadi halaman penuh mandiri dengan tombol navigasi kembali, merapikan Cloud Sync, menyederhanakan pemilih bahasa menjadi bendera, melengkapi 7 tema visual, serta memperbesar tipografi 5–10% untuk keterbacaan optimal.

---

## Status: Selesai & Terverifikasi ✅

Semua permintaan telah selesai diimplementasikan:
- [x] **Panel Profil - Tema Ikon**: Mengubah daftar tema di panel profil menjadi satu baris horizontal 7 ikon (`Sun`, `Moon`, `Film`, `Sparkles`, `Trees`, `Ghost`, `Gamepad2`) dengan *tooltip* nama tema dan indikator aktif.
- [x] **Halaman Penuh Pengaturan**: Mengubah dialog popup modal menjadi halaman penuh mandiri (`SettingsView.tsx`) dengan tombol *"Kembali ke [Modul Sebelumnya]"*.
- [x] **Pembersihan Cloud Sync**: Menghapus seksi *Schedule & Upcoming Alerts*, hanya menyisakan kartu *Cloud Sync Status* (status koneksi, deskripsi, dan tombol uji koneksi).
- [x] **Bahasa Tampilan Bendera Saja**: Menghapus teks *"Bahasa Indonesia"* dan *"English"*, menyisakan hanya bendera negara `🇮🇩` dan `🇬🇧` dengan area klik besar dan indikator terpilih.
- [x] **7 Tema Visual Lengkap di Pengaturan**: Menyelaraskan kartu *Application Visual Theme* dengan 7 tema (Warm Paper, Roast Dark, Cinema Velvet, Romantic Rose, Christmas Eve, Halloween Horror, Arcade 8-Bit).
- [x] **Preservasi Fungsionalitas**: Seluruh fungsi target nutrisi (kalori & gula), ekspor JSON, impor JSON, dan reset data tetap berjalan normal.
- [x] **Pembesaran Teks (+5-10%)**: Tipografi di panel profil dan di halaman pengaturan diperbesar 5–10% untuk kenyamanan membaca.

---

## 1. Overview & Core Concept

Pembaruan ini berfokus pada dua area inti pengalaman pengguna:
- **Panel Profil Ringkas & Ergonomis**: Penggantian daftar tombol tema bertulisan panjang menjadi satu baris 7 ikon representatif yang minimalis, disertai pembesaran teks 5–10% agar lebih nyaman dibaca dan diakses dengan jari.
- **Halaman Penuh Pengaturan & Sinkronisasi**: Mengubah interaksi pembukaan Pengaturan dari dialog modal kecil menjadi halaman editorial penuh yang lapang, mempertahankan seluruh fungsionalitas (target nutrisi, backup/restore JSON, reset data, koneksi cloud), menyederhanakan pilihan bahasa menjadi ikon bendera, menghapus peringatan jadwal yang tidak diperlukan, dan menampilkan 7 tema visual secara lengkap.

---

## 2. User Experience & Visual Design

### 2.1 Alur Navigasi & Tampilan Halaman Pengaturan

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP BAR NAVIGATION (Tetap Konsisten)                                  │
├────────────────────────────────────────────────────────────────────────┤
│ [← Kembali ke Catatan / Serial / dll]                                  │
│                                                                        │
│ PENGATURAN & SINKRONISASI                                              │
│ Kelola preferensi personal, integrasi cloud, dan cadangan data privat  │
│                                                                        │
│ ┌──────────────────────────┐  ┌─────────────────────────────────────┐  │
│ │ [Umum & Cadangan Data]   │  │ [Status Sinkronisasi Cloud]         │  │
│ └──────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                        │
│ 1. Bahasa Tampilan:                                                    │
│    [ 🇮🇩 ]    [ 🇬🇧 ]  (Hanya bendera, tanpa teks)                       │
│                                                                        │
│ 2. Tema Visual Aplikasi (7 Tema Lengkap):                              │
│    • Warm Paper     • Roast Dark      • Cinema Velvet                  │
│    • Romantic Rose  • Christmas Eve   • Halloween Horror               │
│    • Arcade 8-Bit                                                      │
│                                                                        │
│ 3. Target Dasar Nutrisi (Kalori & Batas Gula Harian)                  │
│ 4. Ekspor Cadangan JSON & Pemulihan Data Offline                       │
│ 5. Tindakan Bersihkan / Reset Data Bawaan                              │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Baris 7 Ikon Tema pada Panel Profil
Dalam menu *dropdown* profil, bagian pemilih tema ditata secara horizontal dengan 7 tombol ikon:
1. **Warm Paper (Light)**: Ikon `Sun` (`#C85A32`)
2. **Roast Dark (Dark)**: Ikon `Moon` (`#D9822B`)
3. **Cinema Velvet (Cinema)**: Ikon `Film` (`#E11D48`)
4. **Romantic Rose (Romantic)**: Ikon `Sparkles` (`#DB2777`)
5. **Christmas Eve (Christmas)**: Ikon `Trees` (`#DC2626`)
6. **Halloween Horror (Halloween)**: Ikon `Ghost` (`#FF7518`)
7. **Arcade 8-Bit (Retro)**: Ikon `Gamepad2` (`#00F5D4`)

Setiap ikon memiliki:
- *Hitbox* sentuh ramah jari ($\ge 40\times 40\text{px}$)
- *Ring highlight* dan warna latar pembeda saat sedang aktif
- Atribut `title` (tooltip bawaan peramban) dan label aksesibilitas untuk nama tema

### 2.3 Pembesaran Tipografi (+5% hingga 10%)
- **Panel Profil**:
  - Nama pengguna: `text-sm` $\rightarrow$ `text-[15px] sm:text-base`
  - Email: `text-xs` $\rightarrow$ `text-[13px]`
  - Badge verifikasi & admin: `text-[11px]` $\rightarrow$ `text-xs`
  - Tombol menu aksi: `text-xs` $\rightarrow$ `text-[13.5px] font-medium`
- **Halaman Pengaturan**:
  - Judul halaman & tab: `text-xl` / `text-2xl`
  - Label pengaturan, keterangan formulir, dan input teks: dinaikkan 1 tingkat ukuran standar (`text-xs` $\rightarrow$ `text-[13px]`, `text-sm` $\rightarrow$ `text-[15px]`)
