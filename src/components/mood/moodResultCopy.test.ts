import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import type { CompleteMoodCriteria } from './moodSession';
import { moodResultCopy } from './moodResultCopy';
import { moodSongCopy } from './moodSongCopy';

const criteria: CompleteMoodCriteria = {
  mood: 'push_back',
  situation: 'morning_commute',
  sound: 'melody',
  era: 'indies_escaparade',
  length: 'fourToFive',
};

test('every song has its own introduction for the diagnosis result', () => {
  const descriptions = HIGEDAN_SONGS.map(song => moodResultCopy(song, criteria));
  assert.equal(descriptions.length, 90);
  assert.equal(new Set(descriptions.map(copy => copy.introduction)).size, 90);
  assert.deepEqual(Object.keys(moodSongCopy).sort(), HIGEDAN_SONGS.map(song => song.id).sort());
  assert.ok(descriptions.every(copy => copy.feature && copy.introduction.length > 20));
  const sweetTweet = HIGEDAN_SONGS.find(song => song.id === 'sweet-tweet');
  assert.ok(sweetTweet);
  assert.match(moodResultCopy(sweetTweet, criteria).introduction, /電話/);
  assert.match(moodResultCopy(sweetTweet, criteria).invitation, /ピアノとギター/);
});

test('a listening scene is suggested only when the song is tagged for that scene', () => {
  const song = HIGEDAN_SONGS.find(item => item.id === 'sweet-tweet');
  assert.ok(song);
  assert.match(moodResultCopy(song, criteria).invitation, /一日のはじまり/);
  assert.doesNotMatch(moodResultCopy(song, { ...criteria, situation: 'late_night_alone' }).invitation, /ひとりの時間/);
});
