import assert from 'node:assert/strict';
import test from 'node:test';
import { STORAGE_KEY } from '../../hooks/fanRecordStorage';
import { getCourseQuestions } from './quizCourses';
import { EMPTY_ANSWER, INITIAL_SESSION, isAnswerCorrect, type QuizSession } from './quizSession';
import { clearStaleQuizSession, readQuizSession, saveQuizSession } from './quizSessionStorage';

const QUIZ_KEY = 'higedanfan:quiz-session:v1';

function memoryStore(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial));
  return {
    getItem(key: string) { return entries.get(key) ?? null; },
    setItem(key: string, value: string) { entries.set(key, value); },
    removeItem(key: string) { entries.delete(key); },
  };
}

function records(epoch: string) {
  return memoryStore({ [STORAGE_KEY]: JSON.stringify({ resetEpoch: epoch }) });
}

test('restores a checked answer and previous score without counting the answer twice', () => {
  const recordStore = records('generation-a');
  const sessionStore = memoryStore();
  const answer: QuizSession = {
    ...INITIAL_SESSION, stage: 'playing', difficulty: 'beginner', currentIndex: 1, correctBefore: 1,
    answer: { selectedOption: 1, selectedOrder: [], isOrderingSubmitted: false },
  };
  const recordBefore = recordStore.getItem(STORAGE_KEY);
  assert.equal(saveQuizSession(answer, 'generation-a', sessionStore, recordStore), true);
  const restored = readQuizSession(sessionStore, recordStore);
  assert.deepEqual(restored, answer);
  assert.equal(restored!.correctBefore + Number(isAnswerCorrect(getCourseQuestions('beginner', 'full')[1], restored!.answer)), 2);
  assert.equal(recordStore.getItem(STORAGE_KEY), recordBefore);
});

test('preserves partially selected and submitted ordering answers, and finished results', () => {
  const recordStore = records('');
  const sessionStore = memoryStore();
  const partial: QuizSession = {
    ...INITIAL_SESSION, stage: 'playing', scope: 'ordering_only',
    answer: { selectedOption: null, selectedOrder: [2, 0], isOrderingSubmitted: false },
  };
  assert.equal(saveQuizSession(partial, '', sessionStore, recordStore), true);
  assert.deepEqual(readQuizSession(sessionStore, recordStore), partial);

  const question = getCourseQuestions('all', 'ordering_only')[0];
  const submitted: QuizSession = {
    ...partial, answer: { selectedOption: null, selectedOrder: question.correctOrder!, isOrderingSubmitted: true },
  };
  assert.equal(saveQuizSession(submitted, '', sessionStore, recordStore), true);
  assert.equal(isAnswerCorrect(question, readQuizSession(sessionStore, recordStore)!.answer), true);

  const finished: QuizSession = {
    ...partial, stage: 'finished', currentIndex: 5, correctBefore: 6, answer: EMPTY_ANSWER,
  };
  assert.equal(saveQuizSession(finished, '', sessionStore, recordStore), true);
  assert.deepEqual(readQuizSession(sessionStore, recordStore), finished);
});

test('keeps separate tabs independent and rejects a session from before a reset', () => {
  const recordStore = records('generation-a');
  const tabA = memoryStore();
  const tabB = memoryStore();
  const progress: QuizSession = { ...INITIAL_SESSION, stage: 'playing' };
  assert.equal(saveQuizSession(progress, 'generation-a', tabA, recordStore), true);
  assert.equal(readQuizSession(tabB, recordStore), null);
  const previousRaw = tabA.getItem(QUIZ_KEY);
  recordStore.setItem(STORAGE_KEY, JSON.stringify({ resetEpoch: 'generation-b' }));
  assert.equal(readQuizSession(tabA, recordStore), null);
  assert.equal(saveQuizSession(progress, 'generation-a', tabA, recordStore), false);
  assert.equal(tabA.getItem(QUIZ_KEY), previousRaw);
});

