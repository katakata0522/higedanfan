import { prepareSongSearch } from '../utils/songSearch';
import { GuideArtwork } from './GuideArtwork';
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
  Ticket,
  RotateCcw,
  ListMusic,
  BookOpen,
  Search,
} from 'lucide-react';
import {
  SongItem,
  STADIUM_IMAGE_PATH,
} from '../data/higedanData';
import {
  calculateSetlistStats,
  formatDuration,
  isSafeAssetUrl,
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
  onSelectSong,
  initialSubTab = 'builder',
}) => {
  const activeSubTab = initialSubTab;
  const [songSearchFilter, setSongSearchFilter] = useState<string>('');
  const [requestedSong, setSelectedSongToAdd] = useState<string>(
    songs.find((s) => !setlist.some((item) => item.songId === s.id))?.id ||
      songs[0]?.id ||
      'pretender'
  );
  const [addAsEncore, setAddAsEncore] = useState<boolean>(false);
  const [copiedFlyer, setCopiedFlyer] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);

  const selectableSongsByAlbum = useMemo(() => {
    const match = prepareSongSearch(songSearchFilter);
    const matching = match ? songs.filter(song => match(song) !== undefined) : songs;
    const groups = new Map<string, SongItem[]>();
    for (const s of matching) {
      const list = groups.get(s.album) || [];
      list.push(s);
      groups.set(s.album, list);
    }
    return Array.from(groups.entries());
  }, [songs, songSearchFilter]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const stats = useMemo(() => calculateSetlistStats(setlist, songs), [setlist, songs]);
  const songMap = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);
  const setlistIdSet = useMemo(() => new Set(setlist.map((s) => s.songId)), [setlist]);
  const visibleSongs = selectableSongsByAlbum.flatMap(([, group]) => group);
  const selectedSongToAdd = visibleSongs.find(s => s.id === requestedSong)?.id ?? visibleSongs.find(s => !setlistIdSet.has(s.id))?.id ?? visibleSongs[0]?.id ?? '';
  const isSelectedAlreadyInSetlist = !selectedSongToAdd || setlistIdSet.has(selectedSongToAdd);
  const safeDisplayTitle = sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || 'マイ・ドリームライブ';

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

  return (
    <section
      id="section-setlist"
      aria-labelledby="setlist-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Clean Section Heading + Sub-Tab Switcher */}
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
                ? '公演日・会場と掲載セトリの資料を確認し、参戦・視聴をツアー単位で記録できます。'
                : '自分が聴きたい理想の曲順を組んで、合計演奏時間や曲順で見る熱量の目安をシミュレーションできます。'}
            </p>
          </div>

          <div
            role="group"
            aria-label="セットリストとツアー記録の切り替え"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 border border-[#E6E1D6] w-full sm:w-auto shrink-0"
          >
            <button
              type="button"

              aria-pressed={activeSubTab === 'builder'}
              onClick={() => (window.location.hash = 'setlist')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubTab === 'builder'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <ListMusic className="h-3.5 w-3.5 shrink-0" />
              マイセトリ作成
            </button>
            <button
              type="button"

              aria-pressed={activeSubTab === 'tours'}
              onClick={() => (window.location.hash = 'tour_archive')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubTab === 'tours'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Ticket className="h-3.5 w-3.5 shrink-0" />
              歴代ツアー記録
            </button>
          </div>
        </div>

        {activeSubTab === 'builder' ? (
          /* Main 12-Col Layout: Left Builder (7 cols), Right Energy Analytics & Flyer Preview (5 cols) */
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Setlist Editor */}
            <div className="lg:col-span-7 rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-6">
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

              {/* Song Adder Row with Quick Filter & Album Grouping */}
              <div className="mt-4 space-y-2.5 rounded-lg bg-[#F2EFE9] p-3 border border-[#E6E1D6]">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="relative sm:col-span-5">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
                    <label htmlFor="setlist-song-filter" className="sr-only">
                      追加したい曲名を検索
                    </label>
                    <input
                      id="setlist-song-filter"
                      type="text"
                      maxLength={40}
                      value={songSearchFilter}
                      onChange={(e) => {
                        const val = e.target.value.slice(0, 40);
                        setSongSearchFilter(val);
                        const q = val.trim().toLowerCase();
                        if (q) {
                          const firstHit = songs.find(
                            (s) =>
                              s.title.toLowerCase().includes(q) ||
                              s.album.toLowerCase().includes(q)
                          );
                          if (firstHit) {
                            setSelectedSongToAdd(firstHit.id);
                          }
                        }
                      }}
                      placeholder="曲名・アルバム名で絞り込み..."
                      className="w-full rounded-lg border border-[#D5CEC2] bg-white pl-8 pr-3 py-2 text-xs text-[#1C1917] min-h-[38px]"
                    />
                  </div>

                  <div className="sm:col-span-7 min-w-0">
                    <label htmlFor="add-song-select" className="sr-only">
                      追加する曲を選択
                    </label>
                    <select
                      id="add-song-select"
                      value={selectedSongToAdd}
                      onChange={(e) => setSelectedSongToAdd(e.target.value)}
                      className="w-full rounded-lg border border-[#D5CEC2] bg-white px-3 py-2 text-xs font-bold text-[#1C1917] min-h-[38px]"
                    >
                      {selectableSongsByAlbum.map(([albumName, groupSongs]) => (
                        <optgroup key={albumName} label={`収録：${albumName}`}>
                          {groupSongs.map((s) => {
                            const alreadyIn = setlistIdSet.has(s.id);
                            return (
                              <option key={s.id} value={s.id}>
                                {s.title}
                                {alreadyIn
                                  ? '（追加済み）'
                                  : `（BPM ${s.bpm} · ${formatDuration(s.durationSec)}）`}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1C1917] cursor-pointer whitespace-nowrap shrink-0">
                    <input
                      type="checkbox"
                      checked={addAsEncore}
                      onChange={(e) => setAddAsEncore(e.target.checked)}
                      className="h-4 w-4 rounded border-[#D5CEC2] text-[#C83E2B]"
                    />
                    アンコール枠で追加
                  </label>

                  <button
                    type="button"
                    disabled={isSelectedAlreadyInSetlist}
                    onClick={handleAddSelectedSong}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 min-h-[38px] ${
                      isSelectedAlreadyInSetlist
                        ? 'bg-[#E6E1D6] text-[#78716C] cursor-not-allowed'
                        : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                    }`}
                  >
                    {isSelectedAlreadyInSetlist ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        追加済み
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        曲を追加
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Setlist Track Rows */}
              <div className="mt-4 divide-y divide-[#E6E1D6] border-y border-[#E6E1D6]">
                {setlist.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#57534E]">
                    セットリストが空です。上の曲選択メニューから好きな曲を追加してください。
                  </div>
                ) : (
                  setlist.map((entry, idx) => {
                    const song = songMap.get(entry.songId);
                    if (!song) return null;
                    const sameTypeIndex =
                      setlist
                        .slice(0, idx + 1)
                        .filter((item) => item.isEncore === entry.isEncore).length;
                    const trackBadge = entry.isEncore
                      ? `EN${sameTypeIndex}`
                      : `M${sameTypeIndex.toString().padStart(2, '0')}`;
                    return (
                      <div
                        key={`${entry.songId}-${idx}`}
                        className={`flex flex-col md:flex-row md:items-center justify-between gap-2 py-2.5 px-2 transition-colors ${
                          entry.isEncore ? 'bg-[#FEF8EC]/70' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`font-mono-num text-xs font-bold w-8 shrink-0 ${
                              entry.isEncore ? 'text-[#B45309]' : 'text-[#78716C]'
                            }`}
                          >
                            {trackBadge}
                          </span>
                          <div className="min-w-0 flex-1">
                            {onSelectSong ? (
                              <button
                                type="button"
                                onClick={() => onSelectSong(song)}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1C1917] hover:text-[#C83E2B] transition-colors min-w-0 wrap-anywhere whitespace-normal cursor-pointer text-left"
                              >
                                <span className="min-w-0 wrap-anywhere whitespace-normal">{song.title}</span>
                                <BookOpen className="h-3 w-3 shrink-0 text-[#78716C]" />
                              </button>
                            ) : (
                              <div className="text-sm font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                                {song.title}
                              </div>
                            )}
                            <div className="text-[11px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
                              {song.album} · {formatDuration(song.durationSec)} · BPM {song.bpm}
                            </div>
                          </div>
                        </div>

                        <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => onToggleEncore(idx)}
                            className="rounded border border-[#D5CEC2] bg-[#FBF9F5] px-2 py-1 text-[11px] font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            {entry.isEncore ? '本編へ' : 'アンコールへ'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveSong(idx, 'top')}
                            disabled={
                              idx === 0 ||
                              setlist[idx - 1]?.isEncore !== entry.isEncore
                            }
                            title="1曲目（先頭）へ移動"
                            aria-label={`${song.title}を先頭へ移動`}
                            className="inline-flex items-center gap-0.5 rounded border border-[#D5CEC2] px-1.5 py-1 text-[11px] font-bold text-[#1C1917] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F2EFE9] cursor-pointer"
                          >
                            <ChevronsUp className="h-3 w-3" />
                            <span className="hidden sm:inline">先頭</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveSong(idx, 'up')}
                            disabled={
                              idx === 0 ||
                              setlist[idx - 1]?.isEncore !== entry.isEncore
                            }
                            aria-label={`${song.title}を1つ上へ移動`}
                            className="rounded border border-[#D5CEC2] p-1 text-[#1C1917] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F2EFE9] cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveSong(idx, 'down')}
                            disabled={
                              idx === setlist.length - 1 ||
                              setlist[idx + 1]?.isEncore !== entry.isEncore
                            }
                            aria-label={`${song.title}を1つ下へ移動`}
                            className="rounded border border-[#D5CEC2] p-1 text-[#1C1917] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F2EFE9] cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveSong(song.id)}
                            aria-label={`${song.title}をセットリストから外す`}
                            className="ml-2 inline-flex min-h-[44px] items-center gap-1 rounded border border-[#D5CEC2] px-2 text-xs font-bold text-[#9B3021] hover:bg-[#FDF3F1] cursor-pointer"
                          >
                            <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                            外す
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Live Energy Curve & Summary Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] overflow-hidden">
                <div className="relative h-32 w-full">
                  {isSafeAssetUrl(STADIUM_IMAGE_PATH) && (
                    <GuideArtwork
                      src={STADIUM_IMAGE_PATH}
                      alt="スタジアムライブの風景"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover opacity-75"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/40 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[11px] font-bold text-[#F5D0C9]">
                      セットリスト構成データ
                    </span>
                    <h3 className="mt-0.5 text-base sm:text-lg font-bold text-white min-w-0 wrap-anywhere whitespace-normal">
                      {safeDisplayTitle}
                    </h3>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Tabular Stats Row */}
                  <div className="grid grid-cols-3 gap-2 border-b border-white/15 pb-3.5 text-center">
                    <div>
                      <span className="block text-[11px] text-white/60">曲数 / 合計時間</span>
                      <span className="mt-0.5 block text-xs sm:text-sm font-bold font-mono-num text-white">
                        {stats.totalSongs}曲 · {stats.formattedDuration}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-white/60">平均テンポ</span>
                      <span className="mt-0.5 block text-xs sm:text-sm font-bold font-mono-num text-[#FDE68A]">
                        BPM {stats.avgBpm}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-white/60">本編の曲数</span>
                      <span className="mt-0.5 block text-xs sm:text-sm font-bold font-mono-num text-[#F5D0C9]">
                        {stats.mainCount} 曲
                      </span>
                    </div>
                  </div>

                  {/* Live Energy Curve Bars */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-white/90">
                        曲順で見る熱量の目安
                      </span>
                      <span className="font-bold text-[#FDE68A]">{stats.vibeTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/75 leading-relaxed">
                      {stats.vibeDescription}
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
              </div>
            </div>
          </div>
        ) : (
          <TourArchiveSection attendedTourIds={attendedTourIds} onToggleAttendedTour={onToggleAttendedTour} />
        )}
      </div>
    </section>
  );
};
