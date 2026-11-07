// scripts/generateSongPages.ts から生成。公開する曲は data/ に追加する。
export const publishedSongPageIds = new Set<string>(["mixed-nuts"]);

export function songPagePath(id: string): string | null {
  return publishedSongPageIds.has(id) ? `songs/${id}/` : null;
}
