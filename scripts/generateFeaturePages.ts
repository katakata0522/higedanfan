import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PUBLIC_CORNERS,
  SITE_BASE_URL,
  SITE_BRAND_NAME,
  type PublicCornerMeta,
} from '../src/config/siteFeatures';
import { catalogEntries } from '../src/data/catalogEntries';
import { REFERENCE_ARTICLES } from '../src/data/referenceArticles';
import { SACRED_SPOTS, TOUR_ARCHIVES } from '../src/data/higedanData';
import { isTempoUnderReview } from '../src/data/tempoReviewStatus';
import { formatDuration, formatSongBpm } from '../src/utils/format';
import { formatAlbumDisplayName } from '../src/utils/songCatalog';
import { CSP_MARKER, escapeHtml, INITIAL_PAINT_STYLE, serializeJsonLd } from './siteHtml';

interface SongFactRow {
  recording: string;
  release: string;
  seconds: number;
  low: string;
  chest: string;
  falsetto: string | null;
  tempo: number;
  album: string;
  style: string;
}

function buildCornerBody(
  corner: PublicCornerMeta,
  evidence: Record<string, SongFactRow>,
): string {
  const linksHtml = PUBLIC_CORNERS.filter((other) => other.id !== corner.id)
    .map((other) => `<li><a href="/higedanfan/${escapeHtml(other.slug)}/">${escapeHtml(other.heading)}</a></li>`)
    .join('');

  let detailHtml = '';
  if (corner.id === 'discography' || corner.id === 'vocal_range') {
    const items = [...catalogEntries]
      .sort((a, b) => a.guideOrder - b.guideOrder)
      .map((entry) => {
        const fact = evidence[entry.id];
        if (!fact) return '';
        const tempoText = isTempoUnderReview(entry.id) ? 'テンポ調査中' : `BPM ${formatSongBpm(entry.id, fact.tempo)}`;
        return `<li><a href="/higedanfan/songs/${escapeHtml(entry.id)}/">${escapeHtml(fact.recording)}</a>（${escapeHtml(formatAlbumDisplayName(fact.album))}・${formatDuration(fact.seconds)}・${tempoText}・地声 ${escapeHtml(fact.low)}〜${escapeHtml(fact.chest)}・裏声最高 ${escapeHtml(fact.falsetto ?? '—')}・配信 ${escapeHtml(fact.release)}）</li>`;
      })
      .join('\n');
    detailHtml = `<section aria-label="掲載曲データ一覧"><ol>\n${items}\n</ol></section>`;
  } else if (corner.id === 'tour_archive') {
    const totalEvents = TOUR_ARCHIVES.reduce((sum, t) => sum + t.events.length, 0);
    const items = TOUR_ARCHIVES
      .map((tour) => {
        const period = tour.startDate === tour.endDate ? tour.startDate : `${tour.startDate}〜${tour.endDate}`;
        const co = tour.coArtists?.length ? `・共演：${tour.coArtists.join('・')}` : '';
        return `<li><strong>${escapeHtml(tour.tourTitle)}</strong>（${escapeHtml(period)}・全${tour.events.length}公演${escapeHtml(co)}）</li>`;
      })
      .join('\n');
    detailHtml = `<section aria-label="ツアー記録一覧"><p>${TOUR_ARCHIVES.length}シリーズ・全${totalEvents}公演のスケジュールと確認済みセットリストを収録しています。</p><ul>\n${items}\n</ul></section>`;
  } else if (corner.id === 'sacred_map') {
    const items = SACRED_SPOTS.map((spot) =>
      `<li><strong>${escapeHtml(spot.name)}</strong>（${escapeHtml(spot.area)}）— ${escapeHtml(spot.description)}</li>`,
    ).join('\n');
    detailHtml = `<section aria-label="ゆかりの聖地一覧"><p>全${SACRED_SPOTS.length}か所の聖地情報を掲載しています。</p><ul>\n${items}\n</ul></section>`;
  } else if (corner.id === 'quiz_archive') {
    const items = REFERENCE_ARTICLES.slice(0, 40)
      .map((article) => `<li>${escapeHtml(article.publisher)}：${escapeHtml(article.title)}</li>`)
      .join('\n');
    detailHtml = `<section aria-label="参考資料の一部"><p>全${REFERENCE_ARTICLES.length}件の参考記事・インタビュー・SNS資料を掲載しています。</p><ul>\n${items}\n</ul></section>`;
  } else {
    detailHtml = `<section aria-label="コーナー案内"><p>各機能のインタラクティブな操作（診断の回答、セットリスト並び替え・画像書き出し、検定の挑戦）はブラウザのJavaScript画面からすぐにご利用いただけます。</p></section>`;
  }

  return `      <main id="main" data-static-fallback class="mx-auto max-w-6xl p-5">
        <p><a href="/higedanfan/">← ${escapeHtml(SITE_BRAND_NAME)} トップへ戻る</a></p>
        <h1>${escapeHtml(corner.heading)}</h1>
        <p>${escapeHtml(corner.summary)}</p>
${detailHtml}
        <nav aria-label="サイト内の他コーナー">
          <h2>ほかのコーナー</h2>
          <ul>${linksHtml}</ul>
        </nav>
      </main>`;
}

