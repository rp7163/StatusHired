import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={textareaId} className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097]">
            {label}
            {props.required && <span className="text-[#FF453A] ml-1">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-[15px] placeholder:text-[#54635B] dark:placeholder:text-[#8AA097] p-3.5 transition-all outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-50 resize-y ${
            error ? 'ring-2 ring-[#FF453A]' : ''
          } ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-xs text-[#FF453A] mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#54635B] dark:text-[#8AA097] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
