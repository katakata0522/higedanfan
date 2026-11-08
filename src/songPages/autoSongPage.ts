import { catalogEntries } from '../data/catalogEntries';
import { songEvidence } from '../data/fullCatalogSongs';
import { songTieUps } from '../data/songTieUps';
import type { EditorialSongPageData } from './EditorialSongPageData';

// 個別に取材・執筆したページ以外は、確認済みの台帳だけから共通紙面を組み立てる。
// 歌詞、曲の意味、演奏の印象を自動的に推測しない。
export function autoSongPage(id: string): EditorialSongPageData {
  const song = catalogEntries.find(entry => entry.id === id);
  const fact = songEvidence[id as keyof typeof songEvidence];
  if (!song || !fact) throw new Error(`楽曲データが見つかりません: ${id}`);

  const [year, month, day] = fact.release.split('.');
  const release = `${year}年${Number(month)}月${Number(day)}日`;
  const tieUps = songTieUps[song.id] ?? [];
  const overview = [
    id === 'anarchy-song'
      ? `『${fact.album}』に収録された「${fact.recording}」は${release}に配信されています。`
      : `「${fact.recording}」は${release}に配信された楽曲です。このページでは『${fact.album}』収録の音源を取り上げています。`,
    ...tieUps.map(item => {
      if (id === 'anarchy-song') {
        return `${item.text.replace('（シングル版）', '')}に起用されたのはシングル版です。掲載音源とは別の録音です。`;
      }
      if (id === 'last-song') {
        return `RAG Musicの楽曲解説では、${item.text.replace('（RAG Musicの楽曲解説による）', '')}と紹介されています。`;
      }
      return `${item.text}として発表されています。`;
    }),
  ];

  return {
    id,
    artwork: { theme: song.jacketImage, alt: `${fact.recording}の当サイト制作の抽象的なイメージ図柄` },
    feature: { text: fact.style, credit: '— 参考資料をもとに当サイトが要約した曲調' },
    overview,
    albumTrack: song.album.startsWith('Single /') ? undefined : song.trackNumber,
    sources: [
      { label: '公式作品情報', purpose: '配信日・収録作品', evidence: 'cdSource' },
      { label: 'Apple Music の掲載音源', purpose: '演奏時間', evidence: 'apple' },
      { label: '曲調の参考資料', purpose: '紙面上の曲調表現', evidence: 'styleSource' },
      { label: '歌の音域の参考資料', purpose: '地声・裏声の音域', evidence: 'rangeSource' },
      { label: 'テンポの参考資料', purpose: 'BPM', evidence: 'tempoSource' },
      ...(id === '115man-kilo' ? [
        { label: '別のテンポ表記', purpose: '約194 BPM（倍取り）', url: 'https://khufrudamonotes.com/officialhigedism-data' },
        { label: 'コード譜のテンポ表記', purpose: '約97 BPM', url: 'https://ja.chordwiki.org/wiki/115%E4%B8%87%E3%82%AD%E3%83%AD%E3%81%AE%E3%83%95%E3%82%A3%E3%83%AB%E3%83%A0' },
      ] : []),
      ...tieUps.map(item => ({ label: 'タイアップの発表', purpose: item.text, url: item.source })),
    ],
    sourceCaveat: id === '115man-kilo'
      ? 'テンポは四分音符を約97 BPMとするドラム譜・コード譜に合わせました。約194 BPMは倍取りの表記です。これは当サイトが採用した数え方で、公式の指定テンポではありません。音域も採譜によって異なる場合があります。'
      : '曲調は参考資料からの要約です。音域とテンポは採譜・計測方法で表記が異なる場合があります。',
  };
}
