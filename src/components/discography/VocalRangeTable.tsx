import React from 'react';
import { songEvidence } from '../../data/fullCatalogSongs';
import type { SongItem } from '../../data/higedanTypes';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { formatDuration, formatSongBpm } from '../../utils/format';
import { formatAlbumDisplayName } from '../../utils/songCatalog';
import { SONG_TABLE_SORT_LABELS, type SongTableSort, type SongTableSortKey } from '../../utils/songTableSort';

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
  originSongId,
  onOriginSongRef,
  onRememberGuide,
  emptyResults,
}) => (
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
    <p id="song-table-help" className={`text-xs leading-5 text-[#57534E] ${showTieUps ? 'hidden md:block' : ''}`}>↔ 表は横にスクロールできます。見出しを押すと昇順・降順で並べ替えられます。</p>
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
                  <td className="whitespace-nowrap py-3 pl-3 pr-2 font-mono-num">{song.vocalRange.lowestNote}</td>
                  <td
                    className={`whitespace-nowrap px-2 py-3 font-mono-num ${
                      song.vocalRange.chestSemitoneScore >= 74
                        ? 'font-bold text-[#C83E2B]'
                        : song.vocalRange.chestSemitoneScore >= 71
                          ? 'font-semibold text-[#9e6022]'
                          : 'font-semibold text-[#2e6f40]'
                    }`}
                  >
                    {song.vocalRange.highestChestNote}
                  </td>
                  <td className={`whitespace-nowrap px-2 py-3 font-mono-num ${song.vocalRange.highestFalsettoNote === '—' ? 'text-[#68625C]' : ''}`}>{song.vocalRange.highestFalsettoNote}</td>
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
      <p className="mt-2 leading-relaxed">地声・裏声は曲別の調査サイトに基づく目安です。「配信日」はApple Music上の配信日です。裏声の「—」は音域データがない（地声中心など）ことを示します。BPMは小数を四捨五入した目安です。各曲名から別の調査データとの違いも確認できます。調査中の値は並べ替えの方向にかかわらず末尾に表示します。</p>
    </details>
  </div>
);
