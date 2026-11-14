import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuizCoursePicker } from './QuizCoursePicker';
import { getCourseQuestions } from './quizCourses';

test('the beginner picker offers standard courses without ordering-only mode', () => {
  const html = renderToStaticMarkup(createElement(QuizCoursePicker, { onStart: () => {} }));
  const fullCount = getCourseQuestions('beginner', 'full').length;
  assert.ok(fullCount > 0);
  assert.doesNotMatch(html, /並び替え問題だけに挑戦する/);
});
