import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  ({ label, error, options, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium text-[#54635B] dark:text-[#8AA097]">
            {label}
            {props.required && <span className="text-[#FF453A] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full h-12 rounded-[12px] bg-[#F7FBF8] dark:bg-[#142019] text-[#0C1A13] dark:text-[#E8F5EE] text-[15px] px-4 pr-10 appearance-none transition-all outline-none focus:ring-2 focus:ring-[#10B981] disabled:opacity-50 cursor-pointer ${
              error ? 'ring-2 ring-[#FF453A]' : ''
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-[#0F1813] text-[#0C1A13] dark:text-[#E8F5EE]"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 w-4 h-4 text-[#54635B] dark:text-[#8AA097] pointer-events-none" />
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

Select.displayName = 'Select';
