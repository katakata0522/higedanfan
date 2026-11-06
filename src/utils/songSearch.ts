import type { SongItem } from '../data/higedanData';
import { songReadings } from '../data/songReadings';
import { sanitizeUserText } from './userInput';

function normalize(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, kana =>
    String.fromCharCode(kana.charCodeAt(0) - 0x60)
  );
}

// Keep pitch sharps and numbers; ignore separators such as those in Cry Baby and I LOVE....
function searchKey(value: string): string {
  return normalize(value).replace(/[\s'‘’".…・!?‐‑–—×-]+/g, '');
}

function keywords(query: string): string[] {
  return normalize(sanitizeUserText(query, 60)).split(/\s+/).map(searchKey).filter(Boolean);
}

function titleKeys(song: SongItem): string[] {
  return [song.title, songReadings[song.id] ?? ''].map(searchKey).filter(Boolean);
}

/** A lower rank is a better match. Unmatched songs are excluded. */
export function prepareSongSearch(query: string) {
  if (!query.trim()) return null;
  const words = keywords(query);
  const phrase = words.join('');
  return (song: SongItem): number | undefined => {
    if (!phrase) return undefined;
    const titles = titleKeys(song);
    if (titles.includes(phrase)) return 0;
    if (titles.some(title => title.startsWith(phrase))) return 1;
    if (words.every(word => titles.some(title => title.includes(word)))) return 2;

    const fields = [
      song.album, song.tieUp, song.musicalHighlight, song.linerNotes,
      song.vocalRange.highestChestNote, song.vocalRange.highestFalsettoNote,
      song.vocalRange.lowestNote, song.vocalRange.highNoteSection,
    ].map(searchKey);
    const searchable = titles.concat(fields);
    return words.every(word => searchable.some(field => field.includes(word))) ? 3 : undefined;
  };
}

export function matchesTieUp(query: string, song: SongItem): boolean {
  const words = keywords(query);
  if (!words.length) return false;
  const tieUp = searchKey(song.tieUp);
  const primary = [...titleKeys(song), searchKey(song.album)];
  return words.some(word => tieUp.includes(word) && !primary.some(field => field.includes(word)));
}
