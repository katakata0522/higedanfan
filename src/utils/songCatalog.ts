import type { SongItem } from '../data/higedanData';

export const ALBUM_CHRONOLOGY_RANK: Record<string, number> = {
  'ラブとピースは君の中': 1,
  'MAN IN THE MIRROR': 2,
  "What's Going On? EP": 3,
  'レポート': 4,
  'エスカパレード': 5,
  Escaparade: 5,
  'Stand By You EP': 6,
  Traveler: 7,
  'HELLO EP': 8,
  Editorial: 9,
  'ミックスナッツ EP': 10,
  Rejoice: 11,
  'Single / 2024-2026 Collection': 12,
  'スターダスト/エルダーフラワー': 13,
};

export const EP_TRACK_ORDER_MAP: Record<string, Record<string, number>> = {
  'Stand By You EP': {
    'stand-by-you': 1,
    'fire-ground': 2,
    'bad-for-me': 3,
  },
  'HELLO EP': {
    'hello-song': 1,
    'parabola-song': 2,
    'laughter-song': 3,
    'natsumoyou-no-neko': 4,
  },
  'ミックスナッツ EP': {
    'mixed-nuts': 1,
    // The EP has the single version; the guide covers the Rejoice recording.
    'choral-a-song': 3,
    'hagan-song': 4,
  },
};

export function songAlbums(song: Pick<SongItem, 'id' | 'album' | 'trackNumber'>) {
  const primary = song.album === 'Escaparade' ? 'エスカパレード' : song.album;
  const releases = [{ album: primary, trackNumber: song.trackNumber }];
  for (const [album, tracks] of Object.entries(EP_TRACK_ORDER_MAP)) {
    if (album !== primary && tracks[song.id] !== undefined) {
      releases.push({ album, trackNumber: tracks[song.id] });
    }
  }
  return releases;
}

export const partialEpCoverage: Record<string, { note: string; source: string }> = {
  'ミックスナッツ EP': {
    note: 'EPの全4曲中、このガイドで紹介するのはM1・M3・M4です。M2「Anarchy」はシングル版です。ガイドには別録音の「Anarchy (Rejoice ver.)」を掲載しています。',
    source: 'https://higedan.com/discography/detail/33/',
  },
  'Stand By You EP': {
    note: 'EPの全4曲中、このガイドで紹介するのはM1〜M3です。M4は「Stand By You」のアコースティック版です。',
    source: 'https://higedan.com/discography/detail/12/',
  },
};

type Credit = { name: string; source: string };
const travelerInterview = 'https://officialhigedandism.ponycanyon.co.jp/interview/index.html';
const editorialInterview = 'https://editorial.ponycanyon.co.jp/interview/';

const songwriterCredits = [
  { ids: ['rowan-song', 'rowan', 'Rowan'], name: '小笹大輔', source: travelerInterview },
  { ids: ['bedroom-talk', 'bedroom-talk-song', 'Bedroom Talk'], name: '小笹大輔', source: editorialInterview },
  { ids: ['tabi-wa-michizure', 'tabi-wa-michizure-song', '旅は道連れ'], name: '楢﨑誠', source: travelerInterview },
  { ids: ['midori-no-amayoke', 'midori-no-ameyoke', 'midori-no-ameyoke-song', 'みどりの雨避け'], name: '楢﨑誠', source: editorialInterview },
  { ids: ['choral-a-song', 'choral-a', 'Choral A'], name: '楢﨑誠', source: 'https://news.radiko.jp/article/station/FM-FUJI/71384/' },
  { ids: ['pretender', 'Pretender'], name: '藤原聡', source: 'https://www.jasrac.or.jp/magazine/jasrac-awards/21/210519.html' },
  { ids: ['filament-song', 'filament', 'フィラメント'], name: '松浦匡希・藤原聡', source: editorialInterview },
];

const creditBySong = new Map<string, Credit>();
for (const credit of songwriterCredits) {
  for (const id of credit.ids) creditBySong.set(id, credit);
}

type SongIdentity = Pick<SongItem, 'id'> & { title?: string };

export function songwriterInfo(song: SongIdentity): Credit | undefined {
  return creditBySong.get(song.id) ?? creditBySong.get(song.title ?? '');
}

export function getSongwriterCredit(song: SongIdentity): string {
  const credit = songwriterInfo(song);
  return credit ? '作詞・作曲：' + credit.name : '作者情報未確認';
}
