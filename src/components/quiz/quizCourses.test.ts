import assert from 'node:assert/strict';
import test from 'node:test';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { getCourseQuestions, type CourseDifficulty, type QuestionScopeFilter } from './quizCourses';

test('each difficulty has two distinct ten-question volumes', () => {
  for (const difficulty of ['beginner', 'intermediate', 'brothers'] as const) {
    const first = getCourseQuestions(difficulty, 'vol1');
    const second = getCourseQuestions(difficulty, 'vol2');
    assert.equal(first.length, 10);
    assert.equal(second.length, 10);
    assert.equal(new Set([...first, ...second].map(q => q.id)).size, 20);
    assert.ok([...first, ...second].every(q => q.difficulty === difficulty));
    for (const volume of [first, second]) {
      for (let index = 1; index < volume.length; index++) {
        const previous = volume[index - 1];
        const current = volume[index];
        if (previous.relatedSongId) assert.notEqual(previous.relatedSongId, current.relatedSongId);
        assert.ok(previous.category !== 'タイアップ・代表曲' || current.category !== 'タイアップ・代表曲');
      }
    }
    const ordering = second.map((q, index) => q.questionType === 'ordering' ? index : -1).filter(index => index >= 0);
    assert.equal(ordering.length, difficulty === 'intermediate' ? 2 : 1);
    if (ordering.length > 1) assert.ok(ordering[1] - ordering[0] > 1);
    assert.deepEqual(getCourseQuestions(difficulty, 'vol3'), []);
  }
});

test('the EP question is asked before the ordering question that names its answer', () => {
  const volume = getCourseQuestions('intermediate', 'vol2');
  const epIndex = volume.findIndex(q => q.id === 'q45');
  const orderIndex = volume.findIndex(q => q.id === 'q41');
  assert.ok(epIndex >= 0 && orderIndex > epIndex);
  assert.ok(volume[orderIndex].options.includes(`${volume[epIndex].options[volume[epIndex].correctIndex]} EP`));
});

test('four-choice answers do not concentrate in one part of a volume', () => {
  for (const difficulty of ['beginner', 'intermediate', 'brothers'] as const) {
    for (const scope of ['vol1', 'vol2'] as const) {
      const answers = getCourseQuestions(difficulty, scope)
        .filter(q => q.questionType !== 'ordering' && q.options.length === 4)
        .map(q => q.correctIndex);
      assert.deepEqual(new Set(answers), new Set([0, 1, 2, 3]));
      for (let index = 2; index < answers.length; index++) {
        assert.ok(answers[index] !== answers[index - 1] || answers[index] !== answers[index - 2]);
      }
    }
  }
});

test('the six mixed volumes cover all 60 questions once and include all difficulties', () => {
  const volumes = Array.from({ length: 6 }, (_, i) =>
    getCourseQuestions('all', `vol${i + 1}` as QuestionScopeFilter));
  for (const volume of volumes) {
    assert.equal(volume.length, 10);
    assert.deepEqual(new Set(volume.map(q => q.difficulty)), new Set<CourseDifficulty>(['beginner', 'intermediate', 'brothers']));
  }
  assert.deepEqual(new Set(volumes.flat().map(q => q.id)), new Set(QUIZ_QUESTIONS.map(q => q.id)));
});

test('a previous explanation does not give away the later Subtitle question', () => {
  const volume = getCourseQuestions('beginner', 'vol1');
  const earlier = volume.find(q => q.id === 'q2')!;
  const later = volume.find(q => q.id === 'q37')!;
  assert.ok(volume.indexOf(earlier) < volume.indexOf(later));
  const laterAnswer = later.options[later.correctIndex];
  const earlierFeedback = [earlier.explanation, ...earlier.sources.flatMap(s => [s.title, s.summary])].join(' ');
  assert.equal(earlierFeedback.includes(laterAnswer), false);
});
