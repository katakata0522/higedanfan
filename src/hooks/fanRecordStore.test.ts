import assert from 'node:assert/strict';
import test from 'node:test';
import { FanRecordStore } from './fanRecordStore';
import { restoreFanRecords, STORAGE_KEY } from './fanRecordStorage';
import type { FanReview } from '../data/higedanData';

function browser(raw: string | null = null) {
  const data = {raw};
  let tail = Promise.resolve();
  function lock<T>(fn: () => T) {
    const next = tail.then(fn);
    tail = next.then(() => {}, () => {});
    return next;
  }
  const tab = () => {
    const policy = { deny: false };
    const store = new FanRecordStore(() => ({
      getItem: () => data.raw,
      setItem: (_: string, text: string) => { if (policy.deny) throw new Error('quota'); data.raw = text; },
    }), lock);
    return { store, policy };
  };
  return { data, tab };
}

const review: FanReview = {id:'rev-fixture', author:'読者', title:'感想です', comment:'一段目の感想です。\n二段目です。',
  songId:'pretender', category:'ライブ体験', fanTenure:'3年', postedAt:'2026.11.07', likes:0};

test('stale and concurrent tabs apply their actions to the latest records without resurrecting deletions', async () => {
  const {tab, data} = browser();
  const a=tab().store, b=tab().store;
  await Promise.all([a.initialize(), b.initialize()]);
  await Promise.all([
    a.change(r => ({...r, reviews: [review, ...r.reviews]})),
    b.change(r => ({...r, setlistTitle:'新しいセトリ'})),
  ]);
  assert.equal(JSON.parse(data.raw!).reviews[0].id, review.id);
  assert.equal(JSON.parse(data.raw!).setlistTitle,'新しいセトリ');
  b.refresh(); // B has seen the review, but misses the next storage notification.
  await a.change(r => ({...r, reviews: []}));
  await b.change(r => ({...r, visitedSpotIds:['spot-nissan-stadium']}));
  assert.equal(JSON.parse(data.raw!).reviews.length,0);
});

test('failed writes retain pending data, retry merges it, reset generations reject pre-reset actions', async () => {
  const {tab,data} = browser(); const {store:a,policy}=tab(), b=tab().store;
  await a.initialize(); await b.initialize();
  policy.deny=true;
  assert.equal(await a.change(r=>({...r,reviews:[review,...r.reviews]})), 'unsaved');
  assert.equal(JSON.parse(data.raw!).reviews.length,0);
  assert.equal(a.snapshot().records.reviews.length,1);
  await b.change(r=>({...r,bestQuizScore:78}));
  policy.deny=false;
  assert.equal(await a.change(r=>({...r,setlistTitle:'追記'})),'saved');
  assert.equal(JSON.parse(data.raw!).bestQuizScore,78);
  assert.equal(JSON.parse(data.raw!).reviews.length,1);
  policy.deny=true;
  await a.change(r=>({...r,setlistTitle:'未保存'}));
  const beforeReset=a.snapshot().records.resetEpoch;
  assert.equal(await b.reset(),true);
  policy.deny=false;
  assert.equal(await a.change(r=>({...r,reviews:[review]}),beforeReset),'conflict');
  assert.equal(JSON.parse(data.raw!).reviews.length,0);
  assert.ok(a.snapshot().records.resetEpoch!==beforeReset);
  assert.ok(a.snapshot().records.setlistTitle!=='未保存');
});

test('failed resets and ordinary edits never overwrite unreadable or protected storage', async () => {
  const {tab,data} = browser('["unknown format"]'); const {store,policy}=tab();
  await store.initialize();
  assert.match(store.snapshot().notice,/上書きしません/);
  assert.equal(await store.change(r=>({...r,setlistTitle:'下書き'})),'unsaved');
  assert.equal(data.raw,'["unknown format"]');
  policy.deny=true; assert.equal(await store.reset(),false);
  assert.equal(data.raw,'["unknown format"]');
  assert.equal(store.snapshot().records.setlistTitle,'下書き');
  policy.deny=false; assert.equal(await store.reset(),true);
  assert.ok(JSON.parse(data.raw!).resetEpoch);
});

