import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion, SongItem } from '../data/higedanData';
import { calculateQuizResult } from '../utils/fanLogic';

interface QuizSectionProps {
  bestScorePercentage: number;
  onUpdateBestScore: (percentage: number) => void;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
}

const QUIZ_COURSES: {
  id: 'all' | QuizQuestion['difficulty'];
  indexCode: string;
  title: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'all',
    indexCode: '01',
    title: '総合チャレンジコース',
    desc: '代表曲の歌詞からサウンドの秘密、バンドのルーツまで幅広く出題します。',
    badge: 'おすすめ・全範囲',
  },
  {
    id: 'beginner',
    indexCode: '02',
    title: '初級：代表曲・歌詞フレーズ編',
    desc: '『Pretender』『Subtitle』など、誰もが一度は耳にした名曲の歌詞やタイアップから出題。',
    badge: '入門コース',
  },
  {
    id: 'intermediate',
    indexCode: '03',
    title: '中級：転調・結成ルーツ編',
    desc: '山陰での結成エピソードや、ヒゲダンならではの緻密な転調ギミックに迫る問題。',
    badge: '中級コース',
  },
  {
    id: 'brothers',
    indexCode: '04',
    title: '上級：ディープ楽曲考察編',
    desc: 'アルバム曲の制作背景やライブ定番のコール＆レスポンスなど、熱心なファン向けの問題。',
    badge: '上級コース',
  },
];

export const QuizSection: React.FC<QuizSectionProps> = ({
  bestScorePercentage,
  onUpdateBestScore,
  songs = [],
  onSelectSong,
}) => {
  const [quizStage, setQuizStage] = useState<'select' | 'playing' | 'finished'>('select');
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | QuizQuestion['difficulty']
  >('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const activeQuestions = useMemo(
    () =>
      difficultyFilter === 'all'
        ? QUIZ_QUESTIONS
        : QUIZ_QUESTIONS.filter((q) => q.difficulty === difficultyFilter),
    [difficultyFilter]
  );

  const currentQuestion = activeQuestions[currentIndex] || activeQuestions[0];
  const relatedSong = useMemo(
    () =>
      currentQuestion?.relatedSongId
        ? songs.find((s) => s.id === currentQuestion.relatedSongId) || null
        : null,
    [currentQuestion, songs]
  );

  const handleStartCourse = (mode: 'all' | QuizQuestion['difficulty']) => {
    setDifficultyFilter(mode);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setQuizStage('playing');
  };

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(optionIdx);
    if (optionIdx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizStage('finished');
      const result = calculateQuizResult(score, activeQuestions);
      onUpdateBestScore(result.percentage);
    }
  };

  const handleBackToSelect = () => {
    setQuizStage('select');
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
  };

  const quizSummary = useMemo(
    () => calculateQuizResult(score, activeQuestions),
    [score, activeQuestions]
  );

  return (
    <section
      id="section-quiz"
      aria-labelledby="quiz-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="quiz-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              歌詞フレーズ ＆ 楽曲トリビア「ヒゲダン検定クイズ」
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              コースを選択すると1問ずつクイズ画面へ進みます。解説を読みながら気軽に楽しめます。
            </p>
          </div>

          {quizStage !== 'select' && (
            <button
              type="button"
              onClick={handleBackToSelect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              コース選択へ戻る
            </button>
          )}
        </div>

        {/* Stage 1: Course Selection Screen */}
        {quizStage === 'select' && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">
                挑戦したいコースを選んでスタートしてください
              </h3>
              <span className="text-xs font-mono-num text-[#78716C]">
                自己ベスト正答率: <strong className="text-[#1C1917]">{bestScorePercentage}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUIZ_COURSES.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleStartCourse(course.id)}
                  className="group flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 text-left hover:border-[#1C1917] transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-editorial font-mono-num text-xl font-bold text-[#C83E2B]">
                          {course.indexCode}.
                        </span>
                        <span className="text-xs font-bold text-[#78716C]">
                          {course.badge}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#1C1917] group-hover:text-[#C83E2B] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                        挑戦する
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <h4 className="mt-3.5 text-base sm:text-lg font-bold text-[#1C1917]">
                      {course.title}
                    </h4>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                      {course.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stage 2: Question-by-Question Screen */}
        {quizStage === 'playing' && currentQuestion && (
          <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
            <div className="flex items-center justify-between gap-2 text-xs text-[#78716C] border-b border-[#E6E1D6] pb-3.5">
              <span className="font-bold text-[#1C1917]">
                第 {currentIndex + 1} 問 / 全 {activeQuestions.length} 問 · テーマ：{currentQuestion.category}
              </span>
              <span className="font-mono-num">現在 {score} 問正解</span>
            </div>

            <h3 className="mt-4 text-base sm:text-xl font-bold text-[#1C1917] leading-relaxed">
              Q{currentIndex + 1}. {currentQuestion.prompt}
            </h3>

            <p className="mt-2 text-xs text-[#78716C]">
              ヒント: {currentQuestion.hint}
            </p>

            {/* Options */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isAnswered = selectedOption !== null;
                const isChosen = selectedOption === idx;
                const isCorrect = currentQuestion.correctIndex === idx;

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
                    onClick={() => handleAnswer(idx)}
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

            {/* Explanation & Next Button */}
            {selectedOption !== null && (
              <div className="mt-5 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5">
                <div className="text-xs font-bold text-[#1C1917]">
                  {selectedOption === currentQuestion.correctIndex
                    ? '正解です！さすがの知識量！'
                    : '惜しい！解説をチェックしてみましょう'}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
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
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {currentIndex + 1 < activeQuestions.length
                      ? '次の問題へ進む'
                      : '検定結果を見る'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 3: Final Result Certificate */}
        {quizStage === 'finished' && (
          <div className="mt-6 rounded-2xl border border-[#D5CEC2] bg-white p-6 sm:p-8 text-center space-y-4 shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF8EC] text-[#B45309]">
              <Award className="h-7 w-7" />
            </div>

            <div className="text-xs font-bold text-[#78716C]">
              ヒゲダン検定クイズ 認定結果
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

            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleStartCourse(difficultyFilter)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A93020] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                同じコースにもう一度挑戦する
              </button>
              <button
                type="button"
                onClick={handleBackToSelect}
                className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                別のコースを選ぶ
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
