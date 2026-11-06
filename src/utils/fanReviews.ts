import type { FanReview } from '../data/higedanData';
import { sanitizeSafeId, sanitizeUserText } from './userInput';

export function validateReviewInput(input: {
  author: string;
  songId: string;
  title: string;
  comment: string;
}): {
  valid: boolean;
  error?: string;
  sanitized?: { author: string; songId: string; title: string; comment: string };
} {
  const cleanAuthor = sanitizeUserText(input.author, 30);
  const cleanSongId = sanitizeSafeId(input.songId, 40);
  const cleanTitle = sanitizeUserText(input.title, 60);
  const cleanComment = sanitizeUserText(input.comment, 400);

  if (cleanAuthor.length < 2) {
    return { valid: false, error: 'ニックネームを2文字以上（30文字以内）で入力してください。' };
  }
  if (cleanSongId.length === 0) {
    return { valid: false, error: 'レビュー対象の楽曲を選択してください。' };
  }
  if (cleanTitle.length < 3) {
    return { valid: false, error: 'ひとこと見出しを3文字以上（60文字以内）で入力してください。' };
  }
  if (cleanComment.length < 10) {
    return { valid: false, error: '感想・考察コメントを10文字以上（400文字以内）で入力してください。' };
  }
  return {
    valid: true,
    sanitized: {
      author: cleanAuthor,
      songId: cleanSongId,
      title: cleanTitle,
      comment: cleanComment,
    },
  };
}

export function sanitizeReviewsList(
  rawReviews: unknown,
  validSongIds: Set<string>
): FanReview[] | null {
  if (!Array.isArray(rawReviews)) return null;
  const allowedCategories = new Set(['歌詞考察', 'ライブ体験', '楽曲アレンジ', '人生の支え']);
  const safe: FanReview[] = [];

  for (const item of rawReviews) {
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const author = sanitizeUserText(String(r.author ?? ''), 30);
    const songId = sanitizeSafeId(String(r.songId ?? ''), 40);
    const title = sanitizeUserText(String(r.title ?? ''), 60);
    const comment = sanitizeUserText(String(r.comment ?? ''), 400);
    const category = String(r.category ?? '歌詞考察');

    if (
      author.length >= 2 &&
      validSongIds.has(songId) &&
      title.length >= 3 &&
      comment.length >= 10 &&
      allowedCategories.has(category)
    ) {
      safe.push({
        id: sanitizeSafeId(String(r.id ?? `rev-${safe.length}`), 40) || `rev-${safe.length}`,
        author,
        fanTenure: sanitizeUserText(String(r.fanTenure ?? 'ファン歴 3〜5年'), 30),
        songId,
        category: category as FanReview['category'],
        title,
        comment,
        postedAt: sanitizeUserText(String(r.postedAt ?? '2026.11.05'), 20),
        likes: Math.max(0, Math.min(99999, Number(r.likes) || 0)),
      });
    }
  }
  return safe.length > 0 ? safe : null;
}
