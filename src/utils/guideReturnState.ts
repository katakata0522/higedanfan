import type { SongGuideFilterValues } from '../components/SongGuideFilters';
import type { SacredSpotCategory } from '../data/higedanTypes';
import {
  getBrowserSessionStorage,
  hasBlockedKey,
  isPlainObject,
  safeJsonParseBounded,
  type BrowserStorageLike,
} from './browserStorage';
import { SACRED_SPOT_REGIONS, SPOT_CATEGORIES, type SacredSpotRegion } from './sacredSpotAreas';
import { ALBUM_CHRONOLOGY_RANK } from './songCatalog';
import { SONG_TABLE_SORT_KEYS } from './songTableSort';
import {
  clearSongReturnTab,
  guideReturnView,
  saveSongReturnTab,
  songReturnDestination,
  type GuideReturnView,
} from './songReturnTab';

export { clearSongReturnTab, guideReturnView, saveSongReturnTab, songReturnDestination };
export type { GuideReturnView };

const CONTROL_OR_BIDI_RE = /[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/;
const MAX_RETURN_STATE_BYTES = 10_000;

const key = 'higedanfan:guide-return:v1';
const archiveKey = 'higedanfan:archive-return:v1';
const tourKey = 'higedanfan:tour-return:v1';
const originTabKey = 'higedanfan:song-origin-tab:v1';
const eras = new Set(['all', 'indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026']);
const sounds = new Set(['all', 'piano_pop', 'brass_funk', 'emotional_ballad', 'stadium_rock']);
const sorts = new Set(['guide_order', 'album_track_order', 'popular', 'newest', 'release_oldest', 'highest_note', 'vocal_span', 'bpm']);

type Store = Pick<BrowserStorageLike, 'getItem' | 'setItem' | 'removeItem'>;
export type GuideReturnState = {
  filters: SongGuideFilterValues;
  visibleCount: number;
  view: GuideReturnView;
  showTieUps?: boolean;
  originSongId?: string;
  voice?: { low: string; high: string; keyShift: number };
};
export type MapReturnState = {
  region: SacredSpotRegion;
  category: SacredSpotCategory | 'all';
  visitedOnly: boolean;
  filtersOpen: boolean;
  mapSpotId: string;
  pinnedSpotId: string | null;
  originSpotId: string;
};
export type ArchiveReturnState = {
  publisher: string;
  query: string;
  order: 'newest' | 'oldest';
  visibleCount: number;
  resetEpoch?: string;
};
export type TourCategoryFilter = 'all' | 'tour' | 'one_man' | 'online_fc' | 'free_special';
export type TourReturnState = {
  query: string;
  sortOrder: 'newest' | 'oldest';
  category: TourCategoryFilter;
  year?: string;
  attendedOnly?: boolean;
  setlistOnly?: boolean;
  openTourId?: string;
  openEventId?: string;
  resetEpoch?: string;
};

function browserStore(): Store | null {
  return getBrowserSessionStorage();
}

export function clearGuideListReturnState(store: Store | null = browserStore()): void {
  try { store?.removeItem(key); } catch { /* ignore */ }
}

export function clearArchiveReturnState(store: Store | null = browserStore()): void {
  try { store?.removeItem(archiveKey); } catch { /* ignore */ }
}

export function clearTourReturnState(store: Store | null = browserStore()): void {
  try { store?.removeItem(tourKey); } catch { /* ignore */ }
}

export function clearGuideReturnState(store: Store | null = browserStore()): void {
  try {
    store?.removeItem(key);
    store?.removeItem(archiveKey);
    store?.removeItem(tourKey);
    store?.removeItem(originTabKey);
  } catch { /* ignore */ }
}

export function saveGuideReturnState(state: GuideReturnState, store: Store | null = browserStore()): void {
  try {
    store?.setItem(key, JSON.stringify(state));
    store?.setItem(originTabKey, state.view);
  } catch { /* 保存できない環境では通常の一覧へ戻す。 */ }
}

export function saveMapReturnState(state: MapReturnState, store: Store | null = browserStore()): void {
  try {
    store?.setItem(key, JSON.stringify({ ...state, view: 'sacred_map' }));
    saveSongReturnTab('sacred_map', store);
  } catch { /* 保存できない環境では通常の地図へ戻す。 */ }
}

export function takeMapReturnState(spotIds: readonly string[], store: Store | null = browserStore()): MapReturnState | null {
  try {
    const raw = store?.getItem(key);
    store?.removeItem(key);
    const parsed = safeJsonParseBounded(raw, 2000);
    if (!isPlainObject(parsed) || hasBlockedKey(parsed, 4)) return null;
    if (
      parsed.view !== 'sacred_map' ||
      !SACRED_SPOT_REGIONS.some(region => region.id === parsed.region) ||
      !SPOT_CATEGORIES.includes(parsed.category as SacredSpotCategory | 'all') ||
      typeof parsed.visitedOnly !== 'boolean' ||
      typeof parsed.filtersOpen !== 'boolean' ||
      typeof parsed.originSpotId !== 'string' ||
      !spotIds.includes(parsed.originSpotId) ||
      typeof parsed.mapSpotId !== 'string' ||
      (parsed.mapSpotId !== '' && !spotIds.includes(parsed.mapSpotId)) ||
      (parsed.pinnedSpotId !== null && (typeof parsed.pinnedSpotId !== 'string' || !spotIds.includes(parsed.pinnedSpotId)))
    ) {
      return null;
    }
    return {
      region: parsed.region as SacredSpotRegion,
      category: parsed.category as SacredSpotCategory | 'all',
      visitedOnly: parsed.visitedOnly,
      filtersOpen: parsed.filtersOpen,
      mapSpotId: parsed.mapSpotId,
      pinnedSpotId: parsed.pinnedSpotId,
      originSpotId: parsed.originSpotId,
    };
  } catch { return null; }
}

export function takeGuideReturnState(songCount: number, store: Store | null = browserStore()): GuideReturnState | null {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    store.removeItem(key);
    store.removeItem(originTabKey);
    const value = safeJsonParseBounded(raw, MAX_RETURN_STATE_BYTES);
    if (!isPlainObject(value) || hasBlockedKey(value, 5)) return null;
    const { filters: rawFilters, visibleCount, view, originSongId, voice: rawVoice, showTieUps } = value;
    if (!isPlainObject(rawFilters) ||
        (view !== 'discography' && view !== 'vocal_range') ||
        typeof rawFilters.era !== 'string' || !eras.has(rawFilters.era) ||
        typeof rawFilters.sound !== 'string' || !sounds.has(rawFilters.sound) ||
        typeof rawFilters.sortBy !== 'string' || !sorts.has(rawFilters.sortBy) ||
        typeof rawFilters.album !== 'string' ||
        (rawFilters.album !== 'all' && !Object.hasOwn(ALBUM_CHRONOLOGY_RANK, rawFilters.album)) ||
        typeof rawFilters.searchQuery !== 'string' ||
        rawFilters.searchQuery.length > 60 ||
        CONTROL_OR_BIDI_RE.test(rawFilters.searchQuery) ||
        !Number.isInteger(visibleCount) || Number(visibleCount) < 1 || Number(visibleCount) > songCount) return null;
    if (originSongId !== undefined && (typeof originSongId !== 'string' || !/^[a-z0-9-]+$/.test(originSongId) || originSongId.length > 60)) return null;
    let tableSort: SongGuideFilterValues['tableSort'];
    if (rawFilters.tableSort !== undefined) {
      if (
        !isPlainObject(rawFilters.tableSort) ||
        typeof rawFilters.tableSort.key !== 'string' ||
        !SONG_TABLE_SORT_KEYS.includes(rawFilters.tableSort.key as NonNullable<SongGuideFilterValues['tableSort']>['key']) ||
        (rawFilters.tableSort.direction !== 'ascending' && rawFilters.tableSort.direction !== 'descending')
      ) {
        return null;
      }
      tableSort = {
        key: rawFilters.tableSort.key as NonNullable<SongGuideFilterValues['tableSort']>['key'],
        direction: rawFilters.tableSort.direction,
      };
    }
    const filters: SongGuideFilterValues = {
      era: rawFilters.era as SongGuideFilterValues['era'],
      sound: rawFilters.sound as SongGuideFilterValues['sound'],
      sortBy: rawFilters.sortBy as SongGuideFilterValues['sortBy'],
      album: rawFilters.album,
      searchQuery: rawFilters.searchQuery,
      ...(tableSort ? { tableSort } : {}),
    };
    const comparison = showTieUps === true ? { showTieUps: true } : {};
    const origin = originSongId !== undefined ? { originSongId } : {};
    if (rawVoice !== undefined) {
      const pitchValid = (pitch: unknown): pitch is string =>
        typeof pitch === 'string' && (pitch === '' || (/^\d+$/.test(pitch) && Number(pitch) >= 36 && Number(pitch) <= 84));
      if (
        !isPlainObject(rawVoice) ||
        !pitchValid(rawVoice.low) ||
        !pitchValid(rawVoice.high) ||
        !Number.isInteger(rawVoice.keyShift) ||
        Number(rawVoice.keyShift) < -12 ||
        Number(rawVoice.keyShift) > 12
      ) {
        return null;
      }
      return {
        filters,
        visibleCount: Number(visibleCount),
        view,
        voice: { low: rawVoice.low, high: rawVoice.high, keyShift: Number(rawVoice.keyShift) },
        ...comparison,
        ...origin,
      };
    }
    return { filters, visibleCount: Number(visibleCount), view, ...comparison, ...origin };
  } catch { return null; }
}

