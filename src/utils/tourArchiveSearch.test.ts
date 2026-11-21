import test from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_ARCHIVES } from '../data/higedanData';
import { createTourArchiveSearch } from './tourArchiveSearch';

test('tour search accepts the displayed date and common date formats', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  for (const query of ['2023-02-15', '2023.02.15', '2023/02/15', '２０２３．０２．１５']) {
    const events = search(query).flatMap(result => result.events);
    assert.deepEqual(events.map(event => `${event.date} ${event.venue}`), ['2023-02-15 日本武道館']);
  }
});

test('tour search preserves title, venue, empty and no-match searches', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  assert.equal(search('  shocking nuts  ')[0]?.events.length, 21);
  assert.equal(search('武道館').flatMap(result => result.events).length, 7);
  assert.equal(search('').length, TOUR_ARCHIVES.length);
  assert.deepEqual(search('該当しない会場名'), []);
});

test('tour search finds two-man concerts by co-starring artist name', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  const sumikaMatches = search('sumika');
  assert.deepEqual(
    sumikaMatches.map(r => r.tour.id).sort(),
    ['live-music-freaks-2020', 'live-sumika-tooy-2022'],
  );
  const uverMatches = search('UVERworld');
  assert.equal(uverMatches[0]?.tour.id, 'live-uverworld-vs-2024');
});

test('tour search finds concerts by performed song title and kana reading', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  const byTitle = search('エルダーフラワー');
  assert.ok(byTitle.some(r => r.events.some(e => e.id === 'live-2026-one-man-fukuoka-1')));
  const byHiragana = search('えるだーふらわー');
  const fukuokaMatch = byHiragana.find(r => r.events.some(e => e.id === 'live-2026-one-man-fukuoka-1'));
  assert.ok(fukuokaMatch);
  assert.deepEqual(fukuokaMatch.matchedSongsByEventId.get('live-2026-one-man-fukuoka-1'), ['エルダーフラワー']);
});
