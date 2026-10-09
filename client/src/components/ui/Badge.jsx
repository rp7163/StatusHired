import React from 'react';
import { STAGES_CONFIG } from '../../types/index.js';

export const Badge = ({
  children,
  variant = 'default',
  stage,
  dot = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';

  if (variant === 'stage' && stage) {
    const config = STAGES_CONFIG[stage] || STAGES_CONFIG.saved;
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${config.pillBgLight} ${config.pillTextLight} ${config.pillBgDark} ${config.pillTextDark} ${className}`}
        {...props}
      >
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: config.dotColor }} />
        )}
        <span>{children || config.label}</span>
      </span>
    );
  }

  const variantMap = {
    default: 'bg-[#8AA097]/12 text-[#5C6F67] dark:bg-[#8AA097]/20 dark:text-[#8AA097]',
    primary: 'bg-[#10B981]/12 text-[#047857] dark:bg-[#10B981]/20 dark:text-[#6EE7B7]',
    success: 'bg-[#30D158]/14 text-[#1E8A38] dark:bg-[#30D158]/20 dark:text-[#70FF94]',
    warning: 'bg-[#FF9F0A]/14 text-[#C97800] dark:bg-[#FF9F0A]/20 dark:text-[#FFD60A]',
    danger: 'bg-[#FF453A]/12 text-[#D70015] dark:bg-[#FF453A]/20 dark:text-[#FF6961]',
    outline: 'border border-[#E1EBE5] dark:border-[#1D2A23] text-[#54635B] dark:text-[#8AA097]',
  };
  const variantClasses = variantMap[variant] || variantMap.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