export function saveArchiveReturnState(
  state: ArchiveReturnState,
  store: Store | null = browserStore(),
): void {
  try {
    store?.setItem(archiveKey, JSON.stringify({
      publisher: state.publisher,
      query: state.query,
      order: state.order,
      visibleCount: state.visibleCount,
      resetEpoch: state.resetEpoch ?? '',
    }));
    store?.setItem(originTabKey, 'quiz_archive');
  } catch { /* 保存できない環境では通常の参考記事一覧へ戻す。 */ }
}

export function readArchiveReturnState(
  articleCount: number,
  expectedEpoch = '',
  allowedPublishers?: readonly string[],
  store: Store | null = browserStore(),
): ArchiveReturnState | null {
  if (!store) return null;
  try {
    const raw = store.getItem(archiveKey);
    const value = safeJsonParseBounded(raw, MAX_RETURN_STATE_BYTES);
    if (!isPlainObject(value) || hasBlockedKey(value, 4)) return null;
    const record = value;
    const stateEpoch = typeof record.resetEpoch === 'string' ? record.resetEpoch : '';
    if (stateEpoch !== expectedEpoch) return null;
    if (
      typeof record.publisher !== 'string' ||
      record.publisher.length < 1 ||
      record.publisher.length > 80 ||
      CONTROL_OR_BIDI_RE.test(record.publisher) ||
      (allowedPublishers && record.publisher !== 'all' && !allowedPublishers.includes(record.publisher)) ||
      typeof record.query !== 'string' ||
      record.query.length > 60 ||
      CONTROL_OR_BIDI_RE.test(record.query) ||
      (record.order !== 'newest' && record.order !== 'oldest') ||
      !Number.isInteger(record.visibleCount) ||
      Number(record.visibleCount) < 1 ||
      Number(record.visibleCount) > articleCount
    ) {
      return null;
    }
    return {
      publisher: record.publisher,
      query: record.query,
      order: record.order,
      visibleCount: Number(record.visibleCount),
      resetEpoch: expectedEpoch,
    };
  } catch {
    return null;
  }
}

