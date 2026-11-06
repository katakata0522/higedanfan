import {
  EraTag,
  FanReview,
  MoodTag,
  QuizQuestion,
  SituationTag,
  SongItem,
  SoundTag,
  TourArchive,
} from '../data/higedanData';

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
  matchScore: number; // percentage 65 - 99
  matchReasons: string[];
  moodMatchExplanation: string;
  soundAnalysisReason: string;
  matchBreakdown: MatchBreakdown;
}

export interface SetlistEntry {
  songId: string;
  isEncore: boolean;
}

export interface SetlistStats {
  totalSongs: number;
  mainCount: number;
  encoreCount: number;
  totalDurationSec: number;
  formattedDuration: string;
  avgBpm: number;
  energyCurve: { index: number; title: string; energy: number; bpm: number; isEncore: boolean }[];
  vibeTitle: string;
  vibeDescription: string;
}

export type DiscographySortOption =
  | 'guide_order'
  | 'album_track_order'
  | 'popular'
  | 'newest'
  | 'release_oldest'
  | 'highest_note'
  | 'vocal_span'
  | 'bpm';

export interface DiscographyFilter {
  era: EraTag | 'all';
  album?: string; // 'all' or exact album title
  sound: SoundTag | 'all';
  searchQuery: string;
  onlyHiddenGems?: boolean;
  sortBy?: DiscographySortOption;
}

export interface QuizResultSummary {
  score: number;
  total: number;
  percentage: number;
  rankTitle: string;
  rankBadgeCode: string;
  editorialMessage: string;
}

export const MOOD_LABELS: Record<MoodTag, string> = {
  push_back: '背中を押してほしい・前を向きたい',
  heartbreak_night: '切ない気持ちに寄り添ってほしい',
  euphoric_drive: '最高にテンションを上げたい',
  deep_lyric: '深い歌詞と音楽構造に浸りたい',
};

export const SITUATION_LABELS: Record<SituationTag, string> = {
  morning_commute: '朝の通勤・通学・スタートダッシュ',
  late_night_alone: 'ひとり静かに過ごす夜',
  live_warmup: 'ライブ参戦前・ドライブ中',
  weekend_walk: '休日の散歩・カフェタイム',
};

export const SOUND_LABELS: Record<SoundTag, string> = {
  piano_pop: '王道ピアノポップ',
  brass_funk: 'ブラス＆ファンク',
  emotional_ballad: 'エモーショナルバラード',
  stadium_rock: 'スタジアムロック',
};

export const ERA_SHORT_LABELS: Record<EraTag, string> = {
  indies_escaparade: '初期〜エスカパレード',
  traveler: 'Traveler期',
  editorial: 'Editorial期',
  rejoice: 'Rejoice期',
  latest_2025_2026: '2024-2026最新',
};

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

/**
 * Security: Sanitizes user-supplied text against XSS and injection attacks.
 * - Normalizes Unicode (NFKC)
 * - Strips HTML comments, opening/closing tags, and angle brackets (<, >, ＜, ＞)
 * - Removes control characters and bidirectional override characters
 * - Strips dangerous URI schemes (javascript:, data:, vbscript:, file:, blob:)
 * - Strips inline DOM event handlers (e.g., onerror=, onclick=, onload=)
 * - Enforces a strict maximum character length
 */
export function sanitizeUserText(input: unknown, maxLength = 200): string {
  if (typeof input !== 'string') return '';
  const safeMax = Math.max(1, Math.min(2000, Math.floor(maxLength) || 200));
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '')
    .replace(/＜\/?[a-zA-Z][^＞]*＞/g, '')
    .replace(/[<>＜＞]/g, '')
    .replace(/\b(?:javascript|data|vbscript|file|blob)\s*:/gi, '')
    .replace(/\bon[a-z]+\s*=/gi, '')
    .trim()
    .slice(0, safeMax);
}

/**
 * Security: Sanitizes an identifier (songId, spotId, reviewId, voteKey)
 * so only safe ASCII alphanumeric, hyphen, underscore, and colon remain.
 */
export function sanitizeSafeId(input: unknown, maxLength = 60): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^a-zA-Z0-9_:-]/g, '')
    .slice(0, Math.max(1, Math.min(120, maxLength)));
}

