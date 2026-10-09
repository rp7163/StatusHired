import React from 'react';
import { STAGES_CONFIG } from '../types/index.js';
import { ApplicationCard } from './ApplicationCard.jsx';
import { Plus } from 'lucide-react';

export const KanbanBoard = ({ applications, onEdit, onDelete, onAddReminder, onAddInStage }) => {
  const stages = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start pb-6">
      {stages.map((stageKey) => {
        const config = STAGES_CONFIG[stageKey];
        const stageApps = applications.filter((app) => app.stage === stageKey);

        return (
          <div
            key={stageKey}
            className="flex flex-col rounded-2xl bg-slate-100/60 dark:bg-[#0C1410]/70 border border-[#E1EBE5] dark:border-[#1D2A23] p-3 min-h-[480px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.dotColor }} />

                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-[#E8F5EE]">
                  {config.label}
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[#0F1813] text-slate-600 dark:text-[#8AA097] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-2xs">
                  {stageApps.length}
                </span>
              </div>

              <button
                onClick={() => onAddInStage(stageKey)}
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-[#0F1813] transition-colors"
                title={`Add application to ${config.label}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Application Cards List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {stageApps.length === 0 ? (
                <div
                  onClick={() => onAddInStage(stageKey)}
                  className="h-28 rounded-xl border border-dashed border-slate-300 dark:border-slate-800/80 flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:border-emerald-400 hover:bg-white/40 dark:hover:bg-[#0F1813]/40 transition-colors group"
                >
                  <p className="text-xs text-slate-400 group-hover:text-emerald-500 font-medium">
                    + Drop or Add Job
                  </p>
                </div>
              ) : (
                stageApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddReminder={onAddReminder}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
