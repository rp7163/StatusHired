// Deterministic company letter avatar styling
const PALETTES = [
  { bg: 'bg-lime-500/15 text-lime-700 dark:text-lime-300 border-lime-200 dark:border-lime-800/60' },
  { bg: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60' },
  {
    bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
  },
  { bg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60' },
  { bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60' },
  { bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60' },
  { bg: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60' },
  {
    bg: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800/60',
  },
];

export function getCompanyAvatarInfo(name) {
  const clean = name.trim();
  const initial = (clean[0] || 'C').toUpperCase();

  // Hash code based on name
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTES.length;
  return {
    initial,
    classes: PALETTES[index].bg,
  };
}
