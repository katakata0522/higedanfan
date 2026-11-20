import type { SongGuideFilterValues } from '../components/SongGuideFilters';
import type { SacredSpotCategory } from '../data/higedanData';
import { SACRED_SPOT_REGIONS, SPOT_CATEGORIES, type SacredSpotRegion } from './sacredSpotAreas';
import { ALBUM_CHRONOLOGY_RANK } from './songCatalog';
import { SONG_TABLE_SORT_KEYS } from './songTableSort';

const key = 'higedanfan:guide-return:v1';
const archiveKey = 'higedanfan:archive-return:v1';
const tourKey = 'higedanfan:tour-return:v1';
const originTabKey = 'higedanfan:song-origin-tab:v1';
const originTabs = new Set([
  'home', 'mood', 'discography', 'vocal_range', 'sacred_map', 'setlist', 'tour_archive', 'quiz', 'quiz_archive',
]);
const ORIGIN_DESTINATIONS: Record<string, { hash: string; label: string }> = {
  home: { hash: 'home', label: 'トップページに戻る' },
  mood: { hash: 'mood', label: '今日の1曲診断に戻る' },
  discography: { hash: 'discography', label: '楽曲ガイドに戻る' },
  vocal_range: { hash: 'vocal_range', label: '音域一覧に戻る' },
  sacred_map: { hash: 'sacred_map', label: '聖地巡礼マップに戻る' },
  setlist: { hash: 'setlist', label: 'MYセトリ作成に戻る' },
  tour_archive: { hash: 'tour_archive', label: '歴代ツアー記録に戻る' },
  quiz: { hash: 'quiz', label: 'Official髭男dism検定に戻る' },
  quiz_archive: { hash: 'quiz_archive', label: '参考記事・インタビューに戻る' },
};
const eras = new Set(['all', 'indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026']);
const sounds = new Set(['all', 'piano_pop', 'brass_funk', 'emotional_ballad', 'stadium_rock']);
const sorts = new Set(['guide_order', 'album_track_order', 'popular', 'newest', 'release_oldest', 'highest_note', 'vocal_span', 'bpm']);

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type GuideReturnView = 'discography' | 'vocal_range';
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
  try { return window.sessionStorage; } catch { return null; }
}

export function saveSongReturnTab(tab: string, store: Store | null = browserStore()): void {
  if (!originTabs.has(tab)) return;
  try { store?.setItem(originTabKey, tab); } catch { /* 保存できない環境では既定の戻り先を使う。 */ }
}

export function clearSongReturnTab(store: Store | null = browserStore()): void {
  try { store?.removeItem(originTabKey); } catch { /* ignore */ }
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
    if (!raw || raw.length > 2000) return null;
    const state = JSON.parse(raw) as (MapReturnState & { view: string }) | null;
    if (state?.view !== 'sacred_map' ||
        !SACRED_SPOT_REGIONS.some(region => region.id === state.region) || !SPOT_CATEGORIES.includes(state.category) ||
        typeof state.visitedOnly !== 'boolean' || typeof state.filtersOpen !== 'boolean' ||
        !spotIds.includes(state.originSpotId) || (state.mapSpotId !== '' && !spotIds.includes(state.mapSpotId)) ||
        (state.pinnedSpotId !== null && !spotIds.includes(state.pinnedSpotId))) return null;
    return state;
  } catch { return null; }
}

export function guideReturnView(store: Store | null = browserStore()): GuideReturnView {
  try {
    const value = JSON.parse(store?.getItem(key) ?? 'null') as Partial<GuideReturnState> | null;
    return value?.view === 'vocal_range' ? 'vocal_range' : 'discography';
  } catch { return 'discography'; }
}

export function songReturnDestination(store: Store | null = browserStore()): { hash: string; label: string } {
  try {
    const savedTab = store?.getItem(originTabKey);
    if (savedTab && Object.hasOwn(ORIGIN_DESTINATIONS, savedTab)) {
      return ORIGIN_DESTINATIONS[savedTab];
    }
  } catch { /* fall through to guideReturnView */ }
  return ORIGIN_DESTINATIONS[guideReturnView(store)];
}

export function takeGuideReturnState(songCount: number, store: Store | null = browserStore()): GuideReturnState | null {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    store.removeItem(key);
    store.removeItem(originTabKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const { filters, visibleCount, view, originSongId, voice, showTieUps } = value as Partial<GuideReturnState>;
    if (!filters || typeof filters !== 'object' ||
        (view !== 'discography' && view !== 'vocal_range') ||
        !eras.has(filters.era) || !sounds.has(filters.sound) || !sorts.has(filters.sortBy) ||
        (filters.album !== 'all' && !Object.hasOwn(ALBUM_CHRONOLOGY_RANK, filters.album)) ||
        typeof filters.searchQuery !== 'string' || filters.searchQuery.length > 60 ||
        !Number.isInteger(visibleCount) || visibleCount! < 1 || visibleCount! > songCount) return null;
    if (originSongId !== undefined && (typeof originSongId !== 'string' || !/^[a-z0-9-]+$/.test(originSongId) || originSongId.length > 60)) return null;
    if (filters.tableSort !== undefined && (!filters.tableSort ||
        !SONG_TABLE_SORT_KEYS.includes(filters.tableSort.key) ||
        !['ascending', 'descending'].includes(filters.tableSort.direction))) return null;
    const comparison = showTieUps === true ? { showTieUps: true } : {};
    const origin = originSongId !== undefined ? { originSongId } : {};
    if (voice !== undefined) {
      const pitchValid = (pitch: unknown) => typeof pitch === 'string' && (pitch === '' || (/^\d+$/.test(pitch) && Number(pitch) >= 36 && Number(pitch) <= 84));
      if (!voice || !pitchValid(voice.low) || !pitchValid(voice.high) || !Number.isInteger(voice.keyShift) || voice.keyShift < -12 || voice.keyShift > 12) return null;
      return { filters, visibleCount: visibleCount!, view, voice, ...comparison, ...origin };
    }
    return { filters, visibleCount: visibleCount!, view, ...comparison, ...origin };
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
    if (!raw || raw.length > 10_000) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    const stateEpoch = typeof record.resetEpoch === 'string' ? record.resetEpoch : '';
    if (stateEpoch !== expectedEpoch) return null;
    if (
      typeof record.publisher !== 'string' ||
      record.publisher.length < 1 ||
      record.publisher.length > 80 ||
      /[\u0000-\u001F\u007F]/.test(record.publisher) ||
      (allowedPublishers && record.publisher !== 'all' && !allowedPublishers.includes(record.publisher)) ||
      typeof record.query !== 'string' ||
      record.query.length > 60 ||
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
    if (!raw || raw.length > 10_000) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    const stateEpoch = typeof record.resetEpoch === 'string' ? record.resetEpoch : '';
    if (stateEpoch !== expectedEpoch) return null;
    const validOptionalId = (val: unknown) =>
      val === undefined || (typeof val === 'string' && val.length > 0 && val.length <= 80 && !/[\u0000-\u001F\u007F]/.test(val));
    const validOptionalYear =
      record.year === undefined || (typeof record.year === 'string' && (record.year === 'all' || /^\d{4}$/.test(record.year)));
    const validOptionalBool = (val: unknown) => val === undefined || typeof val === 'boolean';
    if (
      typeof record.query !== 'string' ||
      record.query.length > 60 ||
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
