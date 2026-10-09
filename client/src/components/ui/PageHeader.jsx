import React from 'react';

/** Portfolio-style section heading: small eyebrow pill + big display title. */
export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
    <div>
      {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
      <h1 className="text-[30px] sm:text-[38px] font-bold tracking-tight leading-[1.1] text-[#0C1A13] dark:text-[#E8F5EE]">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-[15px] text-[#54635B] dark:text-[#8AA097]">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);
