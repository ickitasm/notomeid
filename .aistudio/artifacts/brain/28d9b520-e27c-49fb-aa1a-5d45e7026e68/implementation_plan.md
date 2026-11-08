# Rencana Implementasi: Penggantian Logo Resmi Notomee & Fitur Mode Maintenance Admin

Status: [x] Selesai & Terverifikasi

Seluruh logo dan identitas visual Notome telah diganti menggunakan gambar resmi `notomee_logos.jpg`, serta fitur kontrol jeda sistem (Mode Pemeliharaan / System Maintenance) khusus Primary Admin (`mike777rafael@gmail.com`) telah aktif dan terpasang sempurna.

---

## 1. Analisis & Ruang Lingkup

### 1.1 Penggantian Logo Resmi (`notomee_logos.jpg`)
- [x] Menyediakan file logo di `/public/notomee_logos.jpg`.
- [x] **`Navigation.tsx`**: Mengganti kotak 'N' dengan gambar resmi `notomee_logos.jpg` dan wordmark "Notomee".
- [x] **`AuthView.tsx`**: Mengganti logo header dan badge santuari dengan `notomee_logos.jpg` serta memperbarui teks ke "Notomee Sanctuary".
- [x] **`AccessDeniedView.tsx`**: Memasang `notomee_logos.jpg` pada header dan teks penjelasan.
- [x] **`App.tsx`**: Memasang `notomee_logos.jpg` pada layar splash loading otorisasi whitelist.
- [x] **`index.html`**: Menambahkan favicon browser `<link rel="icon" type="image/jpeg" href="/notomee_logos.jpg" />` dan memperbarui title menjadi "Notomee - Personal Sanctuary".

---

### 1.2 Fitur Mode Maintenance / Pause Web App Khusus Admin
- [x] **Hak Akses Admin Penuh**: Primary Admin (`mike777rafael@gmail.com`) tidak terkunci saat mode pemeliharaan aktif dan tetap dapat mengoperasikan semua modul.
- [x] **Penahanan Pengguna Umum**: Anggota biasa dialihkan ke layar khusus **`MaintenanceView`** yang estetis dengan logo resmi, alasan pemeliharaan, tombol muat ulang, dan tombol keluar.
- [x] **Penempatan Kontrol**: Tombol kontrol dan sakelar status diletakkan di dalam tab baru **Mode Maintenance (Pause)** pada **`AdminPanelModal`**.
- [x] **Pesan Pemeliharaan Kustom**: Admin dapat menuliskan catatan kustom yang langsung tampil pada layar maintenance pengguna.
- [x] **Banner Pengingat Admin**: Bilah peringatan merah/oranye muncul di atas header Admin Mike saat sistem dijeda, dilengkapi tombol 1-klik "Buka Akses Normal".

---

## 2. File yang Dibuat & Diperbarui

1. `src/hooks/useMaintenance.ts`: Hook state sinkronisasi real-time antar-tab dengan penyimpanan lokal `notomee_maintenance_config_v1`.
2. `src/components/Maintenance/MaintenanceView.tsx`: Komponen layar pemeliharaan mandiri dengan logo resmi, tombol refresh, dan logout.
3. `src/components/Admin/AdminPanelModal.tsx`: Tab ke-4 untuk kontrol on/off jeda sistem dan pesan pemeliharaan.
4. `src/components/Navigation.tsx`: Brand logo `notomee_logos.jpg` dan judul Notomee.
5. `src/components/Auth/AuthView.tsx`: Brand logo `notomee_logos.jpg` dan judul Notomee.
6. `src/components/Auth/AccessDeniedView.tsx`: Brand logo `notomee_logos.jpg` dan judul Notomee.
7. `src/App.tsx`: Gating mode maintenance, splash loading logo, dan banner kontrol admin.
8. `index.html`: Favicon dan metadata Notomee.

---

## 3. Hasil Pengujian & Verifikasi

- **TypeScript Compilation (`compile_applet`)**: Succeeded.
- **Linter (`lint_applet`)**: Succeeded dengan zero error.
- **Dev Server**: Berjalan normal di port 3000.
