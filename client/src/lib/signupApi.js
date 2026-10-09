/**
 * Thin client for the server-side signup OTP endpoints (see server/src/routes/auth.js).
 * The browser never generates, stores or sees the OTP — it only submits what
 * the user types and the server decides.
 */
import { API_BASE } from './api.js';

async function post(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) return { ok: true, token: data.token, user: data.user, devNote: data.devNote };
    return { ok: false, error: data.error || 'Request failed. Please try again.', retryAfter: data.retryAfter };
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' };
  }
}

export const requestSignupOtp = (email, password) => post('/auth/signup/request', { email, password });

export const resendSignupOtp = (email) => post('/auth/signup/resend', { email });

export const verifySignupOtp = (email, code) => post('/auth/signup/verify', { email, code });
