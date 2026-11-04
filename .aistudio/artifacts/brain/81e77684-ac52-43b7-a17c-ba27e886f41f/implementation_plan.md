# Rencana Implementasi: Dialog Konfirmasi Hapus Terpusat, Reset Data Masif Terproteksi, & Optimasi Responsivitas Ponsel

Rencana terperinci untuk menambahkan sistem konfirmasi hapus terpusat di seluruh modul konten, pengamanan reset data masif dengan verifikasi ketik kata kunci ("HAPUS"), serta perbaikan menyeluruh responsivitas mobile (Android & iPhone) mencakup bilah navigasi bawah, area sentuh ergonomis $\ge 44\text{px}$, dan form modal responsif.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi oleh pengguna:
> 1. **Gaya Konfirmasi Hapus**: Dialog modal terpusat di tengah layar (*centered modal*) dengan tombol Batal dan tombol Hapus merah tegas, menggantikan penghapusan instan maupun `window.confirm` bawaan.
> 2. **Sistem Pengamanan Reset Data**: Pengguna diwajibkan mengetik kata konfirmasi **`HAPUS`** (atau **`DELETE`** dalam mode bahasa Inggris) sebelum tombol eksekusi reset data masif menjadi aktif.
> 3. **Fokus Responsivitas Mobile**: Optimasi bilah menu bawah (bottom navigation), ruang aman sentuh (*touch safe areas & thumb zones*), dan penyesuaian semua form modal pada layar Android dan iPhone (375px–430px).

---

## 1. Overview & Core Concept

### A. Dialog Konfirmasi Hapus Universal (`ConfirmDeleteModal.tsx`)
- Komponen dialog modal mandiri di tengah layar dengan animasi lembut (*backdrop blur*).
- Menampilkan ikon peringatan, judul spesifik, nama item yang hendak dihapus (misal: *"Hapus film Severance?"*), serta penjelasan konsekuensi.
- Memiliki dua tombol aksi sentuh nyaman: **Batal** dan **Hapus Secara Permanen**.
- Diimplementasikan seragam di seluruh modul:
  1. *Cinema & Series*: Hapus item film / serial.
  2. *Nutrition*: Hapus entri makanan / meal log.
  3. *Pets*: Hapus profil hewan, rekam medis vaksin/klinik, dan jadwal obat.
  4. *Master Calendar*: Hapus agenda / event kalender.
  5. *Notes*: Hapus catatan dan footnote.
  6. *Dream Catcher*: Hapus rekaman mimpi.

### B. Proteksi Reset Data Masif (`MassiveResetModal.tsx`)
- Terintegrasi di dalam modal pengaturan (**SettingsModal**).
- Memberikan peringatan tegas: penghapusan masif akan menghapus seluruh data lokal di perangkat pengguna.
- Input proteksi: Tombol merah konfirmasi dinonaktifkan (*disabled*) hingga pengguna mengetik kata sandi konfirmasi: **`HAPUS`** (Bahasa Indonesia) atau **`DELETE`** (English).
- Dua mode reset:
  - **Bersihkan Total**: Menghapus seluruh `localStorage` menjadi kosong.
  - **Reset ke Data Awal**: Mengembalikan ke seed data Notome.

### C. Optimasi Responsivitas Mobile (Android & iPhone)
- **Bilah Bawah Mobile (`Navigation.tsx`)**:
  - Penataan 6 tab agar tidak berdesakan di layar 375px–390px (iPhone SE, iPhone 13/14/15/16, Samsung Galaxy).
  - Menggunakan layout bar ergonomis dengan padding aman (`safe-area-pb` & `min-h-[44px]`).
  - Penambahan ruang bawah pada konten utama (`pb-28`) agar kartu paling bawah tidak tertutup oleh bilah navigasi.
- **Form Modals Responsif**:
  - Penggunaan tinggi dinamis `max-h-[85dvh]` dengan scroll vertikal mulus.
  - Tombol aksi simpan/batal mudah dijangkau ibu jari di bagian bawah modal.
- **Tipografi & Grid**:
  - Penyesuaian grid 1 kolom di layar mobile dan transisi ke 2-3 kolom di tablet & desktop.
  - Penggunaan angka tabular (`tabular-nums`) untuk metrik nutrisi dan mimpi agar tidak layout-shift.

---

## 2. Technical Architecture & Component Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Notome User Interface                      │
│   [Media]   [Nutrition]   [Pets]   [Calendar]  [Notes] [Dreams] │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Klik icon sampah (Delete)
                                ▼
              ┌───────────────────────────────────┐
              │     ConfirmDeleteModal.tsx        │
              │  (Dialog Konfirmasi di Tengah)    │
              │                                   │
              │  "Hapus [Nama Item]?"             │
              │  [Batal]        [Hapus Permanen]  │
              └─────────────────┬─────────────────┘
                                │ Konfirmasi Ya
                                ▼
              ┌───────────────────────────────────┐
              │           useStorage()            │
              │  • deleteMediaItem()              │
              │  • deleteMealFromDate()           │
              │  • deletePet() / Medical / Meds   │
              │  • deleteCalendarEvent()          │
              │  • deleteNote()                   │
              │  • deleteDreamLog()               │
              └───────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Settings & Data Management                    │
