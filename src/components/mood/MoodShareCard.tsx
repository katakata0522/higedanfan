import { useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { GuideArtwork } from '../GuideArtwork';
import {
  formatDiagnosisShareText,
  isSafeAssetUrl,
  MOOD_LABELS,
  SITUATION_LABELS,
  SOUND_LABELS,
  type MoodCriteria,
  type ScoredSongMatch,
} from '../../utils/fanLogic';

export type ShareTheme = 'dark' | 'editorial';

interface MoodShareCardProps {
  matches: ScoredSongMatch[];
  criteria: MoodCriteria;
  rankIndex: number | null;
  onSelectRank: (index: number | null) => void;
  theme: ShareTheme;
  onSelectTheme: (theme: ShareTheme) => void;
}

export function MoodShareCard({
  matches, criteria, rankIndex, onSelectRank, theme, onSelectTheme,
}: MoodShareCardProps) {
  const [copiedShareText, setCopiedShareText] = useState(false);
  const copyTimer = useRef<number | null>(null);
  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  if (rankIndex === null) return null;
  const match = matches[rankIndex] ?? matches[0];
  if (!match) return null;

  const handleCopyShareCardText = async () => {
    const text = formatDiagnosisShareText(match, criteria);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('以下の文章を選択してコピーしてください。', text);
      return;
    }
    setCopiedShareText(true);
    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
    }
    copyTimer.current = window.setTimeout(() => {
      setCopiedShareText(false);
      copyTimer.current = null;
    }, 2500);
  };

  return (
    <div
      id="diagnosis-share-card-panel"
      role="region"
      aria-label="SNSシェアカードプレビュー"
      data-testid="diagnosis-sns-share-card"
      className="mt-6 pt-6 border-t border-[#E6E1D6] space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[#1C1917]">
            マイソング診断 SNS風シェアカード（既存のDOM要素のみで構築）
          </h4>
          <p className="text-xs text-[#57534E]">
            おすすめ1位〜3位の楽曲切り替えや、カード背景テーマの切り替えにも対応しています。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyShareCardText}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedShareText ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#FDE68A]" />
                <span>シェア文をコピーしました！</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>シェア文をコピー</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectRank(null)}
            aria-label="シェアカードを閉じる"
            className="inline-flex items-center justify-center rounded-lg border border-[#D5CEC2] bg-white p-2 text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Controls: Switch Recommended Song (1st / 2nd / 3rd) & Theme (Dark / Editorial) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#78716C] mr-1">
            カード表示曲：
          </span>
          {matches.map((m, idx) => (
            <button
              key={m.song.id}
              type="button"
              onClick={() => onSelectRank(idx)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                rankIndex === idx
                  ? 'bg-[#C83E2B] text-white'
                  : 'border border-[#D5CEC2] bg-white text-[#1C1917] hover:bg-[#F2EFE9]'
              }`}
            >
              {idx + 1}位：{m.song.title} ({m.matchScore}点)
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#78716C]">
            配色：
          </span>
          <button
            type="button"
            onClick={() => onSelectTheme('dark')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#1C1917] text-white'
                : 'border border-[#D5CEC2] bg-white text-[#57534E]'
            }`}
          >
            ダーク仕様
          </button>
          <button
            type="button"
            onClick={() => onSelectTheme('editorial')}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
              theme === 'editorial'
                ? 'bg-[#1C1917] text-white'
                : 'border border-[#D5CEC2] bg-white text-[#57534E]'
            }`}
          >
            マガジン紙面仕様
          </button>
        </div>
      </div>

      {/* The Visual SNS Card Constructed Purely with Existing DOM & Assets */}
      <div
        className={`mx-auto max-w-2xl overflow-hidden rounded-2xl border shadow-lg transition-colors ${
          theme === 'dark'
            ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
            : 'border-[#1C1917] bg-[#FBF9F5] text-[#1C1917]'
        }`}
      >
        {/* Card Top Strip */}
        <div
          className={`flex items-center justify-between gap-2 border-b px-5 py-3 text-xs ${
            theme === 'dark'
              ? 'border-white/15 bg-black/30'
              : 'border-[#E6E1D6] bg-[#F2EFE9]'
          }`}
        >
          <span
            className={`font-bold ${
              theme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
            }`}
          >
            115万キロのファンノート · マイソング診断結果
          </span>
          <span
            className={`font-mono-num font-bold ${
              theme === 'dark' ? 'text-white' : 'text-[#1C1917]'
            }`}
          >
            選曲スコア {match.matchScore}点
          </span>
        </div>

        {/* Card Body: Song Jacket Image + Song Title & Match Reason */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          <div className="sm:col-span-5">
            <div className="relative aspect-square w-full max-w-[220px] sm:max-w-none mx-auto overflow-hidden rounded-xl bg-black ring-1 ring-black/15 shadow-md">
              {isSafeAssetUrl(match.song.jacketImage) && (
                <GuideArtwork
                  src={match.song.jacketImage}
                  alt={`${match.song.title}  オリジナル図柄`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3">
                <span className="block text-[10px] font-mono-num text-white/75">
                  {match.song.album} · {match.song.releaseDate}
                </span>
                <span className="block text-xs font-bold text-white min-w-0 wrap-anywhere whitespace-normal">
                  Official髭男dism
                </span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-7 space-y-3">
            <div>
              <div
                className={`text-[11px] font-bold ${
                  theme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
                }`}
              >
                今のあなたに響くおすすめの1曲（おすすめ第{rankIndex + 1}位）
              </div>
              <div
                className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${
                  theme === 'dark' ? 'text-white' : 'text-[#1C1917]'
                }`}
              >
                『{match.song.title}』
              </div>
              <div
                className={`mt-1 text-[11px] ${
                  theme === 'dark' ? 'text-white/70' : 'text-[#57534E]'
                }`}
              >
                {MOOD_LABELS[criteria.mood]} ／ {SITUATION_LABELS[criteria.situation]} ／{' '}
                {SOUND_LABELS[criteria.sound]}
              </div>
            </div>

            <div
              className={`rounded-xl border p-3.5 space-y-1.5 ${
                theme === 'dark'
                  ? 'border-white/15 bg-white/5'
                  : 'border-[#E6E1D6] bg-white'
              }`}
            >
              <div
                className={`text-[11px] font-bold ${
                  theme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
                }`}
              >
                今の気分にマッチする理由
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  theme === 'dark' ? 'text-white/95' : 'text-[#1C1917]'
                }`}
              >
                {match.moodMatchExplanation}
              </p>
            </div>

            <p
              className={`font-editorial text-xs italic border-t pt-2.5 ${
                theme === 'dark'
                  ? 'text-white/80 border-white/15'
                  : 'text-[#57534E] border-[#E6E1D6]'
              }`}
            >
              曲調：{match.song.musicalHighlight}
            </p>
          </div>
        </div>

        {/* Card Bottom Hashtag Strip */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-t px-5 py-2.5 text-[11px] ${
            theme === 'dark'
              ? 'border-white/10 bg-black/25 text-white/65'
              : 'border-[#E6E1D6] bg-[#F2EFE9] text-[#57534E]'
          }`}
        >
          <span>#115万キロのファンノート #Official髭男dism #マイソング診断</span>
          <span className="font-mono-num">
            BPM {match.song.bpm} · 最高音{' '}
            {match.song.vocalRange.highestChestNote}
          </span>
        </div>
      </div>
    </div>
  );
}
