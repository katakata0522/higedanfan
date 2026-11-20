import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import path from 'node:path';
import { chromium } from 'playwright';
import { songReadings } from '../../src/data/songReadings.ts';
import { songLatinReadings, songTitleAliases } from '../../src/data/songLatinReadings.ts';
import { catalogEntries } from '../../src/data/catalogEntries.ts';
import { publishedSongPageIds } from '../../src/songPages/publishedSongPageIds.ts';
import { isTempoUnderReview } from '../../src/data/tempoReviewStatus.ts';
import { getCourseQuestions } from '../../src/components/quiz/quizCourses.ts';
import { verifyStaticSeo, verifyInputAndScriptBoundaries, verifyRecordFileImport, openSetlistEditor, verifyPwaReadinessAndInstall } from './site-security-seo.mjs';

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

const appleCdnCache = new Map();

async function routeWithCache(route) {
  const url = route.request().url();
  let cached = appleCdnCache.get(url);
  if (!cached) {
    const pending = route.fetch({ timeout: 20000 }).then(async res => ({
      status: res.status(),
      contentType: res.headers()['content-type'] || 'image/jpeg',
      body: await res.body(),
    }));
    appleCdnCache.set(url, pending);
    cached = pending;
  }
  try {
    const entry = await cached;
    await route.fulfill({ status: entry.status, contentType: entry.contentType, body: entry.body });
  } catch {
    appleCdnCache.delete(url);
    await route.abort();
  }
}

