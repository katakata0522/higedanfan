import { readStoredResetEpoch } from '../hooks/fanRecordStorage';
import {
  getBrowserLocalStorage,
  hasBlockedKey,
  safeJsonParseBounded,
  type BrowserStorageLike,
} from './browserStorage';
import {
  QUICK_ADD_SETLIST_SESSION_KEY,
  readQuickAddSetlistId,
  writeQuickAddSetlistId,
} from './quickAddSession';
import {
  SETLIST_TITLE_LIMIT,
  SetlistEntry,
  normalizeSetlistOrder,
  sanitizeSetlistEntries,
} from './setlist';
import { sanitizeSafeId, sanitizeUserText } from './userInput';

export { QUICK_ADD_SETLIST_SESSION_KEY, readQuickAddSetlistId, writeQuickAddSetlistId };

export const SAVED_SETLISTS_STORAGE_KEY = 'higedan_saved_setlists_v1';
export const DEFAULT_SAVED_SETLIST_TITLE = 'マイ・ドリームライブ';
export const MAX_SAVED_SETLISTS = 30;
const MAX_SAVED_SETLISTS_BYTES = 200_000;
const ISO_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export type SavedSetlistsStoreLike = BrowserStorageLike;

export interface SavedSetlistsAccessOptions {
  expectedEpoch?: string;
  validSongIds?: ReadonlySet<string>;
  deletedIds?: ReadonlySet<string>;
  replace?: boolean;
  storage?: SavedSetlistsStoreLike | null;
  recordStorage?: SavedSetlistsStoreLike | null;
}

export interface SavedSetlistItem {
  id: string;
  title: string;
  entries: SetlistEntry[];
  updatedAt: string;
}

export interface SavedSetlistsState {
  activeId: string;
  items: SavedSetlistItem[];
}

const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function getStorage(): SavedSetlistsStoreLike | null {
  return getBrowserLocalStorage();
}

function readCurrentResetEpoch(recordStorage: SavedSetlistsStoreLike | null): string {
  return readStoredResetEpoch(recordStorage) ?? '';
}

function isMatchingEpochPayload(raw: unknown, currentEpoch: string): boolean {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const storedEpoch = (raw as Record<string, unknown>).resetEpoch;
  if (typeof storedEpoch === 'string') return storedEpoch === currentEpoch;
  return currentEpoch === '';
}

function createCleanRecord<T extends object>(obj: T): T {
  return Object.assign(Object.create(null) as T, obj);
}

function normalizeTitle(rawTitle: unknown, fallback = DEFAULT_SAVED_SETLIST_TITLE): string {
  const cleaned = sanitizeUserText(rawTitle, SETLIST_TITLE_LIMIT);
  return cleaned || fallback;
}

function formatEntriesSignature(title: string, entries: readonly SetlistEntry[]): string {
  return `${title}\n${entries.map((e) => `${e.songId}:${e.isEncore ? 1 : 0}`).join(',')}`;
}

export function sanitizeSavedSetlistsState(
  raw: unknown,
  validSongIds: ReadonlySet<string>,
): SavedSetlistsState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.items)) return null;

  const seenIds = new Set<string>();
  const items: SavedSetlistItem[] = [];

  for (const candidate of record.items) {
    if (items.length >= MAX_SAVED_SETLISTS) break;
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) continue;
    const item = candidate as Record<string, unknown>;
    const cleanId = sanitizeSafeId(item.id, 48);
    if (!cleanId || BLOCKED_KEYS.has(cleanId) || seenIds.has(cleanId)) continue;
    seenIds.add(cleanId);

    const title = normalizeTitle(item.title);
    const cleanedEntries = sanitizeSetlistEntries(item.entries, validSongIds) ?? [];
    const rawUpdatedAt = typeof item.updatedAt === 'string' ? item.updatedAt.trim() : '';
    const updatedAt =
      ISO_TIMESTAMP_RE.test(rawUpdatedAt) && !Number.isNaN(Date.parse(rawUpdatedAt))
        ? rawUpdatedAt
        : new Date().toISOString();

    items.push(
      createCleanRecord({
        id: cleanId,
        title,
        entries: normalizeSetlistOrder(cleanedEntries),
        updatedAt,
      }),
    );
  }

  if (items.length === 0) return null;

  const rawActiveId = sanitizeSafeId(record.activeId, 48);
  const activeId = !BLOCKED_KEYS.has(rawActiveId) && items.some((item) => item.id === rawActiveId)
    ? rawActiveId
    : items[0].id;

  return { activeId, items };
}

export function createInitialSavedSetlistsState(
  activeTitle: string,
  activeEntries: readonly SetlistEntry[],
  validSongIds?: ReadonlySet<string>,
  now = new Date().toISOString(),
): SavedSetlistsState {
  const cleanTitle = normalizeTitle(activeTitle);
  const fallback = normalizeSetlistOrder([...activeEntries]);
  const cleanEntries = validSongIds
    ? (sanitizeSetlistEntries([...activeEntries], validSongIds) ?? fallback)
    : fallback;
  return {
    activeId: 'setlist-1',
    items: [
      createCleanRecord({
        id: 'setlist-1',
        title: cleanTitle,
        entries: cleanEntries,
        updatedAt: now,
      }),
    ],
  };
}

