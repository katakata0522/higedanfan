import { editorialArticles } from './editorialArticles';
import type { EditorialSongPageData, EditorialSource } from './EditorialSongPageData';

// These pairs were checked against the publishers and lead to the same article.
const sourceUrlAliases: Record<string, string> = {
  'https://music.fanplus.co.jp/liveReport/20160707916e0854e': 'https://music.fanplus.co.jp/news/20160707916e0854e',
  'https://realsound.jp/2016/10/post-9916_2.html/amp': 'https://realsound.jp/2016/10/post-9916_2.html',
};

export function applySongEditorial(page: EditorialSongPageData): EditorialSongPageData {
  const article = editorialArticles[page.id];
  if (!article) return page;

  const sources: EditorialSource[] = [];
  const sourceIndices = new Map<string, number>();
  const sourcePurposes = new Map<string, Set<string>>();
  for (const original of [...article.sources, ...page.sources]) {
    const source = original.url && sourceUrlAliases[original.url]
      ? { ...original, url: sourceUrlAliases[original.url] }
      : original;
    const duplicate = source.url ? sourceIndices.get(source.url) : undefined;
    if (duplicate === undefined) {
      if (source.url) {
        sourceIndices.set(source.url, sources.length);
        sourcePurposes.set(source.url, new Set([source.purpose]));
      }
      sources.push(source);
    } else if (source.url && !sourcePurposes.get(source.url)?.has(source.purpose)) {
      sourcePurposes.get(source.url)?.add(source.purpose);
      sources[duplicate] = { ...sources[duplicate], purpose: `${sources[duplicate].purpose}・${source.purpose}` };
    }
  }
  return {
    ...page,
    feature: { text: article.feature, credit: '— 楽曲ガイドより' },
    overview: article.paragraphs,
    sources,
  };
}
