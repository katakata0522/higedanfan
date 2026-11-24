import React from 'react';
import type { SongItem } from '../../data/higedanTypes';
import { QuizSourceArchive } from './QuizSourceArchive';

interface QuizSourceArchivePageProps {
  songs: SongItem[];
  onSelectSong?: (song: SongItem) => void;
  resetEpoch?: string;
}

export const QuizSourceArchivePage: React.FC<QuizSourceArchivePageProps> = ({
  songs,
  onSelectSong,
  resetEpoch = '',
}) => (
  <section
    id="section-quiz"
    aria-labelledby="quiz-heading"
    className="py-4 sm:py-5"
  >
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="pb-3 border-b border-[#e5dccb]">
        <h1
          id="quiz-heading"
          className="font-note-serif text-xl sm:text-2xl font-bold tracking-[.04em] text-[#253331]"
        >
          参考記事・インタビュー・SNS
        </h1>
      </div>

      <QuizSourceArchive visible songs={songs} onSelectSong={onSelectSong} resetEpoch={resetEpoch} />
    </div>
  </section>
);
