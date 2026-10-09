import React from 'react';
import { STAGES_CONFIG } from '../types/index.js';

import { useJobTracker } from '../context/JobTrackerContext.jsx';
import { ExternalLink, Pencil, Trash2, FileText, Bell } from 'lucide-react';
import { format } from 'date-fns';

export const ListView = ({ applications, onEdit, onDelete, onAddReminder }) => {
  const { updateStage, getResumeUrl } = useJobTracker();

  const handleOpenResume = async (e, filePath) => {
    e.stopPropagation();
    if (filePath) {
      const url = await getResumeUrl(filePath);
      if (url && url !== '#') {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="rounded-2xl border border-[#E1EBE5] dark:border-[#1D2A23] bg-white dark:bg-[#0F1813] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E1EBE5] dark:border-[#1D2A23] bg-slate-50/75 dark:bg-[#0C1410]/80 text-slate-500 dark:text-[#8AA097]">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Company &amp; Role</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Stage</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Compensation</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Location / Type</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Applied Date</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Resume</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-[#142019]/50 transition-colors">
                {/* Company & Role */}
                <td className="py-3.5 px-4">
                  <div className="font-heading font-bold text-sm text-slate-900 dark:text-[#E8F5EE]">
                    {app.company_name}
                  </div>
                  <div className="text-slate-500 dark:text-[#8AA097] mt-0.5">{app.role}</div>
                </td>

                {/* Stage */}
                <td className="py-3.5 px-4">
                  <select
                    value={app.stage}
                    onChange={(e) => updateStage(app.id, e.target.value)}
                    className="text-xs rounded-full font-medium px-2.5 py-1 border outline-none cursor-pointer bg-white dark:bg-[#0F1813] text-slate-800 dark:text-[#E8F5EE] border-[#E1EBE5] dark:border-[#1D2A23]"
                  >
                    {Object.values(STAGES_CONFIG).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Compensation */}
                <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {app.ctc || <span className="text-slate-400">—</span>}
                </td>

                {/* Location / Type */}
                <td className="py-3.5 px-4 text-slate-600 dark:text-[#8AA097]">
                  <div>{app.location || '—'}</div>
                  {app.job_type && <span className="text-[10px] text-slate-400">{app.job_type}</span>}
                </td>

                {/* Applied Date */}
                <td className="py-3.5 px-4 text-slate-600 dark:text-[#8AA097]">
                  {app.applied_date ? (
                    format(new Date(app.applied_date), 'MMM d, yyyy')
                  ) : (
                    <span className="text-slate-400 italic">Not yet</span>
                  )}
                </td>

                {/* Resume */}
                <td className="py-3.5 px-4">
                  {app.resumes ? (
                    <button
                      onClick={(e) => handleOpenResume(e, app.resumes?.file_path)}
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline max-w-[140px] truncate"
                      title={app.resumes.name}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{app.resumes.name}</span>
                    </button>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {app.link && (
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Job Posting Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => onAddReminder(app.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                      title="Set reminder"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(app)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Edit application"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(app.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
