# Rencana Implementasi: Tombol Panah Ganti Halaman Mengapit Navigasi Bawah

Berdasarkan jawaban Anda:
1. **Tata Letak**:
   - Di bar navigasi bawah layar ponsel (`mobile bottom bar`), tambahkan tombol panah kiri (`ChevronLeft`) di ujung paling kiri dan tombol panah kanan (`ChevronRight`) di ujung paling kanan yang mengapit seluruh tab modul.
   - Desain tombol panah dirancang ergonomis untuk jangkauan jempol tangan (*thumb zone*), responsif, dan menyatu dengan gaya estetika Notomee.
2. **Perilaku Looping**:
   - Menekan tombol panah kiri saat di halaman pertama (*Film/Serial*) akan langsung berputar menuju ke halaman terakhir (*Mimpi*).
   - Menekan tombol panah kanan saat di halaman terakhir (*Mimpi*) akan langsung berputar kembali ke halaman pertama (*Film/Serial*).
   - Pengguna tetap dapat mengeklik masing-masing tab secara langsung seperti biasa.

---

## Rincian Perubahan File

### `src/components/Navigation.tsx`
1. Import ikon `ChevronLeft` dan `ChevronRight` dari `lucide-react`.
2. Hitung logika pergantian halaman:
   ```ts
   const currentIndex = navItems.findIndex((item) => item.id === activeTab);
   const handlePrevTab = () => {
     const nextIndex = (currentIndex - 1 + navItems.length) % navItems.length;
     onTabChange(navItems[nextIndex].id);
     window.scrollTo({ top: 0, behavior: 'smooth' });
   };
   const handleNextTab = () => {
     const nextIndex = (currentIndex + 1) % navItems.length;
     onTabChange(navItems[nextIndex].id);
     window.scrollTo({ top: 0, behavior: 'smooth' });
   };
   ```
3. Sesuaikan tata letak bottom bar:
   - Tombol panah kiri di sisi paling kiri.
   - 6 tab modul di bagian tengah (dengan grid proporsional yang rapi).
   - Tombol panah kanan di sisi paling kanan.
   - Terapkan efek sentuh aktif (`active:scale-90`), warna kontras, dan touch target minimal 44px yang nyaman untuk layar sentuh HP.

---

## Langkah Verifikasi
1. Buka tampilan Notomee pada layar HP (mode mobile).
2. Periksa bar navigasi bawah: tombol panah kiri dan kanan mengapit tab modul secara rapi dan simetris.
3. Klik tombol panah kanan: halaman berpindah dari *Film* ke *Nutrisi*, ke *Hewan*, dst.
4. Klik tombol panah kanan saat berada di *Mimpi*: halaman berputar kembali ke *Film* (looping aktif).
5. Klik tombol panah kiri saat berada di *Film*: halaman berputar ke *Mimpi*.
6. Klik salah satu tab di tengah langsung: halaman tetap berganti sesuai tab yang diklik.
7. Jalankan `compile_applet` dan `lint_applet` untuk memastikan tidak ada kesalahan kompilasi.
