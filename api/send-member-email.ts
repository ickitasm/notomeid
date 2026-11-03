/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      // ignore
    }
  }

  const { to, type, name } = body || {};
  if (!to) {
    res.status(400).json({ error: 'Missing recipient email' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(200).json({
      success: false,
      automated: false,
      message: 'RESEND_API_KEY belum dikonfigurasi di Vercel. Menggunakan mode kirim via Gmail.',
    });
    return;
  }

  const isInvite = type === 'invite' || type === 'invited';
  const greeting = name ? `Halo ${name},` : 'Halo,';
  const subject = isInvite
    ? '[Notome] Akun Google Anda Telah Didaftarkan (Akses Diberikan)'
    : '[Notome] Pemberitahuan: Akses Akun Anda Telah Dinonaktifkan';

  const emailText = isInvite
    ? `${greeting}

Akun Google Anda (${to}) telah berhasil didaftarkan dan disetujui untuk mengakses Notome Sanctuary secara pribadi.

Anda dapat langsung masuk melalui tautan resmi Notome:
https://notomee.vercel.app

Langkah login:
1. Buka tautan: https://notomee.vercel.app
2. Klik tombol "Lanjutkan dengan Google"
3. Pilih akun Google Anda (${to})

Catatan Keamanan & Privasi:
Seluruh data pelacakan film, nutrisi, hewan peliharaan, dan kalender Anda terisolasi secara privat di akun Anda sendiri.

Salam hangat,
Mike Rafael
Primary Admin — Notome Sanctuary
mike777rafael@gmail.com`
    : `${greeting}

Kami menginformasikan bahwa izin akses untuk akun Google Anda (${to}) pada Notome Sanctuary (https://notomee.vercel.app) telah dinonaktifkan / dihapus oleh Admin.

Jika Anda merasa ini adalah kekeliruan atau ingin mengajukan permohonan akses kembali, silakan hubungi admin di mike777rafael@gmail.com.

Terima kasih atas pengertian Anda.

Salam,
Mike Rafael
Primary Admin — Notome Sanctuary
mike777rafael@gmail.com`;

  try {
    const fromAddress = process.env.EMAIL_FROM || 'Notome Sanctuary <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        text: emailText,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Resend API error:', data);
      res.status(200).json({
        success: false,
        automated: false,
        error: data.message || 'Gagal mengirim email via Resend API',
      });
      return;
    }

    res.status(200).json({
      success: true,
      automated: true,
      message: `Email notifikasi berhasil dikirim secara otomatis ke ${to}!`,
      id: data.id,
    });
  } catch (err: any) {
    console.error('Email dispatch exception:', err);
    res.status(200).json({
      success: false,
      automated: false,
      error: err.message || 'Terjadi kendala saat mengirim email otomatis.',
    });
  }
}