export function readStoredSavedSetlists(
  validSongIds: ReadonlySet<string>,
  options: SavedSetlistsAccessOptions = {},
): SavedSetlistsState | null {
  const storage = options.storage === undefined ? getStorage() : options.storage;
  if (!storage) return null;
  const recordStorage = options.recordStorage === undefined ? storage : options.recordStorage;
  const currentEpoch = readCurrentResetEpoch(recordStorage);
  if (options.expectedEpoch !== undefined && options.expectedEpoch !== currentEpoch) {
    return null;
  }
  try {
    const raw = storage.getItem(SAVED_SETLISTS_STORAGE_KEY);
    const parsed = safeJsonParseBounded(raw, MAX_SAVED_SETLISTS_BYTES);
    if (!parsed || hasBlockedKey(parsed, 8)) return null;
    if (!isMatchingEpochPayload(parsed, currentEpoch)) return null;
    return sanitizeSavedSetlistsState(parsed, validSongIds);
  } catch {
    return null;
  }
}

export function loadSavedSetlists(
  validSongIds: ReadonlySet<string>,
  fallbackTitle: string,
  fallbackEntries: readonly SetlistEntry[],
  options: SavedSetlistsAccessOptions = {},
): SavedSetlistsState {
  return (
    readStoredSavedSetlists(validSongIds, options) ??
    createInitialSavedSetlistsState(fallbackTitle, fallbackEntries, validSongIds)
  );
}

/** Merge non-active/foreign setlists from existing storage so concurrent tabs cannot erase each other's lists. */
export function mergeSavedSetlistsForPersist(
  nextState: SavedSetlistsState,
  existingState: SavedSetlistsState,
  deletedIds?: ReadonlySet<string>,
): SavedSetlistsState {
  const existingById = new Map(existingState.items.map((item) => [item.id, item]));
  const seenIds = new Set<string>();
  const items: SavedSetlistItem[] = [];

  for (const item of nextState.items) {
    seenIds.add(item.id);
    const storedItem = existingById.get(item.id);
    if (item.id !== nextState.activeId && storedItem && storedItem.updatedAt > item.updatedAt) {
      items.push(storedItem);
    } else {
      items.push(item);
    }
  }

  for (const storedItem of existingState.items) {
    if (items.length >= MAX_SAVED_SETLISTS) break;
    if (seenIds.has(storedItem.id) || deletedIds?.has(storedItem.id)) continue;
    seenIds.add(storedItem.id);
    items.push(storedItem);
  }

  return {
    activeId: items.some((item) => item.id === nextState.activeId) ? nextState.activeId : items[0].id,
    items: items.slice(0, MAX_SAVED_SETLISTS),
  };
}

