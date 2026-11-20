import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS, SACRED_SPOTS, TOUR_ARCHIVES } from '../data/higedanData';
import type { QuizVolumeRecordMap } from '../components/quiz/quizVolumeRecords';
import { getSacredSpotRegion } from './sacredSpotAreas';
import {
  buildAttendedTimeline,
  buildMyNotePlaystyle,
  buildMyNoteRadar,
  buildMyNoteRank,
  buildMyNoteSnapshot,
  buildMyNoteStamps,
  buildQuizRecordSummary,
  buildSacredProgressByRegion,
  getStampDisplayDetails,
  REAL_CONCERT_OPENING_TRIOS,
  type MyNoteEngagementInput,
  type MyNoteRadarSummary,
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
    generatedSetlistShareImage: false,
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

test('buildMyNoteStamps exposes 115 unique stamps (30 gold, 85 normal) and updated tier classifications', () => {
  const initialStamps = buildMyNoteStamps(emptyInput());
  assert.equal(initialStamps.length, 115);
  assert.equal(new Set(initialStamps.map((s) => s.id)).size, 115);
  assert.equal(initialStamps[0].serialNumber, 1);
  assert.equal(initialStamps[0].serialCode, '001');
  assert.equal(initialStamps[114].serialNumber, 115);
  assert.equal(initialStamps[114].serialCode, '115');
  assert.equal(initialStamps.filter((s) => s.tier === 'gold').length, 30);
  assert.equal(initialStamps.filter((s) => s.tier === 'normal').length, 85);

  const bySerial = new Map(initialStamps.map((s) => [s.serialCode, s]));
  for (const code of ['005', '029', '070', '071', '072', '073', '082', '088']) {
    assert.equal(bySerial.get(code)?.tier, 'normal', `No.${code} should be normal`);
  }
  for (const code of ['049', '059', '065', '066', '090', '093']) {
    assert.equal(bySerial.get(code)?.tier, 'gold', `No.${code} should be gold`);
  }

  assert.equal(initialStamps.find((s) => s.id === 'welcome')?.unlocked, true);
  assert.equal(initialStamps.filter((s) => s.unlocked).length, 1);

  const initialRank = buildMyNoteRank(initialStamps);
  assert.equal(initialRank.tierNumber, 1);
  assert.equal(initialRank.title, 'はじめの一歩');
  assert.equal(initialRank.totalStamps, 115);
  assert.equal(initialRank.totalNormalStamps, 85);
  assert.equal(initialRank.unlockedNormalCount, 1);
  assert.equal(initialRank.totalGoldStamps, 30);
  assert.equal(initialRank.unlockedGoldCount, 0);
  assert.equal(initialRank.unlockedCount, 1);
  assert.equal(initialRank.nextMilestoneText, '次のランクまであと 1 スタンプ');

  const initialRadar = buildMyNoteRadar(emptyInput());
  assert.equal(initialRadar.hasAnyActivity, false);
  assert.equal(initialRadar.axes.length, 5);
  assert.equal(buildMyNotePlaystyle(initialRadar).title, 'ダイヤの原石');
});

test('updated stamp rules validate opening trio, alternative creator songs, best live image share, finale, quiz 50%, 55 reads, and 92-stamp finale', () => {
  const [firstOpeningTrio] = [...REAL_CONCERT_OPENING_TRIOS];
  assert.ok(firstOpeningTrio);
  const openingEntries = firstOpeningTrio.split(',').map((songId) => ({ songId, isEncore: false }));

  const saninIds = SACRED_SPOTS.filter(
    (s) => s.mapScope !== 'none' && getSacredSpotRegion(s.area) === 'sanin',
  ).map((s) => s.id);
  const kantoIds = SACRED_SPOTS.filter(
    (s) => s.mapScope !== 'none' && getSacredSpotRegion(s.area) === 'kanto',
  ).map((s) => s.id);

  // Alternative member creator tracks (小笹: bedroom-talk, 楢﨑: choral-a-song, 松浦: filament-song, 藤原: pretender)
  const altFourCreators = [
    { songId: 'bedroom-talk', isEncore: false },
    { songId: 'choral-a-song', isEncore: false },
    { songId: 'filament-song', isEncore: false },
    { songId: 'pretender', isEncore: false },
    { songId: 'shukumei', isEncore: false },
    { songId: 'subtitle', isEncore: true }, // final track is NOT shukumei/stand-by-you/last-song
  ];

  const stamps = buildMyNoteStamps({
    ...emptyInput(),
    visitedSpotIds: [...saninIds.slice(0, 15), ...kantoIds],
    setlists: [
      { title: '再現開幕トリオ', entries: openingEntries },
      { title: '4人制作', entries: altFourCreators },
    ],
    hasCustomSetlistTitle: true,
    bestQuizScore: 50,
    readSongIds: HIGEDAN_SONGS.slice(0, 55).map((s) => s.id),
  });

  const byId = new Map(stamps.map((s) => [s.id, s]));
  assert.equal(byId.get('setlist-opening-trio')?.unlocked, true);
  assert.equal(byId.get('setlist-opening-trio')?.tier, 'gold');
  assert.equal(byId.get('sanin-all')?.unlocked, true);
  assert.equal(byId.get('sanin-all')?.label, 'ヒゲダンの生まれ育った地');
  assert.equal(byId.get('kanto-all')?.unlocked, true);
  assert.equal(byId.get('kanto-all')?.label, '関東エリアのコンパス');
  assert.equal(byId.get('kanto-all')?.progressText, '達成済み');
  assert.equal(byId.get('balanced-three')?.unlocked, true);
  assert.equal(byId.get('balanced-three')?.label, '広がる推し活の景色');
  assert.equal(byId.get('balanced-three')?.tier, 'normal');
  assert.equal(byId.get('setlist-four-creators')?.unlocked, true);
  assert.equal(byId.get('setlist-anthem-finale')?.unlocked, false); // ended with subtitle, not anthem
  assert.equal(byId.get('quiz-score-70')?.unlocked, true);
  assert.equal(byId.get('quiz-score-70')?.label, '50%');
  assert.equal(byId.get('song-read-50')?.unlocked, true);
  assert.equal(byId.get('song-read-50')?.label, '55');
  assert.equal(byId.get('higedan-same-sensibility')?.unlocked, false);

  // Best live setlist requires 12+ songs, 2+ encore, custom title on ONE setlist AND generatedSetlistShareImage
  const tenMain = HIGEDAN_SONGS.slice(0, 10).map((s) => ({ songId: s.id, isEncore: false }));
  const twoEncore = HIGEDAN_SONGS.slice(10, 12).map((s) => ({ songId: s.id, isEncore: true }));
  const qualifyingEntries = [...tenMain, ...twoEncore];

  // Missing image share flag -> locked
  assert.equal(
    buildMyNoteStamps({
      ...emptyInput(),
      setlists: [{ title: '最高の夜', entries: qualifyingEntries }],
      generatedSetlistShareImage: false,
    }).find((s) => s.id === 'higedan-same-sensibility')?.unlocked,
    false,
  );

  // Default title even with image flag -> locked
  assert.equal(
    buildMyNoteStamps({
      ...emptyInput(),
      setlists: [{ title: '私が聴きたい！夢のスタジアムライブ', entries: qualifyingEntries }],
      generatedSetlistShareImage: true,
    }).find((s) => s.id === 'higedan-same-sensibility')?.unlocked,
    false,
  );

  // Only 1 encore even with image flag -> locked
  assert.equal(
    buildMyNoteStamps({
      ...emptyInput(),
      setlists: [{ title: '最高の夜', entries: [...HIGEDAN_SONGS.slice(0, 11).map((s) => ({ songId: s.id, isEncore: false })), twoEncore[0]] }],
      generatedSetlistShareImage: true,
    }).find((s) => s.id === 'higedan-same-sensibility')?.unlocked,
    false,
  );

  // Qualifying setlist + share image flag -> unlocked!
  assert.equal(
    buildMyNoteStamps({
      ...emptyInput(),
      setlists: [{ title: '最高の夜', entries: qualifyingEntries }],
      generatedSetlistShareImage: true,
    }).find((s) => s.id === 'higedan-same-sensibility')?.unlocked,
    true,
  );

  // 115th stamp unlocks once >= 92 of the first 114 stamps are unlocked
  // Verify exact relaxed boundaries across tour, spot, and song-read thresholds
  const checkableSpots = SACRED_SPOTS.filter((s) => s.mapScope !== 'none');
  const tourCatTours = TOUR_ARCHIVES.filter((t) => t.category === 'tour').map((t) => t.id);
  const oneManTours = TOUR_ARCHIVES.filter((t) => t.category === 'one_man').map((t) => t.id);
  const freeTours = TOUR_ARCHIVES.filter((t) => t.category === 'free_special').map((t) => t.id);
  const mvSpots = checkableSpots.filter((s) => s.categories.includes('MVロケ地')).map((s) => s.id);
  const venueSpots = checkableSpots.filter((s) => s.categories.includes('ライブ会場')).map((s) => s.id);
  const memorySpots = checkableSpots.filter((s) => s.categories.includes('メンバーの思い出')).map((s) => s.id);
  const domesticSpots = checkableSpots.filter((s) => getSacredSpotRegion(s.area) === 'domestic_other').map((s) => s.id);
  const overseasSpots = checkableSpots.filter((s) => getSacredSpotRegion(s.area) === 'overseas').map((s) => s.id);

  const justBelow = buildMyNoteStamps({
    ...emptyInput(),
    attendedTourIds: [...TOUR_ARCHIVES.slice(0, 24).map((t) => t.id)],
    visitedSpotIds: [...mvSpots.slice(0, 4), ...overseasSpots.slice(0, 1)],
    bestQuizScore: 49,
    readSongIds: HIGEDAN_SONGS.slice(0, 54).map((s) => s.id),
  });
  const justBelowMap = new Map(justBelow.map((s) => [s.id, s]));
  assert.equal(justBelowMap.get('tour-30')?.unlocked, false);
  assert.equal(justBelowMap.get('spot-cat-mv-all')?.unlocked, false);
  assert.equal(justBelowMap.get('overseas-all')?.unlocked, false);
  assert.equal(justBelowMap.get('quiz-score-70')?.unlocked, false);
  assert.equal(justBelowMap.get('song-read-50')?.unlocked, false);

  const exactThresholds = buildMyNoteStamps({
    ...emptyInput(),
    attendedTourIds: [
      ...new Set([
        ...TOUR_ARCHIVES.slice(0, 25).map((t) => t.id),
        ...tourCatTours.slice(0, 5),
        ...oneManTours.slice(0, 4),
        ...freeTours.slice(0, 2),
      ]),
    ],
    visitedSpotIds: [
      ...new Set([
        ...mvSpots.slice(0, 5),
        ...venueSpots.slice(0, 6),
        ...memorySpots.slice(0, 5),
        ...domesticSpots.slice(0, 4),
        ...overseasSpots.slice(0, 2),
      ]),
    ],
    readSongIds: HIGEDAN_SONGS.slice(0, 89).map((s) => s.id),
  });
  const exactMap = new Map(exactThresholds.map((s) => [s.id, s]));
  assert.equal(exactMap.get('tour-30')?.unlocked, true);
  assert.equal(exactMap.get('tour-cat-tour-8')?.unlocked, true);
  assert.equal(exactMap.get('tour-cat-oneman-all')?.unlocked, true);
  assert.equal(exactMap.get('tour-cat-free-3')?.unlocked, true);
  assert.equal(exactMap.get('spot-cat-mv-all')?.unlocked, true);
  assert.equal(exactMap.get('spot-cat-venue-all')?.unlocked, true);
  assert.equal(exactMap.get('spot-cat-memory-all')?.unlocked, true);
  assert.equal(exactMap.get('spot-cat-memory-all')?.tier, 'gold');
  assert.equal(exactMap.get('domestic-all')?.unlocked, true);
  assert.equal(exactMap.get('overseas-all')?.unlocked, true);
  assert.equal(exactMap.get('song-read-all-90')?.unlocked, false);

  const almostThereStamps = buildMyNoteStamps({
    noteOpened: true,
    hasCustomNickname: true,
    exportedBackup: true,
    attendedTourIds: TOUR_ARCHIVES.slice(0, 30).map((t) => t.id),
    visitedSpotIds: SACRED_SPOTS.filter((s) => s.mapScope !== 'none').slice(0, 26).map((s) => s.id),
    setlists: [
      { title: '92チェック用', entries: qualifyingEntries },
      { title: '再現開幕', entries: openingEntries },
      {
        title: 'アンセム',
        entries: [
          ...HIGEDAN_SONGS.slice(0, 4).map((s) => ({ songId: s.id, isEncore: false })),
          { songId: 'stand-by-you', isEncore: true },
        ],
      },
    ],
    savedSetlistCount: 10,
    hasCustomSetlistTitle: true,
    generatedSetlistShareImage: true,
    quizVolumeScores: Object.assign(Object.create(null), {
      'all:vol1': { score: 10, total: 10, percentage: 100 },
      'all:vol2': { score: 10, total: 10, percentage: 100 },
      'all:vol3': { score: 10, total: 10, percentage: 100 },
      'all:vol4': { score: 10, total: 10, percentage: 100 },
      'all:vol5': { score: 10, total: 10, percentage: 100 },
      'all:vol6': { score: 10, total: 10, percentage: 100 },
      'beginner:vol1': { score: 10, total: 10, percentage: 100 },
      'beginner:vol2': { score: 10, total: 10, percentage: 100 },
      'intermediate:vol1': { score: 10, total: 10, percentage: 100 },
      'intermediate:vol2': { score: 10, total: 10, percentage: 100 },
      'brothers:vol1': { score: 10, total: 10, percentage: 100 },
      'brothers:vol2': { score: 10, total: 10, percentage: 100 },
    }),
    bestQuizScore: 100,
    votedSongCount: 0,
    reviewCount: 0,
    readSongIds: HIGEDAN_SONGS.slice(0, 55).map((s) => s.id),
    completedMoods: ['push_back', 'heartbreak_night'],
    moodCompletedCount: 3,
    visitedVocalRange: true,
    visitedReferenceArchive: true,
  });
  const first114Unlocked = almostThereStamps.slice(0, 114).filter((s) => s.unlocked).length;
  assert.ok(first114Unlocked >= 92, `Expected >= 92 unlocked stamps, got ${first114Unlocked}`);
  assert.equal(almostThereStamps.find((s) => s.id === 'complete-115')?.unlocked, true);
  assert.equal(almostThereStamps.find((s) => s.id === 'complete-115')?.label, '115万キロのフィルム');
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

  const [firstSignature] = [...REAL_CONCERT_OPENING_TRIOS];
  const concertEntries = firstSignature.split(',').map((songId) => ({ songId, isEncore: false }));
  const encoreIds = new Set(['pretender', 'last-song']);
  const superSetlist = [
    { songId: '115man-kilo', isEncore: false },
    ...HIGEDAN_SONGS.filter((s) => s.album === 'Rejoice' && !encoreIds.has(s.id)).slice(0, 8).map((s) => ({ songId: s.id, isEncore: false })),
    { songId: 'rowan-song', isEncore: false },
    { songId: 'tabi-wa-michizure', isEncore: false },
    { songId: 'filament-song', isEncore: false },
    ...HIGEDAN_SONGS.filter((s) => s.vocalRange.chestSemitoneScore >= 74 && !encoreIds.has(s.id)).slice(0, 6).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'brass_funk' && !encoreIds.has(s.id)).slice(0, 3).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'piano_pop' && !encoreIds.has(s.id)).slice(0, 3).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.sound === 'emotional_ballad' && !encoreIds.has(s.id)).slice(0, 4).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.filter((s) => s.bpm >= 150 && !encoreIds.has(s.id)).slice(0, 8).map((s) => ({ songId: s.id, isEncore: false })),
    ...['indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026'].map((era) => ({
      songId: HIGEDAN_SONGS.find((s) => s.era === era && !encoreIds.has(s.id))!.id,
      isEncore: false,
    })),
    { songId: 'pretender', isEncore: true },
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
    generatedSetlistShareImage: true,
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
  assert.equal(masterRank.tierNumber, 15);
  assert.equal(masterRank.title, '115万キロのマイスター');
  assert.equal(masterRank.unlockedGoldCount, 30);
  assert.equal(masterRank.unlockedNormalCount, 85);
  assert.equal(masterRank.progressPercent, 100);
  assert.equal(masterRank.nextMilestoneText, '最高ランク達成！全115スタンプ完全制覇');

  // Verify exact boundaries across the refreshed 15-tier ladder (0 / 2 / 10 / 52 / 60 / 84 / 92 / 115)
  const withCount = (count: number) =>
    buildMyNoteRank(maxedStamps.map((s, idx) => ({ ...s, unlocked: idx < count })));

  assert.equal(withCount(0).title, 'はじめの一歩');
  assert.equal(withCount(2).title, 'ファンノートの新人');
  assert.equal(withCount(2).nextMilestoneText, '次のランクまであと 3 スタンプ');
  assert.equal(withCount(10).title, '駆け出し髭団');
  assert.equal(withCount(10).subtitle, 'いよいよ「髭団」を名乗る新たな一歩へ');
  assert.equal(withCount(52).title, '筋金入りの髭団');
  assert.equal(withCount(60).title, 'ヒゲダン博士');
  assert.equal(withCount(84).title, '永遠のBROTHERS');
  assert.equal(withCount(84).nextMilestoneText, '次のランクまであと 8 スタンプ');

  const atNinetyTwo = withCount(92);
  assert.equal(atNinetyTwo.tierNumber, 15);
  assert.equal(atNinetyTwo.title, '115万キロのマイスター');
  assert.equal(atNinetyTwo.progressPercent, 80);
  assert.equal(atNinetyTwo.nextMilestoneText, '最高ランク達成！全115スタンプ制覇まであと 23 スタンプ');

  const atHundredFourteen = withCount(114);
  assert.equal(atHundredFourteen.title, '115万キロのマイスター');
  assert.equal(atHundredFourteen.progressPercent, 99);
  assert.equal(atHundredFourteen.nextMilestoneText, '最高ランク達成！全115スタンプ制覇まであと 1 スタンプ');
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
  assert.deepEqual(snapshot.playstyle, buildMyNotePlaystyle(radar));
});

