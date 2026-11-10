import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { catalogEntries } from '../../src/data/catalogEntries.ts';
import songEvidence from '../../src/data/songEvidence.json' with { type: 'json' };
import { formatSongBpm } from '../../src/utils/format.ts';

// JavaScript実行前のHTMLを検査する。画面だけ正しくても検索用HTMLが古ければ失敗させる。
export async function verifyStaticSeo(browser, root, ids) {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const descriptions = new Set();
  try {
    for (const id of [null, ...ids]) {
      const relative = id ? `songs/${id}/index.html` : 'index.html';
      const html = await readFile(path.resolve('dist', relative), 'utf8');
      assert.doesNotMatch(html, /__HIGEDAN_CONTENT_SECURITY_POLICY__|<!--verified-songs-->/, `${relative}: 生成が未完了です`);
      const response = await page.goto(id ? `${root}songs/${id}/` : root);
      assert.equal(response?.status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
      const canonical = `https://katakatalab.com/higedanfan/${id ? `songs/${id}/` : ''}`;
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), canonical);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      assert.ok(description && !descriptions.has(description), `${relative}: 説明が空または重複しています`);
      descriptions.add(description);
      const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
      const script = policy.split(';').find(value => value.trim().startsWith('script-src '));
      assert.equal(script?.trim(), "script-src 'self'", `${relative}: 本番で直接書かれたコードを許可しています`);
      assert.match(policy, /script-src-attr 'none'/);
      assert.doesNotMatch(policy, /unsafe-eval|ws:|wss:/);
      assert.equal(await page.locator('script:not([src])').count(), 0, `${relative}: 実行できないインラインスクリプトがあります`);
      if (id) {
        assert.match(await page.title(), /Official髭男dism/);
        assert.equal(await page.locator('meta[property="og:description"]').getAttribute('content'), description);
        assert.equal(await page.locator('meta[name="twitter:description"]').getAttribute('content'), description);
        const related = await page.locator('a[href^="/higedanfan/songs/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        assert.ok(related.length > 0, `${id}: 次の曲へのリンクがありません`);
        for (const href of related) {
          const destination = href.split('/').at(-2);
          assert.ok(destination !== id && ids.includes(destination), `${id}: 関連曲のリンク先が不正です`);
        }
      } else {
        const links = await page.locator('a[href^="/higedanfan/songs/"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
        assert.deepEqual([...new Set(links)].sort(), ids.map(songId => `/higedanfan/songs/${songId}/`).sort());
        for (const song of catalogEntries) {
          const row = page.locator('li').filter({ has: page.locator(`a[href="/higedanfan/songs/${song.id}/"]`) });
          assert.ok((await row.textContent()).includes(formatSongBpm(song.id, songEvidence[song.id].tempo)), `${song.id}: テンポが画面と一致しません`);
        }
      }
    }
  } finally { await context.close(); }
  console.log('JavaScriptなしで91ページの曲リンク・見出し・canonical・固有の説明・本番CSPを確認');
}

export async function verifyInputAndScriptBoundaries(browser, root) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const payload = '<img src=x onerror="window.__inputExecuted=1">';
  const dialogs = [];
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss(); });
  try {
    for (const suffix of ['', 'songs/pretender/']) {
      await page.goto(root + suffix, { waitUntil: 'load' });
      const blocked = await page.evaluate(async () => {
        window.__inlineExecuted = 0;
        window.__attributeExecuted = 0;
        const violations = [];
        const listener = event => violations.push(event.effectiveDirective);
        document.addEventListener('securitypolicyviolation', listener);
        const script = document.createElement('script');
        script.textContent = 'window.__inlineExecuted = 1';
        const image = document.createElement('img');
        image.setAttribute('onerror', 'window.__attributeExecuted = 1');
        image.src = '/__csp_regression_probe_missing__.png';
        document.body.append(script, image);
        // CSP違反イベントと画像のエラーイベントの配送を待つ。
        await new Promise(resolve => setTimeout(resolve, 200));
        script.remove(); image.remove();
        document.removeEventListener('securitypolicyviolation', listener);
        return { inline: window.__inlineExecuted, attribute: window.__attributeExecuted, violations };
      });
      assert.equal(blocked.inline, 0, `${suffix}: 直接書かれたスクリプトが実行されました`);
      assert.equal(blocked.attribute, 0, `${suffix}: HTML属性のコードが実行されました`);
      assert.ok(blocked.violations.includes('script-src-elem') && blocked.violations.includes('script-src-attr'));
    }
    await page.goto(`${root}#discography`, { waitUntil: 'load' });
    await page.getByLabel('曲名・読み・音域・タイアップで検索').fill(payload);
    assert.equal(await page.locator('img[onerror], script:not([src])').count(), 0);
    await page.goto(`${root}#setlist`, { waitUntil: 'load' });
    const title = page.getByLabel('マイセットリストのタイトル');
    await title.fill(payload);
    const accepted = await title.inputValue();
    await page.waitForFunction(expected => {
      const value = localStorage.getItem('higedan_fan_magazine_state_v1');
      return value && JSON.parse(value).setlistTitle === expected;
    }, accepted);
    await page.reload({ waitUntil: 'load' });
    assert.equal(await title.inputValue(), accepted);
    assert.equal(await page.locator('img[onerror], script:not([src])').count(), 0);
    assert.equal(await page.evaluate(() => window.__inputExecuted ?? 0), 0);
    assert.deepEqual(dialogs, []);

    const runtimeErrors = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));
    await page.goto(`${root}#mood`, { waitUntil: 'load' });
    const mood = page.locator('#section-mood');
    for (let step = 1; step <= 5; step++) {
      await mood.getByText(`質問 ${step} / 5`, { exact: true }).waitFor();
      await mood.locator('button[aria-pressed]').first().click();
    }
    await mood.getByRole('button', { name: '最初から診断し直す' }).waitFor();
    assert.ok(await mood.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"], a[href^="https://www.youtube.com/watch?"]').count() > 0, '診断結果の聴く導線がありません');
    await page.goto(`${root}#quiz`, { waitUntil: 'load' });
    const quiz = page.locator('#section-quiz');
    await quiz.getByRole('button', { name: /Vol\.1/ }).click();
    await quiz.getByRole('button', { name: /^1\./ }).click();
    await quiz.getByRole('button', { name: '次の問題へ進む' }).click();
    await quiz.getByRole('heading', { name: /^Q2\./ }).waitFor();
    assert.deepEqual(runtimeErrors, [], '診断またはクイズで実行エラーがあります');
  } finally { await context.close(); }
  console.log('検索・セトリ名の保存と復元・スクリプト実行拒否・診断5問と聴く導線・クイズ回答を確認');
}

