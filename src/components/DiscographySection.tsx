import { GuideArtwork } from './GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  BookOpen,
  MapPin,
  Plus,
  Check,
  Disc,
  Compass,
  X,
  ArrowUpDown,
  Mic2,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import {
  EraTag,
  SACRED_SPOTS,
  SacredSpot,
  SongItem,
  SoundTag,
  MATSUE_IMAGE_PATH,
} from '../data/higedanData';
import {
  DiscographySortOption,
  EP_TRACK_ORDER_MAP,
  filterAndSortDiscography,
  formatDuration,
  getSongwriterCredit,
  isSafeAssetUrl,
  sanitizeUserText,
  SOUND_LABELS,
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

const ERA_TABS: { id: EraTag | 'all'; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'すべて（全86曲）', shortLabel: '全86曲' },
  { id: 'indies_escaparade', label: '初期〜エスカパレード', shortLabel: '初期〜エスカパレード' },
  { id: 'traveler', label: 'Traveler期', shortLabel: 'Traveler期' },
  { id: 'editorial', label: 'Editorial期', shortLabel: 'Editorial期' },
  { id: 'rejoice', label: 'Rejoice期', shortLabel: 'Rejoice期' },
  { id: 'latest_2025_2026', label: '2024–2025最新曲', shortLabel: '最新シングル' },
];

const ALBUM_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'すべての収録アルバム・EP（全86曲）' },
  { id: 'ラブとピースは君の中', label: '1st Mini『ラブとピースは君の中』(2015・全8曲)' },
  { id: 'MAN IN THE MIRROR', label: '2nd Mini『MAN IN THE MIRROR』(2016・全6曲)' },
  { id: "What's Going On? EP", label: "1st EP『What's Going On?』(2016・全4曲)" },
  { id: 'レポート', label: '3rd Mini『レポート』(2017・全7曲)' },
  { id: 'エスカパレード', label: '1st Full『エスカパレード』(2018・全13曲)' },
  { id: 'Stand By You EP', label: '2nd EP『Stand By You EP』(2018・3曲)' },
  { id: 'Traveler', label: 'Major 1st『Traveler』(2019・ボーカル13曲)' },
  { id: 'HELLO EP', label: '3rd EP『HELLO EP』(2020・全4曲)' },
  { id: 'Editorial', label: 'Major 2nd『Editorial』(2021・全14曲)' },
  { id: 'ミックスナッツ EP', label: '4th EP『ミックスナッツ EP』(2022・全4曲)' },
  { id: 'Rejoice', label: 'Major 3rd『Rejoice』(2024・ボーカル15曲)' },
  { id: 'Single / 2024-2026 Collection', label: '2024–2025 最新配信シングル群' },
];

const SOUND_FILTERS: { id: SoundTag | 'all'; label: string }[] = [
  { id: 'all', label: 'すべてのおすすめ分類' },
  { id: 'piano_pop', label: '王道ピアノポップ' },
  { id: 'brass_funk', label: 'ブラス＆ファンク' },
  { id: 'emotional_ballad', label: 'バラード' },
  { id: 'stadium_rock', label: 'スタジアムロック' },
];

const SORT_OPTIONS: { id: DiscographySortOption; label: string }[] = [
  { id: 'guide_order', label: '並び順：代表曲→アルバム順（ガイド順）' },
  { id: 'album_track_order', label: '並び順：アルバム収録曲順（M1〜最終曲）' },
  { id: 'release_oldest', label: '並び順：配信掲載日が古い順（2015年初期〜）' },
  { id: 'newest', label: '並び順：配信掲載日が新しい順（最新曲〜）' },
  { id: 'highest_note', label: '並び順：地声最高音が高い順' },
  { id: 'vocal_span', label: '並び順：音域が広い順（半音幅）' },
  { id: 'popular', label: '並び順：人気投票順' },
  { id: 'bpm', label: '並び順：テンポ（BPM）が速い順' },
];

