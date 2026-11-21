import {
  getBrowserSessionStorage,
  hasBlockedKey,
  isPlainObject,
  safeJsonParseBounded,
  type BrowserStorageLike,
} from './browserStorage';
import { sanitizeSafeId } from './userInput';

export const QUICK_ADD_SETLIST_SESSION_KEY = 'higedan_quick_add_setlist_v1';

const MAX_QUICK_ADD_BYTES = 2_000;

export function readQuickAddSetlistId(
  expectedEpoch = '',
  storage?: BrowserStorageLike | null,
): string | null {
  try {
    const store = storage === undefined ? getBrowserSessionStorage() : storage;
    if (!store) return null;
    const raw = store.getItem(QUICK_ADD_SETLIST_SESSION_KEY);
    const parsed = safeJsonParseBounded(raw, MAX_QUICK_ADD_BYTES);
    if (!isPlainObject(parsed) || hasBlockedKey(parsed, 4)) return null;
    const id = sanitizeSafeId(parsed.id, 48);
    if (!id) return null;
    const storedEpoch = parsed.resetEpoch === undefined ? '' : parsed.resetEpoch;
    if (typeof storedEpoch !== 'string' || storedEpoch !== expectedEpoch) return null;
    return id;
  } catch {
    return null;
  }
}

export function writeQuickAddSetlistId(
  id: string | null,
  resetEpoch = '',
  storage?: BrowserStorageLike | null,
): void {
  try {
    const store = storage === undefined ? getBrowserSessionStorage() : storage;
    if (!store) return;
    const cleanId = id ? sanitizeSafeId(id, 48) : '';
    if (!cleanId) {
      store.removeItem(QUICK_ADD_SETLIST_SESSION_KEY);
      return;
    }
    store.setItem(
      QUICK_ADD_SETLIST_SESSION_KEY,
      JSON.stringify({ id: cleanId, resetEpoch: typeof resetEpoch === 'string' ? resetEpoch : '' }),
    );
  } catch {
    // ignore storage errors
  }
}
