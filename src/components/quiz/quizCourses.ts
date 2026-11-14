import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/quizData';
import { QUIZ_QUESTIONS as LEGACY_QUIZ_QUESTIONS } from '../../data/quizDataLegacy';
import { QUIZ_QUESTIONS as PREVIOUS_QUIZ_QUESTIONS } from '../../data/quizDataPrevious';
import { QUIZ_QUESTIONS as PRIOR_QUIZ_QUESTIONS } from '../../data/quizDataPriorRevision';
import { QUIZ_QUESTIONS as RECENT_QUIZ_QUESTIONS } from '../../data/quizDataRecent';
import { QUIZ_QUESTIONS as PUBLISHED_QUIZ_QUESTIONS } from '../../data/quizDataPublishedRevision';

export type CourseDifficulty = 'all' | QuizQuestion['difficulty'];
export type QuestionScopeFilter = 'full' | 'new_variation' | 'ordering_only' | 'classic' | 'vol1' | 'vol2' | 'vol3' | 'vol4' | 'vol5' | 'vol6';
export type QuestionSet = 'current' | 'published' | 'recent' | 'prior' | 'previous' | 'legacy';

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

// 作品・歌詞・メンバーの話が続けて偏らないよう、10問ごとに並べる。
// Keep the published order for people who began a quiz before this revision.
const PRIOR_VOLUME_QUESTION_IDS: Record<QuizQuestion['difficulty'], string[]> = {
  beginner: [
    'q1', 'q5', 'q8', 'q2', 'q33', 'q18', 'q37', 'q53', 'q3', 'q57',
    'q35', 'q31', 'q9', 'q36', 'q7', 'q39', 'q32', 'q40', 'q10', 'q38',
  ],
  intermediate: [
    'q11', 'q19', 'q12', 'q4', 'q13', 'q17', 'q14', 'q20', 'q15', 'q16',
    'q43', 'q41', 'q48', 'q46', 'q45', 'q42', 'q50', 'q47', 'q49', 'q44',
  ],
  brothers: [
    'q21', 'q24', 'q23', 'q28', 'q25', 'q30', 'q26', 'q29', 'q22', 'q27',
    'q6', 'q51', 'q58', 'q34', 'q55', 'q52', 'q59', 'q54', 'q56', 'q60',
  ],
};

// 直前の公開版で始めたコースは、出題順も含めて元のまま続けられる。
const RECENT_VOLUME_QUESTION_IDS: Record<QuizQuestion['difficulty'], string[]> = {
  beginner: [
    'q1', 'q5', 'q43', 'q2', 'q33', 'q18', 'q37', 'q53', 'q3', 'q57',
    'q35', 'q31', 'q9', 'q36', 'q7', 'q39', 'q32', 'q40', 'q10', 'q38',
  ],
  intermediate: [
    'q11', 'q19', 'q12', 'q4', 'q13', 'q17', 'q14', 'q20', 'q15', 'q16',
    'q8', 'q41', 'q48', 'q46', 'q45', 'q42', 'q50', 'q47', 'q49', 'q44',
  ],
  brothers: PRIOR_VOLUME_QUESTION_IDS.brothers,
};

const PUBLISHED_VOLUME_QUESTION_IDS: Record<QuizQuestion['difficulty'], string[]> = {
  beginner: RECENT_VOLUME_QUESTION_IDS.beginner,
  intermediate: [
    'q11', 'q19', 'q12', 'q4', 'q13', 'q17', 'q14', 'q20', 'q15', 'q16',
    'q8', 'q45', 'q48', 'q41', 'q46', 'q42', 'q50', 'q47', 'q49', 'q44',
  ],
  brothers: RECENT_VOLUME_QUESTION_IDS.brothers,
};

const VOLUME_QUESTION_IDS: Record<QuizQuestion['difficulty'], string[]> = {
  beginner: [
    'q1', 'q5', 'q19', 'q16', 'q36', 'q35', 'q2', 'q57', 'q37', 'q27',
    'q47', 'q31', 'q9', 'q25', 'q53', 'q7', 'q32', 'q49', 'q52', 'q10',
  ],
  intermediate: [
    'q11', 'q43', 'q17', 'q3', 'q33', 'q28', 'q14', 'q22', 'q39', 'q15',
    'q8', 'q45', 'q21', 'q41', 'q46', 'q42', 'q50', 'q26', 'q29', 'q20',
  ],
  brothers: [
    'q55', 'q24', 'q23', 'q18', 'q30', 'q12', 'q4', 'q13', 'q38', 'q40',
    'q6', 'q51', 'q58', 'q34', 'q56', 'q59', 'q54', 'q48', 'q44', 'q60',
  ],
};

const CURRENT_BY_ID = new Map(QUIZ_QUESTIONS.map(question => [question.id, question]));
const PUBLISHED_BY_ID = new Map(PUBLISHED_QUIZ_QUESTIONS.map(question => [question.id, question]));
const PRIOR_BY_ID = new Map(PRIOR_QUIZ_QUESTIONS.map(question => [question.id, question]));
const RECENT_BY_ID = new Map(RECENT_QUIZ_QUESTIONS.map(question => [question.id, question]));

export function getCourseQuestions(difficulty: CourseDifficulty, scope: QuestionScopeFilter, questionSet: QuestionSet = 'current'): QuizQuestion[] {
  const bank: QuizQuestion[] = questionSet === 'legacy'
    ? LEGACY_QUIZ_QUESTIONS
    : questionSet === 'previous' ? PREVIOUS_QUIZ_QUESTIONS
    : questionSet === 'prior' ? PRIOR_QUIZ_QUESTIONS
    : questionSet === 'recent' ? RECENT_QUIZ_QUESTIONS
    : questionSet === 'published' ? PUBLISHED_QUIZ_QUESTIONS : QUIZ_QUESTIONS;
  if (scope.startsWith('vol')) {
    if (questionSet === 'legacy') return [];
    const volume = Number(scope.slice(3));
    if (!Number.isInteger(volume) || volume < 1 || volume > (difficulty === 'all' ? 6 : 2)) return [];
    const tierQuestions = (tier: QuizQuestion['difficulty']) => {
      if (questionSet === 'current') {
        return VOLUME_QUESTION_IDS[tier].map(id => CURRENT_BY_ID.get(id)).filter((q): q is QuizQuestion => q !== undefined);
      }
      if (questionSet === 'published') {
        return PUBLISHED_VOLUME_QUESTION_IDS[tier].map(id => PUBLISHED_BY_ID.get(id)).filter((q): q is QuizQuestion => q !== undefined);
      }
      if (questionSet === 'recent') {
        return RECENT_VOLUME_QUESTION_IDS[tier].map(id => RECENT_BY_ID.get(id)).filter((q): q is QuizQuestion => q !== undefined);
      }
      if (questionSet === 'prior') {
        return PRIOR_VOLUME_QUESTION_IDS[tier].map(id => PRIOR_BY_ID.get(id)).filter((q): q is QuizQuestion => q !== undefined);
      }
      // 更新前に始めたコースは、出題順も含めて元のまま再開する。
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
    case 'ordering_only': return title + '［順番並び替え編］';
    case 'classic': return title + '［王道・基本編］';
    case 'full': return title;
    default: return title;
  }
}
