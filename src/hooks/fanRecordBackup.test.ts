import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createFanRecordBackup, parseFanRecordBackup, parseFanRecordBackupWithSetlists } from './fanRecordBackup';
import { FanRecordStore, initialRecords } from './fanRecordStore';
import { createInitialSavedSetlistsState, createNewSavedSetlist } from '../utils/savedSetlists';
import { SACRED_SPOTS, TOUR_ARCHIVES } from '../data/higedanData';

test('backup round-trips a completed zero score and rejects invalid data', () => {
  const records = {
    ...initialRecords('old'),
    setlist: [{ songId: 'pretender', isEncore: false }],
    bestQuizScore: 0,
    setlistTitle: '自分のセトリ',
  };
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

test('backup preserves multiple saved setlists and rejects tampered setlist entries', () => {
  const records = {
    ...initialRecords('epoch-1'),
    setlist: [{ songId: 'subtitle', isEncore: false }],
    setlistTitle: 'セトリ2',
  };
  const baseSaved = createInitialSavedSetlistsState(
    'セトリ1',
    [{ songId: 'pretender', isEncore: false }],
    undefined,
    '2026-11-14T10:00:00.000Z',
  );
  const { state: twoSaved } = createNewSavedSetlist(
    baseSaved,
    'セトリ2',
    records.setlist,
    '2026-11-14T11:00:00.000Z',
  );

  const backup = createFanRecordBackup(records, twoSaved);
  const restored = parseFanRecordBackupWithSetlists(backup);
  assert.equal(restored.savedSetlists?.items.length, 2);
  assert.equal(restored.savedSetlists?.activeId, twoSaved.activeId);

  const tampered = JSON.parse(backup);
  tampered.savedSetlists.items[0].entries.push({ songId: 'not-a-real-song', isEncore: false });
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(tampered)), /安全に読み込めません/);
});

test('backup preserves quiz volume scores and rejects tampered volume records', () => {
  const records = {
    ...initialRecords('epoch-1'),
    bestQuizScore: 90,
  };
  const volumes = Object.assign(Object.create(null), {
    'beginner:vol1': { score: 9, total: 10, percentage: 90 },
    'all:vol6': { score: 10, total: 10, percentage: 100 },
  });
  const backup = createFanRecordBackup(records, null, volumes);
  const restored = parseFanRecordBackupWithSetlists(backup);
  assert.deepEqual({ ...(restored.quizVolumeScores ?? {}) }, { ...volumes });

  const tamperedKey = JSON.parse(backup);
  tamperedKey.quizVolumeScores['beginner:unknown'] = { score: 5, total: 10, percentage: 50 };
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(tamperedKey)), /安全に読み込めません/);

  const tamperedScore = JSON.parse(backup);
  tamperedScore.quizVolumeScores['beginner:vol1'].score = 11;
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(tamperedScore)), /安全に読み込めません/);
});

test('backup preserves myNoteProfile and rejects tampered profile payloads', () => {
  const records = { ...initialRecords('epoch-mn') };
  const profile = {
    nickname: 'テスト太郎',
    opened: true,
    readSongIds: ['pretender', 'subtitle'],
    completedMoods: ['push_back', 'deep_lyric'],
    moodCompletedCount: 3,
    visitedVocalRange: true,
    visitedReferenceArchive: true,
    exportedBackup: true,
  };
  const backup = createFanRecordBackup(records, null, null, profile);
  const restored = parseFanRecordBackupWithSetlists(backup);
  assert.deepEqual(restored.myNoteProfile, profile);

  const tamperedName = JSON.parse(backup);
  tamperedName.myNoteProfile.nickname = '<script>bad</script>';
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(tamperedName)), /安全に読み込めません/);

  const tamperedSong = JSON.parse(backup);
  tamperedSong.myNoteProfile.readSongIds.push('not-a-catalog-song');
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(tamperedSong)), /安全に読み込めません/);

  const extraKey = JSON.parse(backup);
  extraKey.myNoteProfile.unexpectedFlag = true;
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(extraKey)), /安全に読み込めません/);

  const badType = JSON.parse(backup);
  badType.myNoteProfile.opened = 'yes';
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(badType)), /安全に読み込めません/);

  // Optional setlistShareImageGenerated flag round-trips and rejects invalid types without breaking legacy backups
  assert.equal(restored.setlistShareImageGenerated, undefined);
  const backupWithImage = createFanRecordBackup(records, null, null, profile, true);
  const restoredWithImage = parseFanRecordBackupWithSetlists(backupWithImage);
  assert.equal(restoredWithImage.setlistShareImageGenerated, true);

  const badImageFlag = JSON.parse(backupWithImage);
  badImageFlag.setlistShareImageGenerated = 'yes';
  assert.throws(() => parseFanRecordBackupWithSetlists(JSON.stringify(badImageFlag)), /安全に読み込めません/);
});

test('backup parser rejects deep nesting, unexpected keys, invalid updatedAt, and excessive ID counts', () => {
  const baseRecords = {
    setlist: [],
    setlistTitle: 'セトリ',
    visitedSpotIds: [],
    attendedTourIds: [],
    votedKeys: [],
    reviews: [],
    likedReviewIds: [],
    bestQuizScore: null,
  };
  const baseEnvelope = () => ({
    format: 'higedan-fan-notebook',
    version: 1,
    records: { ...baseRecords, hasQuizAttempt: false },
  });

  // 1. Deep nesting exceeding MAX_COMPARE_DEPTH (12)
  let nested: Record<string, unknown> = { leaf: 'x' };
  for (let i = 0; i < 15; i += 1) nested = { nested };
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({ ...baseEnvelope(), savedSetlists: nested })),
    /形式を確認|安全に読み込めません|正しくありません|読み取れませんでした/,
  );

  // 2. Unexpected keys in outer envelope, records, savedSetlists, and savedSetlist item
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({ ...baseEnvelope(), surprise: true })),
    /対応していません/,
  );
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({
      ...baseEnvelope(),
      records: { ...baseRecords, hasQuizAttempt: false, sneaky: 1 },
    })),
    /読み取れませんでした/,
  );
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({
      ...baseEnvelope(),
      savedSetlists: {
        activeId: 'setlist-1',
        items: [{ id: 'setlist-1', title: 'S1', entries: [], updatedAt: '2026-11-18T00:00:00.000Z' }],
        extra: 1,
      },
    })),
    /形式が正しくありません/,
  );
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({
      ...baseEnvelope(),
      savedSetlists: {
        activeId: 'setlist-1',
        items: [{ id: 'setlist-1', title: 'S1', entries: [], updatedAt: '2026-11-18T00:00:00.000Z', extra: 1 }],
      },
    })),
    /安全に読み込めませんでした/,
  );

  // 3. Invalid updatedAt inside savedSetlists
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({
      ...baseEnvelope(),
      savedSetlists: {
        activeId: 'setlist-1',
        items: [{ id: 'setlist-1', title: 'S1', entries: [], updatedAt: 'invalid-timestamp' }],
      },
    })),
    /安全に読み込めませんでした/,
  );

  // 4. Excessive ID counts exceeding backup validation caps
  const tooManyIds = Array.from({ length: 400 }, (_, i) => `spot-${i}`);
  assert.throws(
    () => parseFanRecordBackupWithSetlists(JSON.stringify({
      ...baseEnvelope(),
      records: { ...baseRecords, hasQuizAttempt: false, visitedSpotIds: tooManyIds },
    })),
    /安全に読み込めませんでした/,
  );
});