async function inspectAllPages(browser, scenario) {
  const context = await browser.newContext(scenario.context);
  await context.route('https://*.mzstatic.com/**', routeWithCache);
  await context.route('https://i.ytimg.com/**', routeWithCache);
  const failures = [];
  let next = 0;

  async function worker() {
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    while (next < ids.length) {
      const id = ids[next++];
      try {
        const response = await page.goto(`${root}songs/${id}/`, { waitUntil: 'load', timeout: 25000 });
        assert.equal(response?.status(), 200, '楽曲ページに到達できません');
        await page.locator('.overview-copy p').first().waitFor();
        if (scenario.readable) {
          await page.locator('.song-site-menu > summary').click();
          await page.getByRole('button', { name: '大きな文字で読む' }).click();
          await page.locator('.sheet-frame--readable').waitFor();
        }
        await page.waitForFunction(() => {
          const cover = document.querySelector('.cover .cover-art');
          const placeholder = document.querySelector('.cover .cover-placeholder');
          const badge = document.querySelector('.cover .cover-apple-badge-img');
          return Boolean((cover?.complete || placeholder) && badge?.complete);
        });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

        const result = await page.evaluate(() => {
          const box = selector => document.querySelector(selector)?.getBoundingClientRect();
          const coverImg = document.querySelector('.cover .cover-art');
          const badgeImg = document.querySelector('.cover .cover-apple-badge-img');
          const badgeLink = document.querySelector('.cover .cover-apple-badge');
          const cover = box('.cover .cover-art') ?? box('.cover .cover-placeholder');
          const badge = badgeLink?.getBoundingClientRect();
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
            coverLoaded: Boolean(
              coverImg?.complete
              && coverImg.naturalWidth >= 500
              && coverImg.naturalHeight >= 500
              && Math.abs(coverImg.naturalWidth - coverImg.naturalHeight) <= 8
            ),
            badgeLoaded: Boolean(badgeImg?.complete && badgeImg.naturalWidth > 0),
            badgeHref: badgeLink?.getAttribute('href') ?? '',
            badgeTop: badge?.top ?? 0,
            badgeRight: badge?.right ?? 0,
            badgeBottom: badge?.bottom ?? 0,
            badgeWidth: badge?.width ?? 0,
            badgeHeight: badge?.height ?? 0,
            contentLeft: content.left, contentTop: content.top,
            heroLeft: hero.left, heroWidth: hero.width, heroBottom: hero.bottom,
            featureLeft: feature.left, featureWidth: feature.width, featureTop: feature.top,
            titleWidth: title.scrollWidth, titleClient: title.clientWidth,
            placeholders: document.querySelectorAll('.cover-placeholder').length,
            coverImages: document.querySelectorAll('.cover .cover-art').length,
            appleBadges: document.querySelectorAll('.cover .cover-apple-badge').length,
            closeClickable: (() => {
              const link = document.querySelector('.sheet-top-back'), r = link.getBoundingClientRect();
              return link.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
            })(),
            legacyBadges: [...document.querySelectorAll('a')].filter(link => /iTunes Store/i.test(`${link.textContent} ${link.querySelector('img')?.alt || ''}`)).length
              + document.querySelectorAll('iframe[src*="music.apple.com"]').length,
            overviewFont: parseFloat(getComputedStyle(document.querySelector('.overview-copy p')).fontSize),
            tempoText: document.querySelectorAll('.fact-item')[1].querySelector('dd').textContent,
            facts,
          };
        });

        assert.equal(result.placeholders, 0, 'ジャケット画像が仮枠のままです');
        assert.equal(result.coverImages, 1, 'ジャケット画像が表示されていません');
        assert.ok(result.coverLoaded, 'ジャケット画像の読み込みに失敗しているか正方形ではありません');
        assert.equal(result.appleBadges, 1, 'Apple Music公式バッジがありません');
        assert.ok(result.badgeLoaded, 'Apple Music公式バッジSVGが読み込めませんでした');
        assert.match(result.badgeHref, /^https:\/\/music\.apple\.com\//, 'Apple Music公式バッジのリンク先が不正です');
        assert.ok(result.badgeTop - result.coverBottom >= 4, 'ジャケットとApple Musicバッジの間隔が狭すぎます');
        assert.ok(result.closeClickable, '一覧に戻るリンクがタイトルに覆われています');
        assert.equal(result.legacyBadges, 0, '旧ストアバッジやプレーヤー埋め込みが残っています');
        assert.match(result.tempoText, isTempoUnderReview(id) ? /^調査中$/ : /^約\d+(?:\.\d+)?\s+BPM$/, 'テンポの表示が調査状況と一致しません');
        assert.ok(Math.abs(result.coverWidth - result.coverHeight) < 1, 'ジャケット画像枠が正方形ではありません');
        assert.ok(result.width <= result.viewport, '横にはみ出しています');
        assert.ok(result.titleWidth <= result.titleClient + 1, '曲名がはみ出しています');
        assert.ok(result.facts.every(fact => fact.left >= -1 && fact.right >= -1), '楽曲データが枠からはみ出しています');
        assert.ok(Math.abs(result.heroLeft - result.featureLeft) < 1 && Math.abs(result.heroWidth - result.featureWidth) < 1 && result.featureTop >= result.heroBottom, '紹介文の帯が紙面幅になっていません');
        assert.ok(Math.abs(result.facts[0].top - result.facts[1].top) < 1 && result.facts[2].top > result.facts[0].top && Math.abs(result.facts[2].top - result.facts[3].top) < 1 && Math.abs(result.facts[3].top - result.facts[4].top) < 1, 'データが2項目と3項目の2段になっていません');
        if (scenario.mobile) {
          assert.ok(result.coverBottom <= result.contentTop + 1 && result.badgeBottom <= result.contentTop + 1, 'スマホで画像欄と曲名が重なっています');
        } else {
          assert.ok(result.coverRight <= result.contentLeft + 1 && result.badgeRight <= result.contentLeft + 1, '画像欄と曲名が重なっています');
          if (scenario.readable) assert.ok(result.overviewFont >= 20, '大きな文字で読む表示が小さすぎます');
          else assert.ok(result.overviewFont >= 18, '本文の文字が小さすぎます');
        }
        if (scenario.mobile) assert.ok(result.overviewFont >= 16, 'スマホの本文が小さすぎます');
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
  await page.getByRole('button', { name: 'MYセトリに追加' }).first().click();
  await page.getByRole('link', { name: 'MYセトリで確認' }).first().waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'white-noise')), false, '保存が完了する前の状況を再現できません');
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'MYセトリで確認' }).first().waitFor({ timeout: 10000 });
  await releaseLock();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'white-noise'));
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'MYセトリで確認' }).first().waitFor();

  // セトリ作成画面からの追加も、アンコール設定ごと同じ条件で復元する。
  await page.goto(`${root}#setlist`, { waitUntil: 'load' });
  await openSetlistEditor(page, 'album', 'encore');
  await page.getByLabel('追加する曲を選択').selectOption('cry-baby');
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'cry-baby')), false);
  await page.reload({ waitUntil: 'load' });
  await openSetlistEditor(page, 'album', 'encore');
  await releaseLock();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'cry-baby' && item.isEncore));

  // 保存待ちの追加をその場で外したとき、再読み込みで復活させない。
  await openSetlistEditor(page, 'album', 'main');
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).click();
  await page.reload({ waitUntil: 'load' });
  await openSetlistEditor(page, 'album', 'main');
  assert.equal(await page.locator('li[data-song-id="bedroom-talk"]').count(), 0);
  await releaseLock();
  await lockPage.evaluate(() => navigator.locks.request('higedan_fan_magazine_state_v1', () => true));
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.some(item => item.songId === 'bedroom-talk')), false);

  // 同じ曲を追加・削除・再追加した直後も、最後の選択を復元する。
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await holdLock();
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  await page.getByRole('button', { name: 'Bedroom Talkをセットリストから外す' }).click();
  await openSetlistEditor(page, 'album', 'encore');
  await page.getByLabel('追加する曲を選択').selectOption('bedroom-talk');
  await page.getByRole('button', { name: '曲を追加', exact: true }).click();
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'Bedroom Talk', exact: true }).waitFor();
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
  await page.getByRole('button', { name: 'MYセトリに追加' }).first().click();
  await page.getByRole('alert').getByText(/一時保存できません/).waitFor();
  assert.equal(await page.getByRole('link', { name: 'MYセトリで確認' }).count(), 0);
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
  await retry.getByRole('button', { name: 'MYセトリに追加' }).first().click();
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
  await page.locator('.overview-copy p').first().waitFor();

  const initialFont = await page.locator('.overview-copy p').first().evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  await page.locator('.sources summary').click();
  await page.waitForFunction(() => document.querySelector('.sources')?.open && document.documentElement.scrollHeight > innerHeight);
  assert.equal(await page.locator('.overview-copy p').first().evaluate(element => parseFloat(getComputedStyle(element).fontSize)), initialFont, '出典の展開で本文が縮小されました');
  assert.equal(await page.locator('.source-list a').first().isVisible(), true);
  await page.locator('.sources summary').click();
  await page.waitForFunction(() => !document.querySelector('.sources')?.open);

  await page.locator('.song-site-menu > summary').click();
  await page.getByRole('button', { name: '大きな文字で読む' }).click();
  await page.locator('.sheet-frame--readable').waitFor();
  const readable = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth, viewport: innerWidth,
    height: document.documentElement.scrollHeight, viewportHeight: innerHeight,
    fontSize: parseFloat(getComputedStyle(document.querySelector('.overview-copy p')).fontSize),
  }));
  assert.ok(readable.width <= readable.viewport && readable.height > readable.viewportHeight && readable.fontSize > initialFont, '大きな文字で読む表示が正しくありません');
  await page.locator('.song-site-menu > summary').click();
  await page.getByRole('button', { name: '標準の文字に戻す' }).click();
  await page.waitForFunction(() => !document.querySelector('.sheet-frame--readable'));

  await page.getByRole('button', { name: 'MYセトリに追加' }).first().click();
  await page.getByRole('link', { name: 'MYセトリで確認' }).first().waitFor();
  // 表示は先に更新されるため、保存完了の通知を待ってから再読み込みする。
  await page.getByRole('status').filter({ hasText: 'MYセトリに追加しました' }).waitFor();
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'MYセトリで確認' }).first().waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform === 'none');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '画面幅変更後に横にはみ出しています');
  await page.setViewportSize({ width: 615, height: 604 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.song-sheet')).transform === 'none');

  await page.goto(`${root}songs/pretender/`, { waitUntil: 'load' });
  await page.locator('.song-sheet').waitFor();
  assert.match(await page.locator('.fact-item').nth(1).innerText(), /約92\s+BPM/, '選んだテンポが表示されていません');
  await page.locator('.sources summary').click();
  await page.getByRole('link', { name: '約184 BPM' }).waitFor();

  await context.close();
  console.log('出典の開閉・別のテンポ表記・拡大表示・マイセトリ保存・画面幅変更を確認');
}

async function verifyGuideAndSetlistUsability(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => {
    const key = 'higedan_fan_magazine_state_v1';
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ setlist: [], setlistTitle: '確認用セトリ' }));
    if (!localStorage.getItem('higedan_intro_seen_v2')) localStorage.setItem('higedan_intro_seen_v2', '1');
  });
  const page = await context.newPage();
  await page.goto(root, { waitUntil: 'load' });
  await page.getByRole('link', { name: '今日の1曲診断をひらく' }).waitFor();
  assert.equal(await page.getByText('図柄を選択', { exact: false }).count(), 0);
  await page.getByRole('link', { name: /『Pretender』の解説ページへ/ }).click();
  await page.getByRole('heading', { name: 'Pretender', exact: true }).waitFor();
  assert.match(await page.locator('.overview-copy').innerText(), /コンフィデンスマンJP/);

  await page.goto(`${root}#vocal_range`, { waitUntil: 'load' });
  const table = page.getByRole('table', { name: /音域・発売日比較表/ });
  await table.waitFor();
  assert.equal(await table.locator('tbody tr').count(), 90, '音域比較表で最初から全90曲を比較できません');
  const colWidthsBefore = await table.locator('thead th').evaluateAll(ths => ths.map(th => Math.round(th.getBoundingClientRect().width)));
  await page.getByRole('button', { name: /条件を絞る・並べ替える/ }).click();
  await page.getByLabel('並び替え', { exact: true }).selectOption('highest_note');
  assert.match(await table.locator('tbody tr').first().innerText(), /hiE \(E5\)/, '地声最高音順に並びません');
  assert.equal(await table.locator('tbody tr').count(), 90, '並び替えた後に表示曲数が減っています');
  const colWidthsAfter = await table.locator('thead th').evaluateAll(ths => ths.map(th => Math.round(th.getBoundingClientRect().width)));
  assert.deepEqual(colWidthsAfter, colWidthsBefore, '並べ替えで比較表の列幅が変わっています');
  const subtitle = table.locator('tr').filter({ hasText: 'Subtitle' });
  assert.match(await subtitle.innerText(), /—/, '調査元にあるはずのない裏声値を誤表示しています');
  assert.equal(await subtitle.getByRole('link', { name: /Subtitleの音域の参照元/ }).count(), 1);
  assert.match(await subtitle.innerText(), /J-POP 音域の沼 ↗/);
  assert.doesNotMatch(await table.innerText(), /(?:^|\s)採譜 ↗/);

  await page.goto(`${root}#discography`, { waitUntil: 'load' });
  assert.equal(await page.locator('#section-discography article').count(), 24, '楽曲ガイドの1ページ目は24曲表示が必要です');
  await page.getByRole('navigation', { name: '楽曲ガイドのページ切り替え' }).getByRole('button', { name: '2ページ目を表示' }).click();
  await page.getByText(/全 90 曲中 25〜48 曲目/).waitFor();
  const firstSongLink = page.locator('#section-discography article a[aria-label$="：曲のページを見る"]').first();
  await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'region');
  await page.keyboard.press('Tab');
  assert.ok(await firstSongLink.evaluate(link => link === document.activeElement), '次のページの先頭曲にTabで進めません');
  const secondPageTitle = (await firstSongLink.getAttribute('aria-label')).replace(/：曲のページを見る$/, '');
  await firstSongLink.click();
  await page.getByRole('heading', { name: secondPageTitle, exact: true }).waitFor();
  await page.getByRole('link', { name: '楽曲ガイドに戻る', exact: true }).first().click();
  await page.getByText(/全 90 曲中 25〜48 曲目/).waitFor();

  await page.getByLabel('曲名・読み・タイアップで検索').fill('Pretender');
  const pretender = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Pretender', exact: true }) });
  assert.match(await pretender.innerText(), /配信日\s*2019\.04\.17/);
  assert.doesNotMatch(await pretender.innerText(), /収録音源|掲載音源|配信掲載|BPM|リズムの刻みが印象に残るバラード/);
  assert.equal(await pretender.getByRole('button', { name: 'Pretenderをセトリに追加' }).isDisabled(), false);

  await page.goto(`${root}discography/`, { waitUntil: 'load' });
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://katakatalab.com/higedanfan/discography/');
  await page.getByRole('button', { name: 'メニューを開く', exact: true }).click();
  await page.getByRole('navigation', { name: 'サイト内メニュー' }).getByRole('link', { name: /^今日の1曲診断/ }).click();
  await page.getByRole('heading', { name: '今日の1曲診断', exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/higedanfan/mood/');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://katakatalab.com/higedanfan/mood/');
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: '楽曲ガイド（掲載90曲）', exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, '/higedanfan/discography/');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://katakatalab.com/higedanfan/discography/');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${root}#quiz`, { waitUntil: 'load' });
  await page.locator('#section-quiz').waitFor();
  assert.equal(await page.getByRole('navigation', { name: 'コーナー切り替えナビゲーション' }).count(), 0);
  assert.equal(await page.getByRole('group', { name: /の切り替え/ }).count(), 0);
  await page.getByRole('button', { name: 'メニューを開く', exact: true }).click();
  const menu = page.getByRole('navigation', { name: 'サイト内メニュー' });
  assert.equal(await menu.getByRole('link').count(), 13, 'メニューに公開コンテンツが揃っていません');
  assert.equal(await menu.getByRole('button').count(), 1);
  await menu.getByRole('link', { name: /^掲載90曲の音域・発売日一覧/ }).click();
  await page.getByRole('heading', { name: /音域・発売日一覧/ }).waitFor();
  assert.equal(await table.isVisible(), true, 'スマホでも比較表を使える必要があります');
  assert.equal(await page.getByLabel('収録アルバム・EPで絞り込み').isVisible(), false, '条件欄は最初は閉じます');
  assert.equal(await page.getByRole('heading', { name: '自分の声の範囲で探す' }).count(), 0);
  await page.getByText('↔ 表は横にスクロールできます。', { exact: false }).waitFor();
  assert.ok(await page.getByRole('region', { name: '音域・発売日比較表' }).evaluate(el => el.scrollWidth > el.clientWidth), 'スマホの表が横スクロールになっていません');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'スマホのページ全体が横にはみ出しています');
  await page.getByRole('button', { name: '地声最高を昇順で並べ替え', exact: true }).click();
  assert.equal(await table.getByRole('columnheader', { name: /地声最高/ }).getAttribute('aria-sort'), 'ascending');
  await page.getByRole('button', { name: '地声最高を降順で並べ替え', exact: true }).click();
  assert.match(await table.locator('tbody tr').first().innerText(), /hiE \(E5\)/);
  const firstTitle = await table.locator('tbody th a').first().innerText();
  await table.locator('tbody th a').first().click();
  await page.getByRole('heading', { name: firstTitle, exact: true }).waitFor();
  await page.locator('.song-site-menu > summary').click();
  assert.equal(await page.getByRole('navigation', { name: 'サイト内メニュー' }).getByRole('link').count(), 13);
  await page.locator('.song-site-menu > summary').press('Escape');
  await page.getByRole('link', { name: '音域一覧に戻る', exact: true }).first().click();
  await table.waitFor();
  assert.equal(await table.getByRole('columnheader', { name: /地声最高/ }).getAttribute('aria-sort'), 'descending');
  await page.getByRole('link', { name: /^115万キロの\s*ファンノート/ }).click();
  await page.getByRole('link', { name: '今日の1曲診断をひらく' }).waitFor();

  await page.goto(`${root}#discography`, { waitUntil: 'load' });
  const titleSearch = page.getByLabel('曲名・読み・タイアップで検索');
  for (const song of catalogEntries) {
    const reading = songReadings[song.id];
    const katakana = reading.replace(/[ぁ-ゖ]/g, kana => String.fromCharCode(kana.charCodeAt(0) + 0x60));
    for (const query of [reading, katakana, songLatinReadings[song.id], ...(songTitleAliases[song.id] ?? [])]) {
      await titleSearch.fill(query);
      await page.getByRole('heading', { name: song.title, exact: true }).waitFor();
    }
  }

  await page.goto(`${root}#setlist`, { waitUntil: 'load' });
  await openSetlistEditor(page, 'search', 'main');
  const search = page.getByLabel('曲を探して追加');
  await search.fill('ぷりてんだー');
  await page.getByRole('button', { name: 'Pretenderを本編に追加' }).click();
  await page.getByRole('link', { name: 'Pretender', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Pretenderは追加済み' }).isDisabled(), true);
  await openSetlistEditor(page, 'search', 'encore');
  await search.fill('さぶたいとる');
  await page.getByRole('button', { name: 'Subtitleをアンコールに追加' }).click();
  await page.getByRole('link', { name: 'Subtitle', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Subtitleを1つ上へ移動' }).click();
  await page.waitForFunction(() => {
    const value = localStorage.getItem('higedan_fan_magazine_state_v1');
    return value && JSON.parse(value).setlist.some(item => item.songId === 'subtitle' && !item.isEncore);
  });
  await page.getByRole('button', { name: 'Subtitleを1つ下へ移動' }).click();
  await page.waitForFunction(() => {
    const value = localStorage.getItem('higedan_fan_magazine_state_v1');
    return value && JSON.parse(value).setlist.some(item => item.songId === 'subtitle' && item.isEncore);
  });
  await openSetlistEditor(page, 'search', 'main');
  await search.fill('cry baby');
  await page.getByRole('button', { name: 'Cry Babyを本編に追加' }).click();
  await page.getByRole('link', { name: 'Cry Baby', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Pretenderを1つ下へ移動' }).click();
  await page.waitForFunction(() => {
    const value = localStorage.getItem('higedan_fan_magazine_state_v1');
    if (!value) return false;
    const items = JSON.parse(value).setlist;
    return items?.length === 3 && items[0].songId === 'cry-baby' && items[1].songId === 'pretender' && items[2].songId === 'subtitle' && items[2].isEncore;
  });
  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: 'Subtitle', exact: true }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'スマホのセトリ画面が横にはみ出しています');
  await page.setViewportSize({ width: 320, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320pxのセトリ画面が横にはみ出しています');
  await openSetlistEditor(page);
  await search.fill('いぬかきゃっとかでしぬまでけんかしよう');
  await page.getByRole('button', { name: '犬かキャットかで死ぬまで喧嘩しよう！を本編に追加' }).click();
  const longTitle = page.getByRole('link', { name: '犬かキャットかで死ぬまで喧嘩しよう！', exact: true });
  await longTitle.waitFor();
  const titleBox = await longTitle.evaluate(el => {
    const bounds = el.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height, line: parseFloat(getComputedStyle(el).lineHeight) };
  });
  assert.ok(titleBox.width >= 160 && titleBox.height <= titleBox.line * 2 + 1, '320pxの長い曲名が縦に潰れています');
  await page.goto(`${root}#vocal_range`, { waitUntil: 'load' });
  await page.getByRole('heading', { name: /音域・発売日一覧/ }).waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320pxの音域一覧が横にはみ出しています');
  await context.close();
  console.log('全90曲の3表記検索・見出しソート・メニュー・320pxの曲名と曲順・保存を確認');
}

async function verifySetlistHierarchy(browser) {
  const context = await browser.newContext({ viewport: { width: 320, height: 844 } });
  await context.addInitScript(() => {
    const ids = ['mixed-nuts', 'inu-ka-cat-ka', '115man-kilo', 'subtitle', 'sharon', 'soulsoup', 'pretender', 'stand-by-you'];
    localStorage.setItem('higedan_fan_magazine_state_v1', JSON.stringify({
      setlistTitle: '曲順の表示確認', setlist: ids.map((songId, index) => ({ songId, isEncore: index >= 6 })),
    }));
  });
  const page = await context.newPage();
  await page.goto(`${root}#setlist`, { waitUntil: 'load' });
  const list = page.getByRole('list', { name: 'マイセットリストの曲順', exact: true });
  await list.locator('li[data-song-id]').first().waitFor();
  assert.equal(await list.locator('li[data-song-id]').count(), 8);
  assert.equal(await page.getByLabel('マイセットリストのタイトル').isVisible(), false);
  assert.equal(await page.getByLabel('曲を探して追加').isVisible(), false);
  assert.equal(await page.getByText('操作', { exact: true }).count(), 0);
  assert.equal(await list.getByRole('button', { name: /その他の操作/ }).count(), 0);

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const layout = await list.evaluate(el => {
      const rows = [...el.querySelectorAll('li[data-song-id]')];
      return {
        viewport: innerWidth, pageWidth: document.documentElement.scrollWidth,
        firstTop: rows[0].getBoundingClientRect().top,
        lastBottom: rows.at(-1).getBoundingClientRect().bottom,
        rows: rows.map(row => {
          const card = row.querySelector('.setlist-track-card').getBoundingClientRect();
          const moves = row.querySelector('.setlist-move-controls').getBoundingClientRect();
          const title = row.querySelector('.setlist-track-title');
          const box = title.getBoundingClientRect();
          const font = getComputedStyle(title);
          const icon = row.querySelector('.setlist-move-controls svg').getBoundingClientRect();
          const hit = row.querySelector('.setlist-move-controls button').getBoundingClientRect();
          return { title: title.textContent, font: parseFloat(font.fontSize), line: parseFloat(font.lineHeight),
            titleHeight: box.height, cardRight: card.right, movesLeft: moves.left, icon: icon.width, hitWidth: hit.width, hitHeight: hit.height };
        }),
      };
    });
    assert.ok(layout.pageWidth <= layout.viewport, `${width}pxでページが横にはみ出します`);
    assert.ok(layout.firstTop < 350 && layout.lastBottom <= 844, `${width}pxで8曲の流れを最初の画面で見渡せません`);
    for (const row of layout.rows) {
      assert.ok(row.font >= 18 && row.font > row.icon, `${width}px ${row.title}: 曲名が矢印より目立ちません`);
      assert.ok(row.titleHeight <= row.line * 2 + 1, `${width}px ${row.title}: 曲名が縦に潰れています`);
      assert.ok(row.cardRight + 4 <= row.movesLeft, `${width}px ${row.title}: 矢印が曲の枠に干渉します`);
      assert.ok(row.hitWidth >= 24 && row.hitHeight >= 24, `${width}px ${row.title}: 移動ボタンを押せる範囲が小さすぎます`);
    }
  }
  await context.close();
  console.log('320/390px・PCで8曲を先に表示し、大きな曲名と枠外の小さな移動欄を確認');
}

async function verifyTourArchiveSetlists(browser) {
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.setItem('higedan_intro_seen_v2', '1'));
  const page = await context.newPage();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${root}#tour_archive`, { waitUntil: 'load' });
    await page.getByLabel('日付・会場を探す').fill('2025-05-31');
    const toggle = page.getByRole('button', { name: /セットリストを見る（22曲）/ }).first();
    await toggle.click();
    const drawer = page.locator('#setlist-panel-live-2025-stadium-kanagawa-1');
    await drawer.waitFor();
    assert.match(await drawer.innerText(), /Same Blue[\s\S]*ENCORE[\s\S]*Stand By You/);
    assert.equal(await page.locator('a[href*="liverepo.katakatalab.com"]').count(), 0, 'LiveRepoへの外部リンクが残っています');
    const widthCheck = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    assert.ok(widthCheck, `${width}pxで歴代ツアー記録が横にはみ出しています`);
    if (width !== 1280) {
      await page.getByRole('button', { name: 'セトリを閉じる' }).first().click();
      await page.getByLabel('日付・会場を探す').fill('');
    }
  }
  await page.locator('#setlist-panel-live-2025-stadium-kanagawa-1').getByRole('link', { name: 'Stand By You' }).click();
  await page.getByRole('heading', { name: 'Stand By You', exact: true }).waitFor();
  await page.getByRole('link', { name: '歴代ツアー記録に戻る', exact: true }).first().click();
  await page.locator('#setlist-panel-live-2025-stadium-kanagawa-1').waitFor();
  assert.equal(await page.getByLabel('日付・会場を探す').inputValue(), '2025-05-31');

  // 曲名でのツアー検索、参戦フィルター、公演セトリからMYセトリ作成、静的コーナーURLを確認。
  await page.getByLabel('日付・会場を探す').fill('えるだーふらわー');
  await page.getByText(/この公演で演奏：エルダーフラワー/).first().waitFor();
  await page.getByRole('button', { name: '検索キーワードをクリア' }).click();
  await page.getByRole('button', { name: '参戦・視聴を記録する' }).first().click();
  await page.getByRole('button', { name: /参戦・視聴済みのみ（1）/ }).click();
  assert.equal(await page.locator('article').count(), 1);
  await page.getByRole('button', { name: /参戦・視聴済みのみ（1）/ }).click();
  await page.locator('#tour-year-filter').selectOption('2024');
  assert.ok(await page.locator('#section-setlist article').count() > 0 && await page.locator('#section-setlist article').count() < 10, '歴代ツアーの年度絞り込みが効いていません');
  await page.getByRole('button', { name: '条件をリセット', exact: true }).click();

  await page.goto(`${root}tour-archive/`, { waitUntil: 'load' });
  await page.getByRole('heading', { name: '歴代ツアー・公演記録', exact: true }).waitFor();
  await page.getByLabel('日付・会場を探す').fill('2025-05-31');
  await page.getByRole('button', { name: /セットリストを見る（22曲）/ }).first().click();
  await page.locator('#setlist-panel-live-2025-stadium-kanagawa-1').getByRole('button', { name: 'この公演の曲でMYセトリを作成' }).click();
  await page.getByRole('heading', { name: 'MYセトリ作成', exact: true }).waitFor();
  assert.ok(await page.locator('li[data-song-id="same-blue"]').count() === 1);

  await page.goto(`${root}tour-archive/`, { waitUntil: 'load' });
  await page.getByLabel('日付・会場を探す').fill('2025-05-31');
  await page.getByRole('button', { name: /セットリストを見る（22曲）/ }).first().click();
  await page.locator('#setlist-panel-live-2025-stadium-kanagawa-1').getByRole('button', { name: 'この公演の曲でMYセトリを作成' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'MYセトリに読み込む' }).click();
  await page.getByRole('heading', { name: 'MYセトリ作成', exact: true }).waitFor();

  await context.close();
  console.log('320/390px・PCで歴代ツアー記録の内蔵セトリ展開・曲名検索・参戦絞込・MYセトリ化・静的URL・楽曲解説との往復を確認');
}

async function verifyVisitorJourneys(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${root}discography/`);
  await page.getByLabel('曲名・読み・タイアップで検索').fill('スパイファミリー');
  assert.deepEqual((await page.locator('main article h2').allTextContents()).sort(), ['SOULSOUP', 'ミックスナッツ'].sort());

  await page.goto(`${root}sacred-map/`);
  const filters = page.getByRole('button', { name: /絞り込み条件/ });
  await filters.click();
  const visited = page.getByRole('button', { name: /^訪問済みのみ/ });
  await visited.click();
  await page.getByText('まだ訪問済みの場所がありません。').waitFor();
  await visited.click();
  const overseas = page.getByRole('button', { name: '海外', exact: true });
  await overseas.click();
  const place = page.getByRole('article').filter({ has: page.getByRole('heading', { name: '台北', exact: true }) });
  await place.getByRole('button', { name: '台北の訪問を記録' }).click();
  await place.getByRole('button', { name: '台北のエリアを地図で見る' }).click();
  await place.getByRole('link', { name: 'Pretender', exact: true }).click();
  await page.getByRole('link', { name: '聖地巡礼マップに戻る', exact: true }).first().click();
  assert.equal(await overseas.getAttribute('aria-pressed'), 'true');
  await place.getByText('地図に表示中', { exact: true }).waitFor();
  await page.waitForFunction(() => document.activeElement?.textContent === '台北');
  await visited.click();
  await page.getByRole('button', { name: '関東', exact: true }).click();
  await page.getByRole('button', { name: '訪問済みの場所をすべて見る' }).click();
  assert.equal(await visited.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('main article').count(), 1);
  await place.waitFor();

  await page.getByRole('link', { name: 'プライバシーポリシー', exact: true }).click();
  await page.getByRole('heading', { name: 'プライバシーポリシー', exact: true }).waitFor();
  await page.getByRole('link', { name: '本文へ移動' }).press('Enter');
  assert.equal(new URL(page.url()).hash, '#privacy');
  assert.ok(await page.getByRole('main').evaluate(main => main === document.activeElement));

  await page.goto(`${root}quiz/`);
  await page.getByRole('button').filter({ has: page.getByText('初級', { exact: true }) }).click();
  await page.getByRole('button', { name: /Vol\.1 .*挑戦する/ }).click();
  const questions = getCourseQuestions('beginner', 'vol1', 'current');
  for (const [index, question] of questions.slice(0, 2).entries()) {
    const chosen = index === 0 ? (question.correctIndex + 1) % question.options.length : question.correctIndex;
    await page.getByRole('button', { name: `${chosen + 1}. ${question.options[chosen]}`, exact: true }).press('Enter');
    const feedback = page.getByRole('heading', { level: 3 }).filter({ hasText: question.options[question.correctIndex] });
    await feedback.waitFor();
    assert.ok(await feedback.evaluate(heading => heading === document.activeElement));
    assert.match(await feedback.innerText(), index === 0 ? /おしい/ : /正解/);
    const box = await feedback.boundingBox();
    assert.ok(box.y >= 60 && box.y + box.height <= 844, '検定結果が見える位置にありません');
    await page.getByRole('button', { name: '次の問題へ進む' }).click();
  }
  await context.close();
  console.log('作品名の読み検索、地図への復帰と訪問記録、本文移動、検定の正誤表示を確認');
}

async function verifyReferenceLibrary(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${root}#quiz_archive`, { waitUntil: 'load' });
    const library = page.locator('#section-quiz');
    await library.getByRole('heading', { name: '参考記事・インタビュー', exact: true }).waitFor();
    const cards = library.locator('[data-reference-list] > article');
    assert.equal(await cards.count(), 24, '最初の24件が表示されません');
    assert.equal(await library.getByText(/正解：|^Q\./).count(), 0, '資料一覧にクイズの問題や正解が残っています');
    await library.getByLabel('媒体', { exact: true }).selectOption('rockinon.com');
    await library.getByLabel('記事名・媒体・曲名・年で検索').fill('Rejoice');
    assert.equal(await cards.count(), 1, '記事名と媒体で絞り込めません');
    await cards.getByRole('link', { name: /新作『Rejoice』のすべて/ }).waitFor();
    assert.equal(await cards.locator('time').getAttribute('datetime'), '2024-07-31');
    assert.equal(await cards.getByRole('link', { name: /新作『Rejoice』のすべて/ }).getAttribute('href'), 'https://rockinon.com/interview/detail/210118');
    const layout = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth, viewport: innerWidth,
      links: [...document.querySelectorAll('[data-reference-list] article > a')].map(link => {
        const box = link.getBoundingClientRect();
        return { left: box.left, right: box.right };
      }),
    }));
    assert.ok(layout.width <= layout.viewport, `${width}pxで資料一覧が横にはみ出します`);
    assert.ok(layout.links.every(link => link.left >= 0 && link.right <= layout.viewport), `${width}pxで記事リンクが画面外にはみ出します`);
    await library.getByLabel('媒体', { exact: true }).selectOption('all');
    await library.getByLabel('記事名・媒体・曲名・年で検索').fill('ぷりてんだー');
    await cards.getByRole('link', { name: /研究と向上心を欠かさない4人/ }).waitFor();
    await library.getByLabel('記事名・媒体・曲名・年で検索').fill('該当しない参考記事XYZ');
    await library.getByText('条件に一致する参考記事が見つかりませんでした。').waitFor();
    await library.getByRole('button', { name: '検索条件をリセット', exact: true }).click();
    assert.equal(await cards.count(), 24);
    await library.getByRole('button', { name: /さらに24件を見る/ }).click();
    assert.equal(await cards.count(), 48, '続きの記事を表示できません');
    await library.getByLabel('日付順', { exact: true }).selectOption('oldest');
    assert.equal(await cards.count(), 24, '並び替えで表示件数が戻りません');
    assert.equal(await cards.first().locator('time').getAttribute('datetime'), '2015-02-06');
  }
  await context.close();
  console.log('320/390px・PCで記事名・日付・掲載元リンク、媒体/曲名検索、追加表示と日付順を確認');
}

