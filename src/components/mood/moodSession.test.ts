import test from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY } from '../../hooks/fanRecordStorage';
import {
  cancelMoodEdit, clearMoodSession, clearStaleMoodSession, editMoodAnswer, MOOD_SESSION_KEY,
  newMoodSession, previousMoodStep, restoreMoodSession, saveMoodSession, selectMoodAnswer,
  type MoodStorage,
} from './moodSession';

function memoryStore(entries: Record<string, string> = {}): MoodStorage {
  const values = new Map(Object.entries(entries));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); },
  };
}

function completedSession() {
  return (['push_back', 'morning_commute', 'piano_pop', 'traveler', 'under4'] as const)
    .reduce(selectMoodAnswer, newMoodSession());
}

test('five answers can be edited one at a time or cancelled without losing other answers', () => {
  const finished = completedSession();
  assert.equal(finished.completed, true);
  assert.deepEqual(finished.answers, {
    mood: 'push_back', situation: 'morning_commute', sound: 'piano_pop', era: 'traveler', length: 'under4',
  });
  const editing = editMoodAnswer(finished, 3);
  assert.equal(editing.step, 3);
  assert.equal(editing.editing, true);
  assert.deepEqual(cancelMoodEdit(editing).answers, finished.answers);
  const revised = selectMoodAnswer(editing, 'brass_funk');
  assert.equal(revised.completed, true);
  assert.equal(revised.editing, false);
  assert.deepEqual(revised.answers, { ...finished.answers, sound: 'brass_funk' });
  assert.deepEqual(selectMoodAnswer(editing, 'under4'), editing, 'answer IDs from other questions are rejected');
});

test('answers survive going back and session restoration until the user restarts', () => {
  const sessions = memoryStore();
  const records = memoryStore();
  const second = selectMoodAnswer(newMoodSession(), 'push_back');
  const third = selectMoodAnswer(second, 'morning_commute');
  const back = previousMoodStep(third);
  assert.equal(back.step, 2);
  assert.equal(back.answers.situation, 'morning_commute');
  assert.equal(saveMoodSession(back, '', sessions, records), true);
  assert.deepEqual(restoreMoodSession(sessions, records), back);
  const result = completedSession();
  assert.equal(saveMoodSession(result, '', sessions, records), true);
  assert.deepEqual(restoreMoodSession(sessions, records), result);
  const editing = editMoodAnswer(result, 4);
  assert.equal(saveMoodSession(editing, '', sessions, records), true);
  assert.deepEqual(restoreMoodSession(sessions, records), editing);
  clearMoodSession(sessions);
  assert.deepEqual(restoreMoodSession(sessions, records), newMoodSession());
});

test('reset generations prevent stale restoration and stale writes, without deleting current data during hydration', () => {
  const records = memoryStore({ [STORAGE_KEY]: JSON.stringify({ resetEpoch: 'old' }) });
  const sessions = memoryStore();
  assert.equal(saveMoodSession(completedSession(), 'old', sessions, records), true);
  const oldRaw = sessions.getItem(MOOD_SESSION_KEY);
  assert.equal(clearStaleMoodSession('', sessions, records), false);
  assert.equal(clearStaleMoodSession('old', sessions, records), false);
  assert.equal(sessions.getItem(MOOD_SESSION_KEY), oldRaw);
  records.setItem(STORAGE_KEY, JSON.stringify({ resetEpoch: 'new' }));
  assert.deepEqual(restoreMoodSession(sessions, records), newMoodSession());
  assert.equal(saveMoodSession(completedSession(), 'old', sessions, records), false);
  assert.equal(clearStaleMoodSession('old', sessions, records), false);
  assert.equal(clearStaleMoodSession('new', sessions, records), true);
  assert.equal(sessions.getItem(MOOD_SESSION_KEY), null);
  assert.equal(saveMoodSession(completedSession(), 'new', sessions, records), true);
  assert.equal(clearStaleMoodSession('new', sessions, records), false);
});

test('corrupt or inaccessible browser storage never crashes or restores invalid answers', () => {
  const records = memoryStore();
  const sessions = memoryStore({ [MOOD_SESSION_KEY]: '{bad json' });
  assert.deepEqual(restoreMoodSession(sessions, records), newMoodSession());
  sessions.setItem(MOOD_SESSION_KEY, JSON.stringify({
    ...completedSession(), answers: { ...completedSession().answers, sound: 'not-a-sound' }, resetEpoch: '',
  }));
  assert.deepEqual(restoreMoodSession(sessions, records), newMoodSession());
  const denied: MoodStorage = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('denied'); },
    removeItem: () => { throw new Error('denied'); },
  };
  assert.deepEqual(restoreMoodSession(denied, records), newMoodSession());
  assert.equal(saveMoodSession(completedSession(), '', denied, records), false);
  assert.equal(saveMoodSession(completedSession(), '', sessions, denied), false);
  assert.doesNotThrow(() => clearMoodSession(denied));
});
