import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Plus,
  Sun,
  Moon,
  CheckCircle2,
  ArrowRight,
  Building2,
  Menu,
  X,
  Settings,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Layers,
  Kanban,
  FileText,
  Upload,
  Info,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar.jsx';
import { StatusHiredLogo } from '../ui/StatusHiredLogo.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useSearch } from '../../context/SearchContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useJobTracker } from '../../context/JobTrackerContext.jsx';
import { useReminderEngine } from '../../hooks/useReminderEngine.js';

export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/applications', label: 'Applications', icon: Layers },
  { to: '/board', label: 'Board', icon: Kanban },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/about', label: 'About', icon: Info },
];

/* Closes a dropdown when the user clicks anywhere outside of `ref`. */
function useOutsideClick(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, open, onClose]);
}

export const Header = ({ onOpenCommandPalette, onOpenSettings, onNewReminder }) => {
  const navigate = useNavigate();
  const { effectiveTheme, toggleTheme } = useTheme();
  const { openNewAppModal } = useSearch();
  const { user, signOut } = useAuth();
  const { reminders } = useJobTracker();
  const { dueReminders, unreadNotificationCount, snoozeReminder, toggleReminder, markAllDueAsDone } = useReminderEngine();

  const pendingReminders = reminders.filter((r) => !r.is_done).length;

  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createRef = useRef(null);
  const bellRef = useRef(null);
  const userRef = useRef(null);
  const mobileRef = useRef(null);

  useOutsideClick(bellRef, isBellOpen, () => setIsBellOpen(false));
  useOutsideClick(userRef, isUserOpen, () => setIsUserOpen(false));
  useOutsideClick(mobileRef, isMobileOpen, () => setIsMobileOpen(false));
  useOutsideClick(createRef, isCreateOpen, () => setIsCreateOpen(false));

  const CREATE_ITEMS = [
    { icon: Layers, label: 'New application', hint: 'N', action: () => openNewAppModal('saved') },
    { icon: Upload, label: 'Upload resume', hint: 'PDF', action: () => navigate('/resumes?upload=1') },
    { icon: Bell, label: 'New reminder', hint: 'R', action: () => onNewReminder?.() },
  ];

  const handleSignOut = async () => {
    setIsUserOpen(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const displayName = user?.full_name || user?.username || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="fixed top-0 inset-x-0 z-40 frosted-topbar">
      <div className="max-w-[1240px] mx-auto h-[76px] px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* ---------- Left: logo pill ---------- */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group"
          aria-label="StatusHired home"
        >
          <StatusHiredLogo
            size={34}
            className="transition"
          />

          <span className="hidden sm:inline-flex items-center h-9 px-3.5 rounded-xl gradient-bg text-white dark:!text-black font-[Outfit] font-bold !text-[15px] tracking-tight shadow-[0_6px_18px_var(--accent-glow)] brightness-100 group-hover:brightness-150 transition cambria-text">
            StatusHired
          </span>
        </Link>

        {/* ---------- Center: pill navigation (desktop) ---------- */}
        <nav className="hidden lg:flex nav-pill items-center gap-0.5" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-pill-link relative ${isActive ? 'active' : ''}`}
            >
              {item.label}
              {item.to === '/reminders' && pendingReminders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[var(--bg-elev)]" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* ---------- Right: controls ---------- */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search (⌘K) */}
          <button
            type="button"
            onClick={() => onOpenCommandPalette?.()}
            className="h-[42px] px-3.5 rounded-[10px] bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] hover:border-[#10B981] text-[#54635B] dark:text-[#8AA097] text-[14px] hidden md:flex items-center gap-2 transition-colors cursor-pointer"
            aria-label="Search applications"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setIsBellOpen((v) => !v)}
              className="w-[42px] h-[42px] rounded-[10px] bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] hover:border-[#10B981] flex items-center justify-center text-[#54635B] dark:text-[#8AA097] hover:text-[#059669] dark:hover:text-[#34D399] transition-colors relative cursor-pointer"
              title={`${unreadNotificationCount} notifications`}
              aria-label="Notifications"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.9} />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF453A]" />
              )}
            </button>

            <AnimatePresence>
              {isBellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 mt-2 w-80 sm:w-96 rounded-[16px] apple-card shadow-[var(--shadow-lg)] p-4 z-50 text-left"
                >
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[15px] text-[#0C1A13] dark:text-[#E8F5EE]">Notifications</span>
                      {unreadNotificationCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FF453A]/12 text-[#FF453A]">
                          {unreadNotificationCount} due
                        </span>
                      )}
                    </div>
                    {dueReminders.length > 0 && (
                      <button
                        onClick={markAllDueAsDone}
                        className="text-[13px] font-medium text-[#059669] dark:text-[#34D399] hover:underline cursor-pointer"
                      >
                        Mark all done
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {dueReminders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#54635B] dark:text-[#8AA097]">
                        <CheckCircle2 className="w-8 h-8 text-[#30D158] mx-auto mb-2" />
                        <p className="font-medium text-[#0C1A13] dark:text-[#E8F5EE]">All caught up</p>
                        <p className="mt-0.5">No overdue or pending deadlines right now.</p>
                      </div>
                    ) : (
                      dueReminders.map((rem) => {
                        const timeAgo = formatDistanceToNow(new Date(rem.remind_at), { addSuffix: true });
                        return (
                          <div key={rem.id} className="p-3 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-[13px] text-[#0C1A13] dark:text-[#E8F5EE] line-clamp-1">
                                {rem.title}
                              </h5>
                              <span className="text-[11px] font-medium text-[#FF453A] shrink-0">{timeAgo}</span>
                            </div>
                            {rem.applications && (
                              <p className="text-[12px] text-[#54635B] dark:text-[#8AA097] flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-[#10B981] shrink-0" />
                                <span className="truncate">
                                  {rem.applications.company_name} &bull; {rem.applications.role}
                                </span>
                              </p>
                            )}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                onClick={() => snoozeReminder(rem.id, 1)}
                                className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-white dark:bg-[#0F1813] border border-[#E1EBE5] dark:border-[#1D2A23] text-[#0C1A13] dark:text-[#E8F5EE] hover:border-[#10B981] transition-colors cursor-pointer"
                              >
                                Snooze 1h
                              </button>
                              <button
                                onClick={() => toggleReminder(rem.id, true)}
                                className="px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#30D158]/15 text-[#1B9D3F] dark:text-[#30D158] hover:bg-[#30D158]/25 transition-colors cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-[#E1EBE5] dark:border-[#1D2A23] text-center">
                    <Link
                      to="/reminders"
                      onClick={() => setIsBellOpen(false)}
                      className="text-[13px] font-medium text-[#059669] dark:text-[#34D399] hover:underline flex items-center justify-center gap-1"
                    >
                      <span>View all reminders</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme toggle – square 42px like the portfolio */}
          <button
            onClick={toggleTheme}
            className="w-[42px] h-[42px] rounded-[10px] bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] hover:border-[#10B981] flex items-center justify-center text-[#54635B] dark:text-[#8AA097] hover:text-[#059669] dark:hover:text-[#34D399] transition-colors cursor-pointer overflow-hidden"
            title={`Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            <motion.div
              key={effectiveTheme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-[18px] h-[18px]" strokeWidth={1.9} />
              ) : (
                <Moon className="w-[18px] h-[18px]" strokeWidth={1.9} />
              )}
            </motion.div>
          </button>

          {/* + Create dropdown */}
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setIsCreateOpen((v) => !v)}
              className="h-[40px] px-3 !rounded-lg apple-card flex items-center gap-1 cursor-pointer transition-colors hover:!border-[#10B981]"
              aria-label="Create new"
              aria-haspopup="menu"
              aria-expanded={isCreateOpen}
              title="Create new…"
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCreateOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
            </button>

            <AnimatePresence>
              {isCreateOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-12 mt-2 w-60 rounded-[16px] apple-card p-2 z-50 text-left"
                >
                  <p className="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#8A9A92] dark:text-[#5C6F67]">Create new</p>
                  {CREATE_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      role="menuitem"
                      onClick={() => { setIsCreateOpen(false); item.action(); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[14px] font-medium text-[#0C1A13] dark:text-[#E8F5EE] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-[8px] bg-[var(--accent-soft)] text-[#021f16] dark:text-[#34D399] flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4" strokeWidth={1.9} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {/* <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F1F8F4] dark:bg-[#142019] text-[#8AA097]">{item.hint}</kbd> */}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar menu */}
          <div className="relative" ref={userRef}>
            <button
            onClick={() => setIsUserOpen((v) => !v)}
            className="w-[42px] h-[42px] !rounded-full  cursor-pointer transition-colors flex items-center justify-center "
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={isUserOpen}
          >
            <Avatar user={user} size={40} rounded="rounded-xl" className="!border-2 cambria-text !bg-emrald-100/80 dark:!border-[var(--separator)] !text-black !text-[18px] !border !border-blue-200 brightness-125 hover:brightness-150 hover:!border-green-900 hover:!border-1"/>
          </button>

            <AnimatePresence>
              {isUserOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="absolute right-0 top-12 mt-2 w-64 rounded-[16px] apple-card p-2 z-50 text-left"
                >
                  <div className="flex items-center gap-3 px-2.5 py-2.5 mb-1 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
                    <Avatar user={user} size={40} rounded="rounded-[10px] !text-[20px] cambria-text dark:!text-black" />
                    <div className="min-w-0 !cambria-text">
                      <p className="text-[14px] font-semibold text-[#0C1A13] dark:text-[#E8F5EE] truncate ">
                        {displayName}
                      </p>
                      <p className="text-[12px] text-[#54635B] dark:text-[#8AA097] truncate">{user?.email}</p>
                    </div>
                  </div>
                  <MenuItem icon={UserIcon} label="My profile" onClick={() => { setIsUserOpen(false); navigate('/profile'); }} />
                  <MenuItem icon={Settings} label="Settings" onClick={() => { setIsUserOpen(false); onOpenSettings?.(); }} />
                  <MenuItem icon={LogOut} label="Sign out" danger onClick={handleSignOut} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen((v) => !v)}
            className="lg:hidden w-[42px] h-[42px] rounded-[10px] bg-[var(--bg-elev)] border border-[#E1EBE5] dark:border-[#1D2A23] flex items-center justify-center text-[#54635B] dark:text-[#8AA097] cursor-pointer"
            aria-label="Toggle navigation"
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ---------- Mobile dropdown nav (portfolio style card under header) ---------- */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            ref={mobileRef}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="lg:hidden absolute left-4 right-4 top-[84px] apple-card shadow-[var(--shadow-lg)] p-2 flex flex-col gap-1"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'gradient-bg text-white shadow-[0_6px_18px_var(--accent-glow)]'
                        : 'text-[#54635B] dark:text-[#8AA097] hover:bg-[var(--accent-soft)] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE]'
                    }`
                  }
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              onClick={() => { setIsMobileOpen(false); onOpenCommandPalette?.(); }}
              className="md:hidden flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[15px] font-medium text-[#54635B] dark:text-[#8AA097] hover:bg-[var(--accent-soft)] cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.9} />
              Search applications
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const MenuItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    role="menuitem"
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[14px] font-medium transition-colors cursor-pointer ${
      danger
        ? 'text-[#FF453A] hover:bg-[#FF453A]/10'
        : 'text-[#0C1A13] dark:text-[#E8F5EE] hover:bg-[var(--accent-soft)]'
    }`}
  >
    <Icon className="w-4 h-4" strokeWidth={1.9} />
    {label}
  </button>
);
