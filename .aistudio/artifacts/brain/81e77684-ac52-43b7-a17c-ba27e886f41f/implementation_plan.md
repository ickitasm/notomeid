# Rencana Implementasi: Modul Note (Catatan & Footnote) dan Modul Dream Catcher (Jurnal Mimpi & KPI Insight) — [SELESAI / COMPLETED]

Semua fitur pada Modul Note dan Modul Dream Catcher telah sukses diimplementasikan, terintegrasi ke navigasi desktop & mobile, halaman login depan, data layer lokal/cloud, dan terverifikasi 100% bebas error kompilasi dan lint.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan preferensi yang telah Anda konfirmasi:
> - **Penempatan Navigasi**: Tab penuh di navigasi utama desktop dan bilah menu mobile bawah (responsif dengan touch-target $\ge 44\text{px}$).
> - **Format Tampilan Modul Note**: Grid kartu catatan dengan filter kategori/tag, pin catatan penting di atas, dan footnote/catatan kaki rapi.
> - **KPI & Visualisasi Modul Dream Catcher**: Rasio emosi mimpi (gembira, datar, sedih), persentase tingkat lucidity, rasio mimpi buruk (nightmare), dan grafik tren intensitas mingguan.

---

## 1. Overview & Core Concept

### Modul 1: Personal Note & Footnotes
- **Tujuan**: Ruang pencatatan cepat, ide kreatif, riset, to-do memo, dan referensi penting.
- **Fitur Utama**:
  - Judul, isi catatan, dan daftar **Footnotes** (catatan kaki berindeks dengan preview/accordion).
  - Sistem pin (catatan berbintang selalu muncul di atas).
  - Kategori/Tags dinamis (`Ide`, `Pekerjaan`, `Pribadi`, `Riset`, `Jurnal`).
  - Pencarian instan (judul, isi teks, dan footnote).
  - Tampilan grid responsif bergaya editorial (Playfair Display + DM Sans).
  - Quick action: salin teks utuh beserta footnote ke clipboard dengan 1 klik.

### Modul 2: Dream Catcher & Sleep Insight
- **Tujuan**: Merekam dan menganalisis mimpi segera setelah bangun tidur untuk memantau kesehatan mental, pola tidur, dan kreativitas bawah sadar.
- **Fitur Utama**:
  - Formulir input mimpi:
    - Nama/Judul mimpi & tanggal/waktu bangun.
    - Cerita mimpi (tentang apa).
    - Tag tema mimpi (Terbang, Petualangan, Keluarga, Mistis, dsb.).
    - Rating emosi: **Gembira/Bahagia**, **Datar/Netral**, **Sedih**, atau **Cemas/Gelisah**.
    - Kejelasan visual (*Clarity*: skala 1–5 bintang).
    - Kesadaran mimpi (*Lucidity*: persentase kesadaran 0–100% / skala 1–5).
    - Checkbox: *Mimpi Berulang (Recurring Dream)*.
    - Checkbox: *Mimpi Buruk (Nightmare)*.
  - **KPI & Dashboard Insight**:
    - Kartu metrik: Total Mimpi, Rata-rata Lucidity (%), Rasio Mimpi Buruk (%), Frekuensi Mimpi Berulang.
    - Bar visual proporsi emosi mimpi (Gembira vs Datar vs Sedih).
    - Diagram tren mingguan (frekuensi mimpi 7 hari terakhir).
  - Sinkronisasi opsional ke Master Calendar jika mimpi dianggap signifikan.

---

## 2. User Experience & Visual Design

### A. Alur Navigasi Terpadu (Desktop & Mobile)
- **Desktop Header**: Bar 6 tab (`Film`, `Nutrisi`, `Anabul`, `Kalender`, `Catatan`, `Mimpi`) dengan status aktif beraksen warna tanah hangat, `whitespace-nowrap shrink-0`, dan transisi halus.
- **Mobile Bottom Bar**: Bilah navigasi 6 kolom responsif dengan icon (`StickyNote` untuk Note, `MoonStar` untuk Dream Catcher) dan label ringkas, menjaga area sentuh ergonomis tanpa layout shift.

### B. Halaman Depan Login (`AuthView.tsx`)
- Mengupgrade grid pilar fitur dari 4 pilar menjadi **6 Pilar Kehidupan Notome**:
  1. *Cinema & Series* (Pelacak episode & rating)
  2. *Nutrisi & Biometrik* (Kalori harian & hidrasi)
  3. *Perawatan Anabul* (Vaksin, medis, & jadwal obat)
  4. *Kalender Terpadu* (Agenda terpusat lintas pilar)
  5. *Catatan & Footnotes* (Memo editorial & anotasi terstruktur)
  6. *Dream Catcher & Sleep KPI* (Jurnal mimpi, emosi, & metrik lucid)

### C. Visual Identity & Theme
- **Gaya Desain**: Warm editorial minimalism (anti-slop, zero-pill text metadata, Playfair Display untuk judul, DM Sans untuk teks bacaan, JetBrains Mono untuk angka dan metrik tabular).
- **Aksen Warna**:
  - Note: Ochre / Amber warm accent (`#B45309` / `#D97706`).
  - Dream Catcher: Deep Indigo / Violet Twilight (`#6366F1` / `#4F46E5`).
