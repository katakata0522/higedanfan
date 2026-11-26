import { ExternalLink, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SongItem } from '../../data/higedanTypes';
import { REFERENCE_ARTICLES, REFERENCE_CHECKED_ON, type ReferenceArticle, type ReferenceKind } from '../../data/referenceArticles';
import { prepareReferenceSearch, REFERENCE_KINDS, referenceDateLabel, referenceKindLabel, sortReferenceArticles } from './quizArchiveSearch';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { clearArchiveReturnState, readArchiveReturnState, saveArchiveReturnState } from '../../utils/guideReturnState';

const PAGE_SIZE = 24;
const PUBLISHERS = Array.from(new Set(REFERENCE_ARTICLES.map(article => article.publisher)))
  .sort((a, b) => a.localeCompare(b, 'ja'));

function formatSourceDomain(url: string, fallback: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || fallback;
  } catch {
    return fallback;
  }
}

interface Props {
  visible: boolean;
  songs: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  resetEpoch?: string;
}

export function QuizSourceArchive({visible, songs, onSelectSong, resetEpoch = ''}: Props) {
  const [initialReturn] = useState(() =>
    visible ? readArchiveReturnState(REFERENCE_ARTICLES.length, resetEpoch, PUBLISHERS) : null,
  );
  const consumedReturnRef = useRef(false);
  useEffect(() => {
    if (consumedReturnRef.current || !visible) return;
    consumedReturnRef.current = true;
    if (initialReturn) clearArchiveReturnState();
  }, [visible, initialReturn]);
  const [publisher, setPublisher] = useState(() => initialReturn?.publisher ?? 'all');
  const [kind, setKind] = useState<ReferenceKind | 'all'>(() =>
    initialReturn?.kind && REFERENCE_KINDS.includes(initialReturn.kind as ReferenceKind)
      ? (initialReturn.kind as ReferenceKind)
      : 'all',
  );
  const [query, setQuery] = useState(() => initialReturn?.query ?? '');
  const [order, setOrder] = useState<'newest' | 'oldest'>(() => initialReturn?.order ?? 'newest');
  const [visibleCount, setVisibleCount] = useState(() => initialReturn?.visibleCount ?? PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const songsById = useMemo(() => new Map(songs.map(song => [song.id, song])), [songs]);
  const search = useMemo(() => prepareReferenceSearch(query, songs), [query, songs]);
  const kindCounts = useMemo(() => {
    const counts = new Map<ReferenceKind | 'all', number>();
    let availableAll = 0;
    for (const article of REFERENCE_ARTICLES) {
      if (article.unavailable) continue;
      if ((publisher === 'all' || article.publisher === publisher) && search.matches(article)) {
        availableAll += 1;
        counts.set(article.kind, (counts.get(article.kind) ?? 0) + 1);
      }
    }
    counts.set('all', availableAll);
    return counts;
  }, [publisher, search]);
  const articles = useMemo(() => visible ? sortReferenceArticles(REFERENCE_ARTICLES.filter(article =>
    (publisher === 'all' || article.publisher === publisher) &&
    (kind === 'all' || article.kind === kind) &&
    search.matches(article),
  ), order) : [], [visible, publisher, kind, search, order]);
  const available = articles.filter(article => !article.unavailable);
  const unavailable = articles.filter(article => article.unavailable);
  const hasActiveFilters = publisher !== 'all' || kind !== 'all' || query.trim() !== '';

  function resetFilters() {
    setPublisher('all');
    setKind('all');
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
      <a
        key={song.id}
        href={`${import.meta.env.BASE_URL}${songPagePath(song.id) ?? ''}`}
        onClick={() => saveArchiveReturnState({ publisher, kind, query, order, visibleCount, resetEpoch })}
        className="inline-flex min-h-11 items-center py-2 text-left text-sm underline decoration-[#D5CEC2] underline-offset-4 hover:text-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {song.title}
      </a>
    );

    return (
      <article key={article.url} className="min-w-0 border-b border-[#E6E1D6] py-4 sm:py-5 first:pt-1">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#57534E]">
          <span className="font-bold text-[#C83E2B]">{article.publisher}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
            article.kind === 'sns'
              ? 'bg-[#eef6fb] text-[#1d5a7a]'
              : article.kind === 'video'
                ? 'bg-[#fef3f0] text-[#9b3021]'
                : article.kind === 'interview'
                  ? 'bg-[#eef9f0] text-[#265c34]'
                  : 'bg-[#f4efe4] text-[#45413C]'
          }`}>{referenceKindLabel(article.kind)}</span>
          {article.date ? (
            <time dateTime={article.date}>{referenceDateLabel(article)}</time>
          ) : article.kind === 'sns' ? (
            <span>公式アカウント</span>
          ) : null}
        </div>
        {article.unavailable && <p className="mt-2 text-xs text-[#68625C]">以前の参照元に媒体名が残っている資料です（リンク先を開けないため媒体名を表示しています）。</p>}
        <a href={article.url} target="_blank" rel="noopener noreferrer"
          className="group mt-2 block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4">
          <h2 className="text-base sm:text-lg font-bold leading-relaxed text-[#1C1917] group-hover:text-[#C83E2B] [overflow-wrap:anywhere]">
            {article.title}<ExternalLink aria-hidden="true" className="ml-2 inline h-3.5 w-3.5 align-baseline text-[#68625C]" /><span className="sr-only">（新しいタブで開く）</span>
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[#68625C] group-hover:underline">
            {formatSourceDomain(article.url, article.publisher)}
          </p>
        </a>
        {article.note && <p className="mt-2 text-xs leading-relaxed text-[#68625C]">{article.note}</p>}
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
  const shownCount = Math.min(visibleCount, available.length);
  return (
    <div className="mt-5 space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="quiz-archive-search" className="sr-only">記事名・媒体・SNS・曲名・年で検索</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#68625C]" />
          <input
            ref={searchInputRef}
            id="quiz-archive-search"
            type="search"
            maxLength={60}
            value={query}
            onChange={event => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }}
            placeholder="記事名・媒体・SNS・ライブ・曲名・年で検索"
            className="min-h-11 w-full rounded-xl border border-[#D5CEC2] bg-white pl-9 pr-10 py-2 text-base text-[#1C1917] placeholder:text-[#68625C] focus:border-[#1C1917] focus:outline-none focus:ring-2 focus:ring-[#1C1917]/20 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              aria-label="記事検索をクリア"
              onClick={() => {
                setQuery('');
                setVisibleCount(PAGE_SIZE);
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-xl text-[#57534E] hover:text-[#1C1917] cursor-pointer"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="資料の種類で絞り込む">
          <button
            type="button"
            aria-pressed={kind === 'all'}
            onClick={() => { setKind('all'); setVisibleCount(PAGE_SIZE); }}
            className={`min-h-[32px] whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
              kind === 'all'
                ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                : 'border-[#dfd7c7] bg-white text-[#45413C] hover:border-[#253331]'
            }`}
          >
            すべて ({kindCounts.get('all') ?? 0})
          </button>
          {REFERENCE_KINDS.map(itemKind => {
            const active = kind === itemKind;
            return (
              <button
                key={itemKind}
                type="button"
                aria-pressed={active}
                onClick={() => { setKind(active ? 'all' : itemKind); setVisibleCount(PAGE_SIZE); }}
                className={`min-h-[32px] whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  active
                    ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                    : 'border-[#dfd7c7] bg-white text-[#45413C] hover:border-[#253331]'
                }`}
              >
                {referenceKindLabel(itemKind)} ({kindCounts.get(itemKind) ?? 0})
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-3">
          <div className="min-w-0">
            <label htmlFor="quiz-publisher-filter" className="mb-1 block text-xs font-bold text-[#57534E]">媒体</label>
            <select id="quiz-publisher-filter" value={publisher} onChange={event => { setPublisher(event.target.value); setVisibleCount(PAGE_SIZE); }}
              className="min-h-10 w-full min-w-0 rounded-lg border border-[#D5CEC2] bg-white px-2.5 sm:px-3 py-1.5 text-base text-[#1C1917] sm:text-sm">
              <option value="all">すべての媒体</option>
              {PUBLISHERS.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="reference-date-order" className="mb-1 block text-xs font-bold text-[#57534E]">日付順</label>
            <select id="reference-date-order" value={order} onChange={event => { setOrder(event.target.value as typeof order); setVisibleCount(PAGE_SIZE); }}
              className="min-h-10 w-full rounded-lg border border-[#D5CEC2] bg-white px-2.5 sm:px-3 py-1.5 text-base text-[#1C1917] sm:text-sm">
              <option value="newest">新しい順</option><option value="oldest">古い順</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p role="status" className="text-xs text-[#57534E]">{available.length}件の記事・SNS・映像資料</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[30px] rounded-full border border-[#dfd7c7] bg-white px-3 py-0.5 text-xs font-bold text-[#C83E2B] hover:border-[#C83E2B] cursor-pointer"
            >
              条件をリセット
            </button>
          )}
        </div>
      </div>

      {articles.length === 0 ? <div className="py-8 text-center">
        <p className="text-sm text-[#57534E]">条件に一致する参考資料が見つかりませんでした。</p>
        <button type="button" onClick={resetFilters} className="mt-3 min-h-11 px-4 py-2 text-sm font-bold underline underline-offset-4 cursor-pointer">検索条件をリセット</button>
      </div> : <>
        <div data-reference-list>{available.slice(0, shownCount).map(renderArticle)}</div>
        {available.length > shownCount && <button type="button" onClick={() => setVisibleCount(count => Math.min(available.length, count + PAGE_SIZE))}
          className="mx-auto block min-h-11 rounded-lg border border-[#D5CEC2] bg-white px-5 py-3 text-sm font-bold text-[#1C1917] hover:border-[#1C1917] cursor-pointer">
          さらに{Math.min(PAGE_SIZE, available.length - shownCount)}件を見る（残り{available.length - shownCount}件）
        </button>}
        {unavailable.length > 0 && <details className="border-b border-[#E6E1D6] text-[#57534E]">
          <summary className="min-h-11 py-3 text-sm cursor-pointer">リンク先を確認できない資料（{unavailable.length}件）</summary>
          <p className="mt-1 text-xs leading-relaxed">{REFERENCE_CHECKED_ON.replaceAll('-', '/')}の確認ではリンク先を開けませんでした。以前の参照先として残しています。</p>
          {unavailable.map(renderArticle)}
        </details>}
      </>}
      <p className="text-xs leading-relaxed text-[#68625C]">公開日・更新日・放送日・発売日などは、各掲載元で確認できた日付を表示しています。</p>
    </div>
  );
}
