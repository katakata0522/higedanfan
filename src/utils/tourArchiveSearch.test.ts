import test from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_ARCHIVES } from '../data/higedanData';
import { createTourArchiveSearch } from './tourArchiveSearch';

test('tour search accepts the displayed date and common date formats', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  for (const query of ['2023-02-15', '2023.02.15', '2023/02/15', '２０２３．０２．１５']) {
    const events = search(query).flatMap(result => result.events);
    assert.deepEqual(events.map(event => `${event.date} ${event.venue}`), ['2023-02-15 日本武道館']);
  }
});

test('tour search preserves title, venue, empty and no-match searches', () => {
  const search = createTourArchiveSearch(TOUR_ARCHIVES);
  assert.equal(search('  shocking nuts  ')[0]?.events.length, 21);
  assert.equal(search('武道館').flatMap(result => result.events).length, 6);
  assert.equal(search('').length, TOUR_ARCHIVES.length);
  assert.deepEqual(search('該当しない会場名'), []);
});
