import { Router } from 'express';
import { UserSettings } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const doc = await UserSettings.findOneAndUpdate(
      { user_id: req.userId },
      { $setOnInsert: { theme: 'system', browser_notifications: false } },
      { upsert: true, new: true }
    );
    res.json(doc);
  })
);

// Upsert (mirrors supabase.from('user_settings').upsert(...))
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const update = {};
    if (['system', 'light', 'dark'].includes(req.body?.theme)) update.theme = req.body.theme;
    if (typeof req.body?.browser_notifications === 'boolean') update.browser_notifications = req.body.browser_notifications;
    const doc = await UserSettings.findOneAndUpdate({ user_id: req.userId }, { $set: update }, { upsert: true, new: true });
    res.json(doc);
  })
);

export default router;
