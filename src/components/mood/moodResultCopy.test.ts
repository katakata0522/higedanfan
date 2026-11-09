import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import { moodResultCopy } from './moodResultCopy';
import { moodSongCopy } from './moodSongCopy';

test('every song has its own introduction for the diagnosis result', () => {
  const descriptions = HIGEDAN_SONGS.map(song => moodResultCopy(song));
  assert.equal(descriptions.length, 90);
  assert.equal(new Set(descriptions.map(copy => copy.introduction)).size, 90);
  assert.equal(new Set(descriptions.map(copy => copy.invitation)).size, 90);
  assert.deepEqual(Object.keys(moodSongCopy).sort(), HIGEDAN_SONGS.map(song => song.id).sort());
  assert.ok(descriptions.every(copy => copy.feature && copy.introduction.length > 20 && copy.invitation));
  const sweetTweet = HIGEDAN_SONGS.find(song => song.id === 'sweet-tweet');
  assert.ok(sweetTweet);
  assert.match(moodResultCopy(sweetTweet).introduction, /電話/);
  assert.match(moodResultCopy(sweetTweet).invitation, /ピアノとギター/);
});
