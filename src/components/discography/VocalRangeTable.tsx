import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, SlidersHorizontal } from 'lucide-react';
import { formatShortMidiPitch, pitchNumber, songEvidence } from '../../data/fullCatalogSongs';
import type { SongItem } from '../../data/higedanTypes';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { formatDuration, formatSongBpm } from '../../utils/format';
import { formatAlbumDisplayName } from '../../utils/songCatalog';
import { SONG_TABLE_SORT_LABELS, type SongTableSort, type SongTableSortKey } from '../../utils/songTableSort';

const CHEST_CEILING_OPTIONS = [
  { value: '', label: '指定なし' },
  { value: '69', label: 'hiA 以下' },
  { value: '70', label: 'hiA# 以下' },
  { value: '71', label: 'hiB 以下' },
  { value: '72', label: 'hiC 以下' },
  { value: '73', label: 'hiC# 以下' },
  { value: '74', label: 'hiD 以下' },
] as const;

function SongTieUps({ song }: { song: SongItem }) {
  if (!song.tieUps.length) return <span className="text-[#57534E]">掲載情報なし</span>;
  return (
    <ul className="space-y-2">
      {song.tieUps.map(item => (
        <li key={item.text} className="whitespace-normal wrap-anywhere">
          {item.text}{' '}
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${song.title}「${item.text}」の出典`}
            className="inline-flex items-center py-1 text-[#1d5a7a] underline underline-offset-2"
          >
            出典 ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

export interface VocalRangeTableProps {
  filteredSongs: SongItem[];
  displayedSongs: SongItem[];
  tableSort?: SongTableSort;
  onToggleSort: (key: SongTableSortKey, direction: 'ascending' | 'descending') => void;
  showTieUps: boolean;
  onToggleShowTieUps: (show: boolean) => void;
  voiceHigh: string;
  keyShift: number;
  onChangeVoiceHigh: (value: string) => void;
  onChangeKeyShift: (shift: number) => void;
  onResetVoice: () => void;
  originSongId?: string;
  onOriginSongRef: (el: HTMLElement | null) => void;
  onRememberGuide: (songId: string) => void;
  emptyResults: React.ReactNode;
}

/**
 * Renders the 90-song vocal range, release date, and tie-up comparison view.
 */
export const VocalRangeTable: React.FC<VocalRangeTableProps> = ({
  filteredSongs,
  displayedSongs,
  tableSort,
  onToggleSort,
  showTieUps,
  onToggleShowTieUps,
  voiceHigh,
  keyShift,
  onChangeVoiceHigh,
  onChangeKeyShift,
  onResetVoice,
  originSongId,
  onOriginSongRef,
  onRememberGuide,
  emptyResults,
}) => {
  const hasVoiceSetting = voiceHigh !== '' || keyShift !== 0;
  const [voiceOpen, setVoiceOpen] = useState(hasVoiceSetting);
  const voiceSummaryParts = [
    voiceHigh && (CHEST_CEILING_OPTIONS.find(opt => opt.value === voiceHigh)?.label ?? ''),
    keyShift !== 0 && `キー ${keyShift > 0 ? `+${keyShift}` : keyShift}`,
  ].filter(Boolean);

  return (
    <div className="mt-3 space-y-3 min-w-0">
      <div role="group" aria-label="比較する情報" className="inline-flex flex-wrap gap-1 rounded-full border border-[#dfd7c7] bg-[#fffdf8] p-1 md:hidden">
        {(['音域・テンポ', 'タイアップ'] as const).map((label, index) => {
          const selected = showTieUps === (index === 1);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleShowTieUps(index === 1)}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${selected ? 'bg-[#253331] text-[#faf6eb]' : 'text-[#57534E]'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {showTieUps && filteredSongs.length > 0 && (
        <ul aria-label="楽曲別のタイアップ" className="notebook-paper divide-y divide-[#e5dccb] rounded-xl px-4 md:hidden">
          {filteredSongs.map(song => (
            <li key={song.id} className="py-3">
              <a
                ref={song.id === originSongId && showTieUps ? (el) => { onOriginSongRef(el); } : undefined}
                href={`${import.meta.env.BASE_URL}${songPagePath(song.id) ?? `#vocal_range/${song.id}`}`}
                onClick={() => onRememberGuide(song.id)}
                className="font-note-serif inline-block scroll-mt-24 py-1 text-base underline underline-offset-2"
              >
                {song.title}
              </a>
              <div className="mt-1 text-sm leading-relaxed"><SongTieUps song={song} /></div>
            </li>
          ))}
        </ul>
      )}
      <div className={`notebook-paper rounded-xl p-3 ${showTieUps ? 'hidden md:block' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            aria-expanded={voiceOpen}
            aria-controls="vocal-range-karaoke-controls"
            onClick={() => setVoiceOpen(prev => !prev)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-xs font-bold text-[#253331] hover:text-[#C83E2B] cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#1d5a7a]" aria-hidden="true" />
            <span>カラオケの声域・キー変更で絞る</span>
            {voiceSummaryParts.length > 0 && (
              <span className="rounded-full bg-[#253331] px-2 py-0.5 text-[11px] font-mono-num text-[#faf6eb]">
                {voiceSummaryParts.join(' · ')}
              </span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 text-[#57534E] transition-transform ${voiceOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {hasVoiceSetting && (
            <button
              type="button"
              onClick={onResetVoice}
              className="min-h-[32px] rounded-full border border-[#dfd7c7] bg-white px-3 py-1 text-[11px] font-bold text-[#C83E2B] hover:border-[#C83E2B] cursor-pointer"
            >
              声域をリセット
            </button>
          )}
        </div>
        {voiceOpen && (
          <div id="vocal-range-karaoke-controls" className="mt-3 space-y-3 border-t border-[#e5dccb] pt-3 text-xs">
            <div>
              <p className="mb-1.5 font-bold text-[#57534E]">歌いやすい地声最高音（キー変更後）</p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="歌いやすい地声最高音の上限">
                {CHEST_CEILING_OPTIONS.map(option => {
                  const active = voiceHigh === option.value;
                  return (
                    <button
                      key={option.value || 'all'}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChangeVoiceHigh(active && option.value !== '' ? '' : option.value)}
                      className={`min-h-[34px] rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                        active
                          ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                          : 'border-[#dfd7c7] bg-white text-[#45413C] hover:border-[#253331]'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#ece3d2] pt-2.5">
              <span className="font-bold text-[#57534E]">カラオケのキー変更</span>
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="カラオケのキー調整">
                <button
                  type="button"
                  aria-label="キーを1つ下げる"
                  disabled={keyShift <= -6}
                  onClick={() => onChangeKeyShift(Math.max(-6, keyShift - 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfd7c7] bg-white text-[#253331] hover:border-[#253331] disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="min-w-[82px] text-center font-mono-num text-xs font-bold text-[#253331]">
                  {keyShift === 0 ? '原曲 (±0)' : `キー ${keyShift > 0 ? `+${keyShift}` : keyShift}`}
                </span>
                <button
                  type="button"
                  aria-label="キーを1つ上げる"
                  disabled={keyShift >= 6}
                  onClick={() => onChangeKeyShift(Math.min(6, keyShift + 1))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfd7c7] bg-white text-[#253331] hover:border-[#253331] disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                {keyShift !== 0 && (
                  <button
                    type="button"
                    onClick={() => onChangeKeyShift(0)}
                    className="ml-1 min-h-[32px] rounded-full border border-[#dfd7c7] bg-[#faf6eb] px-2.5 py-1 text-[11px] font-bold text-[#57534E] hover:text-[#253331] cursor-pointer"
                  >
                    原曲に戻す
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`space-y-1 text-xs leading-5 text-[#57534E] ${showTieUps ? 'hidden md:block' : ''}`}>
        <p id="song-table-help">↔ 表は横にスクロールできます。見出しを押すと昇順・降順で並べ替えられます。</p>
        <p className="text-[11px]">
          地声最高の色分け：
          <span className="ml-1 font-semibold text-[#2e6f40]">緑 hiA#以下</span> ／
          <span className="mx-1 font-semibold text-[#9e6022]">茶 hiB〜hiC#</span> ／
          <span className="ml-1 font-bold text-[#C83E2B]">赤 hiD以上</span>
        </p>
      </div>
      {filteredSongs.length === 0 ? emptyResults : (
        <div className={`max-w-full overflow-x-auto notebook-paper rounded-xl ${showTieUps ? 'hidden md:block' : ''}`} role="region" aria-label="音域・発売日比較表" aria-describedby="song-table-help" tabIndex={0}>
          <table className="w-[1124px] sm:w-[1156px] md:w-[1444px] table-fixed border-collapse text-left text-xs leading-5 sm:text-[13px]">
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
              <col className="w-[158px]" />
              <col className="hidden w-[288px] md:table-column" />
            </colgroup>
            <thead className="bg-[#f4efe4] text-xs text-[#57534E]">
              <tr>
                {(['title', 'low', 'chest', 'falsetto', 'album', 'duration', 'bpm', 'release'] as SongTableSortKey[]).map(key => {
                  const direction = tableSort?.key === key ? tableSort.direction : undefined;
                  const next = direction === 'ascending' ? 'descending' : 'ascending';
                  return (
                    <th
                      key={key}
                      scope="col"
                      aria-sort={direction}
                      className={`whitespace-nowrap px-2 py-1 ${key === 'title' ? 'sticky left-0 z-20 w-[168px] sm:w-[200px] bg-[#f4efe4] border-r border-[#e5dccb] shadow-[3px_0_6px_-2px_rgba(37,51,49,0.14)]' : key === 'low' ? 'pl-3 pr-2' : ''}`}
                    >
                      <button
                        type="button"
                        className="flex min-h-10 w-full items-center gap-1 text-left font-bold text-[#253331] hover:text-[#C83E2B] cursor-pointer"
                        aria-label={`${SONG_TABLE_SORT_LABELS[key]}を${next === 'ascending' ? '昇順' : '降順'}で並べ替え`}
                        onClick={() => onToggleSort(key, next)}
                      >
                        {SONG_TABLE_SORT_LABELS[key]}<span aria-hidden="true">{direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '↕'}</span>
                      </button>
                    </th>
                  );
                })}
                <th scope="col" className="whitespace-nowrap px-3 py-3 text-[#253331]">音域の参照元</th>
                <th scope="col" className="hidden px-3 py-3 text-[#253331] md:table-cell">タイアップ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece3d2]">
              {displayedSongs.map(song => {
                const f = songEvidence[song.id as keyof typeof songEvidence];
                const effectiveChestScore = song.vocalRange.chestSemitoneScore + keyShift;
                return (
                  <tr key={song.id} className="group align-top hover:bg-[#faf6eb]">
                    <th scope="row" className="sticky left-0 z-10 w-[168px] sm:w-[200px] bg-[#fffdf8] group-hover:bg-[#faf6eb] border-r border-[#ece3d2] shadow-[3px_0_6px_-2px_rgba(37,51,49,0.14)] px-2 py-3 font-note-serif font-bold text-[#253331] whitespace-normal wrap-anywhere">
                      <a
                        ref={song.id === originSongId && !showTieUps ? (el) => { onOriginSongRef(el); } : undefined}
                        href={`${import.meta.env.BASE_URL}${songPagePath(song.id) ?? ''}`}
                        onClick={() => onRememberGuide(song.id)}
                        className="inline-flex min-h-[28px] scroll-mt-24 items-center py-0.5 text-left underline decoration-[#c6bba8] underline-offset-2 hover:text-[#C83E2B]"
                      >
                        {song.title}
                      </a>
                    </th>
                    <td className="whitespace-nowrap py-3 pl-3 pr-2 font-mono-num">
                      {song.vocalRange.lowestNote}
                      {keyShift !== 0 && (
                        <span className="block text-[11px] font-medium text-[#1d5a7a]">
                          → {formatShortMidiPitch(pitchNumber(f.low) + keyShift)}
                        </span>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-2 py-3 font-mono-num ${
                        effectiveChestScore >= 74
                          ? 'font-bold text-[#C83E2B]'
                          : effectiveChestScore >= 71
                            ? 'font-semibold text-[#9e6022]'
                            : 'font-semibold text-[#2e6f40]'
                      }`}
                    >
                      {song.vocalRange.highestChestNote}
                      {keyShift !== 0 && (
                        <span className="block text-[11px] font-medium text-[#1d5a7a]">
                          → {formatShortMidiPitch(pitchNumber(f.chest) + keyShift)}
                        </span>
                      )}
                    </td>
                    <td className={`whitespace-nowrap px-2 py-3 font-mono-num ${song.vocalRange.highestFalsettoNote === '—' ? 'text-[#68625C]' : ''}`}>
                      {song.vocalRange.highestFalsettoNote}
                      {keyShift !== 0 && f.falsetto && (
                        <span className="block text-[11px] font-medium text-[#1d5a7a]">
                          → {formatShortMidiPitch(pitchNumber(f.falsetto) + keyShift)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-normal wrap-anywhere">{formatAlbumDisplayName(f.album)}</td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatDuration(song.durationSec)}</td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono-num">{formatSongBpm(song.id, song.bpm)}</td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono-num"><a className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]" target="_blank" rel="noopener noreferrer" href={f.apple} aria-label={`${song.title}の配信日 ${f.release}（Apple Musicを新しいタブで開く）`}>{f.release}</a></td>
                    <td className="whitespace-nowrap px-3 py-3"><a className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]" href={f.rangeSource} target="_blank" rel="noopener noreferrer" aria-label={`${song.title}の音域の参照元：${f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel}`}>{f.rangeLabel === '音域調査 Wiki' ? '音域データ！＠ウィキ' : f.rangeLabel} ↗</a></td>
                    <td className="hidden px-3 py-3 md:table-cell"><SongTieUps song={song} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <details className={`notebook-paper rounded-xl p-3.5 text-xs text-[#57534E] ${showTieUps ? 'hidden md:block' : ''}`}>
        <summary className="cursor-pointer font-bold text-[#253331]">音域・日付の見方</summary>
        <p className="mt-2 leading-relaxed">地声・裏声は曲別の調査サイトに基づく目安です（色分けは地声最高が緑=hiA#以下／茶=hiB〜hiC#／赤=hiD以上）。「配信日」はApple Music上の配信日です。裏声の「—」は音域データがない（地声中心など）ことを示します。BPMは小数を四捨五入した目安です。各曲名から別の調査データとの違いも確認できます。調査中の値は並べ替えの方向にかかわらず末尾に表示します。</p>
      </details>
    </div>
  );
};
