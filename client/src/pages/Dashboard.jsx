import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Check, ChevronRight } from 'lucide-react';
import { useApplications } from '../hooks/useApplications.js';
import { useReminderEngine } from '../hooks/useReminderEngine.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

import { getCompanyAvatarInfo } from '../lib/avatar.js';
import { Badge } from '../components/ui/index.js';
import { AnimatedNumber } from '../components/ui/AnimatedNumber.jsx';

import { ApplicationDrawer } from '../components/ApplicationDrawer.jsx';
import { ReminderModal } from '../components/ReminderModal.jsx';
import { ApplicationModal } from '../components/ApplicationModal.jsx';

export const Dashboard = () => {
  useDocumentTitle('Dashboard');

  const { applications, moveStage, deleteApplication } = useApplications();
  const { reminders, toggleReminder } = useReminderEngine();
  const { user } = useAuth();

  // Selected app for detail drawer
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Display user name
  const displayName = useMemo(() => {
    if (user?.full_name || user?.user_metadata?.full_name) {
      return (user.full_name || user.user_metadata.full_name).split(' ')[0];
    }
    if (user?.username) return user.username;
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return '';
  }, [user]);

  // Today's formatted date
  const todayFormatted = useMemo(() => {
    return format(new Date(), 'EEEE, MMMM d');
  }, []);

  // 4 Core Counts
  const totalCount = applications.length;

  // const activeCount = useMemo(() => {
  //   return applications.filter((a) => ['applied', 'assessment', 'interview'].includes(a.stage)).length;
  // }, [applications]);

  const assessmentCount = useMemo(() => {
    return applications.filter((a) => ['assessment'].includes(a.stage)).length;
  }, [applications]);

  const interviewCount = useMemo(() => {
    return applications.filter((a) => a.stage === 'interview').length;
  }, [applications]);

  const rejectCount = useMemo(() => {
    return applications.filter((a) => a.stage === 'rejected').length;
  }, [applications]);

  const selectedCount = useMemo(() => {
    return applications.filter((a) => a.stage === 'selected').length;
  }, [applications]);

  // Next 3 upcoming reminders
  const next3Reminders = useMemo(() => {
    return reminders
      .filter((r) => !r.is_done)
      .sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime())
      .slice(0, 5);
  }, [reminders]);

  // Last 5 recent applications
  const recent5Apps = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [applications]);

  return (
    <div className="space-y-8">
      {/* Top Greeting */}
      <div>
        <span className="eyebrow mb-3">{todayFormatted}</span>
        <h1 className="text-[35px]! sm:text-[38px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] cambria-text">
          {greeting}{displayName ? ', ' : ''}
          {displayName && <span className="gradient-text">{displayName}</span>}
        </h1>
      </div>

      <div className="mx-auto mb-5 w-fit rounded-xl border border-emerald-900/40 bg-emerald-100/80 px-6 py-2.5 text-center text-black shadow-lg dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100">
        <h2 className="cambria-text !text-[25px] font-bold tracking-wide">
          Job  Application Summary
        </h2>
      </div>

      {/* 4 Clean Apple Health Stat Cards: small colored dot, label in muted text, big 40px number */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Applications */}
        <a href="/applications">
          <div className="apple-card p-5 transition-colors !bg-blue-200 dark:!bg-[var(--bg-card)] border">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#000000] shrink-0" /> */}
              <span className="text-blue-800 mx-auto text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium comic-text">
                Total applications
              </span>
            </div>
            <div className="text-blue-950 font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] mt-2 leading-none cambria-text text-center">
              <AnimatedNumber value={totalCount} />
            </div>
          </div>
        </a>

        {/* Card 2: Active */}
        <a href="/applications?stage=assessment">
          <div className="apple-card p-5 transition-colors !bg-yellow-100 dark:!bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#00ffaa] shrink-0" /> */}
              <span className="text-yellow-800 mx-auto text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium comic-text">
                OA / Task
              </span>
            </div>
            <div className="text-yellow-950 font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] mt-2 leading-none cambria-text text-center ">
              <AnimatedNumber value={assessmentCount} />
            </div>
          </div>
        </a>

        {/* Card 3: Interviews */}
        
        <a href="/applications?stage=interview">
          <div className="apple-card p-5 transition-colors !bg-violet-200 dark:!bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#958bff] shrink-0" /> */}
              <span className="text-violet-800 mx-auto text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium comic-text">Interviews</span>
            </div>
            <div className="text-violet-950 font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] mt-2 leading-none cambria-text text-center ">
              <AnimatedNumber value={interviewCount} />
            </div>
          </div>
        </a>

        {/* Card 4: Rejected */}
        <a href="/applications?stage=rejected">
          <div className="apple-card p-5 transition-colors !bg-[#fecaca] dark:!bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#b91610] shrink-0" /> */}
              <span className="text-red-800 mx-auto text-[13px]  dark:text-[#8AA097] font-medium comic-text ">Rejected</span>
            </div>
            <div className="text-red-950 font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] mt-2 leading-none cambria-text text-center">
              <AnimatedNumber value={rejectCount} />
            </div>
          </div>
        </a>

        {/* Card 5: Selected (Offers) */}
        
        <a href="/applications?stage=selected">
          <div className="apple-card p-5 transition-colors !bg-green-200 dark:!bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              {/* <span className="w-2.5 h-2.5 rounded-full bg-[#30D158] shrink-0" /> */}
              <span className="text-green-800 mx-auto text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium comic-text">
                Offers &amp; Selected
              </span>
            </div>
            <div className="text-green-950 font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] mt-2 leading-none cambria-text text-center ">
              <AnimatedNumber value={selectedCount} />
            </div>
          </div>
        </a>
      </div>

      {/* 2 Charts: Applications over 8 weeks & Stage breakdown */}
      {/* <DashboardCharts applications={applications} /> */}

      {/* Lists Below: Upcoming Reminders (next 3) & Recent Applications (last 5) with hairline separators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card: Upcoming Reminders (next 3) */}
        <div className="apple-card overflow-hidden transition-colors flex flex-col justify-between">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-[#E1EBE5] dark:border-[#1D2A23]">
            <h4 className="font-bold text-[17px] text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">
              Upcoming reminders
            </h4>
            <Link
              to="/reminders"
              className="text-[13px] font-medium text-[#10B981] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23] flex-1">
            {next3Reminders.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#54635B] dark:text-[#8AA097]">
                <p>No upcoming reminders</p>
              </div>
            ) : (
              next3Reminders.map((rem) => {
                const remDate = new Date(rem.remind_at);
                const isOverdue = isPast(remDate);
                const timeText = formatDistanceToNow(remDate, { addSuffix: true });

                return (
                  <div
                    key={rem.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-[#F7FBF8]/50 dark:hover:bg-[#142019]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleReminder(rem.id, true)}
                        className="w-5 h-5 rounded-full border border-[#54635B] dark:border-[#8AA097] hover:border-[#30D158] hover:bg-[#30D158]/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                        title="Mark as done"
                        aria-label="Mark done"
                      >
                        <Check className="w-3 h-3 text-transparent hover:text-[#30D158]" />
                      </button>
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-[#0C1A13] dark:text-[#E8F5EE] truncate">
                          {rem.title}
                        </p>
                        {rem.applications && (
                          <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate">
                            {rem.applications.company_name} &bull; {rem.applications.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[12px] shrink-0 font-medium ${
                        isOverdue ? 'text-[#FF453A]' : 'text-[#54635B] dark:text-[#8AA097]'
                      }`}
                    >
                      {timeText}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Card: Recent Applications (last 5) */}
        <div className="apple-card overflow-hidden transition-colors flex flex-col justify-between">
          <div className="p-5 pb-3 flex items-center justify-between border-b border-[#E1EBE5] dark:border-[#1D2A23]">
            <h4 className="font-bold text-[17px] text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">
              Recent applications
            </h4>
            <Link
              to="/applications"
              className="text-[13px] font-medium text-[#10B981] hover:underline flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23] flex-1">
            {recent5Apps.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#54635B] dark:text-[#8AA097]">
                <p>No applications logged yet</p>
              </div>
            ) : (
              recent5Apps.map((app) => {
                const avatar = getCompanyAvatarInfo(app.company_name);
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedDrawerApp(app)}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-[#F7FBF8]/50 dark:hover:bg-[#142019]/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatar.classes}`}
                      >
                        {avatar.initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] truncate">
                          {app.company_name}
                        </p>
                        <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate">{app.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="stage" stage={app.stage} size="sm" />
                      <ChevronRight className="w-4 h-4 text-[#54635B] dark:text-[#8AA097]" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Drawer */}
      <ApplicationDrawer
        application={selectedDrawerApp}
        isOpen={Boolean(selectedDrawerApp)}
        onClose={() => setSelectedDrawerApp(null)}
        onEdit={(app) => {
          setSelectedDrawerApp(null);
          setEditingApp(app);
          setIsEditModalOpen(true);
        }}
        onDelete={async (app) => {
          setSelectedDrawerApp(null);
          await deleteApplication(app.id);
        }}
        onAddReminder={(appId) => {
          setIsReminderModalOpen(true);
        }}
        onStageChange={async (id, stage) => {
          await moveStage(id, stage);
        }}
      />

      {/* Edit Modal */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingApp(null);
        }}
        applicationToEdit={editingApp}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        preselectedAppId={selectedDrawerApp?.id}
      />
    </div>
  );
};
