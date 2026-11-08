import type { SongItem } from '../data/higedanData';
import { isTempoUnderReview } from '../data/tempoReviewStatus';
import { sanitizeSafeId, sanitizeUserText } from './userInput';

export const SETLIST_TITLE_LIMIT = 160;

// Another tab may read this value between the user's space and their next word.
export function sanitizeSetlistTitle(title: string) {
  return sanitizeUserText(title, SETLIST_TITLE_LIMIT, { trim: false });
}

export interface SetlistEntry {
  songId: string;
  isEncore: boolean;
}

export interface SetlistStats {
  totalSongs: number;
  mainCount: number;
  encoreCount: number;
  totalDurationSec: number;
  formattedDuration: string;
  avgBpm: number | null;
  unconfirmedBpmCount: number;
  energyCurve: { index: number; title: string; energy: number; bpm: number; isEncore: boolean }[];
  vibeTitle: string;
  vibeDescription: string;
}

/**
 * Ensures all main tracks (isEncore: false) precede encore tracks (isEncore: true)
 * while preserving relative order within each group and deduplicating songIds.
 */
export function normalizeSetlistOrder(entries: SetlistEntry[]): SetlistEntry[] {
  const seen = new Set<string>();
  const main: SetlistEntry[] = [];
  const encore: SetlistEntry[] = [];

  for (const item of entries) {
    if (!item || typeof item.songId !== 'string' || seen.has(item.songId)) continue;
    seen.add(item.songId);
    if (item.isEncore) {
      encore.push({ songId: item.songId, isEncore: true });
    } else {
      main.push({ songId: item.songId, isEncore: false });
    }
  }
  return [...main, ...encore];
}

export function sanitizeSetlistEntries(
  rawEntries: unknown,
  validSongIds: Set<string>
): SetlistEntry[] | null {
  if (!Array.isArray(rawEntries)) return null;
  const safe: SetlistEntry[] = [];
  for (const item of rawEntries) {
    if (
      item &&
      typeof item === 'object' &&
      'songId' in item &&
      typeof (item as { songId: unknown }).songId === 'string'
    ) {
      const cleanId = sanitizeSafeId((item as { songId: string }).songId, 40);
      if (validSongIds.has(cleanId)) {
        safe.push({
          songId: cleanId,
          isEncore: Boolean((item as { isEncore?: unknown }).isEncore),
        });
      }
    }
  }
  return normalizeSetlistOrder(safe);
}

export function calculateSetlistStats(
  entries: SetlistEntry[],
  allSongs: SongItem[]
): SetlistStats {
  const songMap = new Map(allSongs.map((s) => [s.id, s]));
  const resolved = entries
    .map((entry, idx) => {
      const song = songMap.get(entry.songId);
      if (!song) return null;
      return {
        index: idx + 1,
        song,
        isEncore: entry.isEncore,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (resolved.length === 0) {
    return {
      totalSongs: 0,
      mainCount: 0,
      encoreCount: 0,
      totalDurationSec: 0,
      formattedDuration: '0分00秒',
      avgBpm: null,
      unconfirmedBpmCount: 0,
      energyCurve: [],
      vibeTitle: 'セットリスト未編成',
      vibeDescription: '楽曲を追加すると、ライブ全体の盛り上がり波形と総演奏時間を自動算出します。',
    };
  }

  const totalDurationSec = resolved.reduce((acc, item) => acc + item.song.durationSec, 0);
  const totalMinutes = Math.floor(totalDurationSec / 60);
  const remainSeconds = totalDurationSec % 60;
  const confirmedTempos = resolved.filter(item => !isTempoUnderReview(item.song.id));
  const avgBpm = confirmedTempos.length
    ? Math.round(confirmedTempos.reduce((acc, item) => acc + item.song.bpm, 0) / confirmedTempos.length)
    : null;
  const avgEnergy =
    resolved.reduce((acc, item) => acc + item.song.energyLevel, 0) / resolved.length;

  const mainCount = resolved.filter((r) => !r.isEncore).length;
  const encoreCount = resolved.filter((r) => r.isEncore).length;

  const vibeTitle = avgEnergy >= 8.6 ? '高めの曲が中心' : avgEnergy <= 7.2 ? '穏やかな曲が中心' : '中間の構成';
  const vibeDescription = '棒の高さは、編集時に各曲に付けた熱量の目安（10段階）です。選曲の平均は ' + avgEnergy.toFixed(1) + ' / 10。';

  return {
    totalSongs: resolved.length,
    mainCount,
    encoreCount,
    totalDurationSec,
    formattedDuration: `${totalMinutes}分${remainSeconds.toString().padStart(2, '0')}秒`,
    avgBpm,
    unconfirmedBpmCount: resolved.length - confirmedTempos.length,
    energyCurve: resolved.map((r) => ({
      index: r.index,
      title: r.song.title,
      energy: r.song.energyLevel,
      bpm: r.song.bpm,
      isEncore: r.isEncore,
    })),
    vibeTitle,
    vibeDescription,
  };
}