export function takeArchiveReturnState(
  articleCount: number,
  expectedEpoch = '',
  allowedPublishers?: readonly string[],
  store: Store | null = browserStore(),
): ArchiveReturnState | null {
  if (!store) return null;
  const restored = readArchiveReturnState(articleCount, expectedEpoch, allowedPublishers, store);
  try {
    store.removeItem(archiveKey);
    store.removeItem(originTabKey);
  } catch { /* ignore */ }
  return restored;
}

const tourCategories = new Set<TourCategoryFilter>(['all', 'tour', 'one_man', 'online_fc', 'free_special']);

export function saveTourReturnState(
  state: TourReturnState,
  store: Store | null = browserStore(),
): void {
  try {
    store?.setItem(tourKey, JSON.stringify({
      query: state.query,
      sortOrder: state.sortOrder,
      category: state.category,
      ...(state.year && state.year !== 'all' ? { year: state.year } : {}),
      ...(state.attendedOnly ? { attendedOnly: true } : {}),
      ...(state.setlistOnly ? { setlistOnly: true } : {}),
      ...(state.openTourId ? { openTourId: state.openTourId } : {}),
      ...(state.openEventId ? { openEventId: state.openEventId } : {}),
      resetEpoch: state.resetEpoch ?? '',
    }));
    store?.setItem(originTabKey, 'tour_archive');
  } catch { /* 保存できない環境では通常表示へ戻す。 */ }
}

