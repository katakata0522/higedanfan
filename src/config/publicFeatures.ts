// 機能とブラウザ内の既存データは維持し、公開導線だけを制御する。
export const PUBLIC_FEATURES = {
  ranking: false,
  reviews: false,
  tempoPreview: false,
} as const;
