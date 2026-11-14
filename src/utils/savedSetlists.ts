import {
  SETLIST_TITLE_LIMIT,
  SetlistEntry,
  normalizeSetlistOrder,
  sanitizeSetlistEntries,
} from './setlist';
import { sanitizeSafeId, sanitizeUserText } from './userInput';

export const SAVED_SETLISTS_STORAGE_KEY = 'higedan_saved_setlists_v1';
export const DEFAULT_SAVED_SETLIST_TITLE = 'マイ・ドリームライブ';
export const MAX_SAVED_SETLISTS = 30;

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

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
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
  validSongIds: Set<string>,
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
    const updatedAt = sanitizeUserText(item.updatedAt, 40) || new Date().toISOString();

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
  validSongIds?: Set<string>,
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
  validSongIds: Set<string>,
): SavedSetlistsState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SAVED_SETLISTS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return sanitizeSavedSetlistsState(parsed, validSongIds);
  } catch {
    return null;
  }
}

export function loadSavedSetlists(
  validSongIds: Set<string>,
  fallbackTitle: string,
  fallbackEntries: readonly SetlistEntry[],
): SavedSetlistsState {
  return (
    readStoredSavedSetlists(validSongIds) ??
    createInitialSavedSetlistsState(fallbackTitle, fallbackEntries, validSongIds)
  );
}

export function persistSavedSetlists(state: SavedSetlistsState): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(SAVED_SETLISTS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore QuotaExceededError / strict browser storage errors gracefully.
  }
}

export function clearSavedSetlistsStorage(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(SAVED_SETLISTS_STORAGE_KEY);
  } catch {
    // Ignore storage removal errors in restricted environments.
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
