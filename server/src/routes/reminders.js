import { Router } from 'express';
import { Reminder, Application, serializeReminder } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { notify } from '../utils/realtime.js';

const router = Router();
router.use(requireAuth);

const POPULATE = { path: 'application_id', select: 'company_name role stage' };

async function validateApp(appId, userId) {
  if (!appId) return null;
  const ok = await Application.exists({ _id: appId, user_id: userId });
  if (!ok) throw Object.assign(new Error('Application not found'), { status: 400 });
  return appId;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const docs = await Reminder.find({ user_id: req.userId }).sort({ remind_at: 1 }).populate(POPULATE);
    res.json(docs.map(serializeReminder));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, description, remind_at, application_id } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Title is required' });
    if (!remind_at || Number.isNaN(Date.parse(remind_at))) return res.status(400).json({ error: 'A valid remind_at date is required' });

    const doc = await Reminder.create({
      user_id: req.userId,
      application_id: await validateApp(application_id, req.userId),
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      remind_at: new Date(remind_at),
      is_done: false,
      notified: false,
    });
    await doc.populate(POPULATE);
    notify(req.userId, 'reminders', 'INSERT');
    res.status(201).json(serializeReminder(doc));
  })
);

// Bulk mark done: PATCH /api/reminders/bulk  { ids: [], is_done: true }
router.patch(
  '/bulk',
  asyncHandler(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const is_done = Boolean(req.body?.is_done);
    await Reminder.updateMany({ _id: { $in: ids }, user_id: req.userId }, { $set: { is_done } });
    notify(req.userId, 'reminders', 'UPDATE');
    res.json({ success: true, count: ids.length });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Reminder.findOne({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Reminder not found' });

    const b = req.body || {};
    if ('title' in b) doc.title = String(b.title || '').trim() || doc.title;
    if ('description' in b) doc.description = b.description ? String(b.description).trim() : null;
    if ('remind_at' in b && !Number.isNaN(Date.parse(b.remind_at))) doc.remind_at = new Date(b.remind_at);
    if ('application_id' in b) doc.application_id = await validateApp(b.application_id, req.userId);
    if ('is_done' in b) doc.is_done = Boolean(b.is_done);
    if ('notified' in b) doc.notified = Boolean(b.notified);

    await doc.save();
    await doc.populate(POPULATE);
    notify(req.userId, 'reminders', 'UPDATE');
    res.json(serializeReminder(doc));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await Reminder.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!doc) return res.status(404).json({ error: 'Reminder not found' });
    notify(req.userId, 'reminders', 'DELETE');
    res.json({ success: true });
  })
);

export default router;
