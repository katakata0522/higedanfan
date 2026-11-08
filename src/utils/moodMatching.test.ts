import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { formatDiagnosisShareText, matchesLength, scoreSongsByMood, type MoodCriteria } from './moodMatching';

const originalCriteria: MoodCriteria = {
  mood: 'push_back', situation: 'morning_commute', sound: 'piano_pop',
};

test('length buckets respect exact minute boundaries and ignore missing durations', () => {
  assert.equal(matchesLength(239, 'under4'), true);
  assert.equal(matchesLength(240, 'under4'), false);
  assert.equal(matchesLength(240, 'fourToFive'), true);
  assert.equal(matchesLength(299, 'fourToFive'), true);
  assert.equal(matchesLength(300, 'fourToFive'), false);
  assert.equal(matchesLength(300, 'fivePlus'), true);
  assert.equal(matchesLength(NaN, 'any'), false);
  assert.equal(matchesLength(0, 'under4'), false);
});

test('era and duration really affect the ordering, including when the old score is capped at 99', () => {
  const base = {
    ...HIGEDAN_SONGS[0], moods: ['push_back'] as typeof HIGEDAN_SONGS[number]['moods'],
    situations: ['morning_commute'] as typeof HIGEDAN_SONGS[number]['situations'],
    sound: 'piano_pop' as const,
  };
  const songs = [
    { ...base, id: 'early', title: 'early', guideOrder: 1, era: 'traveler' as const, durationSec: 220 },
    { ...base, id: 'later', title: 'later', guideOrder: 2, era: 'rejoice' as const, durationSec: 310 },
  ];
  assert.equal(scoreSongsByMood(songs, originalCriteria)[0].song.id, 'early');
  assert.equal(scoreSongsByMood(songs, { ...originalCriteria, era: 'any', length: 'any' })[0].song.id, 'early');
  const eraResult = scoreSongsByMood(songs, { ...originalCriteria, era: 'rejoice' });
  assert.equal(eraResult[0].song.id, 'later');
  assert.ok(eraResult[0].matchReasons.some(reason => reason.includes('時期')));
  const lengthResult = scoreSongsByMood(songs, { ...originalCriteria, length: 'fivePlus' });
  assert.equal(lengthResult[0].song.id, 'later');
  assert.ok(lengthResult[0].matchReasons.some(reason => reason.includes('長さ')));
  assert.equal(lengthResult[0].matchScore, 99);
});

test('the added preferences produce different recommendations in the real catalog', () => {
  const traveler = scoreSongsByMood(HIGEDAN_SONGS, { ...originalCriteria, era: 'traveler' })[0];
  const rejoice = scoreSongsByMood(HIGEDAN_SONGS, { ...originalCriteria, era: 'rejoice' })[0];
  assert.notEqual(traveler.song.id, rejoice.song.id);
  assert.equal(traveler.song.era, 'traveler');
  assert.equal(rejoice.song.era, 'rejoice');
  const short = scoreSongsByMood(HIGEDAN_SONGS, { ...originalCriteria, length: 'under4' })[0];
  const long = scoreSongsByMood(HIGEDAN_SONGS, { ...originalCriteria, length: 'fivePlus' })[0];
  assert.notEqual(short.song.id, long.song.id);
  assert.ok(short.song.durationSec < 240);
  assert.ok(long.song.durationSec >= 300);
});

test('a nonmatching condition is never presented as a match and legacy sharing stays supported', () => {
  const song = {
    ...HIGEDAN_SONGS[0], moods: [] as typeof HIGEDAN_SONGS[number]['moods'],
    situations: [] as typeof HIGEDAN_SONGS[number]['situations'],
    sound: 'stadium_rock' as const, era: 'traveler' as const, durationSec: 200,
  };
  const criteria: MoodCriteria = { ...originalCriteria, era: 'rejoice', length: 'fivePlus' };
  const match = scoreSongsByMood([song], criteria)[0];
  assert.deepEqual(match.matchReasons, []);
  assert.ok(match.moodMatchExplanation.includes('一致する項目はありません'));
  assert.ok(!match.moodMatchExplanation.includes('時期「'));
  const text = formatDiagnosisShareText(match, criteria);
  assert.ok(text.includes('Rejoice期'));
  assert.ok(text.includes('５分以上'));
  assert.ok(formatDiagnosisShareText(match, originalCriteria).includes('マイソング診断'));
});
