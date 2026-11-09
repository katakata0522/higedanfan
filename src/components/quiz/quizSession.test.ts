import assert from 'node:assert/strict';
import test from 'node:test';
import { EMPTY_ANSWER, isAnswerCorrect } from './quizSession';
import { getCourseLabel, getCourseQuestions } from './quizCourses';
import { calculateQuizResult } from '../../utils/quizScoring';

test('restored answers score once, and an unfinished ordering answer scores nothing', () => {
  const [first] = getCourseQuestions('all', 'full');
  assert.equal(isAnswerCorrect(first, EMPTY_ANSWER), false);
  assert.equal(isAnswerCorrect(first, { ...EMPTY_ANSWER, selectedOption: first.correctIndex }), true);
  const [ordering] = getCourseQuestions('all', 'ordering_only');
  const answer = { ...EMPTY_ANSWER, selectedOrder: ordering.correctOrder! };
  assert.equal(isAnswerCorrect(ordering, answer), false);
  assert.equal(isAnswerCorrect(ordering, { ...answer, isOrderingSubmitted: true }), true);
});

test('filtered certificates describe only the questions actually played', () => {
  for (const difficulty of ['all', 'brothers'] as const) {
    const questions = getCourseQuestions(difficulty, 'ordering_only');
    const label = getCourseLabel(difficulty, 'ordering_only');
    const result = calculateQuizResult(questions.length, questions);
    assert.match(label, /並び替え/);
    assert.doesNotMatch(label, /全(20|60)問/);
    assert.match(result.editorialMessage, new RegExp(result.total + '問'));
    assert.equal(result.total, difficulty === 'all' ? 4 : 1);
  }
});
