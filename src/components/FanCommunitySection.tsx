import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  MessageSquarePlus,
  BookOpen,
  Sparkles,
  Check,
  ShieldCheck,
  Trophy,
  ArrowLeft,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { FanReview, SongItem } from '../data/higedanData';
import { validateReviewInput } from '../utils/fanLogic';

export type VoteCategory = 'overall' | 'lyric' | 'live' | 'hiddenGem';

interface FanCommunitySectionProps {
  songs: SongItem[];
  votedSongIds: string[];
  onVoteSong: (songId: string, category: VoteCategory) => void;
  onSelectSong: (song: SongItem) => void;
  reviews: FanReview[];
  likedReviewIds: string[];
  onLikeReview: (reviewId: string) => void;
  onSubmitReview: (newReview: Omit<FanReview, 'id' | 'postedAt' | 'likes'>) => void;
  onDeleteReview: (id: string) => void;
  onEditReview: (id: string, fields: Omit<FanReview, 'id' | 'postedAt' | 'likes'>) => void;
  initialSubTab?: 'ranking' | 'reviews';
}

const RANK_CATEGORIES: { id: VoteCategory; label: string; desc: string }[] = [
  { id: 'overall', label: '総合ベストソング', desc: '自分が選んだ代表曲' },
  { id: 'lyric', label: '歌詞が刺さる曲', desc: '言葉の力に心を揺さぶられる名曲' },
  { id: 'live', label: 'ライブで盛り上がる曲', desc: '会場の一体感とアレンジが最高潮のナンバー' },
  { id: 'hiddenGem', label: '隠れた名曲・アルバム曲', desc: '通好みのアレンジや実験性が光る名曲' },
];

