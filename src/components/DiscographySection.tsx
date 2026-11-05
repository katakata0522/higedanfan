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
  filterAndSortDiscography,
  formatDuration,
  isSafeAssetUrl,
  sanitizeUserText,
  SOUND_LABELS,
} from '../utils/fanLogic';

interface DiscographySectionProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
  visitedSpotIds: string[];
  onToggleVisitedSpot: (spotId: string) => void;
  initialSubView?: 'discography' | 'sacred_map';
  initialEraFilter?: EraTag | 'all';
}

const ERA_TABS: { id: EraTag | 'all'; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'indies_escaparade', label: '初期〜Escaparade' },
  { id: 'traveler', label: 'Traveler期' },
  { id: 'editorial', label: 'Editorial期' },
  { id: 'rejoice', label: 'Rejoice期' },
  { id: 'latest_2025_2026', label: '2024–2026最新曲' },
];

const SOUND_FILTERS: { id: SoundTag | 'all'; label: string }[] = [
  { id: 'all', label: 'すべての曲調' },
  { id: 'piano_pop', label: '王道ピアノポップ' },
  { id: 'brass_funk', label: 'ブラス＆ファンク' },
  { id: 'emotional_ballad', label: 'バラード' },
  { id: 'stadium_rock', label: 'スタジアムロック' },
];

