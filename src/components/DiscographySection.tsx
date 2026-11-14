import { albumForSearch, matchedSongContexts } from '../utils/songSearch';
import { partialEpCoverage } from '../utils/songCatalog';
import { DEFAULT_GUIDE_FILTERS, SongGuideFilters } from './SongGuideFilters';
import { songEvidence } from '../data/fullCatalogSongs';
import { fitsVoiceRange } from '../utils/voiceRange';
import { sortSongTable, SONG_TABLE_SORT_LABELS, type SongTableSortKey } from '../utils/songTableSort';
import { songPagePath } from '../songPages/publishedSongPageIds';
import { saveGuideReturnState, takeGuideReturnState } from '../utils/guideReturnState';
import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  ArrowLeft,
  BookOpen,
  MapPin,
  Mic2,
  Plus,
  Check,
  ChevronDown,
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
} from '../utils/fanLogic';

export type DiscographySubView = 'discography' | 'vocal_range' | 'sacred_map';

interface DiscographySectionProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
  visitedSpotIds: string[];
  onToggleVisitedSpot: (spotId: string) => void;
  initialSubView?: DiscographySubView;
  initialEraFilter?: EraTag | 'all';
  onBackHome?: () => void;
}

const SPOT_TAPE_COLORS = ['#f3d2a8', '#f5c6be', '#bce3f8', '#c0e6c7', '#dfcaf6', '#f6e39c'] as const;

const INITIAL_VISIBLE_COUNT = 18;
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

