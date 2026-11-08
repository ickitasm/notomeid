# Rencana Implementasi: Tema Aplikasi "Christmas Eve"

Status: [x] Selesai & Terverifikasi

Tema visual baru yang damai dan elegan **Christmas Eve** telah berhasil ditambahkan ke dalam aplikasi Notome dengan palet warna *Deep Forest Pine*, *Holly Berry Red*, dan *Warm Gold*, dilengkapi efek partikel salju lembut berkinerja tinggi yang ramah perangkat low-end (no lag).

---

## 1. Analisis & Konsep Visual

### 1.1 Palet Warna Christmas Eve
- [x] **Background Utama**: Deep Forest Pine (`#071911`) — suasana malam musim dingin yang tenang dan hangat.
- [x] **Permukaan Kartu / Kontainer**: Elevated Forest Pine (`#0E231B` & `#143026`) dengan border subtle fir green (`#1F4737`).
- [x] **Warna Teks**:
  - Primary: Snow Cream (`#F2F7F4`) — kontras tajam namun lembut di mata.
  - Secondary/Muted: Frosted Mist / Sage (`#8FAFA0`).
- [x] **Aksen Khas Natal**:
  - Holly Berry Red (`#DC2626` & `#EF4444`) untuk tombol aksi primer, indikator penting, dan badge.
  - Warm Gold / Starlight Amber (`#D4AF37` / `#EAB308`) untuk highlight scrollbar dan aksen estetis.

### 1.2 Efek Salju Halus Ramah Performa (No-Lag)
- [x] Dibuat menggunakan komponen `<ChristmasSnowEffect />` berbasis **CSS Keyframes 100% GPU-accelerated** (`transform: translate3d`).
- [x] Zero-overhead: tidak menggunakan loop JavaScript / tick timer berat yang menguras baterai dan memicu frame drops di perangkat mobile low-end.
- [x] 15 partikel salju lembut deterministik dengan `pointer-events-none` sehingga interaksi sentuhan/klik pengguna tetap 100% responsif.
- [x] Mendukung `@media (prefers-reduced-motion: reduce)` untuk aksesibilitas.

---

## 2. Rincian Perubahan Kode yang Telah Diterapkan

### 2.1 Tipe Data (`src/types.ts`)
- [x] Memperbarui definisi `ThemeMode`:
  ```ts
  export type ThemeMode = 'light' | 'dark' | 'cinema' | 'romantic' | 'christmas';
  ```

### 2.2 Hook Penyimpanan & Siklus Tema (`src/hooks/useStorage.ts`)
- [x] Menambahkan `'christmas'` ke dalam array rotasi tema `toggleTheme`.
- [x] Menyertakan `'christmas'` dalam penambahan class `dark` pada elemen root `<html>` agar elemen modul tetap kontras dan harmonis.

### 2.3 Desain CSS Global (`src/index.css`)
- [x] Menambahkan blok CSS selektor `html[data-theme="christmas"]`:
  - Latar belakang body dan container (`#071911`, `#0E231B`, `#143026`).
  - Pewarnaan border khas pinus gelap (`#1F4737`).
  - Override teks menjadi Snow Cream dan Sage.
  - Aksen primer holly berry red (`#DC2626`) dan gold scrollbar (`rgba(212, 175, 55, 0.28)`).
  - Animasi `@keyframes snowfall` dan class `.snow-particle`.

### 2.4 Komponen Efek Salju (`src/components/ChristmasSnowEffect.tsx`)
- [x] Komponen mandiri yang me-render partikel salju secara terisolasi saat tema `christmas` aktif.
- [x] Terpasang di root aplikasi `App.tsx` dan `AuthView.tsx`.

### 2.5 Navigasi & Pemilih Tema Cepat (`src/components/Navigation.tsx`)
- [x] Menambahkan tema `christmas` ke dalam `themesList`:
  - `labelId: 'Christmas Eve'`, `labelEn: 'Christmas Eve'`
  - `bgDot: '#071911'`, `accentDot: '#DC2626'`
- [x] Menambahkan ikon pohon cemara (`Trees`) warna emerald lembut pada tombol rotasi tema.
- [x] Memperbarui dropdown profil dengan kartu tema Christmas Eve lengkap dengan badge Festive.

### 2.6 Modal Pengaturan (`src/components/SettingsModal.tsx`)
- [x] Menambahkan opsi kartu tema `Christmas Eve` ke dalam grid pilihan tema di Pengaturan (General Tab):
  - Nama: `Christmas Eve`
  - Subteks: `Malam Natal & Pinus` (ID) / `Festive Pine & Berry` (EN)
  - Pratinjau warna: lingkaran latar pinus gelap dengan titik berry red.

### 2.7 Halaman Login / Auth (`src/components/Auth/AuthView.tsx`)
- [x] Mendukung tema Christmas Eve dan efek partikel salju lembut di halaman autentikasi.

---

## 3. Hasil Verifikasi

- **TypeScript Compilation (`compile_applet`)**: Succeeded tanpa error.
- **Linter (`lint_applet`)**: Succeeded tanpa error.
- **Dev Server**: Telah direstart dan melayani versi terbaru secara optimal.
