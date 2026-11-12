import type { SongItem } from '../data/higedanData';
import { pitchNumber, songEvidence } from '../data/fullCatalogSongs';
import { songReadings } from '../data/songReadings';
import { isTempoUnderReview } from '../data/tempoReviewStatus';

export const SONG_TABLE_SORT_KEYS = ['title', 'low', 'chest', 'falsetto', 'album', 'duration', 'bpm', 'release', 'cd'] as const;
export type SongTableSortKey = typeof SONG_TABLE_SORT_KEYS[number];
export type SongTableSort = { key: SongTableSortKey; direction: 'ascending' | 'descending' };
export const SONG_TABLE_SORT_LABELS: Record<SongTableSortKey, string> = {
  title: '曲名', low: '地声最低', chest: '地声最高', falsetto: '裏声最高',
  album: '収録作品', duration: '時間', bpm: 'BPM', release: '配信掲載日', cd: '収録作品CD',
};

function sortValue(song: SongItem, key: SongTableSortKey): string | number | null {
  const fact = songEvidence[song.id as keyof typeof songEvidence];
  switch (key) {
    case 'title': return songReadings[song.id] ?? song.title;
    case 'low': return pitchNumber(fact.low);
    case 'chest': return pitchNumber(fact.chest);
    case 'falsetto': return fact.falsetto ? pitchNumber(fact.falsetto) : null;
    case 'album': return fact.album;
    case 'duration': return song.durationSec;
    case 'bpm': return isTempoUnderReview(song.id) ? null : song.bpm;
    case 'release': return fact.release;
    case 'cd': return fact.cd || null;
  }
}

export function sortSongTable(songs: SongItem[], sort: SongTableSort | null): SongItem[] {
  if (!sort) return songs;
  const direction = sort.direction === 'ascending' ? 1 : -1;
  return [...songs].sort((a, b) => {
    const left = sortValue(a, sort.key), right = sortValue(b, sort.key);
    // 未掲載・調査中の値は、どちらの方向でも末尾に置く。
    if (left === null || right === null) return Number(left === null) - Number(right === null) || a.guideOrder - b.guideOrder;
    const compared = typeof left === 'number' && typeof right === 'number'
      ? left - right : String(left).localeCompare(String(right), 'ja', { numeric: true });
    return compared * direction || a.guideOrder - b.guideOrder;
  });
}
