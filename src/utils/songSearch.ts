import type { SongItem } from '../data/higedanData';
import { songReadings } from '../data/songReadings';
import { songLatinReadings, songTitleAliases } from '../data/songLatinReadings';
import { sanitizeUserText } from './userInput';
import { ALBUM_CHRONOLOGY_RANK, songAlbums, songwriterInfo } from './songCatalog';

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, kana =>
    String.fromCharCode(kana.charCodeAt(0) - 0x60)
  );
}

// 曲名の空白・句読点の有無によらず検索する。
function searchKey(value: string): string {
  return normalize(value).replace(/[\s'‘’".…・!?‐‑–—×-]+/g, '');
}

function keywords(query: string): string[] {
  return normalize(sanitizeUserText(query, 60)).split(/\s+/).map(searchKey).filter(Boolean);
}

function titleKeys(song: SongItem): string[] {
  return [song.title, songReadings[song.id] ?? '', songLatinReadings[song.id] ?? '', ...(songTitleAliases[song.id] ?? [])].map(searchKey).filter(Boolean);
}

const albumSearchKeys = new Map(Object.keys(ALBUM_CHRONOLOGY_RANK).map(album =>
  [searchKey(album), album === 'Escaparade' ? 'エスカパレード' : album]
));

export function albumForSearch(query: string): string | undefined {
  return albumSearchKeys.get(searchKey(query.trim()));
}

function contextFields(song: SongItem): { label: string; text: string; source?: string }[] {
  const credit = songwriterInfo(song);
  return [
    ...songAlbums(song).map(({ album, trackNumber }) => ({
      label: '収録作品', text: trackNumber ? `${album} (M${trackNumber})` : album,
    })),
    ...song.tieUps.map(({ text, source }) => ({ label: 'タイアップ', text, source })),
    ...(credit ? [{ label: '作詞・作曲', text: credit.name, source: credit.source }] : []),
    ...(song.releaseNote ? [{ label: '収録メモ', text: song.releaseNote }] : []),
  ];
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
    const titles = titleKeys(song);
    if (titles.includes(phrase)) return 0;
    if (titles.some(title => title.startsWith(phrase))) return 1;
    if (words.every(word => titles.some(title => title.includes(word)))) return 2;

    const fields = [
      ...contextFields(song).map(item => item.label + item.text), song.musicalHighlight, song.linerNotes,
    ].map(searchKey);
    const searchable = titles.concat(fields);
    return words.every(word => searchable.some(field => field.includes(word))) ? 3 : undefined;
  };
}

export function matchedSongContexts(query: string, song: SongItem) {
  const words = keywords(query);
  const titles = titleKeys(song);
  if (!words.length || titles.includes(words.join(''))) return [];
  return contextFields(song).filter(field =>
    words.some(word => searchKey(field.label + field.text).includes(word) && !titles.some(title => title.includes(word)))
  );
}
