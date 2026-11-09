export type MoodTag = 'push_back' | 'heartbreak_night' | 'euphoric_drive' | 'deep_lyric';
export type SituationTag = 'morning_commute' | 'late_night_alone' | 'live_warmup' | 'weekend_walk';
export type SoundTag = 'piano_pop' | 'brass_funk' | 'emotional_ballad' | 'stadium_rock';
export type EraTag = 'indies_escaparade' | 'traveler' | 'editorial' | 'rejoice' | 'latest_2025_2026';

export interface VocalRangeInfo {
  lowestNote: string; // e.g. 'mid1F (F3)'
  highestChestNote: string; // e.g. 'hiC# (C#5)'
  highestFalsettoNote: string; // e.g. 'hiE (E5)'
  chestSemitoneScore: number; // MIDI note index of highest chest note for sorting (e.g. C5=72, C#5=73, D5=74, D#5=75, E5=76)
  rangeSpanSemitones: number; // total vocal span in semitones
  highNoteSection: string; // Copyright-safe section + timestamp description
  lowNoteSection: string; // Copyright-safe section + timestamp description
  singingAdvice: string; // One-sentence vocal / karaoke advice
}

export interface SongItem {
  id: string;
  guideOrder: number;
  trackNumber?: number;
  title: string;
  englishSub: string;
  album: string;
  era: EraTag;
  releaseDate: string;
  durationSec: number; // e.g. 326 for 5:26
  bpm: number;
  keyChanges: number | null;
  energyLevel: number; // 1 to 10
  moods: MoodTag[];
  situations: SituationTag[];
  sound: SoundTag;
  tieUp: string;
  tieUps: { text: string; source: string }[];
  releaseNote?: string;
  iconicLyricQuote: string;
  musicalHighlight: string;
  linerNotes: string;
  lyricAnalysis: string;
  liveArrangementNote: string;
  vocalRange: VocalRangeInfo;
  jacketColor: string;
  jacketImage: string;
  votes: {
    overall: number;
    lyric: number;
    live: number;
    hiddenGem: number;
  };
  isHiddenGem?: boolean;
}

export type SacredSpotCategory = 'MVロケ地' | 'メンバーの思い出' | 'メンバーのおすすめ' | 'ライブ会場' | '街とヒゲダン';

export interface SacredSpot {
  id: string;
  name: string;
  area: string;
  categories: SacredSpotCategory[];
  categoryLabel?: string;
  // areaは広域の目安、noneは地図での訪問案内をしない場所。
  mapScope?: 'area' | 'none';
  mapAreaNote?: string;
  relatedSong: string;
  relatedSongLabel?: string;
  addressHint: string;
  description: string;
  fanTip: string;
  source: string;
  historySource?: string;
  historySourceLabel?: string;
  additionalSources?: { label: string; url: string }[];
}

export interface HistoricalSacredSpot {
  id: string;
  name: string;
  area: string;
  categories: SacredSpotCategory[];
  status: string;
  description: string;
  sources: { label: string; url: string }[];
}

export interface TourArchive {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  tourTitle: string;
  crossCheckUrl: string;
  officialSourceUrl?: string;
  events: {
    date: string;
    venue: string;
    liveRepoUrl: string;
    liveRepoHasSetlist: boolean;
    crossCheckSetlistUrl?: string;
  }[];
}

export interface FanReview {
  id: string;
  author: string;
  fanTenure: string;
  songId: string;
  category: '歌詞考察' | 'ライブ体験' | '楽曲アレンジ' | '人生の支え';
  title: string;
  comment: string;
  postedAt: string;
  likes: number;
}

export { QUIZ_QUESTIONS, type QuizQuestion, type QuizSourceItem } from './quizData';

export const HERO_IMAGE_PATH = '/images/hero_magazine_collage_1793849692931.jpg';
export const REJOICE_IMAGE_PATH = '/images/album_art_rejoice_vibe_1793849695153.jpg';
export const EDITORIAL_IMAGE_PATH = '/images/album_art_editorial_vibe_1793849696589.jpg';
export const TRAVELER_IMAGE_PATH = '/images/album_art_traveler_vibe_1793854124340.jpg';
export const SAME_BLUE_IMAGE_PATH = '/images/album_art_same_blue_vibe_1793854124064.jpg';
export const MATSUE_IMAGE_PATH = '/images/sacred_matsue_sunset_1793849698665.jpg';
export const STADIUM_IMAGE_PATH = '/images/live_stadium_confetti_1793849699286.jpg';

export { verifiedSongs as HIGEDAN_SONGS } from './fullCatalogSongs';

