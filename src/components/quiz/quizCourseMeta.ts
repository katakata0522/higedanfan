import type { QuizQuestion } from '../../data/quizData';

export type CourseDifficulty = 'all' | QuizQuestion['difficulty'];
export type QuestionScopeFilter =
  | 'full'
  | 'new_variation'
  | 'ordering_only'
  | 'classic'
  | 'vol1'
  | 'vol2'
  | 'vol3'
  | 'vol4'
  | 'vol5'
  | 'vol6';
export type QuestionSet =
  | 'current'
  | 'pre_all4choice'
  | 'published'
  | 'recent'
  | 'prior'
  | 'previous'
  | 'legacy';

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
