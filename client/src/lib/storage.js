// Resilient storage adapter supporting Cookies with a LocalStorage fallback
// (kept from the original project; used for the session token, theme, etc.)
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export const cookieStorage = {
  getItem: (key) => {
    if (typeof document !== 'undefined') {
      const target = encodeURIComponent(key) + '=';
      const cookieParts = document.cookie.split(';');
      for (let part of cookieParts) {
        part = part.trim();
        if (part.startsWith(target)) {
          try {
            return decodeURIComponent(part.substring(target.length));
          } catch {
            return part.substring(target.length);
          }
        }
      }
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const val = localStorage.getItem(key);
        if (val) return val;
      } catch {
        // ignore
      }
    }
    return null;
  },

  setItem: (key, value) => {
    if (typeof document !== 'undefined') {
      const encodedKey = encodeURIComponent(key);
      const encodedVal = encodeURIComponent(value);
      const isHttps = typeof location !== 'undefined' && location.protocol === 'https:';
      document.cookie = isHttps
        ? `${encodedKey}=${encodedVal}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=None; Secure`
        : `${encodedKey}=${encodedVal}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch {
        // ignore
      }
    }
  },

  removeItem: (key) => {
    if (typeof document !== 'undefined') {
      const encodedKey = encodeURIComponent(key);
      document.cookie = `${encodedKey}=; max-age=0; path=/; SameSite=Lax`;
      document.cookie = `${encodedKey}=; max-age=0; path=/; SameSite=None; Secure`;
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  },
};
