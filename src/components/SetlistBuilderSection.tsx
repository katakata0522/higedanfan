import { prepareSongSearch } from '../utils/songSearch';
import { TourArchiveSection } from './TourArchiveSection';
import { SETLIST_TITLE_LIMIT } from '../utils/setlist';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  Trash2,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Search,
} from 'lucide-react';
import { SongItem } from '../data/higedanData';
import {
  calculateSetlistStats,
  formatApproxBpm,
  formatDuration,
  sanitizeUserText,
  SetlistEntry,
} from '../utils/fanLogic';

interface SetlistBuilderSectionProps {
  songs: SongItem[];
  setlist: SetlistEntry[];
  setlistTitle: string;
  onChangeTitle: (title: string) => void;
  onAddSong: (songId: string, isEncore?: boolean) => void;
  onRemoveSong: (songId: string) => void;
  onMoveSong: (index: number, direction: 'up' | 'down' | 'top') => void;
  onToggleEncore: (index: number) => void;
  onLoadPresetSetlist: (entries: SetlistEntry[], title: string) => boolean;
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
  onExportRecords: () => void;
  onImportRecords: (file: File) => Promise<void>;
  onSelectSong?: (song: SongItem) => void;
  initialSubTab?: 'builder' | 'tours';
}

export const SetlistBuilderSection: React.FC<SetlistBuilderSectionProps> = ({
  songs,
  setlist,
  setlistTitle,
  onChangeTitle,
  onAddSong,
  onRemoveSong,
  onMoveSong,
  onToggleEncore,
  onLoadPresetSetlist,
  attendedTourIds,
  onToggleAttendedTour,
  onExportRecords,
  onImportRecords,
  onSelectSong,
  initialSubTab = 'builder',
}) => {
  const activeSubTab = initialSubTab;
  const [songPickerMode, setSongPickerMode] = useState<'search' | 'album'>('search');
  const [songSearchFilter, setSongSearchFilter] = useState<string>('');
  const [requestedSong, setSelectedSongToAdd] = useState<string>(
    songs.find((s) => !setlist.some((item) => item.songId === s.id))?.id ||
      songs[0]?.id ||
      'pretender'
  );
  const [addAsEncore, setAddAsEncore] = useState<boolean>(false);
  const [showAllSongMatches, setShowAllSongMatches] = useState(false);
  const [copiedFlyer, setCopiedFlyer] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);
  const editorRef = useRef<HTMLDetailsElement>(null);
  const songSearchInputRef = useRef<HTMLInputElement>(null);
  const albumSongSelectRef = useRef<HTMLSelectElement>(null);
  const [requestedEntryId, setRequestedEntryId] = useState('');

  const selectableSongsByAlbum = useMemo(() => {
    const match = prepareSongSearch(songPickerMode === 'search' ? songSearchFilter : '');
    const matching = match
      ? songs.map(song => ({ song, rank: match(song) }))
        .filter((item): item is { song: SongItem; rank: number } => item.rank !== undefined)
        .sort((a, b) => a.rank - b.rank || a.song.guideOrder - b.song.guideOrder)
        .map(item => item.song)
      : songs;
    const groups = new Map<string, SongItem[]>();
    for (const s of matching) {
      const list = groups.get(s.album) || [];
      list.push(s);
      groups.set(s.album, list);
    }
    return Array.from(groups.entries());
  }, [songs, songSearchFilter, songPickerMode]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const stats = useMemo(() => calculateSetlistStats(setlist, songs), [setlist, songs]);
  const durationLabelRef = useRef<HTMLSpanElement>(null);
  const previousDurationRef = useRef(stats.totalDurationSec);

  useEffect(() => {
    const previousDuration = previousDurationRef.current;
    previousDurationRef.current = stats.totalDurationSec;
    const label = durationLabelRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (previousDuration === stats.totalDurationSec || !label || reducedMotion.matches) return;

    const animation = label.animate([
      { backgroundColor: '#F5E5C9', color: '#9A341F' },
      { backgroundColor: 'transparent', color: getComputedStyle(label).color },
    ], { duration: 240, easing: 'ease-out' });
    const stopForReducedMotion = () => { if (reducedMotion.matches) animation.cancel(); };
    reducedMotion.addEventListener('change', stopForReducedMotion);
    return () => {
      animation.cancel();
      reducedMotion.removeEventListener('change', stopForReducedMotion);
    };
  }, [stats.totalDurationSec]);

  const songMap = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);
  const setlistIdSet = useMemo(() => new Set(setlist.map((s) => s.songId)), [setlist]);
  const visibleSongs = selectableSongsByAlbum.flatMap(([, group]) => group);
  const selectedSongToAdd = visibleSongs.find(s => s.id === requestedSong)?.id ?? visibleSongs.find(s => !setlistIdSet.has(s.id))?.id ?? visibleSongs[0]?.id ?? '';
  const isSelectedAlreadyInSetlist = !selectedSongToAdd || setlistIdSet.has(selectedSongToAdd);
  const safeDisplayTitle = sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || 'マイ・ドリームライブ';
  const editingEntry = setlist.find(entry => entry.songId === requestedEntryId) ?? setlist[0];
  const editingIndex = editingEntry ? setlist.findIndex(entry => entry.songId === editingEntry.songId) : -1;
  const editingSong = editingEntry ? songMap.get(editingEntry.songId) : undefined;

  const openEditor = () => {
    if (editorRef.current) editorRef.current.open = true;
    (songSearchInputRef.current ?? albumSongSelectRef.current)?.focus();
  };

  const handleAddSelectedSong = () => {
    if (isSelectedAlreadyInSetlist) return;
    onAddSong(selectedSongToAdd, addAsEncore);
    const nextAvailable = visibleSongs.find(
      (s) => s.id !== selectedSongToAdd && !setlistIdSet.has(s.id)
    );
    if (nextAvailable) {
      setSelectedSongToAdd(nextAvailable.id);
    }
  };

  const handleCopySetlist = async () => {
    const lines = [
      `【${safeDisplayTitle}】`,
      `全${stats.totalSongs}曲（本編${stats.mainCount}曲 / アンコール${stats.encoreCount}曲）· 合計時間 ${stats.formattedDuration}`,
      `構成タイプ: ${stats.vibeTitle}`,
      '---',
      ...setlist.map((entry, idx) => {
        const song = songMap.get(entry.songId);
        const sameTypeIndex = setlist
          .slice(0, idx + 1)
          .filter((item) => item.isEncore === entry.isEncore).length;
        const prefix = entry.isEncore
          ? `[アンコール EN${sameTypeIndex}]`
          : `M${sameTypeIndex.toString().padStart(2, '0')}`;
        return `${prefix} ${song ? song.title : entry.songId}`;
      }),
      '---',
      '#Official髭男dism #マイセットリスト',
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
    } catch {
      window.prompt('コピーできなかったため、以下を選択してコピーしてください。', lines.join('\n'));
      return;
    }
    setCopiedFlyer(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedFlyer(false);
      copyTimerRef.current = null;
    }, 2500);
  };

  const recordStorageControls = (
    <details className="mt-4 rounded-xl border border-[#E6E1D6] bg-white p-4 text-sm">
          <summary className="cursor-pointer font-bold text-[#1C1917]">記録の保存・引き継ぎ</summary>
          <p className="mt-2 leading-relaxed text-[#57534E]">マイセトリや参戦・訪問の記録はこのブラウザに保存されます。機種変更やブラウザのデータ削除に備えて、ファイルに保存できます。</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onExportRecords} className="min-h-11 rounded-lg border border-[#1C1917] px-4 font-bold text-[#1C1917]">記録を書き出す</button>
            <label className="font-bold text-[#1C1917]">ファイルから記録を戻す
              <input type="file" accept=".json,application/json" className="mt-1 block max-w-full text-xs font-normal" onChange={event => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (file) void onImportRecords(file);
              }} />
            </label>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#57534E]">読み込み時は、このブラウザの記録をファイルの内容に置き換えるか確認します。診断やクイズの途中経過は含みません。</p>
        </details>
  );

  return (
    <section
      id="section-setlist"
      aria-labelledby="setlist-heading"
      className="py-6 sm:py-8"
    >
      <div className={`mx-auto ${activeSubTab === 'builder' ? 'max-w-4xl' : 'max-w-6xl'} px-4 sm:px-6 lg:px-8`}>
        {/* セクション見出し */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="setlist-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              {activeSubTab === 'tours'
                ? '歴代ツアー・公演記録'
                : 'マイセットリスト作成'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubTab === 'tours'
                ? '公演日や会場、セトリの資料をたどりながら、参戦・視聴をツアーごとに記録できます。'
                : 'ライブで聴きたい曲を好きな順に並べよう。合計演奏時間や曲順に沿った熱量の目安も見られます。'}
            </p>
          </div>

        </div>

        {activeSubTab === 'builder' ? (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <h3 id="setlist-tracks-heading" title={safeDisplayTitle} className="line-clamp-2 w-full min-w-0 wrap-anywhere text-[15px] font-semibold leading-6 text-[#1C1917] sm:w-auto sm:flex-1">{safeDisplayTitle}</h3>
                <p className="text-xs text-[#78716C]">{stats.totalSongs}曲 · <span ref={durationLabelRef} className="rounded-sm">{stats.formattedDuration}</span></p>
                <button type="button" onClick={openEditor} aria-controls="setlist-edit-panel" aria-label="曲を追加・編集する欄を開く"
                  className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-[#57534E] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />追加・編集
                </button>
              </div>

              <ol aria-label="マイセットリストの曲順" className="list-none space-y-1.5 p-0">
                {setlist.length === 0 ? (
                  <li className="rounded-lg border border-[#E6E1D6] bg-white p-5 text-sm leading-relaxed text-[#57534E]">
                    まだ曲がありません。「追加・編集」から、聴きたい曲を追加してみましょう。
                  </li>
                ) : setlist.map((entry, idx) => {
                  const song = songMap.get(entry.songId);
                  if (!song) return null;
                  const sameTypeIndex = setlist.slice(0, idx + 1).filter(item => item.isEncore === entry.isEncore).length;
                  const trackBadge = entry.isEncore ? `EN${sameTypeIndex}` : `M${sameTypeIndex.toString().padStart(2, '0')}`;
                  return (
                    <li key={entry.songId} data-song-id={entry.songId} className="setlist-track grid min-w-0 grid-cols-[minmax(0,1fr)_24px] items-center gap-1.5">
                      <div className={`setlist-track-card grid min-h-[52px] min-w-0 grid-cols-[24px_minmax(0,1fr)] items-center gap-1.5 rounded-lg border border-[#E6E1D6] px-2 py-2 ${entry.isEncore ? 'bg-[#FEF8EC]' : 'bg-white'}`}>
                        <span className={`font-mono-num text-[11px] font-medium ${entry.isEncore ? 'text-[#B45309]' : 'text-[#78716C]'}`}>{trackBadge}</span>
                        {onSelectSong ? (
                          <button type="button" onClick={() => onSelectSong(song)}
                            className="setlist-track-title min-w-0 wrap-anywhere text-left text-[18px] font-semibold leading-6 text-[#1C1917] hover:text-[#C83E2B] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-xl sm:leading-7">
                            {song.title}
                          </button>
                        ) : <span className="setlist-track-title min-w-0 wrap-anywhere text-[18px] font-semibold leading-6 text-[#1C1917] sm:text-xl sm:leading-7">{song.title}</span>}
                      </div>
                      <div className="setlist-move-controls flex flex-col gap-1">
                        <button type="button" onClick={() => onMoveSong(idx, 'up')}
                          disabled={idx === 0 || setlist[idx - 1]?.isEncore !== entry.isEncore}
                          aria-label={`${song.title}を1つ上へ移動`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#78716C] hover:bg-[#E6E1D6] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-25">
                          <ArrowUp aria-hidden="true" className="h-3 w-3" />
                        </button>
                        <button type="button" onClick={() => onMoveSong(idx, 'down')}
                          disabled={idx === setlist.length - 1 || setlist[idx + 1]?.isEncore !== entry.isEncore}
                          aria-label={`${song.title}を1つ下へ移動`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#78716C] hover:bg-[#E6E1D6] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-25">
                          <ArrowDown aria-hidden="true" className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-3">
                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopySetlist}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#FBF9F5] px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                  >
                    {copiedFlyer ? (
                      <>
                        <Check className="h-4 w-4 text-[#15803D]" />
                        セットリストをコピーしました！
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        セットリストをテキストでコピー
                      </>
                    )}
                  </button>
              </div>

              <details ref={editorRef} id="setlist-edit-panel" className="mt-4 scroll-mt-20 rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5">
                <summary className="cursor-pointer text-sm font-semibold text-[#57534E]">曲を追加・セトリを編集</summary>
                <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E6E1D6] pb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="setlist-title-input"
                      className="block text-xs font-bold text-[#1C1917]"
                    >
                      マイセットリストのタイトル
                    </label>
                    <span className="text-[11px] font-mono-num text-[#78716C]">
                      {setlistTitle.length} / {SETLIST_TITLE_LIMIT}文字
                    </span>
                  </div>
                  <input
                    id="setlist-title-input"
                    type="text"
                    maxLength={SETLIST_TITLE_LIMIT}
                    value={setlistTitle}
                    onChange={(e) =>
                      onChangeTitle(
                        e.target.value.replace(/[<>＜＞\u0000-\u001F]/g, '').slice(0, SETLIST_TITLE_LIMIT)
                      )
                    }
                    className="mt-1.5 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-sm font-bold text-[#1C1917] min-h-[38px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                    placeholder="例: 私が聴きたい！夢のスタジアムライブ"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onLoadPresetSetlist(
                      [
                        { songId: 'same-blue', isEncore: false },
                        { songId: 'mixed-nuts', isEncore: false },
                        { songId: '115man-kilo', isEncore: false },
                        { songId: 'subtitle', isEncore: false },
                        { songId: 'cry-baby', isEncore: false },
                        { songId: 'sharon', isEncore: false },
                        { songId: 'soulsoup', isEncore: false },
                        { songId: 'pretender', isEncore: true },
                        { songId: 'stand-by-you', isEncore: true },
                      ],
                      'スタジアム王道ベストセトリ'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 min-h-[38px] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#1E3A5F]" />
                  王道セトリを読込
                </button>
              </div>

              {/* 検索とアルバム選択は切り替えて使い、追加操作の重複を避ける。 */}
              <div className="mt-4 space-y-3 rounded-lg bg-[#F2EFE9] p-3 border border-[#E6E1D6]">
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="曲の追加方法">
                  {([['search', '曲名で探す'], ['album', 'アルバムから選ぶ']] as const).map(([mode, label]) => (
                    <button key={mode} type="button" aria-pressed={songPickerMode === mode} onClick={() => setSongPickerMode(mode)}
                      className={`min-h-[44px] rounded-lg border px-3 py-2 text-xs font-bold ${songPickerMode === mode
                        ? 'border-[#1C1917] bg-[#1C1917] text-white'
                        : 'border-[#D5CEC2] bg-white text-[#57534E] hover:border-[#1C1917]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {songPickerMode === 'search' && <div>
                  <label htmlFor="setlist-song-filter" className="mb-1 block text-xs font-bold text-[#1C1917]">曲を探して追加</label>
                  <div className="relative">
                    <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
                    <input
                      id="setlist-song-filter" ref={songSearchInputRef}
                      type="search"
                      maxLength={40}
                      value={songSearchFilter}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 40);
                        setSongSearchFilter(val);
                        setShowAllSongMatches(false);
                        const match = prepareSongSearch(val);
                        if (match) {
                          const firstHit = songs.map(song => ({ song, rank: match(song) }))
                            .filter((item): item is { song: SongItem; rank: number } => item.rank !== undefined && !setlistIdSet.has(item.song.id))
                            .sort((a, b) => a.rank - b.rank || a.song.guideOrder - b.song.guideOrder)[0];
                          if (firstHit) setSelectedSongToAdd(firstHit.song.id);
                        }
                      }}
                      placeholder="曲名・読み・アルバム名"
                      className="w-full rounded-lg border border-[#D5CEC2] bg-white pl-9 pr-3 py-2 text-base sm:text-sm text-[#1C1917] min-h-[44px]"
                    />
                  </div>
                </div>}

                <label className="inline-flex min-h-[36px] items-center gap-2 text-xs font-medium text-[#1C1917] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addAsEncore}
                    onChange={(e) => setAddAsEncore(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D5CEC2] text-[#C83E2B]"
                  />
                  アンコール枠で追加
                </label>

                {songPickerMode === 'search' && songSearchFilter.trim() && (
                  <div className="rounded-lg border border-[#E6E1D6] bg-white p-2" aria-label="曲の検索結果">
                    <p className="px-2 py-1 text-xs font-bold text-[#57534E]" role="status">
                      {visibleSongs.length ? `${visibleSongs.length}曲見つかりました。曲を押して追加できます。` : '曲が見つかりませんでした。'}
                    </p>
                    {visibleSongs.length > 0 && <div className="max-h-80 overflow-y-auto">
                      {visibleSongs.slice(0, showAllSongMatches ? undefined : 6).map(song => {
                        const alreadyIn = setlistIdSet.has(song.id);
                        return <button key={song.id} type="button" disabled={alreadyIn}
                          aria-label={alreadyIn ? `${song.title}は追加済み` : `${song.title}を${addAsEncore ? 'アンコール' : '本編'}に追加`}
                          onClick={() => onAddSong(song.id, addAsEncore)}
                          className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-[#FBF9F5] focus-visible:outline-2 focus-visible:outline-[#1C1917] disabled:opacity-55">
                          <span className="min-w-0"><span className="block text-sm font-bold wrap-anywhere">{song.title}</span><span className="block text-xs text-[#57534E]">{song.album}</span></span>
                          <span className="shrink-0 text-xs font-bold text-[#9B3021]">{alreadyIn ? '追加済み' : '＋ 追加'}</span>
                        </button>;
                      })}
                    </div>}
                    {visibleSongs.length > 6 && <button type="button" onClick={() => setShowAllSongMatches(value => !value)}
                      className="min-h-[40px] px-2 text-xs font-bold text-[#1E3A5F] underline underline-offset-2">
                      {showAllSongMatches ? '候補を閉じる' : `ほかの${visibleSongs.length - 6}曲も見る`}
                    </button>}
                  </div>
                )}

                {songPickerMode === 'album' && <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1 basis-48">
                    <label htmlFor="add-song-select" className="mb-1 block text-xs font-bold text-[#57534E]">追加する曲を選択</label>
                    <select id="add-song-select" ref={albumSongSelectRef} value={selectedSongToAdd} onChange={(e) => setSelectedSongToAdd(e.target.value)}
                      className="w-full rounded-lg border border-[#D5CEC2] bg-white px-3 py-2 text-base sm:text-sm font-bold text-[#1C1917] min-h-[44px]">
                      {selectableSongsByAlbum.map(([albumName, groupSongs]) => (
                        <optgroup key={albumName} label={`収録：${albumName}`}>
                          {groupSongs.map(s => <option key={s.id} value={s.id}>
                            {s.title}{setlistIdSet.has(s.id) ? '（追加済み）' : `（${formatDuration(s.durationSec)}）`}
                          </option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <button type="button" disabled={isSelectedAlreadyInSetlist} onClick={handleAddSelectedSong}
                    className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${isSelectedAlreadyInSetlist
                      ? 'bg-[#E6E1D6] text-[#78716C] cursor-not-allowed'
                      : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'}`}>
                    {isSelectedAlreadyInSetlist ? <><Check className="h-3.5 w-3.5" />追加済み</> : <><Plus className="h-3.5 w-3.5" />曲を追加</>}
                  </button>
                </div>}
              </div>
                  {editingEntry && editingSong && (
                    <fieldset className="space-y-3 rounded-lg border border-[#E6E1D6] p-3">
                      <legend className="px-1 text-sm font-semibold text-[#1C1917]">アンコール・曲の削除</legend>
                      <label className="block text-xs font-medium text-[#57534E]" htmlFor="setlist-entry-select">編集する曲</label>
                      <select id="setlist-entry-select" value={editingEntry.songId} onChange={event => setRequestedEntryId(event.target.value)}
                        className="min-h-11 w-full min-w-0 rounded-lg border border-[#D5CEC2] bg-white px-3 text-sm text-[#1C1917]">
                        {setlist.map((entry, idx) => {
                          const song = songMap.get(entry.songId);
                          const position = setlist.slice(0, idx + 1).filter(item => item.isEncore === entry.isEncore).length;
                          const badge = entry.isEncore ? `EN${position}` : `M${String(position).padStart(2, '0')}`;
                          return <option key={entry.songId} value={entry.songId}>{badge} {song?.title ?? entry.songId}</option>;
                        })}
                      </select>
                      <p className="text-xs leading-5 text-[#57534E]">収録：{editingSong.album} · {formatDuration(editingSong.durationSec)}</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => onToggleEncore(editingIndex)} aria-label={`${editingSong.title}を${editingEntry.isEncore ? '本編' : 'アンコール'}へ移動`}
                          className="min-h-11 rounded-lg border border-[#D5CEC2] px-3 text-xs font-semibold text-[#1C1917] hover:bg-[#F2EFE9]">
                          {editingEntry.isEncore ? '本編へ' : 'アンコールへ'}
                        </button>
                        <button type="button" onClick={() => onMoveSong(editingIndex, 'top')} aria-label={`${editingSong.title}を先頭へ移動`}
                          disabled={editingIndex === 0 || setlist[editingIndex - 1]?.isEncore !== editingEntry.isEncore}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-[#D5CEC2] px-3 text-xs font-semibold text-[#1C1917] hover:bg-[#F2EFE9] disabled:opacity-30">
                          <ChevronsUp aria-hidden="true" className="h-3.5 w-3.5" />先頭へ
                        </button>
                        <button type="button" onClick={() => onRemoveSong(editingSong.id)} aria-label={`${editingSong.title}をセットリストから外す`}
                          className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-[#D5CEC2] px-3 text-xs font-semibold text-[#9B3021] hover:bg-[#FDF3F1]">
                          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />セトリから外す
                        </button>
                      </div>
                    </fieldset>
                  )}
                </div>
              </details>
            </div>

            <details className="rounded-xl border border-[#E6E1D6] bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#57534E]">合計時間・構成を見る</summary>
              <div className="mt-3">
              <div className="rounded-xl border border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] overflow-hidden">
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Live Energy Curve Bars */}
                  <div>
                    <h3 className="text-sm font-bold text-white/90">曲順で見る熱量の目安</h3>
                    <p className="mt-1 text-xs text-white/75 leading-relaxed">
                      棒の高さは、編集者が各曲に付けた盛り上がりの目安です。
                    </p>

                    <div className="mt-3 flex items-end overflow-x-auto gap-1.5 h-24 pt-3 px-2 rounded-lg bg-white/5 border border-white/10">
                      {stats.energyCurve.map((pt) => (
                        <div
                          key={`${pt.index}-${pt.title}`}
                          className="flex-1 flex flex-col items-center gap-1 min-w-[2ch]"
                          title={`${pt.title} (熱量 Lv.${pt.energy})`}
                        >
                          <div
                            className={`w-full rounded-t transition-opacity ${
                              pt.isEncore ? 'bg-[#D97706]' : 'bg-[#C83E2B]'
                            }`}
                            style={{ height: `${Math.max(14, pt.energy * 6.5)}px` }}
                          />
                          <span className="text-[10px] font-mono-num text-white/70 w-full text-center">
                            {pt.isEncore ? 'EN' : pt.index}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <details className="border-t border-white/15 pt-3 text-xs">
                    <summary className="cursor-pointer font-bold text-white/80">数値と見方</summary>
                    <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div><dt className="text-white/60">曲数 / 合計時間</dt><dd className="mt-1 font-mono-num font-bold">{stats.totalSongs}曲 · {stats.formattedDuration}</dd></div>
                      <div><dt className="text-white/60">本編 / アンコール</dt><dd className="mt-1 font-mono-num font-bold">{stats.mainCount}曲 / {stats.encoreCount}曲</dd></div>
                      <div><dt className="text-white/60">平均テンポ</dt><dd className="mt-1 font-mono-num font-bold text-[#FDE68A]">{stats.avgBpm !== null ? `BPM ${formatApproxBpm(stats.avgBpm)}` : stats.totalSongs ? '調査中' : '—'}</dd></div>
                    </dl>
                    <p className="mt-3 font-bold text-[#FDE68A]">{stats.vibeTitle}</p>
                    <p className="mt-1 leading-relaxed text-white/75">{stats.vibeDescription}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/70">BPMは目安です。資料や拍の数え方によって異なる場合があります。</p>
                    {stats.unconfirmedBpmCount > 0 && <p className="mt-2 text-[11px] leading-relaxed text-white/70">{stats.avgBpm === null ? 'テンポが調査中の曲のみのため、平均は表示していません。' : `調査中の${stats.unconfirmedBpmCount}曲を除いて平均しています。`}</p>}
                  </details>
                </div>
              </div>
              </div>
            </details>
            {recordStorageControls}
          </div>
        ) : (
          <>
            <TourArchiveSection attendedTourIds={attendedTourIds} onToggleAttendedTour={onToggleAttendedTour} />
            {recordStorageControls}
          </>
        )}
      </div>
    </section>
  );
};
