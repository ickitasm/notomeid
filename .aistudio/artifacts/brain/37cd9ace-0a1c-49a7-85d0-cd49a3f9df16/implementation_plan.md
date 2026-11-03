# Notome Sanctuary - Private Invite-Only Google Authentication Architecture

## 1. Penyebab & Solusi "Error 400: redirect_uri_mismatch" pada Google Login
Di Google Cloud Console, Google menolak permintaan login karena URL redirect yang didaftarkan belum sesuai dengan URL callback resmi dari Supabase:

### Langkah Perbaikan di Google Cloud Console (Hanya butuh 1 menit):
1. Buka [Google Cloud Console](https://console.cloud.google.com/) -> Pilih project Anda.
2. Buka menu **APIs & Services (API & Layanan)** -> **Credentials (Kredensial)**.
3. Klik nama **OAuth 2.0 Client ID** bertipe *Web application*.
4. Scroll ke bawah ke bagian **Authorized redirect URIs (URI pengalihan yang diizinkan)**:
   - **WAJIB Tambahkan**:
     ```text
     https://zkakakhaorbdwvnvjtco.supabase.co/auth/v1/callback
     ```
     *(Catatan: Jangan hanya memasukkan link Vercel di bagian redirect URI ini! Supabase membutuhkan callback URL di atas agar Google mengizinkan handshake autentikasi).*
5. Scroll ke bagian **Authorized JavaScript origins (Asal JavaScript yang diizinkan)**:
   - Tambahkan:
     ```text
     https://zkakakhaorbdwvnvjtco.supabase.co
     https://notomee.vercel.app
     https://notomee-mvmwk5gn9-mishibaism.vercel.app
     ```
6. Klik **SAVE (Simpan)** di bagian paling bawah. *(Perubahan Google Cloud aktif dalam 1-2 menit)*.

---

## 2. Penghapusan Formulir Buat Akun & Mode Tamu
Sesuai arsitektur *Private Sanctuary & Invite-Only*:
- **Formulir "Buat Akun Baru" & tab registrasi**: Telah dihapus total. Tidak ada lagi form email/password terbuka karena semua pengguna harus diundang melalui panel admin.
- **Tombol "Mode Tamu / Offline"**: Telah dihapus total dari halaman login (`AuthView`) maupun halaman penolakan akses (`AccessDeniedView`).
- **Satu-satunya metode masuk**: Tombol **"Lanjutkan dengan Google (Gmail)"**.

---

## 3. Alur Kerja Sistem Undangan (Invite-Only Flow)
1. **Primary Admin (`mike777rafael@gmail.com`)**:
   - Begitu Anda login dengan Google menggunakan akun `mike777rafael@gmail.com`, Anda otomatis mendapatkan lencana dan hak akses **Primary Admin**.
   - Pada navigation bar atas, muncul tombol **"Panel Admin"**.
2. **Mendaftarkan Pengguna Baru**:
   - Di Panel Admin, Anda memasukkan alamat Gmail pengguna yang diizinkan.
   - Anda dapat menyalin pesan undangan langsung untuk dikirim ke pengguna.
3. **Pengguna Diundang**:
   - Saat pengguna tersebut membuka `https://notomee.vercel.app` dan menekan "Lanjutkan dengan Google", sistem memeriksa status whitelist mereka.
   - Jika terdaftar dan aktif: Pengguna langsung masuk ke dashboard pribadi mereka dengan data terisolasi (Row Level Security).
   - Jika belum terdaftar: Pengguna dialihkan ke halaman **Akses Terbatas (Invite-Only)** dengan tombol keluar dan kontak email Primary Admin.
