// 資料の差が大きい、または候補の採用を保留している曲。
// 元の参考値と出典は songEvidence に残し、表示や集計では使わない。
const temposUnderReview = new Set([
  'same-blue',
  'lady-song',
  'travelers-outro',
  'editorial-title-track',
  'natsumoyou-no-neko',
  'knit-no-boushi',
  'elderflower',
]);

export function isTempoUnderReview(songId: string): boolean {
  return temposUnderReview.has(songId);
}
