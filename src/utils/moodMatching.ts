import type { MoodTag, SituationTag, SongItem, SoundTag } from '../data/higedanData';
import { MOOD_LABELS, SITUATION_LABELS, SOUND_LABELS } from './songLabels';

export interface MoodCriteria {
  mood: MoodTag;
  situation: SituationTag;
  sound: SoundTag;
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
  const matched = [
    song.moods.includes(criteria.mood) ? `気分「${MOOD_LABELS[criteria.mood]}」` : null,
    song.situations.includes(criteria.situation) ? `場面「${SITUATION_LABELS[criteria.situation]}」` : null,
    song.sound === criteria.sound ? `曲調「${SOUND_LABELS[criteria.sound]}」` : null,
  ].filter((item): item is string => Boolean(item));
  const reason = matched.length
    ? `当サイトの分類では、${matched.join('・')}が選んだ条件と一致します。`
    : '選んだ条件に近い候補として表示しています。';
  return `${reason}曲調資料では「${song.musicalHighlight}」と紹介されています。`;
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
    const reasons: string[] = [];

    if (song.moods.includes(criteria.mood)) {
      rawPoints += 18;
      reasons.push(`気分「${MOOD_LABELS[criteria.mood]}」`);
    }
    if (song.situations.includes(criteria.situation)) {
      rawPoints += 11;
      reasons.push(`場面「${SITUATION_LABELS[criteria.situation]}」`);
    }
    if (song.sound === criteria.sound) {
      rawPoints += 10;
      reasons.push(`曲調「${SOUND_LABELS[criteria.sound]}」`);
    }

    if (reasons.length === 0) {
      reasons.push(`曲調資料「${song.musicalHighlight}」`);
    }

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
    };
  });

  return scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.song.guideOrder - b.song.guideOrder || a.song.title.localeCompare(b.song.title, 'ja');
  });
}

export function formatDiagnosisShareText(
  match: ScoredSongMatch,
  criteria: MoodCriteria
): string {
  return [
    `【マイソング診断結果：『${match.song.title}』】`,
    `診断条件：${MOOD_LABELS[criteria.mood]} ／ ${SITUATION_LABELS[criteria.situation]} ／ ${SOUND_LABELS[criteria.sound]}`,
    `理由：${match.moodMatchExplanation}`,
    `曲調：${match.song.musicalHighlight}`,
    '#115万キロのファンノート #Official髭男dism #マイソング診断',
  ].join('\n');
}
