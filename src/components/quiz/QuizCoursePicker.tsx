import { ArrowRight } from 'lucide-react';
import { getCourseQuestions, QUIZ_COURSES, type CourseDifficulty, type QuestionScopeFilter } from './quizCourses';

interface Props {
  scopeFilter: QuestionScopeFilter;
  onScopeChange: (scope: QuestionScopeFilter) => void;
  onStart: (difficulty: CourseDifficulty) => void;
}

export function QuizCoursePicker({scopeFilter, onScopeChange, onStart}: Props) {
  return (
    <div className="mt-6 space-y-5">
      {/* Question Scope Selector */}
      <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              1. 出題範囲を選ぼう
            </h3>
            <p className="text-xs text-[#57534E]">
              出題範囲を選ぶと、下の各コースに今回の問題数が表示されます。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {(
            [
              {
                id: 'full',
                title: 'すべての問題',
                sub: '各コース20問（総合60問）',
              },
              {
                id: 'new_variation',
                title: '追加バリエーション編',
                sub: '作品情報・曲順・演奏時間',
              },
              {
                id: 'ordering_only',
                title: '並び替え問題のみ特訓',
                sub: '1番目〜4番目選択式（全6問）',
              },
              {
                id: 'classic',
                title: '王道・基本編のみ',
                sub: '代表曲・バンド史（各10問）',
              },
            ] as { id: QuestionScopeFilter; title: string; sub: string }[]
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-pressed={scopeFilter === mode.id}
              onClick={() => onScopeChange(mode.id)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                scopeFilter === mode.id
                  ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                  : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white'
              }`}
            >
              <div className="text-xs font-bold">{mode.title}</div>
              <div
                className={`mt-0.5 text-[11px] ${
                  scopeFilter === mode.id ? 'text-[#F5D0C9]' : 'text-[#78716C]'
                }`}
              >
                {mode.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards */}
      <div>
        <h3 className="mb-3 text-sm sm:text-base font-bold text-[#1C1917]">
          2. コースを選んで挑戦
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUIZ_COURSES.map((course) => {
            const countInScope = getCourseQuestions(course.id, scopeFilter).length;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onStart(course.id)}
                className="group flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 text-left hover:border-[#1C1917] transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-editorial font-mono-num text-xl font-bold text-[#C83E2B]">
                        {course.indexCode}.
                      </span>
                      <span className="text-xs font-bold text-[#78716C]">
                        出題数：全{countInScope}問
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
                  {scopeFilter === 'full' && (
                    <p className="mt-1.5 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                      {course.desc}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
