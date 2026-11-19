import {
  HIGEDAN_SONGS,
  SACRED_SPOTS,
  TOUR_ARCHIVES,
  type SacredSpot,
  type SongItem,
  type TourArchive,
  type TourArchiveCategory,
  type TourSetlistTrack,
} from '../data/higedanData';
import tourSetlistBundle from '../data/tourSetlistRecords.json';
import {
  QUIZ_COURSES,
  type CourseDifficulty,
  type QuestionScopeFilter,
} from '../components/quiz/quizCourses';
import {
  quizVolumeKey,
  type QuizVolumeRecord,
  type QuizVolumeRecordMap,
} from '../components/quiz/quizVolumeRecords';
import { normalizeSetlistOrder, type SetlistEntry } from './setlist';
import {
  SACRED_SPOT_REGIONS,
  getSacredSpotRegion,
  type SacredSpotRegion,
} from './sacredSpotAreas';
import type { SavedSetlistItem } from './savedSetlists';

export interface AttendedTourYearGroup {
  year: string;
  tours: TourArchive[];
}

export interface AttendedTimelineSummary {
  totalAttended: number;
  totalSeries: number;
  yearCount: number;
  years: AttendedTourYearGroup[];
}

export interface SacredRegionProgress {
  id: Exclude<SacredSpotRegion, 'all'>;
  label: string;
  visited: number;
  total: number;
  visitedSpots: SacredSpot[];
}

export interface SacredProgressSummary {
  totalVisited: number;
  totalCheckable: number;
  regions: SacredRegionProgress[];
  visitedSpots: SacredSpot[];
}

export interface QuizCourseVolumeStatus {
  scope: QuestionScopeFilter;
  volNumber: number;
  record: QuizVolumeRecord | null;
}

export interface QuizCourseRecordGroup {
  id: CourseDifficulty;
  title: string;
  indexCode: string;
  volumes: QuizCourseVolumeStatus[];
}

export interface QuizRecordSummary {
  bestQuizScore: number | null;
  completedSets: number;
  totalSets: number;
  perfectSets: number;
  courses: QuizCourseRecordGroup[];
}

export type MyNoteStampCategory =
  | 'welcome'
  | 'tour'
  | 'spot'
  | 'setlist'
  | 'quiz'
  | 'explore'
  | 'profile';

export type MyNoteStampTier = 'normal' | 'gold';

export type MyNoteDetailTab = 'tours' | 'spots' | 'setlists' | 'quiz';

export interface MyNoteStampItem {
  id: string;
  serialNumber: number;
  serialCode: string;
  label: string;
  hint: string;
  areaHint?: string;
  unlocked: boolean;
  category: MyNoteStampCategory;
  tier: MyNoteStampTier;
  progressText?: string;
  targetTab?: MyNoteDetailTab;
}

type MyNoteStampDraft = Omit<MyNoteStampItem, 'serialNumber' | 'serialCode'>;

const SECRET_STAMP_CATEGORY_LOCATIONS: Record<MyNoteStampCategory, string> = {
  welcome: 'マイノート',
  profile: 'サイト全体',
  tour: '歴代ツアー記録',
  spot: '聖地巡礼マップ',
  setlist: 'MYセトリ作成',
  quiz: 'Official髭男dism検定',
  explore: '楽曲ガイド',
};

export function getStampLocationHint(
  stamp: Pick<MyNoteStampItem, 'category' | 'areaHint'>,
): string {
  return stamp.areaHint ?? SECRET_STAMP_CATEGORY_LOCATIONS[stamp.category];
}

export interface MyNoteStampDisplayDetails {
  isSecretLocked: boolean;
  tileLabel: string;
  titleText: string;
  progressLabel: string;
  descriptionText: string;
  buttonAriaLabel: string;
}

export function getStampDisplayDetails(stamp: MyNoteStampItem): MyNoteStampDisplayDetails {
  if (stamp.unlocked) {
    return {
      isSecretLocked: false,
      tileLabel: stamp.label,
      titleText: stamp.label,
      progressLabel: stamp.progressText ?? '達成済み',
      descriptionText: stamp.hint,
      buttonAriaLabel: `No.${stamp.serialCode} ${
        stamp.tier === 'gold' ? '特別称号 ' : ''
      }${stamp.label}（獲得済み）：${stamp.hint}`,
    };
  }

  if (stamp.tier === 'gold') {
    const locationHint = getStampLocationHint(stamp);
    const maskedHint = `??????（${locationHint}）`;
    return {
      isSecretLocked: true,
      tileLabel: '???',
      titleText: '未獲得',
      progressLabel: '未達成',
      descriptionText: maskedHint,
      buttonAriaLabel: `No.${stamp.serialCode} 特別称号（未獲得）：${maskedHint}`,
    };
  }

  return {
    isSecretLocked: false,
    tileLabel: '???',
    titleText: '未獲得（達成条件）',
    progressLabel: stamp.progressText ?? '未達成',
    descriptionText: stamp.hint,
    buttonAriaLabel: `No.${stamp.serialCode} 記念スタンプ（未獲得）：${stamp.hint}`,
  };
}

export function formatStampProgress(current: number, target: number, unit: string): string {
  const safeCurrent = Math.max(0, current);
  if (safeCurrent >= target) return '達成済み';
  return `現在 ${safeCurrent} / ${target}${unit}（あと${target - safeCurrent}${unit}）`;
}

export interface MyNoteRankSummary {
  title: string;
  subtitle: string;
  unlockedCount: number;
  totalStamps: number;
  unlockedGoldCount: number;
  totalGoldStamps: number;
  progressPercent: number;
  nextMilestoneText: string;
}

export interface MyNoteRadarAxis {
  id: string;
  label: string;
  value: number;
  rawLabel: string;
}

export interface MyNoteRadarSummary {
  hasAnyActivity: boolean;
  axes: MyNoteRadarAxis[];
}

export interface MyNoteEngagementInput {
  noteOpened: boolean;
  hasCustomNickname: boolean;
  exportedBackup: boolean;
  attendedTourIds: readonly string[];
  visitedSpotIds: readonly string[];
  setlists: readonly Pick<SavedSetlistItem, 'title' | 'entries'>[];
  savedSetlistCount: number;
  hasCustomSetlistTitle: boolean;
  quizVolumeScores: QuizVolumeRecordMap;
  bestQuizScore: number | null;
  votedSongCount: number;
  reviewCount: number;
  readSongIds: readonly string[];
  completedMoods: readonly string[];
  moodCompletedCount: number;
  visitedVocalRange: boolean;
  visitedReferenceArchive: boolean;
}

