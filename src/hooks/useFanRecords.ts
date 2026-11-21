import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { VERIFIED_SONG_BY_ID, VERIFIED_SONG_IDS } from '../data/fullCatalogSongs';
import type { FanReview, SongItem } from '../data/higedanTypes';
import { safeRandomUuid } from '../utils/browserStorage';
import { formatDateDot } from '../utils/format';
import { sanitizeSafeId, sanitizeUserText } from '../utils/userInput';
import { createFanRecordStore, DEFAULT_SETLIST_TITLE, songsWithVotes, type Change } from './fanRecordStore';
import { normalizeSetlistOrder, sanitizeSetlistEntries, SETLIST_TITLE_LIMIT, sanitizeSetlistTitle, type SetlistEntry } from '../utils/setlist';
import { STORAGE_KEY } from './fanRecordStorage';
import {
  clearMyNoteProfileStorage,
  clearSetlistShareImageGeneratedStorage,
  loadMyNoteProfile,
  loadSetlistShareImageGenerated,
  persistMyNoteProfile,
  recordMyNoteFeatureVisited,
  recordSetlistShareImageGenerated,
} from '../utils/myNoteProfile';

type ReviewFields = Omit<FanReview, 'id' | 'postedAt' | 'likes'>;
const songIds = new Set(VERIFIED_SONG_IDS);
function addId(ids: string[], id: string) { return ids.includes(id) ? ids : [...ids, id]; }
function matchesReview(a: FanReview, b: FanReview) {
  return a.title === b.title && a.comment === b.comment && a.author === b.author &&
    a.category === b.category && a.fanTenure === b.fanTenure && a.songId === b.songId;
}