/**
 * Security: Ensures an asset image path is a safe local path and not an executable protocol.
 */
export function isSafeAssetUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (/[<>'"`\u0000-\u001F]/.test(trimmed)) return false;
  return true;
}

export function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    return b.song.votes.overall - a.song.votes.overall;
  });
}

export function formatDiagnosisShareText(
  match: ScoredSongMatch,
  criteria: MoodCriteria
): string {
  return [
    `【マイソング診断結果：『${match.song.title}』（マッチ度 ${match.matchScore}%）】`,
    `診断条件：${MOOD_LABELS[criteria.mood]} ／ ${SITUATION_LABELS[criteria.situation]} ／ ${SOUND_LABELS[criteria.sound]}`,
    `理由：${match.moodMatchExplanation}`,
    `曲調：${match.song.musicalHighlight}`,
    '#115万キロのファンノート #Official髭男dism #マイソング診断',
  ].join('\n');
}

const ALBUM_CHRONOLOGY_RANK: Record<string, number> = {
  'ラブとピースは君の中': 1,
  'MAN IN THE MIRROR': 2,
  "What's Going On? EP": 3,
  'レポート': 4,
  'エスカパレード': 5,
  Escaparade: 5,
  'Stand By You EP': 6,
  Traveler: 7,
  'HELLO EP': 8,
  Editorial: 9,
  'ミックスナッツ EP': 10,
  Rejoice: 11,
  'Single / 2024-2026 Collection': 12,
};

export const EP_TRACK_ORDER_MAP: Record<string, Record<string, number>> = {
  'Stand By You EP': {
    'stand-by-you': 1,
    'fire-ground': 2,
    'bad-for-me': 3,
  },
  'HELLO EP': {
    'hello-song': 1,
    'parabola-song': 2,
    'laughter-song': 3,
    'natsumoyou-no-neko': 4,
  },
  'ミックスナッツ EP': {
    'mixed-nuts': 1,
    // The EP has the single version; the guide covers the Rejoice recording.
    'choral-a-song': 3,
    'hagan-song': 4,
  },
};

