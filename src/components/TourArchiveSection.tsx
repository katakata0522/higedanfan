import { useMemo, useState } from 'react';
import { Ticket } from 'lucide-react';
import { TOUR_ARCHIVES } from '../data/higedanData';
import { sortTourArchives } from '../utils/fanLogic';
import { createTourArchiveSearch } from '../utils/tourArchiveSearch';

interface TourArchiveSectionProps {
  attendedTourIds: string[];
  onToggleAttendedTour: (tourId: string) => void;
}

const displayDate = (date: string) => date.replaceAll('-', '.');
const concertCount = TOUR_ARCHIVES.reduce((count, tour) => count + tour.events.length, 0);

export function TourArchiveSection({ attendedTourIds, onToggleAttendedTour }: TourArchiveSectionProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [query, setQuery] = useState('');
  const tours = useMemo(() => sortTourArchives(TOUR_ARCHIVES, sortOrder), [sortOrder]);
  const searchTours = useMemo(() => createTourArchiveSearch(tours), [tours]);
  const matchingTours = useMemo(() => searchTours(query), [searchTours, query]);

  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-xl border border-[#E6E1D6] bg-white p-4 text-sm text-[#57534E]">
        <p><strong className="text-[#1C1917]">公演記録：{TOUR_ARCHIVES.length}シリーズ・{concertCount}公演</strong>（2026年11月8日確認）。公演日と会場は<a className="underline" href="https://liverepo.katakatalab.com/" target="_blank" rel="noreferrer">LiveRepo</a>の公開記録を、<a className="underline" href="https://higedan-setlist.net/" target="_blank" rel="noreferrer">ヒゲダンセトリ</a>の公演一覧と照合しました。2016年の3公演は公式告知とも照合しています。</p>
        <p className="mt-2">セトリが掲載されている公演だけリンクを表示します。リンク先の曲順は各資料の記録であり、当サイトが公演音源と照合したものではありません。「参戦・視聴」はツアー単位の個人メモです。</p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-[#E6E1D6] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold text-[#1C1917]">
          日付・会場を探す
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="例：2025-05-31 / 日産スタジアム"
            className="min-w-0 flex-1 rounded-lg border border-[#D5CEC2] px-3 py-2 font-normal"
          />
        </label>
        <div className="flex gap-1 rounded-lg bg-[#F2EFE9] p-1" role="group" aria-label="開催順">
          <button type="button" aria-pressed={sortOrder === 'newest'} onClick={() => setSortOrder('newest')} className={`rounded-md px-3 py-2 text-xs font-bold ${sortOrder === 'newest' ? 'bg-[#1C1917] text-white' : 'text-[#57534E]'}`}>新しい順</button>
          <button type="button" aria-pressed={sortOrder === 'oldest'} onClick={() => setSortOrder('oldest')} className={`rounded-md px-3 py-2 text-xs font-bold ${sortOrder === 'oldest' ? 'bg-[#1C1917] text-white' : 'text-[#57534E]'}`}>古い順</button>
        </div>
      </div>

      {matchingTours.length === 0 && <p className="rounded-xl bg-white p-5 text-sm">該当する公演はありません。</p>}
      <div className="space-y-3">
        {matchingTours.map(({ tour, events }) => {
          const attended = attendedTourIds.includes(tour.id);
          return (
            <article key={tour.id} className="rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#C83E2B]">{displayDate(tour.startDate)} — {displayDate(tour.endDate)} · {tour.events.length}公演</p>
                  <h3 className="mt-1 text-base font-bold text-[#1C1917] sm:text-lg">{tour.tourTitle}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-[#1E3A5F]">
                    <a className="underline" href={tour.crossCheckUrl} target="_blank" rel="noreferrer">公演一覧の照合資料 ↗</a>
                    {tour.officialSourceUrl && tour.officialSourceUrl !== tour.crossCheckUrl && <a className="underline" href={tour.officialSourceUrl} target="_blank" rel="noreferrer">公式資料 ↗</a>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAttendedTour(tour.id)}
                  aria-pressed={attended}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${attended ? 'bg-[#15803D] text-white' : 'border border-[#D5CEC2] text-[#1C1917]'}`}
                >
                  <Ticket className="h-4 w-4" />
                  {attended ? '参戦・視聴を記録済み' : 'このシリーズを観た'}
                </button>
              </div>
              <details className="mt-4 border-t border-[#E6E1D6] pt-3" open={Boolean(query)}>
                <summary className="cursor-pointer text-sm font-bold text-[#1C1917]">公演日・会場とセトリ資料を見る（{events.length}件）</summary>
                <ul className="mt-3 divide-y divide-[#E6E1D6] text-sm">
                  {events.map(event => {
                    const setlistUrl = event.liveRepoHasSetlist ? event.liveRepoUrl : event.crossCheckSetlistUrl;
                    return (
                      <li key={`${event.date}-${event.venue}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <time dateTime={event.date} className="font-mono-num font-bold text-[#1C1917]">{displayDate(event.date)}</time>
                          <span className="ml-3 text-[#292524]">{event.venue}</span>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs">
                          <a href={event.liveRepoUrl} target="_blank" rel="noreferrer" className="text-[#1E3A5F] underline">{event.liveRepoHasSetlist ? '公演・セトリを見る ↗' : '公演詳細 ↗'}</a>
                          {!event.liveRepoHasSetlist && (setlistUrl ? <a href={setlistUrl} target="_blank" rel="noreferrer" className="font-bold text-[#1E3A5F] underline">別資料のセトリを見る ↗</a> : <span className="text-[#78716C]">セトリ未確認</span>)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </details>
            </article>
          );
        })}
      </div>
    </div>
  );
}