export const SACRED_SPOTS: SacredSpot[] = [
  {
    "id": "spot-shinji-lake",
    "name": "宍道湖夕日スポット（とるぱ）",
    "area": "島根・松江",
    "categories": ["メンバーの思い出"],
    "relatedSong": "夕暮れ沿い / 115万キロのフィルム",
    "addressHint": "島根県松江市袖師町",
    "description": "藤原聡は、松江のライブハウス近くから眺めた宍道湖の夕日を思い出として語っています。ここは松江観光協会が紹介する湖畔の夕日スポットです。",
    "fanTip": "湖畔の歩道とテラスから嫁ヶ島を望めます。ここが当時眺めた場所そのものかどうかは確認できていません。",
    "source": "https://www.kankou-matsue.jp/omoshiro/sunset/264",
    "historySource": "https://www.diskgarage.com/digaonline/pleasure/55307"
  },
  {
    "id": "spot-matsue-canova",
    "name": "松江 AZTiC canova",
    "area": "島根・松江",
    "categories": ["メンバーの思い出", "ライブ会場"],
    "relatedSong": "愛なんだが… / 恋の前ならえ",
    "addressHint": "島根県松江市嫁島町13-25",
    "description": "藤原聡が地元での活動拠点として挙げたライブハウス。リハーサルを終えて外に出ると、宍道湖に沈む夕日が見えたと振り返っています。",
    "fanTip": "営業・公演予定は会場の案内を確認してください。",
    "source": "https://aztic.net/canova/",
    "historySource": "https://www.diskgarage.com/digaonline/pleasure/55307"
  },
  {
    "id": "spot-matsue-b1-current",
    "name": "松江B1（現在の会場）",
    "area": "島根・松江",
    "categories": ["ライブ会場", "メンバーの思い出"],
    "categoryLabel": "移転後のライブ会場",
    "relatedSong": "",
    "addressHint": "島根県松江市寺町198-57 ボートピア松江ビル地下1階",
    "description": "小笹大輔が地元の仲間と活動し、スタッフも務めたと振り返るライブハウス。松江B1は2015年に現在の場所へ移転しました。",
    "fanTip": "2012年の初ライブの会場として記録されているB1は移転前の場所です。対談の出来事が移転前後どちらかは確認できていません。公演・利用の予定は会場の案内をご確認ください。",
    "source": "https://eplus.jp/sf/venue/6900040",
    "historySource": "https://blog.j-wave.co.jp/blog/kingsplace/meeting/2.html",
    "historySourceLabel": "小笹さんと石原慎也さんの対談（2021年10月7日）",
    "additionalSources": [{"label": "会場の移転について", "url": "https://www.livewalker.com/web/detail/7691"}]
  },
  {
    "id": "spot-sound-ace-wada",
    "name": "サウンドエース和田",
    "area": "島根・松江",
    "categories": ["街とヒゲダン"],
    "categoryLabel": "ファンの訪問記",
    "relatedSong": "",
    "addressHint": "島根県松江市内中原町176",
    "description": "松江の音楽教室・スタジオ。2022年のファンの訪問記では、ヒゲダンが練習に利用した場所として紹介されています。利用時期などの詳しい裏付けは確認できていません。",
    "fanTip": "スタジオや音楽教室は通常の利用者のための施設です。利用方法や見学の可否は施設の案内をご確認ください。",
    "source": "https://soundacewada.jp/company.html",
    "historySource": "https://lovely088.hatenablog.com/entry/higedan_2",
    "historySourceLabel": "2022年のファンの訪問記",
    "additionalSources": [{"label": "スタジオの利用案内", "url": "https://soundacewada.jp/musicstudio.html"}]
  },
  {
    "id": "spot-shimane-univ",
    "name": "島根大学 松江キャンパス",
    "area": "島根・松江",
    "categories": ["メンバーの思い出"],
    "relatedSong": "異端なスター / 犬かキャットかで死ぬまで喧嘩しよう！",
    "addressHint": "島根県松江市西川津町1060",
    "description": "島根大学の軽音楽部は結成のきっかけの一つ。メンバー全員が同じ大学の出身というわけではありません。",
    "fanTip": "授業や研究が行われる場所です。訪問や見学の際は事前に大学の最新案内を確認し、大学の方々の活動に配慮しましょう。",
    "source": "https://www.shimane-u.ac.jp/campus_maps/map_matsue.html",
    "historySource": "https://guide.line.me/ja/features-and-columns/interview001.html",
    "additionalSources": [
      {"label": "結成についての本人の話", "url": "https://www.j-wave.co.jp/original/tokiohot100/guest_past/past_20161106.htm"},
      {"label": "大学公式キャンパスツアー", "url": "https://museum.shimane-u.ac.jp/campustour.html"},
      {"label": "学外者向けの案内（2022年当時）", "url": "https://www.shimane-u.ac.jp/docs/2020080500038/"}
    ]
  },
  {
    "id": "spot-yonago-laughs",
    "name": "米子 AZTiC laughs",
    "area": "鳥取・米子",
    "categories": ["メンバーの思い出", "ライブ会場"],
    "relatedSong": "日曜日のラブレター / コーヒーとシロップ",
    "addressHint": "鳥取県米子市道笑町1丁目3 BMEビル1階",
    "description": "前身は、2006年に移転した米子ベリエ。藤原聡は中学生の頃、ベリエで初めてライブハウスの音楽に触れたと語っています。後にヒゲダンも、この会場でツアー公演を行いました。",
    "fanTip": "藤原さんが当時訪れたのが移転前後のどちらかは確認できていません。公演や営業の予定は会場の案内をご確認ください。",
    "source": "https://aztic.net/laughs/",
    "historySource": "https://www.diskgarage.com/digaonline/pleasure/53833",
    "additionalSources": [
      {"label": "ベリエの移転について", "url": "https://camp-fire.jp/projects/409283/view"},
      {"label": "2018年のツアー日程", "url": "https://www.lastrum.co.jp/news/10842/"}
    ]
  },
  {
    "id": "spot-nissan-stadium",
    "name": "日産スタジアム",
    "area": "横浜・スタジアム",
    "categories": ["ライブ会場"],
    "relatedSong": "Sharon / SOULSOUP / Pretender",
    "addressHint": "神奈川県横浜市港北区小机町3300",
    "description": "LIVE at STADIUM 2025の横浜会場。2025年5月31日と6月1日に公演が組まれました。",
    "fanTip": "横浜スタジアムとは別の会場です。",
    "source": "https://www.nissan-stadium.jp/access/",
    "historySource": "https://event.higedan.com/feature/stadium_2025"
  },
  {
    "id": "spot-k-arena",
    "name": "Kアリーナ横浜",
    "area": "横浜・スタジアム",
    "categories": ["ライブ会場"],
    "relatedSong": "Subtitle / Same Blue / ミックスナッツ",
    "addressHint": "神奈川県横浜市西区みなとみらい6-2-14",
    "description": "2026年7月25日・26日に行われたone-man tour 2026の横浜会場。",
    "fanTip": "公演日の入退場ルートは施設公式サイトに掲載されています。",
    "source": "https://k-arena.com/access/",
    "historySource": "https://event.higedan.com/feature/zepp2025_hall2026"
  },
  {
    "id": "spot-matsue-castle",
    "name": "松江城",
    "area": "島根・松江",
    "categories": ["メンバーの思い出"],
    "relatedSong": "",
    "addressHint": "島根県松江市殿町1-5",
    "description": "藤原聡が、リハーサルの後にメンバーと散歩した思い出を語った場所。四季の景色とともに、バンドの絆を深めた場所として紹介しています。",
    "fanTip": "天守の入場時間や料金は、訪問前に公式案内をご確認ください。",
    "source": "https://www.matsue-castle.jp/",
    "historySource": "https://www.diskgarage.com/digaonline/pleasure/55307"
  },
  {
    "id": "spot-karakoro-area",
    "name": "京店カラコロ広場",
    "area": "島根・松江",
    "categories": ["ライブ会場"],
    "categoryLabel": "ライブ会場の候補",
    "mapScope": "area",
    "mapAreaNote": "地図はカラコロ広場周辺の目安で、当日の詳しい演奏位置を示すものではありません。",
    "relatedSong": "",
    "addressHint": "島根県松江市末次本町110",
    "description": "2015年のフリーライブツアーでは、松江の「カラコロ工房」の24時間テレビ会場が案内されました。近くのカラコロ広場での演奏として紹介するファンの記録もあります。",
    "fanTip": "カラコロ工房と広場は橋を挟んだ別の場所です。当日の詳しい演奏位置は確認できていません。地図は広場周辺の目安です。",
    "source": "https://www.city.matsue.lg.jp/sangyo_business/shiteikanrishaseido/shiteikanrishakobonoshirase/4/7457.html",
    "historySource": "https://rockinon.com/news/detail/128612",
    "historySourceLabel": "2015年のライブ案内",
    "additionalSources": [{"label": "広場を紹介したファンの記録", "url": "https://lovely088.hatenablog.com/entry/higedan"}]
  },
  {
    "id": "spot-yonago-sanpou",
    "name": "とり料理 さんぽう",
    "area": "鳥取・米子",
    "categories": ["メンバーの思い出"],
    "relatedSong": "",
    "addressHint": "鳥取県米子市角盤町1-72",
    "description": "山陰放送が店主に取材し、松浦匡希が訪れた思い出の店として紹介。本人が投稿したドライカレーの話も伝えられています。",
    "fanTip": "通常の飲食店です。営業日や利用方法はお店の案内をご確認ください。",
    "source": "https://tori-sanpou.co.jp/",
    "historySource": "https://newsdig.tbs.co.jp/articles/bss/38780?display=1"
  },
  {
    "id": "spot-shunmon-yonago",
    "name": "旬門 米子本店",
    "area": "鳥取・米子",
    "categories": ["街とヒゲダン"],
    "categoryLabel": "サインの訪問記録",
    "relatedSong": "",
    "addressHint": "鳥取県米子市明治町154-1 パーキングビル1階",
    "description": "2026年7月の来店記録に、ヒゲダンのサインを見たという報告がある飲食店。閉店した旬門松江店と同じグループです。メンバーの米子本店への来店や勤務は確認できていません。",
    "fanTip": "サインの展示状況は変わることがあります。営業日や利用方法はお店の案内をご確認ください。",
    "source": "https://visit-yonago.com/syunmon/",
    "historySource": "https://retty.me/area/PRE31/ARE288/SUB28801/100000762943/62575808/",
    "historySourceLabel": "2026年7月の来店記録",
    "additionalSources": [{"label": "松江店の閉店と姉妹店の案内", "url": "https://unseki.co.jp/blog/close/22535"}]
  },
  {
    "id": "spot-chuka-korou",
    "name": "中華 虎楼",
    "area": "島根・松江",
    "categories": ["街とヒゲダン"],
    "categoryLabel": "サインの訪問記録",
    "relatedSong": "",
    "addressHint": "島根県松江市灘町1-45",
    "description": "2022年のファンの訪問記に、小笹大輔さんのサインについて記されている中華料理店。2024年にも、店内にヒゲダンの色紙があったという来店者の報告があります。",
    "fanTip": "現在の展示状況や本人の来店は確認できていません。通常の飲食店として、営業や利用の案内をご確認ください。",
    "source": "https://tabelog.com/shimane/A3201/A320101/32000288/",
    "historySource": "https://lovely088.hatenablog.com/entry/higedan_2",
    "historySourceLabel": "2022年のファンの訪問記",
    "additionalSources": [{"label": "2024年の来店記録", "url": "https://tabelog.com/shimane/A3201/A320101/32000288/dtlrvwlst/B480044555/"}]
  },
  {
    "id": "spot-izumo-taisha-promotion",
    "name": "出雲大社",
    "area": "島根・出雲",
    "categories": ["街とヒゲダン"],
    "categoryLabel": "大学PVの撮影地",
    "relatedSong": "SWEET TWEET",
    "relatedSongLabel": "島根大学PVで使われた曲",
    "addressHint": "島根県出雲市大社町杵築東195",
    "description": "島根大学のプロモーションビデオの撮影で、メンバー4人としまねっこが訪れた場所。大学は参拝や参道での撮影の様子を紹介しています。",
    "fanTip": "参拝時間や境内での撮影は出雲大社の案内をご確認ください。確認した大学のYouTube上のPVは非公開でした（2026年11月確認）。",
    "source": "https://izumooyashiro.or.jp/access",
    "historySource": "https://www.shimane-u.ac.jp/pickup/promotion.html",
    "historySourceLabel": "大学による撮影の記録",
    "additionalSources": [{"label": "参拝時間の案内", "url": "https://izumooyashiro.or.jp/archives/news/12552"}]
  },
  {
    "id": "spot-yonago-station",
    "name": "JR米子駅",
    "area": "鳥取・米子",
    "categories": ["街とヒゲダン"],
    "relatedSong": "Pretender",
    "relatedSongLabel": "発車メロディに選ばれた曲",
    "addressHint": "鳥取県米子市弥生町",
    "description": "米子市は2024年、地元ゆかりのヒゲダンの「Pretender」を駅の発車メロディに採用したと発表しました。",
    "fanTip": "当初の放送予定は3年間。現在の放送状況やタイミングは、最新の案内をご確認ください。",
    "source": "https://www.city.yonago.lg.jp/42479.htm"
  },
  {
    "id": "spot-earth-dream",
    "name": "アースドリーム角山農場",
    "area": "北海道・江別",
    "categories": ["MVロケ地"],
    "relatedSong": "Sanitizer",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "北海道江別市角山584-1",
    "description": "「Sanitizer」のMVが撮影された場所の一つ。農場の運営者が撮影を公表し、映像に出演した馬も紹介しています。",
    "fanTip": "季節や天候で営業日・公開エリアが変わるため、お出かけ前に施設の案内をご確認ください。",
    "source": "https://www.tondenfarm.co.jp/earth-dream-kakuyama/",
    "historySource": "https://www.tondenfarm.co.jp/information/earthdream/"
  },
  {
    "id": "spot-kawana-hotel",
    "name": "川奈ホテル",
    "area": "静岡・伊東",
    "categories": ["MVロケ地"],
    "relatedSong": "ミックスナッツ",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "静岡県伊東市川奈1459",
    "description": "「ミックスナッツ」のMV撮影地として、ロケ地専門誌が紹介したホテル。館内のどこを利用・見学できるかは施設の案内に従ってください。",
    "fanTip": "宿泊・食事などの施設利用に合わせて訪問し、見学や撮影はスタッフにご確認ください。",
    "source": "https://www.princehotels.co.jp/kawana/access/",
    "historySource": "https://locationjapan.net/newss/roke-hotel2026-kawana/"
  },
  {
    "id": "spot-dogashima-area",
    "name": "堂ヶ島エリア",
    "area": "静岡・西伊豆",
    "categories": ["MVロケ地"],
    "mapScope": "area",
    "relatedSong": "らしさ",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "静岡県賀茂郡西伊豆町",
    "description": "西伊豆町の広報は「らしさ」のMVが堂ヶ島エリアで撮影されたと紹介しています。具体的な撮影地点までは特定していません。",
    "fanTip": "地図はエリアの目安です。散策は一般に開放された場所で楽しみましょう。",
    "source": "https://www.town.nishiizu.shizuoka.jp/pdf/kouho/2025/nishi202601.pdf"
  },
  {
    "id": "spot-pretender-taipei",
    "name": "台北",
    "area": "台湾・台北",
    "categories": ["MVロケ地"],
    "mapScope": "area",
    "relatedSong": "Pretender",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "台湾 台北市",
    "description": "「Pretender」のMVについて、藤原聡が台北での撮影を振り返っています。街の中の個別の建物や屋上は特定していません。",
    "fanTip": "地図は台北の位置を示すもので、撮影地点を示すものではありません。",
    "source": "https://www.cna.com.tw/news/amov/202608300178.aspx",
    "historySource": "https://news.ponycanyon.co.jp/2019/04/31698"
  },
  {
    "id": "spot-tattoo-guam",
    "name": "グアム",
    "area": "グアム",
    "categories": ["MVロケ地"],
    "mapScope": "area",
    "relatedSong": "TATTOO",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "グアム",
    "description": "「TATTOO」のMVはグアムで撮影されました。海や街の空気を感じながら、映像を見返してみるのも楽しそうです。",
    "fanTip": "地図はグアムの位置の目安です。個別の撮影場所や施設を示すものではありません。",
    "source": "https://realsound.jp/2023/04/post-1309393.html",
    "historySource": "https://irorirecords.com/news-entry/1424"
  },
  {
    "id": "spot-mv-los-angeles",
    "name": "ロサンゼルス",
    "area": "アメリカ・ロサンゼルス",
    "categories": ["MVロケ地"],
    "mapScope": "area",
    "relatedSong": "Stand By You / FIRE GROUND",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "アメリカ合衆国 カリフォルニア州 ロサンゼルス",
    "description": "「Stand By You」と「FIRE GROUND」は、それぞれロサンゼルスで撮影されたと紹介されています。同じ場所での撮影とは限りません。",
    "fanTip": "地図は都市の位置の目安で、撮影地点を示すものではありません。",
    "source": "https://realsound.jp/2021/08/post-830911_2.html",
    "historySource": "https://popscene.jp/news/041374"
  },
  {
    "id": "spot-shukumei-new-york",
    "name": "ニューヨーク",
    "area": "アメリカ・ニューヨーク",
    "categories": ["MVロケ地"],
    "mapScope": "area",
    "relatedSong": "宿命",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "アメリカ合衆国 ニューヨーク市",
    "description": "「宿命」の公式MVが撮影された街。ニューヨークの風景の中で演奏する4人を映した映像です。",
    "fanTip": "地図はニューヨーク市の位置の目安です。個別の撮影地点や建物を示すものではありません。",
    "source": "https://ototoy.jp/news/101180",
    "historySource": "https://thetv.jp/news/detail/196874/",
    "historySourceLabel": "MV公開時の記事"
  },
  {
    "id": "spot-chessboard-film-location",
    "name": "入笠牧場 約束の丘",
    "area": "長野・伊那",
    "categories": ["MVロケ地"],
    "mapScope": "none",
    "relatedSong": "Chessboard",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "長野県伊那市（撮影地の紹介）",
    "description": "伊那市が「Chessboard」のMV撮影地として紹介している場所。広がる風景と楽曲を結ぶ、映像の舞台です。",
    "fanTip": "撮影地の情報として紹介しています。高原内への立ち入りは原則禁止で事前許可が必要と案内されているため、訪問先としての地図や経路案内は掲載していません。",
    "source": "https://www.inacity.jp/kankojoho/kanko_news/filmcommission/shiensakuhinjoho/jisseki.html",
    "historySource": "https://shinshu-film.net/location/5648/"
  },
  {
    "id": "spot-yanmar-stadium",
    "name": "ヤンマースタジアム長居",
    "area": "大阪・長居",
    "categories": ["ライブ会場"],
    "relatedSong": "",
    "addressHint": "大阪府大阪市東住吉区長居公園1-1",
    "description": "「LIVE at STADIUM 2025」の大阪公演が行われた会場。日産スタジアムとともに、初のスタジアムライブを彩りました。",
    "fanTip": "施設への入場や見学は、イベント・施設の案内をご確認ください。",
    "source": "https://www.nagai-park.jp/",
    "historySource": "https://event.higedan.com/feature/stadium_2025"
  },
  {
    "id": "spot-toyota-arena",
    "name": "TOYOTA ARENA TOKYO",
    "area": "東京・青海",
    "categories": ["ライブ会場"],
    "relatedSong": "",
    "addressHint": "東京都江東区青海1-3-1",
    "description": "2025年10月、ヒゲダンが音楽ライブのこけら落とし公演を行ったアリーナ。2日間のワンマンライブが開催されました。",
    "fanTip": "施設への入場や見学は、イベント・施設の案内をご確認ください。",
    "source": "https://www.toyota-arena-tokyo.jp/access/",
    "historySource": "https://fc.higedan.com/feature/onemanlive_2025"
  },
  {
    "id": "spot-tsurumi-sunshine-court",
    "name": "イオンモール鶴見緑地 サンシャインコート",
    "area": "大阪・鶴見",
    "categories": ["ライブ会場"],
    "relatedSong": "",
    "addressHint": "大阪府大阪市鶴見区鶴見4-17-1",
    "description": "2015年のフリーライブツアーで、3階のサンシャインコートが会場として案内されました。山野楽器のスタッフも、このモールでのインストアライブを振り返っています。",
    "fanTip": "会場の現在の様子は施設の案内をご確認ください。山野楽器は2025年に4階から3階へ移転しており、店舗とイベント会場は別の場所です。",
    "source": "https://tsurumiryokuchi.aeonmall.jp/guide/equipment",
    "historySource": "https://rockinon.com/news/detail/130627",
    "historySourceLabel": "2015年のライブ案内",
    "additionalSources": [
      {"label": "山野楽器スタッフの回想", "url": "https://note.com/yamano_music/n/n743675449aea"},
      {"label": "店舗移転の案内", "url": "https://www.yamano-music.co.jp/page-45260/"}
    ]
  },
  {
    "id": "spot-hiezu-tulip-court",
    "name": "イオンモール日吉津 チューリップコート",
    "area": "鳥取・日吉津",
    "categories": ["ライブ会場"],
    "relatedSong": "",
    "addressHint": "鳥取県西伯郡日吉津村日吉津1160-1",
    "description": "2015年のフリーライブツアーで、イオン日吉津の西館1階チューリップコートが会場として案内されました。山陰での初期の活動をたどれる場所です。",
    "fanTip": "現在もイベントスペースとして使われています。施設の営業や催しの案内をご確認ください。",
    "source": "https://www.aeon.jp/sc/hiezu/info/info_saiji/",
    "historySource": "https://rockinon.com/news/detail/128612",
    "historySourceLabel": "2015年のライブ案内"
  },
  {
    "id": "spot-okamoto-issenya",
    "name": "岡本一銭屋",
    "area": "鳥取・米子",
    "categories": ["メンバーのおすすめ"],
    "relatedSong": "",
    "addressHint": "鳥取県米子市立町1-4",
    "description": "米子の街で長く親しまれてきた駄菓子屋。藤原聡が2019年の対談で、ふらっと立ち寄る場所として紹介しています。本人が訪れたことがあるかは、この対談では確認できません。",
    "fanTip": "営業日や営業時間は変わることがあります。普段のお買い物のお客さんにも配慮して訪れましょう。",
    "source": "https://www.city.yonago.lg.jp/secure/11394/2025guidebook00.pdf",
    "historySource": "https://wasshoi-yonago.com/20190808-02",
    "historySourceLabel": "藤原さんの対談を読む",
    "additionalSources": [{"label": "2026年の店主取材", "url": "https://newsdig.tbs.co.jp/articles/bss/2649500?page=2"}]
  },
  {
    "id": "spot-kanda-shrine-yonago",
    "name": "勝田神社（かんだじんじゃ）",
    "area": "鳥取・米子",
    "categories": ["メンバーのおすすめ"],
    "relatedSong": "",
    "addressHint": "鳥取県米子市博労町2-10",
    "description": "地元で「かんださん」と親しまれる神社。藤原聡が2019年の対談で、米子を訪れる人におすすめしています。本人が訪れたことがあるかは、この対談では確認できません。",
    "fanTip": "参拝や撮影は神社の案内に従い、地域の方やほかの参拝者への配慮を忘れずに。",
    "source": "https://katsutajinja.or.jp/",
    "historySource": "https://wasshoi-yonago.com/20190808-02",
    "historySourceLabel": "藤原さんの対談を読む"
  },
  {
    "id": "spot-bookcenter-cosmo-izumo",
    "name": "ブックセンターコスモ出雲店",
    "area": "島根・出雲",
    "categories": ["街とヒゲダン"],
    "relatedSong": "",
    "addressHint": "島根県出雲市渡橋町724-1",
    "description": "ヒゲダンの作品を扱い、2020年には受賞記念キャンペーンの対象店にもなった書店。2023年にはサインや特設コーナーを見たという来店者の報告もあります。",
    "fanTip": "サインや展示が現在もあるかは確認できていません。営業や展示の最新情報は店舗の案内をご確認ください。",
    "source": "https://www.e-hon.ne.jp/bec/SF/BranchHome?TohanShotenHome=&shotenCode=73016",
    "historySource": "https://higedancp.ponycanyon.co.jp/cdshop/",
    "additionalSources": [{"label": "2023年の来店者の報告", "url": "https://map.yahoo.co.jp/v3/place/onHlfgHqLZ-/review"}]
  },
  {
    "id": "spot-toyosu-gururi",
    "name": "豊洲ぐるり公園",
    "area": "東京・豊洲",
    "categories": ["MVロケ地"],
    "categoryLabel": "MVロケ地の候補",
    "relatedSong": "Choral A",
    "relatedSongLabel": "ロケ地の候補に挙がる作品",
    "addressHint": "東京都江東区豊洲6丁目1番先・豊洲5丁目1番先",
    "description": "海沿いの景色が広がる公園。「Choral A」の映像に登場する場所としてファンの間で挙げられていますが、撮影地としての制作側の発表は確認できていません。",
    "fanTip": "公園の案内や利用ルールを確認し、散歩しながら映像の景色を思い浮かべてみるのも楽しみ方の一つです。",
    "source": "https://toyosugururi.jp/",
    "historySource": "https://ameblo.jp/hatch-kai/entry-12926895799.html"
  },
  {
    "id": "spot-kasamatsu-arena",
    "name": "笠松運動公園 山新スイミングアリーナ",
    "area": "茨城・ひたちなか",
    "categories": ["MVロケ地"],
    "categoryLabel": "MVロケ地の候補",
    "relatedSong": "Subtitle",
    "relatedSongLabel": "ロケ地の候補に挙がる作品",
    "addressHint": "茨城県ひたちなか市佐和2197-28",
    "description": "「Subtitle」の公式MV概要欄には、笠松運動公園の撮影協力が記されています。園内の山新スイミングアリーナがスケートリンクの撮影地という説はありますが、施設名までは確認できていません。",
    "fanTip": "プールやスケート場は季節や行事によって利用できる時間が変わります。訪問前に施設の予定をご確認ください。",
    "source": "https://www.ibaraki-sports.or.jp/kasamatsu2/",
    "historySource": "https://www.youtube.com/watch?v=hN5MBlGv2Ac",
    "historySourceLabel": "公式MVの概要欄",
    "additionalSources": [
      {"label": "ロケ地候補についてのファンの記事", "url": "https://ameblo.jp/hatch-kai/entry-12771586496.html"},
      {"label": "プール・スケート場の案内", "url": "https://www.ibaraki-sports.or.jp/kasamatsu2/%E3%83%97%E3%83%BC%E3%83%AB%E3%83%BB%E3%82%A2%E3%82%A4%E3%82%B9%E3%82%B9%E3%82%B1%E3%83%BC%E3%83%88%E5%A0%B4/"}
    ]
  },
  {
    "id": "spot-usuda-deep-space-center",
    "name": "臼田宇宙空間観測所",
    "area": "長野・佐久",
    "categories": ["街とヒゲダン"],
    "relatedSong": "パラボラ",
    "relatedSongLabel": "ジャケットに登場する作品",
    "addressHint": "長野県佐久市上小田切大曲1831-6",
    "description": "「パラボラ」のジャケットに写る大きなアンテナがあるJAXAの観測所。楽曲の特設サイトにも撮影協力先として名前が記されています。",
    "fanTip": "JAXAによると、例年11月中旬から4月中旬は降雪のため見学休止。山道の状況も含め、出発前に公式案内を確認してください。",
    "source": "https://www.jaxa.jp/about/centers/udsc/",
    "historySource": "https://higedanparabora.com/",
    "additionalSources": [{"label": "ジャケット写真の紹介", "url": "https://news.j-wave.co.jp/2020/04/post-5755.html"}]
  },
  {
    "id": "spot-laughter-hitachiomiya",
    "name": "松井建設（常陸大宮市）",
    "area": "茨城・常陸大宮",
    "categories": ["MVロケ地"],
    "mapScope": "none",
    "relatedSong": "Laughter",
    "relatedSongLabel": "撮影された作品",
    "addressHint": "茨城県常陸大宮市（撮影地の紹介）",
    "description": "「Laughter」のMVが撮影された場所として、いばらきフィルムコミッションが紹介しています。",
    "fanTip": "通常は非公開の事業用施設です。フィルムコミッションの過去の案内では、敷地内への立ち入りや見学はできないとされています。撮影地の紹介にとどめ、地図や経路案内は掲載していません。",
    "source": "https://www.ibarakiguide.jp/ibaraki-fc/data/doc/1758080247_doc_2_0.pdf",
    "additionalSources": [
      {"label": "ロケ地の見学についての案内", "url": "https://www.ibarakiguide.jp/ibaraki-fc/data/doc/1758081362_doc_2_0.pdf"}
    ]
  }
];

