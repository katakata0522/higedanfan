import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { pitchNumber, songEvidence } from '../data/fullCatalogSongs';
import { isTempoUnderReview } from '../data/tempoReviewStatus';
import { filterAndSortDiscography } from './discography';
import { sortSongTable } from './songTableSort';

test('最低音・地声最高音・裏声最高音を文字順ではなく音の高さで比較する', () => {
  for (const key of ['low', 'chest', 'falsetto'] as const) {
    for (const direction of ['ascending', 'descending'] as const) {
      const sorted = sortSongTable(HIGEDAN_SONGS, { key, direction });
      const notes = sorted.map(song => songEvidence[song.id as keyof typeof songEvidence][key]);
      const pitches = notes.filter((note): note is string => Boolean(note)).map(pitchNumber);
      assert.deepEqual(pitches, [...pitches].sort((a, b) => direction === 'ascending' ? a - b : b - a));
      const firstMissing = notes.indexOf(null);
      if (firstMissing !== -1) assert.ok(notes.slice(firstMissing).every(note => note === null));
    }
  }
});

test('絞った全件を並べ替えてから18曲に区切り、元の配列を変更しない', () => {
  const matching = filterAndSortDiscography(HIGEDAN_SONGS, { era: 'all', album: 'Rejoice', sound: 'all', searchQuery: '' });
  const original = [...matching];
  const sorted = sortSongTable(matching, { key: 'chest', direction: 'descending' });
  assert.deepEqual(matching, original);
  assert.deepEqual(new Set(sorted.map(song => song.id)), new Set(matching.map(song => song.id)));
  const all = sortSongTable(HIGEDAN_SONGS, { key: 'chest', direction: 'descending' });
  assert.equal(all.length, 90);
  assert.equal(all.slice(0, 18)[0].vocalRange.chestSemitoneScore, Math.max(...HIGEDAN_SONGS.map(song => song.vocalRange.chestSemitoneScore)));
});

test('調査中のBPM・未掲載のCD日付は昇降どちらも最後に置く', () => {
  for (const direction of ['ascending', 'descending'] as const) {
    const tempos = sortSongTable(HIGEDAN_SONGS, { key: 'bpm', direction }).map(song => isTempoUnderReview(song.id));
    const firstUnknown = tempos.indexOf(true);
    assert.ok(firstUnknown >= 0);
    assert.ok(tempos.slice(firstUnknown).every(Boolean));
    const cds = sortSongTable(HIGEDAN_SONGS, { key: 'cd', direction }).map(song => songEvidence[song.id as keyof typeof songEvidence].cd);
    const firstMissing = cds.indexOf(null);
    assert.ok(firstMissing >= 0);
    assert.ok(cds.slice(firstMissing).every(value => value === null));
    const dates = sortSongTable(HIGEDAN_SONGS, { key: 'release', direction }).map(song => song.releaseDate);
    assert.deepEqual(dates, [...dates].sort((a, b) => direction === 'ascending' ? a.localeCompare(b) : b.localeCompare(a)));
  }
});
