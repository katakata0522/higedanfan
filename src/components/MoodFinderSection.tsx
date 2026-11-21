import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { readStoredResetEpoch } from '../hooks/fanRecordStorage';
import { MoodQuestionnaire } from './mood/MoodQuestionnaire';
import { MoodResults, type MoodLibraryProps } from './mood/MoodResults';
import {
  cancelMoodEdit, editMoodAnswer, isCompleteMoodCriteria, newMoodSession,
  previousMoodStep, restoreMoodSession, saveMoodSession, selectMoodAnswer,
  type MoodSession,
} from './mood/moodSession';
import { recordMyNoteMoodCompleted } from '../utils/myNoteProfile';

interface MoodFinderSectionProps extends MoodLibraryProps {
  resetEpoch: string;
  sessionRef: RefObject<MoodSession | null>;
}

export function MoodFinderSection({ resetEpoch, sessionRef, ...props }: MoodFinderSectionProps) {
  const [visit] = useState(() => {
    const entry = window.history.state;
    const saved = typeof entry?.moodSnapshot === 'string'
      ? restoreMoodSession(undefined, undefined, entry.moodSnapshot)
      : sessionRef.current ?? restoreMoodSession();
    if (entry?.newMoodVisit && (saved.completed || saved.editing)) {
      return { initial: newMoodSession(), previous: saved.editing ? cancelMoodEdit(saved) : saved };
    }
    const previous = typeof entry?.previousMoodSnapshot === 'string'
      ? restoreMoodSession(undefined, undefined, entry.previousMoodSnapshot) : null;
    return { initial: saved, previous: previous?.completed ? previous : null };
  });
  const [session, setSession] = useState<MoodSession>(visit.initial);
  const [sessionSaveUnavailable, setSessionSaveUnavailable] = useState(false);
  const shouldFocusResultsRef = useRef(false);
  useLayoutEffect(() => {
    sessionRef.current = session;
    const entry = window.history.state;
    const storedEpoch = readStoredResetEpoch();
    if (storedEpoch !== null && storedEpoch !== resetEpoch) return;
    // 履歴から開いた結果も、楽曲ページの「診断に戻る」で復元できるようにする。
    if (session === visit.initial) saveMoodSession(session, resetEpoch);
    try {
      window.history.replaceState({
        ...entry, newMoodVisit: false, moodSnapshot: JSON.stringify({ ...session, resetEpoch }),
        previousMoodSnapshot: visit.previous && JSON.stringify({ ...visit.previous, resetEpoch }),
      }, '');
    } catch {
      // 履歴を書けない環境でも、タブ内の保存から復帰できる。
    }
  }, [resetEpoch, sessionRef, session, visit]);
  const updateSession = (next: MoodSession) => {
    sessionRef.current = next;
    setSessionSaveUnavailable(!saveMoodSession(next, resetEpoch));
    setSession(next);
  };
  const criteria = session.completed && isCompleteMoodCriteria(session.answers) ? session.answers : null;

  return (
    <section
      id="section-mood"
      aria-labelledby="mood-heading"
      className="py-4 sm:py-5"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="pb-3 border-b border-[#e5dccb]">
          <h1
            id="mood-heading"
            className="font-note-serif text-xl sm:text-2xl font-bold tracking-[.04em] text-[#253331]"
          >
            今日の1曲診断
          </h1>
        </div>

        {sessionSaveUnavailable && (
          <p role="status" className="mt-4 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-2 text-xs leading-relaxed text-[#57534E]">
            診断結果をブラウザに保存できませんでした。ページを移動したり再読み込みしたりすると、回答が消える場合があります。
          </p>
        )}

        {criteria ? (
          <MoodResults
            {...props}
            criteria={criteria}
            page={session.page ?? 0}
            focusOnMount={shouldFocusResultsRef.current}
            onMountFocused={() => {
              shouldFocusResultsRef.current = false;
            }}
            onPageChange={page => updateSession({ ...session, page })}
            onEditAnswer={step => updateSession(editMoodAnswer(session, step))}
            onRestart={() => {
              shouldFocusResultsRef.current = false;
              updateSession(newMoodSession());
            }}
          />
        ) : (
          <MoodQuestionnaire
            session={session}
            onChoose={answer => {
              const next = selectMoodAnswer(session, answer);
              if (next.completed) {
                shouldFocusResultsRef.current = true;
              }
              if (!session.editing && !session.completed && next.completed && isCompleteMoodCriteria(next.answers)) {
                recordMyNoteMoodCompleted(next.answers.mood, resetEpoch);
              }
              updateSession(next);
            }}
            onBack={() => updateSession(previousMoodStep(session))}
            onCancelEdit={() => {
              shouldFocusResultsRef.current = true;
              updateSession(cancelMoodEdit(session));
            }}
          />
        )}
        {!session.completed && !session.editing && session.step === 1 && visit.previous && (
          <button type="button" onClick={() => updateSession(visit.previous!)}
            className="mt-2 min-h-11 px-1 text-sm text-[#57534E] underline underline-offset-4 hover:text-[#253331]">
            前回の1曲を見る
          </button>
        )}
      </div>
    </section>
  );
}
