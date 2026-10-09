/**
 * File storage for resumes & profile photos.
 *
 * Default driver: **GridFS** — files are stored inside MongoDB (Atlas), so they survive
 * redeploys / restarts on hosts with ephemeral disks (Render, Railway, Fly, …) and are
 * backed up together with the rest of your data.
 *
 * Alternative:  FILE_STORAGE=disk  → files go to <UPLOAD_DIR>/ on the local filesystem
 * (fine for local development or a VPS with a persistent disk).
 *
 * Storage keys saved in the DB:
 *   "gridfs:<ObjectId>"          → GridFS file
 *   "<userId>/<uuid>-name.pdf"   → legacy/disk path (still readable, so old uploads keep working)
 */
import mongoose from 'mongoose';
import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import crypto from 'node:crypto';
import { Readable } from 'node:stream';

const DRIVER = (process.env.FILE_STORAGE || 'gridfs').toLowerCase();
const BUCKET = 'uploads';

export const uploadRoot = () => path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
export const isGridKey = (key) => typeof key === 'string' && key.startsWith('gridfs:');

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET });
const toId = (key) => new mongoose.Types.ObjectId(key.slice('gridfs:'.length));

/**
 * Persist a buffer. Returns the storage key to save on the document.
 * @param {{ buffer: Buffer, filename: string, contentType: string, userId: string, kind: 'resume'|'avatar', folder?: string }} file
 */
export async function saveFile({ buffer, filename, contentType, userId, kind, folder }) {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (DRIVER === 'disk') {
    const dir = path.join(uploadRoot(), folder || userId);
    await fsp.mkdir(dir, { recursive: true });
    const name = `${crypto.randomUUID()}-${safeName}`;
    await fsp.writeFile(path.join(dir, name), buffer);
    return path.join(folder || userId, name).split(path.sep).join('/');
  }

  const id = await new Promise((resolve, reject) => {
    const up = bucket().openUploadStream(safeName, {
      contentType,
      metadata: { user_id: String(userId), kind, uploaded_at: new Date() },
    });
    Readable.from(buffer).pipe(up).on('error', reject).on('finish', () => resolve(up.id));
  });
  return `gridfs:${id.toString()}`;
}

/**
 * Open a stored file for streaming.
 * @returns {Promise<{ stream: import('stream').Readable, contentType?: string, length?: number } | null>}
 */
export async function openFile(key) {
  if (!key) return null;

  if (isGridKey(key)) {
    const id = toId(key);
    const [info] = await bucket().find({ _id: id }).limit(1).toArray();
    if (!info) return null;
    return { stream: bucket().openDownloadStream(id), contentType: info.contentType, length: info.length };
  }

  const abs = path.join(uploadRoot(), key);
  if (!fs.existsSync(abs)) return null;
  const stat = await fsp.stat(abs);
  return { stream: fs.createReadStream(abs), length: stat.size };
}

/** Delete one stored file (ignores missing files). */
export async function deleteFile(key) {
  if (!key) return;
  try {
    if (isGridKey(key)) await bucket().delete(toId(key));
    else await fsp.unlink(path.join(uploadRoot(), key));
  } catch {
    /* already gone */
  }
}

/** Delete every file that belongs to a user (account deletion). */
export async function deleteUserFiles(userId) {
  const uid = String(userId);
  try {
    const files = await bucket().find({ 'metadata.user_id': uid }).toArray();
    await Promise.all(files.map((f) => bucket().delete(f._id).catch(() => {})));
  } catch {
    /* no bucket yet */
  }
  await fsp.rm(path.join(uploadRoot(), uid), { recursive: true, force: true }).catch(() => {});
}

/** Pipe a stored file to an Express response with sensible headers. Returns false if not found. */
export async function sendStoredFile(res, key, { contentType, filename, disposition = 'inline', cacheControl = 'private, max-age=0' } = {}) {
  const file = await openFile(key);
  if (!file) return false;
  res.setHeader('Content-Type', contentType || file.contentType || 'application/octet-stream');
  if (file.length) res.setHeader('Content-Length', file.length);
  if (filename) res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Cache-Control', cacheControl);
  file.stream.on('error', () => { if (!res.headersSent) res.status(404).end(); else res.end(); });
  file.stream.pipe(res);
  return true;
}

export const storageDriver = () => (DRIVER === 'disk' ? 'disk' : 'gridfs (MongoDB)');
