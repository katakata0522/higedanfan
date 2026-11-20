import assert from 'node:assert/strict';

export async function verifyGuideAndDiagnosis(browser, root) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  try {
    const page = await context.newPage();
    await page.goto(root + 'discography/');
    const search = page.getByLabel('曲名・読み・タイアップで検索');
    const card = title => page.locator('main article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    for (const width of [320, 375, 390, 430]) {
      await page.setViewportSize({ width, height: 844 });
      for (const [title, bpm] of [['Pretender', '約92 BPM'], ['Subtitle', '約65 BPM']]) {
        await search.fill(title);
        const current = card(title);
        const values = current.locator('dl > div');
        await values.last().waitFor();
        assert.deepEqual(await values.locator('dt').allTextContents(), ['地声最低', '地声最高', '裏声最高', 'テンポ']);
        assert.equal(await values.last().locator('dd').innerText(), bpm);
        if (title === 'Subtitle') assert.equal(await values.nth(2).locator('dd').innerText(), '—');
        const cells = await values.evaluateAll(items => items.map(item => {
          const { x, y } = item.getBoundingClientRect();
          return { x, y };
        }));
        assert.equal(cells[0].y, cells[1].y);
        assert.equal(cells[2].y, cells[3].y);
        assert.equal(cells[0].x, cells[2].x);
        assert.equal(cells[1].x, cells[3].x);
        assert.ok(cells[2].y > cells[0].y);
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await search.fill('Pretender');
    const songLink = card('Pretender').getByRole('link', { name: 'Pretender：曲のページを見る' });
    // The placeholder remains a tap target if an external jacket image is unavailable.
    await songLink.locator(':scope > :first-child').click();
    await page.getByRole('heading', { name: 'Pretender', exact: true }).waitFor();
    await page.getByRole('link', { name: '楽曲ガイドに戻る', exact: true }).first().click();
    assert.equal(await search.inputValue(), 'Pretender');
    await card('Pretender').getByRole('heading', { name: 'Pretender' }).click();
    await page.waitForURL('**/songs/pretender/');

    await page.goto(root + 'vocal-range/');
    await page.getByRole('button', { name: /条件を絞る・並べ替える/ }).click();
    const albums = page.getByLabel('収録アルバム・EPで絞り込み');
    assert.equal(await albums.locator('option[value="ラブとピースは君の中"]').innerText(), 'ラブとピースは君の中');
    await albums.selectOption('エスカパレード');
    await search.fill('115万キロのフィルム');
    await page.getByRole('button', { name: 'タイアップ', exact: true }).click();
    const list = page.getByRole('list', { name: '楽曲別のタイアップ' });
    await list.waitFor();
    const works = list.getByRole('link', { name: /の出典$/ });
    assert.equal(await works.count(), 3);
    assert.match(await list.innerText(), /思い、思われ、ふり、ふられ/);
    assert.match(await list.innerText(), /ローム/);
    assert.match(await list.innerText(), /SUUMO/);
    assert.ok(await list.evaluate(el => el.scrollWidth <= el.clientWidth && el.getBoundingClientRect().right <= innerWidth));
    await list.getByRole('link', { name: '115万キロのフィルム', exact: true }).click();
    await page.getByRole('link', { name: '音域一覧に戻る', exact: true }).first().click();
    await list.waitFor();
    assert.equal(await search.inputValue(), '115万キロのフィルム');
    assert.equal(await albums.inputValue(), 'エスカパレード');
    await page.getByRole('button', { name: '音域・テンポ', exact: true }).click();
    const table = page.getByRole('table', { name: /音域・発売日比較表/ });
    await table.waitFor();
    await page.setViewportSize({ width: 1280, height: 800 });
    assert.deepEqual((await table.getByRole('columnheader').allInnerTexts()).slice(-2), ['音域の参照元', 'タイアップ']);
    assert.equal(await table.locator('tbody tr').first().locator('td').last().getByRole('link').count(), 3);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(root);
    const heading = page.locator('#members-heading');
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await heading.waitFor();
      await page.evaluate(() => document.fonts.ready.then(() => true));
      const { root: documentNode } = await cdp.send('DOM.getDocument');
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: documentNode.nodeId, selector: '#members-heading' });
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
      assert.ok(fonts.length > 0 && fonts.every(font => font.isCustomFont && font.postScriptName === 'KiwiMaru-Medium'));
      assert.equal(await heading.evaluate(el => getComputedStyle(el).fontSize), '20px');
    }
    await cdp.detach();
    await page.setViewportSize({ width: 390, height: 844 });
    const enter = page.getByRole('link', { name: '今日の1曲診断をひらく' });
    const home = page.getByRole('link', { name: /^115万キロの\s*ファンノート/ });
    const mood = page.locator('#section-mood');
    const answer = mood.locator('button[aria-pressed]').first();
    const detail = mood.getByRole('link', { name: '詳しい解説を読む' });
    await enter.click();
    await answer.click();
    await home.click();
    await enter.click();
    for (let step = 2; step <= 5; step++) {
      await mood.getByText('質問 ' + step + ' / 5', { exact: true }).waitFor();
      await answer.click();
    }
    await detail.waitFor();
    assert.equal(await mood.getByText(/シェアカード/).count(), 0);
    await mood.getByText('条件を変えて探す', { exact: true }).click();
    await mood.getByRole('button', { name: /^長さ「/ }).click();
    await answer.click();
    const count = await page.evaluate(() => JSON.parse(localStorage.getItem('higedanfan:my-note-profile:v1')).moodCompletedCount);
    assert.equal(count, 1);
    await mood.getByRole('button', { name: 'ほかの曲も見てみる' }).click();
    const url = await detail.getAttribute('href');
    await detail.click();
    await page.getByRole('link', { name: '今日の1曲診断に戻る', exact: true }).first().click();
    assert.equal(await detail.getAttribute('href'), url);
    await page.reload();
    assert.equal(await detail.getAttribute('href'), url);
    await home.click();
    await enter.click();
    await mood.getByText('質問 1 / 5', { exact: true }).waitFor();
    assert.equal(await mood.getByRole('link', { name: '詳しい解説を読む' }).count(), 0);
    await page.goBack();
    await page.goBack();
    assert.equal(await detail.getAttribute('href'), url);
    await detail.click();
    await page.getByRole('link', { name: '今日の1曲診断に戻る', exact: true }).first().click();
    assert.equal(await detail.getAttribute('href'), url);
    await home.click();
    await enter.click();
    await mood.getByRole('button', { name: '前回の1曲を見る' }).click();
    assert.equal(await detail.getAttribute('href'), url);
    await page.getByRole('button', { name: 'メニューを開く' }).click();
    await page.getByRole('navigation', { name: 'サイト内メニュー' }).getByRole('link', { name: /^今日の1曲診断/ }).click();
    await mood.getByText('質問 1 / 5', { exact: true }).waitFor();
    await page.goBack();
    assert.equal(await detail.getAttribute('href'), url);
    await home.click();
    const enterQuiz = page.getByRole('link', { name: /検定をひらく$/ });
    await enterQuiz.click();
    const quiz = page.locator('#section-quiz');
    await quiz.getByRole('button').filter({ has: page.getByText('中級', { exact: true }) }).click();
    const volume = quiz.getByRole('button', { name: /Vol\.1 .*挑戦する/ });
    await volume.click();
    for (let question = 1; question <= 10; question++) {
      await quiz.getByRole('button', { name: /^1\./ }).click();
      await quiz.getByRole('button', { name: question === 10 ? '検定結果を見る' : '次の問題へ進む' }).click();
    }
    await quiz.getByRole('heading', { name: /^認定ランク/ }).waitFor();
    assert.equal(await quiz.getByText(/シェアカード/).count(), 0);
    await home.click();
    await enterQuiz.click();
    await quiz.getByRole('heading', { name: '中級のセットを選ぶ' }).waitFor();
    assert.match(await volume.innerText(), /最高|全問正解/);
    await volume.click();
    await quiz.getByRole('heading', { name: /^Q1\./ }).waitFor();
    console.log('見出しの和欧混植、音域・BPMの4幅、タイアップ3件と復帰、診断の新規・再開・履歴、検定完走後のセット選択を確認');
  } finally {
    await context.close();
  }
}
