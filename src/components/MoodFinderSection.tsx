import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { MoodCriteria } from '../utils/fanLogic';
import { MoodQuestionnaire } from './mood/MoodQuestionnaire';
import { MoodResults, type MoodLibraryProps } from './mood/MoodResults';
import type { ShareTheme } from './mood/MoodShareCard';

export function MoodFinderSection(props: MoodLibraryProps) {
  const [criteria, setCriteria] = useState<MoodCriteria | null>(null);
  // Keep the chosen card theme when the listener starts another diagnosis.
  const [theme, setTheme] = useState<ShareTheme>('dark');
  const restart = () => setCriteria(null);

  return (
    <section
      id="section-mood"
      aria-labelledby="mood-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="mood-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              マイソング診断
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              気分・場面・曲調を選ぶと、当サイトの分類から合う曲を探せます。
            </p>
          </div>

          {criteria !== null && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              最初から診断し直す
            </button>
          )}
        </div>

        {criteria ? (
          <MoodResults {...props} criteria={criteria} onRestart={restart} theme={theme} onSelectTheme={setTheme} />
        ) : (
          <MoodQuestionnaire onComplete={setCriteria} />
        )}
      </div>
    </section>
  );
}
