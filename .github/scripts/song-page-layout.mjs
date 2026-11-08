import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { chromium } from 'playwright';
import { catalogEntries } from '../../src/data/catalogEntries.ts';
import { publishedSongPageIds } from '../../src/songPages/publishedSongPageIds.ts';

// 生成済みのページと台帳が一致することを確認し、公開用ビルドそのものを検証する。
const ids = [...publishedSongPageIds].sort();
const catalogIds = catalogEntries.map(song => song.id).sort();
const builtIds = (await readdir(path.resolve('dist/songs'), { withFileTypes: true }))
  .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
assert.deepEqual(ids, catalogIds, '楽曲ガイドと独立ページの曲が一致しません');
assert.deepEqual(builtIds, ids, '公開ビルドに不足または余分な楽曲ページがあります');

const socket = createServer();
await new Promise((resolve, reject) => socket.once('error', reject).listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise((resolve, reject) => socket.close(error => error ? reject(error) : resolve()));

const server = spawn(process.execPath, [
  path.resolve('node_modules/vite/bin/vite.js'), 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort',
], { stdio: ['ignore', 'pipe', 'pipe'] });
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += chunk; });
server.stderr.on('data', chunk => { serverOutput += chunk; });
const root = `http://127.0.0.1:${port}/higedanfan/`;

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`試験用サーバーが終了しました: ${serverOutput}`);
    try {
      const response = await fetch(root, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch { /* サーバーの起動を待つ */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error(`試験用サーバーが起動しません: ${serverOutput}`);
}

async function inspectAllPages(browser, scenario) {
  const context = await browser.newContext(scenario.context);
  const failures = [];
  let next = 0;

  async function worker() {
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    while (next < ids.length) {
      const id = ids[next++];
      try {
        const response = await page.goto(`${root}songs/${id}/`, { waitUntil: 'load' });
        assert.equal(response?.status(), 200, '楽曲ページに到達できません');
        await page.locator('.song-sheet').waitFor();
        if (!scenario.mobile) {
          await page.waitForFunction(() => Boolean(document.querySelector('.sheet-frame')?.style.width));
        }
        if (scenario.readable) {
          await page.getByRole('button', { name: '大きな文字で読む' }).click();
          await page.locator('.sheet-frame--readable').waitFor();
        }
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

        const result = await page.evaluate(() => {
          const box = selector => document.querySelector(selector).getBoundingClientRect();
          const cover = box('.cover-placeholder');
          const hero = box('.song-hero');
          const content = box('.hero-content');
          const feature = box('.feature-line');
          const facts = [...document.querySelectorAll('.fact-item')].map(item => {
            const bounds = item.getBoundingClientRect();
            const value = item.querySelector('dd').getBoundingClientRect();
            return { top: bounds.top, left: value.left - bounds.left, right: bounds.right - value.right };
          });
          const title = document.querySelector('#song-title');
          return {
            width: document.documentElement.scrollWidth, viewport: innerWidth,
            height: document.documentElement.scrollHeight, viewportHeight: innerHeight,
            coverWidth: cover.width, coverHeight: cover.height, coverRight: cover.right, coverBottom: cover.bottom,
            contentLeft: content.left, contentTop: content.top,
            heroLeft: hero.left, heroWidth: hero.width, heroBottom: hero.bottom,
            featureLeft: feature.left, featureWidth: feature.width, featureTop: feature.top,
            titleWidth: title.scrollWidth, titleClient: title.clientWidth,
            placeholders: document.querySelectorAll('.cover-placeholder').length,
            coverImages: document.querySelectorAll('.cover img').length,
            badges: [...document.querySelectorAll('a')].filter(link => /iTunes Store/i.test(`${link.textContent} ${link.querySelector('img')?.alt || ''}`)).length
              + document.querySelectorAll('iframe[src*="music.apple.com"]').length,
            overviewFont: parseFloat(getComputedStyle(document.querySelector('.overview-copy p')).fontSize),
            tempoText: document.querySelectorAll('.fact-item')[1].querySelector('dd').textContent,
            facts,
          };
        });

        assert.equal(result.placeholders, 1, '正方形の仮枠がありません');
        assert.equal(result.coverImages, 0, '仮枠に画像が残っています');
        assert.equal(result.badges, 0, 'ストアのバッジやプレーヤーが残っています');
        assert.match(result.tempoText, /^約\d+(?:\.\d+)?\s+BPM$/, 'テンポが目安として表示されていません');
        assert.ok(Math.abs(result.coverWidth - result.coverHeight) < 1, '仮枠が正方形ではありません');
        assert.ok(result.width <= result.viewport, '横にはみ出しています');
        assert.ok(result.titleWidth <= result.titleClient + 1, '曲名がはみ出しています');
        assert.ok(result.facts.every(fact => fact.left >= -1 && fact.right >= -1), '楽曲データが枠からはみ出しています');
        assert.ok(Math.abs(result.heroLeft - result.featureLeft) < 1 && Math.abs(result.heroWidth - result.featureWidth) < 1 && result.featureTop >= result.heroBottom, '紹介文の帯が紙面幅になっていません');
        assert.ok(Math.abs(result.facts[0].top - result.facts[1].top) < 1 && result.facts[2].top > result.facts[0].top && Math.abs(result.facts[2].top - result.facts[3].top) < 1 && Math.abs(result.facts[3].top - result.facts[4].top) < 1, 'データが2項目と3項目の2段になっていません');
        if (scenario.mobile) {
          assert.ok(result.coverBottom <= result.contentTop + 1, 'スマホで画像欄と曲名が重なっています');
        } else {
          assert.ok(result.coverRight <= result.contentLeft + 1, '画像欄と曲名が重なっています');
          if (scenario.readable) assert.ok(result.overviewFont >= 16, '大きな文字で読む表示が小さすぎます');
          else assert.ok(result.height <= result.viewportHeight, '通常表示が1画面に収まりません');
        }
      } catch (error) {
        failures.push(`${id}: ${error.message}`);
      }
    }
    await page.close();
  }

  await Promise.all(Array.from({ length: 4 }, worker));
  await context.close();
  assert.deepEqual(failures, [], `${scenario.name}で表示不良: ${failures.join('; ')}`);
  console.log(`${scenario.name}: ${ids.length}曲を確認`);
}

async function verifyImmediateReload(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const lockPage = await context.newPage();
  await page.goto(`${root}songs/white-noise/`, { waitUntil: 'load' });
  await page.waitForFunction(() => localStorage.getItem('higedan_fan_magazine_state_v1') !== null);
  await lockPage.goto(root, { waitUntil: 'load' });
  async function holdLock() {
    await lockPage.evaluate(() => {
      window.releaseTestLock = null;
      void navigator.locks.request('higedan_fan_magazine_state_v1', () => new Promise(resolve => {
        window.releaseTestLock = resolve;
      }));
    });
    await lockPage.waitForFunction(() => typeof window.releaseTestLock === 'function');
  }
  async function releaseLock() {
    await lockPage.evaluate(() => window.releaseTestLock());
  }
  await holdLock();
  await page.getByRole('button', { name: 'マイセトリに追加' }).click();
  await page.getByRole('link', { name: 'マイセトリで確認' }).waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'white-noise')), false, '保存が完了する前の状況を再現できません');
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'マイセトリで確認' }).waitFor({ timeout: 10000 });
  await releaseLock();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'white-noise'));
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'マイセトリで確認' }).waitFor();

  // セトリ作成画面からの追加も、アンコール設定ごと同じ条件で復元する。
  await page.goto(`${root}#setlist`, { waitUntil: 'load' });
  await page.getByLabel('追加する曲を選択').selectOption('cry-baby');
  await page.getByLabel('アンコール枠で追加').check();
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'cry-baby')), false);
  await page.reload({ waitUntil: 'load' });
  await page.getByLabel('追加する曲を選択').waitFor();
  await releaseLock();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'cry-baby' && item.isEncore));

  // 保存待ちの追加をその場で外したとき、再読み込みで復活させない。
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).click();
  await page.reload({ waitUntil: 'load' });
  await page.getByLabel('追加する曲を選択').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).count(), 0);
  await releaseLock();
  await lockPage.evaluate(() => navigator.locks.request('higedan_fan_magazine_state_v1', () => true));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'bedroom-talk')), false);

  // 同じ曲を追加・削除・再追加した直後も、最後の選択を復元する。
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).click();
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await page.getByLabel('アンコール枠で追加').check();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).waitFor();
  await releaseLock();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'bedroom-talk' && item.isEncore));
  await context.close();
  console.log('楽曲ページとセトリ作成画面で、保存待ち中の再読み込みから曲とアンコール設定を復元');
}

