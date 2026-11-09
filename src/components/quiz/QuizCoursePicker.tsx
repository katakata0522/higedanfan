import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { QUIZ_COURSES, type CourseDifficulty, type QuestionScopeFilter } from './quizCourses';

interface Props {
  onStart: (difficulty: CourseDifficulty, scope: QuestionScopeFilter) => void;
}

export function QuizCoursePicker({ onStart }: Props) {
  const [difficulty, setDifficulty] = useState<CourseDifficulty>('beginner');
  const selected = QUIZ_COURSES.find(course => course.id === difficulty)!;
  const volumes = difficulty === 'all' ? 6 : 2;
  return (
    <div className="mt-6 space-y-5">
      <div>
        <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">好きなコースを選ぼう</h3>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="group" aria-label="クイズのコース">
          {QUIZ_COURSES.map(course => (
            <button key={course.id} type="button" aria-pressed={difficulty === course.id}
              onClick={() => setDifficulty(course.id)}
              className={`rounded-xl border p-3 text-left text-sm font-bold transition-colors cursor-pointer ${difficulty === course.id
                ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                : 'border-[#E6E1D6] bg-white text-[#1C1917] hover:border-[#1C1917]'}`}>
              {course.id === 'all' ? '総合' : course.title}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs sm:text-sm text-[#57534E] leading-relaxed">{selected.desc}</p>
      </div>
      <div>
        <h3 className="mb-3 text-sm sm:text-base font-bold text-[#1C1917]">挑戦する Vol. を選ぼう</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: volumes }, (_, index) => (
            <button key={index} type="button" onClick={() => onStart(difficulty, `vol${index + 1}` as QuestionScopeFilter)}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[#E6E1D6] bg-white p-5 text-left hover:border-[#1C1917] transition-colors cursor-pointer">
              <span><span className="font-editorial text-lg font-bold text-[#C83E2B]">Vol.{index + 1}</span>
                <span className="ml-3 text-xs text-[#57534E]">全10問</span></span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1917]">挑戦する <ArrowRight className="h-4 w-4" /></span>
            </button>
          ))}
        </div>
        {difficulty === 'all' && <p className="mt-3 text-xs text-[#57534E]">総合の Vol.1〜6 では、全60問を難易度を交えて出題します。</p>}
      </div>
      <button type="button" onClick={() => onStart(difficulty, 'ordering_only')}
        className="text-xs font-bold text-[#57534E] underline underline-offset-4 hover:text-[#C83E2B] cursor-pointer">
        並び替え問題だけに挑戦する（{difficulty === 'all' ? 6 : 2}問）
      </button>
    </div>
  );
}
