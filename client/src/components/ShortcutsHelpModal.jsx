import React from 'react';
import { Modal } from './ui/Modal.jsx';
import { Keyboard } from 'lucide-react';

export const ShortcutsHelpModal = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: 'Cmd/Ctrl + K', description: 'Open global command palette & search' },
    { key: 'N', description: 'Create a new job application' },
    { key: 'R', description: 'Schedule a new reminder' },
    { key: 'G then B', description: 'Navigate to Pipeline Board' },
    { key: 'G then A', description: 'Navigate to Applications table' },
    { key: 'G then D', description: 'Navigate to Dashboard' },
    { key: 'G then R', description: 'Navigate to Resumes' },
    { key: 'G then M', description: 'Navigate to Reminders' },
    { key: 'G then P', description: 'Navigate to your Profile' },
    { key: '?', description: 'Show this keyboard shortcuts guide' },
    { key: 'Esc', description: 'Close any modal or active drawer' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Keyboard className="w-4 h-4" />
          </div>
          <span>Keyboard Shortcuts</span>
        </div>
      }
      description="Quickly navigate and manage your career pipeline with keybindings"
    >
      <div className="space-y-2.5 py-2">
        {shortcuts.map((sc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1410] border border-[#E1EBE5] dark:border-[#1D2A23]"
          >
            <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-[#E8F5EE]">
              {sc.description}
            </span>
            {/* <kbd className="px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-[#0F1813] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-2xs">
              {sc.key}
            </kbd> */}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#E1EBE5] dark:border-[#1D2A23] text-center text-xs text-slate-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0C1410] text-[10px]">?</kbd>{' '}
        anywhere in the application to view this menu.
      </div>
    </Modal>
  );
};
