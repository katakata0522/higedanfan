import { VERIFIED_SONG_BY_ID, verifiedSongs as HIGEDAN_SONGS } from '../data/fullCatalogSongs';
import { VALID_SPOT_IDS, VALID_TOUR_IDS } from '../data/recordValidationIds';
import type { FanReview, SongItem } from '../data/higedanData';
import {
  getBrowserLocalStorage,
  hasBlockedKey,
  type BrowserStorageLike,
} from '../utils/browserStorage';
import { sanitizeSetlistEntries, sanitizeSetlistTitle, type SetlistEntry } from '../utils/setlist';
import { sanitizeReviewsList } from '../utils/fanReviews';
import { sanitizeSafeId } from '../utils/userInput';

export const STORAGE_KEY = 'higedan_fan_magazine_state_v1';

const MAX_STATE_BYTES = 2_000_000;
const VOTE_CATEGORIES = new Set(['overall', 'lyric', 'live', 'hiddenGem']);
const V1_FORMAT_FIELDS = [
  'songs',
  'setlist',
  'setlistTitle',
  'reviews',
  'likedReviewIds',
  'visitedSpotIds',
  'attendedTourIds',
  'votedKeys',
  'bestQuizScore',
  'resetEpoch',
] as const;

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
  setlistMembershipVersions?: Record<string, number>;
}

function parseFanRecordRoot(raw: string): Partial<PersistedState> {
  if (typeof raw !== 'string' || raw.length > MAX_STATE_BYTES) {
    throw new TypeError('Invalid fan record length');
  }
  const value: unknown = JSON.parse(raw);
  if (value === null || typeof value !== 'object' || Array.isArray(value) || hasBlockedKey(value, 12)) {
    throw new TypeError('Expected a v1 fan record object');
  }
  const parsed = value as Partial<PersistedState>;
  if (Object.keys(parsed).length > 0 && !V1_FORMAT_FIELDS.some(field => Object.hasOwn(parsed, field))) {
    throw new TypeError('Unrecognized fan record format');
  }
  return parsed;
}

/** Validates v1 storage root shape and returns resetEpoch without cloning all 90 SongItems. */
export function readResetEpoch(raw: string): string {
  const parsed = parseFanRecordRoot(raw);
  return typeof parsed.resetEpoch === 'string' && parsed.resetEpoch.length <= 120 ? parsed.resetEpoch : '';
}

export function readStoredResetEpoch(
  storage: Pick<BrowserStorageLike, 'getItem'> | null = getBrowserLocalStorage(),
): string | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? '' : readResetEpoch(raw);
  } catch {
    return null;
  }
}

function restoreIds(
  value: unknown,
  maxLength: number,
  maxItems: number,
  predicate?: (id: string) => boolean,
) {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const rawId of value) {
    if (out.length >= maxItems) break;
    const id = sanitizeSafeId(rawId, maxLength);
    if (!id || seen.has(id) || (predicate && !predicate(id))) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function isValidVoteKey(key: string): boolean {
  const sep = key.indexOf(':');
  if (sep <= 0) return false;
  const songId = key.slice(0, sep);
  const category = key.slice(sep + 1);
  return VERIFIED_SONG_BY_ID.has(songId) && VOTE_CATEGORIES.has(category);
}

// Keep valid user records and migrate sample votes and reviews from earlier v1 saves.
// A parse error propagates to the caller, which must not overwrite an unreadable save.
export function restoreFanRecords(raw: string) {
  const parsed = parseFanRecordRoot(raw);
  const validSongIds = new Set(VERIFIED_SONG_BY_ID.keys());
  const versions = parsed.setlistMembershipVersions;
  const setlistMembershipVersions = versions && typeof versions === 'object' && !Array.isArray(versions)
    ? Object.fromEntries(Object.entries(versions).filter(([id, version]) => validSongIds.has(id) &&
      typeof version === 'number' && Number.isSafeInteger(version) && version >= 0)) : {};
  const validSpotIds = VALID_SPOT_IDS;
  const validTourIds = VALID_TOUR_IDS;
  const votedKeys = restoreIds(parsed.votedKeys, 60, 400, isValidVoteKey);
  const likedReviewIds = restoreIds(parsed.likedReviewIds, 40, 200);
  const castVotes = new Set(votedKeys ?? []);
  const likes = new Set(likedReviewIds ?? []);

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
    visitedSpotIds: restoreIds(parsed.visitedSpotIds, 40, 200, id => validSpotIds.has(id)),
    attendedTourIds: restoreIds(parsed.attendedTourIds, 40, 500, id => validTourIds.has(id)),
    votedKeys,
    likedReviewIds,
    bestQuizScore: parsed.bestQuizScore === 0 && !parsed.hasQuizAttempt ? null :
      typeof parsed.bestQuizScore === 'number' && Number.isFinite(parsed.bestQuizScore)
        ? Math.max(0, Math.min(100, Math.round(parsed.bestQuizScore))) : undefined,
    resetEpoch: typeof parsed.resetEpoch === 'string' && parsed.resetEpoch.length <= 120 ? parsed.resetEpoch : '',
    setlistMembershipVersions,
  };
}
