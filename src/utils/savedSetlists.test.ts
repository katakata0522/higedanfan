import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEY } from '../hooks/fanRecordStorage';
import {
  MAX_SAVED_SETLISTS,
  SAVED_SETLISTS_STORAGE_KEY,
  clearStaleSavedSetlists,
  createInitialSavedSetlistsState,
  createNewSavedSetlist,
  deleteSavedSetlist,
  persistSavedSetlists,
  readQuickAddSetlistId,
  readStoredSavedSetlists,
  sanitizeSavedSetlistsState,
  switchSavedSetlist,
  syncActiveSavedSetlist,
  writeQuickAddSetlistId,
  type SavedSetlistsStoreLike,
} from './savedSetlists';

const VALID_IDS = new Set(['pretender', 'subtitle', 'cry-baby', 'universe']);

test('createInitialSavedSetlistsState seeds normalized default setlist', () => {
  const state = createInitialSavedSetlistsState(
    '<b>アリーナ公演</b>',
    [
      { songId: 'subtitle', isEncore: true },
      { songId: 'pretender', isEncore: false },
    ],
    VALID_IDS,
    '2026-11-14T12:00:00.000Z',
  );
  assert.equal(state.activeId, 'setlist-1');
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].title, 'アリーナ公演');
  assert.deepEqual(state.items[0].entries, [
    { songId: 'pretender', isEncore: false },
    { songId: 'subtitle', isEncore: true },
  ]);
});

test('create, sync, switch, and delete saved setlists maintain consistency', () => {
  let state = createInitialSavedSetlistsState(
    'スタジアム初日',
    [{ songId: 'pretender', isEncore: false }],
    VALID_IDS,
    '2026-11-14T10:00:00.000Z',
  );

  const created = createNewSavedSetlist(
    state,
    'アゲアゲ厳選セトリ',
    [{ songId: 'cry-baby', isEncore: false }],
    '2026-11-14T11:00:00.000Z',
  );
  state = created.state;
  assert.equal(state.activeId, created.created.id);
  assert.equal(state.items.length, 2);

  state = syncActiveSavedSetlist(
    state,
    'アゲアゲ厳選セトリ改',
    [
      { songId: 'cry-baby', isEncore: false },
      { songId: 'universe', isEncore: true },
    ],
    '2026-11-14T11:05:00.000Z',
  );
  assert.equal(state.items[0].title, 'アゲアゲ厳選セトリ改');
  assert.equal(state.items[0].entries.length, 2);

  const switched = switchSavedSetlist(state, 'setlist-1');
  assert.equal(switched.state.activeId, 'setlist-1');
  assert.equal(switched.target?.title, 'スタジアム初日');
  state = switched.state;

  const delActive = deleteSavedSetlist(state, 'setlist-1');
  assert.equal(delActive.deleted, true);
  assert.equal(delActive.nextActive?.id, created.created.id);
  assert.equal(delActive.state.items.length, 1);

  const cannotDeleteLast = deleteSavedSetlist(delActive.state, created.created.id);
  assert.equal(cannotDeleteLast.deleted, false);
  assert.equal(cannotDeleteLast.state.items.length, 1);
});

test('sanitizeSavedSetlistsState blocks tampered IDs, invalid songs, and excessive items', () => {
  const raw = {
    activeId: '__proto__',
    items: Array.from({ length: MAX_SAVED_SETLISTS + 5 }, (_, i) => ({
      id: i === 0 ? '!!!' : `list-${i}`,
      title: i === 1 ? 'Live\u202E<script>alert(1)</script>' : `セトリ ${i}`,
      entries: [
        { songId: 'pretender', isEncore: false },
        { songId: 'non-existent', isEncore: false },
      ],
      updatedAt: '2026-11-14T00:00:00Z',
    })),
  };

  const clean = sanitizeSavedSetlistsState(raw, VALID_IDS);
  assert.ok(clean);
  assert.equal(clean.items.length, MAX_SAVED_SETLISTS);
  assert.equal(clean.activeId, 'list-1');
  assert.equal(clean.items[0].title, 'Livealert(1)');
  assert.deepEqual(clean.items[0].entries, [{ songId: 'pretender', isEncore: false }]);
});

function memoryStore(entries: Record<string, string> = {}): SavedSetlistsStoreLike {
  const values = new Map(Object.entries(entries));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
}