export function filterAndSortDiscography(
  songs: SongItem[],
  filter: DiscographyFilter
): SongItem[] {
  const query = sanitizeUserText(filter.searchQuery, 60).toLowerCase();

  const filtered = songs.filter((song) => {
    if (filter.era !== 'all' && song.era !== filter.era) {
      return false;
    }
    if (filter.album && filter.album !== 'all') {
      const epMap = EP_TRACK_ORDER_MAP[filter.album];
      if (epMap) {
        if (!(song.id in epMap)) return false;
      } else if (filter.album === 'エスカパレード' || filter.album === 'Escaparade') {
        if (song.album !== 'エスカパレード' && song.album !== 'Escaparade') return false;
      } else if (song.album !== filter.album) {
        return false;
      }
    }
    if (filter.sound !== 'all' && song.sound !== filter.sound) {
      return false;
    }
    if (filter.onlyHiddenGems && !song.isHiddenGem) {
      return false;
    }
    if (query.length > 0) {
      const haystack = [
        song.title,
        song.album,
        song.tieUp,
        song.musicalHighlight,
        song.linerNotes,
        song.vocalRange?.highestChestNote ?? '',
        song.vocalRange?.lowestNote ?? '',
        song.vocalRange?.highNoteSection ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (!filter.sortBy) {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    switch (filter.sortBy) {
      case 'guide_order':
        return a.guideOrder - b.guideOrder;
      case 'album_track_order': {
        if (filter.album && EP_TRACK_ORDER_MAP[filter.album]) {
          const epMap = EP_TRACK_ORDER_MAP[filter.album];
          return (epMap[a.id] ?? 99) - (epMap[b.id] ?? 99);
        }
        const albumRankA = ALBUM_CHRONOLOGY_RANK[a.album] ?? 99;
        const albumRankB = ALBUM_CHRONOLOGY_RANK[b.album] ?? 99;
        if (albumRankA !== albumRankB) return albumRankA - albumRankB;
        return (a.trackNumber ?? 99) - (b.trackNumber ?? 99) || a.guideOrder - b.guideOrder;
      }
      case 'popular':
        return b.votes.overall - a.votes.overall;
      case 'newest':
        return (
          b.releaseDate.localeCompare(a.releaseDate) ||
          (a.trackNumber ?? 99) - (b.trackNumber ?? 99) ||
          a.guideOrder - b.guideOrder
        );
      case 'release_oldest':
        return (
          a.releaseDate.localeCompare(b.releaseDate) ||
          (a.trackNumber ?? 99) - (b.trackNumber ?? 99) ||
          a.guideOrder - b.guideOrder
        );
      case 'highest_note':
        return (
          b.vocalRange.chestSemitoneScore - a.vocalRange.chestSemitoneScore ||
          b.vocalRange.rangeSpanSemitones - a.vocalRange.rangeSpanSemitones ||
          a.guideOrder - b.guideOrder
        );
      case 'vocal_span':
        return (
          b.vocalRange.rangeSpanSemitones - a.vocalRange.rangeSpanSemitones ||
          b.vocalRange.chestSemitoneScore - a.vocalRange.chestSemitoneScore ||
          a.guideOrder - b.guideOrder
        );
      case 'bpm':
        return b.bpm - a.bpm || b.votes.overall - a.votes.overall;
      default:
        return 0;
    }
  });
}

export function sortTourArchives(
  tours: TourArchive[],
  order: 'newest' | 'oldest'
): TourArchive[] {
  return [...tours].sort((a, b) => {
    if (order === 'newest') {
      return b.startDate.localeCompare(a.startDate);
    }
    return a.startDate.localeCompare(b.startDate);
  });
}

export function calculateSetlistStats(
  entries: SetlistEntry[],
  allSongs: SongItem[]
): SetlistStats {
  const songMap = new Map(allSongs.map((s) => [s.id, s]));
  const resolved = entries
    .map((entry, idx) => {
      const song = songMap.get(entry.songId);
      if (!song) return null;
      return {
        index: idx + 1,
        song,
        isEncore: entry.isEncore,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (resolved.length === 0) {
    return {
      totalSongs: 0,
      mainCount: 0,
      encoreCount: 0,
      totalDurationSec: 0,
      formattedDuration: '0分00秒',
      avgBpm: 0,
      energyCurve: [],
      vibeTitle: 'セットリスト未編成',
      vibeDescription: '楽曲を追加すると、ライブ全体の盛り上がり波形と総演奏時間を自動算出します。',
    };
  }

  const totalDurationSec = resolved.reduce((acc, item) => acc + item.song.durationSec, 0);
  const totalMinutes = Math.floor(totalDurationSec / 60);
  const remainSeconds = totalDurationSec % 60;
  const avgBpm = Math.round(
    resolved.reduce((acc, item) => acc + item.song.bpm, 0) / resolved.length
  );
  const avgEnergy =
    resolved.reduce((acc, item) => acc + item.song.energyLevel, 0) / resolved.length;

  const mainCount = resolved.filter((r) => !r.isEncore).length;
  const encoreCount = resolved.filter((r) => r.isEncore).length;

  let vibeTitle = '王道スタジアム・バランス型';
  let vibeDescription =
    'アッパーなロック・ファンクと心を揺さぶるピアノバラードが絶妙に交錯する、ドーム＆スタジアム級の構成です。';

  if (avgEnergy >= 8.6) {
    vibeTitle = '熱狂ノンストップ・フェス＆ライブハウス型';
    vibeDescription =
      '序盤から終盤までハイボルテージなキラーチューンが畳み掛ける、汗だく必至の攻めのセットリストです。';
  } else if (avgEnergy <= 7.2) {
    vibeTitle = '極上アコースティック＆ライナーノーツ没入型';
    vibeDescription =
      '藤原聡の歌声とピアノ、繊細な歌詞の世界観をじっくり堪能できる、ホール公演向きのドラマチックな構成です。';
  }

  return {
    totalSongs: resolved.length,
    mainCount,
    encoreCount,
    totalDurationSec,
    formattedDuration: `${totalMinutes}分${remainSeconds.toString().padStart(2, '0')}秒`,
    avgBpm,
    energyCurve: resolved.map((r) => ({
      index: r.index,
      title: r.song.title,
      energy: r.song.energyLevel,
      bpm: r.song.bpm,
      isEncore: r.isEncore,
    })),
    vibeTitle,
    vibeDescription,
  };
}

export function validateReviewInput(input: {
  author: string;
  songId: string;
  title: string;
  comment: string;
}): {
  valid: boolean;
  error?: string;
  sanitized?: { author: string; songId: string; title: string; comment: string };
} {
  const cleanAuthor = sanitizeUserText(input.author, 30);
  const cleanSongId = sanitizeSafeId(input.songId, 40);
  const cleanTitle = sanitizeUserText(input.title, 60);
  const cleanComment = sanitizeUserText(input.comment, 400);

  if (cleanAuthor.length < 2) {
    return { valid: false, error: 'ニックネームを2文字以上（30文字以内）で入力してください。' };
  }
  if (cleanSongId.length === 0) {
    return { valid: false, error: 'レビュー対象の楽曲を選択してください。' };
  }
  if (cleanTitle.length < 3) {
    return { valid: false, error: 'ひとこと見出しを3文字以上（60文字以内）で入力してください。' };
  }
  if (cleanComment.length < 10) {
    return { valid: false, error: '感想・考察コメントを10文字以上（400文字以内）で入力してください。' };
  }
  return {
    valid: true,
    sanitized: {
      author: cleanAuthor,
      songId: cleanSongId,
      title: cleanTitle,
      comment: cleanComment,
    },
  };
}

/**
 * Ensures all main tracks (isEncore: false) precede encore tracks (isEncore: true)
 * while preserving relative order within each group and deduplicating songIds.
 */
export function normalizeSetlistOrder(entries: SetlistEntry[]): SetlistEntry[] {
  const seen = new Set<string>();
  const main: SetlistEntry[] = [];
  const encore: SetlistEntry[] = [];

  for (const item of entries) {
    if (!item || typeof item.songId !== 'string' || seen.has(item.songId)) continue;
    seen.add(item.songId);
    if (item.isEncore) {
      encore.push({ songId: item.songId, isEncore: true });
    } else {
      main.push({ songId: item.songId, isEncore: false });
    }
  }
  return [...main, ...encore];
}

export function formatDateDot(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function sanitizeSetlistEntries(
  rawEntries: unknown,
  validSongIds: Set<string>
): SetlistEntry[] | null {
  if (!Array.isArray(rawEntries)) return null;
  const safe: SetlistEntry[] = [];
  for (const item of rawEntries) {
    if (
      item &&
      typeof item === 'object' &&
      'songId' in item &&
      typeof (item as { songId: unknown }).songId === 'string'
    ) {
      const cleanId = sanitizeSafeId((item as { songId: string }).songId, 40);
      if (validSongIds.has(cleanId)) {
        safe.push({
          songId: cleanId,
          isEncore: Boolean((item as { isEncore?: unknown }).isEncore),
        });
      }
    }
  }
  return normalizeSetlistOrder(safe);
}

export function sanitizeReviewsList(
  rawReviews: unknown,
  validSongIds: Set<string>
): FanReview[] | null {
  if (!Array.isArray(rawReviews)) return null;
  const allowedCategories = new Set(['歌詞考察', 'ライブ体験', '楽曲アレンジ', '人生の支え']);
  const safe: FanReview[] = [];

  for (const item of rawReviews) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const author = sanitizeUserText(String(r.author ?? ''), 30);
    const songId = sanitizeSafeId(String(r.songId ?? ''), 40);
    const title = sanitizeUserText(String(r.title ?? ''), 60);
    const comment = sanitizeUserText(String(r.comment ?? ''), 400);
    const category = String(r.category ?? '歌詞考察');

    if (
      author.length >= 2 &&
      validSongIds.has(songId) &&
      title.length >= 3 &&
      comment.length >= 10 &&
      allowedCategories.has(category)
    ) {
      safe.push({
        id: sanitizeSafeId(String(r.id ?? `rev-${safe.length}`), 40) || `rev-${safe.length}`,
        author,
        fanTenure: sanitizeUserText(String(r.fanTenure ?? 'ファン歴 3〜5年'), 30),
        songId,
        category: category as FanReview['category'],
        title,
        comment,
        postedAt: sanitizeUserText(String(r.postedAt ?? '2026.11.05'), 20),
        likes: Math.max(0, Math.min(99999, Number(r.likes) || 0)),
      });
    }
  }
  return safe.length > 0 ? safe : null;
}

export function calculateQuizResult(
  score: number,
  questions: QuizQuestion[]
): QuizResultSummary {
  const total = Math.max(1, questions.length);
  const safeScore = Math.max(0, Math.min(score, total));
  const percentage = Math.round((safeScore / total) * 100);

  if (percentage === 100) {
    return {
      score: safeScore,
      total,
      percentage,
      rankTitle: '名誉編集長 / BROTHERS マスター',
      rankBadgeCode: 'RANK S · EDITORIAL CHIEF',
      editorialMessage:
        '全問正解！歌詞の細部から転調トリビア、松江〜日産スタジアムの歴史まで完璧に網羅した生粋のヒゲダン博士です。',
    };
  }
  if (percentage >= 65) {
    return {
      score: safeScore,
      total,
      percentage,
      rankTitle: 'グッドミュージック特派員',
      rankBadgeCode: 'RANK A · SENIOR WRITER',
      editorialMessage:
        '高い正答率です！代表曲だけでなくアルバム曲やライブの醍醐味までしっかり味わえている頼もしいファンです。',
    };
  }
  return {
    score: safeScore,
    total,
    percentage,
    rankTitle: 'ヒゲダン沼のルーキー読者',
    rankBadgeCode: 'RANK B · NEW LISTENER',
    editorialMessage:
      'これからさらに多くの名曲と出会える最高のタイミング！まずはディスコグラフィと気分診断から気になる1曲を深掘りしてみましょう。',
  };
}

const SONGWRITER_CREDIT_MAP: Record<string, string> = {
  rowan: '作詞・作曲：小笹大輔',
  'rowan-song': '作詞・作曲：小笹大輔',
  Rowan: '作詞・作曲：小笹大輔',
  'bedroom-talk': '作詞・作曲：小笹大輔',
  'bedroom-talk-song': '作詞・作曲：小笹大輔',
  'Bedroom Talk': '作詞・作曲：小笹大輔',
  'tabi-wa-michizure': '作詞・作曲：楢﨑誠',
  'tabi-wa-michizure-song': '作詞・作曲：楢﨑誠',
  '旅は道連れ': '作詞・作曲：楢﨑誠',
  'midori-no-ameyoke': '作詞・作曲：楢﨑誠',
  'midori-no-ameyoke-song': '作詞・作曲：楢﨑誠',
  'midori-no-amayoke': '作詞・作曲：楢﨑誠',
  'みどりの雨避け': '作詞・作曲：楢﨑誠',
  'choral-a': '作詞・作曲：楢﨑誠',
  'choral-a-song': '作詞・作曲：楢﨑誠',
  'Choral A': '作詞・作曲：楢﨑誠',
  filament: '作詞・作曲：松浦匡希・藤原聡',
  'filament-song': '作詞・作曲：松浦匡希・藤原聡',
  'フィラメント': '作詞・作曲：松浦匡希・藤原聡',
};

export function getSongwriterCredit(
  song: Pick<SongItem, 'id'> & { title?: string }
): string {
  return (
    SONGWRITER_CREDIT_MAP[song.id] ??
    (song.title ? SONGWRITER_CREDIT_MAP[song.title] : undefined) ??
    '作詞・作曲：藤原聡'
  );
}

export function isOrderingAnswerCorrect(
  selectedOrder: number[],
  correctOrder: number[]
): boolean {
  if (!Array.isArray(selectedOrder) || !Array.isArray(correctOrder)) return false;
  if (selectedOrder.length !== correctOrder.length || correctOrder.length === 0) {
    return false;
  }
  return correctOrder.every((expectedIdx, pos) => selectedOrder[pos] === expectedIdx);
}

export function formatOrderingSequence(
  options: string[],
  orderIndices: number[]
): string {
  return orderIndices
    .map((optIdx, pos) => `${pos + 1}番目: ${options[optIdx] ?? ''}`)
    .join(' → ');
}



