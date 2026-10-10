import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Building2, CornerDownLeft, X } from 'lucide-react';
import { useApplications } from '../hooks/useApplications.js';
import { STAGES_CONFIG } from '../types/index.js';
import { Badge } from './ui/Badge.jsx';

export const CommandPalette = ({ isOpen, onClose, onSelectApplication }) => {
  const { applications } = useApplications();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Quick actions / navigation shortcuts were intentionally removed:
  // the palette is now a pure application search (⌘K).
  const actions = useMemo(() => [], []);

  // Search filtered applications
  const matchedApps = useMemo(() => {
    const q = query.toLowerCase().trim();
    return applications
      .filter((app) => {
        if (!q) return true; // show the most recent applications until the user types
        return (
          app.company_name.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          (app.notes && app.notes.toLowerCase().includes(q)) ||
          (app.location && app.location.toLowerCase().includes(q))
        );
      })
      .slice(0, q ? 50 : 8)
      .map((app) => ({
        type: 'app',
        id: `app-${app.id}`,
        app,
        category: q ? 'Applications' : 'Recent applications',
      }));
  }, [applications, query]);

  // Filtered actions when searching
  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase().trim();
    return actions.filter((act) => act.label.toLowerCase().includes(q));
  }, [actions, query]);

  // Combined flat list for keyboard navigation
  const flatItems = useMemo(() => {
    return [...matchedApps, ...filteredActions];
  }, [matchedApps, filteredActions]);

  // Clamp selected index
  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatItems.length) % Math.max(1, flatItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) {
        if (current.type === 'action') {
          current.action();
        } else {
          onClose();
          onSelectApplication(current.app);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs"
          />

          {/* Palette Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#0F1813] border border-[#E1EBE5] dark:border-[#1D2A23] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
          >
            {/* Input Header */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search companies, roles, notes or locations..."
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-[#E8F5EE] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              />

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {/* <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#060A08] border border-[#E1EBE5] dark:border-[#1D2A23]">
                  ESC
                </kbd> */}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List Results */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
              {flatItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <p>No results found for "{query}".</p>
                  <p className="mt-1 text-slate-500">Try searching for a company name or role.</p>
                </div>
              ) : (
                flatItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;

                  if (item.type === 'app') {
                    const cfg = STAGES_CONFIG[item.app.stage] || STAGES_CONFIG.saved;
                    return (
                      <div
                        key={item.id}
                        data-selected={isSelected}
                        onClick={() => {
                          onClose();
                          onSelectApplication(item.app);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-slate-900 dark:text-white'
                            : 'hover:bg-slate-50 dark:hover:bg-[#142019] text-slate-700 dark:text-[#E8F5EE]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="font-heading font-bold text-xs sm:text-sm truncate">
                                {item.app.company_name}
                              </h5>
                              <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                &bull; {item.app.role}
                              </span>
                            </div>
                            {item.app.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-[#8AA097] truncate max-w-sm">
                                {item.app.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="stage" stage={item.app.stage} dot />
                          {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      </div>
                    );
                  }

                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      data-selected={isSelected}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-slate-900 dark:text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-[#142019] text-slate-700 dark:text-[#E8F5EE]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#1a2035] text-slate-600 dark:text-[#8AA097] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:inline">
                          {item.category}
                        </span>
                        {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