export const DiscographySection: React.FC<DiscographySectionProps> = ({
  songs,
  onSelectSong,
  onAddToSetlist,
  setlistSongIds,
  visitedSpotIds,
  onToggleVisitedSpot,
  initialSubView = 'discography',
  initialEraFilter = 'all',
  onBackHome,
}) => {
  const activeSubView = initialSubView;
  const [returnState] = useState(() => takeGuideReturnState(songs.length));
  const restored = initialEraFilter === 'all' ? returnState : null;
  const [filters, setFilters] = useState(() => restored?.filters ?? { ...DEFAULT_GUIDE_FILTERS, era: initialEraFilter });
  const { era: eraFilter, album: albumFilter, sound: soundFilter, searchQuery } = filters;
  const [selectedSpotCategory, setSelectedSpotCategory] = useState<SacredSpotCategory | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(() => restored?.visibleCount ?? INITIAL_VISIBLE_COUNT);
  const [voiceLow, setVoiceLow] = useState(() => restored?.voice?.low ?? '');
  const [voiceHigh, setVoiceHigh] = useState(() => restored?.voice?.high ?? '');
  const [keyShift, setKeyShift] = useState(() => restored?.voice?.keyShift ?? 0);
  const skipInitialPaginationReset = useRef(Boolean(restored));
  const previousEraPreset = useRef(initialEraFilter);

  useEffect(() => {
    if (previousEraPreset.current === initialEraFilter) return;
    previousEraPreset.current = initialEraFilter;
    setFilters(current => ({ ...current, era: initialEraFilter, album: 'all' }));
  }, [initialEraFilter]);

  // Keep the expanded list when only its ordering changes.
  useEffect(() => {
    if (skipInitialPaginationReset.current) {
      skipInitialPaginationReset.current = false;
      return;
    }
    setVisibleCount(
      albumFilter !== 'all' || searchQuery.trim().length > 0 ? songs.length : INITIAL_VISIBLE_COUNT
    );
  }, [eraFilter, albumFilter, soundFilter, searchQuery, activeSubView, voiceLow, voiceHigh, keyShift, songs.length]);

  const rememberGuide = () => saveGuideReturnState({ filters, visibleCount, view: activeSubView === 'vocal_range' ? 'vocal_range' : 'discography', voice: { low: voiceLow, high: voiceHigh, keyShift } });

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

  const displayedSongs = useMemo(
    () => filteredSongs.slice(0, visibleCount),
    [filteredSongs, visibleCount]
  );

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

  const sectionTapeStyle = {
    '--tape-bg':
      activeSubView === 'sacred_map'
        ? '#f3d2a8'
        : activeSubView === 'vocal_range'
        ? '#bce3f8'
        : '#f6e39c',
  } as CSSProperties;

  return (
    <section
      id="section-discography"
      aria-labelledby="discography-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ノート世界観：サブページ上部ヘッダー＆付箋一覧へ戻る導線 */}
        <div className="pb-5 border-b border-[#e5dccb] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {onBackHome && (
                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#C83E2B]" aria-hidden="true" />
                  <span>付箋一覧へ戻る</span>
                </button>
              )}
              <span className="fusen-washi-tag" style={sectionTapeStyle}>
                {activeSubView === 'sacred_map'
                  ? '旅の手帳メモ'
                  : activeSubView === 'vocal_range'
                  ? '採譜と日付の記録'
                  : '収録曲ガイド'}
              </span>
            </div>

            {activeSubView === 'sacred_map' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331]">
                <MapPin className="h-3.5 w-3.5 text-[#2e6f40]" aria-hidden="true" />
                <span>訪問記録：{visitedSpotCount} / {totalCheckableSpotCount} スポット</span>
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#fffdf8] p-1">
                <a
                  href="#discography"
                  aria-current={activeSubView === 'discography' ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                    activeSubView === 'discography'
                      ? 'bg-[#253331] text-[#faf6eb]'
                      : 'text-[#57534E] hover:bg-[#f4efe4] hover:text-[#253331]'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>解説カード表示</span>
                </a>
                <a
                  href="#vocal_range"
                  aria-current={activeSubView === 'vocal_range' ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
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

          <div>
            <h2
              id="discography-heading"
              className="font-note-serif text-xl sm:text-[28px] font-bold tracking-[.04em] text-[#253331]"
            >
              {activeSubView === 'sacred_map'
                ? '聖地巡礼マップ'
                : activeSubView === 'vocal_range'
                ? '掲載90曲の音域・発売日一覧'
                : '楽曲ガイド（全90曲）'}
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#57534E]">
              {activeSubView === 'sacred_map'
                ? '山陰の原点の地からライブ会場、MVの舞台になった景色まで、音と記憶をつないでたどります。'
                : activeSubView === 'vocal_range'
                ? '歌いやすさの目安を探ったり、楽曲ごとの発表の歩みを日付で見比べたりできる比較表です。'
                : '一曲ごとの物語や制作の背景、聴きどころをたどれるガイド。お気に入りの一曲を、もっと深く味わおう。'}
            </p>
          </div>
        </div>

        {activeSubView !== 'sacred_map' && (
          <SongGuideFilters values={{ ...filters, tableSort: activeSubView === 'vocal_range' ? filters.tableSort : undefined }} onChange={setFilters}
            resultCount={filteredSongs.length} shownCount={displayedSongs.length}
            voiceSummary={activeSubView === 'vocal_range' && (voiceLow || voiceHigh || keyShift !== 0) ? '声の範囲・キーを指定中' : undefined}
            onReset={() => { setFilters(DEFAULT_GUIDE_FILTERS); setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }}>
            {activeSubView === 'vocal_range' && (
              <div className="mt-3 rounded-xl border border-[#dfd7c7] bg-[#fff9eb] p-4">
                <h3 className="font-note-serif text-sm font-bold text-[#253331]">自分の声の範囲で探す</h3>
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
            {epCoverage.note} <a className="underline hover:text-[#C83E2B]" href={epCoverage.source} target="_blank" rel="noreferrer">公式の収録曲 ↗</a>
          </p>
        )}

        {/* Sub-View 1: Song Guide Cards */}
        {activeSubView === 'discography' && (
          <div>
            {filteredSongs.length === 0 ? emptyResults : (
              <>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedSongs.map((song) => {
                    const inSetlist = setlistSongIds.includes(song.id);
                    const pagePath = songPagePath(song.id);
                    const albumBadgeText = resultAlbum && EP_TRACK_ORDER_MAP[resultAlbum]?.[song.id]
                      ? `${resultAlbum} (M${EP_TRACK_ORDER_MAP[resultAlbum][song.id]})`
                      : `${song.album}${song.trackNumber ? ` (M${song.trackNumber})` : ''}`;

                    return (
                      <article
                        key={song.id}
                        className="flex flex-col justify-between notebook-paper rounded-xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:border-[#253331]/40"
                      >
                        <div>
                          <div className="flex items-start">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] font-mono-num">
                                <span className="min-w-0 wrap-anywhere whitespace-normal">{albumBadgeText}</span>
                                <span className="shrink-0">配信掲載 {song.releaseDate}</span>
                              </div>
                              <h3 className="mt-0.5 font-note-serif text-base sm:text-lg font-bold text-[#253331] min-w-0 wrap-anywhere whitespace-normal">
                                {pagePath ? (
                                  <a href={`${import.meta.env.BASE_URL}${pagePath}`} onClick={rememberGuide}
                                    className="rounded-sm underline decoration-[#c6bba8] underline-offset-4 hover:decoration-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]">{song.title}</a>
                                ) : (
                                  <button type="button" onClick={() => onSelectSong(song)}
                                    className="rounded-sm text-left underline decoration-[#c6bba8] underline-offset-4 hover:decoration-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]">{song.title}</button>
                                )}
                              </h3>
                              <p className="text-xs text-[#57534E] min-w-0 wrap-anywhere whitespace-normal">
                                掲載音源：{songEvidence[song.id as keyof typeof songEvidence].album}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-xs leading-relaxed text-[#57534E] wrap-anywhere">
                            {song.linerNotes}
                          </p>

                          {searchQuery.trim() && matchedSongContexts(searchQuery, song)
                            .filter(item => item.label !== '収録作品' || item.text !== albumBadgeText)
                            .map(item => <p key={item.label + item.text} className="mt-1 text-xs leading-relaxed text-[#1E3A5F] wrap-anywhere">
                              {item.label}：{item.text}{item.source && <> <a className="underline" href={item.source} target="_blank" rel="noreferrer">{item.label}の出典 ↗</a></>}
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
                                裏声 <strong className="text-[#9e6022]">{song.vocalRange.highestFalsettoNote}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Clean Unboxed Metadata Line */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#78716C]">
                            <span>収録音源 {formatDuration(song.durationSec)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">BPM {formatSongBpm(song.id, song.bpm)}</span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#ece3d2]">
                          {pagePath ? (
                            <a
                              href={`${import.meta.env.BASE_URL}${pagePath}`}
                              onClick={rememberGuide}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3 py-2 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors whitespace-nowrap shrink-0"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1d5a7a]" />
                              曲のページを見る
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectSong(song)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-3 py-2 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1d5a7a]" />
                              音域・解説を見る
                            </button>
                          )}
                          <button
                            type="button"
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
                                <Check className="h-3.5 w-3.5" />
                                追加済
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                セトリに追加
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Progressive Pagination Controls */}
                {filteredSongs.length > visibleCount && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 notebook-paper rounded-xl p-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#253331] px-5 py-2.5 text-xs font-bold text-[#faf6eb] hover:bg-[#C83E2B] transition-colors cursor-pointer min-h-[42px]"
                    >
                      <ChevronDown className="h-4 w-4" />
                      さらに{Math.min(24, filteredSongs.length - visibleCount)}曲を表示（残り {filteredSongs.length - visibleCount} 曲）
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredSongs.length)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-4 py-2.5 text-xs font-bold text-[#253331] hover:border-[#253331] transition-colors cursor-pointer min-h-[42px]"
                    >
                      全 {filteredSongs.length} 曲をすべて表示
                    </button>
                  </div>
                )}

                <details className="mt-6 notebook-paper rounded-xl p-3.5 text-xs text-[#57534E]">
                  <summary className="cursor-pointer font-bold text-[#253331]">掲載楽曲の範囲について</summary>
                  <p className="mt-2 leading-relaxed">2015年から2026年4月「スターダスト」までに発表された楽曲から90曲を紹介しています。インスト曲と同じ曲の別バージョンは掲載対象を絞っています。</p>
                </details>
              </>
            )}
          </div>
        )}

        {/* 画面幅によらず、曲名と音域を同じ表で比較する。 */}
        {activeSubView === 'vocal_range' && (
          <div className="mt-3 space-y-3 min-w-0">
            <p id="song-table-help" className="text-xs leading-5 text-[#57534E]">↔ 表は横にスクロールできます。見出しを押すと昇順・降順で並べ替えられます。</p>
            {filteredSongs.length === 0 ? emptyResults : (
              <>
                <div className="max-w-full overflow-x-auto notebook-paper rounded-xl" role="region" aria-label="音域・発売日比較表" aria-describedby="song-table-help" tabIndex={0}>
                  <table className="w-full min-w-[1100px] border-collapse text-left text-xs leading-5 sm:text-[13px]">
                    <caption className="sr-only">音域・発売日比較表。見出しで並べ替え、日付と音域の出典は各行から開けます。</caption>
                    <thead className="bg-[#f4efe4] text-xs text-[#57534E]">
                      <tr>
                        {(['title', 'low', 'chest', 'falsetto', 'album', 'duration', 'bpm', 'release', 'cd'] as SongTableSortKey[]).map(key => {
                          const direction = filters.tableSort?.key === key ? filters.tableSort.direction : undefined;
                          const next = direction === 'ascending' ? 'descending' : 'ascending';
                          return <th key={key} scope="col" aria-sort={direction} className={`whitespace-nowrap px-2 py-1 ${key === 'title' ? 'sticky left-0 z-20 min-w-[132px] sm:min-w-[160px] bg-[#f4efe4] border-r border-[#e5dccb] shadow-[2px_0_4px_-2px_rgba(37,51,49,0.08)]' : ''}`}>
                            <button type="button" className="flex min-h-10 w-full items-center gap-1 text-left font-bold text-[#253331] hover:text-[#C83E2B] cursor-pointer"
                              aria-label={`${SONG_TABLE_SORT_LABELS[key]}を${next === 'ascending' ? '昇順' : '降順'}で並べ替え`}
                              onClick={() => setFilters(current => ({ ...current, tableSort: { key, direction: next } }))}>
                              {SONG_TABLE_SORT_LABELS[key]}<span aria-hidden="true">{direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}</span>
                            </button>
                          </th>;
                        })}
                        <th scope="col" className="whitespace-nowrap px-3 py-3 text-[#253331]">音域出典</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ece3d2]">
                      {displayedSongs.map(song => {
                        const f = songEvidence[song.id as keyof typeof songEvidence];
                        return <tr key={song.id} className="group align-top hover:bg-[#faf6eb]">
                          <th scope="row" className="sticky left-0 z-10 min-w-[132px] sm:min-w-[160px] max-w-[175px] sm:max-w-[220px] bg-[#fffdf8] group-hover:bg-[#faf6eb] border-r border-[#ece3d2] shadow-[2px_0_4px_-2px_rgba(37,51,49,0.08)] px-2 py-3 font-note-serif font-bold text-[#253331]">
                            <button type="button" className="text-left underline decoration-[#c6bba8] underline-offset-2 hover:text-[#C83E2B] cursor-pointer" onClick={() => {
                              if (songPagePath(song.id)) rememberGuide();
                              onSelectSong(song);
                            }}>{song.title}</button>
                          </th>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{song.vocalRange.lowestNote}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{song.vocalRange.highestChestNote}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{song.vocalRange.highestFalsettoNote}</td>
                          <td className="min-w-[120px] px-3 py-3">{f.album}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatDuration(song.durationSec)}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatSongBpm(song.id, song.bpm)}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num"><a className="underline underline-offset-2 hover:text-[#C83E2B]" target="_blank" rel="noreferrer" href={f.apple}>{f.release}</a></td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{f.cd ? <a className="underline underline-offset-2 hover:text-[#C83E2B]" target="_blank" rel="noreferrer" href={f.cdSource}>{f.cd}</a> : '—'}</td>
                          <td className="whitespace-nowrap px-3 py-3"><a className="underline underline-offset-2 hover:text-[#C83E2B]" href={f.rangeSource} target="_blank" rel="noreferrer" aria-label={`${song.title}の音域出典：${f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel}`}>{f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel} ↗</a></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Progressive Pagination Controls */}
                {filteredSongs.length > visibleCount && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 notebook-paper rounded-xl p-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-[#253331] px-5 py-2.5 text-xs font-bold text-[#faf6eb] hover:bg-[#C83E2B] transition-colors cursor-pointer min-h-[42px]"
                    >
                      <ChevronDown className="h-4 w-4" />
                      さらに{Math.min(24, filteredSongs.length - visibleCount)}曲を表示（残り {filteredSongs.length - visibleCount} 曲）
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredSongs.length)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-4 py-2.5 text-xs font-bold text-[#253331] hover:border-[#253331] transition-colors cursor-pointer min-h-[42px]"
                    >
                      全 {filteredSongs.length} 曲をすべて表示
                    </button>
                  </div>
                )}
              </>
            )}
            <details className="notebook-paper rounded-xl p-3.5 text-xs text-[#57534E]">
              <summary className="cursor-pointer font-bold text-[#253331]">音域・日付の見方</summary>
              <p className="mt-2 leading-relaxed">地声・裏声は曲別の採譜による値です。「配信掲載日」はApple Musicの楽曲欄の日付で、CD欄は表示中の収録作品の発売日です。裏声の「記載なし」は採譜資料に値がないことを示します。BPMは小数を四捨五入した目安です。各曲名から資料間の違いも確認できます。未掲載・調査中の値は並べ替えの方向にかかわらず末尾に表示します。</p>
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
                className="fusen-memo-card"
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
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1d5a7a] underline underline-offset-4 hover:text-[#C83E2B]"
                    href={'https://www.google.com/maps/search/?api=1&query=' + mapQuery}
                    target="_blank"
                    rel="noreferrer"
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
                        <h3 className="font-note-serif text-base font-bold text-[#253331]">
                          {spot.name}
                        </h3>
                        {visited && (
                          <span className="shrink-0 rounded border border-[#2e6f40]/40 bg-[#eef9f0] px-1.5 py-0.5 text-[10px] font-bold text-[#2e6f40]">
                            訪問済
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#C83E2B]">{spot.area}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#1d5a7a]">{spot.categoryLabel ?? spot.categories.join(' / ')}</p>
                      {spot.relatedSong && spot.relatedSongLabel && (
                        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                          {spot.relatedSongLabel}: {spot.relatedSong}
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
                              className="font-bold text-[#1d5a7a] underline cursor-pointer hover:text-[#C83E2B]"
                              onClick={() => {
                                setMapSpotId(spot.id);
                                document.getElementById('map-place')?.focus();
                              }}
                            >
                              {spot.mapScope === 'area' ? 'エリアを地図で見る' : '地図で見る'}
                            </button>
                          )}
                          <a className="underline hover:text-[#C83E2B]" href={spot.source} target="_blank" rel="noreferrer">
                            場所・作品の情報 ↗
                          </a>
                          {spot.historySource && (
                            <a className="underline hover:text-[#C83E2B]" href={spot.historySource} target="_blank" rel="noreferrer">
                              {spot.historySourceLabel ?? 'つながりの出典'} ↗
                            </a>
                          )}
                          {spot.additionalSources?.map(source => (
                            <a key={source.url} className="underline hover:text-[#C83E2B]" href={source.url} target="_blank" rel="noreferrer">
                              {source.label} ↗
                            </a>
                          ))}
                        </div>
                      </div>
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            visited
                              ? 'bg-[#2e6f40] text-white'
                              : 'border border-[#dfd7c7] bg-[#faf6eb] text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4]'
                          }`}
                        >
                          <MapPin className="h-3.5 w-3.5" />
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
                <h3 id="historical-spots-heading" className="font-note-serif text-base font-bold text-[#253331]">
                  以前の場所・移転の記録
                </h3>
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
                        <h4 className="mt-1.5 font-note-serif text-base font-bold text-[#253331]">{spot.name}</h4>
                        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">{spot.description}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#ece3d2] pt-3 text-xs">
                        {spot.sources.map(source => (
                          <a key={source.url} className="underline hover:text-[#C83E2B]" href={source.url} target="_blank" rel="noreferrer">
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
