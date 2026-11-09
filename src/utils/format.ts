import { isTempoUnderReview } from '../data/tempoReviewStatus.ts';

export function formatDateDot(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(Number(seconds) || 0));
  const mins = Math.floor(safeSec / 60);
  const secs = safeSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 資料の数値は保持し、比較しやすいよう表示だけ整数の目安にする。
export function formatApproxBpm(bpm: number): string {
  return `約${Math.round(bpm)}`;
}

export function formatSongBpm(songId: string, bpm: number): string {
  return isTempoUnderReview(songId) ? '調査中' : formatApproxBpm(bpm);
}
