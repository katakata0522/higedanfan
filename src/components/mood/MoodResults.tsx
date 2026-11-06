import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Disc, Plus, Share2, Sparkles, Square, Volume2 } from 'lucide-react';
import type { SongItem } from '../../data/higedanData';
import { playSongTempoPreview, stopTempoPreview } from '../../utils/audioPreview';
import {
  formatDuration,
  isSafeAssetUrl,
  MOOD_LABELS,
  scoreSongsByMood,
  SITUATION_LABELS,
  SOUND_LABELS,
  type MoodCriteria,
} from '../../utils/fanLogic';
import { GuideArtwork } from '../GuideArtwork';
import { MoodMatchBreakdown } from './MoodMatchBreakdown';
import { MoodShareCard, type ShareTheme } from './MoodShareCard';

export interface MoodLibraryProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
}

interface MoodResultsProps extends MoodLibraryProps {
  criteria: MoodCriteria;
  onRestart: () => void;
  theme: ShareTheme;
  onSelectTheme: (theme: ShareTheme) => void;
}

export function MoodResults({
  songs, onSelectSong, onAddToSetlist, setlistSongIds,
  criteria, onRestart, theme, onSelectTheme,
}: MoodResultsProps) {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [shareRank, setShareRank] = useState<number | null>(null);
  useEffect(() => () => stopTempoPreview(), []);

  const matches = useMemo(() => scoreSongsByMood(songs, criteria).slice(0, 3), [songs, criteria]);
  const [bestMatch, ...subMatches] = matches;

  const handlePreviewTempo = (song: SongItem) => {
    if (playingSongId === song.id) {
      stopTempoPreview();
      setPlayingSongId(null);
    } else {
      setPlayingSongId(song.id);
      playSongTempoPreview(song.bpm, song.sound, () => {
        setPlayingSongId(null);
      });
    }
  };

  const handleOpenSongDetail = (song: SongItem) => {
    stopTempoPreview();
    setPlayingSongId(null);
    onSelectSong(song);
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Selected Answers Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] px-4 py-3 text-xs text-[#57534E]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#1C1917]">診断条件：</span>
          <span className="font-medium text-[#1C1917]">
            {MOOD_LABELS[criteria.mood]}
          </span>
          <span aria-hidden="true" className="text-[#78716C]">
            /
          </span>
          <span className="font-medium text-[#1C1917]">
            {SITUATION_LABELS[criteria.situation]}
          </span>
          <span aria-hidden="true" className="text-[#78716C]">
            /
          </span>
          <span className="font-medium text-[#1C1917]">
            {SOUND_LABELS[criteria.sound]}
          </span>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="text-xs font-bold text-[#C83E2B] hover:underline whitespace-nowrap cursor-pointer"
        >
          条件を選び直す
        </button>
      </div>

      {/* #1 Diagnosed Song Card with Large Jacket Artwork + Visualized Breakdown + 1-2 Sentence Reason */}
      {bestMatch && (
        <article className="rounded-2xl border border-[#D5CEC2] bg-white p-5 sm:p-7 shadow-[0_2px_16px_rgba(28,25,23,0.04)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Large Jacket Photo + Visualized Match Breakdown (5 cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#1C1917] ring-1 ring-black/10 shadow-md">
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
                <div className="absolute top-3 right-3 rounded-md bg-[#C83E2B] px-2.5 py-1 text-xs font-bold font-mono-num text-white shadow-xs">
                  選曲スコア {bestMatch.matchScore}点
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 text-white">
                  <div className="text-[11px] font-mono-num text-white/80">
                    {bestMatch.song.releaseDate} · {SOUND_LABELS[bestMatch.song.sound]}
                  </div>
                  <div className="mt-0.5 text-base font-bold min-w-0 wrap-anywhere whitespace-normal">
                    {bestMatch.song.title}
                  </div>
                </div>
              </div>

              <MoodMatchBreakdown match={bestMatch} />
            </div>

            {/* Right: Song Title, 1-2 Sentence Mood Match Reason & Actions (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#78716C]">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#C83E2B]">
                    <Sparkles className="h-3.5 w-3.5" />
                    あなたへのベストマッチ楽曲
                  </span>
                  <span className="font-mono-num">
                    {formatDuration(bestMatch.song.durationSec)} · BPM {bestMatch.song.bpm}
                  </span>
                </div>

                <h3 className="mt-2 text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  {bestMatch.song.title}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#57534E]">
                  {bestMatch.song.tieUp || bestMatch.song.englishSub}
                </p>

                {/* 1-2 Sentence Mood Match Reason */}
                <div className="mt-4 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 space-y-2.5">
                  <div className="text-xs font-bold text-[#C83E2B]">
                    今の気分にマッチする理由
                  </div>
                  <p className="text-xs sm:text-sm text-[#1C1917] leading-relaxed font-medium">
                    {bestMatch.moodMatchExplanation}
                  </p>
                  <p className="text-xs text-[#57534E] leading-relaxed pt-2 border-t border-[#E6E1D6]">
                    <strong className="text-[#1C1917]">サウンドの特徴：</strong>
                    {bestMatch.soundAnalysisReason}
                  </p>
                </div>

                {/* Iconic Lyric Quote */}
                <p className="mt-4 font-editorial text-xs sm:text-sm italic text-[#1C1917] border-y border-[#E6E1D6] py-3 px-2">
                  曲調：{bestMatch.song.musicalHighlight}
                </p>
              </div>

              {/* Action Bar including Share Card Generator Button */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E1D6] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewTempo(bestMatch.song)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                      playingSongId === bestMatch.song.id
                        ? 'border-[#C83E2B] bg-[#FDF3F1] text-[#C83E2B]'
                        : 'border-[#D5CEC2] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    {playingSongId === bestMatch.song.id ? (
                      <>
                        <Square className="h-3.5 w-3.5 fill-current" />
                        停止 (BPM {bestMatch.song.bpm})
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5 text-[#C83E2B]" />
                        テンポ試聴 (BPM {bestMatch.song.bpm})
                      </>
                    )}
                  </button>

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
            あわせて聴きたいおすすめ候補曲（2位・3位）
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subMatches.map((match, idx) => {
              const { song, matchScore, moodMatchExplanation } = match;
              const inSetlist = setlistSongIds.includes(song.id);
              const isPlaying = playingSongId === song.id;

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
                        <div className="flex items-center justify-between gap-1 text-xs text-[#78716C]">
                          <span className="font-bold text-[#1E3A5F] font-mono-num">
                            候補 {idx + 2}位 · 選曲スコア {matchScore}点
                          </span>
                          <span className="font-mono-num">BPM {song.bpm}</span>
                        </div>
                        <h5 className="mt-0.5 text-base font-bold text-[#1C1917] min-w-0 wrap-anywhere whitespace-normal">
                          {song.title}
                        </h5>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
                          <div
                            className="h-full rounded-full bg-[#1E3A5F]"
                            style={{ width: `${matchScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 pt-2.5 border-t border-[#E6E1D6] text-xs text-[#57534E] leading-relaxed">
                      {moodMatchExplanation}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-1.5 border-t border-[#E6E1D6] pt-3">
                    <button
                      type="button"
                      onClick={() => handlePreviewTempo(song)}
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                        isPlaying
                          ? 'border-[#C83E2B] bg-[#FDF3F1] text-[#C83E2B]'
                          : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#57534E] hover:text-[#1C1917]'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          停止
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3 text-[#C83E2B]" />
                          試聴
                        </>
                      )}
                    </button>

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
    </div>
  );
}
