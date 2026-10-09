import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
      {/* One soft icon container */}
      <div className="w-12 h-12 rounded-full bg-[#E1EBE5]/70 dark:bg-[#142019] text-[#54635B] dark:text-[#8AA097] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>

      {/* One clean title */}
      <h3 className="text-[17px] font-bold text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">{title}</h3>

      {/* One concise description line */}
      <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] max-w-sm mt-1 mb-5">{description}</p>

      {/* One clean button */}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
