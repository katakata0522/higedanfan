import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'path';
import evidence from './src/data/songEvidence.json' with { type: 'json' };
import { isTempoUnderReview } from './src/data/tempoReviewStatus.ts';
import { publishedSongPageIds } from './src/songPages/publishedSongPageIds.ts';
import { PUBLIC_CORNERS } from './src/config/siteFeatures.ts';
import { formatDuration, formatSongBpm } from './src/utils/format.ts';
import { contentSecurityPolicy, CSP_MARKER, escapeHtml as escape, INITIAL_PAINT_STYLE } from './scripts/siteHtml.ts';
import { emitPwaServiceWorker } from './scripts/pwaWorker.ts';
function safeHttpsHref(url: string): string {
  if (new URL(url).protocol !== 'https:') {
    throw new Error(`Invalid HTTPS URL in songEvidence: ${url}`);
  }
  return escape(url);
}

let cachedCatalogHtml: string | null = null;
function renderCatalog() {
  if (cachedCatalogHtml !== null) return cachedCatalogHtml;
  cachedCatalogHtml = Object.entries(evidence).map(([id, f]) => {
    const duration = formatDuration(f.seconds);
    const title = '<strong>'+escape(f.recording)+'</strong>';
    const songLink = publishedSongPageIds.has(id) ? '<a href="/higedanfan/songs/'+encodeURIComponent(id)+'/">'+title+'</a>' : title;
    return '<li>'+songLink+' ／ '+escape(f.style)+' ／ '+duration+' ／ '+formatSongBpm(id, f.tempo)+(isTempoUnderReview(id) ? '' : ' BPM')+' ／ 地声 '+escape(f.low)+'～'+escape(f.chest)+' ／ 裏声最高 '+escape(f.falsetto || '—')+
      ' ／ 配信日 '+escape(f.release)+' <a href="'+safeHttpsHref(f.apple)+'" rel="noopener noreferrer">Apple Music</a> · <a href="'+safeHttpsHref(f.rangeSource)+'" rel="noopener noreferrer">音域の参照元</a> · <a href="'+safeHttpsHref(f.styleSource)+'" rel="noopener noreferrer">曲調</a> · <a href="'+safeHttpsHref(f.tempoSource)+'" rel="noopener noreferrer">テンポ</a></li>';
  }).join('\n');
  return cachedCatalogHtml;
}
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  return {
    base: '/higedanfan/',
    publicDir: 'brand',
    build: {
      license: { fileName: 'third-party-licenses.txt' },
      rolldownOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          ...Object.fromEntries(PUBLIC_CORNERS.map(corner => [
            `corner-${corner.slug}`, path.resolve(import.meta.dirname, `${corner.slug}/index.html`),
          ])),
          ...Object.fromEntries([...publishedSongPageIds].map(id => [
            `song-${id}`, path.resolve(import.meta.dirname, `songs/${id}/index.html`),
          ])),
        },
      },
    },
    plugins: [react(), tailwindcss(), {
      name: 'static-song-guide',
      transformIndexHtml: html => {
        let out = html
          .replace(CSP_MARKER, () => contentSecurityPolicy(command === 'serve'))
          .replace('<!--initial-paint-style-->', () => `<style>${INITIAL_PAINT_STYLE}</style>`);
        if (out.includes('<!--verified-songs-->')) {
          out = out.replace('<!--verified-songs-->', () => renderCatalog());
        }
        return out;
      },
      closeBundle() {
        const distDir = path.resolve(import.meta.dirname, 'dist');
        fs.rmSync(path.join(distDir, 'song-art'), { recursive: true, force: true });
        if (command === 'build') {
          emitPwaServiceWorker(distDir);
        }
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
