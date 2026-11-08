import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFanRecordBackup, parseFanRecordBackup } from './fanRecordBackup';
import { FanRecordStore, initialRecords } from './fanRecordStore';
import { SACRED_SPOTS, TOUR_ARCHIVES } from '../data/higedanData';

test('backup round-trips a completed zero score and rejects invalid data', () => {
  const records = { ...initialRecords('old'), bestQuizScore: 0, setlistTitle: '自分のセトリ' };
  const backup = createFanRecordBackup(records);
  const restored = parseFanRecordBackup(backup);
  assert.deepEqual(restored.setlist, records.setlist);
  assert.equal(restored.setlistTitle, '自分のセトリ');
  assert.equal(restored.bestQuizScore, 0);
  const bad = JSON.parse(backup);
  bad.records.setlist[0].songId = 'unknown-song';
  assert.throws(() => parseFanRecordBackup(JSON.stringify(bad)), /安全に読み込めません/);
  bad.version = 99;
  assert.throws(() => parseFanRecordBackup(JSON.stringify(bad)), /対応していません/);
});

test('backup preserves populated setlist, attendance, visits, votes, and reviews', () => {
  const records = {
    ...initialRecords('original'),
    visitedSpotIds: [SACRED_SPOTS[0].id],
    attendedTourIds: [TOUR_ARCHIVES[0].id],
    votedKeys: ['pretender:overall'],
    reviews: [{ id: 'rev-fixture', author: '読者', title: '感想です', comment: '一段目の感想です。\n二段目です。', songId: 'pretender', category: 'ライブ体験' as const, fanTenure: '3年', postedAt: '2026.11.07', likes: 1 }],
    likedReviewIds: ['rev-fixture'],
    bestQuizScore: 75,
  };
  const restored = parseFanRecordBackup(createFanRecordBackup(records));
  for (const field of ['setlist', 'visitedSpotIds', 'attendedTourIds', 'votedKeys', 'reviews', 'likedReviewIds', 'bestQuizScore'] as const) {
    assert.deepEqual(restored[field], records[field]);
  }
});

test('import refuses stale snapshots and failed writes leave the saved records untouched', async () => {
  const data = { raw: null as string | null, deny: false };
  const storage = () => ({
    getItem: () => data.raw,
    setItem: (_key: string, raw: string) => { if (data.deny) throw Error('quota'); data.raw = raw; },
  });
  let tail = Promise.resolve();
  const lock = <T>(fn: () => T) => {
    const next = tail.then(fn);
    tail = next.then(() => {}, () => {});
    return next;
  };
  const a = new FanRecordStore(storage, lock);
  const b = new FanRecordStore(storage, lock);
  await a.initialize();
  await b.initialize();
  const expected = a.snapshot().records;
  const imported = parseFanRecordBackup(createFanRecordBackup({ ...expected, setlistTitle: '保存したセトリ' }));
  await b.change(record => ({ ...record, setlistTitle: '別タブの変更' }));
  assert.equal(await a.importBackup(imported, expected), false);
  assert.equal(JSON.parse(data.raw!).setlistTitle, '別タブの変更');
  const fresh = a.snapshot().records;
  const before = data.raw;
  data.deny = true;
  assert.equal(await a.importBackup(imported, fresh), false);
  assert.equal(data.raw, before);
  data.deny = false;
  assert.equal(await a.importBackup(imported, fresh), true);
  assert.equal(JSON.parse(data.raw!).setlistTitle, '保存したセトリ');
  assert.notEqual(a.snapshot().records.resetEpoch, fresh.resetEpoch);
});
