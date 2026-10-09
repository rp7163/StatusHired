import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { cookieStorage } from '../lib/storage.js';
import { authApi, healthApi, getToken, setToken } from '../lib/api.js';
import { disconnectRealtime } from '../lib/realtime.js';
import { requestSignupOtp, resendSignupOtp, verifySignupOtp } from '../lib/signupApi.js';

const AuthContext = createContext(undefined);

const ACTIVE_USER_KEY = 'statushired_active_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // true once the API answered /health with a connected MongoDB
  const [isConfigured, setIsConfigured] = useState(false);
  const [serverStatus, setServerStatus] = useState({ checked: false, db: 'unknown', email: 'unknown' });
  // Password typed at sign-up, held in memory only so we can sign in right after OTP verification
  const pendingPasswordRef = useRef('');

  const persistSession = (token, nextUser) => {
    setToken(token);
    setSession({ access_token: token, user: nextUser });
    setUser(nextUser);
    cookieStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(nextUser));
  };

  const clearSession = () => {
    setToken(null);
    cookieStorage.removeItem(ACTIVE_USER_KEY);
    if (typeof localStorage !== 'undefined') localStorage.removeItem(ACTIVE_USER_KEY);
    disconnectRealtime();
    setSession(null);
    setUser(null);
  };

  // Health check (replaces the "is Supabase configured" env check) + restore session from token
  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const h = await healthApi.check();
        if (cancelled) return;
        setIsConfigured(Boolean(h.configured));
        setServerStatus({ checked: true, db: h.db, email: h.email });
      } catch {
        if (cancelled) return;
        setIsConfigured(false);
        setServerStatus({ checked: true, db: 'unreachable', email: 'unknown' });
      }
    };

    const restore = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.me();
        if (cancelled) return;
        persistSession(token, me);
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          clearSession();
        } else {
          // Server unreachable: fall back to the cached user so the UI still opens
          const saved = cookieStorage.getItem(ACTIVE_USER_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed?.id) {
                setUser(parsed);
                setSession({ access_token: token, user: parsed });
              }
            } catch {
              // ignore
            }
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkHealth();
    restore();
    const interval = setInterval(checkHealth, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const signInWithEmail = async (email, password) => {
    const cleanEmail = email.trim();
    try {
      const { token, user: me } = await authApi.login(cleanEmail, password);
      persistSession(token, me);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Invalid email or password.') };
    }
  };

  // Step 1 of sign-up: server emails a 6-digit code. No account exists yet.
  const signUpWithEmail = async (email, password) => {
    const cleanEmail = email.trim();
    const res = await requestSignupOtp(cleanEmail, password);
    if (!res.ok) return { error: new Error(res.error || 'Could not send verification code.') };
    pendingPasswordRef.current = password;
    return { error: null, data: { user: { email: cleanEmail }, session: null, devNote: res.devNote } };
  };

  // Step 2: server checks the code and only then creates the account; it returns a session token.
  const verifyOtp = async (email, token) => {
    const cleanEmail = email.trim();
    const res = await verifySignupOtp(cleanEmail, token.trim());
    if (!res.ok) return { error: new Error(res.error || 'Verification failed.') };

    pendingPasswordRef.current = '';
    if (res.token && res.user) {
      persistSession(res.token, res.user);
      return { error: null, data: { user: res.user, session: { access_token: res.token } } };
    }
    return { error: new Error('Account created. Please sign in with your password.') };
  };

  const resendVerificationOtp = async (email) => {
    const res = await resendSignupOtp(email.trim());
    return { error: res.ok ? null : new Error(res.error || 'Could not resend code.') };
  };

  /**
   * Delete Account: the API erases the user and all of their data
   * (applications, resumes + files, reminders, stage history, settings).
   */
  const deleteAccount = async () => {
    if (!user) return { error: null };
    const userId = user.id;
    try {
      await authApi.deleteAccount();
    } catch (err) {
      console.warn('Delete account error:', err);
      return { error: err instanceof Error ? err : new Error('Could not delete account') };
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(`statushired_data_${userId}`);
      }
      const bioKey = `statushired_biometric_enrolled_${userId}`;
      if (typeof document !== 'undefined') {
        document.cookie = `${bioKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
      clearSession();
    }
    return { error: null };
  };

  // ----- Profile -----
  const applyUser = (nextUser) => {
    setUser(nextUser);
    setSession((prev) => (prev ? { ...prev, user: nextUser } : prev));
    cookieStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const refreshUser = async () => {
    const { user: me } = await authApi.me();
    return applyUser(me);
  };

  const updateProfile = async (data) => {
    const { user: me } = await authApi.updateProfile(data);
    return applyUser(me);
  };

  const uploadAvatar = async (file) => {
    const { user: me } = await authApi.uploadAvatar(file);
    return applyUser(me);
  };

  const removeAvatar = async () => {
    const { user: me } = await authApi.removeAvatar();
    return applyUser(me);
  };

  const signOut = async () => {
    try {
      if (getToken()) await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured,
        serverStatus,
        signInWithEmail,
        signUpWithEmail,
        verifyOtp,
        resendVerificationOtp,
        deleteAccount,
        signOut,
        refreshUser,
        updateProfile,
        uploadAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