- **Mode Gelap & Terang**: Mendukung kontras penuh (`dark:bg-[#161311]`, `dark:border-[#2D2722]`).

---

## 3. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                       Top Bar / Mobile Bar                      │
│   [Cinema] [Nutrition] [Pets] [Calendar] [Notes] [Dreams]       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       ┌──────────────────┐            ┌──────────────────┐
       │   Note Module    │            │  Dream Catcher   │
       │ ──────────────── │            │ ──────────────── │
       │ • Card Grid View │            │ • KPI Summary    │
       │ • Search & Tags  │            │ • Emotion Ratio  │
       │ • Pin Mechanism  │            │ • Lucidity Gauge │
       │ • Footnote Panel │            │ • Dream Journal  │
       │ • Modal Add/Edit │            │ • Weekly Trend   │
       └─────────┬────────┘            └─────────┬────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     ┌──────────────────────┐
                     │     useStorage()     │
                     │  (State + Fallback)  │
                     └──────────┬───────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│     Browser LocalStorage      │       │     Supabase Cloud Engine     │
│   'chronolife_notes_v1'       │       │ • public.notes                │
│   'chronolife_dreams_v1'      │       │ • public.dream_logs           │
│   (Instant Offline Access)    │       │ (Row Level Security Isolated) │
└───────────────────────────────┘       └───────────────────────────────┘
```

### Data Models (`src/types.ts`)

```typescript
export interface FootnoteItem {
  id: string;
  index: number;
  label: string;
  content: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'idea' | 'project' | 'personal' | 'research' | 'archive';
  tags: string[];
  isPinned: boolean;
  color?: string;
  footnotes: FootnoteItem[];
  createdAt: string;
  updatedAt: string;
}

export type DreamEmotion = 'happy' | 'neutral' | 'sad' | 'anxious';

export interface DreamLog {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  wakeTime?: string; // HH:mm
  tags: string[];
  emotion: DreamEmotion;
  clarityScore: number; // 1 - 5
  lucidityScore: number; // 1 - 5 (atau 0-100%)
  isRecurring: boolean;
  isNightmare: boolean;
  interpretationNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Database Schema Updates (`supabase_schema.sql`)
- Tabel `public.notes` dengan foreign key `user_id REFERENCES auth.users(id)` dan indeks `idx_notes_user`.
- Tabel `public.dream_logs` dengan foreign key `user_id REFERENCES auth.users(id)` dan indeks `idx_dreams_user`.
- Kebijakan RLS per-user (`Users access own notes`, `Users access own dreams`).

---

## 4. Implementation Steps

1. **Tipe Data & Seed Data**:
   - Tambahkan interface `NoteItem`, `FootnoteItem`, `DreamLog`, `DreamEmotion` di `src/types.ts`.
   - Tambahkan initial seed data berkualitas untuk catatan dan jurnal mimpi di `src/data/seedData.ts`.
2. **State & Storage Hook (`src/hooks/useStorage.ts`)**:
   - Tambahkan handler CRUD untuk notes (`addNote`, `updateNote`, `deleteNote`, `togglePinNote`).
   - Tambahkan handler CRUD untuk dream logs (`addDreamLog`, `updateDreamLog`, `deleteDreamLog`).
   - Tambahkan penyimpanan offline di `localStorage` dan persiapan sync Supabase.
3. **Komponen Modul Note**:
   - `src/components/Notes/NoteCard.tsx` (kartu catatan, pin badge, tag, preview footnote).
   - `src/components/Notes/NoteModal.tsx` (editor catatan dengan penambahan footnote dinamis).
   - `src/components/Notes/NotesView.tsx` (toolbar filter, search, grid pin vs reguler).
4. **Komponen Modul Dream Catcher**:
   - `src/components/DreamCatcher/DreamKpiDashboard.tsx` (metrik emosi, lucidity rate, nightmare %, tren mingguan).
   - `src/components/DreamCatcher/DreamModal.tsx` (form input mimpi, rating emosi, clarity slider, lucidity slider, checkbox).
   - `src/components/DreamCatcher/DreamCard.tsx` (kartu jurnal mimpi dengan badge emosi dan detail mimpi).
   - `src/components/DreamCatcher/DreamCatcherView.tsx` (tampilan utama modul mimpi).
5. **Navigasi & Header**:
   - Update `src/components/Navigation.tsx` untuk 6 tab (desktop & mobile).
   - Update `src/App.tsx` untuk rendering tab aktif `notes` dan `dreams`.
6. **Halaman Login & Showcase**:
   - Update `src/components/Auth/AuthView.tsx` untuk menampilkan 6 pilar fitur.
7. **Bilingual Translations**:
   - Tambahkan translasi lengkap Bahasa Indonesia & English di `src/lib/translations.ts`.
8. **Schema SQL**:
   - Perbarui `supabase_schema.sql` dengan script DDL dan RLS untuk tabel `notes` dan `dream_logs`.
9. **Verifikasi**:
   - Jalankan `compile_applet` dan `lint_applet` untuk memastikan zero errors.
