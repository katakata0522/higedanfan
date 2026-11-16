import { STORAGE_KEY, restoreFanRecords } from '../../hooks/fanRecordStorage';

export const LEGACY_QUIZ_SESSION_STORAGE_KEY = 'higedanfan:quiz-session:v1';
export const QUIZ_SESSION_STORAGE_KEY = 'higedanfan:quiz-session:v2';

export type QuizSessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function browserQuizStore(kind: 'localStorage' | 'sessionStorage'): QuizSessionStore | null {
  try {
    return typeof window === 'undefined' ? null : window[kind];
  } catch {
    return null;
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// The record generation changes only on an explicit reset. Do not restore a
// session from before that reset, including when the reset happened in another tab.
export function readCurrentQuizRecordEpoch(store: QuizSessionStore | null): string | null {
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    return raw === null ? '' : restoreFanRecords(raw).resetEpoch;
  } catch {
    return null;
  }
}

// Call after the records store has observed an explicit reset. The generation
// check prevents a component mounting before hydration from clearing valid data.
export function clearStaleQuizSession(
  expectedEpoch: string,
  sessionStore: QuizSessionStore | null = browserQuizStore('sessionStorage'),
  recordStore: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!sessionStore || !expectedEpoch || readCurrentQuizRecordEpoch(recordStore) !== expectedEpoch) return false;
  try {
    let removed = false;
    for (const [key, version] of [[QUIZ_SESSION_STORAGE_KEY, 2], [LEGACY_QUIZ_SESSION_STORAGE_KEY, 1]] as const) {
      const raw = sessionStore.getItem(key);
      if (!raw) continue;
      try {
        const saved: unknown = JSON.parse(raw);
        if (
          isPlainObject(saved) &&
          saved.version === version &&
          typeof saved.resetEpoch === 'string' &&
          saved.resetEpoch !== expectedEpoch
        ) {
          sessionStore.removeItem(key);
          removed = true;
        }
      } catch {
        /* Leave unrecognized data untouched. */
      }
    }
    return removed;
  } catch {
    return false;
  }
}
