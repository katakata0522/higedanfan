import type { SongItem } from '../../data/higedanData';
import { editorialArticles } from '../../songPages/editorialArticles';
import { moodSongCopy } from './moodSongCopy';

const featureOverrides: Record<string, string> = {
  'sweet-tweet': '電話越しに、ふくらむ恋心。',
  'editorial-title-track': '声と電子音で結ぶ、アルバムの序文。',
};

/** 曲ごとの紹介と聴きどころを返す。 */
export function moodResultCopy(song: SongItem) {
  const article = editorialArticles[song.id];
  const copy = moodSongCopy[song.id];
  const cue = copy?.[1];
  return {
    feature: featureOverrides[song.id] ?? article?.feature ?? '',
    introduction: copy?.[0] ?? article?.paragraphs[0] ?? 'この曲から、ヒゲダンの音楽を楽しんでみてください。',
    invitation: cue ?? '',
  };
}
