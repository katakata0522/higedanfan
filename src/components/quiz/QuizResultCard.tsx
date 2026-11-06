import { RotateCcw, Award, Newspaper, Share2, Copy, Check, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { QuizResultSummary } from '../../utils/fanLogic';

interface Props {
  visible: boolean;
  activeCourseLabel: string;
  quizSummary: QuizResultSummary;
  onRestart: () => void;
  onChooseCourse: () => void;
}

export function QuizResultCard({
  visible, activeCourseLabel, quizSummary, onRestart, onChooseCourse,
}: Props) {
  const [isCertShareOpen, setIsCertShareOpen] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleCopyCertShareText = async () => {
    const shareText = `【ヒゲダン検定クイズ（全60問）】\n挑戦コース：${activeCourseLabel}\n認定ランク：${quizSummary.rankTitle}（${quizSummary.rankBadgeCode}）\n正解数：${quizSummary.score} / ${quizSummary.total} 問（正答率 ${quizSummary.percentage}%）\n#115万キロのファンノート #Official髭男dism #ヒゲダン検定`;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      window.prompt('以下の文章を選択してコピーしてください。', shareText);
      return;
    }
    setCopiedCert(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedCert(false);
      copyTimerRef.current = null;
    }, 2500);
  };

  if (!visible) return null;
  return (
    <div className="mt-6 rounded-2xl border border-[#D5CEC2] bg-white p-6 sm:p-8 text-center space-y-5 shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF8EC] text-[#B45309]">
        <Award className="h-7 w-7" />
      </div>

      <div className="text-xs font-bold text-[#78716C]">
        ヒゲダン検定クイズ 認定結果（{activeCourseLabel}）
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
        認定ランク：{quizSummary.rankTitle}
      </h3>

      <p className="font-mono-num text-base sm:text-lg font-bold text-[#C83E2B]">
        正解数 {quizSummary.score} / {quizSummary.total} 問（正答率{' '}
        {quizSummary.percentage}%）
      </p>

      <p className="mx-auto max-w-xl text-xs sm:text-sm text-[#57534E] leading-relaxed">
        {quizSummary.editorialMessage}
      </p>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsCertShareOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isCertShareOpen
              ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
              : 'border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
          }`}
        >
          <Share2 className="h-4 w-4 text-[#C83E2B]" />
          シェアカード生成
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A93020] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          同じコースにもう一度挑戦する
        </button>

        <button
          type="button"
          onClick={onChooseCourse}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          別のコースを選ぶ
        </button>

        <button
          type="button"
          onClick={() => (window.location.hash = 'quiz_archive')}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-5 py-2.5 text-xs font-bold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Newspaper className="h-4 w-4" />
          全60問の出典＆トリビア図鑑を読む
        </button>
      </div>

      {/* DOM-Based Quiz Certificate SNS Share Card */}
      {isCertShareOpen && (
        <div className="mt-5 pt-5 border-t border-[#E6E1D6] text-left space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-[#1C1917]">
              ヒゲダン検定 認定証シェアカード
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCertShareText}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors cursor-pointer"
              >
                {copiedCert ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#FDE68A]" />
                    コピーしました！
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    認定証テキストをコピー
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsCertShareOpen(false)}
                aria-label="認定証シェアカードを閉じる"
                className="inline-flex items-center justify-center rounded-lg border border-[#D5CEC2] bg-white p-2 text-[#57534E] hover:border-[#1C1917] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] shadow-lg">
            <div className="flex items-center justify-between border-b border-white/15 bg-black/30 px-5 py-3 text-xs">
              <span className="font-bold text-[#F5D0C9]">
                115万キロのファンノート · ヒゲダン検定クイズ認定証
              </span>
              <span className="font-mono-num font-bold text-white">
                {quizSummary.rankBadgeCode}
              </span>
            </div>
            <div className="p-6 space-y-3">
              <div className="text-xs text-white/75">{activeCourseLabel}</div>
              <div className="text-xl sm:text-2xl font-bold text-white">
                認定ランク：{quizSummary.rankTitle}
              </div>
              <div className="font-mono-num text-base font-bold text-[#F5D0C9]">
                正解数 {quizSummary.score} / {quizSummary.total} 問（正答率{' '}
                {quizSummary.percentage}%）
              </div>
              <p className="text-xs text-white/85 leading-relaxed pt-2 border-t border-white/15">
                {quizSummary.editorialMessage}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 bg-black/25 px-5 py-2.5 text-[11px] text-white/65">
              <span>#115万キロのファンノート #Official髭男dism #ヒゲダン検定</span>
              <span>全60問・出題ごとに出典を掲載</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
