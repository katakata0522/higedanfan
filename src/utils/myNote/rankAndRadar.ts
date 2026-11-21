import { normalizeSetlistOrder } from '../setlist';
import {
  VALID_CHECKABLE_SPOT_IDS,
  VALID_SONG_IDS,
  VALID_TOUR_IDS,
} from './catalog';
import { buildQuizRecordSummary } from './timelines';
import type {
  MyNoteEngagementInput,
  MyNotePlaystyleId,
  MyNotePlaystyleSummary,
  MyNoteRadarAxis,
  MyNoteRadarSummary,
  MyNoteRankSummary,
  MyNoteStampItem,
} from './types';

interface RankTierSpec {
  min: number;
  title: string;
  subtitle: string;
}

const RANK_TIERS: readonly RankTierSpec[] = [
  { min: 92, title: '115万キロのマイスター', subtitle: '永遠のパートナー級の愛と軌跡。最高の推し活に拍手を！' },
  { min: 84, title: '永遠のBROTHERS', subtitle: '最高峰まであと少し。揺るぎない絆がここに' },
  { min: 76, title: '殿堂入り髭団', subtitle: 'もはや髭団の歴史に名を刻む伝説級の存在です' },
  { min: 68, title: '名誉髭団', subtitle: '深い愛情と歩みを称える栄誉の称号' },
  { min: 60, title: 'ヒゲダン博士', subtitle: '曲の背景からトリビアまで、何でも語れる博士級！' },
  { min: 52, title: '筋金入りの髭団', subtitle: '曲も歴史も遊び心も、ブレない愛で楽しみ尽くす領域' },
  { min: 44, title: 'ヒゲダン愛の伝道師', subtitle: '溢れる熱意で周囲にグッドミュージックを広める存在' },
  { min: 36, title: 'ヒゲダン史の目撃者', subtitle: 'バンドの歩みと音楽の大きなうねりを見渡しています' },
  { min: 29, title: 'グッドミュージックの語り部', subtitle: '誰かに推し曲をおすすめしたくなる熱量です' },
  { min: 22, title: '音と言葉の探究者', subtitle: '歌詞やアレンジの奥深さまで味わい尽くす段階へ' },
  { min: 16, title: 'ヒゲダン沼の住人', subtitle: '気づけばもう引き返せないほど夢中です' },
  { min: 10, title: '駆け出し髭団', subtitle: 'いよいよ「髭団」を名乗る新たな一歩へ' },
  { min: 5, title: '街角のリスナー', subtitle: 'ふとした瞬間にメロディが浮かぶ日々のはじまり' },
  { min: 2, title: 'ファンノートの新人', subtitle: '最初の付箋がぺたりと貼られました' },
  { min: 0, title: 'はじめの一歩', subtitle: 'これから始まる、ヒゲダンと歩む物語の最初のページ' },
];

export function buildMyNoteRank(stamps: readonly MyNoteStampItem[]): MyNoteRankSummary {
  const totalStamps = stamps.length;
  const unlockedCount = stamps.filter((stamp) => stamp.unlocked).length;
  const totalNormalStamps = stamps.filter((stamp) => stamp.tier === 'normal').length;
  const unlockedNormalCount = stamps.filter(
    (stamp) => stamp.unlocked && stamp.tier === 'normal',
  ).length;
  const totalGoldStamps = stamps.filter((stamp) => stamp.tier === 'gold').length;
  const unlockedGoldCount = stamps.filter(
    (stamp) => stamp.unlocked && stamp.tier === 'gold',
  ).length;

  const rawPercent = totalStamps > 0 ? Math.round((unlockedCount / totalStamps) * 100) : 0;
  const progressPercent = unlockedCount <= 1 ? Math.max(2, rawPercent) : rawPercent;

  const tierIdx = RANK_TIERS.findIndex((tier) => unlockedCount >= tier.min);
  const resolvedIdx = tierIdx >= 0 ? tierIdx : RANK_TIERS.length - 1;
  const currentTier = RANK_TIERS[resolvedIdx];
  const nextTier = resolvedIdx > 0 ? RANK_TIERS[resolvedIdx - 1] : null;
  const remainingTotal = Math.max(0, totalStamps - unlockedCount);

  return {
    tierNumber: RANK_TIERS.length - resolvedIdx,
    title: currentTier.title,
    subtitle: currentTier.subtitle,
    unlockedCount,
    totalStamps,
    unlockedNormalCount,
    totalNormalStamps,
    unlockedGoldCount,
    totalGoldStamps,
    progressPercent,
    nextMilestoneText: nextTier
      ? `次のランクまであと ${Math.max(1, nextTier.min - unlockedCount)} スタンプ`
      : remainingTotal > 0
        ? `最高ランク達成！全${totalStamps}スタンプ制覇まであと ${remainingTotal} スタンプ`
        : `最高ランク達成！全${totalStamps}スタンプ完全制覇`,
  };
}

