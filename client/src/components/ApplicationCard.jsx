import React from 'react';
import { Card } from './ui/index.js';
import { STAGES_CONFIG } from '../types/index.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';
import {
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Bell,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

export const ApplicationCard = ({ application, onEdit, onDelete, onAddReminder }) => {
  const { updateStage, getResumeUrl } = useJobTracker();

  const stagesList = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];
  const currentIndex = stagesList.indexOf(application.stage);

  const prevStage = currentIndex > 0 ? stagesList[currentIndex - 1] : null;
  const nextStage = currentIndex < stagesList.length - 1 ? stagesList[currentIndex + 1] : null;

  const handleOpenResume = async (e) => {
    e.stopPropagation();
    if (application.resumes) {
      const url = await getResumeUrl(application.resumes.file_path);
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const formattedDate = application.applied_date
    ? format(new Date(application.applied_date), 'MMM d, yyyy')
    : null;

  return (
    <Card
      padding="sm"
      hoverable
      className="group relative flex flex-col justify-between border-[#E1EBE5] dark:border-[#1D2A23] transition-all bg-white dark:bg-[#0F1813]"
    >
      <div>
        {/* Top Header: Company Name & Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8F5EE] truncate">
              {application.company_name}
            </h4>
            <p className="text-xs font-medium text-slate-600 dark:text-[#8AA097] truncate mt-0.5">
              {application.role}
            </p>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            {application.link && (
              <a
                href={application.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Open job link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onEdit(application)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Edit application"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Metadata badges (CTC, Location, Job Type) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
          {application.ctc && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
              <DollarSign className="w-3 h-3 -mr-0.5" />
              {application.ctc}
            </span>
          )}

          {application.location && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1D2A23] text-slate-600 dark:text-[#8AA097]">
              <MapPin className="w-3 h-3" />
              <span className="max-w-[110px] truncate">{application.location}</span>
            </span>
          )}

          {application.job_type && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1D2A23] text-slate-600 dark:text-[#8AA097]">
              {application.job_type}
            </span>
          )}
        </div>

        {/* Attached Resume */}
        {application.resumes && (
          <div
            onClick={handleOpenResume}
            className="flex items-center gap-1.5 px-2 py-1 mb-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100/70 transition-colors truncate"
            title={`View attached resume: ${application.resumes.name}`}
          >
            <FileText className="w-3 h-3 shrink-0 text-emerald-500" />
            <span className="truncate">{application.resumes.name}</span>
          </div>
        )}

        {/* Notes Preview if available */}
        {application.notes && (
          <p className="text-[11px] text-slate-500 dark:text-[#8AA097] bg-slate-50 dark:bg-[#060A08]/40 p-2 rounded-lg line-clamp-2 mb-3 border border-slate-100 dark:border-slate-800/40">
            {application.notes}
          </p>
        )}
      </div>

      {/* Footer: Date applied & stage movement buttons */}
      <div className="pt-2 border-t border-[#E1EBE5]/80 dark:border-[#1D2A23]/80 flex items-center justify-between gap-1 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          {formattedDate ? (
            <span className="flex items-center gap-1 truncate text-slate-500 dark:text-[#8AA097]">
              <Calendar className="w-3 h-3 shrink-0" />
              {formattedDate}
            </span>
          ) : (
            <span className="italic text-slate-400">Not applied yet</span>
          )}
        </div>

        {/* Action icons: Reminder & Stage Shifts */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAddReminder(application.id)}
            className="p-1 rounded-md hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-400 hover:text-amber-500 transition-colors"
            title="Add reminder for this application"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {prevStage && (
            <button
              onClick={() => updateStage(application.id, prevStage)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1D2A23] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title={`Move back to ${STAGES_CONFIG[prevStage].label}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {nextStage && (
            <button
              onClick={() => updateStage(application.id, nextStage)}
              className="p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-500 hover:text-emerald-600 transition-colors"
              title={`Move forward to ${STAGES_CONFIG[nextStage].label}`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
