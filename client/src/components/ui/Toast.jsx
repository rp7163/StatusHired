import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type, title, message, duration = 4000, action) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, type, title, message, duration, action };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (title, message, action) => showToast('success', title, message, 4000, action),
    [showToast]
  );
  const error = useCallback((title, message) => showToast('error', title, message), [showToast]);
  const info = useCallback(
    (title, message, action) => showToast('info', title, message, 5000, action),
    [showToast]
  );
  const warning = useCallback(
    (title, message, action) => showToast('warning', title, message, 4000, action),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, dismiss }}>
      {children}
      {/* Toast Portal Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#0F1813] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-xl text-left"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-emerald-500" />}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-[#E8F5EE]">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-slate-500 dark:text-[#8AA097] mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      dismiss(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-indigo-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-[#E8F5EE] hover:bg-slate-100 dark:hover:bg-[#1D2A23] transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