const PLAYSTYLE_SPECS: Record<MyNotePlaystyleId, { title: string; subtitle: string }> = {
  gem: {
    title: 'ダイヤの原石',
    subtitle: 'これからどんな輝きにも磨かれていく可能性を秘めたスタート',
  },
  tour: {
    title: '歓声のど真ん中を生きる人',
    subtitle: '歴代ツアー記録を中心に思い出を刻んでいる人',
  },
  spot: {
    title: '風景と音をめぐる旅人',
    subtitle: '全国・世界のゆかりの地をカメラ片手に巡る人',
  },
  setlist: {
    title: '夢の公演ディレクター',
    subtitle: '理想のセットリストを何度も練り上げる演出家タイプ',
  },
  quiz: {
    title: 'ヒゲダン愛のトリビア賢者',
    subtitle: '検定や難問チャレンジで知識を極めるタイプ',
  },
  explore: {
    title: 'ライナーノーツの深掘り人',
    subtitle: '楽曲解説や音域チャート、サイトの隅々までじっくり読み込む人',
  },
  balanced: {
    title: '全方位の髭団トラベラー',
    subtitle: '偏りなくサイト全体を満遍なく楽しむオールラウンダー',
  },
};

// Gently wait until any axis moves past simple setup actions before locking in a specialty.
const PLAYSTYLE_GEM_THRESHOLD_MILLI = 160;
const PLAYSTYLE_BALANCED_FLOOR_MILLI = 120;
const PLAYSTYLE_BALANCED_MAX_SPREAD_MILLI = 220;

export function buildMyNotePlaystyle(radar: MyNoteRadarSummary): MyNotePlaystyleSummary {
  if (radar.axes.length === 0) {
    return { id: 'gem', ...PLAYSTYLE_SPECS.gem, dominantAxisId: null };
  }

  let maxMilli = -1;
  let minMilli = Number.POSITIVE_INFINITY;
  let bestAxis: MyNoteRadarAxis = radar.axes[0];

  for (const axis of radar.axes) {
    const scoreMilli = Math.max(0, Math.round(axis.value * 1000));
    if (scoreMilli > maxMilli) {
      maxMilli = scoreMilli;
      bestAxis = axis;
    }
    if (scoreMilli < minMilli) {
      minMilli = scoreMilli;
    }
  }

  if (maxMilli < PLAYSTYLE_GEM_THRESHOLD_MILLI) {
    return { id: 'gem', ...PLAYSTYLE_SPECS.gem, dominantAxisId: null };
  }

  if (
    minMilli >= PLAYSTYLE_BALANCED_FLOOR_MILLI &&
    maxMilli - minMilli <= PLAYSTYLE_BALANCED_MAX_SPREAD_MILLI
  ) {
    return { id: 'balanced', ...PLAYSTYLE_SPECS.balanced, dominantAxisId: null };
  }

  return {
    id: bestAxis.id,
    ...PLAYSTYLE_SPECS[bestAxis.id],
    dominantAxisId: bestAxis.id,
  };
}

