import { useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import type { EraTag, SoundTag } from '../data/higedanData';
import type { DiscographySortOption } from '../utils/discography';

export interface SongGuideFilterValues {
  era: EraTag | 'all';
  album: string;
  sound: SoundTag | 'all';
  sortBy: DiscographySortOption;
  searchQuery: string;
}

export const DEFAULT_GUIDE_FILTERS: SongGuideFilterValues = {
  era: 'all', album: 'all', sound: 'all', sortBy: 'guide_order', searchQuery: '',
};

const ERA_TABS: { id: EraTag | 'all'; label: string; shortLabel: string }[] = [
  { id: 'all', label: 'すべて（全90曲）', shortLabel: '全90曲' },
  { id: 'indies_escaparade', label: '初期〜エスカパレード', shortLabel: '初期〜エスカパレード' },
  { id: 'traveler', label: 'Traveler期', shortLabel: 'Traveler期' },
  { id: 'editorial', label: 'Editorial期', shortLabel: 'Editorial期' },
  { id: 'rejoice', label: 'Rejoice期', shortLabel: 'Rejoice期' },
  { id: 'latest_2025_2026', label: '2024–2026 新曲', shortLabel: '2024–2026 新曲' },
];

const ALBUM_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'すべての収録アルバム・EP（全90曲）' },
  { id: 'ラブとピースは君の中', label: '1st Mini『ラブとピースは君の中』(2015・全8曲)' },
  { id: 'MAN IN THE MIRROR', label: '2nd Mini『MAN IN THE MIRROR』(2016・全6曲)' },
  { id: "What's Going On? EP", label: "1st EP『What's Going On?』(2016・全4曲)" },
  { id: 'レポート', label: '3rd Mini『レポート』(2017・全7曲)' },
  { id: 'エスカパレード', label: '1st Full『エスカパレード』(2018・全13曲)' },
  { id: 'Stand By You EP', label: '2nd EP『Stand By You EP』(2018・掲載3曲／全4曲)' },
  { id: 'Traveler', label: 'Major 1st『Traveler』(2019・ボーカル13曲)' },
  { id: 'HELLO EP', label: '3rd EP『HELLO EP』(2020・全4曲)' },
  { id: 'Editorial', label: 'Major 2nd『Editorial』(2021・全14曲)' },
  { id: 'ミックスナッツ EP', label: '4th EP『ミックスナッツ EP』(2022・掲載3曲／全4曲)' },
  { id: 'Rejoice', label: 'Major 3rd『Rejoice』(2024・ボーカル15曲)' },
  { id: 'Single / 2024-2026 Collection', label: '2024–2025 配信シングル（掲載5曲）' },
  { id: 'スターダスト/エルダーフラワー', label: '2026 両A面シングル『スターダスト/エルダーフラワー』（掲載2曲）' },
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

interface Props {
  values: SongGuideFilterValues;
  onChange: (values: SongGuideFilterValues) => void;
  resultCount: number;
  shownCount: number;
}

const selectClass = 'w-full min-w-0 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-2 text-xs font-medium text-[#1C1917] min-h-[40px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]';

