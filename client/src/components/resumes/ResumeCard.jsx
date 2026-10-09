import React, { useState, useRef, useEffect } from 'react';

import { Card } from '../ui/index.js';
import { FileText, Download, Eye, Pencil, Trash2, Check, X, Calendar, Layers } from 'lucide-react';
import { format } from 'date-fns';

export const ResumeCard = ({ resume, usageCount, onPreview, onDownload, onRename, onDelete }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(resume.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setNameInput(resume.name);
  }, [resume.name]);

  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  const handleSaveRename = async () => {
    if (!nameInput.trim() || nameInput.trim() === resume.name) {
      setIsEditingName(false);
      setNameInput(resume.name);
      return;
    }

    try {
      setIsRenaming(true);
      await onRename(resume.id, nameInput.trim());
      setIsEditingName(false);
    } catch {
      setNameInput(resume.name);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setNameInput(resume.name);
      setIsEditingName(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card padding="md" hoverable className="flex flex-col justify-between group transition-all">
      <div>
        {/* Top Header: PDF Icon Tile & Quick Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPreview(resume)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-[#1D2A23] transition-colors cursor-pointer"
              title="Preview PDF"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(resume)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-[#1D2A23] transition-colors cursor-pointer"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingName(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1D2A23] transition-colors cursor-pointer"
              title="Rename file"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(resume)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Delete resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Name (Inline Rename on Click or Prompt) */}
        {isEditingName ? (
          <div className="flex items-center gap-1.5 my-1">
            <input
              ref={inputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRenaming}
              className="w-full text-sm font-bold rounded-lg border border-emerald-400 bg-white dark:bg-[#060A08] text-slate-900 dark:text-[#E8F5EE] px-2 py-1 outline-none"
            />

            <button
              onClick={handleSaveRename}
              disabled={isRenaming}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNameInput(resume.name);
                setIsEditingName(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1D2A23] cursor-pointer"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <h4
            onClick={() => setIsEditingName(true)}
            className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-[#E8F5EE] break-words line-clamp-2 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            title="Click to rename"
          >
            {resume.name}
          </h4>
        )}

        {/* File Metadata */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-[#8AA097]">
          <span>{formatFileSize(resume.size_bytes)}</span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {resume.created_at ? format(new Date(resume.created_at), 'MMM d, yyyy') : 'Recently'}
          </span>
        </div>
      </div>

      {/* Footer: Used in N Applications Badge & Preview CTA */}
      <div className="mt-5 pt-3.5 border-t border-[#E1EBE5] dark:border-[#1D2A23] flex items-center justify-between text-xs">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
            usageCount > 0
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-indigo-800/60'
              : 'bg-slate-100 dark:bg-[#1D2A23] text-slate-500 dark:text-[#8AA097]'
          }`}
        >
          <Layers className="w-3 h-3" />
          <span>
            Used in {usageCount} application{usageCount === 1 ? '' : 's'}
          </span>
        </span>

        <button
          onClick={() => onPreview(resume)}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Preview</span>
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
};
