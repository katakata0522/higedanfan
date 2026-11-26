import type { EraTag } from './higedanTypes';

interface SongAnnouncement {
  readonly id: string;
  readonly title: string;
  readonly era: EraTag;
  readonly aliases: readonly string[];
  readonly facts: readonly string[];
  readonly sourceUrl: string;
}

// 配信前に確認できた事項を掲載する。曲別ページの生成には catalogEntries を使う。
export const songAnnouncements: readonly SongAnnouncement[] = [
  {
    id: 'evergreen',
    title: 'エバーグリーン',
    era: 'latest_2025_2026',
    aliases: ['Evergreen', 'エヴァーグリーン', 'ebagurin'],
    facts: [
      '2026年12月1日 配信予定',
      'ポケモン30周年「ポケモンとつづく」のスペシャルMV楽曲',
    ],
    sourceUrl: 'https://higedan.com/news/detail/101753',
  },
];
