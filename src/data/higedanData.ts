export type MoodTag = 'push_back' | 'heartbreak_night' | 'euphoric_drive' | 'deep_lyric';
export type SituationTag = 'morning_commute' | 'late_night_alone' | 'live_warmup' | 'weekend_walk';
export type SoundTag = 'piano_pop' | 'brass_funk' | 'emotional_ballad' | 'stadium_rock';
export type EraTag = 'indies_escaparade' | 'traveler' | 'editorial' | 'rejoice' | 'latest_2025_2026';

export interface SongItem {
  id: string;
  title: string;
  englishSub: string;
  album: string;
  era: EraTag;
  releaseDate: string;
  durationSec: number; // e.g. 326 for 5:26
  bpm: number;
  keyChanges: number;
  energyLevel: number; // 1 to 10
  moods: MoodTag[];
  situations: SituationTag[];
  sound: SoundTag;
  tieUp: string;
  iconicLyricQuote: string;
  musicalHighlight: string;
  linerNotes: string;
  lyricAnalysis: string;
  liveArrangementNote: string;
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

export interface SacredSpot {
  id: string;
  name: string;
  area: '島根・松江' | '鳥取・米子' | '東京・MV聖地' | '横浜・スタジアム';
  relatedSong: string;
  addressHint: string;
  description: string;
  fanTip: string;
  coordinatesLabel: string;
}

export interface TourArchive {
  id: string;
  tourTitle: string;
  period: string;
  scale: string;
  venueHighlight: string;
  description: string;
  signatureSetlistIds: string[];
  encoreSetlistIds: string[];
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

export interface QuizQuestion {
  id: string;
  difficulty: 'beginner' | 'intermediate' | 'brothers';
  category: '歌詞フレーズ' | 'イントロ・楽器編成' | 'バンドヒストリー・聖地';
  prompt: string;
  hint: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedSongId?: string;
}

export const HERO_IMAGE_PATH = '/src/assets/images/hero_magazine_collage_1793849692931.jpg';
export const REJOICE_IMAGE_PATH = '/src/assets/images/album_art_rejoice_vibe_1793849695153.jpg';
export const EDITORIAL_IMAGE_PATH = '/src/assets/images/album_art_editorial_vibe_1793849696589.jpg';
export const TRAVELER_IMAGE_PATH = '/src/assets/images/album_art_traveler_vibe_1793854124340.jpg';
export const SAME_BLUE_IMAGE_PATH = '/src/assets/images/album_art_same_blue_vibe_1793854124064.jpg';
export const MATSUE_IMAGE_PATH = '/src/assets/images/sacred_matsue_sunset_1793849698665.jpg';
export const STADIUM_IMAGE_PATH = '/src/assets/images/live_stadium_confetti_1793849699286.jpg';

export const HIGEDAN_SONGS: SongItem[] = [
  {
    id: 'pretender',
    title: 'Pretender',
    englishSub: 'Major 2nd Single / Traveler',
    album: 'Traveler',
    era: 'traveler',
    releaseDate: '2019.05.15',
    durationSec: 326,
    bpm: 92,
    keyChanges: 1,
    energyLevel: 7,
    moods: ['heartbreak_night', 'deep_lyric'],
    situations: ['late_night_alone', 'weekend_walk'],
    sound: 'piano_pop',
    tieUp: '映画『コンフィデンスマンJP ロマンス編』主題歌',
    iconicLyricQuote: 'もっと違う設定で もっと違う関係で 出会える世界線 選べたらよかった',
    musicalHighlight: '小笹大輔による繊細なアルペジオイントロから、A♭メジャーの王道ピアノ進行へ広がる黄金のポップス構造。',
    linerNotes: 'J-POP史に刻まれる不朽のアンセム。叶わない恋の痛みを「平行世界（世界線）」という現代的な言葉で切り取りながら、グッドメロディの強度で普遍的なラブソングへと昇華させている。',
    lyricAnalysis: '「君の運命のヒトは僕じゃない」という諦念と、「綺麗だ」と認めざるを得ない純粋な찬美が同居するサビの構造が秀逸。単なる失恋の悲嘆ではなく、相手を肯定することで自らの感情に折り合いをつける成熟した視点が描かれている。',
    liveArrangementNote: 'ライブではアウトロ前に壮大なピアノ＆ギターセッションが挿入され、スタジアム全体のシンガロングと金テープが舞うクライマックスの象徴。',
    jacketColor: '#2563EB',
    jacketImage: TRAVELER_IMAGE_PATH,
    votes: { overall: 482, lyric: 430, live: 390, hiddenGem: 45 },
  },
  {
    id: 'subtitle',
    title: 'Subtitle',
    englishSub: 'Digital Single / Rejoice',
    album: 'Rejoice',
    era: 'rejoice',
    releaseDate: '2022.10.12',
    durationSec: 305,
    bpm: 132,
    keyChanges: 3,
    energyLevel: 8,
    moods: ['heartbreak_night', 'deep_lyric'],
    situations: ['late_night_alone', 'morning_commute'],
    sound: 'emotional_ballad',
    tieUp: 'フジテレビ系木曜劇場『silent』主題歌',
    iconicLyricQuote: '言葉はまるで雪の結晶 君にプレゼントしたくても 夢中になればなるほどに 形は崩れ落ちて溶けていって',
    musicalHighlight: '冬の冷気と胸の熱量を同時に表現するゴスペル調コーラスと、ラスサビにかけて視界が開ける劇的な転調ワーク。',
    linerNotes: '「言葉を伝えることの難しさと尊さ」を雪の結晶と映画の字幕（Subtitle）になぞらえたウィンター・バラードの最高峰。藤原聡のハイトーンが持つ懇願のような響きが聴く者の心を震わせる。',
    lyricAnalysis: '「愛してるよりも愛が届くまで」というフレーズが示す通り、一方的な感情の押し付けではなく、相手の心という土壌に言葉が着地するまでの忍耐と祈りがテーマになっている。',
    liveArrangementNote: '照明が真っ白な雪景色のように落ち、藤原のブレス一つまで響き渡る静寂から、バンドアンサンブルが爆発するダイナミクスが圧巻。',
    jacketColor: '#0284C7',
    jacketImage: EDITORIAL_IMAGE_PATH,
    votes: { overall: 465, lyric: 495, live: 372, hiddenGem: 38 },
  },
  {
    id: 'mixed-nuts',
    title: 'ミックスナッツ',
    englishSub: 'Digital EP / Rejoice',
    album: 'Rejoice',
    era: 'rejoice',
    releaseDate: '2022.04.15',
    durationSec: 213,
    bpm: 150,
    keyChanges: 4,
    energyLevel: 10,
    moods: ['euphoric_drive', 'push_back'],
    situations: ['morning_commute', 'live_warmup'],
    sound: 'brass_funk',
    tieUp: 'TVアニメ『SPY×FAMILY』第1クールオープニング主題歌',
    iconicLyricQuote: '袋に詰められたナッツのような世の中で 誰もがそれぞれ出会った誰かと寄り添い合ってる',
    musicalHighlight: '松浦匡希の超絶ジャズロック・ドラムと楢﨑誠のうねるベースライン、ホーン隊が疾走する3分33秒のジェットコースター・チューン。',
    linerNotes: '「ピーナッツ（実は豆類）」が「木の実（ナッツ）」の袋に混ざっているというトリビアから、秘密を抱えた疑似家族や現代社会の生きづらさを肯定する発想力が光る快作。',
    lyricAnalysis: '「本物がなんだとか 偽物がなんだとか」という問いかけを通じて、血縁や肩書きといった形式よりも「今ここで共に食卓を囲み笑う時間」の真実味を力強く肯定している。',
    liveArrangementNote: 'イントロのドラムフィルが鳴った瞬間に会場のボルテージが最高潮に到達。間奏のソロ回しはツアーごとに進化する必見パート。',
    jacketColor: '#E11D48',
    jacketImage: REJOICE_IMAGE_PATH,
    votes: { overall: 418, lyric: 310, live: 468, hiddenGem: 62 },
  },
  {
    id: 'cry-baby',
    title: 'Cry Baby',
    englishSub: 'Digital Single / Editorial',
    album: 'Editorial',
    era: 'editorial',
    releaseDate: '2021.05.07',
    durationSec: 240,
    bpm: 100,
    keyChanges: 11,
    energyLevel: 9,
    moods: ['push_back', 'euphoric_drive'],
    situations: ['live_warmup', 'morning_commute'],
    sound: 'stadium_rock',
    tieUp: 'TVアニメ『東京リベンジャーズ』オープニング主題歌',
    iconicLyricQuote: '胸ぐらを掴まれて 強烈なパンチを食らってよろけて 肩を並べうずくまった',
    musicalHighlight: 'わずか4分間に驚異の11回転調を織り込みながら、一切の違和感なく拳を突き上げさせる変態的かつ王道なロックアンセム。',
    linerNotes: 'ヒゲダンの音楽的実験精神と大衆性が極限で融合した1曲。目まぐるしく変わる調性は、何度倒れても立ち上がる主人公たちの泥臭い感情の揺れそのものを表現している。',
    lyricAnalysis: '綺麗な勝利ではなく「涙目でリベンジを誓う」等身大の弱さと連帯が描かれており、傷だらけの日常を戦うリスナーのファイトソングとして機能する。',
    liveArrangementNote: '重厚なブラスとディストーションギターが絡み合い、ライブ中盤〜後半の空気を一気にロックフェスへと塗り替える起爆剤。',
    jacketColor: '#DC2626',
    jacketImage: STADIUM_IMAGE_PATH,
    votes: { overall: 396, lyric: 295, live: 455, hiddenGem: 54 },
  },
  {
    id: 'sharon',
    title: 'Sharon',
    englishSub: 'Album Lead Track / Rejoice',
    album: 'Rejoice',
    era: 'rejoice',
    releaseDate: '2024.07.24',
    durationSec: 282,
    bpm: 118,
    keyChanges: 2,
    energyLevel: 7,
    moods: ['push_back', 'deep_lyric'],
    situations: ['late_night_alone', 'weekend_walk'],
    sound: 'piano_pop',
    tieUp: 'カンテレ・フジテレビ系月10ドラマ『マウンテンドクター』主題歌',
    iconicLyricQuote: '何度も僕ら 鮮やかな朝日に 置いていかれそうになりながら',
    musicalHighlight: '温かく包み込むようなペダルスティール風の音色と、藤原のピアノが織りなす珠玉のミドルテンポ・グッドミュージック。',
    linerNotes: 'アルバム『Rejoice』の中核を成す名曲。忙しない日々の中で大切な人とすれ違いながらも、帰る場所があることの温もりを丁寧に掬い上げている。',
    lyricAnalysis: '「シャロン」という象徴的な呼びかけを通して、完璧ではない自分を許し、支えてくれる存在への感謝と懺悔が繊細な筆致で綴られている。',
    liveArrangementNote: '『Arena Tour 2024 -Rejoice-』および『LIVE at STADIUM 2025』でも会場全体を優しい光で満たしたハイライトナンバー。',
    jacketColor: '#F59E0B',
    jacketImage: REJOICE_IMAGE_PATH,
    votes: { overall: 388, lyric: 412, live: 350, hiddenGem: 185 },
  },
  {
    id: 'same-blue',
    title: 'Same Blue',
    englishSub: 'Digital Single (2024)',
    album: 'Single / 2024-2026 Collection',
    era: 'latest_2025_2026',
    releaseDate: '2024.10.02',
    durationSec: 238,
    bpm: 162,
    keyChanges: 3,
    energyLevel: 9,
    moods: ['push_back', 'euphoric_drive'],
    situations: ['morning_commute', 'live_warmup'],
    sound: 'stadium_rock',
    tieUp: 'TVアニメ『アオのハコ』第1クールオープニング主題歌',
    iconicLyricQuote: '青いままで 枯れてゆけ 僕らの花よ 蕾のままで 散ってゆくなよ',
    musicalHighlight: '変拍子（6/8拍子と4/4拍子のスリリングな交錯）を青春の鼓動へと変換した、瑞々しくもアグレッシブなバンドサウンド。',
    linerNotes: '体育館の床が鳴るような疾走感と、恋と部活に懸けるひたむきな「青さ」を封じ込めた2024年秋以降のライブ必殺曲。',
    lyricAnalysis: '成熟して落ち着くことよりも「未完成で青いまま咲き誇る」ことに価値を置く、ヒゲダン流の青春讃歌。',
    liveArrangementNote: 'スタジアムの青空や青い照明の下で鳴らされると、変拍子のリズムに合わせて手拍子と歓声が巻き起こる爽快なナンバー。',
    jacketColor: '#2563EB',
    jacketImage: SAME_BLUE_IMAGE_PATH,
    votes: { overall: 375, lyric: 342, live: 405, hiddenGem: 120 },
  },
  {
    id: 'tattoo',
    title: 'TATTOO',
    englishSub: 'Digital Single / Rejoice',
    album: 'Rejoice',
    era: 'rejoice',
    releaseDate: '2023.04.21',
    durationSec: 288,
    bpm: 102,
    keyChanges: 1,
    energyLevel: 7,
    moods: ['euphoric_drive', 'push_back'],
    situations: ['weekend_walk', 'morning_commute'],
    sound: 'brass_funk',
    tieUp: 'TBS系金曜ドラマ『ペンディングトレイン―8時23分、明日 君と』主題歌',
    iconicLyricQuote: '消えないように 付け足してゆこうよ 僕らのストーリーと 選び取ったメモリー',
    musicalHighlight: '小笹大輔のメロウなカッティングギターと心地よいグルーヴが牽引する、AOR／シティソウル風味のグッドバイブス・ナンバー。',
    linerNotes: '肩の力を抜いたレイドバック感がありながら、サビではしっかりと胸が熱くなるヒゲダンの中期〜現在を象徴する名曲。',
    lyricAnalysis: '傷跡や過去の出来事すらも「消えないタトゥー（刻まれた記憶）」として肯定し、かけがえのない仲間との絆へ変えていく優しさがある。',
    liveArrangementNote: 'メンバー4人がステージ前方でアイコンタクトを取りながら揺れる姿が印象的で、夕暮れの野外スタジアムにこれ以上なく似合う1曲。',
    jacketColor: '#0D9488',
    jacketImage: HERO_IMAGE_PATH,
    votes: { overall: 362, lyric: 355, live: 380, hiddenGem: 164 },
  },
  {
    id: 'soulsoup',
    title: 'SOULSOUP',
    englishSub: 'Digital Single / Rejoice',
    album: 'Rejoice',
    era: 'rejoice',
    releaseDate: '2023.12.13',
    durationSec: 312,
    bpm: 146,
    keyChanges: 4,
    energyLevel: 10,
    moods: ['push_back', 'euphoric_drive'],
    situations: ['morning_commute', 'live_warmup'],
    sound: 'brass_funk',
    tieUp: '『劇場版 SPY×FAMILY CODE: White』主題歌',
    iconicLyricQuote: '甘いも苦いも 全部煮込んで 飲み干そうぜ 僕らの人生という名のスープを',
    musicalHighlight: 'ビッグバンド・ブラスとロックバンドのダイナミズムが全開でぶつかり合う、圧倒的祝祭感とハイトーンの連打。',
    linerNotes: '『Rejoice（喜び）』というアルバムタイトルを体現するかのような、聴くだけで体温が2度上がるエネルギッシュなナンバー。',
    lyricAnalysis: '不条理なトラブルや苦い失敗もすべて「人生の隠し味」としてグツグツ煮込んで味わってしまおうという、力強いユーモアとタフネスが込められている。',
    liveArrangementNote: 'ホーンセクションとサポート陣を含むフル編成での音の厚みが凄まじく、本編クライマックスの熱狂を生み出す。',
    jacketColor: '#EA580C',
    jacketImage: REJOICE_IMAGE_PATH,
    votes: { overall: 349, lyric: 288, live: 428, hiddenGem: 142 },
  },
  {
    id: 'rashisa',
    title: 'らしさ',
    englishSub: 'Digital Single (2025)',
    album: 'Single / 2024-2026 Collection',
    era: 'latest_2025_2026',
    releaseDate: '2025.08.20',
    durationSec: 265,
    bpm: 138,
    keyChanges: 2,
    energyLevel: 9,
    moods: ['push_back', 'deep_lyric'],
    situations: ['morning_commute', 'live_warmup'],
    sound: 'stadium_rock',
    tieUp: '劇場アニメ『ひゃくえむ。』主題歌',
    iconicLyricQuote: 'わずか十数秒の閃光に 僕らのすべてを賭けて走る 理由なんて後からついてくる',
    musicalHighlight: 'スタートラインの緊張感を切り裂くピアノリフから、限界突破のドラムビートへと加速する2025年を代表するロックチューン。',
    linerNotes: '100メートル走という一瞬の勝負に人生を懸ける表現者たちの生き様を、バンド自身の10年以上の歩みと重ね合わせた渾身の1曲。',
    lyricAnalysis: '他人から規定される「自分らしさ」の枠を蹴り飛ばし、今この瞬間の衝動こそが自分を証明するという鋭いメッセージが胸を貫く。',
    liveArrangementNote: '『FOUR-RE:ISM』や2026年ワンマンツアーでも、メンバー4人の生々しい演奏力が炸裂するハイライトとして披露。',
    jacketColor: '#E11D48',
    jacketImage: SAME_BLUE_IMAGE_PATH,
    votes: { overall: 340, lyric: 378, live: 395, hiddenGem: 150 },
  },
  {
    id: '115man-kilo',
    title: '115万キロのフィルム',
    englishSub: '1st Full Album / Escaparade',
    album: 'Escaparade',
    era: 'indies_escaparade',
    releaseDate: '2018.04.11',
    durationSec: 324,
    bpm: 97,
    keyChanges: 1,
    energyLevel: 6,
    moods: ['push_back', 'deep_lyric'],
    situations: ['weekend_walk', 'late_night_alone'],
    sound: 'piano_pop',
    tieUp: '映画『思い、思われ、ふり、ふられ』主題歌',
    iconicLyricQuote: 'ほら ここで君が笑うシーンが 見どころなんだから さぁ 写真にも映せやしない とても些細なその仕草に',
    musicalHighlight: '軽快なピアノのバッキングと温かなホーンのオブリガートが、まるで映画のエンドロールのように心地よく寄り添う名アレンジ。',
    linerNotes: '人間の生涯（80年）をフィルムの長さに換算すると「約115万キロ」になるというロマンチックな着想から生まれた、ウェディングソングとしても愛される名曲。',
    lyricAnalysis: '劇的なハッピーエンドだけでなく、雨の日や喧嘩のシーンすらも「助演男優兼カメラマン」として愛おしく記録し続けようとする眼差しが温かい。',
    liveArrangementNote: 'イントロのピアノコードが鳴った瞬間に会場中から温かい拍手が湧き起こる、ファンにとって特別な初期代表曲。',
    jacketColor: '#F59E0B',
    jacketImage: TRAVELER_IMAGE_PATH,
    votes: { overall: 445, lyric: 460, live: 365, hiddenGem: 190 },
  },
  {
    id: 'editorial-song',
    title: 'アポトーシス',
    englishSub: 'Album Lead Track / Editorial',
    album: 'Editorial',
    era: 'editorial',
    releaseDate: '2021.08.11',
    durationSec: 384,
    bpm: 112,
    keyChanges: 2,
    energyLevel: 6,
    moods: ['deep_lyric', 'heartbreak_night'],
    situations: ['late_night_alone', 'weekend_walk'],
    sound: 'emotional_ballad',
    tieUp: 'Apple Music CMソング / アルバム『Editorial』リード曲',
    iconicLyricQuote: 'さよならは いつか来る だからこそ 今を抱きしめたいけれど',
    musicalHighlight: 'シンセパッドの浮遊感とサックスソロ、6分24秒にわたる壮大な組曲的展開が圧倒的な余韻を残すアート・ポップ。',
    linerNotes: '生物学用語の「アポトーシス（管理された細胞死）」をタイトルに冠し、大切な人との別れや老いという避けられない運命に真正面から向き合った大作。',
    lyricAnalysis: 'ただ若さや永遠を謳うのではなく、「いつか終わりが来るからこそ、今日という何気ない1日が奇跡である」という深い死生観へと到達している。',
    liveArrangementNote: 'ステージ背面の巨大LEDに映し出される光の粒子と、楢﨑誠のソプラノサックスが会場を幻想的な空間へ変える。',
    jacketColor: '#4F46E5',
    jacketImage: EDITORIAL_IMAGE_PATH,
    votes: { overall: 332, lyric: 448, live: 345, hiddenGem: 410 },
    isHiddenGem: true,
  },
  {
    id: 'stand-by-you',
    title: 'Stand By You',
    englishSub: 'Stand By You EP / Traveler',
    album: 'Traveler',
    era: 'traveler',
    releaseDate: '2018.10.17',
    durationSec: 256,
    bpm: 110,
    keyChanges: 1,
    energyLevel: 9,
    moods: ['euphoric_drive', 'push_back'],
    situations: ['live_warmup', 'weekend_walk'],
    sound: 'brass_funk',
    tieUp: 'Apple Music CMソング',
    iconicLyricQuote: 'たとえ僕ら遠く離れた場所へ行こうとも 変わらずに ここにいるよ',
    musicalHighlight: 'ゴスペル・R&Bのルーツを感じさせるクラップ（手拍子）とピアノリフ、会場全体が一体となるコール＆レスポンス設計。',
    linerNotes: 'ヒゲダンのライブスタイルを決定づけた重要曲。バンドと観客（BROTHERS）が対等な音楽仲間として同じ空間を作り上げる喜びが詰まっている。',
    lyricAnalysis: '一方的に引っ張るのではなく「君のそばに立つ（Stand By You）」というスタンスが、ヒゲダンというバンドの誠実なキャラクターを象徴している。',
    liveArrangementNote: 'ライブ終盤やアンコールで必ずと言っていいほど演奏され、何万人ものクラップがひとつに重なる光景は鳥肌もの。',
    jacketColor: '#059669',
    jacketImage: STADIUM_IMAGE_PATH,
    votes: { overall: 380, lyric: 320, live: 485, hiddenGem: 175 },
    isHiddenGem: true,
  },
];

export const SACRED_SPOTS: SacredSpot[] = [
  {
    id: 'spot-shinji-lake',
    name: '宍道湖夕日スポット（とるぱ・岸公園付近）',
    area: '島根・松江',
    relatedSong: '夕暮れ沿い / 115万キロのフィルム',
    addressHint: '島根県松江市袖師町（JR松江駅からバス約10分）',
    description: 'メンバーが学生時代・インディーズ時代を過ごした松江市の象徴。湖面を茜色から群青色へと染める夕景は、ヒゲダンのどこかノスタルジックで温かいメロディの原風景そのもの。',
    fanTip: '日没30分前に到着し、嫁ヶ島シルエットを眺めながら初期のバラードを聴くのがBROTHERSの定番コース。',
    coordinatesLabel: '35.4550° N, 133.0485° E',
  },
  {
    id: 'spot-matsue-canova',
    name: '松江 AZTiC canova（アズティック・カノーバ）',
    area: '島根・松江',
    relatedSong: '愛なんだが… / 恋の前ならえ',
    addressHint: '島根県松江市嫁島町13-25',
    description: '2012年6月7日、Official髭男dismが初ライブを行った記念すべき聖地ライブハウス。ここからスタジアム25万人動員への物語が始まった。',
    fanTip: 'ライブ開催日以外は外観見学のみマナーを守って。近くの宍道湖畔とセットで巡礼するのがおすすめ。',
    coordinatesLabel: '35.4512° N, 133.0428° E',
  },
  {
    id: 'spot-shimane-univ',
    name: '島根大学 松江キャンパス周辺・学園通り',
    area: '島根・松江',
    relatedSong: '異端なスター / 犬かキャットかで死ぬまで喧嘩しよう！',
    addressHint: '島根県松江市西川津町1060周辺',
    description: '藤原聡・小笹大輔・松浦匡希の母校であり、軽音楽部での出会いがバンド結成へと繋がった青春の街並み。',
    fanTip: '学生街のレトロな喫茶店やベーカリーを巡りながら、当時のバンド練習帰りの空気感を味わえます。',
    coordinatesLabel: '35.4865° N, 133.0682° E',
  },
  {
    id: 'spot-yonago-laughs',
    name: '米子 AZTiC laughs ＆ 皆生温泉海辺',
    area: '鳥取・米子',
    relatedSong: '日曜日のラブレター / コーヒーとシロップ',
    addressHint: '鳥取県米子市道笑町 / 皆生温泉エリア',
    description: '藤原聡の出身地・米子エリア。山陰時代のホームグラウンドのひとつであり、日本海を望む穏やかな海岸線が心を癒やす。',
    fanTip: '松江からJR山陰本線で約30分。山陰横断の聖地巡礼ドライブコースに最適。',
    coordinatesLabel: '35.4281° N, 133.3310° E',
  },
  {
    id: 'spot-nissan-stadium',
    name: '日産スタジアム（LIVE at STADIUM 2025 聖地）',
    area: '横浜・スタジアム',
    relatedSong: 'Sharon / SOULSOUP / Pretender',
    addressHint: '神奈川県横浜市港北区小机町3300（新横浜駅徒歩14分）',
    description: '2025年5月31日・6月1日に開催された初のスタジアムツアーファイナルの地。7万人の大合唱と夜空を焦がす演出が伝説となった場所。',
    fanTip: '2026年7月発売の映像作品『LIVE at STADIUM 2025』を観てから東ゲート広場を訪れると感動が倍増します。',
    coordinatesLabel: '35.5100° N, 139.6064° E',
  },
  {
    id: 'spot-k-arena',
    name: 'Kアリーナ横浜（Arena Tour 2024 -Rejoice- & 2026）',
    area: '横浜・スタジアム',
    relatedSong: 'Subtitle / Same Blue / ミックスナッツ',
    addressHint: '神奈川県横浜市西区みなとみらい6-2-14',
    description: '世界最大級の音楽特化型アリーナ。『Rejoice』ツアー収録地であり、2026年全国ツアーでもハイライトとなる音響空間。',
    fanTip: '海沿いのミュージックテラスからみなとみらいの夜景を眺めつつ、ライブ前の高揚感をシェアするのが定番。',
    coordinatesLabel: '35.4646° N, 139.6311° E',
  },
];

export const TOUR_ARCHIVES: TourArchive[] = [
  {
    id: 'tour-rejoice-2024',
    tourTitle: 'Official髭男dism Arena Tour 2024 - Rejoice -',
    period: '2024.09 — 2024.11（全国5都市10公演）',
    scale: '全国アリーナツアー',
    venueHighlight: 'マリンメッセ福岡 / 大阪城ホール / Kアリーナ横浜 ほか',
    description: 'メジャー3rdアルバム『Rejoice』を携え、声出し解禁後のアリーナに歓喜のシンガロングを取り戻した記念碑的ツアー。',
    signatureSetlistIds: ['Sharon', 'ミックスナッツ', 'TATTOO', 'Subtitle', 'SOULSOUP', 'Pretender'],
    encoreSetlistIds: ['Same Blue', 'Stand By You'],
  },
  {
    id: 'tour-stadium-2025',
    tourTitle: 'OFFICIAL HIGE DANDISM LIVE at STADIUM 2025',
    period: '2025.05 — 2025.06（ヤンマースタジアム長居・日産スタジアム）',
    scale: '初のスタジアムツアー（全4公演・約25万人動員）',
    venueHighlight: '大阪・ヤンマースタジアム長居 / 神奈川・日産スタジアム',
    description: 'バンド史上最大規模となった野外スタジアムツアー。夕暮れから夜空へと移り変わる空の下、圧巻のブラス＆花火演出で25万人を魅了。',
    signatureSetlistIds: ['Pretender', '115万キロのフィルム', 'Cry Baby', 'ミックスナッツ', 'Sharon', 'SOULSOUP'],
    encoreSetlistIds: ['Subtitle', 'Stand By You'],
  },
  {
    id: 'tour-four-reism-2025',
    tourTitle: 'OFFICIAL HIGE DANDISM one-man tour FOUR-RE:ISM',
    period: '2025.12 — 2026.02',
    scale: 'メンバー4人編成ライブハウス＆ホールツアー',
    venueHighlight: 'Zepp各地・全国ホール会場',
    description: 'サポートメンバーなしの「藤原・小笹・楢﨑・松浦」4人だけの最小編成で原点回帰し、剥き出しのロックバンドグルーヴを鳴らしたプレミアムツアー。',
    signatureSetlistIds: ['らしさ', 'Same Blue', 'Cry Baby', 'TATTOO', 'アポトーシス'],
    encoreSetlistIds: ['115万キロのフィルム', 'Stand By You'],
  },
  {
    id: 'tour-oneman-2026',
    tourTitle: 'OFFICIAL HIGE DANDISM one-man tour 2026',
    period: '2026.04 — 2026.07（全国ホール＆アリーナ公演）',
    scale: '2026年全国ロングランツアー',
    venueHighlight: '全国のホール会場 〜 大阪城ホール・Kアリーナ横浜',
    description: '親密なホール空間から巨大アリーナまで、最新曲「らしさ」「エルダーフラワー / スターダスト」を含む集大成と新章を繋ぐ2026年ツアー。',
    signatureSetlistIds: ['らしさ', 'Same Blue', 'ミックスナッツ', 'Sharon', 'Subtitle', 'SOULSOUP'],
    encoreSetlistIds: ['Pretender', 'Stand By You'],
  },
];

export const INITIAL_FAN_REVIEWS: FanReview[] = [
  {
    id: 'rev-1',
    author: 'マツエのピアノ弾き',
    fanTenure: 'BROTHERS歴 7年',
    songId: 'sharon',
    category: '歌詞考察',
    title: '「鮮やかな朝日に置いていかれそうになりながら」の救済力',
    comment: '仕事で深夜に帰る日々の中、Sharonのこの一行で涙が止まらなくなりました。頑張れと背中を叩くのではなく、追いつけない夜があることをそのまま抱きしめてくれる聡くんの言葉選びが本当に大好きです。',
    postedAt: '2026.10.28',
    likes: 84,
  },
  {
    id: 'rev-2',
    author: '日産スタジアム東ゲート民',
    fanTenure: 'BROTHERS歴 4年',
    songId: 'stand-by-you',
    category: 'ライブ体験',
    title: '7万人のクラップが夜空に吸い込まれた瞬間を一生忘れない',
    comment: 'LIVE at STADIUM 2025の日産スタジアムファイナル、アンコールのStand By Youで会場中のリストバンドが輝いて手拍子が重なった瞬間、「音楽ってこんなに人を繋げるんだ」と震えました！',
    postedAt: '2026.10.19',
    likes: 112,
  },
  {
    id: 'rev-3',
    author: '転調マニアック',
    fanTenure: 'BROTHERS歴 5年',
    songId: 'cry-baby',
    category: '楽曲アレンジ',
    title: '11回転調しているのに全員でシンガロングできる異常なポップセンス',
    comment: '音楽理論的に見たら迷子になりそうな複雑な転調を繰り返しているのに、メロディの推進力が強すぎて初見のリスナーでもノれてしまうのがヒゲダンの凄み。ならちゃんのベースラインも最高にロック！',
    postedAt: '2026.10.05',
    likes: 67,
  },
  {
    id: 'rev-4',
    author: 'アオの青春箱',
    fanTenure: 'BROTHERS歴 2年',
    songId: 'same-blue',
    category: '人生の支え',
    title: '朝の通勤電車で聴くと視界が一気に晴れる魔法の変拍子',
    comment: 'Same Blueのイントロが流れた瞬間、満員電車の重たい空気が一気に鮮やかなブルーに変わります。「青いままで枯れてゆけ」というフレーズは、大人になっても挑戦し続ける人への最高のエールだと思います。',
    postedAt: '2026.09.22',
    likes: 53,
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    difficulty: 'beginner',
    category: '歌詞フレーズ',
    prompt: '「袋に詰められたナッツのような世の中で 誰もがそれぞれ出会った誰かと寄り添い合ってる」という歌詞が登場する、TVアニメ『SPY×FAMILY』オープニング主題歌といえば？',
    hint: 'ピーナッツが実は豆類であることから着想を得たアップテンポなナンバーです。',
    options: ['ミックスナッツ', 'SOULSOUP', 'Cry Baby', 'ホワイトノイズ'],
    correctIndex: 0,
    explanation: '正解は「ミックスナッツ」（2022年リリース、アルバム『Rejoice』収録）。ジャズ＆ファンクなホーンセクションと超絶リズム隊が炸裂するライブ定番曲です。',
    relatedSongId: 'mixed-nuts',
  },
  {
    id: 'q2',
    difficulty: 'beginner',
    category: '歌詞フレーズ',
    prompt: '「言葉はまるで雪の結晶 君にプレゼントしたくても 夢中になればなるほどに 形は崩れ落ちて溶けていって」と歌われる冬のバラード名曲は？',
    hint: 'ドラマ『silent』の主題歌として書き下ろされた楽曲です。',
    options: ['Pretender', 'Subtitle', 'I LOVE...', '115万キロのフィルム'],
    correctIndex: 1,
    explanation: '正解は「Subtitle」。映画やドラマの「字幕」を意味するタイトルで、「愛してるよりも愛が届くまで」という切実な祈りが込められています。',
    relatedSongId: 'subtitle',
  },
  {
    id: 'q3',
    difficulty: 'intermediate',
    category: 'イントロ・楽器編成',
    prompt: 'わずか4分間の楽曲の中に「計11回」もの転調が組み込まれている、TVアニメ『東京リベンジャーズ』オープニング主題歌はどれ？',
    hint: '「胸ぐらを掴まれて 強烈なパンチを食らって」という歌い出しから始まります。',
    options: ['宿命', 'FIRE GROUND', 'Cry Baby', 'Same Blue'],
    correctIndex: 2,
    explanation: '正解は「Cry Baby」（アルバム『Editorial』収録）。転調の多さだけでなく、ブラスと歪んだギターが絡み合う重厚なアンサンブルが高く評価されています。',
    relatedSongId: 'cry-baby',
  },
  {
    id: 'q4',
    difficulty: 'intermediate',
    category: 'バンドヒストリー・聖地',
    prompt: 'Official髭男dismが2012年6月7日に結成され、初ライブを行った記念すべき山陰地方の都市はどこ？',
    hint: '美しい夕日で知られる「宍道湖」がある街です。',
    options: ['島根県・松江市', '広島県・尾道市', '岡山県・倉敷市', '山口県・下関市'],
    correctIndex: 0,
    explanation: '正解は「島根県・松江市」。島根大学の軽音楽部を中心に結成され、松江AZTiC canovaで初ステージを踏みました。',
  },
  {
    id: 'q5',
    difficulty: 'brothers',
    category: 'バンドヒストリー・聖地',
    prompt: '2025年春〜初夏に開催され、全4公演で約25万人を動員したバンド初のスタジアムツアー『OFFICIAL HIGE DANDISM LIVE at STADIUM 2025』のツアーファイナル会場はどこ？',
    hint: '神奈川県横浜市にある日本最大級の7万人収容スタジアムです。',
    options: ['日産スタジアム', '横浜スタジアム', '味の素スタジアム', '国立競技場'],
    correctIndex: 0,
    explanation: '正解は「日産スタジアム」（2025年5月31日・6月1日開催）。ヤンマースタジアム長居と日産スタジアムを巡り、2026年7月には完全収録ライブ映像作品もリリースされました。',
  },
  {
    id: 'q6',
    difficulty: 'brothers',
    category: 'イントロ・楽器編成',
    prompt: 'アルバム『Editorial』のリード曲であり、生物学における「管理された細胞死」を意味するタイトルを冠した、楢﨑誠のソプラノサックスも印象的な6分超の大作は？',
    hint: '「さよならは いつか来る」というフレーズが印象的な楽曲です。',
    options: ['アポトーシス', 'ペンディング・マシーン', 'フィラメント', 'Shower'],
    correctIndex: 0,
    explanation: '正解は「アポトーシス」。別れや老いという普遍的なテーマを、美しいシンセサウンドと緻密なリズム構築で描き切った名曲です。',
    relatedSongId: 'editorial-song',
  },
];

export interface BandMemberProfile {
  id: string;
  name: string;
  nickname: string;
  role: string;
  birthplace: string;
  playStyleSummary: string;
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
    playStyleSummary:
      'ほとんどの楽曲の作詞・作曲を手がけるフロントマン。ブラックミュージックやジャズをルーツに持つ躍動的なピアノリフと、ハイトーンまで突き抜ける表現力豊かな歌声が特徴。',
    signatureSongId: 'subtitle',
    signatureSongTitle: 'Subtitle',
  },
  {
    id: 'daisuke',
    name: '小笹 大輔',
    nickname: '大ちゃん',
    role: 'Guitar / Chorus',
    birthplace: '島根県松江市出身',
    playStyleSummary:
      '繊細なアルペジオからハードロック直系のエモーショナルなギターソロまで自在に操るギタリスト。『115万キロのフィルム』の間奏やライブアレンジでのギターソロは必見。',
    signatureSongId: 'pretender',
    signatureSongTitle: 'Pretender',
  },
  {
    id: 'makoto',
    name: '楢﨑 誠',
    nickname: 'ならちゃん',
    role: 'Bass / Sax / Synth Bass',
    birthplace: '広島県福山市出身',
    playStyleSummary:
      'エレキベース・ウッドベース・シンセベースに加え、バリトン＆ソプラノサックスまで演奏するマルチプレイヤー。楽曲のファンクネスと温かみを支える要。',
    signatureSongId: 'editorial-song',
    signatureSongTitle: 'アポトーシス',
  },
  {
    id: 'masaki',
    name: '松浦 匡希',
    nickname: 'ちゃんまつ',
    role: 'Drums / Percussion',
    birthplace: '鳥取県米子市出身',
    playStyleSummary:
      'ジャズ・フュージョン的な細かいゴーストノートからスタジアムを揺らすパワフルなビートまで叩き分けるドラマー。複雑な変拍子や11回転調を自然に聴かせるリズムの心臓部。',
    signatureSongId: 'mixed-nuts',
    signatureSongTitle: 'ミックスナッツ',
  },
];

