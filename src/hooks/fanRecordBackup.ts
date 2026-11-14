import { HIGEDAN_SONGS } from '../data/higedanData';
import {
  sanitizeSavedSetlistsState,
  type SavedSetlistsState,
} from '../utils/savedSetlists';
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
): string {
  const payload: {
    format: string;
    version: number;
    records: FanRecords & { hasQuizAttempt: boolean };
    savedSetlists?: SavedSetlistsState;
  } = {
    format: BACKUP_FORMAT,
    version: 1,
    records: { ...records, hasQuizAttempt: records.bestQuizScore !== null },
  };
  if (savedSetlists && savedSetlists.items.length > 0) {
    payload.savedSetlists = savedSetlists;
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

export function parseFanRecordBackupWithSetlists(raw: string): {
  records: FanRecords;
  savedSetlists?: SavedSetlistsState;
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
  return {
    records: {
      setlist: restored.setlist, setlistTitle: restored.setlistTitle,
      visitedSpotIds: restored.visitedSpotIds, attendedTourIds: restored.attendedTourIds,
      votedKeys: restored.votedKeys, reviews: normalized.reviews, likedReviewIds: restored.likedReviewIds,
      bestQuizScore: restored.bestQuizScore ?? null, resetEpoch: '', setlistMembershipVersions: {},
    },
    savedSetlists,
  };
}

export function parseFanRecordBackup(raw: string): FanRecords {
  return parseFanRecordBackupWithSetlists(raw).records;
}
