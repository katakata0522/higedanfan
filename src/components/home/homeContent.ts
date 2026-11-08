import type { ActiveFeatureTab } from '../SiteHeader';
import { PUBLIC_FEATURES } from '../../config/publicFeatures';
import {
  REJOICE_IMAGE_PATH,
  EDITORIAL_IMAGE_PATH,
  TRAVELER_IMAGE_PATH,
  SAME_BLUE_IMAGE_PATH,
  type EraTag,
} from '../../data/higedanData';

export const HERO_JACKET_SHOWCASE: {
  src: string;
  label: string;
  year: string;
  era: EraTag;
}[] = [
  { src: REJOICE_IMAGE_PATH, label: 'Rejoice', year: '2024', era: 'rejoice' },
  { src: EDITORIAL_IMAGE_PATH, label: 'Editorial', year: '2021', era: 'editorial' },
  { src: TRAVELER_IMAGE_PATH, label: 'Traveler', year: '2019', era: 'traveler' },
  {
    src: SAME_BLUE_IMAGE_PATH,
    label: 'Same Blue / らしさ',
    year: '2024–2025',
    era: 'latest_2025_2026',
  },
];

type HomeFeatureCard = {
  id: Exclude<ActiveFeatureTab, 'home'>;
  secondaryId?: Exclude<ActiveFeatureTab, 'home'>;
  stepNum: string;
  subtitle: string;
  title: string;
  description: string;
  points: string[];
  ctaLabel: string;
  secondaryCtaLabel?: string;
};

export const HOME_FEATURE_CARDS: HomeFeatureCard[] = ([
  {
    id: 'mood',
    stepNum: '01',
    subtitle: '今の気分から1曲を見つける',
    title: 'マイソング診断',
    description:
      '今の気分や聴きたい場面、好みの音から、今日の1曲を探してみませんか。',
    points: [
      '5つの質問に答えると、条件に合う曲を紹介',
      '診断結果のSNS風シェアカード生成＆理由解説付き',
    ],
    ctaLabel: 'マイソング診断をはじめる',
  },
  {
    id: 'discography',
    secondaryId: 'vocal_range',
    stepNum: '02',
    subtitle: '発売順・ガイド順・音域分析・ゆかりの地',
    title: '楽曲ガイド・音域一覧・聖地マップ',
    description:
      '掲載90曲の曲調や長さ、地声・裏声の音域を資料と一緒にたどれます。松江・米子・横浜のゆかりの地も地図でどうぞ。',
    points: [
      '地声の最低音・最高音と裏声の最高音を採譜資料と一緒に',
      '配信サービス掲載日と収録作品のCD発売日を出典付きで',
    ],
    ctaLabel: '楽曲ガイドを見る',
    secondaryCtaLabel: '掲載90曲の音域・発売日表へ',
  },
  {
    id: 'setlist',
    secondaryId: 'tour_archive',
    stepNum: '03',
    subtitle: 'ライブ曲順シミュレーション＆参戦記録',
    title: 'マイセトリ作成・歴代ツアー記録',
    description:
      'ライブで聴きたい曲を並べて、自分だけのセトリを作ろう。歴代ツアーをたどりながら、参戦や視聴の記録も残せます。',
    points: [
      '本編・アンコールを編集して、収録音源の合計時間を確認',
      '公演日・会場や掲載セトリの資料と、ツアーごとの参戦記録',
    ],
    ctaLabel: 'マイセトリを作る',
    secondaryCtaLabel: '歴代ツアー記録へ',
  },
  {
    id: 'community',
    secondaryId: 'fan_reviews',
    stepNum: '04',
    subtitle: '自分の推し曲投票と感想ノート',
    title: '人気曲ランキング投票・感想ノート',
    description:
      '「歌詞が刺さる曲」「ライブで盛り上がる曲」など4部門の人気投票と、自分のブラウザに好きな曲やライブの感想を残すノート。',
    points: [
      '4つのテーマから1クリックで推し曲に投票',
      '自分の感想や思い出を書けるノート',
    ],
    ctaLabel: '人気曲投票を見る',
    secondaryCtaLabel: '感想・考察ノートへ',
  },
  {
    id: 'quiz',
    secondaryId: 'quiz_archive',
    stepNum: '04',
    subtitle: '各レベル20問（全60問）＆並び替え・データ検証クイズ',
    title: 'ヒゲダン検定クイズ・出典＆トリビア図鑑',
    description:
      '初級・中級・上級は各20問。答え合わせのあとは、作品情報やインタビュー、使用した音源もたどれます。',
    points: [
      '各20問の3コースと、並び替え特訓',
      '全60問の問題と出典をキーワードや媒体から探せる',
    ],
    ctaLabel: 'ヒゲダン検定に挑戦する',
    secondaryCtaLabel: '出典記事＆トリビア図鑑へ',
  },
] satisfies HomeFeatureCard[]).filter(card => card.id !== 'community' || PUBLIC_FEATURES.ranking || PUBLIC_FEATURES.reviews);
