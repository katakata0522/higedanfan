import { ArrowRight, RotateCcw, Award, Newspaper, ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import type { QuizQuestion } from '../../data/higedanTypes';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { formatOrderingSequence, type QuizResultSummary } from '../../utils/quizScoring';
import { saveSongReturnTab } from '../../utils/songReturnTab';
import type { QuizQuestionOutcome } from './quizSession';

interface Props {
  visible: boolean;
  activeCourseLabel: string;
  quizSummary: QuizResultSummary;
  questions?: readonly QuizQuestion[];
  questionOutcomes?: readonly QuizQuestionOutcome[];
  nextVolumeLabel?: string;
  onNextVolume?: () => void;
  onRestart: () => void;
  onChooseCourse: () => void;
  onOpenArchive?: () => void;
}

export function QuizResultCard({
  visible,
  activeCourseLabel,
  quizSummary,
  questions,
  questionOutcomes,
  nextVolumeLabel,
  onNextVolume,
  onRestart,
  onChooseCourse,
  onOpenArchive,
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
        <Award aria-hidden="true" className="h-7 w-7" />
      </div>

      <div className="text-xs font-bold text-[#68625C]">
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
        {nextVolumeLabel && onNextVolume && (
          <button
            type="button"
            onClick={onNextVolume}
            className="inline-flex items-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A93020] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{nextVolumeLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            nextVolumeLabel && onNextVolume
              ? 'border border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
              : 'bg-[#C83E2B] text-white hover:bg-[#A93020]'
          }`}
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
          参考記事・インタビュー・SNSを読む
        </button>
      </div>

      {questions && questions.length > 0 && (
        <details className="group mt-4 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] text-left">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs sm:text-sm font-bold text-[#253331] [&::-webkit-details-marker]:hidden">
            <span>今回の{questions.length}問を振り返る（正誤と解説）</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#57534E] transition-transform group-open:rotate-180" />
          </summary>
          <ol className="divide-y divide-[#E6E1D6] border-t border-[#E6E1D6] px-4 py-2 text-xs sm:text-sm">
            {questions.map((q, idx) => {
              const outcome = questionOutcomes?.[idx];
              const answerText = q.questionType === 'ordering' && q.correctOrder
                ? formatOrderingSequence(q.options, q.correctOrder)
                : (q.options[q.correctIndex] ?? '');
              const songPath = q.relatedSongId ? songPagePath(q.relatedSongId) : null;
              return (
                <li key={q.id} className="space-y-1.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-[11px] font-bold text-[#57534E]">
                      問{idx + 1}
                    </span>
                    {outcome && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          outcome === 'correct'
                            ? 'bg-[#eef9f0] text-[#2e6f40]'
                            : 'bg-[#fdf2f0] text-[#A93020]'
                        }`}
                      >
                        {outcome === 'correct' ? '正解' : '不正解'}
                      </span>
                    )}
                  </div>
                  <p className="font-bold leading-relaxed text-[#1C1917]">{q.prompt}</p>
                  <p className="text-xs font-bold leading-relaxed text-[#253331]">答え：{answerText}</p>
                  {q.explanation && (
                    <p className="text-xs leading-relaxed text-[#57534E]">{q.explanation}</p>
                  )}
                  {songPath && (
                    <a
                      href={`${import.meta.env.BASE_URL}${songPath}`}
                      onClick={() => saveSongReturnTab('quiz')}
                      className="inline-flex items-center gap-1 pt-0.5 text-[11px] font-bold text-[#1E3A5F] underline underline-offset-2 hover:text-[#C83E2B]"
                    >
                      この曲の解説を見る →
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </details>
      )}
    </div>
  );
}
