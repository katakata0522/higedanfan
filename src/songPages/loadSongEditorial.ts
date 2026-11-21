import type { SongEditorial } from './editorial/types';

type ShardId = 1 | 2 | 3 | 4 | 5 | 6;

const EDITORIAL_SHARD_BY_ID: Record<string, ShardId> = {
  'pretender': 1,
  'subtitle': 1,
  'mixed-nuts': 1,
  'cry-baby': 1,
  '115man-kilo': 1,
  'no-doubt': 1,
  'stand-by-you': 1,
  'shukumei': 1,
  'i-love': 1,
  'editorial-song': 1,
  'white-noise': 1,
  'tattoo': 1,
  'soulsoup': 1,
  'sharon': 1,
  'same-blue': 1,
  'rashisa': 2,
  'sweet-tweet': 2,
  'koi-no-maenarae': 2,
  'yuugure-zoi': 2,
  'yuki-seku-asa': 2,
  'shihatsu-ga-michibiku': 2,
  'ai-nandaga': 2,
  'parade-indies': 2,
  'darling-indies': 2,
  'clap-clap': 2,
  'coffee-to-syrup': 2,
  'happy-birthday-to-you': 2,
  'koi-no-sarigiwa': 2,
  'zero-no-mamade': 2,
  'nichiyoubi-no-loveletter': 2,
  'whats-going-on': 3,
  'mikansei-na-mamade': 3,
  'knit-no-boushi': 3,
  'yellow-car': 3,
  'hajimari-no-asa': 3,
  'inu-ka-cat-ka': 3,
  'itan-na-star': 3,
  '55-song': 3,
  'rolling-song': 3,
  'equal-song': 3,
  'trailer-song': 3,
  'escapade-song': 3,
  'lady-song': 3,
  'takaga-i-love-you': 3,
  'saredo-hibi-wa': 3,
  'kanousei-song': 4,
  'tell-me-baby': 4,
  'second-line': 4,
  'driver-song': 4,
  'soushisouai-song': 4,
  'brothers-song': 4,
  'hatsumeika-song': 4,
  'yesterday-song': 4,
  'amazing-song': 4,
  'rowan-song': 4,
  'bad-for-me': 4,
  'saigo-no-koiwazurai': 4,
  'vintage-song': 4,
  'fire-ground': 4,
  'tabi-wa-michizure': 4,
  'last-song': 5,
  'travelers-outro': 5,
  'editorial-title-track': 5,
  'filament-song': 5,
  'hello-song': 5,
  'shower-song': 5,
  'midori-no-amayoke': 5,
  'parabola-song': 5,
  'pending-machine': 5,
  'bedroom-talk': 5,
  'laughter-song': 5,
  'universe-song': 5,
  'lost-in-my-room': 5,
  'natsumoyou-no-neko': 5,
  'choral-a-song': 5,
  'hagan-song': 6,
  'finder-song': 6,
  'get-back-to-jinsei': 6,
  'catchball-song': 6,
  'nichijou-song': 6,
  'dakuten-song': 6,
  'anarchy-song': 6,
  'uramitsurami-kiwami': 6,
  'chessboard-song': 6,
  'b-side-blues': 6,
  'fifty-percent': 6,
  'sanitizer': 6,
  'make-me-wonder': 6,
  'elderflower': 6,
  'stardust': 6,
};

export async function loadSongEditorial(songId: string): Promise<SongEditorial | undefined> {
  const shard = EDITORIAL_SHARD_BY_ID[songId];
  switch (shard) {
    case 1:
      return (await import('./editorial/shard1')).editorialShard1[songId];
    case 2:
      return (await import('./editorial/shard2')).editorialShard2[songId];
    case 3:
      return (await import('./editorial/shard3')).editorialShard3[songId];
    case 4:
      return (await import('./editorial/shard4')).editorialShard4[songId];
    case 5:
      return (await import('./editorial/shard5')).editorialShard5[songId];
    case 6:
      return (await import('./editorial/shard6')).editorialShard6[songId];
    default:
      return undefined;
  }
}