const SORT_OPTIONS: { id: DiscographySortOption; label: string }[] = [
  { id: 'popular', label: '並び順：人気投票順' },
  { id: 'newest', label: '並び順：リリースが新しい順' },
  { id: 'keyChanges', label: '並び順：転調回数が多い順' },
  { id: 'bpm', label: '並び順：テンポ（BPM）が速い順' },
];

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
  const [activeSubView, setActiveSubView] = useState<'discography' | 'sacred_map'>(
    initialSubView
  );
  const [eraFilter, setEraFilter] = useState<EraTag | 'all'>(initialEraFilter);
  const [soundFilter, setSoundFilter] = useState<SoundTag | 'all'>('all');
  const [sortBy, setSortBy] = useState<DiscographySortOption>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<SacredSpot['area'] | 'all'>('all');

  useEffect(() => {
    setActiveSubView(initialSubView);
  }, [initialSubView]);

  useEffect(() => {
    setEraFilter(initialEraFilter);
  }, [initialEraFilter]);

  const filteredSongs = useMemo(
    () =>
      filterAndSortDiscography(songs, {
        era: eraFilter,
        sound: soundFilter,
        searchQuery,
        sortBy,
      }),
    [songs, eraFilter, soundFilter, searchQuery, sortBy]
  );

  const filteredSpots = useMemo(
    () =>
      selectedArea === 'all'
        ? SACRED_SPOTS
        : SACRED_SPOTS.filter((s) => s.area === selectedArea),
    [selectedArea]
  );

  return (
    <section
      id="section-discography"
      aria-labelledby="discography-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header & Sub-View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="discography-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              {activeSubView === 'sacred_map'
                ? '聖地巡礼マップ（松江・米子・横浜）'
                : '楽曲ガイド（時代別・転調・曲調検索）'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubView === 'sacred_map'
                ? 'バンド結成の地・山陰（松江・米子）から記念すべきスタジアム会場まで、ゆかりの聖地スポット案内です。'
                : '代表曲からアルバム曲まで、時代・曲調・転調回数・BPMで自由に並び替えてライナーノーツを読めます。'}
            </p>
          </div>

          <div
            role="tablist"
            aria-label="楽曲ガイドと聖地マップの切り替え"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 border border-[#E6E1D6] w-full sm:w-auto shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeSubView === 'discography'}
              onClick={() => setActiveSubView('discography')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubView === 'discography'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Disc className="h-3.5 w-3.5 shrink-0" />
              楽曲ガイド
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeSubView === 'sacred_map'}
              onClick={() => setActiveSubView('sacred_map')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubView === 'sacred_map'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              聖地巡礼マップ
            </button>
          </div>
        </div>

        {activeSubView === 'discography' ? (
          <div>
            {/* Filter, Sort & Search Bar */}
            <div className="mt-5 space-y-3 rounded-xl border border-[#E6E1D6] bg-white p-3.5 sm:p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {ERA_TABS.map((tab) => {
                  const active = eraFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setEraFilter(tab.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#1C1917] text-[#FBF9F5]'
                          : 'bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 pt-2.5 border-t border-[#E6E1D6]">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div>
                    <label className="sr-only" htmlFor="sound-filter-select">
                      曲調フィルター
                    </label>
                    <select
                      id="sound-filter-select"
                      value={soundFilter}
                      onChange={(e) => setSoundFilter(e.target.value as SoundTag | 'all')}
                      className="w-full sm:w-auto rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-medium text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    >
                      {SOUND_FILTERS.map((sf) => (
                        <option key={sf.id} value={sf.id}>
                          {sf.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex items-center">
                    <ArrowUpDown className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[#78716C]" />
                    <label className="sr-only" htmlFor="discography-sort-select">
                      楽曲の並び替え
                    </label>
                    <select
                      id="discography-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as DiscographySortOption)}
                      className="w-full sm:w-auto rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-8 pr-3 py-2 text-xs font-bold text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative flex-1 md:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
                  <label htmlFor="discography-search" className="sr-only">
                    曲名や歌詞フレーズで検索
                  </label>
                  <input
                    id="discography-search"
                    type="text"
                    maxLength={60}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(sanitizeUserText(e.target.value, 60))}
                    placeholder="曲名・タイアップ・歌詞で検索..."
                    className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-9 pr-8 py-2 text-xs text-[#1C1917] min-h-[38px] placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="検索キーワードをクリア"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Song Catalog Grid */}
            {filteredSongs.length === 0 ? (
              <div className="mt-5 rounded-xl border border-[#E6E1D6] bg-white p-8 text-center">
                <p className="text-sm font-bold text-[#1C1917]">
                  条件に一致する楽曲が見つかりませんでした。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEraFilter('all');
                    setSoundFilter('all');
                    setSearchQuery('');
                  }}
                  className="mt-3 rounded-lg bg-[#1C1917] px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  絞り込みをリセット
                </button>
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSongs.map((song) => {
                  const inSetlist = setlistSongIds.includes(song.id);
                  return (
                    <article
                      key={song.id}
                      className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-5 transition-colors hover:border-[#1C1917]"
                    >
                      <div>
                        <div className="flex items-start gap-3.5">
                          {isSafeAssetUrl(song.jacketImage) && (
                            <img
                              src={song.jacketImage}
                              alt={`${song.title} ジャケット`}
                              referrerPolicy="no-referrer"
                              className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-[#78716C] font-mono-num truncate">
                              {song.album} · {song.releaseDate}
                            </div>
                            <h3 className="mt-0.5 text-lg font-bold text-[#1C1917] truncate">
                              {song.title}
                            </h3>
                            <p className="text-xs text-[#57534E] truncate">
                              {song.tieUp}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3.5 text-xs leading-relaxed text-[#57534E] line-clamp-2">
                          {song.linerNotes}
                        </p>

                        {/* Clean Unboxed Metadata Line */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#78716C]">
                          <span>{SOUND_LABELS[song.sound]}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">BPM {song.bpm}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">{formatDuration(song.durationSec)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">
                            転調 <strong className="text-[#C83E2B]">{song.keyChanges}回</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 pt-3.5 border-t border-[#E6E1D6]">
                        <button
                          type="button"
                          onClick={() => onSelectSong(song)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-1.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                          詳しい解説・考察
                        </button>
                        <button
                          type="button"
                          onClick={() => onAddToSetlist(song.id)}
                          disabled={inSetlist}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
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
            )}
          </div>
        ) : (
          /* Sacred Spots Map & Pilgrimage Guide */
          <div className="mt-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-4">
                {isSafeAssetUrl(MATSUE_IMAGE_PATH) && (
                  <img
                    src={MATSUE_IMAGE_PATH}
                    alt="島根県松江市・宍道湖の夕景"
                    referrerPolicy="no-referrer"
                    className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                  />
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">
                    山陰（松江・米子）から横浜スタジアムまで
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
                        <span className="font-bold text-[#C83E2B] shrink-0 whitespace-nowrap">{spot.area}</span>
                        <span className="truncate">ゆかりの曲: {spot.relatedSong}</span>
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