export const HISTORICAL_SACRED_SPOTS: HistoricalSacredSpot[] = [
  {
    id: 'spot-matsue-b1-former',
    name: '松江B1（移転前）',
    area: '島根・松江',
    categories: ['ライブ会場', 'メンバーの思い出'],
    status: '移転前の会場',
    description: '2012年7月7日の初ライブについて、藤原聡は日付を語っており、ライブ情報サイトは当日の会場を松江B1と記録しています。B1は2015年に移転したため、現在の会場とは場所が異なります。',
    sources: [
      { label: '藤原さんが語った初ライブの日', url: 'https://www.oricon.co.jp/news/2139557/full/' },
      { label: '2012年の公演記録', url: 'https://www.livefans.jp/events/1990155' },
      { label: '会場の移転について', url: 'https://www.livewalker.com/web/detail/7691' },
    ],
  },
  {
    id: 'spot-yonago-belier-former',
    name: '米子ベリエ（移転前）',
    area: '鳥取・米子',
    categories: ['ライブ会場'],
    status: '移転前の会場',
    description: '米子ベリエは1999年に紺屋町で開業し、2006年に道笑町へ移転。現在の米子 AZTiC laughsにつながるライブハウスです。藤原聡が初めてライブを観たベリエが、移転前後のどちらだったかは確認できていません。',
    sources: [
      { label: '会場の移転について', url: 'https://camp-fire.jp/projects/409283/view' },
      { label: '藤原さんの初めてのライブの話', url: 'https://www.diskgarage.com/digaonline/pleasure/53833' },
    ],
  },
  {
    id: 'spot-yamano-miwi-hashimoto-former',
    name: '山野楽器 ミウィ橋本店',
    area: '神奈川・相模原',
    categories: ['街とヒゲダン'],
    status: '2021年閉店',
    description: 'インディーズ時代からヒゲダンを応援し、メンバーも訪れたレコード店。元店長によると、ファンの思いを届ける応援ノートも置かれていました。店舗は2021年7月25日に閉店しました。',
    sources: [
      { label: '元店長が振り返る応援の日々', url: 'https://note.com/yamano_music/n/n1578ec6e9a80' },
      { label: '応援ノートのその後', url: 'https://note.com/yamano_music/n/n4ccd5a355388' },
    ],
  },
  {
    id: 'spot-shunmon-matsue-former',
    name: '旬門 松江店',
    area: '島根・松江',
    categories: ['街とヒゲダン'],
    status: '2025年閉店',
    description: '2022年に訪れたファンの記録には、店内にヒゲダンのサインが飾られていたと記されています。店舗は2014年に移転し、2025年9月20日に閉店しました。メンバーの勤務や来店については確認できていません。',
    sources: [
      { label: '2022年の来店記録', url: 'https://lovely088.hatenablog.com/entry/higedan' },
      { label: '2014年の移転について', url: 'https://shunmongr.com/company/' },
      { label: '閉店についての地域記事', url: 'https://unseki.co.jp/blog/close/22535' },
    ],
  },
  {
    id: 'spot-taipei-artist-village-former',
    name: '台北国際芸術村（旧拠点）',
    area: '台湾・台北',
    categories: ['MVロケ地'],
    status: '運営終了・ロケ地は候補',
    description: '「Pretender」の演奏場面について、ファンが屋上を撮影地の候補として挙げた施設。撮影側による施設名の公表は確認できていません。旧拠点は2023年末に運営を終了し、活動は宝蔵巌へ移りました。',
    sources: [
      { label: 'ロケ地候補を紹介した記事', url: 'https://zukkytaiwan.com/pretender-pv/' },
      { label: '施設の沿革（運営者）', url: 'https://www.artistvillage.org/about.php' },
    ],
  },
];
import tourArchiveRecords from './tourArchiveRecords.json';

