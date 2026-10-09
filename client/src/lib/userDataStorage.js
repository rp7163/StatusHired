/**
 * Local (offline) cache of the signed-in user's data.
 * The API is the source of truth; this bundle is only used to render something
 * useful when the server cannot be reached.
 */
const STORAGE_PREFIX = 'statushired_data_';

const EMPTY_BUNDLE = { applications: [], resumes: [], reminders: [], stageHistory: [] };

export function getLocalUserData(userId) {
  if (typeof localStorage === 'undefined') return { ...EMPTY_BUNDLE };

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.applications)) {
        return { ...EMPTY_BUNDLE, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Could not read user data bundle:', err);
  }

  return { ...EMPTY_BUNDLE };
}

export function saveLocalUserData(userId, bundle) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(bundle));
  } catch (err) {
    console.warn('Could not persist user data bundle:', err);
  }
}

export function clearLocalUserData(userId) {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
}