export function persistSavedSetlists(
  state: SavedSetlistsState,
  options: SavedSetlistsAccessOptions = {},
): boolean {
  const storage = options.storage === undefined ? getStorage() : options.storage;
  if (!storage) return false;
  const recordStorage = options.recordStorage === undefined ? storage : options.recordStorage;
  const currentEpoch = readCurrentResetEpoch(recordStorage);
  if (options.expectedEpoch !== undefined && options.expectedEpoch !== currentEpoch) {
    return false;
  }
  try {
    let toPersist = state;
    if (!options.replace && options.validSongIds) {
      const existing = readStoredSavedSetlists(options.validSongIds, {
        expectedEpoch: options.expectedEpoch,
        storage,
        recordStorage,
      });
      if (existing) {
        toPersist = mergeSavedSetlistsForPersist(state, existing, options.deletedIds);
      }
    }
    storage.setItem(
      SAVED_SETLISTS_STORAGE_KEY,
      JSON.stringify({ activeId: toPersist.activeId, items: toPersist.items, resetEpoch: currentEpoch }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearSavedSetlistsStorage(
  storage: SavedSetlistsStoreLike | null = getStorage(),
): void {
  if (!storage) return;
  try {
    storage.removeItem(SAVED_SETLISTS_STORAGE_KEY);
  } catch {
    // Ignore storage removal errors in restricted environments.
  }
}

export function clearStaleSavedSetlists(
  expectedEpoch: string,
  storage: SavedSetlistsStoreLike | null = getStorage(),
  recordStorage: SavedSetlistsStoreLike | null = storage,
): boolean {
  if (!expectedEpoch || !storage) return false;
  if (readCurrentResetEpoch(recordStorage) !== expectedEpoch) return false;
  try {
    const raw = storage.getItem(SAVED_SETLISTS_STORAGE_KEY);
    if (!raw) return false;
    const parsed = safeJsonParseBounded(raw, MAX_SAVED_SETLISTS_BYTES);
    if (!parsed || hasBlockedKey(parsed, 8) || !isMatchingEpochPayload(parsed, expectedEpoch)) {
      storage.removeItem(SAVED_SETLISTS_STORAGE_KEY);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function syncActiveSavedSetlist(
  state: SavedSetlistsState,
  activeTitle: string,
  activeEntries: readonly SetlistEntry[],
  now = new Date().toISOString(),
): SavedSetlistsState {
  const cleanTitle = normalizeTitle(activeTitle);
  const normalizedEntries = normalizeSetlistOrder([...activeEntries]);
  const nextSig = formatEntriesSignature(cleanTitle, normalizedEntries);

  const index = state.items.findIndex((item) => item.id === state.activeId);
  if (index < 0) {
    const newItem: SavedSetlistItem = createCleanRecord({
      id: 'setlist-1',
      title: cleanTitle,
      entries: normalizedEntries,
      updatedAt: now,
    });
    return {
      activeId: newItem.id,
      items: [newItem, ...state.items].slice(0, MAX_SAVED_SETLISTS),
    };
  }

  const current = state.items[index];
  if (formatEntriesSignature(current.title, current.entries) === nextSig) {
    return state;
  }

  const updatedItems = state.items.map((item, i) =>
    i === index
      ? createCleanRecord({
          ...item,
          title: cleanTitle,
          entries: normalizedEntries,
          updatedAt: now,
        })
      : item,
  );
  return { ...state, items: updatedItems };
}

function generateNextSetlistId(existingIds: ReadonlySet<string>): string {
  let seq = existingIds.size + 1;
  while (existingIds.has(`setlist-${seq}`)) {
    seq += 1;
  }
  return `setlist-${seq}`;
}

export function createNewSavedSetlist(
  state: SavedSetlistsState,
  title: string,
  entries: readonly SetlistEntry[],
  now = new Date().toISOString(),
): { state: SavedSetlistsState; created: SavedSetlistItem } {
  const existingIds = new Set(state.items.map((item) => item.id));
  const id = generateNextSetlistId(existingIds);
  const created: SavedSetlistItem = createCleanRecord({
    id,
    title: normalizeTitle(title, '新しいセットリスト'),
    entries: normalizeSetlistOrder([...entries]),
    updatedAt: now,
  });
  return {
    created,
    state: {
      activeId: created.id,
      items: [created, ...state.items].slice(0, MAX_SAVED_SETLISTS),
    },
  };
}

export function switchSavedSetlist(
  state: SavedSetlistsState,
  targetId: string,
): { state: SavedSetlistsState; target: SavedSetlistItem | null } {
  const target = state.items.find((item) => item.id === targetId) ?? null;
  if (!target) return { state, target: null };
  return {
    target,
    state: state.activeId === target.id ? state : { ...state, activeId: target.id },
  };
}

export function deleteSavedSetlist(
  state: SavedSetlistsState,
  targetId: string,
): { state: SavedSetlistsState; nextActive: SavedSetlistItem | null; deleted: boolean } {
  if (state.items.length <= 1) {
    return { state, nextActive: null, deleted: false };
  }
  const filtered = state.items.filter((item) => item.id !== targetId);
  if (filtered.length === state.items.length) {
    return { state, nextActive: null, deleted: false };
  }
  const nextActiveId = filtered.some((item) => item.id === state.activeId)
    ? state.activeId
    : filtered[0].id;
  const nextActive = filtered.find((item) => item.id === nextActiveId) ?? filtered[0];
  return {
    deleted: true,
    nextActive: state.activeId === targetId ? nextActive : null,
    state: {
      activeId: nextActiveId,
      items: filtered,
    },
  };
}

export interface AppendOrCreateSavedSetlistOptions {
  validSongIds: ReadonlySet<string>;
  currentTitle: string;
  currentEntries: readonly SetlistEntry[];
  nextTitle?: string;
  nextEntries: readonly SetlistEntry[];
  expectedEpoch?: string;
  storage?: SavedSetlistsStoreLike | null;
  recordStorage?: SavedSetlistsStoreLike | null;
  now?: string;
}

/**
 * Syncs the current active setlist, appends a newly created saved setlist,
 * and persists the updated state to browser storage.
 */
export function appendOrCreateSavedSetlist({
  validSongIds,
  currentTitle,
  currentEntries,
  nextTitle,
  nextEntries,
  expectedEpoch,
  storage,
  recordStorage,
  now,
}: AppendOrCreateSavedSetlistOptions): { state: SavedSetlistsState; created: SavedSetlistItem } {
  const safeCurrentTitle = sanitizeUserText(currentTitle, SETLIST_TITLE_LIMIT) || DEFAULT_SAVED_SETLIST_TITLE;
  const loaded = loadSavedSetlists(validSongIds, safeCurrentTitle, currentEntries, {
    expectedEpoch,
    storage,
    recordStorage,
  });
  const synced = syncActiveSavedSetlist(loaded, safeCurrentTitle, currentEntries, now);
  const resolvedTitle = nextTitle
    ? (sanitizeUserText(nextTitle, SETLIST_TITLE_LIMIT) || 'MYセトリ')
    : `MYセトリ ${synced.items.length + 1}`;
  const { state, created } = createNewSavedSetlist(synced, resolvedTitle, nextEntries, now);
  persistSavedSetlists(state, {
    expectedEpoch,
    validSongIds,
    storage,
    recordStorage,
  });
  return { state, created };
}
