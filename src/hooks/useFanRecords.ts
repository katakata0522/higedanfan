import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HIGEDAN_SONGS, type FanReview, type SongItem } from '../data/higedanData';
import { formatDateDot, normalizeSetlistOrder, sanitizeSafeId, sanitizeSetlistEntries, sanitizeUserText, type SetlistEntry } from '../utils/fanLogic';
import { createFanRecordStore, DEFAULT_SETLIST_TITLE, songsWithVotes, type Change } from './fanRecordStore';
import { SETLIST_TITLE_LIMIT, sanitizeSetlistTitle } from '../utils/setlist';
import {
  clearSavedSetlistsStorage,
  persistSavedSetlists,
  readStoredSavedSetlists,
  syncActiveSavedSetlist,
} from '../utils/savedSetlists';
import { STORAGE_KEY } from './fanRecordStorage';
import { createFanRecordBackup, parseFanRecordBackupWithSetlists } from './fanRecordBackup';

type ReviewFields = Omit<FanReview, 'id' | 'postedAt' | 'likes'>;
const songIds = new Set(HIGEDAN_SONGS.map(song => song.id));
function addId(ids: string[], id: string) { return ids.includes(id) ? ids : [...ids, id]; }
function matchesReview(a: FanReview, b: FanReview) {
  return a.title === b.title && a.comment === b.comment && a.author === b.author &&
    a.category === b.category && a.fanTenure === b.fanTenure && a.songId === b.songId;
}

