import type { SongItem } from '../../data/higedanData';
import type { ReferenceArticle, ReferenceKind } from '../../data/referenceArticles';
import { songReadings } from '../../data/songReadings';

type SearchableSong = Pick<SongItem, 'id' | 'title'>;

function searchKey(value: string): string {
  return value.normalize('NFKC').toLowerCase()
    .replace(/(\d{4})[年/.-](\d{1,2})[月/.-](\d{1,2})日?/g, (_, year: string, month: string, day: string) => `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`)
    .replace(/[ァ-ヶ]/g, kana => String.fromCharCode(kana.charCodeAt(0) - 0x60))
    .replace(/[\s'‘’".…・!?‐‑–—×/:-]+/g, '');
}

export function referenceKindLabel(kind: ReferenceKind): string {
  return {interview: 'インタビュー', review: 'レビュー・レポート', news: 'ニュース', official: '公式・作品資料', lyrics: '歌詞', video: '映像・対談', score: '楽譜'}[kind];
}

export function referenceDateLabel(article: ReferenceArticle): string {
  if (!article.date) return '公開日未確認';
  const label = {published: '公開', updated: '更新', broadcast: '放送', issued: '発行', released: '資料発売'}[article.dateKind];
  return `${article.date.replaceAll('-', '/')} ${label}`;
}

export function prepareReferenceSearch(query: string, songs: readonly SearchableSong[]) {
  const key = searchKey(query.trim());
  const songsById = new Map(songs.map(song => [song.id, song]));
  const matchesSong = (song: SearchableSong): boolean => Boolean(key) && [song.title, songReadings[song.id] ?? '']
    .some(value => searchKey(value).includes(key));

  return {
    matchesSong,
    matches(article: ReferenceArticle): boolean {
      if (!key) return true;
      const fields = [article.title, article.publisher, article.url, referenceKindLabel(article.kind), referenceDateLabel(article)];
      if (fields.some(value => searchKey(value).includes(key))) return true;
      return article.relatedSongIds.some(id => {
        const song = songsById.get(id);
        return song ? matchesSong(song) : false;
      });
    },
  };
}

export function sortReferenceArticles(articles: readonly ReferenceArticle[], order: 'newest' | 'oldest'): ReferenceArticle[] {
  return [...articles].sort((a, b) => {
    // 日付が不明な資料は、昇順・降順のどちらでも後ろに置く。
    if (!a.date && b.date) return 1;
    if (a.date && !b.date) return -1;
    const dateOrder = (a.date ?? '').localeCompare(b.date ?? '');
    return (order === 'newest' ? -dateOrder : dateOrder) || a.title.localeCompare(b.title, 'ja');
  });
}
