import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalogEntries } from '../src/data/catalogEntries';
import { autoSongPage } from '../src/songPages/autoSongPage';
import { applySongEditorial } from '../src/songPages/applySongEditorial';
import { editorialArticles } from '../src/songPages/editorialArticles';
import { officialVideoDescription, officialVideos, relatedSongs } from '../src/songPages/songConnections';
import { songAppleArtwork } from '../src/data/songAppleArtwork';
import { songStreamingLinks } from '../src/data/songStreamingLinks';
import { tempoAlternatives } from '../src/data/tempoAlternatives';
import { songwriterInfo } from '../src/utils/songCatalog';
import type { EditorialSongPageData } from '../src/songPages/EditorialSongPageData';
import { generateFeaturePages } from './generateFeaturePages';
import { CSP_MARKER, escapeHtml, INITIAL_PAINT_STYLE, serializeJsonLd } from './siteHtml';

const root = join(import.meta.dirname, '..');
const dataDir = join(root, 'src/songPages/data');
const evidence = JSON.parse(readFileSync(join(root, 'src/data/songEvidence.json'), 'utf8')) as Record<string, {
  recording: string;
  release: string;
  seconds: number;
  apple: string;
  cdSource: string;
  rangeSource: string;
  tempoSource: string;
  styleSource: string;
  otherRange: string[] | null;
  otherSource: string;
  album: string;
}>;

function formatIsoDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `PT${mins}M${secs}S`;
}

function buildSongDescription(title: string, overviewParagraph: string): string {
  const prefix = `Official髭男dism「${title}」の楽曲ガイド。`;
  const full = `${prefix}${overviewParagraph}`;
  if (full.length <= 130) return full;
  const sentences = overviewParagraph.match(/[^。]+。?/g) ?? [overviewParagraph];
  let body = '';
  for (const sentence of sentences) {
    if (prefix.length + body.length + sentence.length <= 130) {
      body += sentence;
    } else {
      break;
    }
  }
  if (body) return `${prefix}${body}`;
  return `${full.slice(0, 129)}…`;
}

function isHttpsUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

function renderHtml(page: EditorialSongPageData, title: string): string {
  const escapedTitle = escapeHtml(title);
  const url = `https://katakatalab.com/higedanfan/songs/${page.id}/`;
  const escapedUrl = escapeHtml(url);
  const escapedId = escapeHtml(page.id);
  const fact = evidence[page.id];
  const description = buildSongDescription(title, page.overview[0] ?? '');
  const credit = songwriterInfo({ id: page.id, title });
  const paragraphs = page.overview.map(paragraph => `            <p>${escapeHtml(paragraph)}</p>`).join('\n');
  const streaming = songStreamingLinks[page.id];
  const listening = [
    `<a href="${escapeHtml(fact.apple)}" target="_blank" rel="noopener noreferrer">Apple Music</a>`,
    `<a href="${escapeHtml(streaming.spotifyUrl)}" target="_blank" rel="noopener noreferrer">Spotify</a>`,
    `<a href="${escapeHtml(streaming.amazonUrl)}" target="_blank" rel="noopener noreferrer">Amazon Music</a>`,
  ].join(' ');
  const video = '';
  const related = relatedSongs(page.id).map(item =>
    `<li><a href="/higedanfan/songs/${escapeHtml(item.id)}/">${escapeHtml(item.title)}</a>：${escapeHtml(item.reason)}</li>`).join('');
  const releaseIso = /^\d{4}\.\d{2}\.\d{2}$/.test(fact.release) ? fact.release.replace(/\./g, '-') : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://katakatalab.com/higedanfan/#website',
        name: '115万キロのファンノート',
        url: 'https://katakatalab.com/higedanfan/',
        inLanguage: 'ja',
        publisher: {
          '@type': 'Organization',
          name: 'KatakataLab',
          url: 'https://katakatalab.com/',
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '115万キロのファンノート',
            item: 'https://katakatalab.com/higedanfan/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '楽曲ガイド（掲載90曲）',
            item: 'https://katakatalab.com/higedanfan/discography/',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: title,
            item: url,
          },
        ],
      },
      {
        '@type': 'MusicRecording',
        '@id': `${url}#recording`,
        name: title,
        duration: formatIsoDuration(fact.seconds),
        ...(releaseIso ? { datePublished: releaseIso } : {}),
        byArtist: {
          '@type': 'MusicGroup',
          name: 'Official髭男dism',
        },
        ...(credit ? {
          lyricist: credit.name.split('・').map(name => ({ '@type': 'Person', name })),
          composer: credit.name.split('・').map(name => ({ '@type': 'Person', name })),
        } : {}),
        inAlbum: {
          '@type': 'MusicAlbum',
          name: fact.album,
        },
        url,
      },
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: `${title}｜Official髭男dism 楽曲ガイド`,
        description,
        url,
        inLanguage: 'ja',
        mainEntityOfPage: url,
        isPartOf: { '@id': 'https://katakatalab.com/higedanfan/#website' },
        about: { '@id': `${url}#recording` },
        author: {
          '@type': 'Person',
          name: 'かたかた',
          url: 'https://katakatalab.com/higedanfan/#editor',
        },
        publisher: {
          '@type': 'Organization',
          name: 'KatakataLab',
          url: 'https://katakatalab.com/',
        },
        image: 'https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973',
      },
    ],
  };
  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="${CSP_MARKER}" />
    <style>${INITIAL_PAINT_STYLE}</style>
    <title>${escapedTitle}｜Official髭男dism 楽曲ガイド｜115万キロのファンノート</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapedUrl}" />
    <link rel="icon" href="/higedanfan/hige-mark-32.png?v=21cd698" type="image/png" sizes="32x32" />
    <link rel="icon" href="/higedanfan/hige-mark.svg?v=34b8cc7" type="image/svg+xml" sizes="any" />
    <link rel="apple-touch-icon" href="/higedanfan/hige-touch-180.png?v=cd4d0ca" sizes="180x180" />
    <link rel="manifest" href="/higedanfan/manifest.webmanifest" />
    <meta name="theme-color" content="#faf6eb" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/higedanfan/fonts/kiwi-maru-medium-c8f08bbe.woff2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@500&family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@600;700&family=Shippori+Mincho:wght@500;600&display=swap" />
    <meta property="og:site_name" content="115万キロのファンノート" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapedTitle}｜Official髭男dism 楽曲ガイド" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta property="og:image" content="https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="ヒゲのマークを載せたレコードと「115万キロのファンノート」のタイトル" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}｜Official髭男dism 楽曲ガイド" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973" />
    <meta name="twitter:image:alt" content="ヒゲのマークを載せたレコードと「115万キロのファンノート」のタイトル" />
    <meta name="referrer" content="no-referrer" />
    <script type="application/ld+json">${serializeJsonLd(jsonLd)}</script>
  </head>
  <body>
    <div id="root" data-song-id="${escapedId}">
      <main id="main" data-static-fallback class="song-page page-main">
        <article class="song-sheet" aria-labelledby="song-title">
          <h1 id="song-title">${escapedTitle}</h1>
          <section class="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲について</h2>
