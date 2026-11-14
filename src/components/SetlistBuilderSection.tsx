import { prepareSongSearch } from '../utils/songSearch';
import { TourArchiveSection } from './TourArchiveSection';
import { SetlistImageModal } from './SetlistImageModal';
import { SETLIST_TITLE_LIMIT } from '../utils/setlist';
import {
  SavedSetlistsState,
  createNewSavedSetlist,
  deleteSavedSetlist,
  loadSavedSetlists,
  persistSavedSetlists,
  switchSavedSetlist,
  syncActiveSavedSetlist,
} from '../utils/savedSetlists';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Copy,
  Check,
  RotateCcw,
  Search,
  X,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';
import { SongItem } from '../data/higedanData';
import {
  calculateSetlistStats,
  formatApproxBpm,
  formatDuration,
  sanitizeUserText,
  SetlistEntry,
} from '../utils/fanLogic';

type PickerTarget = 'main' | 'encore' | null;

const ROYAL_ROAD_PRESET: SetlistEntry[] = [
  { songId: 'same-blue', isEncore: false },
  { songId: 'mixed-nuts', isEncore: false },
  { songId: '115man-kilo', isEncore: false },
  { songId: 'subtitle', isEncore: false },
  { songId: 'cry-baby', isEncore: false },
  { songId: 'sharon', isEncore: false },
  { songId: 'soulsoup', isEncore: false },
  { songId: 'pretender', isEncore: true },
  { songId: 'stand-by-you', isEncore: true },
];

interface SetlistBuilderSectionProps {
  songs: SongItem[];
  setlist: SetlistEntry[];
  setlistTitle: string;
  onChangeTitle: (title: string) => void;
  onAddSong: (songId: string, isEncore?: boolean) => void;
  onRemoveSong: (songId: string) => void;
  onMoveSong: (index: number, direction: 'up' | 'down' | 'top') => void;
  onToggleEncore?: (index: number) => void;
  onLoadPresetSetlist: (entries: SetlistEntry[], title: string) => boolean;
  onReplaceSetlistSilently: (entries: SetlistEntry[], title: string) => void;
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
  onExportRecords?: () => void;
  onImportRecords?: (file: File) => Promise<void>;
  onSelectSong?: (song: SongItem) => void;
  initialSubTab?: 'builder' | 'tours';
}

function serializeSetlistEntries(entries: readonly SetlistEntry[]): string {
  return entries.map((e) => `${e.songId}:${e.isEncore ? 1 : 0}`).join(',');
}