export function readTourReturnState(
  expectedEpoch = '',
  store: Store | null = browserStore(),
): TourReturnState | null {
  if (!store) return null;
  try {
    const raw = store.getItem(tourKey);
    const value = safeJsonParseBounded(raw, MAX_RETURN_STATE_BYTES);
    if (!isPlainObject(value) || hasBlockedKey(value, 4)) return null;
    const record = value;
    const stateEpoch = typeof record.resetEpoch === 'string' ? record.resetEpoch : '';
    if (stateEpoch !== expectedEpoch) return null;
    const validOptionalId = (val: unknown) =>
      val === undefined || (typeof val === 'string' && val.length > 0 && val.length <= 80 && !CONTROL_OR_BIDI_RE.test(val));
    const validOptionalYear =
      record.year === undefined || (typeof record.year === 'string' && (record.year === 'all' || /^\d{4}$/.test(record.year)));
    const validOptionalBool = (val: unknown) => val === undefined || typeof val === 'boolean';
    if (
      typeof record.query !== 'string' ||
      record.query.length > 60 ||
      CONTROL_OR_BIDI_RE.test(record.query) ||
      (record.sortOrder !== 'newest' && record.sortOrder !== 'oldest') ||
      !tourCategories.has(record.category as TourCategoryFilter) ||
      !validOptionalYear ||
      !validOptionalBool(record.attendedOnly) ||
      !validOptionalBool(record.setlistOnly) ||
      !validOptionalId(record.openTourId) ||
      !validOptionalId(record.openEventId)
    ) {
      return null;
    }
    return {
      query: record.query,
      sortOrder: record.sortOrder,
      category: record.category as TourCategoryFilter,
      ...(typeof record.year === 'string' ? { year: record.year } : {}),
      ...(typeof record.attendedOnly === 'boolean' ? { attendedOnly: record.attendedOnly } : {}),
      ...(typeof record.setlistOnly === 'boolean' ? { setlistOnly: record.setlistOnly } : {}),
      ...(typeof record.openTourId === 'string' ? { openTourId: record.openTourId } : {}),
      ...(typeof record.openEventId === 'string' ? { openEventId: record.openEventId } : {}),
      resetEpoch: expectedEpoch,
    };
  } catch {
    return null;
  }
}

export function takeTourReturnState(
  expectedEpoch = '',
  store: Store | null = browserStore(),
): TourReturnState | null {
  if (!store) return null;
  const restored = readTourReturnState(expectedEpoch, store);
  try {
    store.removeItem(tourKey);
    store.removeItem(originTabKey);
  } catch { /* ignore */ }
  return restored;
}