export const FanCommunitySection: React.FC<FanCommunitySectionProps> = ({
  songs,
  votedSongIds,
  onVoteSong,
  onSelectSong,
  reviews,
  likedReviewIds,
  onLikeReview,
  onSubmitReview,
  onEditReview,
  onDeleteReview,
  initialSubTab = 'ranking',
}) => {
  const activeSubTab = initialSubTab;
  const [activeCategory, setActiveCategory] = useState<VoteCategory>('overall');
  const [pollSearchQuery, setPollSearchQuery] = useState<string>('');
  const [showAllRankedSongs, setShowAllRankedSongs] = useState<boolean>(false);
  const [reviewFilterCategory, setReviewFilterCategory] = useState<string>('all');
  const [isWritingReview, setIsWritingReview] = useState<boolean>(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [fanTenure, setFanTenure] = useState('ファン歴 3〜5年');
  const [songId, setSongId] = useState(songs[0]?.id || 'pretender');
  const [reviewCategory, setReviewCategory] = useState<FanReview['category']>('歌詞考察');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsWritingReview(false);
  }, [initialSubTab]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current !== null) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const allSortedSongsWithRank = useMemo(() => {
    return [...songs]
      .sort((a, b) => b.votes[activeCategory] - a.votes[activeCategory])
      .map((song, idx) => ({ song, rank: idx + 1 }));
  }, [songs, activeCategory]);

  const rankedSongs = useMemo(() => {
    const q = pollSearchQuery.trim().toLowerCase();
    if (q) {
      return allSortedSongsWithRank.filter(
        ({ song }) =>
          song.title.toLowerCase().includes(q) ||
          song.album.toLowerCase().includes(q) ||
          song.tieUp.toLowerCase().includes(q)
      );
    }
    return showAllRankedSongs
      ? allSortedSongsWithRank
      : allSortedSongsWithRank.slice(0, 12);
  }, [allSortedSongsWithRank, pollSearchQuery, showAllRankedSongs]);

  const maxVotes = Math.max(
    1,
    allSortedSongsWithRank[0]?.song.votes[activeCategory] || 1
  );
  const songMap = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);

  const filteredReviews = useMemo(
    () =>
      reviewFilterCategory === 'all'
        ? reviews
        : reviews.filter((r) => r.category === reviewFilterCategory),
    [reviews, reviewFilterCategory]
  );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateReviewInput({
      author,
      songId,
      title,
      comment,
    });
    if (!validation.valid || !validation.sanitized) {
      setFormError(validation.error || '入力内容を確認してください。');
      setFormSuccess(false);
      return;
    }

    setFormError(null);
    const fields = {
      author: validation.sanitized.author,
      fanTenure,
      songId: validation.sanitized.songId,
      category: reviewCategory,
      title: validation.sanitized.title,
      comment: validation.sanitized.comment,
    };
    if (editingId) onEditReview(editingId, fields);
    else onSubmitReview(fields);
    setEditingId(null);
    setAuthor('');
    setTitle('');
    setComment('');
    setFormSuccess(true);
    setIsWritingReview(false);
    if (successTimerRef.current !== null) {
      window.clearTimeout(successTimerRef.current);
    }
    successTimerRef.current = window.setTimeout(() => {
      setFormSuccess(false);
      successTimerRef.current = null;
    }, 3500);
  };

  return (
    <section
      id="section-community"
      aria-labelledby="community-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Clean Section Header + Sub-Tab Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="community-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              {activeSubTab === 'reviews'
                ? '感想・考察ノート'
                : '部門別・人気曲ランキング投票'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {activeSubTab === 'reviews'
                ? '自分で書いた感想はこの端末に保存されます。'
                : '自分が投じた票を、この端末で部門別に確認できます。'}
            </p>
          </div>

          <div
            role="group"
            aria-label="人気投票と感想ノートの切り替え"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 rounded-lg bg-[#F2EFE9] p-1 border border-[#E6E1D6] w-full sm:w-auto shrink-0"
          >
            <button
              type="button"

              aria-pressed={activeSubTab === 'ranking'}
              onClick={() => {
                (window.location.hash = 'community');
                setIsWritingReview(false);
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubTab === 'ranking'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              人気曲ランキング投票
            </button>
            <button
              type="button"

              aria-pressed={activeSubTab === 'reviews'}
              onClick={() => {
                (window.location.hash = 'fan_reviews');
                setIsWritingReview(false);
              }}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap min-h-[38px] cursor-pointer ${
                activeSubTab === 'reviews'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <MessageSquarePlus className="h-3.5 w-3.5 shrink-0" />
              感想・考察ノート
            </button>
          </div>
        </div>

        {activeSubTab === 'ranking' ? (
          /* Sub-Tab 1: Category Ranking Poll (Supports All 86 Songs + Search) */
          <div className="mt-5">
            <div className="space-y-3 rounded-xl border border-[#E6E1D6] bg-white p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {RANK_CATEGORIES.map((cat) => {
                    const active = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        aria-pressed={active}
                        className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                          active
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                            : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs text-[#78716C]">
                  {RANK_CATEGORIES.find((c) => c.id === activeCategory)?.desc}
                </span>
              </div>

              {/* Search Any of the 86 Songs to Vote */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[#E6E1D6]">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
                  <label htmlFor="poll-song-search" className="sr-only">
                    投票したい曲を検索
                  </label>
                  <input
                    id="poll-song-search"
                    type="text"
                    maxLength={50}
                    value={pollSearchQuery}
                    onChange={(e) => setPollSearchQuery(e.target.value.slice(0, 50))}
                    placeholder="全86曲から曲名・アルバム名で検索して投票..."
                    className="w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] pl-8 pr-8 py-2 text-xs text-[#1C1917] min-h-[38px]"
                  />
                  {pollSearchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPollSearchQuery('')}
                      aria-label="検索をクリア"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllRankedSongs((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] transition-colors cursor-pointer shrink-0"
                >
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showAllRankedSongs ? 'rotate-180' : ''
                    }`}
                  />
                  {showAllRankedSongs
                    ? '上位12曲表示に戻す'
                    : `全${songs.length}曲のランキングをすべて表示`}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rankedSongs.length === 0 && <p>該当する曲がありません。 <button className="underline" onClick={() => setPollSearchQuery('')}>検索条件を解除</button></p>}
              {rankedSongs.map(({ song, rank }) => {
                const count = song.votes[activeCategory];
                const barWidth = Math.max(12, Math.round((count / maxVotes) * 100));
                const voteKey = `${song.id}:${activeCategory}`;
                const hasVoted = votedSongIds.includes(voteKey) || votedSongIds.includes(song.id);

                return (
                  <div
                    key={song.id}
                    className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline gap-2.5 min-w-0">
                          <span
                            className={`font-editorial font-mono-num text-lg font-bold shrink-0 ${
                              rank === 1
                                ? 'text-[#C83E2B]'
                                : rank === 2
                                ? 'text-[#1E3A5F]'
                                : rank === 3
                                ? 'text-[#B45309]'
                                : 'text-[#78716C]'
                            }`}
                          >
                            {rank}位
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                            {song.title}
                          </h3>
                        </div>

                        <span className="font-mono-num text-xs sm:text-sm font-bold text-[#1C1917] shrink-0">
                          {count} 票
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
                        {song.album}
                        {song.trackNumber ? ` (M${song.trackNumber})` : ''} · {song.tieUp}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
                        <div
                          className={`h-full rounded-full transition-opacity ${
                            rank === 1 ? 'bg-[#C83E2B]' : 'bg-[#1C1917]'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-[#E6E1D6]">
                      <button
                        type="button"
                        onClick={() => onSelectSong(song)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A5F] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        楽曲解説
                      </button>

                      <button
                        type="button"
                        onClick={() => onVoteSong(song.id, activeCategory)}
                        disabled={hasVoted}
                        aria-label={`${song.title}に投票する`}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          hasVoted
                            ? 'border border-[#E6E1D6] bg-[#F2EFE9] text-[#78716C]'
                            : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                        }`}
                      >
                        {hasVoted ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            投票済み
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            投票する
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isWritingReview ? (
          /* Sub-Tab 2 (Screen Transition: Dedicated Review Submission Screen) */
          <div className="mt-5 mx-auto max-w-2xl">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsWritingReview(false);
                  setFormError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                感想・考察一覧に戻る
              </button>
            </div>

            <form
              onSubmit={handleReviewSubmit}
              noValidate
              className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7 space-y-4 shadow-xs"
            >
              <div className="border-b border-[#E6E1D6] pb-3.5">
                <h3 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#1C1917]">
                  <MessageSquarePlus className="h-4 w-4 text-[#C83E2B]" />
                  {editingId ? '感想を編集する' : '推し曲の感想を書く'}
                </h3>
                <p className="mt-1 text-xs text-[#57534E]">
                  この端末に曲やライブの感想を保存します。
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-lg border border-[#F5D0C9] bg-[#FDF3F1] px-3.5 py-2.5 text-xs font-bold text-[#C83E2B]"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="review-author"
                      className="block text-xs font-bold text-[#1C1917]"
                    >
                      ニックネーム
                    </label>
                    <span className="text-[11px] font-mono-num text-[#78716C]">
                      {author.length}/30
                    </span>
                  </div>
                  <input
                    id="review-author"
                    type="text"
                    maxLength={30}
                    value={author}
                    onChange={(e) =>
                      setAuthor(
                        e.target.value.replace(/[<>＜＞\u0000-\u001F]/g, '').slice(0, 30)
                      )
                    }
                    placeholder="例: さとっ子ファン"
                    className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] min-h-[40px]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-tenure"
                    className="block text-xs font-bold text-[#1C1917]"
                  >
                    ファン歴
                  </label>
                  <select
                    id="review-tenure"
                    value={fanTenure}
                    onChange={(e) => setFanTenure(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] min-h-[40px]"
                  >
                    <option value="最近ハマった新規リスナー">最近ハマった新規リスナー</option>
                    <option value="ファン歴 1〜2年">ファン歴 1〜2年</option>
                    <option value="ファン歴 3〜5年">ファン歴 3〜5年</option>
                    <option value="インディーズ期からのファン">インディーズ期からのファン</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="review-song-select"
                    className="block text-xs font-bold text-[#1C1917]"
                  >
                    対象の楽曲
                  </label>
                  <select
                    id="review-song-select"
                    value={songId}
                    onChange={(e) => setSongId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs font-bold text-[#1C1917] min-h-[40px]"
                  >
                    {songs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="review-category-select"
                    className="block text-xs font-bold text-[#1C1917]"
                  >
                    テーマ
                  </label>
                  <select
                    id="review-category-select"
                    value={reviewCategory}
                    onChange={(e) =>
                      setReviewCategory(e.target.value as FanReview['category'])
                    }
                    className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] min-h-[40px]"
                  >
                    <option value="歌詞考察">歌詞考察</option>
                    <option value="ライブ体験">ライブ体験</option>
                    <option value="楽曲アレンジ">楽曲アレンジ</option>
                    <option value="人生の支え">人生の支え</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="review-title"
                    className="block text-xs font-bold text-[#1C1917]"
                  >
                    ひとこと見出し
                  </label>
                  <span className="text-[11px] font-mono-num text-[#78716C]">
                    {title.length}/60
                  </span>
                </div>
                <input
                  id="review-title"
                  type="text"
                  maxLength={60}
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value.replace(/[<>＜＞\u0000-\u001F]/g, '').slice(0, 60)
                    )
                  }
                  placeholder="例: ラスサビの転調で視界が一気に開ける感覚が最高"
                  className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs text-[#1C1917] min-h-[40px]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="review-comment"
                    className="block text-xs font-bold text-[#1C1917]"
                  >
                    感想・考察コメント（10〜400文字）
                  </label>
                  <span className="text-[11px] font-mono-num text-[#78716C]">
                    {comment.length}/400
                  </span>
                </div>
                <textarea
                  id="review-comment"
                  rows={4}
                  maxLength={400}
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value.slice(0, 400)
                    )
                  }
                  placeholder="好きな歌詞の解釈や、ライブ会場で聴いた時のエピソードを書いてください..."
                  className="mt-1 w-full rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] p-3 text-xs text-[#1C1917] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#15803D]" />
                <span>投稿した感想は、あなた専用のファンノートとしてこのブラウザ内に記録されます。</span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsWritingReview(false);
                    setFormError(null);
                  }}
                  className="rounded-lg border border-[#D5CEC2] bg-white px-4 py-2.5 text-xs font-bold text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 min-h-[40px] cursor-pointer"
                >
                  {editingId ? '変更を保存する' : '感想ノートに保存する'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Sub-Tab 2 (Default Screen: Clean Review Wall with Transition Button to Write Form) */
          <div className="mt-5 space-y-4">
            {formSuccess && (
              <div
                role="status"
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-[#15803D]"
              >
                感想ノートに掲載しました！ありがとうございます！
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E6E1D6] bg-white p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['all', '歌詞考察', 'ライブ体験', '楽曲アレンジ', '人生の支え'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReviewFilterCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        reviewFilterCategory === cat
                          ? 'bg-[#1C1917] text-[#FBF9F5]'
                          : 'bg-[#FBF9F5] border border-[#E6E1D6] text-[#57534E] hover:text-[#1C1917] hover:bg-[#F2EFE9]'
                      }`}
                    >
                      {cat === 'all' ? 'すべて' : cat}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => { setEditingId(null); setTitle(''); setComment(''); setFormError(null); setIsWritingReview(true); }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#C83E2B] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#A93020] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MessageSquarePlus className="h-4 w-4" />
                推し曲の感想を書く
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.length === 0 && <p>この分類にはまだ感想がありません。「感想を書く」から記録できます。</p>}
              {filteredReviews.map((rev) => {
                const targetSong = songMap.get(rev.songId);
                const liked = likedReviewIds.includes(rev.id);
                return (
                  <article
                    key={rev.id}
                    className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-5"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#78716C]">
                        <div>
                          <strong className="text-[#C83E2B]">
                            {targetSong ? targetSong.title : rev.songId}
                          </strong>
                          <span aria-hidden="true"> · </span>
                          <span>{rev.category}</span>
                          <span aria-hidden="true"> · </span>
                          <span>
                            <span className="wrap-anywhere">{rev.author}（{rev.fanTenure}）</span>
                          </span>
                        </div>
                        <span className="font-mono-num">{rev.postedAt}</span>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <button onClick={() => { setEditingId(rev.id); setAuthor(rev.author); setFanTenure(rev.fanTenure); setSongId(rev.songId); setReviewCategory(rev.category); setTitle(rev.title); setComment(rev.comment); setFormError(null); setIsWritingReview(true); }}>編集</button>
                        <button onClick={() => { if (window.confirm('「' + rev.title + '」を削除しますか？')) onDeleteReview(rev.id); }}>この感想を削除</button>
                      </div>
                      <h4 className="mt-2.5 wrap-anywhere text-sm sm:text-base font-bold text-[#1C1917]">
                        {rev.title}
                      </h4>

                      <p className="whitespace-pre-wrap wrap-anywhere mt-1.5 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#E6E1D6] pt-3">
                      {targetSong ? (
                        <button
                          type="button"
                          onClick={() => onSelectSong(targetSong)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A5F] hover:underline cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          楽曲解説を見る
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={() => onLikeReview(rev.id)}
                        aria-pressed={liked}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold font-mono-num transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          liked
                            ? 'bg-[#FDF3F1] text-[#C83E2B] border border-[#F5D0C9]'
                            : 'bg-[#FBF9F5] text-[#57534E] border border-[#E6E1D6] hover:text-[#1C1917]'
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            liked ? 'fill-[#C83E2B] text-[#C83E2B]' : ''
                          }`}
                        />
                        共感した ({rev.likes})
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