const VALID_SONG_IDS = new Set(HIGEDAN_SONGS.map((song) => song.id));
const SONG_BY_ID = new Map(HIGEDAN_SONGS.map((song) => [song.id, song]));
const CHECKABLE_SPOTS = SACRED_SPOTS.filter((spot) => spot.mapScope !== 'none');
const VALID_TOUR_IDS = new Set(TOUR_ARCHIVES.map((t) => t.id));
const VALID_CHECKABLE_SPOT_IDS = new Set(CHECKABLE_SPOTS.map((s) => s.id));

const ALBUM_SONGS_MAP = new Map<string, string[]>();
for (const song of HIGEDAN_SONGS) {
  const list = ALBUM_SONGS_MAP.get(song.album) ?? [];
  list.push(song.id);
  ALBUM_SONGS_MAP.set(song.album, list);
}

const { realConcertSignatures, realOpeningTrios } = (() => {
  const full = new Set<string>();
  const openings = new Set<string>();
  const templates = (tourSetlistBundle as { templates: Record<string, TourSetlistTrack[]> }).templates;
  for (const tracks of Object.values(templates)) {
    const entries: SetlistEntry[] = [];
    for (const track of tracks) {
      if (!track.songId || !VALID_SONG_IDS.has(track.songId)) continue;
      entries.push({ songId: track.songId, isEncore: Boolean(track.isEncore) });
    }
    const normalized = normalizeSetlistOrder(entries);
    if (normalized.length >= 3) {
      full.add(normalized.map((entry) => entry.songId).join(','));
      openings.add(normalized.slice(0, 3).map((entry) => entry.songId).join(','));
    }
  }
  return { realConcertSignatures: full, realOpeningTrios: openings };
})();

export const REAL_CONCERT_SETLIST_SIGNATURES = realConcertSignatures;
export const REAL_CONCERT_OPENING_TRIOS = realOpeningTrios;

const ANTHEM_FINALE_IDS = new Set(['shukumei', 'stand-by-you', 'last-song']);
const FOUR_MEMBER_SONG_IDS = ['rowan-song', 'tabi-wa-michizure', 'filament-song'] as const;

export function buildAttendedTimeline(
  tours: readonly TourArchive[],
  attendedIds: readonly string[],
): AttendedTimelineSummary {
  const attendedSet = new Set(attendedIds);
  const matched = tours
    .filter((tour) => attendedSet.has(tour.id))
    .sort((a, b) => b.endDate.localeCompare(a.endDate) || b.startDate.localeCompare(a.startDate));

  const byYear = new Map<string, TourArchive[]>();
  for (const tour of matched) {
    const year = /^\d{4}/.test(tour.startDate) ? tour.startDate.slice(0, 4) : 'その他';
    const list = byYear.get(year) ?? [];
    list.push(tour);
    byYear.set(year, list);
  }

  const years = [...byYear.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, list]) => ({ year, tours: list }));

  return {
    totalAttended: matched.length,
    totalSeries: tours.length,
    yearCount: years.length,
    years,
  };
}

export function buildSacredProgressByRegion(
  spots: readonly SacredSpot[],
  visitedIds: readonly string[],
): SacredProgressSummary {
  const visitedSet = new Set(visitedIds);
  const checkableSpots = spots.filter((spot) => spot.mapScope !== 'none');
  const regions = SACRED_SPOT_REGIONS.filter(
    (region): region is { id: Exclude<SacredSpotRegion, 'all'>; label: string } =>
      region.id !== 'all',
  ).map((region) => {
    const inRegion = checkableSpots.filter(
      (spot) => getSacredSpotRegion(spot.area) === region.id,
    );
    const visitedInRegion = inRegion.filter((spot) => visitedSet.has(spot.id));
    return {
      id: region.id,
      label: region.label,
      visited: visitedInRegion.length,
      total: inRegion.length,
      visitedSpots: visitedInRegion,
    };
  });

  const visitedSpots = checkableSpots.filter((spot) => visitedSet.has(spot.id));
  return {
    totalVisited: visitedSpots.length,
    totalCheckable: checkableSpots.length,
    regions,
    visitedSpots,
  };
}

