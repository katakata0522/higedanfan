import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { HIGEDAN_SONGS, type FanReview, type SongItem } from '../data/higedanData';
import { formatDateDot, normalizeSetlistOrder, sanitizeSafeId, sanitizeSetlistEntries, sanitizeUserText, type SetlistEntry } from '../utils/fanLogic';
import { createFanRecordStore, DEFAULT_SETLIST_TITLE, songsWithVotes, type Change } from './fanRecordStore';
import { SETLIST_TITLE_LIMIT, sanitizeSetlistTitle } from '../utils/setlist';
import { STORAGE_KEY } from './fanRecordStorage';

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
    if (!song || !window.confirm(`「${song.title}」をこのセットリストから外しますか？`)) return;
    void change(r => ({...r, setlist: r.setlist.filter(e => e.songId !== id)}));
  };
  const moveSetlistSong = (index: number, direction: 'up' | 'down' | 'top') => {
    const selected = records.setlist[index];
    if (!selected) return;
    void change(r => {
      const items = [...r.setlist];
      const from = items.findIndex(e => e.songId === selected.songId);
      if (from < 0 || items[from].isEncore !== selected.isEncore) return null;
      const to = direction === 'top' ? items.findIndex(e => e.isEncore === selected.isEncore) :
        from + (direction === 'up' ? -1 : 1);
      if (!items[to] || items[to].isEncore !== selected.isEncore || from === to) return r;
      items.splice(to, 0, ...items.splice(from, 1));
      return {...r, setlist: items};
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
  const resetAllUserData = async () => {
    if (!window.confirm('このブラウザに保存した記録をすべて初期化しますか？\n\nマイセトリの名前と曲順は初期の見本に戻ります。非公開中の感想・共感・投票を含め、聖地の訪問、ツアーの参戦・視聴、検定の最高正答率、診断の回答とクイズの途中経過は消去されます。')) return;
    if (await store.reset(records.resetEpoch)) showToast('保存データを初期状態にリセットしました。');
  };
  const downloadRecords = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(records, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'higedanfan-records.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return {
    ...records, songs, storageNotice, downloadRecords, addToSetlist, removeFromSetlist, moveSetlistSong, toggleEncore,
    changeTitle, loadPresetSetlist, toggleVisitedSpot: (id: string) => toggleMark('visitedSpotIds', id),
    toggleAttendedTour: (id: string) => toggleMark('attendedTourIds', id), voteSong, likeReview,
    submitReview, editReview, deleteReview, updateBestQuizScore, resetAllUserData,
  };
}
