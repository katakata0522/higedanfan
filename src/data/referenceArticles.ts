// 掲載元の記事名・日付を確認した参考資料。問題文・解答・解説は含めない。
// 公開日未確認の資料は null。発売日・更新日・放送日・発行日は種別を区別する。
// referencedUrls は曲解説・検定に残る参照URLの対応表（分割ページや移転前URLを含む）。
export type ReferenceKind = 'interview' | 'review' | 'news' | 'official' | 'lyrics' | 'video' | 'score' | 'sns';
export type ReferenceDateKind = 'published' | 'updated' | 'broadcast' | 'issued' | 'released';

export interface ReferenceArticle {
  title: string;
  publisher: string;
  url: string;
  kind: ReferenceKind;
  date: string | null;
  dateKind: ReferenceDateKind;
  relatedSongIds: readonly string[];
  referencedUrls: readonly string[];
  note?: string;
  unavailable?: boolean;
}

export const REFERENCE_CHECKED_ON = '2026-11-24';
export const REFERENCE_ARTICLES: readonly ReferenceArticle[] = [
  {
    "title": "【7/24 Digital Release / 7/31 CD Release】New Album 「Rejoice」",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/detail/100958",
    "kind": "news",
    "date": "2024-05-07",
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts",
      "soulsoup",
      "subtitle"
    ],
    "referencedUrls": [
      "https://higedan.com/news/detail/100958"
    ]
  },
  {
    "title": "主題歌はOfficial髭男dism！ フジテレビ系連続ドラマの主題歌を担当するのは４年ぶり。この冬最も心に響く、最高のメロディーを奏でるラブソング『Subtitle』が完成！",
    "publisher": "フジテレビ",
    "url": "https://www.fujitv.co.jp/silent/news/news07.html",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "subtitle"
    ],
    "referencedUrls": [
      "https://www.fujitv.co.jp/silent/news/news07.html"
    ]
  },
  {
    "title": "Official髭男dism 公式ニュース一覧（27ページ）",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/list/3/6/?page=27",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://higedan.com/news/list/3/6/?page=27"
    ]
  },
  {
    "title": "Official髭男dism 公式ニュース一覧（43ページ）",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/3/?page=43",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://higedan.com/news/3/?page=43"
    ]
  },
  {
    "title": "Official髭男dism『Pretender』インタビュー 研究と向上心を欠かさない4人が作る“最高の音楽”",
    "publisher": "ぴあ音楽",
    "url": "https://lp.p.pia.jp/article/news/50294/index.html",
    "kind": "interview",
    "date": "2019-05-13",
    "dateKind": "published",
    "relatedSongIds": [
      "amazing-song",
      "pretender"
    ],
    "referencedUrls": [
      "https://lp.p.pia.jp/article/news/50294/index.html"
    ]
  },
  {
    "title": "Official髭男dism 115万キロのフィルム 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/247041/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/247041/"
    ]
  },
  {
    "title": "aiko×ヒゲダン・藤原 聡、楽曲づくりに共通点！ 「ボイスメモ」活用法で盛り上がる",
    "publisher": "J-WAVE NEWS",
    "url": "https://news.j-wave.co.jp/2021/03/post-7577.html",
    "kind": "interview",
    "date": "2021-03-10",
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song"
    ],
    "referencedUrls": [
      "https://news.j-wave.co.jp/2021/03/post-7577.html"
    ]
  },
  {
    "title": "Official髭男dism「もしバンドをやっていなかったら…」 意外な職業にメンバー大盛り上がり！",
    "publisher": "J-WAVE NEWS",
    "url": "https://news.j-wave.co.jp/2018/09/95-officialdism.html",
    "kind": "interview",
    "date": "2018-09-10",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://news.j-wave.co.jp/2018/09/95-officialdism.html"
    ]
  },
  {
    "title": "Official髭男dism「TATTOO」特設サイト | Official髭男dism",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://tattoo.ponycanyon.co.jp/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "tattoo"
    ],
    "referencedUrls": [
      "https://tattoo.ponycanyon.co.jp/"
    ]
  },
  {
    "title": "Official髭男dism「Editorial」インタビュー",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://editorial.ponycanyon.co.jp/interview/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "bedroom-talk",
      "cry-baby",
      "editorial-song",
      "editorial-title-track",
      "filament-song",
      "i-love",
      "lost-in-my-room",
      "midori-no-amayoke",
      "pending-machine",
      "shower-song"
    ],
    "referencedUrls": [
      "https://editorial.ponycanyon.co.jp/interview/"
    ]
  },
  {
    "title": "ヒゲダン、メジャー1年で初武道館 自身最大ホールツアー発表",
    "publisher": "ORICON NEWS",
    "url": "https://www.oricon.co.jp/news/2139557/full/",
    "kind": "news",
    "date": "2019-07-08",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://www.oricon.co.jp/news/2139557/full/"
    ]
  },
  {
    "title": "Official髭男dism「Same Blue」、Mrs. GREEN APPLE「ライラック」……“変拍子”が表現する青春の不安定さ",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2024/11/post-1842973.html",
    "kind": "review",
    "date": "2024-11-21",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://realsound.jp/2024/11/post-1842973.html"
    ]
  },
  {
    "title": "LIVE at STADIUM 2025｜Official髭男dism",
    "publisher": "Official髭男dism",
    "url": "https://event.higedan.com/feature/stadium_2025",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://event.higedan.com/feature/stadium_2025"
    ]
  },
  {
    "title": "Official髭男dism・小笹「真面目にカッコよく撮ってみたい」MV撮影で“1番行ってみたい国”とは？",
    "publisher": "ライブドアニュース",
    "url": "https://news.livedoor.com/article/detail/17883073/",
    "kind": "news",
    "date": "2020-02-27",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://news.livedoor.com/article/detail/17883073/"
    ]
  },
  {
    "title": "Official髭男dism、全編台湾ロケの「Pretender」MV公開。先行配信もスタート",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/838989",
    "kind": "news",
    "date": "2019-04-17",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://barks.jp/?p=838989"
    ]
  },
  {
    "title": "LINE事情やメンバー愛を明かす！Official髭男dismインタビュー",
    "publisher": "LINEみんなの使い方ガイド",
    "url": "https://guide.line.me/ja/features-and-columns/interview001.html",
    "kind": "interview",
    "date": "2019-10-17",
    "dateKind": "updated",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://guide.line.me/ja/features-and-columns/interview001.html"
    ]
  },
  {
    "title": "中学校 女声三部合唱 Chessboard",
    "publisher": "NHK出版",
    "url": "https://www.nhk-book.co.jp/detail/000000554282023.html",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "chessboard-song"
    ],
    "referencedUrls": [
      "https://www.nhk-book.co.jp/detail/000000554282023.html"
    ]
  },
  {
    "title": "PRODUCT | TVアニメ『東京リベンジャーズ』公式サイト",
    "publisher": "TVアニメ「東京リベンジャーズ」",
    "url": "https://tokyo-revengers-anime.com/product/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise"
    ],
    "referencedUrls": [
      "https://tokyo-revengers-anime.com/product/"
    ]
  },
  {
    "title": "Official髭男dism「HELLO EP」インタビュー",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://hello-ep.jp/interview/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "hello-song",
      "laughter-song",
      "natsumoyou-no-neko",
      "parabola-song"
    ],
    "referencedUrls": [
      "https://hello-ep.jp/interview/"
    ]
  },
  {
    "title": "Official髭男dismメジャー2ndアルバム『Editorial』インタビュー――音楽を楽しんで表現したいという欲求",
    "publisher": "encore（USEN）",
    "url": "https://e.usen.com/archive/sub-archive/42162.html",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "bedroom-talk",
      "midori-no-amayoke"
    ],
    "referencedUrls": [
      "https://e.usen.com/archive/sub-archive/42162.html"
    ]
  },
  {
    "title": "Official髭男dism書き下ろし主題歌「Choral A」が彩る予告映像とキービジュアル解禁！",
    "publisher": "ギャガ",
    "url": "https://gaga.ne.jp/pt/news/detail.php?id=1514",
    "kind": "news",
    "date": "2022-06-02",
    "dateKind": "published",
    "relatedSongIds": [
      "choral-a-song"
    ],
    "referencedUrls": [
      "https://gaga.ne.jp/pt/news/detail.php?id=1514"
    ]
  },
  {
    "title": "Official髭男dism 『Editorial』より「Bedroom Talk」のリリックビデオを公開！",
    "publisher": "ポニーキャニオン",
    "url": "https://news.ponycanyon.co.jp/2021/11/63478",
    "kind": "news",
    "date": "2021-11-29",
    "dateKind": "published",
    "relatedSongIds": [
      "bedroom-talk"
    ],
    "referencedUrls": [
      "https://news.ponycanyon.co.jp/2021/11/63478"
    ]
  },
  {
    "title": "東京で刺激を受けて成長中「Official髭男dism」",
    "publisher": "J-WAVE NEWS",
    "url": "https://news.j-wave.co.jp/2016/06/officialdism.html",
    "kind": "interview",
    "date": "2016-06-26",
    "dateKind": "published",
    "relatedSongIds": [
      "coffee-to-syrup"
    ],
    "referencedUrls": [
      "https://news.j-wave.co.jp/2016/06/officialdism.amp.html"
    ]
  },
  {
    "title": "TOKIO HOT 100｜2018年05月20日の放送にいらしたゲスト",
    "publisher": "J-WAVE",
    "url": "https://www.j-wave.co.jp/original/tokiohot100/guest_past/past_20180520.htm",
    "kind": "interview",
    "date": "2018-05-20",
    "dateKind": "broadcast",
    "relatedSongIds": [
      "escapade-song"
    ],
    "referencedUrls": [
      "https://www.j-wave.co.jp/original/tokiohot100/guest_past/past_20180520.htm"
    ]
  },
  {
    "title": "エスカパレード｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/8/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "escapade-song"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/8/"
    ]
  },
  {
    "title": "「Official髭男dism」スペシャルインタビュー",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/user/interview/1804_higedan/index3.html",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo",
      "coffee-to-syrup",
      "escapade-song",
      "hatsumeika-song",
      "kanousei-song",
      "no-doubt",
      "saredo-hibi-wa",
      "second-line",
      "soushisouai-song",
      "takaga-i-love-you",
      "trailer-song"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/user/interview/1804_higedan/index2.html",
      "https://www.uta-net.com/user/interview/1804_higedan/index3.html"
    ]
  },
  {
    "title": "Traveler｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/7/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://higedan.com/discography/detail/7/"
    ]
  },
  {
    "title": "ノーダウト｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/5/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/5/"
    ]
  },
  {
    "title": "Official髭男dismがシングル「Pretender」、アルバム『Traveler』ともに初の1位を獲得～レコチョクアワード月間最優秀楽曲賞2019年12月度発表～",
    "publisher": "PR TIMES",
    "url": "https://prtimes.jp/main/html/rd/p/000001206.000002747.html",
    "kind": "news",
    "date": "2020-01-10",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [
      "https://prtimes.jp/main/html/rd/p/000001206.000002747.html"
    ]
  },
  {
    "title": "Cry Baby｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/18/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/18/"
    ]
  },
  {
    "title": "Subtitle｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/27/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/27/"
    ]
  },
  {
    "title": "カブトムシ-aiko | ポニーキャニオン",
    "publisher": "ポニーキャニオン",
    "url": "https://www.ponycanyon.co.jp/music/PCCA000001391",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://www.ponycanyon.co.jp/music/PCCA000001391"
    ]
  },
  {
    "title": "Official髭男dism Subtitle 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/326156/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "subtitle"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/326156/"
    ]
  },
  {
    "title": "Official髭男dism イコール 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/227529/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "equal-song"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/227529/"
    ]
  },
  {
    "title": "TOKYO FM/JFN38局ネット『SCHOOL OF LOCK!』浜辺美波が女子クラスに登場！",
    "publisher": "TOKYO FM",
    "url": "https://www.tfm.co.jp/company/pdf/news_94c4a13c6d3debc4cc1c33634e42c4375f22be290a89c.pdf",
    "kind": "news",
    "date": "2020-07-30",
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo"
    ],
    "referencedUrls": [
      "https://www.tfm.co.jp/company/pdf/news_94c4a13c6d3debc4cc1c33634e42c4375f22be290a89c.pdf"
    ]
  },
  {
    "title": "レポート｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/9/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://higedan.com/discography/detail/9/"
    ]
  },
  {
    "title": "MAN IN THE MIRROR｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/10/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://higedan.com/discography/detail/10/"
    ]
  },
  {
    "title": "ラブとピースは君の中｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/11/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://higedan.com/discography/detail/11/"
    ]
  },
  {
    "title": "What's Going On?｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/14/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "whats-going-on"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/14/"
    ]
  },
  {
    "title": "Official髭男dism「ラブとピースは君の中」｜Lastrum",
    "publisher": "Lastrum",
    "url": "https://www.lastrum.co.jp/labelproducts/8583/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://www.lastrum.co.jp/labelproducts/8583/"
    ]
  },
  {
    "title": "Official髭男dism、テレビ朝日系「ミュージックステーション」初出演決定！",
    "publisher": "Fanplus Music",
    "url": "https://music.fanplus.co.jp/news/20181112700bdffc7",
    "kind": "news",
    "date": "2018-11-26",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://music.fanplus.co.jp/news/20181112700bdffc7"
    ]
  },
  {
    "title": "バックナンバー｜ミュージックステーション｜テレビ朝日",
    "publisher": "テレビ朝日",
    "url": "https://www.tv-asahi.co.jp/music/contents/m_lineup/backnumber/?p=21",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://www.tv-asahi.co.jp/music/contents/m_lineup/backnumber/?p=21"
    ]
  },
  {
    "title": "「カルピスウォーター」×「Official髭男dism」“新社会人”と“高校生”を応援するプロジェクトをスタート！永野芽郁さんが新社会人を演じるTVCMは、4/10（金）から全国オンエア｜ニュースリリース 2020年｜会社情報｜アサヒ飲料",
    "publisher": "アサヒ飲料",
    "url": "https://img.asahiinryo.co.jp/company/newsrelease/2020/pick_0402.html",
    "kind": "news",
    "date": "2020-04-02",
    "dateKind": "published",
    "relatedSongIds": [
      "parabola-song"
    ],
    "referencedUrls": [
      "https://img.asahiinryo.co.jp/company/newsrelease/2020/pick_0402.html"
    ]
  },
  {
    "title": "New EP「HELLO EP」 | Official髭男dism",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://hello-ep.jp/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "parabola-song"
    ],
    "referencedUrls": [
      "https://hello-ep.jp/"
    ]
  },
  {
    "title": "パーパス[CD] - ジャスティン・ビーバー - UNIVERSAL MUSIC JAPAN",
    "publisher": "UNIVERSAL MUSIC JAPAN",
    "url": "https://www.universal-music.co.jp/justin-bieber/products/uicd-6216/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "trailer-song"
    ],
    "referencedUrls": [
      "https://www.universal-music.co.jp/justin-bieber/products/uicd-6216/"
    ]
  },
  {
    "title": "DISCOGRAPHY｜Official髭男dism",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "whats-going-on"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/"
    ]
  },
  {
    "title": "【10/2リリース】New Digital single「Same Blue」が TVアニメ『アオのハコ』 OP主題歌に決定！",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/detail/101162",
    "kind": "news",
    "date": "2024-09-07",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://higedan.com/news/detail/101162"
    ]
  },
  {
    "title": "主題歌 | 『映画ドラえもん のび太の宇宙小戦争 2021』公式サイト",
    "publisher": "映画ドラえもん",
    "url": "https://doraeiga.com/2021/song/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song"
    ],
    "referencedUrls": [
      "https://doraeiga.com/2021/song/"
    ]
  },
  {
    "title": "「サウナ・スパプロフェッショナル」インタビュー 小笹大輔さん（サウナ・スパ2021年5月号）",
    "publisher": "日本サウナ・スパ協会",
    "url": "https://sauna.or.jp/sauna_news/back_number/pdf_files/2011-2030/newspaper492.pdf",
    "kind": "interview",
    "date": "2021-05-15",
    "dateKind": "issued",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://sauna.or.jp/sauna_news/back_number/pdf_files/2011-2030/newspaper492.pdf"
    ]
  },
  {
    "title": "Editorial｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/19/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://higedan.com/discography/detail/19/"
    ]
  },
  {
    "title": "＜インタビュー＞Official髭男dism 喜びと挑戦にあふれた最新アルバム『Rejoice』が生まれるに至った、バンドの“ナチュラル”な成長【MONTHLY FEATURE】",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/special/detail/4460",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "b-side-blues",
      "mixed-nuts",
      "sharon",
      "subtitle",
      "tattoo"
    ],
    "referencedUrls": [
      "https://www.billboard-japan.com/special/detail/4460"
    ]
  },
  {
    "title": "Official髭男dism「エルダーフラワー/スターダスト」",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://stardust-elderflower.ponycanyon.co.jp/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "elderflower"
    ],
    "referencedUrls": [
      "https://stardust-elderflower.ponycanyon.co.jp/"
    ]
  },
  {
    "title": "【インタビュー】Official髭男dism、激変する環境にもまれながら自分たちらしい音を追い求めて作り上げた『Stand By You EP』",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/827997",
    "kind": "interview",
    "date": "2018-11-01",
    "dateKind": "published",
    "relatedSongIds": [
      "bad-for-me",
      "fire-ground",
      "stand-by-you"
    ],
    "referencedUrls": [
      "https://barks.jp/news/827997/",
      "https://barks.jp/news/827997/2/"
    ]
  },
  {
    "title": "［制作ドキュメント］Official髭男dism - Pretender",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=spo63s7UoAQ",
    "kind": "video",
    "date": "2019-05-15",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://www.youtube.com/watch?v=spo63s7UoAQ&t=240s"
    ]
  },
  {
    "title": "2021/02/18 ゲスト：楢﨑 誠 from Official髭男dism",
    "publisher": "FM802",
    "url": "https://funky802.com/infinity/article/119970",
    "kind": "interview",
    "date": "2021-02-19",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [
      "https://funky802.com/infinity/article/119970"
    ]
  },
  {
    "title": "Official髭男dism もう僕にとってaikoさんはずっと“星”ですね。",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/user/writer/todaysong.html?id=9646",
    "kind": "interview",
    "date": "2019-04-26",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/user/writer/todaysong.html?id=9646"
    ]
  },
  {
    "title": "Official髭男dismが新曲『Pretender』を語る！「バンドを次のステージに連れて行ってくれる」",
    "publisher": "J-WAVE NEWS",
    "url": "https://news.j-wave.co.jp/2019/05/j-wave-42.html",
    "kind": "interview",
    "date": "2019-05-15",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://news.j-wave.co.jp/2019/05/j-wave-42.html"
    ]
  },
  {
    "title": "MUSIC｜TVアニメ『SPY×FAMILY』",
    "publisher": "アニメ「SPY×FAMILY」",
    "url": "https://spy-family.net/tvseries/music/music_op.php",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts"
    ],
    "referencedUrls": [
      "https://spy-family.net/tvseries/music/music_op.php"
    ]
  },
  {
    "title": "和久井健先生×Official髭男dism対談 完全版 | TVアニメ『東京リベンジャーズ』公式サイト",
    "publisher": "TVアニメ「東京リベンジャーズ」",
    "url": "https://tokyo-revengers-anime.com/special/taidan/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo"
    ],
    "referencedUrls": [
      "https://tokyo-revengers-anime.com/special/taidan/"
    ]
  },
  {
    "title": "6月16日のゲストは Official髭男dism、藤原聡さんです。",
    "publisher": "FM FUKUOKA",
    "url": "https://fmfukuoka.co.jp/blog-archives/a/oto/2018/06/616-officialdism.html",
    "kind": "interview",
    "date": "2018-06-16",
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo"
    ],
    "referencedUrls": [
      "https://fmfukuoka.co.jp/blog-archives/a/oto/2018/06/616-officialdism.html"
    ]
  },
  {
    "title": "【Interview】Official髭男dism 藤原聡｜キーボード・マガジン2018年SUMMER号より",
    "publisher": "リットーミュージック",
    "url": "https://www.rittor-music.co.jp/pickup/detail/15639/",
    "kind": "interview",
    "date": "2018-06-12",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [
      "https://www.rittor-music.co.jp/pickup/detail/15639/"
    ]
  },
  {
    "title": "『Traveler』OFFICIAL INTERVIEW",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://officialhigedandism.ponycanyon.co.jp/interview/index.html",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "amazing-song",
      "bad-for-me",
      "fire-ground",
      "rowan-song",
      "saigo-no-koiwazurai",
      "shukumei",
      "stand-by-you",
      "tabi-wa-michizure",
      "vintage-song",
      "yesterday-song"
    ],
    "referencedUrls": [
      "https://officialhigedandism.ponycanyon.co.jp/interview/index.html"
    ]
  },
  {
    "title": "2018年10月度FM802ヘビーローテーション・アーティスト Official髭男dismにDJ・飯室大吾がインタビュー ！",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/special/detail/2505",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "stand-by-you"
    ],
    "referencedUrls": [
      "https://www.billboard-japan.com/special/detail/2505"
    ]
  },
  {
    "title": "Official髭男dism、新曲「宿命」が『熱闘甲子園』テーマソングに決定 | Daily News | Billboard JAPAN",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/76299/2",
    "kind": "news",
    "date": "2019-06-04",
    "dateKind": "published",
    "relatedSongIds": [
      "shukumei"
    ],
    "referencedUrls": [
      "https://www.billboard-japan.com/d_news/detail/76299/2"
    ]
  },
  {
    "title": "Official髭男dism「宿命」がABC夏の高校野球応援ソングに決定(3/3) | WEBザテレビジョン",
    "publisher": "ザテレビジョン",
    "url": "https://thetv.jp/news/detail/192068/p3/",
    "kind": "news",
    "date": "2019-06-03",
    "dateKind": "published",
    "relatedSongIds": [
      "shukumei"
    ],
    "referencedUrls": [
      "https://thetv.jp/news/detail/192068/p3/"
    ]
  },
  {
    "title": "ドラマソング賞 受賞インタビュー I LOVE…／Official髭男dism | 第104回 - ザテレビジョンドラマアカデミー賞",
    "publisher": "ザテレビジョン",
    "url": "https://thetv.jp/feature/drama-academy/104/awards/interview/6/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "i-love"
    ],
    "referencedUrls": [
      "https://thetv.jp/feature/drama-academy/104/awards/interview/6/"
    ]
  },
  {
    "title": "キャスト＆スタッフ｜TBSテレビ：火曜ドラマ『恋はつづくよどこまでも』",
    "publisher": "TBSテレビ",
    "url": "https://www.tbs.co.jp/koitsudu_tbs/caststaff/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "i-love"
    ],
    "referencedUrls": [
      "https://www.tbs.co.jp/koitsudu_tbs/caststaff/"
    ]
  },
  {
    "title": "天竺編オープニング主題歌は、Official髭男dism「ホワイトノイズ」に決定！ | TVアニメ『東京リベンジャーズ』公式サイト",
    "publisher": "TVアニメ「東京リベンジャーズ」",
    "url": "https://tokyo-revengers-anime.com/news/archives/3768",
    "kind": "news",
    "date": "2023-09-30",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise"
    ],
    "referencedUrls": [
      "https://tokyo-revengers-anime.com/news/archives/3768"
    ]
  },
  {
    "title": "実は10年前の曲 ヒゲダン「ホワイトノイズ」Official髭男dism | SENSE OF WONDER",
    "publisher": "liberty7",
    "url": "https://liberty7.net/higedan-whitenoise/",
    "kind": "review",
    "date": "2023-02-13",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise"
    ],
    "referencedUrls": [
      "https://liberty7.net/higedan-whitenoise/"
    ]
  },
  {
    "title": "『ホワイトノイズ』——弱虫の声は、消えなくていい｜ナカヤマサチコ",
    "publisher": "note（ナカヤマサチコ）",
    "url": "https://note.com/sacchy/n/n3f61a77b0c82",
    "kind": "review",
    "date": "2026-09-26",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise"
    ],
    "referencedUrls": [
      "https://note.com/sacchy/n/n3f61a77b0c82"
    ]
  },
  {
    "title": "[Behind The Scenes] Official髭男dism - ホワイトノイズ",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=X7d5_zgOqH8",
    "kind": "video",
    "date": "2023-01-25",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise"
    ],
    "referencedUrls": [
      "https://www.youtube.com/watch?v=X7d5_zgOqH8"
    ]
  },
  {
    "title": "Official髭男dism、新曲「TATTOO」MVのショートメイキング映像シリーズをYouTube ShortsとTikTokにて順次公開！",
    "publisher": "ポニーキャニオン",
    "url": "https://news.ponycanyon.co.jp/2023/04/84770",
    "kind": "news",
    "date": "2023-04-28",
    "dateKind": "published",
    "relatedSongIds": [
      "tattoo"
    ],
    "referencedUrls": [
      "https://news.ponycanyon.co.jp/2023/04/84770"
    ]
  },
  {
    "title": "Official髭男dism、『ペンディングトレイン―8時23分、明日 君と』主題歌“TATTOO”を4/21配信リリース",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/news/detail/205899",
    "kind": "news",
    "date": "2023-04-05",
    "dateKind": "published",
    "relatedSongIds": [
      "tattoo"
    ],
    "referencedUrls": [
      "https://rockinon.com/news/detail/205899"
    ]
  },
  {
    "title": "Official髭男dism、映画『劇場版 SPY×FAMILY』主題歌「SOULSOUP」配信決定 | Daily News | Billboard JAPAN",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/132102/2",
    "kind": "news",
    "date": "2023-11-23",
    "dateKind": "published",
    "relatedSongIds": [
      "soulsoup"
    ],
    "referencedUrls": [
      "https://www.billboard-japan.com/d_news/detail/132102/2"
    ]
  },
  {
    "title": "主題歌 Official髭男dism 「Sharon」に決定！ | トピックス | マウンテンドクター | 関西テレビ放送 カンテレ",
    "publisher": "関西テレビ",
    "url": "https://www.ktv.jp/mountaindoctor/topics/t5.html",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "sharon"
    ],
    "referencedUrls": [
      "https://www.ktv.jp/mountaindoctor/topics/t5.html"
    ]
  },
  {
    "title": "月刊ピアノ2024年12月号",
    "publisher": "ヤマハの楽譜出版",
    "url": "https://sheetmusic.jp.yamaha.com/products/4910076251243",
    "kind": "score",
    "date": "2024-11-20",
    "dateKind": "released",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://www.ymm.co.jp/magazine/piano/pdf/sample/202412.pdf"
    ],
    "note": "楽譜サンプルの掲載元がメンテナンス中のため、出版社の刊行情報へリンクしています。"
  },
  {
    "title": "Official髭男dism、青春を描く「Same Blue」MV公開 | Daily News | Billboard JAPAN",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/142171/2",
    "kind": "news",
    "date": "2024-10-02",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://www.billboard-japan.com/d_news/detail/142171/2"
    ]
  },
  {
    "title": "OPED主題歌アーティスト解禁！",
    "publisher": "アニメ「アオのハコ」",
    "url": "https://aonohako-anime.com/news/detail_240907_3.html",
    "kind": "news",
    "date": "2024-09-07",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://aonohako-anime.com/news/detail_240907_3.html"
    ]
  },
  {
    "title": "Official髭男dism『Same Blue』／めまぐるしいバンドサウンドと変わらず青く光る歌",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/disc/detail/210751",
    "kind": "review",
    "date": "2024-10-30",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [
      "https://rockinon.com/disc/detail/210751"
    ]
  },
  {
    "title": "主題歌がOfficial髭男dism「らしさ」に決定！",
    "publisher": "アニメ映画「ひゃくえむ。」",
    "url": "https://hyakuemu-anime.com/info/91/",
    "kind": "news",
    "date": "2025-07-18",
    "dateKind": "published",
    "relatedSongIds": [
      "rashisa"
    ],
    "referencedUrls": [
      "https://hyakuemu-anime.com/info/91/"
    ]
  },
  {
    "title": "魚豊先生×Official髭男dism 対談インタビュー",
    "publisher": "アニメ映画「ひゃくえむ。」",
    "url": "https://hyakuemu-anime.com/interview/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "rashisa"
    ],
    "referencedUrls": [
      "https://hyakuemu-anime.com/interview/"
    ]
  },
  {
    "title": "Official髭男dism、タワレコメンの新作より“恋の前ならえ”MV公開",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/news/detail/120337",
    "kind": "news",
    "date": "2015-03-12",
    "dateKind": "published",
    "relatedSongIds": [
      "ai-nandaga",
      "darling-indies",
      "koi-no-maenarae",
      "shihatsu-ga-michibiku",
      "sweet-tweet",
      "yuki-seku-asa"
    ],
    "referencedUrls": [
      "https://rockinon.com/news/detail/120337"
    ]
  },
  {
    "title": "Official髭男dism藤原聡 ×「鷹の爪」FROGMANが語る、創作でのし上がるために大切なこと",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2016/10/post-9916.html",
    "kind": "interview",
    "date": "2016-10-28",
    "dateKind": "published",
    "relatedSongIds": [
      "knit-no-boushi",
      "mikansei-na-mamade",
      "sweet-tweet",
      "whats-going-on",
      "yellow-car"
    ],
    "referencedUrls": [
      "https://realsound.jp/2016/10/post-9916.html",
      "https://realsound.jp/2016/10/post-9916_2.html",
      "https://realsound.jp/2016/10/post-9916_2.html/amp"
    ]
  },
  {
    "title": "Official髭男dism 恋の前ならえ 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/183919/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "koi-no-maenarae"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/183919/"
    ]
  },
  {
    "title": "Official髭男dism、満員の武道館でツアー終幕「声を出せない、最後のライブになるかもしれないね」",
    "publisher": "JOYSOUND 音楽ニュース",
    "url": "https://news.joysound.com/article/513561",
    "kind": "news",
    "date": "2023-02-22",
    "dateKind": "published",
    "relatedSongIds": [
      "hagan-song",
      "parade-indies",
      "yuugure-zoi"
    ],
    "referencedUrls": [
      "https://news.joysound.com/article/513561"
    ]
  },
  {
    "title": "ブレイク最有力！ aikoも絶賛する“ひげだん”が生ライブ",
    "publisher": "ライブドアニュース",
    "url": "https://news.livedoor.com/article/detail/13009398/",
    "kind": "interview",
    "date": "2017-05-01",
    "dateKind": "published",
    "relatedSongIds": [
      "yuugure-zoi"
    ],
    "referencedUrls": [
      "https://news.livedoor.com/article/detail/13009398/"
    ]
  },
  {
    "title": "Real Sound「MAN IN THE MIRROR」発表記事",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2016/04/post-7323.html",
    "kind": "news",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "coffee-to-syrup",
      "yuki-seku-asa"
    ],
    "referencedUrls": [
      "https://realsound.jp/2016/04/post-7323.html"
    ],
    "unavailable": true
  },
  {
    "title": "山陰より「Official髭男dism」がデビュー。「髭の似合う歳になっても、誰もがワクワクするような音楽を」",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/738309",
    "kind": "news",
    "date": "2015-02-06",
    "dateKind": "published",
    "relatedSongIds": [
      "ai-nandaga"
    ],
    "referencedUrls": [
      "https://barks.jp/news/738309/"
    ]
  },
  {
    "title": "Official髭男dism ダーリン。 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/183913/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "darling-indies"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/183913/"
    ]
  },
  {
    "title": "人生に寄り添うPOP集団・Official髭男dism、最新作で国民的バンドへ！",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/feat/officialhigedandism_201606",
    "kind": "interview",
    "date": "2016-06-15",
    "dateKind": "published",
    "relatedSongIds": [
      "clap-clap",
      "coffee-to-syrup",
      "happy-birthday-to-you",
      "koi-no-sarigiwa"
    ],
    "referencedUrls": [
      "https://rockinon.com/feat/officialhigedandism_201606/page:1"
    ]
  },
  {
    "title": "Official髭男dism “THE DAILY MIRROR tour 2016”をレポート",
    "publisher": "Fanplus Music",
    "url": "https://music.fanplus.co.jp/liveReport/20160707916e0854e",
    "kind": "news",
    "date": "2016-07-29",
    "dateKind": "published",
    "relatedSongIds": [
      "happy-birthday-to-you",
      "koi-no-sarigiwa",
      "nichiyoubi-no-loveletter",
      "zero-no-mamade"
    ],
    "referencedUrls": [
      "https://music.fanplus.co.jp/liveReport/20160707916e0854e",
      "https://music.fanplus.co.jp/news/20160707916e0854e"
    ]
  },
  {
    "title": "Official髭男dism ゼロのままでいられたら 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/209113/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "zero-no-mamade"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/209113/"
    ]
  },
  {
    "title": "Official髭男dism ニットの帽子 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/217967/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "knit-no-boushi"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/217967/"
    ]
  },
  {
    "title": "上京から10ヵ月、いきなり大成功！Official髭男dism、初ワンマン・ツアーのファイナル",
    "publisher": "DI:GA ONLINE",
    "url": "https://diskgarage.com/digaonline/liverepo/20655",
    "kind": "review",
    "date": "2016-12-06",
    "dateKind": "published",
    "relatedSongIds": [
      "knit-no-boushi"
    ],
    "referencedUrls": [
      "https://diskgarage.com/digaonline/liverepo/20655"
    ]
  },
  {
    "title": "Official髭男dismが3rd mini album『レポート』をリリース",
    "publisher": "Fanplus Music",
    "url": "https://music.fanplus.co.jp/special/20170309557e046cb",
    "kind": "interview",
    "date": "2017-03-31",
    "dateKind": "published",
    "relatedSongIds": [
      "55-song",
      "clap-clap",
      "equal-song",
      "hajimari-no-asa",
      "inu-ka-cat-ka",
      "midori-no-amayoke",
      "rolling-song",
      "trailer-song"
    ],
    "referencedUrls": [
      "https://music.fanplus.co.jp/news/20170309557e046cb",
      "https://music.fanplus.co.jp/special/20170309557e046cb"
    ]
  },
  {
    "title": "Official髭男dism藤原 ドラマーからボーカルへ「迷うぐらいだったらやって笑われた方がいい」",
    "publisher": "ライブドアニュース",
    "url": "https://news.livedoor.com/article/detail/13133559/",
    "kind": "interview",
    "date": "2017-05-30",
    "dateKind": "published",
    "relatedSongIds": [
      "itan-na-star"
    ],
    "referencedUrls": [
      "https://news.livedoor.com/article/detail/13133559/"
    ]
  },
  {
    "title": "ヒゲダン 藤原聡、憧れのaikoの魅力を語る「歌詞の素晴らしさを教えてくれたアーティスト」",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2020/02/post-509494.html",
    "kind": "news",
    "date": "2020-02-22",
    "dateKind": "published",
    "relatedSongIds": [
      "itan-na-star"
    ],
    "referencedUrls": [
      "https://realsound.jp/2020/02/post-509494.html"
    ]
  },
  {
    "title": "ネクスト・ブレイク候補最右翼、ヒゲダンことOfficial髭男dism。New Digital EP「LADY」の聴き所、いまライブで表現したいことを、藤原聡(Vo&Pf)がたっぷり語る。",
    "publisher": "DI:GA ONLINE",
    "url": "https://diskgarage.com/digaonline/interview/51424",
    "kind": "interview",
    "date": "2017-09-01",
    "dateKind": "published",
    "relatedSongIds": [
      "brothers-song",
      "driver-song",
      "lady-song",
      "tell-me-baby"
    ],
    "referencedUrls": [
      "https://diskgarage.com/digaonline/interview/51424/2"
    ]
  },
  {
    "title": "ヒゲダン「LADY」MV公開＆メ～テレ「デルサタ」新テーマ曲担当",
    "publisher": "Fanplus Music",
    "url": "https://music.fanplus.co.jp/news/20170910656f47bce",
    "kind": "news",
    "date": "2017-09-29",
    "dateKind": "published",
    "relatedSongIds": [
      "driver-song",
      "lady-song"
    ],
    "referencedUrls": [
      "https://music.fanplus.co.jp/news/20170910656f47bce"
    ]
  },
  {
    "title": "Official髭男dism、日本武道館で迎えた結成10周年ツアーファイナル 積み重ねた日々が証明するバンドとしての強さ",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2023/02/post-1265038.html",
    "kind": "review",
    "date": "2023-02-23",
    "dateKind": "published",
    "relatedSongIds": [
      "second-line"
    ],
    "referencedUrls": [
      "https://realsound.jp/2023/02/post-1265038.html"
    ]
  },
  {
    "title": "ギター&ベースに注目してほしいヒゲダンの楽曲 | SCHOOL OF LOCK! | ヒゲダン LOCKS!",
    "publisher": "TOKYO FM",
    "url": "https://www.tfm.co.jp/lock/higedan/index.php%40itemid%3D15835.html",
    "kind": "interview",
    "date": "2020-12-02",
    "dateKind": "broadcast",
    "relatedSongIds": [
      "driver-song"
    ],
    "referencedUrls": [
      "https://www.tfm.co.jp/lock/higedan/index.php%40itemid%3D15835.html"
    ]
  },
  {
    "title": "Official髭男dism、10月9日発売メジャーファースト・アルバム『Traveler』より「イエスタデイ」先行配信開始&収録楽曲公開！さらに2020年3月よりアリーナツアー開催決定！",
    "publisher": "ポニーキャニオン",
    "url": "https://news.ponycanyon.co.jp/2019/09/34237",
    "kind": "news",
    "date": "2019-09-11",
    "dateKind": "published",
    "relatedSongIds": [
      "yesterday-song"
    ],
    "referencedUrls": [
      "https://news.ponycanyon.co.jp/2019/09/34237"
    ]
  },
  {
    "title": "『あいのり：African Journey』主題歌はOfficial髭男dismの『ビンテージ』に決定！さらに、新シリーズのトレーラーを公開！",
    "publisher": "フジテレビ（PR TIMES）",
    "url": "https://prtimes.jp/a/?c=84&f=d84-902-pdf-0.pdf&r=902",
    "kind": "news",
    "date": "2019-08-22",
    "dateKind": "published",
    "relatedSongIds": [
      "vintage-song"
    ],
    "referencedUrls": [
      "https://prtimes.jp/a/?c=84&f=d84-902-pdf-0.pdf&r=902"
    ]
  },
  {
    "title": "Official髭男dism、10月9日リリースのニュー・アルバム『Traveler』収録の新曲“旅は道連れ”が「SUZUKI スイフト」TVCM「ドライブ父娘」篇CMソングに決定",
    "publisher": "TOWER RECORDS ONLINE",
    "url": "https://tower.jp/article/news/2019/09/17/tg005",
    "kind": "news",
    "date": "2019-09-17",
    "dateKind": "published",
    "relatedSongIds": [
      "tabi-wa-michizure"
    ],
    "referencedUrls": [
      "https://tower.jp/article/news/2019/09/17/tg005"
    ]
  },
  {
    "title": "スペシャルドラマ『U-NEXT presents あと３回、君に会える』が令和2年度文化庁芸術祭 テレビ・ドラマ部門 優秀賞を受賞！山本美月・眞栄田郷敦のコメントも到着",
    "publisher": "PR TIMES",
    "url": "https://prtimes.jp/main/html/rd/p/000000474.000031998.html",
    "kind": "news",
    "date": "2020-12-25",
    "dateKind": "published",
    "relatedSongIds": [
      "last-song"
    ],
    "referencedUrls": [
      "https://prtimes.jp/main/html/rd/p/000000474.000031998.html"
    ]
  },
  {
    "title": "Official髭男dism、『Traveler』制作の裏側を語る！曲作りは「自分の中から絞り出すだけではなく…」 | radiko news(ラジコニュース)",
    "publisher": "radiko news",
    "url": "https://news.radiko.jp/article/station/FMJ/36301/",
    "kind": "interview",
    "date": "2019-10-11",
    "dateKind": "published",
    "relatedSongIds": [
      "last-song",
      "travelers-outro"
    ],
    "referencedUrls": [
      "https://news.radiko.jp/article/station/FMJ/36301/"
    ]
  },
  {
    "title": "Official髭男dism、メジャー2ndアルバム『Editorial』収録曲「フィラメント」が10/10放送\"出雲駅伝\"テーマ・ソングに決定",
    "publisher": "Skream!",
    "url": "https://skream.jp/news/2021/10/higedan_filament_izumo_ekiden.php",
    "kind": "news",
    "date": "2021-10-03",
    "dateKind": "published",
    "relatedSongIds": [
      "filament-song"
    ],
    "referencedUrls": [
      "https://skream.jp/news/2021/10/higedan_filament_izumo_ekiden.php"
    ]
  },
  {
    "title": "Official髭男dismの「HELLO EP」をApple Musicで",
    "publisher": "Apple Music",
    "url": "https://music.apple.com/jp/album/hello-ep/1522413697",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "hello-song"
    ],
    "referencedUrls": [
      "https://music.apple.com/jp/album/hello-ep/1522413697"
    ]
  },
  {
    "title": "2020年「カルピスウォーター」CMソング 「パラボラ」 | Official髭男dism",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://higedanparabora.com/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "parabola-song"
    ],
    "referencedUrls": [
      "https://higedanparabora.com/"
    ]
  },
  {
    "title": "ヒゲダン、ミセス、マカロニえんぴつ……親しみやすさの背後に光るスパイスが効いた音作り 各バンド最新作を分析",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2020/05/post-548035.html",
    "kind": "review",
    "date": "2020-05-04",
    "dateKind": "published",
    "relatedSongIds": [
      "parabola-song"
    ],
    "referencedUrls": [
      "https://realsound.jp/2020/05/post-548035.html/amp"
    ]
  },
  {
    "title": "Official髭男dism「Universe」インタビュー",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://universe.ponycanyon.co.jp/interview/",
    "kind": "interview",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song"
    ],
    "referencedUrls": [
      "https://universe.ponycanyon.co.jp/interview/"
    ]
  },
  {
    "title": "厳しい時をこえ、ようやく訪れた歓喜の瞬間！ Official髭男dism、アルバム『Rejoice』の制作秘話～前編。",
    "publisher": "J-WAVE",
    "url": "https://www.j-wave.co.jp/original/tokyounited/archives/the-hidden-story/2024/07/26-103449.html",
    "kind": "interview",
    "date": "2024-07-26",
    "dateKind": "published",
    "relatedSongIds": [
      "finder-song",
      "get-back-to-jinsei",
      "lost-in-my-room"
    ],
    "referencedUrls": [
      "https://www.j-wave.co.jp/original/tokyounited/archives/the-hidden-story/2024/07/26-103449.html"
    ]
  },
  {
    "title": "Official髭男dismの楢崎誠に単独インタビュー！『異動辞令は音楽隊！』主題歌制作秘話やバンドへの想いまで",
    "publisher": "MOVIE WALKER PRESS",
    "url": "https://press.moviewalker.jp/news/article/1098780/",
    "kind": "interview",
    "date": "2022-08-25",
    "dateKind": "published",
    "relatedSongIds": [
      "choral-a-song"
    ],
    "referencedUrls": [
      "https://press.moviewalker.jp/news/article/1098780/"
    ]
  },
  {
    "title": "Official髭男dism・楢﨑誠、映画『異動辞令は音楽隊！』にカメオ出演決定",
    "publisher": "THE FIRST TIMES",
    "url": "https://www.thefirsttimes.jp/news/0000152584/",
    "kind": "news",
    "date": "2022-07-18",
    "dateKind": "published",
    "relatedSongIds": [
      "choral-a-song"
    ],
    "referencedUrls": [
      "https://www.thefirsttimes.jp/news/0000152584/"
    ]
  },
  {
    "title": "Official髭男dism 公式ニュース一覧（英語版）",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/list/3/6/?lang=en",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "hagan-song"
    ],
    "referencedUrls": [
      "https://higedan.com/news/list/3/6/?lang=en"
    ]
  },
  {
    "title": "Official髭男dismの「Rejoice」をApple Musicで",
    "publisher": "Apple Music",
    "url": "https://music.apple.com/jp/album/rejoice/1754117467",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "anarchy-song",
      "b-side-blues",
      "catchball-song",
      "dakuten-song",
      "finder-song",
      "uramitsurami-kiwami"
    ],
    "referencedUrls": [
      "https://music.apple.com/jp/album/rejoice/1754117467"
    ]
  },
  {
    "title": "Official髭男dismが代弁する、労働者のリアルな日常 “真の応援ソング”たる理由",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2023/10/post-1468145.html",
    "kind": "review",
    "date": "2023-10-22",
    "dateKind": "published",
    "relatedSongIds": [
      "nichijou-song"
    ],
    "referencedUrls": [
      "https://realsound.jp/2023/10/post-1468145.html"
    ]
  },
  {
    "title": "「芯の強い人間、芯の強いバンドに成長できたと思う」― Official髭男dismのニューアルバム『Rejoice』について、藤原聡さんに聞く。",
    "publisher": "J-WAVE",
    "url": "https://www.j-wave.co.jp/original/tokyounited/archives/the-hidden-story/2024/08/02-104619.html",
    "kind": "interview",
    "date": "2024-08-02",
    "dateKind": "published",
    "relatedSongIds": [
      "anarchy-song",
      "chessboard-song",
      "uramitsurami-kiwami"
    ],
    "referencedUrls": [
      "https://www.j-wave.co.jp/original/tokyounited/archives/the-hidden-story/2024/08/02-104619.html"
    ]
  },
  {
    "title": "【コラム】Official髭男dismが人生を描く、最新シングル「Chessboard / 日常」",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/984244",
    "kind": "review",
    "date": "2023-10-11",
    "dateKind": "published",
    "relatedSongIds": [
      "chessboard-song"
    ],
    "referencedUrls": [
      "https://barks.jp/news/984244"
    ]
  },
  {
    "title": "Chessboard／日常｜Official髭男dism 公式作品情報",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/discography/detail/22/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "chessboard-song"
    ],
    "referencedUrls": [
      "https://higedan.com/discography/detail/22/"
    ]
  },
  {
    "title": "【インタビュー】Official髭男dism、新作『Rejoice』のすべて──困難を乗り越えて辿り着いた、ポジティブで揺るぎない大傑作を4人で語る",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/interview/detail/210118",
    "kind": "interview",
    "date": "2024-07-31",
    "dateKind": "published",
    "relatedSongIds": [
      "b-side-blues"
    ],
    "referencedUrls": [
      "https://rockinon.com/interview/detail/210118.amp?page=2"
    ]
  },
  {
    "title": "新曲「B-Side Blues」が『キリン 午後の紅茶』新CMソングに決定 !",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/detail/100994",
    "kind": "news",
    "date": "2024-06-17",
    "dateKind": "published",
    "relatedSongIds": [
      "b-side-blues"
    ],
    "referencedUrls": [
      "https://higedan.com/news/detail/100994"
    ]
  },
  {
    "title": "Official髭男dism「はたらく細胞」主題歌担当、ボーカル藤原聡は原作のファン",
    "publisher": "JOYSOUND 音楽ニュース",
    "url": "https://news.joysound.com/article/591228",
    "kind": "news",
    "date": "2024-09-17",
    "dateKind": "published",
    "relatedSongIds": [
      "fifty-percent"
    ],
    "referencedUrls": [
      "https://news.joysound.com/article/591228"
    ]
  },
  {
    "title": "Official髭男dism 「Sanitizer」",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://hgdn-20251201.ponycanyon.co.jp/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "sanitizer"
    ],
    "referencedUrls": [
      "https://hgdn-20251201.ponycanyon.co.jp/"
    ]
  },
  {
    "title": "Official髭男dism、新曲「Sanitizer」サプライズ・リリース＆MV公開。約7年ぶりとなるノンタイアップ・シングル",
    "publisher": "Skream!",
    "url": "https://skream.jp/news/2025/12/higedan_sanitizer_release_mv.php",
    "kind": "news",
    "date": "2025-12-01",
    "dateKind": "published",
    "relatedSongIds": [
      "sanitizer"
    ],
    "referencedUrls": [
      "https://skream.jp/news/2025/12/higedan_sanitizer_release_mv.php"
    ]
  },
  {
    "title": "オープニング主題歌公開！",
    "publisher": "アニメ「ダーウィン事変」",
    "url": "https://darwinsincident.net/news/20251210_01.html",
    "kind": "news",
    "date": "2025-12-10",
    "dateKind": "published",
    "relatedSongIds": [
      "make-me-wonder"
    ],
    "referencedUrls": [
      "https://darwinsincident.net/news/20251210_01.html"
    ]
  },
  {
    "title": "記録・ランキング | ヒゲダンセトリ",
    "publisher": "ヒゲダンセトリ",
    "url": "https://higedan-setlist.net/stats/",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "make-me-wonder"
    ],
    "referencedUrls": [
      "https://higedan-setlist.net/stats/"
    ]
  },
  {
    "title": "綾瀬はるか × 藤原聡（Official髭男dism）スペシャル対談【PART3】｜『人はなぜラブレターを書くのか』【4月17日(金)公開】",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=oPBpqo9xmL0",
    "kind": "video",
    "date": "2026-03-20",
    "dateKind": "published",
    "relatedSongIds": [
      "elderflower"
    ],
    "referencedUrls": [
      "https://www.youtube.com/watch?v=oPBpqo9xmL0"
    ]
  },
  {
    "title": "NEWS｜映画『人はなぜラブレターを書くのか』公式サイト",
    "publisher": "映画「人はなぜラブレターを書くのか」",
    "url": "https://loveletter.toho-movie.jp/news.html",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "elderflower"
    ],
    "referencedUrls": [
      "https://loveletter.toho-movie.jp/news.html"
    ]
  },
  {
    "title": "今のOfficial髭男dismだからこそ辿り着いた純度 『スターダスト/エルダーフラワー』で説く愛の“衝突”と”継承”",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2026/04/post-2375757_2.html",
    "kind": "review",
    "date": "2026-04-23",
    "dateKind": "published",
    "relatedSongIds": [
      "elderflower"
    ],
    "referencedUrls": [
      "https://realsound.jp/2026/04/post-2375757_2.html"
    ]
  },
  {
    "title": "Official髭男dism：初の日曜劇場主題歌 堤真一主演「GIFT」に新曲「スターダスト」 - MANTANWEB（まんたんウェブ）",
    "publisher": "MANTANWEB",
    "url": "https://mantan-web.jp/article/20260318dog00m200124000a.html",
    "kind": "news",
    "date": "2026-03-19",
    "dateKind": "published",
    "relatedSongIds": [
      "stardust"
    ],
    "referencedUrls": [
      "https://mantan-web.jp/article/20260318dog00m200124000a.html"
    ]
  },
  {
    "title": "新曲「スターダスト」が日曜劇場『ＧＩＦＴ』主題歌に決定！",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/detail/101603",
    "kind": "news",
    "date": "2026-03-19",
    "dateKind": "published",
    "relatedSongIds": [
      "stardust"
    ],
    "referencedUrls": [
      "https://higedan.com/news/detail/101603"
    ]
  },
  {
    "title": "Official髭男dism Pretender 歌詞",
    "publisher": "歌ネット",
    "url": "https://www.uta-net.com/song/268710/",
    "kind": "lyrics",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [
      "https://www.uta-net.com/song/268710/"
    ]
  },
  {
    "title": "Official髭男dism 公式X（@officialhige）",
    "publisher": "X（@officialhige）",
    "url": "https://x.com/officialhige",
    "kind": "sns",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "新譜・ライブ公演・ツアー振替案内や舞台裏など、最新情報や発信を届ける公式Xアカウント。"
  },
  {
    "title": "Official髭男dism 公式Instagram（@officialhigedandism）",
    "publisher": "Instagram（@officialhigedandism）",
    "url": "https://www.instagram.com/officialhigedandism/",
    "kind": "sns",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "ライブ写真や告知、メンバーのストーリーズ発信・リクエスト募集などが行われる公式Instagramアカウント。"
  },
  {
    "title": "Official髭男dism 公式YouTubeチャンネル",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/@officialhigedandism",
    "kind": "video",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "MV、ライブダイジェスト、Behind The Scenes、スタジオライブ生配信などを公開する公式チャンネル。"
  },
  {
    "title": "OFFICIAL HIGE DANDISM one-man tour 2026 一部公演のチケット追加販売決定（公式YouTube投稿）",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/post/UgkxFWW-0r1Tzk-ywmZxlh4zIUaygrKnfauk",
    "kind": "sns",
    "date": "2026-06-05",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "公式YouTubeコミュニティ投稿による2026年夏のアリーナ公演（SGC HALL ARIAKE・大阪城ホール・Kアリーナ横浜）追加販売の告知。"
  },
  {
    "title": "Official髭男dism - Pretender (Acoustic ver.)［Official Video］",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=0sDmhAItwbI",
    "kind": "video",
    "date": "2019-05-22",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [],
    "note": "2019年5月12日のYouTube Space Tokyo生配信特番の時期にあわせて公開・収録されたアコースティック版映像。"
  },
  {
    "title": "[BD/DVD Digest] Official髭男dism 「Road to \"one man tour 2021-2022\" from 2021.06.23 ぴあアリーナMM –」",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=1i9IfhFqxXM",
    "kind": "video",
    "date": "2022-06-02",
    "dateKind": "published",
    "relatedSongIds": [
      "i-love",
      "hello-song",
      "pretender",
      "cry-baby",
      "universe-song"
    ],
    "referencedUrls": [],
    "note": "2021年6月23日・24日 ぴあアリーナMM公演（約1年4か月ぶりの有観客ワンマン）の公式ダイジェスト映像。"
  },
  {
    "title": "［BD/DVD Digest］Official髭男dism「one-man tour 2021-2022 -Editorial-」＠SAITAMA SUPER ARENA",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=6T8pCwKVQHY",
    "kind": "video",
    "date": "2022-09-30",
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song",
      "anarchy-song",
      "cry-baby",
      "editorial-song",
      "pretender",
      "i-love"
    ],
    "referencedUrls": [],
    "note": "2022年3月21日 さいたまスーパーアリーナ公演（Editorialツアー追加公演最終日）映像作品の公式ダイジェスト。"
  },
  {
    "title": "[BD/DVD Digest] Official髭男dism「Editorial」発売記念 ONLINE FREE LIVE in Tokyo Opera City",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=CfiY_yta4-k",
    "kind": "video",
    "date": "2023-09-12",
    "dateKind": "published",
    "relatedSongIds": [
      "i-love",
      "universe-song",
      "cry-baby",
      "editorial-song"
    ],
    "referencedUrls": [],
    "note": "2021年8月28日 東京オペラシティ コンサートホール無料配信ライブ（「アポトーシス」ライブ初披露）のダイジェスト映像。"
  },
  {
    "title": "[Digest] Official髭男dism \"Live at Radio\"",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=g--p8_sgGXE",
    "kind": "video",
    "date": "2024-05-08",
    "dateKind": "published",
    "relatedSongIds": [
      "nichijou-song",
      "tattoo",
      "chessboard-song",
      "mixed-nuts",
      "soulsoup"
    ],
    "referencedUrls": [],
    "note": "2024年5月7日に全国ラジオ同時生放送として届けられた10人編成スタジオライブ「Live at Radio」の公式ダイジェスト。"
  },
  {
    "title": "[BD/DVD Digest] Official髭男dism「SHOCKING NUTS TOUR selected from NIPPON BUDOKAN」",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=q7oSGQ0ZHxY",
    "kind": "video",
    "date": "2024-06-21",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender",
      "subtitle",
      "mixed-nuts",
      "white-noise"
    ],
    "referencedUrls": [],
    "note": "アルバム『Rejoice』特典Blu-ray/DVD収録の2023年2月16日 日本武道館ツアーファイナル公演ダイジェスト映像。"
  },
  {
    "title": "[本予告] 劇場版 OFFICIAL HIGE DANDISM LIVE at STADIUM 2025",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=8RlPowQ0jms",
    "kind": "video",
    "date": "2025-09-18",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender",
      "shukumei",
      "same-blue",
      "fifty-percent",
      "tattoo"
    ],
    "referencedUrls": [],
    "note": "2025年6月1日 日産スタジアム公演を中心に収録した劇場版映画の本予告映像。"
  },
  {
    "title": "[BD/DVD Digest] Official髭男dism「one-man tour FOUR-RE:ISM selected from Zepp Nagoya(2026.01.22)」",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=-HlybtZvqd4",
    "kind": "video",
    "date": "2026-04-22",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise",
      "no-doubt",
      "subtitle",
      "hagan-song",
      "fire-ground"
    ],
    "referencedUrls": [],
    "note": "メンバー4人編成によるFC限定ツアー「FOUR-RE:ISM」ファイナル（2026年1月22日 Zepp Nagoya・松浦匡希誕生日当日）のダイジェスト映像。"
  },
  {
    "title": "Pretender (OFFICIAL HIGE DANDISM LIVE at STADIUM 2025)",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=Js8YCUGxzeU",
    "kind": "video",
    "date": "2026-07-14",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [],
    "note": "2025年6月1日 日産スタジアム公演より公式YouTube公開された「Pretender」ライブ映像。"
  },
  {
    "title": "ASIA TOUR 2026 in SINGAPORE",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=ABDEtVqaHpc",
    "kind": "video",
    "date": "2026-08-21",
    "dateKind": "published",
    "relatedSongIds": [
      "tattoo",
      "nichijou-song",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2026年8月21日 シンガポール公演（The Star Theatre）の公式ダイジェスト動画。"
  },
  {
    "title": "ASIA TOUR 2026 in TAIPEI",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=Tgahqq7yul0",
    "kind": "video",
    "date": "2026-08-30",
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo",
      "subtitle",
      "pretender"
    ],
    "referencedUrls": [],
    "note": "2026年8月29日・30日 台北アリーナ公演の公式ダイジェスト動画。"
  },
  {
    "title": "ASIA TOUR 2026 in BANGKOK",
    "publisher": "YouTube",
    "url": "https://www.youtube.com/watch?v=105tIfw5AjU",
    "kind": "video",
    "date": "2026-09-06",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue",
      "mixed-nuts",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2026年9月6日 バンコク公演（ASIA TOUR 2026ファイナル）の公式ダイジェスト動画。"
  },
  {
    "title": "［DVD］LIVE COLLECTION 2016-2018",
    "publisher": "Official髭男dism",
    "url": "https://higedan-store.jp/products/li-ohd-00014",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "koi-no-maenarae",
      "coffee-to-syrup",
      "zero-no-mamade"
    ],
    "referencedUrls": [],
    "note": "2016年7月23日 SHIBUYA TAKE OFF 7（THE DAILY MIRROR tour 2016）のライブ映像などを収録した公式通販作品。"
  },
  {
    "title": "Official髭男dism、赤坂BLITZ含むワンマンツアー開催決定",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/793845/",
    "kind": "news",
    "date": "2017-06-19",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "2017年11月〜12月開催『one-man tour 2017 -winter-』（島根県民会館中ホール〜赤坂BLITZ）の告知記事。"
  },
  {
    "title": "Official髭男dism 「one-man tour 2017 -winter-」ツアーファイナルの模様をフォトライブレポート！",
    "publisher": "DI:GA ONLINE",
    "url": "https://diskgarage.com/digaonline/liverepo/71457",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "koi-no-maenarae",
      "brothers-song",
      "lady-song",
      "tell-me-baby",
      "rolling-song"
    ],
    "referencedUrls": [],
    "note": "2017年12月8日 マイナビBLITZ赤坂公演（のちに『エスカパレード』初回盤DVDへ10曲収録）のライブレポート。"
  },
  {
    "title": "Official髭男dism、渋谷に人だかりを作ったイベントでメジャーデビュー発表（イベントレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/277467",
    "kind": "review",
    "date": "2018-04-10",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt",
      "koi-no-maenarae",
      "tell-me-baby"
    ],
    "referencedUrls": [],
    "note": "2018年4月10日 渋谷モディでの『エスカパレード』発売記念フリーライブ＆「ノーダウト」ゲリラ発売・メジャーデビュー発表レポート。"
  },
  {
    "title": "Official髭男dism、メジャーデビュー決定。「ノーダウト」シングルが突如店頭に",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/814066/",
    "kind": "news",
    "date": "2018-04-10",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt"
    ],
    "referencedUrls": [],
    "note": "渋谷モディでのメジャーデビュー発表と「ノーダウト」サプライズリリース、渋谷での号外配布を伝える記事。"
  },
  {
    "title": "Official髭男dism「夢のような景色」広がった中野サンプラザワンマン（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/290188",
    "kind": "review",
    "date": "2018-07-07",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt",
      "115man-kilo",
      "hatsumeika-song"
    ],
    "referencedUrls": [],
    "note": "2018年7月5日 中野サンプラザホール公演（小手伸也ナレーション・『Stand By You EP』初回盤DVD収録）のライブレポート。"
  },
  {
    "title": "【ライブレポート】Official髭男dism、グッドミュージックで湧かせた過去最大規模の饗宴",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/820843/",
    "kind": "review",
    "date": "2018-07-09",
    "dateKind": "published",
    "relatedSongIds": [
      "no-doubt",
      "tell-me-baby",
      "hatsumeika-song"
    ],
    "referencedUrls": [],
    "note": "2018年7月5日 中野サンプラザホール『one-man tour 2018』ファイナル公演のライブレポート。"
  },
  {
    "title": "Official髭男dism ＠ ヒューリックホール東京 (東京都) (2018.10.13)",
    "publisher": "LiveFans",
    "url": "https://www.livefans.jp/events/1008039",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "stand-by-you",
      "115man-kilo",
      "yuugure-zoi"
    ],
    "referencedUrls": [],
    "note": "2018年10月13日 ヒューリックホール東京『HIGEDAN acoustic one-man live 2018 -Autumn-』のセットリスト記録。"
  },
  {
    "title": "Official髭男dism、4人のハーモニー響かせたラゾーナフリーライブ（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/303673",
    "kind": "review",
    "date": "2018-10-14",
    "dateKind": "published",
    "relatedSongIds": [
      "stand-by-you",
      "115man-kilo",
      "bad-for-me",
      "no-doubt"
    ],
    "referencedUrls": [],
    "note": "2018年10月14日 ラゾーナ川崎プラザ『Stand By You EP』フリーアコースティックライブのレポート。"
  },
  {
    "title": "Official髭男dism、初の日本武道館ワンマンが決定",
    "publisher": "BARKS",
    "url": "https://barks.jp/news/833731/",
    "kind": "news",
    "date": "2019-01-24",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "2019年1月24日 NHKホール公演で発表された自身初の日本武道館単独公演決定ニュース。"
  },
  {
    "title": "ヒゲダン、初の9人編成ライブで魅了 『Official髭男dism one-man tour 18/19』NHKホール公演",
    "publisher": "ぴあ音楽",
    "url": "https://lp.p.pia.jp/article/news/35059/index.html",
    "kind": "review",
    "date": "2019-02-02",
    "dateKind": "published",
    "relatedSongIds": [
      "escapade-song",
      "115man-kilo",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2019年1月24日 NHKホール公演（初の9人編成・『Traveler』初回盤収録）のライブレポート。"
  },
  {
    "title": "Official髭男dismの音楽はここから生まれた！ 地元・島根への里帰り密着特番を観て",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/news/detail/186057",
    "kind": "review",
    "date": "2019-05-08",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "2019年2月2日 島根県民会館大ホール凱旋ファイナルにも密着したNHK広島放送局特番『髭男“ヒゲダン”ふるさとへ』のレビュー。"
  },
  {
    "title": "Official髭男dism、5/12にニュー・シングル『Pretender』発売記念した特番を生配信",
    "publisher": "Skream!",
    "url": "https://skream.jp/news/2019/05/higedan_new_single_youtube_space_tokyo.php",
    "kind": "news",
    "date": "2019-05-01",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [],
    "note": "2019年5月12日 YouTube Space Tokyoからの公式生配信特番『Talk & Live Session』告知記事。"
  },
  {
    "title": "Official髭男dism、お台場フリーライブに5000人が熱狂（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/332013",
    "kind": "review",
    "date": "2019-05-18",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender",
      "no-doubt",
      "115man-kilo",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2019年5月18日 ダイバーシティ東京プラザ『Pretender』発売記念フリーライブのレポート。"
  },
  {
    "title": "Official髭男dism、初の武道館で1万2000人にグッドミュージック届ける（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/339000",
    "kind": "review",
    "date": "2019-07-09",
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo",
      "pretender",
      "shukumei",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2019年7月8日 初の日本武道館公演（360度客席・『Traveler』＆全国ホールツアー発表）の公式ライブレポート。"
  },
  {
    "title": "Official髭男dism、メジャーデビュー1年で夢の舞台へ",
    "publisher": "DI:GA ONLINE",
    "url": "https://diskgarage.com/digaonline/liverepo/121706",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "115man-kilo",
      "pretender",
      "shukumei",
      "stand-by-you"
    ],
    "referencedUrls": [],
    "note": "2019年7月8日 日本武道館公演のライブレポート。"
  },
  {
    "title": "ヒゲダンとsumika、サプライズと熱狂に満ちた華麗なる競演",
    "publisher": "Rolling Stone Japan",
    "url": "https://rollingstonejapan.com/articles/detail/33248/2/1/1",
    "kind": "review",
    "date": "2020-02-21",
    "dateKind": "published",
    "relatedSongIds": [
      "vintage-song",
      "tell-me-baby"
    ],
    "referencedUrls": [],
    "note": "2020年2月19日 FM802 MUSIC FREAKS LIVE（sumikaとの相互カバー）ライブレポート。"
  },
  {
    "title": "Official髭男dism最長ホールツアー、“期待感を500倍くらい上回って”鳥取で大団円（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/368464",
    "kind": "review",
    "date": "2020-02-24",
    "dateKind": "published",
    "relatedSongIds": [
      "yesterday-song",
      "fire-ground",
      "i-love"
    ],
    "referencedUrls": [],
    "note": "2020年2月22日 米子市公会堂（振替ファイナル「ボーナスステージ」）公演の音楽ナタリー公式ライブレポート。"
  },
  {
    "title": "Official髭男dism、自身最長ホールツアーが閉幕 米子公会堂にて行われたツアーファイナルのレポートが到着",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/85289/2",
    "kind": "review",
    "date": "2020-02-25",
    "dateKind": "published",
    "relatedSongIds": [
      "yesterday-song",
      "i-love"
    ],
    "referencedUrls": [],
    "note": "2020年2月22日 米子市公会堂『Hall Travelers』ツアーファイナルのレポート記事。"
  },
  {
    "title": "Official髭男dism／「ONLINE LIVE 2020 - Arena Travelers -」＠東京ガーデンシアター",
    "publisher": "rockinon.com",
    "url": "https://rockinon.com/live/detail/195867",
    "kind": "review",
    "date": "2020-09-28",
    "dateKind": "published",
    "relatedSongIds": [
      "hello-song",
      "rowan-song",
      "vintage-song"
    ],
    "referencedUrls": [],
    "note": "2020年9月26日『ONLINE LIVE 2020 - Arena Travelers -』（12万人超視聴・12人編成）のライブレポート。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dismが初のオンラインライブ開催 画面越しでも伝わった“音楽を共有する楽しさ”",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/92604/2",
    "kind": "review",
    "date": "2020-09-27",
    "dateKind": "published",
    "relatedSongIds": [
      "hello-song",
      "pretender",
      "i-love"
    ],
    "referencedUrls": [],
    "note": "2020年9月26日 初の無観客オンラインライブのレポート。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dism、ファンとメンバーが選んだ名曲揃いのFCライブ開催",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/99133/",
    "kind": "review",
    "date": "2021-04-19",
    "dateKind": "published",
    "relatedSongIds": [
      "zero-no-mamade",
      "cry-baby"
    ],
    "referencedUrls": [],
    "note": "2021年4月18日『FC Tour Vol.2 - The Blooming Universe ONLINE -』（投票1位「ゼロのままでいられたら」・新曲「Cry Baby」＆初アリーナツアー発表）のレポート。"
  },
  {
    "title": "Official髭男dismに圧倒され続けた待望の有観客ライブ ワンマンツアー前哨戦で見せたパワーアップした姿",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2021/07/post-810614.html",
    "kind": "review",
    "date": "2021-07-10",
    "dateKind": "published",
    "relatedSongIds": [
      "i-love",
      "cry-baby",
      "universe-song"
    ],
    "referencedUrls": [],
    "note": "2021年6月23日・24日 ぴあアリーナMM『Road to 「one-man tour 2021-2022」』ライブレポート。"
  },
  {
    "title": "Official髭男dism、東京オペラシティにてオンラインフリーライブ開催",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/103446/2",
    "kind": "news",
    "date": "2021-08-30",
    "dateKind": "published",
    "relatedSongIds": [
      "editorial-song",
      "cry-baby"
    ],
    "referencedUrls": [],
    "note": "2021年8月28日 東京オペラシティ コンサートホールでのYouTube無料生配信（同時視聴約19万人・「アポトーシス」初披露）記事。"
  },
  {
    "title": "Official髭男dism、2021年に東京オペラシティで開催したフリーライブのダイジェスト映像を公開",
    "publisher": "THE FIRST TIMES",
    "url": "https://www.thefirsttimes.jp/news/0000325242/",
    "kind": "news",
    "date": "2023-09-12",
    "dateKind": "published",
    "relatedSongIds": [
      "editorial-song",
      "i-love"
    ],
    "referencedUrls": [],
    "note": "東京オペラシティ公演のダイジェスト映像公開を伝えるニュース。"
  },
  {
    "title": "Official髭男dism ＠ ぴあアリーナMM (神奈川県) (2021.09.04)",
    "publisher": "LiveFans",
    "url": "https://www.livefans.jp/events/1310540",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song",
      "hello-song",
      "editorial-song"
    ],
    "referencedUrls": [],
    "note": "2021年9月4日 ぴあアリーナMM（『Editorial』全国アリーナツアー初日）のセットリスト記録。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dism、届ける先は一人ひとり。バンドのまっすぐな信念が感じられたSSA公演",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/111613/2",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song",
      "anarchy-song",
      "editorial-title-track"
    ],
    "referencedUrls": [],
    "note": "2022年3月21日 さいたまスーパーアリーナ公演（『Editorial』ツアー映像作品収録公演）のライブレポート。"
  },
  {
    "title": "sumikaとヒゲダンが豊洲PITで対バン！お互いの楽曲カバーも飛び出した特別な夜（ライブレポート）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/493495",
    "kind": "review",
    "date": "2022-09-13",
    "dateKind": "published",
    "relatedSongIds": [
      "vintage-song",
      "stand-by-you",
      "mixed-nuts"
    ],
    "referencedUrls": [],
    "note": "2022年9月12日 豊洲PIT『sumika presents「TOOY」#1』（相互カバー曲披露）の公式ライブレポート。"
  },
  {
    "title": "【セットリスト】Official髭男dism LIVEツアー2022『SHOCKING NUTS TOUR』",
    "publisher": "ゾノサイト",
    "url": "https://zonosite.com/2022/09/28/post-8128/",
    "kind": "review",
    "date": "2022-09-28",
    "dateKind": "published",
    "relatedSongIds": [
      "subtitle",
      "escapade-song",
      "mixed-nuts"
    ],
    "referencedUrls": [],
    "note": "2022年9月28日 青森初日公演（「Subtitle」ピアノ弾き語り初披露・初日限定「ESCAPADE」）の詳細ライブレポート。"
  },
  {
    "title": "Official髭男dismメンバー3人コロナ陽性、本日の武道館含むツアー3公演が延期もしくは中止に",
    "publisher": "JOYSOUND 音楽ニュース",
    "url": "https://news.joysound.com/article/499500",
    "kind": "news",
    "date": "2022-10-30",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "『SHOCKING NUTS TOUR』2022年10月30日武道館・11月4〜5日大阪公演の延期・振替経緯を伝えるニュース。"
  },
  {
    "title": "Official髭男dism ＠ 旭川市民文化会館 大ホール (北海道) (2022.11.16)",
    "publisher": "LiveFans",
    "url": "https://www.livefans.jp/events/1419731",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts",
      "subtitle"
    ],
    "referencedUrls": [],
    "note": "2022年11月16日 旭川公演（一部公演延期からのSHOCKING NUTSツアー再開回）のセットリスト記録。"
  },
  {
    "title": "REPORT OF 『Official髭男dism SHOCKING NUTS TOUR』in 仙台サンプラザホール",
    "publisher": "note（瑞野蒼人）",
    "url": "https://note.com/mizuno_aohito/n/na7665c9ac50c",
    "kind": "review",
    "date": "2022-12-31",
    "dateKind": "published",
    "relatedSongIds": [
      "universe-song",
      "fire-ground",
      "clap-clap"
    ],
    "referencedUrls": [],
    "note": "2022年12月22日 仙台サンプラザホール2日目公演（「FIRE GROUND」急遽1コーラス演奏の経緯）の参加レポート。"
  },
  {
    "title": "Official髭男dism ＠ 日本武道館 (東京都) (2023.02.15)",
    "publisher": "LiveFans",
    "url": "https://www.livefans.jp/events/1499384",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "parade-indies",
      "universe-song",
      "nichiyoubi-no-loveletter"
    ],
    "referencedUrls": [],
    "note": "2023年2月15日 日本武道館Day3公演（楢﨑誠の鈴木常吉「思ひで」繋ぎ弾き語り・アンコール順）のセットリスト記録。"
  },
  {
    "title": "Official髭男dism、満員の武道館でツアー終幕「声を出せない、最後のライブになるかもしれないね」（ライブレポート / 写真14枚）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/513561",
    "kind": "review",
    "date": "2023-02-22",
    "dateKind": "published",
    "relatedSongIds": [
      "parade-indies",
      "subtitle",
      "white-noise",
      "mixed-nuts"
    ],
    "referencedUrls": [],
    "note": "2023年2月16日 日本武道館ファイナル公演（「楢﨑まさよし」ビジョン演出やカノンロック等）の公式ライブレポート。"
  },
  {
    "title": "Official髭男dism、「SHOCKING NUTS」ツアー日本武道館公演を全国40カ所の映画館で上映",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/573829",
    "kind": "news",
    "date": "2024-05-17",
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts",
      "white-noise"
    ],
    "referencedUrls": [],
    "note": "『SHOCKING NUTS TOUR selected from NIPPON BUDOKAN』の全国劇場上映＆『Rejoice』特典収録を伝える記事。"
  },
  {
    "title": "Official髭男dism、メジャー3rdアルバム『Rejoice』リリース 全国5都市を巡るアリーナツアー開催も",
    "publisher": "Real Sound",
    "url": "https://realsound.jp/2024/05/post-1654282.html",
    "kind": "news",
    "date": "2024-05-07",
    "dateKind": "published",
    "relatedSongIds": [
      "soulsoup",
      "nichijou-song",
      "chessboard-song"
    ],
    "referencedUrls": [],
    "note": "2024年5月7日『Live at Radio』生放送での『Rejoice』発売＆アリーナツアー発表ニュース。"
  },
  {
    "title": "Official髭男dism Arena Tour 2024 - Rejoice – 開催決定！",
    "publisher": "Official髭男dism",
    "url": "https://higedan.com/news/detail/100959",
    "kind": "official",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "『Arena Tour 2024 - Rejoice -』全日程の公式開催案内。"
  },
  {
    "title": "Official髭男dismがライブの喜び噛み締めた“UNOFFICIAL”ワンマン「俺たちの人生が帰ってきたー!!」（ライブレポート / 写真6枚）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/583562",
    "kind": "review",
    "date": "2024-07-24",
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts",
      "choral-a-song",
      "filament-song",
      "rowan-song"
    ],
    "referencedUrls": [],
    "note": "2024年7月23日 Zepp Haneda『one-man live 2024 -UNOFFICIAL-』（約1年5か月ぶり復帰・声出し解禁）の公式ライブレポート。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dism「生きててよかった！」1年5か月ぶりのワンマンライブで見せた圧巻のステージ",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/139995/2",
    "kind": "review",
    "date": "2024-07-26",
    "dateKind": "published",
    "relatedSongIds": [
      "mixed-nuts",
      "choral-a-song",
      "no-doubt"
    ],
    "referencedUrls": [],
    "note": "2024年7月23日 Zepp Haneda『-UNOFFICIAL-』ワンマン公演のBillboard JAPANライブレポート。"
  },
  {
    "title": "Official髭男dism、「Official髭男dism Arena Tour 2024 - Rejoice -」Kアリーナ横浜公演をPrime Videoにて独占配信決定！「Same Blue」のライブ映像を公開！",
    "publisher": "Official髭男dism／ポニーキャニオン",
    "url": "https://irorirecords.com/news-entry/2229",
    "kind": "official",
    "date": "2024-12-16",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue"
    ],
    "referencedUrls": [],
    "note": "2024年11月13日 Kアリーナ横浜公演のPrime Video世界独占配信決定ニュース。"
  },
  {
    "title": "Official髭男dism、ライブ映像作品『Official髭男dism Arena Tour 2024 - Rejoice -』発売＆ライブ音源配信開始",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/156427/2",
    "kind": "news",
    "date": "2025-12-10",
    "dateKind": "published",
    "relatedSongIds": [
      "same-blue",
      "sharon"
    ],
    "referencedUrls": [],
    "note": "2024年11月13日 Kアリーナ横浜公演の映像作品・ライブ音源リリースを伝えるニュース。"
  },
  {
    "title": "2024.11.20 Official 髭男dism Arena Tour 2024 Rejoice@真駒内アイスアリーナ",
    "publisher": "note（真っ白のウニ）",
    "url": "https://note.com/masshironouni/n/n87032e9a2305",
    "kind": "review",
    "date": "2025-01-16",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender",
      "i-love",
      "soulsoup"
    ],
    "referencedUrls": [],
    "note": "2024年11月20日 真駒内ファイナル公演（ゼリーハプニング〜ELLEGARDEN即興カバー〜お詫びの追加演奏）の参加レポート。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dism、レアなセットリストで特別な夜をお届け スタジアムライブに向け更なる熱狂へ",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/149125/2",
    "kind": "review",
    "date": "2025-05-02",
    "dateKind": "published",
    "relatedSongIds": [
      "fifty-percent",
      "universe-song",
      "stand-by-you",
      "sweet-tweet"
    ],
    "referencedUrls": [],
    "note": "2025年4月24日 KT Zepp Yokohama『-UNOFFICIAL-』（「50%」初披露＆急遽リクエスト2曲追加）のライブレポート。"
  },
  {
    "title": "【ライブレポート】Official髭男dism、スタジアムツアーを完走！「今日はネガティブなものが何ひとつない素晴らしい日にしたい！」",
    "publisher": "THE FIRST TIMES",
    "url": "https://www.thefirsttimes.jp/report/0000631289/",
    "kind": "review",
    "date": "2025-06-09",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender",
      "itan-na-star",
      "fifty-percent",
      "same-blue"
    ],
    "referencedUrls": [],
    "note": "2025年6月1日 日産スタジアム『LIVE at STADIUM 2025』ファイナル公演のライブレポート。"
  },
  {
    "title": "Official髭男dism、初のスタジアムライブより「Pretender」の映像を公開（動画あり）",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/674355",
    "kind": "news",
    "date": "2026-06-01",
    "dateKind": "published",
    "relatedSongIds": [
      "pretender"
    ],
    "referencedUrls": [],
    "note": "初のスタジアムライブ映像公開と映像作品・劇場版公開を伝えるニュース。"
  },
  {
    "title": "＜ライブレポート＞Official髭男dismの可能性は無限大――TOYOTA ARENA TOKYOこけら落とし公演で見せた進化し続ける姿",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/154596/2",
    "kind": "review",
    "date": "2025-10-14",
    "dateKind": "published",
    "relatedSongIds": [
      "get-back-to-jinsei",
      "brothers-song"
    ],
    "referencedUrls": [],
    "note": "2025年10月11日・12日『TOYOTA ARENA TOKYO』音楽ライブこけら落とし公演のレポート。"
  },
  {
    "title": "Official髭男dism、メンバー4人編成でのZeppツアーファイナル公演FC限定生配信決定",
    "publisher": "Billboard JAPAN",
    "url": "https://www.billboard-japan.com/d_news/detail/156856/2",
    "kind": "news",
    "date": "2025-12-24",
    "dateKind": "published",
    "relatedSongIds": [
      "white-noise",
      "hagan-song",
      "fire-ground"
    ],
    "referencedUrls": [],
    "note": "2026年1月22日『FOUR-RE:ISM』Zepp Nagoyaファイナル（松浦匡希誕生日当日）のFC限定生配信決定ニュース。"
  },
  {
    "title": "OFFICIAL HIGE DANDISM ASIA TOUR 2026 シンガポール セットリスト",
    "publisher": "ヒゲダンセトリ",
    "url": "https://higedan-setlist.net/live/2026-08-21/",
    "kind": "review",
    "date": null,
    "dateKind": "published",
    "relatedSongIds": [
      "tattoo",
      "nichijou-song",
      "same-blue"
    ],
    "referencedUrls": [],
    "note": "2026年8月21日 シンガポール公演（「TATTOO」〜「日常」リクエストメドレー）のセットリスト記録。"
  },
  {
    "title": "【セトリ】Official髭男dism(ヒゲダン) LIVE 全日程セットリスト【FOUR-RE:ISM】",
    "publisher": "新時代レポ",
    "url": "https://report-newage.com/32617",
    "kind": "review",
    "date": "2019-09-29",
    "dateKind": "published",
    "relatedSongIds": [],
    "referencedUrls": [],
    "note": "Editorial・SHOCKING NUTS・Rejoiceなど各ツアーの日替わり曲、機材トラブルやMCエピソードも記録した全日程まとめ。"
  },
  {
    "title": "Official髭男dism、赤い公園参加の新曲で老夫婦になる＆フリーライブ開催発表",
    "publisher": "音楽ナタリー",
    "url": "https://natalie.mu/music/news/225020",
    "kind": "news",
    "date": "2017-03-17",
    "dateKind": "published",
    "relatedSongIds": [
      "inu-ka-cat-ka"
    ],
    "referencedUrls": [],
    "note": "2017年4月23日 渋谷duo MUSIC EXCHANGE『「レポート」FREE LIVE』開催発表記事。"
  }
];
