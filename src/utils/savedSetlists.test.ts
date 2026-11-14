import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_SAVED_SETLISTS,
  createInitialSavedSetlistsState,
  createNewSavedSetlist,
  deleteSavedSetlist,
  sanitizeSavedSetlistsState,
  switchSavedSetlist,
  syncActiveSavedSetlist,
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
