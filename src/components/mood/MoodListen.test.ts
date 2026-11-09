import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import { officialVideos } from '../../songPages/songConnections';
import { MoodListen, officialVideoId } from './MoodListen';

test('each official video belongs to a catalog song and has a valid YouTube ID', () => {
  const ids = new Set(HIGEDAN_SONGS.map(song => song.id));
  for (const id of Object.keys(officialVideos)) {
    assert.ok(ids.has(id), `unknown song: ${id}`);
    assert.match(officialVideoId(id) ?? '', /^[A-Za-z0-9_-]{11}$/);
  }
  assert.equal(HIGEDAN_SONGS.find(song => song.id === 'editorial-song')?.title, 'アポトーシス');
  assert.equal(officialVideoId('editorial-song'), 'PZX2npwj6jY');
});

test('a video and a song without a verified video each offer an honest way to listen', () => {
  const videoSong = HIGEDAN_SONGS.find(song => song.id === 'yesterday-song');
  const fallbackSong = HIGEDAN_SONGS.find(song => song.id === 'bad-for-me');
  assert.ok(videoSong && fallbackSong);
  const video = renderToStaticMarkup(createElement(MoodListen, { song: videoSong }));
  assert.match(video, /youtube-nocookie\.com\/embed\/DuMqFknYHBs/);
  assert.match(video, /referrerPolicy="strict-origin-when-cross-origin"/i);
  assert.match(video, /YouTubeで開く/);
  const fallback = renderToStaticMarkup(createElement(MoodListen, { song: fallbackSong }));
  assert.doesNotMatch(fallback, /<iframe/);
  assert.match(fallback, /Apple Musicで聴く/);
  assert.match(fallback, /YouTubeで検索/);
});
