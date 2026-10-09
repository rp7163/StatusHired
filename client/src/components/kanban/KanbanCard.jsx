import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { getCompanyAvatarInfo } from '../../lib/avatar.js';

export const KanbanCard = React.memo(({ application, onClick, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: application.id,
    data: {
      type: 'Card',
      application,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const avatar = getCompanyAvatarInfo(application.company_name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative rounded-[20px] bg-white dark:bg-[#0F1813] p-4 text-left select-none transition-all duration-150 cursor-grab active:cursor-grabbing border border-black/6 dark:border-[#1D2A23] ${
        isDragging ? 'opacity-25' : 'shadow-xs hover:shadow-md hover:-translate-y-0.5'
      } ${isOverlay ? 'shadow-xl ring-2 ring-[#10B981] rotate-2 scale-[1.02] cursor-grabbing z-50' : ''}`}
    >
      {/* Top Header: Avatar + Company bold + Role muted */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${avatar.classes}`}
        >
          {avatar.initial}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-[15px] text-[#0C1A13] dark:text-[#E8F5EE] truncate leading-tight">
            {application.company_name}
          </h4>
          <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] truncate leading-tight mt-0.5">
            {application.role}
          </p>
        </div>
      </div>

      {/* CTC Chip (if present) */}
      {application.ctc && (
        <div className="mt-3 pt-2.5 border-t border-[#E1EBE5] dark:border-[#1D2A23] flex items-center justify-between">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#30D158]/12 text-[#1E8A38] dark:text-[#70FF94]">
            {application.ctc}
          </span>
        </div>
      )}
    </div>
  );
});

KanbanCard.displayName = 'KanbanCard';
