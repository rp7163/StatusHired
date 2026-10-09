import { Router } from 'express';
import multer from 'multer';
import { Resume, Application } from '../models/index.js';
import { saveFile, deleteFile, sendStoredFile, uploadRoot } from '../utils/fileStore.js';
import { requireAuth, signFileToken, verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notify } from '../utils/realtime.js';

const router = Router();
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, same as the original

export { uploadRoot };

// Files are buffered in memory (≤ 5 MB) and then persisted by utils/fileStore.js
// (GridFS inside MongoDB by default, so they survive redeploys).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) return cb(Object.assign(new Error('Only PDF resumes are supported'), { status: 400 }));
    cb(null, true);
  },
});

// ---------- Public-ish: file streaming with a short-lived signed token ----------
// GET /api/resumes/:id/file?token=<signed>
router.get(
  '/:id/file',
  asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = verifyToken(String(req.query.token || ''));
    } catch {
      return res.status(401).json({ error: 'Link expired. Please open the resume again.' });
    }
    if (payload.kind !== 'file' || payload.resumeId !== req.params.id) return res.status(401).json({ error: 'Invalid link' });

    const doc = await Resume.findOne({ _id: req.params.id, user_id: payload.sub });
    if (!doc) return res.status(404).json({ error: 'Resume not found' });

    const sent = await sendStoredFile(res, doc.file_path, {
      contentType: 'application/pdf',
      filename: doc.name.endsWith('.pdf') ? doc.name : doc.name + '.pdf',
      disposition: req.query.download === '1' ? 'attachment' : 'inline',
    });
    if (!sent) return res.status(404).json({ error: 'File missing on server' });
  })
);

// ---------- Authenticated ----------
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const docs = await Resume.find({ user_id: req.userId }).sort({ created_at: -1 });
    res.json(docs);
  })
);

// POST /api/resumes  multipart: file=<pdf>, name=<optional display name>
router.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const displayName = (req.body?.name && String(req.body.name).trim()) || req.file.originalname;
    const key = await saveFile({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      contentType: 'application/pdf',
      userId: req.userId,
      kind: 'resume',
    });

    try {
      const doc = await Resume.create({ user_id: req.userId, name: displayName, file_path: key, size_bytes: req.file.size });
      notify(req.userId, 'resumes', 'INSERT');
      res.status(201).json(doc);
    } catch (err) {
      // avoid orphaned files if the DB insert fails
      await deleteFile(key);
      throw err;
    }
  })
);

// GET /api/resumes/:id/url?expires=60  -> { url } (equivalent of createSignedUrl)
router.get(
  '/:id/url',
  asyncHandler(async (req, res) => {
    const doc = await Resume.findOne({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Resume not found' });
    const expires = Math.min(Math.max(parseInt(req.query.expires, 10) || 60, 10), 3600);
    const token = signFileToken({ sub: req.userId, resumeId: String(doc._id) }, expires);
    const download = req.query.download === '1' ? '&download=1' : '';
    res.json({ url: `/api/resumes/${doc._id}/file?token=${token}${download}`, expiresIn: expires });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Resume name cannot be empty' });
    const doc = await Resume.findOneAndUpdate({ _id: req.params.id, user_id: req.userId }, { $set: { name } }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Resume not found' });
    notify(req.userId, 'resumes', 'UPDATE');
    res.json(doc);
  })
);

// DELETE: removes the file + row; applications referencing it get resume_id = null (on delete set null)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Resume.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Resume not found' });
    await deleteFile(doc.file_path);
    await Application.updateMany({ user_id: req.userId, resume_id: doc._id }, { $set: { resume_id: null } });
    notify(req.userId, 'resumes', 'DELETE');
    notify(req.userId, 'applications', 'UPDATE');
    res.json({ success: true });
  })
);

export default router;
