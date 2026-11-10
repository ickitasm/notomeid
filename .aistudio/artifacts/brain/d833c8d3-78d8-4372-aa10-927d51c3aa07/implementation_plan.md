# Executive Admin Dashboard (Full-Page Professional Admin Panel)

Transforming the Notomee Primary Admin management from a cramped popup dialog window into a dedicated, professional full-page Executive Admin Dashboard with an executive KPI strip, advanced member directory, maintenance controls with live broadcast announcement preview, and audit data export.

---

## User Review & Critical Decisions

> [!NOTE]
> **Status: Selesai & Terverifikasi (Completed & Verified)**
> Transformasi Panel Admin menjadi Halaman Penuh Eksekutif (Executive Admin Dashboard) lengkap dengan strip 4 KPI, ekspor CSV anggota, pratinjau siaran maintenance live, dan tombol kembali w-full telah berhasil dibangun dan lulus verifikasi kompilasi serta linting TypeScript.

> [!IMPORTANT]
> The architectural direction and scope have been confirmed based on user feedback:

- **Full-Page Architecture**: The Admin Panel will render as a primary dedicated full-page view inside the main content container (replacing `AdminPanelModal`), providing ample workspace for administrative data tables and system tools.
- **Return Navigation**: A prominent full-width (`w-full`) horizontal button at the top of the page with center-aligned text and arrow icon (`Kembali ke [Modul Sebelumnya]` / `Back to [Previous Module]`), matching the ergonomic standard in SettingsView.
- **Executive KPI Strip**: A 4-card metric overview displaying Total Whitelist Members, Active Authorized Members, Revoked/Suspended Access, and Global System Status (Online vs. Maintenance Paused).
- **New Crucial Features Included**:
  1. **Member Audit Export (CSV & JSON)**: One-click export of authorized accounts, registration timestamps, notes, and authorization status.
  2. **Maintenance Announcement Live Broadcast Preview**: A visual live simulation card showing exactly what non-admin members will see when maintenance mode is engaged.
  3. **Streamlined Member Directory**: Live search, status tabs (All, Active, Revoked), quick Gmail notification launcher, and clipboard invite generator.

---

## 1. Overview & Core Concept

- **What It Delivers**: A high-caliber SaaS/executive administrative console tailored exclusively for Primary Admin (`mike777rafael@gmail.com`).
- **Target Persona**: Primary Administrator managing invitations, member access security, database synchronizations, and system availability.
- **Key Value**: Professional desktop & tablet workspace with zero modal clipping, clear operational metrics, and proactive security management.

---

## 2. User Experience & Visual Design

### Page Layout & Spatial Structure

1. **Top Return Bar (Full-Width Navigation)**:
   - Centered, expansive return button (`w-full py-3 px-4 rounded-xl font-semibold text-sm border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] shadow-2xs`).
   - Dynamically tracks previous module (e.g., `Kembali ke Serial & Film`, `Kembali ke Peliharaan`, etc.).

2. **Executive Header**:
   - Clean display title: *Panel Eksekutif & Manajemen Santuari* (*Executive Admin Console*).
   - Primary Admin badge (`mike777rafael@gmail.com`) with Supabase cloud connection indicator and live refresh trigger.

3. **4-Metric KPI Strip**:
   - **Total Anggota Terdaftar**: Numeric count with quota indicator.
   - **Akses Aktif**: Active member count with green check indicator.
   - **Akses Dinonaktifkan**: Revoked count with caution badge.
   - **Status Santuari**: Realtime system state (`Sistem Berjalan Normal` vs `Mode Pemeliharaan Aktif`).

4. **Tabbed Workspace Sections**:
   - **Tab 1: Manajemen Anggota (Members & Invitations)**:
     - Search bar, status filters (Semua, Aktif, Dinonaktifkan), and CSV/JSON Export action.
     - New member authorization card with automated Gmail dispatch.
     - Clean, high-density member list with one-click actions: Open Gmail, Copy Invite Letter, Toggle Active/Revoked, and Delete.
   - **Tab 2: Mode Pemeliharaan (System Pause & Broadcast)**:
     - Global toggle to pause the sanctuary across all devices.
     - Custom announcement editor with a **Live Broadcast Banner Preview** simulating user view.
   - **Tab 3: Database & Skrip SQL (Supabase Security)**:
     - SQL migration scripts with one-click copy and direct link to the Supabase SQL editor.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Page View vs. Modal Dialog**
  - *Chosen Approach*: Replace modal dialog with full-page view managed by `isAdminOpen` in `App.tsx`.
  - *Why*: Modals suffer from vertical scroll limits, truncated tables, and poor mobile ergonomics when managing lists of users and complex configurations. Full-page layouts allow spacious typography, KPI cards, and dense tables.
- **Decision 2: CSV Data Export**
  - *Chosen Approach*: Browser-native CSV generator downloading `notomee-members-audit-[date].csv` without external backend requirements.
  - *Why*: Instant, secure, and privacy-respecting client-side export of authorized user lists.
- **Decision 3: Broadcast Banner Preview**
  - *Chosen Approach*: Live interactive preview card displaying the exact maintenance announcement banner that will appear for users.
  - *Why*: Prevents admin typos and ensures notices are crystal clear before activating system downtime.

---

## 4. Technical Architecture & Component Hierarchy

```
┌───────────────────────────────────────────────────────────────────┐
│ App.tsx                                                           │
│ ├─ Navigation (Admin button triggers setIsAdminOpen(true))        │
│ └─ Main Content Area:                                             │
│    ├─ (If isAdminOpen):                                           │
│    │  └─ AdminDashboardView.tsx                                   │
│    │     ├─ Full-Width Return Button (Back to [Module])           │
│    │     ├─ Header with Admin Identity & Live Sync Status         │
│    │     ├─ 4-Card Executive KPI Strip                            │
│    │     ├─ Tab Navigation [Anggota | Maintenance | Database]     │
│    │     └─ Tab Panes:                                            │
│    │        ├─ Tab 1: Member Directory, Search, CSV Export, Form │
│    │        ├─ Tab 2: System Pause Switch & Live Banner Preview   │
│    │        └─ Tab 3: Supabase SQL Setup & RLS Verification       │
│    ├─ (If isSettingsOpen): SettingsView.tsx                       │
│    └─ (Default): Active Pillar Views (Media, Nutrition, Pets, etc)│
└───────────────────────────────────────────────────────────────────┘
```

---

## Verification & Execution Steps

1. Create `src/components/Admin/AdminDashboardView.tsx` with:
   - Full-width return button.
   - 4-card executive KPI summary strip.
   - Enhanced member directory with live filtering, CSV/JSON export, and one-click Gmail invites.
   - Maintenance mode controls with live announcement banner preview.
   - Supabase SQL copy & reference tools.
2. Update `src/App.tsx`:
   - Replace `isAdminPanelOpen` modal state with `isAdminOpen` full-page routing.
   - When `isAdminOpen` is true, render `AdminDashboardView` with return navigation to `previousTabName`.
   - Update `Navigation.tsx` hooks so clicking "Admin" opens the full page.
3. Validate and verify using `compile_applet` and `lint_applet`.
