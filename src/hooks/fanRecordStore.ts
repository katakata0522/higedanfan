import { HIGEDAN_SONGS, type FanReview } from '../data/higedanData';
import { normalizeSetlistOrder, type SetlistEntry } from '../utils/setlist';
import { restoreFanRecords, STORAGE_KEY, type PersistedState } from './fanRecordStorage';
import { readPendingSetlistAdds, writePendingSetlistAdd, type JournalStorage, type PendingSetlistAdd } from './setlistAddJournal';

export const DEFAULT_SETLIST_TITLE = '私が聴きたい！夢のスタジアムライブ';
const READ_ERROR = '保存データを読めませんでした。元の記録は上書きしません。';
const WRITE_ERROR = 'この端末に保存できません。画面を閉じる前に記録を書き出してください。';
const CONFLICT = '別のタブで記録が変わりました。最新の内容を確認してください。';
const JOURNAL_ERROR = '曲の追加を一時保存できませんでした。端末の保存設定を確認して、もう一度お試しください。';
const JOURNAL_READ_ERROR = '保存待ちの曲の情報を一部読めませんでした。元の記録は消去しません。';
const JOURNAL_CANCEL_ERROR = '曲の削除を一時保存に反映できませんでした。画面を閉じる前に記録を書き出してください。';
const songIds = new Set(HIGEDAN_SONGS.map(song => song.id));

export interface FanRecords {
  setlist: SetlistEntry[];
  setlistTitle: string;
  visitedSpotIds: string[];
  attendedTourIds: string[];
  votedKeys: string[];
  reviews: FanReview[];
  likedReviewIds: string[];
  bestQuizScore: number | null;
  resetEpoch: string;
  setlistMembershipVersions: Record<string, number>;
}

export function initialRecords(resetEpoch = ''): FanRecords {
  const ids = ['same-blue', 'mixed-nuts', '115man-kilo', 'subtitle', 'sharon', 'soulsoup', 'pretender', 'stand-by-you'];
  return {
    setlist: ids.map((songId, i) => ({ songId, isEncore: i >= 6 })),
    setlistTitle: DEFAULT_SETLIST_TITLE,
    visitedSpotIds: [], attendedTourIds: [], votedKeys: [], reviews: [], likedReviewIds: [],
    bestQuizScore: null, resetEpoch, setlistMembershipVersions: {},
  };
}

export function songsWithVotes(keys: string[]) {
  if (!keys.length) return HIGEDAN_SONGS;
  const cast = new Set(keys);
  return HIGEDAN_SONGS.map(song => ({ ...song, votes: {
    overall: Number(cast.has(song.id + ':overall')), lyric: Number(cast.has(song.id + ':lyric')),
    live: Number(cast.has(song.id + ':live')), hiddenGem: Number(cast.has(song.id + ':hiddenGem')),
  } }));
}

function decode(raw: string | null): FanRecords {
  const defaults = initialRecords();
  if (raw === null) return defaults;
  const parsed = restoreFanRecords(raw);
  return {
    setlist: parsed.setlist ?? defaults.setlist, setlistTitle: parsed.setlistTitle ?? defaults.setlistTitle,
    votedKeys: parsed.votedKeys ?? [], likedReviewIds: parsed.likedReviewIds ?? [],
    reviews: parsed.reviews ?? [], visitedSpotIds: parsed.visitedSpotIds ?? [],
    attendedTourIds: parsed.attendedTourIds ?? [], bestQuizScore: parsed.bestQuizScore ?? null,
    resetEpoch: parsed.resetEpoch,
    setlistMembershipVersions: parsed.setlistMembershipVersions,
  };
}

// 曲の追加・削除だけを数え、古い保留操作が後の削除を復活させないようにする。
function withMembershipVersions(previous: FanRecords, next: FanRecords): FanRecords {
  const before = new Set(previous.setlist.map(item => item.songId));
  const after = new Set(next.setlist.map(item => item.songId));
  let versions = previous.setlistMembershipVersions;
  for (const id of new Set([...before, ...after])) {
    if (before.has(id) === after.has(id)) continue;
    if (versions === previous.setlistMembershipVersions) versions = { ...versions };
    versions[id] = (versions[id] ?? 0) + 1;
  }
  return next.setlistMembershipVersions === versions ? next : { ...next, setlistMembershipVersions: versions };
}

function encode(record: FanRecords) {
  const saved: PersistedState = {
    ...record, hasQuizAttempt: record.bestQuizScore !== null,
    songs: songsWithVotes(record.votedKeys).map(({id, votes}) => ({id, votes})),
  };
  return JSON.stringify(saved);
}

export type SaveResult = 'saved' | 'unsaved' | 'conflict';
export type Change = (latest: FanRecords) => FanRecords | null;
type Intent = { change: Change; epoch: string; journalKey?: string; journalSongId?: string; result?: SaveResult };
type Snapshot = { records: FanRecords; notice: string };

