# Rencana Implementasi: Perbaikan Akses Admin Android & Desain Header Desktop Proporsional

Rencana perbaikan untuk menyelesaikan kendala tombol Panel Admin yang tidak muncul pada perangkat Android untuk akun `mike777rafael` / `michael777rafael@gmail.com`, serta merapikan header desktop yang terlalu melebar menggunakan pendekatan kontainer ramping dan navigasi tengah adaptif.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan yang telah dikonfirmasi dan diselesaikan:
> 1. **Header Desktop**: Telah diterapkan kontainer ramping terpusat (`max-w-6xl`) dengan navigasi tengah adaptif berbasis segmented control pill bergaya modern tanpa melebar ekstrem.
> 2. **Penempatan Panel Admin di Android / Ponsel**: Tombol akses **Admin** kini selalu tampil jelas di bilah atas (header ponsel) dan juga tersedia sebagai menu aksi di dalam dropdown avatar profil.
> 3. **Deteksi Email Akun Admin**: Mengaktifkan otorisasi admin untuk variasi email dan username `mike777rafael` & `michael777rafael@gmail.com` secara komprehensif.
> 4. **Verifikasi**: `tsc --noEmit` dan `npm run build` berhasil 100% tanpa error.

---

## 1. Analisis Akar Masalah

### A. Tombol Panel Admin Tidak Muncul di Android
1. **Ketidakcocokan Email Admin**:
   - Di `src/hooks/useAuth.ts`, `PRIMARY_ADMIN_EMAIL` hanya disetel ke satu string `'mike777rafael@gmail.com'`.
   - Pengguna pada perangkat Android login menggunakan akun Google dengan email sebenarnya `michael777rafael@gmail.com`.
   - Logika `user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase().trim()` menghasilkan `false`.
2. **Keterbatasan Visibilitas Header Mobile di `Navigation.tsx`**:
   - Tombol admin sebelumnya menyembunyikan label teks pada layar `< md` (`<span className="hidden xl:inline">Panel Admin</span><span className="hidden md:inline xl:hidden">Admin</span>`), sehingga hanya menampilkan icon mini tanpa label.
   - Pada menu dropdown profil avatar, belum tersedia pintasan eksplisit untuk membuka Panel Admin.

### B. Header Desktop Terlalu Melebar
1. Penggunaan `max-w-7xl` (1280px) dengan `justify-between` pada layar lebar mendorong logo Notome ke ujung kiri ekstrem dan tombol utilitas ke ujung kanan ekstrem, sementara 6 tab modul terapung di antaranya dengan jarak terlalu renggang.
2. Pada resolusi layar desktop sedang (1024px–1280px), deretan 6 tab modul dan 6 tombol utilitas berdesakan.
3. Solusi yang disetujui:
   - Kontainer header menggunakan ukuran yang lebih padat dan terpusat (`max-w-6xl` atau `max-w-5xl`).
   - Tab navigasi ditempatkan dalam wadah kapsul (*segmented control pill*) yang rapi dan terpusat (*centered navigation pill*).
   - Ditambahkan penanganan scroll horizontal halus dengan kontrol tersembunyi (*scrollbar-none*) jika viewport desktop menyempit, sehingga tidak pernah terjadi layout-breaking.

---

## 2. Rencana Perubahan Komponen

### File 1: `src/hooks/useAuth.ts`
- Tambahkan daftar email primer dan fungsi verifikasi admin fleksibel:
  ```ts
  export const PRIMARY_ADMIN_EMAILS = [
    'mike777rafael@gmail.com',
    'michael777rafael@gmail.com',
  ];
  
  export function checkIsAdmin(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    const username = clean.split('@')[0];
    return (
      PRIMARY_ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase().trim() === clean) ||
      username === 'mike777rafael' ||
      username === 'michael777rafael' ||
      clean.includes('mike777rafael')
    );
  }
  ```
- Perbarui inisialisasi `INITIAL_INVITED_USERS`, `isPrimaryAdmin`, dan pengecekan whitelist agar otomatis mencakup `michael777rafael@gmail.com`.

### File 2: `src/components/Navigation.tsx`
- **Tampilan Header Mobile**:
  - Tampilkan tombol ikon Admin dengan badge oranye jelas di bilah atas ponsel jika pengguna adalah admin.
  - Tambahkan menu aksi **"Panel Admin"** (dengan ikon perisai `ShieldCheck` dan badge khusus) di dalam dropdown profil avatar (`isProfileOpen`), sehingga pengguna mobile selalu memiliki akses 1-klik yang mudah dijangkau.
- **Tampilan Header Desktop**:
  - Ganti layout melebar dengan **kontainer elegan terpusat** (`max-w-6xl`).
  - Satukan 6 tab modul ke dalam kapsul tengah bergaya modern (*segmented pill navigation*), dengan transisi hover yang halus.
  - Buat tab navigasi dapat di-scroll secara horizontal tanpa scrollbar kaku jika lebar layar berkurang.
  - Kelompokkan tombol utilitas kanan (Bahasa, Lonceng, Tema, Pengaturan, Admin, Profil) secara proporsional dan rapi.

### File 3: `src/components/Admin/AdminPanelModal.tsx`
- Sinkronkan `PRIMARY_ADMIN_EMAILS` agar kedua email dikenali sebagai admin sistem utama yang tidak dapat dicabut/dihapus secara tidak sengaja oleh interface.

---

## 3. Rencana Verifikasi
1. **Linter & Type Check**: Jalankan `npm run lint` / `tsc --noEmit` untuk memastikan tidak ada error tipe data.
2. **Compile Applet**: Jalankan `compile_applet` untuk memastikan build produksi Vite sukses tanpa warning.
3. **Uji Coba Fungsional**:
   - Verifikasi bahwa `michael777rafael@gmail.com` dan `mike777rafael@gmail.com` dikenali sebagai `isPrimaryAdmin: true`.
   - Verifikasi tampilan tombol Admin di header mobile (Android) dan di menu profil dropdown.
   - Verifikasi tampilan header desktop pada resolusi lebar dan sedang agar proporsional, rapi, dan tidak melar ke tepi.
