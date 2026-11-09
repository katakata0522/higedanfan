import type { SituationTag, SongItem } from '../../data/higedanData';
import { editorialArticles } from '../../songPages/editorialArticles';
import type { CompleteMoodCriteria } from './moodSession';
import { moodSongCopy } from './moodSongCopy';

const listeningInvitations: Record<SituationTag, string> = {
  morning_commute: '一日のはじまりに',
  late_night_alone: 'ひとりの時間に',
  live_warmup: 'ライブ前やドライブで',
  weekend_walk: '散歩やひと息つく時間に',
};

/** 曲ごとの紹介と聴きどころを、選んだ場面につなげる。 */
export function moodResultCopy(song: SongItem, criteria: CompleteMoodCriteria) {
  const article = editorialArticles[song.id];
  const copy = moodSongCopy[song.id];
  const scene = song.situations.includes(criteria.situation) ? listeningInvitations[criteria.situation] : '';
  const cue = copy?.[1];
  const closings = cue ? [
    `${cue}にも耳を傾けてみて。`,
    `${cue}も楽しんでみませんか。`,
    `${cue}にも注目してみて。`,
    `${cue}を追いかけてみてください。`,
  ] : [];
  return {
    feature: song.id === 'sweet-tweet' ? '電話越しに、ふくらむ恋心。' : article?.feature ?? '',
    introduction: copy?.[0] ?? article?.paragraphs[0] ?? 'この曲から、ヒゲダンの音楽を楽しんでみてください。',
    invitation: cue ? `${scene ? `${scene}、` : ''}${closings[song.guideOrder % closings.length]}` : '',
  };
}
