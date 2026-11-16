import {
  browserQuizStore as browserStore,
  clearStaleQuizSession,
  isPlainObject as isObject,
  LEGACY_QUIZ_SESSION_STORAGE_KEY as LEGACY_SESSION_KEY,
  QUIZ_SESSION_STORAGE_KEY as QUIZ_SESSION_KEY,
  readCurrentQuizRecordEpoch as recordEpoch,
  type QuizSessionStore as Store,
} from './quizSessionClear';
import { getCourseQuestions, type CourseDifficulty, type QuestionScopeFilter } from './quizCourses';
import type { QuizAnswer, QuizSession } from './quizSession';

export { clearStaleQuizSession };

function isQuizSession(value: unknown): value is QuizSession {
  if (!isObject(value) || !isObject(value.answer)) return false;
  const difficulties = ['all', 'beginner', 'intermediate', 'brothers'];
  const scopes = ['full', 'new_variation', 'ordering_only', 'classic', 'vol1', 'vol2', 'vol3', 'vol4', 'vol5', 'vol6'];
  if (!['select', 'playing', 'finished'].includes(value.stage as string) ||
      !difficulties.includes(value.difficulty as string) || !scopes.includes(value.scope as string) ||
      (value.questionSet !== undefined && value.questionSet !== 'current' && value.questionSet !== 'published' && value.questionSet !== 'recent' && value.questionSet !== 'prior' && value.questionSet !== 'previous' && value.questionSet !== 'legacy') ||
      !Number.isSafeInteger(value.currentIndex) || !Number.isSafeInteger(value.correctBefore)) return false;

  const questions = getCourseQuestions(value.difficulty as CourseDifficulty, value.scope as QuestionScopeFilter,
    value.questionSet === 'legacy' || value.questionSet === 'previous' || value.questionSet === 'prior' || value.questionSet === 'recent' || value.questionSet === 'published' ? value.questionSet : 'current');
  const index = value.currentIndex as number;
  const correctBefore = value.correctBefore as number;
  if (!questions.length || index < 0 || index >= questions.length || correctBefore < 0 ||
      correctBefore > (value.stage === 'finished' ? questions.length : index)) return false;

  const answer = value.answer as unknown as QuizAnswer;
  if (!Array.isArray(answer.selectedOrder) || typeof answer.isOrderingSubmitted !== 'boolean' ||
      new Set(answer.selectedOrder).size !== answer.selectedOrder.length) return false;
  const question = questions[index];
  if (answer.selectedOrder.some(option => !Number.isSafeInteger(option) || option < 0 || option >= question.options.length)) return false;
  if (value.stage === 'select' || value.stage === 'finished') {
    if ((value.stage === 'select' && (index !== 0 || correctBefore !== 0)) ||
        (value.stage === 'finished' && index !== questions.length - 1) ||
        answer.selectedOption !== null || answer.selectedOrder.length || answer.isOrderingSubmitted) return false;
  } else if (question.questionType === 'ordering') {
    if (answer.selectedOption !== null ||
        (answer.isOrderingSubmitted && answer.selectedOrder.length !== question.options.length)) return false;
  } else if (answer.selectedOrder.length || answer.isOrderingSubmitted ||
      (answer.selectedOption !== null && (!Number.isSafeInteger(answer.selectedOption) ||
        answer.selectedOption < 0 || answer.selectedOption >= question.options.length))) return false;
  return true;
}

// A changed question, answer or course order must not restore an old answer as
// if it applied to the new content.
function courseSignature(session: QuizSession): string {
  return JSON.stringify(getCourseQuestions(session.difficulty, session.scope, session.questionSet).map(question => [
    question.id, question.prompt, question.questionType ?? 'single_choice', question.options,
    question.correctIndex, question.correctOrder ?? null,
  ]));
}

export function readQuizSession(
  sessionStore: Store | null = browserStore('sessionStorage'),
  recordStore: Store | null = browserStore('localStorage'),
): QuizSession | null {
  const epoch = recordEpoch(recordStore);
  if (!sessionStore || epoch === null) return null;
  try {
    const currentRaw = sessionStore.getItem(QUIZ_SESSION_KEY);
    const raw = currentRaw ?? sessionStore.getItem(LEGACY_SESSION_KEY);
    if (!raw || raw.length > 100_000) return null;
    const saved: unknown = JSON.parse(raw);
    if (!isObject(saved) || saved.version !== (currentRaw === null ? 1 : 2) || saved.resetEpoch !== epoch || !isObject(saved.session)) return null;
    let session: unknown = currentRaw === null ? { ...saved.session, questionSet: 'legacy' } : saved.session;
    if ((!isQuizSession(session) || saved.courseSignature !== courseSignature(session)) && currentRaw !== null &&
        (saved.session.questionSet === undefined || saved.session.questionSet === 'current')) {
      // 公開前に始めたセッションは、その時点の問題と出題順に戻す。
      for (const questionSet of ['published', 'recent', 'prior', 'previous'] as const) {
        const candidate = { ...saved.session, questionSet };
        if (isQuizSession(candidate) && saved.courseSignature === courseSignature(candidate)) {
          session = candidate;
          break;
        }
      }
    }
    if (!isQuizSession(session) || saved.courseSignature !== courseSignature(session)) return null;
    // A saved selection is not an in-progress attempt and can use the new picker.
    return currentRaw === null && session.stage === 'select' ? null : session;
  } catch { return null; }
}

export function saveQuizSession(
  session: QuizSession,
  expectedEpoch: string,
  sessionStore: Store | null = browserStore('sessionStorage'),
  recordStore: Store | null = browserStore('localStorage'),
): boolean {
  // During startup the records store may not have hydrated yet; after a reset,
  // an older component may also briefly still be mounted. Neither may overwrite
  // the current generation's session.
  if (!sessionStore || recordEpoch(recordStore) !== expectedEpoch || !isQuizSession(session)) return false;
  try {
    sessionStore.setItem(QUIZ_SESSION_KEY, JSON.stringify({
      version: 2, resetEpoch: expectedEpoch, courseSignature: courseSignature(session), session,
    }));
    return true;
  } catch { return false; }
}
