import { HIGEDAN_SONGS } from '../data/higedanData';

// 同じタブの再読み込みを越えて、保存待ちの追加操作だけを復元する。
const PREFIX = 'higedan_pending_setlist_add_v1:';
const validSongIds = new Set(HIGEDAN_SONGS.map(song => song.id));

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
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<PendingSetlistAdd>;
  return typeof item.songId === 'string' && validSongIds.has(item.songId) &&
    typeof item.isEncore === 'boolean' && typeof item.resetEpoch === 'string' &&
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
      const value: unknown = raw === null ? null : JSON.parse(raw);
      if (isPendingSetlistAdd(value)) entries.push({ key, add: value });
      else unreadable = true;
    } catch { unreadable = true; }
  }
  entries.sort((a, b) => a.add.order - b.add.order);
  return { entries, unreadable };
}

export function writePendingSetlistAdd(storage: JournalStorage, add: PendingSetlistAdd) {
  const key = PREFIX + crypto.randomUUID();
  storage.setItem(key, JSON.stringify(add));
  return key;
}
