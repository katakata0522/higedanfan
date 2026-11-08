import { pitchNumber } from '../data/fullCatalogSongs';

export function fitsVoiceRange(
  fact: { low: string; chest: string },
  low: number | undefined,
  high: number | undefined,
  keyShift: number,
): boolean {
  if (low !== undefined && high !== undefined && low > high) return false;
  return (low === undefined || pitchNumber(fact.low) + keyShift >= low)
    && (high === undefined || pitchNumber(fact.chest) + keyShift <= high);
}
