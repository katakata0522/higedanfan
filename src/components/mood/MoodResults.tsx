import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Check, ChevronDown, Disc, Pencil, Plus, RotateCcw, Share2 } from 'lucide-react';
import type { SongItem } from '../../data/higedanData';
import {
  ERA_PREFERENCE_LABELS,
  isSafeAssetUrl,
  isSoundMatch,
  LENGTH_PREFERENCE_LABELS,
  MOOD_CHOICE_LABELS,
  recommendSongsByMood,
  SITUATION_CHOICE_LABELS,
  SOUND_LABELS,
  SOUND_PREFERENCE_LABELS,
} from '../../utils/fanLogic';
import { GuideArtwork } from '../GuideArtwork';
import { MoodListen, officialVideoId } from './MoodListen';
import { MoodShareCard, type ShareTheme } from './MoodShareCard';
import { moodResultCopy } from './moodResultCopy';
import type { CompleteMoodCriteria, MoodStep } from './moodSession';

export interface MoodLibraryProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
}

interface MoodResultsProps extends MoodLibraryProps {
  criteria: CompleteMoodCriteria;
  onEditAnswer: (step: MoodStep) => void;
  onRestart: () => void;
  theme: ShareTheme;
  onSelectTheme: (theme: ShareTheme) => void;
}

