export const CSP_MARKER = '__HIGEDAN_CONTENT_SECURITY_POLICY__';

// 初期描画で無JS用フォールバックHTMLが一瞬見えるチラつき（FOUC）を防ぐ。
export const INITIAL_PAINT_STYLE = [
  'html,body{margin:0;background-color:#faf6eb;',
  'background-image:radial-gradient(rgba(160,148,128,.22) 1.1px,transparent 1.1px),linear-gradient(90deg,rgba(160,148,128,.04) 1px,transparent 1px);',
  'background-size:26px 26px,26px 100%;color:#253331;}',
  '@media (scripting:enabled){#root>[data-static-fallback]{display:none;}}',
].join('');

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/[<>&\u2028\u2029]/g, ch => ({
      '<': '\\u003c',
      '>': '\\u003e',
      '&': '\\u0026',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029',
    })[ch]!);
}

// 開発時のVite用コードと接続だけを例外にし、本番では直接書かれたスクリプトを実行させない。
export function contentSecurityPolicy(development = false): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: https://i.ytimg.com https://*.mzstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `script-src 'self'${development ? " 'unsafe-inline'" : ''}`,
    "script-src-attr 'none'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    'frame-src https://maps.google.com https://www.google.com https://www.youtube-nocookie.com',
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    ...(development ? [] : ['upgrade-insecure-requests']),
  ].join('; ') + ';';
}
