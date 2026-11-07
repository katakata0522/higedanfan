import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import evidence from './src/data/songEvidence.json';
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function renderCatalog() {
  return Object.values(evidence).map(f => {
    const duration = Math.floor(f.seconds/60) + ':' + String(f.seconds%60).padStart(2,'0');
    return '<li><strong>'+escape(f.recording)+'</strong> ／ '+escape(f.style)+' ／ '+duration+' ／ '+f.tempo+' BPM ／ 地声 '+f.low+'～'+f.chest+' ／ 裏声最高 '+(f.falsetto || '記載なし')+
      ' ／ 配信掲載日 '+f.release+' <a href="'+escape(f.apple)+'">音源</a> · <a href="'+escape(f.rangeSource)+'">採譜</a> · <a href="'+escape(f.styleSource)+'">曲調</a> · <a href="'+escape(f.tempoSource)+'">テンポ</a></li>';
  }).join('\n');
}
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: '/higedanfan/',
    publicDir: 'brand',
    build: {
      license: { fileName: 'third-party-licenses.txt' },
      rolldownOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          mixedNuts: path.resolve(import.meta.dirname, 'songs/mixed-nuts/index.html'),
        },
      },
    },
    plugins: [react(), tailwindcss(), { name:'static-song-guide', transformIndexHtml: html => html.replace('<!--verified-songs-->', renderCatalog()) }],
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
