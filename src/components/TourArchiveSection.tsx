import { Fragment, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, ListMusic, MessageSquareText, RotateCcw, Search, Ticket, X } from 'lucide-react';
import { TOUR_ARCHIVES } from '../data/tourArchivesData';
import type { TourArchive, TourEventRecord, TourSetlistTrack } from '../data/higedanTypes';
import { extractCatalogSetlistEntries, getTourEventSetlist } from '../data/tourSetlists';
import { songPagePath } from '../songPages/publishedSongPageIds';
import { sortTourArchives } from '../utils/discography';
import { formatIsoDateDot as displayDate } from '../utils/format';
import { sanitizeSetlistTitle, SETLIST_TITLE_LIMIT, type SetlistEntry } from '../utils/setlist';
import {
  clearTourReturnState,
  readTourReturnState,
  saveTourReturnState,
  type TourCategoryFilter,
  type TourSetlistTab,
} from '../utils/guideReturnState';
import { createTourArchiveSearch } from '../utils/tourArchiveSearch';
import { ConfirmDialog } from './ConfirmDialog';

interface TourArchiveSectionProps {
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
  validSongIds?: ReadonlySet<string>;
  hasSetlistItems?: boolean;
  currentSetlistTitle?: string;
  onCreateSetlistFromTour?: (entries: SetlistEntry[], title: string) => void;
  resetEpoch?: string;
}

const CATEGORY_OPTIONS: { id: TourCategoryFilter; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'tour', label: '全国・アジアツアー' },
  { id: 'one_man', label: '単独・スペシャル' },
  { id: 'online_fc', label: 'FC・配信ライブ' },
  { id: 'free_special', label: 'フリー・特別公演' },
  { id: 'two_man', label: '対バン・ツーマン' },
];

const concertCount = TOUR_ARCHIVES.reduce((count, tour) => count + tour.events.length, 0);
const setlistEventCount = TOUR_ARCHIVES.reduce(
  (count, tour) => count + tour.events.filter(event => event.hasSetlist).length,
  0,
);

function tourMatchesYear(tour: TourArchive, year: string): boolean {
  if (year === 'all') return true;
  const startYear = Number(tour.startDate.slice(0, 4));
  const endYear = Number(tour.endDate.slice(0, 4));
  const target = Number(year);
  if (Number.isInteger(startYear) && Number.isInteger(endYear) && Number.isInteger(target)) {
    if (target >= startYear && target <= endYear) return true;
  }
  return tour.events.some(event => event.date.startsWith(`${year}-`));
}

const YEAR_OPTIONS: { year: string; count: number }[] = (() => {
  const yearSet = new Set<string>();
  for (const tour of TOUR_ARCHIVES) {
    const startYear = Number(tour.startDate.slice(0, 4));
    const endYear = Number(tour.endDate.slice(0, 4));
    if (Number.isInteger(startYear) && Number.isInteger(endYear)) {
      for (let y = startYear; y <= endYear; y += 1) yearSet.add(String(y));
    }
    for (const event of tour.events) yearSet.add(event.date.slice(0, 4));
  }
  return [...yearSet]
    .filter(y => /^\d{4}$/.test(y))
    .sort((a, b) => Number(b) - Number(a))
    .map(year => ({
      year,
      count: TOUR_ARCHIVES.filter(tour => tourMatchesYear(tour, year)).length,
    }));
})();

interface DualSetlistPanelsProps {
  eventId: string;
  activeTab: TourSetlistTab;
  onSelectTab: (tab: TourSetlistTab) => void;
  higedanContent: ReactNode;
  fullContent: ReactNode;
}

