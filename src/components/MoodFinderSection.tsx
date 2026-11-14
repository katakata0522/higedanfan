import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  onBackHome?: () => void;
}

export function MoodFinderSection({ resetEpoch, sessionRef, onBackHome, ...props }: MoodFinderSectionProps) {
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
      className={criteria ? 'py-4 sm:py-6' : 'py-6 sm:py-8'}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className={criteria ? 'mb-3' : 'pb-5 border-b border-[#e5dccb] space-y-3'}>
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
              style={{ '--tape-bg': 'rgba(188, 227, 248, 0.78)' } as CSSProperties}
            >
              選曲メモ
            </span>
          </div>
          <div>
            <h2
              id="mood-heading"
              className={criteria ? 'sr-only' : 'text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]'}
            >
              マイソング診断
            </h2>
            {!criteria && (
              <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
                今の気分と一緒に、ヒゲダンの一曲を探そう。
              </p>
            )}
          </div>
        </div>

        {sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs leading-relaxed text-[#57534E]">
            診断結果をブラウザに保存できませんでした。ページを移動したり再読み込みしたりすると、回答が消える場合があります。
          </p>
        )}

        {criteria ? (
          <MoodResults {...props} criteria={criteria} onEditAnswer={step => updateSession(editMoodAnswer(session, step))} onRestart={restart} theme={theme} onSelectTheme={setTheme} />
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
