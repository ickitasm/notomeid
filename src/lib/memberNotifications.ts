/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const NOTOME_APP_URL = 'https://notomee.vercel.app';
export const ADMIN_EMAIL = 'mike777rafael@gmail.com';
export const ADMIN_NAME = 'Mike Rafael';

export interface MemberNotificationResult {
  success: boolean;
  automated: boolean;
  message: string;
  gmailComposeUrl: string;
  mailtoUrl: string;
  subject?: string;
  body?: string;
}

/**
 * Generates official invitation email subject & body
 */
export function getInviteEmailContent(recipientEmail: string, recipientName?: string) {
  const greeting = recipientName ? `Halo ${recipientName},` : 'Halo,';
  const subject = `[Notome] Akun Google Anda Telah Didaftarkan (Akses Diberikan)`;
  const body = `${greeting}

Akun Google Anda (${recipientEmail}) telah berhasil didaftarkan dan disetujui untuk mengakses Notome Sanctuary secara pribadi.

Anda dapat langsung masuk melalui tautan resmi Notome:
${NOTOME_APP_URL}

Langkah login:
1. Buka tautan di atas: ${NOTOME_APP_URL}
2. Klik tombol "Lanjutkan dengan Google"
3. Pilih akun Google Anda (${recipientEmail})

Catatan Keamanan & Privasi:
Seluruh data pelacakan film, nutrisi, hewan peliharaan, dan kalender Anda terisolasi secara privat di akun Anda sendiri.

Salam hangat,
${ADMIN_NAME}
Primary Admin — Notome Sanctuary
${ADMIN_EMAIL}`;

  return { subject, body };
}

/**
 * Generates official removal / revocation email subject & body
 */
export function getRemovalEmailContent(recipientEmail: string, recipientName?: string) {
  const greeting = recipientName ? `Halo ${recipientName},` : 'Halo,';
  const subject = `[Notome] Pemberitahuan: Akses Akun Anda Telah Dinonaktifkan`;
  const body = `${greeting}

Kami menginformasikan bahwa izin akses untuk akun Google Anda (${recipientEmail}) pada Notome Sanctuary (${NOTOME_APP_URL}) telah dinonaktifkan / dihapus oleh Primary Admin.

Jika Anda merasa ini adalah kekeliruan atau ingin mengajukan permohonan akses kembali, silakan hubungi admin langsung melalui balasan email ini atau ke ${ADMIN_EMAIL}.

Terima kasih atas pengertian Anda.

Salam,
${ADMIN_NAME}
Primary Admin — Notome Sanctuary
${ADMIN_EMAIL}`;

  return { subject, body };
}

/**
 * Generates RFC-compliant mailto URI for direct native email apps (Gmail on Android & iOS)
 */
export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${encodeURIComponent(to)}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * Generates direct Gmail compose URI (Uses direct native mailto protocol so Android/iOS
 * immediately intercepts and launches the native Gmail application instead of legacy webmail)
 */
export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  return buildMailtoUrl(to, subject, body);
}

/**
 * Directly launches the native Gmail app on mobile devices (Android/iOS)
 * without opening a blank browser tab or navigating to legacy basic HTML webmail.
 */
export function openNativeGmailApp(to: string, subject: string, body: string) {
  const mailtoUri = buildMailtoUrl(to, subject, body);

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);

    if (isIOS) {
      // Attempt iOS Gmail URL scheme first
      const gmailScheme = `googlegmail:///co?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const fallbackTimer = setTimeout(() => {
        window.location.href = mailtoUri;
      }, 400);

      try {
        window.location.href = gmailScheme;
        return;
      } catch {
        clearTimeout(fallbackTimer);
        window.location.href = mailtoUri;
        return;
      }
    }
  }

  // On Android (Chrome, Firefox, etc.) and mobile devices, setting location to mailto:
  // immediately triggers Android's native intent dispatcher directly into the Gmail app!
  window.location.href = mailtoUri;
}

/**
 * Dispatches automated invite notification (Serverless Background API + Native Gmail Fallback)
 */
export async function notifyMemberInvited(
  email: string,
  name?: string
): Promise<MemberNotificationResult> {
  const { subject, body } = getInviteEmailContent(email, name);
  const mailtoUrl = buildMailtoUrl(email, subject, body);
  const gmailComposeUrl = buildGmailComposeUrl(email, subject, body);

  // Try background serverless dispatch
  try {
    const res = await fetch('/api/send-member-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, type: 'invite', name }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.automated && data.success) {
        return {
          success: true,
          automated: true,
          message: data.message || `Email undangan otomatis terkirim langsung ke ${email}!`,
          gmailComposeUrl,
          mailtoUrl,
          subject,
          body,
        };
      }
    }
  } catch (err) {
    console.info('Auto email endpoint not active yet. Using native Gmail app dispatch.', err);
  }

  return {
    success: true,
    automated: false,
    message: `Akun ${email} berhasil didaftarkan. Siap dikirimkan notifikasi via aplikasi Gmail.`,
    gmailComposeUrl,
    mailtoUrl,
    subject,
    body,
  };
}

/**
 * Dispatches automated revocation/removal notification (Serverless Background API + Native Gmail Fallback)
 */
export async function notifyMemberRemoved(
  email: string,
  name?: string
): Promise<MemberNotificationResult> {
  const { subject, body } = getRemovalEmailContent(email, name);
  const mailtoUrl = buildMailtoUrl(email, subject, body);
  const gmailComposeUrl = buildGmailComposeUrl(email, subject, body);

  // Try background serverless dispatch
  try {
    const res = await fetch('/api/send-member-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, type: 'removal', name }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.automated && data.success) {
        return {
          success: true,
          automated: true,
          message: data.message || `Email pencabutan akses otomatis terkirim ke ${email}.`,
          gmailComposeUrl,
          mailtoUrl,
          subject,
          body,
        };
      }
    }
  } catch (err) {
    console.info('Auto email endpoint not active yet. Using native Gmail app dispatch.', err);
  }

  return {
    success: true,
    automated: false,
    message: `Akses untuk ${email} telah dicabut.`,
    gmailComposeUrl,
    mailtoUrl,
    subject,
    body,
  };
}
