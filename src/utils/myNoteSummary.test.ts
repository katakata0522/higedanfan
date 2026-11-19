import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS, SACRED_SPOTS, TOUR_ARCHIVES } from '../data/higedanData';
import type { QuizVolumeRecordMap } from '../components/quiz/quizVolumeRecords';
import { getSacredSpotRegion } from './sacredSpotAreas';
import {
  buildAttendedTimeline,
  buildMyNoteRadar,
  buildMyNoteRank,
  buildMyNoteSnapshot,
  buildMyNoteStamps,
  buildQuizRecordSummary,
  buildSacredProgressByRegion,
  getStampDisplayDetails,
  REAL_CONCERT_SETLIST_SIGNATURES,
  type MyNoteEngagementInput,
} from './myNoteSummary';

function emptyInput(): MyNoteEngagementInput {
  return {
    noteOpened: true,
    hasCustomNickname: false,
    exportedBackup: false,
    attendedTourIds: [],
    visitedSpotIds: [],
    setlists: [],
    savedSetlistCount: 1,
    hasCustomSetlistTitle: false,
    quizVolumeScores: Object.create(null) as QuizVolumeRecordMap,
    bestQuizScore: null,
    votedSongCount: 0,
    reviewCount: 0,
    readSongIds: [],
    completedMoods: [],
    moodCompletedCount: 0,
    visitedVocalRange: false,
    visitedReferenceArchive: false,
  };
}

test('buildAttendedTimeline groups attended tours by year descending and ignores invalid IDs', () => {
  const sampleTours = [TOUR_ARCHIVES[0], TOUR_ARCHIVES[TOUR_ARCHIVES.length - 1]];
  const summary = buildAttendedTimeline(TOUR_ARCHIVES, [
    ...sampleTours.map((t) => t.id),
    'nonexistent-tour-id',
  ]);
  assert.equal(summary.totalAttended, 2);
  assert.equal(summary.totalSeries, TOUR_ARCHIVES.length);
  assert.ok(summary.yearCount >= 1);
  if (summary.years.length >= 2) {
    assert.ok(Number(summary.years[0].year) >= Number(summary.years[1].year));
  }

  const empty = buildAttendedTimeline(TOUR_ARCHIVES, []);
  assert.equal(empty.totalAttended, 0);
  assert.deepEqual(empty.years, []);
});

test('buildSacredProgressByRegion totals all checkable spots across regions', () => {
  const checkable = SACRED_SPOTS.filter((s) => s.mapScope !== 'none');
  const firstTwoIds = checkable.slice(0, 2).map((s) => s.id);
  const progress = buildSacredProgressByRegion(SACRED_SPOTS, [...firstTwoIds, 'bad-id']);

  assert.equal(progress.totalCheckable, checkable.length);
  assert.equal(progress.totalVisited, 2);
  assert.equal(
    progress.regions.reduce((sum, r) => sum + r.total, 0),
    checkable.length,
  );
  assert.equal(
    progress.regions.reduce((sum, r) => sum + r.visited, 0),
    2,
  );
});

test('buildQuizRecordSummary aggregates 12 quiz sets and counts completions/perfects', () => {
  const volumeScores: QuizVolumeRecordMap = Object.assign(Object.create(null), {
    'all:vol1': { score: 10, total: 10, percentage: 100 },
    'beginner:vol2': { score: 7, total: 10, percentage: 70 },
  });
  const summary = buildQuizRecordSummary(volumeScores, 100);
  assert.equal(summary.totalSets, 12);
  assert.equal(summary.completedSets, 2);
  assert.equal(summary.perfectSets, 1);
  assert.equal(summary.bestQuizScore, 100);
  assert.equal(summary.courses.find((c) => c.id === 'all')?.volumes.length, 6);
  assert.equal(summary.courses.find((c) => c.id === 'beginner')?.volumes[1].record?.score, 7);
});