test('buildMyNotePlaystyle starts at rough diamond and identifies balanced or spiky axes gently', () => {
  const makeRadar = (values: Record<'tour' | 'spot' | 'setlist' | 'quiz' | 'explore', number>): MyNoteRadarSummary => ({
    hasAnyActivity: Object.values(values).some((v) => v > 0),
    axes: [
      { id: 'tour', label: 'ライブ参戦', value: values.tour, rawLabel: '' },
      { id: 'spot', label: '聖地巡礼', value: values.spot, rawLabel: '' },
      { id: 'setlist', label: 'MYセトリ', value: values.setlist, rawLabel: '' },
      { id: 'quiz', label: '楽曲検定', value: values.quiz, rawLabel: '' },
      { id: 'explore', label: '応援・探索', value: values.explore, rawLabel: '' },
    ],
  });

  // Zero activity and bare nickname-only setup stay in positive rough-diamond stage
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0, spot: 0, setlist: 0, quiz: 0, explore: 0 })).title,
    'ダイヤの原石',
  );
  assert.equal(
    buildMyNotePlaystyle(buildMyNoteRadar({ ...emptyInput(), hasCustomNickname: true })).title,
    'ダイヤの原石',
  );

  // Single dominant axis unlocks promptly even at gentle thresholds
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0.25, spot: 0, setlist: 0, quiz: 0, explore: 0.125 })).title,
    '歓声のど真ん中を生きる人',
  );
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0, spot: 0.3, setlist: 0, quiz: 0.1, explore: 0.125 })).title,
    '風景と音をめぐる旅人',
  );
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0, spot: 0, setlist: 0.28, quiz: 0, explore: 0.125 })).title,
    '夢の公演ディレクター',
  );
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0, spot: 0, setlist: 0, quiz: 0.2, explore: 0 })).title,
    'ヒゲダン愛のトリビア賢者',
  );
  const exploreStyle = buildMyNotePlaystyle(
    makeRadar({ tour: 0.125, spot: 0, setlist: 0.14, quiz: 0, explore: 0.25 }),
  );
  assert.equal(exploreStyle.title, 'ライナーノーツの深掘り人');
  assert.equal(
    exploreStyle.subtitle,
    '楽曲解説や音域チャート、サイトの隅々までじっくり読み込む人',
  );

  // Light balanced participation across all 5 axes awards balanced title without endgame grinding
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0.125, spot: 0.125, setlist: 0.143, quiz: 0.217, explore: 0.25 })).title,
    '全方位の髭団トラベラー',
  );

  // Missing axes at 0 do NOT falsify an "all-directions" balanced title
  assert.equal(
    buildMyNotePlaystyle(makeRadar({ tour: 0.75, spot: 0.75, setlist: 0.75, quiz: 0, explore: 0 })).title,
    '歓声のど真ん中を生きる人',
  );
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
  assert.equal(spotFive.descriptionText, '聖地スポットを5か所以上訪問する');
  assert.match(spotFive.progressLabel, /5か所/);
  assert.equal(spotFive.buttonAriaLabel.includes('ゆかりの地コレクション'), false);

  // Locked gold stamps mask exact condition, title, and numeric progress behind area hint only
  const spotAll = getStampDisplayDetails(byId.get('spot-all-32')!);
  assert.equal(spotAll.isSecretLocked, true);
  assert.equal(spotAll.tileLabel, '???');
  assert.equal(spotAll.titleText, '未獲得');
  assert.equal(spotAll.progressLabel, '未達成');
  assert.equal(spotAll.descriptionText, '??????（聖地巡礼マップ）');
  assert.equal(spotAll.buttonAriaLabel.includes('25'), false);
  assert.equal(spotAll.buttonAriaLabel.includes('記憶の地図を塗りつぶす旅人'), false);

  const bestLive = getStampDisplayDetails(byId.get('higedan-same-sensibility')!);
  assert.equal(bestLive.descriptionText, '??????（MYセトリ作成）');
  assert.equal(bestLive.buttonAriaLabel.includes('SNSシェア画像'), false);
  assert.equal(bestLive.buttonAriaLabel.includes('拍手喝采のマイ・ベスト公演'), false);

  assert.equal(
    getStampDisplayDetails(byId.get('mood-all-four')!).descriptionText,
    '??????（今日の1曲診断）',
  );
  assert.equal(
    getStampDisplayDetails(byId.get('complete-115')!).descriptionText,
    '??????（サイト全体）',
  );

  // Unlocked gold stamp reveals title, condition, and unlocked status
  const bestEntries = [
    ...HIGEDAN_SONGS.slice(0, 10).map((s) => ({ songId: s.id, isEncore: false })),
    ...HIGEDAN_SONGS.slice(10, 12).map((s) => ({ songId: s.id, isEncore: true })),
  ];
  const unlockedStamps = buildMyNoteStamps({
    ...emptyInput(),
    setlists: [
      {
        title: 'マイ・ベストライブ',
        entries: bestEntries,
      },
    ],
    generatedSetlistShareImage: true,
  });
  const unlockedBestLive = getStampDisplayDetails(
    unlockedStamps.find((s) => s.id === 'higedan-same-sensibility')!,
  );
  assert.equal(unlockedBestLive.isSecretLocked, false);
  assert.equal(unlockedBestLive.tileLabel, '拍手喝采のマイ・ベスト公演');
  assert.equal(unlockedBestLive.titleText, '拍手喝采のマイ・ベスト公演');
  assert.equal(unlockedBestLive.progressLabel, '達成済み');
  assert.match(unlockedBestLive.descriptionText, /SNSシェア画像/);
});
