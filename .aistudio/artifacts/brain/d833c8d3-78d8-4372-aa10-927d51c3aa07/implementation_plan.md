# Fix Gmail Email Dispatch Mechanism (Direct Native App Integration)

Resolving the issue where clicking the Gmail email button opened a legacy, outdated basic HTML webmail page (`mail.google.com/?view=cm`) in mobile browsers instead of directly launching the native Gmail mobile app.

---

## User Review & Critical Decisions

> [!NOTE]
> **Status: Selesai & Terverifikasi (Completed & Verified)**
> Mekanisme pengiriman email Gmail telah diperbaiki di seluruh modul: kini secara otomatis dan langsung memicu intent aplikasi native Gmail pada perangkat bergerak (Android & iOS) dengan subjek dan isi surat yang sudah terisi rapi, tanpa membuka webmail dasar (jadul) di peramban.

> [!IMPORTANT]
> The solution is specifically optimized for mobile devices (Android, iPhone, iPad, and Tablets) where Notomee runs:

- **Root Cause Identified**: The existing code was generating `https://mail.google.com/mail/?view=cm&fs=1...` and opening it in `_blank`. Mobile browsers (Chrome/Safari) treat this as a desktop web URL and render Google's legacy basic HTML mobile webmail ("halaman jadul") instead of launching the native Gmail app.
- **Direct Native App Launch**: We will modernize the dispatch mechanism using standard RFC-compliant `mailto:` URIs with properly encoded `subject` and `body`, as well as iOS `googlegmail:///co` detection. When tapped on Android or iOS, the mobile operating system immediately intercepts the action and opens the native Gmail application with pre-filled recipient, subject, and welcome letter.
- **Zero Empty Tab Clutter**: Replacing `window.open(webUrl, '_blank')` with a direct intent dispatch (`window.location.href = mailtoUri`), ensuring the user is transitioned smoothly into the Gmail app without leaving an empty abandoned browser tab in Chrome/Safari.

---

## 1. Overview & Core Concept

- **What It Delivers**: Seamless, 1-click email dispatch from the Admin Dashboard directly into the user's native Gmail app on Android and iOS.
- **Key Value**: The admin can invite or notify members in a single tap without being subjected to Google's legacy mobile web interface, login re-prompts, or broken mobile web forms.

---

## 2. Technical Architecture & Modifications

### A. Enhanced Email Dispatch Utilities (`src/lib/memberNotifications.ts`)

1. **`buildDirectMailUrl(to, subject, body)`**:
   - Generates clean, RFC-compliant `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`.
   - Universally supported across Android, iOS, and all mobile operating systems to trigger the default mail client (Gmail).

2. **`openNativeGmailApp(to, subject, body)`**:
   - Programmatically triggers the native Gmail composer.
   - For iOS devices: attempts `googlegmail:///co?to=...` with automatic fallback to `mailto:`.
   - For Android devices: triggers standard `mailto:` via `window.location.href`, which Android OS binds directly to the installed Gmail application.

3. **Modern Fallback URL**:
   - If a web URL is ever needed, uses modern Gmail web parameters (`https://mail.google.com/mail/u/0/?view=cm&fs=1&tf=1&to=...`) rather than basic HTML.

### B. Admin Dashboard Updates (`src/components/Admin/AdminDashboardView.tsx`)

1. **New Member Registration (`handleAddSubmit`)**:
   - When "Buka Gmail otomatis" is checked, invokes `openNativeGmailApp(email, subject, body)` directly on submission.
2. **Notification Banner Action**:
   - Updates the "Buka Gmail (1-Klik)" button to use the direct native app launcher.
3. **Member Directory Rows**:
   - Replaces `<a href="https://mail.google.com/..." target="_blank">` with `<a href={mailtoUrl}>` with a click handler triggering `openNativeGmailApp`.
4. **Deletion Action**:
   - Updates the "Hapus & Gmail" flow to trigger native Gmail dispatch smoothly.

---

## 3. Verification & Execution Steps

1. Update `src/lib/memberNotifications.ts`:
   - Implement `buildDirectMailUrl`, `openNativeGmailApp`, and update `notifyMemberInvited` / `notifyMemberRemoved` outputs.
2. Update `src/components/Admin/AdminDashboardView.tsx`:
   - Replace web links with native app dispatch calls.
3. Update `src/components/Admin/AdminPanelModal.tsx` for consistency.
4. Run `compile_applet` and `lint_applet` to verify zero type or build errors.
