# Rencana Implementasi: 3 Opsi Pilihan Font di Pengaturan (Di Bawah Opsi Bahasa)

Sesuai permintaan Anda:
1. **Posisi**: Terletak di halaman Pengaturan (Tab Umum), tepat di bawah bagian pilihan Bahasa (🇮🇩 / 🇬🇧).
2. **Tanpa Keterangan Teks Tambahan**: Menampilkan simbol / representasi visual huruf seperti tombol bendera bahasa (misalnya huruf berkarakter khas sesuai jenis font: `Aa` klasik serif untuk default, `Aa` modern untuk sans, dan `Aa` membulat/ceria untuk fun).
3. **3 Opsi Font**:
   - **Saat ini (Default)**: Klasik Editorial & Warm Serifs (`Playfair Display` + `DM Sans`).
   - **Sans**: Bersih, Modern, Minimalis (`DM Sans` / `Inter` / Clean Sans untuk seluruh teks dan judul).
   - **Fun**: Ceria, Hangat, & Rounded Playful (menggunakan Google Font `Quicksand` / `Fredoka` / `Comfortaa`).
4. **Cakupan Font**: Berlaku secara menyeluruh untuk teks dan judul di aplikasi Notomee via CSS variables pada root / html (`data-font="default" | "sans" | "fun"`).

---

## Rincian Perubahan File

### 1. `index.html`
- Tambahkan Google Font untuk tema **Fun** (misalnya `Quicksand:wght@500;600;700`) di samping font yang sudah ada (`Playfair Display`, `DM Sans`, `JetBrains Mono`).

### 2. `src/types.ts` & `src/data/seedData.ts`
- Tambahkan tipe `FontOption`:
  ```ts
  export type FontFamilyOption = 'default' | 'sans' | 'fun';
  ```
- Tambahkan properti `fontFamily?: FontFamilyOption` pada `UserPreferences` dengan nilai default `'default'`.

### 3. `src/index.css`
- Konfigurasikan variabel font global dan selektor atribut `html[data-font="..."]`:
  - `data-font="default"`: font serif untuk heading, font DM Sans untuk body.
  - `data-font="sans"`: font DM Sans / system-ui untuk seluruh heading & body.
  - `data-font="fun"`: font Quicksand / Rounded untuk seluruh heading & body.

### 4. `src/components/Settings/SettingsView.tsx`
- Tepat di bawah kotak pilihan bahasa (`🇮🇩` / `🇬🇧`), tambahkan baris 3 tombol pilihan font:
  - Tanpa teks keterangan panjang.
  - Masing-masing tombol memiliki ukuran dan style yang serasi dengan tombol bahasa (`min-h-[50px] min-w-[70px]`), menampilkan representasi tipografi:
    - **Saat Ini**: `Aa` (bergaya font Serif anggun)
    - **Sans**: `Aa` (bergaya font Sans rapi)
    - **Fun**: `Aa` (bergaya font Fun membulat ceria)
  - Dilengkapi highlight border aksen dan ring aktif saat opsi tersebut dipilih.

### 5. `src/App.tsx`
- Sinkronkan `storage.preferences.fontFamily` ke atribut `document.documentElement.setAttribute('data-font', ...)` sehingga perubahan langsung terlihat seketika di seluruh aplikasi.

---

## Langkah Verifikasi
1. Buka Pengaturan di Notomee.
2. Periksa di bawah tombol bahasa (🇮🇩 / 🇬🇧): Terdapat 3 tombol pilihan font dengan simbol huruf representasi tipografi tanpa teks berlebih.
3. Klik tombol font ke-2 (Sans) -> Seluruh teks dan judul berubah menjadi gaya Sans yang rapi.
4. Klik tombol font ke-3 (Fun) -> Seluruh teks berubah menjadi gaya membulat ceria (Quicksand/Rounded).
5. Klik tombol font ke-1 (Default) -> Font kembali ke gaya estetika warm paper aslinya.
6. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan kompilasi.
