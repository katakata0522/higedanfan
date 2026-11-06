import type { EraTag, SongItem, SoundTag, TourArchive } from '../data/higedanData';
import { sanitizeUserText } from './userInput';

export type DiscographySortOption =
  | 'guide_order'
  | 'album_track_order'
  | 'popular'
  | 'newest'
  | 'release_oldest'
  | 'highest_note'
  | 'vocal_span'
  | 'bpm';

export interface DiscographyFilter {
  era: EraTag | 'all';
  album?: string; // 'all' or exact album title
  sound: SoundTag | 'all';
  searchQuery: string;
  onlyHiddenGems?: boolean;
  sortBy?: DiscographySortOption;
}

const ALBUM_CHRONOLOGY_RANK: Record<string, number> = {
  'ラブとピースは君の中': 1,
  'MAN IN THE MIRROR': 2,
  "What's Going On? EP": 3,
  'レポート': 4,
  'エスカパレード': 5,
  Escaparade: 5,
  'Stand By You EP': 6,
  Traveler: 7,
  'HELLO EP': 8,
  Editorial: 9,
  'ミックスナッツ EP': 10,
  Rejoice: 11,
  'Single / 2024-2026 Collection': 12,
};

export const EP_TRACK_ORDER_MAP: Record<string, Record<string, number>> = {
  'Stand By You EP': {
    'stand-by-you': 1,
    'fire-ground': 2,
    'bad-for-me': 3,
  },
  'HELLO EP': {
    'hello-song': 1,
    'parabola-song': 2,
    'laughter-song': 3,
    'natsumoyou-no-neko': 4,
  },
  'ミックスナッツ EP': {
    'mixed-nuts': 1,
    // The EP has the single version; the guide covers the Rejoice recording.
    'choral-a-song': 3,
    'hagan-song': 4,
  },
};

export function filterAndSortDiscography(
  songs: SongItem[],
  filter: DiscographyFilter
): SongItem[] {
  const query = sanitizeUserText(filter.searchQuery, 60).toLowerCase();

  const filtered = songs.filter((song) => {
    if (filter.era !== 'all' && song.era !== filter.era) {
      return false;
    }
    if (filter.album && filter.album !== 'all') {
      const epMap = EP_TRACK_ORDER_MAP[filter.album];
      if (epMap) {
        if (!(song.id in epMap)) return false;
      } else if (filter.album === 'エスカパレード' || filter.album === 'Escaparade') {
        if (song.album !== 'エスカパレード' && song.album !== 'Escaparade') return false;
      } else if (song.album !== filter.album) {
        return false;
      }
    }
    if (filter.sound !== 'all' && song.sound !== filter.sound) {
      return false;
    }
    if (filter.onlyHiddenGems && !song.isHiddenGem) {
      return false;
    }
    if (query.length > 0) {
      const haystack = [
        song.title,
        song.album,
        song.tieUp,
        song.musicalHighlight,
        song.linerNotes,
        song.vocalRange?.highestChestNote ?? '',
        song.vocalRange?.lowestNote ?? '',
        song.vocalRange?.highNoteSection ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }
    return true;
  });

  if (!filter.sortBy) {
    return filtered;
  }

  return filtered.sort((a, b) => {
    switch (filter.sortBy) {
      case 'guide_order':
        return a.guideOrder - b.guideOrder;
      case 'album_track_order': {
        if (filter.album && EP_TRACK_ORDER_MAP[filter.album]) {
          const epMap = EP_TRACK_ORDER_MAP[filter.album];
          return (epMap[a.id] ?? 99) - (epMap[b.id] ?? 99);
        }
        const albumRankA = ALBUM_CHRONOLOGY_RANK[a.album] ?? 99;
        const albumRankB = ALBUM_CHRONOLOGY_RANK[b.album] ?? 99;
        if (albumRankA !== albumRankB) return albumRankA - albumRankB;
        return (a.trackNumber ?? 99) - (b.trackNumber ?? 99) || a.guideOrder - b.guideOrder;
      }
      case 'popular':
        return b.votes.overall - a.votes.overall;
      case 'newest':
        return (
          b.releaseDate.localeCompare(a.releaseDate) ||
          (a.trackNumber ?? 99) - (b.trackNumber ?? 99) ||
          a.guideOrder - b.guideOrder
        );
      case 'release_oldest':
        return (
          a.releaseDate.localeCompare(b.releaseDate) ||
          (a.trackNumber ?? 99) - (b.trackNumber ?? 99) ||
          a.guideOrder - b.guideOrder
        );
      case 'highest_note':
        return (
          b.vocalRange.chestSemitoneScore - a.vocalRange.chestSemitoneScore ||
          b.vocalRange.rangeSpanSemitones - a.vocalRange.rangeSpanSemitones ||
          a.guideOrder - b.guideOrder
        );
      case 'vocal_span':
        return (
          b.vocalRange.rangeSpanSemitones - a.vocalRange.rangeSpanSemitones ||
          b.vocalRange.chestSemitoneScore - a.vocalRange.chestSemitoneScore ||
          a.guideOrder - b.guideOrder
        );
      case 'bpm':
        return b.bpm - a.bpm || b.votes.overall - a.votes.overall;
      default:
        return 0;
    }
  });
}

export function sortTourArchives(
  tours: TourArchive[],
  order: 'newest' | 'oldest'
): TourArchive[] {
  return [...tours].sort((a, b) => {
    if (order === 'newest') {
      return b.startDate.localeCompare(a.startDate);
    }
    return a.startDate.localeCompare(b.startDate);
  });
}

const SONGWRITER_CREDIT_MAP: Record<string, string> = {
  rowan: '作詞・作曲：小笹大輔',
  'rowan-song': '作詞・作曲：小笹大輔',
  Rowan: '作詞・作曲：小笹大輔',
  'bedroom-talk': '作詞・作曲：小笹大輔',
  'bedroom-talk-song': '作詞・作曲：小笹大輔',
  'Bedroom Talk': '作詞・作曲：小笹大輔',
  'tabi-wa-michizure': '作詞・作曲：楢﨑誠',
  'tabi-wa-michizure-song': '作詞・作曲：楢﨑誠',
  '旅は道連れ': '作詞・作曲：楢﨑誠',
  'midori-no-ameyoke': '作詞・作曲：楢﨑誠',
  'midori-no-ameyoke-song': '作詞・作曲：楢﨑誠',
  'midori-no-amayoke': '作詞・作曲：楢﨑誠',
  'みどりの雨避け': '作詞・作曲：楢﨑誠',
  'choral-a': '作詞・作曲：楢﨑誠',
  'choral-a-song': '作詞・作曲：楢﨑誠',
  'Choral A': '作詞・作曲：楢﨑誠',
  // https://www.jasrac.or.jp/magazine/jasrac-awards/21/210519.html
  pretender: '作詞・作曲：藤原聡',
  filament: '作詞・作曲：松浦匡希・藤原聡',
  'filament-song': '作詞・作曲：松浦匡希・藤原聡',
  'フィラメント': '作詞・作曲：松浦匡希・藤原聡',
};

export function getSongwriterCredit(
  song: Pick<SongItem, 'id'> & { title?: string }
): string {
  return (
    SONGWRITER_CREDIT_MAP[song.id] ??
    (song.title ? SONGWRITER_CREDIT_MAP[song.title] : undefined) ??
    '作者情報未確認'
  );
}
