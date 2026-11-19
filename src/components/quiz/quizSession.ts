import type { QuizQuestion } from '../../data/quizData';
import { isOrderingAnswerCorrect } from '../../utils/quizScoring';
import type { CourseDifficulty, QuestionScopeFilter, QuestionSet } from './quizCourses';

export interface QuizAnswer {
  selectedOption: number | null;
  selectedOrder: number[];
  isOrderingSubmitted: boolean;
}

export type QuizQuestionOutcome = 'correct' | 'wrong' | null;

export interface QuizSession {
  stage: 'select' | 'playing' | 'finished';
  difficulty: CourseDifficulty;
  scope: QuestionScopeFilter;
  questionSet?: QuestionSet;
  currentIndex: number;
  correctBefore: number;
  answer: QuizAnswer;
  outcomes?: QuizQuestionOutcome[];
}

export const EMPTY_ANSWER: QuizAnswer = { selectedOption: null, selectedOrder: [], isOrderingSubmitted: false };
export const INITIAL_SESSION: QuizSession = {
  stage: 'select', difficulty: 'all', scope: 'vol1', questionSet: 'current', currentIndex: 0, correctBefore: 0, answer: EMPTY_ANSWER,
};

export function isAnswerCorrect(question: QuizQuestion, answer: QuizAnswer) {
  if (question.questionType === 'ordering') {
    return answer.isOrderingSubmitted && isOrderingAnswerCorrect(answer.selectedOrder, question.correctOrder ?? []);
  }
  return answer.selectedOption === question.correctIndex;
}
