import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogEntries } from './catalogEntries';
import { songAppleArtwork } from './songAppleArtwork';
import { songStreamingLinks } from './songStreamingLinks';

test('all 90 catalog songs have verified Spotify and Amazon Music streaming links', () => {
  const catalogIds = catalogEntries.map((song) => song.id);
  const linkIds = Object.keys(songStreamingLinks);

  assert.equal(linkIds.length, catalogIds.length);
  assert.deepEqual([...linkIds].sort(), [...catalogIds].sort());

  for (const id of catalogIds) {
    const entry = songStreamingLinks[id];
    const apple = songAppleArtwork[id];
    assert.ok(entry, `${id} missing streaming entry`);
    assert.ok(apple?.appleUrl.startsWith('https://music.apple.com/'), `${id} invalid Apple Music URL`);
    assert.match(
      entry.spotifyUrl,
      /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/,
      `${id} invalid Spotify track URL: ${entry.spotifyUrl}`,
    );
    assert.match(
      entry.amazonUrl,
      /^https:\/\/music\.amazon\.co\.jp\/(?:tracks\/[A-Z0-9]{10}|albums\/[A-Z0-9]{10}\?trackAsin=[A-Z0-9]{10})$/,
      `${id} invalid Amazon Music URL: ${entry.amazonUrl}`,
    );
  }
});
