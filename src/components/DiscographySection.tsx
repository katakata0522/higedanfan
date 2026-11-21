import { albumForSearch, matchedSongContexts } from '../utils/songSearch';
import { formatAlbumDisplayName, partialEpCoverage } from '../utils/songCatalog';
import { EP_TRACK_ORDER_MAP, filterAndSortDiscography } from '../utils/discography';
import { formatDuration, formatSongBpm } from '../utils/format';
import { isPlainLeftClick, tabPath } from '../config/siteFeatures';
import { DEFAULT_GUIDE_FILTERS, SongGuideFilters } from './SongGuideFilters';
import { songEvidence } from '../data/fullCatalogSongs';
import { songAppleArtwork } from '../data/songAppleArtwork';
import { sortSongTable } from '../utils/songTableSort';
import { VocalRangeTable } from './discography/VocalRangeTable';
import { songPagePath } from '../songPages/publishedSongPageIds';
import {
  clearGuideListReturnState,
  clearSongReturnTab,
  readGuideReturnState,
  saveGuideReturnState,
} from '../utils/guideReturnState';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Mic2,
  Music2,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { EraTag, SongItem } from '../data/higedanTypes';

export type DiscographySubView = 'discography' | 'vocal_range';

interface DiscographySectionProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onSelectView?: (view: 'discography' | 'vocal_range') => void;
  onAddToSetlist: (songId: string) => void;
  onRemoveFromSetlist?: (songId: string) => void;
  setlistSongIds: string[];
  initialSubView?: DiscographySubView;
  initialEraFilter?: EraTag | 'all';
}

const CARDS_PER_PAGE = 24;

function SongArtworkThumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg border border-[#e5dccb] bg-[#f4efe4] text-[#68625C] shadow-2xs"
      >
        <Music2 className="h-5 w-5" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={52}
      height={52}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-[52px] w-[52px] shrink-0 rounded-lg border border-[#e5dccb] bg-[#f4efe4] object-cover shadow-2xs"
    />
  );
}

