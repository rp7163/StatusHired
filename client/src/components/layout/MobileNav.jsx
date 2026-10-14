import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Kanban, Bell, Plus, User } from 'lucide-react';
import { useSearch } from '../../context/SearchContext.jsx';
import { useJobTracker } from '../../context/JobTrackerContext.jsx';

export const MobileNav = () => {
  const { openNewAppModal } = useSearch();
  const { reminders } = useJobTracker();
  const pendingReminders = reminders.filter((r) => !r.is_done).length;

  const tabs = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Apps', icon: Layers },
    { to: '/board', label: 'Board', icon: Kanban },
    { to: '/reminders', label: 'Reminders', icon: Bell, badge: pendingReminders },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button for "+ New" on mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => openNewAppModal('saved')}
          className="w-12 h-12 rounded-full gradient-bg text-white shadow-[0_8px_24px_var(--accent-glow)] flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Create New Application"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[var(--bg-elev)]/95 backdrop-blur-xl border-t border-[#E1EBE5] dark:border-[#1D2A23] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 min-h-[44px] min-w-[44px] rounded-full text-[11px] font-medium transition-all ${
                  isActive ? 'text-[#059669] dark:text-[#34D399] font-semibold' : 'text-[#54635B] dark:text-[#8AA097]'
                }`
              }
            >
              {({ isActive }) => (
                <div className="relative flex flex-col items-center">
                  <Icon className="w-5 h-5 mb-0.5" strokeWidth={isActive ? 2.2 : 1.75} />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-[#FF453A]" />
                  ) : null}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};
