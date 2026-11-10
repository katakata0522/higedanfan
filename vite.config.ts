import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import evidence from './src/data/songEvidence.json' with { type: 'json' };
import { isTempoUnderReview } from './src/data/tempoReviewStatus.ts';
import { publishedSongPageIds } from './src/songPages/publishedSongPageIds.ts';
import { formatDuration, formatSongBpm } from './src/utils/format.ts';
import { contentSecurityPolicy, CSP_MARKER, escapeHtml as escape } from './scripts/siteHtml.ts';
function renderCatalog() {
  return Object.entries(evidence).map(([id, f]) => {
    const duration = formatDuration(f.seconds);
    const title = '<strong>'+escape(f.recording)+'</strong>';
    const songLink = publishedSongPageIds.has(id) ? '<a href="/higedanfan/songs/'+encodeURIComponent(id)+'/">'+title+'</a>' : title;
    return '<li>'+songLink+' ／ '+escape(f.style)+' ／ '+duration+' ／ '+formatSongBpm(id, f.tempo)+(isTempoUnderReview(id) ? '' : ' BPM')+' ／ 地声 '+escape(f.low)+'～'+escape(f.chest)+' ／ 裏声最高 '+escape(f.falsetto || '記載なし')+
      ' ／ 配信掲載日 '+f.release+' <a href="'+escape(f.apple)+'">音源</a> · <a href="'+escape(f.rangeSource)+'">採譜</a> · <a href="'+escape(f.styleSource)+'">曲調</a> · <a href="'+escape(f.tempoSource)+'">テンポ</a></li>';
  }).join('\n');
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
          ...Object.fromEntries([...publishedSongPageIds].map(id => [
            `song-${id}`, path.resolve(import.meta.dirname, `songs/${id}/index.html`),
          ])),
        },
      },
    },
    plugins: [react(), tailwindcss(), {
      name: 'static-song-guide',
      transformIndexHtml: html => html
        .replace(CSP_MARKER, contentSecurityPolicy(command === 'serve'))
        .replace('<!--verified-songs-->', renderCatalog()),
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
