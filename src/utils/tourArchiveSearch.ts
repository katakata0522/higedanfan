import type { TourArchive } from '../data/higedanData';

// The site displays dates with dots, while the source records use hyphens.
// Accept either representation, slash-separated dates, and full-width input.
function normalizeTourSearch(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('ja').replace(/(\d)[./](?=\d)/g, '$1-');
}

export function createTourArchiveSearch(tours: readonly TourArchive[]) {
  const index = tours.map(tour => ({
    tour,
    events: tour.events.map(event => ({
      event,
      text: normalizeTourSearch(`${tour.tourTitle} ${event.date} ${event.venue}`),
    })),
  }));

  return (query: string) => {
    const needle = normalizeTourSearch(query);
    return index.map(({ tour, events }) => ({
      tour,
      events: events.filter(({ text }) => text.includes(needle)).map(({ event }) => event),
    })).filter(({ events }) => events.length > 0);
  };
}