function buildCornerJsonLd(corner: PublicCornerMeta) {
  const url = `${SITE_BASE_URL}${corner.slug}/`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_BASE_URL}#website`,
      name: SITE_BRAND_NAME,
      url: SITE_BASE_URL,
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
          name: SITE_BRAND_NAME,
          item: SITE_BASE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: corner.heading,
          item: url,
        },
      ],
    },
    {
      '@type': corner.id === 'discography' || corner.id === 'vocal_range' || corner.id === 'tour_archive' || corner.id === 'sacred_map' || corner.id === 'quiz_archive'
        ? 'CollectionPage'
        : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: corner.title,
      description: corner.description,
      inLanguage: 'ja',
      isPartOf: { '@id': `${SITE_BASE_URL}#website` },
      author: {
        '@type': 'Person',
        name: 'かたかた',
        url: `${SITE_BASE_URL}#editor`,
      },
    },
  ];
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function generateFeaturePages(rootDir: string): string[] {
  const evidence = JSON.parse(
    readFileSync(join(rootDir, 'src/data/songEvidence.json'), 'utf8'),
  ) as Record<string, SongFactRow>;

  const generatedUrls: string[] = [];
  for (const corner of PUBLIC_CORNERS) {
    const url = `${SITE_BASE_URL}${corner.slug}/`;
    const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="${CSP_MARKER}" />
    <style>${INITIAL_PAINT_STYLE}</style>
    <link rel="canonical" href="${escapeHtml(url)}" />
    <link rel="icon" href="/higedanfan/hige-mark-32.png?v=21cd698" type="image/png" sizes="32x32" />
    <link rel="icon" href="/higedanfan/hige-mark.svg?v=34b8cc7" type="image/svg+xml" sizes="any" />
    <link rel="apple-touch-icon" href="/higedanfan/hige-touch-180.png?v=cd4d0ca" sizes="180x180" />
    <link rel="manifest" href="/higedanfan/manifest.webmanifest" />
    <meta name="theme-color" content="#faf6eb" />
    <link rel="preload" as="font" type="font/woff2" crossorigin href="/higedanfan/fonts/kiwi-maru-medium-c8f08bbe.woff2" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@500&family=Noto+Sans+JP:wght@100..900&family=Shippori+Mincho:wght@500;600&display=swap" media="print" data-async-font />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kiwi+Maru:wght@500&family=Noto+Sans+JP:wght@100..900&family=Shippori+Mincho:wght@500;600&display=swap" /></noscript>
    <title>${escapeHtml(corner.title)}</title>
    <meta name="description" content="${escapeHtml(corner.description)}" />
    <meta property="og:site_name" content="${escapeHtml(SITE_BRAND_NAME)}" />
    <meta property="og:locale" content="ja_JP" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(corner.title)}" />
    <meta property="og:description" content="${escapeHtml(corner.description)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="ヒゲのマークを載せたレコードと「115万キロのファンノート」のタイトル" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(corner.title)}" />
    <meta name="twitter:description" content="${escapeHtml(corner.description)}" />
    <meta name="twitter:image" content="https://katakatalab.com/higedanfan/social-cover.png?v=8d2a973" />
    <meta name="twitter:image:alt" content="ヒゲのマークを載せたレコードと「115万キロのファンノート」のタイトル" />
    <meta name="referrer" content="no-referrer" />
    <script type="application/ld+json">${serializeJsonLd(buildCornerJsonLd(corner))}</script>
  </head>
  <body class="bg-[#faf6eb] text-[#253331] antialiased selection:bg-[#C83E2B]/20 selection:text-[#253331]">
    <div id="root" data-initial-tab="${escapeHtml(corner.id)}">
${buildCornerBody(corner, evidence)}
    </div>
    <script type="module" src="../src/main.tsx"></script>
  </body>
</html>
`;
    const outDir = join(rootDir, corner.slug);
    mkdirSync(outDir, { recursive: true });
    const outPath = join(outDir, 'index.html');
    if (!existsSync(outPath) || readFileSync(outPath, 'utf8') !== html) {
      writeFileSync(outPath, html);
    }
    generatedUrls.push(url);
  }
  return generatedUrls;
}
