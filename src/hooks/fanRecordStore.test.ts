import assert from 'node:assert/strict';
import test from 'node:test';
import { FanRecordStore } from './fanRecordStore';
import { restoreFanRecords } from './fanRecordStorage';
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
