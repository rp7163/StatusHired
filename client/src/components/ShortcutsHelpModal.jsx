
import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  {
    section: 'General',
    items: [
      { label: 'Keyboard shortcuts help', keys: ['Shift', '?'], action: 'help' },
      { label: 'Toggle theme', keys: ['Shift', 'T'], action: 'theme' },
      { label: 'New application', keys: ['N'], action: 'new-application' },
      { label: 'New reminder', keys: ['R'], action: 'new-reminder' },
      { label: 'Upload resume', keys: ['U'], action: 'upload-resume' },
      { label: 'Open Command Palette', keys: ['Ctrl', 'K'], action: 'command-palette' },
    ],
  },
  {
    section: 'Navigation',
    items: [
      { label: 'Dashboard', keys: ['Ctrl', 'D'], action: 'dashboard' },
      { label: 'Applications', keys: ['Ctrl', 'A'], action: 'applications' },
      { label: 'Board', keys: ['Ctrl', 'B'], action: 'board' },
      { label: 'Reminders', keys: ['Ctrl', 'M'], action: 'reminders' },
      { label: 'Profile', keys: ['Ctrl', 'P'], action: 'profile' },
      { label: 'About', keys: ['Ctrl', '.'], action: 'about' },
    ],
  },
];

export const ShortcutsHelpModal = ({
  isOpen,
  onClose,
  onRunShortcut,
}) => {
  // Close the modal with Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render the modal while closed.
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        // Close only when the backdrop itself is clicked.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#101914] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Keyboard size={22} />
            </div>

            <div>
              <h2
                id="shortcuts-title"
                className="text-lg font-bold text-gray-900 dark:text-white"
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click any shortcut to run it.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((group) => (
            <section key={group.section}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {group.section}
              </h3>

              <div className="space-y-1">
                {group.items.map((shortcut) => (
                  <button
                    key={shortcut.action}
                    type="button"
                    onClick={() => onRunShortcut?.(shortcut.action)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-emerald-100 focus-visible:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-100 dark:hover:bg-emerald-100/10"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {shortcut.label}
                    </span>

                    <span className="flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <React.Fragment key={`${shortcut.action}-${key}-${index}`}>
                          {index > 0 && (
                            <span className="text-xs text-gray-400">+</span>
                          )}

                          <kbd className="min-w-7 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-center text-xs font-extralight text-gray-700 shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-gray-200">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-5 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
          Press Esc to close. On Mac, use Command instead of Ctrl for navigation and the Command Palette.
        </p>
      </div>
    </div>
  );
};
