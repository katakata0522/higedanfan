import { VERIFIED_SONG_IDS } from '../data/fullCatalogSongs';
import { safeJsonParseBounded, safeRandomUuid } from '../utils/browserStorage';

// 同じタブの再読み込みを越えて、保存待ちの追加操作だけを復元する。
const PREFIX = 'higedan_pending_setlist_add_v1:';
const MAX_JOURNAL_ENTRY_BYTES = 10_000;

export interface PendingSetlistAdd {
  songId: string;
  isEncore: boolean;
  resetEpoch: string;
  membershipVersion: number;
  hadSavedRecord: boolean;
  order: number;
}

export type JournalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

function isPendingSetlistAdd(value: unknown): value is PendingSetlistAdd {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Partial<PendingSetlistAdd>;
  return typeof item.songId === 'string' && VERIFIED_SONG_IDS.has(item.songId) &&
    typeof item.isEncore === 'boolean' && typeof item.resetEpoch === 'string' && item.resetEpoch.length <= 120 &&
    typeof item.membershipVersion === 'number' && Number.isSafeInteger(item.membershipVersion) && item.membershipVersion >= 0 &&
    typeof item.hadSavedRecord === 'boolean' && typeof item.order === 'number' &&
    Number.isSafeInteger(item.order) && item.order >= 0;
}

export function readPendingSetlistAdds(storage: JournalStorage) {
  const entries: { key: string; add: PendingSetlistAdd }[] = [];
  let unreadable = false;
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const raw = storage.getItem(key);
      const value = safeJsonParseBounded(raw, MAX_JOURNAL_ENTRY_BYTES);
      if (isPendingSetlistAdd(value)) entries.push({ key, add: value });
      else unreadable = true;
    } catch { unreadable = true; }
  }
  entries.sort((a, b) => a.add.order - b.add.order);
  return { entries, unreadable };
}

export function writePendingSetlistAdd(storage: JournalStorage, add: PendingSetlistAdd) {
  const key = PREFIX + safeRandomUuid();
  storage.setItem(key, JSON.stringify(add));
  return key;
}
