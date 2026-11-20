import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, Disc, Pencil, Plus, RotateCcw } from 'lucide-react';
import type { SongItem } from '../../data/higedanData';
import {
  ERA_PREFERENCE_LABELS,
  isSoundMatch,
  LENGTH_PREFERENCE_LABELS,
  MOOD_CHOICE_LABELS,
  recommendSongsByMood,
  SITUATION_CHOICE_LABELS,
  SOUND_LABELS,
  SOUND_PREFERENCE_LABELS,
} from '../../utils/fanLogic';
import { MoodListen, officialVideoId } from './MoodListen';
import { moodResultCopy } from './moodResultCopy';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { saveSongReturnTab } from '../../utils/guideReturnState';
import type { CompleteMoodCriteria, MoodStep } from './moodSession';

export interface MoodLibraryProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  onRemoveFromSetlist?: (songId: string) => void;
  setlistSongIds: string[];
}

interface MoodResultsProps extends MoodLibraryProps {
  criteria: CompleteMoodCriteria;
  onEditAnswer: (step: MoodStep) => void;
  onRestart: () => void;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function MoodResults({
  songs, onAddToSetlist, onRemoveFromSetlist, setlistSongIds,
  criteria, onEditAnswer, onRestart, page = 0, onPageChange,
}: MoodResultsProps) {
  const [localPage, setLocalPage] = useState(page);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const recommendations = useMemo(() => recommendSongsByMood(songs, criteria), [songs, criteria]);
  const maxPage = Math.max(0, Math.ceil(recommendations.length / 3) - 1);
  const activePage = Math.min(Math.max(0, onPageChange ? page : localPage), maxPage);
  const matches = recommendations.slice(activePage * 3, activePage * 3 + 3);
  const [bestMatch, ...subMatches] = matches;
  const bestCopy = bestMatch ? moodResultCopy(bestMatch.song) : null;
  const recommendedSongId = bestMatch?.song.id;
  useEffect(() => {
    const heading = resultHeadingRef.current;
    heading?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [recommendedSongId]);
  const showNearMatchNotice = Boolean(bestMatch
    && (!bestMatch.song.moods.includes(criteria.mood) || !isSoundMatch(bestMatch.song, criteria.sound)));
  const answers: { step: MoodStep; name: string; value: string }[] = [
    { step: 1, name: '気分', value: MOOD_CHOICE_LABELS[criteria.mood] },
    { step: 2, name: '場面', value: SITUATION_CHOICE_LABELS[criteria.situation] },
    { step: 3, name: '音', value: SOUND_PREFERENCE_LABELS[criteria.sound] },
    { step: 4, name: '時期', value: ERA_PREFERENCE_LABELS[criteria.era] },
    { step: 5, name: '長さ', value: LENGTH_PREFERENCE_LABELS[criteria.length] },
  ];

  const changePage = (next: number) => {
    const clamped = Math.min(Math.max(0, next), maxPage);
    setLocalPage(clamped);
    onPageChange?.(clamped);
  };

  return (
    <div className="space-y-6">
      {recommendations.length === 0 && (
        <div className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7">
          <h2 ref={resultHeadingRef} tabIndex={-1} className="scroll-mt-28 text-base font-bold text-[#1C1917] focus:outline-none">ぴったりの曲が見つからなかったみたい。</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#57534E]">時期か曲の長さを変えて、もう一度探してみよう。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onEditAnswer(4)} className="rounded-lg border border-[#D5CEC2] px-3 py-2 text-sm font-bold hover:bg-[#F2EFE9]">時期を変える</button>
            <button type="button" onClick={() => onEditAnswer(5)} className="rounded-lg border border-[#D5CEC2] px-3 py-2 text-sm font-bold hover:bg-[#F2EFE9]">長さを変える</button>
          </div>
        </div>
      )}

      {/* First recommendation and listening link */}
      {bestMatch && bestCopy && (
        <article key={bestMatch.song.id} className="mood-result-enter rounded-2xl border border-[#D5CEC2] bg-white p-5 sm:p-7 shadow-[0_2px_16px_rgba(28,25,23,0.04)]">
          <p className="text-xs font-bold text-[#C83E2B]">今日のあなたへのおすすめ</p>
          <h2 ref={resultHeadingRef} tabIndex={-1} className="mt-2 scroll-mt-28 text-2xl sm:text-3xl font-bold text-[#1C1917] focus:outline-none">{bestMatch.song.title}</h2>
          <p className="mt-1 text-xs font-medium text-[#57534E]">{bestMatch.song.tieUp || bestMatch.song.englishSub}</p>

          <div className="mt-5 max-w-2xl space-y-4">
            {/* Video or artwork */}
            {!officialVideoId(bestMatch.song.id) && (
              <div className="rounded-xl border border-[#E6E1D6] bg-[#FFFDF8] p-4 shadow-xs">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[#F2EFE9] px-2.5 py-1 text-[11px] font-bold text-[#253331]">
                  <Disc className="h-3.5 w-3.5 shrink-0 text-[#A93020]" />
                  <span>{bestMatch.song.album}</span>
                </div>
                <div className="mt-2.5 text-base font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                  {bestMatch.song.title}
                </div>
                <div className="mt-1 text-[11px] font-mono-num text-[#57534E]">
                  {bestMatch.song.releaseDate} · {SOUND_LABELS[bestMatch.song.sound]}
                </div>
              </div>
            )}

            <MoodListen song={bestMatch.song} />
          </div>

          <div className="mt-5 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-6">
            {bestCopy.feature && <h3 className="text-base font-bold leading-relaxed text-[#1C1917]">{bestCopy.feature}</h3>}
            <p className="mt-2 text-sm leading-7 text-[#292524]">{bestCopy.introduction}</p>
            {bestCopy.invitation && <p className="mt-3 text-sm leading-7 text-[#57534E]">{bestCopy.invitation}</p>}
          </div>

          {showNearMatchNotice && (
            <p className="mt-4 rounded-xl bg-[#F2EFE9] px-4 py-3 text-sm leading-relaxed text-[#57534E]">
              {criteria.era !== 'any' || criteria.length !== 'any'
                ? '選んだ時期と長さに合う曲から探しました。気分や音のイメージは少し違うかもしれません。'
                : '選んだ気分や音に近い曲を探しました。少し違う雰囲気の曲も楽しんでみてください。'}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#E6E1D6] pt-4">
            <a
              href={`${import.meta.env.BASE_URL}${songPagePath(bestMatch.song.id) ?? ''}`}
              onClick={() => saveSongReturnTab('mood')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
              詳しい解説を読む
            </a>
            {(() => {
              const inBestSetlist = setlistSongIds.includes(bestMatch.song.id);
              return (
                <button
                  type="button"
                  aria-pressed={inBestSetlist}
                  aria-label={inBestSetlist ? `${bestMatch.song.title}はMYセトリ追加済み（もう一度押すと外す）` : `${bestMatch.song.title}をMYセトリに追加`}
                  onClick={() => (inBestSetlist ? onRemoveFromSetlist?.(bestMatch.song.id) : onAddToSetlist(bestMatch.song.id))}
                  disabled={inBestSetlist && !onRemoveFromSetlist}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    inBestSetlist
                      ? `bg-[#1C1917] text-white ${onRemoveFromSetlist ? 'cursor-pointer hover:bg-[#3A3531]' : ''}`
                      : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                  }`}
                >
                  {inBestSetlist ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      MYセトリ追加済み
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      MYセトリに追加
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        </article>
      )}

      {/* 2nd & 3rd Candidate Songs */}
      {subMatches.length > 0 && (
        <div>
          <h2 className="text-xs font-bold tracking-wide text-[#78716C] mb-3">
            こんな曲もおすすめ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subMatches.map(match => {
              const { song } = match;
              const inSetlist = setlistSongIds.includes(song.id);
              const copy = moodResultCopy(song);

              return (
                <article
                  key={song.id}
                  className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5"
                >
                  <div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                        {song.title}
                      </h3>
                    </div>

                    <p className="mt-3 pt-2.5 border-t border-[#E6E1D6] text-xs text-[#57534E] leading-relaxed">
                      {copy.feature || copy.introduction}
                    </p>
                    <div className="mt-4">
                      <MoodListen song={song} lazyFacade />
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-1.5 border-t border-[#E6E1D6] pt-3">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`${import.meta.env.BASE_URL}${songPagePath(song.id) ?? ''}`}
                        onClick={() => saveSongReturnTab('mood')}
                        className="inline-flex items-center gap-1 rounded-md border border-[#D5CEC2] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#1C1917] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0"
                      >
                        <BookOpen className="h-3 w-3 text-[#1E3A5F]" />
                        解説
                      </a>
                      <button
                        type="button"
                        aria-pressed={inSetlist}
                        aria-label={inSetlist ? `${song.title}は追加済み（もう一度押すと外す）` : `${song.title}をセトリへ追加`}
                        onClick={() => (inSetlist ? onRemoveFromSetlist?.(song.id) : onAddToSetlist(song.id))}
                        disabled={inSetlist && !onRemoveFromSetlist}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap shrink-0 ${
                          inSetlist
                            ? `bg-[#1C1917] text-white ${onRemoveFromSetlist ? 'cursor-pointer hover:bg-[#3A3531]' : ''}`
                            : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                        }`}
                      >
                        {inSetlist ? '追加済み' : '+ セトリへ'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FAF6EB] px-4 py-2.5 text-sm font-bold text-[#57534E] hover:border-[#1C1917] hover:bg-[#F2EFE9] hover:text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] transition-colors cursor-pointer"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          最初から診断する
        </button>
        {(activePage + 1) * 3 < recommendations.length && (
          <button
            type="button"
            onClick={() => changePage(activePage + 1)}
            className="min-h-11 rounded-lg border border-[#C83E2B]/55 bg-[#FFFDF8] px-4 py-2.5 text-sm font-bold text-[#A93020] hover:border-[#C83E2B] hover:bg-[#FDF6EE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] transition-colors cursor-pointer"
          >
            ほかの曲も見てみる
          </button>
        )}
      </div>

      <div className="space-y-4 border-t border-[#E6E1D6] pt-5">
        <details className="group rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] text-xs text-[#57534E]">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 font-bold text-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] [&::-webkit-details-marker]:hidden">
            条件を変えて探す
            <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-4">変えたい答えを選ぶと、その回答だけを変えられます。</p>
          <div className="flex flex-wrap gap-2 px-4 pb-4 pt-3">
            {answers.map(answer => (
              <button
                key={answer.step}
                type="button"
                onClick={() => onEditAnswer(answer.step)}
                aria-label={answer.name + '「' + answer.value + '」を変更'}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-2.5 py-1.5 text-left font-medium text-[#1C1917] hover:border-[#C83E2B] hover:text-[#A93020] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] transition-colors cursor-pointer"
              >
                <span className="text-[#78716C]">{answer.name}</span> {answer.value}
                <Pencil aria-hidden="true" className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
