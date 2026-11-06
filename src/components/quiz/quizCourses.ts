import { QUIZ_QUESTIONS, type QuizQuestion } from '../../data/quizData';

export type CourseDifficulty = 'all' | QuizQuestion['difficulty'];
export type QuestionScopeFilter = 'full' | 'new_variation' | 'ordering_only' | 'classic';

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
    desc: '初級から上級まで、すべての難易度を含みます。',
  },
  {
    id: 'beginner',
    indexCode: '02',
    title: '初級：代表曲・作品情報編',
    desc: '代表曲のタイアップやアルバムの収録曲から出題します。',
  },
  {
    id: 'intermediate',
    indexCode: '03',
    title: '中級：音源・作品・バンド史編',
    desc: '楽曲の長さや収録順、バンドの歩みから出題します。',
  },
  {
    id: 'brothers',
    indexCode: '04',
    title: '上級：作詞・作曲とメンバーの素顔編',
    desc: '作品のクレジットやメンバー自身の言葉から出題します。',
  },
];

export const DIFFICULTY_LABEL: Record<QuizQuestion['difficulty'], string> = {
  beginner: '初級（代表曲・基本データ）',
  intermediate: '中級（楽曲構造・記録分析）',
  brothers: '上級（作詞・作曲とメンバーの素顔）',
};

const NEW_VARIATION_IDS = new Set(
  Array.from({ length: 30 }, (_, i) => `q${i + 31}`)
);

export function getCourseQuestions(difficulty: CourseDifficulty, scope: QuestionScopeFilter) {
  return QUIZ_QUESTIONS.filter(question => {
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
  switch (scope) {
    case 'new_variation': return title + '［追加バリエーション編］';
    case 'ordering_only': return title + '［並び替え特訓モード］';
    case 'classic': return title + '［王道・基本編］';
    case 'full': return title;
  }
}
