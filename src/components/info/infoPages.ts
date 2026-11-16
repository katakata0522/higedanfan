export const infoPages = {
  editor: '編集者について（かたかた）',
  sources: '参考資料・謝辞',
  terms: '利用規約',
  privacy: 'プライバシーポリシー',
} as const;

export type InfoPageId = keyof typeof infoPages;

export const infoPageDescriptions: Record<InfoPageId, string> = {
  editor: '「115万キロのファンノート」編集者（かたかた）のプロフィールと、サイト制作の背景・編集方針をご案内します。',
  sources: '楽曲ガイド、Official髭男dism検定、聖地巡礼マップ、歴代ツアー記録で参照した公式情報・インタビュー等の資料一覧です。',
  terms: '非公式ファンサイト「115万キロのファンノート」の利用規約、権利帰属、免責事項についてご案内します。',
  privacy: 'ブラウザ内への記録保存（MYセトリ・参戦記録等）、外部サービス接続、データの書き出し・初期化について説明します。',
};

export function isInfoPage(id: string): id is InfoPageId {
  return Object.hasOwn(infoPages, id);
}
