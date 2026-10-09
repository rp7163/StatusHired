import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097]">
            {label}
            {props.required && <span className="text-[#FF453A] ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#54635B] dark:text-[#8AA097]">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full h-12 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-[15px] placeholder:text-[#54635B] dark:placeholder:text-[#8AA097] outline-none focus:ring-2 focus:ring-[#10B981] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : 'px-4'
            } ${rightIcon ? 'pr-10' : 'px-4'} ${error ? 'ring-2 ring-[#FF453A]' : ''} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#54635B] dark:text-[#8AA097]">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#FF453A] mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#54635B] dark:text-[#8AA097] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
