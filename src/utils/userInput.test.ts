import assert from 'node:assert/strict';
import test from 'node:test';
import { Worker } from 'node:worker_threads';
import { sanitizeUserText } from './userInput';
import { sanitizeSetlistTitle } from './setlist';

test('text cleanup preserves ordered delimiters, unmatched openers, and ordinary title spaces', () => {
  const cases = [
    ['前<!--隠す-->後', '前後'],
    ['前<!--未完', '前!--未完'],
    ['a<b<em>c</em>d', 'acd'],
    ['＜b＜i＞本文＜/b＞', '本文'],
    ['<b<!--隠す-->>本文</b>', '本文'],
    ['＜b<i>＞本文＜/b＞', '本文'],
    ['<\u0000b>本文</b>', '本文'],
    ['<1>残す</1>', '1残す/1'],
    ['<b\nclass=x>一行目\n二行目</b>', '一行目\n二行目'],
    ['  いつもの音楽 & 思い出  ', 'いつもの音楽 & 思い出'],
  ];
  for (const [input, expected] of cases) assert.equal(sanitizeUserText(input), expected);
  assert.equal(sanitizeSetlistTitle('My セトリ '), 'My セトリ ');
  assert.equal(sanitizeSetlistTitle(''), '');
  assert.equal(sanitizeUserText('<b>あいうえお</b>', 3), 'あいう');
});

test('large malformed fields finish without blocking, across backup formats and legacy restoration', { timeout: 20000 }, async () => {
  const base = () => ({
    setlist: [], setlistTitle: 'My セトリ ', visitedSpotIds: [], attendedTourIds: [],
    votedKeys: [], likedReviewIds: [], bestQuizScore: 0, hasQuizAttempt: true,
    reviews: [{ id: 'rev-regression', author: '読者', title: '普通の感想', comment: '一行目の感想です。\n二行目の思い出です。',
      songId: 'pretender', category: 'ライブ体験', fanTenure: '3年', postedAt: '2026.11.10', likes: 0 }],
  });
  const cases: { raw: string; restoreOnly?: boolean }[] = [{ raw: JSON.stringify(base()) }];
  const expected = [true];
  for (const payload of ['<!--'.repeat(64000), '<a'.repeat(128000), '＜a'.repeat(128000)]) {
    for (const field of ['setlistTitle', 'author', 'title', 'comment', 'fanTenure', 'postedAt'] as const) {
      const records = base();
      if (field === 'setlistTitle') records.setlistTitle = payload;
      else records.reviews[0][field] = payload;
      for (const envelope of [false, true]) {
        const raw = JSON.stringify(envelope ? { format: 'higedan-fan-notebook', version: 1, records } : records);
        assert.ok(Buffer.byteLength(raw) < 2_000_000);
        cases.push({ raw }); expected.push(false);
      }
      // ブラウザ内の旧データ復元は、従来どおり正規化して読み込む。
      cases.push({ raw: JSON.stringify(records), restoreOnly: true }); expected.push(true);
    }
  }
  // JSONのエスケープ表記でも、同じ文字列として処理される。
  cases.push({ raw: JSON.stringify({ ...base(), setlistTitle: '<a'.repeat(128000) }).replaceAll('<', '\\u003c') });
  expected.push(false);
  const worker = new Worker(new URL('./test-fixtures/userInputWorker.mjs', import.meta.url), {
    execArgv: [], workerData: {
      backupUrl: new URL('../hooks/fanRecordBackup.ts', import.meta.url).href,
      storageUrl: new URL('../hooks/fanRecordStorage.ts', import.meta.url).href,
    },
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const results = await new Promise<{ accepted: boolean; title?: string }[]>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('検証用Workerが起動しません')), 10000);
      worker.once('error', reject);
      worker.on('message', message => {
        clearTimeout(timer);
        if (message.ready) {
          timer = setTimeout(() => reject(new Error('記録の検証が処理時間の上限を超えました')), 5000);
          worker.postMessage(cases);
        } else resolve(message.results);
      });
    });
    assert.deepEqual(results.map(result => result.accepted), expected);
    assert.equal(results[0].title, 'My セトリ ');
  } finally { clearTimeout(timer); await worker.terminate(); }
});

test('sanitizeUserText removes BiDi override characters, C1 control bytes, and nested dangerous schemes or handlers', () => {
  // Bidirectional isolates/overrides and Arabic letter mark
  const bidiInput = 'Safe\u061C\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069Text';
  assert.equal(sanitizeUserText(bidiInput), 'SafeText');

  // C1 control characters (\u0080 - \u009F)
  const c1Input = 'Line\u0080\u0085\u009B\u009FEnd';
  assert.equal(sanitizeUserText(c1Input), 'LineEnd');

  // Multi-pass obfuscated/stacked URI scheme and inline DOM handler stripping
  assert.equal(sanitizeUserText('ja<!--split-->vascript:alert(1)'), 'alert(1)');
  assert.equal(sanitizeUserText('da\u200Eta:text/html,ok'), 'text/html,ok');
  assert.equal(sanitizeUserText('vb\u0080script:msg'), 'msg');
  assert.equal(sanitizeUserText('fi<img src=x>le:///etc/passwd'), '///etc/passwd');
  assert.equal(sanitizeUserText('bl<b>ob:https://example.com'), 'https://example.com');
  assert.equal(sanitizeUserText('javascript:data:vbscript:alert(1)'), 'alert(1)');
  assert.equal(sanitizeUserText('label on<!--c-->click=alert(1)'), 'label alert(1)');
  assert.equal(sanitizeUserText('label onclick=onpointerenter=foo'), 'label foo');
});