${paragraphs}
          </section>
          <section aria-label="この曲を聴く">${listening}${video}</section>
          ${related ? `<section aria-label="次に聴きたい曲"><ul>${related}</ul></section>` : ''}
          <p><a href="/higedanfan/discography/">楽曲ガイドに戻る</a></p>
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
if (catalogIds.size !== Object.keys(editorialArticles).length
    || Object.keys(editorialArticles).some(id => !catalogIds.has(id))
    || Object.values(editorialArticles).some(article => article.paragraphs.length < 2 || !article.feature)) {
  throw new Error('全曲に個別の解説と見出しを用意してください');
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${id}: 楽曲IDの形式が不正です`);
  }
  const page = applySongEditorial(customPages.get(id) ?? autoSongPage(id));
  const fact = evidence[id];
  const appleArtwork = songAppleArtwork[id];
  if (!fact || page.id !== id || !fact.recording || !isHttpsUrl(fact.apple)) {
    throw new Error(`${id}: 楽曲IDと検証済みデータ・公式URLを確認してください`);
  }
  if (officialVideos[id] && !isHttpsUrl(officialVideos[id])) {
    throw new Error(`${id}: 公式動画URLが不正です`);
  }
  if (page.feature.citeUrl && !isHttpsUrl(page.feature.citeUrl)) {
    throw new Error(`${id}: 紹介見出しの出典URLが不正です`);
  }
  if (tempoAlternatives[id]?.some(alt => !isHttpsUrl(alt.url))) {
    throw new Error(`${id}: テンポ別資料URLが不正です`);
  }
  const streaming = songStreamingLinks[id];
  if (!appleArtwork || !isHttpsUrl(appleArtwork.artworkUrl) || !isHttpsUrl(appleArtwork.appleUrl)) {
    throw new Error(`${id}: Apple Music ジャケットURLと公式リンクを確認してください`);
  }
  if (!streaming || !isHttpsUrl(streaming.spotifyUrl) || !isHttpsUrl(streaming.amazonUrl)) {
    throw new Error(`${id}: Spotify と Amazon Music の公式リンクを確認してください`);
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

const featureUrls = generateFeaturePages(root);

const siteUrls = [
  'https://katakatalab.com/higedanfan/',
  ...featureUrls,
  ...ids.map(id => `https://katakatalab.com/higedanfan/songs/${id}/`),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${siteUrls
  .map(loc => `  <url><loc>${escapeHtml(loc)}</loc></url>`)
  .join('\n')}\n</urlset>\n`;
const sitemapPath = join(root, 'brand/sitemap.xml');
if (!existsSync(sitemapPath) || readFileSync(sitemapPath, 'utf8') !== sitemap) writeFileSync(sitemapPath, sitemap);

const robots = `User-agent: *\nAllow: /\nSitemap: https://katakatalab.com/higedanfan/sitemap.xml\n`;
const robotsPath = join(root, 'brand/robots.txt');
if (!existsSync(robotsPath) || readFileSync(robotsPath, 'utf8') !== robots) writeFileSync(robotsPath, robots);

console.log(`楽曲ページ ${ids.length} 件・コーナー ${featureUrls.length} 件のHTMLとサイトマップを生成しました`);
