import React, { useState, useEffect } from 'react';
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

export const AppShell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isNewAppModalOpen, setIsNewAppModalOpen, defaultNewAppStage, openNewAppModal } = useSearch();
  const { moveStage, deleteApplication } = useApplications();

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [isGlobalReminderOpen, setIsGlobalReminderOpen] = useState(false);
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [editingDrawerApp, setEditingDrawerApp] = useState(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    let lastKey = '';
    let lastKeyTimeout = null;

    const handleKeyDown = (e) => {
      // 1. Command Palette: Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Check if user is typing in an input or textarea
      const target = e.target;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInput) return;

      // 2. Help modal: ?
      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsHelpOpen(true);
        return;
      }

      // 3. New Application: N
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        openNewAppModal('saved');
        return;
      }

      // 4. New Reminder: R
      if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsGlobalReminderOpen(true);
        return;
      }

      // 5. Sequence: G then B, G then A, G then D, G then R, G then M
      const key = e.key.toLowerCase();
      if (lastKey === 'g') {
        if (key === 'b') {
          e.preventDefault();
          navigate('/board');
        } else if (key === 'a') {
          e.preventDefault();
          navigate('/applications');
        } else if (key === 'd') {
          e.preventDefault();
          navigate('/');
        } else if (key === 'r') {
          e.preventDefault();
          navigate('/resumes');
        } else if (key === 'm') {
          e.preventDefault();
          navigate('/reminders');
        } else if (key === 'p') {
          e.preventDefault();
          navigate('/profile');
        }
        lastKey = '';
        if (lastKeyTimeout) clearTimeout(lastKeyTimeout);
      } else if (key === 'g') {
        lastKey = 'g';
        if (lastKeyTimeout) clearTimeout(lastKeyTimeout);
        lastKeyTimeout = setTimeout(() => {
          lastKey = '';
        }, 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (lastKeyTimeout) clearTimeout(lastKeyTimeout);
    };
  }, [navigate, openNewAppModal]);

  return (
    <div className="min-h-screen text-[#0C1A13] dark:text-[#E8F5EE] transition-colors flex flex-col">
      {/* Fixed glass header with top navigation */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewReminder={() => setIsGlobalReminderOpen(true)}
      />

      {/* Main Content Area (offset by the 76px header) */}
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

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <ApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        defaultStage={defaultNewAppStage}
      />

      <ReminderModal isOpen={isGlobalReminderOpen} onClose={() => setIsGlobalReminderOpen(false)} />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectApplication={(app) => setSelectedDrawerApp(app)}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsHelpModal isOpen={isShortcutsHelpOpen} onClose={() => setIsShortcutsHelpOpen(false)} />

      {/* Detail Drawer when an app is selected from Command Palette */}
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
        onAddReminder={() => {
          setIsGlobalReminderOpen(true);
        }}
        onStageChange={async (id, newStage) => {
          await moveStage(id, newStage);
          if (selectedDrawerApp) {
            setSelectedDrawerApp({ ...selectedDrawerApp, stage: newStage });
          }
        }}
      />

      {/* Editing modal for Drawer */}
      {editingDrawerApp && (
        <ApplicationModal
          isOpen={Boolean(editingDrawerApp)}
          onClose={() => setEditingDrawerApp(null)}
          applicationToEdit={editingDrawerApp}
        />
      )}
    </div>
  );
};