// 日付と会場を公開資料で照合したスナップショット（2026-11-08）。
export const TOUR_ARCHIVES: TourArchive[] = tourArchiveRecords;

// QUIZ_QUESTIONS is exported from ./quizData above.

export interface BandMemberProfile {
  id: string;
  name: string;
  nickname: string;
  role: string;
  birthplace: string;
  headline: string;
  biography: string;
  extra: string;
  sourceLinks: { label: string; url: string }[];
  signatureSongId: string;
  signatureSongTitle: string;
}

export const HIGEDAN_MEMBERS: BandMemberProfile[] = [
  {
    id: 'satoshi',
    name: '藤原 聡',
    nickname: 'さとっちゃん',
    role: 'Vocal / Piano',
    birthplace: '鳥取県米子市出身',
    headline: '歌とピアノの人。その出発点にはドラムもある。',
    biography:
      '幼稚園のピアノ教室は、上手に弾くとゲームを買ってもらえるのが楽しみだったそう。小学校の鼓笛隊でドラムに出会い、地元のライブハウスで聴いたバスドラムの響きから、バンドを組みたいと思うようになった。会社員時代は音楽をする時間が減ることが一番つらく、音楽をする人生を選んで上京したと本人は語っている。',
    extra: '「イエスタデイ」のピアノソロでは、X JAPANのYOSHIKIの演奏を意識したという。',
    sourceLinks: [
      { label: 'Rock oNの本人取材', url: 'https://www.miroc.co.jp/creator/people-of-sound_official-hige-dandism_fujiwara/' },
      { label: '公式インタビュー', url: 'https://hello-ep.jp/interview/' },
    ],
    signatureSongId: 'yesterday-song',
    signatureSongTitle: 'イエスタデイ',
  },
  {
    id: 'daisuke',
    name: '小笹 大輔',
    nickname: '大ちゃん',
    role: 'Guitar / Chorus',
    birthplace: '島根県松江市出身',
    headline: 'パンクに夢中だった少年が、ヒゲダンでポップスを弾く。',
    biography:
      '兄が買ってきたギターとメロコアの音源に衝撃を受け、中学1年から弾き始めた。ヒゲダン以前はパンクやメロコアを演奏。「Rowan」では作詞・作曲を担い、藤原の低めのミックスボイスまで想定して制作した。',
    extra: '「Pretender」の録音で弾いたギターはジャズマスター。本人が機材の取材で明かしている。',
    sourceLinks: [
      { label: 'Fenderの本人取材', url: 'https://fendernews.jp/cover-oct-19-higedan-2/' },
      { label: '公式インタビュー', url: 'https://officialhigedandism.ponycanyon.co.jp/interview/index.html' },
    ],
    signatureSongId: 'rowan-song',
    signatureSongTitle: 'Rowan',
  },
  {
    id: 'makoto',
    name: '楢﨑 誠',
    nickname: 'ならちゃん',
    role: 'Bass / Sax / Synth Bass',
    birthplace: '広島県福山市出身',
    headline: 'ベースもサックスも、作詞・作曲も。',
    biography:
      '高校時代、友人とバンドを組むときにベースを選んだ。警察音楽隊でサックスを演奏した経験もある。「旅は道連れ」は自ら作詞・作曲し、仲間と作る現場の空気や少し隙のある感じを入れたと語っている。',
    extra: '音楽隊での経験が縁になり、映画「異動辞令は音楽隊！」の主題歌「Choral A」を担当した。',
    sourceLinks: [
      { label: 'Fenderの本人取材', url: 'https://fendernews.jp/cover-oct-19-higedan-2/' },
      { label: '公式インタビュー', url: 'https://officialhigedandism.ponycanyon.co.jp/interview/index.html' },
      { label: '映画の本人取材', url: 'https://press.moviewalker.jp/news/article/1098780/' },
    ],
    signatureSongId: 'tabi-wa-michizure',
    signatureSongTitle: '旅は道連れ',
  },
  {
    id: 'masaki',
    name: '松浦 匡希',
    nickname: 'ちゃんまつ',
    role: 'Drums / Percussion',
    birthplace: '鳥取県米子市出身',
    headline: '1 BPMの違いまで、バンドで確かめる。',
    biography:
      '録音の始めにテンポを1 BPMずつ上下させて試すことがあるという。「HELLO」のシャッフルには苦労したそうだが、Bメロのドラムとギターの掛け合いを聴いてほしいと語っている。',
    extra: '「フィラメント」はサンプリング音源のループから作り始め、藤原と初めて共作した曲。',
    sourceLinks: [
      { label: 'ドラム・マガジンの本人取材', url: 'https://drumsmagazine.jp/player/interview-masaki-matsuura/' },
      { label: '公式インタビュー', url: 'https://editorial.ponycanyon.co.jp/interview/' },
    ],
    signatureSongId: 'filament-song',
    signatureSongTitle: 'フィラメント',
  },
];
