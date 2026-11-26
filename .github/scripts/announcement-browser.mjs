import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { songAnnouncements } from '../../src/data/songAnnouncements.ts';

export async function verifyAnnouncements(browser, root) {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  for (const song of songAnnouncements) {
    assert.equal(existsSync(path.join('dist', 'songs', song.id)), false, song.id);
    assert.ok(!sitemap.includes('/songs/' + song.id + '/'), song.id);
  }
  for (const [width, javaScriptEnabled] of [[320, true], [1280, true], [390, false]]) {
    const context = await browser.newContext({
      viewport: { width, height: 844 }, javaScriptEnabled, hasTouch: width === 320, reducedMotion: 'reduce',
    });
    try {
      await context.addInitScript(() => localStorage.setItem('higedan_intro_seen_v2', '1'));
      await context.route('**/*', route => route.request().url().startsWith(root) ? route.continue() : route.abort());
      const page = await context.newPage();
      for (const guide of ['discography/', 'vocal-range/']) {
        const url = root + guide;
        assert.equal((await page.goto(url)).status(), 200);
        const search = page.getByLabel('曲名・読み・タイアップで検索');
        if (javaScriptEnabled) await search.fill('');
        const list = page.getByRole('list', { name: '配信予定の楽曲' });
        assert.equal(await list.getByRole('listitem').count(), songAnnouncements.length);
        for (const song of songAnnouncements) {
          const title = list.getByText(song.title, { exact: true });
          const row = list.getByRole('listitem').filter({ has: page.getByText(song.title, { exact: true }) });
          if (javaScriptEnabled) await search.fill(song.aliases[0] || song.title);
          await title.waitFor();
          const text = await row.innerText();
          for (const fact of song.facts) assert.ok(text.includes(fact), fact);
          assert.equal(await row.locator('a, button, [onclick], [tabindex], [role="button"], [role="link"]').count(), 0);
          assert.ok(await row.evaluate(el => {
            const box = el.getBoundingClientRect();
            return box.left >= 0 && box.right <= document.documentElement.clientWidth;
          }));
          if (javaScriptEnabled) {
            if (width === 320) await title.tap();
            else await title.click();
            assert.equal(page.url(), url);
          }
        }
        if (javaScriptEnabled) await search.fill('Pretender');
        const existing = page.locator('main a[href$="/songs/pretender/"]').first();
        await existing.click();
        await page.waitForURL(root + 'songs/pretender/');
      }
    } finally {
      await context.close();
    }
  }
}
