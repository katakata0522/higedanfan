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
  tieUps: { text: string; source: string; searchAliases?: string[] }[];
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

export type SacredSpotCategory = 'MVロケ地' | 'メンバーの思い出' | 'メンバーのおすすめ' | 'ライブ会場' | '街とヒゲダン';

export interface SacredSpot {
  id: string;
  name: string;
  area: string;
  categories: SacredSpotCategory[];
  categoryLabel?: string;
  // areaは広域の目安、noneは地図での訪問案内をしない場所。
  mapScope?: 'area' | 'none';
  mapAreaNote?: string;
  relatedSong: string;
  relatedSongLabel?: string;
  addressHint: string;
  description: string;
  fanTip: string;
  source: string;
  historySource?: string;
  historySourceLabel?: string;
  additionalSources?: { label: string; url: string }[];
}

export interface HistoricalSacredSpot {
  id: string;
  name: string;
  area: string;
  categories: SacredSpotCategory[];
  status: string;
  description: string;
  sources: { label: string; url: string }[];
}

export interface TourSetlistTrack {
  title: string;
  songId?: string;
  artist?: string;
  isEncore?: boolean;
  note?: string;
}

export interface TourCoArtistSetlist {
  artist: string;
  orderLabel?: string;
  tracks: TourSetlistTrack[];
  note?: string;
}

export interface TourEventRecord {
  id: string;
  date: string;
  venue: string;
  label?: string;
  hasSetlist: boolean;
  trackCount: number;
}

export type TourArchiveCategory = 'tour' | 'one_man' | 'online_fc' | 'free_special' | 'two_man';

export interface TourArchive {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  tourTitle: string;
  category?: TourArchiveCategory;
  coArtists?: string[];
  officialSourceUrl?: string;
  events: TourEventRecord[];
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

export interface BandMemberProfile {
  id: string;
  name: string;
  nickname: string;
  role: string;
  birthplace: string;
  headline: string;
  biography: string;
  extra: string;
  sourceLinks: { label: string; url: string }[];
  signatureSongId: string;
  signatureSongTitle: string;
}

export type { QuizQuestion, QuizSourceItem } from './quizData';
