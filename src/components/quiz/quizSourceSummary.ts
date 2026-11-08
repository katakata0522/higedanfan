import type { QuizSourceItem } from '../../data/quizData';

// The title is already shown on the card. Keep the stored text intact, but
// omit summaries that repeat nothing beyond that title and an attribution.
export function visibleQuizSourceSummary(source: Pick<QuizSourceItem, 'title' | 'summary'>): string | null {
  const repeats = (title: string) => source.summary === `この問いで参照した資料：${title}。`;
  const officialTitle = source.title.startsWith('公式：') ? source.title.slice('公式：'.length) : source.title;
  return repeats(source.title) || repeats(officialTitle) ? null : source.summary;
}
