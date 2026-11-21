import type { TourArchive, TourEventRecord } from '../data/higedanData';
import { songLatinReadings, songTitleAliases } from '../data/songLatinReadings';
import { songReadings } from '../data/songReadings';
import { getTourEventSetlist } from '../data/tourSetlists';
import { hiraganaFromKatakana } from './jaTextNormalize';

// Normalize date delimiters, full-width text, and kana case for forgiving tour & song lookup.
function normalizeTourSearch(value: string): string {
  return hiraganaFromKatakana(
    value
      .normalize('NFKC')
      .trim()
      .toLocaleLowerCase('ja'),
  ).replace(/(\d)[./](?=\d)/g, '$1-');
}

function trackSearchText(title: string, songId?: string, artist?: string, note?: string): string {
  const parts = [title];
  if (artist) parts.push(artist);
  if (note) parts.push(note);
  if (songId) {
    if (songReadings[songId]) parts.push(songReadings[songId]);
    if (songLatinReadings[songId]) parts.push(songLatinReadings[songId]);
    for (const alias of songTitleAliases[songId] ?? []) parts.push(alias);
  }
  return normalizeTourSearch(parts.join(' '));
}

export interface TourSearchMatchResult {
  tour: TourArchive;
  events: TourEventRecord[];
  matchedSongsByEventId: ReadonlyMap<string, string[]>;
}

interface IndexedTourEntry {
  tour: TourArchive;
  events: {
    event: TourEventRecord;
    metaText: string;
    tracks: { title: string; text: string }[];
  }[];
}

const tourIndexCache = new WeakMap<TourArchive, IndexedTourEntry>();

function getIndexedTour(tour: TourArchive): IndexedTourEntry {
  const cached = tourIndexCache.get(tour);
  if (cached) return cached;
  const entry: IndexedTourEntry = {
    tour,
    events: tour.events.map(event => {
      const setlist = event.hasSetlist ? getTourEventSetlist(event.id) : null;
      const tracks = setlist
        ? setlist.tracks.map(track => ({
            title: track.title,
            text: trackSearchText(track.title, track.songId, track.artist, track.note),
          }))
        : [];
      return {
        event,
        metaText: normalizeTourSearch(`${tour.tourTitle} ${event.date} ${event.venue} ${event.label ?? ''}`),
        tracks,
      };
    }),
  };
  tourIndexCache.set(tour, entry);
  return entry;
}

export function createTourArchiveSearch(tours: readonly TourArchive[]) {
  const index = tours.map(getIndexedTour);

  return (query: string): TourSearchMatchResult[] => {
    const needle = normalizeTourSearch(query);
    if (!needle) {
      return tours.map(tour => ({
        tour,
        events: tour.events,
        matchedSongsByEventId: new Map<string, string[]>(),
      }));
    }

    const results: TourSearchMatchResult[] = [];
    for (const { tour, events } of index) {
      const matchedEvents: TourEventRecord[] = [];
      const matchedSongsByEventId = new Map<string, string[]>();

      for (const entry of events) {
        const metaMatched = entry.metaText.includes(needle);
        const songMatches: string[] = [];
        for (const track of entry.tracks) {
          if (track.text.includes(needle) && !songMatches.includes(track.title)) {
            songMatches.push(track.title);
          }
        }
        if (metaMatched || songMatches.length > 0) {
          matchedEvents.push(entry.event);
          if (songMatches.length > 0) {
            matchedSongsByEventId.set(entry.event.id, songMatches);
          }
        }
      }

      if (matchedEvents.length > 0) {
        results.push({ tour, events: matchedEvents, matchedSongsByEventId });
      }
    }
    return results;
  };
}
