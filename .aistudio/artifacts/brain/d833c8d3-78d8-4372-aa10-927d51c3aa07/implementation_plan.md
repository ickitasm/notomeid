# Rencana Implementasi: Infinite Looping Sliding Bottom Bar dengan Deteksi Auto-Select on Scroll End

Berdasarkan jawaban Anda:
1. **Pergantian Halaman Otomatis**: Saat jari menggeser bar bawah dan berhenti (on scroll end), modul/tab yang paling dekat dengan garis tengah layar otomatis terpilih, disnap rapi ke tengah, dan halaman modul utama langsung berganti.
2. **Infinite Looping Melingkar**: Bar dock di bawah bisa digeser tanpa henti ke kiri maupun ke kanan (setelah *Mimpi* bersambung kembali ke *Film*, begitu pula sebaliknya jika digeser ke kiri dari *Film* langsung bersambung ke *Mimpi*).

---

## 1. Mekanisme Infinite Looping (Virtual Circular Carousel)
- Daftar modul Notomee: `['media', 'nutrition', 'pets', 'calendar', 'notes', 'dreams']` (6 item).
- Untuk menciptakan ilusi putaran melingkar tanpa batas yang mulus di web/mobile:
  - Kita merender 3 siklus set item berturut-turut: `[...Set1, ...Set2 (Utama), ...Set3]`.
  - Posisi awal selalu berada di `Set2` (tengah).
  - Saat pengguna menggeser bar mendekati batas ujung kiri (`Set1`) atau ujung kanan (`Set3`), listener scroll secara instan dan tanpa animasi (`scrollLeft = offset`) melompatkan posisi scroll kembali ke item yang setara di `Set2`. Karena elemennya identik secara visual, mata pengguna tidak akan melihat lompatan sama sekali (seamless infinite wheel).

---

## 2. Deteksi Tab Tengah saat Scroll Berhenti (On Scroll End)
- Kita menggunakan `scrollend` event (dengan fallback timer debounce 120ms untuk browser mobile lama):
  - Mengambil koordinat tengah container bar bawah (`container.getBoundingClientRect().left + container.clientWidth / 2`).
  - Menghitung jarak (`Math.abs(tabCenter - containerCenter)`) dari semua tab yang sedang terlihat.
  - Memilih tab dengan jarak terkecil ke titik tengah.
  - Jika tab tersebut berbeda dengan `activeTab` saat ini, picu `onTabChange(tab.id)`.
  - Mengunci status programmatis (`isProgrammaticScroll = true`) agar saat tab diklik atau diubah tidak memicu trigger ganda berulang.

---

## 3. Visual Highlight & Dimming Realtime
- Tab yang berada tepat di tengah:
  - Membesar (`scale-115`), terang penuh (`opacity-100`), warna aksen tema aktif, dot bercahaya aktif di bawah.
- Tab-tab di kanan dan kiri:
  - Menjadi gelap/redup (`opacity-35`, `scale-90`).
- Transisi CSS hardware-accelerated 300ms yang sangat halus.

---

## 4. Langkah Verifikasi
1. Buka Notomee pada tampilan mobile layar HP.
2. Geser bar navigasi bawah ke kiri melampaui tab terakhir (*Mimpi*):
   - Periksa apakah bar berputar mulus kembali ke *Film* tanpa macet atau mentok (infinite loop).
3. Geser bar navigasi bawah ke kanan melampaui tab pertama (*Film*):
   - Periksa apakah bar berputar mulus ke *Mimpi*.
4. Lepaskan jari saat menggeser dan biarkan berhenti:
   - Tab yang paling dekat dengan tengah otomatis tersnap ke tengah dan halaman modul utama langsung berganti ke modul tersebut.
5. Klik tab manapun langsung dari dock:
   - Tab langsung meluncur ke tengah dan halaman aktif berganti seketika.
6. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan kompilasi.
