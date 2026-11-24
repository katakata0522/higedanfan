import { useState } from 'react';
import { ArrowRight, Award } from 'lucide-react';
import { QUIZ_COURSES, type CourseDifficulty, type QuestionScopeFilter } from './quizCourseMeta';
import { quizVolumeKey, type QuizVolumeRecordMap } from './quizVolumeRecords';

interface Props {
  onStart: (difficulty: CourseDifficulty, scope: QuestionScopeFilter) => void;
  initialDifficulty?: CourseDifficulty;
  bestQuizScore?: number | null;
  volumeScores?: QuizVolumeRecordMap;
}

export function QuizCoursePicker({ onStart, initialDifficulty = 'beginner', bestQuizScore = null, volumeScores }: Props) {
  const [difficulty, setDifficulty] = useState<CourseDifficulty>(initialDifficulty);
  const selectedCourse = QUIZ_COURSES.find(course => course.id === difficulty) ?? QUIZ_COURSES[1];
  const volumes = difficulty === 'all' ? 6 : 2;

  return (
    <div className="mt-6 space-y-6">
      {typeof bestQuizScore === 'number' && (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3.5 py-1.5 text-xs font-bold text-[#253331] shadow-xs">
          <Award aria-hidden="true" className="h-4 w-4 text-[#C83E2B]" />
          <span>これまでの最高正答率：<span className="font-mono-num text-[#C83E2B]">{bestQuizScore}%</span></span>
        </div>
      )}

      <div>
        <h2 className="text-sm sm:text-base font-bold text-[#253331]">コースを選ぶ</h2>
        <div className="mt-3 grid grid-cols-1 min-[360px]:grid-cols-2 gap-2.5 sm:gap-3" role="group" aria-label="クイズのコース">
          {QUIZ_COURSES.map(course => {
            const active = difficulty === course.id;
            return (
              <button
                key={course.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDifficulty(course.id)}
                className={`group flex flex-col justify-start rounded-2xl border p-3 sm:p-4 text-left transition-colors cursor-pointer ${
                  active
                    ? 'border-[#253331] bg-[#253331] text-[#faf6eb] shadow-sm'
                    : 'border-[#dfd7c7] bg-[#fffdf8] text-[#253331] hover:border-[#253331] hover:bg-[#f9f5eb]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 w-full">
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono-num font-bold tracking-wider whitespace-nowrap ${
                      active ? 'text-[#f3d2a8]' : 'text-[#A93020]'
                    }`}
                  >
                    COURSE {course.indexCode}
                  </span>
                  {active && (
                    <span className="whitespace-nowrap rounded-full bg-[#C83E2B] px-2 py-0.5 text-[10px] font-bold text-white">
                      選択中
                    </span>
                  )}
                </div>
                <p className="mt-1 font-note-serif text-[13px] min-[400px]:text-sm sm:text-base font-bold tracking-[.01em] sm:tracking-[.02em] [word-break:auto-phrase]">
                  {course.title}
                </p>
                <p
                  className={`mt-1 text-[11px] sm:text-xs leading-relaxed ${
                    active ? 'text-[#e5dccb]' : 'text-[#57534E]'
                  }`}
                >
                  {course.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#dfd7c7] bg-[#fffdf8] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-[#ece4d6]">
          <h2 className="font-note-serif text-base sm:text-lg font-bold text-[#253331]">
            {selectedCourse.title}のセットを選ぶ
          </h2>
          <p className="text-xs text-[#57534E]">
            {difficulty === 'all' ? '混ぜながら遊べる全6セット' : 'テーマ違いの2セットから挑戦'}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
          {Array.from({ length: volumes }, (_, index) => {
            const volNumber = index + 1;
            const scope = `vol${volNumber}` as QuestionScopeFilter;
            const record = volumeScores?.[quizVolumeKey(difficulty, scope)];
            return (
              <button
                key={scope}
                type="button"
                onClick={() => onStart(difficulty, scope)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-[#dfd7c7] bg-[#faf6eb]/70 px-4 py-4 text-left hover:border-[#C83E2B] hover:bg-[#fffdf8] transition-colors cursor-pointer"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <span className="font-editorial text-lg font-semibold text-[#C83E2B]">
                      Vol.{volNumber}
                    </span>
                    <span className="text-xs font-medium text-[#57534E]">
                      全10問
                    </span>
                  </span>
                  {record && (
                    <span
                      className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold font-mono-num ${
                        record.score === record.total
                          ? 'border-[#2e6f40]/30 bg-[#eef9f0] text-[#2e6f40]'
                          : 'border-[#dfd7c7] bg-[#f4efe4] text-[#253331]'
                      }`}
                    >
                      {record.score === record.total
                        ? `全問正解 ${record.score}/${record.total}`
                        : `最高 ${record.score}/${record.total}問 (${record.percentage}%)`}
                    </span>
                  )}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#253331] group-hover:border-[#C83E2B] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors shrink-0">
                  挑戦する <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