async function verifyKurunIntroAndStickyNotes(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  await page.goto(root, { waitUntil: 'load' });
  const intro = page.locator('#kurun-intro-overlay');
  await intro.waitFor({ state: 'visible' });
  assert.equal(await intro.locator('.kurun-doodle').count(), 4, 'オープニングの背景モチーフが4つ揃っていません');
  await page.locator('#kurun-skip-btn').click();
  await intro.waitFor({ state: 'detached', timeout: 500 });
  assert.equal(await page.evaluate(() => localStorage.getItem('higedan_intro_seen_v2')), '1', '閲覧済みフラグが保存されていません');

  await page.reload({ waitUntil: 'load' });
  await page.getByRole('link', { name: '今日の1曲診断をひらく' }).waitFor();
  assert.equal(await intro.count(), 0, '2回目以降のアクセスでオープニングが自動再生されました');

  await page.setViewportSize({ width: 1280, height: 752 });
  await page.getByRole('button', { name: 'メニューを開く', exact: true }).click();
  const drawer = page.locator('#global-nav-drawer');
  await drawer.waitFor({ state: 'visible' });
  assert.ok(
    await drawer.evaluate(el => el.scrollHeight <= el.clientHeight),
    '1280x752でグローバルメニュー内に縦スクロールが発生しています',
  );
  await page.locator('#kurun-replay-btn').click();
  await intro.waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await intro.waitFor({ state: 'detached', timeout: 500 });

  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    const stickyCount = await page.locator('.fusen-card').count();
    assert.equal(stickyCount, 6, `${width}pxで付箋カードが6枚揃っていません`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}pxでトップページが横にはみ出しています`);
  }

  await page.getByRole('link', { name: '聖地巡礼マップをひらく' }).click();
  await page.getByRole('heading', { name: '聖地巡礼マップ', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: /絞り込み条件/ }).getAttribute('aria-expanded'), 'false', '聖地マップの絞り込みは初期折り畳みが必要です');
  assert.ok(await page.locator('.fusen-memo-card').count() >= 5, '聖地巡礼マップのメモカードが表示されていません');
  const shinjiCard = page.locator('.fusen-memo-card').filter({ hasText: '宍道湖夕日スポット（とるぱ）' });
  await shinjiCard.getByRole('link', { name: '115万キロのフィルム' }).waitFor();
  await page.locator('article.fusen-memo-card').filter({ hasText: '日産スタジアム' }).getByRole('button', { name: /日産スタジアムを地図で見る/ }).click();
  await page.locator('article.fusen-memo-card').first().getByRole('heading', { name: '日産スタジアム', exact: true }).waitFor();
  await page.locator('article.fusen-memo-card').first().getByText('地図に表示中').waitFor();
  await page.locator('article.fusen-memo-card').first().getByRole('button', { name: '並び順を戻す' }).click();
  await page.locator('article.fusen-memo-card').first().getByRole('heading', { name: '宍道湖夕日スポット（とるぱ）', exact: true }).waitFor();
  await page.getByRole('link', { name: /^115万キロの\s*ファンノート/ }).click();
  await page.getByRole('link', { name: '楽曲ガイドをひらく' }).click();
  await page.getByRole('heading', { name: '楽曲ガイド（掲載90曲）', exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: '付箋一覧へ戻る' }).count(), 0, '付箋一覧へ戻るボタンが残っています');
  assert.equal(await page.locator('.fusen-washi-tag').count(), 0, '見出し上のマステタグが残っています');
  const firstSongBox = await page.locator('#section-discography').getByText('Pretender').first().boundingBox();
  assert.ok(firstSongBox && firstSongBox.y < 844, '楽曲ガイドの1曲目（Pretender）がファーストビューに入っていません');
  await page.getByRole('link', { name: '音域・発売日比較表' }).click();
  await page.getByRole('table', { name: /音域・発売日比較表/ }).waitFor();
  await page.getByRole('link', { name: /^115万キロの\s*ファンノート/ }).click();
  await page.getByRole('link', { name: 'Official髭男dism検定をひらく' }).click();
  await page.getByRole('heading', { name: 'Official髭男dism検定', exact: true }).waitFor();
  assert.equal(await page.locator('#section-quiz a[href="#quiz_archive"]').count(), 0, '検定見出しに参考記事ボタンが残っています');

  await page.setViewportSize({ width: 1280, height: 752 });
  await page.goto(`${root}songs/pretender/`, { waitUntil: 'load' });
  await page.locator('.song-site-menu > summary').click();
  const songMenu = page.locator('.song-menu-panel');
  await songMenu.waitFor({ state: 'visible' });
  assert.ok(
    await songMenu.evaluate(el => el.scrollHeight <= el.clientHeight),
    '1280x752で曲ページのメニュー内に縦スクロールが発生しています',
  );

  await page.goto(`${root}?intro=1`, { waitUntil: 'load' });
  await intro.waitFor({ state: 'visible' });
  assert.deepEqual(pageErrors, [], `ページ実行時エラー: ${pageErrors.join('; ')}`);
  await context.close();
  console.log('ひげくるん初回オープニング・再訪スキップ・再再生・6枚付箋ノートと横幅を確認');
}

async function verifyMyNoteModal(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => {
    window.localStorage.setItem('higedan_intro_seen_v2', '1');
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto(root, { waitUntil: 'load' });
  const myNoteBtn = page.getByRole('button', { name: 'マイノート', exact: true });
  const menuBtn = page.getByRole('button', { name: 'メニューを開く', exact: true });
  const myNoteBox = await myNoteBtn.boundingBox();
  const menuBox = await menuBtn.boundingBox();
  assert.ok(myNoteBox && menuBox && myNoteBox.x + myNoteBox.width <= menuBox.x + 2, 'マイノートボタンがメニューの左側に配置されていません');

  await myNoteBtn.click();
  const dialog = page.locator('dialog.my-note-dialog');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(new URL(page.url()).pathname, '/higedanfan/', 'マイノートはページ遷移せずモーダルで開く必要があります');
  await dialog.getByText('はじめの一歩').waitFor();
  await dialog.getByText('ランク', { exact: true }).waitFor();
  assert.equal(await dialog.getByText('ファンノート・ランク', { exact: true }).count(), 0, 'ランク表示名が旧表記のままです');
  assert.equal(await dialog.locator('.mn-gold-count').count(), 0, '右上の32分金バッジは削除されている必要があります');
  await dialog.getByText('1 / 115').waitFor();
  await dialog.getByText('1 / 6 ページ（全115個）').waitFor();
  assert.equal(await dialog.locator('.mn-stamp').count(), 20, '1ページあたり20個のスタンプ表示が必要です');
  const desktopCols = await dialog.locator('.mn-stamp-grid').evaluate(
    el => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
  );
  assert.equal(desktopCols, 5, `デスクトップ幅でスタンプは5列表示が必要です（実際: ${desktopCols}列）`);
  await dialog.getByRole('button', { name: '次のスタンプページ', exact: true }).click();
  await dialog.getByText('2 / 6 ページ（全115個）').waitFor();
  await dialog.getByText('021', { exact: true }).waitFor();

  await dialog.getByRole('button', { name: '特別称号', exact: true }).click();
  await dialog.getByText('1 / 2 ページ（全32個）').waitFor();
  await dialog.getByRole('button', { name: '次のスタンプページ', exact: true }).click();
  await dialog.getByText('2 / 2 ページ（全32個）').waitFor();
  await dialog.getByRole('button', { name: /^No\.074 特別称号（未獲得）/ }).click();
  await dialog.locator('.mn-hint-serial').filter({ hasText: /^No\.074 \/ 115$/ }).waitFor();
  await dialog.locator('.mn-stamp-tier-pill', { hasText: '特別称号' }).waitFor();
  assert.equal(await dialog.locator('.mn-hint-title').innerText(), '未獲得');
  assert.equal(await dialog.locator('.mn-stamp-progress-pill').innerText(), '未達成');
  assert.equal(await dialog.locator('.mn-hint-desc').innerText(), '??????（MYセトリ作成）');
  const hintText = await dialog.locator('.mn-stamp-hint').innerText();
  assert.ok(!hintText.includes('髭男と同じ感性') && !hintText.includes('完全一致'), '未獲得の特別称号に条件や名称が露出しています');

  await dialog.getByRole('button', { name: 'すべて', exact: true }).click();
  await dialog.getByText('1 / 6 ページ（全115個）').waitFor();

  await dialog.getByRole('button', { name: 'お名前を変更', exact: true }).click();
  await dialog.getByLabel('お名前を入力', { exact: true }).fill('テスト太郎');
  await dialog.getByRole('button', { name: 'お名前を保存', exact: true }).click();
  await dialog.getByText('テスト太郎', { exact: true }).waitFor();
  await dialog.getByText('音と言葉のルーキー').waitFor();
  await dialog.getByText('2 / 115').waitFor();

  await Promise.all([
    page.waitForEvent('download'),
    dialog.getByRole('button', { name: 'ファイルに保存', exact: true }).click(),
  ]);
  await dialog.getByText('3 / 115').waitFor();

  await dialog.getByRole('button', { name: '獲得済み', exact: true }).click();
  await dialog.getByText('1 / 1 ページ（全3個）').waitFor();
  await dialog.getByRole('button', { name: 'すべて', exact: true }).click();

  await dialog.getByRole('tab', { name: /聖地進捗/ }).click();
  await dialog.getByRole('heading', { name: /聖地巡礼 エリア別進捗/ }).waitFor();
  await dialog.getByRole('tab', { name: /MYセトリ/ }).click();
  await dialog.getByRole('heading', { name: /保存済みMYセトリ/ }).waitFor();
  await dialog.getByRole('tab', { name: /検定記録/ }).click();
  await dialog.getByRole('heading', { name: 'Official髭男dism検定の記録', exact: true }).waitFor();
  await dialog.getByRole('button', { name: 'とじる', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });

  await page.setViewportSize({ width: 320, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320pxでトップヘッダー（マイノート＋メニュー）が横にはみ出しています');

  await page.goto(`${root}songs/pretender/`, { waitUntil: 'load' });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320pxで楽曲ページヘッダー（マイノート＋メニュー）が横にはみ出しています');
  const songMyNoteBtn = page.getByRole('button', { name: 'マイノート', exact: true });
  await songMyNoteBtn.click();
  await dialog.waitFor({ state: 'visible' });
  assert.equal(new URL(page.url()).pathname, '/higedanfan/songs/pretender/', '楽曲ページ上でもマイノートはURLを変えずモーダルで開く必要があります');
  await dialog.getByText('テスト太郎', { exact: true }).waitFor();
  await dialog.getByText('4 / 115').waitFor();
  const mobileCols = await dialog.locator('.mn-stamp-grid').evaluate(
    el => getComputedStyle(el).gridTemplateColumns.trim().split(/\s+/).length,
  );
  assert.equal(mobileCols, 4, `320px幅では4列×5行表示が必要です（実際: ${mobileCols}列）`);
  assert.equal(await dialog.locator('.mn-stamp').count(), 20, '320px幅でも1ページあたり20個表示が必要です');
  assert.ok(
    await dialog.locator('.mn-body').evaluate(el => el.scrollWidth <= el.clientWidth + 1),
    '320px幅でマイノート内に横はみ出しが発生しています',
  );
  await dialog.getByRole('button', { name: 'マイノートを閉じる', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${root}#setlist`, { waitUntil: 'load' });
  await openSetlistEditor(page, 'search', 'main');
  await page.getByLabel('曲を探して追加').fill('pretender');
  await page.getByRole('button', { name: 'Pretenderを本編に追加' }).click();
  await page.getByRole('link', { name: 'Pretender', exact: true }).waitFor();

  await page.getByRole('button', { name: '新しいセトリ', exact: true }).click();
  await page.getByLabel('タイトル編集を完了', { exact: true }).click();
  await openSetlistEditor(page, 'search', 'main');
  await page.getByLabel('曲を探して追加').fill('subtitle');
  await page.getByRole('button', { name: 'Subtitleを本編に追加' }).click();
  await page.getByRole('link', { name: 'Subtitle', exact: true }).waitFor();

  await myNoteBtn.click();
  await dialog.waitFor({ state: 'visible' });
  await dialog.getByRole('tab', { name: /MYセトリ/ }).click();
  await dialog.getByRole('button', { name: 'このセトリに切替', exact: true }).click();
  await dialog.getByText(/切り替えました/).waitFor();
  await dialog.getByRole('button', { name: 'とじる', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });

  await page.getByRole('link', { name: 'Pretender', exact: true }).waitFor();
  const savedSetlistRows = await page.locator('#section-setlist ul[aria-label="保存したMYセトリ一覧"] > li').allInnerTexts();
  assert.equal(savedSetlistRows.length, 2, 'マイノートからのセトリ切替で既存セトリ数が失われています');
  assert.ok(savedSetlistRows.some(row => row.includes('MYセトリ 2') && row.includes('1曲')), 'マイノートからのセトリ切替で元のセトリ内容が上書きされています');

  assert.deepEqual(pageErrors, [], `マイノート検証中のエラー: ${pageErrors.join('; ')}`);
  await context.close();
  console.log('マイノート（けんきゅう手帳風モーダル・ニックネーム・スタンプ・ランク・320px・楽曲ページ）を確認');
}