test('startup before record hydration cannot overwrite a session from the current generation', () => {
  const recordStore = records('generation-b');
  const sessionStore = memoryStore();
  const progress: QuizSession = { ...INITIAL_SESSION, stage: 'playing' };
  assert.equal(saveQuizSession(progress, 'generation-b', sessionStore, recordStore), true);
  const previousRaw = sessionStore.getItem(QUIZ_KEY);
  assert.equal(saveQuizSession(INITIAL_SESSION, '', sessionStore, recordStore), false);
  assert.equal(sessionStore.getItem(QUIZ_KEY), previousRaw);
  assert.deepEqual(readQuizSession(sessionStore, recordStore), progress);
});

test('after an explicit reset only the preceding generation is removed', () => {
  const recordStore = records('generation-a');
  const sessionStore = memoryStore();
  const progress: QuizSession = { ...INITIAL_SESSION, stage: 'playing' };
  assert.equal(saveQuizSession(progress, 'generation-a', sessionStore, recordStore), true);
  assert.equal(clearStaleQuizSession('', sessionStore, recordStore), false);
  assert.deepEqual(readQuizSession(sessionStore, recordStore), progress);
  recordStore.setItem(STORAGE_KEY, JSON.stringify({ resetEpoch: 'generation-b' }));
  assert.equal(clearStaleQuizSession('generation-a', sessionStore, recordStore), false);
  assert.equal(clearStaleQuizSession('generation-b', sessionStore, recordStore), true);
  assert.equal(sessionStore.getItem(QUIZ_KEY), null);
  assert.equal(saveQuizSession(progress, 'generation-b', sessionStore, recordStore), true);
  assert.equal(clearStaleQuizSession('generation-b', sessionStore, recordStore), false);
  assert.deepEqual(readQuizSession(sessionStore, recordStore), progress);
});

test('ignores malformed, incompatible and impossible sessions without overwriting them', () => {
  const recordStore = records('generation-a');
  const sessionStore = memoryStore();
  const progress: QuizSession = {
    ...INITIAL_SESSION, stage: 'playing', scope: 'ordering_only',
    answer: { selectedOption: null, selectedOrder: [2, 0], isOrderingSubmitted: false },
  };
  assert.equal(saveQuizSession(progress, 'generation-a', sessionStore, recordStore), true);
  const original = JSON.parse(sessionStore.getItem(QUIZ_KEY)!);
  const invalid = [
    'not json',
    JSON.stringify({ ...original, version: 2 }),
    JSON.stringify({ ...original, courseSignature: 'old questions' }),
    JSON.stringify({ ...original, session: { ...original.session, currentIndex: 100 } }),
    JSON.stringify({ ...original, session: { ...original.session, answer: { ...original.session.answer, selectedOrder: [2, 2] } } }),
    JSON.stringify({ ...original, session: { ...original.session, answer: { ...original.session.answer, isOrderingSubmitted: true } } }),
  ];
  for (const raw of invalid) {
    sessionStore.setItem(QUIZ_KEY, raw);
    assert.equal(readQuizSession(sessionStore, recordStore), null);
    assert.equal(sessionStore.getItem(QUIZ_KEY), raw);
  }
  const unreadableRecords = memoryStore({ [STORAGE_KEY]: '{' });
  assert.equal(readQuizSession(sessionStore, unreadableRecords), null);
  assert.equal(saveQuizSession(progress, 'generation-a', sessionStore, unreadableRecords), false);
});

test('storage access or quota errors leave the in-memory quiz usable', () => {
  const recordStore = records('');
  const denied = {
    getItem() { throw new Error('storage denied'); },
    setItem() { throw new Error('quota exceeded'); },
    removeItem() { throw new Error('storage denied'); },
  };
  const progress: QuizSession = { ...INITIAL_SESSION, stage: 'playing' };
  assert.equal(readQuizSession(denied, recordStore), null);
  assert.equal(saveQuizSession(progress, '', denied, recordStore), false);
  assert.equal(progress.stage, 'playing');
  assert.equal(readQuizSession(memoryStore(), denied), null);
});
