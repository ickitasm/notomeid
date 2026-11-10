# Rencana Implementasi: Mekanisme Slide & Swipe Horizontal Antar-Halaman di Notomee

Berdasarkan diskusi dan preferensi Anda:
1. **Interaksi**: Menggunakan sentuhan gesture swipe kiri/kanan pada layar ponsel/tablet, sekaligus tetap terintegrasi sempurna dengan klik tab navigasi di menu bar atas maupun dock bar bawah.
2. **Animasi**: Animasi slide halus horizontal dengan arah transisi natural (bergerak ke kiri saat navigasi maju, bergerak ke kanan saat navigasi mundur) dengan akselerasi hardware (`will-change: transform`, 60/120fps).

---

## 1. Urutan Modul / Tab
Daftar halaman Notomee berurutan secara konsisten sesuai tab navigasi:
1. **Serial & Film** (`media`) - Index 0
2. **Nutrisi** (`nutrition`) - Index 1
3. **Peliharaan** (`pets`) - Index 2
4. **Kalender** (`calendar`) - Index 3
5. **Catatan** (`notes`) - Index 4
6. **Mimpi** (`dreams`) - Index 5

---

## 2. Rincian Teknis Implementasi

### A. Komponen Transisi Slide (`SlideContainer` / Swipe Hook)
- Mendeteksi swipe gesture sentuhan (`touchstart`, `touchmove`, `touchend`).
- Menghitung ambang batas (threshold) swipe minimal: ~50px dengan sudut horizontal dominan (`|deltaX| > |deltaY| * 1.5`), sehingga tidak mengganggu scroll vertikal ke atas/bawah halaman.
- Mengabaikan swipe jika interaksi berasal dari slider horizontal internal (seperti poster carousel atau input range kalori/air) atau modal aktif.
- Menghitung arah perpindahan (`direction`: `left` atau `right` / `+1` atau `-1`).

### B. Animasi Transisi Halus & Natural
- Saat tab berpindah:
  - Jika menuju tab berikutnya (misal `media` -> `nutrition`), konten bergeser masuk dari kanan ke kiri.
  - Jika menuju tab sebelumnya (misal `pets` -> `nutrition`), konten bergeser masuk dari kiri ke kanan.
- Menggunakan CSS translate3d / GPU-accelerated transition yang ringan dan responsif di browser mobile (Safari iOS & Chrome Android).
- Memberikan feedback visual halus (misal indikator subtle hint jika diinginkan, atau tab bar highlight yang otomatis berpindah mengikuti halaman aktif).

### C. Pemulihan Scroll & UX Ergonomics
- Setiap kali modul berpindah, posisi scroll jendela diatur secara rapi ke bagian atas (`window.scrollTo({ top: 0, behavior: 'instant' })`).
- Jika Admin Panel atau Settings sedang terbuka, gesture swipe antar-modul dinonaktifkan sementara agar tidak terjadi konflik tampilan.

---

## 3. Langkah Verifikasi
1. Melakukan swipe ke kiri pada layar HP di halaman *Serial & Film* -> berpindah ke *Nutrisi* dengan animasi meluncur ke kiri.
2. Melakukan swipe ke kanan di halaman *Nutrisi* -> kembali ke *Serial & Film* dengan animasi meluncur ke kanan.
3. Mencoba klik tab dari menu bar (misal dari *Serial & Film* langsung klik *Kalender*) -> animasi bergerak ke arah yang sesuai dengan urutan indeks tab.
4. Memastikan scroll vertikal (ke atas/bawah melihat daftar item, resep, atau catatan) tetap lancar tanpa terpicu swipe tak sengaja.
5. Menjalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada error kompilasi.
