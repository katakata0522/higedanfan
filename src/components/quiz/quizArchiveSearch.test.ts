import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import { QUIZ_QUESTIONS } from '../../data/quizData';
import { prepareQuizArchiveSearch } from './quizArchiveSearch';

const songsById = new Map(HIGEDAN_SONGS.map(song => [song.id, song]));
const questionById = new Map(QUIZ_QUESTIONS.map(question => [question.id, question]));

function matches(query: string, id: string, showRelatedSong = true): boolean {
  const question = questionById.get(id);
  assert.ok(question, `Missing question ${id}`);
  const relatedSong = showRelatedSong && question.relatedSongId
    ? songsById.get(question.relatedSongId)
    : undefined;
  return prepareQuizArchiveSearch(query, HIGEDAN_SONGS)(question, relatedSong);
}

test('single-choice distractors do not create invisible matches', () => {
  const search = prepareQuizArchiveSearch('Same Blue', HIGEDAN_SONGS);
  const matchingIds = QUIZ_QUESTIONS.filter(question => search(
    question,
    question.relatedSongId ? songsById.get(question.relatedSongId) : undefined,
  )).map(question => question.id);

  assert.deepEqual(matchingIds, ['q13', 'q47']);
  assert.equal(matches('Same Blue', 'q11'), false);
  assert.equal(matches('Same Blue', 'q58'), false);
  assert.equal(matches('5拍子と6拍子', 'q13'), true);
});

test('visible ordering answers, related songs, and source labels remain searchable', () => {
  assert.equal(matches('Traveler', 'q31'), true);
  assert.equal(matches('Pretender', 'q32'), true);
  assert.equal(matches('Sharon', 'q14'), false);
  assert.equal(matches('Subtitle', 'q37'), true);
  const relatedSong = HIGEDAN_SONGS.find(song => song.id === 'pretender')!;
  const searchRelated = prepareQuizArchiveSearch(relatedSong.title, HIGEDAN_SONGS);
  const unrelatedQuestion = questionById.get('q14')!;
  assert.equal(searchRelated(unrelatedQuestion, relatedSong), true);
  assert.equal(searchRelated(unrelatedQuestion), false);
  assert.equal(matches('Real Sound', 'q13'), true);
  assert.equal(matches('楽曲分析', 'q13'), true);
});

test('related song links have a visible connection to the question', () => {
  for (const id of ['q14', 'q31', 'q41']) {
    assert.equal(questionById.get(id)?.relatedSongId, undefined);
  }
  assert.equal(matches('115万キロのフィルム', 'q31'), false);
  assert.equal(matches('SWEET TWEET', 'q41'), false);

  for (const [questionId, songId] of [
    ['q53', 'elderflower'],
  ]) {
    const question = questionById.get(questionId);
    const song = songsById.get(songId);
    assert.ok(question && song);
    assert.equal(question.relatedSongId, song.id);
    assert.equal(question.options[question.correctIndex], song.title);
    assert.equal(matches(song.title, questionId), true);
  }
  assert.equal(questionById.get('q47')?.relatedSongId, 'same-blue');
  assert.equal(matches('Same Blue', 'q47'), true);
  assert.equal(questionById.get('q58')?.relatedSongId, 'stand-by-you');
  assert.equal(matches('Stand By You', 'q58'), true);

  const albumQuestion = questionById.get('q29');
  const albumTrack = songsById.get('escapade-song');
  assert.ok(albumQuestion && albumTrack);
  assert.equal(albumQuestion.relatedSongId, albumTrack.id);
  assert.equal(albumTrack.album, 'エスカパレード');
  assert.equal(albumTrack.trackNumber, 3);
  assert.match(albumQuestion.explanation, /「ESCAPADE」はこのアルバムの3曲目/);
  assert.ok(albumQuestion.sources.some(source => source.url === 'https://higedan.com/discography/detail/8/'));
});

test('width, case, punctuation and song readings work without matching hidden choices', () => {
  assert.equal(matches('ＳＡＭＥ　ＢＬＵＥ', 'q13'), true);
  assert.equal(matches('せいむぶるー', 'q13'), true);
  assert.equal(matches('セイムブルー', 'q11'), false);
  assert.equal(matches('プリテンダー', 'q32'), true);
  assert.equal(matches('プリテンダー', 'q2'), false);
});

test('archive search ignores suppressed boilerplate but still matches visible source details', () => {
  assert.equal(matches('この問いで参照した資料', 'q1'), false);
  assert.equal(matches('Rejoiceの配信日', 'q1'), true);
  assert.equal(matches('小節ごとの拍数', 'q13'), true);
});

test('an empty query leaves all 60 archive questions available', () => {
  const search = prepareQuizArchiveSearch('  ', HIGEDAN_SONGS);
  assert.equal(QUIZ_QUESTIONS.filter(question => search(question)).length, 60);
});
