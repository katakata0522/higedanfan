import { QUIZ_COURSES, type QuestionScopeFilter } from '../../components/quiz/quizCourseMeta';
import { quizVolumeKey, type QuizVolumeRecordMap } from '../../components/quiz/quizVolumeRecords';
import type { SacredSpot, TourArchive } from '../../data/higedanTypes';
import { DEFAULT_SETLIST_TITLE } from '../../hooks/fanRecordStore';
import { SACRED_SPOT_REGIONS, getSacredSpotRegion, type SacredSpotRegion } from '../sacredSpotAreas';
import { DEFAULT_SAVED_SETLIST_TITLE } from '../savedSetlists';
import type {
  AttendedTimelineSummary,
  QuizCourseRecordGroup,
  QuizCourseVolumeStatus,
  QuizRecordSummary,
  SacredProgressSummary,
  SacredRegionProgress,
} from './types';

export function isCustomSetlistTitle(title: string): boolean {
  const clean = title.trim();
  return (
    clean.length > 0 &&
    clean !== DEFAULT_SETLIST_TITLE &&
    clean !== DEFAULT_SAVED_SETLIST_TITLE
  );
}

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
  const regions: SacredRegionProgress[] = SACRED_SPOT_REGIONS.filter(
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