export function SongGuideFilters({ values, onChange, resultCount, shownCount }: Props) {
  const [expanded, setExpanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const resultStatus = useRef<HTMLSpanElement>(null);
  const { era, album, sound, sortBy, searchQuery } = values;
  const secondaryChoices = [
    era !== 'all' && ERA_TABS.find(tab => tab.id === era)?.shortLabel,
    sound !== 'all' && SOUND_FILTERS.find(option => option.id === sound)?.label,
    sortBy !== 'guide_order' && SORT_OPTIONS.find(option => option.id === sortBy)?.label.replace('並び順：', ''),
  ].filter(Boolean);
  const hasActiveFilter = album !== 'all' || Boolean(searchQuery.trim()) || secondaryChoices.length > 0;

  return (
    <div className="mt-4 space-y-2.5 rounded-xl border border-[#E6E1D6] bg-white p-3 sm:p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <label htmlFor="discography-search" className="mb-1 block text-xs font-bold text-[#57534E]">曲名・読み・音域・タイアップで検索</label>
          <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#57534E]" />
          <input id="discography-search" ref={input} type="search" enterKeyHint="search"
            maxLength={60} value={searchQuery}
            onChange={e => onChange({ ...values, searchQuery: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
                e.preventDefault();
                resultStatus.current?.focus();
              }
            }}
            placeholder="例：プリテンダー"
            className="w-full min-h-[44px] rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-9 pr-11 py-2 text-base sm:text-sm text-[#1C1917] placeholder:text-[#57534E] focus:outline-none focus:ring-2 focus:ring-[#1C1917] [&::-webkit-search-cancel-button]:appearance-none"
          />
          {searchQuery && (
            <button type="button" aria-label="検索キーワードをクリア"
              onClick={() => { onChange({ ...values, searchQuery: '' }); input.current?.focus(); }}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-lg text-[#57534E]">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-[#57534E]" htmlFor="album-filter-select">収録アルバム・EPで絞り込み</label>
          <select id="album-filter-select" value={album} className={selectClass}
            onChange={e => {
              const nextAlbum = e.target.value;
              onChange(nextAlbum === 'all' ? { ...values, album: nextAlbum } :
                { ...values, album: nextAlbum, era: 'all', sortBy: 'album_track_order' });
            }}>
            {ALBUM_FILTERS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
      </div>

      <button type="button" aria-expanded={expanded} aria-controls="song-guide-secondary"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full min-h-[40px] items-center justify-between gap-2 rounded-lg border border-[#E6E1D6] px-3 py-2 text-left text-xs font-bold text-[#1C1917] sm:hidden">
        <span>年代・曲調・並び順{secondaryChoices.length > 0 && <span className="block font-normal">{secondaryChoices.join(' ／ ')}</span>}</span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div id="song-guide-secondary" className={`${expanded ? 'grid' : 'hidden'} gap-2 sm:grid sm:grid-cols-2`}>
        <div role="group" aria-label="年代で絞り込み" className="flex flex-wrap items-center gap-1 sm:col-span-2">
          {ERA_TABS.map(tab => {
            const active = era === tab.id && album === 'all';
            return (
              <button key={tab.id} type="button" aria-pressed={active}
                onClick={() => onChange({ ...values, era: tab.id, album: 'all' })}
                className={`min-h-[32px] rounded-md px-2.5 py-1.5 text-xs font-bold ${active
                  ? 'bg-[#1C1917] text-white' : 'bg-[#FBF9F5] text-[#57534E] hover:bg-[#F2EFE9]'}`}>
                <span className="sm:hidden">{tab.shortLabel}</span><span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div>
          <label className="sr-only" htmlFor="sound-filter-select">おすすめ分類（編集部）</label>
          <select id="sound-filter-select" className={selectClass} value={sound}
            onChange={e => onChange({ ...values, sound: e.target.value as SongGuideFilterValues['sound'] })}>
            {SOUND_FILTERS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label className="sr-only" htmlFor="discography-sort-select">楽曲の並び替え</label>
          <select id="discography-sort-select" className={selectClass} value={sortBy}
            onChange={e => onChange({ ...values, sortBy: e.target.value as DiscographySortOption })}>
            {SORT_OPTIONS.map(option => <option key={option.id} value={option.id}>
              {option.id === 'guide_order' && searchQuery.trim() ? '並び順：曲名・読みの一致を優先' : option.label}
            </option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E1D6] pt-2 text-xs">
        <span ref={resultStatus} id="song-guide-result-count" role="status" aria-atomic="true" tabIndex={-1}
          className="scroll-mt-20 font-bold text-[#1C1917]">
          該当：{resultCount} 曲{shownCount < resultCount && `（${shownCount}曲を表示中）`}
        </span>
        {hasActiveFilter && <button type="button" onClick={() => onChange(DEFAULT_GUIDE_FILTERS)}
          className="inline-flex min-h-[32px] items-center gap-1 font-bold text-[#A3291C] hover:underline">
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />条件リセット
        </button>}
      </div>
    </div>
  );
}
