import { CheckCircle2, XCircle, ArrowRight, BookOpen, ExternalLink, Newspaper, Check, ListOrdered, ChevronDown } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import type { QuizQuestion, SongItem } from '../../data/higedanData';
import { formatOrderingSequence } from '../../utils/fanLogic';
import { isAnswerCorrect, type QuizAnswer } from './quizSession';
import { DIFFICULTY_LABEL } from './quizCourses';
import { visibleQuizSourceSummary } from './quizSourceSummary';

interface Props {
  visible: boolean;
  question: QuizQuestion;
  currentIndex: number;
  questionCount: number;
  score: number;
  answer: QuizAnswer;
  onAnswerChange: (answer: QuizAnswer) => void;
  onNext: () => void;
  relatedSong?: SongItem;
  onSelectSong?: (song: SongItem) => void;
}

export function QuizQuestionCard({
  visible, question, currentIndex, questionCount, score, answer, onAnswerChange, onNext, relatedSong, onSelectSong,
}: Props) {
  const { selectedOption, selectedOrder, isOrderingSubmitted } = answer;
  const heading = useRef<HTMLHeadingElement>(null);
  const orderingResult = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (visible && heading.current) {
      heading.current.focus({ preventScroll: true });
      heading.current.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
  }, [visible, question.id]);
  const isOrderingQuestion = question.questionType === 'ordering';
  const isQuestionAnswered = isOrderingQuestion ? isOrderingSubmitted : selectedOption !== null;
  const isCurrentQuestionCorrect = isAnswerCorrect(question, answer);
  useLayoutEffect(() => {
    if (visible && isOrderingQuestion && isOrderingSubmitted && orderingResult.current) {
      orderingResult.current.focus({ preventScroll: true });
    }
  }, [visible, isOrderingQuestion, isOrderingSubmitted]);

  const handleAnswerSingleChoice = (optionIdx: number) => {
    if (selectedOption !== null) return;
    onAnswerChange({ ...answer, selectedOption: optionIdx });
  };

  const handleToggleOrderOption = (optionIdx: number) => {
    if (isOrderingSubmitted) return;
    const nextOrder = selectedOrder.includes(optionIdx)
      ? selectedOrder.filter(item => item !== optionIdx)
      : [...selectedOrder, optionIdx];
    onAnswerChange({ ...answer, selectedOrder: nextOrder });
  };

  const handleSubmitOrdering = () => {
    if (
      isOrderingSubmitted ||
      !question.correctOrder ||
      selectedOrder.length !== question.options.length
    ) {
      return;
    }
    onAnswerChange({ ...answer, isOrderingSubmitted: true });
  };

  if (!visible) return null;
  return (
    <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#78716C] border-b border-[#E6E1D6] pb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#1C1917]">
            第 {currentIndex + 1} 問 / 全 {questionCount} 問 ·{' '}
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
          {isOrderingQuestion && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
              <ListOrdered className="h-3 w-3" />
              順番に並べる問題
            </span>
          )}
        </div>
        <span className="font-mono-num">現在 {score} 問正解</span>
      </div>

      <h3 ref={heading} tabIndex={-1} className="mt-4 scroll-mt-20 text-base sm:text-xl font-bold text-[#1C1917] leading-relaxed">
        Q{currentIndex + 1}. {question.prompt}
      </h3>

      <p className="mt-2 text-xs text-[#78716C]">
        ヒント: {question.hint}
      </p>

      {/* ============================================================
          INTERACTIVE TAP-TO-ORDER SEQUENCE QUIZ UI
          ============================================================ */}
      {isOrderingQuestion ? (
        <div className="mt-5 space-y-4">
          {!isOrderingSubmitted && <p className="text-xs text-[#57534E]">順番に選んでください。もう一度押すと選択を取り消せます。</p>}

          {/* 4 Selectable Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options.map((opt, idx) => {
              const orderPos = selectedOrder.indexOf(idx);
              const isSelected = orderPos !== -1;
              let btnStyle =
                'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white cursor-pointer';
              if (isSelected) {
                btnStyle =
                  'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] cursor-pointer';
              }

              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={isOrderingSubmitted}
                  onClick={() => handleToggleOrderOption(idx)}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4 text-left text-sm font-bold transition-colors ${btnStyle}`}
                >
                  <span>{opt}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <span
                        className="rounded-md px-2.5 py-1 text-xs font-mono-num font-bold bg-[#C83E2B] text-white"
                      >
                        {orderPos + 1}番目
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confirm Order Button */}
          {!isOrderingSubmitted && (
            <div className="flex items-center justify-end gap-3 pt-1">
              <span className="text-xs text-[#78716C]">
                {selectedOrder.length < 4
                  ? `あと ${4 - selectedOrder.length} 個選択してください`
                  : '1番目〜4番目まで選択完了！'}
              </span>
              <button
                type="button"
                disabled={selectedOrder.length !== 4}
                onClick={handleSubmitOrdering}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C83E2B] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" />
                この順番で回答する
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================
           STANDARD 4-OPTION SINGLE CHOICE UI
           ============================================================ */
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt, idx) => {
            const isAnswered = selectedOption !== null;
            const isChosen = selectedOption === idx;
            const isCorrect = question.correctIndex === idx;

            let btnStyle =
              'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white cursor-pointer';
            if (isAnswered) {
              if (isCorrect) {
                btnStyle = 'border-[#15803D] bg-[#F0FDF4] text-[#14532D]';
              } else if (isChosen && !isCorrect) {
                btnStyle = 'border-[#C83E2B] bg-[#FDF3F1] text-[#7F1D1D]';
              } else {
                btnStyle = 'border-[#E6E1D6] bg-white text-[#78716C] opacity-60';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={isAnswered}
                onClick={() => handleAnswerSingleChoice(idx)}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4 text-left text-sm font-bold transition-colors ${btnStyle}`}
              >
                <span>
                  {idx + 1}. {opt}
                </span>
                {isAnswered && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#15803D]" />
                )}
                {isAnswered && isChosen && !isCorrect && (
                  <XCircle className="h-5 w-5 shrink-0 text-[#C83E2B]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation, Sources & Next Button */}
      {isQuestionAnswered && (
        <div ref={isOrderingQuestion ? orderingResult : undefined} tabIndex={isOrderingQuestion ? -1 : undefined} className="mt-5 scroll-mt-20 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 space-y-4">
          <div>
            <div className="text-xs sm:text-sm font-bold text-[#1C1917]">
              {isCurrentQuestionCorrect
                ? '正解！'
                : 'おしい！正解はこちら'}
            </div>

            {isOrderingQuestion && question.correctOrder && (
              <div className="mt-2 rounded-lg border border-[#E6E1D6] bg-white p-3 text-xs space-y-1">
                {!isCurrentQuestionCorrect && (
                  <div className="text-[#57534E]">
                    <strong className="text-[#1C1917]">あなたの選択順：</strong>{' '}
                    {formatOrderingSequence(question.options, selectedOrder)}
                  </div>
                )}
                <div className="text-[#15803D] font-bold">
                  <strong>正しい順番：</strong>{' '}
                  {formatOrderingSequence(
                    question.options,
                    question.correctOrder
                  )}
                </div>
              </div>
            )}

            <p className="mt-2 text-xs sm:text-sm text-[#57534E] leading-relaxed">
              {question.explanation}
            </p>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
            {relatedSong && onSelectSong ? (
              <button
                type="button"
                onClick={() => onSelectSong(relatedSong)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                『{relatedSong.title}』の楽曲解説を読む
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {currentIndex + 1 < questionCount
                ? '次の問題へ進む'
                : '検定結果を見る'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Verified Source Articles Box */}
          {question.sources && question.sources.length > 0 && (
            <details className="group rounded-xl border border-[#E6E1D6] bg-white p-3.5 sm:p-4">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-bold text-[#1E3A5F] [&::-webkit-details-marker]:hidden">
                <Newspaper className="h-3.5 w-3.5 shrink-0" />
                <span>出典・参考資料</span>
                <ChevronDown aria-hidden="true" className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5">
                {question.sources.map((src, sIdx) => {
                  const summary = visibleQuizSourceSummary(src);
                  return (
                    <div
                      key={`${question.id}-src-${sIdx}`}
                      className="rounded-lg border border-[#F0ECE1] bg-[#FBF9F5] p-3 text-left"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#C83E2B]">
                          {src.publisher} · {src.publishedNote}
                        </span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E3A5F] hover:underline"
                        >
                          記事・公式情報を開く
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="mt-1 text-xs sm:text-sm font-bold text-[#1C1917]">
                        {src.title}
                      </div>
                      {summary && <p className="mt-1 text-xs text-[#57534E] leading-relaxed">{summary}</p>}
                    </div>
                  );
                })}
              </div>
            </details>
          )}

        </div>
      )}
    </div>
  );
}
