import { io } from 'socket.io-client';
import { getToken } from './api.js';

let socket = null;
let currentToken = null;

function ensureSocket() {
  const token = getToken();
  if (!token) return null;
  if (socket && currentToken === token) return socket;

  if (socket) socket.disconnect();
  currentToken = token;
  socket = io(import.meta.env.VITE_API_URL || '/', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelayMax: 10000,
  });
  return socket;
}

/**
 * subscribe(['applications','reminders'], ({table,event}) => refetch())
 * Returns an unsubscribe function.
 */
export function subscribe(tables, handler) {
  const s = ensureSocket();
  if (!s) return () => {};
  const wanted = new Set(tables);
  const listener = (payload) => {
    if (wanted.has(payload.table)) handler(payload);
  };
  s.on('change', listener);
  return () => s.off('change', listener);
}

export function disconnectRealtime() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
