import React from 'react';
import type { SetlistEntry } from '../utils/setlist';
import { TourArchiveSection } from './TourArchiveSection';

interface TourArchivePageProps {
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
  validSongIds: ReadonlySet<string>;
  hasSetlistItems: boolean;
  currentSetlistTitle: string;
  onCreateSetlistFromTour: (entries: SetlistEntry[], title: string) => void;
  onOpenPrivacy?: () => void;
  resetEpoch: string;
}

export const TourArchivePage: React.FC<TourArchivePageProps> = ({
  attendedTourIds,
  onToggleAttendedTour,
  validSongIds,
  hasSetlistItems,
  currentSetlistTitle,
  onCreateSetlistFromTour,
  resetEpoch,
}) => (
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
    </div>
  </section>
);
