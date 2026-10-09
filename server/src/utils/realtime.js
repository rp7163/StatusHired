import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';

/**
 * Socket.io replaces Supabase Realtime. Each authenticated socket joins a
 * private room `user:<id>`; mutations call `notify(userId, table)` and the
 * React app refetches the affected collection.
 */
let io = null;

export function initRealtime(httpServer, corsOrigins) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigins, credentials: true },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('unauthorized'));
      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
  });

  return io;
}

export function notify(userId, table, event = '*') {
  if (!io) return;
  io.to(`user:${userId}`).emit('change', { table, event, at: Date.now() });
}
