import { ExternalLink, Music2, Play } from 'lucide-react';
import { songEvidence } from '../../data/fullCatalogSongs';
import { officialVideoDescription, officialVideos, youtubeExternalOnlySongs } from '../../songPages/songConnections';
import type { SongItem } from '../../data/higedanData';

export function officialVideoId(songId: string): string | null {
  const url = officialVideos[songId];
  return url?.match(/^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/)?.[1] ?? null;
}

export function MoodListen({ song }: { song: SongItem }) {
  const videoId = officialVideoId(song.id);
  const appleUrl = songEvidence[song.id as keyof typeof songEvidence]?.apple;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`Official髭男dism ${song.title}`)}`;
  const description = officialVideoDescription(song.id);

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
        <Music2 aria-hidden="true" className="h-4 w-4 text-[#C83E2B]" />
        この曲を聴く
      </p>
      {videoId && youtubeExternalOnlySongs.has(song.id) ? (
        <>
          <a
            href={officialVideos[song.id]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${song.title}をYouTubeで聴く${description ? `（${description}）` : ''}（新しいタブ）`}
            className="group relative flex aspect-video min-h-[200px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#1C1917] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E2B]"
          >
            <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100" />
            <span className="relative inline-flex items-center gap-2 rounded-full bg-[#1C1917]/90 px-4 py-2.5 text-sm font-bold text-white shadow-md">
              <Play aria-hidden="true" className="h-4 w-4 fill-current" /> YouTubeで聴く <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </span>
          </a>
          {description && <p className="text-xs text-[#57534E]">{description}</p>}
          {song.id === 'bad-for-me' && appleUrl && <a href={appleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A5F] underline underline-offset-2">Apple Musicで聴く <ExternalLink aria-hidden="true" className="h-3 w-3" /></a>}
        </>
      ) : videoId ? (
        <>
          <iframe
            className="aspect-video min-h-[200px] w-full rounded-xl bg-[#1C1917]"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`}
            title={`${song.title}の公式動画・音源`}
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
