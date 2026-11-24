import type { CourseDifficulty } from '../../components/quiz/quizCourseMeta';
import type { SongItem, TourArchiveCategory } from '../../data/higedanTypes';
import { TOUR_ARCHIVES } from '../../data/tourArchivesData';
import { getSacredSpotRegion, type SacredSpotRegion } from '../sacredSpotAreas';
import type { SavedSetlistItem } from '../savedSetlists';
import { normalizeSetlistOrder } from '../setlist';
import { songwriterInfo } from '../songCatalog';
import {
  ALBUM_SONGS_MAP,
  CHECKABLE_SPOTS,
  REAL_CONCERT_OPENING_TRIOS,
  SONG_BY_ID,
  VALID_CHECKABLE_SPOT_IDS,
  VALID_SONG_IDS,
  VALID_TOUR_IDS,
} from './catalog';
import {
  buildMyNotePlaystyle,
  buildMyNoteRank,
  computeRadarSummary,
} from './rankAndRadar';
import { buildQuizRecordSummary, isCustomSetlistTitle } from './timelines';
import {
  formatStampProgress,
  type MyNoteEngagementInput,
  type MyNotePlaystyleSummary,
  type MyNoteRadarSummary,
  type MyNoteRankSummary,
  type MyNoteStampDraft,
  type MyNoteStampItem,
} from './types';

const realOpeningTrios = REAL_CONCERT_OPENING_TRIOS;

const ANTHEM_FINALE_IDS = new Set(['shukumei', 'stand-by-you', 'last-song']);
const FOUR_MEMBER_SONG_IDS = ['rowan-song', 'tabi-wa-michizure', 'filament-song'] as const;

interface ComputedMetrics {
  attendedCount: number;
  attendedSet: Set<string>;
  attendedYears: Set<string>;
  tourCatCount: Record<TourArchiveCategory, number>;
  visitedCount: number;
  visitedSpotSet: Set<string>;
  regionVisited: Record<Exclude<SacredSpotRegion, 'all'>, number>;
  regionTotal: Record<Exclude<SacredSpotRegion, 'all'>, number>;
  spotCategoryStats: Record<string, { visited: number; total: number }>;
  maxSetlistSongs: number;
  maxEncoreCount: number;
  savedSetlistCount: number;
  hasCustomSetlistTitle: boolean;
  hasBestLiveSetlist: boolean;
  matchesRealOpeningTrio: boolean;
  hasAllFourMemberSongs: boolean;
  hasAllFiveErasSetlist: boolean;
  has115ManKiloOpening: boolean;
  hasAnthemFinale: boolean;
  hasHighBpmSetlist: boolean;
  hasBalladSetlist: boolean;
  hasBrassAndPianoSetlist: boolean;
  hasHighToneSetlist: boolean;
  hasAlbumConceptSetlist: boolean;
  completedSets: number;
  perfectSets: number;
  bestQuizScore: number | null;
  courseDone: Record<CourseDifficulty, number>;
  coursePerfect: Record<CourseDifficulty, number>;
  readSongSet: Set<string>;
  readSongCount: number;
  completedMoodsCount: number;
  moodCompletedCount: number;
  radar: MyNoteRadarSummary;
  activeRadarAxes: number;
}