test('buildMyNoteStamps exposes 115 unique stamps (32 gold, 83 normal)', () => {
  const initialStamps = buildMyNoteStamps(emptyInput());
  assert.equal(initialStamps.length, 115);
  assert.equal(new Set(initialStamps.map((s) => s.id)).size, 115);
  assert.equal(initialStamps[0].serialNumber, 1);
  assert.equal(initialStamps[0].serialCode, '001');
  assert.equal(initialStamps[114].serialNumber, 115);
  assert.equal(initialStamps[114].serialCode, '115');
  assert.equal(initialStamps.filter((s) => s.tier === 'gold').length, 32);
  assert.equal(initialStamps.filter((s) => s.tier === 'normal').length, 83);
  assert.equal(initialStamps.find((s) => s.id === 'welcome')?.unlocked, true);
  assert.equal(initialStamps.filter((s) => s.unlocked).length, 1);

  const initialRank = buildMyNoteRank(initialStamps);
  assert.equal(initialRank.title, 'はじめの一歩');
  assert.equal(initialRank.totalStamps, 115);
  assert.equal(initialRank.totalGoldStamps, 32);
  assert.equal(initialRank.unlockedCount, 1);

  const initialRadar = buildMyNoteRadar(emptyInput());
  assert.equal(initialRadar.hasAnyActivity, false);
  assert.equal(initialRadar.axes.length, 5);
});

test('rare stamps unlock for real concert setlist match and complete regions', () => {
  const [firstSignature] = [...REAL_CONCERT_SETLIST_SIGNATURES];
  assert.ok(firstSignature);
  const matchingEntries = firstSignature.split(',').map((songId) => ({ songId, isEncore: false }));

  const saninIds = SACRED_SPOTS.filter(
    (s) => s.mapScope !== 'none' && getSacredSpotRegion(s.area) === 'sanin',
  ).map((s) => s.id);
  const kantoIds = SACRED_SPOTS.filter(
    (s) => s.mapScope !== 'none' && getSacredSpotRegion(s.area) === 'kanto',
  ).map((s) => s.id);

  const stamps = buildMyNoteStamps({
    ...emptyInput(),
    visitedSpotIds: [...saninIds, ...kantoIds],
    setlists: [{ title: '再現テスト', entries: matchingEntries }],
    hasCustomSetlistTitle: true,
    readSongIds: ['rowan-song', 'tabi-wa-michizure', 'filament-song'],
  });

  const byId = new Map(stamps.map((s) => [s.id, s]));
  assert.equal(byId.get('higedan-same-sensibility')?.unlocked, true);
  assert.equal(byId.get('higedan-same-sensibility')?.tier, 'gold');
  assert.equal(byId.get('setlist-opening-trio')?.unlocked, true);
  assert.equal(byId.get('sanin-all')?.unlocked, true);
  assert.equal(byId.get('sanin-all')?.label, '山陰の頂点');
  assert.equal(byId.get('kanto-all')?.unlocked, true);
  assert.equal(byId.get('kanto-all')?.label, '関東を制す者');
  assert.equal(byId.get('kanto-all')?.progressText, '達成済み');
  assert.equal(byId.get('balanced-three')?.unlocked, true);
  assert.equal(byId.get('balanced-three')?.progressText, '達成済み');
  assert.equal(byId.get('song-read-member-trio')?.unlocked, true);
});

