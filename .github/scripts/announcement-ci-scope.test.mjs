import assert from 'node:assert/strict';
import test from 'node:test';
import { browserScope } from './announcement-ci-scope.mjs';

const change = (path, header = ':100644 100644 abc def M') => header + '\0' + path + '\0';
const data = change('src/data/songAnnouncementRecords.json');
const pages = change('discography/index.html') + change('vocal-range/index.html');

test('告知データは生成HTMLと一緒でも限定検証を使う', () => {
  assert.equal(browserScope(data), 'announcements');
  assert.equal(browserScope(pages + data), 'announcements');
});
test('ホーム単独・ツアー専用データと生成物を選別し、混在・共有・追加は全件へ戻す', () => {
  const home = change('src/components/home/HomePage.tsx');
  const tour = change('src/data/tourArchiveRecords.json');
  const html = change('tour-archive/index.html');
  assert.equal(browserScope(home), 'home');
  assert.equal(browserScope(tour + html), 'tour');
  for (const diff of [home + tour, tour + change('src/data/higedanTypes.ts'), html,
    change('src/data/tourSetlistRecords.json', ':000000 100644 00 a1 A')]) {
    assert.equal(browserScope(diff), 'full');
  }
});

test('データ以外・不明な差分・削除・ファイル種別の変更は全件検証する', () => {
  for (const diff of ['', pages, data.slice(0, -1), data + change('src/utils/songSearch.ts'),
    data + change('discography/index.html', ':100644 000000 abc 000 D'),
    change('src/data/songAnnouncementRecords.json', ':100644 120000 abc def T')]) {
    assert.equal(browserScope(diff), 'full');
  }
});
