import verified from './appleMusicTracks.json';

// Apple の検索結果で収録作品・楽曲・画像を確認した組み合わせだけを使う。
export function appleMusicEmbedUrl(id: string, source: string): string | null {
  const match = verified.tracks[id as keyof typeof verified.tracks] as
    | { collectionId: string; trackId: string }
    | undefined;
  if (!match) return null;
  try {
    const url = new URL(source);
    const path = /^\/jp\/album\/[^/]+\/(\d+)$/.exec(url.pathname);
    if (url.protocol !== 'https:' || url.hostname !== 'music.apple.com' ||
        !path || path[1] !== match.collectionId || url.searchParams.get('i') !== match.trackId) return null;
    url.hostname = 'embed.music.apple.com';
    url.search = new URLSearchParams({ i: match.trackId, theme: 'light' }).toString();
    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}
