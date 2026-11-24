import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { SongItem } from '../data/higedanTypes';
import { tabFromPathname } from '../config/siteFeatures';
import { calculateQuizResult } from '../utils/quizScoring';
import { QuizCoursePicker } from './quiz/QuizCoursePicker';
import { QuizQuestionCard } from './quiz/QuizQuestionCard';
import { QuizResultCard } from './quiz/QuizResultCard';
import { ConfirmDialog } from './ConfirmDialog';

const QuizSourceArchive = lazy(() =>
  import('./quiz/QuizSourceArchive').then(module => ({ default: module.QuizSourceArchive }))
);
import { getCourseLabel, getCourseQuestions, type CourseDifficulty, type QuestionScopeFilter, type QuestionSet } from './quiz/quizCourses';
import { EMPTY_ANSWER, INITIAL_SESSION, isAnswerCorrect, type QuizSession } from './quiz/quizSession';
import { readQuizSession, readQuizSessionAsync, saveQuizSession } from './quiz/quizSessionStorage';
import { loadQuizVolumeScores, saveQuizVolumeScore, type QuizVolumeRecordMap } from './quiz/quizVolumeRecords';

interface QuizSectionProps {
  sessionRef: RefObject<QuizSession | null>;
  resetEpoch: string;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  initialTab?: 'quiz' | 'archive';
  bestQuizScore?: number | null;
  onUpdateBestScore?: (percentage: number) => void;
  onOpenArchive?: () => void;
}

