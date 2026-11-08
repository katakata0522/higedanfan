import assert from 'node:assert/strict';
import test from 'node:test';
import evidence from '../data/songEvidence.json';
import { appleMusicEmbedUrl } from './appleMusicEmbed';
import verified from './appleMusicTracks.json';

test('確認済みの楽曲だけが対応する Apple Music の音源に埋め込まれる', () => {
  assert.ok(Object.keys(verified.tracks).length > 0);
  for (const id of Object.keys(verified.tracks)) {
    const fact = evidence[id as keyof typeof evidence];
    assert.ok(fact, `${id} の楽曲情報がありません`);
    const source = new URL(fact.apple);
    const embed = new URL(appleMusicEmbedUrl(id, fact.apple)!);
    assert.equal(embed.hostname, 'embed.music.apple.com');
    assert.equal(embed.pathname, source.pathname);
    assert.equal(embed.searchParams.get('i'), source.searchParams.get('i'));
  }
});

test('未確認の曲、不一致の音源、不正なリンクは埋め込まない', () => {
  assert.equal(appleMusicEmbedUrl('missing-song', evidence.pretender.apple), null);
  assert.equal(appleMusicEmbedUrl('pretender', evidence.subtitle.apple), null);
  assert.equal(appleMusicEmbedUrl('pretender', 'https://example.com/jp/album/foo/1479397582?i=1479397873'), null);
  assert.equal(appleMusicEmbedUrl('pretender', 'not a URL'), null);
});
