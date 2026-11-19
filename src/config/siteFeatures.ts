export type PublicCornerId =
  | 'discography'
  | 'vocal_range'
  | 'tour_archive'
  | 'sacred_map'
  | 'setlist'
  | 'mood'
  | 'quiz'
  | 'quiz_archive';

export interface PublicCornerMeta {
  id: PublicCornerId;
  slug: string;
  heading: string;
  title: string;
  description: string;
  summary: string;
}

export const SITE_BASE_URL = 'https://katakatalab.com/higedanfan/';
export const SITE_BRAND_NAME = '115万キロのファンノート';
export const SITE_FULL_TITLE = `${SITE_BRAND_NAME} — Official髭男dism 非公式ファンサイト`;

export const HOME_PAGE_META = {
  title: SITE_FULL_TITLE,
  description:
    'Official髭男dismの楽曲ガイド・音域一覧、今日の1曲診断、聖地巡礼マップ、MYセトリ作成、歴代ツアー公演記録、Official髭男dism検定を楽しめる非公式ファンサイト。',
} as const;

export const PUBLIC_CORNERS: readonly PublicCornerMeta[] = [
  {
    id: 'discography',
    slug: 'discography',
    heading: '楽曲ガイド（掲載90曲）',
    title: `楽曲ガイド（掲載90曲）｜${SITE_FULL_TITLE}`,
    description:
      'Official髭男dismの掲載90曲をまとめた楽曲ガイド。1曲ごとの音域やテンポ、タイアップ、収録作品、制作背景を検索して曲ページへ進めます。',
    summary: '掲載90曲ごとの音域やテンポ、タイアップ・制作秘話・隠れた聴きどころを検索して各曲ページでじっくり読めます。',
  },
  {
    id: 'vocal_range',
    slug: 'vocal-range',
    heading: '掲載90曲の音域・発売日一覧',
    title: `音域一覧・カラオケ選曲ガイド｜${SITE_FULL_TITLE}`,
    description:
      'Official髭男dism掲載90曲の地声最低音・地声最高音・ファルセット最高音・BPM・配信日を一覧比較。カラオケ選曲や音域チェックに役立ちます。',
    summary: '地声最低音・地声最高音・裏声最高音やBPM・発売日を一覧で比較し、カラオケ選曲の目安を探せます。',
  },
  {
    id: 'tour_archive',
    slug: 'tour-archive',
    heading: '歴代ツアー・公演記録',
    title: `歴代ツアー・公演記録｜${SITE_FULL_TITLE}`,
    description:
      'Official髭男dismの2015年以降のワンマンツアー・単独公演・配信ライブの日程・会場とセットリスト記録を年代順・曲名から辿れます。',
    summary: '2015年以降のツアー・単独・配信公演の日程・会場と収録セットリストを辿り、参戦・視聴記録を残せます。',
  },
  {
    id: 'sacred_map',
    slug: 'sacred-map',
    heading: '聖地巡礼マップ',
    title: `聖地巡礼マップ｜${SITE_FULL_TITLE}`,
    description:
      '島根・松江・米子から東京・海外ロケ地まで、Official髭男dismゆかりのライブ会場・MVロケ地・思い出の場所を地図とエピソードで辿る巡礼ガイド。',
    summary: 'バンドの原点である山陰から全国のライブ会場、MV撮影スポットまで、ゆかりの場所と訪問メモを管理できます。',
  },
  {
    id: 'setlist',
    slug: 'setlist',
    heading: 'MYセトリ作成',
    title: `MYセトリ作成｜${SITE_FULL_TITLE}`,
    description:
      'Official髭男dismの楽曲で自分だけの理想のライブセットリストを作成。本編・アンコール構成や合計演奏時間、シェア用画像まで作成できます。',
    summary: '本編とアンコールを自在に組み替え、合計演奏時間の計算や複数保存、シェア用セットリスト画像の書き出しができます。',
  },
  {
    id: 'mood',
    slug: 'mood',
    heading: '今日の1曲診断',
    title: `今日の1曲診断｜${SITE_FULL_TITLE}`,
    description:
      '5つの質問から今の気分やシーンにぴったりのOfficial髭男dismの3曲を診断。曲調や聴きどころとあわせて楽しめます。',
    summary: '5つの気分・場面の質問に答えるだけで、今の気持ちに寄り添うおすすめの3曲を提案します。',
  },
  {
    id: 'quiz',
    slug: 'quiz',
    heading: 'Official髭男dism検定',
    title: `Official髭男dism検定｜${SITE_FULL_TITLE}`,
    description:
      '楽曲エピソードから制作秘話まで、解説と出典を読みながらOfficial髭男dismの歩みを楽しく深掘りできる検定コーナー。',
    summary: '初級・中級・上級・総合チャレンジから選んで、全問解説と出典リンク付きでヒゲダンの知識を深められます。',
  },
  {
    id: 'quiz_archive',
    slug: 'quiz-archive',
    heading: '参考記事・インタビュー',
    title: `参考記事・インタビュー｜${SITE_FULL_TITLE}`,
    description:
      'Official髭男dismの楽曲ガイドや検定で参照した公式インタビュー、ディスクレビュー、メディア記事を媒体・曲名・公開年別に探せる資料集。',
    summary: '各曲解説や検定の根拠として参照した公式インタビューや音楽メディア記事を、媒体名・曲名から横断検索できます。',
  },
];

export const CORNER_BY_ID = new Map<PublicCornerId, PublicCornerMeta>(
  PUBLIC_CORNERS.map((corner) => [corner.id, corner]),
);

export const CORNER_BY_SLUG = new Map<string, PublicCornerMeta>(
  PUBLIC_CORNERS.map((corner) => [corner.slug, corner]),
);

export function tabFromPathname(pathname: string, baseUrl = '/higedanfan/'): PublicCornerId | null {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const relative = pathname.startsWith(normalizedBase)
    ? pathname.slice(normalizedBase.length)
    : pathname.replace(/^\/+/, '');
  const firstSegment = relative.split('/').filter(Boolean)[0] ?? '';
  if (!firstSegment || firstSegment === 'index.html') return null;
  return CORNER_BY_SLUG.get(firstSegment)?.id ?? null;
}

export function cornerUrl(id: PublicCornerId): string {
  const slug = CORNER_BY_ID.get(id)?.slug;
  return slug ? `${SITE_BASE_URL}${slug}/` : SITE_BASE_URL;
}

export function tabPath(tab: string, baseUrl = '/higedanfan/'): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  if (tab === 'home') return base;
  const corner = CORNER_BY_ID.get(tab as PublicCornerId);
  if (corner) return `${base}${corner.slug}/`;
  return `${base}#${tab}`;
}

export function canonicalUrlForTab(tab: string): string {
  return CORNER_BY_ID.has(tab as PublicCornerId)
    ? cornerUrl(tab as PublicCornerId)
    : SITE_BASE_URL;
}

export function isPlainLeftClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented?: boolean;
}): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
