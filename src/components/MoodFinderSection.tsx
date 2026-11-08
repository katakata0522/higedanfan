import { useLayoutEffect, useState, type RefObject } from 'react';
import { RotateCcw } from 'lucide-react';
import { MoodQuestionnaire } from './mood/MoodQuestionnaire';
import { MoodResults, type MoodLibraryProps } from './mood/MoodResults';
import type { ShareTheme } from './mood/MoodShareCard';
import {
  cancelMoodEdit, editMoodAnswer, isCompleteMoodCriteria, newMoodSession,
  previousMoodStep, restoreMoodSession, saveMoodSession, selectMoodAnswer,
  type MoodSession,
} from './mood/moodSession';

interface MoodFinderSectionProps extends MoodLibraryProps {
  resetEpoch: string;
  sessionRef: RefObject<MoodSession | null>;
}

export function MoodFinderSection({ resetEpoch, sessionRef, ...props }: MoodFinderSectionProps) {
  const [session, setSession] = useState<MoodSession>(() => sessionRef.current ?? restoreMoodSession());
  const [sessionSaveUnavailable, setSessionSaveUnavailable] = useState(false);
  useLayoutEffect(() => { sessionRef.current = session; }, [sessionRef, session]);
  // Keep the chosen card theme when the listener starts another diagnosis.
  const [theme, setTheme] = useState<ShareTheme>('dark');
  const updateSession = (next: MoodSession) => {
    sessionRef.current = next;
    setSessionSaveUnavailable(!saveMoodSession(next, resetEpoch));
    setSession(next);
  };
  const restart = () => {
    const next = newMoodSession();
    updateSession(next);
  };
  const criteria = session.completed && isCompleteMoodCriteria(session.answers) ? session.answers : null;

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
              ５つの質問から、今のあなたに聴いてほしい曲を探します。
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

        {sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs leading-relaxed text-[#57534E]">
            診断結果をブラウザに保存できませんでした。ページを移動したり再読み込みしたりすると、回答が消える場合があります。
          </p>
        )}

        {criteria ? (
          <MoodResults {...props} criteria={criteria} onEditAnswer={step => updateSession(editMoodAnswer(session, step))} theme={theme} onSelectTheme={setTheme} />
        ) : (
          <MoodQuestionnaire
            session={session}
            onChoose={answer => updateSession(selectMoodAnswer(session, answer))}
            onBack={() => updateSession(previousMoodStep(session))}
            onCancelEdit={() => updateSession(cancelMoodEdit(session))}
          />
        )}
      </div>
    </section>
  );
}
