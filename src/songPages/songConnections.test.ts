import assert from 'node:assert/strict';
import { test } from 'node:test';
import { catalogEntries } from '../data/catalogEntries';
import { officialVideos, relatedSongs } from './songConnections';

test('every song leads to other published songs without linking to itself', () => {
  const ids = new Set(catalogEntries.map(song => song.id));
  for (const song of catalogEntries) {
    const related = relatedSongs(song.id);
    assert.ok(related.length >= 1, song.title);
    assert.equal(new Set(related.map(item => item.id)).size, related.length);
    for (const item of related) {
      assert.ok(ids.has(item.id as (typeof catalogEntries)[number]['id']), song.title);
      assert.notEqual(item.id, song.id);
      assert.ok(item.reason);
    }
  }
});

test('editorial connections explain the particular relationship', () => {
  assert.match(relatedSongs('pretender')[0].reason, /コンフィデンスマンJP/);
  assert.equal(relatedSongs('pretender')[0].id, 'no-doubt');
  assert.equal(relatedSongs('coffee-to-syrup')[0].id, 'second-line');
  assert.ok(relatedSongs('same-blue').every(item => !item.reason.includes('同じ作品')));
  assert.equal(new URL(officialVideos.subtitle).hostname, 'www.youtube.com');
});
