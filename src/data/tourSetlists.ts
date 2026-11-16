import type { TourSetlistTrack } from './higedanData';
import { normalizeSetlistOrder, type SetlistEntry } from '../utils/setlist';
import bundle from './tourSetlistRecords.json';

interface TourSetlistBundle {
  templates: Record<string, TourSetlistTrack[]>;
  events: Record<string, { templateId: string; note?: string }>;
}

const data = bundle as TourSetlistBundle;

/** Look up the verified setlist tracks and editorial note for a concert event ID. */
export function getTourEventSetlist(
  eventId: string,
): { tracks: TourSetlistTrack[]; note?: string } | null {
  const ref = Object.hasOwn(data.events, eventId) ? data.events[eventId] : undefined;
  if (!ref) return null;
  const tracks = Object.hasOwn(data.templates, ref.templateId)
    ? data.templates[ref.templateId]
    : undefined;
  if (!tracks || tracks.length === 0) return null;
  return ref.note ? { tracks, note: ref.note } : { tracks };
}

/** Extracts catalog songs from a verified concert setlist for loading into MYセトリ. */
export function extractCatalogSetlistEntries(
  eventId: string,
  validSongIds?: ReadonlySet<string>,
): { entries: SetlistEntry[]; totalTracks: number; skippedCount: number } | null {
  const data = getTourEventSetlist(eventId);
  if (!data) return null;

  const rawEntries: SetlistEntry[] = [];
  for (const track of data.tracks) {
    if (!track.songId) continue;
    if (validSongIds && !validSongIds.has(track.songId)) continue;
    rawEntries.push({ songId: track.songId, isEncore: Boolean(track.isEncore) });
  }
  const entries = normalizeSetlistOrder(rawEntries);
  return {
    entries,
    totalTracks: data.tracks.length,
    skippedCount: data.tracks.length - entries.length,
  };
}