export function useFanRecords(showToast: (message: string) => void) {
  const [store] = useState(createFanRecordStore);
  const {records, notice: storageNotice} = useSyncExternalStore(store.subscribe, store.snapshot);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const change = useCallback(
    (apply: Change) => store.change(apply, store.snapshot().records.resetEpoch),
    [store],
  );
  const songs = useMemo(() => songsWithVotes(records.votedKeys), [records.votedKeys]);
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) store.refresh();
    };
    window.addEventListener('storage', refresh);
    void store.initialize();
    return () => window.removeEventListener('storage', refresh);
  }, [store]);

  const addToSetlist = useCallback(async (id: string, isEncore = false) => {
    const song = VERIFIED_SONG_BY_ID.get(id);
    if (!song) return;
    const current = store.snapshot().records;
    if (current.setlist.some(s => s.songId === id)) {
      showToastRef.current(`「${song.title}」はすでにMYセトリに入っています。`);
      return;
    }
    const result = await store.addToSetlist(id, isEncore, current.resetEpoch);
    if (result === 'saved') showToastRef.current(`「${song.title}」をMYセトリに追加しました！`);
  }, [store]);

  const removeFromSetlist = useCallback((id: string) => {
    const song = VERIFIED_SONG_BY_ID.get(id);
    if (!song) return;
    void change(r => ({...r, setlist: r.setlist.filter(e => e.songId !== id)}));
    showToastRef.current(`「${song.title}」をセットリストから外しました。`);
  }, [change]);

  const moveSetlistSong = useCallback((index: number, direction: 'up' | 'down' | 'top') => {
    const selected = store.snapshot().records.setlist[index];
    if (!selected) return;
    void change(r => {
      const mains = r.setlist.filter(e => !e.isEncore);
      const encores = r.setlist.filter(e => e.isEncore);
      const mi = mains.findIndex(e => e.songId === selected.songId);
      const ei = encores.findIndex(e => e.songId === selected.songId);
      if (mi < 0 && ei < 0) return null;

      if (mi >= 0) {
        const [item] = mains.splice(mi, 1);
        if (direction === 'top') {
          mains.unshift(item);
        } else if (direction === 'up') {
          mains.splice(Math.max(0, mi - 1), 0, item);
        } else if (mi < mains.length) {
          mains.splice(mi + 1, 0, item);
        } else {
          // Last Main song pressed down -> flip to EN1
          encores.unshift({...item, isEncore: true});
        }
      } else {
        const [item] = encores.splice(ei, 1);
        if (direction === 'top') {
          encores.unshift(item);
        } else if (direction === 'up') {
          if (ei === 0) {
            // EN1 pressed up -> flip to last Main song
            mains.push({...item, isEncore: false});
          } else {
            encores.splice(ei - 1, 0, item);
          }
        } else {
          encores.splice(Math.min(encores.length, ei + 1), 0, item);
        }
      }

      return {...r, setlist: [...mains, ...encores]};
    });
  }, [change, store]);

  const toggleEncore = useCallback((index: number) => {
    const current = store.snapshot().records.setlist[index];
    if (current) void change(r => ({...r, setlist: normalizeSetlistOrder(r.setlist.map(e =>
      e.songId === current.songId ? {...e, isEncore: !current.isEncore} : e))}));
  }, [change, store]);

  const loadPresetSetlist = useCallback((
    entries: SetlistEntry[],
    title: string,
    { skipConfirm = false }: { skipConfirm?: boolean } = {},
  ) => {
    const setlist = sanitizeSetlistEntries(entries, songIds);
    if (!setlist) return false;
    const setlistTitle = sanitizeUserText(title, SETLIST_TITLE_LIMIT) || 'MYセトリ';
    const current = store.snapshot().records;
    const custom = current.setlistTitle.trim();
    if (!skipConfirm && (current.setlist.length > 0 || (custom && custom !== DEFAULT_SETLIST_TITLE)) &&
        !window.confirm(`今のセトリの名前と曲順を「${setlistTitle}」の選曲に置き換えますか？`)) return false;
    const previousOrder = JSON.stringify(current.setlist);
    void change(r => r.setlistTitle === current.setlistTitle && JSON.stringify(r.setlist) === previousOrder
      ? {...r, setlist, setlistTitle} : null)
      .then(result => { if (result === 'saved') showToastRef.current(`「${setlistTitle}」のセットリストを読み込みました！`); });
    return true;
  }, [change, store]);

  const changeTitle = useCallback((value: string) => {
    const expected = store.snapshot().records.setlistTitle;
    const setlistTitle = sanitizeSetlistTitle(value);
    void change(r => r.setlistTitle === expected || r.setlistTitle === setlistTitle ? {...r, setlistTitle} : null);
  }, [change, store]);

  const toggleVisitedSpot = useCallback((id: string) => {
    void change(r => ({
      ...r,
      visitedSpotIds: r.visitedSpotIds.includes(id)
        ? r.visitedSpotIds.filter(v => v !== id)
        : addId(r.visitedSpotIds, id),
    }));
  }, [change]);

  const toggleAttendedTour = useCallback((id: string) => {
    void change(r => ({
      ...r,
      attendedTourIds: r.attendedTourIds.includes(id)
        ? r.attendedTourIds.filter(v => v !== id)
        : addId(r.attendedTourIds, id),
    }));
  }, [change]);

  const voteSong = useCallback(async (id: string, category: keyof SongItem['votes']) => {
    const song = VERIFIED_SONG_BY_ID.get(id);
    if (!song) return;
    const result = await change(r => ({...r, votedKeys: addId(r.votedKeys, id + ':' + category)}));
    if (result === 'saved') showToastRef.current(`「${song.title}」に1票投じました！`);
  }, [change]);

  const likeReview = useCallback((id: string) => {
    void change(r => !r.reviews.some(e => e.id === id) ? null : {
      ...r, likedReviewIds: addId(r.likedReviewIds, id),
      reviews: r.reviews.map(e => e.id === id ? {...e, likes: 1} : e),
    });
  }, [change]);

  const submitReview = useCallback((fields: ReviewFields) => {
    const review: FanReview = {
      ...fields, id: 'rev-' + safeRandomUuid(), postedAt: formatDateDot(), likes: 0,
      author: sanitizeUserText(fields.author, 30), fanTenure: sanitizeUserText(fields.fanTenure, 30),
      songId: sanitizeSafeId(fields.songId, 40), title: sanitizeUserText(fields.title, 60),
      comment: sanitizeUserText(fields.comment, 400),
    };
    return change(r => ({...r, reviews: [review, ...r.reviews]}));
  }, [change]);

  const editReview = useCallback((original: FanReview, fields: ReviewFields) => change(r => {
    const latest = r.reviews.find(e => e.id === original.id);
    if (!latest || !matchesReview(latest, original)) return null;
    const allowedCategories = new Set(['歌詞考察', 'ライブ体験', '楽曲アレンジ', '人生の支え']);
    const cleanSongId = sanitizeSafeId(fields.songId, 40);
    const cleanFields: ReviewFields = {
      author: sanitizeUserText(fields.author, 30) || latest.author,
      fanTenure: sanitizeUserText(fields.fanTenure, 30) || latest.fanTenure,
      songId: songIds.has(cleanSongId) ? cleanSongId : latest.songId,
      category: allowedCategories.has(fields.category) ? fields.category : latest.category,
      title: sanitizeUserText(fields.title, 60) || latest.title,
      comment: sanitizeUserText(fields.comment, 400) || latest.comment,
    };
    return {...r, reviews: r.reviews.map(e => e.id === original.id ? {...e, ...cleanFields} : e)};
  }), [change]);

  const deleteReview = useCallback((id: string) => {
    const original = store.snapshot().records.reviews.find(e => e.id === id);
    void change(r => {
      const latest = r.reviews.find(e => e.id === id);
      if (latest && original && !matchesReview(latest, original)) return null;
      return {...r, reviews: r.reviews.filter(e => e.id !== id), likedReviewIds: r.likedReviewIds.filter(e => e !== id)};
    });
  }, [change, store]);

  const updateBestQuizScore = useCallback((value: number) => {
    const score = Math.max(0, Math.min(100, Math.round(value)));
    void change(r => ({...r, bestQuizScore: Math.max(r.bestQuizScore ?? 0, score)}));
  }, [change]);

  const replaceSetlistSilently = useCallback((entries: SetlistEntry[], title: string) => {
    const setlist = sanitizeSetlistEntries(entries, songIds) ?? normalizeSetlistOrder(entries);
    const setlistTitle = sanitizeSetlistTitle(title) || 'MYセトリ';
    void change(r => ({...r, setlist, setlistTitle}));
  }, [change]);

  const resetAllUserData = useCallback(async ({ skipConfirm = false }: { skipConfirm?: boolean } = {}) => {
    if (!skipConfirm && !window.confirm('このブラウザに保存した記録をすべて初期化しますか？\n\nMYセトリは初期状態に戻ります。非公開中の感想・共感・投票を含め、マイノート（お名前・楽曲ページの閲覧やスタンプの進捗）、聖地の訪問、ツアーの参戦・視聴、検定の最高正答率・セット別の記録、診断の回答とクイズの途中経過は消去されます。')) return;
    const current = store.snapshot().records;
    if (await store.reset(current.resetEpoch)) {
      const [{ clearSavedSetlistsStorage }, { clearQuizVolumeScoresStorage }] = await Promise.all([
        import('../utils/savedSetlists'),
        import('../components/quiz/quizVolumeRecords'),
      ]);
      clearSavedSetlistsStorage();
      clearQuizVolumeScoresStorage();
      clearMyNoteProfileStorage();
      showToastRef.current('保存データを初期状態にリセットしました。');
    }
  }, [store]);

  const downloadRecords = useCallback(() => {
    const current = store.snapshot().records;
    const epoch = current.resetEpoch;
    recordMyNoteFeatureVisited('backup_export', epoch);
    void Promise.all([
      import('./fanRecordBackup'),
      import('../utils/savedSetlists'),
      import('../components/quiz/quizVolumeRecords'),
    ]).then(([
      { createFanRecordBackup },
      { readStoredSavedSetlists, syncActiveSavedSetlist },
      { loadQuizVolumeScores },
    ]) => {
      const myNoteProfile = loadMyNoteProfile(epoch, undefined, songIds);
      const setlistShareImageGenerated = loadSetlistShareImageGenerated(epoch);
      const storedSetlists = readStoredSavedSetlists(songIds, { expectedEpoch: epoch });
      const syncedSetlists = storedSetlists
        ? syncActiveSavedSetlist(storedSetlists, current.setlistTitle || DEFAULT_SETLIST_TITLE, current.setlist)
        : null;
      const quizVolumeScores = loadQuizVolumeScores(epoch);
      const url = URL.createObjectURL(
        new Blob([createFanRecordBackup(current, syncedSetlists, quizVolumeScores, myNoteProfile, setlistShareImageGenerated)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'higedanfan-records.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    });
  }, [store]);

  const importRecords = useCallback(async (file: File) => {
    try {
      if (file.size > 2_000_000) throw new Error('記録ファイルが大きすぎます。');
      const { parseFanRecordBackupWithSetlists } = await import('./fanRecordBackup');
      const { records: imported, savedSetlists, quizVolumeScores, myNoteProfile, setlistShareImageGenerated } = parseFanRecordBackupWithSetlists(await file.text());
      if (!window.confirm('このブラウザのMYセトリ、参戦・訪問、クイズなどの記録を、ファイルの内容に置き換えます。\n\n今の記録も残したい場合は、先に「記録を書き出す」を押してください。読み込みますか？')) return;
      const current = store.snapshot().records;
      if (await store.importBackup(imported, current)) {
        const nextEpoch = store.snapshot().records.resetEpoch;
        const [
          { clearSavedSetlistsStorage, persistSavedSetlists },
          { clearQuizVolumeScoresStorage, persistQuizVolumeScores },
        ] = await Promise.all([
          import('../utils/savedSetlists'),
          import('../components/quiz/quizVolumeRecords'),
        ]);
        if (savedSetlists) persistSavedSetlists(savedSetlists, { validSongIds: songIds, expectedEpoch: nextEpoch, replace: true });
        else clearSavedSetlistsStorage();
        if (quizVolumeScores) persistQuizVolumeScores(quizVolumeScores, nextEpoch);
        else clearQuizVolumeScoresStorage();
        if (myNoteProfile) persistMyNoteProfile(myNoteProfile, nextEpoch);
        else clearMyNoteProfileStorage();
        if (setlistShareImageGenerated) recordSetlistShareImageGenerated(nextEpoch);
        else clearSetlistShareImageGeneratedStorage();
        showToastRef.current('記録を読み込みました。');
      }
      else showToastRef.current('読み込めませんでした。別タブの変更や保存状態を確認してください。');
    } catch {
      showToastRef.current('記録ファイルを読み込めませんでした。元の記録は残っています。');
    }
  }, [store]);

  return useMemo(() => ({
    ...records, songs, storageNotice, downloadRecords, importRecords, addToSetlist, removeFromSetlist, moveSetlistSong, toggleEncore,
    changeTitle, loadPresetSetlist, replaceSetlistSilently, toggleVisitedSpot,
    toggleAttendedTour, voteSong, likeReview,
    submitReview, editReview, deleteReview, updateBestQuizScore, resetAllUserData,
  }), [
    records, songs, storageNotice, downloadRecords, importRecords, addToSetlist, removeFromSetlist, moveSetlistSong, toggleEncore,
    changeTitle, loadPresetSetlist, replaceSetlistSilently, toggleVisitedSpot, toggleAttendedTour, voteSong, likeReview,
    submitReview, editReview, deleteReview, updateBestQuizScore, resetAllUserData,
  ]);
}
