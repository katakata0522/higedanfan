/**
 * Converts Katakana characters (ア-ヶ) into Hiragana (あ-ゖ).
 */
export function hiraganaFromKatakana(value: string): string {
  return value.replace(/[ァ-ヶ]/g, (kana) =>
    String.fromCharCode(kana.charCodeAt(0) - 0x60),
  );
}

/**
 * Normalizes Japanese text for forgiving search matching (NFKC, lowercase, hiragana).
 */
export function normalizeJaText(value: string): string {
  return hiraganaFromKatakana(value.normalize('NFKC').toLowerCase());
}

/**
 * Normalizes Japanese text and removes whitespace/punctuation delimiters for search keys.
 */
export function normalizeJaSearchKey(value: string): string {
  return normalizeJaText(value).replace(/[\s'‘’".…・!?‐‑–—×-]+/g, '');
}
