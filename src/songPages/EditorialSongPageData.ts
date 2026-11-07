export type EvidenceSource = 'apple' | 'cdSource' | 'rangeSource' | 'tempoSource' | 'styleSource';

export type EditorialSource = {
  label: string;
  purpose: string;
} & (
  | { url: string; evidence?: never }
  | { evidence: EvidenceSource; url?: never }
);

export interface EditorialSongPageData {
  id: string;
  artwork: { path: string; alt: string } | { theme: string; alt: string };
  feature: { text: string; credit: string };
  overview: readonly string[];
  rangeNote?: string;
  vocalVariants?: readonly { label: string; value: string; sourceLabel: string; sourceUrl: string }[];
  albumTrack?: number;
  sources: readonly EditorialSource[];
  sourceCaveat: string;
}
