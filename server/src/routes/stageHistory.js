import { Router } from 'express';
import { StageHistory } from '../models/index.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

// GET /api/stage-history?application_id=...
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = { user_id: req.userId };
    if (req.query.application_id) filter.application_id = req.query.application_id;
    const rows = await StageHistory.find(filter).sort({ changed_at: -1 });
    res.json(rows);
  })
);

export default router;
