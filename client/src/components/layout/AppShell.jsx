
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';
import { MobileNav } from './MobileNav.jsx';
import { ApplicationModal } from '../ApplicationModal.jsx';
import { ReminderModal } from '../ReminderModal.jsx';
import { SettingsModal } from '../SettingsModal.jsx';
import { CommandPalette } from '../CommandPalette.jsx';
import { ShortcutsHelpModal } from '../ShortcutsHelpModal.jsx';
import { ApplicationDrawer } from '../ApplicationDrawer.jsx';
import { ErrorBoundary } from '../ErrorBoundary.jsx';

import { useSearch } from '../../context/SearchContext.jsx';
import { useApplications } from '../../hooks/useApplications.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const {
    isNewAppModalOpen,
    setIsNewAppModalOpen,
    defaultNewAppStage,
    openNewAppModal,
  } = useSearch();

  const { moveStage, deleteApplication } = useApplications();

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalReminderOpen, setIsGlobalReminderOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [editingDrawerApp, setEditingDrawerApp] = useState(null);

  // Run a shortcut, whether triggered by the keyboard or clicked in the help modal.
  const runShortcut = useCallback(
    (shortcut) => {
      switch (shortcut) {
        case 'help':
          setIsShortcutsHelpOpen(true);
          break;

        case 'theme':
          toggleTheme();
          break;

        case 'new-application':
          openNewAppModal('saved');
          break;

        case 'new-reminder':
          setIsGlobalReminderOpen(true);
          break;

        case 'upload-resume': {
          // Navigate to Resumes first if the upload button isn't on this page.
          const uploadButton = document.querySelector(
            '[data-shortcut="upload-resume"]'
          );

          if (uploadButton) {
            uploadButton.click();
          } else {
            navigate('/resumes');
          }
          break;
        }

        case 'command-palette':
          setIsCommandPaletteOpen((prev) => !prev);
          break;

        case 'dashboard':
          navigate('/');
          break;

        case 'applications':
          navigate('/applications');
          break;

        case 'board':
          navigate('/board');
          break;

        case 'resumes':
          navigate('/resumes');
          break;

        case 'reminders':
          navigate('/reminders');
          break;

        case 'profile':
          navigate('/profile');
          break;

        case 'about':
          navigate('/about');
          break;

        default:
          break;
      }
    },
    [navigate, toggleTheme, openNewAppModal]
  );

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const target = e.target;
      const tag = target?.tagName?.toLowerCase();

      const isInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable;

      // Shift + ?: Open help, even when focus is in an input.
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        runShortcut('help');
        return;
      }

      // Ctrl/Cmd + K: Command Palette
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        runShortcut('command-palette');
        return;
      }

      // Do not trigger other shortcuts while typing.
      if (isInput) return;

      // Shift + T: Toggle theme
      if (
        e.shiftKey &&
        key === 't' &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        runShortcut('theme');
        return;
      }

      // Ignore other modified key combinations here.
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;

      // N: New application
      if (key === 'n') {
        e.preventDefault();
        runShortcut('new-application');
        return;
      }

      // R: New reminder
      if (key === 'r') {
        e.preventDefault();
        runShortcut('new-reminder');
        return;
      }

      // U: Resume upload
      if (key === 'u') {
        e.preventDefault();
        runShortcut('upload-resume');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runShortcut]);

  // Ctrl/Cmd + navigation shortcuts
  useEffect(() => {
    const handleNavigation = (e) => {
      if (
        !(e.ctrlKey || e.metaKey) ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target;
      const tag = target?.tagName?.toLowerCase();

      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      const routes = {
        b: 'board',
        a: 'applications',
        d: 'dashboard',
        m: 'reminders',
        p: 'profile',
      };

      if (key === '.' || e.code === 'Period') {
        e.preventDefault();
        runShortcut('about');
        return;
      }

      if (routes[key]) {
        e.preventDefault();
        runShortcut(routes[key]);
      }
    };

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [runShortcut]);

  return (
    <div className="min-h-screen text-[#0C1A13] dark:text-[#E8F5EE] transition-colors flex flex-col">
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewReminder={() => setIsGlobalReminderOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 pt-[92px] sm:pt-[100px] pb-8 md:pb-10">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      <Footer className="mb-16 md:mb-0" />
      <MobileNav />

      <ApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        defaultStage={defaultNewAppStage}
      />

      <ReminderModal
        isOpen={isGlobalReminderOpen}
        onClose={() => setIsGlobalReminderOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectApplication={(app) => setSelectedDrawerApp(app)}
      />

      <ApplicationDrawer
        application={selectedDrawerApp}
        isOpen={Boolean(selectedDrawerApp)}
        onClose={() => setSelectedDrawerApp(null)}
        onEdit={(app) => {
          setSelectedDrawerApp(null);
          setEditingDrawerApp(app);
        }}
        onDelete={async (app) => {
          await deleteApplication(app.id);
          setSelectedDrawerApp(null);
        }}
        onAddReminder={() => setIsGlobalReminderOpen(true)}
        onStageChange={async (id, newStage) => {
          await moveStage(id, newStage);

          if (selectedDrawerApp) {
            setSelectedDrawerApp({
              ...selectedDrawerApp,
              stage: newStage,
            });
          }
        }}
      />

      {editingDrawerApp && (
        <ApplicationModal
          isOpen={Boolean(editingDrawerApp)}
          onClose={() => setEditingDrawerApp(null)}
          applicationToEdit={editingDrawerApp}
        />
      )}

      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
        onRunShortcut={(shortcut) => {
          setIsShortcutsHelpOpen(false);
          runShortcut(shortcut);
        }}
      />
    </div>
  );
};
