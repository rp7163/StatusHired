import React, { useState } from 'react';
import { useReminderEngine } from '../hooks/useReminderEngine.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

import {
  X,
  Download,
  ArrowDownToLine,
  Database,
  ChevronRight,
  Fingerprint,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatabaseSetupModal } from './DatabaseSetupModal.jsx';
import { ConfirmDialog } from './ui/ConfirmDialog.jsx';
import { useToast } from './ui/Toast.jsx';
import { getBiometricEnrollment, enrollDeviceBiometrics } from '../lib/biometrics.js';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { browserNotificationsEnabled, requestNotificationPermission } = useReminderEngine();
  const { theme, setTheme } = useTheme();
  const { user, isConfigured, deleteAccount } = useAuth();
  const { success, error: toastError } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDbSetupOpen, setIsDbSetupOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(() => {
    return user ? getBiometricEnrollment(user.id).isEnrolled : false;
  });
  const [isEnrollingBio, setIsEnrollingBio] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res?.error) {
        toastError('Account Deletion Notice', res.error.message);
      } else {
        success('Account Deleted', 'User record deleted from auth schema and all associated data cleared.');
      }
      setIsConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      toastError('Account Deletion Error', err?.message || 'Could not complete account deletion');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEnrollBioFromSettings = async () => {
    if (!user || isEnrollingBio) return;
    setIsEnrollingBio(true);
    const res = await enrollDeviceBiometrics(user.id, user.email || 'user@statushired.app');
    setIsEnrollingBio(false);
    if (res.success) {
      setBiometricEnrolled(true);
    }
  };

  const handleToggleNotifications = async () => {
    setIsRequesting(true);
    try {
      await requestNotificationPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const themeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div key="settings-sheet" className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Small Apple-style Sheet Modal (Radius 24px) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm rounded-[24px] bg-white dark:bg-[#0F1813] shadow-2xl p-6 z-10 space-y-5 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
            <h3 className="text-[18px] font-bold text-[#0C1A13] dark:text-[#E8F5EE]">Settings</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#E1EBE5]/60 dark:bg-[#142019] text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Theme Segmented Picker */}
          <div className="space-y-2">
            <span className="text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium block">
              Appearance
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[#F7FBF8] dark:bg-[#142019]">
              {themeOptions.map((opt) => {
                const isSelected = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`py-2 px-2 rounded-[10px] text-[13px] font-medium transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#0F1813] text-[#0C1A13] dark:text-[#E8F5EE] shadow-xs'
                        : 'text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#F7FBF8] dark:bg-[#142019]">
            <div>
              <p className="text-[14px] font-medium text-[#0C1A13] dark:text-[#E8F5EE]">Browser Alerts</p>
              <p className="text-[12px] text-[#54635B] dark:text-[#8AA097]">Upcoming deadlines</p>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              disabled={isRequesting}
              className={`w-12 h-7 rounded-full p-0.5 transition-colors cursor-pointer ${
                browserNotificationsEnabled ? 'bg-[#30D158]' : 'bg-[#E1EBE5] dark:bg-[#1D2A23]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-xs transition-transform ${
                  browserNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Database Mode Status & Setup Guide */}
          {/* <div className="p-3.5 rounded-[16px] bg-[#F7FBF8] dark:bg-[#142019] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-medium text-[#0C1A13] dark:text-[#E8F5EE]">Database Status</p>
                <p className="text-[12px] text-[#54635B] dark:text-[#8AA097]">
                  {isConfigured ? 'Connected to server' : 'API server unreachable'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConfigured ? 'bg-[#30D158] animate-pulse' : 'bg-[#FF9F0A]'
                  }`}
                />

                <span className="text-[12px] font-medium text-[#54635B] dark:text-[#8AA097]">
                  {isConfigured ? 'Connected' : 'Offline'}
                </span>
              </div>
            </div>

            {/* <button
              type="button"
              onClick={() => setIsDbSetupOpen(true)}
              className="w-full mt-1 pt-2 border-t border-[#E1EBE5] dark:border-[#1D2A23] flex items-center justify-between text-[12px] text-[#10B981] hover:underline font-medium cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Server &amp; Database Setup Guide
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button> */}
          {/* </div> */} 

          {/* Device Biometrics & Security Tile */}
          {/* <div className="p-3.5 rounded-[16px] bg-[#F7FBF8] dark:bg-[#142019] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#0C1A13] dark:text-[#E8F5EE]">
                  Device Biometrics
                </p>
                <p className="text-[12px] text-[#54635B] dark:text-[#8AA097]">
                  {biometricEnrolled ? 'Touch ID / Face ID Active' : 'One-time hardware passkey'}
                </p>
              </div>
            </div>
            {biometricEnrolled ? (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#30D158]">
                <ShieldCheck className="w-4 h-4" />
                <span>Enrolled</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleEnrollBioFromSettings}
                disabled={isEnrollingBio}
                className="px-3 py-1 rounded-full bg-[#10B981] text-white text-[12px] font-medium hover:bg-[#059669] transition-colors cursor-pointer"
              >
                {isEnrollingBio ? 'Enrolling…' : 'Enroll'}
              </button>
            )}
          </div> */}

          {/* Export / Download Code ZIP */}
          {/* <a
            href="/statushired-app.zip"
            download="statushired-app.zip"
            className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#F7FBF8] dark:bg-[#142019] hover:bg-[#E1EBE5] dark:hover:bg-[#1D2A23] transition-colors cursor-pointer text-[#0C1A13] dark:text-[#E8F5EE] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[14px] font-medium">Download Project ZIP</p>
                <p className="text-[12px] text-[#54635B] dark:text-[#8AA097]">
                  Fixed & ready for local testing
                </p>
              </div>
            </div>
            <ArrowDownToLine className="w-4 h-4 text-[#54635B] dark:text-[#8AA097] group-hover:text-[#10B981] transition-colors" />
          </a> */}

          {/* Delete Account Danger Zone */}
          <div className="pt-2 border-t border-[#E1EBE5] dark:border-[#1D2A23] space-y-1">
            <button
              type="button"
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="w-full p-3 rounded-[16px] bg-[#FF453A]/8 hover:bg-[#FF453A]/15 text-[#FF453A] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entire Account</span>
            </button>
            <p className="text-[11px] text-[#54635B] dark:text-[#8AA097] text-center">
              Permanently deletes your all data from StatusHired
            </p>
          </div>

          {/* User Account Details */}
          <div className="text-center text-[11px] text-[#54635B] dark:text-[#8AA097]">
            Signed in as {user?.email || 'Active User'}
          </div>
        </motion.div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        key="confirm-delete"
        isOpen={isConfirmDeleteOpen}
        title="Delete Entire Account?"
        message="This permanently deletes your account from MongoDB along with all associated applications, resumes, and reminders. This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting…' : 'Yes, Delete My Account'}
        variant="danger"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      {/* Server & Database Setup Guide Modal */}
      <DatabaseSetupModal key="db-setup" isOpen={isDbSetupOpen} onClose={() => setIsDbSetupOpen(false)} />
    </AnimatePresence>
  );
};