/** Accessible 2-tab switcher between Higedan's setlist and the full co-headliner setlist. */
function DualSetlistPanels({
  eventId,
  activeTab,
  onSelectTab,
  higedanContent,
  fullContent,
}: DualSetlistPanelsProps) {
  const higedanPanelRef = useRef<HTMLDivElement>(null);
  const fullPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    higedanPanelRef.current?.addEventListener('beforematch', () => onSelectTab('higedan'), {
      signal: controller.signal,
    });
    fullPanelRef.current?.addEventListener('beforematch', () => onSelectTab('full'), {
      signal: controller.signal,
    });
    return () => controller.abort();
  }, [onSelectTab]);

  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let nextTab: TourSetlistTab | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      nextTab = activeTab === 'higedan' ? 'full' : 'higedan';
    } else if (e.key === 'Home') {
      nextTab = 'higedan';
    } else if (e.key === 'End') {
      nextTab = 'full';
    }
    if (!nextTab) return;
    e.preventDefault();
    onSelectTab(nextTab);
    document
      .getElementById(`setlist-tab-${nextTab}-${eventId}`)
      ?.focus({ preventScroll: true });
  };

  const tabClassName =
    "relative shrink-0 whitespace-nowrap pb-2 pt-1.5 px-1 text-xs font-bold cursor-pointer transition-colors text-[#57534E] hover:text-[#253331] aria-[selected=true]:text-[#253331] aria-[selected=true]:after:content-[''] aria-[selected=true]:after:absolute aria-[selected=true]:after:inset-x-0 aria-[selected=true]:after:bottom-0 aria-[selected=true]:after:border-b-[3px] aria-[selected=true]:after:border-[#C83E2B]";

  return (
    <>
      <div
        role="tablist"
        aria-label="セットリスト表示切替"
        onKeyDown={handleTabKeyDown}
        className="mt-2.5 flex flex-nowrap items-center gap-4 overflow-x-auto border-b border-[#e5dccb]"
      >
        <button
          type="button"
          role="tab"
          id={`setlist-tab-higedan-${eventId}`}
          aria-selected={activeTab === 'higedan'}
          tabIndex={activeTab === 'higedan' ? 0 : -1}
          onClick={() => onSelectTab('higedan')}
          className={tabClassName}
        >
          Official髭男dism
        </button>
        <button
          type="button"
          role="tab"
          id={`setlist-tab-full-${eventId}`}
          aria-selected={activeTab === 'full'}
          tabIndex={activeTab === 'full' ? 0 : -1}
          onClick={() => onSelectTab('full')}
          className={tabClassName}
        >
          対バン完全版
        </button>
      </div>
      <div
        ref={higedanPanelRef}
        role="tabpanel"
        aria-labelledby={`setlist-tab-higedan-${eventId}`}
        {...(activeTab !== 'higedan'
          ? { hidden: 'until-found' as unknown as boolean }
          : {})}
      >
        <div>{higedanContent}</div>
      </div>
      <div
        ref={fullPanelRef}
        role="tabpanel"
        aria-labelledby={`setlist-tab-full-${eventId}`}
        {...(activeTab !== 'full'
          ? { hidden: 'until-found' as unknown as boolean }
          : {})}
      >
        <div className="pt-3">{fullContent}</div>
      </div>
    </>
  );
}

