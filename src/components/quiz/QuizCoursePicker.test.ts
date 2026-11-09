import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QuizCoursePicker } from './QuizCoursePicker';
import { getCourseQuestions } from './quizCourses';

test('the beginner picker shows the number of ordering questions actually available', () => {
  const html = renderToStaticMarkup(createElement(QuizCoursePicker, { onStart: () => {} }));
  const count = getCourseQuestions('beginner', 'ordering_only').length;
  assert.match(html, new RegExp(`並び替え問題だけに挑戦する（${count}問）`));
});
