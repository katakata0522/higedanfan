import { catalogEntries } from '../data/catalogEntries';
import { songAlbums } from '../utils/songCatalog';

type RelatedSong = { id: string; title: string; reason: string };

// These links have a specific connection that is more useful than album proximity.
const editorialConnections: Readonly<Record<string, readonly { id: string; reason: string }[]>> = {
  pretender: [{ id: 'no-doubt', reason: '同じ『コンフィデンスマンJP』シリーズの主題歌' }],
  'no-doubt': [{ id: 'pretender', reason: '同じ『コンフィデンスマンJP』シリーズの主題歌' }],
  '115man-kilo': [{ id: 'trailer-song', reason: 'アルバムをまたぐ、映画の予告編と本編のつながり' }],
  'trailer-song': [{ id: '115man-kilo', reason: '次のアルバムの冒頭へつながる、映画のモチーフ' }],
  'coffee-to-syrup': [{ id: 'second-line', reason: '「コーヒーとシロップ」の人物を思い描いて作られた曲' }],
  'second-line': [{ id: 'coffee-to-syrup', reason: 'この曲の物語につながる、先に発表された楽曲' }],
  'cry-baby': [{ id: 'white-noise', reason: '同じアニメ『東京リベンジャーズ』の主題歌' }],
  'white-noise': [{ id: 'cry-baby', reason: '同じアニメ『東京リベンジャーズ』の主題歌' }],
};

// Only videos whose title and official channel were checked are included.
export const officialVideos: Readonly<Record<string, string>> = {
  pretender: 'https://www.youtube.com/watch?v=TQ8WlA2GXbk',
  subtitle: 'https://www.youtube.com/watch?v=hN5MBlGv2Ac',
  'mixed-nuts': 'https://www.youtube.com/watch?v=CbH2F0kXgTY',
  'cry-baby': 'https://www.youtube.com/watch?v=O1bhZgkC4Gw',
  'no-doubt': 'https://www.youtube.com/watch?v=EHw005ZqCXk',
  'stand-by-you': 'https://www.youtube.com/watch?v=22mOCjkwQjM',
  shukumei: 'https://www.youtube.com/watch?v=-kgOFJG881I',
  'i-love': 'https://www.youtube.com/watch?v=bt8wNQJaKAk',
  'white-noise': 'https://www.youtube.com/watch?v=_ciQX22n9NE',
  tattoo: 'https://www.youtube.com/watch?v=oLrp9uTa9gw',
  soulsoup: 'https://www.youtube.com/watch?v=-H_k7iwrWVY',
  sharon: 'https://www.youtube.com/watch?v=Ssj-NhrKOdg',
  'same-blue': 'https://www.youtube.com/watch?v=A7cp6OVa0Qc',
  rashisa: 'https://www.youtube.com/watch?v=keOnleW2eak',
  'sweet-tweet': 'https://www.youtube.com/watch?v=qrtKLNTB71c',
  'koi-no-maenarae': 'https://www.youtube.com/watch?v=n0e0y01w92A',
  'shihatsu-ga-michibiku': 'https://www.youtube.com/watch?v=0M-6ImZ9FSk',
  'ai-nandaga': 'https://www.youtube.com/watch?v=i68HdrqOPcE',
  'coffee-to-syrup': 'https://www.youtube.com/watch?v=Vho5jBUfR28',
  'whats-going-on': 'https://www.youtube.com/watch?v=PB8dUVLPnuo',
  'inu-ka-cat-ka': 'https://www.youtube.com/watch?v=IzyrINr2Xj4',
  'lady-song': 'https://www.youtube.com/watch?v=0nzgi6dz8VY',
  'tell-me-baby': 'https://www.youtube.com/watch?v=3IDvi4buNdk',
  'brothers-song': 'https://www.youtube.com/watch?v=1fO0mY5vLA8',
  'vintage-song': 'https://www.youtube.com/watch?v=cMLTX2FClxw',
  'fire-ground': 'https://www.youtube.com/watch?v=sem3UU-EQJs',
  'editorial-song': 'https://www.youtube.com/watch?v=PZX2npwj6jY',
  'hello-song': 'https://www.youtube.com/watch?v=p1qM75a9FeE',
  'parabola-song': 'https://www.youtube.com/watch?v=pkoxFpmiCWo',
  'pending-machine': 'https://www.youtube.com/watch?v=4BVd6TK8_EQ',
  'laughter-song': 'https://www.youtube.com/watch?v=kff_DXor7jc',
  'universe-song': 'https://www.youtube.com/watch?v=6lnS-8FVod4',
  'choral-a-song': 'https://www.youtube.com/watch?v=I8fxhn_l08g',
  'nichijou-song': 'https://www.youtube.com/watch?v=LbtQM793jn8',
  'chessboard-song': 'https://www.youtube.com/watch?v=qo55wGLXcOQ',
  'fifty-percent': 'https://www.youtube.com/watch?v=Vv2n31gL85I',
  sanitizer: 'https://www.youtube.com/watch?v=t-E9h7fJPX4',
  'make-me-wonder': 'https://www.youtube.com/watch?v=LU7xD_yx43c',
  elderflower: 'https://www.youtube.com/watch?v=upLTD7DFtng',
  stardust: 'https://www.youtube.com/watch?v=O4fFTWQzXVE',
};

export function relatedSongs(songId: string): RelatedSong[] {
  const song = catalogEntries.find(item => item.id === songId);
  if (!song) return [];
  const selected: RelatedSong[] = [];
  const add = (id: string, reason: string) => {
    const target = catalogEntries.find(item => item.id === id);
    if (target && target.id !== song.id && !selected.some(item => item.id === id)) {
      selected.push({ id: target.id, title: target.title, reason });
    }
  };
  for (const item of editorialConnections[song.id] ?? []) add(item.id, item.reason);
  for (const release of songAlbums(song)) {
    if (selected.length >= 2) break;
    const isSinglesCollection = release.album.startsWith('Single /');
    const siblings = catalogEntries.flatMap(item => {
      const matchingRelease = songAlbums(item).find(candidate => candidate.album === release.album);
      return item.id === song.id || !matchingRelease ? [] : [{ item, track: matchingRelease.trackNumber }];
    }).sort((a, b) => Math.abs((a.track ?? a.item.guideOrder) - (release.trackNumber ?? song.guideOrder))
      - Math.abs((b.track ?? b.item.guideOrder) - (release.trackNumber ?? song.guideOrder))
      || a.item.guideOrder - b.item.guideOrder);
    for (const sibling of siblings) {
      if (selected.length >= 2) break;
      add(sibling.item.id, isSinglesCollection ? '2024〜2026年に発表された配信曲' : `『${release.album}』の収録曲`);
    }
  }
  return selected;
}
