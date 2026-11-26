import type { EraTag } from './higedanTypes';
import records from './songAnnouncementRecords.json';

interface SongAnnouncement {
  readonly id: string;
  readonly title: string;
  readonly era: EraTag;
  readonly aliases: readonly string[];
  readonly facts: readonly string[];
  readonly sourceUrl: string;
}

// 配信前に確認できた事項を掲載する。曲別ページの生成には catalogEntries を使う。
export const songAnnouncements = records as readonly SongAnnouncement[];