async function verifyStorageFailures(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === sessionStorage && key.startsWith('higedan_pending_setlist_add_v1:')) throw new Error('session storage blocked');
      return setItem.call(this, key, value);
    };
  });
  await page.goto(`${root}songs/white-noise/`, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'マイセトリに追加' }).click();
  await page.getByRole('alert').getByText(/一時保存できません/).waitFor();
  assert.equal(await page.getByRole('link', { name: 'マイセトリで確認' }).count(), 0);
  await page.getByRole('button', { name: '画面上の記録を書き出す' }).waitFor();
  await context.close();

  const retryContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const retry = await retryContext.newPage();
  await retry.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (this === localStorage && key === 'higedan_fan_magazine_state_v1' && sessionStorage.getItem('test-block-primary') === '1') throw new Error('local storage blocked');
      return setItem.call(this, key, value);
    };
  });
  await retry.goto(`${root}songs/white-noise/`, { waitUntil: 'load' });
  await retry.waitForFunction(() => localStorage.getItem('higedan_fan_magazine_state_v1') !== null);
  await retry.evaluate(() => sessionStorage.setItem('test-block-primary', '1'));
  await retry.getByRole('button', { name: 'マイセトリに追加' }).click();
  await retry.getByRole('alert').getByText(/この端末に保存できません/).waitFor();
  await retry.getByRole('button', { name: '画面上の記録を書き出す' }).waitFor();
  await retry.evaluate(() => sessionStorage.removeItem('test-block-primary'));
  await retry.reload({ waitUntil: 'load' });
  await retry.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'white-noise'));
  await retryContext.close();
  console.log('一時保存や本保存に失敗した場合の警告と復元を確認');
}

