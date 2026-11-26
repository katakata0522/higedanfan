import assert from 'node:assert/strict';
import test from 'node:test';
import { announcementDataOnly } from './announcement-ci-scope.mjs';

const change = (path, header = ':100644 100644 abc def M') => header + '\0' + path + '\0';
const data = change('src/data/songAnnouncementRecords.json');
const pages = change('discography/index.html') + change('vocal-range/index.html');

test('告知データは生成HTMLと一緒でも限定検証を使う', () => {
  assert.ok(announcementDataOnly(data));
  assert.ok(announcementDataOnly(pages + data));
});
test('データ以外・不明な差分・削除・ファイル種別の変更は全件検証する', () => {
  for (const diff of ['', pages, data.slice(0, -1), data + change('src/utils/songSearch.ts'),
    data + change('discography/index.html', ':100644 000000 abc 000 D'),
    change('src/data/songAnnouncementRecords.json', ':100644 120000 abc def T')]) {
    assert.equal(announcementDataOnly(diff), false);
  }
});
