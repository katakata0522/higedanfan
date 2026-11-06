import assert from 'node:assert/strict';
import test from 'node:test';
import { restoreFanRecords } from './fanRecordStorage';

test('unreadable v1 roots fail restoration so the app can preserve the original save', () => {
  for (const raw of ['null', 'true', '42', '"personal notes"', '[]', '[{"id":"pretender"}]', '{"backup":"keep"}', '{']) {
    assert.throws(() => restoreFanRecords(raw), raw);
  }
});

test('a partial v1 object still restores its available records and ignores sample votes', () => {
  const restored = restoreFanRecords(JSON.stringify({
    setlist: [{ songId: 'pretender', isEncore: true }],
    votedKeys: ['pretender:lyric'],
    songs: [{ id: 'pretender', votes: { overall: 450 } }],
  }));

  assert.deepEqual(restored.setlist, [{ songId: 'pretender', isEncore: true }]);
  assert.deepEqual(restored.songs.find(song => song.id === 'pretender')?.votes, {
    overall: 0, lyric: 1, live: 0, hiddenGem: 0,
  });
  assert.equal(restored.bestQuizScore, undefined);
  assert.equal(restoreFanRecords('{}').setlistTitle, undefined);
});
