import React, { createContext, useContext, useEffect, useState } from 'react';
import { cookieStorage } from '../lib/storage.js';
import { settingsApi } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const ThemeContext = createContext(undefined);

const THEME_COOKIE_KEY = 'jobtracker_theme';
const isValidTheme = (t) => t === 'light' || t === 'dark' || t === 'system';

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState('system');
  const [effectiveTheme, setEffectiveTheme] = useState('light');

  // Initialize theme from cookie or system preference
  useEffect(() => {
    const savedTheme = cookieStorage.getItem(THEME_COOKIE_KEY);
    setThemeState(isValidTheme(savedTheme) ? savedTheme : 'system');
  }, []);

  // Calculate and apply effective theme to <html>
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      const resolved = isDark ? 'dark' : 'light';
      setEffectiveTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const listener = () => {
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  // Sync with the user's saved settings (MongoDB `usersettings`) when they sign in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    settingsApi
      .get()
      .then((data) => {
        if (cancelled) return;
        if (data?.theme && isValidTheme(data.theme)) {
          setThemeState(data.theme);
          cookieStorage.setItem(THEME_COOKIE_KEY, data.theme);
        }
      })
      .catch(() => {
        // offline / server unavailable: keep the local preference
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    cookieStorage.setItem(THEME_COOKIE_KEY, newTheme);

    if (user) {
      try {
        await settingsApi.upsert({ theme: newTheme });
      } catch (err) {
        console.error('Failed to sync theme preference to server:', err);
      }
    }
  };

  const toggleTheme = async () => {
    const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    await setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
