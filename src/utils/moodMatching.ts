import type { MoodTag, SituationTag, SongItem, SoundTag } from '../data/higedanData';
import { MOOD_LABELS, SITUATION_LABELS, SOUND_LABELS } from './songLabels';

export interface MoodCriteria {
  mood: MoodTag;
  situation: SituationTag;
  sound: SoundTag;
}

export interface MatchBreakdown {
  moodSyncPercent: number;
  sceneFitPercent: number;
  soundMatchPercent: number;
  tempoParameter: number;
  liveEnergyParameter: number;
  lyricDepthParameter: number;
}

export interface ScoredSongMatch {
  song: SongItem;
  matchScore: number; // Editorial score, 60–99
  matchReasons: string[];
  moodMatchExplanation: string;
  soundAnalysisReason: string;
  matchBreakdown: MatchBreakdown;
}

const SONG_MOOD_CORE_PHRASES: Record<string, string> = {
  pretender: '叶わない想いを抱えながらも相手を肯定する美しいピアノメロディ',
  subtitle: '凍える夜に言葉の温度で心を溶かしていくドラマチックな歌い上げ',
  'mixed-nuts': '不完全な日常や生きづらさを丸ごと肯定して吹き飛ばす疾走ホーンサウンド',
  'cry-baby': '11回の転調で泥臭い感情の揺れを描き切る不屈のロックアンサンブル',
  sharon: '忙しない日々に置いていかれそうな心を優しく抱きしめる温かいバンドサウンド',
  'same-blue': '未完成な青さと衝動を変拍子のビートに乗せて解き放つ青春ロック',
  tattoo: '過去の傷跡すらも大切な仲間との記憶に変えていく心地よいグルーヴ',
  soulsoup: '甘いも苦いも全部煮込んで力に変えるビッグバンド×ロックの祝祭感',
  rashisa: '迷いを振り切って今この瞬間の自分にすべてを賭ける力強い疾走感',
  '115man-kilo': '何気ない日常の一コマを映画のハイライトに変えてくれる温かい眼差し',
  'editorial-song': '限りある時間だからこそ今を愛おしく思える壮大なサウンドスケープ',
  'stand-by-you': 'どんな時も「君のそばに立つ」と寄り添いクラップで一体になれる包容力',
  'no-doubt': '怪しげなホーンリフと軽快なカッティングで常識を笑い飛ばすファンクポップ',
  shukumei: '重厚なブラスセクションとともに泥臭い挑戦者の背中を力強く押す応援歌',
  'i-love': '大切な人との出会いで日常が鮮やかに色づく喜びを描いた王道ポップス',
  'white-noise': 'ノイズだらけの日常を突き破るハイスピードなロックギターと熱量',
};

/**
 * Generates a 1–2 sentence human-friendly explanation of why a song matches
 * the user's current mood, situation, and sound preference.
 */
export function buildMoodMatchExplanation(
  song: SongItem,
  criteria: MoodCriteria
): string {
  const corePhrase =
    SONG_MOOD_CORE_PHRASES[song.id] ||
    `${SOUND_LABELS[song.sound]}の緻密なアンサンブルと心を揺さぶるメロディ`;

  const moodIntroMap: Record<MoodTag, string> = {
    push_back: `「背中を押してほしい」今の気分に、${corePhrase}が力強く寄り添います。`,
    heartbreak_night: `「切ない夜に浸りたい」今の気分に、${corePhrase}が静かに染み渡ります。`,
    euphoric_drive: `「最高に盛り上がりたい」今の気分に、${corePhrase}が最高の熱量をもたらします。`,
    deep_lyric: `「深い歌詞を味わいたい」今の気分に、${corePhrase}が深い余韻を残してくれます。`,
  };

  const situationFollowUpMap: Record<SituationTag, string> = {
    morning_commute: `BPM ${song.bpm}のリズムが、朝の通勤・通学の一歩目を鮮やかに彩ってくれる1曲です。`,
    late_night_alone: `藤原聡の繊細なボーカルと${SOUND_LABELS[song.sound]}の響きが、ひとり静かに過ごす夜の時間を豊かに包み込みます。`,
    live_warmup: `BPM ${song.bpm}の躍動感あふれるグルーヴが、ライブ前やドライブ中のテンションを一気に引き上げてくれます。`,
    weekend_walk: `心地よいBPM ${song.bpm}のテンポ感と開放的なメロディが、休日の散歩やカフェタイムの空気感にぴったり調和します。`,
  };

  return `${moodIntroMap[criteria.mood]}${situationFollowUpMap[criteria.situation]}`;
}