function resolveChromiumExecutable() {
  const explicit = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?.trim();
  if (explicit) return explicit;
  try {
    const bundled = chromium.executablePath();
    if (bundled && existsSync(bundled)) return undefined;
  } catch {
    // Playwrightの標準ブラウザが未導入のローカル環境だけ既存ブラウザを探す。
  }
  const candidates = process.platform === 'win32'
    ? [
        path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
        process.env['LOCALAPPDATA'] ? path.join(process.env['LOCALAPPDATA'], 'Google\\Chrome\\Application\\chrome.exe') : '',
        path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Microsoft\\Edge\\Application\\msedge.exe'),
        path.join(process.env['PROGRAMFILES'] || 'C:\\Program Files', 'Microsoft\\Edge\\Application\\msedge.exe'),
      ]
    : process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      ]
    : [
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
      ];
  return candidates.find(candidate => candidate && existsSync(candidate));
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true, executablePath: resolveChromiumExecutable() });
  await verifyStaticSeo(browser, root, ids);
  await verifyInputAndScriptBoundaries(browser, root);
  await verifyRecordFileImport(browser, root);
  await verifyKurunIntroAndStickyNotes(browser);
  await verifyGuideAndSetlistUsability(browser);
  await verifyVisitorJourneys(browser);
  await verifySetlistHierarchy(browser);
  await verifyReferenceLibrary(browser);
  await verifyTourArchiveSetlists(browser);
  await verifyMyNoteModal(browser);
  await verifyPwaReadinessAndInstall(browser, root);
  if (!process.argv.includes('--ux-only')) {
    await verifyImmediateReload(browser);
    await verifyStorageFailures(browser);
    await inspectAllPages(browser, { name: 'PC 1280×720', context: { viewport: { width: 1280, height: 720 } } });
    await inspectAllPages(browser, { name: 'PC 615×604', context: { viewport: { width: 615, height: 604 }, deviceScaleFactor: 1.5 } });
    await inspectAllPages(browser, { name: 'スマホ 320px', mobile: true, context: { viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true } });
    await inspectAllPages(browser, { name: 'スマホ 390px', mobile: true, context: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } });
    await inspectAllPages(browser, { name: 'PC 大きな文字 521px', readable: true, context: { viewport: { width: 521, height: 844 } } });
    await verifyInteractions(browser);
  }
} finally {
  await browser?.close();
  server.kill();
}
