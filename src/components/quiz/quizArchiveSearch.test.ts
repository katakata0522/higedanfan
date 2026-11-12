import assert from 'node:assert/strict';
import test from 'node:test';
import { HIGEDAN_SONGS } from '../../data/higedanData';
import { REFERENCE_ARTICLES, type ReferenceArticle } from '../../data/referenceArticles';
import { prepareReferenceSearch, referenceDateLabel, sortReferenceArticles } from './quizArchiveSearch';

function find(query: string) {
  return REFERENCE_ARTICLES.filter(prepareReferenceSearch(query, HIGEDAN_SONGS).matches);
}

test('記事名・媒体・日付・表示された関連曲から参考記事を探せる', () => {
  const rejoiceInterview = REFERENCE_ARTICLES.find(article => article.url === 'https://rockinon.com/interview/detail/210118');
  assert.ok(rejoiceInterview);
  for (const query of ['Rejoice', 'rockinon.com', '2024/07/31', '2024年7月31日']) {
    assert.ok(find(query).includes(rejoiceInterview), query);
  }
  const pretenderInterview = REFERENCE_ARTICLES.find(article => article.url.includes('/50294/'));
  assert.ok(pretenderInterview);
  for (const query of ['Pretender', 'ＰＲＥＴＥＮＤＥＲ', 'プリテンダー', 'ぷりてんだー']) {
    assert.ok(find(query).includes(pretenderInterview), query);
  }
});

test('検索には表示しない問題文・正解・内部の問題番号を含めない', () => {
  for (const query of ['q13', 'この問いで参照した資料', '正解：', '5拍子と6拍子']) {
    assert.equal(find(query).length, 0, query);
  }
  assert.equal(find('  ').length, REFERENCE_ARTICLES.length);
});

test('日付不明の資料は新しい順・古い順とも末尾に置き、元データを並び替えない', () => {
  const base = REFERENCE_ARTICLES[0];
  const input: ReferenceArticle[] = [
    {...base, title: '不明', date: null},
    {...base, title: '古い', date: '2018-06-12'},
    {...base, title: '新しい', date: '2024-07-31'},
  ];
  assert.deepEqual(sortReferenceArticles(input, 'newest').map(article => article.title), ['新しい', '古い', '不明']);
  assert.deepEqual(sortReferenceArticles(input, 'oldest').map(article => article.title), ['古い', '新しい', '不明']);
  assert.deepEqual(input.map(article => article.title), ['不明', '古い', '新しい']);
});

test('記事公開日と、更新日・放送日・発行日・資料発売日を区別する', () => {
  const base = {...REFERENCE_ARTICLES[0], date: '2024-07-31'};
  assert.equal(referenceDateLabel({...base, dateKind: 'published'}), '2024/07/31 公開');
  assert.equal(referenceDateLabel({...base, dateKind: 'updated'}), '2024/07/31 更新');
  assert.equal(referenceDateLabel({...base, dateKind: 'broadcast'}), '2024/07/31 放送');
  assert.equal(referenceDateLabel({...base, dateKind: 'issued'}), '2024/07/31 発行');
  assert.equal(referenceDateLabel({...base, dateKind: 'released'}), '2024/07/31 資料発売');
  assert.equal(referenceDateLabel({...base, date: null}), '公開日未確認');
});