// Each intent describes only the user's action. Under an origin-wide lock, apply it to
// the latest v1 data. Quota failures retain pending actions for a later retry or export.
export class FanRecordStore {
  private base = initialRecords();
  private raw: string | null | undefined;
  private pending: Intent[] = [];
  private resetting = false;
  private journalLoaded = false;
  private journalNotice = '';
  private journalOrder = 0;
  private pendingConflict = false;
  private view: Snapshot = {records: this.base, notice: ''};
  private listeners = new Set<() => void>();
  constructor(
    private storage: () => Pick<Storage, 'getItem' | 'setItem'>,
    private exclusive: <T>(fn: () => T) => Promise<T>,
    private journalStorage?: () => JournalStorage,
  ) {}
  snapshot = () => this.view;
  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private publish(records: FanRecords, notice: string) {
    if (records === this.view.records && notice === this.view.notice) return;
    this.view = {records, notice};
    this.listeners.forEach(fn => fn());
  }
  private removeJournal(key?: string) {
    if (!key || !this.journalStorage) return true;
    try { this.journalStorage().removeItem(key); return true; }
    catch { return false; }
  }
  private pendingAdd(add: PendingSetlistAdd): Change {
    return records => {
      if (records.setlist.some(item => item.songId === add.songId)) return records;
      if ((add.hadSavedRecord && this.raw === null) ||
          (records.setlistMembershipVersions[add.songId] ?? 0) !== add.membershipVersion) return null;
      return { ...records, setlist: normalizeSetlistOrder([...records.setlist, { songId: add.songId, isEncore: add.isEncore }]) };
    };
  }
  private recoverJournal() {
    if (this.journalLoaded || !this.journalStorage) return;
    this.journalLoaded = true;
    try {
      const { entries, unreadable } = readPendingSetlistAdds(this.journalStorage());
      if (unreadable) this.journalNotice = JOURNAL_READ_ERROR;
      for (const { key, add } of entries) {
        this.journalOrder = Math.max(this.journalOrder, add.order);
        this.pending.push({ change: this.pendingAdd(add), epoch: add.resetEpoch, journalKey: key, journalSongId: add.songId });
      }
    } catch { this.journalNotice = JOURNAL_READ_ERROR; }
  }
  private read() {
    const raw = this.storage().getItem(STORAGE_KEY);
    if (raw !== this.raw) {
      if (raw === null && typeof this.raw === 'string') {
        if (this.pending.length) this.pendingConflict = true;
        this.pending.forEach(intent => { intent.result = 'conflict'; this.removeJournal(intent.journalKey); });
        this.pending = [];
      }
      this.base = decode(raw); // may throw; never replace invalid input implicitly
      this.raw = raw;
    }
  }
  private project() {
    let records = this.base;
    this.pending = this.pending.filter(intent => {
      const next = intent.epoch === records.resetEpoch ? intent.change(records) : null;
      if (next === null) {
        intent.result = 'conflict';
        this.pendingConflict = true;
        this.removeJournal(intent.journalKey);
        return false;
      }
      records = withMembershipVersions(records, next);
      return true;
    });
    return records;
  }
  refresh = () => {
    try {
      this.read();
      const count = this.pending.length;
      const records = this.project();
      this.publish(records, this.pendingConflict || this.pending.length !== count ? CONFLICT : this.pending.length ? this.view.notice : this.journalNotice);
      return true;
    } catch { this.publish(this.view.records, READ_ERROR); return false; }
  };
  private flush = () => {
    try { this.read(); } catch { this.publish(this.view.records, READ_ERROR); return; }
    const count = this.pending.length;
    const records = this.project();
    const notice = this.pendingConflict || count !== this.pending.length ? CONFLICT : this.journalNotice;
    try {
      const raw = encode(records);
      if (raw !== this.raw) this.storage().setItem(STORAGE_KEY, raw);
      this.raw = raw;
      this.base = records;
      this.pending.forEach(intent => { intent.result = 'saved'; this.removeJournal(intent.journalKey); });
      this.pending = [];
      this.publish(records, notice);
    } catch { this.publish(records, WRITE_ERROR); }
  };
  async initialize() {
    this.recoverJournal();
    this.refresh();
    try { await this.exclusive(this.flush); } catch { this.publish(this.view.records, WRITE_ERROR); }
  }
  change(change: Change, expectedEpoch = this.view.records.resetEpoch): Promise<SaveResult> {
    return this.enqueue(change, expectedEpoch);
  }
  private async enqueue(change: Change, expectedEpoch: string, journal?: {key: string; songId: string}): Promise<SaveResult> {
    if (this.resetting || expectedEpoch !== this.view.records.resetEpoch) { this.removeJournal(journal?.key); return 'conflict'; }
    const current = this.view.records;
    const next = change(current);
    if (next === null) { this.removeJournal(journal?.key); this.publish(current, CONFLICT); return 'conflict'; }
    const removed = new Set(current.setlist.filter(item => !next.setlist.some(entry => entry.songId === item.songId)).map(item => item.songId));
    let cancellationFailed = false;
    for (const pending of this.pending) {
      if (!pending.journalKey || !pending.journalSongId || !removed.has(pending.journalSongId)) continue;
      if (this.removeJournal(pending.journalKey)) {
        pending.journalKey = undefined;
        pending.journalSongId = undefined;
      } else cancellationFailed = true;
    }
    const intent: Intent = {change, epoch: current.resetEpoch, journalKey: journal?.key, journalSongId: journal?.songId};
    this.pending.push(intent);
    const notice = cancellationFailed ? JOURNAL_CANCEL_ERROR : this.pendingConflict ? this.journalNotice : this.view.notice;
    this.pendingConflict = false;
    this.publish(withMembershipVersions(current, next), notice);
    try { await this.exclusive(() => { if (!intent.result) this.flush(); }); }
    catch { this.publish(this.view.records, WRITE_ERROR); }
    return intent.result ?? 'unsaved';
  }
  addToSetlist(songId: string, isEncore: boolean, expectedEpoch = this.view.records.resetEpoch): Promise<SaveResult> {
    if (!songIds.has(songId) || !this.journalStorage) return Promise.resolve('unsaved');
    this.recoverJournal();
    if (!this.refresh()) return Promise.resolve('unsaved');
    const current = this.view.records;
    if (this.resetting || expectedEpoch !== current.resetEpoch) {
      this.publish(current, CONFLICT);
      return Promise.resolve('conflict');
    }
    if (current.setlist.some(item => item.songId === songId)) return this.change(records => records, expectedEpoch);
    this.journalOrder = Math.max(Date.now(), this.journalOrder + 1);
    const add: PendingSetlistAdd = { songId, isEncore, resetEpoch: current.resetEpoch,
      membershipVersion: current.setlistMembershipVersions[songId] ?? 0,
      hadSavedRecord: this.raw !== null, order: this.journalOrder };
    let key: string;
    try { key = writePendingSetlistAdd(this.journalStorage(), add); }
    catch { this.publish(current, JOURNAL_ERROR); return Promise.resolve('unsaved'); }
    return this.enqueue(this.pendingAdd(add), expectedEpoch, {key, songId});
  }
  async reset(expectedEpoch = this.view.records.resetEpoch): Promise<boolean> {
    if (this.resetting) return false;
    this.resetting = true;
    try {
      return await this.exclusive(() => {
        // Only a deliberate reset may replace unreadable input.
        const incoming = this.storage().getItem(STORAGE_KEY);
        let epoch = expectedEpoch;
        try { epoch = decode(incoming).resetEpoch; } catch { /* explicit recovery */ }
        if (epoch !== expectedEpoch) { this.refresh(); return false; }
        const fresh = initialRecords(crypto.randomUUID());
        // Commit defaults and their reset generation together. A failed write leaves the
        // previous record intact, and stale drafts cannot cross a successful reset.
        const raw = encode(fresh);
        this.storage().setItem(STORAGE_KEY, raw);
        this.raw = raw;
        this.base = fresh;
        this.pending.forEach(intent => { intent.result = 'conflict'; this.removeJournal(intent.journalKey); });
        this.pending = [];
        this.pendingConflict = false;
        this.publish(fresh, '');
        return true;
      });
    } catch { this.publish(this.view.records, '保存データを初期化できませんでした。'); return false; }
    finally { this.resetting = false; }
  }
}

export function createFanRecordStore() {
  return new FanRecordStore(() => localStorage, withRecordLock, () => sessionStorage);
}

// Some browsers provide IndexedDB but not Web Locks. A readwrite transaction on
// one origin-local object store serializes its synchronous callback across tabs.
let guardDatabase: Promise<IDBDatabase> | undefined;
function withRecordLock<T>(work: () => T): Promise<T> {
  if (navigator.locks) return navigator.locks.request(STORAGE_KEY, work);
  if (!guardDatabase) {
    guardDatabase = new Promise<IDBDatabase>((resolve, reject) => {
      const open = indexedDB.open('higedan-fan-record-lock', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('guard');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => resolve(open.result);
    }).catch(error => { guardDatabase = undefined; throw error; });
  }
  return guardDatabase.then(database => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction('guard', 'readwrite');
    const guard = transaction.objectStore('guard').get(STORAGE_KEY);
    let result: T;
    guard.onsuccess = () => {
      try { result = work(); }
      catch (error) { reject(error); transaction.abort(); }
    };
    transaction.onabort = () => reject(transaction.error);
    transaction.oncomplete = () => resolve(result);
  }));
}