export function buildQuizRecordSummary(
  volumeScores: QuizVolumeRecordMap,
  bestQuizScore: number | null,
): QuizRecordSummary {
  let completedSets = 0;
  let totalSets = 0;
  let perfectSets = 0;

  const courses: QuizCourseRecordGroup[] = QUIZ_COURSES.map((course) => {
    const volumeCount = course.id === 'all' ? 6 : 2;
    const volumes: QuizCourseVolumeStatus[] = Array.from(
      { length: volumeCount },
      (_, idx) => {
        const volNumber = idx + 1;
        const scope = `vol${volNumber}` as QuestionScopeFilter;
        const record = volumeScores[quizVolumeKey(course.id, scope)] ?? null;
        totalSets += 1;
        if (record) {
          completedSets += 1;
          if (record.score === record.total) perfectSets += 1;
        }
        return { scope, volNumber, record };
      },
    );
    return {
      id: course.id,
      title: course.title,
      indexCode: course.indexCode,
      volumes,
    };
  });

  return {
    bestQuizScore,
    completedSets,
    totalSets,
    perfectSets,
    courses,
  };
}

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
  matchesRealConcertSetlist: boolean;
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
  let matchesRealConcertSetlist = false;
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

    if (len >= 3) {
      const signature = normalized.map((entry) => entry.songId).join(',');
      if (realConcertSignatures.has(signature)) matchesRealConcertSetlist = true;
      const openingKey = normalized.slice(0, 3).map((entry) => entry.songId).join(',');
      if (realOpeningTrios.has(openingKey)) matchesRealOpeningTrio = true;
    }

    const songsInList: SongItem[] = [];
    for (const entry of normalized) {
      const song = SONG_BY_ID.get(entry.songId);
      if (song) songsInList.push(song);
    }
    const idSet = new Set(songsInList.map((song) => song.id));

    if (len >= 4 && FOUR_MEMBER_SONG_IDS.every((id) => idSet.has(id))) {
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
    matchesRealConcertSetlist,
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
  const hasCategoryComplete = (cat: string) => {
    const stat = m.spotCategoryStats[cat];
    return Boolean(stat && stat.total > 0 && stat.visited >= stat.total);
  };

  const first114: MyNoteStampDraft[] = [
    // 1. welcome & profile (8 items here + complete-115 at the end = 9)
    {
      id: 'welcome',
      label: 'ようこそ！',
      hint: 'マイノートを開いた記念スタンプ',
      unlocked: input.noteOpened,
      category: 'welcome',
      tier: 'normal',
    },
    {
      id: 'named-note',
      label: '名入れ完了',
      hint: 'マイノートのお名前を設定する',
      unlocked: input.hasCustomNickname,
      category: 'profile',
      tier: 'normal',
    },
    {
      id: 'backup-keeper',
      label: '記録の守り手',
      hint: '記録データをファイルに保存してバックアップ',
      areaHint: 'マイノート',
      unlocked: input.exportedBackup,
      category: 'profile',
      tier: 'normal',
    },
    {
      id: 'two-pillars',
      label: '2つの扉をひらく',
      hint: 'ライブ・聖地・MYセトリ・検定・楽曲探索の5分野のうち、2分野以上で記録を残す',
      unlocked: m.activeRadarAxes >= 2,
      category: 'profile',
      tier: 'normal',
      progressText: formatStampProgress(m.activeRadarAxes, 2, '分野'),
    },
    {
      id: 'balanced-three',
      label: '3つの扉をひらく',
      hint: 'ライブ・聖地・MYセトリ・検定・楽曲探索の5分野のうち、3分野以上で記録を残す',
      unlocked: m.activeRadarAxes >= 3,
      category: 'profile',
      tier: 'gold',
      progressText: formatStampProgress(m.activeRadarAxes, 3, '分野'),
    },
    {
      id: 'four-pillars',
      label: '4つの扉をひらく',
      hint: 'ライブ・聖地・MYセトリ・検定・楽曲探索の5分野のうち、4分野以上で記録を残す',
      unlocked: m.activeRadarAxes >= 4,
      category: 'profile',
      tier: 'normal',
      progressText: formatStampProgress(m.activeRadarAxes, 4, '分野'),
    },
    {
      id: 'all-five-pillars',
      label: '5分野オールラウンダー',
      hint: 'ライブ・聖地・MYセトリ・検定・楽曲探索の5分野すべてで記録を残す',
      unlocked: m.activeRadarAxes >= 5,
      category: 'profile',
      tier: 'gold',
      progressText: formatStampProgress(m.activeRadarAxes, 5, '分野'),
    },
    {
      id: 'tour-five-years',
      label: '5年をまたぐライブ史',
      hint: '異なる5年以上のライブ・ツアーを歴代ツアー記録でチェック',
      unlocked: m.attendedYears.size >= 5,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedYears.size, 5, '年'),
    },

    // 2. tour archive (22 items: 16 normal, 6 gold)
    {
      id: 'tour-1',
      label: '初ライブ記録',
      hint: '歴代ツアー記録から参戦・視聴を1件チェック',
      unlocked: m.attendedCount >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 1, '件'),
    },
    {
      id: 'tour-3',
      label: 'ライブ3公演の記憶',
      hint: '歴代ツアー・公演を3シリーズ以上チェック',
      unlocked: m.attendedCount >= 3,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 3, '件'),
    },
    {
      id: 'tour-5',
      label: 'ツアー通',
      hint: '5シリーズ以上のライブ・ツアーを記録',
      unlocked: m.attendedCount >= 5,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 5, '件'),
    },
    {
      id: 'tour-10',
      label: 'ライブ10シリーズ',
      hint: '10シリーズ以上のライブ・ツアーを記録',
      unlocked: m.attendedCount >= 10,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 10, '件'),
    },
    {
      id: 'tour-15',
      label: '音の履歴書',
      hint: '15シリーズ以上のライブ・ツアーを記録',
      unlocked: m.attendedCount >= 15,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 15, '件'),
    },
    {
      id: 'tour-20',
      label: 'ライブ20本突破',
      hint: '20シリーズ以上のライブ・ツアーを記録',
      unlocked: m.attendedCount >= 20,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 20, '件'),
    },
    {
      id: 'tour-30',
      label: 'ツアー記録マスター',
      hint: '30シリーズ以上のライブ・ツアーを記録',
      unlocked: m.attendedCount >= 30,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, 30, '件'),
    },
    {
      id: 'tour-all-37',
      label: '全37シリーズ完全網羅',
      hint: '掲載中の全37公演シリーズをチェック',
      unlocked: m.attendedCount >= TOUR_ARCHIVES.length,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.attendedCount, TOUR_ARCHIVES.length, '件'),
    },
    {
      id: 'tour-cat-tour-1',
      label: '全国ツアーの旅へ',
      hint: 'ツアーカテゴリから1シリーズ以上を記録',
      unlocked: m.tourCatCount.tour >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-cat-tour-8',
      label: 'ツアー常連組',
      hint: '全国ツアーシリーズを8本以上記録',
      unlocked: m.tourCatCount.tour >= 8,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.tour, 8, '本'),
    },
    {
      id: 'tour-cat-tour-16',
      label: '全国ツアー全制覇',
      hint: '掲載中の全16本のツアーシリーズをすべてチェック',
      unlocked: m.tourCatCount.tour >= 16,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.tour, 16, '本'),
    },
    {
      id: 'tour-cat-oneman',
      label: 'ワンマンライブの熱狂',
      hint: 'ワンマン単独公演シリーズを1本以上記録',
      unlocked: m.tourCatCount.one_man >= 1,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-cat-oneman-all',
      label: '単独公演コンプリート',
      hint: '掲載中のワンマン単独公演7シリーズをすべて記録',
      unlocked: m.tourCatCount.one_man >= 7,
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.one_man, 7, '本'),
    },
    {
      id: 'tour-cat-online-3',
      label: '画面越しの最前列',
      hint: '配信・FC限定ライブを3シリーズ以上記録',
      unlocked: m.tourCatCount.online_fc >= 3,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.online_fc, 3, '本'),
    },
    {
      id: 'tour-cat-free-3',
      label: 'フリーライブの熱気',
      hint: 'フリーライブ・特別企画を3シリーズ以上記録',
      unlocked: m.tourCatCount.free_special >= 3,
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
      progressText: formatStampProgress(m.tourCatCount.free_special, 3, '本'),
    },
    {
      id: 'tour-indies-era',
      label: 'インディーズの鼓動',
      hint: '2015〜2017年の初期ライブ・ツアーを1本以上記録',
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
      label: '武道館の景色',
      hint: 'one-man tour 2019（日本武道館公演）を記録',
      unlocked: m.attendedSet.has('tour-oneman-2019'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-travelers-1920',
      label: 'Travelerの航海',
      hint: 'Hall Travelers / ONLINE Arena Travelers を記録',
      unlocked: hasAny(['tour-hall-travelers-2019', 'live-online-arena-travelers-2020']),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-editorial-2021',
      label: 'Editorialの夜明け',
      hint: 'one-man tour 2021-2022 -Editorial- または発売記念ライブを記録',
      unlocked: hasAny(['tour-editorial-2021', 'live-editorial-online-free-2021']),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-shocking-nuts-2022',
      label: 'SHOCKING NUTSの衝撃',
      hint: 'SHOCKING NUTS TOUR を記録',
      unlocked: m.attendedSet.has('tour-shocking-nuts-2022'),
      category: 'tour',
      tier: 'normal',
      targetTab: 'tours',
    },
    {
      id: 'tour-stadium-2025',
      label: 'スタジアムの歓声',
      hint: 'OFFICIAL HIGE DANDISM LIVE at STADIUM 2025 を記録',
      unlocked: m.attendedSet.has('tour-stadium-2025'),
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
    },
    {
      id: 'tour-asia-2026',
      label: '海を越えるLIVE',
      hint: 'アジア・海外公演（Rejoice ASIA / ASIA TOUR 2026 / 韓国公演）を記録',
      unlocked: hasAny(['live-korea-understage-2016', 'tour-rejoice-asia-2024', 'tour-asia-2026']),
      category: 'tour',
      tier: 'gold',
      targetTab: 'tours',
    },

    // 3. sacred map (22 items: 15 normal, 7 gold)
    {
      id: 'spot-1',
      label: '聖地はじめの一歩',
      hint: '聖地巡礼マップで最初の1か所をチェック',
      unlocked: m.visitedCount >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 1, 'か所'),
    },
    {
      id: 'spot-5',
      label: '聖地5か所',
      hint: '聖地スポットを5か所以上チェック',
      unlocked: m.visitedCount >= 5,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 5, 'か所'),
    },
    {
      id: 'spot-10',
      label: '聖地10か所',
      hint: '聖地スポットを10か所以上チェック',
      unlocked: m.visitedCount >= 10,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 10, 'か所'),
    },
    {
      id: 'spot-20',
      label: '聖地20か所',
      hint: '聖地スポットを20か所以上チェック',
      unlocked: m.visitedCount >= 20,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, 20, 'か所'),
    },
    {
      id: 'spot-all-32',
      label: '115万キロの聖地制覇',
      hint: 'マップ掲載の全32か所の聖地スポットをすべて訪問',
      unlocked: m.visitedCount >= CHECKABLE_SPOTS.length,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.visitedCount, CHECKABLE_SPOTS.length, 'か所'),
    },
    {
      id: 'sanin-roots',
      label: '山陰の原点',
      hint: '島根・鳥取の聖地を1か所以上訪問',
      unlocked: m.regionVisited.sanin >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 1, 'か所'),
    },
    {
      id: 'sanin-5',
      label: '山陰の旅人',
      hint: '島根・鳥取エリアの聖地を5か所以上訪問',
      unlocked: m.regionVisited.sanin >= 5,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 5, 'か所'),
    },
    {
      id: 'sanin-10',
      label: '松江・米子の案内人',
      hint: '島根・鳥取エリアの聖地を10か所以上訪問',
      unlocked: m.regionVisited.sanin >= 10,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, 10, 'か所'),
    },
    {
      id: 'sanin-all',
      label: '山陰の頂点',
      hint: '山陰（島根・鳥取）エリアの全17か所を完全制覇',
      unlocked: m.regionTotal.sanin > 0 && m.regionVisited.sanin >= m.regionTotal.sanin,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.sanin, m.regionTotal.sanin, 'か所'),
    },
    {
      id: 'kanto-memory',
      label: '関東の記憶',
      hint: '東京・関東エリアの聖地を1か所以上訪問',
      unlocked: m.regionVisited.kanto >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, 1, 'か所'),
    },
    {
      id: 'kanto-3',
      label: '首都圏ウォーカー',
      hint: '関東エリアの聖地を3か所以上訪問',
      unlocked: m.regionVisited.kanto >= 3,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, 3, 'か所'),
    },
    {
      id: 'kanto-all',
      label: '関東を制す者',
      hint: '関東エリアの全5か所を完全制覇',
      unlocked: m.regionTotal.kanto > 0 && m.regionVisited.kanto >= m.regionTotal.kanto,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.kanto, m.regionTotal.kanto, 'か所'),
    },
    {
      id: 'domestic-1',
      label: '列島をめぐる旅',
      hint: '北海道・中部・関西エリアの聖地を1か所以上訪問',
      unlocked: m.regionVisited.domestic_other >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'domestic-all',
      label: '西東の巡礼マスター',
      hint: '北海道・中部・関西エリアの全6か所を完全制覇',
      unlocked:
        m.regionTotal.domestic_other > 0 &&
        m.regionVisited.domestic_other >= m.regionTotal.domestic_other,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.domestic_other, m.regionTotal.domestic_other, 'か所'),
    },
    {
      id: 'overseas-1',
      label: '海を越えた一歩',
      hint: '海外エリア（台北・グアム・LA・NY）の聖地を1か所以上訪問',
      unlocked: m.regionVisited.overseas >= 1,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'overseas-all',
      label: 'ワールド・トラベラー',
      hint: '海外エリアの全4か所を完全制覇',
      unlocked: m.regionTotal.overseas > 0 && m.regionVisited.overseas >= m.regionTotal.overseas,
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(m.regionVisited.overseas, m.regionTotal.overseas, 'か所'),
    },
    {
      id: 'spot-cat-mv-all',
      label: 'MVの風景を追いかけて',
      hint: 'MVロケ地カテゴリの全9か所をすべて訪問',
      unlocked: hasCategoryComplete('MVロケ地'),
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(
        m.spotCategoryStats['MVロケ地']?.visited ?? 0,
        m.spotCategoryStats['MVロケ地']?.total ?? 0,
        'か所',
      ),
    },
    {
      id: 'spot-cat-venue-all',
      label: '聖なるステージの記憶',
      hint: 'ライブ会場カテゴリの全10か所をすべて訪問',
      unlocked: hasCategoryComplete('ライブ会場'),
      category: 'spot',
      tier: 'gold',
      targetTab: 'spots',
      progressText: formatStampProgress(
        m.spotCategoryStats['ライブ会場']?.visited ?? 0,
        m.spotCategoryStats['ライブ会場']?.total ?? 0,
        'か所',
      ),
    },
    {
      id: 'spot-cat-memory-all',
      label: '4人の青春の足あと',
      hint: 'メンバーの思い出カテゴリ全7か所をすべて訪問',
      unlocked: hasCategoryComplete('メンバーの思い出'),
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(
        m.spotCategoryStats['メンバーの思い出']?.visited ?? 0,
        m.spotCategoryStats['メンバーの思い出']?.total ?? 0,
        'か所',
      ),
    },
    {
      id: 'spot-cat-rec-all',
      label: 'メンバーお墨付き',
      hint: 'メンバーのおすすめスポット（岡本一銭屋・勝田神社）を訪問',
      unlocked: hasCategoryComplete('メンバーのおすすめ'),
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },
    {
      id: 'spot-town-4',
      label: '街とヒゲダンの記憶',
      hint: '街とヒゲダンカテゴリのスポットを4か所以上訪問',
      unlocked: (m.spotCategoryStats['街とヒゲダン']?.visited ?? 0) >= 4,
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
      progressText: formatStampProgress(m.spotCategoryStats['街とヒゲダン']?.visited ?? 0, 4, 'か所'),
    },
    {
      id: 'spot-twin-stadium',
      label: '二大スタジアムの記憶',
      hint: '日産スタジアムとヤンマースタジアム長居の両方をチェック',
      unlocked:
        m.visitedSpotSet.has('spot-nissan-stadium') &&
        m.visitedSpotSet.has('spot-yanmar-stadium'),
      category: 'spot',
      tier: 'normal',
      targetTab: 'spots',
    },

    // 4. setlist (22 items: 15 normal, 7 gold)
    {
      id: 'setlist-create-1',
      label: '最初の1曲',
      hint: 'MYセトリに最初の1曲を追加',
      unlocked: m.maxSetlistSongs >= 1,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'first-setlist',
      label: 'MYセトリ作り',
      hint: 'MYセトリに3曲以上並べる',
      unlocked: m.maxSetlistSongs >= 3,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 3, '曲'),
    },
    {
      id: 'setlist-7',
      label: 'ライブ気分（7曲）',
      hint: '1つのMYセトリに7曲以上並べる',
      unlocked: m.maxSetlistSongs >= 7,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 7, '曲'),
    },
    {
      id: 'setlist-12',
      label: 'ワンマン編成（12曲）',
      hint: '1つのMYセトリに12曲以上並べる',
      unlocked: m.maxSetlistSongs >= 12,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 12, '曲'),
    },
    {
      id: 'setlist-18',
      label: 'フルスケール公演',
      hint: '18曲以上の本格ワンマンセットリストを組む',
      unlocked: m.maxSetlistSongs >= 18,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.maxSetlistSongs, 18, '曲'),
    },
    {
      id: 'encore-night',
      label: 'アンコール構成',
      hint: 'アンコール曲入りのMYセトリを作成',
      unlocked: m.maxEncoreCount >= 1,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-opening-trio',
      label: '開幕3曲シンクロ',
      hint: 'MYセトリの最初の3曲の並びが実際のライブ公演の開幕3曲と一致',
      unlocked: m.matchesRealOpeningTrio,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-custom-title',
      label: 'ツアータイトル命名',
      hint: 'MYセトリにオリジナルの公演タイトルをつける',
      unlocked: m.hasCustomSetlistTitle,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'multi-setlist',
      label: 'セトリ職人（2件）',
      hint: '2つ以上のMYセトリを保存',
      unlocked: m.savedSetlistCount >= 2,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 2, '件'),
    },
    {
      id: 'saved-setlist-3',
      label: '3つのセットリスト',
      hint: '3つ以上のMYセトリを保存',
      unlocked: m.savedSetlistCount >= 3,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 3, '件'),
    },
    {
      id: 'saved-setlist-5',
      label: '理想郷の編集長（5件）',
      hint: '5つ以上のMYセトリを保存',
      unlocked: m.savedSetlistCount >= 5,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 5, '件'),
    },
    {
      id: 'saved-setlist-10',
      label: '夢のアーカイブ（10件）',
      hint: '10個以上のMYセトリを保存',
      unlocked: m.savedSetlistCount >= 10,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
      progressText: formatStampProgress(m.savedSetlistCount, 10, '件'),
    },
    {
      id: 'setlist-115-opener',
      label: '115万キロから始まる夜',
      hint: '5曲以上のMYセトリの1曲目に「115万キロのフィルム」を配置',
      unlocked: m.has115ManKiloOpening,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-anthem-finale',
      label: '大団円のラスト曲',
      hint: '5曲以上のMYセトリの本編・最後を「宿命 / Stand By You / ラストソング」で締める',
      unlocked: m.hasAnthemFinale,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-upper-beat',
      label: '灼熱のアッパー編成',
      hint: '6曲以上で平均BPM 130以上の勢いあるセトリを組む',
      unlocked: m.hasHighBpmSetlist,
      category: 'setlist',
      tier: 'normal',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-ballad-night',
      label: '余韻のバラード夜会',
      hint: 'しっとり聴かせるバラード系楽曲を4曲以上入れたセトリを組む',
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
      hint: '地声最高音hiD以上の難曲を5曲以上組み込んだ挑戦セトリを作成',
      unlocked: m.hasHighToneSetlist,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-album-tribute',
      label: 'アルバム濃密特集',
      hint: '同じ収録作品（アルバム）の曲を7曲以上入れたコンセプトセトリを作成',
      unlocked: m.hasAlbumConceptSetlist,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-five-eras',
      label: '5つの時代を旅する夜',
      hint: '10曲以上で初期〜最新2026までの全5時代の楽曲を1つのセトリに揃える',
      unlocked: m.hasAllFiveErasSetlist,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'setlist-four-creators',
      label: '4人のペンが交差する夜',
      hint: '「Rowan」「旅は道連れ」「フィラメント」などメンバー4人それぞれの制作曲を1つのセトリに揃える',
      unlocked: m.hasAllFourMemberSongs,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },
    {
      id: 'higedan-same-sensibility',
      label: '髭男と同じ感性',
      hint: '作成したMYセトリの曲順が実際のライブ・公演セットリストと完全一致する',
      unlocked: m.matchesRealConcertSetlist,
      category: 'setlist',
      tier: 'gold',
      targetTab: 'setlists',
    },

    // 5. quiz (20 items: 15 normal, 5 gold)
    {
      id: 'quiz-starter',
      label: '検定チャレンジャー',
      hint: 'Official髭男dism検定を1セット完了',
      unlocked: m.completedSets >= 1,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 1, 'セット'),
    },
    {
      id: 'quiz-3',
      label: '検定3セット挑戦',
      hint: 'Official髭男dism検定を3セット完了',
      unlocked: m.completedSets >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 3, 'セット'),
    },
    {
      id: 'quiz-6',
      label: '検定折り返し（6セット）',
      hint: 'Official髭男dism検定を6セット完了',
      unlocked: m.completedSets >= 6,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 6, 'セット'),
    },
    {
      id: 'quiz-9',
      label: '検定9セット走破',
      hint: 'Official髭男dism検定を9セット完了',
      unlocked: m.completedSets >= 9,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 9, 'セット'),
    },
    {
      id: 'quiz-all-12',
      label: '全12セット完全走破',
      hint: '全コース計12セットの検定すべてを完了',
      unlocked: m.completedSets >= 12,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.completedSets, 12, 'セット'),
    },
    {
      id: 'quiz-beginner-done',
      label: '初級コース修了',
      hint: '初級コース（Vol.1 / Vol.2）を両方完了',
      unlocked: m.courseDone.beginner >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.beginner, 2, 'セット'),
    },
    {
      id: 'quiz-intermediate-done',
      label: '中級コース修了',
      hint: '中級コース（Vol.1 / Vol.2）を両方完了',
      unlocked: m.courseDone.intermediate >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.intermediate, 2, 'セット'),
    },
    {
      id: 'quiz-brothers-done',
      label: 'Bros.級コース修了',
      hint: '難問 Bros.級コース（Vol.1 / Vol.2）を両方完了',
      unlocked: m.courseDone.brothers >= 2,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.brothers, 2, 'セット'),
    },
    {
      id: 'quiz-allcourse-half',
      label: '全曲総合3セット達成',
      hint: '全曲総合コース（Vol.1〜6）のうち3セット以上を完了',
      unlocked: m.courseDone.all >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.all, 3, 'セット'),
    },
    {
      id: 'quiz-allcourse-done',
      label: '全曲総合60問制覇',
      hint: '全曲総合コース Vol.1〜Vol.6 をすべて完了',
      unlocked: m.courseDone.all >= 6,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.courseDone.all, 6, 'セット'),
    },
    {
      id: 'quiz-score-70',
      label: '正答率70%突破',
      hint: '検定で正答率70%以上を記録',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 70,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-master',
      label: '検定80%超',
      hint: '検定で正答率80%以上を記録',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 80,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-score-90',
      label: '正答率90%超え',
      hint: '検定で正答率90%以上を記録',
      unlocked: m.bestQuizScore !== null && m.bestQuizScore >= 90,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-perfect-1',
      label: '初の全問正解（満点）',
      hint: 'いずれかの検定セットで100%（全問正解）を達成',
      unlocked: m.perfectSets >= 1,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 1, 'セット'),
    },
    {
      id: 'quiz-perfect-3',
      label: '満点トリプル',
      hint: '3セット以上で100%（全問正解）を達成',
      unlocked: m.perfectSets >= 3,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 3, 'セット'),
    },
    {
      id: 'quiz-perfect-6',
      label: '満点ハーフコンプリート',
      hint: '6セット以上で100%（全問正解）を達成',
      unlocked: m.perfectSets >= 6,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 6, 'セット'),
    },
    {
      id: 'quiz-beginner-perfect',
      label: '初級オール満点',
      hint: '初級コース Vol.1 / Vol.2 を両方100%でクリア',
      unlocked: m.coursePerfect.beginner >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-intermediate-perfect',
      label: '中級オール満点',
      hint: '中級コース Vol.1 / Vol.2 を両方100%でクリア',
      unlocked: m.coursePerfect.intermediate >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-brothers-perfect',
      label: 'Bros.級オール満点',
      hint: 'Bros.級コース Vol.1 / Vol.2 を両方100%でクリア',
      unlocked: m.coursePerfect.brothers >= 2,
      category: 'quiz',
      tier: 'normal',
      targetTab: 'quiz',
    },
    {
      id: 'quiz-grand-master',
      label: '検定グランドマスター',
      hint: '全12セットすべてで100%（全問正解）を達成',
      unlocked: m.perfectSets >= 12,
      category: 'quiz',
      tier: 'gold',
      targetTab: 'quiz',
      progressText: formatStampProgress(m.perfectSets, 12, 'セット'),
    },

    // 6. explore (20 items: 17 normal, 3 gold)
    {
      id: 'song-read-1',
      label: '音と言葉の1曲目',
      hint: '楽曲ガイドから個別の楽曲解説ページを1曲読む',
      unlocked: m.readSongCount >= 1,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 1, '曲'),
    },
    {
      id: 'song-read-5',
      label: '楽曲ページ5曲読破',
      hint: '個別の楽曲解説ページを5曲読む',
      unlocked: m.readSongCount >= 5,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 5, '曲'),
    },
    {
      id: 'song-read-15',
      label: '15曲のライナーノーツ',
      hint: '個別の楽曲解説ページを15曲読む',
      unlocked: m.readSongCount >= 15,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 15, '曲'),
    },
    {
      id: 'song-read-30',
      label: '30曲の歌詞世界',
      hint: '個別の楽曲解説ページを30曲読む',
      unlocked: m.readSongCount >= 30,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 30, '曲'),
    },
    {
      id: 'song-read-50',
      label: '50曲ノート読破',
      hint: '個別の楽曲解説ページを50曲読む',
      unlocked: m.readSongCount >= 50,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 50, '曲'),
    },
    {
      id: 'song-read-75',
      label: '全曲完読への道（75曲）',
      hint: '個別の楽曲解説ページを75曲読む',
      unlocked: m.readSongCount >= 75,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.readSongCount, 75, '曲'),
    },
    {
      id: 'song-read-all-90',
      label: '全90曲コンプリート読破',
      hint: '掲載90曲すべての個別楽曲解説ページを読む',
      unlocked: m.readSongCount >= HIGEDAN_SONGS.length,
      category: 'explore',
      tier: 'gold',
      progressText: formatStampProgress(m.readSongCount, HIGEDAN_SONGS.length, '曲'),
    },
    {
      id: 'album-read-lovepeace',
      label: 'ラブとピースは君の中 完読',
      hint: '「ラブとピースは君の中」収録8曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'ラブとピースは君の中'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'ラブとピースは君の中'),
    },
    {
      id: 'album-read-manmirror',
      label: 'MAN IN THE MIRROR 完読',
      hint: '「MAN IN THE MIRROR」収録6曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'MAN IN THE MIRROR'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'MAN IN THE MIRROR'),
    },
    {
      id: 'album-read-report',
      label: 'レポート 完読',
      hint: '「レポート」収録7曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'レポート'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'レポート'),
    },
    {
      id: 'album-read-escaparade',
      label: 'エスカパレード 完読',
      hint: '「エスカパレード」収録13曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'エスカパレード'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'エスカパレード'),
    },
    {
      id: 'album-read-traveler',
      label: 'Traveler 完読',
      hint: '「Traveler」収録13曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Traveler'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Traveler'),
    },
    {
      id: 'album-read-editorial',
      label: 'Editorial 完読',
      hint: '「Editorial」収録14曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Editorial'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Editorial'),
    },
    {
      id: 'album-read-rejoice',
      label: 'Rejoice 完読',
      hint: '「Rejoice」収録15曲の楽曲ページをすべて読む',
      unlocked: hasReadAllAlbumSongs(m.readSongSet, 'Rejoice'),
      category: 'explore',
      tier: 'normal',
      progressText: albumReadProgress(m.readSongSet, 'Rejoice'),
    },
    {
      id: 'song-read-member-trio',
      label: '3人の自作曲を巡る読書',
      hint: '「Rowan」「旅は道連れ」「フィラメント」の3曲の解説をすべて読む',
      unlocked: FOUR_MEMBER_SONG_IDS.every((id) => m.readSongSet.has(id)),
      category: 'explore',
      tier: 'gold',
    },
    {
      id: 'mood-first',
      label: '今日の1曲との出会い',
      hint: '「今日の1曲診断」に最後まで答えて1曲を受け取る',
      areaHint: '今日の1曲診断',
      unlocked: m.moodCompletedCount >= 1,
      category: 'explore',
      tier: 'normal',
    },
    {
      id: 'mood-three',
      label: '気分の処方箋（3回診断）',
      hint: '「今日の1曲診断」を3回以上完了する',
      areaHint: '今日の1曲診断',
      unlocked: m.moodCompletedCount >= 3,
      category: 'explore',
      tier: 'normal',
      progressText: formatStampProgress(m.moodCompletedCount, 3, '回'),
    },
    {
      id: 'mood-all-four',
      label: '4つの気分の旅人',
      hint: '今日の1曲診断で最初の質問（4種類の気分すべて）を完走する',
      areaHint: '今日の1曲診断',
      unlocked: m.completedMoodsCount >= 4,
      category: 'explore',
      tier: 'gold',
      progressText: formatStampProgress(m.completedMoodsCount, 4, '気分'),
    },
    {
      id: 'vocal-range-visit',
      label: '音域とキーの探求者',
      hint: '「掲載90曲の音域・発売日一覧」ページを開く',
      areaHint: '掲載90曲の音域・発売日一覧',
      unlocked: input.visitedVocalRange,
      category: 'explore',
      tier: 'normal',
    },
    {
      id: 'archive-visit',
      label: 'インタビュー資料室の読書家',
      hint: '「参考記事・インタビュー」ページを開く',
      areaHint: '参考記事・インタビュー',
      unlocked: input.visitedReferenceArchive,
      category: 'explore',
      tier: 'normal',
    },
  ];

  const allOtherUnlocked = first114.every((stamp) => stamp.unlocked);
  const allStamps: MyNoteStampDraft[] = [
    ...first114,
    {
      id: 'complete-115',
      label: '115万キロの記憶',
      hint: 'ほかの全114個の訪問・記念スタンプをすべて集める',
      unlocked: allOtherUnlocked,
      category: 'profile',
      tier: 'gold',
      progressText: formatStampProgress(first114.filter((s) => s.unlocked).length, 114, '個'),
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
} {
  const metrics = computeMetrics(input);
  const stamps = buildStampsFromMetrics(input, metrics);
  const rank = buildMyNoteRank(stamps);
  return { stamps, rank, radar: metrics.radar };
}

interface RankTierSpec {
  min: number;
  title: string;
  subtitle: string;
}

const RANK_TIERS: readonly RankTierSpec[] = [
  { min: 115, title: '115万キロのフィルム・マスター', subtitle: '全115スタンプ制覇！永遠のパートナー級の一冊です' },
  { min: 108, title: '115万キロの案内人', subtitle: 'コンプリート目前！細部まで愛に満ちた一冊です' },
  { min: 97, title: '115万キロの伴走者', subtitle: '数えきれない音楽と旅の軌跡が刻まれています' },
  { min: 85, title: '髭団アーカイブの達人', subtitle: '曲もライブも歴史も深く味わう達人のノート' },
  { min: 73, title: '音と言葉のマイスター', subtitle: '多角的な視点で作品を深く味わっています' },
  { min: 61, title: 'ライブと聖地の案内人', subtitle: 'ステージの熱気とゆかりの地が美しく繋がっています' },
  { min: 50, title: '髭男ノート研究員', subtitle: '半分に迫るほど豊かな発見が集まりました' },
  { min: 40, title: '山陰と東京を結ぶ旅人', subtitle: '原点と現在をつなぐ足あとが広がっています' },
  { min: 31, title: 'セトリと記憶の編集者', subtitle: '選曲のこだわりや実体験が生き生きと残っています' },
  { min: 23, title: 'グッド・メロディ探検家', subtitle: '曲の背景やライブの余韻を楽しく巡っています' },
  { min: 16, title: '旅するリスナー', subtitle: '音と言葉の記録が着実に増えています' },
  { min: 10, title: '街角のリスナー', subtitle: 'お気に入りの曲や思い出が形になりはじめました' },
  { min: 5, title: 'ファンノート・ビギナー', subtitle: '最初の旅のあしあとがついてきました！' },
  { min: 2, title: '音と言葉のルーキー', subtitle: '少しずつ自分のページが埋まりはじめています' },
  { min: 0, title: 'はじめの一歩', subtitle: '気になるコーナーで記録やチェックをつけてみよう' },
];

export function buildMyNoteRank(stamps: readonly MyNoteStampItem[]): MyNoteRankSummary {
  const totalStamps = stamps.length;
  const unlockedCount = stamps.filter((stamp) => stamp.unlocked).length;
  const totalGoldStamps = stamps.filter((stamp) => stamp.tier === 'gold').length;
  const unlockedGoldCount = stamps.filter((stamp) => stamp.unlocked && stamp.tier === 'gold').length;

  const rawPercent = totalStamps > 0 ? Math.round((unlockedCount / totalStamps) * 100) : 0;
  const progressPercent = unlockedCount <= 1 ? Math.max(2, rawPercent) : rawPercent;

  const tierIdx = RANK_TIERS.findIndex((tier) => unlockedCount >= tier.min);
  const currentTier = tierIdx >= 0 ? RANK_TIERS[tierIdx] : RANK_TIERS[RANK_TIERS.length - 1];
  const nextTier = tierIdx > 0 ? RANK_TIERS[tierIdx - 1] : null;

  return {
    title: currentTier.title,
    subtitle: currentTier.subtitle,
    unlockedCount,
    totalStamps,
    unlockedGoldCount,
    totalGoldStamps,
    progressPercent,
    nextMilestoneText: nextTier
      ? `次のランクまであと ${Math.max(1, nextTier.min - unlockedCount)} スタンプ`
      : '最高ランク到達！全115スタンプコンプリート',
  };
}

interface RadarComputationInput {
  attendedCount: number;
  visitedCount: number;
  maxSetlistSongs: number;
  savedSetlistCount: number;
  completedQuizSets: number;
  bestQuizScore: number | null;
  votedSongCount: number;
  reviewCount: number;
  readSongCount: number;
  moodCompletedCount: number;
  hasCustomNickname: boolean;
  visitedVocalRange: boolean;
  visitedReferenceArchive: boolean;
}

function computeRadarSummary({
  attendedCount,
  visitedCount,
  maxSetlistSongs,
  savedSetlistCount,
  completedQuizSets,
  bestQuizScore,
  votedSongCount,
  reviewCount,
  readSongCount,
  moodCompletedCount,
  hasCustomNickname,
  visitedVocalRange,
  visitedReferenceArchive,
}: RadarComputationInput): MyNoteRadarSummary {
  const tourScore = Math.min(1, attendedCount / 8);
  const spotScore = Math.min(1, visitedCount / 8);
  const setlistUnits = maxSetlistSongs + Math.max(0, savedSetlistCount - 1) * 4;
  const setlistScore = Math.min(1, setlistUnits / 14);
  const quizUnits = completedQuizSets + (bestQuizScore ? bestQuizScore / 100 : 0);
  const quizScore = Math.min(1, quizUnits / 6);
  const exploreUnits =
    votedSongCount +
    reviewCount * 2 +
    readSongCount * 0.4 +
    moodCompletedCount * 1.5 +
    (hasCustomNickname ? 1 : 0) +
    (visitedVocalRange ? 1 : 0) +
    (visitedReferenceArchive ? 1 : 0);
  const exploreScore = Math.min(1, exploreUnits / 8);

  const axes: MyNoteRadarAxis[] = [
    {
      id: 'tour',
      label: 'ライブ参戦',
      value: tourScore,
      rawLabel: `${attendedCount}件`,
    },
    {
      id: 'spot',
      label: '聖地巡礼',
      value: spotScore,
      rawLabel: `${visitedCount}か所`,
    },
    {
      id: 'setlist',
      label: 'MYセトリ',
      value: setlistScore,
      rawLabel: `${maxSetlistSongs}曲 / ${savedSetlistCount}案`,
    },
    {
      id: 'quiz',
      label: '楽曲検定',
      value: quizScore,
      rawLabel: `${completedQuizSets}セット`,
    },
    {
      id: 'explore',
      label: '応援・探索',
      value: exploreScore,
      rawLabel: `${readSongCount}曲読破`,
    },
  ];

  return {
    hasAnyActivity: axes.some((axis) => axis.value > 0),
    axes,
  };
}

export function buildMyNoteRadar(input: MyNoteEngagementInput): MyNoteRadarSummary {
  const attendedCount = new Set(
    input.attendedTourIds.filter((id) => VALID_TOUR_IDS.has(id)),
  ).size;
  const visitedCount = new Set(
    input.visitedSpotIds.filter((id) => VALID_CHECKABLE_SPOT_IDS.has(id)),
  ).size;
  let maxSetlistSongs = 0;
  for (const item of input.setlists) {
    const count = normalizeSetlistOrder(
      item.entries.filter((entry) => VALID_SONG_IDS.has(entry.songId)),
    ).length;
    if (count > maxSetlistSongs) maxSetlistSongs = count;
  }
  const completedQuizSets = buildQuizRecordSummary(
    input.quizVolumeScores,
    input.bestQuizScore,
  ).completedSets;
  const readSongCount = new Set(
    input.readSongIds.filter((id) => VALID_SONG_IDS.has(id)),
  ).size;

  return computeRadarSummary({
    attendedCount,
    visitedCount,
    maxSetlistSongs,
    savedSetlistCount: input.savedSetlistCount,
    completedQuizSets,
    bestQuizScore: input.bestQuizScore,
    votedSongCount: input.votedSongCount,
    reviewCount: input.reviewCount,
    readSongCount,
    moodCompletedCount: input.moodCompletedCount,
    hasCustomNickname: input.hasCustomNickname,
    visitedVocalRange: input.visitedVocalRange,
    visitedReferenceArchive: input.visitedReferenceArchive,
  });
}
