import assert from 'node:assert/strict';
import test from 'node:test';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { visibleQuizSourceSummary } from './quizSourceSummary';

test('only a summary repeating the source title is omitted', () => {
  assert.equal(visibleQuizSourceSummary({ title: 'エスカパレード', summary: 'この問いで参照した資料：エスカパレード。' }), null);
  assert.equal(visibleQuizSourceSummary({ title: '公式：らしさ', summary: 'この問いで参照した資料：らしさ。' }), null);
  assert.equal(visibleQuizSourceSummary({ title: '公式：らしさ', summary: 'この問いで参照した資料：公式：らしさ。' }), null);

  const specific = 'この問いで参照した資料：エスカパレード。発売日を掲載しています。';
  assert.equal(visibleQuizSourceSummary({ title: 'エスカパレード', summary: specific }), specific);
  assert.equal(visibleQuizSourceSummary({ title: 'エスカパレード', summary: '曲目と発売日を掲載しています。' }), '曲目と発売日を掲載しています。');
  assert.equal(visibleQuizSourceSummary({ title: '別の資料', summary: 'この問いで参照した資料：エスカパレード。' }), 'この問いで参照した資料：エスカパレード。');
});

test('real summaries retain source details and the underlying records', () => {
  const q1 = QUIZ_QUESTIONS.find(question => question.id === 'q1')!;
  const q13 = QUIZ_QUESTIONS.find(question => question.id === 'q13')!;
  const originalSummary = q1.sources[0].summary;
  assert.equal(visibleQuizSourceSummary(q1.sources[0]), null);
  assert.equal(q1.sources[0].summary, originalSummary);
  assert.equal(visibleQuizSourceSummary(q13.sources[0]), q13.sources[0].summary);
});