export const SetlistBuilderSection: React.FC<SetlistBuilderSectionProps> = ({
  songs,
  setlist,
  setlistTitle,
  onChangeTitle,
  onAddSong,
  onRemoveSong,
  onMoveSong,
  onLoadPresetSetlist,
  onReplaceSetlistSilently,
  attendedTourIds,
  onToggleAttendedTour,
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
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [isCompleteView, setIsCompleteView] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showAllSongMatches, setShowAllSongMatches] = useState(false);
  const [copiedFlyer, setCopiedFlyer] = useState<boolean>(false);
  const copyTimerRef = useRef<number | null>(null);
  const setlistPaperRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const songSearchInputRef = useRef<HTMLInputElement>(null);
  const albumSongSelectRef = useRef<HTMLSelectElement>(null);

  const scrollToSetlistPaper = () => {
    window.requestAnimationFrame(() => {
      setlistPaperRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const validSongIds = useMemo(() => new Set(songs.map((s) => s.id)), [songs]);
  const [savedSetlists, setSavedSetlists] = useState<SavedSetlistsState>(() =>
    loadSavedSetlists(validSongIds, setlistTitle, setlist),
  );
  const switchingTargetRef = useRef<{ title: string; sig: string } | null>(null);

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
  const initialSuggestedSongs = useMemo(
    () =>
      songs
        .filter((s) => !setlistIdSet.has(s.id))
        .sort((a, b) => a.guideOrder - b.guideOrder)
        .slice(0, 8),
    [songs, setlistIdSet],
  );
  const visibleSongs = selectableSongsByAlbum.flatMap(([, group]) => group);
  const selectedSongToAdd = visibleSongs.find(s => s.id === requestedSong)?.id ?? visibleSongs.find(s => !setlistIdSet.has(s.id))?.id ?? visibleSongs[0]?.id ?? '';
  const isSelectedAlreadyInSetlist = !selectedSongToAdd || setlistIdSet.has(selectedSongToAdd);
  const safeDisplayTitle = sanitizeUserText(setlistTitle, SETLIST_TITLE_LIMIT) || 'マイ・ドリームライブ';

  useEffect(() => {
    const currentSig = serializeSetlistEntries(setlist);
    const pendingSwitch = switchingTargetRef.current;
    if (pendingSwitch) {
      if (pendingSwitch.sig !== currentSig || pendingSwitch.title !== safeDisplayTitle) {
        return;
      }
      switchingTargetRef.current = null;
    }
    setSavedSetlists((prev) => {
      const next = syncActiveSavedSetlist(prev, safeDisplayTitle, setlist);
      persistSavedSetlists(next);
      return next;
    });
  }, [safeDisplayTitle, setlist]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus({ preventScroll: true });
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (pickerTarget) {
      (songSearchInputRef.current ?? albumSongSelectRef.current)?.focus();
    }
  }, [pickerTarget, songPickerMode]);

  const openPickerFor = (target: 'main' | 'encore') => {
    setIsCompleteView(false);
    setPickerTarget((current) => (current === target ? null : target));
  };

  const handleAddSelectedSong = () => {
    if (isSelectedAlreadyInSetlist || !pickerTarget) return;
    onAddSong(selectedSongToAdd, pickerTarget === 'encore');
    const nextAvailable = visibleSongs.find(
      (s) => s.id !== selectedSongToAdd && !setlistIdSet.has(s.id)
    );
    if (nextAvailable) {
      setSelectedSongToAdd(nextAvailable.id);
    }
  };

  const handleSwitchSavedSetlist = (targetId: string) => {
    const { state, target } = switchSavedSetlist(savedSetlists, targetId);
    if (!target || target.id === savedSetlists.activeId) return;
    switchingTargetRef.current = {
      title: target.title,
      sig: serializeSetlistEntries(target.entries),
    };
    persistSavedSetlists(state);
    setSavedSetlists(state);
    setPickerTarget(null);
    onReplaceSetlistSilently(target.entries, target.title);
    scrollToSetlistPaper();
  };

  const handleCreateBlankSetlist = () => {
    const nextNum = savedSetlists.items.length + 1;
    const { state, created } = createNewSavedSetlist(
      savedSetlists,
      `マイセットリスト ${nextNum}`,
      [],
    );
    switchingTargetRef.current = {
      title: created.title,
      sig: serializeSetlistEntries(created.entries),
    };
    persistSavedSetlists(state);
    setSavedSetlists(state);
    setIsCompleteView(false);
    setIsEditingTitle(true);
    setPickerTarget('main');
    onReplaceSetlistSilently(created.entries, created.title);
    scrollToSetlistPaper();
  };

  const handleDuplicateCurrentSetlist = () => {
    const copyTitle = sanitizeUserText(`${safeDisplayTitle} (コピー)`, SETLIST_TITLE_LIMIT) || 'マイセットリスト';
    const { state, created } = createNewSavedSetlist(savedSetlists, copyTitle, setlist);
    switchingTargetRef.current = {
      title: created.title,
      sig: serializeSetlistEntries(created.entries),
    };
    persistSavedSetlists(state);
    setSavedSetlists(state);
    onReplaceSetlistSilently(created.entries, created.title);
    scrollToSetlistPaper();
  };

  const handleDeleteSavedSetlist = (targetId: string, targetTitle: string) => {
    if (savedSetlists.items.length <= 1) return;
    if (!window.confirm(`保存したセットリスト「${targetTitle}」を削除しますか？`)) return;
    const { state, nextActive, deleted } = deleteSavedSetlist(savedSetlists, targetId);
    if (!deleted) return;
    if (nextActive) {
      switchingTargetRef.current = {
        title: nextActive.title,
        sig: serializeSetlistEntries(nextActive.entries),
      };
      persistSavedSetlists(state);
      setSavedSetlists(state);
      onReplaceSetlistSilently(nextActive.entries, nextActive.title);
    } else {
      persistSavedSetlists(state);
      setSavedSetlists(state);
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

  const mainEntries = setlist.filter((entry) => !entry.isEncore);
  const encoreEntries = setlist.filter((entry) => entry.isEncore);
  const posterMainTracks = mainEntries
    .map((entry) => songMap.get(entry.songId))
    .filter((song): song is SongItem => Boolean(song))
    .map((song) => ({ song }));
  const posterEncoreTracks = encoreEntries
    .map((entry) => songMap.get(entry.songId))
    .filter((song): song is SongItem => Boolean(song))
    .map((song) => ({ song }));

  const renderInlinePickerPanel = (target: 'main' | 'encore') => (
    <div
      className="mt-2 space-y-3 rounded-xl border border-[#D5CEC2] bg-[#F2EFE9] p-3 sm:p-4 shadow-xs"
      role="region"
      aria-label={target === 'encore' ? 'アンコールに曲を追加' : '本編に曲を追加'}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="曲の追加方法">
          {([['search', '曲名で探す'], ['album', 'アルバムから選ぶ']] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={songPickerMode === mode}
              onClick={() => setSongPickerMode(mode)}
              className={`min-h-[40px] rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer ${
                songPickerMode === mode
                  ? 'border-[#1C1917] bg-[#1C1917] text-white'
                  : 'border-[#D5CEC2] bg-white text-[#57534E] hover:border-[#1C1917]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPickerTarget(null)}
          aria-label="曲選択欄を閉じる"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#57534E] hover:bg-white hover:text-[#1C1917] cursor-pointer"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      {songPickerMode === 'search' && (
        <div>
          <label htmlFor="setlist-song-filter" className="mb-1 block text-xs font-bold text-[#1C1917]">
            曲を探して追加
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
            <input
              id="setlist-song-filter"
              ref={songSearchInputRef}
              type="search"
              maxLength={40}
              value={songSearchFilter}
              onChange={(e) => {
                const val = e.target.value.slice(0, 40);
                setSongSearchFilter(val);
                setShowAllSongMatches(false);
                const match = prepareSongSearch(val);
                if (match) {
                  const firstHit = songs
                    .map((song) => ({ song, rank: match(song) }))
                    .filter((item): item is { song: SongItem; rank: number } => item.rank !== undefined && !setlistIdSet.has(item.song.id))
                    .sort((a, b) => a.rank - b.rank || a.song.guideOrder - b.song.guideOrder)[0];
                  if (firstHit) setSelectedSongToAdd(firstHit.song.id);
                }
              }}
              placeholder="曲名・読み・アルバム名"
              className="w-full rounded-lg border border-[#D5CEC2] bg-white pl-9 pr-3 py-2 text-base sm:text-sm text-[#1C1917] min-h-[44px]"
            />
          </div>
        </div>
      )}

      {songPickerMode === 'search' && !songSearchFilter.trim() && (
        <div className="rounded-lg border border-[#E6E1D6] bg-white p-2" aria-label="追加できる代表曲">
          <p className="px-2 py-1 text-xs font-bold text-[#57534E]">
            {initialSuggestedSongs.length
              ? '文字を入力して全90曲から検索（未入力時はまだ入っていない代表曲を表示中）'
              : '全90曲がすでにセットリストに追加されています。'}
          </p>
          {initialSuggestedSongs.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {initialSuggestedSongs.map((song) => (
                <button
                  key={song.id}
                  type="button"
                  aria-label={`${song.title}を${target === 'encore' ? 'アンコール' : '本編'}に追加`}
                  onClick={() => onAddSong(song.id, target === 'encore')}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-[#FBF9F5] focus-visible:outline-2 focus-visible:outline-[#1C1917] cursor-pointer"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold wrap-anywhere">{song.title}</span>
                    <span className="block text-xs text-[#57534E]">{song.album}</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-[#9B3021]">＋ 追加</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {songPickerMode === 'search' && songSearchFilter.trim() && (
        <div className="rounded-lg border border-[#E6E1D6] bg-white p-2" aria-label="曲の検索結果">
          <p className="px-2 py-1 text-xs font-bold text-[#57534E]" role="status">
            {visibleSongs.length ? `${visibleSongs.length}曲見つかりました。曲を押して追加できます。` : '曲が見つかりませんでした。'}
          </p>
          {visibleSongs.length > 0 && (
            <div className="max-h-72 overflow-y-auto">
              {visibleSongs.slice(0, showAllSongMatches ? undefined : 6).map((song) => {
                const alreadyIn = setlistIdSet.has(song.id);
                return (
                  <button
                    key={song.id}
                    type="button"
                    disabled={alreadyIn}
                    aria-label={alreadyIn ? `${song.title}は追加済み` : `${song.title}を${target === 'encore' ? 'アンコール' : '本編'}に追加`}
                    onClick={() => onAddSong(song.id, target === 'encore')}
                    className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-[#FBF9F5] focus-visible:outline-2 focus-visible:outline-[#1C1917] disabled:opacity-55 cursor-pointer"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold wrap-anywhere">{song.title}</span>
                      <span className="block text-xs text-[#57534E]">{song.album}</span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-[#9B3021]">{alreadyIn ? '追加済み' : '＋ 追加'}</span>
                  </button>
                );
              })}
            </div>
          )}
          {visibleSongs.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllSongMatches((value) => !value)}
              className="min-h-[40px] px-2 text-xs font-bold text-[#1E3A5F] underline underline-offset-2 cursor-pointer"
            >
              {showAllSongMatches ? '候補を閉じる' : `ほかの${visibleSongs.length - 6}曲も見る`}
            </button>
          )}
        </div>
      )}

      {songPickerMode === 'album' && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-48">
            <label htmlFor="add-song-select" className="mb-1 block text-xs font-bold text-[#57534E]">
              追加する曲を選択
            </label>
            <select
              id="add-song-select"
              ref={albumSongSelectRef}
              value={selectedSongToAdd}
              onChange={(e) => setSelectedSongToAdd(e.target.value)}
              className="w-full rounded-lg border border-[#D5CEC2] bg-white px-3 py-2 text-base sm:text-sm font-bold text-[#1C1917] min-h-[44px]"
            >
              {selectableSongsByAlbum.map(([albumName, groupSongs]) => (
                <optgroup key={albumName} label={`収録：${albumName}`}>
                  {groupSongs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                      {setlistIdSet.has(s.id) ? '（追加済み）' : `（${formatDuration(s.durationSec)}）`}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={isSelectedAlreadyInSetlist}
            onClick={handleAddSelectedSong}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
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
      )}
    </div>
  );

  const renderTrackRow = (entry: SetlistEntry, sectionIdx: number, isEncoreSection: boolean) => {
    const song = songMap.get(entry.songId);
    if (!song) return null;
    const idx = setlist.findIndex((item) => item.songId === entry.songId);
    if (idx < 0) return null;
    const trackBadge = entry.isEncore ? `EN${sectionIdx + 1}` : `M${(sectionIdx + 1).toString().padStart(2, '0')}`;
    const isFirstMain = !isEncoreSection && sectionIdx === 0;
    const isLastEncore = isEncoreSection && sectionIdx === encoreEntries.length - 1;

    return (
      <li
        key={entry.songId}
        data-song-id={entry.songId}
        className={`setlist-track grid min-w-0 items-center ${
          isCompleteView ? 'grid-cols-[minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_24px] gap-1.5'
        }`}
      >
        <div
          className={`setlist-track-card grid min-h-[52px] min-w-0 items-center gap-1.5 rounded-lg border border-[#E6E1D6] px-2 py-2 ${
            isCompleteView ? 'grid-cols-[24px_minmax(0,1fr)]' : 'grid-cols-[24px_minmax(0,1fr)_28px]'
          } ${entry.isEncore ? 'bg-[#FEF8EC]' : 'bg-white'}`}
        >
          <span className={`font-mono-num text-[11px] font-medium ${entry.isEncore ? 'text-[#B45309]' : 'text-[#78716C]'}`}>
            {trackBadge}
          </span>
          {onSelectSong ? (
            <button
              type="button"
              onClick={() => onSelectSong(song)}
              className="setlist-track-title min-w-0 wrap-anywhere text-left text-[18px] font-semibold leading-6 text-[#1C1917] hover:text-[#C83E2B] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-xl sm:leading-7 cursor-pointer"
            >
              {song.title}
            </button>
          ) : (
            <span className="setlist-track-title min-w-0 wrap-anywhere text-[18px] font-semibold leading-6 text-[#1C1917] sm:text-xl sm:leading-7">
              {song.title}
            </span>
          )}
          {!isCompleteView && (
            <button
              type="button"
              onClick={() => onRemoveSong(song.id)}
              aria-label={`${song.title}をセットリストから外す`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#78716C] hover:bg-[#F2EFE9] hover:text-[#A93020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] transition-colors cursor-pointer"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {!isCompleteView && (
          <div className="setlist-move-controls flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onMoveSong(idx, 'up')}
              disabled={isFirstMain}
              aria-label={`${song.title}を1つ上へ移動`}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-[#78716C] hover:bg-[#E6E1D6] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-25 cursor-pointer"
            >
              <ArrowUp aria-hidden="true" className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onMoveSong(idx, 'down')}
              disabled={isLastEncore}
              aria-label={`${song.title}を1つ下へ移動`}
              className="inline-flex h-6 w-6 items-center justify-center rounded text-[#78716C] hover:bg-[#E6E1D6] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-25 cursor-pointer"
            >
              <ArrowDown aria-hidden="true" className="h-3 w-3" />
            </button>
          </div>
        )}
      </li>
    );
  };

  const renderInlineAddRow = (target: 'main' | 'encore', label: string) => {
    if (isCompleteView) return null;
    return (
      <li key={`add-${target}`} className="pt-0.5">
        <div className="flex min-h-[36px] items-center justify-between gap-1 rounded-lg border border-dashed border-[#D5CEC2] bg-[#FBF9F5]/90 px-2 py-0.5">
          <button
            type="button"
            onClick={() => openPickerFor(target)}
            aria-expanded={pickerTarget === target}
            className="inline-flex min-h-[30px] flex-1 items-center gap-1.5 rounded-md px-1.5 text-left text-xs font-semibold text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917] cursor-pointer"
          >
            <Plus aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#C83E2B]" />
            <span>{label}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPickerTarget(null);
              setIsCompleteView(true);
            }}
            aria-label="曲の追加・編集ツールを閉じる"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#78716C] hover:bg-[#E6E1D6] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
        {pickerTarget === target && renderInlinePickerPanel(target)}
      </li>
    );
  };

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
                : 'ライブで聴きたい曲を好きな順に並べて、自分だけのステージを組み立てよう。曲順の流れや熱量の変化もそのまま味わえます。'}
            </p>
          </div>
        </div>

        {activeSubTab === 'builder' ? (
          <div className="mt-4 space-y-4">
            <div ref={setlistPaperRef} className="scroll-mt-20">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
                {isEditingTitle ? (
                  <div className="flex w-full items-center gap-2 sm:flex-1">
                    <input
                      id="setlist-title-input"
                      ref={titleInputRef}
                      type="text"
                      aria-label="マイセットリストのタイトル"
                      maxLength={SETLIST_TITLE_LIMIT}
                      value={setlistTitle}
                      onChange={(e) =>
                        onChangeTitle(
                          e.target.value.replace(/[<>＜＞\u0000-\u001F]/g, '').slice(0, SETLIST_TITLE_LIMIT)
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                          setIsEditingTitle(false);
                        }
                      }}
                      className="min-w-0 flex-1 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-1.5 text-sm font-bold text-[#1C1917] min-h-[36px] focus:outline-none focus:ring-2 focus:ring-[#1C1917]"
                      placeholder="例: 私が聴きたい！夢のスタジアムライブ"
                    />
                    <span className="shrink-0 text-[11px] font-mono-num text-[#78716C]">
                      {setlistTitle.length}/{SETLIST_TITLE_LIMIT}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(false)}
                      aria-label="タイトル編集を完了"
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1C1917] text-white hover:bg-[#3A3531] cursor-pointer"
                    >
                      <Check aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-1 sm:flex-1">
                    <h3
                      id="setlist-tracks-heading"
                      title={safeDisplayTitle}
                      className="line-clamp-2 min-w-0 wrap-anywhere text-[15px] font-semibold leading-6 text-[#1C1917]"
                    >
                      {safeDisplayTitle}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      aria-label="セットリスト名を編集"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#78716C] hover:bg-[#F2EFE9] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917] cursor-pointer"
                    >
                      <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs text-[#78716C]">
                    {stats.totalSongs}曲 · <span ref={durationLabelRef} className="rounded-sm">{stats.formattedDuration}</span>
                  </p>
                  {isCompleteView && (
                    <button
                      type="button"
                      onClick={() => setIsCompleteView(false)}
                      aria-label="セットリストの追加・並び替えを開く"
                      className="inline-flex min-h-7 items-center gap-1 rounded-md border border-[#D5CEC2] bg-white px-2.5 py-0.5 text-xs font-medium text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] cursor-pointer"
                    >
                      <Pencil aria-hidden="true" className="h-3 w-3" />
                      <span>編集</span>
                    </button>
                  )}
                </div>
              </div>

              <ol aria-label="マイセットリストの曲順" className="list-none space-y-1.5 p-0">
                {mainEntries.length === 0 && encoreEntries.length === 0 ? (
                  <li className="rounded-lg border border-[#E6E1D6] bg-white p-5 text-sm leading-relaxed text-[#57534E]">
                    まだ曲がありません。「ここに曲を追加」から、聴きたい曲を選んでみましょう。
                  </li>
                ) : (
                  mainEntries.map((entry, mIdx) => renderTrackRow(entry, mIdx, false))
                )}
                {renderInlineAddRow('main', 'ここに曲を追加')}
                {encoreEntries.map((entry, eIdx) => renderTrackRow(entry, eIdx, true))}
                {renderInlineAddRow('encore', 'アンコールに曲を追加')}
              </ol>

              <div className="mt-3 space-y-2">
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
                <button
                  type="button"
                  disabled={setlist.length === 0}
                  onClick={() => setIsImageModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#D5CEC2] bg-white px-4 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                >
                  <ImageIcon aria-hidden="true" className="h-4 w-4 text-[#C83E2B]" />
                  {setlist.length === 0
                    ? '1枚の画像として作成・保存（1曲以上追加すると作成できます）'
                    : '1枚の画像として作成・保存（SNSシェア用）'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E6E1D6] bg-white p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#1C1917]">
                  保存したマイセットリスト
                  <span className="ml-2 text-xs font-mono-num font-normal text-[#78716C]">
                    {savedSetlists.items.length}件
                  </span>
                </h3>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCreateBlankSetlist}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#1C1917] bg-[#1C1917] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#3A3531] cursor-pointer"
                  >
                    <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                    新しいセトリ
                  </button>
                  <button
                    type="button"
                    onClick={handleDuplicateCurrentSetlist}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-1 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    複製
                  </button>
                  <button
                    type="button"
                    onClick={() => onLoadPresetSetlist(ROYAL_ROAD_PRESET, 'スタジアム王道ベストセトリ')}
                    className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-1 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] cursor-pointer"
                  >
                    <RotateCcw aria-hidden="true" className="h-3 w-3 text-[#1E3A5F]" />
                    王道読込
                  </button>
                </div>
              </div>

              <ul aria-label="保存したマイセットリスト一覧" className="space-y-1.5">
                {savedSetlists.items.map((item) => {
                  const isActive = item.id === savedSetlists.activeId;
                  const itemStats = calculateSetlistStats(item.entries, songs);
                  return (
                    <li
                      key={item.id}
                      className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors ${
                        isActive
                          ? 'border-[#C83E2B] bg-[#FFF8F6]'
                          : 'border-[#E6E1D6] bg-[#FBF9F5] hover:border-[#1C1917]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSwitchSavedSetlist(item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left cursor-pointer"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm font-bold text-[#1C1917]">
                            {item.title}
                          </span>
                          {isActive && (
                            <span className="shrink-0 rounded-full bg-[#C83E2B]/12 px-2 py-0.5 text-[10px] font-bold text-[#A93020]">
                              編集中
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-xs font-mono-num text-[#78716C]">
                          {itemStats.totalSongs}曲 · {itemStats.formattedDuration}
                        </span>
                      </button>
                      {savedSetlists.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSavedSetlist(item.id, item.title)}
                          aria-label={`${item.title}を削除`}
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#78716C] hover:bg-white hover:text-[#A93020] cursor-pointer"
                        >
                          <X aria-hidden="true" className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
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

            <p className="text-center text-[11px] text-[#78716C]">
              ※ 作成したセットリストや記録はお使いのブラウザ内に保存されます（バックアップ・初期化は{' '}
              <a href="#privacy" className="underline underline-offset-2 hover:text-[#1C1917]">
                プライバシーポリシー
              </a>{' '}
              から）。
            </p>
          </div>
        ) : (
          <>
            <TourArchiveSection attendedTourIds={attendedTourIds} onToggleAttendedTour={onToggleAttendedTour} />
            <p className="mt-4 text-center text-[11px] text-[#78716C]">
              ※ 参戦・視聴の記録はお使いのブラウザ内に保存されます（バックアップ・初期化は{' '}
              <a href="#privacy" className="underline underline-offset-2 hover:text-[#1C1917]">
                プライバシーポリシー
              </a>{' '}
              から）。
            </p>
          </>
        )}
      </div>

      <SetlistImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title={safeDisplayTitle}
        mainTracks={posterMainTracks}
        encoreTracks={posterEncoreTracks}
        formattedDuration={stats.formattedDuration}
      />
    </section>
  );
};
