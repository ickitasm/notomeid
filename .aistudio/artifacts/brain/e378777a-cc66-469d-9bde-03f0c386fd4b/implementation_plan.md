# Modifikasi Antarmuka Modul Film & Serial TV

Peningkatan ergonomi dan interaksi pada modul pelacakan Film & Serial: header editorial baru dengan judul multiline, tombol melayang (FAB) di sudut kanan bawah, perbaikan input angka pada form modal, tombol decrement episode `[-]`, dan fitur catatan durasi sekilas (jam, menit, detik) langsung pada kartu media.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Desain Tombol Tambah Melayang (FAB)**: Tombol `+ Tambah Film/Serial` di header atas dihapus dan dialihkan menjadi tombol bulat besar melayang (*floating action button*) di sudut kanan bawah dengan ikon `Film`. Posisi `fixed` menempel nyaman di atas bilah navigasi seluler dan desktop (`bottom-24 right-5 sm:bottom-8 sm:right-8 z-30`).
> - **Catatan Durasi Sekilas Langsung di Kartu**: Tersedia tombol durasi berikon jam (*Clock*) langsung di tiap kartu media yang sudah dibuat. Menekan tombol membuka panel popup/inline ringkas untuk mengisi atau memperbarui Jam, Menit, dan Detik (misal: *01:45:30*) tanpa perlu masuk ke form modal edit yang berat.
> - **Perbaikan Controlled Input Numerik**: Input angka (*rating, season, episode*) pada `MediaModal.tsx` dirombak agar mengizinkan nilai string kosong (`""`) saat pengguna menekan tombol *backspace*, sehingga angka dapat dihapus sepenuhnya tanpa langsung memaksakan angka `0` atau `1`.
> - **Tombol Kurang Episode `[-]`**: Diletakkan tepat di sebelah kiri tombol `+1 Episode` pada kartu serial TV dengan fungsi aman (*minimum 0, mengembalikan status dari completed jika berkurang*).

- **Keputusan 1**: Tombol FAB berdesain bulat besar dengan bayangan elegan dan aksen terakota Notome.
- **Keputusan 2**: Input durasi jam/menit/detik diletakkan langsung di kartu media untuk catatan sekilas.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Memperbaiki alur pencatatan film dan serial TV dengan mengutamakan kecepatan aksi: menambah entri melalui tombol melayang yang selalu dapat dijangkau di layar mana pun, mengurangi atau menambah episode dengan 1 sentuhan, mengedit angka tanpa hambatan kursor, dan mencatat durasi waktu tonton sekilas.
- **Audiens Target**: Pengguna santuari Notome yang aktif mencatat film dan serial di perangkat seluler maupun desktop.
- **Nilai Utama**: Menghilangkan gesekan (*friction*) input angka, mempermudah koreksi episode salah klik dengan tombol minus, dan memberikan tombol aksi utama yang selalu terlihat saat menggulir daftar film yang panjang.

---

### 2. User Experience & Visual Design

- **Alur Interaksi Pengguna**:
  1. Pengguna membuka tab Film & Serial.
  2. Di bagian atas, header tampil bersih tanpa tag *KATALOG HIBURAN PRIBADI*, menampilkan judul multiline editorial:
     - **Catat**
     - **Film,**
     - **Serial.**
  3. Saat pengguna menggulir katalog ke bawah, tombol bulat besar berikon `Film` tetap melayang di pojok kanan bawah (`fixed`). Menekannya langsung memunculkan modal tambah entri baru.
  4. Pada kartu serial TV, di sebelah kiri tombol `+1 Episode`, kini terdapat tombol pendamping `[-]` berukuran serasi untuk mengurangi episode jika pengguna ingin merevisi progres.
  5. Pada kartu film maupun serial, terdapat tombol sekilas durasi `[ ⏱ --:--:-- ]` atau `[ ⏱ 01:45:20 ]`. Pengguna dapat mengklik untuk membuka dialog ringkas memasukkan Jam, Menit, dan Detik secara instan.
  6. Saat membuka modal edit, pengguna dapat leluasa menghapus angka season, episode, atau rating tanpa terganjal angka `0` atau kursor yang melompat.

- **Penataan Gaya & Ergonomi**:
  - **Judul Header**: `font-serif text-3xl sm:text-4xl font-bold text-[#2B241E] dark:text-[#EFE9E2]` dengan jeda baris visual yang rapi.
  - **FAB Kanan Bawah**: Tombol bulat `w-14 h-14 rounded-full bg-[#C85A32] text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer fixed z-30 bottom-24 right-5 sm:bottom-8 sm:right-8`.
  - **Tombol Step Episode**: Grid horizontal harmonis `[ - ] [ +1 Episode ]` di bawah progress bar.
  - **Durasi Sekilas**: Badge interaktif bernuansa monospaced lembut dengan ikon jam.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Mekanisme State Input Angka**:
  - *Pendekatan*: Mengubah state input modal dari `number` murni menjadi `number | string` selama pengeditan, lalu mengonversi kembali ke `Number` saat form disubmit.
  - *Alasan*: Menghilangkan bug `parseInt(e.target.value) || 0` yang menyebabkan input angka tidak bisa dikosongkan dengan tombol backspace.
- **Keputusan 2: Durasi Sekilas Disimpan pada Objek MediaItem**:
  - *Pendekatan*: Menambahkan kolom opsional `durationNotes?: { hours: number; minutes: number; seconds: number }` pada tipe `MediaItem`.
  - *Alasan*: Memungkinkan data durasi tersimpan secara persisten baik di penyimpanan lokal (*localStorage*) maupun Supabase Cloud Sync tanpa merusak skema lama.

---

### 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                    MediaView.tsx (Katalog Film)                 │
├─────────────────────────────────────────────────────────────────┤
│ [UPDATE] Header: Judul Multiline (Catat / Film, / Serial.)      │
│ [HAPUS] Tag "KATALOG HIBURAN PRIBADI" & Tombol Tambah Header    │
├─────────────────────────────────────────────────────────────────┤
│ Daftar Kartu Media (Film & Serial)                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Kartu Media                                                 │ │
│ │ • Catatan Durasi Sekilas [ ⏱ 01:25:00 ] (Interactive Modal)  │ │
│ │ • Kontrol Episode: [ - ]  [ +1 Episode ]                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ [BARU] Floating Action Button (FAB) Melayang di Kanan Bawah     │
│ • Fixed bottom-24 right-5 (Mobile Safe-Area)                   │
│ • Ikon Film besar, memicu openModal()                           │
└─────────────────────────────────────────────────────────────────┘
```

- **Komponen yang Dimodifikasi**:
  1. `src/types.ts`: Menambahkan kolom `durationNotes?: { hours: number; minutes: number; seconds: number }` ke dalam `MediaItem`.
  2. `src/hooks/useStorage.ts`: Menambahkan fungsi `decrementEpisode(id: string)` dengan validasi batas bawah 0 dan pemulihan status dari `completed` ke `watching`.
  3. `src/App.tsx`: Meneruskan `onDecrementEpisode` ke `MediaView`.
  4. `src/components/MediaTracker/MediaModal.tsx`: Memperbaiki controlled input numerik (mengizinkan string kosong saat mengetik).
  5. `src/components/MediaTracker/MediaView.tsx`:
     - Memperbarui header multiline dan menghapus tag lama serta tombol tambah statis.
     - Menambahkan tombol melayang FAB di kanan bawah dengan posisi `fixed`.
     - Menyematkan tombol `[-]` di sebelah kiri `[+1 Episode]`.
     - Menyematkan popover/modal ringkas catatan durasi sekilas (jam, menit, detik).
