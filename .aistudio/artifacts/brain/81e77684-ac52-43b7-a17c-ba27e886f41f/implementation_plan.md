# Rencana Implementasi: Sinkronisasi Cloud Mode Maintenance & Standarisasi Tampilan Desktop

Berdasarkan jawaban Anda:
1. **Sinkronisasi Mode Pemeliharaan (Maintenance)**: Menggunakan tabel cloud Supabase agar perubahan status pemeliharaan langsung berlaku secara instan dan menyeluruh di semua perangkat (smartphone, tablet, laptop, dan PC desktop) tanpa bergantung pada penyimpanan lokal masing-masing perangkat.
2. **Format Tampilan Desktop**: Mengadopsi tata letak desktop responsif standar yang rapi, luas, dan proporsional untuk seluruh modul (Cinema, Nutrisi, Pets, Kalender, Notes, dan Dreams), menjaga konsistensi dengan fitur-fitur pembaruan terkini.

---

## 1. Analisis Masalah Saat Ini

- **Penyebab Maintenance Hanya Berdampak di Mobile**:
  - `useMaintenance.ts` saat ini hanya menyimpan konfigurasi pemeliharaan ke `localStorage` browser lokal (`notomee_maintenance_config_v1`).
  - Ketika Primary Admin mengaktifkan pemeliharaan dari ponsel, data tersebut tidak tersalurkan ke server database Supabase. Akibatnya, browser desktop pengguna biasa tidak mengetahui bahwa aplikasi sedang dalam status pemeliharaan.
- **Penyelarasan Tampilan Desktop**:
  - Perubahan ergonomis sebelumnya difokuskan pada mobile shell. Pada layar desktop monitor/laptop ($\ge 1024$px / $\ge 1280$px), antarmuka perlu diperluas secara proporsional (`max-w-7xl`), menggunakan grid multi-kolom yang seimbang, top navigation bar yang bersih, dan modal dialog yang proporsional.

---

## 2. Rencana Perubahan Detail

### A. Sinkronisasi Mode Maintenance Global via Supabase (`src/hooks/useMaintenance.ts`)
- **Tabel Pengaturan Cloud (`app_settings`)**:
  - Gunakan kunci `maintenance` di Supabase untuk menyimpan status pemeliharaan:
    ```json
    {
      "isEnabled": true,
      "reason": "Pembaruan sistem berkala",
      "activatedAt": "2026-11-08T...",
      "activatedBy": "mike777rafael@gmail.com"
    }
    ```
- **Realtime Listener**:
  - Pasang channel Supabase realtime (`supabase.channel('maintenance-mode')`) agar saat admin menyalakan/mematikan mode maintenance, browser pengguna biasa di desktop maupun mobile langsung dialihkan ke layar pemeliharaan (*MaintenanceView*) secara otomatis dalam hitungan detik.
- **Fallback Toleransi Offline**:
  - Tetap mendukung `localStorage` sebagai cache instan saat koneksi internet lambat atau offline.
- **Panduan SQL Supabase di Admin Panel**:
  - Sediakan instruksi DDL `CREATE TABLE IF NOT EXISTS app_settings` di tab SQL Supabase pada Admin Panel agar admin dapat memverifikasi tabel jika belum dibuat.

### B. Standardisasi Tampilan Desktop Responsif (`src/App.tsx` & Komponen Terkait)
- **Kontainer Utama Desktop**:
  - Sesuaikan lebar kontainer utama di `App.tsx` menjadi `max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8` agar tidak terasa terlalu sempit seperti format ponsel saat dibuka di laptop/PC.
- **Bilah Navigasi Atas Desktop (`Navigation.tsx`)**:
  - Pastikan 6 tab modul inti (`Cinema`, `Nutrisi`, `Pets`, `Kalender`, `Notes`, `Dreams`) tertata rapi di tengah dengan indikator aktif yang elegan.
  - Tampilkan pemilih tema 5 warna (*Warm Paper, Roast Dark, Cinema Velvet, Romantic Rose, Christmas Eve*), tombol alih bahasa (ID/EN), lonceng pengingat, dan avatar profil dengan laci admin.
  - Sembunyikan bottom navigation bar di layar desktop (`md:hidden`).
- **Modul Catatan (Notes) & Editor di Desktop**:
  - Grid catatan 2-3 kolom responsif di layar besar (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - Dialog editor catatan (`NoteModal.tsx`) tampil luas dan nyaman dengan bilah alat pemformatan cepat (*Bold, Italic, Underline, Strikethrough, Daftar, Heading, Quote, Kapitalisasi*) serta tab pratinjau langsung.
- **Modul Pets, Media, & Nutrisi di Desktop**:
  - Timeline medis dan daftar resep hewan peliharaan tertata proporsional tanpa pergeseran horizontal yang canggung.
  - Kalender master memanfaatkan tampilan grid bulan penuh dan agenda berdampingan.

### C. Verifikasi & Pengujian
1. Verifikasi kompilasi TypeScript (`tsc --noEmit`) dan build Vite (`npm run build`).
2. Uji alur aktivasi maintenance:
   - Admin (`mike777rafael@gmail.com`) mengaktifkan maintenance $\rightarrow$ tersimpan ke Supabase $\rightarrow$ pengguna biasa di desktop (`michael777rafael@gmail.com` atau email lain) langsung terkunci di layar `MaintenanceView`.
   - Admin menonaktifkan maintenance $\rightarrow$ akses desktop dan mobile langsung terbuka kembali normal.
3. Uji responsivitas desktop pada resolusi 1280px, 1440px, dan mobile (390px - 430px).

---

## 3. Langkah Eksekusi

1. Modifikasi `src/hooks/useMaintenance.ts` untuk membaca dan menulis status maintenance ke tabel Supabase `app_settings` dengan langganan *realtime*.
2. Perbarui `src/components/Admin/AdminPanelModal.tsx` dengan skrip SQL untuk tabel `app_settings`.
3. Standarisasi kontainer dan grid responsif desktop di `src/App.tsx` dan `src/components/Navigation.tsx`.
4. Jalankan `compile_applet` dan `lint_applet` untuk memastikan nol error.
5. Jalankan `restart_dev_server`.
