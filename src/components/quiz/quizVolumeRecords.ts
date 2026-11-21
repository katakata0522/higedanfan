import { safeJsonParseBounded } from '../../utils/browserStorage';
import {
  browserQuizStore,
  isPlainObject,
  readCurrentQuizRecordEpoch,
  type QuizSessionStore,
} from './quizSessionClear';
import type { CourseDifficulty, QuestionScopeFilter } from './quizCourses';

export const QUIZ_VOLUME_SCORES_STORAGE_KEY = 'higedan_quiz_volume_scores_v1';
const MAX_VOLUME_BYTES = 20_000;

export interface QuizVolumeRecord {
  score: number;
  total: number;
  percentage: number;
}

export type QuizVolumeRecordMap = Record<string, QuizVolumeRecord>;

const VOLUME_KEY_PATTERN = /^(all|beginner|intermediate|brothers):vol[1-6]$/;

export function quizVolumeKey(
  difficulty: CourseDifficulty,
  scope: QuestionScopeFilter,
): string {
  return `${difficulty}:${scope}`;
}

function createEmptyRecordMap(): QuizVolumeRecordMap {
  return Object.create(null) as QuizVolumeRecordMap;
}

export function sanitizeQuizVolumeRecordMap(rawMap: unknown): QuizVolumeRecordMap {
  const out = createEmptyRecordMap();
  if (!isPlainObject(rawMap)) return out;
  for (const [key, value] of Object.entries(rawMap)) {
    if (!VOLUME_KEY_PATTERN.test(key) || !isPlainObject(value)) continue;
    const { score, total, percentage } = value;
    if (
      !Number.isSafeInteger(total) ||
      (total as number) < 1 ||
      (total as number) > 60 ||
      !Number.isSafeInteger(score) ||
      (score as number) < 0 ||
      (score as number) > (total as number) ||
      !Number.isSafeInteger(percentage) ||
      (percentage as number) < 0 ||
      (percentage as number) > 100
    ) {
      continue;
    }
    out[key] = {
      score: score as number,
      total: total as number,
      percentage: percentage as number,
    };
  }
  return out;
}

export function persistQuizVolumeScores(
  records: QuizVolumeRecordMap,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store) return false;
  const clean = sanitizeQuizVolumeRecordMap(records);
  try {
    store.setItem(
      QUIZ_VOLUME_SCORES_STORAGE_KEY,
      JSON.stringify({ resetEpoch: expectedEpoch, records: clean }),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadQuizVolumeScores(
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): QuizVolumeRecordMap {
  if (!store) return createEmptyRecordMap();
  try {
    const raw = store.getItem(QUIZ_VOLUME_SCORES_STORAGE_KEY);
    const parsed = safeJsonParseBounded(raw, MAX_VOLUME_BYTES);
    if (!isPlainObject(parsed) || typeof parsed.resetEpoch !== 'string') {
      return createEmptyRecordMap();
    }
    const currentEpoch = readCurrentQuizRecordEpoch(store);
    if (expectedEpoch && parsed.resetEpoch !== expectedEpoch) {
      return createEmptyRecordMap();
    }
    if (currentEpoch && parsed.resetEpoch !== currentEpoch) {
      return createEmptyRecordMap();
    }
    return sanitizeQuizVolumeRecordMap(parsed.records);
  } catch {
    return createEmptyRecordMap();
  }
}

export function saveQuizVolumeScore(
  difficulty: CourseDifficulty,
  scope: QuestionScopeFilter,
  score: number,
  total: number,
  percentage: number,
  expectedEpoch = '',
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): QuizVolumeRecordMap {
  const existing = loadQuizVolumeScores(expectedEpoch, store);
  const next = Object.assign(createEmptyRecordMap(), existing);
  const key = quizVolumeKey(difficulty, scope);
  if (!VOLUME_KEY_PATTERN.test(key)) {
    return next;
  }

  const safeTotal = Math.max(1, Math.min(60, Math.round(total)));
  const safeScore = Math.max(0, Math.min(safeTotal, Math.round(score)));
  const safePercentage = Math.max(0, Math.min(100, Math.round(percentage)));
  const prev = next[key];
  const isBetter =
    !prev ||
    safePercentage > prev.percentage ||
    (safePercentage === prev.percentage && safeScore > prev.score);

  if (isBetter) {
    next[key] = {
      score: safeScore,
      total: safeTotal,
      percentage: safePercentage,
    };
  }

  if (store) {
    try {
      store.setItem(
        QUIZ_VOLUME_SCORES_STORAGE_KEY,
        JSON.stringify({ resetEpoch: expectedEpoch, records: next }),
      );
    } catch {
      // 書き込み失敗時も画面内の記録維持を優先する。
    }
  }
  return next;
}

export function clearQuizVolumeScoresStorage(
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
): void {
  if (!store) return;
  try {
    store.removeItem(QUIZ_VOLUME_SCORES_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function clearStaleQuizVolumeScores(
  expectedEpoch: string,
  store: QuizSessionStore | null = browserQuizStore('localStorage'),
  recordStore: QuizSessionStore | null = browserQuizStore('localStorage'),
): boolean {
  if (!store || !expectedEpoch || readCurrentQuizRecordEpoch(recordStore) !== expectedEpoch) {
    return false;
  }
  try {
    const raw = store.getItem(QUIZ_VOLUME_SCORES_STORAGE_KEY);
    if (!raw) return false;
    const parsed = safeJsonParseBounded(raw, MAX_VOLUME_BYTES);
    if (isPlainObject(parsed) && parsed.resetEpoch === expectedEpoch) {
      return false;
    }
    store.removeItem(QUIZ_VOLUME_SCORES_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
