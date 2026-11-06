import { GuideArtwork } from './GuideArtwork';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Plus,
  Check,
  Volume2,
  Square,
  Sparkles,
  Disc,
  BarChart3,
  ArrowLeft,
  RotateCcw,
  ChevronRight,
  Share2,
  Copy,
  X,
} from 'lucide-react';
import {
  MoodTag,
  SituationTag,
  SongItem,
  SoundTag,
} from '../data/higedanData';
import {
  formatDiagnosisShareText,
  formatDuration,
  isSafeAssetUrl,
  MOOD_LABELS,
  scoreSongsByMood,
  SITUATION_LABELS,
  SOUND_LABELS,
} from '../utils/fanLogic';
import { playSongTempoPreview, stopTempoPreview } from '../utils/audioPreview';

interface MoodFinderSectionProps {
  songs: SongItem[];
  onSelectSong: (song: SongItem) => void;
  onAddToSetlist: (songId: string) => void;
  setlistSongIds: string[];
}

type DiagnosisStep = 1 | 2 | 3 | 'result';

const MOOD_OPTIONS: { id: MoodTag; code: string; label: string; sub: string }[] = [
  { id: 'push_back', code: 'A', label: '背中を押してほしい', sub: '前を向く勇気と肯定感がほしいとき' },
  { id: 'heartbreak_night', code: 'B', label: '切ない夜に浸りたい', sub: '心に寄り添う優しい旋律を聴きたいとき' },
  { id: 'euphoric_drive', code: 'C', label: '最高に盛り上がりたい', sub: '高揚感あふれるグルーヴに飛び込みたいとき' },
  { id: 'deep_lyric', code: 'D', label: '深い歌詞を味わいたい', sub: '余韻の残る言葉と物語に浸りたいとき' },
];

const SITUATION_OPTIONS: { id: SituationTag; code: string; label: string; sub: string }[] = [
  { id: 'morning_commute', code: 'A', label: '朝の通勤・通学', sub: '1日のスタートを気持ちよく切りたい場面' },
  { id: 'late_night_alone', code: 'B', label: 'ひとり静かな夜', sub: '部屋の明かりを落としてじっくり聴く場面' },
  { id: 'live_warmup', code: 'C', label: 'ライブ前・ドライブ', sub: 'テンションを一気に引き上げたい場面' },
  { id: 'weekend_walk', code: 'D', label: '休日の散歩・カフェ', sub: '肩の力を抜いてリラックスしたい場面' },
];

const SOUND_OPTIONS: { id: SoundTag; code: string; label: string; sub: string }[] = [
  { id: 'piano_pop', code: 'A', label: '王道ピアノポップ', sub: '美しいピアノリフとグッドメロディ' },
  { id: 'brass_funk', code: 'B', label: 'ブラス＆ファンク', sub: '華やかなホーン隊と躍動するリズム' },
  { id: 'emotional_ballad', code: 'C', label: 'エモーショナルバラード', sub: '胸を締め付ける歌声と壮大なストリングス' },
  { id: 'stadium_rock', code: 'D', label: 'スタジアムロック', sub: '熱量あふれるバンドサウンドと転調の嵐' },
];

