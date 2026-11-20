import type { EraTag, MoodTag, SituationTag, SongItem, SoundTag } from '../data/higedanData';
import { ERA_SHORT_LABELS, SOUND_LABELS } from './songLabels';

export type BroadEraPreference = 'early' | 'middle' | 'late';
export type EraPreference = EraTag | BroadEraPreference | 'any';
export type LengthPreference = 'any' | 'under4' | 'fourToFive' | 'fivePlus';
// 以前の回答も復元できるよう、従来の曲調IDは残す。
export type MoodSoundPreference = SoundTag | 'rhythm' | 'gentle' | 'melody' | 'powerful';

export const MOOD_CHOICE_LABELS: Record<MoodTag, string> = {
  push_back: '背中を押してほしい',
  heartbreak_night: '切ない気持ちを味わいたい',
  euphoric_drive: '思いきり楽しみたい',
  deep_lyric: '言葉や音にじっくり浸りたい',
};
export const SITUATION_CHOICE_LABELS: Record<SituationTag, string> = {
  morning_commute: '朝の支度・通勤・通学',
  late_night_alone: 'ひとりで過ごす夜',
  live_warmup: 'ライブ前・ドライブ',
  weekend_walk: '散歩やカフェでひと息',
};
export const SOUND_PREFERENCE_LABELS: Record<MoodSoundPreference, string> = {
  ...SOUND_LABELS,
  rhythm: 'リズムに乗って楽しみたい',
  gentle: '落ち着いた音に包まれたい',
  melody: 'メロディーをじっくり味わいたい',
  powerful: '力強い演奏を浴びたい',
};

export const ERA_PREFERENCE_LABELS: Record<EraPreference, string> = {
  any: 'どの時期の曲も聴きたい',
  early: '初期（2015〜2018年頃）',
  middle: '中期（2018〜2021年頃）',
  late: '後期（2022年〜現在）',
  ...ERA_SHORT_LABELS,
  latest_2025_2026: '2024〜2026年の曲',
};

export const LENGTH_PREFERENCE_LABELS: Record<LengthPreference, string> = {
  any: '長さはこだわらない',
  under4: '短めで爽快に',
  fourToFive: 'ほどよい聴きごたえで',
  fivePlus: '長めにゆったり思いを馳せて',
};

