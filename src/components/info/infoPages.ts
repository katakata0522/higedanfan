export const infoPages = {
  sources: '参考資料・謝辞',
  terms: '利用規約',
  privacy: 'プライバシーポリシー',
} as const;

export type InfoPageId = keyof typeof infoPages;

export function isInfoPage(id: string): id is InfoPageId {
  return Object.hasOwn(infoPages, id);
}
