import type { SongItem } from '../data/higedanData';
import type { EraTag } from '../data/higedanTypes';
import { songAnnouncements } from '../data/songAnnouncements';
import { songReadings } from '../data/songReadings';
import { songLatinReadings, songTitleAliases } from '../data/songLatinReadings';
import { normalizeJaSearchKey, normalizeJaText } from './jaTextNormalize';
import { sanitizeUserText } from './userInput';
import { ALBUM_CHRONOLOGY_RANK, songAlbums, songwriterInfo } from './songCatalog';

// 曲名の空白・句読点の有無によらず検索する。
function keywords(query: string): string[] {
  return normalizeJaText(sanitizeUserText(query, 60)).split(/\s+/).map(normalizeJaSearchKey).filter(Boolean);
}

export function findSongAnnouncements(query: string, era: EraTag | 'all') {
  const words = keywords(query);
  if (query.trim() && !words.length) return [];
  return songAnnouncements.filter(song => {
    if (era !== 'all' && era !== song.era) return false;
    const fields = [song.title, ...song.aliases, ...song.facts].map(normalizeJaSearchKey);
    return words.every(word => fields.some(field => field.includes(word)));
  });
}

function titleKeys(song: SongItem): string[] {
  return [song.title, songReadings[song.id] ?? '', songLatinReadings[song.id] ?? '', ...(songTitleAliases[song.id] ?? [])].map(normalizeJaSearchKey).filter(Boolean);
}

const albumSearchKeys = new Map(Object.keys(ALBUM_CHRONOLOGY_RANK).map(album =>
  [normalizeJaSearchKey(album), album === 'Escaparade' ? 'エスカパレード' : album]
));

export function albumForSearch(query: string): string | undefined {
  return albumSearchKeys.get(normalizeJaSearchKey(query.trim()));
}

type SongContext = { label: string; text: string; source?: string; searchAliases?: string[] };

function contextKeys(field: SongContext): string[] {
  return [field.label + field.text, ...(field.searchAliases ?? [])].map(normalizeJaSearchKey);
}

function contextFields(song: SongItem): SongContext[] {
  const credit = songwriterInfo(song);
  return [
    ...songAlbums(song).map(({ album, trackNumber }) => ({
      label: '収録作品', text: trackNumber ? `${album} (M${trackNumber})` : album,
    })),
    ...song.tieUps.map(tieUp => ({ label: 'タイアップ', ...tieUp })),
    ...(credit ? [{ label: '作詞・作曲', text: credit.name, source: credit.source }] : []),
    ...(song.releaseNote ? [{ label: '収録メモ', text: song.releaseNote }] : []),
  ];
}

interface CachedSongSearchIndex {
  titles: string[];
  contexts: SongContext[];
  contextKeysList: string[][];
  searchable: string[];
}

const songSearchCache = new WeakMap<SongItem, CachedSongSearchIndex>();

function getSongSearchIndex(song: SongItem): CachedSongSearchIndex {
  const cached = songSearchCache.get(song);
  if (cached) return cached;
  const titles = titleKeys(song);
  const contexts = contextFields(song);
  const contextKeysList = contexts.map(contextKeys);
  const searchable = titles.concat(
    contextKeysList.flat(),
    normalizeJaSearchKey(song.musicalHighlight),
    normalizeJaSearchKey(song.linerNotes),
  );
  const index = { titles, contexts, contextKeysList, searchable };
  songSearchCache.set(song, index);
  return index;
}

/** A lower rank is a better match. Unmatched songs are excluded. */
export function prepareSongSearch(query: string) {
  if (!query.trim()) return null;
  const words = keywords(query);
  const phrase = words.join('');
  const exactAlbum = albumForSearch(query);
  return (song: SongItem): number | undefined => {
    if (!phrase) return undefined;
    if (exactAlbum) return songAlbums(song).some(item => item.album === exactAlbum) ? 0 : undefined;
    const { titles, searchable } = getSongSearchIndex(song);
    if (titles.includes(phrase)) return 0;
    if (titles.some(title => title.startsWith(phrase))) return 1;
    if (words.every(word => titles.some(title => title.includes(word)))) return 2;

    return words.every(word => searchable.some(field => field.includes(word))) ? 3 : undefined;
  };
}

export function matchedSongContexts(query: string, song: SongItem) {
  const words = keywords(query);
  const { titles, contexts, contextKeysList } = getSongSearchIndex(song);
  if (!words.length || titles.includes(words.join(''))) return [];
  return contexts.filter((_, idx) =>
    words.some(word => contextKeysList[idx].some(key => key.includes(word)) && !titles.some(title => title.includes(word)))
  );
}
