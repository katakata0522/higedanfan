import {
  browserQuizStore,
  isPlainObject,
  readCurrentQuizRecordEpoch,
  type QuizSessionStore,
} from '../components/quiz/quizSessionClear';
import { sanitizeSafeId, sanitizeUserText } from './userInput';

export const MY_NOTE_PROFILE_STORAGE_KEY = 'higedanfan:my-note-profile:v1';
export const MY_NOTE_TITLE_MODE_STORAGE_KEY = 'higedanfan:my-note-title-mode:v1';
export const MY_NOTE_SETLIST_IMAGE_STORAGE_KEY = 'higedanfan:my-note-setlist-image:v1';
export const DEFAULT_MY_NOTE_NAME = 'ゲスト';
export const MY_NOTE_NAME_MAX_LENGTH = 20;

export type MyNoteTitleDisplayMode = 'rank' | 'playstyle';

const MAX_READ_SONGS = 120;
const ALLOWED_MOODS = new Set([
  'push_back',
  'heartbreak_night',
  'euphoric_drive',
  'deep_lyric',
]);

export interface MyNoteProfile {
  nickname: string;
  opened: boolean;
  readSongIds: string[];
  completedMoods: string[];
  moodCompletedCount: number;
  visitedVocalRange: boolean;
  visitedReferenceArchive: boolean;
  exportedBackup: boolean;
}

export function createDefaultMyNoteProfile(): MyNoteProfile {
  return {
    nickname: '',
    opened: false,
    readSongIds: [],
    completedMoods: [],
    moodCompletedCount: 0,
    visitedVocalRange: false,
    visitedReferenceArchive: false,
    exportedBackup: false,
  };
}

/**
 * Sanitizes a user-supplied notebook nickname and removes markup, control chars,
 * and bidirectional override characters.
 */
export function sanitizeMyNoteNickname(input: unknown): string {
  const clean = sanitizeUserText(input, MY_NOTE_NAME_MAX_LENGTH);
  return clean === DEFAULT_MY_NOTE_NAME ? '' : clean;
}

export function displayMyNoteNickname(profile: MyNoteProfile): string {
  return profile.nickname || DEFAULT_MY_NOTE_NAME;
}

export function hasCustomMyNoteNickname(profile: MyNoteProfile): boolean {
  return profile.nickname.length > 0 && profile.nickname !== DEFAULT_MY_NOTE_NAME;
}

function sanitizeReadSongIds(raw: unknown, validSongIds?: ReadonlySet<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of raw) {
    if (out.length >= MAX_READ_SONGS) break;
    const id = sanitizeSafeId(candidate, 48);
    if (!id || seen.has(id) || (validSongIds && !validSongIds.has(id))) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function sanitizeCompletedMoods(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of raw) {
    if (typeof candidate !== 'string' || !ALLOWED_MOODS.has(candidate) || seen.has(candidate)) {
      continue;
    }
    seen.add(candidate);
    out.push(candidate);
  }
  return out;
}

function clampMoodCount(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(9999, Math.floor(raw)));
}

export function sanitizeMyNoteProfilePayload(
  raw: unknown,
  validSongIds?: ReadonlySet<string>,
): MyNoteProfile {
  if (
    !isPlainObject(raw) ||
    (Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null)
  ) {
    return createDefaultMyNoteProfile();
  }
  const completedMoods = sanitizeCompletedMoods(raw.completedMoods);
  const count = clampMoodCount(raw.moodCompletedCount);
  return {
    nickname: sanitizeMyNoteNickname(raw.nickname),
    opened: raw.opened === true,
    readSongIds: sanitizeReadSongIds(raw.readSongIds, validSongIds),
    completedMoods,
    moodCompletedCount: Math.max(count, completedMoods.length),
    visitedVocalRange: raw.visitedVocalRange === true,
    visitedReferenceArchive: raw.visitedReferenceArchive === true,
    exportedBackup: raw.exportedBackup === true,
  };
}

export function isDefaultMyNoteProfile(profile: MyNoteProfile): boolean {
  return (
    profile.nickname === '' &&
    !profile.opened &&
    profile.readSongIds.length === 0 &&
    profile.completedMoods.length === 0 &&
    profile.moodCompletedCount === 0 &&
    !profile.visitedVocalRange &&
    !profile.visitedReferenceArchive &&
    !profile.exportedBackup
  );
}

