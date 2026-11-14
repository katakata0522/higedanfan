export const CSP_MARKER = '__HIGEDAN_CONTENT_SECURITY_POLICY__';

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

// 開発時のVite用コードと接続だけを例外にし、本番では直接書かれたスクリプトを実行させない。
export function contentSecurityPolicy(development = false): string {
  return [
    "default-src 'self'",
    "img-src 'self' data: blob: https://i.ytimg.com https://*.mzstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `script-src 'self'${development ? " 'unsafe-inline'" : ''}`,
    "script-src-attr 'none'",
    `connect-src 'self'${development ? ' ws: wss:' : ''}`,
    'frame-src https://maps.google.com https://www.google.com https://www.youtube-nocookie.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ') + ';';
}
