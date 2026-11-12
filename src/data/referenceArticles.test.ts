import assert from 'node:assert/strict';
import test from 'node:test';
import { editorialArticles } from '../songPages/editorialArticles';
import { HIGEDAN_SONGS } from './higedanData';
import { QUIZ_QUESTIONS } from './quizData';
import { REFERENCE_ARTICLES } from './referenceArticles';

test('曲の物語と検定の明示された参照URLを、資料一覧に漏れなく含む', () => {
  const expected = new Set([
    ...QUIZ_QUESTIONS.flatMap(question => question.sources.map(source => source.url)),
    ...Object.values(editorialArticles).flatMap(article => article.sources.flatMap(source => 'url' in source ? [source.url] : [])),
  ]);
  const actual = new Set(REFERENCE_ARTICLES.flatMap(article => article.referencedUrls));
  assert.deepEqual([...actual].sort(), [...expected].sort());
});

test('資料URLは一意で、参照元の別ページ・移転前URLを同じ記事へまとめる', () => {
  assert.equal(new Set(REFERENCE_ARTICLES.map(article => article.url)).size, REFERENCE_ARTICLES.length);
  const byOriginal = new Map(REFERENCE_ARTICLES.flatMap(article => article.referencedUrls.map(url => [url, article] as const)));
  const oldReport = byOriginal.get('https://music.fanplus.co.jp/news/20170309557e046cb');
  assert.ok(oldReport);
  assert.equal(oldReport.url, 'https://music.fanplus.co.jp/special/20170309557e046cb');
  assert.equal(oldReport.unavailable, undefined);
  const standByYou = REFERENCE_ARTICLES.filter(article => article.url.includes('barks.jp/news/827997'));
  assert.equal(standByYou.length, 1);
  assert.equal(standByYou[0].referencedUrls.length, 2);
});

test('記事の実際の見出し・公開日を使い、発売日や更新日を公開日へ流用しない', () => {
  const albumNews = REFERENCE_ARTICLES.find(article => article.url.includes('news/detail/100958'))!;
  assert.equal(albumNews.date, '2024-05-07');
  const rockinon = REFERENCE_ARTICLES.find(article => article.url === 'https://rockinon.com/interview/detail/210118')!;
  assert.match(rockinon.title, /新作『Rejoice』のすべて/);
  assert.equal(rockinon.date, '2024-07-31');
  assert.equal(rockinon.dateKind, 'published');
  for (const article of REFERENCE_ARTICLES.filter(article => article.url.includes('music.apple.com') || article.url.includes('higedan.com/discography'))) {
    assert.equal(article.date, null, article.url);
  }
  const editorial = REFERENCE_ARTICLES.find(article => article.url.includes('editorial.ponycanyon.co.jp/interview'))!;
  assert.equal(editorial.date, null);
});

test('資料メタデータのURL・日付・関連曲に無効な値や問題データがない', () => {
  const songIds = new Set(HIGEDAN_SONGS.map(song => song.id));
  for (const article of REFERENCE_ARTICLES) {
    assert.ok(article.title && article.publisher);
    assert.doesNotMatch(article.title, /<[^>]+>|\u0000/);
    for (const url of [article.url, ...article.referencedUrls]) {
      assert.equal(new URL(url).protocol, 'https:');
    }
    if (article.date) {
      assert.match(article.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(article.date).toISOString().slice(0, 10), article.date);
    }
    for (const id of article.relatedSongIds) assert.ok(songIds.has(id), id);
    assert.ok(!('prompt' in article) && !('correctIndex' in article) && !('explanation' in article));
  }
});
