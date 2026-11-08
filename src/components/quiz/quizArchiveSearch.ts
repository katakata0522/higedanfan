import type { QuizQuestion } from '../../data/quizData';
import type { SongItem } from '../../data/higedanData';
import { songReadings } from '../../data/songReadings';
import { formatOrderingSequence } from '../../utils/quizScoring';
import { visibleQuizSourceSummary } from './quizSourceSummary';

type SearchableSong = Pick<SongItem, 'id' | 'title'>;

// Match the song guide's treatment of case, width, kana, and separators.
function searchKey(value: string): string {
  return value.normalize('NFKC').toLowerCase()
    .replace(/[ァ-ヶ]/g, kana => String.fromCharCode(kana.charCodeAt(0) - 0x60))
    .replace(/[\s'‘’".…・!?‐‑–—×-]+/g, '');
}

export function quizArchiveAnswer(question: QuizQuestion): string {
  return question.questionType === 'ordering' && question.correctOrder
    ? formatOrderingSequence(question.options, question.correctOrder)
    : question.options[question.correctIndex] ?? '';
}

export function prepareQuizArchiveSearch(query: string, songs: readonly SearchableSong[]) {
  const key = searchKey(query.trim());
  const readingTitles = key
    ? songs.flatMap(song => {
        const reading = songReadings[song.id];
        return reading && searchKey(reading).includes(key) ? [searchKey(song.title)] : [];
      }).filter(Boolean)
    : [];

  return (question: QuizQuestion, relatedSong?: SearchableSong): boolean => {
    if (!key) return true;

    // Search only content the archive actually renders. In particular, wrong
    // answers in a single-choice question do not appear on the result card.
    const visibleFields = [
      question.prompt,
      question.explanation,
      question.category,
      quizArchiveAnswer(question),
      relatedSong?.title ?? '',
      ...question.sources.flatMap(source => [
        source.title, source.publisher, source.publishedNote, visibleQuizSourceSummary(source) ?? '',
      ]),
    ].map(searchKey);

    if (visibleFields.some(field => field.includes(key))) return true;

    // A song's Japanese reading is an alias only when its title is visible.
    return readingTitles.some(title => visibleFields.some(field => field.includes(title)));
  };
}
