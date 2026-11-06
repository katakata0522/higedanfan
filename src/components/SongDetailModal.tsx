import { GuideArtwork } from './GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import React, { useEffect, useRef, useState } from 'react';
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

  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    setIsPlayingTempo(false);
    stopTempoPreview();
    if (!song) return;

    const from = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && panel.current) {
        const elems = panel.current.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]');
        const first = elems[0], last = elems[elems.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
      if (e.key === 'Escape') {
        stopTempoPreview();
        closeRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      from?.focus();
      window.removeEventListener('keydown', handleKeyDown);
      stopTempoPreview();
    };
  }, [song?.id]);

  if (!song) return null;
  const fact = songEvidence[song.id as keyof typeof songEvidence];

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
      ref={panel}
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
              <GuideArtwork
                src={song.jacketImage}
                alt={`${song.title} のイメージ画像`}
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
                {fact.recording} · {fact.album}
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
              <span className="block text-xs text-[#78716C]">ライブ熱量（編集部の目安）</span>
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

        <section className="mt-5 space-y-4 text-sm" aria-label="楽曲データと出典">
          <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
            <h3 className="font-bold">曲調・聴きどころ</h3><p className="my-2">{fact.style}</p>
            <a className="underline" href={fact.styleSource} target="_blank" rel="noreferrer">{fact.styleLabel}を読む ↗</a>
          </div>
          <div className="rounded-xl border border-[#E6E1D6] bg-white p-4">
            <h3 className="font-bold">歌の音域（採譜者による分析）</h3>
            <dl className="my-3 grid grid-cols-3 gap-2 text-xs">
              <div><dt>地声最低</dt><dd className="font-bold">{song.vocalRange.lowestNote}</dd></div>
              <div><dt>地声最高</dt><dd className="font-bold">{song.vocalRange.highestChestNote}</dd></div>
              <div><dt>裏声最高</dt><dd className="font-bold">{song.vocalRange.highestFalsettoNote}</dd></div>
            </dl>
            <p>掲載値の幅：{song.vocalRange.rangeSpanSemitones}半音。裏声欄の「記載なし」は、裏声を使わないという意味ではありません。</p>
            <a className="underline" href={fact.rangeSource} target="_blank" rel="noreferrer">採用した採譜：{fact.rangeLabel} ↗</a>
            {fact.otherRange && <p className="mt-2">別の採譜（地声最低／地声最高／裏声最高）：
              {fact.otherRange.join(' ／ ')}。 <a className="underline" href={fact.otherSource} target="_blank" rel="noreferrer">音域調査 Wiki ↗</a></p>}
          </div>
          <div className="rounded-xl border border-[#E6E1D6] bg-white p-4 space-y-2">
            <h3 className="font-bold">収録音源と発売日</h3>
            <p>{fact.recording} ／ {fact.album}：{formatDuration(fact.seconds)}。配信サービス掲載日：{fact.release}。
              <a className="underline" href={fact.apple} target="_blank" rel="noreferrer">Apple Music の楽曲情報 ↗</a></p>
            {fact.cd && <p>この作品のCD発売日：{fact.cd}。 <a className="underline" href={fact.cdSource} target="_blank" rel="noreferrer">公式作品情報 ↗</a></p>}
            <p>テンポ：{fact.tempo} BPM。拍をどう数えるかで、倍・半分の表記になる曲があります。
              <a className="underline" href={fact.tempoSource} target="_blank" rel="noreferrer">テンポの資料 ↗</a></p>
          </div>
        </section>

        {/* Action Controls Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E6E1D6] pt-4">
          <div className="text-xs text-[#78716C]">
            参考票を含む、この端末の投票表示： <strong className="text-[#1C1917]">{song.votes.overall}</strong> 票（歌詞部門: <strong className="text-[#1C1917]">{song.votes.lyric}</strong> 票）
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
