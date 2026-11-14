import type { ActiveFeatureTab } from '../SiteHeader';

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