export async function verifyRecordFileImport(browser, root) {
  const context = await browser.newContext();
  const page = await context.newPage();
  let dialogCount = 0;
  let acceptImport = false;
  page.on('dialog', async dialog => {
    dialogCount++;
    if (acceptImport) await dialog.accept();
    else await dialog.dismiss();
  });
  const key = 'higedan_fan_magazine_state_v1';
  const assertUnchanged = (actualRaw, expectedRaw, message) => {
    const actual = JSON.parse(actualRaw), expected = JSON.parse(expectedRaw);
    const changed = [...new Set([...Object.keys(actual), ...Object.keys(expected)])]
      .filter(field => !isDeepStrictEqual(actual[field], expected[field]));
    assert.deepEqual(changed, [], message);
  };
  const upload = records => page.getByLabel('ファイルから記録を戻す', { exact: true }).setInputFiles({
    name: 'notebook-regression.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(records)),
  });
  const openImport = async () => {
    await page.getByLabel('マイセットリストのタイトル').waitFor();
    await page.getByText('記録の保存・引き継ぎ', { exact: true }).click();
  };
  try {
    await page.goto(`${root}#setlist`, { waitUntil: 'load' });
    await page.waitForFunction(key => localStorage.getItem(key) !== null, key);
    const before = await page.evaluate(key => localStorage.getItem(key), key);
    const legitimate = {
      ...JSON.parse(before), setlistTitle: '読み込み確認 ', bestQuizScore: 0, hasQuizAttempt: true,
      reviews: [{ id: 'rev-browser-regression', author: '読者', title: '思い出の記録', comment: '一行目の感想です。\n二行目の思い出です。',
        songId: 'pretender', category: 'ライブ体験', fanTenure: '3年', postedAt: '2026.11.10', likes: 0 }],
    };
    let index = 0;
    for (const field of ['setlistTitle', 'author', 'title', 'comment', 'fanTenure', 'postedAt']) {
      await page.reload({ waitUntil: 'load' });
      await openImport();
      const records = structuredClone(legitimate);
      const payload = ['<!--', '<a', '＜a'][index % 3].repeat(64000);
      if (field === 'setlistTitle') records.setlistTitle = payload;
      else records.reviews[0][field] = payload;
      await upload(index++ % 2 ? { format: 'higedan-fan-notebook', version: 1, records } : records);
      await page.getByText('記録ファイルを読み込めませんでした。元の記録は残っています。', { exact: true }).waitFor({ timeout: 5000 });
      assertUnchanged(await page.evaluate(key => localStorage.getItem(key), key), before, `${field}: 拒否したファイルで記録が変わりました`);
      assert.equal(dialogCount, 0, `${field}: 不正な記録が確認画面まで進みました`);
    }
    const cancelled = page.waitForEvent('dialog');
    await upload({ format: 'higedan-fan-notebook', version: 1, records: legitimate });
    await cancelled;
    assertUnchanged(await page.evaluate(key => localStorage.getItem(key), key), before, 'キャンセルで元の記録が変わりました');
    acceptImport = true;
    await upload({ format: 'higedan-fan-notebook', version: 1, records: legitimate });
    await page.getByText('記録を読み込みました。', { exact: true }).waitFor();
    await page.reload({ waitUntil: 'load' });
    await page.getByLabel('マイセットリストのタイトル').waitFor();
    const restored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    assert.equal(restored.setlistTitle, legitimate.setlistTitle);
    assert.deepEqual(restored.reviews, legitimate.reviews);
    assert.equal(restored.bestQuizScore, 0);
    assert.deepEqual(restored.setlist, legitimate.setlist);
  } finally { await context.close(); }
  console.log('ファイル選択から6項目の不正入力拒否・元の記録保持・キャンセル・通常の復元と再読み込みを確認');
}
