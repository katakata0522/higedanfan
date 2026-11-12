import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { songReadings } from '../data/songReadings';
import { songLatinReadings } from '../data/songLatinReadings';
import { songTitleAliases } from '../data/songLatinReadings';
import { filterAndSortDiscography, type DiscographyFilter } from './discography';
import { matchedSongContexts } from './songSearch';

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

test('全90曲をひらがな・カタカナ・英字の検索語で見つけられる', () => {
  assert.equal(HIGEDAN_SONGS.length, 90);
  assert.deepEqual(Object.keys(songLatinReadings).sort(), HIGEDAN_SONGS.map(song => song.id).sort());
  for (const song of HIGEDAN_SONGS) {
    const reading = songReadings[song.id];
    assert.ok(reading, song.title);
    const katakana = reading.replace(/[ぁ-ゖ]/g, kana => String.fromCharCode(kana.charCodeAt(0) + 0x60));
    const latin = songLatinReadings[song.id];
    assert.match(latin, /^[\x20-\x7e]+$/, song.title);
    for (const query of [reading, katakana, latin, ...(songTitleAliases[song.id] ?? [])]) {
      assert.ok(search(query).some(result => result.id === song.id), `${song.title}: ${query}`);
    }
  }
});

test('カタカナ原題を英語の綴りや数字を使った表記でも探せる', () => {
  for (const [query, id] of [
    ['No Doubt', 'no-doubt'], ['Yesterday', 'yesterday-song'],
    ['Mixed Nuts', 'mixed-nuts'], ['White Noise', 'white-noise'],
    ['115man kilo no film', '115man-kilo'], ['Stardust', 'stardust'],
  ]) assert.equal(search(query)[0]?.id, id, query);
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
  assert.ok(matchedSongContexts('spy family', song).some(item => item.label === 'タイアップ'));
  assert.deepEqual(matchedSongContexts('ミックスナッツ', song), []);
  assert.deepEqual(matchedSongContexts('', song), []);
});

test('EP searches use the same recordings and track order as the release selector', () => {
  for (const album of ["What's Going On? EP", 'HELLO EP', 'ミックスナッツ EP', 'Stand By You EP', 'Rejoice']) {
    assert.deepEqual(search(album).map(s => s.id), search('', { album, sortBy: 'album_track_order' }).map(s => s.id));
  }
  assert.deepEqual(search('みっくすなっつＥＰ').map(s => s.title), ['ミックスナッツ', 'Choral A', '破顔']);
  assert.deepEqual(search('ミックスナッツ EP Anarchy'), []);
  assert.deepEqual(search('HELLO EP 夏模様').map(s => s.title), ['夏模様の猫']);
});

test('production credits, album notes, and sourced tie-ups remain distinct', () => {
  const byWriter = search('小笹大輔');
  assert.deepEqual(byWriter.map(s => s.title).sort(), ['Bedroom Talk', 'Rowan']);
  for (const song of byWriter) {
    const [match] = matchedSongContexts('小笹大輔', song);
    assert.equal(match.label, '作詞・作曲');
    assert.equal(match.text, '小笹大輔');
    assert.ok(match.source?.includes('ponycanyon.co.jp/interview/'));
  }
  const ending = search('最終曲').find(s => s.title === 'Travelers');
  assert.ok(ending);
  assert.deepEqual(matchedSongContexts('最終曲', ending), [{ label: '収録メモ', text: '最終曲' }]);
  assert.deepEqual(search('出雲駅伝').map(s => s.title), ['フィラメント']);
  assert.deepEqual(search('FMV'), []);
  assert.deepEqual(search('SUUMO').map(s => s.title), ['115万キロのフィルム']);
  for (const song of HIGEDAN_SONGS) {
    for (const item of song.tieUps) assert.equal(new URL(item.source).protocol, 'https:');
  }
});

test('音域値はキーワード検索の対象に含めない', () => {
  assert.deepEqual(search('hiD#'), []);
  assert.deepEqual(search('hiD'), []);
  assert.deepEqual(search('mid1C'), []);
});
