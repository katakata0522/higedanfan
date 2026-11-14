import type { ActiveFeatureTab } from '../SiteHeader';

export type HomeStickyNote = {
  id: Exclude<ActiveFeatureTab, 'home'>;
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
    description:
      '今の気分や過ごしたい景色に、ぴったり重なる1曲を。今のあなたにそっと寄り添う一曲を探しに行こう。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#edf7fc',
    tapeBg: '#bce3f8',
    accent: '#1d5a7a',
    pressRot: '1.1deg',
  },
  {
    id: 'discography',
    stepNum: '02',
    title: '楽曲ガイド',
    description:
      '一曲ごとの物語や音の仕掛け、知られざる制作秘話まで。知れば知るほど、いつもの名曲がさらに輝き出す。',
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
    description:
      'あの日の歓声とセットリストが蘇る、髭男が歩いた軌跡。あなたが参戦した思い出のライブも記録に残せます。',
    ctaLabel: 'ひらく ↗',
    noteBg: '#f6eefc',
    tapeBg: '#dfcaf6',
    accent: '#634385',
    pressRot: '-1.1deg',
  },
  {
    id: 'quiz',
    stepNum: '06',
    title: 'Official髭男dism検定',
    description:
      '名曲の裏話やメンバーの歩みまで、思わず語りたくなるドラマが満載。コアな知識と髭男愛を試す問題に挑め！',
    ctaLabel: 'ひらく ↗',
    noteBg: '#eef9f0',
    tapeBg: '#c0e6c7',
    accent: '#265c34',
    pressRot: '-0.9deg',
  },
];
