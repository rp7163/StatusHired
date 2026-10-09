/**
 * Thin REST client for the StatusHired Express/MongoDB API.
 * Replaces the Supabase JS client: every call is a relative `/api/...` request
 * (proxied by Vite in dev, served by Express in production) with a JWT bearer token.
 */
import { cookieStorage } from './storage.js';

export const TOKEN_KEY = 'statushired_token';
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export const getToken = () => cookieStorage.getItem(TOKEN_KEY);
export const setToken = (token) => (token ? cookieStorage.setItem(TOKEN_KEY, token) : cookieStorage.removeItem(TOKEN_KEY));

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const token = getToken();
  const init = { method, headers: { ...headers } };
  if (token) init.headers.Authorization = `Bearer ${token}`;

  if (body instanceof FormData) {
    init.body = body; // browser sets multipart boundary
  } else if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiError('Could not reach the server. Is the API running?', 0, null);
  }

  if (raw) return res;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || data.message || `Request failed (${res.status})`, res.status, data);
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};

/* ---------- Typed helpers per resource (mirror the old Supabase tables) ---------- */

export const healthApi = {
  check: () => api.get('/health'),
};

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return api.upload('/auth/me/avatar', fd);
  },
  removeAvatar: () => api.delete('/auth/me/avatar'),
  logout: () => api.post('/auth/logout'),
  deleteAccount: () => api.delete('/auth/me'),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  upsert: (data) => api.put('/settings', data),
};

export const applicationsApi = {
  list: () => api.get('/applications'),
  get: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  update: (id, data) => api.patch(`/applications/${id}`, data),
  moveStage: (id, stage) => api.patch(`/applications/${id}/stage`, { stage }),
  reorder: (items) => api.put('/applications/reorder', { items }),
  remove: (id) => api.delete(`/applications/${id}`),
};

export const stageHistoryApi = {
  list: (applicationId) => api.get(`/stage-history${applicationId ? `?application_id=${applicationId}` : ''}`),
};

export const resumesApi = {
  list: () => api.get('/resumes'),
  upload: (file, name) => {
    const fd = new FormData();
    fd.append('file', file);
    if (name) fd.append('name', name);
    return api.upload('/resumes', fd);
  },
  rename: (id, name) => api.patch(`/resumes/${id}`, { name }),
  remove: (id) => api.delete(`/resumes/${id}`),
  /** Returns a short-lived URL that can be put in an <iframe>/<a> (like createSignedUrl). */
  signedUrl: async (id, expiresSeconds = 60, download = false) => {
    const { url } = await api.get(`/resumes/${id}/url?expires=${expiresSeconds}${download ? '&download=1' : ''}`);
    return (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + url;
  },
};

export const remindersApi = {
  list: () => api.get('/reminders'),
  create: (data) => api.post('/reminders', data),
  update: (id, data) => api.patch(`/reminders/${id}`, data),
  bulkDone: (ids, is_done = true) => api.patch('/reminders/bulk', { ids, is_done }),
  remove: (id) => api.delete(`/reminders/${id}`),
};
