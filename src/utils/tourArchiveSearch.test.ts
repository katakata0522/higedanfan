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
  const budokanMatches = search('武道館').flatMap(result => result.events);
  // 7 concerts held at 日本武道館 plus 2 events mentioning 武道館 in episode notes
  assert.equal(budokanMatches.filter(event => event.venue.includes('武道館')).length, 7);
  assert.equal(budokanMatches.length, 9);
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
  const hotabanMatches = search('ホタルライト');
  assert.equal(hotabanMatches[0]?.tour.id, 'live-hotaban-2016');
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

test('tour search indexes setlist episode notes and co-artist tracks', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  const byEpisodeNote = search('360度ステージ');
  assert.ok(byEpisodeNote.some(r => r.events.some(e => e.id === 'live-2024-uverworld-vs-budokan')));

  const byCoArtistTrack = search('ナノ・セカンド');
  const budokanMatch = byCoArtistTrack.find(r => r.events.some(e => e.id === 'live-2024-uverworld-vs-budokan'));
  assert.ok(budokanMatch);
  assert.deepEqual(budokanMatch.matchedSongsByEventId.get('live-2024-uverworld-vs-budokan'), ['ナノ・セカンド（UVERworld）']);

  const byTrackNote = search('弾き語りワンコーラス');
  const osakaMatch = byTrackNote.find(r => r.events.some(e => e.id === 'live-2020-music-freaks-osaka'));
  assert.ok(osakaMatch);
  assert.ok(osakaMatch.matchedSongsByEventId.get('live-2020-music-freaks-osaka')?.includes('ビンテージ（sumika）'));
});
