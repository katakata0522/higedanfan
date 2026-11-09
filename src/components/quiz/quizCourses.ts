import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/quizData';
import { QUIZ_QUESTIONS as LEGACY_QUIZ_QUESTIONS } from '../../data/quizDataLegacy';

export type CourseDifficulty = 'all' | QuizQuestion['difficulty'];
export type QuestionScopeFilter = 'full' | 'new_variation' | 'ordering_only' | 'classic' | 'vol1' | 'vol2' | 'vol3' | 'vol4' | 'vol5' | 'vol6';
export type QuestionSet = 'current' | 'legacy';

export const QUIZ_COURSES: {
  id: CourseDifficulty;
  indexCode: string;
  title: string;
  desc: string;
}[] = [
  {
    id: 'all',
    indexCode: '01',
    title: '総合チャレンジコース',
    desc: '初級から上級まで、いろいろな問題を少しずつ。',
  },
  {
    id: 'beginner',
    indexCode: '02',
    title: '初級',
    desc: '代表曲から、メンバーや楽曲のエピソードまで。',
  },
  {
    id: 'intermediate',
    indexCode: '03',
    title: '中級',
    desc: '楽曲の背景や、バンドの歩みをもう少し深く。',
  },
  {
    id: 'brothers',
    indexCode: '04',
    title: '上級',
    desc: '制作の裏話やメンバーの言葉まで、じっくりと。',
  },
];

export const DIFFICULTY_LABEL: Record<QuizQuestion['difficulty'], string> = {
  beginner: '初級',
  intermediate: '中級',
  brothers: '上級',
};

const NEW_VARIATION_IDS = new Set(
  Array.from({ length: 30 }, (_, i) => `q${i + 31}`)
);

export function getCourseQuestions(difficulty: CourseDifficulty, scope: QuestionScopeFilter, questionSet: QuestionSet = 'current'): QuizQuestion[] {
  const bank: QuizQuestion[] = questionSet === 'legacy' ? LEGACY_QUIZ_QUESTIONS : QUIZ_QUESTIONS;
  if (scope.startsWith('vol')) {
    if (questionSet === 'legacy') return [];
    const volume = Number(scope.slice(3));
    if (!Number.isInteger(volume) || volume < 1 || volume > (difficulty === 'all' ? 6 : 2)) return [];
    // Spread the two ordering questions through Vol.2 instead of opening
    // every second volume with two similar tasks.
    const tierQuestions = (tier: QuizQuestion['difficulty']) => {
      const questions = bank.filter(question => question.difficulty === tier);
      const secondVolume = questions.slice(10);
      return [...questions.slice(0, 10), ...[2, 0, 3, 4, 5, 1, 6, 7, 8, 9].map(index => secondVolume[index])];
    };
    if (difficulty !== 'all') {
      return tierQuestions(difficulty).slice((volume - 1) * 10, volume * 10);
    }
    const tiers = (['beginner', 'intermediate', 'brothers'] as const).map(tierQuestions);
    const mixed = tiers[0].flatMap((_, index) => tiers.map(tier => tier[index]));
    return mixed.slice((volume - 1) * 10, volume * 10);
  }
  return bank.filter(question => {
    if (difficulty !== 'all' && question.difficulty !== difficulty) return false;
    switch (scope) {
      case 'new_variation': return NEW_VARIATION_IDS.has(question.id);
      case 'ordering_only': return question.questionType === 'ordering';
      case 'classic': return !NEW_VARIATION_IDS.has(question.id);
      case 'full': return true;
    }
  });
}

export function getCourseLabel(difficulty: CourseDifficulty, scope: QuestionScopeFilter) {
  const title = QUIZ_COURSES.find(course => course.id === difficulty)?.title ?? QUIZ_COURSES[0].title;
  if (scope.startsWith('vol')) return `${title} Vol.${scope.slice(3)}`;
  switch (scope) {
    case 'new_variation': return title + '［追加バリエーション編］';
    case 'ordering_only': return title + '［並び替え特訓モード］';
    case 'classic': return title + '［王道・基本編］';
    case 'full': return title;
    default: return title;
  }
}
