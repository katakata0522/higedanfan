export type QuoteSizeTier = 'standard' | 'medium' | 'long';

const PUNCTUATION_ONLY_RE = /^[!！?？…、。.,:;)\]｝」』】]+$/;

/**
 * 1行あたりの視覚的な全角換算文字幅を概算する。
 * 半角英数・空白と全角和文が混在する歌詞でも実表示に近い行幅で比較するため。
 */
export function measureQuoteLineUnits(line: string): number {
  let units = 0;
  for (const ch of line) {
    if (ch === ' ') {
      units += 0.55;
    } else if (/^[\x21-\x7e]$/.test(ch)) {
      units += 0.62;
    } else {
      units += 1;
    }
  }
  return units;
}

/**
 * 歌詞引用の最長行の実効幅から表示サイズ段階を判定する。
 */
export function getQuoteSizeTier(text: string): QuoteSizeTier {
  const maxLineUnits = Math.max(0, ...text.split('\n').map(measureQuoteLineUnits));
  if (maxLineUnits >= 23.5) return 'long';
  if (maxLineUnits > 18.5) return 'medium';
  return 'standard';
}

/**
 * 半角スペース区切りのフレーズ配列を返す。単独の記号トークンは直前の語と結合して孤立を防ぐ。
 */
export function splitQuoteLinePhrases(line: string): string[] {
  const rawParts = line.split(' ');
  const phrases: string[] = [];
  for (const part of rawParts) {
    if (phrases.length > 0 && PUNCTUATION_ONLY_RE.test(part)) {
      phrases[phrases.length - 1] = `${phrases[phrases.length - 1]} ${part}`;
    } else {
      phrases.push(part);
    }
  }
  return phrases;
}

const CREDIT_CHUNK_RE = /^(— Official髭男dism「.+」)(（作詞：.+）(?:より)?)$/;

/**
 * 曲名部分と作詞クレジット部分の境界で分割する。
 * 長い曲名のとき、括弧の途中で改行されるのを防ぐため。
 */
export function splitCreditChunks(credit: string): [string, string] | null {
  const match = credit.match(CREDIT_CHUNK_RE);
  if (!match) return null;
  return [match[1], match[2]];
}
