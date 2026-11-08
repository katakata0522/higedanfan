import type { EraTag, MoodTag, SituationTag, SongItem, SoundTag } from '../data/higedanData';
import { ERA_SHORT_LABELS, MOOD_LABELS, SITUATION_LABELS, SOUND_LABELS } from './songLabels';

export type EraPreference = EraTag | 'any';
export type LengthPreference = 'any' | 'under4' | 'fourToFive' | 'fivePlus';

export const ERA_PREFERENCE_LABELS: Record<EraPreference, string> = {
  any: '時期はこだわらない',
  ...ERA_SHORT_LABELS,
};

export const LENGTH_PREFERENCE_LABELS: Record<LengthPreference, string> = {
  any: '長さはこだわらない',
  under4: '４分未満',
  fourToFive: '４分以上５分未満',
  fivePlus: '５分以上',
};

export interface MoodCriteria {
  mood: MoodTag;
  situation: SituationTag;
  sound: SoundTag;
  // Optional for callers using the original three-question diagnosis.
  era?: EraPreference;
  length?: LengthPreference;
}

export function matchesLength(durationSec: number, preference: LengthPreference): boolean {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return false;
  if (preference === 'under4') return durationSec < 240;
  if (preference === 'fourToFive') return durationSec >= 240 && durationSec < 300;
  if (preference === 'fivePlus') return durationSec >= 300;
  return true;
}

function matchedCriteria(song: SongItem, criteria: MoodCriteria): string[] {
  return [
    song.moods.includes(criteria.mood) ? `気分「${MOOD_LABELS[criteria.mood]}」` : null,
    song.situations.includes(criteria.situation) ? `場面「${SITUATION_LABELS[criteria.situation]}」` : null,
    song.sound === criteria.sound ? `曲調「${SOUND_LABELS[criteria.sound]}」` : null,
    criteria.era && criteria.era !== 'any' && song.era === criteria.era
      ? `時期「${ERA_PREFERENCE_LABELS[criteria.era]}」` : null,
    criteria.length && criteria.length !== 'any' && matchesLength(song.durationSec, criteria.length)
      ? `長さ「${LENGTH_PREFERENCE_LABELS[criteria.length]}」` : null,
  ].filter((item): item is string => Boolean(item));
}

export interface MatchBreakdown {
  moodSyncPercent: number;
  sceneFitPercent: number;
  soundMatchPercent: number;
  tempoParameter: number;
  liveEnergyParameter: number;
  lyricDepthParameter: number;
}

export interface ScoredSongMatch {
  song: SongItem;
  matchScore: number; // Editorial score, 60–99
  matchReasons: string[];
  moodMatchExplanation: string;
  soundAnalysisReason: string;
  matchBreakdown: MatchBreakdown;
}

/** Explain the actual matching criteria without claiming that a song will cause a feeling. */
export function buildMoodMatchExplanation(
  song: SongItem,
  criteria: MoodCriteria
): string {
  const matched = matchedCriteria(song, criteria);
  const reason = matched.length
    ? `${matched.join('・')}が選んだ条件と一致します。`
    : '選んだ条件に一致する項目はありませんが、候補として紹介します。';
  return `${reason}この曲の聴きどころは「${song.musicalHighlight}」。`;
}

export function buildMatchBreakdown(
  song: SongItem,
  criteria: MoodCriteria
): MatchBreakdown {
  const moodSyncPercent = song.moods.includes(criteria.mood)
    ? song.moods[0] === criteria.mood
      ? 98
      : 92
    : 74;

  const sceneFitPercent = song.situations.includes(criteria.situation)
    ? song.situations[0] === criteria.situation
      ? 97
      : 91
    : 75;

  const soundMatchPercent =
    song.sound === criteria.sound
      ? 99
      : (song.sound === 'piano_pop' && criteria.sound === 'emotional_ballad') ||
        (song.sound === 'brass_funk' && criteria.sound === 'stadium_rock')
      ? 85
      : 76;

  const tempoParameter = Math.min(100, Math.max(35, Math.round(((song.bpm - 75) / 95) * 100)));
  const liveEnergyParameter = Math.min(100, Math.max(40, song.energyLevel * 10));
  const lyricDepthParameter = Math.min(
    100,
    Math.max(60, Math.round((song.votes.lyric / 500) * 100))
  );

  return {
    moodSyncPercent,
    sceneFitPercent,
    soundMatchPercent,
    tempoParameter,
    liveEnergyParameter,
    lyricDepthParameter,
  };
}

export function scoreSongsByMood(
  songs: SongItem[],
  criteria: MoodCriteria
): ScoredSongMatch[] {
  const scored = songs.map((song) => {
    let rawPoints = 60;
    const reasons = matchedCriteria(song, criteria);

    if (song.moods.includes(criteria.mood)) {
      rawPoints += 18;
    }
    if (song.situations.includes(criteria.situation)) {
      rawPoints += 11;
    }
    if (song.sound === criteria.sound) {
      rawPoints += 10;
    }

    if (criteria.era && criteria.era !== 'any' && song.era === criteria.era) rawPoints += 8;
    if (criteria.length && criteria.length !== 'any' && matchesLength(song.durationSec, criteria.length)) rawPoints += 6;

    const matchScore = Math.min(99, rawPoints);
    const moodMatchExplanation = buildMoodMatchExplanation(song, criteria);
    const matchBreakdown = buildMatchBreakdown(song, criteria);
    const soundAnalysisReason = `掲載資料の曲調：${song.musicalHighlight}`;

    return {
      song,
      matchScore,
      matchReasons: reasons,
      moodMatchExplanation,
      soundAnalysisReason,
      matchBreakdown,
      rawPoints,
    };
  });

  return scored.sort((a, b) => {
    if (b.rawPoints !== a.rawPoints) {
      return b.rawPoints - a.rawPoints;
    }
    return a.song.guideOrder - b.song.guideOrder || a.song.title.localeCompare(b.song.title, 'ja');
  }).map(({rawPoints: _rawPoints, ...match}) => match);
}

export function formatDiagnosisShareText(
  match: ScoredSongMatch,
  criteria: MoodCriteria
): string {
  return [
    `【マイソング診断結果：『${match.song.title}』】`,
    `診断条件：${[
      MOOD_LABELS[criteria.mood], SITUATION_LABELS[criteria.situation], SOUND_LABELS[criteria.sound],
      criteria.era && ERA_PREFERENCE_LABELS[criteria.era],
      criteria.length && LENGTH_PREFERENCE_LABELS[criteria.length],
    ].filter(Boolean).join(' ／ ')}`,
    `理由：${match.moodMatchExplanation}`,
    `曲調：${match.song.musicalHighlight}`,
    '#115万キロのファンノート #Official髭男dism #マイソング診断',
  ].join('\n');
}
