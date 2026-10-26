import { PageHeader } from '../components/ui/PageHeader.jsx';
import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { STAGES_CONFIG } from '../types/index.js';
import { useApplications } from '../hooks/useApplications.js';
import { useJobTracker } from '../context/JobTrackerContext.jsx';
import { useSearch } from '../context/SearchContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { KanbanColumn } from '../components/kanban/KanbanColumn.jsx';
import { KanbanCard } from '../components/kanban/KanbanCard.jsx';
import { ApplicationModal } from '../components/ApplicationModal.jsx';
import { ApplicationDrawer } from '../components/ApplicationDrawer.jsx';
import { ReminderModal } from '../components/ReminderModal.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Search, X } from 'lucide-react';

export const Board = () => {
  useDocumentTitle('Board');

  const { applications, isLoading, moveStage, deleteApplication } = useApplications();

  const { reminders } = useJobTracker();
  const { searchQuery, setSearchQuery } = useSearch();
  const { info } = useToast();

  // Modals and Drawer state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAddStage, setSelectedAddStage] = useState('saved');
  const [editingApp, setEditingApp] = useState(null);
  const [selectedDrawerApp, setSelectedDrawerApp] = useState(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderAppId, setReminderAppId] = useState(null);

  // DnD Active State for DragOverlay
  const [activeApp, setActiveApp] = useState(null);

  // Sensors setup for Touch, Pointer and Keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        app.company_name.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        (app.location && app.location.toLowerCase().includes(q))
      );
    });
  }, [applications, searchQuery]);

  // Stage columns in strict order
  const stageKeys = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];

  // Applications grouped by stage
  const columnsData = useMemo(() => {
    const map = {
      saved: [],
      applied: [],
      assessment: [],
      interview: [],
      selected: [],
      rejected: [],
    };
    for (const app of filteredApplications) {
      if (map[app.stage]) {
        map[app.stage].push(app);
      } else {
        map.saved.push(app);
      }
    }
    return map;
  }, [filteredApplications]);

  // Handle Drag Start
  const handleDragStart = useCallback(
    (event) => {
      const { active } = event;
      const app = applications.find((a) => a.id === active.id);
      if (app) {
        setActiveApp(app);
      }
    },
    [applications]
  );

  // Handle Drag Over
  const handleDragOver = useCallback((event) => {
    // Handled visually by @dnd-kit
  }, []);
  // Handle Drag End
  const handleDragEnd = useCallback(
    async (event) => {
      const { active, over } = event;
      setActiveApp(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      const targetApp = applications.find((a) => a.id === activeId);
      if (!targetApp) return;

      let destinationStage = null;

      // 1. Dropped directly over a column container
      if (stageKeys.includes(overId)) {
        destinationStage = overId;
      } else {
        // 2. Dropped over another card in a column
        const overApp = applications.find((a) => a.id === overId);
        if (overApp) {
          destinationStage = overApp.stage;
        }
      }

      if (!destinationStage) return;

      if (targetApp.stage !== destinationStage) {
        const previousStage = targetApp.stage;

        try {
          await moveStage(targetApp.id, destinationStage);

          // Confetti celebratory burst if moved to "selected"
          if (destinationStage === 'selected') {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#30D158', '#10B981', '#BF5AF2', '#FF9F0A', '#FFD60A'],
            });
          }

          // Reminder prompt toast if moved to "interview"
          if (destinationStage === 'interview') {
            info(`Moved ${targetApp.company_name} to Interview!`, 'Would you like to schedule prep?', {
              label: 'Set Reminder',
              onClick: () => {
                setReminderAppId(targetApp.id);
                setIsReminderModalOpen(true);
              },
            });
          }
        } catch (err) {
          console.error('Failed to move stage:', err);
        }
      }
    },
    [applications, moveStage, stageKeys, info]
  );

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Application board" description="Drag applications between stages as your process moves forward." />
      {/* Top Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#54635B] dark:text-[#8AA097] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search board…"
            className="w-full h-10 pl-10 pr-9 rounded-full bg-white dark:bg-[#0F1813] text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] placeholder-[#54635B] dark:placeholder-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981]/30 transition-all border border-black/8 dark:border-[#1D2A23] shadow-xs"
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
      </div>

      {/* Kanban Board Horizontal Columns Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar min-h-[600px]">
          {stageKeys.map((stageKey) => {
            const config = STAGES_CONFIG[stageKey];
            const columnApps = columnsData[stageKey] || [];

            return (
              <KanbanColumn
                key={stageKey}
                stage={config}
                applications={columnApps}
                reminderAppIds={new Set()}
                onAddClick={(stageId) => {
                  setSelectedAddStage(stageId);
                  setIsAddModalOpen(true);
                }}
                onCardClick={(app) => {
                  setSelectedDrawerApp(app);
                }}
              />
            );
          })}
        </div>

        {/* Drag Overlay with slight rotation */}
        <DragOverlay>
          {activeApp ? <KanbanCard application={activeApp} isOverlay={true} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Detail Drawer */}
      <ApplicationDrawer
        application={selectedDrawerApp}
        isOpen={Boolean(selectedDrawerApp)}
        onClose={() => setSelectedDrawerApp(null)}
        onEdit={(app) => {
          setSelectedDrawerApp(null);
          setEditingApp(app);
          setIsAddModalOpen(true);
        }}
        onDelete={async (app) => {
          setSelectedDrawerApp(null);
          await deleteApplication(app.id);
        }}
        onAddReminder={(appId) => {
          setReminderAppId(appId);
          setIsReminderModalOpen(true);
        }}
        onStageChange={async (id, stage) => {
          await moveStage(id, stage);
        }}
      />

      {/* Add / Edit Sheet Modal */}
      <ApplicationModal
        isOpen={isAddModalOpen}
        defaultStage={selectedAddStage}
        applicationToEdit={editingApp}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingApp(null);
        }}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderAppId(null);
        }}
        preselectedAppId={reminderAppId || undefined}
      />
    </div>
  );
};
