import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { storageDriver } from './utils/fileStore.js';
import { connectDB, dbStatus } from './config/db.js';
import { initRealtime } from './utils/realtime.js';
import { emailConfigured } from './utils/mailer.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import applicationRoutes from './routes/applications.js';
import resumeRoutes from './routes/resumes.js';
import reminderRoutes from './routes/reminders.js';
import settingsRoutes from './routes/settings.js';
import stageHistoryRoutes from './routes/stageHistory.js';
import userRoutes from './routes/users.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;

const corsOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// CLIENT_ORIGIN supports wildcards, e.g. "https://job-arena.vercel.app,https://*.vercel.app"
// (the wildcard entry lets Vercel preview deployments talk to the API).
const originAllowed = (origin) =>
  corsOrigins.some((pattern) => {
    if (pattern === origin) return true;
    if (!pattern.includes('*')) return false;
    const re = new RegExp('^' + pattern.split('*').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^.]+') + '$');
    return re.test(origin);
  });

async function main() {
  await connectDB();

  // Optional: create a demo account with sample data on boot (great with USE_MEMORY_DB)
  if (process.env.SEED_DEMO === 'true') {
    const { seedDemo } = await import('./seed.js');
    await seedDemo();
  }

  const app = express();
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin(origin, cb) {
        // allow same-origin / server-to-server (no Origin header), configured origins, and *.e2b.app previews
        if (!origin || originAllowed(origin) || /\.e2b\.app$/.test(new URL(origin).hostname)) return cb(null, true);
        cb(new Error(`CORS blocked for origin ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  // Health check: the React app uses this for its "Database Ready & Active" indicator
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      db: dbStatus(),
      configured: dbStatus() === 'connected',
      email: emailConfigured() ? 'configured' : 'console',
      time: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/resumes', resumeRoutes);
  app.use('/api/reminders', reminderRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/stage-history', stageHistoryRoutes);
  app.use('/api/users', userRoutes);

  // In production serve the built React app from client/dist
  const clientDist = path.resolve(__dirname, '../../client/dist');
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }

  app.use('/api', notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  initRealtime(server, (origin, cb) => cb(null, true));

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[server] StatusHired API running at http://0.0.0.0:${PORT}`);
    console.log(`[server] Allowed client origins: ${corsOrigins.join(', ')}`);
    console.log(`[server] File storage: ${storageDriver()}`);
    if (!emailConfigured()) console.log('[server] Email not configured: sign-up OTP codes will be printed here.');
  });
}

main().catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
