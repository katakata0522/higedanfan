import type { EraTag, MoodTag, SituationTag, SoundTag } from '../data/higedanData';

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
