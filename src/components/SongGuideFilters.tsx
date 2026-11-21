import { useRef, useState } from 'react';
import { ChevronDown, RotateCcw, Search, X } from 'lucide-react';
import type { EraTag, SoundTag } from '../data/higedanTypes';
import type { DiscographySortOption } from '../utils/discography';
import { ERA_SHORT_LABELS } from '../utils/songLabels';
import { SONG_TABLE_SORT_LABELS, type SongTableSort } from '../utils/songTableSort';

export interface SongGuideFilterValues {
  era: EraTag | 'all';
  album: string;
  sound: SoundTag | 'all';
  sortBy: DiscographySortOption;
  searchQuery: string;
  tableSort?: SongTableSort;
}

export const DEFAULT_GUIDE_FILTERS: SongGuideFilterValues = {
  era: 'all', album: 'all', sound: 'all', sortBy: 'guide_order', searchQuery: '',
};

const ALBUM_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'すべて' },
  { id: 'ラブとピースは君の中', label: 'ラブとピースは君の中' },
  { id: 'MAN IN THE MIRROR', label: 'MAN IN THE MIRROR' },
  { id: "What's Going On? EP", label: "What's Going On?" },
  { id: 'レポート', label: 'レポート' },
  { id: 'エスカパレード', label: 'エスカパレード' },
  { id: 'Stand By You EP', label: 'Stand By You EP' },
  { id: 'Traveler', label: 'Traveler' },
  { id: 'HELLO EP', label: 'HELLO EP' },
  { id: 'Editorial', label: 'Editorial' },
  { id: 'ミックスナッツ EP', label: 'ミックスナッツ EP' },
  { id: 'Rejoice', label: 'Rejoice' },
  { id: 'Single / 2024-2026 Collection', label: '配信シングル（2024–2026）' },
  { id: 'スターダスト/エルダーフラワー', label: 'スターダスト/エルダーフラワー' },
];

const SOUND_FILTERS: { id: SoundTag | 'all'; label: string }[] = [
  { id: 'all', label: 'すべての曲調' },
  { id: 'piano_pop', label: '王道ピアノポップ' },
  { id: 'brass_funk', label: 'ブラス＆ファンク' },
  { id: 'emotional_ballad', label: 'バラード' },
  { id: 'stadium_rock', label: 'スタジアムロック' },
];

const SORT_OPTIONS: { id: DiscographySortOption; label: string }[] = [
  { id: 'guide_order', label: '並び順：代表曲→アルバム順（ガイド順）' },
  { id: 'album_track_order', label: '並び順：アルバム収録曲順（M1〜最終曲）' },
  { id: 'release_oldest', label: '並び順：配信日が古い順（2015年初期〜）' },
  { id: 'newest', label: '並び順：配信日が新しい順（最新曲〜）' },
  { id: 'highest_note', label: '並び順：地声最高音が高い順' },
  { id: 'vocal_span', label: '並び順：音域が広い順（半音幅）' },
  { id: 'bpm', label: '並び順：テンポが速い順（BPM順）' },
];

interface Props {
  values: SongGuideFilterValues;
  onChange: (values: SongGuideFilterValues) => void;
  resultCount: number;
  shownCount: number;
  onReset?: () => void;
}

const chipBaseClass = 'inline-flex min-h-[34px] items-center rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer';
const chipActiveClass = `${chipBaseClass} bg-[#253331] text-[#faf6eb]`;
const chipIdleClass = `${chipBaseClass} border border-[#dfd7c7] bg-[#fffdf8] text-[#45413C] hover:border-[#253331] hover:text-[#253331]`;

