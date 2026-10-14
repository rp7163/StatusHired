import nodemailer from 'nodemailer';

function otpHtml(code) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1D1D1F">
    <h2 style="margin:0 0 8px;font-size:22px">Status<span style="color:#10B981">Hired</span></h2>
    <p style="margin:0 0 24px;color:#86868B">Use this code to finish creating your account.</p>
    <div style="font-size:36px;letter-spacing:10px;font-weight:700;background:#F2F2F7;border-radius:16px;padding:20px;text-align:center">${code}</div>
    <p style="margin:24px 0 0;color:#86868B;font-size:13px">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
  </div>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const to = String(body.to || '').trim();
    const code = String(body.code || '').trim();
    const user = String(body.user || process.env.GMAIL_USER || '').trim();
    const pass = String(body.pass || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (!to || !/^\d{6}$/.test(code) || !user || !pass) {
      return res.status(400).json({ ok: false, error: 'Missing required fields (to, 6-digit code, user, pass).' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `StatusHired <${user}>`,
      to,
      subject: `${code} is your StatusHired verification code`,
      text: `Your StatusHired verification code is ${code}. It expires in 10 minutes.`,
      html: otpHtml(code),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[vercel-mail-relay] Gmail send failed:', err.message);
    return res.status(502).json({ ok: false, error: err.message || 'Could not send email via Gmail SMTP.' });
  }
}