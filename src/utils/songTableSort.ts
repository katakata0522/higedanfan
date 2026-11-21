import type { SongItem } from '../data/higedanData';
import { pitchNumber, songEvidence } from '../data/fullCatalogSongs';
import { songReadings } from '../data/songReadings';
import { isTempoUnderReview } from '../data/tempoReviewStatus';

export const SONG_TABLE_SORT_KEYS = ['title', 'low', 'chest', 'falsetto', 'album', 'duration', 'bpm', 'release', 'cd'] as const;
export type SongTableSortKey = typeof SONG_TABLE_SORT_KEYS[number];
export type SongTableSort = { key: SongTableSortKey; direction: 'ascending' | 'descending' };
export const SONG_TABLE_SORT_LABELS: Record<SongTableSortKey, string> = {
  title: '曲名', low: '地声最低', chest: '地声最高', falsetto: '裏声最高',
  album: '収録作品', duration: '演奏時間', bpm: 'BPM', release: '配信日', cd: 'CD発売日',
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
  return songs
    .map((song) => ({ song, value: sortValue(song, sort.key) }))
    .sort((a, b) => {
      // 未掲載・調査中の値は、どちらの方向でも末尾に置く。
      if (a.value === null || b.value === null) {
        return Number(a.value === null) - Number(b.value === null) || a.song.guideOrder - b.song.guideOrder;
      }
      const compared = typeof a.value === 'number' && typeof b.value === 'number'
        ? a.value - b.value
        : String(a.value).localeCompare(String(b.value), 'ja', { numeric: true });
      return compared * direction || a.song.guideOrder - b.song.guideOrder;
    })
    .map((entry) => entry.song);
}
