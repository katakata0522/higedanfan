import assert from 'node:assert/strict';
import { test } from 'node:test';
import pretender from './data/pretender';
import mixedNuts from './data/mixed-nuts';
import { applySongEditorial } from './applySongEditorial';
import { autoSongPage } from './autoSongPage';

test('article sources lead the list and duplicate links retain both descriptions', () => {
  const url = 'https://www.uta-net.com/user/writer/todaysong.html?id=9646';
  const page = applySongEditorial({
    ...pretender,
    sources: [...pretender.sources, { label: '同じ資料', purpose: '別の確認事項', url }],
  });
  const matches = page.sources.filter(source => source.url === url);
  assert.equal(matches.length, 1);
  assert.equal(page.sources[0].url, url);
  assert.match(matches[0].purpose, /別の確認事項/);
  assert.ok(page.sources.some(source => source.evidence === 'apple'));
});

test('replacing the article preserves recording-specific vocal notes', () => {
  const page = applySongEditorial(mixedNuts);
  assert.deepEqual(page.vocalVariants, mixedNuts.vocalVariants);
  assert.equal(page.rangeNote, mixedNuts.rangeNote);
  assert.equal(page.albumTrack, mixedNuts.albumTrack);
  assert.ok(page.overview.length >= 2);
});

test('verified alternate URLs for the same article appear once without losing their purposes', () => {
  const cases = [
    { id: 'nichiyoubi-no-loveletter', label: 'Fanplus Music 2016年ライブレポート', url: 'https://music.fanplus.co.jp/news/20160707916e0854e', purpose: /楢﨑誠.*呼びかけ.*ライブでのメンバー/ },
    { id: 'whats-going-on', label: 'Real Sound 藤原聡×FROGMAN対談', url: 'https://realsound.jp/2016/10/post-9916_2.html', purpose: /楽曲の出発点.*楽曲の背景/ },
  ];
  for (const item of cases) {
    const sources = applySongEditorial(autoSongPage(item.id)).sources.filter(source => source.label === item.label);
    assert.equal(sources.length, 1);
    assert.equal(sources[0].url, item.url);
    assert.match(sources[0].purpose, item.purpose);
  }
});