export function buildMatchBreakdown(
  song: SongItem,
  criteria: MoodCriteria
): MatchBreakdown {
  const moodSyncPercent = song.moods.includes(criteria.mood)
    ? song.moods[0] === criteria.mood
      ? 98
      : 92
    : 74;

  const sceneFitPercent = song.situations.includes(criteria.situation)
    ? song.situations[0] === criteria.situation
      ? 97
      : 91
    : 75;

  const soundMatchPercent =
    song.sound === criteria.sound
      ? 99
      : (song.sound === 'piano_pop' && criteria.sound === 'emotional_ballad') ||
        (song.sound === 'brass_funk' && criteria.sound === 'stadium_rock')
      ? 85
      : 76;

  const tempoParameter = Math.min(100, Math.max(35, Math.round(((song.bpm - 75) / 95) * 100)));
  const liveEnergyParameter = Math.min(100, Math.max(40, song.energyLevel * 10));
  const lyricDepthParameter = Math.min(
    100,
    Math.max(60, Math.round((song.votes.lyric / 500) * 100))
  );

  return {
    moodSyncPercent,
    sceneFitPercent,
    soundMatchPercent,
    tempoParameter,
    liveEnergyParameter,
    lyricDepthParameter,
  };
}

export function scoreSongsByMood(
  songs: SongItem[],
  criteria: MoodCriteria
): ScoredSongMatch[] {
  const scored = songs.map((song) => {
    let rawPoints = 60;
    const reasons: string[] = [];

    if (song.moods.includes(criteria.mood)) {
      rawPoints += 18;
      reasons.push(`「${MOOD_LABELS[criteria.mood]}」に響く歌詞`);
    }
    if (song.situations.includes(criteria.situation)) {
      rawPoints += 11;
      reasons.push(`「${SITUATION_LABELS[criteria.situation]}」に合うBPM ${song.bpm}`);
    }
    if (song.sound === criteria.sound) {
      rawPoints += 10;
      reasons.push(`${SOUND_LABELS[criteria.sound]}の名アレンジ`);
    }

    if (reasons.length === 0) {
      reasons.push(`BPM ${song.bpm}のグッドメロディ`);
    }

    const matchScore = Math.min(99, rawPoints);
    const moodMatchExplanation = buildMoodMatchExplanation(song, criteria);
    const matchBreakdown = buildMatchBreakdown(song, criteria);
    const soundAnalysisReason = `${SOUND_LABELS[song.sound]}を軸に、${song.musicalHighlight}`;

    return {
      song,
      matchScore,
      matchReasons: reasons,
      moodMatchExplanation,
      soundAnalysisReason,
      matchBreakdown,
    };
  });

  return scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.song.title.localeCompare(b.song.title, 'ja');
  });
}

export function formatDiagnosisShareText(
  match: ScoredSongMatch,
  criteria: MoodCriteria
): string {
  return [
    `【マイソング診断結果：『${match.song.title}』（選曲スコア ${match.matchScore}点）】`,
    `診断条件：${MOOD_LABELS[criteria.mood]} ／ ${SITUATION_LABELS[criteria.situation]} ／ ${SOUND_LABELS[criteria.sound]}`,
    `理由：${match.moodMatchExplanation}`,
    `曲調：${match.song.musicalHighlight}`,
    '#115万キロのファンノート #Official髭男dism #マイソング診断',
  ].join('\n');
}
