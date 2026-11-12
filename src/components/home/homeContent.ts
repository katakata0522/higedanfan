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
      '5つの質問から、今のあなたに合う1曲へ',
      '選ばれた理由を読んで、結果をカードでシェア',
    ],
    ctaLabel: 'マイソング診断をはじめる',
  },
  {
    id: 'discography',
    secondaryId: 'vocal_range',
    stepNum: '02',
    subtitle: '曲の物語から、ゆかりの場所まで',
    title: '楽曲ガイド・音域一覧・聖地マップ',
    description:
      '好きな曲の音や背景を知りたいときに。音域や発売日を比べたり、ゆかりの地を訪ねたりすることもできます。',
    points: [
      '曲の聴きどころや制作の話をたどる',
      '音域や発売日を、出典と一緒に見比べる',
    ],
    ctaLabel: '楽曲ガイドを見る',
    secondaryCtaLabel: '掲載90曲の音域・発売日表へ',
  },
  {
    id: 'setlist',
    secondaryId: 'tour_archive',
    stepNum: '03',
    subtitle: '夢のライブと、忘れられない公演',
    title: 'マイセトリ作成・歴代ツアー記録',
    description:
      'ライブで聴きたい曲を並べて、自分だけのセトリを作ろう。歴代ツアーをたどりながら、参戦や視聴の記録も残せます。',
    points: [
      '本編もアンコールも、好きな曲順で',
      '思い出の公演を資料と一緒に振り返る',
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
    subtitle: '知っている曲から、新しい発見へ',
    title: 'ヒゲダン検定クイズ・参考記事',
    description:
      '初級・中級・上級は各20問。参考記事の一覧では、曲の物語や検定で参照したインタビュー・公式資料を探せます。',
    points: [
      '初級から上級、曲順の並び替えにも挑戦',
      '気になる答えはインタビューや資料へ',
    ],
    ctaLabel: 'ヒゲダン検定に挑戦する',
    secondaryCtaLabel: '参考記事・インタビューへ',
  },
] satisfies HomeFeatureCard[]).filter(card => card.id !== 'community' || PUBLIC_FEATURES.ranking || PUBLIC_FEATURES.reviews);
