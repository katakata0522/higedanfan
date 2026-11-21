import tourArchiveRecords from './tourArchiveRecords.json';
import type { TourArchive } from './higedanTypes';

// 日付・会場・公演セットリストを公式資料と公開記録で照合・収録したスナップショット（2026-11-16）。
export const TOUR_ARCHIVES: TourArchive[] = tourArchiveRecords as TourArchive[];
