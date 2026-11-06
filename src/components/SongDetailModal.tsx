import { GuideArtwork } from './GuideArtwork';
import { songEvidence } from '../data/fullCatalogSongs';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { X, Music, Sparkles, Plus, Check, Disc, Mic2, Radio, Volume2, Square } from 'lucide-react';
import { SongItem } from '../data/higedanData';
import { songwriterInfo } from '../utils/songCatalog';
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

  const panel = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    setIsPlayingTempo(false);
    stopTempoPreview();
    const dialog = panel.current;
    if (!song || !dialog) return;

    const from = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    dialog.querySelector<HTMLButtonElement>('button')?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const elems = dialog.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]');
        const first = elems[0], last = elems[elems.length-1];
        if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
          e.preventDefault();
          (e.shiftKey ? last : first)?.focus();
        } else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      dialog.close();
      if (from?.isConnected) from.focus({preventScroll: true});
      window.removeEventListener('keydown', handleKeyDown);
      stopTempoPreview();
    };
  }, [song?.id]);

  useLayoutEffect(() => {
    const dialog = panel.current;
    if (dialog?.open && (!dialog.contains(document.activeElement) || document.activeElement?.matches(':disabled'))) {
      dialog.querySelector<HTMLButtonElement>('button')?.focus({preventScroll: true});
    }
  }, [isInSetlist, hasVoted]);

  if (!song) return null;
  const songwriter = songwriterInfo(song);
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
    <dialog
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-transparent p-3 text-inherit open:flex sm:p-4 backdrop:bg-[#1C1917]/60 backdrop:backdrop-blur-xs"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="song-modal-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
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
            {song.id === 'mixed-nuts' && <p className="mt-2">ラストのフェイク（歌詞のない歌い回し）を含むと裏声最高はA#5、除くとC#5です。</p>}
            {fact.otherRange && <p className="mt-2">別の採譜（地声最低／地声最高／裏声最高）：
              {fact.otherRange.join(' ／ ')}。 <a className="underline" href={fact.otherSource} target="_blank" rel="noreferrer">音域調査 Wiki ↗</a></p>}
          </div>
          <div className="rounded-xl border border-[#E6E1D6] bg-white p-4 space-y-2">
            <h3 className="font-bold">収録音源と発売日</h3>
            <p>{getSongwriterCredit(song)}{songwriter && <> <a className="underline" href={songwriter.source} target="_blank" rel="noreferrer">作詞・作曲の出典 ↗</a></>}</p>
            <p>{fact.recording} ／ {fact.album}：{formatDuration(fact.seconds)}。配信サービス掲載日：{fact.release}。
              <a className="underline" href={fact.apple} target="_blank" rel="noreferrer">Apple Music の楽曲情報 ↗</a></p>
            {song.tieUps.length > 0 && <ul className="space-y-1" aria-label="タイアップと出典">
              {song.tieUps.map(item => <li key={item.text}>タイアップ：{item.text}。 <a className="underline" href={item.source} target="_blank" rel="noreferrer">出典 ↗</a></li>)}
            </ul>}
            {fact.cd && <p>この作品のCD発売日：{fact.cd}。 <a className="underline" href={fact.cdSource} target="_blank" rel="noreferrer">公式作品情報 ↗</a></p>}
            <p>テンポ：{fact.tempo} BPM。拍をどう数えるかで、倍・半分の表記になる曲があります。
              <a className="underline" href={fact.tempoSource} target="_blank" rel="noreferrer">テンポの資料 ↗</a></p>
          </div>
        </section>

        {/* Action Controls Footer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E6E1D6] pt-4">
          <div className="text-xs text-[#78716C]">
            この端末で投じた票： <strong className="text-[#1C1917]">{song.votes.overall}</strong> 票（歌詞部門: <strong className="text-[#1C1917]">{song.votes.lyric}</strong> 票）
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
    </dialog>
  );
};
