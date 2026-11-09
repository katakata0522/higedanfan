import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import type { CompleteMoodCriteria } from './moodSession';
import { moodResultCopy } from './moodResultCopy';

const criteria: CompleteMoodCriteria = {
  mood: 'push_back',
  situation: 'morning_commute',
  sound: 'piano_pop',
  era: 'indies_escaparade',
  length: 'fourToFive',
};

test('every song has its own introduction for the diagnosis result', () => {
  const descriptions = HIGEDAN_SONGS.map(song => moodResultCopy(song, criteria));
  assert.equal(descriptions.length, 90);
  assert.equal(new Set(descriptions.map(copy => copy.introduction)).size, 90);
  assert.ok(descriptions.every(copy => copy.feature && copy.introduction.length > 20));
  const sweetTweet = HIGEDAN_SONGS.find(song => song.id === 'sweet-tweet');
  assert.ok(sweetTweet);
  assert.match(moodResultCopy(sweetTweet, criteria).introduction, /SWEET TWEET/);
});

test('a listening scene is suggested only when the song is tagged for that scene', () => {
  const song = HIGEDAN_SONGS.find(item => item.id === 'sweet-tweet');
  assert.ok(song);
  assert.notEqual(moodResultCopy(song, criteria).invitation, '');
  assert.equal(moodResultCopy(song, { ...criteria, situation: 'late_night_alone' }).invitation, '');
});
