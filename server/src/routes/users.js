import { Router } from 'express';
import { User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendStoredFile } from '../utils/fileStore.js';

const router = Router();

// GET /api/users/:id/avatar  (public; profile photos are not sensitive)
router.get(
  '/:id/avatar',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('avatar_path avatar_type');
    if (!user?.avatar_path) return res.status(404).json({ error: 'No avatar' });
    const sent = await sendStoredFile(res, user.avatar_path, {
      contentType: user.avatar_type || undefined,
      cacheControl: 'public, max-age=86400',
    });
    if (!sent) return res.status(404).json({ error: 'No avatar' });
  })
);

export default router;
