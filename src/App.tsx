/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Compass,
} from 'lucide-react';
import {
  FanReview,
  HIGEDAN_SONGS,
  INITIAL_FAN_REVIEWS,
  SACRED_SPOTS,
  SongItem,
  TOUR_ARCHIVES,
  REJOICE_IMAGE_PATH,
  EDITORIAL_IMAGE_PATH,
  TRAVELER_IMAGE_PATH,
  SAME_BLUE_IMAGE_PATH,
} from './data/higedanData';
import {
  formatDateDot,
  isSafeAssetUrl,
  normalizeSetlistOrder,
  sanitizeReviewsList,
  sanitizeSafeId,
  sanitizeSetlistEntries,
  sanitizeUserText,
  SetlistEntry,
} from './utils/fanLogic';
import { SiteHeader, ActiveFeatureTab } from './components/SiteHeader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MoodFinderSection } from './components/MoodFinderSection';
import { DiscographySection } from './components/DiscographySection';
import { SetlistBuilderSection } from './components/SetlistBuilderSection';
import { FanCommunitySection } from './components/FanCommunitySection';
import { QuizSection } from './components/QuizSection';
import { SongDetailModal } from './components/SongDetailModal';

const STORAGE_KEY = 'higedan_fan_magazine_state_v1';

interface PersistedState {
  songs: SongItem[];
  setlist: SetlistEntry[];
  setlistTitle: string;
  visitedSpotIds: string[];
  attendedTourIds: string[];
  votedKeys: string[];
  reviews: FanReview[];
  likedReviewIds: string[];
  bestQuizScore: number;
}

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

const HERO_JACKET_SHOWCASE = [
  { src: REJOICE_IMAGE_PATH, label: 'Rejoice', year: '2024' },
  { src: EDITORIAL_IMAGE_PATH, label: 'Editorial', year: '2021' },
  { src: TRAVELER_IMAGE_PATH, label: 'Traveler', year: '2019' },
  { src: SAME_BLUE_IMAGE_PATH, label: 'Same Blue / らしさ', year: '2024–2025' },
];

