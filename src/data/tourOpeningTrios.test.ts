import assert from 'node:assert/strict';
import test from 'node:test';
import { VERIFIED_SONG_IDS } from './fullCatalogSongs';
import { TOUR_ARCHIVES } from './tourArchivesData';
import { TOUR_OPENING_TRIO_KEYS } from './tourOpeningTrios';
import { extractCatalogSetlistEntries } from './tourSetlists';

test('TOUR_OPENING_TRIO_KEYS stays in sync with tourSetlistRecords.json and TOUR_ARCHIVES', () => {
  const expected = new Set<string>();
  for (const tour of TOUR_ARCHIVES) {
    for (const event of tour.events) {
      if (!event.hasSetlist) continue;
      const extracted = extractCatalogSetlistEntries(event.id, VERIFIED_SONG_IDS);
      if (!extracted || extracted.entries.length < 3) continue;
      expected.add(
        extracted.entries
          .slice(0, 3)
          .map((entry) => entry.songId)
          .join(','),
      );
    }
  }

  assert.deepEqual([...TOUR_OPENING_TRIO_KEYS].sort(), [...expected].sort());
});
