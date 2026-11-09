import { ExternalLink, Music2 } from 'lucide-react';
import { songEvidence } from '../../data/fullCatalogSongs';
import { officialVideos } from '../../songPages/songConnections';
import type { SongItem } from '../../data/higedanData';

export function officialVideoId(songId: string): string | null {
  const url = officialVideos[songId];
  return url?.match(/^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/)?.[1] ?? null;
}

export function MoodListen({ song }: { song: SongItem }) {
  const videoId = officialVideoId(song.id);
  const appleUrl = songEvidence[song.id as keyof typeof songEvidence]?.apple;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Official髭男dism ${song.title}`)}`;

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
        <Music2 aria-hidden="true" className="h-4 w-4 text-[#C83E2B]" />
        この曲を聴く
      </p>
      {videoId ? (
        <>
          <iframe
            className="aspect-video min-h-[200px] w-full rounded-xl bg-[#1C1917]"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`}
            title={`${song.title}の公式動画`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <a href={officialVideos[song.id]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A5F] underline underline-offset-2">
            YouTubeで開く <ExternalLink aria-hidden="true" className="h-3 w-3" />
          </a>
        </>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-[#1E3A5F]">
          {appleUrl && <a href={appleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">Apple Musicで聴く <ExternalLink aria-hidden="true" className="h-3 w-3" /></a>}
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2">YouTubeで検索 <ExternalLink aria-hidden="true" className="h-3 w-3" /></a>
        </div>
      )}
    </div>
  );
}