export function useFanRecords(showToast: (message: string) => void) {
  const [store] = useState(createFanRecordStore);
  const {records, notice: storageNotice} = useSyncExternalStore(store.subscribe, store.snapshot);
  const change = (apply: Change) => store.change(apply, records.resetEpoch);
  const songs = useMemo(() => songsWithVotes(records.votedKeys), [records.votedKeys]);
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) store.refresh();
    };
    window.addEventListener('storage', refresh);
    void store.initialize();
    return () => window.removeEventListener('storage', refresh);
  }, [store]);

  const addToSetlist = async (id: string, isEncore = false) => {
    const song = HIGEDAN_SONGS.find(s => s.id === id);
    if (!song) return;
    if (records.setlist.some(s => s.songId === id)) {
      showToast(`「${song.title}」はすでにマイセトリに入っています。`);
      return;
    }
    const result = await store.addToSetlist(id, isEncore, records.resetEpoch);
    if (result === 'saved') showToast(`「${song.title}」をマイセトリに追加しました！`);
  };
  const removeFromSetlist = (id: string) => {
    const song = HIGEDAN_SONGS.find(s => s.id === id);
    if (!song) return;
    void change(r => ({...r, setlist: r.setlist.filter(e => e.songId !== id)}));
    showToast(`「${song.title}」をセットリストから外しました。`);
  };
  const moveSetlistSong = (index: number, direction: 'up' | 'down' | 'top') => {
    const selected = records.setlist[index];
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
  };
  const toggleEncore = (index: number) => {
    const current = records.setlist[index];
    if (current) void change(r => ({...r, setlist: normalizeSetlistOrder(r.setlist.map(e =>
      e.songId === current.songId ? {...e, isEncore: !current.isEncore} : e))}));
  };
  const loadPresetSetlist = (entries: SetlistEntry[], title: string) => {
    const setlist = sanitizeSetlistEntries(entries, songIds);
    if (!setlist) return false;
    const setlistTitle = sanitizeUserText(title, SETLIST_TITLE_LIMIT) || 'マイセットリスト';
    const custom = records.setlistTitle.trim();
    if ((records.setlist.length > 0 || (custom && custom !== DEFAULT_SETLIST_TITLE)) &&
        !window.confirm(`今のセトリの名前と曲順を「${setlistTitle}」の選曲に置き換えますか？`)) return false;
    const previousOrder = JSON.stringify(records.setlist);
    void change(r => r.setlistTitle === records.setlistTitle && JSON.stringify(r.setlist) === previousOrder
      ? {...r, setlist, setlistTitle} : null)
      .then(result => { if (result === 'saved') showToast(`「${setlistTitle}」のセットリストを読み込みました！`); });
    return true;
  };
  const changeTitle = (value: string) => {
    const expected = records.setlistTitle;
    const setlistTitle = sanitizeSetlistTitle(value);
    void change(r => r.setlistTitle === expected || r.setlistTitle === setlistTitle ? {...r, setlistTitle} : null);
  };
  function toggleMark(field: 'visitedSpotIds' | 'attendedTourIds', id: string) {
    const marked = records[field].includes(id);
    void change(r => ({...r, [field]: marked ? r[field].filter(v => v !== id) : addId(r[field], id)}));
  }
  const voteSong = async (id: string, category: keyof SongItem['votes']) => {
    const song = HIGEDAN_SONGS.find(s => s.id === id);
    if (!song) return;
    const result = await change(r => ({...r, votedKeys: addId(r.votedKeys, id + ':' + category)}));
    if (result === 'saved') showToast(`「${song.title}」に1票投じました！`);
  };
  const likeReview = (id: string) => {
    void change(r => !r.reviews.some(e => e.id === id) ? null : {
      ...r, likedReviewIds: addId(r.likedReviewIds, id),
      reviews: r.reviews.map(e => e.id === id ? {...e, likes: 1} : e),
    });
  };
  const submitReview = (fields: ReviewFields) => {
    const review: FanReview = {
      ...fields, id: 'rev-' + crypto.randomUUID(), postedAt: formatDateDot(), likes: 0,
      author: sanitizeUserText(fields.author, 30), fanTenure: sanitizeUserText(fields.fanTenure, 30),
      songId: sanitizeSafeId(fields.songId, 40), title: sanitizeUserText(fields.title, 60),
      comment: sanitizeUserText(fields.comment, 400),
    };
    return change(r => ({...r, reviews: [review, ...r.reviews]}));
  };
  const editReview = (original: FanReview, fields: ReviewFields) => change(r => {
    const latest = r.reviews.find(e => e.id === original.id);
    if (!latest || !matchesReview(latest, original)) return null;
    return {...r, reviews: r.reviews.map(e => e.id === original.id ? {...e, ...fields} : e)};
  });
  const deleteReview = (id: string) => {
    const original = records.reviews.find(e => e.id === id);
    void change(r => {
      const latest = r.reviews.find(e => e.id === id);
      if (latest && original && !matchesReview(latest, original)) return null;
      return {...r, reviews: r.reviews.filter(e => e.id !== id), likedReviewIds: r.likedReviewIds.filter(e => e !== id)};
    });
  };
  const updateBestQuizScore = (value: number) => {
    const score = Math.max(0, Math.min(100, Math.round(value)));
    void change(r => ({...r, bestQuizScore: Math.max(r.bestQuizScore ?? 0, score)}));
  };
  const replaceSetlistSilently = (entries: SetlistEntry[], title: string) => {
    const validIds = new Set(HIGEDAN_SONGS.map(s => s.id));
    const setlist = sanitizeSetlistEntries(entries, validIds) ?? normalizeSetlistOrder(entries);
    const setlistTitle = sanitizeSetlistTitle(title) || 'マイセットリスト';
    void change(r => ({...r, setlist, setlistTitle}));
  };
  const resetAllUserData = async () => {
    if (!window.confirm('このブラウザに保存した記録をすべて初期化しますか？\n\nマイセトリの名前と曲順は初期の見本に戻ります。非公開中の感想・共感・投票を含め、聖地の訪問、ツアーの参戦・視聴、検定の最高正答率、診断の回答とクイズの途中経過は消去されます。')) return;
    if (await store.reset(records.resetEpoch)) {
      clearSavedSetlistsStorage();
      showToast('保存データを初期状態にリセットしました。');
    }
  };
  const downloadRecords = () => {
    const storedSetlists = readStoredSavedSetlists(songIds);
    const syncedSetlists = storedSetlists
      ? syncActiveSavedSetlist(storedSetlists, records.setlistTitle || DEFAULT_SETLIST_TITLE, records.setlist)
      : null;
    const url = URL.createObjectURL(new Blob([createFanRecordBackup(records, syncedSetlists)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'higedanfan-records.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importRecords = async (file: File) => {
    try {
      if (file.size > 2_000_000) throw new Error('記録ファイルが大きすぎます。');
      const { records: imported, savedSetlists } = parseFanRecordBackupWithSetlists(await file.text());
      if (!window.confirm('このブラウザのマイセトリ、参戦・訪問、クイズなどの記録を、ファイルの内容に置き換えます。\n\n今の記録も残したい場合は、先に「記録を書き出す」を押してください。読み込みますか？')) return;
      if (await store.importBackup(imported, records)) {
        if (savedSetlists) persistSavedSetlists(savedSetlists);
        else clearSavedSetlistsStorage();
        showToast('記録を読み込みました。');
      }
      else showToast('読み込めませんでした。別タブの変更や保存状態を確認してください。');
    } catch {
      showToast('記録ファイルを読み込めませんでした。元の記録は残っています。');
    }
  };
  return {
    ...records, songs, storageNotice, downloadRecords, importRecords, addToSetlist, removeFromSetlist, moveSetlistSong, toggleEncore,
    changeTitle, loadPresetSetlist, replaceSetlistSilently, toggleVisitedSpot: (id: string) => toggleMark('visitedSpotIds', id),
    toggleAttendedTour: (id: string) => toggleMark('attendedTourIds', id), voteSong, likeReview,
    submitReview, editReview, deleteReview, updateBestQuizScore, resetAllUserData,
  };
}
