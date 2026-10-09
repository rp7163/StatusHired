import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui/index.js';

import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

export const ResumePreviewModal = ({ resume, isOpen, onClose, getSignedUrl }) => {
  const [signedUrl, setSignedUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !resume) {
      setSignedUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getSignedUrl(resume.file_path)
      .then((url) => {
        if (!isMounted) return;
        if (url) {
          setSignedUrl(url);
        } else {
          setError('Could not generate secure preview link (expired or permission issue)');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load preview');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, resume, getSignedUrl]);

  if (!resume) return null;

  const handleDownload = () => {
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = resume.name;
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5 min-w-0 pr-4">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="truncate">{resume.name}</span>
        </div>
      }
      description="Secure PDF preview with temporary 60-second access link"
    >
      <div className="space-y-4">
        {/* PDF Iframe or Loading/Error State */}
        <div className="w-full h-[65vh] rounded-xl border border-[#E1EBE5] dark:border-[#1D2A23] overflow-hidden bg-slate-100 dark:bg-[#060A08] flex items-center justify-center relative">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-[#8AA097]">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-xs">Generating secure PDF preview…</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center max-w-sm">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-[#E8F5EE]">Preview Unavailable</p>
              <p className="text-xs text-slate-500 dark:text-[#8AA097] mt-1 mb-4">{error}</p>
              {signedUrl && (
                <Button variant="secondary" size="sm" onClick={handleDownload}>
                  Download Directly
                </Button>
              )}
            </div>
          ) : signedUrl ? (
            <iframe src={`${signedUrl}#toolbar=0`} title={resume.name} className="w-full h-full border-0" />
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Link auto-refreshes every 60 seconds
          </span>

          <div className="flex items-center gap-2">
            {signedUrl && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download PDF
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
