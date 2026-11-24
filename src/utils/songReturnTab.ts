import { getBrowserSessionStorage, hasBlockedKey, isPlainObject, safeJsonParseBounded, type BrowserStorageLike } from './browserStorage';

const guideStateKey = 'higedanfan:guide-return:v1';
const originTabKey = 'higedanfan:song-origin-tab:v1';
const MAX_RETURN_STATE_BYTES = 10_000;

const originTabs = new Set([
  'home', 'mood', 'discography', 'vocal_range', 'sacred_map', 'setlist', 'tour_archive', 'quiz', 'quiz_archive',
]);

const ORIGIN_DESTINATIONS: Record<string, { hash: string; label: string }> = {
  home: { hash: 'home', label: 'トップページに戻る' },
  mood: { hash: 'mood', label: '今日の1曲診断に戻る' },
  discography: { hash: 'discography', label: '楽曲ガイドに戻る' },
  vocal_range: { hash: 'vocal_range', label: '音域一覧に戻る' },
  sacred_map: { hash: 'sacred_map', label: '聖地巡礼マップに戻る' },
  setlist: { hash: 'setlist', label: 'MYセトリ作成に戻る' },
  tour_archive: { hash: 'tour_archive', label: '歴代ツアー記録に戻る' },
  quiz: { hash: 'quiz', label: 'Official髭男dism検定に戻る' },
  quiz_archive: { hash: 'quiz_archive', label: '参考記事・インタビュー・SNSに戻る' },
};

export type ReturnTabStore = Pick<BrowserStorageLike, 'getItem' | 'setItem' | 'removeItem'>;
export type GuideReturnView = 'discography' | 'vocal_range';

function browserStore(): ReturnTabStore | null {
  return getBrowserSessionStorage();
}

export function saveSongReturnTab(tab: string, store: ReturnTabStore | null = browserStore()): void {
  if (!originTabs.has(tab)) return;
  try { store?.setItem(originTabKey, tab); } catch { /* 保存できない環境では既定の戻り先を使う。 */ }
}

export function clearSongReturnTab(store: ReturnTabStore | null = browserStore()): void {
  try { store?.removeItem(originTabKey); } catch { /* ignore */ }
}

export function guideReturnView(store: ReturnTabStore | null = browserStore()): GuideReturnView {
  try {
    const value = safeJsonParseBounded(store?.getItem(guideStateKey), MAX_RETURN_STATE_BYTES);
    return isPlainObject(value) && !hasBlockedKey(value, 3) && value.view === 'vocal_range' ? 'vocal_range' : 'discography';
  } catch { return 'discography'; }
}

export function songReturnDestination(store: ReturnTabStore | null = browserStore()): { hash: string; label: string } {
  try {
    const savedTab = store?.getItem(originTabKey);
    if (savedTab && Object.hasOwn(ORIGIN_DESTINATIONS, savedTab)) {
      return ORIGIN_DESTINATIONS[savedTab];
    }
  } catch { /* fall through to guideReturnView */ }
  return ORIGIN_DESTINATIONS[guideReturnView(store)];
}
