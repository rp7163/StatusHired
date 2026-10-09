export function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
  if (err?.name === 'ValidationError') return res.status(400).json({ error: err.message });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File exceeds the 5MB size limit' });
  if (err?.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}

/** Wrap async route handlers so rejections reach errorHandler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
