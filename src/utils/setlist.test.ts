import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeSetlistOrder, reorderSetlistEntries } from './setlist';

test('reorderSetlistEntries moves tracks forward, backward, and across sections safely', () => {
  const base = normalizeSetlistOrder([
    { songId: 'pretender', isEncore: false },
    { songId: 'subtitle', isEncore: false },
    { songId: 'cry-baby', isEncore: false },
    { songId: 'stand-by-you', isEncore: true },
  ]);

  assert.deepEqual(
    reorderSetlistEntries(base, 0, 2).map((e) => `${e.songId}:${e.isEncore ? 1 : 0}`),
    ['subtitle:0', 'cry-baby:0', 'pretender:0', 'stand-by-you:1'],
  );

  assert.deepEqual(
    reorderSetlistEntries(base, 2, 0).map((e) => `${e.songId}:${e.isEncore ? 1 : 0}`),
    ['cry-baby:0', 'pretender:0', 'subtitle:0', 'stand-by-you:1'],
  );

  assert.deepEqual(
    reorderSetlistEntries(base, 0, 3).map((e) => `${e.songId}:${e.isEncore ? 1 : 0}`),
    ['subtitle:0', 'cry-baby:0', 'stand-by-you:1', 'pretender:1'],
  );

  assert.deepEqual(reorderSetlistEntries(base, -1, 2), base);
  assert.deepEqual(reorderSetlistEntries(base, 1, 99), base);
  assert.deepEqual(reorderSetlistEntries(base, 1, 1), base);
});
