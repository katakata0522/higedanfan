// 終端がない入力で同じ末尾を何度も探さないよう、各区間を前へ進みながら除く。
function stripComments(input: string): string {
  const parts: string[] = [];
  let cursor = 0;
  while (true) {
    const start = input.indexOf('<!--', cursor);
    if (start < 0) break;
    const end = input.indexOf('-->', start + 4);
    if (end < 0) break;
    parts.push(input.slice(cursor, start));
    cursor = end + 3;
  }
  return parts.length ? parts.join('') + input.slice(cursor) : input;
}

function stripTags(input: string, opening: string, closing: string): string {
  const parts: string[] = [];
  let cursor = 0;
  let searchFrom = 0;
  while (true) {
    const start = input.indexOf(opening, searchFrom);
    if (start < 0) break;
    const nameStart = start + (input[start + 1] === '/' ? 2 : 1);
    const letter = input.charCodeAt(nameStart);
    if (!((letter >= 65 && letter <= 90) || (letter >= 97 && letter <= 122))) {
      searchFrom = start + 1;
      continue;
    }
    const end = input.indexOf(closing, nameStart + 1);
    if (end < 0) break;
    parts.push(input.slice(cursor, start));
    cursor = searchFrom = end + 1;
  }
  return parts.length ? parts.join('') + input.slice(cursor) : input;
}

/**
 * Security: Sanitizes user-supplied text against XSS and injection attacks.
 * - Strips HTML comments, opening/closing tags, and angle brackets (<, >, ＜, ＞)
 * - Removes control characters and bidirectional override characters
 * - Strips dangerous URI schemes (javascript:, data:, vbscript:, file:, blob:)
 * - Strips inline DOM event handlers (e.g., onerror=, onclick=, onload=)
 * - Enforces a strict maximum character length
 * 出力もReactのテキストとして描画し、HTMLやURLとして直接解釈しない。
 */
export function sanitizeUserText(input: unknown, maxLength = 200, { trim = true } = {}): string {
  if (typeof input !== 'string') return '';
  const safeMax = Math.max(1, Math.min(2000, Math.floor(maxLength) || 200));
  const controlsRemoved = input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, '');
  const commentsRemoved = stripComments(controlsRemoved);
  const asciiTagsRemoved = stripTags(commentsRemoved, '<', '>');
  const cleaned = stripTags(asciiTagsRemoved, '＜', '＞')
    .replace(/[<>＜＞]/g, '')
    .replace(/\b(?:javascript|data|vbscript|file|blob)\s*:/gi, '')
    .replace(/\bon[a-z]+\s*=/gi, '');
  return (trim ? cleaned.trim() : cleaned).slice(0, safeMax);
}

/**
 * Security: Sanitizes an identifier (songId, spotId, reviewId, voteKey)
 * so only safe ASCII alphanumeric, hyphen, underscore, and colon remain.
 */
export function sanitizeSafeId(input: unknown, maxLength = 60): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[^a-zA-Z0-9_:-]/g, '')
    .slice(0, Math.max(1, Math.min(120, maxLength)));
}

/**
 * Security: Ensures an asset image path is a safe local path and not an executable protocol.
 */
export function isSafeAssetUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (/[<>'"`\u0000-\u001F]/.test(trimmed)) return false;
  return true;
}
