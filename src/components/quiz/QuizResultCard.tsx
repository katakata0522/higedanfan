import { RotateCcw, Award, Newspaper } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import type { QuizResultSummary } from '../../utils/fanLogic';

interface Props {
  visible: boolean;
  activeCourseLabel: string;
  quizSummary: QuizResultSummary;
  onRestart: () => void;
  onChooseCourse: () => void;
  onOpenArchive?: () => void;
}

export function QuizResultCard({
  visible, activeCourseLabel, quizSummary, onRestart, onChooseCourse, onOpenArchive,
}: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    if (visible && heading.current) {
      heading.current.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="mt-6 rounded-2xl border border-[#D5CEC2] bg-white p-6 sm:p-8 text-center space-y-5 shadow-xs">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF8EC] text-[#B45309]">
        <Award className="h-7 w-7" />
      </div>

      <div className="text-xs font-bold text-[#78716C]">
        Official髭男dism検定 認定結果（{activeCourseLabel}）
      </div>

      <h2 ref={heading} tabIndex={-1} className="scroll-mt-20 text-xl sm:text-2xl font-bold text-[#1C1917]">
        認定ランク：{quizSummary.rankTitle}
      </h2>

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
          onClick={() => (onOpenArchive ? onOpenArchive() : (window.location.hash = 'quiz_archive'))}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-5 py-2.5 text-xs font-bold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Newspaper className="h-4 w-4" />
          参考記事・インタビューを読む
        </button>
      </div>

    </div>
  );
}
