import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Newspaper,
  HelpCircle,
  Search,
  Share2,
  Copy,
  Check,
  X,
  ListOrdered,
} from 'lucide-react';
import { QUIZ_QUESTIONS, QuizQuestion, SongItem } from '../data/higedanData';
import {
  calculateQuizResult,
  formatOrderingSequence,
  isOrderingAnswerCorrect,
} from '../utils/fanLogic';

interface QuizSectionProps {
  bestScorePercentage: number;
  onUpdateBestScore: (percentage: number) => void;
  songs?: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  initialTab?: 'quiz' | 'archive';
}

type QuestionScopeFilter = 'full' | 'new_variation' | 'ordering_only' | 'classic';

const QUIZ_COURSES: {
  id: 'all' | QuizQuestion['difficulty'];
  indexCode: string;
  title: string;
  desc: string;
  badge: string;
}[] = [
  {
    id: 'all',
    indexCode: '01',
    title: '総合チャレンジコース（全60問）',
    desc: '初級20問・中級20問・上級20問の全60問を一挙に出題。4択問題に加え、リリース順・収録順・年齢順の「並び替え問題」や、五十音順・演奏時間・歌詞文字種・メンバー好物まで完全網羅します。',
    badge: '完全制覇・全60問',
  },
  {
    id: 'beginner',
    indexCode: '02',
    title: '初級：代表曲・並び替え・50音＆好物編（全20問）',
    desc: '『Pretender』『Subtitle』『ミックスナッツ』等の名曲解説に加え、アルバム発売順の並び替え、五十音順の先頭曲、最長曲、小笹大輔の大好物「麻婆豆腐」など楽しく学べる20問。',
    badge: '初級コース・全20問',
  },
  {
    id: 'intermediate',
    indexCode: '03',
    title: '中級：転調・変拍子・最短曲・資格＆聖地編（全20問）',
    desc: '『Cry Baby』11回転調、『Same Blue』変拍子、インディーズ作品の発売順並び替え、演奏時間の短い順並び替え、五十音順の末尾曲、メンバーの段位・サウナ資格など20問。',
    badge: '中級コース・全20問',
  },
  {
    id: 'brothers',
    indexCode: '04',
    title: '上級：メンバー作曲・『エルダーフラワー』歌詞検証・深層編（全20問）',
    desc: 'メンバー4人の生年月日順・『Rejoice』収録曲順の並び替え、カタカナ語・英語ゼロで綴られた『エルダーフラワー』の歌詞検証、吹奏楽部・教員免許ルーツまで極める20問。',
    badge: '上級コース・全20問',
  },
];

const DIFFICULTY_LABEL: Record<QuizQuestion['difficulty'], string> = {
  beginner: '初級（代表曲・基本データ）',
  intermediate: '中級（楽曲構造・記録分析）',
  brothers: '上級（深層トリビア・歌詞検証）',
};

type PublisherFilter = 'all' | 'natalie' | 'realsound' | 'official' | 'sitedb' | 'other';

const NEW_VARIATION_IDS = new Set(
  Array.from({ length: 30 }, (_, i) => `q${i + 31}`)
);

