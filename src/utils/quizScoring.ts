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
        `今回挑戦した${total}問にすべて正解しました！楽曲の背景からメンバーの言葉まで、深い愛が光る見事な記録です。`,
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
        'たくさんの楽曲エピソードをご存じですね！気になった問題の背景は、参考記事・インタビュー一覧からさらに深くたどれます。',
    };
  }
  return {
    score: safeScore,
    total,
    percentage,
    rankTitle: 'ヒゲダン沼のルーキー読者',
    rankBadgeCode: 'RANK B · MUSIC ROOKIE',
    editorialMessage:
      'ここからさらに沼が深まる予感！知らなかったエピソードは、楽曲ガイドや参考記事からぜひ追いかけてみてください。',
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
