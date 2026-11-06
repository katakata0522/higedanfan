import type { QuizQuestion } from '../data/higedanData';

export interface QuizResultSummary {
  score: number;
  total: number;
  percentage: number;
  rankTitle: string;
  rankBadgeCode: string;
  editorialMessage: string;
}

export function calculateQuizResult(
  score: number,
  questions: QuizQuestion[]
): QuizResultSummary {
  const total = Math.max(1, questions.length);
  const safeScore = Math.max(0, Math.min(score, total));
  const percentage = Math.round((safeScore / total) * 100);

  if (percentage === 100) {
    return {
      score: safeScore,
      total,
      percentage,
      rankTitle: '名誉編集長 / BROTHERS マスター',
      rankBadgeCode: 'RANK S · EDITORIAL CHIEF',
      editorialMessage:
        '全問正解！歌詞の細部から転調トリビア、松江〜日産スタジアムの歴史まで完璧に網羅した生粋のヒゲダン博士です。',
    };
  }
  if (percentage >= 65) {
    return {
      score: safeScore,
      total,
      percentage,
      rankTitle: 'グッドミュージック特派員',
      rankBadgeCode: 'RANK A · SENIOR WRITER',
      editorialMessage:
        '高い正答率です！代表曲だけでなくアルバム曲やライブの醍醐味までしっかり味わえている頼もしいファンです。',
    };
  }
  return {
    score: safeScore,
    total,
    percentage,
    rankTitle: 'ヒゲダン沼のルーキー読者',
    rankBadgeCode: 'RANK B · NEW LISTENER',
    editorialMessage:
      'これからさらに多くの名曲と出会える最高のタイミング！まずはディスコグラフィと気分診断から気になる1曲を深掘りしてみましょう。',
  };
}

export function isOrderingAnswerCorrect(
  selectedOrder: number[],
  correctOrder: number[]
): boolean {
  if (!Array.isArray(selectedOrder) || !Array.isArray(correctOrder)) return false;
  if (selectedOrder.length !== correctOrder.length || correctOrder.length === 0) {
    return false;
  }
  return correctOrder.every((expectedIdx, pos) => selectedOrder[pos] === expectedIdx);
}

export function formatOrderingSequence(
  options: string[],
  orderIndices: number[]
): string {
  return orderIndices
    .map((optIdx, pos) => `${pos + 1}番目: ${options[optIdx] ?? ''}`)
    .join(' → ');
}
