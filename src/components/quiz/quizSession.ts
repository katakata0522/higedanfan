import type { QuizQuestion } from '../../data/quizData';
import { isOrderingAnswerCorrect } from '../../utils/quizScoring';
import type { CourseDifficulty, QuestionScopeFilter } from './quizCourses';

export interface QuizAnswer {
  selectedOption: number | null;
  selectedOrder: number[];
  isOrderingSubmitted: boolean;
}

export interface QuizSession {
  stage: 'select' | 'playing' | 'finished';
  difficulty: CourseDifficulty;
  scope: QuestionScopeFilter;
  currentIndex: number;
  correctBefore: number;
  answer: QuizAnswer;
}

export const EMPTY_ANSWER: QuizAnswer = { selectedOption: null, selectedOrder: [], isOrderingSubmitted: false };
export const INITIAL_SESSION: QuizSession = {
  stage: 'select', difficulty: 'all', scope: 'full', currentIndex: 0, correctBefore: 0, answer: EMPTY_ANSWER,
};

export function isAnswerCorrect(question: QuizQuestion, answer: QuizAnswer) {
  if (question.questionType === 'ordering') {
    return answer.isOrderingSubmitted && isOrderingAnswerCorrect(answer.selectedOrder, question.correctOrder ?? []);
  }
  return answer.selectedOption === question.correctIndex;
}
