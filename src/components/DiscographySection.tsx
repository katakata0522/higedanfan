import { albumForSearch, matchedSongContexts } from '../utils/songSearch';
import { formatAlbumDisplayName, partialEpCoverage } from '../utils/songCatalog';
import { isPlainLeftClick, tabPath } from '../config/siteFeatures';
import { DEFAULT_GUIDE_FILTERS, SongGuideFilters } from './SongGuideFilters';
import { songEvidence } from '../data/fullCatalogSongs';
import { songAppleArtwork } from '../data/songAppleArtwork';
import { fitsVoiceRange } from '../utils/voiceRange';
import { sortSongTable, SONG_TABLE_SORT_LABELS, type SongTableSortKey } from '../utils/songTableSort';
import { songPagePath } from '../songPages/publishedSongPageIds';
import { saveGuideReturnState, saveSongReturnTab, takeGuideReturnState } from '../utils/guideReturnState';
import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  BookOpen,
  MapPin,
  Mic2,
  Music2,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  EraTag,
  HISTORICAL_SACRED_SPOTS,
  SACRED_SPOTS,
  SacredSpotCategory,
  SongItem,
} from '../data/higedanData';
import {
  EP_TRACK_ORDER_MAP,
  filterAndSortDiscography,
  formatSongBpm,
  formatDuration,
  getSongwriterCredit,
} from '../utils/fanLogic';

export type DiscographySubView = 'discography' | 'vocal_range' | 'sacred_map';

interface DiscographySectionProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onSelectView?: (view: 'discography' | 'vocal_range') => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
  visitedSpotIds: string[];
  onToggleVisitedSpot: (spotId: string) => void;
  initialSubView?: DiscographySubView;
  initialEraFilter?: EraTag | 'all';
}

const SPOT_TAPE_COLORS = ['#f3d2a8', '#f5c6be', '#bce3f8', '#c0e6c7', '#dfcaf6', '#f6e39c'] as const;

