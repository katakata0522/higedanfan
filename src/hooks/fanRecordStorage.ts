import { HIGEDAN_SONGS, SACRED_SPOTS, TOUR_ARCHIVES, type FanReview, type SongItem } from '../data/higedanData';
import { sanitizeSetlistTitle } from '../utils/setlist';
import { sanitizeReviewsList, sanitizeSafeId, sanitizeSetlistEntries, type SetlistEntry } from '../utils/fanLogic';

export const STORAGE_KEY = 'higedan_fan_magazine_state_v1';

export interface PersistedState {
  songs: Pick<SongItem, 'id' | 'votes'>[];
  setlist: SetlistEntry[];
  setlistTitle: string;
  visitedSpotIds: string[];
  attendedTourIds: string[];
  votedKeys: string[];
  reviews: FanReview[];
  likedReviewIds: string[];
  bestQuizScore: number | null;
  hasQuizAttempt?: boolean;
  resetEpoch?: string;
}

function restoreIds(value: unknown, maxLength: number, validIds?: Set<string>) {
  if (!Array.isArray(value)) return undefined;
  return value
    .map(id => sanitizeSafeId(id, maxLength))
    .filter(id => id.length > 0 && (!validIds || validIds.has(id)));
}

// Keep valid user records and migrate sample votes and reviews from earlier v1 saves.
// A parse error propagates to the caller, which must not overwrite an unreadable save.
export function restoreFanRecords(raw: string) {
  const value: unknown = JSON.parse(raw);
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Expected a v1 fan record object');
  }
  const parsed = value as Partial<PersistedState>;
  if (Object.keys(parsed).length > 0 && ![
    'songs', 'setlist', 'setlistTitle', 'reviews', 'likedReviewIds', 'visitedSpotIds',
    'attendedTourIds', 'votedKeys', 'bestQuizScore', 'resetEpoch',
  ].some(field => Object.hasOwn(parsed, field))) {
    throw new TypeError('Unrecognized fan record format');
  }
  const validSongIds = new Set(HIGEDAN_SONGS.map(song => song.id));
  const validSpotIds = new Set(SACRED_SPOTS.map(spot => spot.id));
  const validTourIds = new Set(TOUR_ARCHIVES.map(tour => tour.id));
  const castVotes = new Set(Array.isArray(parsed.votedKeys) ? parsed.votedKeys : []);
  const likes = new Set(Array.isArray(parsed.likedReviewIds) ? parsed.likedReviewIds : []);

  // The click history is authoritative, even when a legacy save includes sample totals.
  const songs = HIGEDAN_SONGS.map(song => ({
    ...song,
    votes: {
      overall: Number(castVotes.has(song.id + ':overall')),
      lyric: Number(castVotes.has(song.id + ':lyric')),
      live: Number(castVotes.has(song.id + ':live')),
      hiddenGem: Number(castVotes.has(song.id + ':hiddenGem')),
    },
  }));
  const reviews = sanitizeReviewsList(parsed.reviews, validSongIds)
    ?.filter(review => !/^rev-[1-4]$/.test(review.id))
    .map(review => ({ ...review, likes: Number(likes.has(review.id)) }));

  return {
    songs,
    reviews,
    setlist: sanitizeSetlistEntries(parsed.setlist, validSongIds),
    setlistTitle: typeof parsed.setlistTitle === 'string' ? sanitizeSetlistTitle(parsed.setlistTitle) : undefined,
    visitedSpotIds: restoreIds(parsed.visitedSpotIds, 40, validSpotIds),
    attendedTourIds: restoreIds(parsed.attendedTourIds, 40, validTourIds),
    votedKeys: restoreIds(parsed.votedKeys, 60),
    likedReviewIds: restoreIds(parsed.likedReviewIds, 40),
    bestQuizScore: parsed.bestQuizScore === 0 && !parsed.hasQuizAttempt ? null :
      typeof parsed.bestQuizScore === 'number' && Number.isFinite(parsed.bestQuizScore)
        ? Math.max(0, Math.min(100, Math.round(parsed.bestQuizScore))) : undefined,
    resetEpoch: typeof parsed.resetEpoch === 'string' ? parsed.resetEpoch : '',
  };
}
