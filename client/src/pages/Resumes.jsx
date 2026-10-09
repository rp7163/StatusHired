import { PageHeader } from '../components/ui/PageHeader.jsx';
import { useSearchParams } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import { useResumes } from '../hooks/useResumes.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';

import { ResumePreviewModal } from '../components/resumes/ResumePreviewModal.jsx';
import { ConfirmDialog, EmptyState, Skeleton } from '../components/ui/index.js';
import { FileText, UploadCloud, MoreHorizontal, Eye, Download, Pencil, Trash2, Check, X } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export const Resumes = () => {
  useDocumentTitle('Resumes');
  const { resumes, isLoading, uploadResume, renameResume, deleteResume, getSignedUrl } = useResumes();

  const { applications } = useJobTracker();

  const [previewResume, setPreviewResume] = useState(null);
  const [deletingResume, setDeletingResume] = useState(null);
  const [activeMenuResumeId, setActiveMenuResumeId] = useState(null);

  // Close the "…" menu on outside click or Escape
  useEffect(() => {
    if (!activeMenuResumeId) return;
    const onDown = (e) => {
      if (!e.target.closest('[data-resume-menu]')) setActiveMenuResumeId(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveMenuResumeId(null);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [activeMenuResumeId]);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Header "+" → "Upload resume" lands here with ?upload=1 → open the file picker once
  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      setSearchParams({}, { replace: true });
      setTimeout(() => fileInputRef.current?.click(), 150);
    }
  }, [searchParams, setSearchParams]);

  // Calculate usage map
  const usageCountMap = React.useMemo(() => {
    const map = new Map();
    for (const app of applications) {
      if (app.resume_id) {
        map.set(app.resume_id, (map.get(app.resume_id) || 0) + 1);
      }
    }
    return map;
  }, [applications]);

  const handleDownload = async (resume) => {
    const url = await getSignedUrl(resume.id, { download: true });
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = resume.name;
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploading(true);
        await uploadResume(file);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleStartRename = (resume) => {
    setEditingResumeId(resume.id);
    setRenameText(resume.name);
    setActiveMenuResumeId(null);
  };

  const handleSaveRename = async (id) => {
    if (renameText.trim()) {
      await renameResume(id, renameText.trim());
    }
    setEditingResumeId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documents" title="Resumes" description="Upload tailored resumes and attach them to applications." />
      {/* Smaller Single-Line Upload Area (Dashed border) */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="h-14 rounded-[18px] border border-dashed border-black/15 dark:border-[#1D2A23] hover:border-[#10B981] bg-white dark:bg-[#0F1813]/50 flex items-center justify-center gap-2.5 px-4 text-center cursor-pointer transition-colors shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <UploadCloud className="w-4 h-4 text-[#10B981]" />
        <span className="text-[14px] font-medium text-[#0C1A13] dark:text-[#E8F5EE]">
          {isUploading ? 'Uploading PDF…' : 'Upload new resume PDF (max 5MB)'}
        </span>
      </div>

      {/* Resumes List Container with Hairline Separators */}
      <div className="apple-card transition-colors">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton variant="rounded" className="h-14 w-full" />
            <Skeleton variant="rounded" className="h-14 w-full" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={FileText}
              title="No resumes saved"
              description="Upload your customized resume PDFs to attach them to applications."
              actionLabel="Upload PDF"
              onAction={() => fileInputRef.current?.click()}
            />
          </div>
        ) : (
          <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
            {resumes.map((resume) => {
              const usageCount = usageCountMap.get(resume.id) || 0;
              const isMenuOpen = activeMenuResumeId === resume.id;
              const isEditing = editingResumeId === resume.id;

              return (
                <div
                  key={resume.id}
                  className={`relative p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F7FBF8]/40 dark:hover:bg-[#142019]/40 transition-colors first:rounded-t-[20px] last:rounded-b-[20px] ${isMenuOpen ? 'z-20' : ''}`}
                >
                  {/* Left: PDF Icon + Name + Size */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-[12px] bg-[#FF453A]/12 text-[#FF453A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 max-w-sm">
                        <input
                          type="text"
                          value={renameText}
                          onChange={(e) => setRenameText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(resume.id);
                            if (e.key === 'Escape') setEditingResumeId(null);
                          }}
                          autoFocus
                          className="h-9 px-3 rounded-[10px] bg-[#F7FBF8] dark:bg-[#142019] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none flex-1"
                        />

                        <button
                          type="button"
                          onClick={() => handleSaveRename(resume.id)}
                          className="w-8 h-8 rounded-full bg-[#30D158]/15 text-[#30D158] flex items-center justify-center cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingResumeId(null)}
                          className="w-8 h-8 rounded-full bg-[#E1EBE5] dark:bg-[#1D2A23] text-[#54635B] flex items-center justify-center cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0">
                        <h4
                          onClick={() => setPreviewResume(resume)}
                          className="text-[15px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] truncate cursor-pointer hover:text-[#10B981] transition-colors"
                        >
                          {resume.name}
                        </h4>
                        <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate">
                          {formatFileSize(resume.size_bytes)} &bull; {usageCount} application
                          {usageCount === 1 ? '' : 's'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: "…" Actions Menu */}
                  <div className="relative shrink-0" data-resume-menu>
                    <button
                      type="button"
                      onClick={() => setActiveMenuResumeId(isMenuOpen ? null : resume.id)}
                      className="w-9 h-9 rounded-full hover:bg-[#E1EBE5]/60 dark:hover:bg-[#142019] text-[#54635B] dark:text-[#8AA097] flex items-center justify-center transition-colors cursor-pointer"
                      title="Actions"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Popover Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-10 w-44 rounded-[16px] bg-white dark:bg-[#0F1813] shadow-xl border border-[#E1EBE5] dark:border-[#1D2A23] py-1.5 z-30 text-left">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuResumeId(null);
                            setPreviewResume(resume);
                          }}
                          className="w-full px-3.5 py-2 text-[13px] font-medium text-[#0C1A13] dark:text-[#E8F5EE] hover:bg-[#F7FBF8] dark:hover:bg-[#142019] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#54635B]" />
                          <span>Preview PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuResumeId(null);
                            handleDownload(resume);
                          }}
                          className="w-full px-3.5 py-2 text-[13px] font-medium text-[#0C1A13] dark:text-[#E8F5EE] hover:bg-[#F7FBF8] dark:hover:bg-[#142019] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-[#54635B]" />
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartRename(resume)}
                          className="w-full px-3.5 py-2 text-[13px] font-medium text-[#0C1A13] dark:text-[#E8F5EE] hover:bg-[#F7FBF8] dark:hover:bg-[#142019] flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4 text-[#54635B]" />
                          <span>Rename</span>
                        </button>

                        <div className="my-1 border-t border-[#E1EBE5] dark:border-[#1D2A23]" />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuResumeId(null);
                            setDeletingResume(resume);
                          }}
                          className="w-full px-3.5 py-2 text-[13px] font-medium text-[#FF453A] hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <ResumePreviewModal
        resume={previewResume}
        isOpen={Boolean(previewResume)}
        onClose={() => setPreviewResume(null)}
        getSignedUrl={getSignedUrl}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingResume)}
        title="Delete resume?"
        message={`Are you sure you want to delete "${deletingResume?.name}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (deletingResume) {
            await deleteResume(deletingResume.id);
            setDeletingResume(null);
          }
        }}
        onCancel={() => setDeletingResume(null)}
      />
    </div>
  );
};
