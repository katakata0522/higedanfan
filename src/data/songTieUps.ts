import type { SongItem } from './higedanData';
import type recordings from './songEvidence.json';

const TRAVELER = 'https://officialhigedandism.ponycanyon.co.jp/';
const REJOICE = 'https://rejoice.ponycanyon.co.jp/';
const HELLO = 'https://hello-ep.jp/';

export const songTieUps: Partial<Record<keyof typeof recordings, SongItem['tieUps']>> = {
  'pretender': [
    { text: "映画『コンフィデンスマンJP ロマンス編』主題歌", source: TRAVELER },
  ],
  'subtitle': [
    { text: "フジテレビ系木曜劇場『silent』主題歌", source: REJOICE },
  ],
  'mixed-nuts': [
    { text: "TVアニメ『SPY×FAMILY』第1クールオープニング主題歌", source: REJOICE },
  ],
  'cry-baby': [
    { text: "TVアニメ『東京リベンジャーズ』オープニング主題歌", source: "https://tokyo-revengers-anime.com/news/archives/103" },
  ],
  '115man-kilo': [
    { text: "映画『思い、思われ、ふり、ふられ』主題歌", source: "https://higedan.com/news/list/3/6/?page=18#:~:text=115万キロのフィルム" },
    { text: "ローム「electric landscape」篇 CMソング", source: "https://www.rohm.co.jp/news-detail?defaultGroupId=false&news-title=2019-12-25_news_tv-cm" },
    { text: "SUUMO テレビCMソング", source: "https://higedan.com/news/detail/101724" },
  ],
  'no-doubt': [
    { text: "フジテレビ系月9ドラマ『コンフィデンスマンJP』主題歌", source: "https://www.fujitv.co.jp/confidenceman_jp/cast-staff/index.html" },
  ],
  'stand-by-you': [
    { text: "Apple Music CMソング", source: "https://realsound.jp/2021/08/post-830911_2.html" },
  ],
  'shukumei': [
    { text: "2019 ABC夏の高校野球応援ソング／「熱闘甲子園」テーマソング", source: TRAVELER },
  ],
  'i-love': [
    { text: "TBS系火曜ドラマ『恋はつづくよどこまでも』主題歌", source: "https://www.tbs.co.jp/koitsudu_tbs/caststaff/" },
  ],
  'editorial-song': [
    { text: "Apple Music CMソング", source: "https://www.oricon.co.jp/news/2203165/full/" },
  ],
  'white-noise': [
    { text: "TVアニメ『東京リベンジャーズ 聖夜決戦編』オープニング主題歌", source: REJOICE },
  ],
  'tattoo': [
    { text: "TBS系金曜ドラマ『ペンディングトレイン―8時23分、明日 君と』主題歌", source: REJOICE },
  ],
  'soulsoup': [
    { text: "『劇場版 SPY×FAMILY CODE: White』主題歌", source: REJOICE },
  ],
  'sharon': [
    { text: "カンテレ・フジテレビ系月10ドラマ『マウンテンドクター』主題歌", source: REJOICE },
  ],
  'same-blue': [
    { text: "TVアニメ『アオのハコ』第1クールオープニング主題歌", source: "https://aonohako-anime.com/music/opening.html" },
  ],
  'rashisa': [
    { text: "劇場アニメ『ひゃくえむ。』主題歌", source: "https://hyakuemu-anime.com/info/91/" },
  ],
  'driver-song': [
    { text: "メ〜テレ『デルサタ』テーマソング", source: "https://www.lastrum.co.jp/news/10521/" },
  ],
  'yesterday-song': [
    { text: "劇場アニメ『HELLO WORLD』主題歌", source: TRAVELER },
  ],
  'bad-for-me': [
    { text: "真夜中ドラマJ『グッド・バイ』主題歌", source: TRAVELER },
  ],
  'saigo-no-koiwazurai': [
    { text: "カンテレ・フジテレビ系ドラマ『あと3回、君に会える』主題歌", source: "https://news.ponycanyon.co.jp/2020/03/37668" },
  ],
  'vintage-song': [
    { text: "FOD・フジテレビ系『あいのり：African Journey』主題歌", source: TRAVELER },
  ],
  'fire-ground': [
    { text: "TVアニメ『火ノ丸相撲』OPテーマ", source: TRAVELER },
  ],
  'tabi-wa-michizure': [
    { text: "スズキ『スイフト』CMソング", source: TRAVELER },
  ],
  'last-song': [
    { text: "カンテレ・フジテレビ系ドラマ『あと3回、君に会える』挿入歌（RAG Musicの楽曲解説による）", source: "https://www.ragnet.co.jp/ranking-higedan-graduation-songs?disp=more#:~:text=ラストソング" },
  ],
  'filament-song': [
    { text: "第33回出雲全日本大学選抜駅伝（出雲駅伝）中継テーマソング", source: "https://news.ponycanyon.co.jp/2021/10/60674" },
  ],
  'hello-song': [
    { text: "フジテレビ系『めざましテレビ』テーマ曲", source: HELLO },
  ],
  'parabola-song': [
    { text: "アサヒ飲料『カルピスウォーター』CMソング", source: HELLO },
  ],
  'laughter-song': [
    { text: "映画『コンフィデンスマンJP プリンセス編』主題歌", source: HELLO },
  ],
  'universe-song': [
    { text: "『映画ドラえもん のび太の宇宙小戦争 2021』主題歌", source: "https://news.ponycanyon.co.jp/2021/01/46802" },
  ],
  'choral-a-song': [
    { text: "映画『異動辞令は音楽隊！』主題歌", source: "https://news.ponycanyon.co.jp/2022/06/71765" },
  ],
  'nichijou-song': [
    { text: "日本テレビ『news zero』テーマ曲", source: REJOICE },
  ],
  'anarchy-song': [
    { text: "映画『コンフィデンスマンJP 英雄編』主題歌（シングル版）", source: REJOICE },
  ],
  'chessboard-song': [
    { text: "第90回NHK全国学校音楽コンクール（Nコン）中学校の部 課題曲", source: REJOICE },
  ],
  'b-side-blues': [
    { text: "キリン『午後の紅茶』CMソング", source: REJOICE },
  ],
  'fifty-percent': [
    { text: "映画『はたらく細胞』主題歌", source: "https://www.warnerbros.co.jp/home_entertainment/hfozviq72ubt/" },
  ],
  'make-me-wonder': [
    { text: "TVアニメ『ダーウィン事変』主題歌", source: "https://higedan.com/news/detail/101536" },
  ],
  'elderflower': [
    { text: "映画『人はなぜラブレターを書くのか』主題歌", source: "https://higedan.com/news/detail/101588" },
  ],
  'stardust': [
    { text: "TBS系日曜劇場『GIFT』主題歌", source: "https://higedan.com/news/detail/101603" },
  ],
};
