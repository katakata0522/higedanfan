import { albumForSearch, matchedSongContexts } from '../utils/songSearch';
import { partialEpCoverage } from '../utils/songCatalog';
import { DEFAULT_GUIDE_FILTERS, SongGuideFilters } from './SongGuideFilters';
import { GuideArtwork } from './GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import React, { useEffect, useMemo, useState } from 'react';
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
  SACRED_SPOTS,
  SacredSpot,
  SongItem,
  MATSUE_IMAGE_PATH,
} from '../data/higedanData';
import {
  EP_TRACK_ORDER_MAP,
  filterAndSortDiscography,
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
  const [filters, setFilters] = useState({ ...DEFAULT_GUIDE_FILTERS, era: initialEraFilter });
  const { era: eraFilter, album: albumFilter, sound: soundFilter, searchQuery, sortBy } = filters;
  const [selectedArea, setSelectedArea] = useState<SacredSpot['area'] | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    setFilters(current => current.era === initialEraFilter ? current : { ...current, era: initialEraFilter });
  }, [initialEraFilter]);

  // Reset pagination whenever filters or sub-view change
  useEffect(() => {
    setVisibleCount(
      albumFilter !== 'all' || searchQuery.trim().length > 0 ? songs.length : INITIAL_VISIBLE_COUNT
    );
  }, [eraFilter, albumFilter, soundFilter, searchQuery, sortBy, activeSubView, songs.length]);

  const filteredSongs = useMemo(() => filterAndSortDiscography(songs, filters), [songs, filters]);
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
      selectedArea === 'all'
        ? SACRED_SPOTS
        : SACRED_SPOTS.filter((s) => s.area === selectedArea),
    [selectedArea]
  );

  const [mapSpotId, setMapSpotId] = useState('');
  const mapSpot = filteredSpots.find(s => s.id === mapSpotId) ?? filteredSpots[0];
  const mapQuery = encodeURIComponent(mapSpot.name + ' ' + mapSpot.addressHint);
  const emptyResults = (
    <div className="mt-4 rounded-xl border border-[#E6E1D6] bg-white p-5 text-center">
      <p className="text-sm font-bold text-[#1C1917]">条件に一致する楽曲が見つかりませんでした。</p>
      {globalMatchCount > 0 ? (
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
                ? '聖地巡礼マップ（松江・米子・横浜）'
                : activeSubView === 'vocal_range'
                ? '掲載86曲の音域・発売日一覧'
                : '掲載86曲 楽曲ガイド（収録曲順・音域・曲調）'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubView === 'sacred_map'
                ? '結成の地・山陰（松江・米子）から記念すべきスタジアム会場まで、ゆかりの聖地スポット案内です。'
                : activeSubView === 'vocal_range'
                ? '地声・裏声は曲別の採譜による値です。配信サービス掲載日と収録作品のCD発売日は別々に表示します。'
                : '2015年から2025年8月「らしさ」までに発表された楽曲から86曲を掲載。インスト曲と同じ曲の別バージョンは掲載対象を絞っています。'}
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
            resultCount={filteredSongs.length} shownCount={displayedSongs.length} />
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
                              <GuideArtwork
                                src={song.jacketImage}
                                alt={`${song.title} のイメージ画像`}
                                referrerPolicy="no-referrer"
                                className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2 text-[11px] text-[#78716C] font-mono-num">
                                <span className="min-w-0 wrap-anywhere whitespace-normal">{albumBadgeText}</span>
                                <span className="shrink-0">{song.releaseDate}</span>
                              </div>
                              <h3 className="mt-0.5 text-base sm:text-lg font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                                {song.title}
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
            <p className="rounded-xl bg-white p-4 text-sm">「配信掲載日」はApple Musicの楽曲欄の日付です。CD欄は表示中の収録作品の発売日です。裏声の「記載なし」は採譜資料に値がないことを示します。各曲名から資料間の違いも確認できます。</p>
            {filteredSongs.length === 0 ? emptyResults : (
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
                        <span className="min-w-0 wrap-anywhere whitespace-normal">散策のお供に（編集部選曲）: {spot.relatedSong}</span>
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

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                      <span className="text-[11px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
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
