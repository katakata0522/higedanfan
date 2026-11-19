import { verifiedSongs as HIGEDAN_SONGS } from '../data/fullCatalogSongs';
import {
  sanitizeQuizVolumeRecordMap,
  type QuizVolumeRecordMap,
} from '../components/quiz/quizVolumeRecords';
import {
  sanitizeSavedSetlistsState,
  type SavedSetlistsState,
} from '../utils/savedSetlists';
import {
  isDefaultMyNoteProfile,
  sanitizeMyNoteProfilePayload,
  type MyNoteProfile,
} from '../utils/myNoteProfile';
import { restoreFanRecords } from './fanRecordStorage';
import type { FanRecords } from './fanRecordStore';

const BACKUP_FORMAT = 'higedan-fan-notebook';
const MAX_BACKUP_BYTES = 2_000_000;
const validSongIds = new Set(HIGEDAN_SONGS.map((song) => song.id));
function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable);
  if (value && typeof value === 'object') return Object.fromEntries(
    Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, comparable(item)]),
  );
  return value;
}

export function createFanRecordBackup(
  records: FanRecords,
  savedSetlists?: SavedSetlistsState | null,
  quizVolumeScores?: QuizVolumeRecordMap | null,
  myNoteProfile?: MyNoteProfile | null,
): string {
  const payload: {
    format: string;
    version: number;
    records: FanRecords & { hasQuizAttempt: boolean };
    savedSetlists?: SavedSetlistsState;
    quizVolumeScores?: QuizVolumeRecordMap;
    myNoteProfile?: MyNoteProfile;
  } = {
    format: BACKUP_FORMAT,
    version: 1,
    records: { ...records, hasQuizAttempt: records.bestQuizScore !== null },
  };
  if (savedSetlists && savedSetlists.items.length > 0) {
    payload.savedSetlists = savedSetlists;
  }
  const cleanVolumes = quizVolumeScores ? sanitizeQuizVolumeRecordMap(quizVolumeScores) : null;
  if (cleanVolumes && Object.keys(cleanVolumes).length > 0) {
    payload.quizVolumeScores = cleanVolumes;
  }
  const cleanMyNote = myNoteProfile ? sanitizeMyNoteProfilePayload(myNoteProfile, validSongIds) : null;
  if (cleanMyNote && !isDefaultMyNoteProfile(cleanMyNote)) {
    payload.myNoteProfile = cleanMyNote;
  }
  return JSON.stringify(payload, null, 2);
}

function validateSavedSetlistsBackup(raw: unknown): SavedSetlistsState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('保存したセットリスト一覧を読み取れませんでした。');
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.activeId !== 'string' || !Array.isArray(obj.items)) {
    throw new TypeError('保存したセットリスト一覧の形式が正しくありません。');
  }
  const sanitized = sanitizeSavedSetlistsState(raw, validSongIds);
  if (!sanitized || sanitized.items.length !== obj.items.length || sanitized.activeId !== obj.activeId) {
    throw new TypeError('保存したセットリスト一覧を安全に読み込めませんでした。');
  }
  for (let i = 0; i < obj.items.length; i += 1) {
    const rawItem = obj.items[i] as Record<string, unknown> | null;
    const cleanItem = sanitized.items[i];
    if (
      !rawItem ||
      rawItem.id !== cleanItem.id ||
      rawItem.title !== cleanItem.title ||
      !Array.isArray(rawItem.entries) ||
      JSON.stringify(comparable(cleanItem.entries)) !== JSON.stringify(comparable(rawItem.entries))
    ) {
      throw new TypeError('保存したセットリスト一覧の曲情報を安全に読み込めませんでした。');
    }
  }
  return sanitized;
}

function validateQuizVolumeScoresBackup(raw: unknown): QuizVolumeRecordMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new TypeError('検定のセット別記録を読み取れませんでした。');
  }
  const clean = sanitizeQuizVolumeRecordMap(raw);
  if (
    Object.keys(raw as object).length !== Object.keys(clean).length ||
    JSON.stringify(comparable(clean)) !== JSON.stringify(comparable(raw))
  ) {
    throw new TypeError('検定のセット別記録を安全に読み込めませんでした。');
  }
  return clean;
}

const ALLOWED_MY_NOTE_KEYS = new Set([
  'nickname',
  'opened',
  'readSongIds',
  'completedMoods',
  'moodCompletedCount',
  'visitedVocalRange',
  'visitedReferenceArchive',
  'exportedBackup',
]);

