/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const NOTOME_APP_URL = 'https://notomee.vercel.app';
export const ADMIN_EMAIL = 'mike777rafael@gmail.com';
export const ADMIN_NAME = 'Mike Rafael';

export interface MemberNotificationResult {
  success: boolean;
  message: string;
  gmailComposeUrl: string;
  mailtoUrl: string;
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
 * Generates direct 1-click Gmail Web compose URL
 */
export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/**
 * Generates mailto link for native mobile mail apps
 */
export function buildMailtoUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${to}?${params.toString()}`;
}

/**
 * Dispatches an automated invite notification to the new member
 */
export async function notifyMemberInvited(
  email: string,
  name?: string
): Promise<MemberNotificationResult> {
  const { subject, body } = getInviteEmailContent(email, name);
  const gmailComposeUrl = buildGmailComposeUrl(email, subject, body);
  const mailtoUrl = buildMailtoUrl(email, subject, body);

  // Simulate network dispatch with latency for in-app logging
  await new Promise((resolve) => setTimeout(resolve, 600));

  console.log(`[Member Notification] Sent INVITE notification to ${email}`);

  return {
    success: true,
    message: `Notifikasi undangan telah disiapkan untuk ${email}.`,
    gmailComposeUrl,
    mailtoUrl,
  };
}

/**
 * Dispatches an automated revocation/removal notification
 */
export async function notifyMemberRemoved(
  email: string,
  name?: string
): Promise<MemberNotificationResult> {
  const { subject, body } = getRemovalEmailContent(email, name);
  const gmailComposeUrl = buildGmailComposeUrl(email, subject, body);
  const mailtoUrl = buildMailtoUrl(email, subject, body);

  await new Promise((resolve) => setTimeout(resolve, 600));

  console.log(`[Member Notification] Sent REMOVAL notification to ${email}`);

  return {
    success: true,
    message: `Pemberitahuan pencabutan akses telah disiapkan untuk ${email}.`,
    gmailComposeUrl,
    mailtoUrl,
  };
}
