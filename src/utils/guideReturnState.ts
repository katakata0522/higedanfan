import type { SongGuideFilterValues } from '../components/SongGuideFilters';
import { ALBUM_CHRONOLOGY_RANK } from './songCatalog';

const key = 'higedanfan:guide-return:v1';
const eras = new Set(['all', 'indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026']);
const sounds = new Set(['all', 'piano_pop', 'brass_funk', 'emotional_ballad', 'stadium_rock']);
const sorts = new Set(['guide_order', 'album_track_order', 'popular', 'newest', 'release_oldest', 'highest_note', 'vocal_span', 'bpm']);

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type GuideReturnView = 'discography' | 'vocal_range';
export type GuideReturnState = {
  filters: SongGuideFilterValues;
  visibleCount: number;
  view: GuideReturnView;
  voice?: { low: string; high: string; keyShift: number };
};

function browserStore(): Store | null {
  try { return window.sessionStorage; } catch { return null; }
}

export function saveGuideReturnState(state: GuideReturnState, store: Store | null = browserStore()): void {
  try { store?.setItem(key, JSON.stringify(state)); } catch { /* 保存できない環境では通常の一覧へ戻す。 */ }
}

export function guideReturnView(store: Store | null = browserStore()): GuideReturnView {
  try {
    const value = JSON.parse(store?.getItem(key) ?? 'null') as Partial<GuideReturnState> | null;
    return value?.view === 'vocal_range' ? 'vocal_range' : 'discography';
  } catch { return 'discography'; }
}

export function takeGuideReturnState(songCount: number, store: Store | null = browserStore()): GuideReturnState | null {
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    store.removeItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const { filters, visibleCount, view, voice } = value as Partial<GuideReturnState>;
    if (!filters || typeof filters !== 'object' ||
        (view !== 'discography' && view !== 'vocal_range') ||
        !eras.has(filters.era) || !sounds.has(filters.sound) || !sorts.has(filters.sortBy) ||
        (filters.album !== 'all' && !Object.hasOwn(ALBUM_CHRONOLOGY_RANK, filters.album)) ||
        typeof filters.searchQuery !== 'string' || filters.searchQuery.length > 60 ||
        !Number.isInteger(visibleCount) || visibleCount! < 1 || visibleCount! > songCount) return null;
    if (voice !== undefined) {
      const pitchValid = (pitch: unknown) => typeof pitch === 'string' && (pitch === '' || (/^\d+$/.test(pitch) && Number(pitch) >= 36 && Number(pitch) <= 84));
      if (!voice || !pitchValid(voice.low) || !pitchValid(voice.high) || !Number.isInteger(voice.keyShift) || voice.keyShift < -12 || voice.keyShift > 12) return null;
      return { filters, visibleCount: visibleCount!, view, voice };
    }
    return { filters, visibleCount: visibleCount!, view };
  } catch { return null; }
}
