import { verifiedSongs as HIGEDAN_SONGS } from '../../data/fullCatalogSongs';
import { SACRED_SPOTS } from '../../data/sacredSpotsData';
import { TOUR_ARCHIVES } from '../../data/tourArchivesData';
import { TOUR_OPENING_TRIO_KEYS } from '../../data/tourOpeningTrios';

export const VALID_SONG_IDS = new Set(HIGEDAN_SONGS.map((song) => song.id));
export const SONG_BY_ID = new Map(HIGEDAN_SONGS.map((song) => [song.id, song]));
export const CHECKABLE_SPOTS = SACRED_SPOTS.filter((spot) => spot.mapScope !== 'none');
export const VALID_TOUR_IDS = new Set(TOUR_ARCHIVES.map((t) => t.id));
export const VALID_CHECKABLE_SPOT_IDS = new Set(CHECKABLE_SPOTS.map((s) => s.id));

export const ALBUM_SONGS_MAP = new Map<string, string[]>();
for (const song of HIGEDAN_SONGS) {
  const list = ALBUM_SONGS_MAP.get(song.album) ?? [];
  list.push(song.id);
  ALBUM_SONGS_MAP.set(song.album, list);
}

export const REAL_CONCERT_OPENING_TRIOS: ReadonlySet<string> = new Set(TOUR_OPENING_TRIO_KEYS);
