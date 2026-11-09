import type { SituationTag, SongItem } from '../../data/higedanData';
import { editorialArticles } from '../../songPages/editorialArticles';
import type { CompleteMoodCriteria } from './moodSession';

const listeningInvitations: Record<SituationTag, string> = {
  morning_commute: '一日のはじまりに、聴いてみませんか。',
  late_night_alone: 'ひとりで過ごす夜に、ゆっくり聴いてみませんか。',
  live_warmup: '出かける前に、音を鳴らしてみませんか。',
  weekend_walk: 'ひと息つく時間のおともに、どうぞ。',
};

/** Reuse the song guide's own descriptions, and only suggest a scene tagged for this song. */
export function moodResultCopy(song: SongItem, criteria: CompleteMoodCriteria) {
  const article = editorialArticles[song.id];
  return {
    feature: article?.feature ?? '',
    introduction: article?.paragraphs[0] ?? 'この曲から、ヒゲダンの音楽を楽しんでみてください。',
    invitation: song.situations.includes(criteria.situation) ? listeningInvitations[criteria.situation] : '',
  };
}
