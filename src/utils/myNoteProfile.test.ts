import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEY } from '../hooks/fanRecordStorage';
import {
  clearMyNoteProfileStorage,
  clearSetlistShareImageGeneratedStorage,
  clearStaleMyNoteProfile,
  displayMyNoteNickname,
  hasCustomMyNoteNickname,
  loadMyNoteProfile,
  loadMyNoteTitleMode,
  loadSetlistShareImageGenerated,
  MY_NOTE_PROFILE_STORAGE_KEY,
  MY_NOTE_SETLIST_IMAGE_STORAGE_KEY,
  MY_NOTE_TITLE_MODE_STORAGE_KEY,
  persistMyNoteProfile,
  persistMyNoteTitleMode,
  recordMyNoteFeatureVisited,
  recordMyNoteMoodCompleted,
  recordMyNoteSongRead,
  recordSetlistShareImageGenerated,
  sanitizeMyNoteNickname,
} from './myNoteProfile';

function createMemoryStore(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

test('sanitizeMyNoteNickname strips unsafe markup, control characters, and BiDi overrides', () => {
  assert.equal(sanitizeMyNoteNickname('  <script>ヒゲ</script>ダン\u202E '), 'ヒゲダン');
  assert.equal(sanitizeMyNoteNickname('ゲスト'), '');
  assert.equal(sanitizeMyNoteNickname('あ'.repeat(30)).length, 20);
});

test('myNoteProfile persists and isolates records by resetEpoch', () => {
  const store = createMemoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-2', setlist: [] }),
  });

  assert.equal(loadMyNoteProfile('epoch-2', store).opened, false);
  assert.equal(displayMyNoteNickname(loadMyNoteProfile('epoch-2', store)), 'ゲスト');

  persistMyNoteProfile({ nickname: 'ともき', opened: true }, 'epoch-2', store);
  const loaded = loadMyNoteProfile('epoch-2', store);
  assert.equal(loaded.opened, true);
  assert.equal(loaded.nickname, 'ともき');
  assert.equal(hasCustomMyNoteNickname(loaded), true);
  assert.equal(displayMyNoteNickname(loaded), 'ともき');

  // Epoch mismatch hides stale profile and allows clearing
  store.setItem(MY_NOTE_PROFILE_STORAGE_KEY, JSON.stringify({ resetEpoch: 'epoch-1', nickname: 'old', opened: true }));
  assert.equal(loadMyNoteProfile('epoch-2', store).nickname, '');
  assert.equal(clearStaleMyNoteProfile('epoch-2', store), true);
  assert.equal(store.getItem(MY_NOTE_PROFILE_STORAGE_KEY), null);

  persistMyNoteProfile({ nickname: 'テスト', opened: true }, 'epoch-2', store);
  assert.equal(clearMyNoteProfileStorage(store), true);
  assert.equal(loadMyNoteProfile('epoch-2', store).opened, false);
});

test('exploration tracking accumulates read songs, mood completions, and feature flags without losing them on nickname update', () => {
  const store = createMemoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-3', setlist: [] }),
  });

  recordMyNoteSongRead('pretender', 'epoch-3', store);
  recordMyNoteSongRead('subtitle', 'epoch-3', store);
  recordMyNoteSongRead('pretender', 'epoch-3', store); // duplicate ignored
  recordMyNoteSongRead('<bad id>!!', 'epoch-3', store);

  recordMyNoteMoodCompleted('push_back', 'epoch-3', store);
  recordMyNoteMoodCompleted('deep_lyric', 'epoch-3', store);
  recordMyNoteMoodCompleted('push_back', 'epoch-3', store);
  recordMyNoteMoodCompleted('invalid_mood', 'epoch-3', store);

  recordMyNoteFeatureVisited('vocal_range', 'epoch-3', store);
  recordMyNoteFeatureVisited('quiz_archive', 'epoch-3', store);
  recordMyNoteFeatureVisited('backup_export', 'epoch-3', store);

  // Updating only nickname & opened preserves all exploration fields
  persistMyNoteProfile({ nickname: 'ヒゲ巡礼者', opened: true }, 'epoch-3', store);

  const reloaded = loadMyNoteProfile('epoch-3', store);
  assert.deepEqual(reloaded.readSongIds, ['pretender', 'subtitle', 'badid']);
  assert.deepEqual(reloaded.completedMoods, ['push_back', 'deep_lyric']);
  assert.equal(reloaded.moodCompletedCount, 4);
  assert.equal(reloaded.visitedVocalRange, true);
  assert.equal(reloaded.visitedReferenceArchive, true);
  assert.equal(reloaded.exportedBackup, true);
  assert.equal(reloaded.nickname, 'ヒゲ巡礼者');
  assert.equal(reloaded.opened, true);
});

test('myNote title display mode persists per epoch and clears safely', () => {
  const store = createMemoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-4', setlist: [] }),
  });

  assert.equal(loadMyNoteTitleMode('epoch-4', store), 'rank');
  assert.equal(persistMyNoteTitleMode('playstyle', 'epoch-4', store), true);
  assert.equal(loadMyNoteTitleMode('epoch-4', store), 'playstyle');

  // Stale epoch is ignored and cleaned up cleanly
  store.setItem(MY_NOTE_TITLE_MODE_STORAGE_KEY, JSON.stringify({ resetEpoch: 'epoch-old', mode: 'playstyle' }));
  assert.equal(loadMyNoteTitleMode('epoch-4', store), 'rank');
  assert.equal(clearStaleMyNoteProfile('epoch-4', store), true);
  assert.equal(store.getItem(MY_NOTE_TITLE_MODE_STORAGE_KEY), null);

  // Invalid mode falls back safely to 'rank'
  store.setItem(MY_NOTE_TITLE_MODE_STORAGE_KEY, JSON.stringify({ resetEpoch: 'epoch-4', mode: 'unknown' }));
  assert.equal(loadMyNoteTitleMode('epoch-4', store), 'rank');

  persistMyNoteTitleMode('playstyle', 'epoch-4', store);
  assert.equal(clearMyNoteProfileStorage(store), true);
  assert.equal(loadMyNoteTitleMode('epoch-4', store), 'rank');
});

test('setlist share image generation flag persists per epoch and clears safely', () => {
  const store = createMemoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-5', setlist: [] }),
  });

  assert.equal(loadSetlistShareImageGenerated('epoch-5', store), false);
  assert.equal(recordSetlistShareImageGenerated('epoch-5', store), true);
  assert.equal(loadSetlistShareImageGenerated('epoch-5', store), true);

  // Stale epoch is ignored and cleaned up by clearStaleMyNoteProfile
  store.setItem(
    MY_NOTE_SETLIST_IMAGE_STORAGE_KEY,
    JSON.stringify({ resetEpoch: 'epoch-old', generated: true }),
  );
  assert.equal(loadSetlistShareImageGenerated('epoch-5', store), false);
  assert.equal(clearStaleMyNoteProfile('epoch-5', store), true);
  assert.equal(store.getItem(MY_NOTE_SETLIST_IMAGE_STORAGE_KEY), null);

  recordSetlistShareImageGenerated('epoch-5', store);
  assert.equal(clearSetlistShareImageGeneratedStorage(store), true);
  assert.equal(loadSetlistShareImageGenerated('epoch-5', store), false);

  recordSetlistShareImageGenerated('epoch-5', store);
  assert.equal(clearMyNoteProfileStorage(store), true);
  assert.equal(loadSetlistShareImageGenerated('epoch-5', store), false);
});
