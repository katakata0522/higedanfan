import { songEvidence, pitchNumber } from '../data/fullCatalogSongs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { HIGEDAN_SONGS, QUIZ_QUESTIONS, TOUR_ARCHIVES } from '../data/higedanData';
import {
  buildMoodMatchExplanation,
  calculateQuizResult,
  calculateSetlistStats,
  filterAndSortDiscography,
  formatDateDot,
  formatDiagnosisShareText,
  formatDuration,
  formatOrderingSequence,
  getSongwriterCredit,
  isOrderingAnswerCorrect,
  isSafeAssetUrl,
  normalizeSetlistOrder,
  sanitizeReviewsList,
  sanitizeSafeId,
  sanitizeSetlistEntries,
  sanitizeUserText,
  scoreSongsByMood,
  sortTourArchives,
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
    searchQuery: 'Subtitle',
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
  assert.equal(stats.totalDurationSec, 327 + 242 + 256);
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

  const midScore = calculateQuizResult(42, QUIZ_QUESTIONS);
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

test('filterAndSortDiscography supports all 86 verified songs, album/EP filtering, album_track_order, guide_order, release_oldest, highest_note, vocal_span, and sortTourArchives orders tours chronologically', () => {
  assert.equal(HIGEDAN_SONGS.length, 86);

  for (const song of HIGEDAN_SONGS) {
    assert.ok(song.vocalRange.lowestNote.length > 0);
    assert.ok(song.vocalRange.highestChestNote.length > 0);
    const f = songEvidence[song.id as keyof typeof songEvidence];
    for (const u of [f.apple,f.rangeSource,f.styleSource,f.tempoSource]) assert.ok(new URL(u).protocol === 'https:');
    assert.ok(f.apple.includes('?i=') && f.seconds > 60 && f.tempo > 0);
    assert.equal(song.vocalRange.rangeSpanSemitones, Math.max(pitchNumber(f.chest),f.falsetto ? pitchNumber(f.falsetto) : 0)-pitchNumber(f.low));
  }

  const byHighestNote = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    sound: 'all',
    searchQuery: '',
    sortBy: 'highest_note',
  });
  assert.equal(byHighestNote[0].vocalRange.chestSemitoneScore, 76); // hiE (E5)
  assert.ok(
    byHighestNote[0].vocalRange.chestSemitoneScore >=
      byHighestNote[byHighestNote.length - 1].vocalRange.chestSemitoneScore
  );

  const byOldest = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    sound: 'all',
    searchQuery: '',
    sortBy: 'release_oldest',
  });
  assert.equal(byOldest[0].releaseDate, '2015.04.22');
  assert.equal(byOldest[0].title, 'SWEET TWEET');
  assert.ok(byOldest[0].releaseDate <= byOldest[byOldest.length - 1].releaseDate);

  const loveAndPeaceTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: 'ラブとピースは君の中',
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(loveAndPeaceTracks.length, 8);
  assert.equal(loveAndPeaceTracks[0].title, 'SWEET TWEET');
  assert.equal(loveAndPeaceTracks[7].title, 'ダーリン。');

  const manInTheMirrorTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: 'MAN IN THE MIRROR',
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(manInTheMirrorTracks.length, 6);
  assert.equal(manInTheMirrorTracks[4].title, 'ゼロのままでいられたら');

  const whatsGoingOnTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: "What's Going On? EP",
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(whatsGoingOnTracks.length, 4);
  assert.equal(whatsGoingOnTracks[3].title, '黄色い車');

  const travelerTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: 'Traveler',
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(travelerTracks.length, 13);
  assert.equal(travelerTracks[3].title, 'Rowan');
  assert.equal(travelerTracks[10].title, 'Pretender');
  assert.equal(travelerTracks[10].trackNumber, 12);

  const mixedNutsEpTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: 'ミックスナッツ EP',
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(mixedNutsEpTracks.length, 3);
  assert.deepEqual(
    mixedNutsEpTracks.map((s) => s.title),
    ['ミックスナッツ', 'Choral A', '破顔']
  );

  const rejoiceAlbumTracks = filterAndSortDiscography(HIGEDAN_SONGS, {
    era: 'all',
    album: 'Rejoice',
    sound: 'all',
    searchQuery: '',
    sortBy: 'album_track_order',
  });
  assert.equal(rejoiceAlbumTracks.length, 15);
  assert.equal(rejoiceAlbumTracks[0].trackNumber, 1);
  assert.equal(rejoiceAlbumTracks[0].title, 'Finder');
  assert.equal(rejoiceAlbumTracks[1].trackNumber, 2);
  assert.equal(rejoiceAlbumTracks[1].title, 'Get Back To 人生');

  const toursOldestFirst = sortTourArchives(TOUR_ARCHIVES, 'oldest');
  const toursNewestFirst = sortTourArchives(TOUR_ARCHIVES, 'newest');
  assert.equal(toursOldestFirst[0].id, 'tour-hall-travelers-2019');
  assert.equal(toursNewestFirst[0].id, 'tour-oneman-2026');

  // Verify songwriter credits for member-composed songs
  assert.equal(getSongwriterCredit({ id: 'rowan-song' }), '作詞・作曲：小笹大輔');
  assert.equal(getSongwriterCredit({ id: 'bedroom-talk' }), '作詞・作曲：小笹大輔');
  assert.equal(getSongwriterCredit({ id: 'tabi-wa-michizure' }), '作詞・作曲：楢﨑誠');
  assert.equal(getSongwriterCredit({ id: 'midori-no-amayoke' }), '作詞・作曲：楢﨑誠');
  assert.equal(getSongwriterCredit({ id: 'choral-a-song' }), '作詞・作曲：楢﨑誠');
  assert.equal(getSongwriterCredit({ id: 'kanousei-song' }), '作詞・作曲：藤原聡');
  assert.equal(getSongwriterCredit({ id: 'filament-song' }), '作詞・作曲：松浦匡希・藤原聡');
  assert.equal(getSongwriterCredit({ id: 'pretender' }), '作詞・作曲：藤原聡');

  // Verify 60 quiz questions (20 per difficulty course), 6 ordering questions, verified sources, valid relatedSongIds, and balanced correctIndex distribution
  assert.equal(QUIZ_QUESTIONS.length, 60);
  assert.equal(QUIZ_QUESTIONS.filter((q) => q.difficulty === 'beginner').length, 20);
  assert.equal(QUIZ_QUESTIONS.filter((q) => q.difficulty === 'intermediate').length, 20);
  assert.equal(QUIZ_QUESTIONS.filter((q) => q.difficulty === 'brothers').length, 20);

  const orderingQuestions = QUIZ_QUESTIONS.filter((q) => q.questionType === 'ordering');
  assert.equal(orderingQuestions.length, 6);
  for (const oq of orderingQuestions) {
    assert.ok(Array.isArray(oq.correctOrder) && oq.correctOrder.length === 4);
    assert.deepEqual([...oq.correctOrder].sort(), [0, 1, 2, 3]);
    assert.equal(isOrderingAnswerCorrect(oq.correctOrder, oq.correctOrder), true);
    assert.equal(
      isOrderingAnswerCorrect([...oq.correctOrder].reverse(), oq.correctOrder),
      false
    );
    const formatted = formatOrderingSequence(oq.options, oq.correctOrder);
    assert.ok(formatted.includes('1番目:') && formatted.includes('4番目:'));
  }

  const allSongIds = new Set(HIGEDAN_SONGS.map((s) => s.id));
  const indexCounts = [0, 0, 0, 0];

  for (let i = 0; i < QUIZ_QUESTIONS.length; i++) {
    const q = QUIZ_QUESTIONS[i];
    assert.equal(q.options.length, 4, `Question ${q.id} must have 4 options`);
    assert.ok(
      q.correctIndex >= 0 && q.correctIndex <= 3,
      `Question ${q.id} correctIndex must be 0..3`
    );
    indexCounts[q.correctIndex]++;

    if (i > 0) {
      assert.notEqual(
        q.correctIndex,
        QUIZ_QUESTIONS[i - 1].correctIndex,
        `Question ${q.id} should not have the exact same correctIndex as ${QUIZ_QUESTIONS[i - 1].id}`
      );
    }

    if (q.relatedSongId) {
      assert.ok(
        allSongIds.has(q.relatedSongId),
        `Question ${q.id} relatedSongId "${q.relatedSongId}" must exist in HIGEDAN_SONGS`
      );
    }

    assert.ok(
      Array.isArray(q.sources) && q.sources.length >= 1,
      `Question ${q.id} must have a specific source`
    );
    for (const src of q.sources) {
      assert.ok(src.title.length >= 2);
      assert.ok(src.publisher.length >= 2);
      assert.ok(src.url.startsWith('https://'));
      assert.ok(src.summary.length > 10);
    }
  }

  // Ensure balanced answer option distribution across 0, 1, 2, 3 (each appears 12 to 18 times out of 60)
  for (let idx = 0; idx < 4; idx++) {
    assert.ok(
      indexCounts[idx] >= 12 && indexCounts[idx] <= 18,
      `Option index ${idx} count (${indexCounts[idx]}) must be balanced between 12 and 18`
    );
  }
});

test('all 86 setlist entries and encore assignments survive validation', () => {
  const all = HIGEDAN_SONGS.map((s,i)=>({songId:s.id,isEncore:i>=70}));
  assert.deepEqual(sanitizeSetlistEntries(all,new Set(all.map(s=>s.songId))),all);
  assert.equal(pitchNumber('mid1A#'),46);
  assert.equal(pitchNumber('hiC'),72);
  assert.equal(songEvidence['anarchy-song'].low,'mid1F');
  assert.equal(songEvidence['stand-by-you'].falsetto,'hiD');
  assert.equal(songEvidence['sharon'].cd,'2024.07.31');
});
