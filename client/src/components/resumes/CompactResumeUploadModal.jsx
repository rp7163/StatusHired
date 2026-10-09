import React, { useState, useRef } from 'react';
import { Modal, Button, Input } from '../ui/index.js';

import { useResumes } from '../../hooks/useResumes.js';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

export const CompactResumeUploadModal = ({ isOpen, onClose, onSuccess, onUploadSuccess }) => {
  const { uploadResume } = useResumes();
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setError('Please select a valid PDF file');
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError('File must be smaller than 5MB');
        return;
      }
      setFile(selected);
      if (!customName) {
        setCustomName(selected.name);
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a PDF file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const newResume = await uploadResume(file, customName);
      if (onUploadSuccess) {
        onUploadSuccess(newResume);
      } else if (onSuccess) {
        onSuccess(newResume);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Upload & Attach Resume"
      description="Upload a new tailored PDF and link it to this application"
    >
      <form onSubmit={handleUpload} className="space-y-4">
        {/* File Picker Tile */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-6 rounded-2xl border-2 border-dashed border-[#E1EBE5] dark:border-[#1D2A23] hover:border-emerald-400 dark:hover:border-emerald-600 bg-slate-50/60 dark:bg-[#060A08]/60 text-center cursor-pointer transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            {file ? (
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-[#E8F5EE]">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="truncate max-w-[240px]">{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#E8F5EE]">
                  Click to select PDF document
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Maximum size: 5MB</p>
              </div>
            )}
          </div>
        </div>

        {file && (
          <Input
            label="Display Name (optional)"
            placeholder="e.g. Backend_Resume_v2.pdf"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E1EBE5] dark:border-[#1D2A23]">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isUploading} disabled={!file}>
            Upload &amp; Link
          </Button>
        </div>
      </form>
    </Modal>
  );
};
