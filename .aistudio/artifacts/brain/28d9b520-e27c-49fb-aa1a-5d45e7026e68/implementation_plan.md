# Rencana Implementasi: Penyesuaian Halaman Login Khusus Layar Mobile & Tablet

Menyesuaikan konten dan tata letak halaman login (`AuthView.tsx`) khusus untuk perangkat non-desktop (HP dan tablet) agar lebih ringkas, fokus, dan nyaman digunakan, sementara tampilan desktop tetap mempertahankan format editorial penuh.

---

## Status: Selesai & Terverifikasi ✅

Semua 6 poin penyesuaian telah berhasil diimplementasikan:
- [x] **Poin 1**: Subheadline mobile/tablet diganti menjadi *"Pantau progres mulai dengan Serial, Nutrisi, Peliharaan bahkan Mimpimu sendiri!"*.
- [x] **Poin 2**: Judul kartu pada mobile/tablet diganti menjadi *"Masuk"*.
- [x] **Poin 3**: Paragraf deskripsi panjang kartu disembunyikan pada perangkat mobile/tablet.
- [x] **Poin 4**: Kata `(Gmail)` dihapus dari tombol Google pada perangkat mobile/tablet (*"Lanjutkan dengan Google"*).
- [x] **Poin 5**: Keterangan kata sandi di bawah tombol Google disembunyikan pada perangkat mobile/tablet.
- [x] **Poin 6**: Dropdown accordion *"Cara Login?"* ditambahkan di atas dropdown *"Akses Privat Terjamin"* dengan status default tertutup (*closed*).

---

## 1. Overview & Konsep Perubahan

Sesuai instruksi dan konfirmasi pengguna, terdapat 6 poin penyesuaian yang diterapkan khusus pada perangkat non-desktop (`< lg`):
1. **Penyederhanaan Teks Subheadline**: Mengganti teks pengantar pada layar HP/tablet menjadi:
   > *"Pantau progres mulai dengan Serial, Nutrisi, Peliharaan bahkan Mimpimu sendiri!"*
2. **Penyederhanaan Judul Kartu**: Mengganti *"Masuk ke Notome"* menjadi *"Masuk"*.
3. **Pembersihan Deskripsi Kartu**: Menghapus paragraf penjelasan panjang *"Notome adalah platform personal privat. Masuk..."* di layar mobile.
4. **Pembersihan Tombol Google**: Menghilangkan kata *"(Gmail)"* pada tombol aksi, sehingga menjadi *"Lanjutkan dengan Google"*.
5. **Penghapusan Kalimat Keterangan Kata Sandi**: Menghapus kalimat *"Login instan aman dengan identitas Google Anda tanpa perlu mengingat kata sandi."* pada layar mobile.
6. **Penambahan Dropdown "Cara Login?"**: Menambahkan section accordion baru tepat di atas dropdown *"Akses Privat Terjamin"* dengan kondisi awal tertutup (*default closed*), berisi:
   > *"Notome merupakan platform privat. Login dengan Akun Google Anda yang telah didaftarkan oleh Admin mike777rafael@gmail.com"*

---

## 2. User Experience & Tata Letak Responsif

### 2.1 Skema Komponen Responsif (Mobile vs Desktop)

```
┌────────────────────────────────────────────────────────┐
│ MOBILE / TABLET (< lg)       │ DESKTOP (>= lg)         │
├──────────────────────────────┼─────────────────────────┤
│ • Subheadline Ringkas        │ • Subheadline Lengkap   │
│ • Judul: "Masuk"             │ • Judul: "Masuk..."     │
│ • Deskripsi Card: Ditiadakan │ • Deskripsi Card Ada    │
│ • Tombol: "...dengan Google" │ • Tombol Google         │
│ • Accordion: "Cara Login?"   │ • Accordion "Cara Login"│
│   (Tertutup secara default)  │                         │
│ • Accordion: "Akses Privat"  │ • Accordion Privasi     │
└──────────────────────────────┴─────────────────────────┘
```

### 2.2 Rincian Fitur Accordion "Cara Login?"
- Ditempatkan tepat di atas accordion *"Akses Privat Terjamin"* di bagian bawah halaman.
- Menggunakan state `isHowToLoginOpen` (default: `false` / tertutup).
- Dilengkapi ikon panduan (`HelpCircle`), teks judul *"Cara Login?"*, dan panah animasi *chevron*.
- Memuat teks informasi resmi dengan tautan interaktif `mailto:mike777rafael@gmail.com`.

---

## 3. Rincian Perubahan File

### 3.1 `src/components/Auth/AuthView.tsx`
- Menambahkan state `isHowToLoginOpen` dan ikon `HelpCircle`.
- Mengatur subheadline responsif (`block lg:hidden` vs `hidden lg:block`).
- Mengatur judul kartu responsif (*"Masuk"* vs *t.signInTitle*).
- Menyembunyikan `t.inviteOnlyDesc` di layar mobile (`hidden lg:block`).
- Menyesuaikan teks tombol Google agar tanpa `(Gmail)` di mobile.
- Menyembunyikan kalimat login instan di mobile (`hidden lg:block`).
- Menambahkan blok accordion *Cara Login?* di atas accordion *Akses Privat Terjamin*.
