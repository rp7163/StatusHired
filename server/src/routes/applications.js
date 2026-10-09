import { Router } from 'express';
import { Application, StageHistory, Reminder, Resume, STAGES, serializeApplication } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notify } from '../utils/realtime.js';

const router = Router();
router.use(requireAuth);

const FIELDS = ['company_name', 'role', 'ctc', 'location', 'job_type', 'source', 'link', 'applied_date', 'stage', 'resume_id', 'notes', 'position'];

function pickBody(body, { partial = false } = {}) {
  const out = {};
  for (const key of FIELDS) {
    if (!(key in body)) continue;
    let v = body[key];
    if (typeof v === 'string') v = v.trim();
    if (v === '' || v === undefined) v = null;
    out[key] = v;
  }
  if (!partial) {
    if (!out.company_name) throw Object.assign(new Error('Company name is required'), { status: 400 });
    if (!out.role) throw Object.assign(new Error('Role is required'), { status: 400 });
    if (!out.stage) out.stage = 'saved';
  }
  if (out.stage != null && !STAGES.includes(out.stage)) {
    throw Object.assign(new Error('Invalid stage'), { status: 400 });
  }
  return out;
}

async function validateResume(resumeId, userId) {
  if (!resumeId) return null;
  const ok = await Resume.exists({ _id: resumeId, user_id: userId });
  return ok ? resumeId : null;
}

// GET /api/applications  (ordered by position asc, created_at desc; resume joined)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const docs = await Application.find({ user_id: req.userId }).sort({ position: 1, created_at: -1 }).populate('resume_id');
    res.json(docs.map(serializeApplication));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Application.findOne({ _id: req.params.id, user_id: req.userId }).populate('resume_id');
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    res.json(serializeApplication(doc));
  })
);

// POST /api/applications  (+ initial stage_history row, like the Postgres trigger)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = pickBody(req.body || {});
    data.resume_id = await validateResume(data.resume_id, req.userId);
    if (data.position == null) data.position = await Application.countDocuments({ user_id: req.userId });

    const doc = await Application.create({ ...data, user_id: req.userId });
    await StageHistory.create({ application_id: doc._id, user_id: req.userId, from_stage: null, to_stage: doc.stage });
    await doc.populate('resume_id');

    notify(req.userId, 'applications', 'INSERT');
    res.status(201).json(serializeApplication(doc));
  })
);

// PATCH /api/applications/:id  (records stage_history when stage changes)
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Application.findOne({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Application not found' });

    const updates = pickBody(req.body || {}, { partial: true });
    if ('resume_id' in updates) updates.resume_id = await validateResume(updates.resume_id, req.userId);

    const fromStage = doc.stage;
    Object.assign(doc, updates);
    await doc.save();

    if (updates.stage && updates.stage !== fromStage) {
      await StageHistory.create({ application_id: doc._id, user_id: req.userId, from_stage: fromStage, to_stage: updates.stage });
    }
    await doc.populate('resume_id');

    notify(req.userId, 'applications', 'UPDATE');
    res.json(serializeApplication(doc));
  })
);

// PATCH /api/applications/:id/stage  { stage }
router.patch(
  '/:id/stage',
  asyncHandler(async (req, res) => {
    const stage = req.body?.stage;
    if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
    const doc = await Application.findOne({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Application not found' });

    if (doc.stage !== stage) {
      const from = doc.stage;
      doc.stage = stage;
      await doc.save();
      await StageHistory.create({ application_id: doc._id, user_id: req.userId, from_stage: from, to_stage: stage });
      notify(req.userId, 'applications', 'UPDATE');
    }
    await doc.populate('resume_id');
    res.json(serializeApplication(doc));
  })
);

// PUT /api/applications/reorder  { items: [{id, position, stage?}] }
router.put(
  '/reorder',
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    await Promise.all(
      items.map(({ id, position }) => Application.updateOne({ _id: id, user_id: req.userId }, { $set: { position: Number(position) || 0 } }))
    );
    notify(req.userId, 'applications', 'UPDATE');
    res.json({ success: true });
  })
);

// DELETE /api/applications/:id  (cascade: stage_history + reminders)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Application.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Application not found' });
    await Promise.all([
      StageHistory.deleteMany({ application_id: doc._id }),
      Reminder.deleteMany({ application_id: doc._id }),
    ]);
    notify(req.userId, 'applications', 'DELETE');
    notify(req.userId, 'reminders', 'DELETE');
    res.json({ success: true });
  })
);

export default router;
