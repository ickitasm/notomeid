# Sistem 4 Tema Tampilan Notome (Cinema Velvet & Romantic Rose)

Implementasi sistem multi-tema editorial dengan 4 mode tampilan yang dapat dipilih: **Warm Paper** (krem klasik), **Roast Dark** (hitam kopi sangrai), **Cinema Velvet** (merah tua elegan khas bioskop noir), dan **Romantic Rose** (pink mawar romantis yang lembut), lengkap dengan pemilih tema berpratinjau warna di menu profil dan modal pengaturan.

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan jawaban klarifikasi yang telah dikonfirmasi:
> - **4 Tema Lengkap**: Menyediakan 4 tema terpadu (Warm Paper, Roast Dark, Cinema Velvet, dan Romantic Rose).
> - **Aksesibilitas Pemilih Tema**: Ditempatkan di menu profil sentuh dan modal pengaturan data, lengkap dengan pratinjau warna (*color swatch preview*).
> - **Nuansa Warna**: Cinema Velvet berbasis latar gelap pekat bioskop (`#120406` / `#1E080B`) dengan aksen beludru merah kirmizi (`#E11D48` & `#BE123C`), sedangkan Romantic Rose berbasis latar lembut krem-mawar (`#FDF7F8` / `#FFF9FA`) dengan aksen mawar romantis (`#DB2777` & `#F472B6`).

---

## 1. Overview & Core Concept

Fitur ini memperkaya atmosfer personal santuari Notome dengan memberikan opsi estetika visual yang mendalam:
1. **Warm Paper** (`light`): Suasana arsip kertas hangat, terakota editorial, dan limestone.
2. **Roast Dark** (`dark`): Suasana malam pekat kopi sangrai, obsidian, dan aksen tembaga.
3. **Cinema Velvet** (`cinema`): Atmosfer teater bioskop megah dengan latar merah marun gelap pekat, velvet bordeaux, dan kilau ruby elegan. Sangat cocok untuk sesi nonton film dan logging malam hari.
4. **Romantic Rose** (`romantic`): Atmosfer lembut mawar romantis, kertas blush halus, garis pembatas dusty-rose, dan tipografi antik yang menenangkan.

---

## 2. User Experience & Visual Design

### Palet Warna & Karakter Tema

```
┌────────────────────────────────────────────────────────────────────────┐
│                   4 PALET TEMA NOTOME EDITORIAL                        │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ 1. Warm Paper    │ 2. Roast Dark    │ 3. Cinema Velvet │ 4. Romantic   │
│ (Default Light)  │ (Default Dark)   │ (Red Bioskop)    │    Rose       │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ Bg: #FAF7F2      │ Bg: #161311      │ Bg: #120406      │ Bg: #FDF7F8   │
│ Card: #FFFDF9    │ Card: #1C1815    │ Card: #1D080B    │ Card: #FFF9FA │
│ Text: #2D2823    │ Text: #EAE3DA    │ Text: #FDF2F4    │ Text: #381A22 │
│ Accent: #C85A32  │ Accent: #D9822B  │ Accent: #E11D48  │ Accent:#DB2777│
│ Border: #E5DDD2  │ Border: #2D2722  │ Border: #3D1219  │ Border:#F0D0D7│
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### Penempatan Kontrol Pemilih Tema
1. **Laci Menu Profil (Mobile & Desktop Header)**:
   - Kartu pemilih tema interaktif dengan 4 bulatan pratinjau warna (*color swatch dots*).
   - Menampilkan nama tema dan indikator centang (*checkmark*) pada tema yang sedang aktif.
2. **Modal Pengaturan & Sinkronisasi (`SettingsModal`)**:
   - Bagian "Tema Tampilan Aplikasi" dengan 4 kartu pratinjau elegan berisi palet warna latar belakang dan warna aksen utama.
3. **Penyimpanan Status**:
   - Tersimpan otomatis di `localStorage` (`notome_preferences_v1`) sehingga preferensi tema pengguna tetap konsisten antar sesi.

---

## 3. Key Product Decisions & Trade-Offs

- **Penggunaan Atribut `data-theme`**:
  - *Pendekatan*: Menambahkan atribut `data-theme="light" | "dark" | "cinema" | "romantic"` pada elemen `<html>` serta mempertahankan kelas `.dark` untuk tema berbasis gelap (`dark` dan `cinema`).
  - *Alasan*: Kompatibilitas penuh dengan utilitas Tailwind CSS yang ada, sambil mengizinkan penyesuaian CSS variables dan kelas khusus untuk nuansa merah tua bioskop dan pink mawar tanpa merusak fungsionalitas modul lainnya.
- **Pewarnaan Elemen Dinamis**:
  - Elemen navigasi, kartu modul, bilah pencarian, dan dialog modal akan mengadopsi nuansa latar dan garis tepi sesuai dengan tema yang aktif secara halus melalui transisi `transition-colors duration-200`.

---

## 4. Technical Architecture & Component Mapping

```
┌──────────────────────────────────────────────────────────────┐
│                    useStorage Preferences                    │
│            theme: 'light' | 'dark' | 'cinema' | 'romantic'   │
└──────────────────────────────┬───────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
  ┌─────────────────────────┐     ┌─────────────────────────┐
  │ HTML Root Element       │     │ LocalStorage            │
  │ data-theme="..."        │     │ notome_preferences_v1   │
  │ class="dark" (if dark/  │     └─────────────────────────┘
  │               cinema)   │
  └────────────┬────────────┘
               │
   ┌───────────┴───────────────────────────────┐
   ▼                                           ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ Navigation / Profile Drawer  │ │ SettingsModal                │
│ 4-Theme Swatch Selector Grid │ │ 4-Theme Interactive Selector │
└──────────────────────────────┘ └──────────────────────────────┘
```

### Rincian Perubahan Kode
1. **`src/types.ts`**:
   - Definisikan tipe `ThemeMode = 'light' | 'dark' | 'cinema' | 'romantic'`.
   - Perbarui `UserPreferences.theme` menjadi `ThemeMode`.
2. **`src/hooks/useStorage.ts`**:
   - Perbarui sinkronisasi `useEffect` agar mengelola `data-theme` dan kelas `.dark`.
   - Sediakan fungsi `setTheme(theme: ThemeMode)`.
3. **`src/index.css`**:
   - Tambahkan token variabel CSS dan aturan pewarnaan untuk `[data-theme="cinema"]` dan `[data-theme="romantic"]`.
4. **`src/components/Navigation.tsx`**:
   - Tambahkan pemilih tema berpratinjau warna 4 tombol di laci profil sentuh.
5. **`src/components/SettingsModal.tsx`**:
   - Perbarui opsi tema di pengaturan dengan 4 kartu tema interaktif.
6. **Verifikasi**:
   - Jalankan `lint_applet` dan `compile_applet`.
