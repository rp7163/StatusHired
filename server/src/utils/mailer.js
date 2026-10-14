import nodemailer from 'nodemailer';

let transporter = null;

function gmailTransport() {
  if (transporter) return transporter;
  const user = (process.env.GMAIL_USER || '').trim();
  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: { user, pass },
  });
  return transporter;
}

function otpHtml(code) {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1D1D1F">
    <h2 style="margin:0 0 8px;font-size:22px">Status<span style="color:#10B981">Hired</span></h2>
    <p style="margin:0 0 24px;color:#86868B">Use this code to finish creating your account.</p>
    <div style="font-size:36px;letter-spacing:10px;font-weight:700;background:#F2F2F7;border-radius:16px;padding:20px;text-align:center">${code}</div>
    <p style="margin:24px 0 0;color:#86868B;font-size:13px">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
  </div>`;
}

function resolveVercelRelayUrl() {
  if (process.env.VERCEL_MAIL_RELAY_URL) {
    return process.env.VERCEL_MAIL_RELAY_URL.trim().replace(/\/$/, '');
  }
  const origins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter((s) => s.startsWith('https://') && !s.includes('*'));
  const origin = origins[0] || 'https://status-hired.vercel.app';
  return `${origin}/api/send-mail`;
}

async function sendViaVercelRelay(to, code) {
  const relayUrl = resolveVercelRelayUrl();
  const res = await fetch(relayUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      code,
      user: process.env.GMAIL_USER.trim(),
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `Vercel relay HTTP ${res.status}`);
  }
}

export async function sendOtpEmail(to, code) {
  const subject = `${code} is your StatusHired verification code`;
  const html = otpHtml(code);
  const text = `Your StatusHired verification code is ${code}. It expires in 10 minutes.`;

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const isRenderOrProd = Boolean(process.env.RENDER || process.env.NODE_ENV === 'production');

    // On Render/production: use the Vercel HTTPS relay (/api/send-mail) first because
    // Render Free Tier blocks SMTP port 465, whereas Vercel allows it.
    if (isRenderOrProd) {
      try {
        await sendViaVercelRelay(to, code);
        return { ok: true };
      } catch (relayErr) {
        console.warn('[mail] Vercel HTTPS relay failed, trying direct Gmail SMTP:', relayErr.message);
      }
    }

    // Local development (or fallback): direct Gmail SMTP
    try {
      await gmailTransport().sendMail({
        from: `StatusHired <${process.env.GMAIL_USER.trim()}>`,
        to,
        subject,
        text,
        html,
      });
      return { ok: true };
    } catch (smtpErr) {
      console.error('[mail] Direct Gmail SMTP failed:', smtpErr.message);
      if (!isRenderOrProd) {
        try {
          await sendViaVercelRelay(to, code);
          return { ok: true };
        } catch {
          // ignore backup error
        }
      }
      return { ok: false, error: 'Could not send verification email. Check GMAIL_* settings.' };
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'StatusHired <onboarding@resend.dev>',
          to,
          subject,
          html,
          text,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        console.error('[mail] Resend failed:', res.status, body);
        return { ok: false, error: 'Could not send verification email. Check RESEND_* settings.' };
      }
      return { ok: true };
    } catch (err) {
      console.error('[mail] Resend error:', err.message);
      return { ok: false, error: 'Could not reach the email service.' };
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('\n==========================================');
    console.log(`  [DEV] Sign-up OTP for ${to}:  ${code}`);
    console.log('  (configure GMAIL_* or RESEND_* in .env to send real emails)');
    console.log('==========================================\n');
    return { ok: true, dev: true };
  }

  return { ok: false, error: 'Email is not configured on the server.' };
}

export const emailConfigured = () =>
  Boolean((process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) || process.env.RESEND_API_KEY);