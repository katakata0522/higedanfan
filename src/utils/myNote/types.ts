import type { CourseDifficulty, QuestionScopeFilter } from '../../components/quiz/quizCourseMeta';
import type { QuizVolumeRecord, QuizVolumeRecordMap } from '../../components/quiz/quizVolumeRecords';
import type { SacredSpot, TourArchive } from '../../data/higedanTypes';
import type { SacredSpotRegion } from '../sacredSpotAreas';
import type { SavedSetlistItem } from '../savedSetlists';

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

export type MyNoteStampDraft = Omit<MyNoteStampItem, 'serialNumber' | 'serialCode'>;

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
  tierNumber: number;
  title: string;
  subtitle: string;
  unlockedCount: number;
  totalStamps: number;
  unlockedNormalCount: number;
  totalNormalStamps: number;
  unlockedGoldCount: number;
  totalGoldStamps: number;
  progressPercent: number;
  nextMilestoneText: string;
}

export type MyNoteRadarAxisId = 'tour' | 'spot' | 'setlist' | 'quiz' | 'explore';

export interface MyNoteRadarAxis {
  id: MyNoteRadarAxisId;
  label: string;
  value: number;
  rawLabel: string;
}

export interface MyNoteRadarSummary {
  hasAnyActivity: boolean;
  axes: MyNoteRadarAxis[];
}

export type MyNotePlaystyleId =
  | 'gem'
  | 'balanced'
  | 'tour'
  | 'spot'
  | 'setlist'
  | 'quiz'
  | 'explore';

export interface MyNotePlaystyleSummary {
  id: MyNotePlaystyleId;
  title: string;
  subtitle: string;
  dominantAxisId: MyNoteRadarAxisId | null;
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
  generatedSetlistShareImage?: boolean;
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
