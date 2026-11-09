import type { MoodCriteria } from '../../utils/fanLogic';
import { STORAGE_KEY, restoreFanRecords } from '../../hooks/fanRecordStorage';

export const MOOD_SESSION_KEY = 'higedanfan:mood-session:v1';
export type MoodStep = 1 | 2 | 3 | 4 | 5;
export type MoodAnswers = Partial<MoodCriteria>;
export type CompleteMoodCriteria = MoodCriteria & Required<Pick<MoodCriteria, 'era' | 'length'>>;

export interface MoodSession {
  version: 1;
  step: MoodStep;
  answers: MoodAnswers;
  completed: boolean;
  editing: boolean;
}

export interface MoodStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const allowedAnswers = {
  mood: ['push_back', 'heartbreak_night', 'euphoric_drive', 'deep_lyric'],
  situation: ['morning_commute', 'late_night_alone', 'live_warmup', 'weekend_walk'],
  sound: ['piano_pop', 'brass_funk', 'emotional_ballad', 'stadium_rock', 'rhythm', 'gentle', 'melody', 'powerful'],
  era: ['any', 'indies_escaparade', 'traveler', 'editorial', 'rejoice', 'latest_2025_2026'],
  length: ['any', 'under4', 'fourToFive', 'fivePlus'],
} as const;

const fields = ['mood', 'situation', 'sound', 'era', 'length'] as const;
export type MoodAnswer = Exclude<MoodAnswers[keyof MoodAnswers], undefined>;

export function newMoodSession(): MoodSession {
  return { version: 1, step: 1, answers: {}, completed: false, editing: false };
}

export function isCompleteMoodCriteria(answers: MoodAnswers): answers is CompleteMoodCriteria {
  return fields.every(field => typeof answers[field] === 'string');
}

function validAnswer(field: typeof fields[number], answer: unknown): answer is MoodAnswer {
  return typeof answer === 'string' && (allowedAnswers[field] as readonly string[]).includes(answer);
}

function browserStorage(kind: 'sessionStorage' | 'localStorage'): MoodStorage | null {
  try {
    return typeof window === 'undefined' ? null : window[kind];
  } catch {
    return null;
  }
}

function recordEpoch(storage: MoodStorage | null): string | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? '' : restoreFanRecords(raw).resetEpoch;
  } catch {
    return null;
  }
}

/** Only known answer IDs are restored; malformed or stale browser state is discarded. */
export function restoreMoodSession(
  storage: MoodStorage | null = browserStorage('sessionStorage'),
  records: MoodStorage | null = browserStorage('localStorage'),
): MoodSession {
  try {
    const epoch = recordEpoch(records);
    if (epoch === null) return newMoodSession();
    const saved = storage?.getItem(MOOD_SESSION_KEY);
    if (!saved || saved.length > 10_000) return newMoodSession();
    const value: unknown = JSON.parse(saved);
    if (!value || typeof value !== 'object') return newMoodSession();
    const data = value as Record<string, unknown>;
    if (data.version !== 1 || data.resetEpoch !== epoch || !Number.isInteger(data.step) || Number(data.step) < 1 || Number(data.step) > 5 ||
      typeof data.completed !== 'boolean' || typeof data.editing !== 'boolean' ||
      !data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) return newMoodSession();

    const source = data.answers as Record<string, unknown>;
    const answers: MoodAnswers = {};
    for (const field of fields) {
      if (source[field] !== undefined) {
        if (!validAnswer(field, source[field])) return newMoodSession();
        Object.assign(answers, { [field]: source[field] });
      }
    }
    const step = data.step as MoodStep;
    if (fields.slice(0, step - 1).some(field => !answers[field])) return newMoodSession();
    if ((data.completed || data.editing) && !isCompleteMoodCriteria(answers)) return newMoodSession();
    if (data.completed && data.editing) return newMoodSession();
    return { version: 1, step, answers, completed: data.completed, editing: data.editing };
  } catch {
    return newMoodSession();
  }
}

/** Store only answer IDs in this browser tab, and remain usable if storage is unavailable. */
export function saveMoodSession(
  session: MoodSession,
  expectedEpoch: string,
  storage: MoodStorage | null = browserStorage('sessionStorage'),
  records: MoodStorage | null = browserStorage('localStorage'),
): boolean {
  if (!storage || recordEpoch(records) !== expectedEpoch) return false;
  try {
    storage.setItem(MOOD_SESSION_KEY, JSON.stringify({ ...session, resetEpoch: expectedEpoch }));
    return true;
  } catch {
    // A blocked or full browser store must not prevent the diagnosis from working.
    return false;
  }
}

export function clearMoodSession(storage: MoodStorage | null = browserStorage('sessionStorage')): void {
  try {
    storage?.removeItem(MOOD_SESSION_KEY);
  } catch {
    // Reset still works in memory.
  }
}

/** Remove an older tab session only after the reset generation has hydrated. */
export function clearStaleMoodSession(
  expectedEpoch: string,
  storage: MoodStorage | null = browserStorage('sessionStorage'),
  records: MoodStorage | null = browserStorage('localStorage'),
): boolean {
  if (!storage || !expectedEpoch || recordEpoch(records) !== expectedEpoch) return false;
  try {
    const raw = storage.getItem(MOOD_SESSION_KEY);
    if (!raw) return false;
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return false;
    const data = saved as Record<string, unknown>;
    if (data.version !== 1 || typeof data.resetEpoch !== 'string' || data.resetEpoch === expectedEpoch) return false;
    storage.removeItem(MOOD_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

export function selectMoodAnswer(session: MoodSession, answer: MoodAnswer): MoodSession {
  const field = fields[session.step - 1];
  if (session.completed || !validAnswer(field, answer)) return session;
  const answers = { ...session.answers, [field]: answer };
  if (session.editing || session.step === 5) {
    return { ...session, answers, completed: isCompleteMoodCriteria(answers), editing: false };
  }
  return { ...session, answers, step: (session.step + 1) as MoodStep };
}

export function editMoodAnswer(session: MoodSession, step: MoodStep): MoodSession {
  return session.completed && isCompleteMoodCriteria(session.answers)
    ? { ...session, step, completed: false, editing: true }
    : session;
}

export function cancelMoodEdit(session: MoodSession): MoodSession {
  return session.editing ? { ...session, completed: true, editing: false } : session;
}

export function previousMoodStep(session: MoodSession): MoodSession {
  return !session.completed && !session.editing && session.step > 1
    ? { ...session, step: (session.step - 1) as MoodStep }
    : session;
}
