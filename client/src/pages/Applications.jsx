import { PageHeader } from '../components/ui/PageHeader.jsx';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApplications } from '../hooks/useApplications.js';
import { useSearch } from '../context/SearchContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

import { getCompanyAvatarInfo } from '../lib/avatar.js';
import { Search, SlidersHorizontal, ChevronRight, Briefcase, X } from 'lucide-react';
import { Badge, EmptyState, Skeleton } from '../components/ui/index.js';
import { ApplicationModal } from '../components/ApplicationModal.jsx';
import { ApplicationDrawer } from '../components/ApplicationDrawer.jsx';
import { ReminderModal } from '../components/ReminderModal.jsx';
import { subDays, isAfter } from 'date-fns';

const STAGE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'assessment', label: 'Assessment' },
  { id: 'interview', label: 'Interview' },
  { id: 'selected', label: 'Selected' },
  { id: 'rejected', label: 'Rejected' },
];

export const Applications = () => {
  useDocumentTitle({
    title: 'Applications',
    robots: 'noindex, nofollow',
  });

  const { applications, isLoading, createApplication, updateApplication, deleteApplication, moveStage } =
    useApplications();

  const { searchQuery, setSearchQuery } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters State
  const stageFilter = searchParams.get('stage') || 'all';
  const selectedJobType = searchParams.get('jobType') || 'all';
  const selectedSource = searchParams.get('source') || 'all';
  const selectedDateRange = searchParams.get('dateRange') || 'all';
  const selectedSort = searchParams.get('sort') || 'newest';

  // Popover State for additional filters
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef(null);
  const filterPopoverRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        filterPopoverRef.current &&
        !filterPopoverRef.current.contains(e.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setIsFiltersOpen(false);
      }
    };
    if (isFiltersOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isFiltersOpen]);

  // Update query params helper
  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '' || value === 'all') {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }
    setSearchParams(next, { replace: true });
  };

  // Modals & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  // Count of active extra filters
  const activeExtraFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedJobType !== 'all') count++;
    if (selectedSource !== 'all') count++;
    if (selectedDateRange !== 'all') count++;
    if (selectedSort !== 'newest') count++;
    return count;
  }, [selectedJobType, selectedSource, selectedDateRange, selectedSort]);

  // Filter & Sort Logic
  const filteredApplications = useMemo(() => {
    let list = applications.filter((app) => {
      // 1. Stage filter from segmented control
      if (stageFilter !== 'all' && app.stage !== stageFilter) {
        return false;
      }

      // 2. Job Type filter
      if (selectedJobType !== 'all' && app.job_type !== selectedJobType) {
        return false;
      }

      // 3. Source filter
      if (selectedSource !== 'all' && app.source !== selectedSource) {
        return false;
      }

      // 4. Date range filter
      if (selectedDateRange !== 'all') {
        const dateToCheck = app.applied_date ? new Date(app.applied_date) : new Date(app.created_at);
        const days = selectedDateRange === 'last7days' ? 7 : selectedDateRange === 'last30days' ? 30 : 90;
        if (!isAfter(dateToCheck, subDays(new Date(), days))) {
          return false;
        }
      }

      // 5. Global text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCompany = app.company_name.toLowerCase().includes(q);
        const matchesRole = app.role.toLowerCase().includes(q);
        const matchesLocation = app.location && app.location.toLowerCase().includes(q);
        const matchesNotes = app.notes && app.notes.toLowerCase().includes(q);
        if (!matchesCompany && !matchesRole && !matchesLocation && !matchesNotes) {
          return false;
        }
      }

      return true;
    });

    // Sort list
    list.sort((a, b) => {
      if (selectedSort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (selectedSort === 'company_asc') {
        return a.company_name.localeCompare(b.company_name);
      }
      if (selectedSort === 'stage') {
        return a.stage.localeCompare(b.stage);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [
    applications,
    stageFilter,
    selectedJobType,
    selectedSource,
    selectedDateRange,
    selectedSort,
    searchQuery,
  ]);

  const handleClearExtraFilters = () => {
    updateParams({
      jobType: null,
      source: null,
      dateRange: null,
      sort: null,
    });
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Applications" title="All applications" description="Search, filter and manage every role you have applied to." />
      {/* Header & Controls Row */}
      <div className="flex flex-col gap-4">
        {/* Search input + Filters Popover Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#54635B] dark:text-[#8AA097] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company or role…"
              className="w-full h-11 pl-10 pr-9 rounded-full bg-white dark:bg-[#0F1813] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] placeholder-[#54635B] dark:placeholder-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all border border-black/8 dark:border-[#1D2A23] shadow-xs"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#54635B] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Popover Button */}
          <div className="relative">
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`h-11 px-4 rounded-full flex items-center gap-2 text-[14px] font-medium transition-colors cursor-pointer border ${
                activeExtraFiltersCount > 0
                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                  : 'bg-white dark:bg-[#0F1813] text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] border-[#E1EBE5] dark:border-[#1D2A23]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeExtraFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-[11px] font-bold flex items-center justify-center">
                  {activeExtraFiltersCount}
                </span>
              )}
            </button>

            {/* Filters Popover Dropdown */}
            {isFiltersOpen && (
              <div
                ref={filterPopoverRef}
                className="absolute right-0 top-13 w-72 sm:w-80 rounded-[20px] bg-white dark:bg-[#0F1813] shadow-xl border border-[#E1EBE5] dark:border-[#1D2A23] p-5 z-40 space-y-4 text-left"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E1EBE5] dark:border-[#1D2A23]">
                  <h4 className="font-bold text-[15px] text-[#0C1A13] dark:text-[#E8F5EE]">Filter Options</h4>
                  {activeExtraFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearExtraFilters}
                      className="text-[13px] font-medium text-[#10B981] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Job Type */}
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Job Type</label>
                  <select
                    value={selectedJobType}
                    onChange={(e) => updateParams({ jobType: e.target.value })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[13px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  >
                    <option value="all">All Job Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Source */}
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Source</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => updateParams({ source: e.target.value })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[13px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  >
                    <option value="all">All Sources</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="on-campus">On campus</option>
                    <option value="Referral">Referral</option>
                    <option value="Company site">Company site</option>
                    <option value="Indeed">Indeed</option>
                    <option value="Wellfound">Wellfound</option>
                    <option value="TheJobCompany">TheJobCompany</option>
                    <option value="mail">Cold E-mail</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date range */}
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Applied Date</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => updateParams({ dateRange: e.target.value })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[13px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  >
                    <option value="all">Any time</option>
                    <option value="last7days">Past 7 days</option>
                    <option value="last30days">Past 30 days</option>
                    <option value="last90days">Past 90 days</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="space-y-1.5">
                  <label className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Sort By</label>
                  <select
                    value={selectedSort}
                    onChange={(e) => updateParams({ sort: e.target.value })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[13px] text-[#0C1A13] dark:text-[#E8F5EE] outline-none"
                  >
                    <option value="newest">Recently added</option>
                    <option value="oldest">Oldest first</option>
                    <option value="company_asc">Company (A-Z)</option>
                    <option value="stage">Pipeline Stage</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen(false)}
                    className="w-full h-10 rounded-[12px] bg-[#10B981] text-white text-[13px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stage Segmented Control Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STAGE_OPTIONS.map((opt) => {
            const isSelected = stageFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateParams({ stage: opt.id === 'all' ? null : opt.id })}
                className={`h-9 px-4 rounded-full text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#10B981] text-white shadow-xs'
                    : 'bg-white dark:bg-[#0F1813] text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] border border-[#E1EBE5] dark:border-[#1D2A23]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clean List View Container */}
      <div className="apple-card overflow-hidden transition-colors">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton variant="rounded" className="h-14 w-full" />
            <Skeleton variant="rounded" className="h-14 w-full" />
            <Skeleton variant="rounded" className="h-14 w-full" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Briefcase}
              title="No applications found"
              description="Track every step of your job hunt in one calm place."
              actionLabel="Add application"
              onAction={() => setIsModalOpen(true)}
            />
          </div>
        ) : (
          <div className="divide-y divide-[#E1EBE5] dark:divide-[#1D2A23]">
            {filteredApplications.map((app) => {
              const avatar = getCompanyAvatarInfo(app.company_name);
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedDrawerApp(app)}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F7FBF8]/50 dark:hover:bg-[#142019]/50 transition-colors cursor-pointer group"
                >
                  {/* Left: Avatar + Company bold + Role muted */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 ${avatar.classes}`}
                    >
                      {avatar.initial}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[15px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] truncate leading-snug">
                        {app.company_name}
                      </h4>
                      <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate leading-snug">
                        {app.role}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stage pill + Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="stage" stage={app.stage} size="md" />
                    <ChevronRight className="w-4 h-4 text-[#54635B] dark:text-[#8AA097] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <ApplicationDrawer
        application={selectedDrawerApp}
        isOpen={Boolean(selectedDrawerApp)}
        onClose={() => setSelectedDrawerApp(null)}
        onEdit={(app) => {
          setSelectedDrawerApp(null);
          setEditingApp(app);
          setIsModalOpen(true);
        }}
        onDelete={async (app) => {
          setSelectedDrawerApp(null);
          await deleteApplication(app.id);
        }}
        onAddReminder={(appId) => {
          setIsReminderOpen(true);
        }}
        onStageChange={async (id, stage) => {
          await moveStage(id, stage);
        }}
      />

      {/* Add / Edit Sheet Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApp(null);
        }}
        applicationToEdit={editingApp}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        preselectedAppId={selectedDrawerApp?.id}
      />
    </div>
  );
};