export interface RadarComputationInput {
  attendedCount: number;
  visitedCount: number;
  maxSetlistSongs: number;
  savedSetlistCount: number;
  completedQuizSets: number;
  bestQuizScore: number | null;
  votedSongCount: number;
  reviewCount: number;
  readSongCount: number;
  moodCompletedCount: number;
  hasCustomNickname: boolean;
  visitedVocalRange: boolean;
  visitedReferenceArchive: boolean;
}

export function computeRadarSummary({
  attendedCount,
  visitedCount,
  maxSetlistSongs,
  savedSetlistCount,
  completedQuizSets,
  bestQuizScore,
  votedSongCount,
  reviewCount,
  readSongCount,
  moodCompletedCount,
  hasCustomNickname,
  visitedVocalRange,
  visitedReferenceArchive,
}: RadarComputationInput): MyNoteRadarSummary {
  const tourScore = Math.min(1, attendedCount / 8);
  const spotScore = Math.min(1, visitedCount / 8);
  const setlistUnits = maxSetlistSongs + Math.max(0, savedSetlistCount - 1) * 4;
  const setlistScore = Math.min(1, setlistUnits / 14);
  const quizUnits = completedQuizSets + (bestQuizScore ? bestQuizScore / 100 : 0);
  const quizScore = Math.min(1, quizUnits / 6);
  const exploreUnits =
    votedSongCount +
    reviewCount * 2 +
    readSongCount * 0.4 +
    moodCompletedCount * 1.5 +
    (hasCustomNickname ? 1 : 0) +
    (visitedVocalRange ? 1 : 0) +
    (visitedReferenceArchive ? 1 : 0);
  const exploreScore = Math.min(1, exploreUnits / 8);

  const axes: MyNoteRadarAxis[] = [
    {
      id: 'tour',
      label: 'ライブ参戦',
      value: tourScore,
      rawLabel: `${attendedCount}件`,
    },
    {
      id: 'spot',
      label: '聖地巡礼',
      value: spotScore,
      rawLabel: `${visitedCount}か所`,
    },
    {
      id: 'setlist',
      label: 'MYセトリ',
      value: setlistScore,
      rawLabel: `${maxSetlistSongs}曲 / ${savedSetlistCount}案`,
    },
    {
      id: 'quiz',
      label: '楽曲検定',
      value: quizScore,
      rawLabel: `${completedQuizSets}セット`,
    },
    {
      id: 'explore',
      label: '応援・探索',
      value: exploreScore,
      rawLabel: `${readSongCount}曲読破`,
    },
  ];

  return {
    hasAnyActivity: axes.some((axis) => axis.value > 0),
    axes,
  };
}

export function buildMyNoteRadar(input: MyNoteEngagementInput): MyNoteRadarSummary {
  const attendedCount = new Set(
    input.attendedTourIds.filter((id) => VALID_TOUR_IDS.has(id)),
  ).size;
  const visitedCount = new Set(
    input.visitedSpotIds.filter((id) => VALID_CHECKABLE_SPOT_IDS.has(id)),
  ).size;
  let maxSetlistSongs = 0;
  for (const item of input.setlists) {
    const count = normalizeSetlistOrder(
      item.entries.filter((entry) => VALID_SONG_IDS.has(entry.songId)),
    ).length;
    if (count > maxSetlistSongs) maxSetlistSongs = count;
  }
  const completedQuizSets = buildQuizRecordSummary(
    input.quizVolumeScores,
    input.bestQuizScore,
  ).completedSets;
  const readSongCount = new Set(
    input.readSongIds.filter((id) => VALID_SONG_IDS.has(id)),
  ).size;

  return computeRadarSummary({
    attendedCount,
    visitedCount,
    maxSetlistSongs,
    savedSetlistCount: input.savedSetlistCount,
    completedQuizSets,
    bestQuizScore: input.bestQuizScore,
    votedSongCount: input.votedSongCount,
    reviewCount: input.reviewCount,
    readSongCount,
    moodCompletedCount: input.moodCompletedCount,
    hasCustomNickname: input.hasCustomNickname,
    visitedVocalRange: input.visitedVocalRange,
    visitedReferenceArchive: input.visitedReferenceArchive,
  });
}
