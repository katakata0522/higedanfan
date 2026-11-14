import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogEntries } from './catalogEntries.ts';
import songEvidence from './songEvidence.json' with { type: 'json' };
import { songAppleArtwork } from './songAppleArtwork.ts';

test('全90曲に検証済み Apple Music ジャケットURLとトラックIDが対応している', () => {
  const catalogIds = catalogEntries.map(song => song.id).sort();
  const artworkIds = Object.keys(songAppleArtwork).sort();
  assert.deepEqual(artworkIds, catalogIds);

  for (const id of catalogIds) {
    const entry = songAppleArtwork[id];
    const evidence = songEvidence[id as keyof typeof songEvidence];
    assert.ok(evidence, `${id}: songEvidence がありません`);
    assert.match(entry.trackId, /^\d+$/, `${id}: trackId が数値ではありません`);
    assert.ok(entry.albumName.trim().length > 0, `${id}: アルバム名が空です`);

    const appleUrl = new URL(entry.appleUrl);
    assert.equal(appleUrl.protocol, 'https:');
    assert.equal(appleUrl.hostname, 'music.apple.com');
    assert.match(appleUrl.pathname, /^\/jp\/album\//, `${id}: 日本ストアのアルバムURLではありません`);
    assert.equal(appleUrl.searchParams.get('i'), entry.trackId, `${id}: appleUrl のトラックIDが一致しません`);

    const parsed = new URL(entry.artworkUrl);
    assert.equal(parsed.protocol, 'https:');
    assert.match(parsed.hostname, /\.mzstatic\.com$/);
    assert.match(parsed.pathname, /\/600x600bb\.(jpg|png|webp)$/);
  }
});

test('単独ジャケットのあるシングル・EP曲は収録アルバムではなくシングル側の作品を優先している', () => {
  const singleFirstSongIds = [
    'pretender', 'amazing-song', 'subtitle', 'mixed-nuts', 'cry-baby', 'no-doubt',
    'stand-by-you', 'fire-ground', 'shukumei', 'i-love', 'white-noise', 'tattoo',
    'soulsoup', 'lady-song', 'driver-song', 'tell-me-baby', 'brothers-song',
    'bad-for-me', 'hello-song', 'parabola-song', 'laughter-song', 'universe-song',
    'nichijou-song', 'chessboard-song', 'same-blue', 'rashisa', 'fifty-percent',
    'sanitizer', 'make-me-wonder', 'elderflower', 'stardust',
  ];

  for (const id of singleFirstSongIds) {
    const entry = songAppleArtwork[id];
    assert.ok(entry, `${id}: songAppleArtwork がありません`);
    assert.match(
      entry.albumName,
      /(?:-\s*Single|\bEP\b)/i,
      `${id}: シングル・EPジャケットではなく「${entry.albumName}」が選ばれています`,
    );
  }
});
