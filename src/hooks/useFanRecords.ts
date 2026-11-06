import { useEffect, useMemo, useState } from 'react';
import {
  HIGEDAN_SONGS, type FanReview, type SongItem,
} from '../data/higedanData';
import {
  formatDateDot, normalizeSetlistOrder, sanitizeSafeId,
  sanitizeSetlistEntries, sanitizeUserText, type SetlistEntry,
} from '../utils/fanLogic';

import { restoreFanRecords, STORAGE_KEY, type PersistedState } from './fanRecordStorage';

const DEFAULT_SETLIST_TITLE = '私が聴きたい！夢のスタジアムライブ';
const DEFAULT_SETLIST: SetlistEntry[] = [
  { songId: 'same-blue', isEncore: false },
  { songId: 'mixed-nuts', isEncore: false },
  { songId: '115man-kilo', isEncore: false },
  { songId: 'subtitle', isEncore: false },
  { songId: 'sharon', isEncore: false },
  { songId: 'soulsoup', isEncore: false },
  { songId: 'pretender', isEncore: true },
  { songId: 'stand-by-you', isEncore: true },
];

export function useFanRecords(showToast: (message: string) => void) {
  const [songs, setSongs] = useState<SongItem[]>(HIGEDAN_SONGS);
  const [setlist, setSetlist] = useState<SetlistEntry[]>(DEFAULT_SETLIST);
  const [setlistTitle, setSetlistTitle] = useState(DEFAULT_SETLIST_TITLE);
  const [visitedSpotIds, setVisitedSpotIds] = useState<string[]>([]);
  const [attendedTourIds, setAttendedTourIds] = useState<string[]>([]);
  const [votedKeys, setVotedKeys] = useState<string[]>([]);
  const [reviews, setReviews] = useState<FanReview[]>([]);
  const [likedReviewIds, setLikedReviewIds] = useState<string[]>([]);
  const [bestQuizScore, setBestQuizScore] = useState<number>(0);
  const [storageReady, setStorageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState('');
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setStorageReady(true);
        return;
      }
      const record = restoreFanRecords(raw);
      setSongs(record.songs);
      if (record.setlist) setSetlist(record.setlist);
      if (record.setlistTitle) setSetlistTitle(record.setlistTitle);
      if (record.visitedSpotIds) setVisitedSpotIds(record.visitedSpotIds);
      if (record.attendedTourIds) setAttendedTourIds(record.attendedTourIds);
      if (record.votedKeys) setVotedKeys(record.votedKeys);
      if (record.reviews) setReviews(record.reviews);
      if (record.likedReviewIds) setLikedReviewIds(record.likedReviewIds);
      if (record.bestQuizScore !== undefined) setBestQuizScore(record.bestQuizScore);
      setStorageReady(true);
    } catch {
      setStorageNotice("保存データを読めませんでした。元の記録は上書きしません。");
    }
  }, []);

  const savedVotes = useMemo(
    () => songs.map(({ id, votes }) => ({ id, votes })),
    [songs]
  );

  // Save only after restoring the original record.
  useEffect(() => {
    if (!storageReady) return;
    try {
      const stateToSave: PersistedState = {
        songs: savedVotes,
        setlist,
        setlistTitle: sanitizeUserText(setlistTitle, 160),
        visitedSpotIds,
        attendedTourIds,
        votedKeys,
        reviews,
        likedReviewIds,
        bestQuizScore,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      setStorageNotice('');
    } catch {
      setStorageNotice("この端末に保存できません。画面を閉じる前に記録を書き出してください。");
    }
  }, [
    storageReady,
    savedVotes,
    setlist,
    setlistTitle,
    visitedSpotIds,
    attendedTourIds,
    votedKeys,
    reviews,
    likedReviewIds,
    bestQuizScore,
  ]);

  const addToSetlist = (songId: string, isEncore = false) => {
    const cleanId = sanitizeSafeId(songId, 40);
    const targetSong = songs.find((s) => s.id === cleanId);
    if (!targetSong) return;
    if (setlist.some((item) => item.songId === cleanId)) {
      showToast(`「${targetSong.title}」はすでにマイセトリに入っています。`);
      return;
    }
    setSetlist((prev) =>
      normalizeSetlistOrder([...prev, { songId: cleanId, isEncore }])
    );
    showToast(`「${targetSong.title}」をマイセトリに追加しました！`);
  };

  const removeFromSetlist = (songId: string) => {
    const song = songs.find(item => item.id === songId);
    if (!song || !window.confirm(`「${song.title}」をこのセットリストから外しますか？`)) return;
    setSetlist(prev => prev.filter(entry => entry.songId !== songId));
  };

  const moveSetlistSong = (index: number, direction: 'up' | 'down' | 'top') => {
    setSetlist((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      if (direction === 'top') {
        const current = prev[index];
        const firstSameTypeIdx = prev.findIndex((item) => item.isEncore === current.isEncore);
        if (firstSameTypeIdx < 0 || firstSameTypeIdx === index) return prev;
        const copy = [...prev];
        copy.splice(index, 1);
        copy.splice(firstSameTypeIdx, 0, current);
        return copy;
      }
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      if (prev[index].isEncore !== prev[targetIdx].isEncore) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const toggleEncore = (index: number) => {
    setSetlist((prev) =>
      normalizeSetlistOrder(
        prev.map((item, idx) =>
          idx === index ? { ...item, isEncore: !item.isEncore } : item
        )
      )
    );
  };

  const loadPresetSetlist = (entries: SetlistEntry[], title: string) => {
    const validIds = new Set(songs.map((s) => s.id));
    const safeEntries = sanitizeSetlistEntries(entries, validIds);
    const safeTitle = sanitizeUserText(title, 160) || 'マイセットリスト';
    const hasCustomTitle = setlistTitle.trim() !== '' && setlistTitle.trim() !== DEFAULT_SETLIST_TITLE;
    if ((setlist.length > 0 || hasCustomTitle) &&
        !window.confirm(`今のセトリの名前と曲順を「${safeTitle}」の選曲に置き換えますか？`)) return false;
    if (safeEntries) {
      setSetlist(safeEntries);
    }
    setSetlistTitle(safeTitle);
    showToast(`「${safeTitle}」のセットリストを読み込みました！`);
    return true;
  };

  const toggleVisitedSpot = (spotId: string) => {
    const cleanId = sanitizeSafeId(spotId, 40);
    setVisitedSpotIds((prev) =>
      prev.includes(cleanId) ? prev.filter((id) => id !== cleanId) : [...prev, cleanId]
    );
  };

  const toggleAttendedTour = (tourId: string) => {
    const cleanId = sanitizeSafeId(tourId, 40);
    setAttendedTourIds((prev) =>
      prev.includes(cleanId) ? prev.filter((id) => id !== cleanId) : [...prev, cleanId]
    );
  };

  const voteSong = (
    songId: string,
    category: 'overall' | 'lyric' | 'live' | 'hiddenGem'
  ) => {
    const cleanId = sanitizeSafeId(songId, 40);
    const voteKey = `${cleanId}:${category}`;
    if (votedKeys.includes(voteKey)) return;

    setVotedKeys((prev) => [...prev, voteKey]);
    setSongs((prev) =>
      prev.map((song) =>
        song.id === cleanId
          ? {
              ...song,
              votes: {
                ...song.votes,
                [category]: song.votes[category] + 1,
              },
            }
          : song
      )
    );
    const targetSong = songs.find((s) => s.id === cleanId);
    if (targetSong) {
      showToast(`「${targetSong.title}」に1票投じました！`);
    }
  };

  const likeReview = (reviewId: string) => {
    const cleanId = sanitizeSafeId(reviewId, 40);
    if (likedReviewIds.includes(cleanId)) return;
    setLikedReviewIds((prev) => [...prev, cleanId]);
    setReviews((prev) =>
      prev.map((r) => (r.id === cleanId ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const submitReview = (
    newReview: Omit<FanReview, 'id' | 'postedAt' | 'likes'>
  ) => {
    const created: FanReview = {
      id: `rev-${Date.now()}`,
      author: sanitizeUserText(newReview.author, 30),
      fanTenure: sanitizeUserText(newReview.fanTenure, 30),
      songId: sanitizeSafeId(newReview.songId, 40),
      category: newReview.category,
      title: sanitizeUserText(newReview.title, 60),
      comment: sanitizeUserText(newReview.comment, 400),
      postedAt: formatDateDot(),
      likes: 0,
    };
    setReviews((prev) => [created, ...prev]);
    showToast('この端末に感想を記録しました。');
  };

  const updateBestQuizScore = (percentage: number) => {
    setBestQuizScore((prev) => Math.max(prev, Math.min(100, Math.round(percentage))));
  };

  const resetAllUserData = () => {
    if (!window.confirm('このブラウザに保存した記録をすべて初期化しますか？\n\nマイセトリの名前と曲順は初期の見本に戻ります。感想・共感・投票、聖地の訪問、公演の参戦、検定の最高正答率の記録は消去されます。')) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageNotice('保存データを初期化できませんでした。');
      return;
    }
    setStorageReady(true);
    setStorageNotice('');
    setSongs(HIGEDAN_SONGS);
    setSetlist(DEFAULT_SETLIST);
    setSetlistTitle(DEFAULT_SETLIST_TITLE);
    setVisitedSpotIds([]);
    setAttendedTourIds([]);
    setVotedKeys([]);
    setReviews([]);
    setLikedReviewIds([]);
    setBestQuizScore(0);
    showToast('保存データを初期状態にリセットしました。');
  };

  const changeTitle = (value: string) => {
    setSetlistTitle(value.replace(/[<>＜＞]/g, '').slice(0, 50));
  };

  const editReview = (id: string, fields: Omit<FanReview, 'id' | 'postedAt' | 'likes'>) => {
    setReviews(prev => prev.map(review => review.id === id ? { ...review, ...fields } : review));
  };

  const deleteReview = (id: string) => {
    setReviews(prev => prev.filter(review => review.id !== id));
    setLikedReviewIds(prev => prev.filter(key => key !== id));
  };

  const downloadRecords = () => {
    const data = {setlistTitle, setlist, reviews, votedKeys, likedReviewIds, visitedSpotIds, attendedTourIds, bestQuizScore};
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'higedanfan-records.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return {
    songs, setlist, setlistTitle, votedKeys, reviews, likedReviewIds, bestQuizScore,
    visitedSpotIds, attendedTourIds, storageNotice, downloadRecords,
    addToSetlist, removeFromSetlist, moveSetlistSong, toggleEncore,
    changeTitle, loadPresetSetlist, toggleVisitedSpot, toggleAttendedTour,
    voteSong, likeReview, submitReview, editReview, deleteReview,
    updateBestQuizScore, resetAllUserData,
  };
}
