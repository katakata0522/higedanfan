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

export type HomeStickyNote = {
  id: Exclude<ActiveFeatureTab, 'home'>;
  secondaryId?: Exclude<ActiveFeatureTab, 'home'>;
  secondaryCtaLabel?: string;
  stepNum: string;
  title: string;
  description: string;
  ctaLabel: string;
  noteBg: string;
  tapeBg: string;
  accent: string;
  pressRot: string;
};

export const HOME_STICKY_NOTES: HomeStickyNote[] = [
  {
    id: 'mood',
    stepNum: '01',
    title: 'マイソング診断',
    description: '今の気分や過ごしたい景色に、ぴったり重なる1曲を探しに行こう。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#edf7fc',
    tapeBg: '#bce3f8',
    accent: '#1d5a7a',
    pressRot: '1.1deg',
  },
  {
    id: 'discography',
    secondaryId: 'vocal_range',
    secondaryCtaLabel: '音域・発売日表 ↗',
    stepNum: '02',
    title: '楽曲ガイド（全90曲）',
    description: '楽曲ごとの背景や音の秘密まで。知れば知るほど、いつもの名曲がさらに輝きだす。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#fffde6',
    tapeBg: '#f6e39c',
    accent: '#7a5b14',
    pressRot: '-1.1deg',
  },
  {
    id: 'setlist',
    stepNum: '03',
    title: 'マイセトリ作成',
    description: '1曲目の幕開けからアンコールの余韻まで。心の中で温めていた「夢のライブ」を、その手で組み上げよう。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#fef2f0',
    tapeBg: '#f5c6be',
    accent: '#8d3b2b',
    pressRot: '1deg',
  },
  {
    id: 'sacred_map',
    stepNum: '04',
    title: '聖地巡礼マップ',
    description: '山陰の原点から、MVのワンシーンを刻んだあの場所まで。バンドゆかりの地をめぐる聖地巡礼ガイド。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#fbf2e8',
    tapeBg: '#f3d2a8',
    accent: '#7c4d18',
    pressRot: '1.2deg',
  },
  {
    id: 'tour_archive',
    stepNum: '05',
    title: '歴代ツアー記録',
    description: 'あの日の歓声とセットリストがよみがえる、これまでのツアーと歩みをたどる記録。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#f6eefc',
    tapeBg: '#dfcaf6',
    accent: '#634385',
    pressRot: '-1.1deg',
  },
  {
    id: 'quiz',
    secondaryId: 'quiz_archive',
    secondaryCtaLabel: '参考記事・資料 ↗',
    stepNum: '06',
    title: 'Official髭男dism検定',
    description: '名曲の裏話やメンバーの歩みまで、コアな知識やヒゲダン愛を試す問題に挑め！',
    ctaLabel: 'ひらく ↗',
    noteBg: '#eef9f0',
    tapeBg: '#c0e6c7',
    accent: '#265c34',
    pressRot: '-0.9deg',
  },
];

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
    subtitle: '名曲の裏話やメンバーの歩みへ',
    title: 'Official髭男dism検定・参考記事',
    description:
      '楽曲エピソードやインタビューにまつわる問題に挑めます。参考記事の一覧では、検定や曲ガイドで参照した公式資料もたどれます。',
    points: [
      '気分に合わせて初級・中級・上級に挑戦',
      '気になる答えはインタビューや資料へ',
    ],
    ctaLabel: 'Official髭男dism検定に挑戦する',
    secondaryCtaLabel: '参考記事・インタビューへ',
  },
] satisfies HomeFeatureCard[]).filter(card => card.id !== 'community' || PUBLIC_FEATURES.ranking || PUBLIC_FEATURES.reviews);