async function verifyInteractions(browser) {
  const context = await browser.newContext({ viewport: { width: 615, height: 604 }, deviceScaleFactor: 1.5 });
  const page = await context.newPage();
  await page.goto(`${root}songs/white-noise/`, { waitUntil: 'load' });
  await page.locator('.song-sheet').waitFor();
  await page.waitForFunction(() => Boolean(document.querySelector('.sheet-frame')?.style.width));

  const initialScale = await page.locator('.song-sheet').evaluate(element => getComputedStyle(element).transform);
  await page.locator('.sources summary').click();
  await page.waitForFunction(() => document.querySelector('.sources')?.open && document.documentElement.scrollHeight > innerHeight);
  assert.equal(await page.locator('.song-sheet').evaluate(element => getComputedStyle(element).transform), initialScale, '出典の展開で紙面がさらに縮小されました');
  assert.equal(await page.locator('.source-list a').first().isVisible(), true);
  await page.locator('.sources summary').click();
  await page.waitForFunction(() => !document.querySelector('.sources')?.open && document.documentElement.scrollHeight <= innerHeight);

  await page.getByRole('button', { name: '大きな文字で読む' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform === 'none');
  const readable = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth, viewport: innerWidth,
    height: document.documentElement.scrollHeight, viewportHeight: innerHeight,
    fontSize: parseFloat(getComputedStyle(document.querySelector('.overview-copy p')).fontSize),
  }));
  assert.ok(readable.width <= readable.viewport && readable.height > readable.viewportHeight && readable.fontSize >= 16, '大きな文字で読む表示が正しくありません');
  await page.getByRole('button', { name: '1画面に戻す' }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform !== 'none' && document.documentElement.scrollHeight <= innerHeight);

  await page.getByRole('button', { name: 'マイセトリに追加' }).click();
  await page.getByRole('link', { name: 'マイセトリで確認' }).waitFor();
  // 表示は先に更新されるため、保存完了の通知を待ってから再読み込みする。
  await page.getByRole('status').filter({ hasText: 'マイセトリに追加しました' }).waitFor();
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'マイセトリで確認' }).waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform === 'none' && !document.querySelector('.sheet-frame').style.width);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '画面幅変更後に横にはみ出しています');
  await page.setViewportSize({ width: 615, height: 604 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform !== 'none' && document.documentElement.scrollHeight <= innerHeight);

  await page.goto(`${root}songs/pretender/`, { waitUntil: 'load' });
  await page.locator('.song-sheet').waitFor();
  assert.match(await page.locator('.fact-item').nth(1).innerText(), /約92\s+BPM/, '選んだテンポが表示されていません');
  await page.locator('.sources summary').click();
  await page.getByRole('link', { name: '約184 BPM' }).waitFor();

  await context.close();
  console.log('出典の開閉・別のテンポ表記・拡大表示・マイセトリ保存・画面幅変更を確認');
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined });
  await verifyImmediateReload(browser);
  await verifyStorageFailures(browser);
  await inspectAllPages(browser, { name: 'PC 1280×720', context: { viewport: { width: 1280, height: 720 } } });
  await inspectAllPages(browser, { name: 'PC 615×604', context: { viewport: { width: 615, height: 604 }, deviceScaleFactor: 1.5 } });
  await inspectAllPages(browser, { name: 'スマホ 320px', mobile: true, context: { viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true } });
  await inspectAllPages(browser, { name: 'スマホ 390px', mobile: true, context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
  await inspectAllPages(browser, { name: 'PC 大きな文字 521px', readable: true, context: { viewport: { width: 521, height: 844 } } });
  await verifyInteractions(browser);
} finally {
  await browser?.close();
  server.kill();
}