export interface MoodCriteria {
  mood: MoodTag;
  situation: SituationTag;
  sound: MoodSoundPreference;
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

export function matchesEra(song: SongItem, preference: EraPreference): boolean {
  if (preference === 'any') return true;
  if (preference === 'early') return song.era === 'indies_escaparade';
  if (preference === 'middle') return song.era === 'traveler' || song.era === 'editorial';
  if (preference === 'late') return song.era === 'rejoice' || song.era === 'latest_2025_2026';
  if (preference === 'latest_2025_2026') return /^202[456][.\-/]/.test(song.releaseDate);
  return song.era === preference;
}

// 音の感じ方を楽曲分類と勢いの両方から捉える。ひとつのジャンルだけに限定しない。
function soundPreferencePoints(song: SongItem, preference: MoodSoundPreference): number {
  switch (preference) {
    case 'rhythm':
      return (
        song.energyLevel * 3 +
        (song.sound === 'brass_funk' ? 3 : 0) +
        (song.sound === 'emotional_ballad' && song.bpm < 95 ? -6 : 0)
      );
    case 'gentle':
      return (
        (11 - song.energyLevel) * 3 +
        (song.sound === 'emotional_ballad'
          ? song.bpm < 80
            ? 12
            : 9
          : song.sound === 'piano_pop' && song.bpm < 115
            ? 4
            : 0)
      );
    case 'melody': return song.sound === 'piano_pop' ? 24 : song.sound === 'emotional_ballad' ? 21 : 8;
    case 'powerful': return song.energyLevel * 3 + (song.sound === 'stadium_rock' ? 3 : 0);
    default: return song.sound === preference ? 10 : 0;
  }
}

export function isSoundMatch(song: SongItem, preference: MoodSoundPreference): boolean {
  return ['rhythm', 'gentle', 'melody', 'powerful'].includes(preference)
    ? soundPreferencePoints(song, preference) >= 21
    : song.sound === preference;
}

function matchedCriteria(song: SongItem, criteria: MoodCriteria): string[] {
  return [
    song.moods.includes(criteria.mood) ? `気分「${MOOD_CHOICE_LABELS[criteria.mood]}」` : null,
    song.situations.includes(criteria.situation) ? `場面「${SITUATION_CHOICE_LABELS[criteria.situation]}」` : null,
    isSoundMatch(song, criteria.sound) ? `曲調「${SOUND_PREFERENCE_LABELS[criteria.sound]}」` : null,
    criteria.era && criteria.era !== 'any' && matchesEra(song, criteria.era)
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

const GENRE_STYLE_LABELS = /^(アップテンポ|ミドルテンポ|ミディアムロック|バラード|スローな曲|R&B|ファンク|ロック|ポップス)$/;

/** Explain the actual matching criteria without claiming that a song will cause a feeling. */
export function buildMoodMatchExplanation(
  song: SongItem,
  criteria: MoodCriteria
): string {
  const matched = matchedCriteria(song, criteria);
  const reason = matched.length
    ? `${matched.join('・')}にぴったり重なる一曲です。`
    : '選んだ時期や長さの中で、今の気分に近い候補を選びました。';
  const styleNote = GENRE_STYLE_LABELS.test(song.musicalHighlight)
    ? `「${song.musicalHighlight}」の曲調で楽しめる一曲です。`
    : `この曲の聴きどころは「${song.musicalHighlight}」。`;
  return `${reason}${styleNote}`;
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
    isSoundMatch(song, criteria.sound)
      ? 99
      : (song.sound === 'piano_pop' && criteria.sound === 'emotional_ballad') ||
        (song.sound === 'brass_funk' && criteria.sound === 'stadium_rock')
      ? 85
      : 76;

  const tempoParameter = Math.min(100, Math.max(35, Math.round(((song.bpm - 75) / 95) * 100)));
  const liveEnergyParameter = Math.min(100, Math.max(40, song.energyLevel * 10));
  const lyricDepthParameter = song.moods.includes('deep_lyric')
    ? 95
    : song.moods.includes('heartbreak_night')
      ? 88
      : 78;

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
    rawPoints += soundPreferencePoints(song, criteria.sound);

    if (criteria.era && criteria.era !== 'any' && matchesEra(song, criteria.era)) rawPoints += 8;
    if (criteria.length && criteria.length !== 'any' && matchesLength(song.durationSec, criteria.length)) rawPoints += 6;

    const matchScore = Math.min(99, rawPoints);
    const moodMatchExplanation = buildMoodMatchExplanation(song, criteria);
    const matchBreakdown = buildMatchBreakdown(song, criteria);
    const soundAnalysisReason = `曲調の特徴：${song.musicalHighlight}`;

    return {
      song,
      matchScore,
      matchReasons: reasons,
      moodMatchExplanation,
      soundAnalysisReason,
      matchBreakdown,
      rawPoints,
      coreMatches: Number(song.moods.includes(criteria.mood)) + Number(isSoundMatch(song, criteria.sound)),
    };
  });

  return scored.sort((a, b) => {
    if (b.coreMatches !== a.coreMatches) return b.coreMatches - a.coreMatches;
    if (b.rawPoints !== a.rawPoints) {
      return b.rawPoints - a.rawPoints;
    }
    return tieOrder(a.song.id, criteria) - tieOrder(b.song.id, criteria)
      || a.song.id.localeCompare(b.song.id, 'en');
  }).map(({rawPoints: _rawPoints, coreMatches: _coreMatches, ...match}) => match);
}

// 同点では回答に応じて順番を変え、同じ回答を開き直したときは安定させる。
function tieOrder(songId: string, criteria: MoodCriteria): number {
  const value = [songId, criteria.mood, criteria.situation, criteria.sound, criteria.era ?? 'any', criteria.length ?? 'any'].join('|');
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/** 時期と長さは希望された範囲を守り、その中から気分と音で選ぶ。 */
export function recommendSongsByMood(songs: SongItem[], criteria: MoodCriteria): ScoredSongMatch[] {
  return scoreSongsByMood(songs.filter(song =>
    (!criteria.era || matchesEra(song, criteria.era))
    && (!criteria.length || criteria.length === 'any' || matchesLength(song.durationSec, criteria.length))
  ), criteria);
}

export function formatDiagnosisShareText(
  match: ScoredSongMatch,
  criteria: MoodCriteria
): string {
  return [
    `【今日の1曲診断結果：『${match.song.title}』】`,
    `診断条件：${[
      MOOD_CHOICE_LABELS[criteria.mood], SITUATION_CHOICE_LABELS[criteria.situation], SOUND_PREFERENCE_LABELS[criteria.sound],
      criteria.era && ERA_PREFERENCE_LABELS[criteria.era],
      criteria.length && LENGTH_PREFERENCE_LABELS[criteria.length],
    ].filter(Boolean).join(' ／ ')}`,
    `理由：${match.moodMatchExplanation}`,
    `曲調：${match.song.musicalHighlight}`,
    '#115万キロのファンノート #Official髭男dism #今日の1曲診断',
  ].join('\n');
}
