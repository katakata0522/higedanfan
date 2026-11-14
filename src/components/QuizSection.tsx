import { useLayoutEffect, useMemo, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  sessionRef: RefObject<QuizSession | null>;
  resetEpoch: string;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  initialTab?: 'quiz' | 'archive';
  onBackHome?: () => void;
}

export function QuizSection({
  sessionRef, resetEpoch, songs = [], onSelectSong, initialTab: viewTab = 'quiz', onBackHome,
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
        <div className="pb-5 border-b border-[#e5dccb] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {onBackHome && (
                <button
                  type="button"
                  onClick={onBackHome}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1 text-xs font-bold text-[#253331] hover:border-[#253331] hover:bg-[#f4efe4] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5 text-[#C83E2B]" aria-hidden="true" />
                  <span>付箋一覧へ戻る</span>
                </button>
              )}
              <span
                className="fusen-washi-tag"
                style={{ '--tape-bg': 'rgba(192, 230, 199, 0.78)' } as CSSProperties}
              >
                {viewTab === 'archive' ? '制作とインタビューの記録' : 'ヒゲダン愛の力試し'}
              </span>
            </div>

            {viewTab === 'quiz' && quizStage !== 'select' && (
              <button
                type="button"
                onClick={chooseCourse}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                {quizStage === 'playing' ? '検定を終了してコース選択へ' : 'コース選択へ戻る'}
              </button>
            )}
          </div>
          <div>
            <h2
              id="quiz-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              {viewTab === 'archive' ? '参考記事・インタビュー' : 'Official髭男dism検定'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              {viewTab === 'archive'
                ? '曲の物語や検定で参考にした記事・インタビュー・公式資料。記事名・媒体・日付から、掲載元をたどれます。'
                : questionSet && questionSet !== 'current' && quizStage !== 'select'
                ? '更新前に始めた検定を、当時の問題の続きから再開しています。'
                : 'どの曲にも、思わず誰かに話したくなる背景がある。気になるコースを選んで挑戦しよう。'}
            </p>
          </div>
        </div>

        {viewTab === 'quiz' && sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] p-3 text-xs text-[#57534E]">
            このブラウザでは途中経過を一時保存できません。画面を移動すると回答が消える場合があります。
          </p>
        )}

        {viewTab === 'quiz' && quizStage === 'select' && (
          <QuizCoursePicker onStart={startCourse} />
        )}
        {/* Switching tabs keeps the current answer, certificate and archive filters. */}
        {quizStage === 'playing' && question && (
          <>
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
            {viewTab === 'quiz' && <button type="button" onClick={chooseCourse}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#57534E] underline underline-offset-4 hover:text-[#C83E2B] cursor-pointer">
              <ArrowLeft className="h-4 w-4" />検定を終了してコース選択へ
            </button>}
          </>
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
