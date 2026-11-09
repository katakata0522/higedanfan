import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS } from '../data/higedanData';
import { formatDiagnosisShareText, matchesEra, matchesLength, recommendSongsByMood, scoreSongsByMood, type MoodCriteria } from './moodMatching';

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

test('requested release years and duration are honoured, including Rejoice songs from 2024', () => {
  const sharon = HIGEDAN_SONGS.find(song => song.id === 'sharon');
  const finder = HIGEDAN_SONGS.find(song => song.id === 'finder-song');
  assert.ok(sharon && finder);
  assert.equal(matchesEra(sharon, 'latest_2025_2026'), true);
  assert.equal(matchesEra(finder, 'latest_2025_2026'), true);
  const criteria: MoodCriteria = { mood: 'push_back', situation: 'weekend_walk', sound: 'rhythm', era: 'latest_2025_2026', length: 'fivePlus' };
  const results = recommendSongsByMood(HIGEDAN_SONGS, criteria);
  assert.ok(results.length > 0);
  assert.ok(results.every(({ song }) => matchesEra(song, 'latest_2025_2026') && matchesLength(song.durationSec, 'fivePlus')));
  assert.deepEqual(recommendSongsByMood([sharon], { ...criteria, length: 'fivePlus' }), []);
});

test('the sound choices distinguish a quiet song from an energetic one without filtering by genre', () => {
  const base = { ...HIGEDAN_SONGS[0], moods: ['push_back'] as typeof HIGEDAN_SONGS[number]['moods'], situations: ['morning_commute'] as typeof HIGEDAN_SONGS[number]['situations'], sound: 'piano_pop' as const };
  const energetic = { ...base, id: 'energetic-example', energyLevel: 9 };
  const calm = { ...base, id: 'calm-example', energyLevel: 3 };
  assert.equal(recommendSongsByMood([calm, energetic], { ...originalCriteria, sound: 'rhythm' })[0].song.id, energetic.id);
  assert.equal(recommendSongsByMood([calm, energetic], { ...originalCriteria, sound: 'gentle' })[0].song.id, calm.id);
});

test('all answer combinations keep results distinct and give every song a chance to appear', () => {
  const moods = ['push_back', 'heartbreak_night', 'euphoric_drive', 'deep_lyric'] as const;
  const situations = ['morning_commute', 'late_night_alone', 'live_warmup', 'weekend_walk'] as const;
  const sounds = ['rhythm', 'gentle', 'melody', 'powerful'] as const;
  const eras = ['any', 'indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026'] as const;
  const lengths = ['any', 'under4', 'fourToFive', 'fivePlus'] as const;
  const seen = new Set<string>();
  for (const mood of moods) for (const situation of situations) for (const sound of sounds)
    for (const era of eras) for (const length of lengths) {
      const criteria = { mood, situation, sound, era, length };
      const top = recommendSongsByMood(HIGEDAN_SONGS, criteria).slice(0, 3);
      assert.ok(top.length >= 2);
      assert.equal(new Set(top.map(match => match.song.id)).size, top.length);
      assert.ok(top.every(({ song }) => matchesEra(song, era) && (length === 'any' || matchesLength(song.durationSec, length))));
      top.forEach(match => seen.add(match.song.id));
    }
  assert.equal(seen.size, HIGEDAN_SONGS.length);
  assert.deepEqual(recommendSongsByMood(HIGEDAN_SONGS, originalCriteria), recommendSongsByMood(HIGEDAN_SONGS, originalCriteria));
});
