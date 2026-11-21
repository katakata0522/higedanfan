import type { EditorialSource } from '../EditorialSongPageData';

export type SongEditorial = {
  feature: string;
  featureCredit?: string;
  featureKind?: 'editorial' | 'lyric-quote';
  featureCiteUrl?: string;
  paragraphs: readonly string[];
  sources: readonly EditorialSource[];
};
