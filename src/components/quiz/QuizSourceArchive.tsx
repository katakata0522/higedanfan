import { ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { SongItem } from '../../data/higedanData';
import { REFERENCE_ARTICLES, REFERENCE_CHECKED_ON, type ReferenceArticle } from '../../data/referenceArticles';
import { prepareReferenceSearch, referenceDateLabel, referenceKindLabel, sortReferenceArticles } from './quizArchiveSearch';

const PAGE_SIZE = 24;
const PUBLISHERS = Array.from(new Set(REFERENCE_ARTICLES.map(article => article.publisher)))
  .sort((a, b) => a.localeCompare(b, 'ja'));

interface Props {
  visible: boolean;
  songs: SongItem[];
  onSelectSong?: (song: SongItem) => void;
}

export function QuizSourceArchive({visible, songs, onSelectSong}: Props) {
  const [publisher, setPublisher] = useState('all');
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<'newest' | 'oldest'>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const songsById = useMemo(() => new Map(songs.map(song => [song.id, song])), [songs]);
  const search = useMemo(() => prepareReferenceSearch(query, songs), [query, songs]);
  const articles = useMemo(() => visible ? sortReferenceArticles(REFERENCE_ARTICLES.filter(article =>
    (publisher === 'all' || article.publisher === publisher) && search.matches(article),
  ), order) : [], [visible, publisher, search, order]);
  const available = articles.filter(article => !article.unavailable);
  const unavailable = articles.filter(article => article.unavailable);

  function resetFilters() {
    setPublisher('all');
    setQuery('');
    setVisibleCount(PAGE_SIZE);
  }

  function renderArticle(article: ReferenceArticle) {
    const relatedSongs = article.relatedSongIds.flatMap(id => {
      const song = songsById.get(id);
      return song ? [song] : [];
    });
    // 曲名で探したときは、その曲へのリンクを折り畳みの外へ出す。
    const orderedSongs = [...relatedSongs].sort((a, b) => Number(search.matchesSong(b)) - Number(search.matchesSong(a)));
    const primarySongs = orderedSongs.slice(0, 3);
    const otherSongs = orderedSongs.slice(3);
    const songLink = (song: SongItem) => (
      <button key={song.id} type="button" onClick={() => onSelectSong?.(song)}
        className="min-h-11 py-2 text-left text-sm underline decoration-[#D5CEC2] underline-offset-4 hover:text-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer">
        {song.title}
      </button>
    );

    return (
      <article key={article.url} className="min-w-0 border-b border-[#E6E1D6] py-5 first:pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#57534E]">
          <span className="font-bold text-[#C83E2B]">{article.publisher}</span>
          <span>{referenceKindLabel(article.kind)}</span>
          {article.date ? <time dateTime={article.date}>{referenceDateLabel(article)}</time> : <span>公開日未確認</span>}
        </div>
        {article.unavailable && <p className="mt-2 text-xs text-[#78716C]">既存の出典名を記載しています。掲載元の記事名は未確認です。</p>}
        <a href={article.url} target="_blank" rel="noopener noreferrer"
          className="group mt-2 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4">
          <h3 className="text-base sm:text-lg font-bold leading-relaxed text-[#1C1917] group-hover:text-[#C83E2B] [overflow-wrap:anywhere]">
            {article.title}<ExternalLink aria-label="新しいタブで開く" className="ml-2 inline h-3.5 w-3.5 align-baseline text-[#78716C]" />
          </h3>
          <p className="mt-1.5 break-all text-xs leading-relaxed text-[#78716C] group-hover:underline">{article.url}</p>
        </a>
        {article.note && <p className="mt-2 text-xs leading-relaxed text-[#78716C]">{article.note}</p>}
        {onSelectSong && primarySongs.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-x-4 text-[#57534E]">
          <span className="text-xs">関連曲</span>
          {primarySongs.map(songLink)}
          {otherSongs.length > 0 && <details className="w-full">
            <summary className="min-h-11 w-fit py-3 text-xs underline underline-offset-4 cursor-pointer">ほか{otherSongs.length}曲</summary>
            <div className="flex flex-wrap gap-x-4">{otherSongs.map(songLink)}</div>
          </details>}
        </div>}
      </article>
    );
  }

  if (!visible) return null;
  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="quiz-archive-search" className="sr-only">記事名・媒体・曲名・年で検索</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input id="quiz-archive-search" type="search" value={query}
            onChange={event => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="記事名・媒体・曲名・年で検索"
            className="min-h-11 w-full rounded-xl border border-[#D5CEC2] bg-white pl-9 pr-3 py-2 text-base text-[#1C1917] placeholder:text-[#78716C] focus:border-[#1C1917] focus:outline-none" />
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
          <div className="min-w-0">
            <label htmlFor="quiz-publisher-filter" className="mb-1 block text-xs font-bold text-[#57534E]">媒体</label>
            <select id="quiz-publisher-filter" value={publisher} onChange={event => { setPublisher(event.target.value); setVisibleCount(PAGE_SIZE); }}
              className="min-h-11 w-full min-w-0 rounded-lg border border-[#D5CEC2] bg-white px-3 py-2 text-base text-[#1C1917] sm:text-sm">
              <option value="all">すべての媒体</option>
              {PUBLISHERS.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="reference-date-order" className="mb-1 block text-xs font-bold text-[#57534E]">日付順</label>
            <select id="reference-date-order" value={order} onChange={event => { setOrder(event.target.value as typeof order); setVisibleCount(PAGE_SIZE); }}
              className="min-h-11 w-full rounded-lg border border-[#D5CEC2] bg-white px-3 py-2 text-base text-[#1C1917] sm:text-sm">
              <option value="newest">新しい順</option><option value="oldest">古い順</option>
            </select>
          </div>
        </div>
        <p role="status" className="text-xs text-[#57534E]">{available.length}件{unavailable.length > 0 ? `（ほか、リンク先未確認 ${unavailable.length}件）` : ''}</p>
      </div>

      {articles.length === 0 ? <div className="py-8 text-center">
        <p className="text-sm text-[#57534E]">条件に一致する参考記事が見つかりませんでした。</p>
        <button type="button" onClick={resetFilters} className="mt-3 min-h-11 px-4 py-2 text-sm font-bold underline underline-offset-4 cursor-pointer">検索条件をリセット</button>
      </div> : <>
        <div data-reference-list>{available.slice(0, visibleCount).map(renderArticle)}</div>
        {available.length > visibleCount && <button type="button" onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
          className="mx-auto block min-h-11 rounded-lg border border-[#D5CEC2] bg-white px-5 py-3 text-sm font-bold text-[#1C1917] hover:border-[#1C1917] cursor-pointer">
          さらに{Math.min(PAGE_SIZE, available.length - visibleCount)}件を見る（残り{available.length - visibleCount}件）
        </button>}
        {unavailable.length > 0 && <details className="border-b border-[#E6E1D6] text-[#57534E]">
          <summary className="min-h-11 py-3 text-sm cursor-pointer">リンク先を確認できない資料（{unavailable.length}件）</summary>
          <p className="mt-1 text-xs leading-relaxed">{REFERENCE_CHECKED_ON.replaceAll('-', '/')}の確認ではリンク先を開けませんでした。以前の参照先として残しています。</p>
          {unavailable.map(renderArticle)}
        </details>}
      </>}
      <p className="text-xs leading-relaxed text-[#78716C]">日付は掲載元で確認できたものです。更新日・放送日・発行日・資料発売日は区別して表示し、確認できないものは「公開日未確認」としています。</p>
    </div>
  );
}
