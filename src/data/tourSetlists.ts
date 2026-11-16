import type { TourSetlistTrack } from './higedanData';
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
