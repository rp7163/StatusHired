import React from 'react';

export const Card = ({ children, hoverable = false, padding = 'md', className = '', ...props }) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  return (
    <div
      className={`rounded-[20px] bg-white dark:bg-[#0F1813] text-[#0C1A13] dark:text-[#E8F5EE] shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-[#1D2A23] transition-all duration-150 ${
        hoverable
          ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:border-[#2A3B32]'
          : ''
      } ${paddingStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
