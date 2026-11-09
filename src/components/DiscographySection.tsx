import { albumForSearch, matchedSongContexts } from '../utils/songSearch';
import { partialEpCoverage } from '../utils/songCatalog';
import { DEFAULT_GUIDE_FILTERS, SongGuideFilters } from './SongGuideFilters';
import { GuideArtwork } from './GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import { fitsVoiceRange } from '../utils/voiceRange';
import { songPagePath } from '../songPages/publishedSongPageIds';
import { saveGuideReturnState, takeGuideReturnState } from '../utils/guideReturnState';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  MapPin,
  Plus,
  Check,
  Disc,
  Compass,
  Mic2,
  ChevronDown,
} from 'lucide-react';
import {
  EraTag,
  HISTORICAL_SACRED_SPOTS,
  SACRED_SPOTS,
  SacredSpotCategory,
  SongItem,
  MATSUE_IMAGE_PATH,
} from '../data/higedanData';
import {
  EP_TRACK_ORDER_MAP,
  filterAndSortDiscography,
  formatSongBpm,
  formatDuration,
  isSafeAssetUrl,
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
}

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
}) => {
  const activeSubView = initialSubView;
  const [returnState] = useState(() => takeGuideReturnState(songs.length));
  const restored = initialEraFilter === 'all' ? returnState : null;
  const [filters, setFilters] = useState(() => restored?.filters ?? { ...DEFAULT_GUIDE_FILTERS, era: initialEraFilter });
  const { era: eraFilter, album: albumFilter, sound: soundFilter, searchQuery, sortBy } = filters;
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
    const matching = filterAndSortDiscography(songs, filters);
    if (activeSubView !== 'vocal_range' || (!voiceLow && !voiceHigh)) return matching;
    if (voiceRangeInvalid) return [];
    return matching.filter(song => {
      const fact = songEvidence[song.id as keyof typeof songEvidence];
      return fitsVoiceRange(fact, voiceLow ? Number(voiceLow) : undefined, voiceHigh ? Number(voiceHigh) : undefined, keyShift);
    });
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
  const emptyResults = (
    <div className="mt-4 rounded-xl border border-[#E6E1D6] bg-white p-5 text-center">
      <p className="text-sm font-bold text-[#1C1917]">条件に一致する楽曲が見つかりませんでした。</p>
      {activeSubView === 'vocal_range' && (voiceLow || voiceHigh) ? (
        <button type="button" onClick={() => { setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }}
          className="mt-3 min-h-[44px] rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-bold text-white">
          声の範囲をリセット
        </button>
      ) : globalMatchCount > 0 ? (
        <button type="button"
          onClick={() => setFilters({ ...DEFAULT_GUIDE_FILTERS, searchQuery })}
          className="mt-3 min-h-[44px] max-w-full wrap-anywhere rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-bold text-white">
          全{songs.length}曲から「{searchQuery.trim()}」を探す（{globalMatchCount}曲）
        </button>
      ) : (
        <button type="button" onClick={() => setFilters(DEFAULT_GUIDE_FILTERS)}
          className="mt-3 min-h-[44px] rounded-lg bg-[#1C1917] px-4 py-2 text-sm font-bold text-white">
          絞り込みをリセット
        </button>
      )}
    </div>
  );

  return (
    <section
      id="section-discography"
      aria-labelledby="discography-heading"
      className="py-4 sm:py-6"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header & Non-Overlapping 3-Way Sub-View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="discography-heading"
              className="text-lg sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              {activeSubView === 'sacred_map'
                ? '聖地巡礼マップ'
                : activeSubView === 'vocal_range'
                ? '掲載90曲の音域・発売日一覧'
                : '掲載90曲 楽曲ガイド（収録曲順・音域・曲調）'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubView === 'sacred_map'
                ? 'メンバーの思い出やライブ会場、MVに登場した景色をたどります。'
                : activeSubView === 'vocal_range'
                ? '地声・裏声は曲別の採譜による値です。配信サービス掲載日と収録作品のCD発売日は別々に表示します。'
                : '2015年から2026年4月「スターダスト」までに発表された楽曲から90曲を紹介。インスト曲と同じ曲の別バージョンは掲載対象を絞っています。'}
            </p>
          </div>

          <div
            role="group"
            aria-label="楽曲ガイド・音域一覧・聖地マップの切り替え"
            className="grid grid-cols-3 items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 border border-[#E6E1D6] w-full lg:w-auto shrink-0"
          >
            <button
              type="button"

              aria-pressed={activeSubView === 'discography'}
              onClick={() => (window.location.hash = 'discography')}
              className={`inline-flex items-center justify-center gap-1 rounded-md px-2 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold transition-colors min-h-[40px] cursor-pointer min-w-0 ${
                activeSubView === 'discography'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Disc className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" />
              <span className="min-w-0 wrap-anywhere whitespace-normal">楽曲ガイド</span>
            </button>
            <button
              type="button"

              aria-pressed={activeSubView === 'vocal_range'}
              onClick={() => (window.location.hash = 'vocal_range')}
              className={`inline-flex items-center justify-center gap-1 rounded-md px-2 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold transition-colors min-h-[40px] cursor-pointer min-w-0 ${
                activeSubView === 'vocal_range'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Mic2 className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" />
              <span className="min-w-0 wrap-anywhere whitespace-normal">音域・発売日表</span>
            </button>
            <button
              type="button"

              aria-pressed={activeSubView === 'sacred_map'}
              onClick={() => (window.location.hash = 'sacred_map')}
              className={`inline-flex items-center justify-center gap-1 rounded-md px-2 sm:px-3.5 py-2 text-[11px] sm:text-xs font-bold transition-colors min-h-[40px] cursor-pointer min-w-0 ${
                activeSubView === 'sacred_map'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0 hidden sm:inline-block" />
              <span className="min-w-0 wrap-anywhere whitespace-normal">聖地マップ</span>
            </button>
          </div>
        </div>

        {activeSubView !== 'sacred_map' && (
          <SongGuideFilters values={filters} onChange={setFilters}
            resultCount={filteredSongs.length} shownCount={displayedSongs.length}
            showSort={activeSubView === 'vocal_range'} />
        )}

        {activeSubView === 'vocal_range' && (
          <div className="mt-3 rounded-xl border border-[#D9CDBD] bg-[#FFFAF2] p-4">
            <h3 className="text-sm font-bold text-[#1C1917]">自分の声の範囲で探す</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E]">出せる低い音と高い音を選ぶと、地声の音域が範囲に収まる曲を探せます。裏声や息継ぎは含まない、選曲の目安です。表に表示する音域は原曲キーの値です。</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-bold text-[#57534E]">出せる低い音
                <select value={voiceLow} onChange={event => setVoiceLow(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#D5CEC2] bg-white px-3 text-sm text-[#1C1917]">
                  <option value="">指定しない</option>{VOICE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-[#57534E]">出せる高い音
                <select value={voiceHigh} onChange={event => setVoiceHigh(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-[#D5CEC2] bg-white px-3 text-sm text-[#1C1917]">
                  <option value="">指定しない</option>{VOICE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold text-[#57534E]">カラオケのキー
                <select value={keyShift} onChange={event => setKeyShift(Number(event.target.value))} className="mt-1 min-h-11 w-full rounded-lg border border-[#D5CEC2] bg-white px-3 text-sm text-[#1C1917]">
                  {Array.from({ length: 25 }, (_, index) => index - 12).map(value => <option key={value} value={value}>{value === 0 ? '原曲キー' : value > 0 ? `+${value}` : value}</option>)}
                </select>
              </label>
            </div>
            {voiceRangeInvalid && <p role="alert" className="mt-2 text-sm text-[#A3291C]">高い音には、低い音以上の高さを選んでください。</p>}
            {(voiceLow || voiceHigh || keyShift !== 0) && <button type="button" onClick={() => { setVoiceLow(''); setVoiceHigh(''); setKeyShift(0); }} className="mt-3 min-h-10 text-xs font-bold text-[#A3291C] underline">声の範囲とキーをリセット</button>}
          </div>
        )}

        {activeSubView !== 'sacred_map' && epCoverage && (
          <p className="mt-3 rounded-lg border border-[#E6E1D6] bg-white p-3 text-sm text-[#57534E]">
            {epCoverage.note} <a className="underline" href={epCoverage.source} target="_blank" rel="noreferrer">公式の収録曲 ↗</a>
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
                        className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5 transition-colors hover:border-[#1C1917]"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            {isSafeAssetUrl(song.jacketImage) && (
                              pagePath ? (
                                <a href={`${import.meta.env.BASE_URL}${pagePath}`} onClick={rememberGuide}
                                  aria-label={`${song.title}のページを見る`}
                                  className="shrink-0 rounded-lg hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]">
                                  <GuideArtwork src={song.jacketImage} alt="" referrerPolicy="no-referrer"
                                    className="h-14 w-14 rounded-lg object-cover ring-1 ring-black/10" />
                                </a>
                              ) : (
                                <button type="button" onClick={() => onSelectSong(song)}
                                  aria-label={`${song.title}の音域・解説を見る`}
                                  className="shrink-0 rounded-lg hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]">
                                  <GuideArtwork src={song.jacketImage} alt="" referrerPolicy="no-referrer"
                                    className="h-14 w-14 rounded-lg object-cover ring-1 ring-black/10" />
                                </button>
                              )
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] font-mono-num">
                                <span className="min-w-0 wrap-anywhere whitespace-normal">{albumBadgeText}</span>
                                <span className="shrink-0">配信掲載 {song.releaseDate}</span>
                              </div>
                              <h3 className="mt-0.5 text-base sm:text-lg font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                                {pagePath ? (
                                  <a href={`${import.meta.env.BASE_URL}${pagePath}`} onClick={rememberGuide}
                                    className="rounded-sm underline decoration-[#B9AEA0] underline-offset-4 hover:decoration-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]">{song.title}</a>
                                ) : (
                                  <button type="button" onClick={() => onSelectSong(song)}
                                    className="rounded-sm text-left underline decoration-[#B9AEA0] underline-offset-4 hover:decoration-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]">{song.title}</button>
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
                          <div className="mt-3 rounded-lg bg-[#FBF9F5] border border-[#E6E1D6] px-3 py-2 text-[11px]">
                            <div className="flex flex-wrap items-center justify-between gap-1 font-mono-num">
                              <span className="text-[#57534E]">
                                最低 <strong className="text-[#1E3A5F]">{song.vocalRange.lowestNote}</strong>
                              </span>
                              <span className="text-[#57534E]">
                                地声最高 <strong className="text-[#C83E2B]">{song.vocalRange.highestChestNote}</strong>
                              </span>
                              <span className="text-[#57534E]">
                                裏声 <strong className="text-[#B45309]">{song.vocalRange.highestFalsettoNote}</strong>
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

                        <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                          {pagePath ? (
                            <a
                              href={`${import.meta.env.BASE_URL}${pagePath}`}
                              onClick={rememberGuide}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                              曲のページを見る
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectSong(song)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                              音域・解説を見る
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onAddToSetlist(song.id)}
                            disabled={inSetlist}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                              inSetlist
                                ? 'bg-[#1C1917] text-white'
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
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 rounded-xl border border-[#E6E1D6] bg-white p-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C83E2B] transition-colors cursor-pointer min-h-[42px]"
                    >
                      <ChevronDown className="h-4 w-4" />
                      さらに{Math.min(24, filteredSongs.length - visibleCount)}曲を表示（残り {filteredSongs.length - visibleCount} 曲）
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredSongs.length)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] transition-colors cursor-pointer min-h-[42px]"
                    >
                      全 {filteredSongs.length} 曲をすべて表示
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Sub-View 2: Vocal Range & Release Date Comparison (Mobile Vertical Cards + Desktop Sticky Table) */}
        {activeSubView === 'vocal_range' && (
          <div className="mt-4 space-y-4">
            <p className="rounded-xl bg-white p-4 text-sm">「配信掲載日」はApple Musicの楽曲欄の日付です。CD欄は表示中の収録作品の発売日です。裏声の「記載なし」は採譜資料に値がないことを示します。BPMは小数を四捨五入した目安です。各曲名から資料間の違いも確認できます。</p>
            {filteredSongs.length === 0 ? emptyResults : (
              <>
                <div className="hidden overflow-x-auto rounded-xl border border-[#E6E1D6] bg-white lg:block" role="region" aria-label="音域・発売日比較表" tabIndex={0}>
                  <table className="w-full min-w-[960px] border-collapse text-left text-[13px] leading-5">
                    <caption className="sr-only">音域・発売日比較表。日付と音域の出典は各行から開けます。</caption>
                    <thead className="bg-[#F2EFE9] text-xs text-[#57534E]">
                      <tr>
                        <th scope="col" className="px-3 py-3">曲名</th>
                        <th scope="col" className="px-3 py-3">収録作品</th>
                        <th scope="col" className="px-2 py-3">時間</th>
                        <th scope="col" className="px-2 py-3">BPM</th>
                        <th scope="col" className="px-2 py-3">地声最低</th>
                        <th scope="col" className="px-2 py-3">地声最高</th>
                        <th scope="col" className="px-2 py-3">裏声最高</th>
                        <th scope="col" className="px-2 py-3">配信掲載日</th>
                        <th scope="col" className="px-2 py-3">収録作品CD</th>
                        <th scope="col" className="px-3 py-3">音域出典</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E1D6]">
                      {displayedSongs.map(song => {
                        const f = songEvidence[song.id as keyof typeof songEvidence];
                        return <tr key={song.id} className="align-top hover:bg-[#FBF9F5]">
                          <th scope="row" className="min-w-[145px] px-3 py-3 font-bold">
                            <button className="text-left underline underline-offset-2 hover:text-[#C83E2B]" onClick={() => {
                              if (songPagePath(song.id)) rememberGuide();
                              onSelectSong(song);
                            }}>{song.title}</button>
                          </th>
                          <td className="min-w-[120px] px-3 py-3">{f.album}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatDuration(song.durationSec)}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatSongBpm(song.id, song.bpm)}</td>
                          <td className="px-2 py-3 font-mono-num">{song.vocalRange.lowestNote}</td>
                          <td className="px-2 py-3 font-mono-num">{song.vocalRange.highestChestNote}</td>
                          <td className="px-2 py-3 font-mono-num">{song.vocalRange.highestFalsettoNote}</td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num"><a className="underline underline-offset-2" target="_blank" rel="noreferrer" href={f.apple}>{f.release}</a></td>
                          <td className="whitespace-nowrap px-2 py-3 font-mono-num">{f.cd ? <a className="underline underline-offset-2" target="_blank" rel="noreferrer" href={f.cdSource}>{f.cd}</a> : '—'}</td>
                          <td className="whitespace-nowrap px-3 py-3"><a className="underline underline-offset-2" href={f.rangeSource} target="_blank" rel="noreferrer" aria-label={`${song.title}の採譜：${f.rangeLabel}`}>採譜 ↗</a></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:hidden">
                  {displayedSongs.map(song => {
                    const f = songEvidence[song.id as keyof typeof songEvidence];
                    return <article key={song.id} className="rounded-xl border border-[#E6E1D6] bg-white p-3.5 text-sm">
                      <button className="text-left font-bold underline underline-offset-2" onClick={() => {
                        if (songPagePath(song.id)) rememberGuide();
                        onSelectSong(song);
                      }}>{song.title}</button>
                      <p className="mt-1 text-xs text-[#57534E]">{f.album} ／ {formatDuration(song.durationSec)} ／ BPM {formatSongBpm(song.id, song.bpm)}</p>
                      <dl className="mt-2 grid grid-cols-3 gap-1 border-y border-[#E6E1D6] py-2 text-xs">
                        <div><dt className="text-[#57534E]">地声最低</dt><dd className="mt-0.5 font-mono-num font-bold">{song.vocalRange.lowestNote}</dd></div>
                        <div><dt className="text-[#57534E]">地声最高</dt><dd className="mt-0.5 font-mono-num font-bold">{song.vocalRange.highestChestNote}</dd></div>
                        <div><dt className="text-[#57534E]">裏声最高</dt><dd className="mt-0.5 font-mono-num font-bold">{song.vocalRange.highestFalsettoNote}</dd></div>
                      </dl>
                      <p className="mt-2 text-xs leading-5">配信掲載日 <a className="underline" target="_blank" rel="noreferrer" href={f.apple}>{f.release}</a>
                      {f.cd && <> ／ 収録作品CD <a className="underline" target="_blank" rel="noreferrer" href={f.cdSource}>{f.cd}</a></>}</p>
                      <a className="text-xs underline" href={f.rangeSource} target="_blank" rel="noreferrer">採譜：{f.rangeLabel} ↗</a>
                    </article>})}
                </div>
                {/* Progressive Pagination Controls */}
                {filteredSongs.length > visibleCount && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 rounded-xl border border-[#E6E1D6] bg-white p-4">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 24)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C83E2B] transition-colors cursor-pointer min-h-[42px]"
                    >
                      <ChevronDown className="h-4 w-4" />
                      さらに{Math.min(24, filteredSongs.length - visibleCount)}曲を表示（残り {filteredSongs.length - visibleCount} 曲）
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredSongs.length)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] transition-colors cursor-pointer min-h-[42px]"
                    >
                      全 {filteredSongs.length} 曲をすべて表示
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Sub-View 3: Sacred Spots Map & Pilgrimage Guide */}
        {activeSubView === 'sacred_map' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-4">
                {isSafeAssetUrl(MATSUE_IMAGE_PATH) && (
                  <GuideArtwork
                    src={MATSUE_IMAGE_PATH}
                    alt="宍道湖の夕景をイメージした図柄"
                    referrerPolicy="no-referrer"
                    className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                  />
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">
                    ヒゲダンとつながる場所へ
                  </h3>
                  <p className="mt-0.5 text-xs text-[#57534E]">
                    思い出の街から、あのMVの景色まで。訪れた場所にはチェックを残せます。
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 lg:justify-end" role="group" aria-label="場所とのつながりで絞り込む">
                {SPOT_CATEGORIES.map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selectedSpotCategory === category}
                      onClick={() => setSelectedSpotCategory(category)}
                      className={`min-h-[44px] rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                        selectedSpotCategory === category
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                          : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {category === 'all' ? 'すべて' : category}
                    </button>
                  )
                )}
              </div>
            </div>

            {mapSpot && <section className="rounded-xl border bg-white p-4">
              <label className="font-bold" htmlFor="map-place">地図で見る場所</label>
              <select id="map-place" className="mx-2 min-h-[44px] max-w-full border p-2" value={mapSpot.id} onChange={e=>setMapSpotId(e.target.value)}>
                {mapSpots.map(s=><option key={s.id} value={s.id}>{s.name}{s.mapScope === 'area' ? '（エリアの目安）' : ''}</option>)}
              </select>
              {mapSpot.mapScope === 'area' && <p className="mt-2 text-xs leading-relaxed text-[#57534E]">地図は周辺エリアの目安で、具体的な撮影地点を示すものではありません。</p>}
              <iframe className="mt-3 w-full rounded-xl border" height="280" title={mapSpot.name+'の地図'} loading="lazy" src={'https://maps.google.com/maps?output=embed&q='+mapQuery}></iframe>
              <a className="underline text-sm" href={'https://www.google.com/maps/search/?api=1&query='+mapQuery} target="_blank" rel="noreferrer">Google マップで開く・経路検索 ↗</a>
            </section>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSpots.map((spot) => {
                const visited = visitedSpotIds.includes(spot.id);
                return (
                  <article
                    key={spot.id}
                    className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-[#78716C]">
                        <span className="font-bold text-[#C83E2B] shrink-0 whitespace-nowrap">
                          {spot.area}
                        </span>
                        {spot.relatedSong && <span className="min-w-0 wrap-anywhere whitespace-normal">{spot.relatedSongLabel ?? '散策のお供に（作成者の選曲）'}: {spot.relatedSong}</span>}
                      </div>
                      <h4 className="mt-1.5 text-base font-bold text-[#1C1917]">
                        {spot.name}
                      </h4>
                      <p className="mt-1 text-xs font-bold text-[#1E3A5F]">{spot.categoryLabel ?? spot.categories.join(' / ')}</p>
                      <p className="mt-2 text-xs text-[#57534E] leading-relaxed">
                        {spot.description}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-[#E6E1D6] text-xs text-[#57534E] leading-relaxed">
                        <strong className="text-[#1C1917]">スポットメモ：</strong>
                        {spot.fanTip}
                        <div className="mt-2 flex flex-wrap gap-3">
                          {spot.mapScope !== 'none' && <button type="button" className="underline" onClick={()=>{setMapSpotId(spot.id); document.getElementById('map-place')?.focus();}}>{spot.mapScope === 'area' ? 'エリアを地図で見る' : '地図で見る'}</button>}
                          <a className="underline" href={spot.source} target="_blank" rel="noreferrer">場所・作品の情報 ↗</a>
                          {spot.historySource && <a className="underline" href={spot.historySource} target="_blank" rel="noreferrer">{spot.historySourceLabel ?? 'つながりの出典'} ↗</a>}
                          {spot.additionalSources?.map(source => <a key={source.url} className="underline" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                      <span className="text-[11px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
                        {spot.addressHint}
                      </span>
                      {spot.mapScope !== 'none' && <button
                        type="button"
                        onClick={() => onToggleVisitedSpot(spot.id)}
                        aria-pressed={visited}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          visited
                            ? 'bg-[#15803D] text-white'
                            : 'border border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {visited ? '訪問済み' : spot.mapScope === 'area' ? 'エリアに行った！' : '行った！を記録'}
                      </button>}
                    </div>
                  </article>
                );
              })}
            </div>
            {filteredHistoricalSpots.length > 0 && (
              <section aria-labelledby="historical-spots-heading" className="rounded-xl border border-[#E6E1D6] bg-[#F8F6F1] p-4 sm:p-5">
                <h3 id="historical-spots-heading" className="text-base font-bold text-[#1C1917]">以前の場所・移転の記録</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                  移転や閉店などで、当時とは場所や形が変わったスポットの記録です。
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredHistoricalSpots.map(spot => (
                    <article key={spot.id} className="rounded-xl border border-[#E6E1D6] bg-white p-5">
                      <p className="text-xs font-bold text-[#C83E2B]">{spot.area} <span className="ml-2 text-[#57534E]">{spot.status}</span></p>
                      <h4 className="mt-1.5 text-base font-bold text-[#1C1917]">{spot.name}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-[#57534E]">{spot.description}</p>
                      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#E6E1D6] pt-3 text-xs">
                        {spot.sources.map(source => (
                          <a key={source.url} className="underline" href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
