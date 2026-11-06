import type { EraTag, SongItem, SoundTag, TourArchive } from '../data/higedanData';
import { albumForSearch, prepareSongSearch } from './songSearch';
import { ALBUM_CHRONOLOGY_RANK, songAlbums } from './songCatalog';
export { EP_TRACK_ORDER_MAP, getSongwriterCredit } from './songCatalog';

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

export function filterAndSortDiscography(
  songs: SongItem[],
  filter: DiscographyFilter
): SongItem[] {
  const rankSong = prepareSongSearch(filter.searchQuery);
  const queriedAlbum = albumForSearch(filter.searchQuery);
  const albumInOrder = filter.album && filter.album !== 'all' ? filter.album : queriedAlbum;
  const ranks = new Map<string, number>();

  const filtered = songs.filter((song) => {
    if (filter.era !== 'all' && song.era !== filter.era) {
      return false;
    }
    if (filter.album && filter.album !== 'all') {
      const album = filter.album === 'Escaparade' ? 'エスカパレード' : filter.album;
      if (!songAlbums(song).some(release => release.album === album)) return false;
    }
    if (filter.sound !== 'all' && song.sound !== filter.sound) {
      return false;
    }
    if (filter.onlyHiddenGems && !song.isHiddenGem) {
      return false;
    }
    if (rankSong) {
      const rank = rankSong(song);
      if (rank === undefined) return false;
      ranks.set(song.id, rank);
    }
    return true;
  });

  if (!filter.sortBy) {
    return filtered;
  }

  return filtered.sort((a, b) => {
    if (albumInOrder && (filter.sortBy === 'album_track_order' || (filter.sortBy === 'guide_order' && queriedAlbum))) {
      const trackA = songAlbums(a).find(release => release.album === albumInOrder)?.trackNumber ?? 99;
      const trackB = songAlbums(b).find(release => release.album === albumInOrder)?.trackNumber ?? 99;
      return trackA - trackB || a.guideOrder - b.guideOrder;
    }
    switch (filter.sortBy) {
      case 'guide_order':
        return (ranks.get(a.id) ?? 0) - (ranks.get(b.id) ?? 0) || a.guideOrder - b.guideOrder;
      case 'album_track_order': {
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
