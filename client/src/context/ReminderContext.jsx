import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { remindersApi, settingsApi } from '../lib/api.js';
import { subscribe } from '../lib/realtime.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const ReminderContext = createContext(undefined);

const sortByDate = (list) =>
  [...list].sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());

export const ReminderProvider = ({ children }) => {
  const { user } = useAuth();
  const { showToast, success, error: toastError } = useToast();

  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);

  const remindersRef = useRef([]);
  remindersRef.current = reminders;

  // 1. Fetch initial reminders and check user settings
  const fetchReminders = useCallback(async () => {
    if (!user) {
      setReminders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await remindersApi.list();
      setReminders(data || []);

      try {
        const settings = await settingsApi.get();
        if (settings?.browser_notifications) setBrowserNotificationsEnabled(true);
      } catch {
        // settings are optional
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchRemindersRef = useRef(fetchReminders);
  fetchRemindersRef.current = fetchReminders;

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // 2. Realtime subscription on `reminders`
  useEffect(() => {
    if (!user) return;
    return subscribe(['reminders'], () => {
      fetchRemindersRef.current();
    });
  }, [user?.id]);

  // 3. Due reminders computation (due/overdue & not done)
  const dueReminders = reminders.filter((r) => !r.is_done && new Date(r.remind_at).getTime() <= Date.now());

  const unreadNotificationCount = dueReminders.length;

  // 7. Snooze Reminder (+N hours) — declared before the engine so the toast action can use it
  const snoozeReminder = async (id, hours = 1) => {
    if (!user) return;
    const newRemindAt = new Date(Date.now() + hours * 3600000).toISOString();

    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, remind_at: newRemindAt, notified: false } : r)));

    try {
      await remindersApi.update(id, { remind_at: newRemindAt, notified: false });
    } catch (err) {
      console.error('Snooze failed:', err);
    }

    success('Snoozed', `Postponed by ${hours} hour${hours > 1 ? 's' : ''}`);
  };

  // 4. Notification Engine: check every 30 seconds & on tab visibility change
  const checkDueReminders = useCallback(async () => {
    if (!user) return;
    const now = Date.now();
    const currentList = remindersRef.current;

    for (const rem of currentList) {
      const remindTime = new Date(rem.remind_at).getTime();

      if (remindTime <= now && !rem.is_done && !rem.notified) {
        // Mark locally to prevent repeated firing
        rem.notified = true;

        // In-app toast with Snooze action
        showToast(
          'warning',
          `Reminder Due: ${rem.title}`,
          rem.description || rem.applications?.company_name
            ? `For ${rem.applications?.company_name || ''} ${rem.description ? `• ${rem.description}` : ''}`
            : 'Scheduled deadline has arrived',
          8000,
          {
            label: 'Snooze 1h',
            onClick: () => snoozeReminder(rem.id, 1),
          }
        );

        // Browser Native Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`StatusHired: ${rem.title}`, {
              body: rem.description || `Deadline arrived for ${rem.applications?.company_name || 'your application'}`,
              icon: '/favicon.ico',
            });
          } catch {
            // notification error fallback
          }
        }

        // Persist notified = true so other tabs or devices don't re-notify
        remindersApi.update(rem.id, { notified: true }).catch(() => {});
      }
    }
  }, [user, showToast]);

  useEffect(() => {
    const interval = setInterval(checkDueReminders, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkDueReminders();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const timeout = setTimeout(checkDueReminders, 2000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(timeout);
    };
  }, [checkDueReminders]);

  // 5. Create Reminder
  const createReminder = async (data) => {
    if (!user) return null;

    try {
      const created = await remindersApi.create({
        application_id: data.application_id || null,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        remind_at: data.remind_at,
      });
      setReminders((prev) => sortByDate([created, ...prev.filter((r) => r.id !== created.id)]));
      success('Reminder set', data.title);
      return created;
    } catch (err) {
      console.error('Failed to create reminder:', err);
      toastError('Error', err.message || 'Could not create reminder');
      throw err;
    }
  };

  // 6. Update Reminder
  const updateReminder = async (id, updates) => {
    if (!user) return;

    const previous = remindersRef.current;
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates, notified: false } : r)));

    try {
      const updated = await remindersApi.update(id, { ...updates, notified: false });
      setReminders((prev) => sortByDate(prev.map((r) => (r.id === id ? updated : r))));
      success('Reminder updated');
    } catch (err) {
      console.error('Failed to update reminder:', err);
      setReminders(previous);
      toastError('Update failed', err.message);
    }
  };

  // 8. Toggle is_done
  const toggleReminder = async (id, is_done) => {
    if (!user) return;

    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_done } : r)));

    try {
      await remindersApi.update(id, { is_done });
    } catch (err) {
      console.error('Toggle failed:', err);
      toastError('Update failed', err.message);
    }
  };

  // 9. Delete Reminder
  const deleteReminder = async (id) => {
    if (!user) return;

    const previous = remindersRef.current;
    setReminders((prev) => prev.filter((r) => r.id !== id));

    try {
      await remindersApi.remove(id);
      success('Reminder removed');
    } catch (err) {
      setReminders(previous);
      toastError('Delete failed', err.message);
    }
  };

  // 10. Mark all due as done
  const markAllDueAsDone = async () => {
    if (!user || dueReminders.length === 0) return;

    const dueIds = dueReminders.map((d) => d.id);

    setReminders((prev) => prev.map((r) => (dueIds.includes(r.id) ? { ...r, is_done: true } : r)));

    try {
      await remindersApi.bulkDone(dueIds, true);
    } catch (err) {
      console.error('Bulk update failed:', err);
    }

    success('Marked done', `Cleared ${dueIds.length} due task${dueIds.length > 1 ? 's' : ''}`);
  };

  // 11. Request Notification Permission & persist in user settings
  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toastError('Not supported', 'Browser does not support desktop notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      setBrowserNotificationsEnabled(true);
      if (user) {
        settingsApi.upsert({ browser_notifications: true }).catch(() => {});
      }
      success('Notifications enabled', 'You will receive reminders when deadlines arrive');
    } else if (permission === 'denied') {
      setBrowserNotificationsEnabled(false);
      toastError('Permission denied', 'Please unblock notifications in your browser site settings');
    }

    return permission;
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        isLoading,
        dueReminders,
        unreadNotificationCount,
        browserNotificationsEnabled,
        createReminder,
        updateReminder,
        snoozeReminder,
        toggleReminder,
        deleteReminder,
        markAllDueAsDone,
        requestNotificationPermission,
        refetchReminders: fetchReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
};

export const useReminderEngine = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminderEngine must be used within a ReminderProvider');
  }
  return context;
};
