import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fitsVoiceRange } from './voiceRange';

test('compares both ends of the chest range after the selected key change', () => {
  const song = { low: 'mid1D#', chest: 'hiC' }; // D#3 to C5
  assert.equal(fitsVoiceRange(song, 51, 72, 0), true);
  assert.equal(fitsVoiceRange(song, 52, 72, 0), false);
  assert.equal(fitsVoiceRange(song, 49, 70, -2), true);
  assert.equal(fitsVoiceRange(song, 50, 70, -2), false);
  assert.equal(fitsVoiceRange(song, undefined, 71, 0), false);
  assert.equal(fitsVoiceRange(song, 72, 51, 0), false);
});
