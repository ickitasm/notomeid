# Redesain Antarmuka Halaman Depan & Login Notome

Penyederhanaan dan perapian visual landing page autentikasi (*AuthView*): menghapus badge repetitif, memperbarui tipografi judul menjadi multiline editorial (*Catat, Simpan, Ulangi.*), memperbarui video bumper looping terbaru tanpa watermark overlay, serta meringkas jaminan privasi ke dalam accordion di atas footer.

### User Review & Critical Decisions

> [!IMPORTANT]
> - **Aset Video Baru**: Menggunakan berkas video bumper looping terbaru `notomee_bumper__1__c91fac80.mp4` yang disisipkan oleh pengguna, menggantikan berkas lama.
> - **Format Judul Baru**: Mengganti headline panjang lama menjadi 3 baris terpisah (*multiline*) berbobot tipografi *Playfair Display* yang kuat:
>   - *Catat,*
>   - *Simpan,*
>   - *Ulangi.*
> - **Penghapusan Label Repetitif**: Menghapus pill `Notomee Sanctuary · Invite-Only` di atas judul, label `Notomee · 6 Life Pillars` pada video, dan badge `Sistem Privat Berbasis Undangan` pada kartu login Google.
> - **Accordion Jaminan Privasi**: Bagian jaminan privasi dipindahkan dari kolom kiri ke area bawah tepat di atas footer, disajikan dalam bentuk accordion yang ringkas dengan ikon perisai privasi sehingga tidak membebani ruang visual vertikal.

- **Keputusan 1**: Aset video `notomee_bumper__1__c91fac80.mp4` dipilih langsung sesuai konfirmasi pengguna.
- **Keputusan 2**: Accordion terlipat rapi dengan transisi mulus dan ikon perisai privasi diletakkan terpusat tepat di atas footer.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Menyederhanakan tata letak halaman masuk (*landing login*) agar lebih bersih, berkarakter editorial, dan fokus pada aksi utama: video bumper bergerak dan tombol satu sentuhan masuk dengan akun Google.
- **Audiens Target**: Pengguna perangkat seluler (iPhone, Android) dan tablet yang membuka santuari Notome.
- **Nilai Utama**: Tampilan landing page terasa lebih tenang (*sanctuary vibe*), tidak sesak dengan badge status undangan berulang, dan tipografi display yang elegan menyampaikan esensi Notome (*Catat, Simpan, Ulangi*).

---

### 2. User Experience & Visual Design

- **Alur Interaksi Pengguna**:
  1. Pengguna membuka Notome di peramban seluler atau tablet.
  2. Di kolom kiri, pengguna disambut tipografi serif elegan 3 baris: **Catat, / Simpan, / Ulangi.**
  3. Video bumper animasi Notome berputar mulus secara berulang (*infinite loop*), bersih tanpa badge teks mengambang, hanya menyisakan tombol kontrol audio transparan di sudut kanan atas.
  4. Di kolom kanan, kartu login Google tampil minimalis dan langsung pada intinya (tombol Google Sign-In instan).
  5. Di bagian bawah layar (tepat di atas footer), terdapat tombol accordion ringkas *Akses Privat Terjamin*. Jika disentuh, teks penjelasan privasi mengembang secara mulus tanpa mengganggu tata letak utama.

- **Identitas Visual & Tipografi**:
  - **Judul Utama**: `font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] leading-tight`, dipisah per koma menjadi 3 baris:
    - Baris 1: `Catat,`
    - Baris 2: `Simpan,`
    - Baris 3: `Ulangi.`
  - **Pemutar Video**: Bingkai kartu `rounded-2xl border shadow-md` dengan rasio 16:9, kontrol audio transparan di sudut kanan atas, tanpa tag pill bawah.
  - **Accordion Privasi di Atas Footer**: Komponen kompak dengan ikon `<ShieldCheck />`, teks ringkas, panah indikator buka/tutup, dan kontainer detail dengan latar belakang lembut adaptif 5 tema.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Judul Multiline Terstruktur**:
  - *Pendekatan*: Memecah string menjadi elemen `<span className="block">Catat,</span><span className="block">Simpan,</span><span className="block">Ulangi.</span>` atau array terpetakan dengan jeda visual mikro antar baris.
  - *Alasan*: Menjamin pemisahan baris per koma terjadi secara konsisten dan indah di semua ukuran layar (HP kecil hingga monitor lebar), menghindari pemotongan kata acak oleh browser.
- **Keputusan 2: Pemindahan dan Peringkasan Jaminan Privasi ke Accordion**:
  - *Pendekatan*: Menghapus elemen static banner di bawah video dan meletakkannya sebagai dropdown disclosure sebelum footer.
  - *Alasan*: Mengurangi kepadatan visual vertikal pada perangkat seluler, sehingga pengguna tidak perlu menggulir jauh untuk melihat tombol login Google.

---

### 4. Technical Architecture & Component Mapping

```
┌─────────────────────────────────────────────────────────────────┐
│                      AuthView.tsx (Landing Page)                │
├────────────────────────────────┬────────────────────────────────┤
│    KOLOM KIRI (Brand Story)    │     KOLOM KANAN (Auth Card)    │
│ ┌────────────────────────────┐ │ ┌────────────────────────────┐ │
│ │ [UPDATE] Multiline Title   │ │ │ [UPDATE] Kartu Google      │ │
│ │ • Catat,                   │ │ │ • Tanpa badge undangan     │ │
│ │ • Simpan,                  │ │ │ • Tombol Masuk Google      │ │
│ │ • Ulangi.                  │ │ │ • Bantuan kontak Admin     │ │
│ ├────────────────────────────┤ │ └────────────────────────────┘ │
│ │ [UPDATE] BumperVideoCard   │ │                                │
│ │ • Video c91fac80.mp4       │ │                                │
│ │ • Hapus tag 6 Life Pillars │ │                                │
│ │ • Kontrol audio on/off     │ │                                │
│ └────────────────────────────┘ │                                │
├────────────────────────────────┴────────────────────────────────┤
│ [BARU] Accordion Dropdown: Akses Privat Terjamin (Expandable)   │
├─────────────────────────────────────────────────────────────────┤
│ Footer (Notome · Private Life Hub)                              │
└─────────────────────────────────────────────────────────────────┘
```

- **Komponen yang Dimodifikasi**:
  1. `src/components/Auth/BumperVideoCard.tsx`:
     - Ganti sumber video ke `/assets/aistudio/notomee_bumper__1__c91fac80.mp4`.
     - Hapus elemen overlay badge `Notomee · 6 Life Pillars` di sudut kiri bawah.
     - Pertahankan tombol floating kontrol audio (Mute / Unmute).
  2. `src/components/Auth/AuthView.tsx`:
     - Hapus badge pill `Notomee Sanctuary · Invite-Only`.
     - Render headline baru 3 baris: *Catat,* / *Simpan,* / *Ulangi.*
     - Hapus banner jaminan privasi lama dari kolom kiri.
     - Hapus badge `Sistem Privat Berbasis Undangan` dari kartu login Google OAuth.
     - Tambahkan accordion interaktif `Akses Privat Terjamin` tepat di atas footer dengan status buka-tutup halus.
