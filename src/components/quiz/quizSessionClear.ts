import { readStoredResetEpoch } from '../../hooks/fanRecordStorage';
import {
  getBrowserLocalStorage,
  getBrowserSessionStorage,
  hasBlockedKey,
  isPlainObject,
  safeJsonParseBounded,
  type BrowserStorageLike,
} from '../../utils/browserStorage';

export const LEGACY_QUIZ_SESSION_STORAGE_KEY = 'higedanfan:quiz-session:v1';
export const QUIZ_SESSION_STORAGE_KEY = 'higedanfan:quiz-session:v2';

const MAX_QUIZ_SESSION_BYTES = 100_000;

export { isPlainObject };
export type QuizSessionStore = BrowserStorageLike;

export function browserQuizStore(kind: 'localStorage' | 'sessionStorage'): QuizSessionStore | null {
  return kind === 'sessionStorage' ? getBrowserSessionStorage() : getBrowserLocalStorage();
}

// The record generation changes only on an explicit reset. Do not restore a
// session from before that reset, including when the reset happened in another tab.
export function readCurrentQuizRecordEpoch(store: QuizSessionStore | null): string | null {
  return readStoredResetEpoch(store);
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
      const saved = safeJsonParseBounded(raw, MAX_QUIZ_SESSION_BYTES);
      if (
        isPlainObject(saved) &&
        !hasBlockedKey(saved, 6) &&
        saved.version === version &&
        typeof saved.resetEpoch === 'string' &&
        saved.resetEpoch !== expectedEpoch
      ) {
        sessionStore.removeItem(key);
        removed = true;
      }
    }
    return removed;
  } catch {
    return false;
  }
}
