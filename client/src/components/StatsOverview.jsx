import React from 'react';
import { Card } from './ui/index.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';
import { Briefcase, CalendarCheck, FileCheck, Trophy, Clock } from 'lucide-react';

export const StatsOverview = () => {
  const { applications, reminders } = useJobTracker();

  const total = applications.length;
  const interviews = applications.filter((a) => a.stage === 'interview').length;
  const assessments = applications.filter((a) => a.stage === 'assessment').length;
  const selectedOffers = applications.filter((a) => a.stage === 'selected').length;
  const activeReminders = reminders.filter((r) => !r.is_done).length;

  const statItems = [
    {
      label: 'Total Pipeline',
      value: total,
      subtext: `${applications.filter((a) => a.stage === 'applied').length} in review`,
      icon: Briefcase,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      label: 'Interviews Active',
      value: interviews,
      subtext: 'High engagement stage',
      icon: CalendarCheck,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-violet-100 dark:border-violet-900/30',
    },
    {
      label: 'Assessments Due',
      value: assessments,
      subtext: 'Take-homes & quizzes',
      icon: FileCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      label: 'Offers & Selected',
      value: selectedOffers,
      subtext: 'Target destinations',
      icon: Trophy,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      label: 'Pending Reminders',
      value: activeReminders,
      subtext: 'Upcoming follow-ups',
      icon: Clock,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-100 dark:border-rose-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} padding="sm" hoverable className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-[#8AA097] uppercase tracking-wider truncate">
                {item.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold font-heading text-slate-900 dark:text-[#E8F5EE]">
                {item.value}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#8AA097] mt-0.5 truncate">{item.subtext}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