test('resetEpoch prevents stale writes and pre-reset saved setlist resurrection', () => {
  const storage = memoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-1' }),
  });
  const base = createInitialSavedSetlistsState(
    'セトリ1',
    [{ songId: 'pretender', isEncore: false }],
    VALID_IDS,
    '2026-11-15T10:00:00.000Z',
  );
  assert.equal(persistSavedSetlists(base, { expectedEpoch: 'epoch-1', storage }), true);
  assert.equal(readStoredSavedSetlists(VALID_IDS, { expectedEpoch: 'epoch-1', storage })?.items[0].title, 'セトリ1');

  // Another tab resets records -> resetEpoch advances to epoch-2.
  storage.setItem(STORAGE_KEY, JSON.stringify({ resetEpoch: 'epoch-2' }));
  assert.equal(readStoredSavedSetlists(VALID_IDS, { storage }), null);
  assert.equal(persistSavedSetlists(base, { expectedEpoch: 'epoch-1', storage }), false);
  assert.equal(clearStaleSavedSetlists('epoch-1', storage), false);
  assert.equal(clearStaleSavedSetlists('epoch-2', storage), true);
  assert.equal(storage.getItem(SAVED_SETLISTS_STORAGE_KEY), null);

  // Post-reset save under epoch-2 is kept intact.
  const fresh = createInitialSavedSetlistsState(
    'リセット後セトリ',
    [{ songId: 'subtitle', isEncore: false }],
    VALID_IDS,
    '2026-11-15T11:00:00.000Z',
  );
  assert.equal(persistSavedSetlists(fresh, { expectedEpoch: 'epoch-2', storage }), true);
  assert.equal(clearStaleSavedSetlists('epoch-2', storage), false);
  assert.equal(readStoredSavedSetlists(VALID_IDS, { storage })?.items[0].title, 'リセット後セトリ');
});

test('concurrent tab persist merges unknown setlists without resurrecting deleted ones', () => {
  const storage = memoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-1' }),
  });
  const initial = createInitialSavedSetlistsState(
    '本編メイン',
    [{ songId: 'pretender', isEncore: false }],
    VALID_IDS,
    '2026-11-15T10:00:00.000Z',
  );

  // Tab A creates a second setlist and writes it to storage.
  const tabA = createNewSavedSetlist(
    initial,
    'Tab A 新規セトリ',
    [{ songId: 'cry-baby', isEncore: false }],
    '2026-11-15T10:05:00.000Z',
  ).state;
  assert.equal(persistSavedSetlists(tabA, { expectedEpoch: 'epoch-1', validSongIds: VALID_IDS, storage }), true);

  // Tab B edits initial setlist without knowing Tab A's new list -> merge keeps both.
  const tabBEdited = syncActiveSavedSetlist(
    initial,
    'Tab B 更新タイトル',
    [{ songId: 'subtitle', isEncore: false }],
    '2026-11-15T10:06:00.000Z',
  );
  assert.equal(
    persistSavedSetlists(tabBEdited, {
      expectedEpoch: 'epoch-1',
      validSongIds: VALID_IDS,
      storage,
    }),
    true,
  );
  const loaded = readStoredSavedSetlists(VALID_IDS, { storage });
  assert.equal(loaded?.items.length, 2);
  assert.equal(loaded?.items.find((i) => i.id === 'setlist-1')?.title, 'Tab B 更新タイトル');
  assert.equal(loaded?.items.find((i) => i.id === tabA.activeId)?.title, 'Tab A 新規セトリ');

  // Explicit deletion records deletedIds so persist does not resurrect the deleted list.
  const deleted = deleteSavedSetlist(loaded!, tabA.activeId);
  assert.equal(
    persistSavedSetlists(deleted.state, {
      expectedEpoch: 'epoch-1',
      validSongIds: VALID_IDS,
      deletedIds: new Set([tabA.activeId]),
      storage,
    }),
    true,
  );
  const afterDelete = readStoredSavedSetlists(VALID_IDS, { storage });
  assert.equal(afterDelete?.items.length, 1);
  assert.equal(afterDelete?.items[0].id, 'setlist-1');
});

test('quick-add session draft id round-trips, clears, and rejects mismatched resetEpoch', () => {
  const storage = memoryStore();
  assert.equal(readQuickAddSetlistId('epoch-1', storage), null);

  writeQuickAddSetlistId('setlist-2', 'epoch-1', storage);
  assert.equal(readQuickAddSetlistId('epoch-1', storage), 'setlist-2');
  assert.equal(readQuickAddSetlistId('epoch-2', storage), null);

  writeQuickAddSetlistId(null, 'epoch-1', storage);
  assert.equal(readQuickAddSetlistId('epoch-1', storage), null);
});
