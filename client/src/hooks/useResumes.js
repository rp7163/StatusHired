import { useState, useEffect, useCallback, useRef } from 'react';
import { resumesApi } from '../lib/api.js';
import { subscribe } from '../lib/realtime.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';

const upsertById = (list, item) => [item, ...list.filter((x) => x.id !== item.id)];

export function useResumes() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const resumesRef = useRef([]);
  resumesRef.current = resumes;

  // 1. Fetch Resumes
  const fetchResumes = useCallback(async () => {
    if (!user) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await resumesApi.list();
      setResumes(data || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      const msg = err.message || 'Failed to load resumes';
      setError(msg);
      toastError('Connection Error', msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, toastError]);

  const fetchResumesRef = useRef(fetchResumes);
  fetchResumesRef.current = fetchResumes;

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Realtime subscription on `resumes`
  useEffect(() => {
    if (!user) return;
    return subscribe(['resumes'], () => {
      fetchResumesRef.current();
    });
  }, [user?.id]);

  // 2. Upload Resume: PDF validation, max 5MB, multipart upload to the API
  const uploadResume = async (file, customName) => {
    if (!user) {
      throw new Error('You must be signed in to upload a resume');
    }

    if (file.type !== 'application/pdf') {
      const err = new Error('Only PDF resumes are supported');
      toastError('Invalid format', 'Only PDF resumes are supported');
      throw err;
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const err = new Error('File exceeds the 5MB size limit');
      toastError('File too large', 'Resume size must be under 5MB');
      throw err;
    }

    const displayName = (customName && customName.trim()) || file.name;

    try {
      const dbData = await resumesApi.upload(file, displayName);
      setResumes((prev) => upsertById(prev, dbData));
      success('Resume uploaded', displayName);
      return dbData;
    } catch (err) {
      console.error('Upload error:', err);
      toastError('Upload failed', err.message);
      throw err;
    }
  };

  // 3. Rename Resume
  const renameResume = async (id, newName) => {
    if (!user) return;
    const trimmed = newName.trim();
    if (!trimmed) {
      toastError('Validation', 'Resume name cannot be empty');
      return;
    }

    const previous = [...resumesRef.current];
    setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, name: trimmed } : r)));

    try {
      await resumesApi.rename(id, trimmed);
      success('Resume renamed', trimmed);
    } catch (err) {
      console.error('Failed to rename resume:', err);
      setResumes(previous);
      toastError('Rename failed', err.message || 'Could not rename resume');
      throw err;
    }
  };

  // 4. Delete Resume: the API removes the file and the row (applications get resume_id = null)
  const deleteResume = async (id) => {
    if (!user) return;

    const previous = [...resumesRef.current];
    const target = previous.find((r) => r.id === id);
    if (!target) return;

    setResumes((prev) => prev.filter((r) => r.id !== id));

    try {
      await resumesApi.remove(id);
      success('Resume deleted', target.name);
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setResumes(previous);
      toastError('Delete failed', err.message || 'Could not delete resume');
      throw err;
    }
  };

  // 5. Get Signed URL (60-second expiry). Accepts a resume id or its file_path.
  const getSignedUrl = async (filePathOrId, options = {}) => {
    try {
      const target = resumesRef.current.find((r) => r.id === filePathOrId || r.file_path === filePathOrId);
      const id = target ? target.id : filePathOrId;
      return await resumesApi.signedUrl(id, options.expires || 60, Boolean(options.download));
    } catch (err) {
      console.error('Failed to generate signed URL:', err);
      toastError('Preview error', err.message || 'Could not generate signed URL');
      return null;
    }
  };

  return {
    resumes,
    isLoading,
    error,
    uploadResume,
    renameResume,
    deleteResume,
    getSignedUrl,
    refetch: fetchResumes,
  };
}
