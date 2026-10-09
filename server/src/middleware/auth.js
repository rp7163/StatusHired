import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const SECRET = () => process.env.JWT_SECRET || 'dev-insecure-secret-change-me';

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), email: user.email }, SECRET(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET());
}

/** Short-lived token used for "signed URLs" (resume preview/download). */
export function signFileToken(payload, expiresInSeconds) {
  return jwt.sign({ ...payload, kind: 'file' }, SECRET(), { expiresIn: expiresInSeconds });
}

/**
 * Express middleware: requires `Authorization: Bearer <jwt>`.
 * Attaches `req.user` (mongoose doc) and `req.userId` (string).
 * This is the MERN equivalent of Supabase Row Level Security: every route
 * then scopes its queries by `req.userId`.
 */
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = verifyToken(token);
    if (payload.kind === 'file') return res.status(401).json({ error: 'Invalid token' });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}
