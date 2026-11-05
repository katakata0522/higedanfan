import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS, QUIZ_QUESTIONS } from '../data/higedanData';
import {
  buildMoodMatchExplanation,
  calculateQuizResult,
  calculateSetlistStats,
  filterAndSortDiscography,
  formatDateDot,
  formatDiagnosisShareText,
  formatDuration,
  isSafeAssetUrl,
  normalizeSetlistOrder,
  sanitizeReviewsList,
  sanitizeSafeId,
  sanitizeSetlistEntries,
  sanitizeUserText,
  scoreSongsByMood,
  validateReviewInput,
} from './fanLogic';

test('formatDuration converts seconds into mm:ss and handles negative/NaN values safely', () => {
  assert.equal(formatDuration(326), '5:26');
  assert.equal(formatDuration(240), '4:00');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(-15), '0:00');
});

test('sanitizeUserText neutralizes XSS tags, inline event handlers, dangerous URI schemes, and full-width brackets', () => {
  const malicious =
    '<script>alert("xss")</script> <img src=x onerror=alert(1)> javascript:evil() data:text/html,evil ＜svg onload=alert(2)＞ こんにちは！';
  const cleaned = sanitizeUserText(malicious, 100);
  assert.equal(cleaned.includes('<'), false);
  assert.equal(cleaned.includes('>'), false);
  assert.equal(cleaned.includes('＜'), false);
  assert.equal(cleaned.includes('＞'), false);
  assert.equal(cleaned.toLowerCase().includes('javascript:'), false);
  assert.equal(cleaned.toLowerCase().includes('data:'), false);
  assert.equal(cleaned.toLowerCase().includes('onerror='), false);
  assert.equal(cleaned.toLowerCase().includes('onload='), false);
  assert.ok(cleaned.includes('こんにちは！'));

  const longText = 'あ'.repeat(100);
  assert.equal(sanitizeUserText(longText, 30).length, 30);
  assert.equal(sanitizeUserText(null, 30), '');
  assert.equal(sanitizeUserText(undefined, 30), '');
});

test('sanitizeSafeId and isSafeAssetUrl enforce strict whitelisting', () => {
  assert.equal(sanitizeSafeId('mixed-nuts:overall<script>'), 'mixed-nuts:overallscript');
  assert.equal(sanitizeSafeId(12345), '');
  assert.equal(isSafeAssetUrl('/src/assets/images/album_art_rejoice.jpg'), true);
  assert.equal(isSafeAssetUrl('javascript:alert(1)'), false);
  assert.equal(isSafeAssetUrl('//evil.example.com/img.png'), false);
  assert.equal(isSafeAssetUrl('https://evil.example.com/img.png'), false);
});

test('sanitizeSetlistEntries and sanitizeReviewsList reject invalid or tampered records', () => {
  const validSongIds = new Set(HIGEDAN_SONGS.map((s) => s.id));
  const cleanedSetlist = sanitizeSetlistEntries(
    [
      { songId: 'pretender', isEncore: false },
      { songId: 'non-existent-id', isEncore: true },
      null,
    ],
    validSongIds
  );
  assert.ok(cleanedSetlist);
  assert.equal(cleanedSetlist.length, 1);
  assert.equal(cleanedSetlist[0].songId, 'pretender');

  const cleanedReviews = sanitizeReviewsList(
    [
      {
        id: 'r1',
        author: '<b>テストユーザー</b>',
        fanTenure: 'ファン歴 3〜5年',
        songId: 'sharon',
        category: '歌詞考察',
        title: '素晴らしい歌詞の世界観',
        comment: '何度聴いても心が温まる名曲です。ライブでも最高でした！',
        postedAt: '2026.11.05',
        likes: 10,
      },
      {
        id: 'r2',
        author: 'A', // too short
        songId: 'invalid',
        category: '不正カテゴリ',
        title: 'x',
        comment: 'short',
      },
    ],
    validSongIds
  );
  assert.ok(cleanedReviews);
  assert.equal(cleanedReviews.length, 1);
  assert.equal(cleanedReviews[0].author, 'テストユーザー');
});

test('scoreSongsByMood prioritizes songs matching mood, situation, and sound and attaches 1-2 sentence moodMatchExplanation and matchBreakdown', () => {
  const results = scoreSongsByMood(HIGEDAN_SONGS, {
    mood: 'euphoric_drive',
    situation: 'morning_commute',
    sound: 'brass_funk',
  });
  assert.ok(results.length > 0);
  assert.equal(results[0].matchScore, 99);
  assert.ok(
    results[0].song.id === 'mixed-nuts' || results[0].song.id === 'soulsoup'
  );
  assert.equal(results[0].matchReasons.length, 3);
  assert.ok(results[0].moodMatchExplanation.includes('「最高に盛り上がりたい」今の気分に'));
  assert.ok(results[0].soundAnalysisReason.length > 10);
  assert.ok(results[0].matchBreakdown.moodSyncPercent >= 90);
  assert.ok(results[0].matchBreakdown.sceneFitPercent >= 90);
  assert.equal(results[0].matchBreakdown.soundMatchPercent, 99);
  const sentenceCount = results[0].moodMatchExplanation.split('。').filter(Boolean).length;
  assert.ok(sentenceCount >= 1 && sentenceCount <= 2);

  const heartbreakExplanation = buildMoodMatchExplanation(HIGEDAN_SONGS[0], {
    mood: 'heartbreak_night',
    situation: 'late_night_alone',
    sound: 'piano_pop',
  });
  assert.ok(heartbreakExplanation.includes('「切ない夜に浸りたい」今の気分に'));
  assert.ok(heartbreakExplanation.includes('ひとり静かに過ごす夜'));
});

