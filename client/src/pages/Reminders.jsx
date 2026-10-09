import { PageHeader } from '../components/ui/PageHeader.jsx';
import React, { useState, useMemo } from 'react';
import { EmptyState, ConfirmDialog } from '../components/ui/index.js';
import { ReminderModal } from '../components/ReminderModal.jsx';
import { useReminderEngine } from '../hooks/useReminderEngine.js';

import { Bell, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export const Reminders = () => {
  useDocumentTitle('Reminders');
  const { reminders, toggleReminder, deleteReminder } = useReminderEngine();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deleteRemId, setDeleteRemId] = useState(null);

  // Split reminders into Upcoming and Done
  const upcomingList = useMemo(() => {
    return reminders
      .filter((r) => !r.is_done)
      .sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
  }, [reminders]);

  const doneList = useMemo(() => {
    return reminders
      .filter((r) => r.is_done)
      .sort((a, b) => new Date(b.remind_at).getTime() - new Date(a.remind_at).getTime());
  }, [reminders]);

  // Group Upcoming items into Today, Tomorrow, and Later
  const groupedUpcoming = useMemo(() => {
    const today = [];
    const tomorrow = [];
    const later = [];

    for (const r of upcomingList) {
      const d = new Date(r.remind_at);
      if (isToday(d)) {
        today.push(r);
      } else if (isTomorrow(d)) {
        tomorrow.push(r);
      } else {
        later.push(r);
      }
    }

    return { today, tomorrow, later };
  }, [upcomingList]);

  const handleOpenEdit = (rem) => {
    setEditingReminder(rem);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingReminder(null);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteRemId) {
      await deleteReminder(deleteRemId);
      setDeleteRemId(null);
    }
  };

  const renderReminderRow = (r) => {
    const remDate = new Date(r.remind_at);
    const isOverdue = !r.is_done && isPast(remDate);
    const formattedDate = format(remDate, 'MMM d, h:mm a');

    return (
      <div
        key={r.id}
        className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F7FBF8]/40 dark:hover:bg-[#142019]/40 transition-colors group"
      >
        {/* Left: Checkbox + Title + Linked Job */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => toggleReminder(r.id, !r.is_done)}
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              r.is_done
                ? 'bg-[#30D158] border-[#30D158] text-white'
                : 'border-[#54635B] dark:border-[#8AA097] hover:border-[#30D158]'
            }`}
          >
            {r.is_done && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          <div className="min-w-0">
            <h4
              className={`text-[15px] font-medium truncate ${
                r.is_done
                  ? 'line-through text-[#54635B] dark:text-[#8AA097]'
                  : 'text-[#0C1A13] dark:text-[#E8F5EE]'
              }`}
            >
              {r.title}
            </h4>
            {r.applications && (
              <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate mt-0.5">
                {r.applications.company_name} &bull; {r.applications.role}
              </p>
            )}
          </div>
        </div>

        {/* Right: Date label + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`text-[13px] font-medium ${
              isOverdue ? 'text-[#FF453A]' : 'text-[#54635B] dark:text-[#8AA097]'
            }`}
          >
            {isOverdue ? `Overdue · ${formattedDate}` : formattedDate}
          </span>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleOpenEdit(r)}
              className="p-1.5 rounded-lg text-[#54635B] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] cursor-pointer"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteRemId(r.id)}
              className="p-1.5 rounded-lg text-[#54635B] hover:text-[#FF453A] cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Follow-ups" title="Reminders" description="Never miss an interview, deadline or follow-up again." />
      {/* Top Controls: Two-way Segmented Control & + Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-full bg-[#E1EBE5]/70 dark:bg-[#0F1813] border border-black/6 dark:border-[#1D2A23]">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`h-9 px-5 rounded-full text-[14px] font-medium transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] shadow-xs'
                : 'text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]'
            }`}
          >
            Upcoming ({upcomingList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('done')}
            className={`h-9 px-5 rounded-full text-[14px] font-medium transition-all cursor-pointer ${
              activeTab === 'done'
                ? 'bg-white dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] shadow-xs'
                : 'text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]'
            }`}
          >
            Done ({doneList.length})
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="h-10 px-4 rounded-full bg-[#10B981] text-white text-[14px] font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="apple-card overflow-hidden transition-colors">
        {activeTab === 'upcoming' ? (
          upcomingList.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Bell}
                title="No upcoming reminders"
                description="Set follow-up tasks and interview dates to stay prepared."
                actionLabel="Create reminder"
                onAction={handleOpenNew}
              />
            </div>
          ) : (
            <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
              {/* Group: Today */}
              {groupedUpcoming.today.length > 0 && (
                <div>
                  <div className="px-6 py-2.5 bg-[#F7FBF8]/50 dark:bg-[#142019]/50 text-[13px] font-bold text-[#54635B] dark:text-[#8AA097]">
                    Today
                  </div>
                  <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
                    {groupedUpcoming.today.map(renderReminderRow)}
                  </div>
                </div>
              )}

              {/* Group: Tomorrow */}
              {groupedUpcoming.tomorrow.length > 0 && (
                <div>
                  <div className="px-6 py-2.5 bg-[#F7FBF8]/50 dark:bg-[#142019]/50 text-[13px] font-bold text-[#54635B] dark:text-[#8AA097]">
                    Tomorrow
                  </div>
                  <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
                    {groupedUpcoming.tomorrow.map(renderReminderRow)}
                  </div>
                </div>
              )}

              {/* Group: Later */}
              {groupedUpcoming.later.length > 0 && (
                <div>
                  <div className="px-6 py-2.5 bg-[#F7FBF8]/50 dark:bg-[#142019]/50 text-[13px] font-bold text-[#54635B] dark:text-[#8AA097]">
                    Later
                  </div>
                  <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
                    {groupedUpcoming.later.map(renderReminderRow)}
                  </div>
                </div>
              )}
            </div>
          )
        ) : doneList.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Bell}
              title="No completed reminders"
              description="Completed tasks will be saved here."
            />
          </div>
        ) : (
          <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
            {doneList.map(renderReminderRow)}
          </div>
        )}
      </div>

      {/* Reminder Add / Edit Modal */}
      <ReminderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReminder(null);
        }}
        reminderToEdit={editingReminder}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteRemId)}
        title="Delete reminder?"
        message="Are you sure you want to remove this reminder?"
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteRemId(null)}
      />
    </div>
  );
};