test('buildMyNoteRank scales through all 15 tiers and unlocks 115th stamp at complete mastery', () => {
  const allSets: Record<string, { score: number; total: number; percentage: number }> = Object.create(null);
  for (const key of [
    'all:vol1', 'all:vol2', 'all:vol3', 'all:vol4', 'all:vol5', 'all:vol6',
    'beginner:vol1', 'beginner:vol2',
    'intermediate:vol1', 'intermediate:vol2',
    'brothers:vol1', 'brothers:vol2',
  ]) {
    allSets[key] = { score: 10, total: 10, percentage: 100 };
  }

  const [firstSignature] = [...REAL_CONCERT_SETLIST_SIGNATURES];
  const concertEntries = firstSignature.split(',').map((songId) => ({ songId, isEncore: false }));
  const superSetlist = [
    { songId: '115man-kilo', isEncore: false },
    ...HIGEDAN_SONGS.filter((s) => s.album === 'Rejoice').slice(0, 8).map((s) => ({ songId: s.id, isEncore: false })),
    { songId: 'rowan-song', isEncore: false },
    { songId: 'tabi-wa-michizure', isEncore: false },
    { songId: 'filament-song', isEncore: false },
    ...HIGEDAN_SONGS.filter((s) => s.vocalRange.chestSemitoneScore >= 74).slice(0, 6).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'brass_funk').slice(0, 3).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'piano_pop').slice(0, 3).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'emotional_ballad').slice(0, 4).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.bpm >= 150).slice(0, 8).map((s) => ({ songId: s.id, isEncore: false })),
    ...['indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026'].map((era) => ({
      songId: HIGEDAN_SONGS.find((s) => s.era === era)!.id,
      isEncore: false,
    })),
    { songId: 'last-song', isEncore: true },
  ];
  // Put an unused anthem at the end so encore + finale aren't deduplicated earlier in superSetlist
  const finaleSetlist = [
    ...HIGEDAN_SONGS.filter((s) => s.id !== 'shukumei' && s.id !== 'stand-by-you' && s.id !== 'last-song')
      .slice(0, 5)
      .map((s) => ({ songId: s.id, isEncore: false })),
    { songId: 'shukumei', isEncore: true },
  ];
  // Build one dedicated upper-beat list too so average BPM >= 130
  const upperList = HIGEDAN_SONGS.filter((s) => s.bpm >= 145).slice(0, 6).map((s) => ({ songId: s.id, isEncore: false }));

  const maxedStamps = buildMyNoteStamps({
    noteOpened: true,
    hasCustomNickname: true,
    exportedBackup: true,
    attendedTourIds: TOUR_ARCHIVES.map((t) => t.id),
    visitedSpotIds: SACRED_SPOTS.filter((s) => s.mapScope !== 'none').map((s) => s.id),
    setlists: [
      { title: '完全制覇セトリ', entries: superSetlist },
      { title: '再現セトリ', entries: concertEntries },
      { title: '高速ビート', entries: upperList },
      { title: 'アンコール締め', entries: finaleSetlist },
    ],
    savedSetlistCount: 10,
    hasCustomSetlistTitle: true,
    quizVolumeScores: allSets,
    bestQuizScore: 100,
    votedSongCount: 0,
    reviewCount: 0,
    readSongIds: HIGEDAN_SONGS.map((s) => s.id),
    completedMoods: ['push_back', 'heartbreak_night', 'euphoric_drive', 'deep_lyric'],
    moodCompletedCount: 4,
    visitedVocalRange: true,
    visitedReferenceArchive: true,
  });

  assert.equal(maxedStamps.filter((s) => s.unlocked).length, 115);
  assert.equal(maxedStamps.find((s) => s.id === 'complete-115')?.unlocked, true);

  const masterRank = buildMyNoteRank(maxedStamps);
  assert.equal(masterRank.title, '115万キロのフィルム・マスター');
  assert.equal(masterRank.unlockedGoldCount, 32);
  assert.equal(masterRank.progressPercent, 100);

  // Check stepped synthetic counts hit intermediate ranks cleanly
  const atTwo = maxedStamps.map((s, idx) => ({ ...s, unlocked: idx < 2 }));
  assert.equal(buildMyNoteRank(atTwo).title, '音と言葉のルーキー');

  const atFifty = maxedStamps.map((s, idx) => ({ ...s, unlocked: idx < 50 }));
  assert.equal(buildMyNoteRank(atFifty).title, '髭男ノート研究員');

  const atOneOhEight = maxedStamps.map((s, idx) => ({ ...s, unlocked: idx < 108 }));
  assert.equal(buildMyNoteRank(atOneOhEight).title, '115万キロの案内人');
});