export function MoodResults({
  songs, onSelectSong, onAddToSetlist, setlistSongIds,
  criteria, onEditAnswer, onRestart, theme, onSelectTheme,
}: MoodResultsProps) {
  const [shareRank, setShareRank] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);

  const recommendations = useMemo(() => recommendSongsByMood(songs, criteria), [songs, criteria]);
  const matches = recommendations.slice(page * 3, page * 3 + 3);
  const [bestMatch, ...subMatches] = matches;
  const bestCopy = bestMatch ? moodResultCopy(bestMatch.song) : null;
  const recommendedSongId = bestMatch?.song.id;
  useEffect(() => {
    const heading = resultHeadingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: 'start' });
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

  const handleOpenSongDetail = (song: SongItem) => {
    onSelectSong(song);
  };
  const changePage = (next: number) => {
    setShareRank(null);
    setPage(next);
  };

  return (
    <div className="space-y-6">
      {recommendations.length === 0 && (
        <div className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7">
          <h3 ref={resultHeadingRef} tabIndex={-1} className="scroll-mt-28 text-base font-bold text-[#1C1917] focus:outline-none">ぴったりの曲が見つからなかったみたい。</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#57534E]">時期か曲の長さを変えて、もう一度探してみよう。</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onEditAnswer(4)} className="rounded-lg border border-[#D5CEC2] px-3 py-2 text-sm font-bold hover:bg-[#F2EFE9]">時期を変える</button>
            <button type="button" onClick={() => onEditAnswer(5)} className="rounded-lg border border-[#D5CEC2] px-3 py-2 text-sm font-bold hover:bg-[#F2EFE9]">長さを変える</button>
          </div>
        </div>
      )}

      {/* First recommendation and listening link */}
      {bestMatch && bestCopy && (
        <article className="rounded-2xl border border-[#D5CEC2] bg-white p-5 sm:p-7 shadow-[0_2px_16px_rgba(28,25,23,0.04)]">
          <p className="text-xs font-bold text-[#C83E2B]">今日のあなたへのおすすめ</p>
          <h3 ref={resultHeadingRef} tabIndex={-1} className="mt-2 scroll-mt-28 text-2xl sm:text-3xl font-bold text-[#1C1917] focus:outline-none">{bestMatch.song.title}</h3>
          <p className="mt-1 text-xs font-medium text-[#57534E]">{bestMatch.song.tieUp || bestMatch.song.englishSub}</p>

          <div className="mt-5 max-w-2xl space-y-4">
            {/* Video or artwork */}
            {!officialVideoId(bestMatch.song.id) && <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#1C1917] ring-1 ring-black/10 shadow-md">
              {isSafeAssetUrl(bestMatch.song.jacketImage) && (
                <GuideArtwork
                  src={bestMatch.song.jacketImage}
                  alt={`${bestMatch.song.title}  オリジナル図柄`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                <Disc className="h-3.5 w-3.5 shrink-0 text-[#F5D0C9]" />
                <span>{bestMatch.song.album}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 text-white">
                <div className="text-[11px] font-mono-num text-white/80">
                  {bestMatch.song.releaseDate} · {SOUND_LABELS[bestMatch.song.sound]}
                </div>
                <div className="mt-0.5 text-base font-bold min-w-0 wrap-anywhere whitespace-normal">
                  {bestMatch.song.title}
                </div>
              </div>
            </div>}

            <MoodListen song={bestMatch.song} />
          </div>

          <div className="mt-5 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-6">
            {bestCopy.feature && <h4 className="text-base font-bold leading-relaxed text-[#1C1917]">{bestCopy.feature}</h4>}
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

          {/* Action Bar including Share Card Generator Button */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E1D6] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShareRank(rank => rank === null ? 0 : null)}
                aria-expanded={shareRank !== null}
                aria-controls="diagnosis-share-card-panel"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                  shareRank !== null
                    ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                    : 'border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
                }`}
              >
                <Share2 className="h-3.5 w-3.5 text-[#C83E2B]" />
                <span>シェアカード生成</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenSongDetail(bestMatch.song)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                詳しい解説を読む
              </button>
              <button
                type="button"
                onClick={() => onAddToSetlist(bestMatch.song.id)}
                disabled={setlistSongIds.includes(bestMatch.song.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  setlistSongIds.includes(bestMatch.song.id)
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                }`}
              >
                {setlistSongIds.includes(bestMatch.song.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    セトリ追加済
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    マイセトリに追加
                  </>
                )}
              </button>
            </div>
          </div>

          <MoodShareCard
            matches={matches}
            criteria={criteria}
            rankIndex={shareRank}
            onSelectRank={setShareRank}
            theme={theme}
            onSelectTheme={onSelectTheme}
          />
        </article>
      )}

      {/* 2nd & 3rd Candidate Songs */}
      {subMatches.length > 0 && (
        <div>
          <h4 className="text-xs font-bold tracking-wide text-[#78716C] mb-3">
            こんな曲もおすすめ
          </h4>
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
                    <div className="flex items-start gap-3.5">
                      {isSafeAssetUrl(song.jacketImage) && (
                        <GuideArtwork
                          src={song.jacketImage}
                          alt={`${song.title} オリジナル図柄`}
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h5 className="mt-0.5 text-base font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                          {song.title}
                        </h5>
                      </div>
                    </div>

                    <p className="mt-3 pt-2.5 border-t border-[#E6E1D6] text-xs text-[#57534E] leading-relaxed">
                      {copy.feature || copy.introduction}
                    </p>
                    <div className="mt-4">
                      <MoodListen song={song} />
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-1.5 border-t border-[#E6E1D6] pt-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenSongDetail(song)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#D5CEC2] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#1C1917] hover:bg-[#F2EFE9] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <BookOpen className="h-3 w-3 text-[#1E3A5F]" />
                        解説
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddToSetlist(song.id)}
                        disabled={inSetlist}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap shrink-0 ${
                          inSetlist
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-[#C83E2B] text-white hover:bg-[#A93020] cursor-pointer'
                        }`}
                      >
                        {inSetlist ? '追加済' : '+セトリ'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {(page > 0 || (page + 1) * 3 < recommendations.length) && (
        <div className="flex flex-wrap justify-center gap-3">
          {page > 0 && <button type="button" onClick={() => changePage(page - 1)} className="rounded-lg border border-[#D5CEC2] bg-white px-4 py-2.5 text-sm font-bold text-[#1C1917] hover:bg-[#F2EFE9]">前のおすすめに戻る</button>}
          {(page + 1) * 3 < recommendations.length && <button type="button" onClick={() => changePage(page + 1)} className="rounded-lg border border-[#C83E2B] bg-white px-4 py-2.5 text-sm font-bold text-[#A93020] hover:bg-[#FFF6F3]">ほかの曲も見てみる</button>}
        </div>
      )}

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
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B] transition-colors cursor-pointer"
        >
          <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
          もう一度診断する
        </button>
      </div>
    </div>
  );
}
