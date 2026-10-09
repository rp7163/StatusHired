import React, { useState } from 'react';

/**
 * Default profile picture used when the user has neither uploaded a photo
 * nor set a name/username. (Inline SVG → no network needed.)
 */
export const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#34D399"/>
          <stop offset="1" stop-color="#14B8A6"/>
        </linearGradient>
      </defs>
      <rect width="128" height="128" fill="url(#g)"/>
      <circle cx="64" cy="50" r="24" fill="#ffffff" fill-opacity="0.92"/>
      <path d="M20 118c4-26 22-40 44-40s40 14 44 40z" fill="#ffffff" fill-opacity="0.92"/>
    </svg>`
  );

export function getInitials(user) {
  const name = user?.full_name || user?.user_metadata?.full_name || user?.username || '';
  const trimmed = String(name).trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Avatar priority:
 *   1. Uploaded photo (user.avatar_url)
 *   2. Initials from full name / username
 *   3. Default illustrated avatar (never falls back to raw email letters)
 */
export const Avatar = ({ user, src, size = 40, className = '', rounded = 'rounded-full', alt }) => {
  const [broken, setBroken] = useState(false);
  const photo = src || user?.avatar_url || user?.user_metadata?.avatar_url || null;
  const initials = getInitials(user);
  const fontSize = Math.max(11, Math.round(size * 0.38));
  const label = alt || user?.full_name || user?.username || 'Profile photo';

  if (photo && !broken) {
    return (
      <img
        src={photo}
        alt={label}
        width={size}
        height={size}
        onError={() => setBroken(true)}
        className={`${rounded} object-cover shrink-0 border border-[#E1EBE5] dark:border-[#1D2A23] ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${rounded} shrink-0 gradient-bg text-white font-bold flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size, fontSize }}
        aria-label={label}
        role="img"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={DEFAULT_AVATAR}
      alt={label}
      width={size}
      height={size}
      className={`${rounded} object-cover shrink-0 border border-[#E1EBE5] dark:border-[#1D2A23] ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
