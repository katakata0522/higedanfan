import type { EraTag, SoundTag } from '../data/higedanData';

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