const CARDS_PER_PAGE = 24;
const SPOT_CATEGORIES: (SacredSpotCategory | 'all')[] = [
  'all', 'MVロケ地', 'メンバーの思い出', 'メンバーのおすすめ', 'ライブ会場', '街とヒゲダン',
];
const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PITCH_JA = ['ド', 'ド♯', 'レ', 'レ♯', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ソ♯', 'ラ', 'ラ♯', 'シ'];
const VOICE_OPTIONS = Array.from({ length: 49 }, (_, index) => {
  const midi = index + 36;
  const octave = Math.floor(midi / 12) - 1;
  return { value: String(midi), label: `${PITCH_NAMES[midi % 12]}${octave}（${PITCH_JA[midi % 12]}${octave}）` };
});

function SongArtworkThumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg border border-[#e5dccb] bg-[#f4efe4] text-[#78716C] shadow-2xs"
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
  setlistSongIds,
  visitedSpotIds,
  onToggleVisitedSpot,
  initialSubView = 'discography',
  initialEraFilter = 'all',
}) => {
  const activeSubView = initialSubView;
  const titleToSong = useMemo(() => {
    const map = new Map<string, SongItem>();
    for (const song of songs) {
      map.set(song.title, song);
      map.set(song.title.replace(/・・・/g, '…'), song);
    }
    return map;
  }, [songs]);

  const renderSpotRelatedSongs = (raw: string) => {
    const parts = raw.split(' / ');
    return parts.map((part, idx) => {
      const matched = titleToSong.get(part) ?? titleToSong.get(part.replace(/…/g, '・・・'));
      const path = matched ? songPagePath(matched.id) : null;
      return (
        <React.Fragment key={`${part}-${idx}`}>
          {idx > 0 && ' / '}
          {path ? (
            <a
              href={`${import.meta.env.BASE_URL}${path}`}
              onClick={() => saveSongReturnTab('sacred_map')}
              className="font-medium text-[#253331] underline decoration-[#c6bba8] underline-offset-2 hover:text-[#C83E2B]"
            >
              {part}
            </a>
          ) : (
            part
          )}
        </React.Fragment>
      );
    });
  };
  const [returnState] = useState(() => (initialSubView === 'sacred_map' ? null : takeGuideReturnState(songs.length)));
  const restored = initialEraFilter === 'all' ? returnState : null;
  const [filters, setFilters] = useState(() => restored?.filters ?? { ...DEFAULT_GUIDE_FILTERS, era: initialEraFilter });
  const { era: eraFilter, album: albumFilter, sound: soundFilter, searchQuery } = filters;
  const [selectedSpotCategory, setSelectedSpotCategory] = useState<SacredSpotCategory | 'all'>('all');
  const [cardPage, setCardPage] = useState<number>(() =>
    restored ? Math.max(1, Math.ceil(restored.visibleCount / CARDS_PER_PAGE)) : 1
  );
  const [voiceLow, setVoiceLow] = useState(() => restored?.voice?.low ?? '');
  const [voiceHigh, setVoiceHigh] = useState(() => restored?.voice?.high ?? '');
  const [keyShift, setKeyShift] = useState(() => restored?.voice?.keyShift ?? 0);
  const skipInitialPaginationReset = useRef(Boolean(restored));
  const previousEraPreset = useRef(initialEraFilter);
  const resultsTopRef = useRef<HTMLDivElement>(null);

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
  }, [eraFilter, albumFilter, soundFilter, searchQuery, filters.sortBy, activeSubView, voiceLow, voiceHigh, keyShift]);

  const voiceRangeInvalid = Boolean(voiceLow && voiceHigh && Number(voiceLow) > Number(voiceHigh));
  const filteredSongs = useMemo(() => {
    let matching = filterAndSortDiscography(songs, filters);
    if (activeSubView !== 'vocal_range') return matching;
    if (voiceRangeInvalid) return [];
    if (voiceLow || voiceHigh) matching = matching.filter(song => {
      const fact = songEvidence[song.id as keyof typeof songEvidence];
      return fitsVoiceRange(fact, voiceLow ? Number(voiceLow) : undefined, voiceHigh ? Number(voiceHigh) : undefined, keyShift);
    });
    return sortSongTable(matching, filters.tableSort ?? null);
  }, [songs, filters, activeSubView, voiceLow, voiceHigh, keyShift, voiceRangeInvalid]);
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

  const rememberGuide = () => {
    const restoredCount = activeSubView === 'vocal_range'
      ? Math.max(1, Math.min(songs.length, filteredSongs.length))
      : Math.min(Math.max(1, songs.length), Math.max(1, safeCardPage * CARDS_PER_PAGE));
    saveGuideReturnState({
      filters,
      visibleCount: restoredCount,
      view: activeSubView === 'vocal_range' ? 'vocal_range' : 'discography',
      voice: { low: voiceLow, high: voiceHigh, keyShift },
    });
  };

  const handleChangeCardPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(totalPages, nextPage));
    setCardPage(bounded);
    const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    resultsTopRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  const filteredSpots = useMemo(
    () =>
      selectedSpotCategory === 'all'
        ? SACRED_SPOTS
        : SACRED_SPOTS.filter((s) => s.categories.includes(selectedSpotCategory)),
    [selectedSpotCategory]
  );
  const filteredHistoricalSpots = selectedSpotCategory === 'all'
    ? HISTORICAL_SACRED_SPOTS
    : HISTORICAL_SACRED_SPOTS.filter(spot => spot.categories.includes(selectedSpotCategory));

  const [mapSpotId, setMapSpotId] = useState('');
  const mapSpots = filteredSpots.filter(s => s.mapScope !== 'none');
  const mapSpot = mapSpots.find(s => s.id === mapSpotId) ?? mapSpots[0];
  const mapQuery = mapSpot ? encodeURIComponent(mapSpot.name + ' ' + mapSpot.addressHint) : '';
  const visitedSpotCount = SACRED_SPOTS.filter((s) => s.mapScope !== 'none' && visitedSpotIds.includes(s.id)).length;
  const totalCheckableSpotCount = SACRED_SPOTS.filter((s) => s.mapScope !== 'none').length;
  const emptyResults = (
    <div className="mt-4 notebook-paper rounded-xl p-6 text-center">
      <p className="font-note-serif text-sm font-bold text-[#253331]">条件に一致する楽曲が見つかりませんでした。</p>
      {activeSubView === 'vocal_range' && (voiceLow || voiceHigh) ? (
        <button type="button" onClick={() => { setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }}
          className="mt-3 min-h-[44px] rounded-full bg-[#253331] px-5 py-2 text-sm font-bold text-[#faf6eb] cursor-pointer">
          声の範囲をリセット
        </button>
      ) : globalMatchCount > 0 ? (
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
            {activeSubView === 'sacred_map'
              ? '聖地巡礼マップ'
              : activeSubView === 'vocal_range'
              ? '掲載90曲の音域・発売日一覧'
              : '楽曲ガイド（掲載90曲）'}
          </h1>

          {activeSubView === 'sacred_map' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331] shrink-0">
              <MapPin className="h-3.5 w-3.5 text-[#2e6f40]" aria-hidden="true" />
              <span>訪問記録：{visitedSpotCount} / {totalCheckableSpotCount} スポット</span>
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#fffdf8] p-1 shrink-0">
              <a
                href={tabPath('discography', import.meta.env.BASE_URL)}
                aria-current={activeSubView === 'discography' ? 'page' : undefined}
                onClick={(e) => {
                  if (isPlainLeftClick(e) && onSelectView) {
                    e.preventDefault();
                    onSelectView('discography');
                  }
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeSubView === 'discography'
                    ? 'bg-[#253331] text-[#faf6eb]'
                    : 'text-[#57534E] hover:bg-[#f4efe4] hover:text-[#253331]'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
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
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap ${
                  activeSubView === 'vocal_range'
                    ? 'bg-[#253331] text-[#faf6eb]'
                    : 'text-[#57534E] hover:bg-[#f4efe4] hover:text-[#253331]'
                }`}
              >
                <Mic2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>音域・発売日比較表</span>
              </a>
            </div>
          )}
        </div>

        {activeSubView !== 'sacred_map' && (
          <SongGuideFilters values={{ ...filters, tableSort: activeSubView === 'vocal_range' ? filters.tableSort : undefined }} onChange={setFilters}
            resultCount={filteredSongs.length} shownCount={displayedSongs.length}
            voiceSummary={activeSubView === 'vocal_range' && (voiceLow || voiceHigh || keyShift !== 0) ? '声の範囲・キーを指定中' : undefined}
            onReset={() => { setFilters(DEFAULT_GUIDE_FILTERS); setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }}>
            {activeSubView === 'vocal_range' && (
              <div className="mt-3 rounded-xl border border-[#dfd7c7] bg-[#fff9eb] p-4">
                <h2 className="font-note-serif text-sm font-bold text-[#253331]">自分の声の範囲で探す</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#57534E]">出せる低い音と高い音を選ぶと、地声の音域が範囲に収まる曲を探せます。裏声や息継ぎは含まない、選曲の目安です。表に表示する音域は原曲キーの値です。</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-bold text-[#57534E]">出せる低い音
                    <select value={voiceLow} onChange={event => setVoiceLow(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dfd7c7] bg-[#fffdf8] px-3 text-sm text-[#253331]">
                      <option value="">指定しない</option>{VOICE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-[#57534E]">出せる高い音
                    <select value={voiceHigh} onChange={event => setVoiceHigh(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#dfd7c7] bg-[#fffdf8] px-3 text-sm text-[#253331]">
                      <option value="">指定しない</option>{VOICE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-[#57534E]">カラオケのキー
                    <select value={keyShift} onChange={event => setKeyShift(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-lg border border-[#dfd7c7] bg-[#fffdf8] px-3 text-sm text-[#253331]">
                      {Array.from({ length: 25 }, (_, index) => index - 12).map(value => <option key={value} value={value}>{value === 0 ? '原曲キー' : value > 0 ? `+${value}` : value}</option>)}
                    </select>
                  </label>
                </div>
                {voiceRangeInvalid && <p role="alert" className="mt-2 text-sm text-[#A3291C]">高い音には、低い音以上の高さを選んでください。</p>}
                {(voiceLow || voiceHigh || keyShift !== 0) && <button type="button" onClick={() => { setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }} className="mt-3 min-h-10 text-xs font-bold text-[#A3291C] underline cursor-pointer">声の範囲とキーをリセット</button>}
              </div>
            )}
          </SongGuideFilters>
        )}

        {activeSubView !== 'sacred_map' && epCoverage && (
          <p className="mt-3 notebook-paper rounded-lg p-3 text-sm text-[#57534E]">
            {epCoverage.note} <a className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={epCoverage.source} target="_blank" rel="noopener noreferrer">公式の収録曲 ↗</a>
          </p>
        )}

        {/* Sub-View 1: Song Guide Cards */}
        {activeSubView === 'discography' && (
          <div ref={resultsTopRef} className="scroll-mt-20">
            {filteredSongs.length === 0 ? emptyResults : (
              <>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-[repeat(2,minmax(0,1fr))] lg:grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
                  {displayedSongs.map((song) => {
                    const inSetlist = setlistSongIds.includes(song.id);
                    const pagePath = songPagePath(song.id);
                    const fact = songEvidence[song.id as keyof typeof songEvidence];
                    const artwork = songAppleArtwork[song.id];
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
                          <div className="flex items-start gap-3">
                            {artwork && <SongArtworkThumb src={artwork.artworkUrl} />}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] font-mono-num">
                                <span className="min-w-0 wrap-anywhere whitespace-normal">{albumBadgeText}</span>
                                <span className="shrink-0">配信日 {song.releaseDate}</span>
                              </div>
                              <h2 className="mt-0.5 font-note-serif text-base sm:text-lg font-bold text-[#253331] min-w-0 wrap-anywhere whitespace-normal">
                                {pagePath ? (
                                  <a href={`${import.meta.env.BASE_URL}${pagePath}`} onClick={rememberGuide}
                                    className="rounded-sm underline decoration-[#c6bba8] underline-offset-4 hover:decoration-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]">{song.title}</a>
                                ) : (
                                  <button type="button" onClick={() => onSelectSong(song)}
                                    className="rounded-sm text-left underline decoration-[#c6bba8] underline-offset-4 hover:decoration-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]">{song.title}</button>
                                )}
                              </h2>
                              <p className="mt-0.5 text-xs text-[#57534E] min-w-0 wrap-anywhere whitespace-normal">
                                {getSongwriterCredit(song)}
                                {!albumBadgeText.startsWith(displayFactAlbum) ? ` · 収録作：${displayFactAlbum}` : ''}
                              </p>
                            </div>
                          </div>

                          {searchQuery.trim() && matchedSongContexts(searchQuery, song)
                            .filter(item => item.label !== '収録作品' || item.text !== albumBadgeText)
                            .map(item => <p key={item.label + item.text} className="mt-2.5 text-xs leading-relaxed text-[#1E3A5F] wrap-anywhere">
                              {item.label}：{item.text}{item.source && <> <a className="underline" href={item.source} target="_blank" rel="noopener noreferrer">{item.label}の出典 ↗</a></>}
                            </p>)}

                          {/* Vocal Range & High-Note Section Mini Box */}
                          <div className="mt-3 rounded-lg bg-[#faf6eb] border border-[#ebe2d2] px-3 py-2 text-[11px]">
                            <div className="flex flex-wrap items-center justify-between gap-1 font-mono-num">
                              <span className="text-[#57534E]">
                                最低 <strong className="text-[#1d5a7a]">{song.vocalRange.lowestNote}</strong>
                              </span>
                              <span className="text-[#57534E]">
                                地声最高 <strong className="text-[#C83E2B]">{song.vocalRange.highestChestNote}</strong>
                              </span>
                              <span className="text-[#57534E]">
                                裏声{' '}
                                {song.vocalRange.highestFalsettoNote === '参考値なし' ? (
                                  <span className="font-normal text-[#78716C]">参考値なし</span>
                                ) : (
                                  <strong className="text-[#9e6022]">{song.vocalRange.highestFalsettoNote}</strong>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#ece3d2]">
                          {pagePath ? (
                            <a
                              href={`${import.meta.env.BASE_URL}${pagePath}`}
                              aria-label={`${song.title}：曲のページを見る`}
                              onClick={rememberGuide}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3 py-2 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors whitespace-nowrap shrink-0"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1d5a7a]" aria-hidden="true" />
                              曲のページを見る
                            </a>
                          ) : (
                            <button
                              type="button"
                              aria-label={`${song.title}：曲のページを見る`}
                              onClick={() => onSelectSong(song)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3 py-2 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1d5a7a]" aria-hidden="true" />
                              曲のページを見る
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label={inSetlist ? `${song.title}はセトリに追加済み` : `${song.title}をセトリに追加`}
                            onClick={() => onAddToSetlist(song.id)}
                            disabled={inSetlist}
                            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                              inSetlist
                                ? 'bg-[#253331] text-[#faf6eb]'
                                : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
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
          <div className="mt-3 space-y-3 min-w-0">
            <p id="song-table-help" className="text-xs leading-5 text-[#57534E]">↔ 表は横にスクロールできます。見出しを押すと昇順・降順で並べ替えられます。</p>
            {filteredSongs.length === 0 ? emptyResults : (
              <div className="max-w-full overflow-x-auto notebook-paper rounded-xl" role="region" aria-label="音域・発売日比較表" aria-describedby="song-table-help" tabIndex={0}>
                <table className="w-[1230px] sm:w-[1262px] table-fixed border-collapse text-left text-xs leading-5 sm:text-[13px]">
                  <caption className="sr-only">音域・発売日比較表。見出しで並べ替え、日付と音域の出典は各行から開けます。</caption>
                  <colgroup>
                    <col className="w-[168px] sm:w-[200px]" />
                    <col className="w-[110px]" />
                    <col className="w-[110px]" />
                    <col className="w-[116px]" />
                    <col className="w-[186px]" />
                    <col className="w-[82px]" />
                    <col className="w-[88px]" />
                    <col className="w-[106px]" />
                    <col className="w-[106px]" />
                    <col className="w-[158px]" />
                  </colgroup>
                  <thead className="bg-[#f4efe4] text-xs text-[#57534E]">
                    <tr>
                      {(['title', 'low', 'chest', 'falsetto', 'album', 'duration', 'bpm', 'release', 'cd'] as SongTableSortKey[]).map(key => {
                        const direction = filters.tableSort?.key === key ? filters.tableSort.direction : undefined;
                        const next = direction === 'ascending' ? 'descending' : 'ascending';
                        return <th key={key} scope="col" aria-sort={direction} className={`whitespace-nowrap px-2 py-1 ${key === 'title' ? 'sticky left-0 z-20 w-[168px] sm:w-[200px] bg-[#f4efe4] border-r border-[#e5dccb] shadow-[2px_0_4px_-2px_rgba(37,51,49,0.08)]' : ''}`}>
                          <button type="button" className="flex min-h-10 w-full items-center gap-1 text-left font-bold text-[#253331] hover:text-[#C83E2B] cursor-pointer"
                            aria-label={`${SONG_TABLE_SORT_LABELS[key]}を${next === 'ascending' ? '昇順' : '降順'}で並べ替え`}
                            onClick={() => setFilters(current => ({ ...current, tableSort: { key, direction: next } }))}>
                            {SONG_TABLE_SORT_LABELS[key]}<span aria-hidden="true">{direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}</span>
                          </button>
                        </th>;
                      })}
                      <th scope="col" className="whitespace-nowrap px-3 py-3 text-[#253331]">音域の参照元</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ece3d2]">
                    {displayedSongs.map(song => {
                      const f = songEvidence[song.id as keyof typeof songEvidence];
                      return <tr key={song.id} className="group align-top hover:bg-[#faf6eb]">
                        <th scope="row" className="sticky left-0 z-10 w-[168px] sm:w-[200px] bg-[#fffdf8] group-hover:bg-[#faf6eb] border-r border-[#ece3d2] shadow-[2px_0_4px_-2px_rgba(37,51,49,0.08)] px-2 py-3 font-note-serif font-bold text-[#253331] whitespace-normal wrap-anywhere">
                          <a
                            href={`${import.meta.env.BASE_URL}${songPagePath(song.id) ?? ''}`}
                            onClick={rememberGuide}
                            className="inline-flex min-h-[28px] items-center py-0.5 text-left underline decoration-[#c6bba8] underline-offset-2 hover:text-[#C83E2B]"
                          >
                            {song.title}
                          </a>
                        </th>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num">{song.vocalRange.lowestNote}</td>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num">{song.vocalRange.highestChestNote}</td>
                        <td className={`whitespace-nowrap px-2 py-3 font-mono-num ${song.vocalRange.highestFalsettoNote === '参考値なし' ? 'text-[#78716C]' : ''}`}>{song.vocalRange.highestFalsettoNote}</td>
                        <td className="px-3 py-3 whitespace-normal wrap-anywhere">{formatAlbumDisplayName(f.album)}</td>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatDuration(song.durationSec)}</td>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatSongBpm(song.id, song.bpm)}</td>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num"><a className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]" target="_blank" rel="noopener noreferrer" href={f.apple} aria-label={`${song.title}の配信日 ${f.release}（Apple Musicを新しいタブで開く）`}>{f.release}</a></td>
                        <td className="whitespace-nowrap px-2 py-3 font-mono-num">{f.cd ? <a className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]" target="_blank" rel="noopener noreferrer" href={f.cdSource} aria-label={`${song.title}のCD発売日 ${f.cd}（出典を新しいタブで開く）`}>{f.cd}</a> : '—'}</td>
                        <td className="whitespace-nowrap px-3 py-3"><a className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]" href={f.rangeSource} target="_blank" rel="noopener noreferrer" aria-label={`${song.title}の音域の参照元：${f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel}`}>{f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel} ↗</a></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <details className="notebook-paper rounded-xl p-3.5 text-xs text-[#57534E]">
              <summary className="cursor-pointer font-bold text-[#253331]">音域・日付の見方</summary>
              <p className="mt-2 leading-relaxed">地声・裏声は曲別の調査サイトに基づく目安です。「配信日」はApple Music上の配信日で、CD発売日欄は表示中の収録作品の発売日です。裏声の「参考値なし」は参照元に値がないことを示します。BPMは小数を四捨五入した目安です。各曲名から別の調査データとの違いも確認できます。調査中・未発売の値は並べ替えの方向にかかわらず末尾に表示します。</p>
            </details>
          </div>
        )}

        {/* Sub-View 3: Sacred Spots Map & Pilgrimage Travel Notebook */}
        {activeSubView === 'sacred_map' && (
          <div className="mt-5 space-y-6">
            <div className="notebook-paper rounded-xl p-3 sm:p-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="場所とのつながりで絞り込む">
                {SPOT_CATEGORIES.map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selectedSpotCategory === category}
                      onClick={() => setSelectedSpotCategory(category)}
                      className={`min-h-[40px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                        selectedSpotCategory === category
                          ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                          : 'border-[#dfd7c7] bg-[#faf6eb] text-[#57534E] hover:text-[#253331] hover:bg-[#f4efe4]'
                      }`}
                    >
                      {category === 'all' ? 'すべて' : category}
                    </button>
                  )
                )}
              </div>
            </div>

            {mapSpot && (
              <section
                id="sacred-map-viewer"
                className="fusen-memo-card scroll-mt-24"
                style={{ '--tape-bg': '#bce3f8' } as CSSProperties}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="font-note-serif text-sm font-bold text-[#253331]" htmlFor="map-place">
                      地図で見る場所
                    </label>
                    <select
                      id="map-place"
                      className="min-h-[42px] max-w-full rounded-lg border border-[#dfd7c7] bg-[#faf6eb] px-3 py-1.5 text-xs sm:text-sm font-medium text-[#253331] focus:outline-none focus:ring-2 focus:ring-[#253331]"
                      value={mapSpot.id}
                      onChange={e => setMapSpotId(e.target.value)}
                    >
                      {mapSpots.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}{s.mapScope === 'area' ? '（エリアの目安）' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <a
                    className="inline-flex min-h-[28px] items-center gap-1 py-0.5 text-xs font-bold text-[#1d5a7a] underline underline-offset-4 hover:text-[#C83E2B]"
                    href={'https://www.google.com/maps/search/?api=1&query=' + mapQuery}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google マップで開く・経路検索 ↗
                  </a>
                </div>
                {mapSpot.mapScope === 'area' && (
                  <p className="mt-2.5 text-xs leading-relaxed text-[#57534E]">
                    {mapSpot.mapAreaNote ?? '地図は周辺エリアの目安で、具体的な撮影地点を示すものではありません。'}
                  </p>
                )}
                <div className="mt-3 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f4efe4]">
                  <iframe
                    className="block w-full"
                    height="280"
                    title={mapSpot.name + 'の地図'}
                    loading="lazy"
                    src={'https://maps.google.com/maps?output=embed&q=' + mapQuery}
                  />
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredSpots.map((spot, index) => {
                const visited = visitedSpotIds.includes(spot.id);
                const tapeStyle = {
                  '--tape-bg': SPOT_TAPE_COLORS[index % SPOT_TAPE_COLORS.length],
                } as CSSProperties;
                return (
                  <article
                    key={spot.id}
                    className="fusen-memo-card"
                    style={tapeStyle}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-note-serif text-base font-bold text-[#253331]">
                          {spot.name}
                        </h2>
                        {visited && (
                          <span className="shrink-0 rounded border border-[#2e6f40]/40 bg-[#eef9f0] px-1.5 py-0.5 text-[10px] font-bold text-[#2e6f40]">
                            訪問済み
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#C83E2B]">{spot.area}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#1d5a7a]">{spot.categoryLabel ?? spot.categories.join(' / ')}</p>
                      {spot.relatedSong && spot.relatedSongLabel && (
                        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                          {spot.relatedSongLabel}：{renderSpotRelatedSongs(spot.relatedSong)}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-[#57534E] leading-relaxed">
                        {spot.description}
                      </p>
                      <div className="mt-3 rounded-md border border-[#ebe2d2] bg-[#faf6eb] px-3 py-2.5 text-xs text-[#57534E] leading-relaxed">
                        <strong className="text-[#253331]">スポットメモ：</strong>
                        {spot.fanTip}
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                          {spot.mapScope !== 'none' && (
                            <button
                              type="button"
                              aria-label={`${spot.name}${spot.mapScope === 'area' ? 'のエリアを地図で見る' : 'を地図で見る'}`}
                              className="inline-flex min-h-[28px] items-center py-0.5 font-bold text-[#1d5a7a] underline cursor-pointer hover:text-[#C83E2B]"
                              onClick={() => {
                                setMapSpotId(spot.id);
                                window.requestAnimationFrame(() => {
                                  document.getElementById('sacred-map-viewer')?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'nearest',
                                  });
                                  document.getElementById('map-place')?.focus({ preventScroll: true });
                                });
                              }}
                            >
                              {spot.mapScope === 'area' ? 'エリアを地図で見る' : '地図で見る'}
                            </button>
                          )}
                          <a className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={spot.source} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name}の場所・作品の情報（新しいタブで開く）`}>
                            場所・作品の情報 ↗
                          </a>
                          {spot.historySource && (
                            <a className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={spot.historySource} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name}：${spot.historySourceLabel ?? 'つながりの出典'}（新しいタブで開く）`}>
                              {spot.historySourceLabel ?? 'つながりの出典'} ↗
                            </a>
                          )}
                          {spot.additionalSources?.map(source => (
                            <a key={source.url} className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name}：${source.label}（新しいタブで開く）`}>
                              {source.label} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                      {spot.relatedSong && !spot.relatedSongLabel && (
                        <p className="mt-2.5 text-xs leading-relaxed text-[#57534E]">
                          <strong className="text-[#253331]">
                            {spot.categories.includes('ライブ会場') ? '会場ゆかりの曲' : 'あわせて聴きたい曲'}：
                          </strong>
                          {renderSpotRelatedSongs(spot.relatedSong)}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ece3d2]">
                      <span className="text-[11px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
                        {spot.addressHint}
                      </span>
                      {spot.mapScope !== 'none' && (
                        <button
                          type="button"
                          onClick={() => onToggleVisitedSpot(spot.id)}
                          aria-pressed={visited}
                          aria-label={visited ? `${spot.name}の訪問を取り消す` : `${spot.name}の訪問を記録`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            visited
                              ? 'bg-[#2e6f40] text-white'
                              : 'border border-[#dfd7c7] bg-[#faf6eb] text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4]'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {visited ? '訪問済み' : spot.mapScope === 'area' ? 'エリアに行った！' : '行った！を記録'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredHistoricalSpots.length > 0 && (
              <section aria-labelledby="historical-spots-heading" className="rounded-xl border border-[#dfd7c7] bg-[#f4efe4]/80 p-5 sm:p-6">
                <h2 id="historical-spots-heading" className="font-note-serif text-base font-bold text-[#253331]">
                  以前の場所・移転の記録
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                  移転や閉店などで、当時とは場所や形が変わったスポットの記録です。
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHistoricalSpots.map(spot => (
                    <article
                      key={spot.id}
                      className="fusen-memo-card"
                      style={{ '--tape-bg': '#e5decb' } as CSSProperties}
                    >
                      <div>
                        <p className="text-xs font-bold text-[#C83E2B]">
                          {spot.area} <span className="ml-2 text-[#57534E]">{spot.status}</span>
                        </p>
                        <h3 className="mt-1.5 font-note-serif text-base font-bold text-[#253331]">{spot.name}</h3>
                        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">{spot.description}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#ece3d2] pt-3 text-xs">
                        {spot.sources.map(source => (
                          <a key={source.url} className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.label} ↗
                          </a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
            <p className="text-center text-[11px] text-[#78716C]">※ 訪問済みの記録はお使いのブラウザ内に保存されます。</p>
          </div>
        )}
      </div>
    </section>
  );
};