function analyzeSetlists(setlists: readonly Pick<SavedSetlistItem, 'title' | 'entries'>[]) {
  let maxSetlistSongs = 0;
  let maxEncoreCount = 0;
  let hasBestLiveSetlist = false;
  let matchesRealOpeningTrio = false;
  let hasAllFourMemberSongs = false;
  let hasAllFiveErasSetlist = false;
  let has115ManKiloOpening = false;
  let hasAnthemFinale = false;
  let hasHighBpmSetlist = false;
  let hasBalladSetlist = false;
  let hasBrassAndPianoSetlist = false;
  let hasHighToneSetlist = false;
  let hasAlbumConceptSetlist = false;

  for (const item of setlists) {
    const normalized = normalizeSetlistOrder(
      item.entries.filter((entry) => VALID_SONG_IDS.has(entry.songId)),
    );
    const len = normalized.length;
    if (len > maxSetlistSongs) maxSetlistSongs = len;

    const encoreCount = normalized.filter((entry) => entry.isEncore).length;
    if (encoreCount > maxEncoreCount) maxEncoreCount = encoreCount;

    if (len >= 12 && encoreCount >= 2 && isCustomSetlistTitle(item.title)) {
      hasBestLiveSetlist = true;
    }

    if (len >= 3) {
      const openingKey = normalized.slice(0, 3).map((entry) => entry.songId).join(',');
      if (realOpeningTrios.has(openingKey)) matchesRealOpeningTrio = true;
    }

    const songsInList: SongItem[] = [];
    for (const entry of normalized) {
      const song = SONG_BY_ID.get(entry.songId);
      if (song) songsInList.push(song);
    }

    let hasFujiwaraSolo = false;
    let hasOzasa = false;
    let hasNarazaki = false;
    let hasMatsuura = false;
    for (const song of songsInList) {
      const creditName = songwriterInfo(song)?.name ?? '藤原聡';
      if (creditName === '藤原聡') hasFujiwaraSolo = true;
      if (creditName.includes('小笹大輔')) hasOzasa = true;
      if (creditName.includes('楢﨑誠')) hasNarazaki = true;
      if (creditName.includes('松浦匡希')) hasMatsuura = true;
    }
    if (len >= 4 && hasFujiwaraSolo && hasOzasa && hasNarazaki && hasMatsuura) {
      hasAllFourMemberSongs = true;
    }

    const eras = new Set(songsInList.map((song) => song.era));
    if (len >= 10 && eras.size >= 5) hasAllFiveErasSetlist = true;

    if (len >= 5 && normalized[0]?.songId === '115man-kilo') has115ManKiloOpening = true;
    if (len >= 5 && ANTHEM_FINALE_IDS.has(normalized[len - 1]?.songId ?? '')) hasAnthemFinale = true;

    if (len >= 6) {
      const bpmTotal = songsInList.reduce((sum, song) => sum + song.bpm, 0);
      if (bpmTotal / len >= 130) hasHighBpmSetlist = true;
    }

    const balladCount = songsInList.filter((song) => song.sound === 'emotional_ballad').length;
    if (balladCount >= 4) hasBalladSetlist = true;

    const pianoCount = songsInList.filter((song) => song.sound === 'piano_pop').length;
    const brassCount = songsInList.filter((song) => song.sound === 'brass_funk').length;
    if (pianoCount >= 3 && brassCount >= 3) hasBrassAndPianoSetlist = true;

    const highToneCount = songsInList.filter((song) => song.vocalRange.chestSemitoneScore >= 74).length;
    if (highToneCount >= 5) hasHighToneSetlist = true;

    const albumCounts = new Map<string, number>();
    for (const song of songsInList) {
      const next = (albumCounts.get(song.album) ?? 0) + 1;
      albumCounts.set(song.album, next);
      if (next >= 7) hasAlbumConceptSetlist = true;
    }
  }

  return {
    maxSetlistSongs,
    maxEncoreCount,
    hasBestLiveSetlist,
    matchesRealOpeningTrio,
    hasAllFourMemberSongs,
    hasAllFiveErasSetlist,
    has115ManKiloOpening,
    hasAnthemFinale,
    hasHighBpmSetlist,
    hasBalladSetlist,
    hasBrassAndPianoSetlist,
    hasHighToneSetlist,
    hasAlbumConceptSetlist,
  };
}

function computeMetrics(input: MyNoteEngagementInput): ComputedMetrics {
  const attendedSet = new Set(input.attendedTourIds.filter((id) => VALID_TOUR_IDS.has(id)));
  const attendedYears = new Set<string>();
  const tourCatCount: Record<TourArchiveCategory, number> = {
    tour: 0,
    one_man: 0,
    online_fc: 0,
    free_special: 0,
    two_man: 0,
  };
  for (const tour of TOUR_ARCHIVES) {
    if (!attendedSet.has(tour.id)) continue;
    if (/^\d{4}/.test(tour.startDate)) attendedYears.add(tour.startDate.slice(0, 4));
    if (tour.category) tourCatCount[tour.category] += 1;
  }

  const visitedSpotSet = new Set(
    input.visitedSpotIds.filter((id) => VALID_CHECKABLE_SPOT_IDS.has(id)),
  );
  const regionVisited: Record<Exclude<SacredSpotRegion, 'all'>, number> = {
    sanin: 0,
    kanto: 0,
    domestic_other: 0,
    overseas: 0,
  };
  const regionTotal: Record<Exclude<SacredSpotRegion, 'all'>, number> = {
    sanin: 0,
    kanto: 0,
    domestic_other: 0,
    overseas: 0,
  };
  const spotCategoryStats: Record<string, { visited: number; total: number }> = {};

  for (const spot of CHECKABLE_SPOTS) {
    const visited = visitedSpotSet.has(spot.id);
    const region = getSacredSpotRegion(spot.area);
    regionTotal[region] += 1;
    if (visited) regionVisited[region] += 1;

    for (const cat of spot.categories) {
      const stat = spotCategoryStats[cat] ?? { visited: 0, total: 0 };
      stat.total += 1;
      if (visited) stat.visited += 1;
      spotCategoryStats[cat] = stat;
    }
  }

  const setlistMetrics = analyzeSetlists(input.setlists);
  const quizSummary = buildQuizRecordSummary(input.quizVolumeScores, input.bestQuizScore);
  const courseDone: Record<CourseDifficulty, number> = {
    all: 0,
    beginner: 0,
    intermediate: 0,
    brothers: 0,
  };
  const coursePerfect: Record<CourseDifficulty, number> = {
    all: 0,
    beginner: 0,
    intermediate: 0,
    brothers: 0,
  };
  for (const course of quizSummary.courses) {
    for (const vol of course.volumes) {
      if (vol.record) {
        courseDone[course.id] += 1;
        if (vol.record.score === vol.record.total) coursePerfect[course.id] += 1;
      }
    }
  }

  const readSongSet = new Set(input.readSongIds.filter((id) => VALID_SONG_IDS.has(id)));
  const readSongCount = readSongSet.size;
  const completedMoodsCount = new Set(input.completedMoods).size;

  const radar = computeRadarSummary({
    attendedCount: attendedSet.size,
    visitedCount: visitedSpotSet.size,
    maxSetlistSongs: setlistMetrics.maxSetlistSongs,
    savedSetlistCount: input.savedSetlistCount,
    completedQuizSets: quizSummary.completedSets,
    bestQuizScore: input.bestQuizScore,
    votedSongCount: input.votedSongCount,
    reviewCount: input.reviewCount,
    readSongCount,
    moodCompletedCount: input.moodCompletedCount,
    hasCustomNickname: input.hasCustomNickname,
    visitedVocalRange: input.visitedVocalRange,
    visitedReferenceArchive: input.visitedReferenceArchive,
  });
  const activeRadarAxes = radar.axes.filter((axis) => axis.value > 0).length;

  return {
    attendedCount: attendedSet.size,
    attendedSet,
    attendedYears,
    tourCatCount,
    visitedCount: visitedSpotSet.size,
    visitedSpotSet,
    regionVisited,
    regionTotal,
    spotCategoryStats,
    ...setlistMetrics,
    savedSetlistCount: input.savedSetlistCount,
    hasCustomSetlistTitle: input.hasCustomSetlistTitle,
    completedSets: quizSummary.completedSets,
    perfectSets: quizSummary.perfectSets,
    bestQuizScore: quizSummary.bestQuizScore,
    courseDone,
    coursePerfect,
    readSongSet,
    readSongCount,
    completedMoodsCount,
    moodCompletedCount: input.moodCompletedCount,
    radar,
    activeRadarAxes,
  };
}

