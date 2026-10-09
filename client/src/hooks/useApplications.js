import { useState, useEffect, useCallback, useRef } from 'react';
import { applicationsApi } from '../lib/api.js';
import { subscribe } from '../lib/realtime.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const upsertById = (list, item) => [item, ...list.filter((x) => x.id !== item.id)];

export function useApplications() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a reference to current applications for rollbacks
  const appsRef = useRef([]);
  appsRef.current = applications;

  // 1. Fetch Applications
  const fetchApplications = useCallback(async () => {
    if (!user) {
      setApplications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await applicationsApi.list();
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      const msg = err.message || 'Failed to load applications';
      setError(msg);
      toastError('Connection Error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, toastError]);

  const fetchApplicationsRef = useRef(fetchApplications);
  fetchApplicationsRef.current = fetchApplications;

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 2. Realtime Subscription (Socket.io)
  useEffect(() => {
    if (!user) return;
    return subscribe(['applications', 'resumes'], () => {
      fetchApplicationsRef.current();
    });
  }, [user?.id]);

  // 3. Create Application (with optimistic update)
  const createApplication = async (input) => {
    if (!user) return null;

    const tempId = `temp-${Date.now()}`;
    const optimisticApp = {
      ...input,
      id: tempId,
      user_id: user.id,
      position: applications.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resumes: null,
    };

    // Optimistically prepend to state
    setApplications((prev) => [optimisticApp, ...prev]);

    try {
      const data = await applicationsApi.create({
        company_name: input.company_name.trim(),
        role: input.role.trim(),
        ctc: input.ctc?.trim() || null,
        location: input.location?.trim() || null,
        job_type: input.job_type || null,
        source: input.source || null,
        link: input.link?.trim() || null,
        applied_date: input.applied_date || null,
        stage: input.stage || 'saved',
        resume_id: input.resume_id || null,
        notes: input.notes?.trim() || null,
        position: applications.length,
      });

      // Replace optimistic row with confirmed DB row
      setApplications((prev) => upsertById(prev.filter((app) => app.id !== tempId), data));

      success('Application saved', `${input.role} at ${input.company_name}`);
      return data;
    } catch (err) {
      console.error('Failed to create application:', err);
      // Rollback optimistic update
      setApplications((prev) => prev.filter((app) => app.id !== tempId));
      toastError('Save failed', err.message || 'Could not save application');
      throw err;
    }
  };

  // 4. Update Application (with optimistic update and rollback)
  const updateApplication = async (id, updates) => {
    if (!user) return;

    const previousApps = [...appsRef.current];
    const target = previousApps.find((a) => a.id === id);
    if (!target) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates, updated_at: new Date().toISOString() } : app))
    );

    try {
      const data = await applicationsApi.update(id, updates);
      setApplications((prev) => prev.map((app) => (app.id === id ? data : app)));
      success('Application updated');
    } catch (err) {
      console.error('Failed to update application:', err);
      setApplications(previousApps);
      toastError('Update failed', err.message || 'Could not update application');
      throw err;
    }
  };

  // 5. Delete Application (with optimistic update and rollback)
  const deleteApplication = async (id) => {
    if (!user) return;

    const previousApps = [...appsRef.current];
    const target = previousApps.find((a) => a.id === id);
    if (!target) return;

    setApplications((prev) => prev.filter((app) => app.id !== id));

    try {
      await applicationsApi.remove(id);
      success('Application removed', `${target.company_name} was deleted`);
    } catch (err) {
      console.error('Failed to delete application:', err);
      setApplications(previousApps);
      toastError('Delete failed', err.message || 'Could not delete application');
      throw err;
    }
  };

  // 6. Move Stage (with optimistic update and rollback)
  const moveStage = async (id, toStage) => {
    if (!user) return;

    const previousApps = [...appsRef.current];
    const target = previousApps.find((a) => a.id === id);
    if (!target || target.stage === toStage) return;

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, stage: toStage, updated_at: new Date().toISOString() } : app))
    );

    try {
      const data = await applicationsApi.moveStage(id, toStage);
      setApplications((prev) => prev.map((app) => (app.id === id ? data : app)));
      success('Stage updated', `Moved to ${toStage.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to move stage:', err);
      setApplications(previousApps);
      toastError('Stage change failed', err.message || 'Could not update stage');
    }
  };

  // 7. Duplicate Application
  const duplicateApplication = async (sourceApp) => {
    if (!user) return;

    return await createApplication({
      company_name: `${sourceApp.company_name} (Copy)`,
      role: sourceApp.role,
      ctc: sourceApp.ctc,
      location: sourceApp.location,
      job_type: sourceApp.job_type,
      source: sourceApp.source,
      link: sourceApp.link,
      applied_date: sourceApp.applied_date,
      stage: sourceApp.stage,
      resume_id: sourceApp.resume_id,
      notes: sourceApp.notes,
    });
  };

  return {
    applications,
    isLoading,
    error,
    createApplication,
    updateApplication,
    deleteApplication,
    moveStage,
    duplicateApplication,
    refetch: fetchApplications,
  };
}