│                 [Bersihkan / Reset Data Masif]                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ Klik Reset Masif
                                ▼
              ┌───────────────────────────────────┐
              │      MassiveResetModal.tsx        │
              │                                   │
              │  Peringatan Kehilangan Data       │
              │  Ketik "HAPUS" untuk verifikasi:  │
              │  [ Input Text: H A P U S ]        │
              │                                   │
              │  [Batal]   [Reset Bersih Masif]   │
              └─────────────────┬─────────────────┘
                                │ Validasi cocok
                                ▼
              ┌───────────────────────────────────┐
              │   storage.clearAllData(mode)      │
              │   localStorage.clear()            │
              └───────────────────────────────────┘
```

---

## 3. Implementation Steps

1. **Komponen Modal Universal**:
   - Buat `src/components/Common/ConfirmDeleteModal.tsx` dengan desain warm editorial, animasi fade-in, backdrop blur, dan tombol sentuh $\ge 44\text{px}$.
   - Buat `src/components/Settings/MassiveResetModal.tsx` dengan verifikasi pengetikan kata kunci `HAPUS` / `DELETE` dan pilihan reset bersih vs reset ke template.
2. **Integrasi ke Seluruh Modul Konten**:
   - **MediaView**: Ganti pemanggilan `onDeleteItem` langsung dengan pemunculan `ConfirmDeleteModal`.
   - **NutritionView**: Ganti pemanggilan `onDeleteMeal` dengan `ConfirmDeleteModal`.
   - **PetView**: Integrasikan `ConfirmDeleteModal` saat menghapus profil pet, catatan medis vaksin/klinik, maupun obat aktif.
   - **MasterCalendarView**: Tambahkan konfirmasi modal saat menghapus agenda kalender.
   - **NotesView & NoteCard**: Hubungkan trigger hapus ke modal konfirmasi terpusat.
   - **DreamCatcherView & DreamCard**: Hubungkan trigger hapus mimpi ke modal konfirmasi terpusat.
3. **Penyempurnaan Reset Data Masif (`useStorage.ts` & `SettingsModal.tsx`)**:
   - Tambahkan fungsi `clearAllData(cleanWipe: boolean)` di `useStorage.ts` yang mampu membersihkan seluruh data tanpa sisa atau mengembalikan ke seed.
   - Pasang `MassiveResetModal` pada tombol "Hapus / Bersihkan Data" di `SettingsModal.tsx`.
4. **Optimasi Responsivitas Android & iPhone**:
   - Di `Navigation.tsx`: Rancang bilah menu mobile 6 tab dengan visual ringkas, label text-[9px] kontras, dan touch hitbox yang lega.
   - Di `App.tsx`: Pastikan padding bawah `pb-28 md:pb-8` agar tidak tertutup thumb navigation bar di perangkat iOS Safari dan Android Chrome.
   - Di seluruh modal (`*Modal.tsx`): Terapkan `max-h-[88dvh]`, `overflow-y-auto`, dan tata letak tombol aksi yang pas di layar kecil tanpa terpotong.
5. **Penyelesaian Isu White Screen pada Pengaturan & Sinkronisasi**:
   - **Root Cause**: Terjadi pelanggaran aturan hooks React (*Rules of Hooks violation*) di dalam `SettingsModal.tsx`. Terdapat hook `useState` (`isMassiveResetOpen`) yang dipanggil setelah *early return* `if (!isOpen) return null;`. Ketika modal dibuka, jumlah hooks yang dieksekusi bertambah dan memicu unhandled React error (*rendered more hooks than during previous render*) yang menyebabkan tampilan menjadi blank putih (*white screen*).
   - **Solusi**: Seluruh hooks (`useState`, `useRef`, `useEffect`) dipindahkan ke level teratas sebelum `if (!isOpen) return null;`.
   - **Safety & Sinkronisasi**: Menambahkan sinkronisasi state `calorieGoal` dan `sugarLimit` setiap kali modal dibuka, serta penjagaan *fallback safe defaults* untuk objek `preferences` dan kamus translasi.
6. **Optimasi Responsivitas Desktop & Tablet (`Navigation.tsx` & Layouts)**:
   - Header navigasi desktop menggunakan label adaptif: di layar tablet & laptop (`md` hingga `lg`), bilah navigasi atas menampilkan label ringkas (`shortLabel`: Film, Nutrisi, Hewan, Kalender, Catatan, Mimpi) agar tidak bertabrakan dengan brand wordmark dan utility tools.
   - Di monitor desktop lebar (`xl:` $\ge 1280\text{px}$), bilah navigasi otomatis menampilkan nama lengkap modul (`label`).
   - Tombol "Pengaturan & Sinkronisasi" dan "Panel Admin" adaptif dengan teks pendek di layar menengah dan teks penuh di layar desktop.
   - Form modal diperluas ke `max-w-xl` di desktop dengan efek *backdrop blur*, penutupan dengan tombol Escape (*keyboard accessibility*), dan pemusatan vertikal/horizontal seimbang.
7. **Verifikasi & Build**:
   - Menjalankan `lint_applet` (`tsc --noEmit`) dan `compile_applet` (`npm run build`) dengan status berhasil 100%.