export const DiscographySection: React.FC<DiscographySectionProps> = ({
  songs,
  onSelectSong,
  onSelectView,
  onAddToSetlist,
  onRemoveFromSetlist,
  setlistSongIds,
  initialSubView = 'discography',
  initialEraFilter = 'all',
}) => {
  const activeSubView = initialSubView;
  const [returnState] = useState(() => readGuideReturnState(songs.length));
  const consumedReturnRef = useRef(false);
  const restored = initialEraFilter === 'all' ? returnState : null;
  const [showTieUps, setShowTieUps] = useState(restored?.showTieUps === true);
  const [filters, setFilters] = useState(() =>
    restored?.filters
      ? {
          ...restored.filters,
          tableSort: restored.filters.tableSort?.key === 'cd' ? undefined : restored.filters.tableSort,
        }
      : { ...DEFAULT_GUIDE_FILTERS, era: initialEraFilter }
  );
  const { era: eraFilter, album: albumFilter, sound: soundFilter, searchQuery } = filters;
  const [cardPage, setCardPage] = useState<number>(() =>
    restored ? Math.max(1, Math.ceil(restored.visibleCount / CARDS_PER_PAGE)) : 1
  );
  const skipInitialPaginationReset = useRef(Boolean(restored));
  const previousEraPreset = useRef(initialEraFilter);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const originSongRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (consumedReturnRef.current) return;
    consumedReturnRef.current = true;
    clearGuideListReturnState();
    clearSongReturnTab();
  }, []);

  useEffect(() => {
    if (!restored?.originSongId) return;
    const el = originSongRef.current;
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [restored]);

  useEffect(() => {
    if (previousEraPreset.current === initialEraFilter) return;
    previousEraPreset.current = initialEraFilter;
    setFilters(current => ({ ...current, era: initialEraFilter, album: 'all' }));
  }, [initialEraFilter]);

  // 絞り込み・並び替え・表示切り替え時は先頭ページへ戻す（戻り復元の初回のみ維持）。
  useEffect(() => {
    if (skipInitialPaginationReset.current) {
      skipInitialPaginationReset.current = false;
      return;
    }
    setCardPage(1);
  }, [eraFilter, albumFilter, soundFilter, searchQuery, filters.sortBy, activeSubView]);

  const filteredSongs = useMemo(() => {
    const matching = filterAndSortDiscography(songs, filters);
    if (activeSubView !== 'vocal_range') return matching;
    return sortSongTable(matching, filters.tableSort ?? null);
  }, [songs, filters, activeSubView]);
  const resultAlbum = albumFilter !== 'all' ? albumFilter : albumForSearch(searchQuery);
  const epCoverage = resultAlbum ? partialEpCoverage[resultAlbum] : undefined;
  const globalMatchCount = useMemo(() => {
    if (filteredSongs.length || !searchQuery.trim() ||
        (eraFilter === 'all' && albumFilter === 'all' && soundFilter === 'all')) return 0;
    return filterAndSortDiscography(songs, { ...DEFAULT_GUIDE_FILTERS, searchQuery }).length;
  }, [songs, filteredSongs.length, searchQuery, eraFilter, albumFilter, soundFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSongs.length / CARDS_PER_PAGE));
  const safeCardPage = Math.min(cardPage, totalPages);
  const cardRangeStart = (safeCardPage - 1) * CARDS_PER_PAGE;

  const displayedSongs = useMemo(
    () =>
      activeSubView === 'vocal_range'
        ? filteredSongs
        : filteredSongs.slice(cardRangeStart, cardRangeStart + CARDS_PER_PAGE),
    [activeSubView, filteredSongs, cardRangeStart]
  );

  const rememberGuide = (originSongId?: string) => {
    const restoredCount = activeSubView === 'vocal_range'
      ? Math.max(1, Math.min(songs.length, filteredSongs.length))
      : Math.min(Math.max(1, songs.length), Math.max(1, safeCardPage * CARDS_PER_PAGE));
    saveGuideReturnState({
      filters,
      visibleCount: restoredCount,
      showTieUps,
      view: activeSubView === 'vocal_range' ? 'vocal_range' : 'discography',
      ...(originSongId ? { originSongId } : {}),
    });
  };

  const handleChangeCardPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(totalPages, nextPage));
    setCardPage(bounded);
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      resultsTopRef.current?.focus({ preventScroll: true });
      resultsTopRef.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    });
  };

  const emptyResults = (
    <div className="mt-4 notebook-paper rounded-xl p-6 text-center">
      <p className="font-note-serif text-sm font-bold text-[#253331]">条件に一致する楽曲が見つかりませんでした。</p>
      {globalMatchCount > 0 ? (
        <button type="button"
          onClick={() => setFilters({ ...DEFAULT_GUIDE_FILTERS, searchQuery })}
          className="mt-3 min-h-[44px] max-w-full wrap-anywhere rounded-full bg-[#253331] px-5 py-2 text-sm font-bold text-[#faf6eb] cursor-pointer">
          全{songs.length}曲から「{searchQuery.trim()}」を探す（{globalMatchCount}曲）
        </button>
      ) : (
        <button type="button" onClick={() => setFilters(DEFAULT_GUIDE_FILTERS)}
          className="mt-3 min-h-[44px] rounded-full bg-[#253331] px-5 py-2 text-sm font-bold text-[#faf6eb] cursor-pointer">
          絞り込みをリセット
        </button>
      )}
    </div>
  );

  return (
    <section
      id="section-discography"
      aria-labelledby="discography-heading"
      className="py-4 sm:py-5"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ノート世界観：サブページ上部ヘッダー */}
        <div className="pb-3 border-b border-[#e5dccb] flex flex-wrap items-center justify-between gap-2.5">
          <h1
            id="discography-heading"
            className="font-note-serif text-xl sm:text-2xl font-bold tracking-[.04em] text-[#253331]"
          >
            {activeSubView === 'vocal_range'
              ? '掲載90曲の音域・発売日一覧'
              : '楽曲ガイド（掲載90曲）'}
          </h1>

          <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#fffdf8] p-1 max-w-full">
              <a
                href={tabPath('discography', import.meta.env.BASE_URL)}
                aria-current={activeSubView === 'discography' ? 'page' : undefined}
                onClick={(e) => {
                  if (isPlainLeftClick(e) && onSelectView) {
                    e.preventDefault();
                    onSelectView('discography');
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 min-[360px]:px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeSubView === 'discography'
                    ? 'bg-[#253331] text-[#faf6eb]'
                    : 'text-[#57534E] hover:bg-[#f4efe4] hover:text-[#253331]'
                }`}
              >
                <BookOpen className="hidden min-[360px]:block h-3.5 w-3.5" aria-hidden="true" />
                <span>解説カード表示</span>
              </a>
              <a
                href={tabPath('vocal_range', import.meta.env.BASE_URL)}
                aria-current={activeSubView === 'vocal_range' ? 'page' : undefined}
                onClick={(e) => {
                  if (isPlainLeftClick(e) && onSelectView) {
                    e.preventDefault();
                    onSelectView('vocal_range');
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 min-[360px]:px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeSubView === 'vocal_range'
                    ? 'bg-[#253331] text-[#faf6eb]'
                    : 'text-[#57534E] hover:bg-[#f4efe4] hover:text-[#253331]'
                }`}
              >
                <Mic2 className="hidden min-[360px]:block h-3.5 w-3.5" aria-hidden="true" />
                <span>音域・発売日比較表</span>
              </a>
          </div>
        </div>

        <SongGuideFilters
          values={{ ...filters, tableSort: activeSubView === 'vocal_range' ? filters.tableSort : undefined }}
          onChange={setFilters}
          resultCount={filteredSongs.length}
          shownCount={displayedSongs.length}
          onReset={() => setFilters(DEFAULT_GUIDE_FILTERS)}
        />

        {epCoverage && (
          <p className="mt-3 notebook-paper rounded-lg p-3 text-sm text-[#57534E]">
            {epCoverage.note} <a className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={epCoverage.source} target="_blank" rel="noopener noreferrer">公式の収録曲 ↗</a>
          </p>
        )}

        {/* Sub-View 1: Song Guide Cards */}
        {activeSubView === 'discography' && (
          <div ref={resultsTopRef} tabIndex={-1} role="region" aria-label={`楽曲ガイドの検索結果（${safeCardPage} / ${totalPages} ページ）`} className="scroll-mt-20">
            {filteredSongs.length === 0 ? emptyResults : (
              <>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
                  {displayedSongs.map((song) => {
                    const inSetlist = setlistSongIds.includes(song.id);
                    const pagePath = songPagePath(song.id);
                    const fact = songEvidence[song.id as keyof typeof songEvidence];
                    const artwork = songAppleArtwork[song.id];
                    const bpm = formatSongBpm(song.id, song.bpm);
                    const displayFactAlbum = formatAlbumDisplayName(fact.album);
                    const albumBadgeText = resultAlbum && EP_TRACK_ORDER_MAP[resultAlbum]?.[song.id]
                      ? `${resultAlbum} (M${EP_TRACK_ORDER_MAP[resultAlbum][song.id]})`
                      : `${song.album === 'Single / 2024-2026 Collection' && !resultAlbum ? displayFactAlbum : formatAlbumDisplayName(song.album)}${song.trackNumber ? ` (M${song.trackNumber})` : ''}`;

                    return (
                      <article
                        key={song.id}
                        className="min-w-0 flex flex-col justify-between notebook-paper rounded-xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-[#253331]/40"
                      >
                        <div>
                          <a
                            href={pagePath ? `${import.meta.env.BASE_URL}${pagePath}` : `${import.meta.env.BASE_URL}#discography/${song.id}`}
                            aria-label={`${song.title}：曲のページを見る`}
                            onClick={event => {
                              if (!isPlainLeftClick(event)) return;
                              rememberGuide(song.id);
                              if (!pagePath) {
                                event.preventDefault();
                                onSelectSong(song);
                              }
                            }}
                            className="group flex min-h-[52px] items-start gap-3 rounded-lg text-inherit no-underline"
                          >
                            <SongArtworkThumb src={artwork?.artworkUrl} />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-x-2 text-xs text-[#57534E]">
                                <span className="min-w-0 wrap-anywhere">{albumBadgeText}</span>
                                <span>配信日 {song.releaseDate}</span>
                              </div>
                              <h2
                                ref={song.id === restored?.originSongId ? (el) => { originSongRef.current = el; } : undefined}
                                tabIndex={song.id === restored?.originSongId ? -1 : undefined}
                                className="mt-1 scroll-mt-24 font-note-serif text-lg text-[#253331] wrap-anywhere group-hover:underline"
                              >
                                {song.title}<ChevronRight aria-hidden="true" className="ml-1 inline-block h-4 w-4 align-middle text-[#756c60]" />
                              </h2>
                            </div>
                          </a>

                          {searchQuery.trim() && matchedSongContexts(searchQuery, song)
                            .filter(item => item.label !== '収録作品' || item.text !== albumBadgeText)
                            .map(item => <p key={item.label + item.text} className="mt-2.5 text-xs leading-relaxed text-[#1E3A5F] wrap-anywhere">
                              {item.label}：{item.text}{item.source && <> <a className="underline" href={item.source} target="_blank" rel="noopener noreferrer">{item.label}の出典 ↗</a></>}
                            </p>)}

                          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 rounded-lg border border-[#ebe2d2] bg-[#faf6eb] px-3 py-2.5 text-sm tabular-nums">
                            <div><dt className="text-xs text-[#57534E]">地声最低</dt><dd>{song.vocalRange.lowestNote}</dd></div>
                            <div><dt className="text-xs text-[#57534E]">地声最高</dt><dd>{song.vocalRange.highestChestNote}</dd></div>
                            <div><dt className="text-xs text-[#57534E]">裏声最高</dt><dd className={song.vocalRange.highestFalsettoNote === '—' ? 'text-[#68625C]' : ''}>{song.vocalRange.highestFalsettoNote}</dd></div>
                            <div><dt className="text-xs text-[#57534E]">テンポ</dt><dd>{bpm}{bpm !== '調査中' && ' BPM'}</dd></div>
                          </dl>
                        </div>

                        <div className="mt-3 flex justify-end border-t border-[#ece3d2] pt-3">
                          <button
                            type="button"
                            aria-pressed={inSetlist}
                            aria-label={inSetlist ? `${song.title}はセトリに追加済み（もう一度押すと外す）` : `${song.title}をセトリに追加`}
                            title={inSetlist && onRemoveFromSetlist ? 'もう一度押すとセトリから外せます' : undefined}
                            onClick={() => (inSetlist ? onRemoveFromSetlist?.(song.id) : onAddToSetlist(song.id))}
                            disabled={inSetlist && !onRemoveFromSetlist}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                              inSetlist
                                ? `border border-[#2e6f40]/40 bg-[#eef9f0] text-[#2e6f40] ${onRemoveFromSetlist ? 'cursor-pointer hover:border-[#2e6f40] hover:bg-[#dff3e3]' : ''}`
                                : 'border border-[#C83E2B]/45 bg-[#fdf4f2] text-[#A93020] hover:border-[#C83E2B] hover:bg-[#fae8e4] cursor-pointer'
                            }`}
                          >
                            {inSetlist ? (
                              <>
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                追加済み
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                セトリに追加
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Numbered Pagination Controls */}
                {totalPages > 1 && (
                  <nav
                    aria-label="楽曲ガイドのページ切り替え"
                    className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row notebook-paper rounded-xl p-4"
                  >
                    <p className="text-xs font-medium text-[#57534E] font-mono-num">
                      全 {filteredSongs.length} 曲中 {cardRangeStart + 1}〜{Math.min(cardRangeStart + CARDS_PER_PAGE, filteredSongs.length)} 曲目（{safeCardPage} / {totalPages} ページ）
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button
                        type="button"
                        disabled={safeCardPage <= 1}
                        onClick={() => handleChangeCardPage(safeCardPage - 1)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3.5 py-2 text-xs font-bold text-[#253331] transition-colors hover:border-[#253331] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        前へ
                      </button>
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                        <button
                          key={page}
                          type="button"
                          aria-current={page === safeCardPage ? 'page' : undefined}
                          aria-label={`${page}ページ目を表示`}
                          onClick={() => handleChangeCardPage(page)}
                          className={`min-h-[40px] min-w-[40px] rounded-full border px-3 py-2 text-xs font-bold font-mono-num transition-colors cursor-pointer ${
                            page === safeCardPage
                              ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                              : 'border-[#dfd7c7] bg-[#faf6eb] text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={safeCardPage >= totalPages}
                        onClick={() => handleChangeCardPage(safeCardPage + 1)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3.5 py-2 text-xs font-bold text-[#253331] transition-colors hover:border-[#253331] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        次へ
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </nav>
                )}

                <details className="mt-6 notebook-paper rounded-xl p-3.5 text-xs text-[#57534E]">
                  <summary className="cursor-pointer font-bold text-[#253331]">掲載楽曲の範囲について</summary>
                  <p className="mt-2 leading-relaxed">2015年から2026年4月「スターダスト」までに発表された楽曲から90曲を紹介しています。インスト曲と同じ曲の別バージョンは掲載対象を絞っています。</p>
                </details>
              </>
            )}
          </div>
        )}

        {/* 画面幅によらず、曲名と音域を同じ表で比較する（並び替えても列幅が動かないよう固定）。 */}
        {activeSubView === 'vocal_range' && (
          <VocalRangeTable
            filteredSongs={filteredSongs}
            displayedSongs={displayedSongs}
            tableSort={filters.tableSort}
            onToggleSort={(key, direction) =>
              setFilters(current => ({ ...current, tableSort: { key, direction } }))
            }
            showTieUps={showTieUps}
            onToggleShowTieUps={setShowTieUps}
            originSongId={restored?.originSongId}
            onOriginSongRef={(el) => {
              originSongRef.current = el;
            }}
            onRememberGuide={rememberGuide}
            emptyResults={emptyResults}
          />
        )}
      </div>
    </section>
  );
};
