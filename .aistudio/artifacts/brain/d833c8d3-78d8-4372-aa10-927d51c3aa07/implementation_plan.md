# Rencana Implementasi: Bottom Dock Bar (Non-Looping, Teks/Ikon Kontras Tinggi & Auto-Snap ke Tengah)

Sesuai permintaan Anda:
1. **Hapus Mekanisme Looping**:
   - Menghapus virtual circular 3-set loop (`-prev`, `-main`, `-next`).
   - Mengembalikan daftar 6 tab asli (`Film`, `Nutrisi`, `Hewan`, `Kalender`, `Catatan`, `Mimpi`) berurutan wajar dan rapi dengan padding horizontal yang cukup (`px-[calc(50vw-38px)]`) agar tab pertama dan tab terakhir tetap bisa tepat berada di tengah layar.

2. **Teks dan Ikon Lebih Kontras / Hitam**:
   - Untuk tab aktif di tengah: Teks dan ikon dibuat tebal, pekat, dan tajam (kontras tinggi: `text-stone-900 dark:text-stone-100 font-extrabold`, aksen warna tema tegas).
   - Untuk tab samping (non-aktif): Tulisan dan ikon dibuat lebih mudah dibaca dan tidak pudar abu-abu pucat, melainkan warna hitam/gelap yang jelas (`text-stone-800 dark:text-stone-200 font-semibold opacity-60 hover:opacity-80`), dengan tetap menjaga perbedaan visual yang elegan terhadap tab aktif.

3. **Snap Otomatis ke Tengah Setiap Kali Menggeser**:
   - Menggunakan CSS scroll snap native yang presisi: `scroll-snap-type: x mandatory` pada container dan `scroll-snap-align: center` pada setiap tab button, ditambah `scroll-snap-stop: always`.
   - Menghitung koordinat tab yang paling dekat dengan garis tengah layar saat digeser/berhenti, lalu langsung mengeksekusi snap smooth ke tengah (`scrollIntoView({ inline: 'center', behavior: 'smooth' })`) dan mengalihkan halaman modul aktif secara instan.

---

## Langkah Verifikasi
1. Buka tampilan mobile di ponsel/browser.
2. Geser bar navigasi bawah ke kiri dan kanan:
   - Bar berhenti secara natural di tab awal (*Film*) dan tab akhir (*Mimpi*) tanpa looping melingkar.
   - Setiap kali digeser, tab terdekat langsung **menge-snap otomatis tepat ke posisi tengah layar**.
   - Halaman modul langsung berganti sesuai tab yang tersnap di tengah.
3. Periksa tampilan teks dan ikon:
   - Terlihat jauh lebih tajam, kontras, dan pekat/hitam (tidak buram atau pudar).
4. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada error.