test('legacy zero has no verified result, completed zero survives reload', async () => {
  assert.equal(restoreFanRecords('{"bestQuizScore":0}').bestQuizScore,null);
  const {tab,data}=browser(); const a=tab().store; await a.initialize();
  assert.equal(a.snapshot().records.bestQuizScore,null);
  await a.change(r=>({...r,bestQuizScore:0}));
  assert.equal(restoreFanRecords(data.raw!).bestQuizScore,0);
  assert.equal(tab().store.snapshot().records.bestQuizScore,null); // fresh before hydration
  const b=tab().store;await b.initialize();assert.equal(b.snapshot().records.bestQuizScore,0);
});

test('another tab preserves a title mid-edit, including its trailing space and a cleared field', async () => {
  const { tab, data } = browser();
  const editor = tab().store;
  const other = tab().store;
  await Promise.all([editor.initialize(), other.initialize()]);
  for (const title of ['', 'My ']) {
    await editor.change(records => ({ ...records, setlistTitle: title }));
    await other.change(records => ({ ...records, bestQuizScore: 75 }));
    editor.refresh();
    assert.equal(editor.snapshot().records.setlistTitle, title);
    assert.equal(JSON.parse(data.raw!).setlistTitle, title);
  }
});

function memoryStorage(seed: Iterable<readonly [string, string]> = []) {
  const values = new Map(seed);
  return {
    values,
    get length() { return values.size; },
    // 順序に依存せず、記録した順に復元されることも確かめる。
    key: (index: number) => [...values.keys()].reverse()[index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

const immediateLock = <T>(fn: () => T): Promise<T> => Promise.resolve().then(fn);
const pendingLock = <T>(_fn: () => T): Promise<T> => new Promise(() => {});

test('a reload during the lock wait restores queued additions in order', async () => {
  const local = memoryStorage(), session = memoryStorage();
  let waiting = false;
  const lock = <T>(fn: () => T) => waiting ? pendingLock(fn) : immediateLock(fn);
  const before = new FanRecordStore(() => local, lock, () => session);
  await before.initialize();
  waiting = true;
  void before.addToSetlist('white-noise', false);
  void before.addToSetlist('cry-baby', false);
  assert.equal(session.length, 2);
  assert.equal(JSON.parse(local.getItem(STORAGE_KEY)!).setlist.some((item: {songId: string}) => item.songId === 'white-noise'), false);

  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  const saved = JSON.parse(local.getItem(STORAGE_KEY)!).setlist as {songId: string}[];
  assert.ok(saved.findIndex(item => item.songId === 'white-noise') < saved.findIndex(item => item.songId === 'cry-baby'));
  assert.equal(saved.filter(item => item.songId === 'white-noise').length, 1);
  assert.equal(session.length, 0);
});

test('recovered additions merge with changes from another tab', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const before = new FanRecordStore(() => local, immediateLock, () => session);
  await before.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);

  const other = new FanRecordStore(() => local, immediateLock, () => memoryStorage());
  await other.initialize();
  await other.change(records => ({...records, setlistTitle: '別タブのタイトル', bestQuizScore: 78}));
  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  assert.equal(after.snapshot().records.setlistTitle, '別タブのタイトル');
  assert.equal(after.snapshot().records.bestQuizScore, 78);
  assert.ok(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'));
});

test('a copied pending addition cannot restore a song removed after it was saved', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const before = new FanRecordStore(() => local, immediateLock, () => session);
  await before.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  const copiedSession = memoryStorage(session.values);

  const recovered = new FanRecordStore(() => local, immediateLock, () => session);
  await recovered.initialize();
  await recovered.change(records => ({...records, setlist: records.setlist.filter(item => item.songId !== 'white-noise')}));
  const stale = new FanRecordStore(() => local, immediateLock, () => copiedSession);
  await stale.initialize();
  assert.equal(stale.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
  assert.match(stale.snapshot().notice, /別のタブ/);
  assert.equal(copiedSession.length, 0);
});

test('removing a still-pending addition before reload does not restore it', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const first = new FanRecordStore(() => local, immediateLock, () => session);
  await first.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  assert.equal(session.length, 1);
  void waiting.change(records => ({...records, setlist: records.setlist.filter(item => item.songId !== 'white-noise')}));
  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  assert.equal(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
});

test('replacing the setlist cancels only pending additions that were removed', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const first = new FanRecordStore(() => local, immediateLock, () => session);
  await first.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  void waiting.addToSetlist('cry-baby', false);
  void waiting.change(records => ({...records, setlist: records.setlist.filter(item => item.songId !== 'white-noise')}));
  assert.equal(session.length, 1);
  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  assert.equal(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
  assert.ok(after.snapshot().records.setlist.some(item => item.songId === 'cry-baby'));
});

test('failure to cancel a pending addition is visible instead of silently ignored', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const first = new FanRecordStore(() => local, immediateLock, () => session);
  await first.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  session.removeItem = () => { throw new Error('session storage blocked'); };
  void waiting.change(records => ({...records, setlist: records.setlist.filter(item => item.songId !== 'white-noise')}));
  assert.match(waiting.snapshot().notice, /削除を一時保存に反映できません/);
  assert.equal(session.length, 1);
});

test('reset in another tab rejects a pending addition from before the reset', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const first = new FanRecordStore(() => local, immediateLock, () => session);
  await first.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  const other = new FanRecordStore(() => local, immediateLock, () => memoryStorage());
  await other.initialize();
  assert.equal(await other.reset(), true);
  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  assert.equal(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
  assert.match(after.snapshot().notice, /別のタブ/);
});

test('storage failures do not claim an addition was saved or replace unreadable data', async () => {
  const local = memoryStorage([[STORAGE_KEY, '["unknown format"]']]), session = memoryStorage();
  const corrupt = new FanRecordStore(() => local, immediateLock, () => session);
  await corrupt.initialize();
  assert.equal(await corrupt.addToSetlist('white-noise', false), 'unsaved');
  assert.equal(local.getItem(STORAGE_KEY), '["unknown format"]');
  assert.equal(session.length, 0);

  const valid = memoryStorage(), denied = memoryStorage();
  denied.setItem = () => { throw new Error('session storage blocked'); };
  const blocked = new FanRecordStore(() => valid, immediateLock, () => denied);
  await blocked.initialize();
  assert.equal(await blocked.addToSetlist('white-noise', false), 'unsaved');
  assert.equal(blocked.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
  assert.match(blocked.snapshot().notice, /一時保存できません/);
});

test('a failed primary write keeps the addition available for recovery', async () => {
  const local = memoryStorage(), session = memoryStorage();
  let denied = false;
  const primary = { getItem: local.getItem, setItem: (key: string, value: string) => {
    if (denied) throw new Error('local storage blocked');
    local.setItem(key, value);
  } };
  const before = new FanRecordStore(() => primary, immediateLock, () => session);
  await before.initialize();
  denied = true;
  assert.equal(await before.addToSetlist('white-noise', false), 'unsaved');
  assert.equal(session.length, 1);
  denied = false;
  const after = new FanRecordStore(() => primary, immediateLock, () => session);
  await after.initialize();
  assert.ok(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'));
  assert.equal(session.length, 0);
});

test('clearing the saved records rejects an older pending addition', async () => {
  const local = memoryStorage(), session = memoryStorage();
  const first = new FanRecordStore(() => local, immediateLock, () => session);
  await first.initialize();
  const waiting = new FanRecordStore(() => local, pendingLock, () => session);
  void waiting.initialize();
  void waiting.addToSetlist('white-noise', false);
  local.removeItem(STORAGE_KEY);
  const after = new FanRecordStore(() => local, immediateLock, () => session);
  await after.initialize();
  assert.equal(after.snapshot().records.setlist.some(item => item.songId === 'white-noise'), false);
  assert.match(after.snapshot().notice, /別のタブ/);
});

test('an unreadable pending entry is preserved while valid additions still save', async () => {
  const local = memoryStorage(), session = memoryStorage([['higedan_pending_setlist_add_v1:unknown', 'not-json']]);
  const store = new FanRecordStore(() => local, immediateLock, () => session);
  await store.initialize();
  assert.match(store.snapshot().notice, /一部読めません/);
  assert.equal(await store.addToSetlist('white-noise', false), 'saved');
  assert.equal(session.getItem('higedan_pending_setlist_add_v1:unknown'), 'not-json');
  assert.equal(session.length, 1);
});