test('filterAndSortDiscography filters by era, sound, and search query', () => {
  const rejoiceSongs = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'rejoice',
    sound: 'all',
    searchQuery: '',
  });
  assert.ok(rejoiceSongs.length >= 4);
  assert.ok(rejoiceSongs.every((s) => s.era === 'rejoice'));

  const searchSubtitle = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    sound: 'all',
    searchQuery: '雪の結晶',
  });
  assert.equal(searchSubtitle.length, 1);
  assert.equal(searchSubtitle[0].id, 'subtitle');
});

test('calculateSetlistStats computes duration, BPM, key changes, and encore counts', () => {
  const stats = calculateSetlistStats(
    [
      { songId: 'pretender', isEncore: false },
      { songId: 'cry-baby', isEncore: false },
      { songId: 'stand-by-you', isEncore: true },
    ],
    HIGEDAN_SONGS
  );

  assert.equal(stats.totalSongs, 3);
  assert.equal(stats.mainCount, 2);
  assert.equal(stats.encoreCount, 1);
  assert.equal(stats.totalDurationSec, 326 + 240 + 256);
  assert.equal(stats.totalKeyChanges, 1 + 11 + 1);
  assert.equal(stats.energyCurve.length, 3);
});

test('validateReviewInput enforces non-empty requirements and sanitizes HTML', () => {
  assert.equal(
    validateReviewInput({
      author: '',
      songId: 'pretender',
      title: '最高の1曲',
      comment: '何度聴いても飽きない名曲です！',
    }).valid,
    false
  );

  assert.equal(
    validateReviewInput({
      author: 'ヒゲダンファン',
      songId: 'pretender',
      title: '最高の1曲',
      comment: '短い',
    }).valid,
    false
  );

  const validRes = validateReviewInput({
    author: '<script>alert(1)</script>ヒゲダンファン',
    songId: 'pretender',
    title: 'ピアノのイントロが最高',
    comment: '映画館のエンドロールで流れた瞬間の鳥肌が忘れられません。',
  });
  assert.equal(validRes.valid, true);
  assert.equal(validRes.sanitized?.author, 'alert(1)ヒゲダンファン');
});

test('calculateQuizResult returns rank S for 100% and rank A for >=65%', () => {
  const fullScore = calculateQuizResult(QUIZ_QUESTIONS.length, QUIZ_QUESTIONS);
  assert.equal(fullScore.percentage, 100);
  assert.ok(fullScore.rankBadgeCode.includes('RANK S'));

  const midScore = calculateQuizResult(4, QUIZ_QUESTIONS);
  assert.ok(midScore.percentage >= 65);
  assert.ok(midScore.rankBadgeCode.includes('RANK A'));
});

test('normalizeSetlistOrder keeps main tracks before encore tracks and deduplicates songIds', () => {
  const ordered = normalizeSetlistOrder([
    { songId: 'pretender', isEncore: true },
    { songId: 'same-blue', isEncore: false },
    { songId: 'pretender', isEncore: false }, // duplicate should be ignored
    { songId: 'mixed-nuts', isEncore: false },
    { songId: 'stand-by-you', isEncore: true },
  ]);
  assert.equal(ordered.length, 4);
  assert.deepEqual(
    ordered.map((e) => `${e.songId}:${e.isEncore ? 'EN' : 'M'}`),
    ['same-blue:M', 'mixed-nuts:M', 'pretender:EN', 'stand-by-you:EN']
  );

  assert.equal(formatDateDot(new Date('2026-11-05T12:00:00Z')), '2026.11.05');
});

test('formatDiagnosisShareText formats song title, match score, mood reason, and hashtags for SNS share card', () => {
  const criteria = {
    mood: 'push_back' as const,
    situation: 'morning_commute' as const,
    sound: 'brass_funk' as const,
  };
  const matches = scoreSongsByMood(HIGEDAN_SONGS, criteria);
  const shareText = formatDiagnosisShareText(matches[0], criteria);
  assert.ok(shareText.includes(`『${matches[0].song.title}』`));
  assert.ok(shareText.includes(`マッチ度 ${matches[0].matchScore}%`));
  assert.ok(shareText.includes(matches[0].moodMatchExplanation));
  assert.ok(shareText.includes('#115万キロのファンノート'));
});