export const MoodFinderSection: React.FC<MoodFinderSectionProps> = ({
  songs,
  onSelectSong,
  onAddToSetlist,
  setlistSongIds,
}) => {
  const [step, setStep] = useState<DiagnosisStep>(1);
  const [selectedMood, setSelectedMood] = useState<MoodTag>('push_back');
  const [selectedSituation, setSelectedSituation] = useState<SituationTag>('morning_commute');
  const [selectedSound, setSelectedSound] = useState<SoundTag>('brass_funk');
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isShareCardOpen, setIsShareCardOpen] = useState<boolean>(false);
  const [shareCardRankIndex, setShareCardRankIndex] = useState<number>(0);
  const [shareCardTheme, setShareCardTheme] = useState<'dark' | 'editorial'>('dark');
  const [copiedShareText, setCopiedShareText] = useState<boolean>(false);
  const copyShareTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopTempoPreview();
      if (copyShareTimerRef.current !== null) {
        window.clearTimeout(copyShareTimerRef.current);
      }
    };
  }, []);

  const topMatches = useMemo(
    () =>
      scoreSongsByMood(songs, {
        mood: selectedMood,
        situation: selectedSituation,
        sound: selectedSound,
      }).slice(0, 3),
    [songs, selectedMood, selectedSituation, selectedSound]
  );

  const bestMatch = topMatches[0];
  const subMatches = topMatches.slice(1, 3);
  const activeShareMatch = topMatches[shareCardRankIndex] || bestMatch;

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

  const handleRestartDiagnosis = () => {
    stopTempoPreview();
    setPlayingSongId(null);
    setIsShareCardOpen(false);
    setShareCardRankIndex(0);
    setCopiedShareText(false);
    setStep(1);
  };

  const handleCopyShareCardText = async () => {
    if (!activeShareMatch) return;
    const text = formatDiagnosisShareText(activeShareMatch, {
      mood: selectedMood,
      situation: selectedSituation,
      sound: selectedSound,
    });
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt('以下の文章を選択してコピーしてください。', text);
      return;
    }
    setCopiedShareText(true);
    if (copyShareTimerRef.current !== null) {
      window.clearTimeout(copyShareTimerRef.current);
    }
    copyShareTimerRef.current = window.setTimeout(() => {
      setCopiedShareText(false);
      copyShareTimerRef.current = null;
    }, 2500);
  };

  return (
    <section
      id="section-mood"
      aria-labelledby="mood-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="mood-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              マイソング診断
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              3つの質問に順番に答えるだけで、今のあなたに最もマッチする1曲を診断します。
            </p>
          </div>

          {step === 'result' && (
            <button
              type="button"
              onClick={handleRestartDiagnosis}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              最初から診断し直す
            </button>
          )}
        </div>

        {/* Step-by-Step Question Screens (1 Question at a time for zero cognitive overload) */}
        {step !== 'result' ? (
          <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-8 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
            {/* Step Progress Header */}
            <div className="flex items-center justify-between gap-4 pb-5 mb-6 border-b border-[#E6E1D6]">
              <div className="flex items-center gap-2.5">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}
                    className="inline-flex items-center gap-1 rounded-md border border-[#D5CEC2] bg-[#FBF9F5] px-2.5 py-1 text-xs font-bold text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    戻る
                  </button>
                )}
                <span className="text-xs font-bold text-[#C83E2B] font-mono-num">
                  質問 {step} / 3
                </span>
              </div>

              <div className="flex items-center gap-1.5 w-32 sm:w-48" aria-hidden="true">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      idx <= step ? 'bg-[#C83E2B]' : 'bg-[#E6E1D6]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question 1: Mood */}
            {step === 1 && (
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#1C1917]">
                  Q1. 今のあなたの気分はどれに一番近いですか？
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
                  直感でひとつ選ぶと、次の質問へ進みます。
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {MOOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedMood(opt.id);
                        setStep(2);
                      }}
                      className="group flex items-center justify-between rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 pr-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] font-mono-num text-xs font-bold text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors">
                          {opt.code}
                        </span>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-[#1C1917]">
                            {opt.label}
                          </div>
                          <div className="mt-1 text-xs text-[#57534E]">
                            {opt.sub}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C] group-hover:translate-x-0.5 group-hover:text-[#1C1917] transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 2: Situation */}
            {step === 2 && (
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#1C1917]">
                  Q2. どんな場面・時間帯に聴きたいですか？
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
                  選んだシーンに合うテンポ感（BPM）の楽曲を絞り込みます。
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SITUATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSituation(opt.id);
                        setStep(3);
                      }}
                      className="group flex items-center justify-between rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 pr-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] font-mono-num text-xs font-bold text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors">
                          {opt.code}
                        </span>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-[#1C1917]">
                            {opt.label}
                          </div>
                          <div className="mt-1 text-xs text-[#57534E]">
                            {opt.sub}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C] group-hover:translate-x-0.5 group-hover:text-[#1C1917] transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Question 3: Sound */}
            {step === 3 && (
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#1C1917]">
                  Q3. 今一番聴きたいサウンド・曲調はどれですか？
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
                  選択すると、あなたへのマイソング診断結果が表示されます。
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {SOUND_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSound(opt.id);
                        setShareCardRankIndex(0);
                        setIsShareCardOpen(false);
                        setStep('result');
                      }}
                      className="group flex items-center justify-between rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 text-left hover:border-[#1C1917] hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 pr-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#F2EFE9] font-mono-num text-xs font-bold text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white transition-colors">
                          {opt.code}
                        </span>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-[#1C1917]">
                            {opt.label}
                          </div>
                          <div className="mt-1 text-xs text-[#57534E]">
                            {opt.sub}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C] group-hover:translate-x-0.5 group-hover:text-[#1C1917] transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Diagnosis Result Screen (Shown after answering Q1 -> Q2 -> Q3) */
          <div className="mt-6 space-y-6">
            {/* Selected Answers Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E1D6] bg-[#F2EFE9] px-4 py-3 text-xs text-[#57534E]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#1C1917]">診断条件：</span>
                <span className="font-medium text-[#1C1917]">
                  {MOOD_LABELS[selectedMood]}
                </span>
                <span aria-hidden="true" className="text-[#78716C]">
                  /
                </span>
                <span className="font-medium text-[#1C1917]">
                  {SITUATION_LABELS[selectedSituation]}
                </span>
                <span aria-hidden="true" className="text-[#78716C]">
                  /
                </span>
                <span className="font-medium text-[#1C1917]">
                  {SOUND_LABELS[selectedSound]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRestartDiagnosis}
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

                    {/* Visualized Match Breakdown Bars (Unified Editorial Palette) */}
                    <div className="rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-[#1C1917] border-b border-[#E6E1D6] pb-2">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-[#C83E2B]" />
                          編集部の選曲基準（基本60点＋気分18点・場面11点・曲調10点）
                        </span>
                        <span className="font-mono-num text-[#C83E2B]">
                          選曲スコア {bestMatch.matchScore}点
                        </span>
                      </div>

                      <div className="space-y-2.5 pt-0.5">
                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#1C1917]">
                            <span>今の気分とのシンクロ度</span>
                            <span className="font-mono-num font-bold text-[#C83E2B]">
                              {bestMatch.matchBreakdown.moodSyncPercent >= 90 ? '一致' : '対象外'}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
                            <div
                              className="h-full rounded-full bg-[#C83E2B]"
                              style={{ width: `${bestMatch.matchBreakdown.moodSyncPercent >= 90 ? '一致' : '対象外'}` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#1C1917]">
                            <span>シーン・時間帯の適合度</span>
                            <span className="font-mono-num font-bold text-[#1E3A5F]">
                              {bestMatch.matchBreakdown.sceneFitPercent >= 90 ? '一致' : '対象外'}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
                            <div
                              className="h-full rounded-full bg-[#1E3A5F]"
                              style={{ width: `${bestMatch.matchBreakdown.sceneFitPercent >= 90 ? '一致' : '対象外'}` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium text-[#1C1917]">
                            <span>サウンド・曲調の一致度</span>
                            <span className="font-mono-num font-bold text-[#1C1917]">
                              {bestMatch.matchBreakdown.soundMatchPercent === 99 ? '一致' : '対象外'}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E6E1D6]">
                            <div
                              className="h-full rounded-full bg-[#1C1917]"
                              style={{ width: `${bestMatch.matchBreakdown.soundMatchPercent === 99 ? '一致' : '対象外'}` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
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
                        {bestMatch.song.tieUp}
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
                          onClick={() => {
                            setShareCardRankIndex(0);
                            setIsShareCardOpen((prev) => !prev);
                          }}
                          aria-expanded={isShareCardOpen}
                          aria-controls="diagnosis-share-card-panel"
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
                            isShareCardOpen
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

                {/* DOM-Based SNS Share Card Generator Preview */}
                {isShareCardOpen && activeShareMatch && (
                  <div
                    id="diagnosis-share-card-panel"
                    role="region"
                    aria-label="SNSシェアカードプレビュー"
                    data-testid="diagnosis-sns-share-card"
                    className="mt-6 pt-6 border-t border-[#E6E1D6] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#1C1917]">
                          マイソング診断 SNS風シェアカード（既存のDOM要素のみで構築）
                        </h4>
                        <p className="text-xs text-[#57534E]">
                          おすすめ1位〜3位の楽曲切り替えや、カード背景テーマの切り替えにも対応しています。
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyShareCardText}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {copiedShareText ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#FDE68A]" />
                              <span>シェア文をコピーしました！</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>シェア文をコピー</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsShareCardOpen(false)}
                          aria-label="シェアカードを閉じる"
                          className="inline-flex items-center justify-center rounded-lg border border-[#D5CEC2] bg-white p-2 text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917] transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Controls: Switch Recommended Song (1st / 2nd / 3rd) & Theme (Dark / Editorial) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#78716C] mr-1">
                          カード表示曲：
                        </span>
                        {topMatches.map((m, idx) => (
                          <button
                            key={m.song.id}
                            type="button"
                            onClick={() => setShareCardRankIndex(idx)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                              shareCardRankIndex === idx
                                ? 'bg-[#C83E2B] text-white'
                                : 'border border-[#D5CEC2] bg-white text-[#1C1917] hover:bg-[#F2EFE9]'
                            }`}
                          >
                            {idx + 1}位：{m.song.title} ({m.matchScore}点)
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-[#78716C]">
                          配色：
                        </span>
                        <button
                          type="button"
                          onClick={() => setShareCardTheme('dark')}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                            shareCardTheme === 'dark'
                              ? 'bg-[#1C1917] text-white'
                              : 'border border-[#D5CEC2] bg-white text-[#57534E]'
                          }`}
                        >
                          ダーク仕様
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareCardTheme('editorial')}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                            shareCardTheme === 'editorial'
                              ? 'bg-[#1C1917] text-white'
                              : 'border border-[#D5CEC2] bg-white text-[#57534E]'
                          }`}
                        >
                          マガジン紙面仕様
                        </button>
                      </div>
                    </div>

                    {/* The Visual SNS Card Constructed Purely with Existing DOM & Assets */}
                    <div
                      className={`mx-auto max-w-2xl overflow-hidden rounded-2xl border shadow-lg transition-colors ${
                        shareCardTheme === 'dark'
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                          : 'border-[#1C1917] bg-[#FBF9F5] text-[#1C1917]'
                      }`}
                    >
                      {/* Card Top Strip */}
                      <div
                        className={`flex items-center justify-between gap-2 border-b px-5 py-3 text-xs ${
                          shareCardTheme === 'dark'
                            ? 'border-white/15 bg-black/30'
                            : 'border-[#E6E1D6] bg-[#F2EFE9]'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            shareCardTheme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
                          }`}
                        >
                          115万キロのファンノート · マイソング診断結果
                        </span>
                        <span
                          className={`font-mono-num font-bold ${
                            shareCardTheme === 'dark' ? 'text-white' : 'text-[#1C1917]'
                          }`}
                        >
                          選曲スコア {activeShareMatch.matchScore}点
                        </span>
                      </div>

                      {/* Card Body: Song Jacket Image + Song Title & Match Reason */}
                      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                        <div className="sm:col-span-5">
                          <div className="relative aspect-square w-full max-w-[220px] sm:max-w-none mx-auto overflow-hidden rounded-xl bg-black ring-1 ring-black/15 shadow-md">
                            {isSafeAssetUrl(activeShareMatch.song.jacketImage) && (
                              <GuideArtwork
                                src={activeShareMatch.song.jacketImage}
                                alt={`${activeShareMatch.song.title}  オリジナル図柄`}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-3">
                              <span className="block text-[10px] font-mono-num text-white/75">
                                {activeShareMatch.song.album} · {activeShareMatch.song.releaseDate}
                              </span>
                              <span className="block text-xs font-bold text-white min-w-0 wrap-anywhere whitespace-normal">
                                Official髭男dism
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-7 space-y-3">
                          <div>
                            <div
                              className={`text-[11px] font-bold ${
                                shareCardTheme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
                              }`}
                            >
                              今のあなたに響くおすすめの1曲（おすすめ第{shareCardRankIndex + 1}位）
                            </div>
                            <div
                              className={`mt-0.5 text-xl sm:text-2xl font-bold tracking-tight ${
                                shareCardTheme === 'dark' ? 'text-white' : 'text-[#1C1917]'
                              }`}
                            >
                              『{activeShareMatch.song.title}』
                            </div>
                            <div
                              className={`mt-1 text-[11px] ${
                                shareCardTheme === 'dark' ? 'text-white/70' : 'text-[#57534E]'
                              }`}
                            >
                              {MOOD_LABELS[selectedMood]} ／ {SITUATION_LABELS[selectedSituation]} ／{' '}
                              {SOUND_LABELS[selectedSound]}
                            </div>
                          </div>

                          <div
                            className={`rounded-xl border p-3.5 space-y-1.5 ${
                              shareCardTheme === 'dark'
                                ? 'border-white/15 bg-white/5'
                                : 'border-[#E6E1D6] bg-white'
                            }`}
                          >
                            <div
                              className={`text-[11px] font-bold ${
                                shareCardTheme === 'dark' ? 'text-[#F5D0C9]' : 'text-[#C83E2B]'
                              }`}
                            >
                              今の気分にマッチする理由
                            </div>
                            <p
                              className={`text-xs leading-relaxed ${
                                shareCardTheme === 'dark' ? 'text-white/95' : 'text-[#1C1917]'
                              }`}
                            >
                              {activeShareMatch.moodMatchExplanation}
                            </p>
                          </div>

                          <p
                            className={`font-editorial text-xs italic border-t pt-2.5 ${
                              shareCardTheme === 'dark'
                                ? 'text-white/80 border-white/15'
                                : 'text-[#57534E] border-[#E6E1D6]'
                            }`}
                          >
                            曲調：{activeShareMatch.song.musicalHighlight}
                          </p>
                        </div>
                      </div>

                      {/* Card Bottom Hashtag Strip */}
                      <div
                        className={`flex flex-wrap items-center justify-between gap-2 border-t px-5 py-2.5 text-[11px] ${
                          shareCardTheme === 'dark'
                            ? 'border-white/10 bg-black/25 text-white/65'
                            : 'border-[#E6E1D6] bg-[#F2EFE9] text-[#57534E]'
                        }`}
                      >
                        <span>#115万キロのファンノート #Official髭男dism #マイソング診断</span>
                        <span className="font-mono-num">
                          BPM {activeShareMatch.song.bpm} · 最高音{' '}
                          {activeShareMatch.song.vocalRange.highestChestNote}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
        )}
      </div>
    </section>
  );
};
