import { Router } from 'express';
import multer from 'multer';
import { User, UserSettings, Application, Resume, Reminder, StageHistory } from '../models/index.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { EMAIL_RE, ipLimited, issueCode, consumeCode, updatePendingPassword } from '../utils/otpStore.js';
import { saveFile, deleteFile, deleteUserFiles } from '../utils/fileStore.js';

const router = Router();

const ensureSettings = (userId) =>
  UserSettings.updateOne({ user_id: userId }, { $setOnInsert: { theme: 'system', browser_notifications: false } }, { upsert: true });

// ---------- Sign-up (OTP protected, identical flow to the original) ----------

// 1) Start signup: validate + email a code. NO account is created yet.
router.post(
  '/signup/request',
  asyncHandler(async (req, res) => {
    if (ipLimited(req.ip || 'unknown')) return res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    if (password.length < 6) return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, error: 'This email is already registered. Please sign in instead.' });
    }

    updatePendingPassword(email, password);
    const out = await issueCode(email, password);
    res.status(out.status).json(out.body);
  })
);

// 2) Resend a fresh code for an existing pending signup
router.post(
  '/signup/resend',
  asyncHandler(async (req, res) => {
    if (ipLimited(req.ip || 'unknown')) return res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ success: false, error: 'Invalid email.' });
    const out = await issueCode(email, null);
    res.status(out.status).json(out.body);
  })
);

// 3) Verify code -> only now create the user. Returns a session token.
router.post(
  '/signup/verify',
  asyncHandler(async (req, res) => {
    if (ipLimited(req.ip || 'unknown')) return res.status(429).json({ success: false, error: 'Too many requests. Try again later.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const code = String(req.body?.code || '').trim();
    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ success: false, error: 'Enter the 6-digit code.' });

    const result = consumeCode(email, code);
    if (!result.ok) return res.status(400).json({ success: false, error: result.error });

    if (await User.exists({ email })) {
      return res.status(409).json({ success: false, error: 'This email is already registered. Please sign in instead.' });
    }

    const user = await User.create({ email, password_hash: await User.hashPassword(result.password), email_confirmed: true });
    await ensureSettings(user._id);
    res.json({ success: true, token: signToken(user), user: user.toJSON() });
  })
);

// ---------- Sign-in / session ----------

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    if (ipLimited(req.ip || 'unknown')) return res.status(429).json({ error: 'Too many requests. Try again later.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const user = await User.findOne({ email }).select('+password_hash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    await ensureSettings(user._id);
    res.json({ token: signToken(user), user: user.toJSON() });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    await ensureSettings(req.user._id);
    res.json({ user: req.user.toJSON() });
  })
);

const PROFILE_FIELDS = [
  'full_name', 'username', 'headline', 'bio', 'location', 'phone', 'portfolio_url', 'resume_url',
  'github_url', 'linkedin_url', 'twitter_url', 'leetcode_url', 'codeforces_url', 'codechef_url',
];
const URL_FIELDS = PROFILE_FIELDS.filter((f) => f.endsWith('_url'));
const normalizeUrl = (v) => {
  const s = String(v || '').trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

// Update profile (name, username, bio, social links, ...)
router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const b = req.body || {};
    for (const f of PROFILE_FIELDS) {
      if (!(f in b)) continue;
      let v = b[f];
      if (typeof v !== 'string') v = v == null ? '' : String(v);
      v = v.trim();
      if (f === 'username') v = v.replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 30);
      if (f === 'bio') v = v.slice(0, 600);
      req.user[f] = URL_FIELDS.includes(f) ? normalizeUrl(v) : v || null;
    }
    if (Array.isArray(b.links)) {
      req.user.links = b.links
        .filter((l) => l && String(l.url || '').trim())
        .slice(0, 10)
        .map((l) => ({ label: String(l.label || '').trim().slice(0, 40) || 'Link', url: normalizeUrl(l.url) }));
    }
    if (typeof b.open_to_work === 'boolean') req.user.open_to_work = b.open_to_work;
    await req.user.save();
    res.json({ user: req.user.toJSON() });
  })
);

// ---------- Profile photo ----------
const AVATAR_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, cb) {
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      return cb(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images are allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});

router.post(
  '/me/avatar',
  requireAuth,
  avatarUpload.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const old = req.user.avatar_path;
    req.user.avatar_path = await saveFile({
      buffer: req.file.buffer,
      filename: `${req.userId}-${Date.now()}${AVATAR_EXT[req.file.mimetype] || '.jpg'}`,
      contentType: req.file.mimetype,
      userId: req.userId,
      kind: 'avatar',
      folder: '_avatars',
    });
    req.user.avatar_type = req.file.mimetype;
    await req.user.save();
    if (old) await deleteFile(old);
    res.json({ user: req.user.toJSON() });
  })
);

router.delete(
  '/me/avatar',
  requireAuth,
  asyncHandler(async (req, res) => {
    const old = req.user.avatar_path;
    req.user.avatar_path = null;
    req.user.avatar_type = null;
    await req.user.save();
    if (old) await deleteFile(old);
    res.json({ user: req.user.toJSON() });
  })
);

router.post('/logout', requireAuth, (_req, res) => res.json({ success: true }));

// Delete account + cascade all user data (replaces the `delete_user()` SQL function)
router.delete(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    await Promise.all([
      Reminder.deleteMany({ user_id: userId }),
      StageHistory.deleteMany({ user_id: userId }),
      Application.deleteMany({ user_id: userId }),
      Resume.deleteMany({ user_id: userId }),
      UserSettings.deleteMany({ user_id: userId }),
    ]);
    await deleteUserFiles(userId);
    if (req.user.avatar_path) await deleteFile(req.user.avatar_path);
    await User.deleteOne({ _id: userId });
    res.json({ success: true });
  })
);

export default router;
