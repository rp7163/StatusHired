import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea, Select } from './ui/index.js';
import { useReminderEngine } from '../hooks/useReminderEngine.js';
import { useApplications } from '../hooks/useApplications.js';

import { Bell, Calendar } from 'lucide-react';

export const ReminderModal = ({
  isOpen,
  onClose,
  defaultApplicationId,
  preselectedAppId,
  reminderToEdit,
}) => {
  const { createReminder, updateReminder } = useReminderEngine();
  const { applications } = useApplications();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [remindAt, setRemindAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const SUGGESTION_CHIPS = ['Follow up', 'Interview', 'Online test', 'Submit documents', 'Offer deadline'];

  // Helper to format ISO to datetime-local input string
  const toDateTimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${y}-${m}-${d}T${h}:${min}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    const initialAppId = preselectedAppId || defaultApplicationId || '';

    if (reminderToEdit) {
      setTitle(reminderToEdit.title);
      setDescription(reminderToEdit.description || '');
      setApplicationId(reminderToEdit.application_id || '');
      setRemindAt(toDateTimeLocal(new Date(reminderToEdit.remind_at)));
    } else {
      setTitle('');
      setDescription('');
      setApplicationId(initialAppId);

      // Default to tomorrow 9:00 AM
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(9, 0, 0, 0);
      setRemindAt(toDateTimeLocal(tmrw));
    }

    setErrors({});
  }, [isOpen, defaultApplicationId, reminderToEdit]);

  // Quick preset handlers
  const handleApplyPreset = (preset) => {
    const now = new Date();
    if (preset === '1h') {
      now.setHours(now.getHours() + 1);
      setRemindAt(toDateTimeLocal(now));
    } else if (preset === 'tomorrow9am') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      setRemindAt(toDateTimeLocal(d));
    } else if (preset === '3d') {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(10, 0, 0, 0);
      setRemindAt(toDateTimeLocal(d));
    } else if (preset === '1w') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(10, 0, 0, 0);
      setRemindAt(toDateTimeLocal(d));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!remindAt) {
      newErrors.remindAt = 'Please specify a reminder date and time';
    } else {
      const targetTime = new Date(remindAt).getTime();
      if (isNaN(targetTime)) {
        newErrors.remindAt = 'Invalid date and time format';
      } else if (targetTime <= Date.now() + 10000) {
        newErrors.remindAt = 'Reminder time must be set in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const isoRemindAt = new Date(remindAt).toISOString();

      if (reminderToEdit) {
        await updateReminder(reminderToEdit.id, {
          title: title.trim(),
          description: description.trim() || null,
          application_id: applicationId || null,
          remind_at: isoRemindAt,
        });
      } else {
        await createReminder({
          title: title.trim(),
          description: description.trim() || null,
          application_id: applicationId || null,
          remind_at: isoRemindAt,
        });
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const appOptions = [
    { value: '', label: 'General / No specific company' },
    ...applications.map((a) => ({
      value: a.id,
      label: `${a.company_name} — ${a.role}`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <span>{reminderToEdit ? 'Edit Reminder' : 'Set a Reminder'}</span>
        </div>
      }
      description="Schedule an interview prep alert, take-home deadline, or follow-up check-in"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <Input
          label="Reminder Title"
          placeholder="e.g. Technical Round 2 with Stripe"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          autoFocus
        />

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Suggestions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setTitle(chip)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border border-[#E1EBE5] dark:border-[#1D2A23] bg-white dark:bg-[#0F1813] hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Linked Application dropdown */}
        <Select
          label="Linked Application (optional)"
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
          options={appOptions}
        />

        {/* Date & Time with Presets */}
        <div>
          <Input
            label="Date & Time"
            type="datetime-local"
            value={remindAt}
            onChange={(e) => setRemindAt(e.target.value)}
            error={errors.remindAt}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-medium text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('1h')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#060A08] text-slate-600 dark:text-[#8AA097] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              In 1 hour
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('tomorrow9am')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#060A08] text-slate-600 dark:text-[#8AA097] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              Tomorrow 9 AM
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('3d')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#060A08] text-slate-600 dark:text-[#8AA097] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              In 3 days
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('1w')}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#060A08] text-slate-600 dark:text-[#8AA097] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              Next week
            </button>
          </div>
        </div>

        {/* Description textarea */}
        <Textarea
          label="Details & Action Items"
          placeholder="Notes to review, interview link, preparation questions, or documents to bring..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E1EBE5] dark:border-[#1D2A23]">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {reminderToEdit ? 'Save Changes' : 'Schedule Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