export default function App() {
  const [songs, setSongs] = useState<SongItem[]>(HIGEDAN_SONGS);
  const [setlist, setSetlist] = useState<SetlistEntry[]>(DEFAULT_SETLIST);
  const [setlistTitle, setSetlistTitle] = useState<string>(
    '私が聴きたい！夢のスタジアムライブ'
  );
  const [visitedSpotIds, setVisitedSpotIds] = useState<string[]>(['spot-shinji-lake']);
  const [attendedTourIds, setAttendedTourIds] = useState<string[]>(['tour-stadium-2025']);
  const [votedKeys, setVotedKeys] = useState<string[]>([]);
  const [reviews, setReviews] = useState<FanReview[]>(INITIAL_FAN_REVIEWS);
  const [likedReviewIds, setLikedReviewIds] = useState<string[]>([]);
  const [bestQuizScore, setBestQuizScore] = useState<number>(83);
  const [selectedModalSongId, setSelectedModalSongId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<ActiveFeatureTab>('home');

  // Load & schema-validate persisted state from localStorage with strict XSS/ID sanitization
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      const validSongIds = new Set(HIGEDAN_SONGS.map((s) => s.id));
      const validSpotIds = new Set(SACRED_SPOTS.map((s) => s.id));
      const validTourIds = new Set(TOUR_ARCHIVES.map((t) => t.id));

      if (
        parsed.songs &&
        Array.isArray(parsed.songs) &&
        parsed.songs.length === HIGEDAN_SONGS.length
      ) {
        const voteMap = new Map<string, SongItem['votes']>();
        for (const item of parsed.songs) {
          if (
            item &&
            typeof item.id === 'string' &&
            validSongIds.has(item.id) &&
            item.votes
          ) {
            voteMap.set(item.id, {
              overall: Math.max(0, Math.min(99999, Number(item.votes.overall) || 0)),
              lyric: Math.max(0, Math.min(99999, Number(item.votes.lyric) || 0)),
              live: Math.max(0, Math.min(99999, Number(item.votes.live) || 0)),
              hiddenGem: Math.max(0, Math.min(99999, Number(item.votes.hiddenGem) || 0)),
            });
          }
        }
        setSongs(
          HIGEDAN_SONGS.map((base) => ({
            ...base,
            votes: voteMap.get(base.id) || base.votes,
          }))
        );
      }

      const safeSetlist = sanitizeSetlistEntries(parsed.setlist, validSongIds);
      if (safeSetlist) {
        setSetlist(safeSetlist);
      }

      if (typeof parsed.setlistTitle === 'string') {
        const cleanTitle = sanitizeUserText(parsed.setlistTitle, 50);
        if (cleanTitle.length > 0) {
          setSetlistTitle(cleanTitle);
        }
      }

      if (Array.isArray(parsed.visitedSpotIds)) {
        setVisitedSpotIds(
          parsed.visitedSpotIds
            .map((id) => sanitizeSafeId(id, 40))
            .filter((id) => validSpotIds.has(id))
        );
      }

      if (Array.isArray(parsed.attendedTourIds)) {
        setAttendedTourIds(
          parsed.attendedTourIds
            .map((id) => sanitizeSafeId(id, 40))
            .filter((id) => validTourIds.has(id))
        );
      }

      if (Array.isArray(parsed.votedKeys)) {
        setVotedKeys(
          parsed.votedKeys
            .map((k) => sanitizeSafeId(k, 60))
            .filter((k) => k.length > 0)
            .slice(0, 100)
        );
      }

      const safeReviews = sanitizeReviewsList(parsed.reviews, validSongIds);
      if (safeReviews) {
        setReviews(safeReviews);
      }

      if (Array.isArray(parsed.likedReviewIds)) {
        setLikedReviewIds(
          parsed.likedReviewIds
            .map((k) => sanitizeSafeId(k, 40))
            .filter((k) => k.length > 0)
            .slice(0, 100)
        );
      }

      if (
        typeof parsed.bestQuizScore === 'number' &&
        !Number.isNaN(parsed.bestQuizScore)
      ) {
        setBestQuizScore(Math.max(0, Math.min(100, Math.round(parsed.bestQuizScore))));
      }
    } catch {
      // Ignore malformed storage data safely
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const stateToSave: PersistedState = {
        songs,
        setlist,
        setlistTitle: sanitizeUserText(setlistTitle, 50),
        visitedSpotIds,
        attendedTourIds,
        votedKeys,
        reviews,
        likedReviewIds,
        bestQuizScore,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    songs,
    setlist,
    setlistTitle,
    visitedSpotIds,
    attendedTourIds,
    votedKeys,
    reviews,
    likedReviewIds,
    bestQuizScore,
  ]);

  const toastTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    const safeMsg = sanitizeUserText(msg, 120);
    setToastMessage(safeMsg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const handleSelectTab = (tab: ActiveFeatureTab) => {
    setActiveFeatureTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToSetlist = (songId: string, isEncore = false) => {
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

  const handleRemoveFromSetlist = (index: number) => {
    setSetlist((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveSetlistSong = (index: number, direction: 'up' | 'down') => {
    setSetlist((prev) => {
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

  const handleToggleEncore = (index: number) => {
    setSetlist((prev) =>
      normalizeSetlistOrder(
        prev.map((item, idx) =>
          idx === index ? { ...item, isEncore: !item.isEncore } : item
        )
      )
    );
  };

  const handleLoadPresetSetlist = (entries: SetlistEntry[], title: string) => {
    const validIds = new Set(songs.map((s) => s.id));
    const safeEntries = sanitizeSetlistEntries(entries, validIds);
    const safeTitle = sanitizeUserText(title, 50) || 'マイセットリスト';
    if (safeEntries) {
      setSetlist(safeEntries);
    }
    setSetlistTitle(safeTitle);
    showToast(`「${safeTitle}」のセットリストを読み込みました！`);
  };

  const handleToggleVisitedSpot = (spotId: string) => {
    const cleanId = sanitizeSafeId(spotId, 40);
    setVisitedSpotIds((prev) =>
      prev.includes(cleanId) ? prev.filter((id) => id !== cleanId) : [...prev, cleanId]
    );
  };

  const handleToggleAttendedTour = (tourId: string) => {
    const cleanId = sanitizeSafeId(tourId, 40);
    setAttendedTourIds((prev) =>
      prev.includes(cleanId) ? prev.filter((id) => id !== cleanId) : [...prev, cleanId]
    );
  };

  const handleVoteSong = (
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

  const handleLikeReview = (reviewId: string) => {
    const cleanId = sanitizeSafeId(reviewId, 40);
    if (likedReviewIds.includes(cleanId)) return;
    setLikedReviewIds((prev) => [...prev, cleanId]);
    setReviews((prev) =>
      prev.map((r) => (r.id === cleanId ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const handleSubmitReview = (
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
      likes: 1,
    };
    setReviews((prev) => [created, ...prev]);
    showToast('あなたの感想・考察がノートに掲載されました！');
  };

  const handleUpdateBestQuizScore = (percentage: number) => {
    setBestQuizScore((prev) => Math.max(prev, Math.min(100, Math.round(percentage))));
  };

  const handleResetAllUserData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSongs(HIGEDAN_SONGS);
    setSetlist(DEFAULT_SETLIST);
    setSetlistTitle('私が聴きたい！夢のスタジアムライブ');
    setVisitedSpotIds(['spot-shinji-lake']);
    setAttendedTourIds(['tour-stadium-2025']);
    setVotedKeys([]);
    setReviews(INITIAL_FAN_REVIEWS);
    setLikedReviewIds([]);
    setBestQuizScore(83);
    showToast('保存データを初期状態にリセットしました。');
  };

  const modalSong = selectedModalSongId
    ? songs.find((s) => s.id === selectedModalSongId) || null
    : null;

  const setlistSongIds = setlist.map((s) => s.songId);

  const HOME_FEATURE_CARDS: {
    id: Exclude<ActiveFeatureTab, 'home'>;
    stepNum: string;
    categoryLabel: string;
    title: string;
    description: string;
    points: string[];
    ctaLabel: string;
  }[] = [
    {
      id: 'mood',
      stepNum: '01',
      categoryLabel: 'MY SONG DIAGNOSIS',
      title: 'マイソング診断',
      description:
        '今の気分・聴きたい場面・好みのサウンドを1問ずつ選ぶだけで、今のあなたに一番響く1曲を大型ジャケット写真とマッチ度グラフ付きで提案します。',
      points: [
        '3つの質問に1問ずつ順番に答えるステップ遷移式',
        '今の気分にマッチする1〜2文の理由とサウンド解説を表示',
      ],
      ctaLabel: 'マイソング診断をはじめる',
    },
    {
      id: 'discography',
      stepNum: '02',
      categoryLabel: 'DISCOGRAPHY & PILGRIMAGE',
      title: '楽曲ガイド・聖地巡礼マップ',
      description:
        'インディーズ期から最新アルバム『Rejoice』までの代表曲ライナーノーツと、結成の地・山陰（松江・米子）からMVロケ地までの聖地巡礼ガイド。',
      points: [
        '転調の仕掛けや制作背景をまとめた楽曲解説モーダル',
        '松江・宍道湖などゆかりの聖地スポット訪問チェック',
      ],
      ctaLabel: '楽曲ガイド・聖地を見る',
    },
    {
      id: 'setlist',
      stepNum: '03',
      categoryLabel: 'SETLIST & LIVE ARCHIVE',
      title: 'マイセトリ作成・ライブ記録',
      description:
        '自分がライブで聴きたい理想のセットリストを自由に組んで曲順やアンコールを編集したり、歴代ツアーの思い出を振り返ることができます。',
      points: [
        '本編・アンコールの構成や合計演奏時間・転調数を自動計算',
        '日産スタジアム公演など歴代ツアーアーカイブ収録',
      ],
      ctaLabel: 'マイセトリを作る',
    },
    {
      id: 'community',
      stepNum: '04',
      categoryLabel: 'RANKING & FAN NOTE',
      title: '人気曲投票・感想考察ノート',
      description:
        '「歌詞が刺さる曲」「ライブで盛り上がる曲」など4部門の人気投票と、ファン同士で好きな歌詞の解釈やライブ体験を綴る感想ノート。',
      points: [
        '4つのテーマから1クリックで推し曲に投票',
        'みんなが綴った歌詞考察や思い出の閲覧・安全な投稿画面',
      ],
      ctaLabel: '人気投票・感想ノートへ',
    },
    {
      id: 'quiz',
      stepNum: '05',
      categoryLabel: 'LYRIC & TRIVIA QUIZ',
      title: 'ヒゲダン検定クイズ',
      description:
        '印象的な歌詞のフレーズや、ヒゲダンならではの転調トリビア、バンド結成の歩みをコース別で楽しめる検定クイズです。',
      points: [
        '初級・中級・上級の難易度コースから選択してスタート',
        '1問ごとに詳しい楽曲トリビア解説を表示',
      ],
      ctaLabel: 'ヒゲダン検定に挑戦する',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Slim Editorial Header with Top-Right Hamburger Menu Drawer & Zero Scrollbars */}
      <SiteHeader activeTab={activeFeatureTab} onSelectTab={handleSelectTab} />

      {/* Main Content Area Protected by ErrorBoundary */}
      <ErrorBoundary onResetApp={() => handleSelectTab('home')}>
        <main id="top" className="flex-1">
          {activeFeatureTab === 'home' ? (
            /* Top Page: Editorial Cover Spread + Curated Chapter Directory */
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
              {/* Editorial Cover Hero Spread */}
              <div className="overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_2px_16px_rgba(28,25,23,0.03)]">
                {/* Top Editorial Masthead Strip (Unboxed Typography, Zero Pill Clutter) */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-[#E6E1D6] text-[11px] tracking-widest uppercase text-[#78716C]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#C83E2B]">ISSUE 01</span>
                    <span aria-hidden="true">·</span>
                    <span>UNOFFICIAL HIGEDAN EDITORIAL NOTEBOOK</span>
                  </div>
                  <span className="font-mono-num hidden sm:inline">
                    MATSUE / TOKYO / STADIUM ARCHIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
                  {/* Left: Editorial Intro & Primary Entry Actions */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="space-y-2.5">
                      <p className="text-xs sm:text-sm font-bold tracking-wide text-[#C83E2B]">
                        Official髭男dism 非公式ファンマガジン＆アーカイブ
                      </p>
                      <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1C1917] leading-[1.2] text-balance">
                        115万キロのファンノート
                      </h1>
                    </div>

                    <p className="text-xs sm:text-base text-[#57534E] leading-relaxed max-w-2xl">
                      グッドメロディと緻密な転調、心に寄り添う歌詞の世界をもっと深く味わうためのファンノートです。
                      今の気分から1曲を見つける「マイソング診断」をはじめ、時代別ライナーノーツ、山陰〜横浜の聖地巡礼ガイド、理想のセットリスト作成、人気投票、検定クイズまで、読みたい項目からページをめくるように進めます。
                    </p>

                    <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectTab('mood')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>マイソング診断をはじめる</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectTab('discography')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-5 py-3 text-xs sm:text-sm font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Compass className="h-4 w-4 text-[#1E3A5F]" />
                        <span>楽曲ガイド・聖地巡礼を見る</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: 2x2 Vinyl Sleeve Artwork Showcase */}
                  <div className="lg:col-span-5">
                    <div className="rounded-xl bg-[#F2EFE9] p-3.5 sm:p-4 border border-[#E6E1D6]">
                      <div className="grid grid-cols-2 gap-3">
                        {HERO_JACKET_SHOWCASE.map((art) => (
                          <button
                            key={art.label}
                            type="button"
                            onClick={() => handleSelectTab('discography')}
                            className="group relative aspect-square overflow-hidden rounded-lg bg-[#1C1917] ring-1 ring-black/10 shadow-xs text-left cursor-pointer"
                          >
                            {isSafeAssetUrl(art.src) && (
                              <img
                                src={art.src}
                                alt={`${art.label} ジャケットイメージ`}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
                              <span className="block text-[10px] font-mono-num text-white/75">
                                {art.year}
                              </span>
                              <span className="block text-xs font-bold text-white truncate">
                                {art.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#78716C] px-0.5">
                        <span className="font-editorial italic">
                          Selected Discography Visuals
                        </span>
                        <span>ジャケット選択で楽曲ガイドへ →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Content Appeal Cards (Cohesive Editorial Chapter Directory) */}
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#E6E1D6] pb-3.5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-num text-xs font-bold tracking-widest uppercase text-[#C83E2B]">
                      DIRECTORY 01–05
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-[#1C1917]">
                      コンテンツ目次（気になる項目を選んで進んでください）
                    </h2>
                  </div>
                  <span className="text-xs text-[#78716C]">
                    右上の「メニュー」からもいつでも各ページへ移動できます
                  </span>
                </div>

                {/* Featured Lead Card: 01 My Song Diagnosis */}
                <article className="rounded-2xl border border-[#D5CEC2] bg-white p-5 sm:p-8 transition-colors hover:border-[#1C1917]">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 space-y-3">
                      <div className="flex items-baseline gap-3">
                        <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#C83E2B] font-mono-num">
                          {HOME_FEATURE_CARDS[0].stepNum}.
                        </span>
                        <span className="text-[11px] font-bold tracking-widest uppercase text-[#78716C]">
                          {HOME_FEATURE_CARDS[0].categoryLabel}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                        {HOME_FEATURE_CARDS[0].title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-2xl">
                        {HOME_FEATURE_CARDS[0].description}
                      </p>

                      <div className="pt-2 border-t border-[#E6E1D6] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534E]">
                        {HOME_FEATURE_CARDS[0].points.map((pt, i) => (
                          <React.Fragment key={pt}>
                            {i > 0 && (
                              <span aria-hidden="true" className="text-[#D5CEC2]">
                                ·
                              </span>
                            )}
                            <span>{pt}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-4 flex lg:justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectTab('mood')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#C83E2B] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{HOME_FEATURE_CARDS[0].ctaLabel}</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>

                {/* Other 4 Content Appeal Cards in a Clean, Unified 2x2 Editorial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {HOME_FEATURE_CARDS.slice(1).map((card) => (
                    <article
                      key={card.id}
                      className="group flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 transition-colors hover:border-[#1C1917]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                          <div className="flex items-baseline gap-2.5">
                            <span className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917] group-hover:text-[#C83E2B] transition-colors font-mono-num">
                              {card.stepNum}.
                            </span>
                            <span className="text-[11px] font-bold tracking-widest uppercase text-[#78716C]">
                              {card.categoryLabel}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#1C1917]">
                          {card.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                          {card.description}
                        </p>

                        <div className="pt-2 space-y-1 text-xs text-[#78716C]">
                          {card.points.map((pt) => (
                            <div key={pt} className="flex items-center gap-2">
                              <span aria-hidden="true" className="text-[#C83E2B]">
                                —
                              </span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#E6E1D6] flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSelectTab(card.id)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2.5 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>{card.ctaLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Feature Screen View with Clean Back-to-Home Navigation Bar */
            <div>
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-5">
                <button
                  type="button"
                  onClick={() => handleSelectTab('home')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  トップページ（コンテンツ目次）へ戻る
                </button>
              </div>

              {activeFeatureTab === 'mood' && (
                <MoodFinderSection
                  songs={songs}
                  onSelectSong={(song) => setSelectedModalSongId(song.id)}
                  onAddToSetlist={(id) => handleAddToSetlist(id, false)}
                  setlistSongIds={setlistSongIds}
                />
              )}

              {activeFeatureTab === 'discography' && (
                <DiscographySection
                  songs={songs}
                  onSelectSong={(song) => setSelectedModalSongId(song.id)}
                  onAddToSetlist={(id) => handleAddToSetlist(id, false)}
                  setlistSongIds={setlistSongIds}
                  visitedSpotIds={visitedSpotIds}
                  onToggleVisitedSpot={handleToggleVisitedSpot}
                />
              )}

              {activeFeatureTab === 'setlist' && (
                <SetlistBuilderSection
                  songs={songs}
                  setlist={setlist}
                  setlistTitle={setlistTitle}
                  onChangeTitle={(val) =>
                    setSetlistTitle(val.replace(/[<>＜＞]/g, '').slice(0, 50))
                  }
                  onAddSong={handleAddToSetlist}
                  onRemoveSong={handleRemoveFromSetlist}
                  onMoveSong={handleMoveSetlistSong}
                  onToggleEncore={handleToggleEncore}
                  onLoadPresetSetlist={handleLoadPresetSetlist}
                  attendedTourIds={attendedTourIds}
                  onToggleAttendedTour={handleToggleAttendedTour}
                />
              )}

              {activeFeatureTab === 'community' && (
                <FanCommunitySection
                  songs={songs}
                  votedSongIds={votedKeys}
                  onVoteSong={handleVoteSong}
                  onSelectSong={(song) => setSelectedModalSongId(song.id)}
                  reviews={reviews}
                  likedReviewIds={likedReviewIds}
                  onLikeReview={handleLikeReview}
                  onSubmitReview={handleSubmitReview}
                />
              )}

              {activeFeatureTab === 'quiz' && (
                <QuizSection
                  bestScorePercentage={bestQuizScore}
                  onUpdateBestScore={handleUpdateBestQuizScore}
                />
              )}
            </div>
          )}
        </main>
      </ErrorBoundary>

      {/* Clean Archival Footer */}
      <footer className="border-t border-[#E6E1D6] bg-[#F2EFE9] py-7 mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div className="space-y-1.5">
            <p className="font-bold text-[#1C1917]">
              115万キロのファンノート — Official髭男dism 非公式ファンサイト
            </p>
            <p>
              ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
              <span>
                すべての入力データはXSSサニタイズ処理およびスキーマ検証を経て、お使いのブラウザ内にのみ安全に保存されます。
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetAllUserData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#57534E]" />
              保存データを初期状態に戻す
            </button>
          </div>
        </div>
      </footer>

      {/* Song Liner Notes Modal */}
      <SongDetailModal
        song={modalSong}
        onClose={() => setSelectedModalSongId(null)}
        onAddToSetlist={(id) => handleAddToSetlist(id, false)}
        isInSetlist={modalSong ? setlistSongIds.includes(modalSong.id) : false}
        onVoteSong={handleVoteSong}
        hasVoted={
          modalSong ? votedKeys.includes(`${modalSong.id}:overall`) : false
        }
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-lg border border-[#1C1917] bg-[#1C1917] px-4 py-3 text-xs font-bold text-[#FBF9F5] shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
