export type MoodTag = 'push_back' | 'heartbreak_night' | 'euphoric_drive' | 'deep_lyric';
export type SituationTag = 'morning_commute' | 'late_night_alone' | 'live_warmup' | 'weekend_walk';
export type SoundTag = 'piano_pop' | 'brass_funk' | 'emotional_ballad' | 'stadium_rock';
export type EraTag = 'indies_escaparade' | 'traveler' | 'editorial' | 'rejoice' | 'latest_2025_2026';

export interface VocalRangeInfo {
  lowestNote: string; // e.g. 'mid1F (F3)'
  highestChestNote: string; // e.g. 'hiC# (C#5)'
  highestFalsettoNote: string; // e.g. 'hiE (E5)'
  chestSemitoneScore: number; // MIDI note index of highest chest note for sorting (e.g. C5=72, C#5=73, D5=74, D#5=75, E5=76)
  rangeSpanSemitones: number; // total vocal span in semitones
  highNoteSection: string; // Copyright-safe section + timestamp description
  lowNoteSection: string; // Copyright-safe section + timestamp description
  singingAdvice: string; // One-sentence vocal / karaoke advice
}

export interface SongItem {
  id: string;
  guideOrder: number;
  trackNumber?: number;
  title: string;
  englishSub: string;
  album: string;
  era: EraTag;
  releaseDate: string;
  durationSec: number; // e.g. 326 for 5:26
  bpm: number;
  keyChanges: number | null;
  energyLevel: number; // 1 to 10
  moods: MoodTag[];
  situations: SituationTag[];
  sound: SoundTag;
  tieUp: string;
  tieUps: { text: string; source: string }[];
  releaseNote?: string;
  iconicLyricQuote: string;
  musicalHighlight: string;
  linerNotes: string;
  lyricAnalysis: string;
  liveArrangementNote: string;
  vocalRange: VocalRangeInfo;
  jacketColor: string;
  jacketImage: string;
  votes: {
    overall: number;
    lyric: number;
    live: number;
    hiddenGem: number;
  };
  isHiddenGem?: boolean;
}

export interface SacredSpot {
  id: string;
  name: string;
  area: '島根・松江' | '鳥取・米子' | '東京・MV聖地' | '横浜・スタジアム';
  relatedSong: string;
  addressHint: string;
  description: string;
  fanTip: string;
  source: string;
  historySource?: string;
}

export interface TourArchive {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  tourTitle: string;
  crossCheckUrl: string;
  officialSourceUrl?: string;
  events: {
    date: string;
    venue: string;
    liveRepoUrl: string;
    liveRepoHasSetlist: boolean;
    crossCheckSetlistUrl?: string;
  }[];
}

export interface FanReview {
  id: string;
  author: string;
  fanTenure: string;
  songId: string;
  category: '歌詞考察' | 'ライブ体験' | '楽曲アレンジ' | '人生の支え';
  title: string;
  comment: string;
  postedAt: string;
  likes: number;
}

export { QUIZ_QUESTIONS, type QuizQuestion, type QuizSourceItem } from './quizData';

export const HERO_IMAGE_PATH = '/images/hero_magazine_collage_1793849692931.jpg';
export const REJOICE_IMAGE_PATH = '/images/album_art_rejoice_vibe_1793849695153.jpg';
export const EDITORIAL_IMAGE_PATH = '/images/album_art_editorial_vibe_1793849696589.jpg';
export const TRAVELER_IMAGE_PATH = '/images/album_art_traveler_vibe_1793854124340.jpg';
export const SAME_BLUE_IMAGE_PATH = '/images/album_art_same_blue_vibe_1793854124064.jpg';
export const MATSUE_IMAGE_PATH = '/images/sacred_matsue_sunset_1793849698665.jpg';
export const STADIUM_IMAGE_PATH = '/images/live_stadium_confetti_1793849699286.jpg';

export { verifiedSongs as HIGEDAN_SONGS } from './fullCatalogSongs';

