import React, { useEffect, useState } from 'react';
import { X, Music, Sparkles, Plus, Check, Disc, Mic2, Radio, Volume2, Square } from 'lucide-react';
import { SongItem } from '../data/higedanData';
import { formatDuration, getSongwriterCredit, isSafeAssetUrl, SOUND_LABELS } from '../utils/fanLogic';
import { playSongTempoPreview, stopTempoPreview } from '../utils/audioPreview';

interface SongDetailModalProps {
  song: SongItem | null;
  onClose: () => void;
  onAddToSetlist: (songId: string) => void;
  isInSetlist: boolean;
  onVoteSong: (songId: string, category: 'overall' | 'lyric' | 'live' | 'hiddenGem') => void;
  hasVoted: boolean;
}

export const SongDetailModal: React.FC<SongDetailModalProps> = ({
  song,
  onClose,
  onAddToSetlist,
  isInSetlist,
  onVoteSong,
  hasVoted,
}) => {
  const [isPlayingTempo, setIsPlayingTempo] = useState(false);

  useEffect(() => {
    setIsPlayingTempo(false);
    stopTempoPreview();
    if (!song) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTempoPreview();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      stopTempoPreview();
    };
  }, [song, onClose]);

  if (!song) return null;

  const handleToggleTempo = () => {
    if (isPlayingTempo) {
      stopTempoPreview();
      setIsPlayingTempo(false);
    } else {
      setIsPlayingTempo(true);
      playSongTempoPreview(song.bpm, song.sound, () => {
        setIsPlayingTempo(false);
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/60 p-3 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-modal-title"
      onClick={() => {
        stopTempoPreview();
        onClose();
      }}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E6E1D6] bg-[#FBF9F5] p-5 sm:p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Jacket Artwork & Close */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6E1D6] pb-4">
          <div className="flex items-center gap-4 min-w-0">
            {isSafeAssetUrl(song.jacketImage) && (
              <img
                src={song.jacketImage}
                alt={`${song.title} ジャケット`}
                referrerPolicy="no-referrer"
                className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-xl object-cover ring-1 ring-black/15 shadow-xs"
              />
            )}
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#78716C] font-mono-num">
                {song.album}
                {song.trackNumber ? ` (M${song.trackNumber})` : ''} · {song.releaseDate}
              </div>
              <h2
                id="song-modal-title"
                className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917]"
              >
                {song.title}
              </h2>
              <p className="mt-1 text-xs text-[#57534E]">
                {getSongwriterCredit(song)} · {SOUND_LABELS[song.sound]} · {song.tieUp}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopTempoPreview();
              onClose();
            }}
            aria-label="楽曲解説を閉じる"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Musical Specs Bar + Interactive BPM Rhythm Preview */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1D6] pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            <div>
              <span className="block text-xs text-[#78716C]">演奏時間</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#1C1917]">
                {formatDuration(song.durationSec)}
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#78716C]">テンポ (BPM)</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#1C1917]">
                {song.bpm} BPM
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#78716C]">曲中の転調回数</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#C83E2B]">
                計 {song.keyChanges} 回
              </span>
            </div>
            <div>
              <span className="block text-xs text-[#78716C]">ライブ熱量</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#1E3A5F]">
                Lv.{song.energyLevel} / 10
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleTempo}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
              isPlayingTempo
                ? 'border-[#C83E2B] bg-[#C83E2B] text-white'
                : 'border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
            }`}
          >
            {isPlayingTempo ? (
              <>
                <Square className="h-3.5 w-3.5 fill-current" />
                メトロノーム停止 (BPM {song.bpm})
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-[#C83E2B]" />
                BPM {song.bpm} のテンポ確認（メトロノーム音）
              </>
            )}
          </button>
        </div>

        {/* Vocal Range & High/Low Note Section Analysis */}
        <div className="mt-4 rounded-xl border border-[#E6E1D6] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
            <h3 className="text-sm font-bold text-[#1C1917]">
              音域データ（最高音・最低音）＆登場パート分析
            </h3>
            <span className="text-xs font-mono-num text-[#78716C]">
              音域幅：約 {song.vocalRange.rangeSpanSemitones} 半音
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="rounded-lg bg-[#FBF9F5] border border-[#E6E1D6] p-3">
              <span className="block text-[11px] font-bold text-[#78716C]">地声最低音</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#1E3A5F]">
                {song.vocalRange.lowestNote}
              </span>
              <span className="mt-1 block text-[11px] text-[#57534E] leading-snug">
                {song.vocalRange.lowNoteSection}
              </span>
            </div>

            <div className="rounded-lg bg-[#FBF9F5] border border-[#E6E1D6] p-3">
              <span className="block text-[11px] font-bold text-[#78716C]">地声最高音</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#C83E2B]">
                {song.vocalRange.highestChestNote}
              </span>
              <span className="mt-1 block text-[11px] text-[#57534E] leading-snug">
                {song.vocalRange.highNoteSection}
              </span>
            </div>

            <div className="rounded-lg bg-[#FBF9F5] border border-[#E6E1D6] p-3">
              <span className="block text-[11px] font-bold text-[#78716C]">裏声（ファルセット）最高音</span>
              <span className="mt-0.5 block text-base font-bold font-mono-num text-[#B45309]">
                {song.vocalRange.highestFalsettoNote}
              </span>
              <span className="mt-1 block text-[11px] text-[#57534E] leading-snug">
                歌唱ポイント：{song.vocalRange.singingAdvice}
              </span>
            </div>
          </div>
        </div>

        {/* Pull Quote Lyric */}
        <blockquote className="my-5 border-y border-[#E6E1D6] bg-white py-4 px-4 sm:px-6 text-center">
          <p className="font-editorial text-base sm:text-lg italic leading-relaxed text-[#1C1917] text-balance">
            「{song.iconicLyricQuote}」
          </p>
          <footer className="mt-1.5 text-xs text-[#78716C]">
            — {getSongwriterCredit(song)}（Official髭男dism『{song.title}』より）
          </footer>
        </blockquote>

        {/* 2-Column Reading Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
                <Disc className="h-4 w-4 text-[#C83E2B]" />
                楽曲の背景・ライナーノーツ
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#57534E]">
                {song.linerNotes}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
                <Music className="h-4 w-4 text-[#1E3A5F]" />
                サウンド＆アレンジの聴きどころ
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#57534E]">
                {song.musicalHighlight}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
                <Mic2 className="h-4 w-4 text-[#B45309]" />
                歌詞の世界観・考察
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#57534E]">
                {song.lyricAnalysis}
              </p>
            </div>
            <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#1C1917]">
                <Radio className="h-4 w-4 text-[#15803D]" />
                ライブでの演出・アレンジ
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#57534E]">
                {song.liveArrangementNote}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E6E1D6] pt-4">
          <div className="text-xs text-[#78716C]">
            現在の人気投票: <strong className="text-[#1C1917]">{song.votes.overall}</strong> 票（歌詞部門: <strong className="text-[#1C1917]">{song.votes.lyric}</strong> 票）
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onVoteSong(song.id, 'overall')}
              disabled={hasVoted}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex-1 sm:flex-initial ${
                hasVoted
                  ? 'border border-[#E6E1D6] bg-[#F2EFE9] text-[#78716C]'
                  : 'border border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] cursor-pointer'
              }`}
            >
              <Sparkles className="h-4 w-4 text-[#B45309]" />
              {hasVoted ? '人気投票済み' : 'この曲に1票投じる'}
            </button>

            <button
              type="button"
              onClick={() => onAddToSetlist(song.id)}
              disabled={isInSetlist}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex-1 sm:flex-initial ${
                isInSetlist
                  ? 'bg-[#1C1917] text-white'
                  : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
              }`}
            >
              {isInSetlist ? (
                <>
                  <Check className="h-4 w-4" />
                  マイセトリに追加済み
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  マイセトリに追加する
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