export function TourArchiveSection({
  attendedTourIds,
  onToggleAttendedTour,
  validSongIds,
  hasSetlistItems = false,
  currentSetlistTitle = '',
  onCreateSetlistFromTour,
  resetEpoch = '',
}: TourArchiveSectionProps) {
  const [initialReturn] = useState(() => readTourReturnState(resetEpoch));
  const consumedReturnRef = useRef(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (consumedReturnRef.current) return undefined;
    consumedReturnRef.current = true;
    if (initialReturn) {
      clearTourReturnState();
      if (initialReturn.openEventId) {
        const rafId = window.requestAnimationFrame(() => {
          document.getElementById(`setlist-panel-${initialReturn.openEventId}`)?.scrollIntoView({
            block: 'center',
            behavior: 'instant',
          });
        });
        return () => window.cancelAnimationFrame(rafId);
      }
    }
    return undefined;
  }, [initialReturn]);

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>(() => initialReturn?.sortOrder ?? 'newest');
  const [categoryFilter, setCategoryFilter] = useState<TourCategoryFilter>(() => initialReturn?.category ?? 'all');
  const [yearFilter, setYearFilter] = useState<string>(() => initialReturn?.year ?? 'all');
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [attendedOnly, setAttendedOnly] = useState(() => initialReturn?.attendedOnly ?? false);
  const [setlistOnly, setSetlistOnly] = useState(() => initialReturn?.setlistOnly ?? false);
  const [query, setQuery] = useState(() => initialReturn?.query ?? '');
  const [openTourIds, setOpenTourIds] = useState<ReadonlySet<string>>(() =>
    initialReturn?.openTourId ? new Set([initialReturn.openTourId]) : new Set(),
  );
  const [closedDuringSearchIds, setClosedDuringSearchIds] = useState<ReadonlySet<string>>(() => new Set());
  const [expandedEventIds, setExpandedEventIds] = useState<ReadonlySet<string>>(() =>
    initialReturn?.openEventId ? new Set([initialReturn.openEventId]) : new Set(),
  );
  const [setlistTabByEventId, setSetlistTabByEventId] = useState<ReadonlyMap<string, TourSetlistTab>>(() =>
    initialReturn?.openEventId && initialReturn?.openSetlistTab === 'full'
      ? new Map([[initialReturn.openEventId, 'full']])
      : new Map(),
  );
  const [pendingTourSetlist, setPendingTourSetlist] = useState<{
    entries: SetlistEntry[];
    title: string;
    skippedCount: number;
  } | null>(null);

  const tours = useMemo(() => {
    const filtered = TOUR_ARCHIVES.filter(tour => {
      if (categoryFilter !== 'all' && (tour.category ?? 'tour') !== categoryFilter) return false;
      if (!tourMatchesYear(tour, yearFilter)) return false;
      if (attendedOnly && !attendedTourIds.includes(tour.id)) return false;
      if (setlistOnly && !tour.events.some(event => event.hasSetlist)) return false;
      return true;
    });
    return sortTourArchives(filtered, sortOrder);
  }, [categoryFilter, yearFilter, attendedOnly, setlistOnly, attendedTourIds, sortOrder]);

  const searchTours = useMemo(() => createTourArchiveSearch(tours), [tours]);
  const matchingTours = useMemo(() => {
    const base = searchTours(query);
    if (!setlistOnly) return base;
    return base
      .map(item => ({
        ...item,
        events: item.events.filter(event => event.hasSetlist),
      }))
      .filter(item => item.events.length > 0);
  }, [searchTours, query, setlistOnly]);
  const hasActiveFilter = categoryFilter !== 'all' || yearFilter !== 'all' || attendedOnly || setlistOnly || query.trim() !== '';

  const toggleTourDetails = (tourId: string, nextOpen: boolean) => {
    if (query.trim()) {
      setClosedDuringSearchIds(prev => {
        const next = new Set(prev);
        if (nextOpen) next.delete(tourId);
        else next.add(tourId);
        return next;
      });
      return;
    }
    setOpenTourIds(prev => {
      const next = new Set(prev);
      if (nextOpen) next.add(tourId);
      else next.delete(tourId);
      return next;
    });
  };

  const toggleEventSetlist = (tourId: string, eventId: string) => {
    setExpandedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
    setOpenTourIds(prev => {
      if (prev.has(tourId)) return prev;
      const next = new Set(prev);
      next.add(tourId);
      return next;
    });
  };

  const rememberAndOpenSong = (tourId: string, eventId: string) => {
    const activeTab = setlistTabByEventId.get(eventId) ?? 'higedan';
    saveTourReturnState({
      query,
      sortOrder,
      category: categoryFilter,
      year: yearFilter,
      attendedOnly,
      setlistOnly,
      openTourId: tourId,
      openEventId: eventId,
      openSetlistTab: activeTab,
      resetEpoch,
    });
  };

  const setEventSetlistTab = (eventId: string, tab: TourSetlistTab) => {
    setSetlistTabByEventId(prev => {
      if ((prev.get(eventId) ?? 'higedan') === tab) return prev;
      const next = new Map(prev);
      if (tab === 'higedan') next.delete(eventId);
      else next.set(eventId, tab);
      return next;
    });
  };

  const renderTrackRow = (
    track: TourSetlistTrack,
    prefix: string,
    tourId: string,
    eventId: string,
    keyScope: string,
    keyIndex: number,
    isMatchedTrack = false,
  ) => {
    const pagePath = track.songId ? songPagePath(track.songId) : null;
    const metaParts: string[] = [];
    if (track.artist) metaParts.push(`${track.artist} カバー`);
    if (track.note) metaParts.push(track.note);

    return (
      <li
        key={`${keyScope}-${prefix}-${keyIndex}`}
        className={`flex items-baseline gap-2.5 text-sm leading-snug ${
          isMatchedTrack ? 'rounded-md bg-[#FFF3D6] px-2 py-1 -mx-2' : ''
        }`}
      >
        <span className="w-8 shrink-0 font-mono-num text-[11px] font-bold text-[#68625C]">
          {prefix}
        </span>
        <div className="min-w-0 flex-1">
          {pagePath ? (
            <a
              href={`${import.meta.env.BASE_URL}${pagePath}`}
              onClick={() => rememberAndOpenSong(tourId, eventId)}
              className="font-bold text-[#253331] underline decoration-[#b5a48b] underline-offset-4 hover:text-[#C83E2B] hover:decoration-[#C83E2B] transition-colors"
            >
              {track.title}
            </a>
          ) : (
            <span className="font-medium text-[#253331]">{track.title}</span>
          )}
          {metaParts.length > 0 && (
            <span className="ml-1.5 text-[11px] text-[#57534E]">
              （{metaParts.join('・')}）
            </span>
          )}
        </div>
      </li>
    );
  };

  const renderTrackCollection = (
    tracks: readonly TourSetlistTrack[],
    keyScope: string,
    tourId: string,
    eventId: string,
    matchedTitleSet?: ReadonlySet<string>,
  ) => {
    const main = tracks.filter(t => !t.isEncore);
    const encore = tracks.filter(t => t.isEncore);

    return (
      <>
        <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {main.map((track, idx) =>
            renderTrackRow(
              track,
              String(idx + 1).padStart(2, '0'),
              tourId,
              eventId,
              keyScope,
              idx,
              matchedTitleSet ? matchedTitleSet.has(track.title) : false,
            ),
          )}
        </ol>

        {encore.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-dashed border-[#d8ccb8]">
            <p className="text-[11px] font-bold tracking-[.08em] text-[#C83E2B] mb-2">
              ENCORE
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {encore.map((track, idx) =>
                renderTrackRow(
                  track,
                  `EN${idx + 1}`,
                  tourId,
                  eventId,
                  keyScope,
                  idx,
                  matchedTitleSet ? matchedTitleSet.has(track.title) : false,
                ),
              )}
            </ol>
          </div>
        )}
      </>
    );
  };

  const renderSetlistDrawer = (
    tour: TourArchive,
    event: TourEventRecord,
    matchedSongs: readonly string[] = [],
  ) => {
    const data = getTourEventSetlist(event.id);
    if (!data) return null;

    const mainTracks = data.tracks.filter(t => !t.isEncore);
    const encoreTracks = data.tracks.filter(t => t.isEncore);
    const matchedTitleSet = new Set(matchedSongs);
    const coArtistSets = data.coArtistSets ?? [];
    const hasCoArtistSets = coArtistSets.length > 0;
    const activeTab: TourSetlistTab = hasCoArtistSets
      ? (setlistTabByEventId.get(event.id) ?? 'higedan')
      : 'higedan';

    const orderedActs = hasCoArtistSets
      ? [
          {
            id: 'higedan',
            artist: 'Official髭男dism',
            orderLabel: data.higedanOrderLabel,
            tracks: data.tracks,
            isHigedan: true,
          },
          ...coArtistSets.map((co, idx) => ({
            id: `partner-${idx}`,
            artist: co.artist,
            orderLabel: co.orderLabel,
            tracks: co.tracks,
            note: co.note,
            isHigedan: false,
          })),
        ].sort((a, b) => {
          const rank = (label?: string) => (label === '先攻' ? 0 : label === '後攻' ? 2 : 1);
          return rank(a.orderLabel) - rank(b.orderLabel);
        })
      : [];
    const totalFullTracks = orderedActs.reduce((sum, act) => sum + act.tracks.length, 0);

    const catalogLoad = onCreateSetlistFromTour
      ? extractCatalogSetlistEntries(event.id, validSongIds)
      : null;
    const tourSetlistTitle = sanitizeSetlistTitle(`${tour.tourTitle} (${displayDate(event.date)})`).slice(
      0,
      SETLIST_TITLE_LIMIT,
    );

    const requestCreateSetlist = () => {
      if (!onCreateSetlistFromTour || !catalogLoad || catalogLoad.entries.length === 0) return;
      if (hasSetlistItems) {
        setPendingTourSetlist({
          entries: catalogLoad.entries,
          title: tourSetlistTitle,
          skippedCount: catalogLoad.skippedCount,
        });
        return;
      }
      onCreateSetlistFromTour(catalogLoad.entries, tourSetlistTitle);
    };

    const higedanBody = renderTrackCollection(
      data.tracks,
      `${event.id}-single`,
      tour.id,
      event.id,
      matchedTitleSet,
    );

    const fullBody = hasCoArtistSets
      ? orderedActs.map((act, actIdx) => (
          <section
            key={act.id}
            aria-label={`${act.artist}のセットリスト`}
            className={actIdx > 0 ? 'mt-4 pt-3.5 border-t border-[#e5dccb]' : ''}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xs font-bold text-[#253331]">
                {act.orderLabel ? `${act.orderLabel}：` : ''}
                {act.artist}
              </h3>
              <span className="font-mono-num text-[11px] font-medium text-[#57534E]">
                {act.tracks.length}曲
              </span>
            </div>
            {renderTrackCollection(
              act.tracks,
              `${event.id}-full-${act.id}`,
              tour.id,
              event.id,
              act.isHigedan ? matchedTitleSet : undefined,
            )}
            {'note' in act && act.note && (
              <p className="mt-2 text-[11px] leading-relaxed text-[#57534E]">
                ※ {act.note}
              </p>
            )}
          </section>
        ))
      : null;

    return (
      <div
        id={`setlist-panel-${event.id}`}
        role="region"
        aria-label={`${displayDate(event.date)} ${event.venue} のセットリスト`}
        className="mt-2.5 rounded-xl border border-[#dfd7c7] bg-[#faf6eb]/85 p-3.5 sm:p-4"
      >
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#e5dccb]">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#253331]">
              {displayDate(event.date)} · {event.venue}
              {event.label ? `（${event.label}）` : ''}
            </p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] text-[#57534E]">
              <span>
                {activeTab === 'full' && hasCoArtistSets
                  ? `計${totalFullTracks}曲（${orderedActs.map(act => `${act.artist} ${act.tracks.length}曲`).join(' ＋ ')}）`
                  : `全${data.tracks.length}曲${
                      encoreTracks.length > 0
                        ? `（本編${mainTracks.length}曲 / アンコール${encoreTracks.length}曲）`
                        : `（本編${mainTracks.length}曲）`
                    }`}
              </span>
              <span className="whitespace-nowrap text-[#68625C]">曲名から楽曲解説へ</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleEventSetlist(tour.id, event.id);
              document
                .querySelector<HTMLElement>(`[aria-controls="setlist-panel-${event.id}"]`)
                ?.focus({ preventScroll: true });
            }}
            aria-label="セットリストを閉じる"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dfd7c7] bg-[#fffdf8] text-[#57534E] hover:border-[#253331] hover:text-[#253331] transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {hasCoArtistSets ? (
          <DualSetlistPanels
            eventId={event.id}
            activeTab={activeTab}
            onSelectTab={tab => setEventSetlistTab(event.id, tab)}
            higedanContent={higedanBody}
            fullContent={fullBody}
          />
        ) : (
          higedanBody
        )}

        {onCreateSetlistFromTour && catalogLoad && catalogLoad.entries.length > 0 && (
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#ece4d6]">
            <p className="text-[11px] text-[#57534E]">
              {activeTab === 'full' && hasCoArtistSets
                ? `Official髭男dismの公演曲から ${catalogLoad.entries.length}曲をMYセトリに読み込めます（対バン相手・カバー曲等は除きます）`
                : catalogLoad.skippedCount > 0
                  ? `楽曲ガイドにある ${catalogLoad.entries.length}曲を読み込みます（SE・カバー等 ${catalogLoad.skippedCount}曲は除きます）`
                  : `この公演の ${catalogLoad.entries.length}曲をMYセトリに読み込めます`}
            </p>
            <button
              type="button"
              onClick={requestCreateSetlist}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#253331] bg-[#253331] px-3.5 py-1.5 text-xs font-bold text-[#faf6eb] hover:bg-[#C83E2B] hover:border-[#C83E2B] transition-colors cursor-pointer"
            >
              <ListMusic className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>この公演の曲でMYセトリを作成</span>
            </button>
          </div>
        )}

        {(data.note || (data.sources && data.sources.length > 0)) && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#fffdf8]/90 px-3 py-2.5 text-xs leading-relaxed text-[#44403C]">
            <MessageSquareText
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9B3021]"
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1">
              {data.note}
              {data.sources && data.sources.length > 0 && (
                <span className={data.note ? 'ml-1 text-[#57534E]' : 'text-[#57534E]'}>
                  （
                  {data.sources.map((src, idx) => (
                    <Fragment key={src.url}>
                      {idx > 0 && '・'}
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E3A5F] underline decoration-[#1E3A5F]/45 underline-offset-2 hover:text-[#C83E2B] hover:decoration-[#C83E2B]"
                      >
                        {src.label} ↗
                      </a>
                    </Fragment>
                  ))}
                  ）
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderEventAction = (tour: TourArchive, event: TourEventRecord) => {
    if (!event.hasSetlist) {
      return (
        <span className="inline-flex min-h-[28px] items-center py-1 text-xs text-[#68625C]">
          セトリ未確認
        </span>
      );
    }
    const isExpanded = expandedEventIds.has(event.id);
    return (
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={`setlist-panel-${event.id}`}
        aria-label={
          isExpanded
            ? `${event.date} ${event.venue}のセトリを閉じる`
            : `${event.date} ${event.venue}のセットリストを見る（${event.trackCount}曲）`
        }
        onClick={() => toggleEventSetlist(tour.id, event.id)}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          isExpanded
            ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
            : 'border-[#dfd7c7] bg-[#fffdf8] text-[#253331] hover:border-[#C83E2B] hover:text-[#C83E2B]'
        }`}
      >
        <ListMusic className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{isExpanded ? 'セトリを閉じる' : `セットリストを見る（${event.trackCount}曲）`}</span>
        {isExpanded
          ? <ChevronUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          : <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
      </button>
    );
  };

  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-2.5 rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-3.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-xs font-bold text-[#253331]">
            <label htmlFor="tour-archive-search" className="shrink-0">
              日付・会場を探す
              <span className="ml-1 font-normal text-[#68625C]">（曲名も可）</span>
            </label>
            <div className="relative min-w-0 w-full sm:flex-1">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#68625C]" />
              <input
                ref={searchInputRef}
                id="tour-archive-search"
                type="search"
                maxLength={60}
                enterKeyHint="search"
                value={query}
                onChange={event => {
                  setQuery(event.target.value);
                  setClosedDuringSearchIds(new Set());
                }}
                placeholder="例：2025-05-31 / 日産スタジアム / Pretender"
                className="min-w-0 w-full rounded-lg border border-[#D5CEC2] bg-white pl-8 pr-9 py-2 text-base sm:text-xs font-normal text-[#1C1917] placeholder:text-[#68625C] [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setClosedDuringSearchIds(new Set());
                    searchInputRef.current?.focus();
                  }}
                  aria-label="検索キーワードをクリア"
                  className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-1 self-start sm:self-auto rounded-lg bg-[#F2EFE9] p-1" role="group" aria-label="開催順">
            <button
              type="button"
              aria-pressed={sortOrder === 'newest'}
              onClick={() => setSortOrder('newest')}
              className={`rounded-md px-3 py-2 text-xs font-bold cursor-pointer ${
                sortOrder === 'newest' ? 'bg-[#253331] text-white' : 'text-[#57534E]'
              }`}
            >
              新しい順
            </button>
            <button
              type="button"
              aria-pressed={sortOrder === 'oldest'}
              onClick={() => setSortOrder('oldest')}
              className={`rounded-md px-3 py-2 text-xs font-bold cursor-pointer ${
                sortOrder === 'oldest' ? 'bg-[#253331] text-white' : 'text-[#57534E]'
              }`}
            >
              古い順
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#ece4d6]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="公演の種類や条件で絞り込み">
              {CATEGORY_OPTIONS.map(option => {
                const active = categoryFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCategoryFilter(option.id !== 'all' && active ? 'all' : option.id)}
                    className={`min-h-8 rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#253331] text-[#faf6eb]'
                        : 'border border-[#dfd7c7] bg-white text-[#57534E] hover:border-[#253331] hover:text-[#253331]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={setlistOnly}
                onClick={() => setSetlistOnly(prev => !prev)}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  setlistOnly
                    ? 'bg-[#C83E2B] text-white'
                    : 'border border-[#dfd7c7] bg-white text-[#57534E] hover:border-[#C83E2B] hover:text-[#C83E2B]'
                }`}
              >
                <ListMusic className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>セトリありのみ</span>
              </button>
              <button
                type="button"
                aria-pressed={attendedOnly}
                onClick={() => setAttendedOnly(prev => !prev)}
                className={`inline-flex min-h-8 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  attendedOnly
                    ? 'bg-[#15803D] text-white'
                    : 'border border-[#dfd7c7] bg-white text-[#57534E] hover:border-[#15803D] hover:text-[#15803D]'
                }`}
              >
                <Ticket className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>参戦・視聴済みのみ（{attendedTourIds.length}）</span>
              </button>
            </div>

            <button
              id="tour-year-filter"
              type="button"
              aria-expanded={yearPickerOpen}
              aria-controls="tour-year-panel"
              onClick={() => setYearPickerOpen(prev => !prev)}
              className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold font-mono-num shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331] ${
                yearFilter !== 'all'
                  ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                  : 'border-[#dfd7c7] bg-[#faf6eb] text-[#253331] hover:border-[#253331]'
              }`}
            >
              <span>開催年：{yearFilter === 'all' ? 'すべて' : `${yearFilter}年`}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${yearPickerOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          </div>

          <div
            id="tour-year-panel"
            role="group"
            aria-label="開催年で絞り込み"
            className={`${yearPickerOpen ? 'flex' : 'hidden'} flex-wrap gap-1.5 pt-2 border-t border-[#ece4d6]`}
          >
            <button
              type="button"
              aria-pressed={yearFilter === 'all'}
              onClick={() => setYearFilter('all')}
              className={`min-h-8 rounded-full px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                yearFilter === 'all'
                  ? 'bg-[#253331] text-[#faf6eb]'
                  : 'border border-[#dfd7c7] bg-white text-[#57534E] hover:border-[#253331] hover:text-[#253331]'
              }`}
            >
              すべての年
            </button>
            {YEAR_OPTIONS.map(({ year, count }) => {
              const active = yearFilter === year;
              return (
                <button
                  key={year}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setYearFilter(active ? 'all' : year)}
                  className={`min-h-8 rounded-full px-3 py-1 text-xs font-bold font-mono-num transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#253331] text-[#faf6eb]'
                      : 'border border-[#dfd7c7] bg-white text-[#57534E] hover:border-[#253331] hover:text-[#253331]'
                  }`}
                >
                  {year}年（{count}）
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-xs font-mono-num text-[#57534E]" role="status">
              {!hasActiveFilter
                ? `全${TOUR_ARCHIVES.length}シリーズ・${concertCount}公演（セトリ${setlistEventCount}公演）`
                : `${matchingTours.length}シリーズ・${matchingTours.reduce((sum, item) => sum + item.events.length, 0)}公演を表示`}
            </p>
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                aria-label={`${CATEGORY_OPTIONS.find(option => option.id === categoryFilter)?.label ?? categoryFilter}の絞り込みを解除`}
                className="inline-flex min-h-7 items-center gap-1 rounded-full border border-[#C83E2B]/35 bg-[#fdf4f2] px-2.5 py-0.5 text-[11px] font-bold text-[#9B3021] hover:border-[#C83E2B] hover:bg-[#fae8e4] cursor-pointer transition-colors"
              >
                <span>{CATEGORY_OPTIONS.find(option => option.id === categoryFilter)?.label}</span>
                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            )}
            {yearFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setYearFilter('all')}
                aria-label={`${yearFilter}年の絞り込みを解除`}
                className="inline-flex min-h-7 items-center gap-1 rounded-full border border-[#C83E2B]/35 bg-[#fdf4f2] px-2.5 py-0.5 text-[11px] font-bold font-mono-num text-[#9B3021] hover:border-[#C83E2B] hover:bg-[#fae8e4] cursor-pointer transition-colors"
              >
                <span>{yearFilter}年</span>
                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            )}
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setYearFilter('all');
                setAttendedOnly(false);
                setSetlistOnly(false);
                setQuery('');
                setClosedDuringSearchIds(new Set());
              }}
              className="inline-flex min-h-7 items-center gap-1 text-xs font-bold text-[#9B3021] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>条件をリセット</span>
            </button>
          )}
        </div>
      </div>

      {matchingTours.length === 0 && (
        <div className="rounded-xl border border-[#e5dccb] bg-[#fffdf8] p-5 text-sm text-[#57534E] flex flex-wrap items-center justify-between gap-3">
          <p>
            {attendedOnly && attendedTourIds.length === 0
              ? '「参戦・視聴を記録する」で記録したシリーズがまだありません。'
              : '該当する公演はありません。'}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                setYearFilter('all');
                setAttendedOnly(false);
                setSetlistOnly(false);
                setQuery('');
                setClosedDuringSearchIds(new Set());
              }}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#D5CEC2] bg-white px-3.5 py-1.5 text-xs font-bold text-[#9B3021] hover:border-[#9B3021] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>条件をリセット</span>
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {matchingTours.map(({ tour, events, matchedSongsByEventId }) => {
          const attended = attendedTourIds.includes(tour.id);
          const totalSetlistCount = tour.events.filter(event => event.hasSetlist).length;
          const isSingleEventSeries = tour.events.length === 1 && events.length === 1;
          const singleEvent = isSingleEventSeries ? events[0] : null;
          const isDetailsOpen = query.trim()
            ? !closedDuringSearchIds.has(tour.id)
            : openTourIds.has(tour.id);
          const singleMatchedSongs = singleEvent ? matchedSongsByEventId.get(singleEvent.id) ?? [] : [];

          return (
            <article key={tour.id} className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-4 sm:p-5 shadow-2xs">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 sm:flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs font-mono-num font-bold text-[#C83E2B]">
                    <span>
                      {tour.startDate === tour.endDate
                        ? displayDate(tour.startDate)
                        : `${displayDate(tour.startDate)} — ${displayDate(tour.endDate)}`}
                      {' · '}
                      {tour.events.length}公演
                    </span>
                    {tour.events.length > 1 && totalSetlistCount > 0 && (
                      <span className="whitespace-nowrap text-[#57534E] font-normal">
                        （セトリ{totalSetlistCount}件掲載）
                      </span>
                    )}
                  </p>
                  <h2 className="mt-1 font-note-serif text-base font-bold text-[#253331] sm:text-lg">
                    {tour.tourTitle}
                  </h2>
                  {tour.coArtists && tour.coArtists.length > 0 && (
                    <p className="mt-1 text-xs font-medium text-[#57534E]">
                      共演：{tour.coArtists.join(' ／ ')}
                    </p>
                  )}
                  {tour.officialSourceUrl && (
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-[#1E3A5F]">
                      <a
                        className="inline-flex min-h-[28px] items-center whitespace-nowrap py-1 underline underline-offset-2"
                        href={tour.officialSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        公式ツアー案内 ↗
                      </a>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAttendedTour(tour.id)}
                  aria-pressed={attended}
                  aria-label={attended ? `${tour.tourTitle}：参戦・視聴を記録済み` : `${tour.tourTitle}：参戦・視聴を記録する`}
                  className={`inline-flex min-h-10 shrink-0 self-start sm:self-auto items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                    attended
                      ? 'bg-[#15803D] text-white'
                      : 'border border-[#D5CEC2] bg-white text-[#253331] hover:border-[#253331]'
                  }`}
                >
                  <Ticket className="h-4 w-4" aria-hidden="true" />
                  {attended ? '参戦・視聴を記録済み' : '参戦・視聴を記録する'}
                </button>
              </div>

              {singleEvent ? (
                <div className="mt-3.5 border-t border-[#ece4d6] pt-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="min-w-0 text-sm">
                      <time dateTime={singleEvent.date} className="font-mono-num font-bold text-[#253331]">
                        {displayDate(singleEvent.date)}
                      </time>
                      <span className="ml-3 text-[#292524]">{singleEvent.venue}</span>
                      {singleEvent.label && (
                        <span className="ml-1.5 text-xs text-[#57534E]">（{singleEvent.label}）</span>
                      )}
                      {singleMatchedSongs.length > 0 && (
                        <p className="mt-1 text-xs font-medium text-[#9B3021]">
                          この公演で演奏：{singleMatchedSongs.join('・')}
                        </p>
                      )}
                    </div>
                    {renderEventAction(tour, singleEvent)}
                  </div>
                  {expandedEventIds.has(singleEvent.id) &&
                    renderSetlistDrawer(tour, singleEvent, singleMatchedSongs)}
                </div>
              ) : (
                <details
                  className="mt-4 border-t border-[#ece4d6] pt-3"
                  open={isDetailsOpen}
                  onToggle={e => toggleTourDetails(tour.id, e.currentTarget.open)}
                >
                  <summary className="cursor-pointer text-sm font-bold text-[#253331] hover:text-[#C83E2B] transition-colors">
                    公演日・会場とセトリを見る（{events.length}公演）
                  </summary>
                  <ul className="mt-3 divide-y divide-[#ece4d6] text-sm">
                    {events.map(event => {
                      const matchedSongs = matchedSongsByEventId.get(event.id) ?? [];
                      return (
                        <li key={event.id} className="py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="min-w-0">
                              <time dateTime={event.date} className="font-mono-num font-bold text-[#253331]">
                                {displayDate(event.date)}
                              </time>
                              <span className="ml-3 text-[#292524]">{event.venue}</span>
                              {event.label && (
                                <span className="ml-1.5 text-xs text-[#57534E]">（{event.label}）</span>
                              )}
                              {matchedSongs.length > 0 && (
                                <p className="mt-1 text-xs font-medium text-[#9B3021]">
                                  この公演で演奏：{matchedSongs.join('・')}
                                </p>
                              )}
                            </div>
                            {renderEventAction(tour, event)}
                          </div>
                          {expandedEventIds.has(event.id) &&
                            renderSetlistDrawer(tour, event, matchedSongs)}
                        </li>
                      );
                    })}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <details className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-4 text-sm text-[#57534E]">
        <summary className="cursor-pointer font-bold text-[#253331]">この公演記録について</summary>
        <p className="mt-3 leading-relaxed">
          <strong className="text-[#253331]">
            公演記録：{TOUR_ARCHIVES.length}シリーズ・{concertCount}公演（うち{setlistEventCount}公演のセットリスト収録）
          </strong>
          （2026年11月16日確認）。公式サイト・音楽メディア報道・公開セットリスト記録（LiveRepo・ヒゲダンセトリ）を突合確認したうえで、このサイト内でそのまま曲順を閲覧できるよう収録しています。
        </p>
        <p className="mt-2 leading-relaxed">
          セットリストは初期状態で折りたたみ、選択した公演だけを確認できるようにしています。収録曲のうち楽曲ガイドに掲載している90曲は、曲ページへそのまま移動できます。初期のライブやFC限定公演など公開記録で全曲順を確認できない回は「セトリ未確認」と表記しています。「参戦・視聴」はシリーズ単位の個人メモです。
        </p>
      </details>

      <ConfirmDialog
        isOpen={pendingTourSetlist !== null}
        title="この公演の曲でMYセトリを作成しますか？"
        description={
          pendingTourSetlist
            ? `現在のMYセトリ「${currentSetlistTitle || '作成中のセットリスト'}」は「保存したMYセトリ」に残したまま、「${pendingTourSetlist.title}」（${pendingTourSetlist.entries.length}曲）を新しいMYセトリとして作成し、MYセトリ画面へ移動します。${
                pendingTourSetlist.skippedCount > 0
                  ? `\n※ 楽曲ガイドに未登録のSE・カバー曲など ${pendingTourSetlist.skippedCount}曲は除かれます。`
                  : ''
              }`
            : ''
        }
        confirmLabel="MYセトリに読み込む"
        cancelLabel="もどる"
        onConfirm={() => {
          if (pendingTourSetlist && onCreateSetlistFromTour) {
            onCreateSetlistFromTour(pendingTourSetlist.entries, pendingTourSetlist.title);
          }
          setPendingTourSetlist(null);
        }}
        onCancel={() => setPendingTourSetlist(null)}
      />
    </div>
  );
}
