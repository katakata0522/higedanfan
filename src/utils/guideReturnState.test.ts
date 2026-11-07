import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_GUIDE_FILTERS } from '../components/SongGuideFilters';
import { guideReturnView, saveGuideReturnState, takeGuideReturnState } from './guideReturnState';

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
    filters: { ...DEFAULT_GUIDE_FILTERS, era: 'traveler' as const, searchQuery: 'ぷりてんだー' },
    visibleCount: 42,
    view: 'vocal_range' as const,
  };
  saveGuideReturnState(state, store);
  assert.equal(guideReturnView(store), 'vocal_range');
  assert.deepEqual(takeGuideReturnState(90, store), state);
  assert.equal(takeGuideReturnState(90, store), null);
  assert.equal(guideReturnView(store), 'discography');
});

test('古い件数や不正な検索条件を復元しない', () => {
  const store = memoryStore();
  saveGuideReturnState({ filters: DEFAULT_GUIDE_FILTERS, visibleCount: 91, view: 'discography' }, store);
  assert.equal(takeGuideReturnState(90, store), null);
  saveGuideReturnState({ filters: { ...DEFAULT_GUIDE_FILTERS, searchQuery: 'a'.repeat(61) }, visibleCount: 18, view: 'discography' }, store);
  assert.equal(takeGuideReturnState(90, store), null);
});
