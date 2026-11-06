import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { songReadings } from '../data/songReadings';
import { filterAndSortDiscography, type DiscographyFilter } from './discography';
import { matchesTieUp } from './songSearch';

function search(searchQuery: string, filters: Partial<DiscographyFilter> = {}) {
  return filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all', sound: 'all', sortBy: 'guide_order', searchQuery, ...filters,
  });
}

test('phone keyboard variants and known title readings find their song first', () => {
  for (const [query, title] of [
    ['sameblue', 'Same Blue'],
    ['Ｓａｍｅ　Ｂｌｕｅ', 'Same Blue'],
    ['みっくすなっつ', 'ミックスナッツ'],
    ['ﾐｯｸｽﾅｯﾂ', 'ミックスナッツ'],
    ['しゅくめい', '宿命'],
    ['ぷりてんだー', 'Pretender'],
    ['b side blues', 'B-Side Blues'],
  ]) {
    assert.equal(search(query)[0]?.title, title, query);
  }
});

test('every guide entry is discoverable by its verified reading', () => {
  for (const song of HIGEDAN_SONGS) {
    const reading = songReadings[song.id];
    assert.ok(reading, song.title);
    assert.ok(search(reading).some(result => result.id === song.id), song.title);
  }
});

test('an exact song title beats album and EP mentions in the guide order only', () => {
  for (const title of ['HELLO', 'Editorial']) {
    const matches = search(title);
    assert.ok(matches.length > 1, title);
    assert.equal(matches[0].title, title);
  }

  const oldest = search('Editorial', { sortBy: 'release_oldest' });
  assert.notEqual(oldest[0].title, 'Editorial');
  assert.deepEqual(oldest.map(s => s.releaseDate), oldest.map(s => s.releaseDate).sort());
});

test('all terms must match, including terms spread across different fields', () => {
  assert.deepEqual(search('Rejoice 日常').map(s => s.title), ['日常']);
  assert.deepEqual(search('日常 Rejoice').map(s => s.title), ['日常']);
  assert.deepEqual(search('silent 主題歌').map(s => s.title), ['Subtitle']);
  assert.deepEqual(search('spy family').map(s => s.title).sort(), ['SOULSOUP', 'ミックスナッツ'].sort());
  assert.deepEqual(search('Rejoice 架空の曲XYZ'), []);
});

test('album filters remain active even if the same title matches elsewhere', () => {
  assert.deepEqual(search('Pretender', { album: 'Rejoice' }), []);
  assert.equal(search('Pretender', { album: 'Traveler' })[0]?.title, 'Pretender');
});

test('tie-up hints reflect the keywords that matched the actual work', () => {
  const song = HIGEDAN_SONGS.find(s => s.id === 'mixed-nuts')!;
  assert.equal(matchesTieUp('spy family', song), true);
  assert.equal(matchesTieUp('ミックスナッツ', song), false);
  assert.equal(matchesTieUp('', song), false);
});

test('a sharp sign still distinguishes vocal-range searches', () => {
  const sharp = search('hiD#').map(s => s.title);
  assert.ok(sharp.includes('アポトーシス'));
  assert.ok(!sharp.includes('ミックスナッツ'));
  assert.ok(search('hiD').some(s => s.title === 'ミックスナッツ'));
});