const INITIAL_VISIBLE_COUNT = 18;

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
  const [eraFilter, setEraFilter] = useState<EraTag | 'all'>(initialEraFilter);
  const [albumFilter, setAlbumFilter] = useState<string>('all');
  const [soundFilter, setSoundFilter] = useState<SoundTag | 'all'>('all');
  const [sortBy, setSortBy] = useState<DiscographySortOption>('guide_order');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<SacredSpot['area'] | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    setEraFilter(initialEraFilter);
  }, [initialEraFilter]);

  // Reset pagination whenever filters or sub-view change
  useEffect(() => {
    setVisibleCount(
      albumFilter !== 'all' || searchQuery.trim().length > 0 ? 100 : INITIAL_VISIBLE_COUNT
    );
  }, [eraFilter, albumFilter, soundFilter, searchQuery, sortBy, activeSubView]);

  const filteredSongs = useMemo(
    () =>
      filterAndSortDiscography(songs, {
        era: eraFilter,
        album: albumFilter,
        sound: soundFilter,
        searchQuery,
        sortBy,
      }),
    [songs, eraFilter, albumFilter, soundFilter, searchQuery, sortBy]
  );

  const displayedSongs = useMemo(
    () => filteredSongs.slice(0, visibleCount),
    [filteredSongs, visibleCount]
  );

  const filteredSpots = useMemo(
    () =>
      selectedArea === 'all'
        ? SACRED_SPOTS
        : SACRED_SPOTS.filter((s) => s.area === selectedArea),
    [selectedArea]
  );

  const [mapSpotId, setMapSpotId] = useState('');
  const mapSpot = filteredSpots.find(s => s.id === mapSpotId) ?? filteredSpots[0];
  const mapQuery = encodeURIComponent(mapSpot.name + ' ' + mapSpot.addressHint);
  const hasActiveFilter =
    eraFilter !== 'all' ||
    albumFilter !== 'all' ||
    soundFilter !== 'all' ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'guide_order';

  const handleResetFilters = () => {
    setEraFilter('all');
    setAlbumFilter('all');
    setSoundFilter('all');
    setSearchQuery('');
    setSortBy('guide_order');
  };

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
                ? '聖地巡礼マップ（松江・米子・横浜）'
                : activeSubView === 'vocal_range'
                ? '掲載86曲の音域・発売日一覧'
                : '全86曲 楽曲ガイド（収録曲順・音域・曲調）'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubView === 'sacred_map'
                ? '結成の地・山陰（松江・米子）から記念すべきスタジアム会場まで、ゆかりの聖地スポット案内です。'
                : activeSubView === 'vocal_range'
                ? '地声・裏声は曲別の採譜による値です。配信サービス掲載日と収録作品のCD発売日は別々に表示します。'
                : '当ガイドが取り上げる86曲。アルバム別の曲順（M1〜）や発売順、地声最高音順で自在に探せます。'}
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
              <span className="truncate">楽曲ガイド</span>
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
              <span className="truncate">音域・発売日表</span>
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
              <span className="truncate">聖地マップ</span>
            </button>
          </div>
        </div>

        {/* Streamlined Filter, Sort & Search Bar (Compact on Mobile & Desktop) */}
        {activeSubView !== 'sacred_map' && (
          <div className="mt-4 space-y-2.5 rounded-xl border border-[#E6E1D6] bg-white p-3 sm:p-4">
            {/* Row 1: Era Quick Tabs + Result Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1">
                {ERA_TABS.map((tab) => {
                  const active = eraFilter === tab.id && albumFilter === 'all';
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setEraFilter(tab.id);
                        setAlbumFilter('all');
                      }}
                      className={`rounded-md px-2.5 py-1.5 text-[11px] sm:text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#1C1917] text-[#FBF9F5]'
                          : 'bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      <span className="sm:hidden">{tab.shortLabel}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C83E2B] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    条件リセット
                  </button>
                )}
                <span className="text-xs font-mono-num font-bold text-[#1C1917]">
                  該当：{filteredSongs.length} 曲
                </span>
              </div>
            </div>

            {/* Row 2: Search Input + Album Select + Sort Select + Sound Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 pt-2 border-t border-[#E6E1D6]">
              {/* Search Box (4 cols on desktop) */}
              <div className="relative lg:col-span-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
                <label htmlFor="discography-search" className="sr-only">
                  曲名や音域・アルバム名で検索
                </label>
                <input
                  id="discography-search"
                  type="text"
                  maxLength={60}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.slice(0, 60))}
                  placeholder="曲名・最高音(hiD#等)・タイアップ検索..."
                  className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-8 pr-7 py-2 text-xs text-[#1C1917] min-h-[38px] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="検索キーワードをクリア"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Album / EP Filter (4 cols on desktop) */}
              <div className="lg:col-span-4">
                <label className="sr-only" htmlFor="album-filter-select">
                  収録アルバム・EPで絞り込み
                </label>
                <select
                  id="album-filter-select"
                  value={albumFilter}
                  onChange={(e) => {
                    const nextAlbum = e.target.value;
                    setAlbumFilter(nextAlbum);
                    if (nextAlbum !== 'all') {
                      setEraFilter('all');
                      setSortBy('album_track_order');
                    }
                  }}
                  className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-2 text-xs font-bold text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                >
                  {ALBUM_FILTERS.map((af) => (
                    <option key={af.id} value={af.id}>
                      {af.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Select (3 cols on desktop) */}
              <div className="relative flex items-center lg:col-span-3">
                <ArrowUpDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[#78716C]" />
                <label className="sr-only" htmlFor="discography-sort-select">
                  楽曲の並び替え
                </label>
                <select
                  id="discography-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as DiscographySortOption)}
                  className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-7 pr-2.5 py-2 text-xs font-bold text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sound Type Filter (2 cols on desktop) */}
              <div className="lg:col-span-2">
                <label className="sr-only" htmlFor="sound-filter-select">
                  おすすめ分類（編集部）
                </label>
                <select
                  id="sound-filter-select"
                  value={soundFilter}
                  onChange={(e) => setSoundFilter(e.target.value as SoundTag | 'all')}
                  className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-2 text-xs font-medium text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                >
                  {SOUND_FILTERS.map((sf) => (
                    <option key={sf.id} value={sf.id}>
                      {sf.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Sub-View 1: Song Guide Cards */}
        {activeSubView === 'discography' && (
          <div>
            {filteredSongs.length === 0 ? (
              <div className="mt-4 rounded-xl border border-[#E6E1D6] bg-white p-8 text-center">
                <p className="text-sm font-bold text-[#1C1917]">
                  条件に一致する楽曲が見つかりませんでした。
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  絞り込みをリセット
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedSongs.map((song) => {
                    const inSetlist = setlistSongIds.includes(song.id);
                    const albumBadgeText = EP_TRACK_ORDER_MAP[albumFilter]?.[song.id]
                      ? `${albumFilter} (M${EP_TRACK_ORDER_MAP[albumFilter][song.id]})`
                      : `${song.album}${song.trackNumber ? ` (M${song.trackNumber})` : ''}`;

                    return (
                      <article
                        key={song.id}
                        className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5 transition-colors hover:border-[#1C1917]"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            {isSafeAssetUrl(song.jacketImage) && (
                              <GuideArtwork
                                src={song.jacketImage}
                                alt={`${song.title} のイメージ画像`}
                                referrerPolicy="no-referrer"
                                className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] font-mono-num">
                                <span className="truncate">{albumBadgeText}</span>
                                <span className="shrink-0">{song.releaseDate}</span>
                              </div>
                              <h3 className="mt-0.5 text-base sm:text-lg font-bold text-[#1C1917] truncate">
                                {song.title}
                              </h3>
                              <p className="text-xs text-[#57534E] truncate">
                                {songEvidence[song.id as keyof typeof songEvidence].recording}
                              </p>
                            </div>
                          </div>

                          <p className="mt-3 text-xs leading-relaxed text-[#57534E] line-clamp-2">
                            {song.linerNotes}
                          </p>

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
                            <a className="mt-1 block underline" target="_blank" rel="noreferrer" href={songEvidence[song.id as keyof typeof songEvidence].rangeSource}>この曲の採譜を見る ↗</a>
                          </div>

                          {/* Clean Unboxed Metadata Line */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#78716C]">
                            <span>収録音源 {formatDuration(song.durationSec)}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">BPM {song.bpm}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-num">
                              配信サービス掲載日
                            </span>
                          </div>
                        </div>

                        <div className="mt-3.5 flex items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                          <button
                            type="button"
                            onClick={() => onSelectSong(song)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                            音域・解説を見る
                          </button>
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
                                セトリへ
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
                      さらに24曲を表示（残り {filteredSongs.length - visibleCount} 曲）
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
            <p className="rounded-xl bg-white p-4 text-sm">「配信掲載日」はApple Musicの楽曲欄の日付です。CD欄は表示中の収録作品の発売日です。裏声の「記載なし」は採譜資料に値がないことを示します。各曲名から資料間の違いも確認できます。</p>
            {filteredSongs.length === 0 ? <p>条件に一致する曲はありません。</p> : (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {displayedSongs.map(song => {
                    const f = songEvidence[song.id as keyof typeof songEvidence];
                    return <article key={song.id} className="rounded-xl border border-[#E6E1D6] bg-white p-4 text-sm">
                      <button className="text-left font-bold underline" onClick={()=>onSelectSong(song)}>{song.title}</button>
                      <p className="my-1 text-xs">{f.album} ／ {formatDuration(song.durationSec)}</p>
                      <p>地声 {song.vocalRange.lowestNote} ～ {song.vocalRange.highestChestNote} ／ 裏声最高 {song.vocalRange.highestFalsettoNote}</p>
                      <p>配信掲載日 <a className="underline" target="_blank" rel="noreferrer" href={f.apple}>{f.release}</a>
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
                      さらに24曲を表示（残り {filteredSongs.length - visibleCount} 曲）
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
                    山陰（松江・米子）から横浜のライブ会場まで
                  </h3>
                  <p className="mt-0.5 text-xs text-[#57534E]">
                    バンド結成の地や聖地ライブ会場のガイドです。行ったことのある場所にチェックを残せます。
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 shrink-0">
                {(['all', '島根・松江', '鳥取・米子', '横浜・スタジアム'] as const).map(
                  (area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedArea(area)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                        selectedArea === area
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                          : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {area === 'all' ? 'すべてのエリア' : area}
                    </button>
                  )
                )}
              </div>
            </div>

            <section className="rounded-xl border bg-white p-4">
              <label className="font-bold" htmlFor="map-place">地図で見る場所</label>
              <select id="map-place" className="mx-2 max-w-full border p-2" value={mapSpot.id} onChange={e=>setMapSpotId(e.target.value)}>
                {filteredSpots.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <iframe className="mt-3 w-full rounded-xl border" height="280" title={mapSpot.name+'の地図'} loading="lazy" src={'https://maps.google.com/maps?output=embed&q='+mapQuery}></iframe>
              <a className="underline text-sm" href={'https://www.google.com/maps/search/?api=1&query='+mapQuery} target="_blank" rel="noreferrer">Google マップで開く・経路検索 ↗</a>
            </section>
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
                        <span className="truncate">散策のお供に（編集部選曲）: {spot.relatedSong}</span>
                      </div>
                      <h4 className="mt-1.5 text-base font-bold text-[#1C1917]">
                        {spot.name}
                      </h4>
                      <p className="mt-2 text-xs text-[#57534E] leading-relaxed">
                        {spot.description}
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-[#E6E1D6] text-xs text-[#57534E] leading-relaxed">
                        <strong className="text-[#1C1917]">スポットメモ：</strong>
                        {spot.fanTip}
                        <div className="mt-2 flex flex-wrap gap-3">
                          <button className="underline" onClick={()=>{setMapSpotId(spot.id); document.getElementById('map-place')?.focus();}}>地図で見る</button>
                          <a className="underline" href={spot.source} target="_blank" rel="noreferrer">施設・観光案内 ↗</a>
                          {spot.historySource && <a className="underline" href={spot.historySource} target="_blank" rel="noreferrer">公演・結成の資料 ↗</a>}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                      <span className="text-[11px] text-[#78716C] truncate">
                        {spot.addressHint}
                      </span>
                      <button
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
                        {visited ? '訪問済み' : '行った！を記録'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
