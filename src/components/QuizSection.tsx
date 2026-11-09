import { useLayoutEffect, useMemo, useState, type RefObject } from 'react';
import { ArrowLeft, HelpCircle, Newspaper } from 'lucide-react';
import type { SongItem } from '../data/higedanData';
import { calculateQuizResult } from '../utils/fanLogic';
import { QuizCoursePicker } from './quiz/QuizCoursePicker';
import { QuizQuestionCard } from './quiz/QuizQuestionCard';
import { QuizResultCard } from './quiz/QuizResultCard';
import { QuizSourceArchive } from './quiz/QuizSourceArchive';
import { getCourseLabel, getCourseQuestions, type CourseDifficulty, type QuestionScopeFilter, type QuestionSet } from './quiz/quizCourses';
import { EMPTY_ANSWER, INITIAL_SESSION, isAnswerCorrect, type QuizSession } from './quiz/quizSession';
import { readQuizSession, saveQuizSession } from './quiz/quizSessionStorage';

interface QuizSectionProps {
  bestScorePercentage: number | null;
  sessionRef: RefObject<QuizSession | null>;
  resetEpoch: string;
  onUpdateBestScore: (percentage: number) => void;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  initialTab?: 'quiz' | 'archive';
}

export function QuizSection({
  bestScorePercentage, sessionRef, resetEpoch, onUpdateBestScore, songs = [], onSelectSong, initialTab: viewTab = 'quiz',
}: QuizSectionProps) {
  const [session, setSession] = useState(() => sessionRef.current ?? readQuizSession() ?? INITIAL_SESSION);
  const [sessionSaveUnavailable, setSessionSaveUnavailable] = useState(false);
  useLayoutEffect(() => { sessionRef.current = session; }, [sessionRef, session]);
  const { stage: quizStage, difficulty, scope, questionSet, currentIndex, correctBefore, answer } = session;
  const questions = useMemo(() => getCourseQuestions(difficulty, scope, questionSet), [difficulty, scope, questionSet]);
  const question = questions[currentIndex];
  const score = correctBefore + Number(quizStage === 'playing' && isAnswerCorrect(question, answer));

  function updateSession(next: QuizSession) {
    sessionRef.current = next;
    // Persist before navigation, so immediately opening a related song cannot
    // discard the answer that was just selected.
    setSessionSaveUnavailable(!saveQuizSession(next, resetEpoch));
    setSession(next);
  }

  function startCourse(course: CourseDifficulty, nextScope: QuestionScopeFilter, set: QuestionSet = 'current') {
    updateSession({ ...INITIAL_SESSION, stage: 'playing', difficulty: course, scope: nextScope, questionSet: set });
    window.location.hash = 'quiz';
  }

  function nextQuestion() {
    if (currentIndex + 1 < questions.length) {
      updateSession({ ...session, currentIndex: currentIndex + 1, correctBefore: score, answer: EMPTY_ANSWER });
    } else {
      updateSession({ ...session, stage: 'finished', correctBefore: score, answer: EMPTY_ANSWER });
      onUpdateBestScore(calculateQuizResult(score, questions).percentage);
    }
  }

  function chooseCourse() {
    const hasAnswerInput = answer.selectedOption !== null || answer.selectedOrder.length > 0;
    if (quizStage === 'playing' && (currentIndex > 0 || hasAnswerInput)) {
      if (!window.confirm('今回の検定を終了して、コース選択に戻りますか？\nもう一度挑戦すると、第1問から始まります。')) return;
    }
    updateSession(INITIAL_SESSION);
  }

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
              ヒゲダン検定クイズ（全60問）
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              1回10問。答え合わせのあとは、楽曲の背景やメンバーの言葉もたどれます。
            </p>
          </div>

          {viewTab === 'quiz' && quizStage !== 'select' && (
            <button
              type="button"
              onClick={chooseCourse}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {quizStage === 'playing' ? '検定を終了する' : 'コース選択へ戻る'}
            </button>
          )}
        </div>

        {sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] p-3 text-xs text-[#57534E]">
            このブラウザでは途中経過を一時保存できません。画面を移動すると回答が消える場合があります。
          </p>
        )}

        {/* Sub-navigation Tabs: Quiz Mode vs Source Archive Mode */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="クイズと出典記事図鑑の切り替え"
            className="inline-flex rounded-xl border border-[#D5CEC2] bg-[#F2EFE9] p-1"
          >
            <button
              type="button"

              aria-pressed={viewTab === 'quiz'}
              onClick={() => (window.location.hash = 'quiz')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                viewTab === 'quiz'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              クイズに挑戦する
            </button>
            <button
              type="button"

              aria-pressed={viewTab === 'archive'}
              onClick={() => (window.location.hash = 'quiz_archive')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                viewTab === 'archive'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              全60問の出典＆トリビア図鑑
            </button>
          </div>

          <span className="text-xs font-mono-num text-[#78716C]">
            全コース共通の最高正答率： <strong className="text-[#1C1917]">{bestScorePercentage === null ? '記録なし' : `${bestScorePercentage}%`}</strong>
          </span>
        </div>

        {viewTab === 'quiz' && quizStage === 'select' && (
          <QuizCoursePicker onStart={startCourse} />
        )}
        {/* Switching tabs keeps the current answer, certificate and archive filters. */}
        {quizStage === 'playing' && question && (
          <QuizQuestionCard
            key={question.id}
            visible={viewTab === 'quiz'}
            question={question}
            currentIndex={currentIndex}
            questionCount={questions.length}
            score={score}
            answer={answer}
            onAnswerChange={next => updateSession({ ...session, answer: next })}
            relatedSong={songs.find(song => song.id === question.relatedSongId)}
            onSelectSong={onSelectSong}
            onNext={nextQuestion}
          />
        )}
        {quizStage === 'finished' && (
          <QuizResultCard
            visible={viewTab === 'quiz'}
            activeCourseLabel={getCourseLabel(difficulty, scope)}
            quizSummary={calculateQuizResult(score, questions)}
            onRestart={() => startCourse(difficulty, scope, questionSet)}
            onChooseCourse={chooseCourse}
          />
        )}
        <QuizSourceArchive visible={viewTab === 'archive'} songs={songs} onSelectSong={onSelectSong} />
      </div>
    </section>
  );
}
