import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { applicationsApi, remindersApi, resumesApi, stageHistoryApi } from '../lib/api.js';
import { subscribe } from '../lib/realtime.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { getLocalUserData, saveLocalUserData } from '../lib/userDataStorage.js';

const upsertById = (list, item) => [item, ...list.filter((x) => x.id !== item.id)];

const JobTrackerContext = createContext(undefined);

export const JobTrackerProvider = ({ children }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stageHistory, setStageHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all user records from the API
  const fetchData = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setResumes([]);
      setReminders([]);
      setStageHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [resumesData, appsData, remindersData, historyData] = await Promise.all([
        resumesApi.list(),
        applicationsApi.list(),
        remindersApi.list(),
        stageHistoryApi.list(),
      ]);

      setResumes(resumesData || []);
      setApplications(appsData || []);
      setReminders(remindersData || []);
      setStageHistory(historyData || []);
      saveLocalUserData(user.id, {
        applications: appsData || [],
        resumes: resumesData || [],
        reminders: remindersData || [],
        stageHistory: historyData || [],
      });
    } catch (err) {
      console.info('API query fallback (using local persistent cache):', err?.message);
      const bundle = getLocalUserData(user.id);
      setApplications(bundle.applications);
      setResumes(bundle.resumes);
      setReminders(bundle.reminders);
      setStageHistory(bundle.stageHistory);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions (Socket.io)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribe(['applications', 'reminders', 'resumes'], () => {
      fetchDataRef.current();
    });
    return unsubscribe;
  }, [user?.id]);

  // Create Application
  const createApplication = async (appData) => {
    if (!user) return;

    try {
      const data = await applicationsApi.create({
        company_name: appData.company_name,
        role: appData.role,
        ctc: appData.ctc || null,
        location: appData.location || null,
        job_type: appData.job_type || null,
        source: appData.source || null,
        link: appData.link || null,
        applied_date: appData.applied_date || null,
        stage: appData.stage,
        resume_id: appData.resume_id || null,
        notes: appData.notes || null,
        position: applications.length,
      });
      setApplications((prev) => upsertById(prev, data));
      success('Application tracked', `${appData.role} at ${appData.company_name}`);
    } catch (err) {
      console.error('Failed to create application:', err);
      toastError('Save failed', err.message);
    }
  };

  // Update Application
  const updateApplication = async (id, updates) => {
    if (!user) return;

    try {
      await applicationsApi.update(id, updates);
      await fetchData();
      success('Application updated');
    } catch (err) {
      console.error('Failed to update application:', err);
      toastError('Update failed', err.message);
    }
  };

  // Update Stage (Drag & Drop or Quick Move)
  const updateStage = async (id, newStage) => {
    if (!user) return;

    const currentApp = applications.find((a) => a.id === id);
    if (!currentApp || currentApp.stage === newStage) return;

    const previous = applications;

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: newStage, updated_at: new Date().toISOString() } : app))
    );

    try {
      await applicationsApi.moveStage(id, newStage);
      success('Stage progressed', `Moved to ${newStage.toUpperCase()}`);
    } catch (err) {
      console.error('Stage update failed:', err);
      setApplications(previous);
      toastError('Stage change failed', err.message);
    }
  };

  // Delete Application
  const deleteApplication = async (id) => {
    if (!user) return;

    try {
      await applicationsApi.remove(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setReminders((prev) => prev.filter((r) => r.application_id !== id));
      success('Application removed');
    } catch (err) {
      console.error('Delete failed:', err);
      toastError('Delete failed', err.message);
    }
  };

  // Upload Resume (PDF only, max 5MB)
  const uploadResume = async (file) => {
    if (!user) return null;

    if (file.type !== 'application/pdf') {
      toastError('Invalid file format', 'Only PDF resumes are supported');
      return null;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (file.size > MAX_SIZE) {
      toastError('File too large', 'Resume size must be under 5MB');
      return null;
    }

    try {
      const data = await resumesApi.upload(file, file.name);
      setResumes((prev) => upsertById(prev, data));
      success('Resume uploaded', file.name);
      return data;
    } catch (err) {
      console.error('Resume upload failed:', err);
      toastError('Resume upload failed', err.message);
      return null;
    }
  };

  // Delete Resume
  const deleteResume = async (id) => {
    if (!user) return;
    const target = resumes.find((r) => r.id === id);
    if (!target) return;

    try {
      await resumesApi.remove(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      success('Resume deleted');
    } catch (err) {
      console.error('Resume deletion failed:', err);
      toastError('Delete failed', err.message);
    }
  };

  // Generate a temporary (1 hour) view/download URL for a resume
  const getResumeUrl = async (filePathOrId) => {
    try {
      const target = resumes.find((r) => r.id === filePathOrId || r.file_path === filePathOrId);
      const id = target ? target.id : filePathOrId;
      return await resumesApi.signedUrl(id, 3600);
    } catch (err) {
      console.error('Error generating signed URL for resume:', err);
      return null;
    }
  };

  // Create Reminder
  const createReminder = async (item) => {
    if (!user) return;

    try {
      const data = await remindersApi.create({
        application_id: item.application_id || null,
        title: item.title,
        description: item.description || null,
        remind_at: item.remind_at,
      });
      setReminders((prev) =>
        upsertById(prev, data).sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime())
      );
      success('Reminder created', item.title);
    } catch (err) {
      console.error('Failed to create reminder:', err);
      toastError('Could not set reminder', err.message);
    }
  };

  // Toggle Reminder is_done
  const toggleReminder = async (id, is_done) => {
    if (!user) return;

    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, is_done } : r)));

    try {
      await remindersApi.update(id, { is_done });
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
      toastError('Update failed', err.message);
    }
  };

  // Delete Reminder
  const deleteReminder = async (id) => {
    if (!user) return;

    setReminders((prev) => prev.filter((r) => r.id !== id));

    try {
      await remindersApi.remove(id);
      success('Reminder removed');
    } catch (err) {
      console.info('Delete reminder error:', err?.message);
      toastError('Delete failed', err.message);
    }
  };

  // Persistent auto-sync to local storage (offline cache)
  useEffect(() => {
    if (user && !isLoading) {
      saveLocalUserData(user.id, {
        applications,
        resumes,
        reminders,
        stageHistory,
      });
    }
  }, [user, applications, resumes, reminders, stageHistory, isLoading]);

  return (
    <JobTrackerContext.Provider
      value={{
        applications,
        resumes,
        reminders,
        stageHistory,
        isLoading,
        createApplication,
        updateApplication,
        updateStage,
        deleteApplication,
        uploadResume,
        deleteResume,
        getResumeUrl,
        createReminder,
        toggleReminder,
        deleteReminder,
        refreshData: fetchData,
      }}
    >
      {children}
    </JobTrackerContext.Provider>
  );
};

export const useJobTracker = () => {
  const context = useContext(JobTrackerContext);
  if (!context) {
    throw new Error('useJobTracker must be used within a JobTrackerProvider');
  }
  return context;
};
