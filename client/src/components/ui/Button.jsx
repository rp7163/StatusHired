import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-[12px] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    const sizeStyles = {
      sm: 'text-[13px] px-3.5 py-1.5 gap-1.5 h-[36px]',
      md: 'text-[15px] px-5 py-2 gap-2 h-[44px]',
      lg: 'text-[16px] px-6 py-2.5 gap-2.5 h-[48px]',
    }[size];

    const variantStyles = {
      primary: 'gradient-bg text-white font-semibold shadow-[0_8px_24px_var(--accent-glow)] hover:brightness-110 hover:-translate-y-px',
      secondary:
        'bg-white dark:bg-[#0F1813] border border-[#E1EBE5] dark:border-[#1D2A23] hover:border-[#10B981] hover:text-[#059669] dark:hover:text-[#34D399] text-[#0C1A13] dark:text-[#E8F5EE]',
      ghost:
        'bg-transparent text-[#54635B] dark:text-[#8AA097] hover:text-[#0C1A13] dark:hover:text-[#E8F5EE] hover:bg-[#E1EBE5]/40 dark:hover:bg-[#142019]/60',
      danger: 'bg-[#FF453A] hover:bg-[#D70015] text-white shadow-xs',
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