export function SongGuideFilters({ values, onChange, resultCount, shownCount, onReset }: Props) {
  const [expanded, setExpanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const resultStatus = useRef<HTMLSpanElement>(null);
  const { era, album, sound, sortBy, searchQuery } = values;
  const albumLabel = album !== 'all' ? (ALBUM_FILTERS.find(option => option.id === album)?.label ?? album) : null;
  const soundLabel = sound !== 'all' ? (SOUND_FILTERS.find(option => option.id === sound)?.label ?? null) : null;
  const sortLabel = values.tableSort
    ? `${SONG_TABLE_SORT_LABELS[values.tableSort.key]}・${values.tableSort.direction === 'ascending' ? '昇順' : '降順'}`
    : (sortBy !== 'guide_order'
      ? (SORT_OPTIONS.find(option => option.id === sortBy)?.label.replace('並び順：', '') ?? null)
      : null);
  const secondaryChoices = [
    era !== 'all' && ERA_SHORT_LABELS[era],
    albumLabel,
    soundLabel,
    sortLabel,
  ].filter(Boolean);
  const hasActiveFilter = album !== 'all' || era !== 'all' || sound !== 'all' || Boolean(searchQuery.trim()) || secondaryChoices.length > 0;

  const selectAlbum = (targetId: string) => {
    const nextAlbum = targetId !== 'all' && album === targetId ? 'all' : targetId;
    onChange(
      nextAlbum === 'all'
        ? {
            ...values,
            album: 'all',
            sortBy: values.sortBy === 'album_track_order' ? 'guide_order' : values.sortBy,
          }
        : {
            ...values,
            album: nextAlbum,
            era: 'all',
            sortBy: values.sortBy === 'guide_order' ? 'album_track_order' : values.sortBy,
          },
    );
  };

  const activeChips: { key: string; label: string; clear: () => void }[] = [
    ...(albumLabel ? [{
      key: 'album',
      label: albumLabel,
      clear: () => selectAlbum('all'),
    }] : []),
    ...(era !== 'all' ? [{
      key: 'era',
      label: ERA_SHORT_LABELS[era],
      clear: () => onChange({ ...values, era: 'all' }),
    }] : []),
    ...(soundLabel ? [{
      key: 'sound',
      label: soundLabel,
      clear: () => onChange({ ...values, sound: 'all' }),
    }] : []),
    ...(sortLabel ? [{
      key: 'sort',
      label: sortLabel,
      clear: () => onChange({ ...values, sortBy: 'guide_order', tableSort: undefined }),
    }] : []),
  ];

  return (
    <search aria-label="楽曲の検索と絞り込み" className="mt-5 block space-y-2.5 notebook-paper rounded-xl p-3.5 sm:p-4">
      <div>
        <div>
          <label htmlFor="discography-search" className="mb-1 block text-xs font-bold text-[#57534E]">曲名・読み・タイアップで検索</label>
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
            className="w-full min-h-[44px] rounded-lg border border-[#dfd7c7] bg-[#faf6eb] pl-9 pr-11 py-2 text-base sm:text-sm text-[#253331] placeholder:text-[#68625C] focus:outline-none focus:ring-2 focus:ring-[#253331] [&::-webkit-search-cancel-button]:appearance-none"
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
      </div>

      <button type="button" aria-expanded={expanded} aria-controls="song-guide-secondary"
        onClick={() => setExpanded(current => !current)}
        className="flex w-full min-h-[40px] items-center justify-between gap-2 rounded-lg border border-[#e5dccb] bg-[#faf6eb]/70 px-3 py-2 text-left text-xs font-bold text-[#253331] hover:bg-[#f4efe4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331] cursor-pointer">
        <span>
          条件を絞る・並べ替える
          <span className="ml-1.5 font-normal text-[#57534E]">
            （{secondaryChoices.length > 0 ? secondaryChoices.join(' ／ ') : '収録アルバム・EP／曲調／並び順'}）
          </span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <div id="song-guide-secondary" className={`${expanded ? 'space-y-3' : 'hidden'} pt-1`}>
        <fieldset id="album-filter-group">
          <legend className="mb-1.5 text-xs font-bold text-[#57534E]">収録アルバム・EPで絞り込み</legend>
          <div className="flex flex-wrap gap-1.5">
            {ALBUM_FILTERS.map(option => {
              const active = album === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectAlbum(option.id)}
                  className={active ? chipActiveClass : chipIdleClass}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset id="sound-filter-group">
          <legend className="mb-1.5 text-xs font-bold text-[#57534E]">曲調・サウンド</legend>
          <div className="flex flex-wrap gap-1.5">
            {SOUND_FILTERS.map(option => {
              const active = sound === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({
                    ...values,
                    sound: option.id !== 'all' && active ? 'all' : option.id,
                  })}
                  className={active ? chipActiveClass : chipIdleClass}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset id="discography-sort-group">
          <legend className="mb-1.5 text-xs font-bold text-[#57534E]">並び替え</legend>
          <div className="flex flex-wrap gap-1.5">
            {SORT_OPTIONS.map(option => {
              const active = !values.tableSort && sortBy === option.id;
              const shortLabel = option.id === 'guide_order' && searchQuery.trim()
                ? '曲名・読みの一致を優先'
                : option.label.replace(/^並び順：/, '');
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...values, sortBy: option.id, tableSort: undefined })}
                  className={active ? chipActiveClass : chipIdleClass}
                >
                  {shortLabel}
                </button>
              );
            })}
          </div>
        </fieldset>

        {sortBy === 'bpm' && <p className="text-xs leading-relaxed text-[#57534E]">BPMは目安です。拍の数え方によって数値が倍・半分になることがあります。調査中の曲は最後に表示します。</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ece3d2] pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span ref={resultStatus} id="song-guide-result-count" role="status" aria-atomic="true" tabIndex={-1}
            className="scroll-mt-20 font-bold text-[#253331]">
            該当：{resultCount} 曲{shownCount < resultCount && `（${shownCount}曲を表示中）`}
          </span>
          {activeChips.map(chip => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              aria-label={`${chip.label}の条件を解除`}
              className="inline-flex min-h-[28px] items-center gap-1 rounded-full border border-[#C83E2B]/35 bg-[#fdf4f2] px-2.5 py-0.5 text-[11px] font-bold text-[#9B3021] hover:border-[#C83E2B] hover:bg-[#fae8e4] cursor-pointer transition-colors"
            >
              <span>{chip.label}</span>
              <X aria-hidden="true" className="h-3 w-3 shrink-0" />
            </button>
          ))}
        </div>
        {hasActiveFilter ? (
          <button type="button" onClick={() => onReset ? onReset() : onChange(DEFAULT_GUIDE_FILTERS)}
            className="inline-flex min-h-[32px] items-center gap-1 font-bold text-[#A3291C] hover:underline cursor-pointer">
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />条件リセット
          </button>
        ) : (
          <span className="text-[11px] text-[#68625C]">並び順：代表曲 → アルバム順</span>
        )}
      </div>
    </search>
  );
}
