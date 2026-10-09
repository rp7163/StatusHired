import React, { useState } from 'react';
import { Card, Button } from './ui/index.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';

import { Bell, Plus, CheckCircle2, Circle, Trash2, Calendar, Building2 } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export const RemindersWidget = ({ onOpenNewReminderModal }) => {
  const { reminders, toggleReminder, deleteReminder } = useJobTracker();
  const [filter, setFilter] = useState('pending');

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending') return !r.is_done;
    if (filter === 'completed') return r.is_done;
    return true;
  });

  const formatRemindDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const isOverdue = isPast(date);
      const relative = formatDistanceToNow(date, { addSuffix: true });
      return {
        formatted: format(date, 'MMM d, h:mm a'),
        relative,
        isOverdue,
      };
    } catch {
      return { formatted: dateString, relative: '', isOverdue: false };
    }
  };

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-[#E8F5EE]">
              Reminders &amp; Deadlines
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#8AA097]">
              Interviews, take-homes &amp; follow-ups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex bg-slate-100 dark:bg-[#060A08] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilter('pending')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-white dark:bg-[#0F1813] text-slate-900 dark:text-[#E8F5EE] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-[#8AA097]'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-white dark:bg-[#0F1813] text-slate-900 dark:text-[#E8F5EE] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-[#8AA097]'
              }`}
            >
              Done
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenNewReminderModal(null)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add
          </Button>
        </div>
      </div>

      {filteredReminders.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-[#E1EBE5] dark:border-[#1D2A23] text-slate-400 text-xs">
          No {filter === 'all' ? '' : filter} reminders found. Stay on track by adding deadlines!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredReminders.map((rem) => {
            const timeInfo = formatRemindDate(rem.remind_at);
            return (
              <div
                key={rem.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  rem.is_done
                    ? 'bg-slate-50/70 dark:bg-[#0C1410]/50 border-slate-200/50 dark:border-slate-800/40 opacity-70'
                    : timeInfo.isOverdue
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                      : 'bg-white dark:bg-[#0F1813] border-[#E1EBE5] dark:border-[#1D2A23] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => toggleReminder(rem.id, !rem.is_done)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                    title={rem.is_done ? 'Mark as incomplete' : 'Mark as done'}
                  >
                    {rem.is_done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        rem.is_done
                          ? 'line-through text-slate-500 dark:text-[#8AA097]'
                          : 'text-slate-900 dark:text-[#E8F5EE]'
                      }`}
                    >
                      {rem.title}
                    </p>

                    {rem.description && (
                      <p className="text-xs text-slate-500 dark:text-[#8AA097] mt-0.5 line-clamp-1">
                        {rem.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-[#8AA097]">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3" />
                        {timeInfo.formatted}
                      </span>

                      {!rem.is_done && (
                        <span
                          className={`font-semibold ${
                            timeInfo.isOverdue ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          ({timeInfo.relative})
                        </span>
                      )}

                      {rem.applications && (
                        <span className="flex items-center gap-1 truncate font-medium text-slate-700 dark:text-slate-300">
                          <Building2 className="w-3 h-3" />
                          {rem.applications.company_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(rem.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  title="Delete reminder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
