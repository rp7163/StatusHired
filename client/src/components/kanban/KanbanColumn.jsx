import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { KanbanCard } from './KanbanCard.jsx';
import { Plus } from 'lucide-react';

export const KanbanColumn = ({ stage, applications, onAddClick, onCardClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: {
      type: 'Column',
      stage: stage.id,
    },
  });

  const cardIds = applications.map((app) => app.id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-full flex-1 snap-start p-3 rounded-[24px] transition-colors min-h-[520px] ${
        isOver
          ? 'bg-[#10B981]/8 ring-2 ring-[#10B981]/20'
          : 'bg-[#E1EBE5]/45 dark:bg-[#0F1813]/30 border border-black/4 dark:border-transparent'
      }`}
    >
      {/* Column Header: Dot + Title + Count */}
      <div className="flex items-center justify-between gap-2 px-2 py-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.dotColor }} />

          <h3 className="font-bold text-[14px] text-[#0C1A13] dark:text-[#E8F5EE] truncate">{stage.label}</h3>
          <span className="text-[13px] text-[#54635B] dark:text-[#8AA097] font-medium shrink-0">
            {applications.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddClick(stage.id)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] hover:bg-white dark:hover:bg-[#142019] transition-colors cursor-pointer shrink-0"
          title={`Add in ${stage.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards List in SortableContext */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <KanbanCard key={app.id} application={app} onClick={() => onCardClick(app)} />
          ))}
        </SortableContext>

        {/* Minimal Drop zone if empty */}
        {applications.length === 0 && (
          <div
            onClick={() => onAddClick(stage.id)}
            className="h-28 rounded-[20px] border border-dashed border-[#E1EBE5] dark:border-[#1D2A23] hover:border-[#10B981] flex items-center justify-center p-4 text-center cursor-pointer transition-colors"
          >
            <p className="text-[13px] text-[#54635B] dark:text-[#8AA097]">Drop here or tap +</p>
          </div>
        )}
      </div>
    </div>
  );
};
