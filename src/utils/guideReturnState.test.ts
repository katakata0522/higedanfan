import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_GUIDE_FILTERS } from '../components/SongGuideFilters';
import {
  clearGuideListReturnState,
  clearGuideReturnState,
  clearSongReturnTab,
  guideReturnView,
  readGuideReturnState,
  readMapReturnState,
  saveArchiveReturnState,
  saveGuideReturnState,
  saveMapReturnState,
  saveSongReturnTab,
  saveTourReturnState,
  songReturnDestination,
  takeArchiveReturnState,
  takeGuideReturnState,
  takeMapReturnState,
  takeTourReturnState,
} from './guideReturnState';

function memoryStore() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
}

test('楽曲ページから戻ると検索条件と表示件数を一度だけ復元する', () => {
  const store = memoryStore();
  const state = {
    filters: { ...DEFAULT_GUIDE_FILTERS, era: 'traveler' as const, searchQuery: 'ぷりてんだー', tableSort: { key: 'chest' as const, direction: 'descending' as const } },
    visibleCount: 42,
    view: 'vocal_range' as const,
    voice: { low: '48', high: '72', keyShift: -2 },
  };
  saveGuideReturnState(state, store);
  assert.equal(guideReturnView(store), 'vocal_range');
  assert.deepEqual(takeGuideReturnState(90, store), state);
  assert.equal(takeGuideReturnState(90, store), null);
  assert.equal(guideReturnView(store), 'discography');

  const withOrigin = { ...state, view: 'discography' as const, originSongId: 'pretender', showTieUps: true };
  saveGuideReturnState(withOrigin, store);
  assert.deepEqual(takeGuideReturnState(90, store), withOrigin);

  store.setItem('higedanfan:guide-return:v1', JSON.stringify({ ...withOrigin, originSongId: '../evil' }));
  assert.equal(takeGuideReturnState(90, store), null);
});

test('古い件数や不正な検索条件を復元しない', () => {
  const store = memoryStore();
  saveGuideReturnState({ filters: DEFAULT_GUIDE_FILTERS, visibleCount: 91, view: 'discography' }, store);
  assert.equal(takeGuideReturnState(90, store), null);
  saveGuideReturnState({ filters: { ...DEFAULT_GUIDE_FILTERS, searchQuery: 'a'.repeat(61) }, visibleCount: 18, view: 'discography' }, store);
  assert.equal(takeGuideReturnState(90, store), null);
  saveGuideReturnState({ filters: DEFAULT_GUIDE_FILTERS, visibleCount: 18, view: 'vocal_range', voice: { low: '100', high: '72', keyShift: 0 } }, store);
  assert.equal(takeGuideReturnState(90, store), null);
});

test('保存された表の並べ替えに不正な見出し・方向があれば復元しない', () => {
  for (const tableSort of [{ key: 'no-such-column', direction: 'ascending' }, { key: 'low', direction: 'sideways' }, null]) {
    const store = memoryStore();
    store.setItem('higedanfan:guide-return:v1', JSON.stringify({ filters: { ...DEFAULT_GUIDE_FILTERS, tableSort }, visibleCount: 18, view: 'vocal_range' }));
    assert.equal(takeGuideReturnState(90, store), null);
  }
});

test('楽曲ページの戻り先を直前のコーナーに応じて返し、不正値は無視する', () => {
  const store = memoryStore();
  assert.deepEqual(songReturnDestination(store), { hash: 'discography', label: '楽曲ガイドに戻る' });

  saveSongReturnTab('setlist', store);
  assert.deepEqual(songReturnDestination(store), { hash: 'setlist', label: 'MYセトリ作成に戻る' });

  saveSongReturnTab('mood', store);
  assert.deepEqual(songReturnDestination(store), { hash: 'mood', label: '今日の1曲診断に戻る' });

  saveSongReturnTab('home', store);
  assert.deepEqual(songReturnDestination(store), { hash: 'home', label: 'トップページに戻る' });

  saveSongReturnTab('quiz', store);
  assert.deepEqual(songReturnDestination(store), { hash: 'quiz', label: 'Official髭男dism検定に戻る' });

  saveSongReturnTab('unknown-evil-tab', store);
  assert.deepEqual(songReturnDestination(store), { hash: 'quiz', label: 'Official髭男dism検定に戻る' });

  clearSongReturnTab(store);
  assert.deepEqual(songReturnDestination(store), { hash: 'discography', label: '楽曲ガイドに戻る' });
});

test('clearGuideReturnStateは一覧の絞り込み状態と戻り先タブの両方を消去する', () => {
  const store = memoryStore();
  saveGuideReturnState({
    filters: { ...DEFAULT_GUIDE_FILTERS, searchQuery: 'Pretender' },
    visibleCount: 18,
    view: 'discography',
  }, store);
  assert.equal(guideReturnView(store), 'discography');

  clearGuideReturnState(store);
  assert.equal(takeGuideReturnState(90, store), null);
  assert.deepEqual(songReturnDestination(store), { hash: 'discography', label: '楽曲ガイドに戻る' });
});