function validateMyNoteProfileBackup(raw: unknown): MyNoteProfile {
  if (
    !raw ||
    typeof raw !== 'object' ||
    Array.isArray(raw) ||
    (Object.getPrototypeOf(raw) !== Object.prototype && Object.getPrototypeOf(raw) !== null)
  ) {
    throw new TypeError('マイノートの記録を読み取れませんでした。');
  }
  const obj = raw as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (
    keys.length !== ALLOWED_MY_NOTE_KEYS.size ||
    keys.some((key) => !ALLOWED_MY_NOTE_KEYS.has(key)) ||
    typeof obj.nickname !== 'string' ||
    typeof obj.opened !== 'boolean' ||
    !Array.isArray(obj.readSongIds) ||
    !obj.readSongIds.every((id) => typeof id === 'string' && validSongIds.has(id)) ||
    !Array.isArray(obj.completedMoods) ||
    !obj.completedMoods.every((m) => typeof m === 'string') ||
    typeof obj.moodCompletedCount !== 'number' ||
    !Number.isInteger(obj.moodCompletedCount) ||
    typeof obj.visitedVocalRange !== 'boolean' ||
    typeof obj.visitedReferenceArchive !== 'boolean' ||
    typeof obj.exportedBackup !== 'boolean'
  ) {
    throw new TypeError('マイノートの記録を安全に読み込めませんでした。');
  }
  const clean = sanitizeMyNoteProfilePayload(raw, validSongIds);
  if (JSON.stringify(comparable(clean)) !== JSON.stringify(comparable(raw))) {
    throw new TypeError('マイノートの記録を安全に読み込めませんでした。');
  }
  return clean;
}

export function parseFanRecordBackupWithSetlists(raw: string): {
  records: FanRecords;
  savedSetlists?: SavedSetlistsState;
  quizVolumeScores?: QuizVolumeRecordMap;
  myNoteProfile?: MyNoteProfile;
} {
  if (raw.length > MAX_BACKUP_BYTES) throw new TypeError('記録ファイルが大きすぎます。');
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('記録ファイルの形式を確認してください。');
  const outer = value as Record<string, unknown>;
  if ('format' in outer && (outer.format !== BACKUP_FORMAT || outer.version !== 1)) throw new TypeError('この記録ファイルの形式には対応していません。');
  const data = ('format' in outer ? outer.records : outer) as Record<string, unknown> | null;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new TypeError('記録の内容を読み取れませんでした。');
  const arrays = ['setlist', 'visitedSpotIds', 'attendedTourIds', 'votedKeys', 'reviews', 'likedReviewIds'] as const;
  if (arrays.some(key => !Array.isArray(data[key])) || typeof data.setlistTitle !== 'string' ||
      !(data.bestQuizScore === null || (typeof data.bestQuizScore === 'number' && Number.isInteger(data.bestQuizScore) && data.bestQuizScore >= 0 && data.bestQuizScore <= 100))) {
    throw new TypeError('必要な記録がそろっていません。');
  }
  const restored = restoreFanRecords(JSON.stringify({ ...data, hasQuizAttempt: data.bestQuizScore !== null }));
  const normalized = { ...restored, reviews: restored.reviews ?? [] };
  if (!restored.setlist || !restored.visitedSpotIds || !restored.attendedTourIds || !restored.votedKeys || !restored.likedReviewIds ||
      restored.setlistTitle !== data.setlistTitle ||
      arrays.some(key => JSON.stringify(comparable(normalized[key])) !== JSON.stringify(comparable(data[key])))) {
    throw new TypeError('曲や公演などの記録を安全に読み込めませんでした。');
  }
  const savedSetlists =
    'format' in outer && outer.savedSetlists !== undefined
      ? validateSavedSetlistsBackup(outer.savedSetlists)
      : undefined;
  const quizVolumeScores =
    'format' in outer && outer.quizVolumeScores !== undefined
      ? validateQuizVolumeScoresBackup(outer.quizVolumeScores)
      : undefined;
  const myNoteProfile =
    'format' in outer && outer.myNoteProfile !== undefined
      ? validateMyNoteProfileBackup(outer.myNoteProfile)
      : undefined;
  return {
    records: {
      setlist: restored.setlist, setlistTitle: restored.setlistTitle,
      visitedSpotIds: restored.visitedSpotIds, attendedTourIds: restored.attendedTourIds,
      votedKeys: restored.votedKeys, reviews: normalized.reviews, likedReviewIds: restored.likedReviewIds,
      bestQuizScore: restored.bestQuizScore ?? null, resetEpoch: '', setlistMembershipVersions: {},
    },
    savedSetlists,
    quizVolumeScores,
    myNoteProfile,
  };
}

export function parseFanRecordBackup(raw: string): FanRecords {
  return parseFanRecordBackupWithSetlists(raw).records;
}
