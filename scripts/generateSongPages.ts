import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalogEntries } from '../src/data/catalogEntries';
import { autoSongPage } from '../src/songPages/autoSongPage';
import type { EditorialSongPageData } from '../src/songPages/EditorialSongPageData';

const root = join(import.meta.dirname, '..');
const dataDir = join(root, 'src/songPages/data');
const evidence = JSON.parse(readFileSync(join(root, 'src/data/songEvidence.json'), 'utf8')) as Record<string, {
  recording: string;
  apple: string;
  cdSource: string;
  rangeSource: string;
  tempoSource: string;
  styleSource: string;
  otherRange: string[] | null;
  otherSource: string;
}>;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function isHttpsUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function renderHtml(page: EditorialSongPageData, title: string): string {
  const escapedTitle = escapeHtml(title);
  const url = `https://katakatalab.com/higedanfan/songs/${page.id}/`;
  const description = `Official髭男dism『${title}』の収録作品、演奏時間、テンポ、歌の音域、曲の概要と出典をまとめた非公式ファンサイトの楽曲ガイド。`;
  const paragraphs = page.overview.map(paragraph => `            <p>${escapeHtml(paragraph)}</p>`).join('\n');
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; form-action 'self';" />
    <title>${escapedTitle}｜楽曲ガイド｜115万キロのファンノート</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${url}" />
    <link rel="icon" href="/higedanfan/hige-mark.svg?v=34b8cc7" type="image/svg+xml" sizes="any" />
    <link rel="apple-touch-icon" href="/higedanfan/hige-touch-180.png?v=cd4d0ca" sizes="180x180" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapedTitle}｜115万キロのファンノート" />
    <meta property="og:description" content="曲の概要、演奏時間、テンポ、音域と資料を読む。" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root" data-song-id="${page.id}">
      <main id="main" class="song-page page-main">
        <article class="song-sheet" aria-labelledby="song-title">
          <h1 id="song-title">${escapedTitle}</h1>
          <section class="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲の概要</h2>
${paragraphs}
          </section>
          <p><a href="/higedanfan/#discography">楽曲ガイドに戻る</a></p>
        </article>
      </main>
    </div>
    <script type="module" src="../../src/songPages/songPageMain.tsx"></script>
  </body>
</html>
`;
}

const filenames = readdirSync(dataDir).filter(name => /^[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/.test(name)).sort();
const catalogIds = new Set<string>(catalogEntries.map(song => song.id));
if (catalogIds.size !== catalogEntries.length || catalogIds.size !== Object.keys(evidence).length
    || Object.keys(evidence).some(id => !catalogIds.has(id))) {
  throw new Error('楽曲カタログと検証済みデータのIDを一致させてください');
}
const customPages = new Map<string, EditorialSongPageData>();
for (const filename of filenames) {
  if (!catalogIds.has(filename.slice(0, -3))) {
    throw new Error(`${filename}: 楽曲カタログにない個別ページです`);
  }
  const { default: page } = await import(pathToFileURL(join(dataDir, filename)).href) as { default: EditorialSongPageData };
  customPages.set(filename.slice(0, -3), page);
}

const ids: string[] = [];
for (const song of [...catalogEntries].sort((a, b) => a.guideOrder - b.guideOrder)) {
  const id = song.id;
  const page = customPages.get(id) ?? autoSongPage(id);
  const fact = evidence[id];
  if (!fact || page.id !== id || !fact.recording) {
    throw new Error(`${id}: 楽曲IDと検証済みデータを確認してください`);
  }
  if (!page.feature.text || !page.feature.credit || page.overview.length === 0 || page.overview.some(text => !text.trim())) {
    throw new Error(`${id}: 紹介文と概要を入力してください`);
  }
  if (!page.artwork.alt || ('path' in page.artwork
      ? !/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.(png|jpe?g|webp|svg)$/i.test(page.artwork.path)
        || !existsSync(join(root, 'brand', page.artwork.path))
      : !page.artwork.theme)) {
    throw new Error(`${id}: 掲載する画像と代替テキストを確認してください`);
  }
  if (page.albumTrack !== undefined && (!Number.isInteger(page.albumTrack) || page.albumTrack < 1)) {
    throw new Error(`${id}: 収録順を確認してください`);
  }
  if (page.sources.length === 0 || page.sources.some(source => !source.label || !source.purpose
      || !isHttpsUrl(source.evidence ? fact[source.evidence] : source.url!))) {
    throw new Error(`${id}: 出典のURLと説明を確認してください`);
  }
  if (page.vocalVariants?.some(variant => !variant.label || !variant.value || !variant.sourceLabel || !isHttpsUrl(variant.sourceUrl))) {
    throw new Error(`${id}: 音域の採譜差と出典を確認してください`);
  }
  if (fact.otherRange && (fact.otherRange.length !== 3 || fact.otherRange.some(value => !value.trim()) || !isHttpsUrl(fact.otherSource))) {
    throw new Error(`${id}: 別の採譜値と出典を確認してください`);
  }
  const outputDir = join(root, 'songs', id);
  mkdirSync(outputDir, { recursive: true });
  const outputPath = join(outputDir, 'index.html');
  const html = renderHtml(page, fact.recording);
  if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== html) writeFileSync(outputPath, html);
  ids.push(id);
}

const routesPath = join(root, 'src/songPages/publishedSongPageIds.ts');
const routes = `// scripts/generateSongPages.ts から生成。掲載曲は catalogEntries と songEvidence に追加する。\nexport const publishedSongPageIds = new Set<string>(${JSON.stringify(ids)});\n\nexport function songPagePath(id: string): string | null {\n  return publishedSongPageIds.has(id) ? \`songs/\${id}/\` : null;\n}\n`;
if (!existsSync(routesPath) || readFileSync(routesPath, 'utf8') !== routes) writeFileSync(routesPath, routes);
console.log(`楽曲ページ ${ids.length} 件のHTMLと導線を生成しました`);