test('参考記事一覧の状態は楽曲ページからの戻り時に1度だけ復元され、不正値やresetEpoch不一致は弾く', () => {
  const store = memoryStore();
  const state = {
    publisher: '音楽ナタリー',
    query: 'Pretender',
    order: 'oldest' as const,
    visibleCount: 48,
    resetEpoch: 'epoch-1',
  };
  saveArchiveReturnState(state, store);
  assert.deepEqual(songReturnDestination(store), { hash: 'quiz_archive', label: '参考記事・インタビューに戻る' });

  // Mismatched epoch cannot restore, and consumes cleanly.
  assert.equal(takeArchiveReturnState(120, 'epoch-2', ['音楽ナタリー'], store), null);

  saveArchiveReturnState(state, store);
  assert.deepEqual(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), state);
  assert.equal(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), null);

  // Invalid values rejected
  saveArchiveReturnState({ ...state, visibleCount: 121 }, store);
  assert.equal(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), null);
  saveArchiveReturnState({ ...state, query: 'q'.repeat(61) }, store);
  assert.equal(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), null);
  saveArchiveReturnState({ ...state, publisher: 'Unknown\nEvil' }, store);
  assert.equal(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), null);

  // clearGuideReturnState clears archive state too
  saveArchiveReturnState(state, store);
  clearGuideReturnState(store);
  assert.equal(takeArchiveReturnState(120, 'epoch-1', ['音楽ナタリー'], store), null);
  assert.deepEqual(songReturnDestination(store), { hash: 'discography', label: '楽曲ガイドに戻る' });
});

test('歴代ツアー記録の状態は楽曲ページからの戻り時に1度だけ復元され、不正値やresetEpoch不一致は弾く', () => {
  const store = memoryStore();
  const state = {
    query: '日産スタジアム',
    sortOrder: 'oldest' as const,
    category: 'tour' as const,
    openTourId: 'tour-stadium-2025',
    openEventId: 'live-2025-stadium-kanagawa-1',
    resetEpoch: 'epoch-1',
  };
  saveTourReturnState(state, store);
  assert.deepEqual(songReturnDestination(store), { hash: 'tour_archive', label: '歴代ツアー記録に戻る' });

  assert.equal(takeTourReturnState('epoch-2', store), null);

  saveTourReturnState(state, store);
  assert.deepEqual(takeTourReturnState('epoch-1', store), state);
  assert.equal(takeTourReturnState('epoch-1', store), null);

  saveTourReturnState({ ...state, query: 'q'.repeat(61) }, store);
  assert.equal(takeTourReturnState('epoch-1', store), null);
  saveTourReturnState({ ...state, openEventId: 'bad\nkey' }, store);
  assert.equal(takeTourReturnState('epoch-1', store), null);

  saveTourReturnState(state, store);
  clearGuideReturnState(store);
  assert.equal(takeTourReturnState('epoch-1', store), null);

  const extended = {
    ...state,
    year: '2025',
    attendedOnly: true,
    setlistOnly: true,
    openSetlistTab: 'full' as const,
  };
  saveTourReturnState(extended, store);
  assert.deepEqual(takeTourReturnState('epoch-1', store), extended);

  store.setItem('higedanfan:tour-return:v1', JSON.stringify({ ...extended, year: '2025;alert(1)' }));
  assert.equal(takeTourReturnState('epoch-1', store), null);
  store.setItem('higedanfan:tour-return:v1', JSON.stringify({ ...extended, openSetlistTab: 'invalid' }));
  assert.equal(takeTourReturnState('epoch-1', store), null);
});

test('readGuideReturnStateとreadMapReturnStateは繰り返し読んでも状態を消さず、後続のクリアで削除される', () => {
  const store = memoryStore();
  const guideState = {
    filters: { ...DEFAULT_GUIDE_FILTERS, sortBy: 'highest_note' as const },
    visibleCount: 48,
    view: 'discography' as const,
    originSongId: 'stardust',
  };
  saveGuideReturnState(guideState, store);
  assert.deepEqual(readGuideReturnState(90, store), guideState);
  assert.deepEqual(readGuideReturnState(90, store), guideState);
  assert.deepEqual(songReturnDestination(store), { hash: 'discography', label: '楽曲ガイドに戻る' });

  clearGuideListReturnState(store);
  clearSongReturnTab(store);
  assert.equal(readGuideReturnState(90, store), null);

  const mapState = {
    region: 'kanto' as const,
    category: 'all' as const,
    visitedOnly: false,
    filtersOpen: false,
    mapSpotId: 'spot-1',
    pinnedSpotId: 'spot-1',
    originSpotId: 'spot-1',
  };
  saveMapReturnState(mapState, store);
  assert.deepEqual(readMapReturnState(['spot-1'], store), mapState);
  assert.deepEqual(readMapReturnState(['spot-1'], store), mapState);
  assert.deepEqual(takeMapReturnState(['spot-1'], store), mapState);
  assert.equal(readMapReturnState(['spot-1'], store), null);
});
