import { BookOpen, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import type { SongItem } from '../../data/higedanData';
import { DIFFICULTY_LABEL, type CourseDifficulty } from './quizCourses';
import { prepareQuizArchiveSearch, quizArchiveAnswer } from './quizArchiveSearch';
import { visibleQuizSourceSummary } from './quizSourceSummary';

const publisherNames = QUIZ_QUESTIONS.flatMap(question => question.sources.map(source => source.publisher));
const PUBLISHERS = [
  {id: 'all', label: 'すべての媒体'},
  ...Array.from(new Set(publisherNames)).sort((a, b) => a.localeCompare(b, 'ja')).map(label => ({id: label, label})),
];

interface Props {
  visible: boolean;
  songs: SongItem[];
  onSelectSong?: (song: SongItem) => void;
}

export function QuizSourceArchive({visible, songs, onSelectSong}: Props) {
  const [archiveDifficulty, setArchiveDifficulty] = useState<CourseDifficulty>('all');
  const [publisherFilter, setPublisherFilter] = useState('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const songsById = useMemo(() => new Map(songs.map(song => [song.id, song])), [songs]);

  const archiveQuestions = useMemo(() => {
    if (!visible) return [];
    const matchesSearch = prepareQuizArchiveSearch(archiveSearchQuery, songs);
    return QUIZ_QUESTIONS.filter((q) => {
      if (archiveDifficulty !== 'all' && q.difficulty !== archiveDifficulty) {
        return false;
      }
      if (publisherFilter !== 'all' && !q.sources.some(s => s.publisher === publisherFilter)) return false;
      const relatedSong = onSelectSong && q.relatedSongId ? songsById.get(q.relatedSongId) : undefined;
      return matchesSearch(q, relatedSong);
    });
  }, [visible, archiveDifficulty, publisherFilter, archiveSearchQuery, songs, songsById, onSelectSong]);

  if (!visible) return null;
  return (
    <div className="mt-6 space-y-5">
      {/* Search & Multi-Axis Filter Panel */}
      <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">
              全60問のトリビア解説 ＆ 出典インタビュー・データ検証図鑑
            </h3>
            <p className="mt-0.5 text-xs text-[#57534E]">
              曲名や言葉、難易度から、作品情報や本人インタビュー、収録音源の出典をたどれます。
            </p>
          </div>
          <span className="text-xs font-mono-num font-bold text-[#C83E2B] shrink-0">
            表示中：{archiveQuestions.length} 問（出典資料 {new Set(archiveQuestions.flatMap(q => q.sources.map(s => s.url))).size} 本）
          </span>
        </div>

        {/* Difficulty & Media Publisher Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[#E6E1D6]">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="quiz-archive-search" className="sr-only">
              トリビア・出典記事をキーワード検索
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716C]" />
            <input
              id="quiz-archive-search"
              type="search"
              value={archiveSearchQuery}
              onChange={(e) => setArchiveSearchQuery(e.target.value)}
              placeholder="曲名・アルバム名・並び替え…"
              className="w-full rounded-xl border border-[#D5CEC2] bg-[#FBF9F5] pl-9 pr-3 py-2 text-xs text-[#1C1917] placeholder:text-[#78716C] focus:border-[#1C1917] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="md:col-span-7 flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: '全60問' },
                { id: 'beginner', label: '初級 (20問)' },
                { id: 'intermediate', label: '中級 (20問)' },
                { id: 'brothers', label: '上級 (20問)' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setArchiveDifficulty(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  archiveDifficulty === tab.id
                    ? 'bg-[#C83E2B] text-white'
                    : 'border border-[#E6E1D6] bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Publisher Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-[#78716C] mr-1">
            出典メディア絞り込み：
          </span>
          {PUBLISHERS.map((pub) => (
            <button
              key={pub.id}
              type="button"
              onClick={() => setPublisherFilter(pub.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                publisherFilter === pub.id
                  ? 'bg-[#1C1917] text-[#FBF9F5]'
                  : 'border border-[#E6E1D6] bg-white text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {pub.label}
            </button>
          ))}
        </div>
      </div>

      {archiveQuestions.length === 0 ? (
        <div className="rounded-2xl border border-[#E6E1D6] bg-white p-8 text-center space-y-3">
          <p className="text-sm font-bold text-[#1C1917]">
            条件に一致するトリビア・出典記事が見つかりませんでした。
          </p>
          <button
            type="button"
            onClick={() => {
              setArchiveDifficulty('all');
              setPublisherFilter('all');
              setArchiveSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-4 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] cursor-pointer"
          >
            フィルタをリセットする
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {archiveQuestions.map((q, index) => {
            const matchedSong = q.relatedSongId
              ? songsById.get(q.relatedSongId)
              : null;
            const answerDisplay = quizArchiveAnswer(q);

            return (
              <article
                key={q.id}
                className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 space-y-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-num text-xs font-bold text-[#C83E2B]">
                      #{index + 1} ({q.id.toUpperCase()})
                    </span>
                    <span className="rounded-md bg-[#F2EFE9] px-2 py-0.5 text-[11px] font-bold text-[#1C1917]">
                      {DIFFICULTY_LABEL[q.difficulty]}
                    </span>
                    {q.questionType === 'ordering' && (
                      <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                        並び替え問題
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#15803D]">
                    正解：{answerDisplay}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-[#1C1917] leading-relaxed">
                  Q. {q.prompt}
                </h4>

                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {q.explanation}
                </p>

                {/* Sources Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {q.sources.map((src, sIdx) => {
                    const summary = visibleQuizSourceSummary(src);
                    return (
                      <div
                        key={`${q.id}-archive-src-${sIdx}`}
                        className="rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-3.5 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#C83E2B]">
                              {src.publisher}
                            </span>
                            <span className="text-[11px] text-[#78716C]">
                              {src.publishedNote}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-bold text-[#1C1917] leading-snug">
                            {src.title}
                          </div>
                          {summary && <p className="mt-1.5 text-xs text-[#57534E] leading-relaxed">{summary}</p>}
                        </div>
                        <div className="pt-1 flex justify-end">
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E3A5F] hover:underline"
                          >
                            出典メディアを見る
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {matchedSong && onSelectSong && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onSelectSong(matchedSong)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3 py-1.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                      関連楽曲『{matchedSong.title}』の分析・音域データを見る
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
