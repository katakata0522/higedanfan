import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuizCoursePicker } from './QuizCoursePicker';
import { getCourseQuestions } from './quizCourses';

test('the picker offers all 4 standard courses and best score without ordering-only mode', () => {
  const html = renderToStaticMarkup(createElement(QuizCoursePicker, { onStart: () => {}, bestQuizScore: 90 }));
  const fullCount = getCourseQuestions('beginner', 'full').length;
  assert.ok(fullCount > 0);
  assert.doesNotMatch(html, /並び替え問題だけに挑戦する/);
  assert.match(html, /総合チャレンジコース/);
  assert.match(html, /初級/);
  assert.match(html, /中級/);
  assert.match(html, /上級/);
  assert.match(html, /90%/);
});