export function QuizSection({
  sessionRef, resetEpoch, songs = [], onSelectSong, initialTab: viewTab = 'quiz', bestQuizScore = null, onUpdateBestScore, onOpenArchive,
}: QuizSectionProps) {
  const [session, setSession] = useState(() => sessionRef.current ?? readQuizSession() ?? INITIAL_SESSION);
  const [sessionSaveUnavailable, setSessionSaveUnavailable] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [hasOpenedArchive, setHasOpenedArchive] = useState(() => viewTab === 'archive');
  const [volumeScores, setVolumeScores] = useState<QuizVolumeRecordMap>(() => loadQuizVolumeScores(resetEpoch));
  useLayoutEffect(() => { sessionRef.current = session; }, [sessionRef, session]);

  useEffect(() => {
    setVolumeScores(loadQuizVolumeScores(resetEpoch));
  }, [resetEpoch]);

  useEffect(() => {
    if (viewTab === 'archive') {
      setHasOpenedArchive(true);
    }
  }, [viewTab]);

  useEffect(() => {
    if (sessionRef.current && sessionRef.current.stage !== 'select') return undefined;
    let cancelled = false;
    void readQuizSessionAsync().then((restored) => {
      if (
        !cancelled &&
        restored &&
        restored.stage !== 'select' &&
        (!sessionRef.current || sessionRef.current.stage === 'select')
      ) {
        sessionRef.current = restored;
        setSession(restored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sessionRef, resetEpoch]);
  const { difficulty, scope, questionSet, currentIndex, correctBefore, answer } = session;
  const choosingNextCourse = session.stage === 'finished' && window.history.state?.chooseNextQuiz === true;
  const quizStage = choosingNextCourse ? 'select' : session.stage;
  const questions = useMemo(() => getCourseQuestions(difficulty, scope, questionSet), [difficulty, scope, questionSet]);
  const question = questions[currentIndex];
  const score = correctBefore + Number(quizStage === 'playing' && isAnswerCorrect(question, answer));

  const onUpdateBestScoreRef = useRef(onUpdateBestScore);
  onUpdateBestScoreRef.current = onUpdateBestScore;
  const lastRecordedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (quizStage === 'finished' && questions.length > 0) {
      const recordKey = `${resetEpoch}:${difficulty}:${scope}:${questionSet}:${score}:${questions.length}`;
      if (lastRecordedKeyRef.current !== recordKey) {
        lastRecordedKeyRef.current = recordKey;
        const summary = calculateQuizResult(score, questions);
        onUpdateBestScoreRef.current?.(summary.percentage);
        if (/^vol[1-6]$/.test(scope)) {
          setVolumeScores(
            saveQuizVolumeScore(difficulty, scope, summary.score, summary.total, summary.percentage, resetEpoch),
          );
        }
      }
    } else if (quizStage !== 'finished') {
      lastRecordedKeyRef.current = null;
    }
  }, [quizStage, resetEpoch, difficulty, scope, questionSet, score, questions]);

  function updateSession(next: QuizSession) {
    sessionRef.current = next;
    // Persist before navigation, so immediately opening a related song cannot
    // discard the answer that was just selected.
    setSessionSaveUnavailable(!saveQuizSession(next, resetEpoch));
    setSession(next);
  }

  function startCourse(course: CourseDifficulty, nextScope: QuestionScopeFilter, set: QuestionSet = 'current') {
    if (window.history.state?.chooseNextQuiz) {
      window.history.replaceState({ ...window.history.state, chooseNextQuiz: false }, '');
    }
    updateSession({ ...INITIAL_SESSION, stage: 'playing', difficulty: course, scope: nextScope, questionSet: set, outcomes: [] });
    if (tabFromPathname(window.location.pathname, import.meta.env.BASE_URL) !== 'quiz') {
      window.location.hash = 'quiz';
    }
  }

  function nextQuestion() {
    const nextOutcomes = [...(session.outcomes ?? [])];
    if (question) {
      nextOutcomes[currentIndex] = isAnswerCorrect(question, answer) ? 'correct' : 'wrong';
    }
    if (currentIndex + 1 < questions.length) {
      updateSession({ ...session, currentIndex: currentIndex + 1, correctBefore: score, answer: EMPTY_ANSWER, outcomes: nextOutcomes });
    } else {
      updateSession({ ...session, stage: 'finished', correctBefore: score, answer: EMPTY_ANSWER, outcomes: nextOutcomes });
    }
  }

  function chooseCourse() {
    const hasAnswerInput = answer.selectedOption !== null || answer.selectedOrder.length > 0;
    if (quizStage === 'playing' && (currentIndex > 0 || hasAnswerInput)) {
      setIsExitConfirmOpen(true);
      return;
    }
    updateSession(INITIAL_SESSION);
  }

  return (
    <section
      id="section-quiz"
      aria-labelledby="quiz-heading"
      className="py-4 sm:py-5"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header */}
        <div className="pb-3 border-b border-[#e5dccb]">
          <h1
            id="quiz-heading"
            className="font-note-serif text-xl sm:text-2xl font-bold tracking-[.04em] text-[#253331]"
          >
            {viewTab === 'archive' ? '参考記事・インタビュー・SNS' : 'Official髭男dism検定'}
          </h1>
          {viewTab === 'quiz' && questionSet && questionSet !== 'current' && quizStage !== 'select' && (
            <p className="mt-1.5 text-xs text-[#57534E]">
              更新前に始めた検定を、当時の問題の続きから再開しています。
            </p>
          )}
        </div>

        {viewTab === 'quiz' && sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] p-3 text-xs text-[#57534E]">
            このブラウザでは途中経過を一時保存できません。画面を移動すると回答が消える場合があります。
          </p>
        )}

        {viewTab === 'quiz' && quizStage === 'select' && (
          <QuizCoursePicker key={choosingNextCourse ? difficulty : 'new'} initialDifficulty={choosingNextCourse ? difficulty : 'beginner'}
            onStart={startCourse} bestQuizScore={bestQuizScore} volumeScores={volumeScores} />
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
              questionOutcomes={session.outcomes}
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
            questions={questions}
            questionOutcomes={session.outcomes}
            onRestart={() => startCourse(difficulty, scope, questionSet)}
            onChooseCourse={chooseCourse}
            onOpenArchive={onOpenArchive}
          />
        )}
        {hasOpenedArchive && (
          <Suspense fallback={viewTab === 'archive' ? <div role="status" className="py-8 text-xs text-[#57534E]">参考資料を読み込み中…</div> : null}>
            <QuizSourceArchive visible={viewTab === 'archive'} songs={songs} onSelectSong={onSelectSong} resetEpoch={resetEpoch} />
          </Suspense>
        )}
      </div>

      <ConfirmDialog
        isOpen={isExitConfirmOpen}
        title="検定を終了してコース選択に戻りますか？"
        description={'今回の回答はここでリセットされます。\nもう一度挑戦すると、第1問から始まります。'}
        confirmLabel="コース選択に戻る"
        cancelLabel="検定を続ける"
        onConfirm={() => {
          setIsExitConfirmOpen(false);
          updateSession(INITIAL_SESSION);
        }}
        onCancel={() => setIsExitConfirmOpen(false)}
      />
    </section>
  );
}
