import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editorialArticles } from './editorialArticles';
import { getQuoteSizeTier, measureQuoteLineUnits, splitCreditChunks, splitQuoteLinePhrases } from './quoteTypography';

test('measureQuoteLineUnits weights ASCII and spaces narrower than full-width Japanese', () => {
  assert.equal(measureQuoteLineUnits('言葉はまるで雪の結晶'), 10);
  const asciiMixed = measureQuoteLineUnits("PARTY ! PARTY ! Uh uh uh Livin' It Up!");
  assert.ok(asciiMixed > 21 && asciiMixed < 24, `expected ~22.9, got ${asciiMixed}`);
});

test('getQuoteSizeTier assigns medium to ~19-23 unit mobile-wrap songs and keeps short multi-line quotes standard', () => {
  assert.equal(getQuoteSizeTier(editorialArticles.subtitle.feature), 'standard');
  assert.equal(getQuoteSizeTier(editorialArticles['white-noise'].feature), 'standard');
  assert.equal(getQuoteSizeTier(editorialArticles['second-line'].feature), 'medium');
  assert.equal(getQuoteSizeTier(editorialArticles['nichijou-song'].feature), 'medium');
  assert.equal(getQuoteSizeTier(editorialArticles['bad-for-me'].feature), 'medium');
  assert.equal(getQuoteSizeTier(editorialArticles['koi-no-sarigiwa'].feature), 'long');
  assert.equal(getQuoteSizeTier(editorialArticles['koi-no-maenarae'].feature), 'long');
});

test('splitQuoteLinePhrases groups trailing punctuation with the preceding token and preserves text losslessly', () => {
  const sample55 = editorialArticles['55-song'].feature;
  assert.deepEqual(splitQuoteLinePhrases(sample55), [
    'PARTY !',
    'PARTY !',
    'Uh',
    'uh',
    'uh',
    "Livin'",
    'It',
    'Up!',
  ]);

  for (const [id, entry] of Object.entries(editorialArticles)) {
    const reconstructed = entry.feature
      .split('\n')
      .map(line => splitQuoteLinePhrases(line).join(' '))
      .join('\n');
    assert.equal(reconstructed, entry.feature, `${id} lost characters when splitting phrases`);
  }
});

test('splitCreditChunks splits all 90 song credits before the lyricist note without trailing より', () => {
  for (const [id, entry] of Object.entries(editorialArticles)) {
    assert.ok(entry.featureCredit, `${id} is missing featureCredit`);
    assert.doesNotMatch(entry.featureCredit, /より$/, `${id} still ends with より`);
    const chunks = splitCreditChunks(entry.featureCredit);
    assert.ok(chunks, `${id} credit failed chunk split: ${entry.featureCredit}`);
    assert.equal(`${chunks[0]}${chunks[1]}`, entry.featureCredit);
  }
});
