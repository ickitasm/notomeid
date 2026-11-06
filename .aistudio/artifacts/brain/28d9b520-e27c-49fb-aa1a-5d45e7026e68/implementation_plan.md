# Rencana Implementasi: Peningkatan Skala Tipografi Global (~8%) & Ruang Bernapas (Breath Gap)

Berdasarkan preferensi Anda, kami akan meningkatkan skala tipografi dan elemen interaktif sebesar **8% secara seimbang di seluruh aplikasi secara global**, disertai dengan perluasan padding, margin, dan grid gap untuk memberikan "breath gap" (ruang bernapas) yang lega dan nyaman di mata tanpa merusak keanggunan editorial Notome.

---

## 1. Skala Tipografi Global & Font Root Scaling
- **Root Font Size Scaling**:
  - Konfigurasi root HTML font size dinaikkan secara harmonis sebesar ~8% (dari default `16px` menjadi `17.2px` atau `107.5%`) pada `src/index.css`. Hal ini secara proporsional dan elegan meningkatkan seluruh skala `rem` Tailwind (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, dst.) secara konsisten di seluruh modul.
  - Memperbarui micro-typography (`text-[10px]` dan `text-[11px]`) pada badge tanggal, status imunisasi, label makronutrien, dan rating media menjadi minimal `text-xs` (12px-13px) agar mudah terbaca tanpa harus memicingkan mata.
  - Menyesuaikan `line-height` (leading) menjadi lebih santai (`leading-relaxed` / `leading-loose`) agar baris teks memiliki sirkulasi udara yang nyaman.

---

## 2. Peningkatan "Breath Gap" pada Layout & Wadah Kontainer
- **Container Luar & Header**:
  - Memperluas padding kontainer utama pada `src/App.tsx` dari `px-4 sm:px-6 py-6` menjadi `px-5 sm:px-8 py-8 sm:py-10`.
  - Memberi ruang lega vertikal pada bar navigasi (`src/components/Navigation.tsx`), memperbesar tab button padding dari `py-2 px-3` menjadi `py-2.5 px-4`, serta memperbesar touch target ikon.
- **Card Padding & Grid Gaps**:
  - Memperluas jarak antar kartu/grid (`gap-4` -> `gap-5` atau `gap-6`) pada seluruh modul:
    - **Media View**: Jarak kartu tontonan lebih renggang, padding detail tontonan bertambah dari `p-4` ke `p-5.5`.
    - **Nutrition View**: Ruang kartu ringkasan kalori, makro, dan log makanan diperluas agar ringkasan statistik harian tidak padat.
    - **Pet View**: Jarak kartu hewan peliharaan, jadwal vaksin, dan log medis diperluas dengan padding kartu `p-5` s/d `p-6`.
    - **Master Calendar**: Sel tanggal kalender diberi tinggi minimum lebih lapang (`min-h-[110px]` -> `min-h-[125px]`) dan jarak event tag lebih renggang.
    - **Notes & Dream Catcher**: Ruang editor dan kartu catatan diperluas untuk kenyamanan menulis.

---

## 3. Komponen Form, Tombol, dan Dialog Modal
- **Ukuran Input & Button**:
  - Menaikkan tinggi sentuh (touch target) input formulir dan tombol aksi utama dari `h-10` ke `h-11` atau `h-12` (`min-h-[46px]`), dengan padding internal `px-4 py-2.5`.
  - Memperbesar ukuran ikon aksi (edit, hapus, checkmark, filter) dari `w-4 h-4` ke `w-4.5 h-4.5` atau `w-5 h-5`.
- **Modal Dialog**:
  - Memperluas padding modal dialog dari `p-6` menjadi `p-7` atau `p-8` dengan `space-y-5` antar field formulir.

---

## 4. Validasi & Pengujian
- Memastikan tidak ada teks yang terpotong (*text clipping*), tidak terjadi tumpang tindih (*overlap*), dan tidak ada horizontal scrolling tak diinginkan di mobile.
- Menjalankan `compile_applet` dan `lint_applet` untuk memastikan kode bebas error.
- Me-restart dev server untuk verifikasi hasil akhir.
