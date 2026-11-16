import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS, TOUR_ARCHIVES } from './higedanData';
import { getTourEventSetlist } from './tourSetlists';
import { publishedSongPageIds } from '../songPages/publishedSongPageIds';

test('every tour archive event with hasSetlist resolves to valid catalog song IDs and accurate trackCount', () => {
  const validCatalogIds = new Set(HIGEDAN_SONGS.map(song => song.id));
  const seenEventIds = new Set<string>();
  let totalWithSetlist = 0;

  for (const tour of TOUR_ARCHIVES) {
    for (const event of tour.events) {
      assert.equal(seenEventIds.has(event.id), false, `Duplicate event id: ${event.id}`);
      seenEventIds.add(event.id);
      const data = getTourEventSetlist(event.id);

      if (event.hasSetlist) {
        totalWithSetlist++;
        assert.ok(data, `Missing setlist bundle for ${event.id}`);
        assert.equal(data.tracks.length, event.trackCount, `trackCount mismatch for ${event.id}`);
        for (const track of data.tracks) {
          assert.ok(track.title.trim().length > 0, `Blank track title in ${event.id}`);
          if (track.songId) {
            assert.ok(validCatalogIds.has(track.songId), `Invalid catalog songId ${track.songId} in ${event.id}`);
            assert.ok(publishedSongPageIds.has(track.songId), `Missing published page for ${track.songId}`);
          }
        }
      } else {
        assert.equal(event.trackCount, 0, `Unexpected trackCount on unconfirmed ${event.id}`);
        assert.equal(data, null, `Unexpected setlist bundle for unconfirmed ${event.id}`);
      }
    }
  }

  assert.equal(seenEventIds.size, 251);
  assert.equal(totalWithSetlist, 200);
});

test('cross-checked fact fixes are applied across Rejoice, 2026 tour, and ASIA TOUR 2026', () => {
  const rejoiceNagoya2 = getTourEventSetlist('live-2024-rejoice-aichi-2');
  assert.equal(rejoiceNagoya2?.tracks[10]?.title, 'ノーダウト');

  const fukuoka2026 = getTourEventSetlist('live-2026-one-man-fukuoka-1');
  assert.equal(fukuoka2026?.tracks[8]?.title, 'Pretender');
  assert.equal(fukuoka2026?.tracks[9]?.title, 'エルダーフラワー');

  const yokohama2026 = getTourEventSetlist('live-2026-one-man-yokohama-1');
  assert.equal(yokohama2026?.tracks.length, 20);
  assert.equal(yokohama2026?.tracks[19]?.title, '50%');

  const asiaSingapore = getTourEventSetlist('live-2026-asia-tour-singapore');
  assert.equal(asiaSingapore?.tracks.length, 20);
  assert.equal(asiaSingapore?.tracks[13]?.title, 'TATTOO');
  assert.equal(asiaSingapore?.tracks[14]?.title, '日常');

  const asiaBangkok = getTourEventSetlist('live-2026-asia-tour-bangkok');
  assert.equal(asiaBangkok?.tracks[13]?.title, 'TATTOO');
  assert.equal(asiaBangkok?.tracks[13]?.note, undefined);

  const budokan1 = getTourEventSetlist('live-2023-shocking-nuts-budokan-1');
  assert.equal(budokan1?.tracks[11]?.title, 'parade');
  assert.equal(budokan1?.tracks[11]?.note, undefined);
  const budokan2 = getTourEventSetlist('live-2023-shocking-nuts-budokan-2');
  assert.equal(budokan2?.tracks[6]?.title, '風船');
  assert.equal(budokan2?.tracks[6]?.note, 'ライブ限定・未音源化');

  const toyotaTour = TOUR_ARCHIVES.find(tour => tour.id === 'tour-toyota-arena-2025');
  assert.equal(toyotaTour?.category, 'one_man');

  const toyota1 = getTourEventSetlist('live-2025-toyota-arena-1');
  assert.equal(toyota1?.tracks.length, 19);
  assert.equal(toyota1?.tracks[9]?.title, "I'm home (Interlude)");

  for (const tour of TOUR_ARCHIVES) {
    for (const event of tour.events) {
      const data = getTourEventSetlist(event.id);
      if (!data) continue;
      assert.equal(data.tracks.some(track => track.title === '50％'), false, `Full-width 50％ in ${event.id}`);
      if (data.note) {
        assert.equal(/@|さとっちゃん|report-newage\.com|unipa\.co/.test(data.note), false, `Unedited source note in ${event.id}`);
      }
    }
  }
});
