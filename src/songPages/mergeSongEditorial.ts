import { songEvidence } from '../data/fullCatalogSongs';
import type { EditorialSongPageData, EditorialSource } from './EditorialSongPageData';
import type { SongEditorial } from './editorial/types';

// These pairs were checked against the publishers and lead to the same article.
const sourceUrlAliases: Record<string, string> = {
  'https://music.fanplus.co.jp/liveReport/20160707916e0854e': 'https://music.fanplus.co.jp/news/20160707916e0854e',
  'https://music.fanplus.co.jp/special/20170309557e046cb': 'https://music.fanplus.co.jp/news/20170309557e046cb',
  'https://realsound.jp/2016/10/post-9916_2.html/amp': 'https://realsound.jp/2016/10/post-9916_2.html',
};

export function mergeSongEditorial(
  page: EditorialSongPageData,
  article?: SongEditorial,
): EditorialSongPageData {
  if (!article) return page;

  const fact = songEvidence[page.id as keyof typeof songEvidence];
  const pageSources = page.sources.filter(
    original => !(original.evidence === 'styleSource' && original.purpose === '曲調の参考'),
  );

  const sources: EditorialSource[] = [];
  const sourceIndices = new Map<string, number>();
  const sourcePurposes = new Map<string, Set<string>>();
  for (const original of [...article.sources, ...pageSources]) {
    const rawUrl = original.evidence ? fact?.[original.evidence] : original.url;
    const aliasedUrl = rawUrl && sourceUrlAliases[rawUrl] ? sourceUrlAliases[rawUrl] : rawUrl;
    const source: EditorialSource = !original.evidence && aliasedUrl && aliasedUrl !== original.url
      ? { ...original, url: aliasedUrl }
      : original;
    const duplicate = aliasedUrl ? sourceIndices.get(aliasedUrl) : undefined;
    if (duplicate === undefined) {
      if (aliasedUrl) {
        sourceIndices.set(aliasedUrl, sources.length);
        sourcePurposes.set(aliasedUrl, new Set([source.purpose]));
      }
      sources.push(source);
    } else if (aliasedUrl && !sourcePurposes.get(aliasedUrl)?.has(source.purpose)) {
      sourcePurposes.get(aliasedUrl)?.add(source.purpose);
      sources[duplicate] = {
        ...sources[duplicate],
        purpose: `${sources[duplicate].purpose}・${source.purpose}`,
      };
    }
  }
  return {
    ...page,
    feature: {
      text: article.feature,
      credit: article.featureCredit ?? '— 楽曲ガイドより',
      kind: article.featureKind ?? 'editorial',
      ...(article.featureCiteUrl ? { citeUrl: article.featureCiteUrl } : {}),
    },
    overview: article.paragraphs,
    sources,
  };
}
