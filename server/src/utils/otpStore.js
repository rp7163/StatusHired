import crypto from 'node:crypto';
import { sendOtpEmail } from './mailer.js';

/**
 * In-memory pending sign-ups (same design as the original server.ts):
 *  - codes are stored hashed, expire after 10 minutes, burned after 5 wrong attempts
 *  - resend cooldown 30s, max 5 emails per address per hour
 *  - per-IP rate limit
 * A server restart cancels pending sign-ups.
 */
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const IP_WINDOW_MS = 15 * 60 * 1000;
const IP_MAX_REQUESTS = 40;

const pending = new Map(); // email -> { codeHash, password, expiresAt, attempts, lastSentAt, sends[] }
const ipHits = new Map(); // ip -> timestamps[]

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashCode = (code) => crypto.createHash('sha256').update(`${code}:${process.env.JWT_SECRET || ''}`).digest('hex');

export function ipLimited(ip) {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < IP_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > IP_MAX_REQUESTS;
}

// Periodic cleanup so the maps don't grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [email, rec] of pending) if (now > rec.expiresAt) pending.delete(email);
  for (const [ip, hits] of ipHits) {
    const live = hits.filter((t) => now - t < IP_WINDOW_MS);
    if (live.length) ipHits.set(ip, live);
    else ipHits.delete(ip);
  }
}, 60 * 1000).unref();

export async function issueCode(email, password) {
  const now = Date.now();
  const existing = pending.get(email);

  if (existing) {
    const since = now - existing.lastSentAt;
    if (since < RESEND_COOLDOWN_MS) {
      const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - since) / 1000);
      return { status: 429, body: { success: false, error: `Please wait ${retryAfter}s before requesting another code.`, retryAfter } };
    }
    const recent = existing.sends.filter((t) => now - t < 60 * 60 * 1000);
    if (recent.length >= MAX_SENDS_PER_HOUR) {
      return { status: 429, body: { success: false, error: 'Too many codes requested. Try again in an hour.' } };
    }
  } else if (!password) {
    return { status: 400, body: { success: false, error: 'No pending sign-up for this email. Please start again.' } };
  }

  const pw = password ?? existing.password;
  const code = crypto.randomInt(100000, 1000000).toString();
  const record = {
    codeHash: hashCode(code),
    password: pw,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
    sends: [...(existing?.sends || []), now],
  };

  const sent = await sendOtpEmail(email, code);
  if (!sent.ok) return { status: 502, body: { success: false, error: sent.error } };

  pending.set(email, record);
  // EXPOSE_DEV_OTP=true (dev/test only, never in production) echoes the code so the
  // automated test-suite can complete sign-up without reading the terminal.
  const expose = sent.dev && process.env.EXPOSE_DEV_OTP === 'true' && process.env.NODE_ENV !== 'production';
  return { status: 200, body: { success: true, ...(sent.dev ? { devNote: 'Code printed in server terminal' } : {}), ...(expose ? { dev_code: code } : {}) } };
}

export function updatePendingPassword(email, password) {
  const prev = pending.get(email);
  if (prev) prev.password = password;
}

/** Returns { ok, password } or { ok:false, error } */
export function consumeCode(email, code) {
  const rec = pending.get(email);
  if (!rec || Date.now() > rec.expiresAt) {
    pending.delete(email);
    return { ok: false, error: 'Code expired or not found. Please request a new code.' };
  }
  const a = Buffer.from(hashCode(code));
  const b = Buffer.from(rec.codeHash);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    rec.attempts += 1;
    if (rec.attempts >= MAX_ATTEMPTS) {
      pending.delete(email);
      return { ok: false, error: 'Too many wrong attempts. Please request a new code.' };
    }
    return { ok: false, error: 'Incorrect code. Please try again.' };
  }
  pending.delete(email);
  return { ok: true, password: rec.password };
}
