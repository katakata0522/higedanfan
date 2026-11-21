import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { HISTORICAL_SACRED_SPOTS, SACRED_SPOTS } from '../data/sacredSpotsData';
import type { SacredSpotCategory, SongItem } from '../data/higedanTypes';
import { songPagePath } from '../songPages/publishedSongPageIds';
import { saveMapReturnState, takeMapReturnState } from '../utils/guideReturnState';
import {
  getSacredSpotRegion,
  SACRED_SPOT_REGIONS,
  SPOT_CATEGORIES,
  type SacredSpotRegion,
} from '../utils/sacredSpotAreas';

interface SacredMapSectionProps {
  songs: SongItem[];
  visitedSpotIds: string[];
  onToggleVisitedSpot: (spotId: string) => void;
}

const SPOT_TAPE_COLORS = ['#f3d2a8', '#f5c6be', '#bce3f8', '#c0e6c7', '#dfcaf6', '#f6e39c'] as const;
const spotIds = SACRED_SPOTS.map((spot) => spot.id);

export const SacredMapSection: React.FC<SacredMapSectionProps> = ({
  songs,
  visitedSpotIds,
  onToggleVisitedSpot,
}) => {
  const titleToSong = useMemo(() => {
    const map = new Map<string, SongItem>();
    for (const song of songs) {
      map.set(song.title, song);
      map.set(song.title.replace(/・・・/g, '…'), song);
    }
    return map;
  }, [songs]);

  const [mapReturn] = useState(() => takeMapReturnState(spotIds));
  const [selectedSpotCategory, setSelectedSpotCategory] = useState<SacredSpotCategory | 'all'>(
    mapReturn?.category ?? 'all',
  );
  const [selectedSpotRegion, setSelectedSpotRegion] = useState<SacredSpotRegion>(
    mapReturn?.region ?? 'all',
  );
  const [visitedSpotsOnly, setVisitedSpotsOnly] = useState(mapReturn?.visitedOnly ?? false);
  const [isSpotFilterOpen, setIsSpotFilterOpen] = useState(mapReturn?.filtersOpen ?? false);
  const [pinnedSpotId, setPinnedSpotId] = useState<string | null>(mapReturn?.pinnedSpotId ?? null);
  const [mapSpotId, setMapSpotId] = useState(mapReturn?.mapSpotId ?? '');
  const originSpotHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const heading = originSpotHeading.current;
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [mapReturn]);

  const renderSpotRelatedSongs = (raw: string, originSpotId: string) => {
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
              onClick={() =>
                saveMapReturnState({
                  originSpotId,
                  category: selectedSpotCategory,
                  region: selectedSpotRegion,
                  visitedOnly: visitedSpotsOnly,
                  filtersOpen: isSpotFilterOpen,
                  mapSpotId,
                  pinnedSpotId,
                })
              }
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

  const filteredSpots = useMemo(
    () =>
      SACRED_SPOTS.filter((s) => {
        if (selectedSpotCategory !== 'all' && !s.categories.includes(selectedSpotCategory)) return false;
        if (selectedSpotRegion !== 'all' && getSacredSpotRegion(s.area) !== selectedSpotRegion) return false;
        if (visitedSpotsOnly && (s.mapScope === 'none' || !visitedSpotIds.includes(s.id))) return false;
        return true;
      }),
    [selectedSpotCategory, selectedSpotRegion, visitedSpotsOnly, visitedSpotIds],
  );

  const filteredHistoricalSpots = useMemo(
    () =>
      visitedSpotsOnly
        ? []
        : HISTORICAL_SACRED_SPOTS.filter((spot) => {
            if (selectedSpotCategory !== 'all' && !spot.categories.includes(selectedSpotCategory)) return false;
            if (selectedSpotRegion !== 'all' && getSacredSpotRegion(spot.area) !== selectedSpotRegion) return false;
            return true;
          }),
    [selectedSpotCategory, selectedSpotRegion, visitedSpotsOnly],
  );

  const orderedSpots = useMemo(() => {
    if (!pinnedSpotId) return filteredSpots;
    const pinned = filteredSpots.find((s) => s.id === pinnedSpotId);
    if (!pinned) return filteredSpots;
    return [pinned, ...filteredSpots.filter((s) => s.id !== pinned.id)];
  }, [filteredSpots, pinnedSpotId]);

  const mapSpots = filteredSpots.filter((s) => s.mapScope !== 'none');
  const mapSpot = mapSpots.find((s) => s.id === mapSpotId) ?? mapSpots[0];
  const mapQuery = mapSpot ? encodeURIComponent(mapSpot.name + ' ' + mapSpot.addressHint) : '';
  const visitedSpotCount = SACRED_SPOTS.filter(
    (s) => s.mapScope !== 'none' && visitedSpotIds.includes(s.id),
  ).length;
  const totalCheckableSpotCount = SACRED_SPOTS.filter((s) => s.mapScope !== 'none').length;
  const hasNoVisits = visitedSpotsOnly && visitedSpotCount === 0;
  const hasVisitsOutsideFilter = visitedSpotsOnly && visitedSpotCount > 0 && filteredSpots.length === 0;
  const spotFilterChoices = [
    selectedSpotCategory !== 'all' && selectedSpotCategory,
    selectedSpotRegion !== 'all' && SACRED_SPOT_REGIONS.find((r) => r.id === selectedSpotRegion)?.label,
    visitedSpotsOnly && '訪問済みのみ',
  ].filter(Boolean);
  const hasSpotFilter = spotFilterChoices.length > 0;

  const resetSpotFilters = (onlyVisited = false) => {
    setSelectedSpotCategory('all');
    setSelectedSpotRegion('all');
    setVisitedSpotsOnly(onlyVisited);
    setPinnedSpotId(null);
  };

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
            聖地巡礼マップ
          </h1>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331] shrink-0">
            <MapPin className="h-3.5 w-3.5 text-[#2e6f40]" aria-hidden="true" />
            <span>訪問記録：{visitedSpotCount} / {totalCheckableSpotCount} スポット</span>
          </span>
        </div>

        <div className="mt-3 space-y-4">
          <div className="notebook-paper rounded-xl p-2.5 sm:p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-expanded={isSpotFilterOpen}
                aria-controls="sacred-map-filters"
                onClick={() => setIsSpotFilterOpen((current) => !current)}
                className="flex min-h-[40px] flex-1 items-center justify-between gap-2 rounded-lg border border-[#e5dccb] bg-[#faf6eb]/70 px-3 py-1.5 text-left text-xs font-bold text-[#253331] hover:bg-[#f4efe4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331] cursor-pointer"
              >
                <span className="min-w-0">
                  絞り込み条件
                  <span className="ml-1.5 font-normal text-[#57534E]">
                    （{hasSpotFilter
                      ? `${spotFilterChoices.join(' ／ ')} · ${filteredSpots.length}か所`
                      : `全${filteredSpots.length}件（訪問記録対象 ${totalCheckableSpotCount}スポット） ／ つながり・エリア・訪問済み`}）
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={`h-4 w-4 shrink-0 transition-transform ${isSpotFilterOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {hasSpotFilter && (
                <button
                  type="button"
                  onClick={() => resetSpotFilters()}
                  className="min-h-[40px] shrink-0 rounded-lg border border-[#dfd7c7] bg-white px-3 py-1.5 text-xs font-bold text-[#C83E2B] hover:border-[#C83E2B] cursor-pointer"
                >
                  リセット
                </button>
              )}
            </div>
            <div
              id="sacred-map-filters"
              className={isSpotFilterOpen ? 'mt-2.5 space-y-2.5 pt-2.5 border-t border-[#ece3d2]' : 'hidden'}
            >
              <div className="flex flex-wrap gap-2" role="group" aria-label="場所とのつながりで絞り込む">
                {SPOT_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selectedSpotCategory === category}
                    onClick={() => setSelectedSpotCategory(category)}
                    className={`min-h-[38px] rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                      selectedSpotCategory === category
                        ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                        : 'border-[#dfd7c7] bg-[#faf6eb] text-[#57534E] hover:text-[#253331] hover:bg-[#f4efe4]'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : category}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#ece3d2]">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="エリアで絞り込む">
                  {SACRED_SPOT_REGIONS.map((region) => (
                    <button
                      key={region.id}
                      type="button"
                      aria-pressed={selectedSpotRegion === region.id}
                      onClick={() => setSelectedSpotRegion(region.id)}
                      className={`min-h-[34px] rounded-full px-3 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                        selectedSpotRegion === region.id
                          ? 'border-[#1d5a7a] bg-[#1d5a7a] text-white'
                          : 'border-[#dfd7c7] bg-[#faf6eb] text-[#57534E] hover:text-[#253331] hover:bg-[#f4efe4]'
                      }`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={visitedSpotsOnly}
                  onClick={() => setVisitedSpotsOnly((current) => !current)}
                  className={`min-h-[34px] inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                    visitedSpotsOnly
                      ? 'border-[#2e6f40] bg-[#2e6f40] text-white'
                      : 'border-[#dfd7c7] bg-[#faf6eb] text-[#57534E] hover:border-[#2e6f40] hover:text-[#2e6f40]'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>訪問済みのみ ({visitedSpotCount})</span>
                </button>
              </div>
            </div>
          </div>

          {mapSpot && (
            <section
              id="sacred-map-viewer"
              className="fusen-memo-card scroll-mt-24 !p-3.5 sm:!p-4"
              style={{ '--tape-bg': '#bce3f8' } as CSSProperties}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="font-note-serif text-sm font-bold text-[#253331]" htmlFor="map-place">
                    地図で見る場所
                  </label>
                  <select
                    id="map-place"
                    className="min-h-[38px] max-w-full rounded-lg border border-[#dfd7c7] bg-[#faf6eb] px-3 py-1 text-base sm:text-sm font-medium text-[#253331] focus:outline-none focus:ring-2 focus:ring-[#253331]"
                    value={mapSpot.id}
                    onChange={(e) => {
                      setMapSpotId(e.target.value);
                      setPinnedSpotId(e.target.value);
                    }}
                  >
                    {mapSpots.map((s) => (
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
                <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                  {mapSpot.mapAreaNote ?? '撮影が行われた街・エリア全体の位置を表示しています。'}
                </p>
              )}
              <div className="mt-2.5 overflow-hidden rounded-lg border border-[#e5dccb] bg-[#f4efe4]">
                <iframe
                  className="block h-[196px] sm:h-[220px] w-full"
                  title={mapSpot.name + 'の地図'}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  src={'https://maps.google.com/maps?output=embed&q=' + mapQuery}
                />
              </div>
            </section>
          )}

          {filteredSpots.length === 0 && filteredHistoricalSpots.length === 0 ? (
            <div className="notebook-paper rounded-xl p-6 text-center">
              <p className="font-note-serif text-sm font-bold text-[#253331]">
                {hasNoVisits ? 'まだ訪問済みの場所がありません。' : '条件に一致する場所が見つかりませんでした。'}
              </p>
              <p className="mt-1.5 text-xs text-[#57534E]">
                {hasNoVisits
                  ? '気になったスポットカードの「行った！を記録」を押すと、ここにまとめて見返せます。'
                  : hasVisitsOutsideFilter ? `ほかの条件を外すと、訪問済みの${visitedSpotCount}か所を見返せます。` : 'つながりやエリアの条件を変えてお試しください。'}
              </p>
              <button
                type="button"
                onClick={() => resetSpotFilters(hasVisitsOutsideFilter)}
                className="mt-4 inline-flex min-h-[38px] items-center justify-center rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-4 py-1.5 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] cursor-pointer"
              >
                {hasVisitsOutsideFilter ? '訪問済みの場所をすべて見る' : '条件をリセット'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
              {orderedSpots.map((spot, index) => {
                const visited = visitedSpotIds.includes(spot.id);
                const isPinnedToMap = pinnedSpotId === spot.id;
                const tapeStyle = {
                  '--tape-bg': SPOT_TAPE_COLORS[index % SPOT_TAPE_COLORS.length],
                } as CSSProperties;
                return (
                  <article
                    key={spot.id}
                    className={`fusen-memo-card ${isPinnedToMap ? 'ring-2 ring-[#1d5a7a]/45' : ''}`}
                    style={tapeStyle}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2
                          ref={spot.id === mapReturn?.originSpotId ? originSpotHeading : undefined}
                          tabIndex={spot.id === mapReturn?.originSpotId ? -1 : undefined}
                          className="scroll-mt-20 font-note-serif text-base font-bold text-[#253331]"
                        >
                          {spot.name}
                        </h2>
                        <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
                          {isPinnedToMap && (
                            <span className="shrink-0 rounded border border-[#1d5a7a]/40 bg-[#eef6fb] px-1.5 py-0.5 text-[10px] font-bold text-[#1d5a7a]">
                              地図に表示中
                            </span>
                          )}
                          {visited && (
                            <span className="shrink-0 rounded border border-[#2e6f40]/40 bg-[#eef9f0] px-1.5 py-0.5 text-[10px] font-bold text-[#2e6f40]">
                              訪問済み
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-bold text-[#C83E2B]">{spot.area}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#1d5a7a]">{spot.categoryLabel ?? spot.categories.join(' / ')}</p>
                      <p className="mt-2 text-xs text-[#57534E] leading-relaxed">
                        {spot.description}
                      </p>
                      {spot.relatedSong && (
                        <p className="mt-2 text-xs leading-relaxed text-[#57534E]">
                          <strong className="text-[#253331]">
                            {spot.relatedSongLabel ?? (spot.categories.includes('ライブ会場') ? '会場ゆかりの曲' : 'あわせて聴きたい曲')}：
                          </strong>
                          {renderSpotRelatedSongs(spot.relatedSong, spot.id)}
                        </p>
                      )}
                      <div className="mt-3 rounded-md border border-[#ebe2d2] bg-[#faf6eb] px-3 py-2.5 text-xs text-[#57534E] leading-relaxed">
                        {spot.fanTip && (
                          <p className="mb-2">
                            <strong className="text-[#253331]">スポットメモ：</strong>
                            {spot.fanTip}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {spot.mapScope !== 'none' && (
                            <button
                              type="button"
                              aria-label={`${spot.name}${spot.mapScope === 'area' ? 'のエリアを地図で見る' : 'を地図で見る'}`}
                              className="inline-flex min-h-[28px] items-center py-0.5 font-bold text-[#1d5a7a] underline cursor-pointer hover:text-[#C83E2B]"
                              onClick={() => {
                                setMapSpotId(spot.id);
                                setPinnedSpotId(spot.id);
                                const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                                window.requestAnimationFrame(() => {
                                  document.getElementById('sacred-map-viewer')?.scrollIntoView({
                                    behavior: reduced ? 'auto' : 'smooth',
                                    block: 'start',
                                  });
                                  document.getElementById('map-place')?.focus({ preventScroll: true });
                                });
                              }}
                            >
                              {spot.mapScope === 'area' ? 'エリアを地図で見る' : '地図で見る'}
                            </button>
                          )}
                          {isPinnedToMap && (
                            <button
                              type="button"
                              onClick={() => setPinnedSpotId(null)}
                              className="inline-flex min-h-[28px] items-center py-0.5 text-[#57534E] underline hover:text-[#253331] cursor-pointer"
                            >
                              並び順を戻す
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
                          {spot.additionalSources?.map((source) => (
                            <a key={source.url} className="inline-flex min-h-[28px] items-center py-0.5 underline hover:text-[#C83E2B]" href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`${spot.name}：${source.label}（新しいタブで開く）`}>
                              {source.label} ↗
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#ece3d2]">
                      <span className="text-[11px] text-[#68625C] min-w-0 wrap-anywhere whitespace-normal">
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
          )}

          {filteredHistoricalSpots.length > 0 && (
            <section aria-labelledby="historical-spots-heading" className="rounded-xl border border-[#dfd7c7] bg-[#f4efe4]/80 p-5 sm:p-6">
              <h2 id="historical-spots-heading" className="font-note-serif text-base font-bold text-[#253331]">
                以前の場所・移転の記録
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
                移転や閉店などで、当時とは場所や形が変わったスポットの記録です。
              </p>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredHistoricalSpots.map((spot) => (
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
                      {spot.sources.map((source) => (
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
          <p className="text-center text-[11px] text-[#68625C]">※ 訪問済みの記録はお使いのブラウザ内に保存されます。</p>
        </div>
      </div>
    </section>
  );
};
