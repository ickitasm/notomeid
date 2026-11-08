# Rencana Implementasi: Pemulihan Logo Orisinal CSS Notomee (Anti-Select, Anti-Drag, Anti-Adblock)

Status: [x] Selesai & Terverifikasi

Logo telah dipulihkan sepenuhnya ke versi orisinal berbasis CSS murni (kotak terakota huruf "N" dan tipografi editorial "Notomee") melalui komponen mandiri `<BrandLogo />`. Logo ini telah dilengkapi proteksi penuh anti-copy, anti-drag, dan 100% kebal dari pemblokiran ad-blocker.

---

## 1. Rincian Fitur & Proteksi

- [x] **Kebal Pemblokiran Iklan (Anti-Adblock)**: Tidak lagi menggunakan tag `<img>` dengan nama file `*logo*` yang sering dipicu oleh filter uBlock Origin, AdGuard, atau Brave Shields.
- [x] **Anti-Seleksi & Anti-Copy**: Diterapkan `select-none`, `user-select: none`, `-webkit-user-select: none`, serta `pointer-events-none` pada seluruh elemen teks dan huruf sehingga tidak dapat disorot (*highlight*) kursor atau disalin teksnya.
- [x] **Anti-Drag**: Diterapkan atribut `draggable="false"` dan `-webkit-user-drag: none`.
- [x] **Anti-Context Menu pada Logo**: Event `onContextMenu={(e) => e.preventDefault()}` dipasang khusus pada elemen logo untuk mencegah menu *inspect/save image*.
- [x] **Ketajaman Retina Vektor**: Teks Playfair Display dan kotak terakota CSS selalu tajam sempurna di seluruh resolusi layar (mobile & desktop) dan di semua tema aplikasi.

---

## 2. File yang Dibuat & Diperbarui

1. `src/components/Brand/BrandLogo.tsx`: Komponen mandiri logo orisinal CSS dengan opsi ukuran `sm` dan `lg` serta proteksi penuh.
2. `src/components/Navigation.tsx`: Memasang `<BrandLogo size="sm" />` di tombol navigasi header.
3. `src/components/Auth/AuthView.tsx`: Memasang `<BrandLogo size="sm" />` di bilah atas halaman masuk.
4. `src/components/Auth/AccessDeniedView.tsx`: Memasang `<BrandLogo size="sm" />` di bilah atas layar penolakan akses.
5. `src/components/Maintenance/MaintenanceView.tsx`: Memasang `<BrandLogo size="sm" />` di header dan `<BrandLogo size="lg" showSubtitle />` di kartu tengah pemeliharaan.
6. `src/App.tsx`: Memasang `<BrandLogo size="lg" animatePulse />` di layar tunggu otorisasi *whitelist*.
7. `index.html`: Favicon inline SVG data-URI mandiri kotak terakota 'N' yang kebal pemblokiran.

---

## 3. Hasil Pengujian & Verifikasi

- **TypeScript Compilation (`compile_applet`)**: Berhasil tanpa error.
- **Linter (`lint_applet`)**: Berhasil dengan zero error.
- **Dev Server**: Telah direstart dan berjalan normal.
