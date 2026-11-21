import React from 'react';
import { isPlainLeftClick, tabPath } from '../config/siteFeatures';
import type { SetlistEntry } from '../utils/setlist';
import { TourArchiveSection } from './TourArchiveSection';

interface TourArchivePageProps {
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
  validSongIds: ReadonlySet<string>;
  hasSetlistItems: boolean;
  currentSetlistTitle: string;
  onCreateSetlistFromTour: (entries: SetlistEntry[], title: string) => void;
  onOpenPrivacy: () => void;
  resetEpoch: string;
}

export const TourArchivePage: React.FC<TourArchivePageProps> = ({
  attendedTourIds,
  onToggleAttendedTour,
  validSongIds,
  hasSetlistItems,
  currentSetlistTitle,
  onCreateSetlistFromTour,
  onOpenPrivacy,
  resetEpoch,
}) => {
  const handlePrivacyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(e)) return;
    e.preventDefault();
    onOpenPrivacy();
  };

  return (
    <section
      id="section-setlist"
      aria-labelledby="setlist-heading"
      className="py-4 sm:py-5"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pb-3 border-b border-[#e5dccb]">
          <h1
            id="setlist-heading"
            className="font-note-serif text-xl sm:text-2xl font-bold tracking-[.04em] text-[#253331]"
          >
            歴代ツアー・公演記録
          </h1>
        </div>

        <TourArchiveSection
          attendedTourIds={attendedTourIds}
          onToggleAttendedTour={onToggleAttendedTour}
          validSongIds={validSongIds}
          hasSetlistItems={hasSetlistItems}
          currentSetlistTitle={currentSetlistTitle}
          onCreateSetlistFromTour={onCreateSetlistFromTour}
          resetEpoch={resetEpoch}
        />

        <p className="mt-4 text-center text-[11px] text-[#68625C]">
          ※ 参戦・視聴の記録はお使いのブラウザ内に保存されます（バックアップ・初期化は{' '}
          <a
            href={tabPath('privacy', import.meta.env.BASE_URL)}
            onClick={handlePrivacyClick}
            className="underline underline-offset-2 hover:text-[#1C1917]"
          >
            プライバシーポリシー
          </a>{' '}
          から）。
        </p>
      </div>
    </section>
  );
};