function hasReadAllAlbumSongs(readSet: ReadonlySet<string>, albumName: string): boolean {
  const ids = ALBUM_SONGS_MAP.get(albumName) ?? [];
  return ids.length > 0 && ids.every((id) => readSet.has(id));
}

function albumReadProgress(readSet: ReadonlySet<string>, albumName: string): string {
  const ids = ALBUM_SONGS_MAP.get(albumName) ?? [];
  const count = ids.filter((id) => readSet.has(id)).length;
  return formatStampProgress(count, ids.length, '曲');
}

function buildStampsFromMetrics(input: MyNoteEngagementInput, m: ComputedMetrics): MyNoteStampItem[] {
  const hasAny = (ids: readonly string[]) => ids.some((id) => m.attendedSet.has(id));

  const first114: MyNoteStampDraft[] = [
    // A. welcome & profile (001-007 here + 115 at the end = 8 total: 6 normal, 2 gold)
    {
      id: 'welcome',
      label: 'ようこそ！',
      hint: 'マイノートを初めて開く',
      unlocked: input.noteOpened,
      category: 'welcome',
      tier: 'normal',
    },
    {
      id: 'named-note',
      label: '刻まれた名前',
      hint: 'マイノートのお名前を設定する',
      areaHint: 'マイノート',
      unlocked: input.hasCustomNickname,
      category: 'profile',
      tier: 'normal',
    },
    {
      id: 'backup-keeper',
      label: '記憶のタイムカプセル',
      hint: '記録データをファイルに保存してバックアップする',
      areaHint: 'マイノート',
      unlocked: input.exportedBackup,
      category: 'profile',
      tier: 'normal',
    },
    {
      id: 'two-pillars',
      label: '2つめのワクワクへ',
      hint: '5分野のうち2分野以上で記録を残す',
      areaHint: 'サイト全体（5分野）',
      unlocked: m.activeRadarAxes >= 2,
      category: 'profile',
      tier: 'normal',
      progressText: formatStampProgress(m.activeRadarAxes, 2, '分野'),
    },
    {
      id: 'balanced-three',
      label: '広がる推し活の景色',
      hint: '5分野のうち3分野以上で記録を残す',
      areaHint: 'サイト全体（5分野）',
      unlocked: m.activeRadarAxes >= 3,
      category: 'profile',
      tier: 'normal',
      progressText: formatStampProgress(m.activeRadarAxes, 3, '分野'),
    },
    {
      id: 'four-pillars',
      label: '4つの世界をまたぐ者',
      hint: '5分野のうち4分野以上で記録を残す',
      areaHint: 'サイト全体（5分野）',
      unlocked: m.activeRadarAxes >= 4,
      category: 'profile',
      tier: 'normal',
      progressText: formatStampProgress(m.activeRadarAxes, 4, '分野'),
    },
    {
      id: 'all-five-pillars',
      label: 'すべてを楽しむ全力髭団',
      hint: '5分野すべてで記録を残す',
      areaHint: 'サイト全体（5分野）',
      unlocked: m.activeRadarAxes >= 5,
      category: 'profile',
      tier: 'gold',
      progressText: formatStampProgress(m.activeRadarAxes, 5, '分野'),
    },
    // B. tour archive (008-030 = 23 items: 17 normal, 6 gold)
    {
      id: 'tour-five-years',
      label: 'これからも、ここからも',
      hint: '異なる5年以上のライブ・ツアーを記録する',
      unlocked: m.attendedYears.size >= 5,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedYears.size, 5, '年'),
    },
    {
      id: 'tour-1',
      label: '最初の手拍子',
      hint: '参戦・視聴を1シリーズ以上記録する',
      unlocked: m.attendedCount >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 1, 'シリーズ'),
    },
    {
      id: 'tour-3',
      label: 'アンコールの余韻',
      hint: '3シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 3,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 3, 'シリーズ'),
    },
    {
      id: 'tour-5',
      label: 'ライブの常連さん',
      hint: '5シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 5,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 5, 'シリーズ'),
    },
    {
      id: 'tour-10',
      label: '歓声のなかで生きる',
      hint: '10シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 10,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 10, 'シリーズ'),
    },
    {
      id: 'tour-15',
      label: 'もはやサポメン',
      hint: '15シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 15,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 15, 'シリーズ'),
    },
    {
      id: 'tour-20',
      label: 'ステージを追い続けて',
      hint: '20シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 20,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 20, 'シリーズ'),
    },
    {
      id: 'tour-30',
      label: 'ライブハウスの生き字引',
      hint: '25シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 25,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 25, 'シリーズ'),
    },
    {
      id: 'tour-all-37',
      label: '歴代ライブの生き証人',
      hint: '30シリーズ以上のライブ・ツアーを記録する',
      unlocked: m.attendedCount >= 30,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 30, 'シリーズ'),
    },
    {
      id: 'tour-cat-tour-1',
      label: 'ツアーバスを追いかけて',
      hint: '全国ツアーカテゴリを1シリーズ以上記録する',
      unlocked: m.tourCatCount.tour >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-cat-tour-8',
      label: '日本列島ライブ行脚',
      hint: '全国ツアーカテゴリを5シリーズ以上記録する',
      unlocked: m.tourCatCount.tour >= 5,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.tour, 5, 'シリーズ'),
    },
    {
      id: 'tour-cat-tour-16',
      label: '全国ツアーの覇者',
      hint: '全国ツアーカテゴリを10シリーズ以上記録する',
      unlocked: m.tourCatCount.tour >= 10,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.tour, 10, 'シリーズ'),
    },
    {
      id: 'tour-cat-oneman',
      label: 'ワンマンの熱気に飲まれて',
      hint: 'ワンマン単独公演を1シリーズ以上記録する',
      unlocked: m.tourCatCount.one_man >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-cat-oneman-all',
      label: '特別な夜の目撃者',
      hint: 'ワンマン単独公演を4シリーズ以上記録する',
      unlocked: m.tourCatCount.one_man >= 4,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.one_man, 4, 'シリーズ'),
    },
    {
      id: 'tour-cat-online-3',
      label: '画面越しの最前列',
      hint: '配信・FC限定ライブを3シリーズ以上記録する',
      unlocked: m.tourCatCount.online_fc >= 3,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.online_fc, 3, 'シリーズ'),
    },
    {
      id: 'tour-cat-free-3',
      label: '街角に響いたフリーライブ',
      hint: 'フリーライブ・特別企画を2シリーズ以上記録する',
      unlocked: m.tourCatCount.free_special >= 2,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.free_special, 2, 'シリーズ'),
    },
    {
      id: 'tour-indies-era',
      label: 'インディーズの初期衝動',
      hint: '2015〜2017年の初期ライブを1シリーズ以上記録する（映像視聴含む）',
      unlocked:
        m.attendedYears.has('2015') ||
        m.attendedYears.has('2016') ||
        m.attendedYears.has('2017'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-budokan-2019',
      label: '夢の武道館の景色',
      hint: 'one-man tour 2019（日本武道館公演）を記録する',
      unlocked: m.attendedSet.has('tour-oneman-2019'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-travelers-1920',
      label: 'Travelerの航海日誌',
      hint: 'Hall Travelers / ONLINE Arena Travelers を記録する',
      unlocked: hasAny(['tour-hall-travelers-2019', 'live-online-arena-travelers-2020']),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-editorial-2021',
      label: 'Editorialの夜明け',
      hint: 'one-man tour 2021-2022 -Editorial- または発売記念ライブを記録する',
      unlocked: hasAny(['tour-editorial-2021', 'live-editorial-online-free-2021']),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-shocking-nuts-2022',
      label: 'SHOCKING NUTSの衝撃',
      hint: 'SHOCKING NUTS TOUR を記録する',
      unlocked: m.attendedSet.has('tour-shocking-nuts-2022'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-stadium-2025',
      label: 'スタジアムを揺らした歓声',
      hint: 'OFFICIAL HIGE DANDISM LIVE at STADIUM 2025 を記録する',
      unlocked: m.attendedSet.has('tour-stadium-2025'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-asia-2026',
      label: '国境を越えたシンガロング',
      hint: 'アジア・海外公演（Rejoice ASIA / ASIA TOUR 2026 / 韓国公演など）を記録する',
      unlocked: hasAny(['live-korea-understage-2016', 'tour-rejoice-asia-2024', 'tour-asia-2026']),
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
    },

    // C. sacred map (031-052 = 22 items: 14 normal, 8 gold)
    {
      id: 'spot-1',
      label: 'いざ聖地へ！',
      hint: '聖地スポットを1か所以上訪問する',
      unlocked: m.visitedCount >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 1, 'か所'),
    },
    {
      id: 'spot-5',
      label: 'ゆかりの地コレクション',
      hint: '聖地スポットを5か所以上訪問する',
      unlocked: m.visitedCount >= 5,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 5, 'か所'),
    },
    {
      id: 'spot-10',
      label: 'あの風景をこの目で',
      hint: '聖地スポットを10か所以上訪問する',
      unlocked: m.visitedCount >= 10,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 10, 'か所'),
    },
    {
      id: 'spot-20',
      label: '音と景色をつなぐ足あと',
      hint: '聖地スポットを15か所以上訪問する',
      unlocked: m.visitedCount >= 15,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 15, 'か所'),
    },
    {
      id: 'spot-all-32',
      label: '記憶の地図を塗りつぶす旅人',
      hint: '聖地スポットを25か所以上訪問する',
      unlocked: m.visitedCount >= 25,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 25, 'か所'),
    },
    {
      id: 'sanin-roots',
      label: 'はじまりの街の風',
      hint: '島根・鳥取エリアの聖地を1か所以上訪問する',
      unlocked: m.regionVisited.sanin >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 1, 'か所'),
    },
    {
      id: 'sanin-5',
      label: '原点の地をめぐる旅',
      hint: '島根・鳥取エリアの聖地を5か所以上訪問する',
      unlocked: m.regionVisited.sanin >= 5,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 5, 'か所'),
    },
    {
      id: 'sanin-10',
      label: '山陰の路地まで知り尽くす',
      hint: '島根・鳥取エリアの聖地を10か所以上訪問する',
      unlocked: m.regionVisited.sanin >= 10,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 10, 'か所'),
    },
    {
      id: 'sanin-all',
      label: 'ヒゲダンの生まれ育った地',
      hint: '島根・鳥取エリアの聖地を15か所以上訪問する',
      unlocked: m.regionVisited.sanin >= 15,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 15, 'か所'),
    },
    {
      id: 'kanto-memory',
      label: '都会の片隅でみつけた聖地',
      hint: '東京・関東エリアの聖地を1か所以上訪問する',
      unlocked: m.regionVisited.kanto >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, 1, 'か所'),
    },
    {
      id: 'kanto-3',
      label: 'ネオンとメロディの散歩道',
      hint: '関東エリアの聖地を3か所以上訪問する',
      unlocked: m.regionVisited.kanto >= 3,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, 3, 'か所'),
    },
    {
      id: 'kanto-all',
      label: '関東エリアのコンパス',
      hint: '関東エリアの聖地を5か所以上訪問する',
      unlocked: m.regionVisited.kanto >= 5,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, 5, 'か所'),
    },
    {
      id: 'domestic-1',
      label: 'まだ見ぬ街へトランクひとつ',
      hint: '北海道・中部・関西エリアの聖地を1か所以上訪問する',
      unlocked: m.regionVisited.domestic_other >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'domestic-all',
      label: 'TRAVEL FANTASISTA',
      hint: '北海道・中部・関西エリアの聖地を4か所以上訪問する',
      unlocked: m.regionVisited.domestic_other >= 4,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.domestic_other, 4, 'か所'),
    },
    {
      id: 'overseas-1',
      label: 'ちょっと遠い国へ行って',
      hint: '海外エリア（台北・グアム・LA・NYなど）の聖地を1か所以上訪問する',
      unlocked: m.regionVisited.overseas >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'overseas-all',
      label: 'パスポートにヒゲダンの記憶',
      hint: '海外エリアの聖地を2か所以上訪問する',
      unlocked: m.regionVisited.overseas >= 2,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.overseas, 2, 'か所'),
    },
    {
      id: 'spot-cat-mv-all',
      label: 'MVの風景を追いかけて',
      hint: 'MVロケ地カテゴリの聖地を5か所以上訪問する',
      unlocked: (m.spotCategoryStats['MVロケ地']?.visited ?? 0) >= 5,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.spotCategoryStats['MVロケ地']?.visited ?? 0, 5, 'か所'),
    },
    {
      id: 'spot-cat-venue-all',
      label: 'Clap Clap',
      hint: 'ライブ会場カテゴリの聖地を6か所以上訪問する',
      unlocked: (m.spotCategoryStats['ライブ会場']?.visited ?? 0) >= 6,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.spotCategoryStats['ライブ会場']?.visited ?? 0, 6, 'か所'),
    },
    {
      id: 'spot-cat-memory-all',
      label: '4人の青春の足あと',
      hint: 'メンバーの思い出カテゴリの聖地を5か所以上訪問する',
      unlocked: (m.spotCategoryStats['メンバーの思い出']?.visited ?? 0) >= 5,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.spotCategoryStats['メンバーの思い出']?.visited ?? 0, 5, 'か所'),
    },
    {
      id: 'spot-cat-rec-all',
      label: 'お墨付きの寄り道',
      hint: 'メンバーのおすすめスポット（岡本一銭屋・勝田神社）を両方訪問する',
      unlocked:
        m.visitedSpotSet.has('spot-okamoto-issenya') &&
        m.visitedSpotSet.has('spot-kanda-shrine-yonago'),
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'spot-town-4',
      label: '街角にひそむヒゲダンの気配',
      hint: '「街とヒゲダン」カテゴリのスポットを4か所以上訪問する',
      unlocked: (m.spotCategoryStats['街とヒゲダン']?.visited ?? 0) >= 4,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.spotCategoryStats['街とヒゲダン']?.visited ?? 0, 4, 'か所'),
    },
    {
      id: 'spot-twin-stadium',
      label: '二大スタジアムのアンセム',
      hint: '日産スタジアムとヤンマースタジアム長居の両方を訪問する',
      unlocked:
        m.visitedSpotSet.has('spot-nissan-stadium') &&
        m.visitedSpotSet.has('spot-yanmar-stadium'),
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },

    // D. setlist (053-074 = 22 items: 16 normal, 6 gold)
    {
      id: 'setlist-create-1',
      label: 'それじゃ夢の中へ',
      hint: 'MYセトリに最初の1曲を追加する',
      unlocked: m.maxSetlistSongs >= 1,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'first-setlist',
      label: 'ちいさなミニライブ開幕',
      hint: 'MYセトリに3曲以上並べる',
      unlocked: m.maxSetlistSongs >= 3,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 3, '曲'),
    },
    {
      id: 'setlist-7',
      label: 'フェス枠のセットリスト',
      hint: '1つのMYセトリに7曲以上並べる',
      unlocked: m.maxSetlistSongs >= 7,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 7, '曲'),
    },
    {
      id: 'setlist-12',
      label: 'ホール公演の演出家',
      hint: '1つのMYセトリに12曲以上並べる',
      unlocked: m.maxSetlistSongs >= 12,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 12, '曲'),
    },
    {
      id: 'setlist-18',
      label: '夢のフルスケール公演',
      hint: '18曲以上の本格ワンマンセットリストを組む',
      unlocked: m.maxSetlistSongs >= 18,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 18, '曲'),
    },
    {
      id: 'encore-night',
      label: '鳴りやまないアンコール',
      hint: 'アンコール曲入りのMYセトリを作成する',
      unlocked: m.maxEncoreCount >= 1,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-opening-trio',
      label: '奇跡の開幕3曲シンクロ',
      hint: 'MYセトリの最初の3曲の並びが実際のライブ公演の開幕3曲と一致する',
      unlocked: m.matchesRealOpeningTrio,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-custom-title',
      label: '自分だけのツアーに名を',
      hint: 'MYセトリにオリジナルの公演タイトルをつける',
      unlocked: m.hasCustomSetlistTitle,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'multi-setlist',
      label: 'ふたつめの妄想ステージ',
      hint: '2つ以上のMYセトリを保存する',
      unlocked: m.savedSetlistCount >= 2,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 2, '件'),
    },
    {
      id: 'saved-setlist-3',
      label: '気分で着替える3つの宴',
      hint: '3つ以上のMYセトリを保存する',
      unlocked: m.savedSetlistCount >= 3,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 3, '件'),
    },
    {
      id: 'saved-setlist-5',
      label: 'セットリスト編集長',
      hint: '5つ以上のMYセトリを保存する',
      unlocked: m.savedSetlistCount >= 5,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 5, '件'),
    },
    {
      id: 'saved-setlist-10',
      label: '夢の公演アーカイブ館長',
      hint: '10個以上のMYセトリを保存する',
      unlocked: m.savedSetlistCount >= 10,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 10, '件'),
    },
    {
      id: 'setlist-115-opener',
      label: '115万キロから始まる夜',
      hint: '5曲以上のMYセトリの1曲目に「115万キロのフィルム」を配置する',
      unlocked: m.has115ManKiloOpening,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-anthem-finale',
      label: '涙と笑顔の大団円',
      hint: '5曲以上のMYセトリの一番最後（アンコール含む最終曲）を「宿命 / Stand By You / ラストソング」のいずれかで締める',
      unlocked: m.hasAnthemFinale,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-upper-beat',
      label: '灼熱のアッパー・フロア',
      hint: '6曲以上で平均BPM 130以上の勢いあるセトリを組む',
      unlocked: m.hasHighBpmSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-ballad-night',
      label: '星降るバラード夜会',
      hint: 'バラード系楽曲を4曲以上入れたセトリを組む',
      unlocked: m.hasBalladSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-piano-brass',
      label: '鍵盤とブラスの饗宴',
      hint: 'ピアノポップ系3曲以上＋ブラス・ファンク系3曲以上を1つのセトリに組む',
      unlocked: m.hasBrassAndPianoSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-high-tone',
      label: 'ハイトーンの極限へ',
      hint: '地声最高音 hiD 以上の難曲を5曲以上組み込んだ挑戦セトリを作成する',
      unlocked: m.hasHighToneSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-album-tribute',
      label: 'My Favorite Album',
      hint: '同じ収録作品（アルバム）の曲を7曲以上入れたコンセプトセトリを作成する',
      unlocked: m.hasAlbumConceptSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-five-eras',
      label: '時代を駆け抜けるタイムマシン',
      hint: '10曲以上で初期〜最新までの全5時代の楽曲を1つのセトリに揃える',
      unlocked: m.hasAllFiveErasSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-four-creators',
      label: '4人のペンが交差する夜',
      hint: '藤原曲に加え「Rowan」「旅は道連れ」「フィラメント」などメンバー4人全員の制作曲を1つのセトリに揃える',
      unlocked: m.hasAllFourMemberSongs,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'higedan-same-sensibility',
      label: '拍手喝采のマイ・ベスト公演',
      hint: '12曲以上・アンコール2曲以上・オリジナルタイトル付きのMYセトリを作成し、SNSシェア画像を生成する',
      unlocked: Boolean(input.generatedSetlistShareImage) && m.hasBestLiveSetlist,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },

    // E. quiz (075-094 = 20 items: 15 normal, 5 gold)
    {
      id: 'quiz-starter',
      label: 'はじめてのクイズ挑戦状',
      hint: '検定を1セット完了する',
      unlocked: m.completedSets >= 1,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 1, 'セット'),
    },
    {
      id: 'quiz-3',
      label: '知識欲に火がついた',
      hint: '検定を3セット完了する',
      unlocked: m.completedSets >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 3, 'セット'),
    },
    {
      id: 'quiz-6',
      label: '検定ロードの折り返し',
      hint: '検定を6セット完了する',
      unlocked: m.completedSets >= 6,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 6, 'セット'),
    },
    {
      id: 'quiz-9',
      label: '難問の森を突き進む',
      hint: '検定を9セット完了する',
      unlocked: m.completedSets >= 9,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 9, 'セット'),
    },
    {
      id: 'quiz-all-12',
      label: '12のステージを駆け抜けて',
      hint: '全コース計12セットの検定すべてを完了する',
      unlocked: m.completedSets >= 12,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 12, 'セット'),
    },
    {
      id: 'quiz-beginner-done',
      label: '髭団のたまご卒業',
      hint: '初級コース（Vol.1 / Vol.2）を両方完了する',
      unlocked: m.courseDone.beginner >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.beginner, 2, 'セット'),
    },
    {
      id: 'quiz-intermediate-done',
      label: 'ディープな沼の案内役',
      hint: '中級コース（Vol.1 / Vol.2）を両方完了する',
      unlocked: m.courseDone.intermediate >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.intermediate, 2, 'セット'),
    },
    {
      id: 'quiz-brothers-done',
      label: '難問 BROTHERS級の生還者',
      hint: '難問 BROTHERS級コース（Vol.1 / Vol.2）を両方完了する',
      unlocked: m.courseDone.brothers >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.brothers, 2, 'セット'),
    },
    {
      id: 'quiz-allcourse-half',
      label: 'ディスコグラフィの探検家',
      hint: '全曲総合コース（Vol.1〜6）のうち3セット以上を完了する',
      unlocked: m.courseDone.all >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.all, 3, 'セット'),
    },
    {
      id: 'quiz-allcourse-done',
      label: '完全踏破',
      hint: '全曲総合コース Vol.1〜Vol.6 をすべて完了する',
      unlocked: m.courseDone.all >= 6,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.all, 6, 'セット'),
    },
    {
      id: 'quiz-score-70',
      label: '50%',
      hint: '検定で正答率50%以上を記録する',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 50,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-master',
      label: '溢れるヒゲダン愛',
      hint: '検定で正答率80%以上を記録する',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 80,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-score-90',
      label: '完璧まであとひとかけ',
      hint: '検定で正答率90%以上を記録する',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 90,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-perfect-1',
      label: '満点のファンファーレ',
      hint: 'いずれかの検定セットで100%（全問正解）を達成する',
      unlocked: m.perfectSets >= 1,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 1, 'セット'),
    },
    {
      id: 'quiz-perfect-3',
      label: '知識のハットトリック',
      hint: '3セット以上で100%（全問正解）を達成する',
      unlocked: m.perfectSets >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 3, 'セット'),
    },
    {
      id: 'quiz-perfect-6',
      label: 'もはや関係者',
      hint: '6セット以上で100%（全問正解）を達成する',
      unlocked: m.perfectSets >= 6,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 6, 'セット'),
    },
    {
      id: 'quiz-beginner-perfect',
      label: 'ウォーミングアップ完了',
      hint: '初級コース Vol.1 / Vol.2 を両方100%でクリアする',
      unlocked: m.coursePerfect.beginner >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-intermediate-perfect',
      label: '頼れる先輩髭団',
      hint: '中級コース Vol.1 / Vol.2 を両方100%でクリアする',
      unlocked: m.coursePerfect.intermediate >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-brothers-perfect',
      label: '髭男知識のグランドマスター',
      hint: 'BROTHERS級コース Vol.1 / Vol.2 を両方100%でクリアする',
      unlocked: m.coursePerfect.brothers >= 2,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-grand-master',
      label: 'ノーダウト',
      hint: '全12セットすべてで100%（全問正解）を達成する',
      unlocked: m.perfectSets >= 12,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 12, 'セット'),
    },

    // F. explore (095-114 = 20 items: 17 normal, 3 gold)
    {
      id: 'song-read-1',
      label: '1ページ目のライナーノーツ',
      hint: '個別の楽曲解説ページを1曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 1,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 1, '曲'),
    },
    {
      id: 'song-read-5',
      label: '曲の秘密を知りし者',
      hint: '個別の楽曲解説ページを5曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 5,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 5, '曲'),
    },
    {
      id: 'song-read-15',
      label: '音と言葉に酔いしれて',
      hint: '個別の楽曲解説ページを15曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 15,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 15, '曲'),
    },
    {
      id: 'song-read-30',
      label: '深まる楽曲のラビリンス',
      hint: '個別の楽曲解説ページを30曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 30,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 30, '曲'),
    },
    {
      id: 'song-read-50',
      label: '55',
      hint: '個別の楽曲解説ページを55曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 55,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 55, '曲'),
    },
    {
      id: 'song-read-75',
      label: '全曲制覇のカウントダウン',
      hint: '個別の楽曲解説ページを75曲読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 75,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 75, '曲'),
    },
    {
      id: 'song-read-all-90',
      label: 'すべての物語を抱きしめて',
      hint: '個別の楽曲解説ページを90曲以上読む',
      areaHint: '楽曲ページ',
      unlocked: m.readSongCount >= 90,
      category: 'explore',
      tier: 'gold',
      progressText: formatStampProgress(m.readSongCount, 90, '曲'),
    },
    {
      id: 'album-read-lovepeace',
      label: 'ラブとピースは君の中',
      hint: '「ラブとピースは君の中」収録8曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'ラブとピースは君の中'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'ラブとピースは君の中'),
    },
    {
      id: 'album-read-manmirror',
      label: 'MAN IN THE MIRROR',
      hint: '「MAN IN THE MIRROR」収録6曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'MAN IN THE MIRROR'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'MAN IN THE MIRROR'),
    },
    {
      id: 'album-read-report',
      label: 'レポート',
      hint: '「レポート」収録7曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'レポート'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'レポート'),
    },
    {
      id: 'album-read-escaparade',
      label: 'エスカパレード',
      hint: '「エスカパレード」収録13曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'エスカパレード'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'エスカパレード'),
    },
    {
      id: 'album-read-traveler',
      label: 'Traveler',
      hint: '「Traveler」収録13曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Traveler'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Traveler'),
    },
    {
      id: 'album-read-editorial',
      label: 'Editorial',
      hint: '「Editorial」収録14曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Editorial'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Editorial'),
    },
    {
      id: 'album-read-rejoice',
      label: 'Rejoice',
      hint: '「Rejoice」収録15曲の楽曲ページをすべて読む',
      areaHint: '楽曲ページ',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Rejoice'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Rejoice'),
    },
    {
      id: 'song-read-member-trio',
      label: 'それぞれの音楽性',
      hint: '「Rowan」「旅は道連れ」「フィラメント」の3曲の解説をすべて読む',
      areaHint: '楽曲ページ',
      unlocked: FOUR_MEMBER_SONG_IDS.every((id) => m.readSongSet.has(id)),
      category: 'explore',
      tier: 'gold',
    },
    {
      id: 'mood-first',
      label: '今日のわたしに届く1曲',
      hint: '「今日の1曲診断」に最後まで答えて1曲を受け取る',
      areaHint: '今日の1曲診断',
      unlocked: m.moodCompletedCount >= 1,
      category: 'explore',
      tier: 'normal',
    },
    {
      id: 'mood-three',
      label: '気分の処方箋コレクター',
      hint: '「今日の1曲診断」を3回以上完了する',
      areaHint: '今日の1曲診断',
      unlocked: m.moodCompletedCount >= 3,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.moodCompletedCount, 3, '回'),
    },
    {
      id: 'mood-all-four',
      label: '喜怒哀楽を愛す者',
      hint: '「今日の1曲診断」で最初の質問（4種類の気分すべて）を完走する',
      areaHint: '今日の1曲診断',
      unlocked: m.completedMoodsCount >= 4,
      category: 'explore',
      tier: 'gold',
      progressText: formatStampProgress(m.completedMoodsCount, 4, '気分'),
    },
    {
      id: 'vocal-range-visit',
      label: 'カラオケの達人',
      hint: '「掲載90曲の音域・発売日一覧」ページを開く',
      areaHint: '音域・発売日一覧',
      unlocked: input.visitedVocalRange,
      category: 'explore',
      tier: 'normal',
    },
    {
      id: 'archive-visit',
      label: 'インタビュー資料室の常連',
      hint: '「参考記事・インタビュー・SNS一覧」ページを開く',
      areaHint: '参考記事・インタビュー・SNS',
      unlocked: input.visitedReferenceArchive,
      category: 'explore',
      tier: 'normal',
    },
  ];

  const first114UnlockedCount = first114.filter((stamp) => stamp.unlocked).length;
  const allStamps: MyNoteStampDraft[] = [
    ...first114,
    {
      id: 'complete-115',
      label: '115万キロのフィルム',
      hint: 'ほかのスタンプを92個以上集めて最高ランクに到達する',
      areaHint: 'サイト全体',
      unlocked: first114UnlockedCount >= 92,
      category: 'profile',
      tier: 'gold',
      progressText: formatStampProgress(first114UnlockedCount, 92, '個'),
    },
  ];

  return allStamps.map((stamp, idx) => ({
    ...stamp,
    serialNumber: idx + 1,
    serialCode: String(idx + 1).padStart(3, '0'),
  }));
}

export function buildMyNoteStamps(input: MyNoteEngagementInput): MyNoteStampItem[] {
  return buildStampsFromMetrics(input, computeMetrics(input));
}

export function buildMyNoteSnapshot(input: MyNoteEngagementInput): {
  stamps: MyNoteStampItem[];
  rank: MyNoteRankSummary;
  radar: MyNoteRadarSummary;
  playstyle: MyNotePlaystyleSummary;
} {
  const metrics = computeMetrics(input);
  const stamps = buildStampsFromMetrics(input, metrics);
  const rank = buildMyNoteRank(stamps);
  const playstyle = buildMyNotePlaystyle(metrics.radar);
  return { stamps, rank, radar: metrics.radar, playstyle };
}
