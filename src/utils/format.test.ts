import assert from 'node:assert/strict';
import test from 'node:test';
import { formatSongBpm } from './format';

test('BPMの表示は整数にそろえ、調査中の曲には数値を出さない', () => {
  assert.equal(formatSongBpm('sweet-tweet', 133.5), '約134');
  assert.equal(formatSongBpm('trailer-song', 79.8), '約80');
  assert.equal(formatSongBpm('same-blue', 184), '調査中');
});