export function loadMyNoteProfile(
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): MyNoteProfile {
  if (!store) return createDefaultMyNoteProfile();
  try {
    const raw = store.getItem(MY_NOTE_PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultMyNoteProfile();
    const parsed: unknown = JSON.parse(raw);
    if (
      !isPlainObject(parsed) ||
      (Object.getPrototypeOf(parsed) !== Object.prototype && Object.getPrototypeOf(parsed) !== null) ||
      typeof parsed.resetEpoch !== 'string'
    ) {
      return createDefaultMyNoteProfile();
    }
    const currentEpoch = readCurrentQuizRecordEpoch(store);
    if (currentEpoch !== null && currentEpoch !== parsed.resetEpoch) {
      return createDefaultMyNoteProfile();
    }
    if (currentEpoch === null && expectedEpoch !== parsed.resetEpoch) {
      return createDefaultMyNoteProfile();
    }
    return sanitizeMyNoteProfilePayload(parsed);
  } catch {
    return createDefaultMyNoteProfile();
  }
}

export function persistMyNoteProfile(
  profile: Partial<MyNoteProfile> & Pick<MyNoteProfile, 'nickname' | 'opened'>,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    const current = loadMyNoteProfile(expectedEpoch, store);
    const merged: MyNoteProfile = {
      nickname: sanitizeMyNoteNickname(profile.nickname),
      opened: Boolean(profile.opened),
      readSongIds: sanitizeReadSongIds(profile.readSongIds ?? current.readSongIds),
      completedMoods: sanitizeCompletedMoods(profile.completedMoods ?? current.completedMoods),
      moodCompletedCount: clampMoodCount(profile.moodCompletedCount ?? current.moodCompletedCount),
      visitedVocalRange: profile.visitedVocalRange ?? current.visitedVocalRange,
      visitedReferenceArchive: profile.visitedReferenceArchive ?? current.visitedReferenceArchive,
      exportedBackup: profile.exportedBackup ?? current.exportedBackup,
    };
    store.setItem(
      MY_NOTE_PROFILE_STORAGE_KEY,
      JSON.stringify({
        resetEpoch: expectedEpoch,
        nickname: merged.nickname,
        opened: merged.opened,
        readSongIds: merged.readSongIds,
        completedMoods: merged.completedMoods,
        moodCompletedCount: Math.max(merged.moodCompletedCount, merged.completedMoods.length),
        visitedVocalRange: merged.visitedVocalRange,
        visitedReferenceArchive: merged.visitedReferenceArchive,
        exportedBackup: merged.exportedBackup,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function recordMyNoteSongRead(
  songId: string,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): MyNoteProfile {
  const effectiveEpoch = expectedEpoch || readCurrentQuizRecordEpoch(store) || '';
  const cleanId = sanitizeSafeId(songId, 48);
  const current = loadMyNoteProfile(effectiveEpoch, store);
  if (!cleanId || current.readSongIds.includes(cleanId) || current.readSongIds.length >= MAX_READ_SONGS) {
    return current;
  }
  const next: MyNoteProfile = {
    ...current,
    readSongIds: [...current.readSongIds, cleanId],
  };
  persistMyNoteProfile(next, effectiveEpoch, store);
  return next;
}

export function recordMyNoteMoodCompleted(
  mood: string,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): MyNoteProfile {
  const effectiveEpoch = expectedEpoch || readCurrentQuizRecordEpoch(store) || '';
  const current = loadMyNoteProfile(effectiveEpoch, store);
  const nextMoods =
    typeof mood === 'string' && ALLOWED_MOODS.has(mood) && !current.completedMoods.includes(mood)
      ? [...current.completedMoods, mood]
      : current.completedMoods;
  const next: MyNoteProfile = {
    ...current,
    completedMoods: nextMoods,
    moodCompletedCount: Math.min(9999, current.moodCompletedCount + 1),
  };
  persistMyNoteProfile(next, effectiveEpoch, store);
  return next;
}

export function recordMyNoteFeatureVisited(
  feature: 'vocal_range' | 'quiz_archive' | 'backup_export',
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): MyNoteProfile {
  const effectiveEpoch = expectedEpoch || readCurrentQuizRecordEpoch(store) || '';
  const current = loadMyNoteProfile(effectiveEpoch, store);
  if (
    (feature === 'vocal_range' && current.visitedVocalRange) ||
    (feature === 'quiz_archive' && current.visitedReferenceArchive) ||
    (feature === 'backup_export' && current.exportedBackup)
  ) {
    return current;
  }
  const next: MyNoteProfile = {
    ...current,
    visitedVocalRange: current.visitedVocalRange || feature === 'vocal_range',
    visitedReferenceArchive: current.visitedReferenceArchive || feature === 'quiz_archive',
    exportedBackup: current.exportedBackup || feature === 'backup_export',
  };
  persistMyNoteProfile(next, effectiveEpoch, store);
  return next;
}

export function loadMyNoteTitleMode(
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): MyNoteTitleDisplayMode {
  if (!store) return 'rank';
  try {
    const raw = store.getItem(MY_NOTE_TITLE_MODE_STORAGE_KEY);
    if (!raw) return 'rank';
    const parsed: unknown = JSON.parse(raw);
    if (
      !isPlainObject(parsed) ||
      (Object.getPrototypeOf(parsed) !== Object.prototype && Object.getPrototypeOf(parsed) !== null) ||
      typeof parsed.resetEpoch !== 'string'
    ) {
      return 'rank';
    }
    const currentEpoch = readCurrentQuizRecordEpoch(store);
    if (currentEpoch !== null && currentEpoch !== parsed.resetEpoch) return 'rank';
    if (currentEpoch === null && expectedEpoch !== parsed.resetEpoch) return 'rank';
    return parsed.mode === 'playstyle' ? 'playstyle' : 'rank';
  } catch {
    return 'rank';
  }
}

export function persistMyNoteTitleMode(
  mode: MyNoteTitleDisplayMode,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    const safeMode: MyNoteTitleDisplayMode = mode === 'playstyle' ? 'playstyle' : 'rank';
    store.setItem(
      MY_NOTE_TITLE_MODE_STORAGE_KEY,
      JSON.stringify({
        resetEpoch: expectedEpoch,
        mode: safeMode,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadSetlistShareImageGenerated(
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    const raw = store.getItem(MY_NOTE_SETLIST_IMAGE_STORAGE_KEY);
    if (!raw) return false;
    const parsed: unknown = JSON.parse(raw);
    if (
      !isPlainObject(parsed) ||
      (Object.getPrototypeOf(parsed) !== Object.prototype && Object.getPrototypeOf(parsed) !== null) ||
      typeof parsed.resetEpoch !== 'string'
    ) {
      return false;
    }
    const currentEpoch = readCurrentQuizRecordEpoch(store);
    if (currentEpoch !== null && currentEpoch !== parsed.resetEpoch) return false;
    if (currentEpoch === null && expectedEpoch !== parsed.resetEpoch) return false;
    return parsed.generated === true;
  } catch {
    return false;
  }
}

export function recordSetlistShareImageGenerated(
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    const effectiveEpoch = expectedEpoch || readCurrentQuizRecordEpoch(store) || '';
    store.setItem(
      MY_NOTE_SETLIST_IMAGE_STORAGE_KEY,
      JSON.stringify({
        resetEpoch: effectiveEpoch,
        generated: true,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearSetlistShareImageGeneratedStorage(
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    store.removeItem(MY_NOTE_SETLIST_IMAGE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearMyNoteProfileStorage(
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  try {
    store.removeItem(MY_NOTE_PROFILE_STORAGE_KEY);
    store.removeItem(MY_NOTE_TITLE_MODE_STORAGE_KEY);
    store.removeItem(MY_NOTE_SETLIST_IMAGE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function clearStaleMyNoteProfile(
  expectedEpoch: string,
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store || !expectedEpoch || readCurrentQuizRecordEpoch(store) !== expectedEpoch) return false;
  try {
    let cleared = false;
    for (const key of [
      MY_NOTE_PROFILE_STORAGE_KEY,
      MY_NOTE_TITLE_MODE_STORAGE_KEY,
      MY_NOTE_SETLIST_IMAGE_STORAGE_KEY,
    ]) {
      const raw = store.getItem(key);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isPlainObject(parsed) && typeof parsed.resetEpoch === 'string' && parsed.resetEpoch !== expectedEpoch) {
        store.removeItem(key);
        cleared = true;
      }
    }
    return cleared;
  } catch {
    return false;
  }
}
