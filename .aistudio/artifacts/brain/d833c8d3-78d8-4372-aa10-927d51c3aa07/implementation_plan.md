# Rencana Implementasi: Carousel Bottom Dock Slide (Highlight Tengah & Gelapkan Sisi Kanan/Kiri)

Berdasarkan screenshot dan penjelasan Anda:
1. **Rollback Perubahan Swipe Halaman**: Menghapus gesture swipe di area konten halaman (`useSwipeableTabs` & `SlideViewTransition` di halaman utama) sehingga navigasi konten kembali normal dan stabil.
2. **Carousel Bottom Dock Bar (Bawah)**:
   - Tombol-tombol modul navigasi di bawah diubah menjadi dock horizontal yang dapat bergeser (sliding/scrolling dock).
   - **Auto-Center Scroll**: Setiap kali modul aktif berganti (atau diklik), tab aktif akan otomatis meluncur mulus ke posisi tengah layar (`scrollIntoView({ inline: 'center', behavior: 'smooth' })`).
   - **Highlight Tengah (Active Tab)**:
     - Ikon dan label tab aktif berada di tengah, memiliki ukuran lebih besar (`scale-110` / `scale-115`), warna menyala/terang (tema accent color).
     - Memiliki container background aktif yang bersih dan terdefinisi dengan jelas.
   - **Redup/Gelap di Kanan & Kiri (Inactive Tabs)**:
     - Tab-tab lain di sisi kanan dan kiri dibuat redup / gelap (`opacity-45` hingga `opacity-30`, `scale-90` atau `scale-95`, warna muted), sehingga fokus pandangan mata langsung tertuju pada tab aktif di tengah.
   - **Touch Drag / Swipe pada Dock Bawah**:
     - Pengguna juga dapat menyentuh/menggeser dock bar bawah secara horizontal dengan efek scroll snap dan momentum scrolling alami (`overflow-x-auto`, `scroll-snap-type: x mandatory`).

---

## Rincian Perubahan File

### 1. `src/App.tsx`
- Hapus ketergantungan `useSwipeableTabs` dan pembungkus `SlideViewTransition` pada `<main>`.
- Mengembalikan rendering modul `<main>` langsung tanpa intersep sentuhan layar.
- Tetap menjaga state `activeTab` terhubung dua arah dengan `Navigation`.

### 2. `src/components/Navigation.tsx`
- Mengganti grid statis 6-kolom (`grid-cols-6`) pada bottom navigation bar mobile dengan:
  - Container horizontal scrollable dengan padding tepi kiri/kanan (`px-[38vw]`) agar tab pertama (*Film*) dan tab terakhir (*Mimpi*) bisa berada tepat di tengah layar saat aktif.
  - Setiap tab item memiliki ref dan `scrollIntoView({ inline: 'center', behavior: 'smooth' })` yang aktif otomatis saat tab tersebut terpilih.
  - Efek visual:
    - **Tab Aktif (Tengah)**: `scale-110`, `opacity-100`, warna aksen tema cerah, teks tebal (`font-bold`), ikon menonjol.
    - **Tab Non-Aktif (Sisi)**: `scale-90`, `opacity-40` (gelap/redup), teks halus, transisi halus saat berpindah.
  - Tambahkan efek gradient fade halus di tepi kiri dan kanan dock bawah untuk mempertegas kesan kedalaman visual (depth of field).

### 3. Cleanup File Tidak Terpakai
- Hapus atau bersihkan hook/komponen sisa swipe yang tidak digunakan (`src/hooks/useSwipeableTabs.ts`, `src/components/Common/SlideViewTransition.tsx`, CSS slide di `src/index.css`).

---

## Langkah Verifikasi
1. Buka aplikasi pada mode mobile (viewport HP).
2. Periksa bar navigasi bawah:
   - Modul yang aktif (misal *Kalender* seperti di screenshot) berada di tengah dengan highlight terang dan ikon membesar.
   - Modul-modul di sebelah kanan dan kirinya (*Film*, *Nutrisi*, *Hewan*, *Catatan*, *Mimpi*) tampak redup/gelap.
3. Klik modul lain (misal *Nutrisi* atau *Mimpi*):
   - Bar bawah otomatis meluncur mulus (smooth slide) membawa modul tersebut ke tengah layar.
   - Modul tersebut menjadi terang dan membesar, sementara modul sebelumnya meredup.
4. Sentuh dan geser (drag) dock bawah secara langsung:
   - Pengguna dapat menggeser bar bawah dengan jari.
5. Verifikasi area konten utama halaman:
   - Scroll konten ke atas dan ke bawah berfungsi normal tanpa gesture swipe layar yang mengganggu.
6. Jalankan `compile_applet` dan `lint_applet` untuk memastikan kode 100% bebas error.
