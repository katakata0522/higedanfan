import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEY } from '../../hooks/fanRecordStorage';
import type { QuizSessionStore } from './quizSessionClear';
import {
  QUIZ_VOLUME_SCORES_STORAGE_KEY,
  clearQuizVolumeScoresStorage,
  clearStaleQuizVolumeScores,
  loadQuizVolumeScores,
  quizVolumeKey,
  saveQuizVolumeScore,
} from './quizVolumeRecords';

function createMemoryStore(initial: Record<string, string> = {}): QuizSessionStore {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
    removeItem(key: string) {
      data.delete(key);
    },
  };
}

test('round-trips volume scores and keeps the best score per volume', () => {
  const store = createMemoryStore();
  const afterFirst = saveQuizVolumeScore('beginner', 'vol1', 7, 10, 70, 'epoch-1', store);
  assert.deepEqual(afterFirst['beginner:vol1'], { score: 7, total: 10, percentage: 70 });

  const afterLower = saveQuizVolumeScore('beginner', 'vol1', 5, 10, 50, 'epoch-1', store);
  assert.deepEqual(afterLower['beginner:vol1'], { score: 7, total: 10, percentage: 70 });

  const afterHigher = saveQuizVolumeScore('beginner', 'vol1', 9, 10, 90, 'epoch-1', store);
  assert.deepEqual(afterHigher['beginner:vol1'], { score: 9, total: 10, percentage: 90 });

  const reloaded = loadQuizVolumeScores('epoch-1', store);
  assert.deepEqual(reloaded['beginner:vol1'], { score: 9, total: 10, percentage: 90 });
});

test('ignores invalid keys, prototype pollution attempts, and out-of-range values', () => {
  const poisoned = JSON.stringify({
    resetEpoch: 'epoch-1',
    records: {
      __proto__: { score: 10, total: 10, percentage: 100 },
      constructor: { score: 10, total: 10, percentage: 100 },
      'beginner:full': { score: 10, total: 10, percentage: 100 },
      'beginner:vol1': { score: 11, total: 10, percentage: 100 },
      'intermediate:vol2': { score: 8, total: 10, percentage: 80 },
    },
  });
  const store = createMemoryStore({ [QUIZ_VOLUME_SCORES_STORAGE_KEY]: poisoned });
  const loaded = loadQuizVolumeScores('epoch-1', store);
  assert.equal(Object.getPrototypeOf(loaded), null);
  assert.equal(loaded['beginner:full'], undefined);
  assert.equal(loaded['beginner:vol1'], undefined);
  assert.deepEqual(loaded['intermediate:vol2'], { score: 8, total: 10, percentage: 80 });
  assert.equal(quizVolumeKey('brothers', 'vol2'), 'brothers:vol2');
});

test('rejects mismatched resetEpoch and clears only stale records after reset', () => {
  const store = createMemoryStore({
    [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'epoch-new' }),
  });
  saveQuizVolumeScore('all', 'vol3', 8, 10, 80, 'epoch-old', store);

  assert.equal(loadQuizVolumeScores('epoch-new', store)['all:vol3'], undefined);
  assert.equal(clearStaleQuizVolumeScores('epoch-wrong', store, store), false);
  assert.equal(clearStaleQuizVolumeScores('epoch-new', store, store), true);
  assert.equal(store.getItem(QUIZ_VOLUME_SCORES_STORAGE_KEY), null);

  saveQuizVolumeScore('all', 'vol3', 10, 10, 100, 'epoch-new', store);
  assert.equal(clearStaleQuizVolumeScores('epoch-new', store, store), false);
  assert.deepEqual(loadQuizVolumeScores('epoch-new', store)['all:vol3'], {
    score: 10,
    total: 10,
    percentage: 100,
  });

  clearQuizVolumeScoresStorage(store);
  assert.equal(store.getItem(QUIZ_VOLUME_SCORES_STORAGE_KEY), null);
});
