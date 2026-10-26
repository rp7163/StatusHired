import React from 'react';

/**
 * StatusHired Logo
 * Modern, executive-grade career pipeline & offer-status emblem.
 * Design: High-precision rounded hexagon / squircle badge with an ascending
 * career path ladder merging seamlessly into a celebratory checkmark / status beam.
 * Crisp gradient: Vivid Electric Sapphire (#10B981) -> Cyan/Teal (#00C6FF) & subtle Mint glow (#30D158).
 */
export const StatusHiredLogo = ({ className = '', size = 32, variant = 'mark', showBadge = false }) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  const markSvg = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-label="StatusHired Logo"
    >
      <defs>
        {/* Background rounded squircle gradient */}
        <linearGradient id="sh-bg-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>

        {/* Ambient top light sheen */}
        <linearGradient id="sh-glass-sheen" x1="12" y1="4" x2="36" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* The dynamic Status S-Check path stroke */}
        <linearGradient id="sh-check-stroke" x1="13" y1="33" x2="36" y2="15" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F8FF" />
          <stop offset="100%" stopColor="#30D158" />
        </linearGradient>

        {/* Target celebration beacon / star badge */}
        <radialGradient
          id="sh-beacon-glow"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(36 14) rotate(90) scale(7)"
        >
          <stop offset="0%" stopColor="#30D158" />
          <stop offset="100%" stopColor="#30D158" stopOpacity="0" />
        </radialGradient>

        <filter
          id="sh-subtle-shadow"
          x="0"
          y="2"
          width="48"
          height="46"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#10B981" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main squircle container with Apple rounded curves */}
      <rect
        x="3"
        y="3"
        width="42"
        height="42"
        rx="12.5"
        fill="url(#sh-bg-grad)"
        filter="url(#sh-subtle-shadow)"
      />

      {/* Glass / frosted highlights across top rim */}
      <rect x="3.5" y="3.5" width="41" height="41" rx="12" stroke="url(#sh-glass-sheen)" strokeWidth="1.2" />

      {/* Inner career progression tiers (3 subtle horizontal bars representing application pipeline) */}
      <path d="M13 18H20.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.4" />

      <path d="M13 24H23" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="1" />

      <path d="M13 30H20" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Status Victory Checkmark / Ascending Career Vector */}
      {/* Starting from bottom-mid, swooping up through the pipeline to "HIRED" */}
      <path
        d="M20 28.5L25.5 34L35.5 17.5"
        stroke="url(#sh-check-stroke)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glowing victory spark / hired star at tip */}
      <circle cx="35.5" cy="17.5" r="4.5" fill="url(#sh-beacon-glow)" />
      <circle cx="35.5" cy="17.5" r="1.8" fill="#FFFFFF" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{markSvg}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {markSvg}
      <div className="flex flex-col text-left select-none">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-[17px] tracking-tight text-[#0C1A13] dark:text-[#E8F5EE] font-sans">
            Status<span className="text-[#10B981]">Hired</span>
          </span>
          {/* {showBadge && (
             <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold tracking-wide uppercase bg-[#30D158]/12 text-[#30D158] dark:text-[#30D158] border border-[#30D158]/20">
               Pro
             </span>
            )} */}
        </div>
        {/* <span className="text-[10.5px] font-medium text-[#54635B] dark:text-[#8AA097] tracking-normal mt-0.5">
           Applications record
          </span> */}
      </div>
    </div>
  );
};
