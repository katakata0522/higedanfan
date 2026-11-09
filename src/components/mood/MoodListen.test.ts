import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import { officialVideos, youtubeExternalOnlySongs } from '../../songPages/songConnections';
import { MoodListen, officialVideoId } from './MoodListen';

test('every catalog song has a verified video or audio link with a valid YouTube ID', () => {
  const ids = new Set(HIGEDAN_SONGS.map(song => song.id));
  assert.equal(Object.keys(officialVideos).length, ids.size);
  for (const id of ids) assert.ok(officialVideoId(id), `missing video: ${id}`);
  for (const id of Object.keys(officialVideos)) {
    assert.ok(ids.has(id), `unknown song: ${id}`);
    assert.match(officialVideoId(id) ?? '', /^[A-Za-z0-9_-]{11}$/);
  }
  for (const id of youtubeExternalOnlySongs) assert.ok(ids.has(id), `unknown external-only song: ${id}`);
  assert.equal(HIGEDAN_SONGS.find(song => song.id === 'editorial-song')?.title, 'アポトーシス');
  assert.equal(officialVideoId('editorial-song'), 'PZX2npwj6jY');
});

test('embeddable audio plays in place and restricted recordings link directly to YouTube', () => {
  const videoSong = HIGEDAN_SONGS.find(song => song.id === 'yuugure-zoi');
  const restrictedSong = HIGEDAN_SONGS.find(song => song.id === 'uramitsurami-kiwami');
  const liveSong = HIGEDAN_SONGS.find(song => song.id === 'bad-for-me');
  assert.ok(videoSong && restrictedSong && liveSong);
  const video = renderToStaticMarkup(createElement(MoodListen, { song: videoSong }));
  assert.match(video, /youtube-nocookie\.com\/embed\/Qi_n6KHDklU/);
  assert.match(video, /referrerPolicy="strict-origin-when-cross-origin"/i);
  assert.match(video, /YouTubeで開く/);
  const restricted = renderToStaticMarkup(createElement(MoodListen, { song: restrictedSong }));
  assert.doesNotMatch(restricted, /<iframe/);
  assert.match(restricted, /youtube\.com\/watch\?v=l4gPIP2KLas/);
  assert.match(restricted, /i\.ytimg\.com\/vi\/l4gPIP2KLas\/hqdefault\.jpg/);
  assert.match(restricted, /YouTubeで聴く/);
  const live = renderToStaticMarkup(createElement(MoodListen, { song: liveSong }));
  assert.match(live, /ライブ音源/);
  assert.match(live, /Apple Musicで聴く/);
});
