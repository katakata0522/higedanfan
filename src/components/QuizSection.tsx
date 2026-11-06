import { useMemo, useState } from 'react';
import { ArrowLeft, HelpCircle, Newspaper } from 'lucide-react';
import type { SongItem } from '../data/higedanData';
import { calculateQuizResult } from '../utils/fanLogic';
import { QuizCoursePicker } from './quiz/QuizCoursePicker';
import { QuizQuestionCard } from './quiz/QuizQuestionCard';
import { QuizResultCard } from './quiz/QuizResultCard';
import { QuizSourceArchive } from './quiz/QuizSourceArchive';
import { getCourseLabel, getCourseQuestions, type CourseDifficulty, type QuestionScopeFilter } from './quiz/quizCourses';

interface QuizSectionProps {
  bestScorePercentage: number;
  onUpdateBestScore: (percentage: number) => void;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  initialTab?: 'quiz' | 'archive';
}

export function QuizSection({
  bestScorePercentage, onUpdateBestScore, songs = [], onSelectSong, initialTab: viewTab = 'quiz',
}: QuizSectionProps) {
  const [quizStage, setQuizStage] = useState<'select' | 'playing' | 'finished'>('select');
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('all');
  const [scope, setScope] = useState<QuestionScopeFilter>('full');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const questions = useMemo(() => getCourseQuestions(difficulty, scope), [difficulty, scope]);
  const question = questions[currentIndex];

  function startCourse(course: CourseDifficulty) {
    setDifficulty(course);
    setCurrentIndex(0);
    setScore(0);
    setQuizStage('playing');
    window.location.hash = 'quiz';
  }

  function nextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(index => index + 1);
    } else {
      setQuizStage('finished');
      onUpdateBestScore(calculateQuizResult(score, questions).percentage);
    }
  }

  function chooseCourse() {
    setQuizStage('select');
    setCurrentIndex(0);
    setScore(0);
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
              並び替え＆データ検証で深掘りする「ヒゲダン検定クイズ（全60問）」
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              初級・中級・上級は各20問。答え合わせで作品情報・インタビュー・使用した音源を確認できます。
            </p>
          </div>

          {viewTab === 'quiz' && quizStage !== 'select' && (
            <button
              type="button"
              onClick={chooseCourse}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              コース選択へ戻る
            </button>
          )}
        </div>

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
              クイズに挑戦する（各20問・全60問）
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
            全コース共通の最高正答率： <strong className="text-[#1C1917]">{bestScorePercentage}%</strong>
          </span>
        </div>

        {viewTab === 'quiz' && quizStage === 'select' && (
          <QuizCoursePicker scopeFilter={scope} onScopeChange={setScope} onStart={startCourse} />
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
            relatedSong={songs.find(song => song.id === question.relatedSongId)}
            onSelectSong={onSelectSong}
            onCorrect={() => setScore(count => count + 1)}
            onNext={nextQuestion}
          />
        )}
        {quizStage === 'finished' && (
          <QuizResultCard
            visible={viewTab === 'quiz'}
            activeCourseLabel={getCourseLabel(difficulty, scope)}
            quizSummary={calculateQuizResult(score, questions)}
            onRestart={() => startCourse(difficulty)}
            onChooseCourse={chooseCourse}
          />
        )}
        <QuizSourceArchive visible={viewTab === 'archive'} songs={songs} onSelectSong={onSelectSong} />
      </div>
    </section>
  );
}
