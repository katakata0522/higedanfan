import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { browserScope, selectScope } from './announcement-ci-scope.mjs';

const change = (path, header = ':100644 100644 abc def M') => header + '\0' + path + '\0';
const data = change('src/data/songAnnouncementRecords.json');
const pages = change('discography/index.html') + change('vocal-range/index.html');

test('公開手順とREADMEの本文だけならブラウザー検証を省く', () => {
  const readme = change('README.md');
  const release = change('docs/release-workflow.md');
  for (const diff of [readme, release, readme + release]) assert.equal(browserScope(diff), 'docs');
  for (const diff of [release + data, readme + change('docs/other.md'),
    change('README.md', ':000000 100644 00 ab A'), change('docs/release-workflow.md', ':100644 120000 ab cd T')]) {
    assert.equal(browserScope(diff), 'full');
  }
});

test('mainの限定検証は公開済みの直前版からの変更に限る', async t => {
  const cwd = mkdtempSync(join(tmpdir(), 'fan-browser-scope-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' }).trim();
  git('init');
  git('config', 'user.name', 'CI');
  git('config', 'user.email', 'ci@example.invalid');
  mkdirSync(join(cwd, 'src/data'), { recursive: true });
  const path = join(cwd, 'src/data/songAnnouncementRecords.json');
  const commit = value => {
    writeFileSync(path, JSON.stringify(value));
    git('add', '.');
    git('commit', '-m', 'fixture');
  };
  commit([]);
  const base = git('rev-parse', 'HEAD');
  commit(['new']);
  const env = { GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/heads/main', PUSH_BASE_SHA: base };
  const fetchBase = async () => new Response(base);
  assert.equal(await selectScope(env, cwd, fetchBase), 'announcements');
  assert.equal(await selectScope(env, cwd, async () => new Response('another release')), 'full');
  assert.equal(await selectScope(env, cwd, async () => { throw new Error('offline'); }), 'full');
  assert.equal(await selectScope({ GITHUB_EVENT_NAME: 'pull_request', PR_BASE_SHA: base }, cwd,
    async () => { throw new Error('PR must run locally'); }), 'announcements');
  commit(['next']);
  assert.equal(await selectScope(env, cwd, fetchBase), 'full');
});

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