export const QuizSection: React.FC<QuizSectionProps> = ({
  bestScorePercentage,
  onUpdateBestScore,
  songs = [],
  onSelectSong,
  initialTab = 'quiz',
}) => {
  const [viewTab, setViewTab] = useState<'quiz' | 'archive'>(initialTab);
  const [archiveDifficulty, setArchiveDifficulty] = useState<
    'all' | QuizQuestion['difficulty']
  >('all');
  const [publisherFilter, setPublisherFilter] = useState<PublisherFilter>('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');

  const [quizStage, setQuizStage] = useState<'select' | 'playing' | 'finished'>('select');
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | QuizQuestion['difficulty']
  >('all');
  const [scopeFilter, setScopeFilter] = useState<QuestionScopeFilter>('full');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number[]>([]);
  const [isOrderingSubmitted, setIsOrderingSubmitted] = useState(false);

  const [score, setScore] = useState(0);
  const [isCertShareOpen, setIsCertShareOpen] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setViewTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const activeQuestions = useMemo(() => {
    const byDiff =
      difficultyFilter === 'all'
        ? QUIZ_QUESTIONS
        : QUIZ_QUESTIONS.filter((q) => q.difficulty === difficultyFilter);

    if (scopeFilter === 'new_variation') {
      return byDiff.filter((q) => NEW_VARIATION_IDS.has(q.id));
    }
    if (scopeFilter === 'ordering_only') {
      return byDiff.filter((q) => q.questionType === 'ordering');
    }
    if (scopeFilter === 'classic') {
      return byDiff.filter((q) => !NEW_VARIATION_IDS.has(q.id));
    }
    return byDiff;
  }, [difficultyFilter, scopeFilter]);

  const archiveQuestions = useMemo(() => {
    const qLower = archiveSearchQuery.trim().toLowerCase();
    return QUIZ_QUESTIONS.filter((q) => {
      if (archiveDifficulty !== 'all' && q.difficulty !== archiveDifficulty) {
        return false;
      }
      if (publisherFilter !== 'all') {
        const hasMatchingPublisher = q.sources.some((src) => {
          const pub = src.publisher.toLowerCase();
          if (publisherFilter === 'natalie') return pub.includes('ナタリー');
          if (publisherFilter === 'realsound')
            return pub.includes('real sound') || pub.includes('リアルサウンド');
          if (publisherFilter === 'official') return pub.includes('公式');
          if (publisherFilter === 'sitedb')
            return (
              pub.includes('115万キロのファンノート') ||
              pub.includes('wikipedia') ||
              pub.includes('歌ネット')
            );
          return (
            !pub.includes('ナタリー') &&
            !pub.includes('real sound') &&
            !pub.includes('リアルサウンド') &&
            !pub.includes('公式') &&
            !pub.includes('115万キロのファンノート')
          );
        });
        if (!hasMatchingPublisher) return false;
      }
      if (!qLower) return true;
      const inPrompt = q.prompt.toLowerCase().includes(qLower);
      const inExplanation = q.explanation.toLowerCase().includes(qLower);
      const inCategory = q.category.toLowerCase().includes(qLower);
      const inOptions = q.options.some((opt) => opt.toLowerCase().includes(qLower));
      const inSources = q.sources.some(
        (s) =>
          s.title.toLowerCase().includes(qLower) ||
          s.publisher.toLowerCase().includes(qLower) ||
          s.summary.toLowerCase().includes(qLower)
      );
      return inPrompt || inExplanation || inCategory || inOptions || inSources;
    });
  }, [archiveDifficulty, publisherFilter, archiveSearchQuery]);

  const currentQuestion = activeQuestions[currentIndex] || activeQuestions[0];
  const isOrderingQuestion = currentQuestion?.questionType === 'ordering';
  const isQuestionAnswered = isOrderingQuestion
    ? isOrderingSubmitted
    : selectedOption !== null;

  const relatedSong = useMemo(
    () =>
      currentQuestion?.relatedSongId
        ? songs.find((s) => s.id === currentQuestion.relatedSongId) || null
        : null,
    [currentQuestion, songs]
  );

  const resetQuestionInteraction = () => {
    setSelectedOption(null);
    setSelectedOrder([]);
    setIsOrderingSubmitted(false);
  };

  const handleStartCourse = (
    mode: 'all' | QuizQuestion['difficulty'],
    customScope?: QuestionScopeFilter
  ) => {
    setDifficultyFilter(mode);
    if (customScope) {
      setScopeFilter(customScope);
    }
    setCurrentIndex(0);
    resetQuestionInteraction();
    setScore(0);
    setIsCertShareOpen(false);
    setQuizStage('playing');
    setViewTab('quiz');
  };

  const handleAnswerSingleChoice = (optionIdx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(optionIdx);
    if (optionIdx === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleToggleOrderOption = (optionIdx: number) => {
    if (isOrderingSubmitted || !currentQuestion) return;
    setSelectedOrder((prev) => {
      if (prev.includes(optionIdx)) {
        return prev.filter((item) => item !== optionIdx);
      }
      if (prev.length >= currentQuestion.options.length) {
        return prev;
      }
      return [...prev, optionIdx];
    });
  };

  const handleResetOrdering = () => {
    if (isOrderingSubmitted) return;
    setSelectedOrder([]);
  };

  const handleSubmitOrdering = () => {
    if (
      isOrderingSubmitted ||
      !currentQuestion ||
      !currentQuestion.correctOrder ||
      selectedOrder.length !== currentQuestion.options.length
    ) {
      return;
    }
    setIsOrderingSubmitted(true);
    if (isOrderingAnswerCorrect(selectedOrder, currentQuestion.correctOrder)) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionInteraction();
    } else {
      setQuizStage('finished');
      const result = calculateQuizResult(score, activeQuestions);
      onUpdateBestScore(result.percentage);
    }
  };

  const handleBackToSelect = () => {
    setQuizStage('select');
    setCurrentIndex(0);
    resetQuestionInteraction();
    setScore(0);
    setIsCertShareOpen(false);
  };

  const quizSummary = useMemo(
    () => calculateQuizResult(score, activeQuestions),
    [score, activeQuestions]
  );

  const activeCourseLabel = useMemo(() => {
    const found = QUIZ_COURSES.find((c) => c.id === difficultyFilter);
    const baseTitle = found ? found.title : '総合チャレンジコース（全60問）';
    if (scopeFilter === 'new_variation') return `${baseTitle}［追加バリエーション編］`;
    if (scopeFilter === 'ordering_only') return `${baseTitle}［並び替え特訓モード］`;
    if (scopeFilter === 'classic') return `${baseTitle}［王道・基本編］`;
    return baseTitle;
  }, [difficultyFilter, scopeFilter]);

  const handleCopyCertShareText = () => {
    const shareText = `【ヒゲダン検定クイズ（全60問）】\n挑戦コース：${activeCourseLabel}\n認定ランク：${quizSummary.rankTitle}（${quizSummary.rankBadgeCode}）\n正解数：${quizSummary.score} / ${quizSummary.total} 問（正答率 ${quizSummary.percentage}%）\n#115万キロのファンノート #Official髭男dism #ヒゲダン検定`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => {});
    }
    setCopiedCert(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => {
      setCopiedCert(false);
      copyTimerRef.current = null;
    }, 2500);
  };

  const isCurrentQuestionCorrect = useMemo(() => {
    if (!currentQuestion || !isQuestionAnswered) return false;
    if (isOrderingQuestion && currentQuestion.correctOrder) {
      return isOrderingAnswerCorrect(selectedOrder, currentQuestion.correctOrder);
    }
    return selectedOption === currentQuestion.correctIndex;
  }, [
    currentQuestion,
    isQuestionAnswered,
    isOrderingQuestion,
    selectedOrder,
    selectedOption,
  ]);

  return (
    <section
      id="section-quiz"
      aria-labelledby="quiz-heading"
      className="py-6 sm:py-8"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Clean Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E6E1D6]">
          <div>
            <h2
              id="quiz-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]"
            >
              並び替え＆データ検証で深掘りする「ヒゲダン検定クイズ（全60問）」
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#57534E]">
              初級20問・中級20問・上級20問の全60問！CDリリース順や演奏時間順の「1〜4番目並び替え問題」、五十音順の最初と最後、『エルダーフラワー』の歌詞文字種、メンバーの好物まで出典付きで完全網羅。
            </p>
          </div>

          {viewTab === 'quiz' && quizStage !== 'select' && (
            <button
              type="button"
              onClick={handleBackToSelect}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              コース選択へ戻る
            </button>
          )}
        </div>

        {/* Sub-navigation Tabs: Quiz Mode vs Source Archive Mode */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="クイズと出典記事図鑑の切り替え"
            className="inline-flex rounded-xl border border-[#D5CEC2] bg-[#F2EFE9] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'quiz'}
              onClick={() => setViewTab('quiz')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                viewTab === 'quiz'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              クイズに挑戦する（各20問・全60問）
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'archive'}
              onClick={() => setViewTab('archive')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                viewTab === 'archive'
                  ? 'bg-[#1C1917] text-[#FBF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Newspaper className="h-4 w-4" />
              全60問の出典＆トリビア図鑑（120資料）
            </button>
          </div>

          <span className="text-xs font-mono-num text-[#78716C]">
            自己ベスト正答率: <strong className="text-[#1C1917]">{bestScorePercentage}%</strong>
          </span>
        </div>

        {/* TAB 1: QUIZ INTERACTIVE FLOW */}
        {viewTab === 'quiz' && (
          <>
            {/* Stage 1: Course Selection Screen */}
            {quizStage === 'select' && (
              <div className="mt-6 space-y-5">
                {/* Question Scope Selector */}
                <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#1C1917]">
                        1. 出題範囲・バリエーションモードを選択
                      </h3>
                      <p className="text-xs text-[#57534E]">
                        全20問フル出題のほか、今回追加された「並び替え・50音・時間・歌詞表記・好物（各10問）」や「並び替え問題のみ」に絞って挑戦することもできます。
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {(
                      [
                        {
                          id: 'full',
                          title: '全問フル出題',
                          sub: '各コース20問（総合60問）',
                        },
                        {
                          id: 'new_variation',
                          title: '新設バリエーション編',
                          sub: '並び替え・50音・表記・好物（各10問）',
                        },
                        {
                          id: 'ordering_only',
                          title: '並び替え問題のみ特訓',
                          sub: '1番目〜4番目選択式（全6問）',
                        },
                        {
                          id: 'classic',
                          title: '王道・基本編のみ',
                          sub: '代表曲・バンド史（各10問）',
                        },
                      ] as { id: QuestionScopeFilter; title: string; sub: string }[]
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setScopeFilter(mode.id)}
                        className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                          scopeFilter === mode.id
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                            : 'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.title}</div>
                        <div
                          className={`mt-0.5 text-[11px] ${
                            scopeFilter === mode.id ? 'text-[#F5D0C9]' : 'text-[#78716C]'
                          }`}
                        >
                          {mode.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Course Cards */}
                <div>
                  <h3 className="mb-3 text-sm sm:text-base font-bold text-[#1C1917]">
                    2. 挑戦する難易度コースを選択してスタート
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {QUIZ_COURSES.map((course) => {
                      const countInScope = (() => {
                        const base =
                          course.id === 'all'
                            ? QUIZ_QUESTIONS
                            : QUIZ_QUESTIONS.filter((q) => q.difficulty === course.id);
                        if (scopeFilter === 'new_variation')
                          return base.filter((q) => NEW_VARIATION_IDS.has(q.id)).length;
                        if (scopeFilter === 'ordering_only')
                          return base.filter((q) => q.questionType === 'ordering').length;
                        if (scopeFilter === 'classic')
                          return base.filter((q) => !NEW_VARIATION_IDS.has(q.id)).length;
                        return base.length;
                      })();

                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleStartCourse(course.id)}
                          className="group flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 text-left hover:border-[#1C1917] transition-all cursor-pointer"
                        >
                          <div>
                            <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                              <div className="flex items-baseline gap-2.5">
                                <span className="font-editorial font-mono-num text-xl font-bold text-[#C83E2B]">
                                  {course.indexCode}.
                                </span>
                                <span className="text-xs font-bold text-[#78716C]">
                                  出題数：全{countInScope}問
                                </span>
                              </div>
                              <span className="text-xs font-bold text-[#1C1917] group-hover:text-[#C83E2B] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-1">
                                挑戦する
                                <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                            <h4 className="mt-3.5 text-base sm:text-lg font-bold text-[#1C1917]">
                              {course.title}
                            </h4>
                            <p className="mt-1.5 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                              {course.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Stage 2: Question-by-Question Screen */}
            {quizStage === 'playing' && currentQuestion && (
              <div className="mt-6 rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)]">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#78716C] border-b border-[#E6E1D6] pb-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[#1C1917]">
                      第 {currentIndex + 1} 問 / 全 {activeQuestions.length} 問 ·{' '}
                      {DIFFICULTY_LABEL[currentQuestion.difficulty]} · テーマ：
                      {currentQuestion.category}
                    </span>
                    {isOrderingQuestion && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                        <ListOrdered className="h-3 w-3" />
                        1番目〜4番目 並び替え問題
                      </span>
                    )}
                  </div>
                  <span className="font-mono-num">現在 {score} 問正解</span>
                </div>

                <h3 className="mt-4 text-base sm:text-xl font-bold text-[#1C1917] leading-relaxed">
                  Q{currentIndex + 1}. {currentQuestion.prompt}
                </h3>

                <p className="mt-2 text-xs text-[#78716C]">
                  ヒント: {currentQuestion.hint}
                </p>

                {/* ============================================================
                    INTERACTIVE TAP-TO-ORDER SEQUENCE QUIZ UI
                    ============================================================ */}
                {isOrderingQuestion ? (
                  <div className="mt-5 space-y-4">
                    {/* Live 1st -> 4th Sequence Slot Bar & Reset Button */}
                    <div className="rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-3.5 sm:p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#1C1917]">
                          下の4つの選択肢を「1番目 → 2番目 → 3番目 → 4番目」の順番に押してください
                        </span>
                        {!isOrderingSubmitted && (
                          <button
                            type="button"
                            onClick={handleResetOrdering}
                            disabled={selectedOrder.length === 0}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#D5CEC2] bg-white px-2.5 py-1 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] disabled:opacity-40 cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            選択順をリセット
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((slotPos) => {
                          const chosenOptionIdx = selectedOrder[slotPos];
                          const chosenLabel =
                            chosenOptionIdx !== undefined
                              ? currentQuestion.options[chosenOptionIdx]
                              : '未選択';
                          return (
                            <div
                              key={`slot-${slotPos}`}
                              className={`rounded-lg border px-3 py-2 text-xs ${
                                chosenOptionIdx !== undefined
                                  ? 'border-[#1C1917] bg-white text-[#1C1917] font-bold'
                                  : 'border-dashed border-[#D5CEC2] bg-[#F2EFE9]/60 text-[#78716C]'
                              }`}
                            >
                              <div className="text-[10px] font-mono-num font-bold text-[#C83E2B]">
                                {slotPos + 1}番目
                              </div>
                              <div className="mt-0.5 truncate">{chosenLabel}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4 Selectable Option Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentQuestion.options.map((opt, idx) => {
                        const orderPos = selectedOrder.indexOf(idx);
                        const isSelected = orderPos !== -1;
                        const correctPos = currentQuestion.correctOrder
                          ? currentQuestion.correctOrder.indexOf(idx)
                          : -1;

                        let btnStyle =
                          'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white cursor-pointer';
                        if (!isOrderingSubmitted && isSelected) {
                          btnStyle =
                            'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] cursor-pointer';
                        } else if (isOrderingSubmitted) {
                          if (orderPos === correctPos) {
                            btnStyle = 'border-[#15803D] bg-[#F0FDF4] text-[#14532D]';
                          } else {
                            btnStyle = 'border-[#C83E2B] bg-[#FDF3F1] text-[#7F1D1D]';
                          }
                        }

                        return (
                          <button
                            key={opt}
                            type="button"
                            disabled={isOrderingSubmitted}
                            onClick={() => handleToggleOrderOption(idx)}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4 text-left text-sm font-bold transition-colors ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSelected && (
                                <span
                                  className={`rounded-md px-2.5 py-1 text-xs font-mono-num font-bold ${
                                    isOrderingSubmitted
                                      ? orderPos === correctPos
                                        ? 'bg-[#15803D] text-white'
                                      : 'bg-[#C83E2B] text-white'
                                      : 'bg-[#C83E2B] text-white'
                                  }`}
                                >
                                  {orderPos + 1}番目
                                </span>
                              )}
                              {isOrderingSubmitted && (
                                <span className="text-xs font-mono-num text-[#57534E]">
                                  (正解: {correctPos + 1}番目)
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Confirm Order Button */}
                    {!isOrderingSubmitted && (
                      <div className="flex items-center justify-end gap-3 pt-1">
                        <span className="text-xs text-[#78716C]">
                          {selectedOrder.length < 4
                            ? `あと ${4 - selectedOrder.length} 個選択してください`
                            : '1番目〜4番目まで選択完了！'}
                        </span>
                        <button
                          type="button"
                          disabled={selectedOrder.length !== 4}
                          onClick={handleSubmitOrdering}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C83E2B] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                          この順番で回答する
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ============================================================
                     STANDARD 4-OPTION SINGLE CHOICE UI
                     ============================================================ */
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, idx) => {
                      const isAnswered = selectedOption !== null;
                      const isChosen = selectedOption === idx;
                      const isCorrect = currentQuestion.correctIndex === idx;

                      let btnStyle =
                        'border-[#E6E1D6] bg-[#FBF9F5] text-[#1C1917] hover:border-[#1C1917] hover:bg-white cursor-pointer';
                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'border-[#15803D] bg-[#F0FDF4] text-[#14532D]';
                        } else if (isChosen && !isCorrect) {
                          btnStyle = 'border-[#C83E2B] bg-[#FDF3F1] text-[#7F1D1D]';
                        } else {
                          btnStyle = 'border-[#E6E1D6] bg-white text-[#78716C] opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleAnswerSingleChoice(idx)}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 sm:p-4 text-left text-sm font-bold transition-colors ${btnStyle}`}
                        >
                          <span>
                            {idx + 1}. {opt}
                          </span>
                          {isAnswered && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#15803D]" />
                          )}
                          {isAnswered && isChosen && !isCorrect && (
                            <XCircle className="h-5 w-5 shrink-0 text-[#C83E2B]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation, Sources & Next Button */}
                {isQuestionAnswered && (
                  <div className="mt-5 rounded-xl border border-[#E6E1D6] bg-[#FBF9F5] p-4 sm:p-5 space-y-4">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#1C1917]">
                        {isCurrentQuestionCorrect
                          ? '正解です！さすがの知識量！'
                          : '惜しい！解説と出典記事をチェックしてみましょう'}
                      </div>

                      {isOrderingQuestion && currentQuestion.correctOrder && (
                        <div className="mt-2 rounded-lg border border-[#E6E1D6] bg-white p-3 text-xs space-y-1">
                          <div className="text-[#57534E]">
                            <strong className="text-[#1C1917]">あなたの選択順：</strong>{' '}
                            {formatOrderingSequence(currentQuestion.options, selectedOrder)}
                          </div>
                          <div className="text-[#15803D] font-bold">
                            <strong>正しい順番：</strong>{' '}
                            {formatOrderingSequence(
                              currentQuestion.options,
                              currentQuestion.correctOrder
                            )}
                          </div>
                        </div>
                      )}

                      <p className="mt-2 text-xs sm:text-sm text-[#57534E] leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>

                    {/* Verified Source Articles Box */}
                    {currentQuestion.sources && currentQuestion.sources.length > 0 && (
                      <div className="rounded-xl border border-[#E6E1D6] bg-white p-3.5 sm:p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A5F]">
                          <Newspaper className="h-3.5 w-3.5 shrink-0" />
                          <span>出典・関連インタビュー記事＆サイト内検証データ</span>
                        </div>
                        <div className="mt-2.5 grid grid-cols-1 gap-2.5">
                          {currentQuestion.sources.map((src, sIdx) => (
                            <div
                              key={`${currentQuestion.id}-src-${sIdx}`}
                              className="rounded-lg border border-[#F0ECE1] bg-[#FBF9F5] p-3 text-left"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[#C83E2B]">
                                  {src.publisher} · {src.publishedNote}
                                </span>
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E3A5F] hover:underline"
                                >
                                  記事・公式情報を開く
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                              <div className="mt-1 text-xs sm:text-sm font-bold text-[#1C1917]">
                                {src.title}
                              </div>
                              <p className="mt-1 text-xs text-[#57534E] leading-relaxed">
                                {src.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      {relatedSong && onSelectSong ? (
                        <button
                          type="button"
                          onClick={() => onSelectSong(relatedSong)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-[#1E3A5F]" />
                          『{relatedSong.title}』の楽曲解説を読む
                        </button>
                      ) : (
                        <span />
                      )}

                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-5 py-2.5 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        {currentIndex + 1 < activeQuestions.length
                          ? '次の問題へ進む'
                          : '検定結果を見る'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage 3: Final Result Certificate + SNS Share Card Generator */}
            {quizStage === 'finished' && (
              <div className="mt-6 rounded-2xl border border-[#D5CEC2] bg-white p-6 sm:p-8 text-center space-y-5 shadow-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF8EC] text-[#B45309]">
                  <Award className="h-7 w-7" />
                </div>

                <div className="text-xs font-bold text-[#78716C]">
                  ヒゲダン検定クイズ 認定結果（{activeCourseLabel}）
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                  認定ランク：{quizSummary.rankTitle}
                </h3>

                <p className="font-mono-num text-base sm:text-lg font-bold text-[#C83E2B]">
                  正解数 {quizSummary.score} / {quizSummary.total} 問（正答率{' '}
                  {quizSummary.percentage}%）
                </p>

                <p className="mx-auto max-w-xl text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {quizSummary.editorialMessage}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCertShareOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isCertShareOpen
                        ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                        : 'border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <Share2 className="h-4 w-4 text-[#C83E2B]" />
                    シェアカード生成
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartCourse(difficultyFilter)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#A93020] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    同じコースにもう一度挑戦する
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToSelect}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-white px-5 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    別のコースを選ぶ
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewTab('archive')}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-5 py-2.5 text-xs font-bold text-[#1E3A5F] hover:border-[#1E3A5F] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Newspaper className="h-4 w-4" />
                    全60問の出典＆トリビア図鑑を読む
                  </button>
                </div>

                {/* DOM-Based Quiz Certificate SNS Share Card */}
                {isCertShareOpen && (
                  <div className="mt-5 pt-5 border-t border-[#E6E1D6] text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#1C1917]">
                        ヒゲダン検定 認定証シェアカード
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyCertShareText}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors cursor-pointer"
                        >
                          {copiedCert ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#FDE68A]" />
                              コピーしました！
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              認定証テキストをコピー
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCertShareOpen(false)}
                          aria-label="認定証シェアカードを閉じる"
                          className="inline-flex items-center justify-center rounded-lg border border-[#D5CEC2] bg-white p-2 text-[#57534E] hover:border-[#1C1917] cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#1C1917] bg-[#1C1917] text-[#FBF9F5] shadow-lg">
                      <div className="flex items-center justify-between border-b border-white/15 bg-black/30 px-5 py-3 text-xs">
                        <span className="font-bold text-[#F5D0C9]">
                          115万キロのファンノート · ヒゲダン検定クイズ認定証
                        </span>
                        <span className="font-mono-num font-bold text-white">
                          {quizSummary.rankBadgeCode}
                        </span>
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="text-xs text-white/75">{activeCourseLabel}</div>
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          認定ランク：{quizSummary.rankTitle}
                        </div>
                        <div className="font-mono-num text-base font-bold text-[#F5D0C9]">
                          正解数 {quizSummary.score} / {quizSummary.total} 問（正答率{' '}
                          {quizSummary.percentage}%）
                        </div>
                        <p className="text-xs text-white/85 leading-relaxed pt-2 border-t border-white/15">
                          {quizSummary.editorialMessage}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 bg-black/25 px-5 py-2.5 text-[11px] text-white/65">
                        <span>#115万キロのファンノート #Official髭男dism #ヒゲダン検定</span>
                        <span>全60問・120出典資料収録</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* TAB 2: ALL 60 QUESTIONS & 120 SOURCES ARCHIVE */}
        {viewTab === 'archive' && (
          <div className="mt-6 space-y-5">
            {/* Search & Multi-Axis Filter Panel */}
            <div className="rounded-2xl border border-[#E6E1D6] bg-white p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1C1917]">
                    全60問のトリビア解説 ＆ 出典インタビュー・データ検証図鑑（計120資料）
                  </h3>
                  <p className="mt-0.5 text-xs text-[#57534E]">
                    各レベル20問（計60問）の正解・制作背景と、裏付けとなるインタビュー・当サイト全曲データベース検証（計120本）を難易度・媒体・キーワードで検索できます。
                  </p>
                </div>
                <span className="text-xs font-mono-num font-bold text-[#C83E2B] shrink-0">
                  表示中：{archiveQuestions.length} 問（出典資料 {archiveQuestions.length * 2} 本）
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
                    placeholder="エルダーフラワー・麻婆豆腐・五十音・並び替え..."
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
                {(
                  [
                    { id: 'all', label: 'すべての媒体' },
                    { id: 'natalie', label: '音楽ナタリー' },
                    { id: 'realsound', label: 'Real Sound' },
                    { id: 'official', label: '公式インタビュー・特設サイト' },
                    { id: 'sitedb', label: '当サイト全曲DB・歌ネット・Wikipedia' },
                    { id: 'other', label: 'Billboard / ORICON / 専門誌ほか' },
                  ] as { id: PublisherFilter; label: string }[]
                ).map((pub) => (
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
                    ? songs.find((s) => s.id === q.relatedSongId)
                    : null;
                  const answerDisplay =
                    q.questionType === 'ordering' && q.correctOrder
                      ? formatOrderingSequence(q.options, q.correctOrder)
                      : q.options[q.correctIndex];

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
                          <span className="text-xs font-bold text-[#78716C]">
                            テーマ：{q.category}
                          </span>
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
                        {q.sources.map((src, sIdx) => (
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
                              <p className="mt-1.5 text-xs text-[#57534E] leading-relaxed">
                                {src.summary}
                              </p>
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
                        ))}
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
        )}
      </div>
    </section>
  );
};
