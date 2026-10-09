import React from 'react';

export const Skeleton = ({ variant = 'rounded', className = '', ...props }) => {
  const variantStyles = {
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    rectangular: 'rounded-none',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-[#1D2A23] ${variantStyles} ${className}`}
      {...props}
    />
  );
};