test('buildMyNoteRadar uses maxSetlistSongs across all saved setlists and filters invalid IDs', () => {
  const input: MyNoteEngagementInput = {
    ...emptyInput(),
    attendedTourIds: [TOUR_ARCHIVES[0].id, TOUR_ARCHIVES[0].id, 'invalid-tour-id'],
    visitedSpotIds: [SACRED_SPOTS[0].id, 'nonexistent-spot-id'],
    setlists: [
      { title: '新しい空白セトリ', entries: [] },
      {
        title: '保存済みフルセトリ',
        entries: [
          { songId: 'pretender', isEncore: false },
          { songId: 'subtitle', isEncore: false },
          { songId: 'invalid-song', isEncore: false },
        ],
      },
    ],
    savedSetlistCount: 1,
    readSongIds: ['pretender', 'pretender', 'invalid-song'],
    visitedVocalRange: true,
  };

  const radar = buildMyNoteRadar(input);
  const axisById = new Map(radar.axes.map((a) => [a.id, a]));
  assert.equal(axisById.get('tour')?.rawLabel, '1件');
  assert.equal(axisById.get('spot')?.rawLabel, '1か所');
  assert.equal(axisById.get('setlist')?.rawLabel, '2曲 / 1案');
  assert.ok((axisById.get('setlist')?.value ?? 0) > 0);
  assert.equal(axisById.get('explore')?.rawLabel, '1曲読破');
  assert.ok((axisById.get('explore')?.value ?? 0) > 0);

  const snapshot = buildMyNoteSnapshot(input);
  assert.deepEqual(snapshot.stamps, buildMyNoteStamps(input));
  assert.deepEqual(snapshot.rank, buildMyNoteRank(snapshot.stamps));
  assert.deepEqual(snapshot.radar, radar);
});

test('getStampDisplayDetails hides conditions and progress on locked gold stamps until unlocked', () => {
  const lockedStamps = buildMyNoteStamps(emptyInput());
  const byId = new Map(lockedStamps.map((s) => [s.id, s]));

  // #003 uses user-friendly wording instead of technical JSON terminology
  const backupKeeper = byId.get('backup-keeper')!;
  assert.equal(backupKeeper.hint.includes('JSON'), false);

  // Locked normal stamp shows condition and progress while keeping tile title hidden
  const spotFive = getStampDisplayDetails(byId.get('spot-5')!);
  assert.equal(spotFive.isSecretLocked, false);
  assert.equal(spotFive.tileLabel, '???');
  assert.equal(spotFive.titleText, '未獲得（達成条件）');
  assert.equal(spotFive.descriptionText, '聖地スポットを5か所以上チェック');
  assert.match(spotFive.progressLabel, /5か所/);
  assert.equal(spotFive.buttonAriaLabel.includes('聖地5か所'), false);

  // Locked gold stamps mask exact condition, title, and numeric progress behind area hint only
  const spotAll = getStampDisplayDetails(byId.get('spot-all-32')!);
  assert.equal(spotAll.isSecretLocked, true);
  assert.equal(spotAll.tileLabel, '???');
  assert.equal(spotAll.titleText, '未獲得');
  assert.equal(spotAll.progressLabel, '未達成');
  assert.equal(spotAll.descriptionText, '??????（聖地巡礼マップ）');
  assert.equal(spotAll.buttonAriaLabel.includes('32'), false);
  assert.equal(spotAll.buttonAriaLabel.includes('聖地制覇'), false);

  const sameSensibility = getStampDisplayDetails(byId.get('higedan-same-sensibility')!);
  assert.equal(sameSensibility.descriptionText, '??????（MYセトリ作成）');
  assert.equal(sameSensibility.buttonAriaLabel.includes('完全一致'), false);
  assert.equal(sameSensibility.buttonAriaLabel.includes('髭男と同じ感性'), false);

  assert.equal(
    getStampDisplayDetails(byId.get('mood-all-four')!).descriptionText,
    '??????（今日の1曲診断）',
  );
  assert.equal(
    getStampDisplayDetails(byId.get('complete-115')!).descriptionText,
    '??????（サイト全体）',
  );

  // Unlocked gold stamp reveals title, condition, and unlocked status
  const [firstSignature] = [...REAL_CONCERT_SETLIST_SIGNATURES];
  const unlockedStamps = buildMyNoteStamps({
    ...emptyInput(),
    setlists: [
      {
        title: '再現テスト',
        entries: firstSignature.split(',').map((songId) => ({ songId, isEncore: false })),
      },
    ],
  });
  const unlockedSameSensibility = getStampDisplayDetails(
    unlockedStamps.find((s) => s.id === 'higedan-same-sensibility')!,
  );
  assert.equal(unlockedSameSensibility.isSecretLocked, false);
  assert.equal(unlockedSameSensibility.tileLabel, '髭男と同じ感性');
  assert.equal(unlockedSameSensibility.titleText, '髭男と同じ感性');
  assert.equal(unlockedSameSensibility.progressLabel, '達成済み');
  assert.match(unlockedSameSensibility.descriptionText, /完全一致/);
});