export const SACRED_SPOTS: SacredSpot[] = [
  {
    "id": "spot-shinji-lake",
    "name": "宍道湖夕日スポット（とるぱ）",
    "area": "島根・松江",
    "relatedSong": "夕暮れ沿い / 115万キロのフィルム",
    "addressHint": "島根県松江市袖師町",
    "description": "松江観光協会が紹介する夕日の観賞場所。バンド結成の地を訪れる際の立ち寄り先です。",
    "fanTip": "湖畔の歩道とテラスから嫁ヶ島を望めます。",
    "source": "https://www.kankou-matsue.jp/omoshiro/sunset/264",
    "historySource": ""
  },
  {
    "id": "spot-matsue-canova",
    "name": "松江 AZTiC canova",
    "area": "島根・松江",
    "relatedSong": "愛なんだが… / 恋の前ならえ",
    "addressHint": "島根県松江市嫁島町13-25",
    "description": "藤原聡が地元での活動拠点として挙げたライブハウス。リハーサルを終えて外に出ると、宍道湖に沈む夕日が見えたと振り返っています。",
    "fanTip": "営業・公演予定は会場の案内を確認してください。",
    "source": "https://aztic.net/canova/",
    "historySource": "https://www.diskgarage.com/digaonline/pleasure/55307"
  },
  {
    "id": "spot-shimane-univ",
    "name": "島根大学 松江キャンパス",
    "area": "島根・松江",
    "relatedSong": "異端なスター / 犬かキャットかで死ぬまで喧嘩しよう！",
    "addressHint": "島根県松江市西川津町1060",
    "description": "島根大学の軽音楽部は結成のきっかけの一つ。メンバー全員が同じ大学の出身というわけではありません。",
    "fanTip": "訪問前に大学の交通案内を確認できます。",
    "source": "https://www.shimane-u.ac.jp/campus_maps/map_matsue.html",
    "historySource": "https://guide.line.me/ja/features-and-columns/interview001.html"
  },
  {
    "id": "spot-yonago-laughs",
    "name": "米子 AZTiC laughs",
    "area": "鳥取・米子",
    "relatedSong": "日曜日のラブレター / コーヒーとシロップ",
    "addressHint": "鳥取県米子市道笑町1丁目3 BMEビル1階",
    "description": "松江canovaと同じAZTiCが運営する山陰のライブハウス。米子で音楽に触れられる立ち寄り先です。",
    "fanTip": "ライブのある日は会場のスケジュールを確認してください。",
    "source": "https://aztic.net/laughs/",
    "historySource": ""
  },
  {
    "id": "spot-nissan-stadium",
    "name": "日産スタジアム",
    "area": "横浜・スタジアム",
    "relatedSong": "Sharon / SOULSOUP / Pretender",
    "addressHint": "神奈川県横浜市港北区小机町3300",
    "description": "LIVE at STADIUM 2025の横浜会場。2025年5月31日と6月1日に公演が組まれました。",
    "fanTip": "横浜スタジアムとは別の会場です。",
    "source": "https://www.nissan-stadium.jp/access/",
    "historySource": "https://event.higedan.com/feature/stadium_2025"
  },
  {
    "id": "spot-k-arena",
    "name": "Kアリーナ横浜",
    "area": "横浜・スタジアム",
    "relatedSong": "Subtitle / Same Blue / ミックスナッツ",
    "addressHint": "神奈川県横浜市西区みなとみらい6-2-14",
    "description": "2026年7月25日・26日のone-man tour 2026の会場です。",
    "fanTip": "公演日の入退場ルートは施設公式サイトに掲載されています。",
    "source": "https://k-arena.com/access/",
    "historySource": "https://event.higedan.com/feature/zepp2025_hall2026"
  }
];
import tourArchiveRecords from './tourArchiveRecords.json';

// 日付と会場を公開資料で照合したスナップショット（2026-11-08）。
export const TOUR_ARCHIVES: TourArchive[] = tourArchiveRecords;

// QUIZ_QUESTIONS is exported from ./quizData above.

export interface BandMemberProfile {
  id: string;
  name: string;
  nickname: string;
  role: string;
  birthplace: string;
  playStyleSummary: string;
  signatureSongId: string;
  signatureSongTitle: string;
}

export const HIGEDAN_MEMBERS: BandMemberProfile[] = [
  {
    id: 'satoshi',
    name: '藤原 聡',
    nickname: 'さとっちゃん',
    role: 'Vocal / Piano',
    birthplace: '鳥取県米子市出身',
    playStyleSummary:
      'ほとんどの楽曲の作詞・作曲を手がけるフロントマン。ブラックミュージックやジャズをルーツに持つ躍動的なピアノリフと、ハイトーンまで突き抜ける表現力豊かな歌声が特徴。',
    signatureSongId: 'subtitle',
    signatureSongTitle: 'Subtitle',
  },
  {
    id: 'daisuke',
    name: '小笹 大輔',
    nickname: '大ちゃん',
    role: 'Guitar / Chorus',
    birthplace: '島根県松江市出身',
    playStyleSummary:
      '繊細なアルペジオからハードロック直系のエモーショナルなギターソロまで自在に操るギタリスト。『115万キロのフィルム』の間奏やライブアレンジでのギターソロは必見。',
    signatureSongId: 'pretender',
    signatureSongTitle: 'Pretender',
  },
  {
    id: 'makoto',
    name: '楢﨑 誠',
    nickname: 'ならちゃん',
    role: 'Bass / Sax / Synth Bass',
    birthplace: '広島県福山市出身',
    playStyleSummary:
      'エレキベース・ウッドベース・シンセベースに加え、バリトン＆ソプラノサックスまで演奏するマルチプレイヤー。楽曲のファンクネスと温かみを支える要。',
    signatureSongId: 'editorial-song',
    signatureSongTitle: 'アポトーシス',
  },
  {
    id: 'masaki',
    name: '松浦 匡希',
    nickname: 'ちゃんまつ',
    role: 'Drums / Percussion',
    birthplace: '鳥取県米子市出身',
    playStyleSummary:
      'ジャズ・フュージョン的な細かいゴーストノートからスタジアムを揺らすパワフルなビートまで叩き分けるドラマー。複雑な変拍子や11回転調を自然に聴かせるリズムの心臓部。',
    signatureSongId: 'mixed-nuts',
    signatureSongTitle: 'ミックスナッツ',
  },
];
