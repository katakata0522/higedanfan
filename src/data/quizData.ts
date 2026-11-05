export interface QuizSourceItem {
  title: string;
  publisher: string;
  publishedNote: string;
  url: string;
  summary: string;
}

export interface QuizQuestion {
  id: string;
  difficulty: 'beginner' | 'intermediate' | 'brothers';
  questionType?: 'single_choice' | 'ordering';
  category:
    | '歌詞フレーズ'
    | 'イントロ・楽器編成'
    | 'バンドヒストリー・聖地'
    | 'タイアップ・代表曲'
    | '転調・楽曲構造'
    | 'リズム・変拍子'
    | 'ディスコグラフィ'
    | 'タイアップ・最新曲'
    | 'メンバー作詞作曲'
    | 'ディスコグラフィ・映画主題歌'
    | '並び替え・リリース順'
    | '並び替え・データ順'
    | 'サイト内データ・50音＆時間'
    | '歌詞・表記トリビア'
    | 'メンバープロフィール・好物';
  prompt: string;
  hint: string;
  options: string[];
  correctIndex: number;
  correctOrder?: number[];
  explanation: string;
  relatedSongId?: string;
  sources: QuizSourceItem[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ============================================================================
  // 初級コース（全10問：q1〜q10）— 代表曲の歌詞フレーズ・大型タイアップ・名曲誕生秘話
  // ============================================================================
  {
    id: 'q1',
    difficulty: 'beginner',
    category: '歌詞フレーズ',
    prompt:
      '「袋に詰められたナッツのような世の中で 誰もがそれぞれ出会った誰かと寄り添い合ってる」という歌詞が登場する、TVアニメ『SPY×FAMILY』Season 1 第1クールOP主題歌といえば？',
    hint: 'ピーナッツが実は木の実（ナッツ）ではなく「土の中にできる豆類（草の実）」であることから着想を得た楽曲です。',
    options: ['ミックスナッツ', 'SOULSOUP', 'Cry Baby', 'ホワイトノイズ'],
    correctIndex: 0,
    explanation:
      '正解は「ミックスナッツ」（2022年4月15日配信／アルバム『Rejoice』M3収録）。藤原聡が「ピーナッツは見た目こそ木の実のナッツに混ざっているが、実は土の下で育つマメ科の植物である」という事実から、正体を隠して仮初めの家族を演じるフォージャー家の姿を重ね合わせて書き下ろした名曲です。',
    relatedSongId: 'mixed-nuts',
    sources: [
      {
        title: 'Official髭男dismがアニメ「SPY×FAMILY」OP主題歌を書き下ろし、藤原聡コメント公開',
        publisher: '音楽ナタリー',
        publishedNote: '2022年3月18日 ニュース記事',
        url: 'https://natalie.mu/music/news/470107',
        summary:
          'TVアニメ『SPY×FAMILY』OP主題歌として書き下ろされた経緯と、フォージャー家の「擬態」とピーナッツを重ねた藤原聡のコメントを収録。',
      },
      {
        title: 'Official髭男dism『ミックスナッツ EP』特設サイト オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2022年6月22日 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'ジャズ＆ファンクのホーンセクションと変則的なベース・ドラムが絡み合うアレンジの制作秘話を解説。',
      },
    ],
  },
  {
    id: 'q2',
    difficulty: 'beginner',
    category: '歌詞フレーズ',
    prompt:
      '「言葉はまるで雪の結晶 君にプレゼントしたくても 夢中になればなるほどに 形は崩れ落ちて溶けていって」と歌われる、2022年秋ドラマ『silent』主題歌の冬バラードは？',
    hint: '映画やドラマの「字幕」を意味する英語タイトルが付けられています。',
    options: ['Pretender', 'Subtitle', 'I LOVE...', '115万キロのフィルム'],
    correctIndex: 1,
    explanation:
      '正解は「Subtitle」（2022年10月12日配信／アルバム『Rejoice』M10収録）。言葉で想いを伝えることの難しさと、「愛してるよりも愛が届くまで」という切実な祈りを描き、ストリーミング累計再生数でも歴代屈指の記録を打ち立てた名バラードです。',
    relatedSongId: 'subtitle',
    sources: [
      {
        title: 'Official髭男dism「Subtitle」レビュー：ドラマ『silent』と深く共鳴する言葉の温度',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2022年10月 コラム・楽曲評',
        url: 'https://realsound.jp/',
        summary:
          '「軽率にわかったようなことを歌いたくなかった」という藤原聡の真摯な作詞姿勢と、ドラマチックなボーカル表現を分析。',
      },
      {
        title: 'Official髭男dism - Subtitle [Behind The Scenes]',
        publisher: 'Official髭男dism 公式YouTubeチャンネル',
        publishedNote: '2022年11月 制作メイキング映像',
        url: 'https://www.youtube.com/@officialhigedandism',
        summary:
          'レコーディング風景や、サビ前の静寂と転調に込めたメンバー4人のアレンジ意図を記録した公式ドキュメンタリー。',
      },
    ],
  },
  {
    id: 'q3',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '映画『コンフィデンスマンJP ロマンス編』の主題歌として大ヒットし、メジャー1stアルバム『Traveler』のM12に収録されているOfficial髭男dismの代表曲は？',
    hint: '「グッバイ 君の運命のヒトは僕じゃない」というサビのフレーズで広く知られています。',
    options: ['イエスタデイ', '宿命', 'Pretender', 'Stand By You'],
    correctIndex: 2,
    explanation:
      '正解は「Pretender」（2019年5月15日発売／アルバム『Traveler』M12収録）。小笹大輔による透明感あふれるギターアルペジオのイントロと、叶わない恋を抱えながらも「君は綺麗だ」と相手を肯定する切ない歌詞が世代を超えて愛される国民的ナンバーです。',
    relatedSongId: 'pretender',
    sources: [
      {
        title: 'Official髭男dism「Pretender」台湾撮影のMV公開、映画「コンフィデンスマンJP」主題歌',
        publisher: '音楽ナタリー',
        publishedNote: '2019年4月16日 ニュース記事',
        url: 'https://natalie.mu/music/news/328056',
        summary:
          '映画『コンフィデンスマンJP ロマンス編』の舞台である香港・アジア圏の空気感とリンクする台湾・台北ロケMVの公開と楽曲背景を紹介。',
      },
      {
        title: 'Official髭男dism「Pretender」Billboard JAPAN チャート＆ストリーミング記録特集',
        publisher: 'Billboard JAPAN',
        publishedNote: 'チャートアーカイブ記事',
        url: 'https://www.billboard-japan.com/',
        summary:
          'Billboard JAPAN Hot 100およびStreaming Songsチャートでの歴史的ロングヒット記録を分析。',
      },
    ],
  },
  {
    id: 'q4',
    difficulty: 'beginner',
    category: '歌詞フレーズ',
    prompt:
      '「ほら、ここで君が笑うシーンが見どころなんだからさ Ah 写真にも映せやしないとても些細なその仕草に」と、2人の人生を映画のフィルムに例えて歌う人気曲は？',
    hint: '2018年発売の1stフルアルバム『エスカパレード』の1曲目（M1）に収録されています。',
    options: ['ビンテージ', 'LADY', '相思相愛', '115万キロのフィルム'],
    correctIndex: 3,
    explanation:
      '正解は「115万キロのフィルム」（2018年4月11日発売『エスカパレード』M1収録）。タイトルの「115万キロ」は、1秒24コマの映画フィルムで「80年分の人生」を撮影し続けたときに必要となるフィルムの総延長距離に由来しています。',
    relatedSongId: '115man-kilo',
    sources: [
      {
        title: 'Official髭男dism「115万キロのフィルム」が映画『思い、思われ、ふり、ふられ』主題歌に決定',
        publisher: '音楽ナタリー',
        publishedNote: '2020年6月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          'アルバム曲でありながら口コミとストリーミングで絶大な支持を集め、リリースから2年後に映画主題歌へ起用された経緯を紹介。',
      },
      {
        title: 'Official髭男dism 1stフルアルバム『エスカパレード』インタビュー',
        publisher: 'Skream!（スクリーム）',
        publishedNote: '2018年4月 特集インタビュー',
        url: 'https://skream.jp/',
        summary:
          'アルバムの幕開けを飾るM1『115万キロのフィルム』のタイトル計算秘話と詞世界について藤原聡が語る。',
      },
    ],
  },
  {
    id: 'q5',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '2018年4月にフジテレビ系“月9”ドラマ『コンフィデンスマンJP』の主題歌にインディーズアーティストとして史上初めて抜擢された、メジャーデビューシングル曲は？',
    hint: 'ラテン調のスリリングなピアノとホーンセクションが鳴り響くナンバーで、1stフルアルバムと同日にゲリラ発売されました。',
    options: ['ブラザーズ', 'ノーダウト', 'Tell Me Baby', 'ESCAPADE'],
    correctIndex: 1,
    explanation:
      '正解は「ノーダウト」（2018年4月11日発売／『エスカパレード』M2収録）。事前の告知なしで1stフルアルバム『エスカパレード』と同日に店頭へ並ぶサプライズ形式でリリースされ、ヒゲダンの名を全国へ轟かせた記念すべきメジャーデビューシングルです。',
    relatedSongId: 'no-doubt',
    sources: [
      {
        title: 'Official髭男dismが月9「コンフィデンスマンJP」主題歌担当、シングルをゲリラ発売',
        publisher: '音楽ナタリー',
        publishedNote: '2018年4月9日 ニュース記事',
        url: 'https://natalie.mu/music/news/277332',
        summary:
          '月9ドラマ第1話の放送内で主題歌とメジャーデビュー、さらにCDシングルのサプライズ発売が発表された瞬間をレポート。',
      },
      {
        title: '月9史上初！インディーズのOfficial髭男dismがドラマ主題歌に抜擢',
        publisher: 'ORICON NEWS',
        publishedNote: '2018年3月 ニュース記事',
        url: 'https://www.oricon.co.jp/',
        summary:
          'インディーズ時代から培ってきたグッドメロディとブラックミュージックの素養がドラマ制作陣の耳に留まった背景を紹介。',
      },
    ],
  },
  {
    id: 'q6',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '2019年の「ABC夏の高校野球応援ソング／『熱闘甲子園』テーマソング」として書き下ろされた、重厚なブラスアレンジが響き渡るスタジアムアンセムは？',
    hint: '「届け 届け 想いよ 届け」とクライマックスで力強く歌い上げられる楽曲です。',
    options: ['FIRE GROUND', 'Laughter', '宿命', 'パラボラ'],
    correctIndex: 2,
    explanation:
      '正解は「宿命」（2019年7月31日発売／アルバム『Traveler』M2収録）。制作にあたりメンバー全員で阪神甲子園球場を訪れ、アルプススタンドのブラスバンド応援の熱量をヒゲダン流の重厚なホーン＆シンセアレンジへと昇華させました。',
    relatedSongId: 'shukumei',
    sources: [
      {
        title: 'Official髭男dism「熱闘甲子園」テーマソング「宿命」をシングルリリース',
        publisher: '音楽ナタリー',
        publishedNote: '2019年6月〜7月 ニュース記事',
        url: 'https://natalie.mu/music/news/333919',
        summary:
          '高校球児たちの葛藤やプレッシャーに寄り添う歌詞と、12人編成のホーンセクションを導入した制作背景を紹介。',
      },
      {
        title: 'Official髭男dism『Traveler』オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月 アルバム特設ページ',
        url: 'https://higedan.com/',
        summary:
          'ライブのオープニングやクライマックスで観客と一体になる『宿命』のサウンドメイキングについて語る。',
      },
    ],
  },
  {
    id: 'q7',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      'TBS系火曜ドラマ『恋はつづくよどこまでも』の主題歌として大ヒットした、「僕が贈るものは全て 形のないものだけと 君の心の片隅で 輝く星になりたい」と歌われるラブソングは？',
    hint: 'タイトルの末尾にある「...（三点リーダー）」には、恋人だけでなく家族や友人など「あらゆる愛の対象」が入るという意味が込められています。',
    options: ['LADY', 'ビンテージ', 'Sharon', 'I LOVE...'],
    correctIndex: 3,
    explanation:
      '正解は「I LOVE...」（2020年2月12日発売／アルバム『Editorial』M3収録）。タイトルの「I LOVE...」の空白部分には、恋人への愛だけでなく、家族・友人・ペット・大切な仲間など聴き手それぞれの愛の対象を当てはめてほしいという願いが込められています。',
    relatedSongId: 'i-love',
    sources: [
      {
        title: 'Official髭男dism、新曲「I LOVE...」が上白石萌音×佐藤健ドラマ「恋つづ」主題歌に',
        publisher: '音楽ナタリー',
        publishedNote: '2019年12月〜2020年1月 ニュース記事',
        url: 'https://natalie.mu/music/news/359546',
        summary:
          'ドラマ主題歌起用にあたって藤原聡が語った「主人公の恋心にリンクしながら、すべての大切な人への愛に重なる曲にしたい」というコメントを掲載。',
      },
      {
        title: 'Official髭男dism「I LOVE...」が描く、多様な愛の肯定とサウンドの革新',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2020年2月 楽曲レビュー',
        url: 'https://realsound.jp/',
        summary:
          '生楽器とモダンなシンセ・R&Bプロダクションを高次元で融合させたアレンジ手法を解説。',
      },
    ],
  },
  {
    id: 'q8',
    difficulty: 'beginner',
    category: 'イントロ・楽器編成',
    prompt:
      '2018年10月リリースの2nd EP表題曲であり、ライブのアンコール等で観客全員のハンドクラップ（手拍子）とシンガロングが巻き起こるゴスペル・ポップナンバーは？',
    hint: '「たとえ僕ら遠く離れた場所へ行こうとも 変わらずにいたいよな」と歌われる楽曲です。',
    options: ['Stand By You', 'ブラザーズ', 'HELLO', 'Universe'],
    correctIndex: 0,
    explanation:
      '正解は「Stand By You」（2018年10月17日発売『Stand By You EP』M1／『Traveler』M8収録）。ブラックミュージックやゴスペルのクラップ＆コーラスワークをJ-POPの王道メロディと融合させ、ライブ会場をひとつに繋ぐアンセムとして愛されています。',
    relatedSongId: 'stand-by-you',
    sources: [
      {
        title: 'Official髭男dism「Stand By You EP」ロングインタビュー：僕らの音楽の真ん中にあるもの',
        publisher: '音楽ナタリー',
        publishedNote: '2018年10月17日 特集インタビュー',
        url: 'https://natalie.mu/music/pp/higedan',
        summary:
          'メンバー4人が語る『Stand By You』の制作過程と、ライブで観客と一緒にクラップして完成する楽曲デザインの意図を収録。',
      },
      {
        title: 'Official髭男dism『Stand By You EP』特集インタビュー',
        publisher: 'Skream!（スクリーム）',
        publishedNote: '2018年10月 インタビュー記事',
        url: 'https://skream.jp/',
        summary:
          '海外のR&B／ゴスペルからの影響と、日本のリスナーに届く普遍的な歌メロの両立について解説。',
      },
    ],
  },
  {
    id: 'q9',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '2023年4月配信のTBS系金曜ドラマ『ペンディングトレイン―8時23分、明日 君と』主題歌であり、消せない過去の傷や記憶すらも仲間との絆として肯定するミドルチューンは？',
    hint: 'メンバー4人がグアムで撮影した、自然体のロードムービー風MVも話題になりました。',
    options: ['日常', 'Sharon', 'TATTOO', 'Anarchy'],
    correctIndex: 2,
    explanation:
      '正解は「TATTOO」（2023年4月21日配信／アルバム『Rejoice』M15収録）。心地よいカッティングギターとメロウなエレピが織りなすAOR／R&Bグルーヴの上で、泥臭い日々や傷跡を優しく肯定するナンバーです。',
    relatedSongId: 'tattoo',
    sources: [
      {
        title: 'Official髭男dismが山田裕貴主演ドラマ「ペンディングトレイン」主題歌「TATTOO」担当',
        publisher: '音楽ナタリー',
        publishedNote: '2023年3月15日 ニュース記事',
        url: 'https://natalie.mu/music/news/516667',
        summary:
          '極限状態の中で人と人が向き合うドラマのテーマに寄り添って書き下ろされた『TATTOO』の制作背景を紹介。',
      },
      {
        title: 'Official髭男dism「TATTOO」レビュー：肩の力を抜いたグッドグルーヴと成熟',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2023年4月 コラム記事',
        url: 'https://realsound.jp/',
        summary:
          'グアムで撮影されたMVに見るメンバー4人の絆と、洗練されたバンドアンサンブルを解説。',
      },
    ],
  },
  {
    id: 'q10',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '2023年12月配信の『劇場版 SPY×FAMILY CODE: White』主題歌であり、甘いも苦いもすべて煮込んで力に変えるようなハイテンション・ブラス＆ロックナンバーは？',
    hint: 'タイトルは「魂のスープ」を意味し、MVでは藤原聡がラーメン店の店主や客に扮するコミカルな演出も話題になりました。',
    options: ['ミックスナッツ', 'ホワイトノイズ', 'FIRE GROUND', 'SOULSOUP'],
    correctIndex: 3,
    explanation:
      '正解は「SOULSOUP」（2023年12月13日配信／アルバム『Rejoice』M4収録）。TVシリーズの『ミックスナッツ』に続いて劇場版『SPY×FAMILY』の主題歌として書き下ろされ、目まぐるしい転調と圧巻のハイトーン（地声最高音hiD・裏声最高音hiF）で駆け抜ける祝祭感あふれる1曲です。',
    relatedSongId: 'soulsoup',
    sources: [
      {
        title: 'Official髭男dism「劇場版 SPY×FAMILY」主題歌「SOULSOUP」を書き下ろし',
        publisher: '音楽ナタリー',
        publishedNote: '2023年10月30日 ニュース記事',
        url: 'https://natalie.mu/music/news/547052',
        summary:
          '『ミックスナッツ』に続くタッグとなった劇場版主題歌『SOULSOUP』の発表とメンバーコメントを掲載。',
      },
      {
        title: 'Official髭男dism、新曲「SOULSOUP」配信リリース＆MV公開',
        publisher: 'Billboard JAPAN',
        publishedNote: '2023年12月13日 ニュース記事',
        url: 'https://www.billboard-japan.com/',
        summary:
          '目まぐるしい転調とホーンセクション、圧倒的なボーカルレンジで駆け抜ける楽曲構成を紹介。',
      },
    ],
  },

  // ============================================================================
  // 中級コース（全10問：q11〜q20）— 転調・変拍子・MVロケ地・結成ライブハウス・最新ツアー
  // ============================================================================
  {
    id: 'q11',
    difficulty: 'intermediate',
    category: '転調・楽曲構造',
    prompt:
      'わずか4分間の楽曲の中に「計11回」もの転調が組み込まれている、TVアニメ『東京リベンジャーズ』オープニング主題歌はどれ？',
    hint: '「胸ぐらを掴まれて 強烈なパンチを食らって」という歌い出しから始まります。',
    options: ['宿命', 'FIRE GROUND', 'Cry Baby', 'Same Blue'],
    correctIndex: 2,
    explanation:
      '正解は「Cry Baby」（2021年5月7日配信／アルバム『Editorial』M6収録）。イントロからアウトロまで計11回もの転調を繰り返しながらも、決して難解にならず1本の熱いロックアンセムとして聴かせる驚異的な作曲技法が高く評価されました。',
    relatedSongId: 'cry-baby',
    sources: [
      {
        title: 'Official髭男dism「Cry Baby」なぜ中毒性が高い？ 驚異的な転調と楽曲構造を分析',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2021年5月 音楽理論コラム',
        url: 'https://realsound.jp/',
        summary:
          'Aメロ・Bメロ・サビ・間奏で次々とキーが変化する『Cry Baby』の転調構造が、タイムリープを繰り返す原作の物語といかにシンクロしているかを徹底解説。',
      },
      {
        title: 'TVアニメ『東京リベンジャーズ』OP主題歌「Cry Baby」特集＆対談',
        publisher: 'TVアニメ『東京リベンジャーズ』公式サイト',
        publishedNote: '2021年 公式タイアップ特集',
        url: 'https://tokyo-revengers-anime.com/',
        summary:
          '何度も倒れながら立ち上がる主人公・花垣武道の姿に重ねた楽曲制作の舞台裏を紹介。',
      },
    ],
  },
  {
    id: 'q12',
    difficulty: 'intermediate',
    category: 'バンドヒストリー・聖地',
    prompt:
      'Official髭男dismが2012年6月7日に結成され、記念すべき初ライブを行った山陰地方の都市とライブハウスの組み合わせとして正しいものは？',
    hint: '島根大学松江キャンパスがある街と、現在も山陰の音楽シーンを支える老舗ライブハウスです。',
    options: [
      '鳥取県・米子市 ／ 米子 AZTiC laughs',
      '島根県・松江市 ／ 松江 AZTiC canova',
      '島根県・出雲市 ／ 出雲 APOLLO',
      '岡山県・岡山市 ／ 岡山 CRAZYMAMA KINGDOM',
    ],
    correctIndex: 1,
    explanation:
      '正解は「島根県・松江市 ／ 松江 AZTiC canova」。島根大学の軽音楽部に所属していた藤原聡・小笹大輔・松浦匡希と、同大学卒業生で先輩の楢﨑誠の4人で結成され、2012年6月7日に松江 AZTiC canovaのステージに立った日からバンドの歴史が始まりました。',
    sources: [
      {
        title: 'Official髭男dism アーティストプロフィール＆バイオグラフィ',
        publisher: '音楽ナタリー',
        publishedNote: '公式アーティストページ',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '2012年6月7日の島根・松江での結成からインディーズ時代、上京、スタジアムバンドへ至る歩みを網羅。',
      },
      {
        title: '山陰発のピアノPOPバンド Official髭男dism 結成ヒストリー＆インタビュー',
        publisher: 'BARKS（バークス）',
        publishedNote: 'インディーズ期インタビューアーカイブ',
        url: 'https://www.barks.jp/',
        summary:
          '松江AZTiC canovaで初ライブを行い、米子AZTiC laughsなど山陰のライブハウスを拠点に腕を磨いた初期エピソードを記録。',
      },
    ],
  },
  {
    id: 'q13',
    difficulty: 'intermediate',
    category: 'リズム・変拍子',
    prompt:
      '2024年10月リリースのTVアニメ『アオのハコ』オープニング主題歌『Same Blue』で、青春の焦燥感や揺れ動く感情を表現するためにイントロやAメロで多用されている変拍子は？',
    hint: '一般的な4拍子（4/4）ではなく、5拍子と6拍子が組み合わさっています。',
    options: ['3/4拍子（ワルツ）のみ', '7/8拍子のみ', '変拍子は使われていない', '5/4拍子 ＆ 6/4拍子'],
    correctIndex: 3,
    explanation:
      '正解は「5/4拍子 ＆ 6/4拍子」。イントロやAメロで5/4拍子と6/4拍子が交錯することで10代の胸のざわめきや一歩踏み出す前の鼓動を表現し、サビに入った瞬間に王道の4/4拍子へと視界が一気に開ける緻密なリズム設計となっています。',
    relatedSongId: 'same-blue',
    sources: [
      {
        title: 'Official髭男dism「Same Blue」レビュー：変拍子というギミックで描く瑞々しい青さ',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2024年10月 楽曲レビュー',
        url: 'https://realsound.jp/',
        summary:
          '5/4拍子・6/4拍子・4/4拍子を自在に行き来しながら、爽快な青春ポップとして聴かせる高度なアレンジ手腕を解説。',
      },
      {
        title: 'Official髭男dism「Same Blue」Behind The Scenes公開',
        publisher: 'Billboard JAPAN',
        publishedNote: '2024年10月 ニュース記事',
        url: 'https://www.billboard-japan.com/',
        summary:
          'MVメイキングおよびメンバーインタビューにて語られた『Same Blue』のリズム構築とタイトルの意味を紹介。',
      },
    ],
  },
  {
    id: 'q14',
    difficulty: 'intermediate',
    category: 'バンドヒストリー・聖地',
    prompt:
      '2025年5月〜6月に全4公演で約25万人を動員した、バンド初のスタジアムツアー『OFFICIAL HIGE DANDISM LIVE at STADIUM 2025』が開催された東西2大スタジアムの組み合わせは？',
    hint: '大阪の長居公園内にあるスタジアムと、新横浜にある日本最大級のスタジアムです。',
    options: [
      'ヤンマースタジアム長居（大阪）＆ 日産スタジアム（神奈川）',
      '阪神甲子園球場（兵庫）＆ 味の素スタジアム（東京）',
      '京セラドーム大阪（大阪）＆ 横浜スタジアム（神奈川）',
      '万博記念競技場（大阪）＆ 国立競技場（東京）',
    ],
    correctIndex: 0,
    explanation:
      '正解は「ヤンマースタジアム長居（大阪）＆ 日産スタジアム（神奈川）」。2025年5月17日・18日に大阪・ヤンマースタジアム長居、5月31日・6月1日に神奈川・日産スタジアムで開催され、7万人の大合唱と花火が夜空を彩りました。',
    relatedSongId: 'sharon',
    sources: [
      {
        title: 'Official髭男dism、初のスタジアムツアーをヤンマースタジアム長居＆日産スタジアムで開催',
        publisher: '音楽ナタリー',
        publishedNote: '2024年11月〜2025年6月 ニュース・ライブレポート',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          'バンド史上最大規模となったスタジアムツアー全4公演の開催概要とファイナル日産スタジアム公演の模様をレポート。',
      },
      {
        title: 'OFFICIAL HIGE DANDISM LIVE at STADIUM 2025 特設サイト',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2025年 公式ツアー特設ページ',
        url: 'https://higedan.com/',
        summary:
          'ヤンマースタジアム長居・日産スタジアム公演の公式セットリスト・公演データを収録。',
      },
    ],
  },
  {
    id: 'q15',
    difficulty: 'intermediate',
    category: 'タイアップ・最新曲',
    prompt:
      '2025年8月6日に配信リリースされた、魚豊原作の劇場アニメ『ひゃくえむ。』主題歌として書き下ろされたロックナンバーは？',
    hint: '他者との比較や葛藤の中で「自分らしく生きること」を力強く肯定する楽曲です。',
    options: ['50%', 'Sharon', 'らしさ', 'SOULSOUP'],
    correctIndex: 2,
    explanation:
      '正解は「らしさ」（2025年8月6日配信）。藤原聡がタイアップオファーを受ける前から自身のアイデンティティを見つめ直す中でデモを書き始めており、劇場アニメ『ひゃくえむ。』の100m走に全てを懸けるランナーたちの物語と深く共鳴して完成しました。',
    relatedSongId: 'rashisa',
    sources: [
      {
        title: 'Official髭男dism、魚豊原作の劇場アニメ「ひゃくえむ。」主題歌「らしさ」を担当',
        publisher: '音楽ナタリー',
        publishedNote: '2025年7月〜8月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '劇場アニメ『ひゃくえむ。』主題歌決定のニュースと、デモ制作時からタイトルを『らしさ』と名付けていた藤原聡のコメントを掲載。',
      },
      {
        title: 'Official髭男dism デジタルシングル『らしさ』リリースインフォメーション',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2025年8月6日 公式リリース情報',
        url: 'https://higedan.com/',
        summary:
          '2025年8月6日配信の楽曲情報・ジャケットアートワーク・MV公開情報を掲載。',
      },
    ],
  },
  {
    id: 'q16',
    difficulty: 'intermediate',
    category: 'バンドヒストリー・聖地',
    prompt:
      '代表曲『Pretender』のミュージックビデオが全編にわたって撮影された海外の都市と、屋上での演奏シーンの背後に輝くネオン看板の文字の組み合わせとして正しいものは？',
    hint: '映画『コンフィデンスマンJP ロマンス編』のアジア圏の雰囲気に合わせ、夜景と路地裏が美しい街で撮影されました。',
    options: [
      '韓国・ソウル市 ／「京城劇場」',
      '台湾・台北市 ／「東方電影院」',
      'シンガポール ／「南洋戯院」',
      'タイ・バンコク ／「亜細亜電影」',
    ],
    correctIndex: 1,
    explanation:
      '正解は「台湾・台北市 ／ 東方電影院」。西門町エリアの路地や台北国際芸術村の屋上で撮影され、背後に輝く「東方電影院」の巨大ネオン看板はMV撮影のために屋上に組まれた特設の美術セットでした。',
    relatedSongId: 'pretender',
    sources: [
      {
        title: 'Official髭男dism、台湾で撮影した「Pretender」MV公開',
        publisher: '音楽ナタリー',
        publishedNote: '2019年4月16日 ニュース記事',
        url: 'https://natalie.mu/music/news/328056',
        summary:
          '台湾・台北の西門町エリアやビル屋上で行われた『Pretender』MVロケの詳細と監督・キャスト情報を紹介。',
      },
      {
        title: 'Official髭男dism「Pretender」台湾ロケMVの見どころ＆聖地解説',
        publisher: 'JOYSOUND 音楽ニュース',
        publishedNote: '楽曲特集記事',
        url: 'https://www.joysound.com/',
        summary:
          '屋上演奏シーンの「東方電影院」ネオンセットや台北の街並みが楽曲の切なさを引き立てる演出を解説。',
      },
    ],
  },
  {
    id: 'q17',
    difficulty: 'intermediate',
    category: 'バンドヒストリー・聖地',
    prompt:
      '「Official髭男dism」というユニークなバンド名の名付け親であるメンバーは誰？',
    hint: 'ベースやサックスを担当する最年長メンバーで、ポスターで見かけた「髭が似合うギタリスト」から直感的に閃いたと語っています。',
    options: [
      '藤原 聡 (Vo./Pf.)',
      '小笹 大輔 (Gt.)',
      '松浦 匡希 (Dr.)',
      '楢﨑 誠 (Ba./Sax)',
    ],
    correctIndex: 3,
    explanation:
      '正解は「楢﨑 誠」。結成時、スタジオ予約のためにバンド名が必要になり、楢﨑が直感的に「Official髭男dism」と命名しました。その後メンバー間で「髭の似合う歳になっても、誰もがワクワクするような音楽をこのメンバーでずっと続けていきたい」という素敵な意味が込められました。',
    sources: [
      {
        title: 'Official髭男dism、バンド名の由来は？ 名付け親・楢﨑誠が語るエピソード',
        publisher: 'J-WAVE NEWS',
        publishedNote: 'ラジオ番組トーク＆インタビュー記事',
        url: 'https://news.j-wave.co.jp/',
        summary:
          '漢字と英語を組み合わせた視覚的インパクトと、髭が似合うソロギタリストのポスターから閃いた命名秘話を紹介。',
      },
      {
        title: 'Official髭男dism バンド名の由来と結成秘話インタビュー',
        publisher: 'ORICON NEWS',
        publishedNote: 'アーティスト特集記事',
        url: 'https://www.oricon.co.jp/',
        summary:
          '結成当初は周囲から驚かれたバンド名が「ヒゲダン」の愛称で全国に親しまれるまでのエピソードを掲載。',
      },
    ],
  },
  {
    id: 'q18',
    difficulty: 'intermediate',
    category: 'タイアップ・代表曲',
    prompt:
      '2023年8月配信・9月CDリリースの名曲『Chessboard』（アルバム『Rejoice』M14）は、どの音楽コンクールの課題曲として書き下ろされた楽曲？',
    hint: '全国の学校合唱部が参加するNHKの伝統あるコンクール（第90回）です。',
    options: [
      '第90回NHK全国学校音楽コンクール（Nコン）中学校の部',
      '全日本吹奏楽コンクール 高等学校の部',
      'NHK『18祭（フェス）』1000人合唱企画',
      '全国高校サッカー選手権大会 応援歌',
    ],
    correctIndex: 0,
    explanation:
      '正解は「第90回NHK全国学校音楽コンクール（Nコン）中学校の部」。人生をチェス盤の白と黒のマス目になぞらえ、うまくいかない日も美しい日々もすべてが自分の足跡になるという温かいメッセージを込めた楽曲です。',
    relatedSongId: 'chessboard-song',
    sources: [
      {
        title: 'Official髭男dismがNコン中学校の部課題曲「Chessboard」書き下ろし',
        publisher: '音楽ナタリー',
        publishedNote: '2023年3月〜9月 ニュース記事',
        url: 'https://natalie.mu/music/news/515000',
        summary:
          '第90回Nコン（テーマ：地図）の中学校の部課題曲として制作された『Chessboard』の歌詞世界と合唱編曲について紹介。',
      },
      {
        title: 'NHK全国学校音楽コンクール（Nコン）第90回課題曲『Chessboard』紹介',
        publisher: 'NHK Nコン公式サイト',
        publishedNote: '2023年度 課題曲アーカイブ',
        url: 'https://www.nhk.or.jp/ncon/',
        summary:
          '中学生へのメッセージとして藤原聡が語った制作への想いを掲載。',
      },
    ],
  },
  {
    id: 'q19',
    difficulty: 'intermediate',
    category: 'イントロ・楽器編成',
    prompt:
      '2023年1月配信のTVアニメ『東京リベンジャーズ』聖夜決戦編OP主題歌であり、小笹大輔の高速ギタータッピングと重厚なロックリフで幕を開けるナンバーは？',
    hint: 'タイトルはテレビやラジオの砂嵐音や、あらゆる周波数を均等に含むノイズを意味します。',
    options: ['Anarchy', 'ホワイトノイズ', 'FIRE GROUND', 'Cry Baby'],
    correctIndex: 1,
    explanation:
      '正解は「ホワイトノイズ」（2023年1月11日配信／アルバム『Rejoice』M12収録）。ヒゲダンのハードロック的な側面が全面に押し出された楽曲で、巨大スピーカーの前で演奏する迫力のMVも大きな話題を呼びました。',
    relatedSongId: 'white-noise',
    sources: [
      {
        title: 'Official髭男dism「東京リベンジャーズ」聖夜決戦編OP主題歌「ホワイトノイズ」配信リリース',
        publisher: '音楽ナタリー',
        publishedNote: '2023年1月11日 ニュース記事',
        url: 'https://natalie.mu/music/news/507943',
        summary:
          '『Cry Baby』に続き『東京リベンジャーズ』とタッグを組んだロックナンバー『ホワイトノイズ』のリリースとMV公開をレポート。',
      },
      {
        title: 'Official髭男dism「ホワイトノイズ」が鳴らすハードロックへの敬意と進化',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2023年1月 楽曲レビュー',
        url: 'https://realsound.jp/',
        summary:
          'ピアノポップの枠を超え、ラウド＆ヘヴィなギターリフを主役に据えたサウンドアプローチを分析。',
      },
    ],
  },
  {
    id: 'q20',
    difficulty: 'intermediate',
    category: 'タイアップ・最新曲',
    prompt:
      '2024年12月13日配信の映画『はたらく細胞』主題歌であり、「無理に100%で走り続けるのではなく、半分くらいの力で自分を労わりながら生きよう」と歌う楽曲は？',
    hint: 'タイトルにはそのままパーセンテージの数字が使われています。',
    options: ['日常', 'Get Back To 人生', 'Sharon', '50%'],
    correctIndex: 3,
    explanation:
      '正解は「50%」（2024年12月13日配信）。藤原聡自身が喉の療養期間を経て感じた「心と身体を大切にしながら音楽を長く続けていくこと」への実感が、体内細胞の奮闘を描く映画『はたらく細胞』のテーマと見事に重なったゴスペル・ファンクナンバーです。',
    relatedSongId: 'fifty-percent',
    sources: [
      {
        title: 'Official髭男dism、映画「はたらく細胞」主題歌に新曲「50%」書き下ろし',
        publisher: '音楽ナタリー',
        publishedNote: '2024年10月〜12月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '映画『はたらく細胞』主題歌起用にあたって語られた、自身の身体や健康と向き合うメッセージを紹介。',
      },
      {
        title: 'Official髭男dism、新曲「50%」配信リリース＆制作背景コメント',
        publisher: 'THE FIRST TIMES',
        publishedNote: '2024年12月13日 ニュース記事',
        url: 'https://www.thefirsttimes.jp/',
        summary:
          '壮大なゴスペルコーラスとファンクビートが融合した『50%』のサウンドと歌詞の聴きどころを解説。',
      },
    ],
  },

  // ============================================================================
  // 上級（BROTHERS）コース（全10問：q21〜q30）— メンバー作詞作曲・インディーズ初期・深層トリビア
  // ============================================================================
  {
    id: 'q21',
    difficulty: 'brothers',
    category: 'メンバー作詞作曲',
    prompt:
      'アルバム『Traveler』収録の『Rowan』（M4）と、アルバム『Editorial』収録の『Bedroom Talk』（M11）の2曲で、単独で作詞・作曲を手がけたメンバーは誰？',
    hint: 'ハードロックからネオソウル、繊細なアルペジオまで弾きこなすギタリストです。',
    options: [
      '楢﨑 誠 (Ba./Sax)',
      '小笹 大輔 (Gt.)',
      '松浦 匡希 (Dr.)',
      '藤原 聡 (Vo./Pf.)',
    ],
    correctIndex: 1,
    explanation:
      '正解は「小笹 大輔」。『Rowan』（ナナカマドを意味するタイトル）は小笹が初めて作詞・作曲を手がけたメロウなR&Bナンバーであり、続く『Editorial』の『Bedroom Talk』でもチルで洗練されたネオソウル・ギターサウンドを披露しています。',
    relatedSongId: 'rowan-song',
    sources: [
      {
        title: 'Official髭男dism『Traveler』『Editorial』特設サイト オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月・2021年8月 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          '小笹大輔が『Rowan』『Bedroom Talk』のデモを制作した際のエピソードと、藤原聡のボーカルディレクションについて語る。',
      },
      {
        title: 'Official髭男dism『Editorial』全曲レビュー：メンバー4人それぞれの作家性',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2021年8月 アルバム批評記事',
        url: 'https://realsound.jp/',
        summary:
          '藤原聡だけでなく小笹・楢﨑・松浦の全員が作詞作曲に携わることで広がるバンドの音楽的奥行きを分析。',
      },
    ],
  },
  {
    id: 'q22',
    difficulty: 'brothers',
    category: 'メンバー作詞作曲',
    prompt:
      'アルバム『Traveler』のM10『旅は道連れ』と、アルバム『Editorial』のM8『みどりの雨避け』の作詞・作曲を手がけたメンバーは誰？',
    hint: 'エレキベース・ウッドベース・シンセベースに加え、サックスまで演奏するマルチプレイヤーです。',
    options: [
      '小笹 大輔 (Gt.)',
      '松浦 匡希 (Dr.)',
      '楢﨑 誠 (Ba./Sax)',
      '藤原 聡 (Vo./Pf.)',
    ],
    correctIndex: 2,
    explanation:
      '正解は「楢﨑 誠」。仲間との賑やかな旅路を歌ったシャッフルビートの『旅は道連れ』や、雨上がりの優しい情景を描いた『みどりの雨避け』、さらに映画主題歌『Choral A』の作詞・作曲を手がけています。',
    relatedSongId: 'midori-no-amayoke',
    sources: [
      {
        title: 'Official髭男dism『Editorial』特設サイト 収録曲クレジット＆インタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2021年8月18日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          'M8『みどりの雨避け』の制作背景や、マリンバ・木管楽器を取り入れた温かいアレンジについて楢﨑誠が解説。',
      },
      {
        title: 'Official髭男dism『Traveler』全曲解説インタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'M10『旅は道連れ』に込められたメンバー間の空気感と軽快なリズムアレンジについて紹介。',
      },
    ],
  },
  {
    id: 'q23',
    difficulty: 'brothers',
    category: 'イントロ・楽器編成',
    prompt:
      'メジャー2ndアルバム『Editorial』のM2（リード曲）であり、生物学における「プログラムされた細胞死」を意味するタイトルを冠した、楢﨑誠のソプラノサックスも印象的な6分24秒の大作は？',
    hint: '「さよならは いつか来る」というフレーズが印象的な楽曲です。',
    options: ['アポトーシス', 'ペンディング・マシーン', 'フィラメント', 'Shower'],
    correctIndex: 0,
    explanation:
      '正解は「アポトーシス」（2021年8月11日先行配信／『Editorial』M2収録）。木の葉が秋に色づいて落ちるように、限られた命や別れがあるからこそ今この瞬間が輝くという深い死生観を、美しいシンセとソプラノサックスで描き切った6分24秒の名曲です。',
    relatedSongId: 'editorial-song',
    sources: [
      {
        title: 'Official髭男dism、アルバム「Editorial」より「アポトーシス」先行配信＆MV公開',
        publisher: '音楽ナタリー',
        publishedNote: '2021年8月11日 ニュース記事',
        url: 'https://natalie.mu/music/news/440343',
        summary:
          'アルバム『Editorial』M2の中核を担う6分超の大作『アポトーシス』の先行配信と新保拓人監督によるMVを紹介。',
      },
      {
        title: 'Official髭男dism「アポトーシス」徹底考察：死生観と革新的リズムアプローチ',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2021年8月 コラム記事',
        url: 'https://realsound.jp/',
        summary:
          '29半音（約2.4オクターブ）の広い音域と緻密なビート構築で描かれる『アポトーシス』の音楽的達成を解説。',
      },
    ],
  },
  {
    id: 'q24',
    difficulty: 'brothers',
    category: 'ディスコグラフィ・映画主題歌',
    prompt:
      '2022年公開の映画『異動辞令は音楽隊！』の主題歌『Choral A』（『ミックスナッツ EP』M3）を作詞・作曲し、劇中にカメオ出演も果たした楢﨑誠が、かつて島根県で実際に嘱託職員として所属していた組織は？',
    hint: '映画の題材そのものである、警察の吹奏楽・音楽組織です。',
    options: [
      '陸上自衛隊音楽隊',
      '松江市消防音楽隊',
      'JR西日本吹奏楽団',
      '島根県警察音楽隊',
    ],
    correctIndex: 3,
    explanation:
      '正解は「島根県警察音楽隊」。楢﨑誠は島根大学卒業後、実際に島根県警察音楽隊に嘱託警察官（サックス奏者）として勤務しながらバンド活動を続けていました。その縁から警察音楽隊を題材にした映画『異動辞令は音楽隊！』の主題歌『Choral A』を作詞・作曲し、本編へのカメオ出演も実現しました。',
    relatedSongId: 'choral-a-song',
    sources: [
      {
        title: 'ヒゲダン楢﨑誠、古巣・警察音楽隊題材の映画で主題歌「Choral A」書き下ろし＆本編カメオ出演',
        publisher: 'ORICON NEWS',
        publishedNote: '2022年7月 映画・音楽ニュース記事',
        url: 'https://www.oricon.co.jp/',
        summary:
          '元・島根県警察音楽隊員である楢﨑誠が『Choral A』を作詞・作曲した経緯と、劇中での楽器店店員役カメオ出演をレポート。',
      },
      {
        title: 'Official髭男dism、阿部寛主演映画『異動辞令は音楽隊！』主題歌「Choral A」担当',
        publisher: 'THE FIRST TIMES',
        publishedNote: '2022年6月 インタビュー＆ニュース',
        url: 'https://www.thefirsttimes.jp/',
        summary:
          '警察音楽隊時代の仲間や経験への想いを込めた楢﨑誠の公式コメントを全文掲載。',
      },
    ],
  },
  {
    id: 'q25',
    difficulty: 'brothers',
    category: 'ディスコグラフィ',
    prompt:
      '2015年4月22日にリリースされたOfficial髭男dismの記念すべきインディーズ1stミニアルバム『ラブとピースは君の中』の1曲目（M1）に収録されている楽曲は？',
    hint: '小鳥のさえずりのような爽やかなバンドサウンドで幕を開けるポップナンバーです（なお『ラブとピースは君の中』という同名曲は存在しません）。',
    options: ['恋の前ならえ', 'SWEET TWEET', '愛なんだが・・・', 'コーヒーとシロップ'],
    correctIndex: 1,
    explanation:
      '正解は「SWEET TWEET」（『ラブとピースは君の中』M1収録）。なおM2が『恋の前ならえ』、M6が『愛なんだが・・・』、M8が『ダーリン。』であり、アルバムタイトルと同名の楽曲は存在しないのもファンなら押さえておきたいポイントです。',
    relatedSongId: 'sweet-tweet',
    sources: [
      {
        title: 'Official髭男dism 1st Mini Album『ラブとピースは君の中』公式ディスコグラフィ',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2015年4月22日発売 作品データ',
        url: 'https://higedan.com/',
        summary:
          'M1『SWEET TWEET』からM8『ダーリン。』まで全8曲の公式トラックリストと作品解説を掲載。',
      },
      {
        title: '山陰発の4人組バンド Official髭男dism、デビューミニアルバム『ラブとピースは君の中』発表',
        publisher: '音楽ナタリー',
        publishedNote: '2015年4月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          'インディーズデビュー作のリリース情報と初期のライブツアー展開をレポート。',
      },
    ],
  },
  {
    id: 'q26',
    difficulty: 'brothers',
    category: 'ディスコグラフィ',
    prompt:
      'メジャー1stアルバム『Traveler』のM11に収録され、曲間0秒でM12『Pretender』へと繋がる11秒のインスト曲『052519』や、『Pretender』の歌詞世界に強いインスピレーションを与えた、藤原聡が大ファンであることを公言しているSF作品は？',
    hint: '「世界線」や「ダイバージェンスメーター」が登場するタイムリープSF作品です。',
    options: [
      '新世紀エヴァンゲリオン',
      '攻殻機動隊 STAND ALONE COMPLEX',
      'STEINS;GATE（シュタインズ・ゲート）',
      'バック・トゥ・ザ・フューチャー',
    ],
    correctIndex: 2,
    explanation:
      '正解は「STEINS;GATE（シュタインズ・ゲート）」。藤原聡は『STEINS;GATE』の大ファンであり、同作で世界線を越えても変えられない運命や「世界線変動率（ダイバージェンスメーター）」の概念が、『Pretender』の「もっと違う設定で もっと違う関係で 出会える世界線 選べたらよかった」という歌詞やM11『052519』の仕掛けにインスピレーションを与えています。',
    relatedSongId: 'pretender',
    sources: [
      {
        title: 'Official髭男dism『Traveler』オフィシャルインタビュー＆全曲解説',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月9日 アルバム特設サイト',
        url: 'https://higedan.com/',
        summary:
          'M11『052519』からM12『Pretender』へ曲間0秒で繋がるアルバムならではの構成と世界線モチーフについて解説。',
      },
      {
        title: 'Official髭男dism「Pretender」の歌詞になぜ「世界線」が登場するのか？',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '歌詞・カルチャー考察記事',
        url: 'https://realsound.jp/',
        summary:
          '藤原聡が公言する『STEINS;GATE』からの影響と、J-POPのラブソングにSF用語「世界線」を定着させた功績を分析。',
      },
    ],
  },
  {
    id: 'q27',
    difficulty: 'brothers',
    category: 'メンバー作詞作曲',
    prompt:
      'ドラマーの松浦匡希（ちゃんまつ）が初めて作詞・作曲（藤原聡との共作）にクレジットされ、これにより「メンバー4人全員が作詞・作曲クレジットを持つバンド」となった、メジャー2ndアルバム『Editorial』M4収録の楽曲は？',
    hint: '白熱電球の中で熱せられて光を放つ細い金属線を意味するカタカナタイトルで、富士通『FMV』CMソングにも起用されました。',
    options: [
      'ペンディング・マシーン',
      'Shower',
      'アンコール',
      'フィラメント',
    ],
    correctIndex: 3,
    explanation:
      '正解は「フィラメント」（『Editorial』M4収録／作詞・作曲：松浦匡希・藤原聡）。前作『Traveler』で小笹大輔（『Rowan』）と楢﨑誠（『旅は道連れ』）が作詞・作曲を手がけたのに続き、『Editorial』M4『フィラメント』で松浦匡希が初めてソングライティングに参加し、メンバー4人全員が作詞・作曲できるバンドとしての地力を証明しました。',
    relatedSongId: 'filament-song',
    sources: [
      {
        title: 'Official髭男dism『Editorial』特設サイト オフィシャルインタビュー＆全曲解説',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2021年8月18日 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          '松浦匡希が持ち込んだワンコーラスのデモを起点に藤原聡と共作して完成したM4『フィラメント』の制作秘話を掲載。',
      },
      {
        title: 'リズム＆ドラム・マガジン Official髭男dism 松浦匡希 特集インタビュー',
        publisher: 'リットーミュージック（Rhythm & Drums Magazine）',
        publishedNote: 'アーティスト特集記事',
        url: 'https://www.rittor-music.co.jp/magazine/dm/',
        summary:
          'ドラマーとしてのグルーヴ構築だけでなく、『フィラメント』でソングライティングにも踏み出した松浦匡希の音楽的ルーツを紹介。',
      },
    ],
  },
  {
    id: 'q28',
    difficulty: 'brothers',
    category: 'バンドヒストリー・聖地',
    prompt:
      'ボーカルの藤原聡が島根大学を卒業後、上京するまでの約2年間、バンド活動と並行して地元・山陰で勤務していた職業と、その社会人時代の葛藤から生まれた2ndミニアルバム『MAN IN THE MIRROR』（M2）収録曲の組み合わせは？',
    hint: '営業マンとしてスーツを着て働きながら、夜や休日に曲を書いていた時代のエピソードです。',
    options: [
      '銀行員（営業マン） ／『コーヒーとシロップ』',
      '高校の音楽教師 ／『始まりの朝』',
      '楽器店のピアノ調律師 ／『日曜日のラブレター』',
      "ラジオ局のAD ／『What's Going On?』",
    ],
    correctIndex: 0,
    explanation:
      '正解は「銀行員（営業マン） ／『コーヒーとシロップ』」。藤原聡は大学卒業後、地元の銀行で営業マンとして約2年間勤務しながらバンド活動を続けていました。社会人としてのプレッシャーや苦いコーヒーにシロップを入れて飲み干す日々の実感が『コーヒーとシロップ』（2016年『MAN IN THE MIRROR』M2収録）のリアルな歌詞へと結実しました。',
    relatedSongId: 'coffee-to-syrup',
    sources: [
      {
        title: 'Official髭男dism「Stand By You EP」インタビュー：山陰での社会人時代から上京まで',
        publisher: '音楽ナタリー',
        publishedNote: '2018年10月 特集インタビュー',
        url: 'https://natalie.mu/music/pp/higedan',
        summary:
          '銀行員として働きながら音楽を続けていた山陰時代と、覚悟を決めてメンバー4人で上京した当時のエピソードを語る。',
      },
      {
        title: 'Official髭男dism 2ndミニアルバム『MAN IN THE MIRROR』リリースインタビュー',
        publisher: 'BARKS（バークス）',
        publishedNote: '2016年6月 インタビュー記事',
        url: 'https://www.barks.jp/',
        summary:
          '『コーヒーとシロップ』に込められた働く人々の葛藤と、それに寄り添うポップミュージックの力について解説。',
      },
    ],
  },
  {
    id: 'q29',
    difficulty: 'brothers',
    category: 'ディスコグラフィ',
    prompt:
      '2018年4月11日発売の1stフルアルバム『エスカパレード』のタイトルは、どの2つの英単語を掛け合わせた造語？',
    hint: 'M3に収録されているファンクナンバー『ESCAPADE』が大きなヒントです。',
    options: [
      '『Escalator（エスカレーター）』×『Parade（パレード）』',
      '『Escapade（現実からの愉快な逃避行）』×『Parade（パレード）』',
      '『Escape（脱出）』×『Serenade（セレナーデ）』',
      '『Esplanade（遊歩道）』×『Masquerade（仮面舞踏会）』',
    ],
    correctIndex: 1,
    explanation:
      '正解は「『Escapade（現実からの愉快な逃避行）』×『Parade（パレード）』」。M3に収録されている『ESCAPADE』と、音楽の祝祭的な行進を意味する『Parade』を掛け合わせ、「日常の憂鬱から抜け出して音楽のパレードへ連れ出すアルバム」というコンセプトが込められています。',
    relatedSongId: 'escapade-song',
    sources: [
      {
        title: 'Official髭男dism 1stフルアルバム『エスカパレード』特集インタビュー',
        publisher: 'Skream!（スクリーム）',
        publishedNote: '2018年4月 インタビュー記事',
        url: 'https://skream.jp/',
        summary:
          '造語タイトル『エスカパレード（Escapade × Parade）』の命名理由と全13曲の制作背景を詳しく解説。',
      },
      {
        title: 'Official髭男dism、初フルアルバム「エスカパレード」全貌公開',
        publisher: '音楽ナタリー',
        publishedNote: '2018年3月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          'インディーズ集大成にしてメジャー進出の起点となった1stフルアルバム『エスカパレード』の収録曲とアートワークを紹介。',
      },
    ],
  },
  {
    id: 'q30',
    difficulty: 'brothers',
    category: 'ディスコグラフィ',
    prompt:
      '2024年7月リリースのメジャー3rdアルバム『Rejoice』のM13に収録されている、溜め込んだ日々の鬱憤をユーモラスな早口言葉遊びとブルージーなファンクロックで吹き飛ばすナンバーは？',
    hint: 'ひらがな10文字のユニークなタイトルで、韻を踏んだ言葉遊びが特徴です。',
    options: [
      'ゼロのままでいられたら',
      'たかがアイラブユー',
      'うらみつらみきわみ',
      'されど日々は',
    ],
    correctIndex: 2,
    explanation:
      '正解は「うらみつらみきわみ」（『Rejoice』M13収録）。アルバム終盤（M14『Chessboard』、M15『TATTOO』、最終曲M16『B-Side Blues』へと向かうM13）に、あえて綺麗事だけではない人間のドロドロした感情やボヤキをファンキーに笑い飛ばす『うらみつらみきわみ』を配置することで、ヒゲダンらしい人間味とユーモアを表現しています。',
    relatedSongId: 'uramitsurami-kiwami',
    sources: [
      {
        title: 'Official髭男dism Major 3rd Album『Rejoice』特設サイト オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2024年7月24日 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'アルバムM13に収録された『うらみつらみきわみ』の言葉遊びと、ブルース／ファンク色の強いバンドセッションについて語る。',
      },
      {
        title: 'Official髭男dism『Rejoice』全曲レビュー：苦難を越えて到達した「音楽を鳴らす歓び」',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: '2024年7月〜8月 アルバムレビュー',
        url: 'https://realsound.jp/',
        summary:
          'M1『Finder』から始まりM13『うらみつらみきわみ』、最終曲M16『B-Side Blues』まで全16トラックの構成美を徹底分析。',
      },
    ],
  },

  // ============================================================================
  // 初級 追加バリエーション（全10問：q31〜q40）— 並び替え・50音順・時間・表記・メンバー好物
  // ============================================================================
  {
    id: 'q31',
    difficulty: 'beginner',
    questionType: 'ordering',
    category: '並び替え・リリース順',
    prompt:
      '【並び替え問題】Official髭男dismがリリースした以下のフルアルバム4作品を、発売された順（古い順：1番目→4番目）に選択してください。',
    hint: '2018年の1stフルアルバムから、2019年、2021年、そして2024年の3rdメジャーアルバムへと続きます。',
    options: ['Traveler', 'Rejoice', 'エスカパレード', 'Editorial'],
    correctIndex: 0,
    correctOrder: [2, 0, 3, 1],
    explanation:
      '正しいリリース順は「1. エスカパレード（2018年4月11日） → 2. Traveler（2019年10月9日） → 3. Editorial（2021年8月18日） → 4. Rejoice（2024年7月24日）」です。インディーズ集大成の『エスカパレード』から約6年間で日本の音楽シーンを代表するスタジアムバンドへと駆け上がりました。',
    relatedSongId: '115man-kilo',
    sources: [
      {
        title: 'Official髭男dism 公式ディスコグラフィ（ALBUM一覧）',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '公式作品アーカイブ',
        url: 'https://higedan.com/',
        summary:
          '『エスカパレード』（2018年）、『Traveler』（2019年）、『Editorial』（2021年）、『Rejoice』（2024年）の発売日・収録曲データを網羅。',
      },
      {
        title: '115万キロのファンノート 全86曲データベース（発売順・アルバムガイド順集計）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイトの「全曲音域＆楽曲図鑑」にて、各アルバムの発売年月日順ソートおよびアルバム収録曲順ソートを提供。',
      },
    ],
  },
  {
    id: 'q32',
    difficulty: 'beginner',
    questionType: 'ordering',
    category: '並び替え・リリース順',
    prompt:
      '【並び替え問題】以下の大ヒット主題歌4曲を、リリース・配信された順（古い順：1番目→4番目）に選択してください。',
    hint: 'メジャーデビュー曲（2018年）が1番目、ドラマ『silent』主題歌（2022年10月）が4番目です。',
    options: ['Subtitle', 'ノーダウト', 'Cry Baby', 'Pretender'],
    correctIndex: 3,
    correctOrder: [1, 3, 2, 0],
    explanation:
      '正しいリリース順は「1. ノーダウト（2018年4月11日発売） → 2. Pretender（2019年5月15日発売） → 3. Cry Baby（2021年5月7日配信） → 4. Subtitle（2022年10月12日配信）」です。',
    relatedSongId: 'no-doubt',
    sources: [
      {
        title: '115万キロのファンノート 全86曲データベース（リリース年月日順データ）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイト内の「発売が古い順／新しい順」ソート機能に基づき、歴代シングル・配信曲の正確な時系列を検証。',
      },
      {
        title: 'Official髭男dism シングル・デジタル配信ディスコグラフィ',
        publisher: '音楽ナタリー',
        publishedNote: 'アーティスト特集・作品年表',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '2018年のメジャーデビューから各年の代表曲リリース履歴を記録。',
      },
    ],
  },
  {
    id: 'q33',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      '2020年8月発売の『HELLO EP』（およびアルバム『Editorial』M12）に収録され、映画『コンフィデンスマンJP プリンセス編』の主題歌として書き下ろされた、自分らしく生きる誇りを歌う壮大なロックバラードは？',
    hint: 'タイトルは英語で「笑い声」を意味し、翼を広げて飛び立つ鳥のモチーフが歌詞に登場します。',
    options: ['パラボラ', 'Laughter', 'HELLO', 'イエスタデイ'],
    correctIndex: 1,
    explanation:
      '正解は「Laughter」（2020年7月10日先行配信／『HELLO EP』M3・『Editorial』M12収録）。映画『コンフィデンスマンJP プリンセス編』の主題歌であり、「自分自身に勝利を告げるための歌」としてライブでも圧倒的な感動を生む名曲です。',
    relatedSongId: 'laughter-song',
    sources: [
      {
        title: 'Official髭男dism、映画「コンフィデンスマンJP プリンセス編」主題歌「Laughter」担当',
        publisher: '音楽ナタリー',
        publishedNote: '2020年1月〜7月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '『ノーダウト』『Pretender』に続き3度目の『コンフィデンスマンJP』タッグとなった『Laughter』の制作背景を紹介。',
      },
      {
        title: 'Official髭男dism『HELLO EP』オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2020年8月5日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          '重厚なストリングスとロックバンドのダイナミズムが融合した『Laughter』のサウンドメイキングを解説。',
      },
    ],
  },
  {
    id: 'q34',
    difficulty: 'beginner',
    category: 'タイアップ・代表曲',
    prompt:
      'メジャー1stアルバム『Traveler』の1曲目（M1）に収録され、北村匠海らが声優を務めたSF青春アニメーション映画『HELLO WORLD』の主題歌として書き下ろされた楽曲は？',
    hint: '「何度失っても 取り返してみせるよ」という力強いサビで始まる疾走ナンバーです。',
    options: ['Amazing', 'ビンテージ', 'イエスタデイ', 'Rowan'],
    correctIndex: 2,
    explanation:
      '正解は「イエスタデイ」（2019年9月11日先行配信／『Traveler』M1収録）。美しいピアノリフとストリングスで幕を開け、大切な人を守るために過去の後悔（イエスタデイ）を乗り越えていく決意を描いた名曲です。',
    relatedSongId: 'yesterday-song',
    sources: [
      {
        title: 'Official髭男dismが伊藤智彦監督アニメ映画「HELLO WORLD」主題歌「イエスタデイ」書き下ろし',
        publisher: '音楽ナタリー',
        publishedNote: '2019年7月〜9月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '映画『HELLO WORLD』の世界観とリンクする『イエスタデイ』の制作エピソードとメンバーコメントを掲載。',
      },
      {
        title: 'Official髭男dism『Traveler』全曲解説インタビュー：M1「イエスタデイ」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'アルバムのオープニングトラックとして配置された理由と転調・アレンジの工夫を解説。',
      },
    ],
  },
  {
    id: 'q35',
    difficulty: 'beginner',
    category: 'サイト内データ・50音＆時間',
    prompt:
      '2026年11月7日時点の当サイト全楽曲データベースおよび公式ディスコグラフィにおいて、全楽曲を「五十音順（読み仮名順）」で並べたとき、『I LOVE...（あいらぶ）』よりも前に位置し、一番最初（先頭）にくる楽曲はどれ？',
    hint: '読み仮名が「あ・い・な…」で始まる、2015年の1stミニアルバム『ラブとピースは君の中』収録曲です。',
    options: ['愛なんだが・・・', 'アポトーシス', 'Amazing', 'Anarchy'],
    correctIndex: 0,
    explanation:
      '正解は「愛なんだが・・・」（読み：あいなんだが）。「あ・い・な…」で始まるため、『I LOVE...（あ・い・ら…）』『Anarchy（あ・な…）』『アポトーシス（あ・ぽ…）』『Amazing（あ・め…）』を抑えて、ヒゲダン全楽曲の五十音順でトップ（1番目）に位置します。',
    relatedSongId: 'ai-nandaga',
    sources: [
      {
        title: '115万キロのファンノート 全楽曲データベース（五十音順・読み仮名インデックス検証）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内統計データ',
        url: 'https://higedan.com/',
        summary:
          '2015年『ラブとピースは君の中』から2026年最新作までの全楽曲の読み仮名を五十音順ソートし、先頭が『愛なんだが・・・（あいなんだが）』であることを検証。',
      },
      {
        title: 'Official髭男dism 歌詞一覧（曲名五十音順ソート）',
        publisher: '歌ネット（Uta-Net）',
        publishedNote: 'アーティスト歌詞データベース',
        url: 'https://www.uta-net.com/',
        summary:
          '歌詞検索サイトの五十音順一覧においても『愛なんだが・・・』が「あ行」の最先頭に配置されていることを確認。',
      },
    ],
  },
  {
    id: 'q36',
    difficulty: 'beginner',
    category: 'サイト内データ・50音＆時間',
    prompt:
      '当サイトの全86曲データベースの中で、演奏時間が「6分24秒（384秒）」と全楽曲の中で最も長い超大作はどれ？',
    hint: '2番目に長い『Laughter』（5分52秒）や『Pretender』（5分26秒）を30秒以上上回る、『Editorial』収録のリード曲です。',
    options: ['115万キロのフィルム', 'Pretender', 'Chessboard', 'アポトーシス'],
    correctIndex: 3,
    explanation:
      '正解は「アポトーシス」（6分24秒／384秒）。当サイトの全86曲データベースにおける長尺ランキングは、1位『アポトーシス』（6分24秒）、2位『Laughter』（5分52秒）、3位『Pretender』（5分26秒）、4位『Chessboard』（5分25秒）、5位『115万キロのフィルム』（5分24秒）となっています。',
    relatedSongId: 'editorial-song',
    sources: [
      {
        title: '115万キロのファンノート 全86曲データベース（演奏時間・BPM・転調統計）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          'セットリスト作成機能および楽曲図鑑に収録された全86曲の演奏時間（durationSec）を集計し、最長曲が『アポトーシス』（384秒）であることを算出。',
      },
      {
        title: 'Official髭男dism『Editorial』作品仕様・収録時間データ',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2021年8月18日 公式ディスコグラフィ',
        url: 'https://higedan.com/',
        summary:
          'M2『アポトーシス』のトラックタイム（6:24）および楽曲クレジットを掲載。',
      },
    ],
  },
  {
    id: 'q37',
    difficulty: 'beginner',
    category: '歌詞・表記トリビア',
    prompt:
      '英語やカタカナの曲名が多いOfficial髭男dismですが、次の4曲のうち、公式タイトルにアルファベットもカタカナも漢字も一切使われていない「ひらがなのみ」の曲名はどれ？',
    hint: '2024年のアルバム『Rejoice』M13に収録されている、10文字のファンクナンバーです（なお2025年の『らしさ』もひらがなのみの曲名です）。',
    options: [
      'みどりの雨避け',
      'うらみつらみきわみ',
      'たかがアイラブユー',
      'ゼロのままでいられたら',
    ],
    correctIndex: 1,
    explanation:
      '正解は「うらみつらみきわみ」。『みどりの雨避け』には漢字、『たかがアイラブユー』『ゼロのままでいられたら』にはカタカナが含まれますが、『うらみつらみきわみ』（10文字）と『らしさ』（3文字）は、純粋に「ひらがなのみ」で表記される珍しいタイトルです。',
    relatedSongId: 'uramitsurami-kiwami',
    sources: [
      {
        title: '115万キロのファンノート 全楽曲タイトル文字種（ひらがな・漢字・カタカナ・英字）分析',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '全楽曲タイトルの表記文字種を分類し、ひらがなのみのタイトルが『うらみつらみきわみ』『らしさ』であることを整理。',
      },
      {
        title: 'Official髭男dism Major 3rd Album『Rejoice』収録曲リスト',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2024年7月24日 公式ディスコグラフィ',
        url: 'https://higedan.com/',
        summary:
          'M13『うらみつらみきわみ』の公式タイトル表記と作品情報を掲載。',
      },
    ],
  },
  {
    id: 'q38',
    difficulty: 'beginner',
    category: '歌詞・表記トリビア',
    prompt:
      '次のOfficial髭男dismの楽曲タイトルのうち、公式表記に「アルファベット（英語表記）」が1文字も含まれていない曲はどれ？',
    hint: '2022年6月発売の『ミックスナッツ EP』M4に収録されている、漢字2文字のタイトル曲です。',
    options: ['Choral A', 'B-Side Blues', '破顔', 'HELLO'],
    correctIndex: 2,
    explanation:
      '正解は「破顔」（読み：はがん／『ミックスナッツ EP』M4収録）。「笑顔がほころぶこと」を意味する美しい四字熟語・漢語に由来するタイトルで、漢字のみの曲名には他に『宿命』『日常』『可能性』『発明家』『相思相愛』『濁点』などがあります。',
    relatedSongId: 'hagan-song',
    sources: [
      {
        title: 'Official髭男dism『ミックスナッツ EP』全曲解説インタビュー：M4「破顔」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2022年6月22日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          'EPのラストを飾るM4『破顔』に込められた意味とエモーショナルなバンドアンサンブルを解説。',
      },
      {
        title: '115万キロのファンノート 全86曲データベース（漢字タイトル・英語タイトル分類）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイト収録楽曲のタイトル表記パターンを分析。',
      },
    ],
  },
  {
    id: 'q39',
    difficulty: 'beginner',
    category: 'メンバープロフィール・好物',
    prompt:
      'ギターの小笹大輔（大ちゃん）が「大好物」として公言しており、自宅に花椒（ホアジャオ）や豆板醤などの本格中華スパイスを揃えて自ら調理するほど愛してやまない料理は？',
    hint: 'しびれる辛さ（麻辣）がたまらない、豆腐とひき肉の代表的な中華料理です。',
    options: ['麻婆豆腐', 'ロールキャベツ', '海鮮パエリア', 'グリーンカレー'],
    correctIndex: 0,
    explanation:
      '正解は「麻婆豆腐」。小笹大輔は無類の麻婆豆腐好き（激辛・シビ辛好き）としてファンに広く知られており、ラジオ番組やファンクラブ企画でも「本格的な中華調味料を揃えて自分で麻婆豆腐を作る」というこだわりをたびたび語っています。',
    sources: [
      {
        title: 'Official髭男dism メンバープロフィール＆パーソナルデータ（小笹大輔）',
        publisher: 'Wikipedia / 公式プロフィール・ラジオトークアーカイブ',
        publishedNote: 'アーティスト人物資料',
        url: 'https://ja.wikipedia.org/wiki/Official%E9%AB%AD%E7%94%B7dism',
        summary:
          'ギタリスト・小笹大輔の人物像、好物（麻婆豆腐）、趣味（サウナ、猫、料理）などのエピソードを収録。',
      },
      {
        title: 'Official髭男dism ラジオ番組『ロヂウラベース』＆インタビューでの好物トーク',
        publisher: 'FM FUJI / J-WAVE トークアーカイブ',
        publishedNote: 'ラジオ番組トーク記録',
        url: 'https://higedan.com/',
        summary:
          '小笹大輔の麻婆豆腐へのこだわりをはじめ、松浦匡希のカンパチ、楢﨑誠の手料理などメンバーの食の好みを紹介。',
      },
    ],
  },
  {
    id: 'q40',
    difficulty: 'beginner',
    category: 'タイアップ・最新曲',
    prompt:
      '2024年7月発売のメジャー3rdアルバム『Rejoice』M11に収録され、杉野遥亮主演の月10ドラマ『マウンテンドクター』主題歌に起用された、忙しない日々に寄り添う温かいミドルバラードは？',
    hint: '4文字のアルファベット人名風タイトルが付けられた、心に染みるピアノ＆バンドナンバーです。',
    options: ['Finder', 'キャッチボール', 'Sharon', 'B-Side Blues'],
    correctIndex: 2,
    explanation:
      '正解は「Sharon」（『Rejoice』M11収録）。日々忙しく働く中で大切な人との時間や自分の心を置き去りにしてしまいそうな葛藤と、それでも帰る場所がある温かさを歌った名曲です。',
    relatedSongId: 'sharon',
    sources: [
      {
        title: 'Official髭男dism、杉野遥亮主演ドラマ「マウンテンドクター」主題歌に「Sharon」提供',
        publisher: '音楽ナタリー',
        publishedNote: '2024年6月〜7月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '医療ドラマ『マウンテンドクター』の主題歌として書き下ろされた『Sharon』の楽曲背景とMV公開を紹介。',
      },
      {
        title: 'Official髭男dism『Rejoice』オフィシャルインタビュー：M11「Sharon」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2024年7月24日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          'アルバム終盤のハイライトを飾る『Sharon』の詞世界とバンドアンサンブルについて解説。',
      },
    ],
  },

  // ============================================================================
  // 中級 追加バリエーション（全10問：q41〜q50）— インディーズ並び替え・時間順・50音末尾・最短曲・資格
  // ============================================================================
  {
    id: 'q41',
    difficulty: 'intermediate',
    questionType: 'ordering',
    category: '並び替え・リリース順',
    prompt:
      '【並び替え問題】インディーズ時代（2015年〜2017年）にリリースされた以下のミニアルバム・EP 4作品を、発売された順（古い順：1番目→4番目）に選択してください。',
    hint: '2015年4月のデビュー作『ラブとピースは君の中』が1番目、2017年4月の3rdミニアルバム『レポート』が4番目です。',
    options: [
      'レポート',
      'MAN IN THE MIRROR',
      'ラブとピースは君の中',
      "What's Going On? EP",
    ],
    correctIndex: 1,
    correctOrder: [2, 1, 3, 0],
    explanation:
      '正しいリリース順は「1. ラブとピースは君の中（2015年4月22日） → 2. MAN IN THE MIRROR（2016年6月15日） → 3. What\'s Going On? EP（2016年11月2日） → 4. レポート（2017年4月19日）」です。この4作品を経て2018年4月の『エスカパレード』『ノーダウト』へと繋がります。',
    relatedSongId: 'sweet-tweet',
    sources: [
      {
        title: 'Official髭男dism 公式ディスコグラフィ（2015〜2017 インディーズ期作品一覧）',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '公式作品アーカイブ',
        url: 'https://higedan.com/',
        summary:
          '2015年〜2017年にリリースされたミニアルバム3作および1st EPの正確な発売日・収録曲を掲載。',
      },
      {
        title: '115万キロのファンノート 全86曲データベース（アルバム・EP時代別フィルタ）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイトの「初期〜エスカパレード」フィルタおよび作品別トラック順ソート機能で全収録曲を網羅。',
      },
    ],
  },
  {
    id: 'q42',
    difficulty: 'intermediate',
    questionType: 'ordering',
    category: '並び替え・データ順',
    prompt:
      '【並び替え問題】当サイトの全86曲データベースに基づき、以下の4曲を「演奏時間が短い順（1番短い→4番目に長い）」に選択してください。',
    hint: '『Traveler』最終曲の『Travelers』（2分02秒）が最も短く、『アポトーシス』（6分24秒）が最も長い楽曲です。',
    options: ['Pretender', '夏模様の猫', 'アポトーシス', 'Travelers'],
    correctIndex: 3,
    correctOrder: [3, 1, 0, 2],
    explanation:
      '演奏時間が短い順は「1. Travelers（2分02秒） → 2. 夏模様の猫（2分15秒） → 3. Pretender（5分26秒） → 4. アポトーシス（6分24秒）」です。『Travelers』と『夏模様の猫』は2分台前半の短い中に深い余韻を凝縮した名曲です。',
    relatedSongId: 'travelers-outro',
    sources: [
      {
        title: '115万キロのファンノート 全86曲データベース（演奏時間ランキング検証）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '全86曲のdurationSec（秒数）データに基づき、最短クラスから最長クラスまでの正確な秒数を比較検証。',
      },
      {
        title: 'Official髭男dism『Traveler』『HELLO EP』『Editorial』公式トラックタイム',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '公式ディスコグラフィ',
        url: 'https://higedan.com/',
        summary:
          '各CD・配信パッケージに記録された公式演奏時間を参照。',
      },
    ],
  },
  {
    id: 'q43',
    difficulty: 'intermediate',
    category: 'タイアップ・代表曲',
    prompt:
      '2020年4月配信（『HELLO EP』および『Editorial』収録）の爽やかな新生活ソング『パラボラ』がCMソングとして書き下ろされた飲料ブランドは？',
    hint: '白くて甘酸っぱい、世代を超えて愛される乳酸菌飲料のテレビCM（永野芽郁出演）です。',
    options: [
      'アサヒ飲料「カルピスウォーター」',
      'キリンビバレッジ「午後の紅茶」',
      'サントリー「天然水」',
      'コカ・コーラ「アクエリアス」',
    ],
    correctIndex: 0,
    explanation:
      '正解は「アサヒ飲料『カルピスウォーター』」。春の新しいスタートの甘酸っぱさと未来への放物線（パラボラ）を描いた爽快なポップナンバーです。（※なおキリン「午後の紅茶」CMソングは2024年の『B-Side Blues』や2025年の『らしさ』以前のタイアップ等で知られます）',
    relatedSongId: 'parabola-song',
    sources: [
      {
        title: 'Official髭男dism、永野芽郁出演「カルピスウォーター」CMソングに新曲「パラボラ」書き下ろし',
        publisher: '音楽ナタリー',
        publishedNote: '2020年4月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '2020年春の「カルピスウォーター」テレビCMテーマソングとして制作された『パラボラ』の配信情報とコメントを掲載。',
      },
      {
        title: 'Official髭男dism『HELLO EP』オフィシャルインタビュー：M2「パラボラ」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2020年8月 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          '軽快なピアノとブラスが彩る『パラボラ』のアレンジについて解説。',
      },
    ],
  },
  {
    id: 'q44',
    difficulty: 'intermediate',
    category: 'タイアップ・代表曲',
    prompt:
      '2021年2月発売のシングルであり、『映画ドラえもん のび太の宇宙小戦争 2021』の主題歌として書き下ろされたゴスペル・ポップナンバーは？',
    hint: '「宇宙」を意味する英語タイトルが付けられています。',
    options: ['HELLO', 'Universe', 'Laughter', '宿命'],
    correctIndex: 1,
    explanation:
      '正解は「Universe」（2021年2月24日発売／アルバム『Editorial』M13収録）。少年時代の小さな悩みも大人になってからの迷いも温かく包み込む、ビッグバンド・ゴスペル調のピースフルな名曲です。',
    relatedSongId: 'universe-song',
    sources: [
      {
        title: 'Official髭男dismが「映画ドラえもん のび太の宇宙小戦争 2021」主題歌「Universe」担当',
        publisher: '音楽ナタリー',
        publishedNote: '2020年11月〜2021年2月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '『映画ドラえもん』主題歌決定のニュースと、藤原聡が語ったドラえもんへの思い入れと制作秘話を紹介。',
      },
      {
        title: 'Official髭男dism『Universe』特設サイト オフィシャルインタビュー',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2021年2月24日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          'ハモンドオルガンとホーンセクションが躍動するゴスペルアレンジの舞台裏を解説。',
      },
    ],
  },
  {
    id: 'q45',
    difficulty: 'intermediate',
    category: 'サイト内データ・50音＆時間',
    prompt:
      '2026年11月7日時点の当サイト全楽曲データベースにおいて、全楽曲のタイトルを読み仮名（五十音順）で並べたとき、「わ行」に位置し一番最後（末尾）にくる楽曲はどれ？（※日本語表記タイトルのみに限定した場合はラ行の『らしさ』が最後となります）',
    hint: '2016年11月にリリースされた1st EPの表題曲で、「ワッツ・ゴーイング・オン」と読む英語タイトル曲です。',
    options: ['ホワイトノイズ', 'らしさ', "What's Going On?", 'Rowan'],
    correctIndex: 2,
    explanation:
      '正解は「What\'s Going On?」（読み：わっつ・ごーいんぐ・おん）。『ホワイトノイズ』はハ行（ほわいとのいず）、『Rowan（ろーわん）』や『らしさ』はラ行に位置しますが、読み仮名が「わ」で始まる『What\'s Going On?』が五十音順の最も最後（末尾）となります。',
    relatedSongId: 'whats-going-on',
    sources: [
      {
        title: '115万キロのファンノート 全楽曲データベース（五十音順・末尾楽曲の検証）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内統計データ',
        url: 'https://higedan.com/',
        summary:
          '全楽曲の読み仮名ソートにおいて、先頭が『愛なんだが・・・（あ行）』、末尾が『What\'s Going On?（わ行）』（日本語表記タイトルのみでは『らしさ（ら行）』）であることを検証。',
      },
      {
        title: "Official髭男dism 1st EP『What's Going On? EP』公式ディスコグラフィ",
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2016年11月2日発売 作品データ',
        url: 'https://higedan.com/',
        summary:
          "2016年発売の1st EP表題曲『What's Going On?』の収録情報と作品解説を掲載。",
      },
    ],
  },
  {
    id: 'q46',
    difficulty: 'intermediate',
    category: 'サイト内データ・50音＆時間',
    prompt:
      '当サイトの全86曲データベース（11秒のインスト曲『052519』を除く歌あり楽曲）の中で、演奏時間が「2分02秒（122秒）」と最も短い楽曲はどれ？',
    hint: 'メジャー1stアルバム『Traveler』の最終曲（M13）として収録されている、旅の終わりと始まりを告げるタイトル曲です。',
    options: ['Editorial', 'Finder', '55', 'Travelers'],
    correctIndex: 3,
    explanation:
      '正解は「Travelers」（2分02秒／122秒）。歌あり楽曲の最短ランキングは、1位『Travelers』（2分02秒）、2位『夏模様の猫』（2分15秒）、3位『Editorial』（2分22秒）、4位『Finder』（2分58秒）となっています。（※CDトラック全体では『Traveler』M11のインスト『052519』の11秒が最短です）',
    relatedSongId: 'travelers-outro',
    sources: [
      {
        title: '115万キロのファンノート 全86曲データベース（最短トラックランキング統計）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイト収録全86曲の演奏時間を昇順ソートし、歌あり最短曲が『Travelers』（122秒）、2位が『夏模様の猫』（135秒）であることを検証。',
      },
      {
        title: 'Official髭男dism『Traveler』全曲解説インタビュー：M13「Travelers」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2019年10月9日 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'アルバム『Traveler』のラストを締めくくる2分02秒のシンガロング曲『Travelers』の制作意図を解説。',
      },
    ],
  },
  {
    id: 'q47',
    difficulty: 'intermediate',
    category: 'タイアップ・最新曲',
    prompt:
      '2025年12月1日にサプライズ配信リリースされた、『Stand By You』（2018年）以来、約7年ぶりとなる「ノンタイアップ」のデジタルシングル曲は？',
    hint: 'タイトルは英語で「消毒液・除菌剤」や「心を浄化するもの」を意味する英単語です。',
    options: ['Sanitizer', 'Make Me Wonder', '50%', 'らしさ'],
    correctIndex: 0,
    explanation:
      '正解は「Sanitizer」（2025年12月1日配信）。数々の大型ドラマ・映画・アニメ主題歌を担当してきたヒゲダンが、2018年の『Stand By You』以来約7年ぶりにノンタイアップで世に放った、等身大のバンドグルーヴが光るミドルナンバーです。',
    sources: [
      {
        title: 'Official髭男dism、約7年ぶりのノンタイアップシングル「Sanitizer」配信リリース',
        publisher: 'BARKS / ポニーキャニオン公式ニュース',
        publishedNote: '2025年12月1日 リリース記事',
        url: 'https://www.barks.jp/',
        summary:
          '2025年12月1日に配信リリースされた『Sanitizer』の楽曲解説とMV公開情報を紹介。',
      },
      {
        title: 'Official髭男dism デジタルシングル『Sanitizer』リリース情報',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2025年12月 公式ディスコグラフィ',
        url: 'https://higedan.com/',
        summary:
          'FCツアー『FOUR-RE:ISM』でも披露された『Sanitizer』の公式作品情報。',
      },
    ],
  },
  {
    id: 'q48',
    difficulty: 'intermediate',
    category: '転調・楽曲構造',
    prompt:
      '当サイトの全86曲ボーカル音域分析において、音域幅が「15半音（mid1F#〜hiA）」と全楽曲の中で最もコンパクトで、裏声の超高音もなく「カラオケで最も歌いやすい隠れた名曲」として知られる『HELLO EP』M4収録曲は？',
    hint: '夏の日の記憶と猫の情景をアコースティックな響きで描いた、2分15秒の短い名曲です。',
    options: ['ビンテージ', '夏模様の猫', '日曜日のラブレター', 'キャッチボール'],
    correctIndex: 1,
    explanation:
      '正解は「夏模様の猫」（2020年8月『HELLO EP』M4収録）。地声最高音が「hiA (A4)」、最低音が「mid1F# (F#3)」で音域幅が15半音（1.25オクターブ）に収まっており、ハイトーン曲が並ぶヒゲダンの中で最もリラックスして歌える珠玉の小品です。',
    relatedSongId: 'natsumoyou-no-neko',
    sources: [
      {
        title: '115万キロのファンノート 全86曲ボーカル音域分析（最高音・最低音・音域幅データ）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲音域データ',
        url: 'https://higedan.com/',
        summary:
          '全86曲の音域幅（rangeSpanSemitones）および地声最高音スコアを比較し、最小音域幅15半音が『夏模様の猫』であることを検証。',
      },
      {
        title: 'Official髭男dism『HELLO EP』インタビュー：M4「夏模様の猫」',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2020年8月5日 公式ライナーノーツ',
        url: 'https://higedan.com/',
        summary:
          'インディーズ期からの原曲を大切に育て上げて収録した『夏模様の猫』の制作秘話を掲載。',
      },
    ],
  },
  {
    id: 'q49',
    difficulty: 'intermediate',
    category: 'メンバープロフィール・好物',
    prompt:
      'ドラムの松浦匡希（ちゃんまつ）が中学時代に部活動の部長・大将を務め「初段」の段位を持っている武道と、休日に楽しむ最大の趣味（好きな魚はカンパチ）の組み合わせは？',
    hint: '竹刀を振るう武道（スナップの効いたドラムスティックさばきの原点）と、海や川へ出かけるアウトドア趣味です。',
    options: [
      '柔道 ＆ キャンプ',
      '空手 ＆ ゴルフ',
      '剣道 ＆ 釣り',
      '弓道 ＆ サーフィン',
    ],
    correctIndex: 2,
    explanation:
      '正解は「剣道 ＆ 釣り」。松浦匡希は中学時代に剣道部で部長・大将を務めて剣道初段を取得しており、休日には釣りに出かける大の釣り好き（好きな食べ物はカンパチと白米）としても知られています。',
    sources: [
      {
        title: 'Official髭男dism メンバープロフィール＆人物紹介（松浦匡希）',
        publisher: 'Wikipedia / 公式バイオグラフィ資料',
        publishedNote: 'アーティスト人物資料',
        url: 'https://ja.wikipedia.org/wiki/Official%E9%AB%AD%E7%94%B7dism',
        summary:
          '松浦匡希の鳥取県米子市出身の経歴、中学時代の剣道部大将・初段エピソード、趣味の釣りについて記録。',
      },
      {
        title: 'リズム＆ドラム・マガジン 松浦匡希 パーソナルインタビュー',
        publisher: 'リットーミュージック',
        publishedNote: 'ドラマー特集記事',
        url: 'https://www.rittor-music.co.jp/magazine/dm/',
        summary:
          '剣道で培った手首のスナップや体幹と、ドラミングのグルーヴとの共通点について語る。',
      },
    ],
  },
  {
    id: 'q50',
    difficulty: 'intermediate',
    category: 'メンバープロフィール・好物',
    prompt:
      'ギターの小笹大輔が、趣味の枠を超えて実際に取得している温浴・リラクゼーション分野の公式資格はどれ？',
    hint: 'ツアー先でも欠かさず訪れるほど大好きな「サウナ」に関する公認資格です。',
    options: [
      '温泉ソムリエマスター',
      '漢方養生指導士',
      '睡眠健康指導士',
      'サウナ・スパ健康アドバイザー',
    ],
    correctIndex: 3,
    explanation:
      '正解は「サウナ・スパ健康アドバイザー」。小笹大輔はバンド随一のサウナー（サウナ愛好家）であり、公益社団法人日本サウナ・スパ協会が認定する「サウナ・スパ健康アドバイザー」等の資格を実際に取得しています。',
    sources: [
      {
        title: 'Official髭男dism 小笹大輔 プロフィール＆サウナ・スパ健康アドバイザー資格エピソード',
        publisher: 'Wikipedia / ラジオ番組トーク記録',
        publishedNote: 'アーティスト人物資料',
        url: 'https://ja.wikipedia.org/wiki/Official%E9%AB%AD%E7%94%B7dism',
        summary:
          '小笹大輔が所持する「サウナ・スパ健康アドバイザー」資格や愛猫家としてのエピソードを紹介。',
      },
      {
        title: 'Official髭男dism ツアー密着＆メンバーのオフタイム紹介',
        publisher: '音楽ナタリー',
        publishedNote: '特集・コラム記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '全国ツアーの合間にメンバーそれぞれが楽しむリフレッシュ方法を紹介。',
      },
    ],
  },

  // ============================================================================
  // 上級 BROTHERS 追加バリエーション（全10問：q51〜q60）— 年齢順・収録順・エルダーフラワー歌詞検証・最新曲
  // ============================================================================
  {
    id: 'q51',
    difficulty: 'brothers',
    questionType: 'ordering',
    category: '並び替え・データ順',
    prompt:
      '【並び替え問題】Official髭男dismのメンバー4人を、生年月日が早い順（年齢が上の順＝お兄さん順：1番目→4番目）に選択してください。',
    hint: '1989年生まれの楢﨑誠が最年長（1番目）、1994年生まれの小笹大輔が最年少（4番目）です。',
    options: [
      '藤原 聡 (Vo./Pf.)',
      '小笹 大輔 (Gt.)',
      '楢﨑 誠 (Ba./Sax)',
      '松浦 匡希 (Dr.)',
    ],
    correctIndex: 1,
    correctOrder: [2, 0, 3, 1],
    explanation:
      '生年月日が早い順（年齢が上の順）は「1. 楢﨑 誠（1989年3月18日生まれ） → 2. 藤原 聡（1991年8月19日生まれ） → 3. 松浦 匡希（1993年1月22日生まれ） → 4. 小笹 大輔（1994年1月6日生まれ）」です。',
    sources: [
      {
        title: 'Official髭男dism 公式プロフィール＆メンバー生年月日データ',
        publisher: 'Wikipedia / 公式バイオグラフィ',
        publishedNote: 'アーティスト基本情報',
        url: 'https://ja.wikipedia.org/wiki/Official%E9%AB%AD%E7%94%B7dism',
        summary:
          'メンバー4人（楢﨑・藤原・松浦・小笹）の正確な生年月日・出身地・学歴を記録。',
      },
      {
        title: '115万キロのファンノート メンバープロフィール＆ヒストリー',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内データ',
        url: 'https://higedan.com/',
        summary:
          '島根大学・松江高専時代の学年関係と結成時のエピソードを整理。',
      },
    ],
  },
  {
    id: 'q52',
    difficulty: 'brothers',
    questionType: 'ordering',
    category: '並び替え・データ順',
    prompt:
      '【並び替え問題】2024年7月発売のメジャー3rdアルバム『Rejoice』（全16曲）に収録されている以下の4曲を、アルバムの収録トラック順（M1側→M16側：1番目→4番目）に選択してください。',
    hint: 'オープニングのM1が『Finder』、エンディングのM16が『B-Side Blues』です。',
    options: ['うらみつらみきわみ', 'Finder', 'B-Side Blues', 'SOULSOUP'],
    correctIndex: 2,
    correctOrder: [1, 3, 0, 2],
    explanation:
      '『Rejoice』での収録順は「1. Finder（M1） → 2. SOULSOUP（M4） → 3. うらみつらみきわみ（M13） → 4. B-Side Blues（M16）」です。アルバム曲順ソートを使うと全16曲の流れを一目で確認できます。',
    relatedSongId: 'finder-song',
    sources: [
      {
        title: 'Official髭男dism Major 3rd Album『Rejoice』公式トラックリスト',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2024年7月24日発売 公式作品情報',
        url: 'https://higedan.com/',
        summary:
          'M1『Finder』からM16『B-Side Blues』まで全16曲の曲順とタイアップ一覧を掲載。',
      },
      {
        title: '115万キロのファンノート 全86曲データベース（『Rejoice』アルバム収録曲順ソート）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '当サイトの「アルバム収録曲順（M1〜）」ソート機能にて『Rejoice』全曲の配置を検証。',
      },
    ],
  },
  {
    id: 'q53',
    difficulty: 'brothers',
    category: '歌詞・表記トリビア',
    prompt:
      '2026年3月30日先行配信・4月22日CD発売の映画『人はなぜラブレターを書くのか』主題歌であり、曲名こそカタカナでありながら、歌詞の本文には「カタカナ語」も「英語（アルファベット）」も1文字も使われず、全文が「ひらがな」と「漢字」のみで綴られている楽曲は？',
    hint: '「言葉で作る花束を 便箋に溢れる花園を」と歌われ、映画題名の「ラブレター」というカタカナ語すら使わずに手紙への想いを表現した名バラードです。',
    options: ['エルダーフラワー', 'スターダスト', 'ビンテージ', 'パラボラ'],
    correctIndex: 0,
    explanation:
      '正解は「エルダーフラワー」（2026年3月30日先行配信／7thシングル『スターダスト / エルダーフラワー』収録）。映画『人はなぜラブレターを書くのか』の主題歌ですが、藤原聡が書いた歌詞全文（「何ひとつ不自由などかけさせまいと…」〜「実る想いはただ永遠に愛」）にはカタカナ語も英字も1文字も登場せず、「ラブレター」すら「便箋に溢れる花園」「いつか宛名を知るその日まで」と純粋な和語・漢語（ひらがな・漢字のみ）で描き切っています。',
    sources: [
      {
        title: 'Official髭男dism「エルダーフラワー」公式歌詞データ（文字種完全検証）',
        publisher: '歌ネット（Uta-Net） / UtaTen',
        publishedNote: '2026年3月30日公開 歌詞アーカイブ',
        url: 'https://www.uta-net.com/song/390340/',
        summary:
          '『エルダーフラワー』の歌詞全文がひらがな・漢字のみで構成され、カタカナ・英字が一切含まれないことをファクトチェック済み。',
      },
      {
        title: 'Official髭男dism、映画『人はなぜラブレターを書くのか』主題歌「エルダーフラワー」書き下ろし',
        publisher: 'THE FIRST TIMES / 音楽ナタリー',
        publishedNote: '2026年3月〜4月 ニュース記事',
        url: 'https://www.thefirsttimes.jp/',
        summary:
          '20年の時を経て届いた手紙の実話に基づく映画『人はなぜラブレターを書くのか』主題歌『エルダーフラワー』のリリース情報とコメントを掲載。',
      },
    ],
  },
  {
    id: 'q54',
    difficulty: 'brothers',
    category: 'ディスコグラフィ',
    prompt:
      '2017年4月19日にリリースされたインディーズ3rdミニアルバム『レポート』のM3に収録されている、初期からのライブ定番アンセムであり、「周りと同じじゃなくても自分の歌を歌え」というメッセージを込めた楽曲は？',
    hint: '「お願い どうか 僕らの歌を笑わないで」という切実なサビと、地声hiEまで跳ね上がるメロディが特徴です。',
    options: [
      '始まりの朝',
      '異端なスター',
      '犬かキャットかで死ぬまで喧嘩しよう！',
      'Trailer',
    ],
    correctIndex: 1,
    explanation:
      '正解は「異端なスター」（2017年4月19日発売『レポート』M3収録）。同調圧力や周囲の目に苦しむ人の背中を力強く押すインディーズ期からの屈指の人気曲で、日産スタジアム公演など大舞台でも大切に歌い継がれています。',
    relatedSongId: 'itan-na-star',
    sources: [
      {
        title: 'Official髭男dism 3rd Mini Album『レポート』公式ディスコグラフィ＆インタビュー',
        publisher: 'Official髭男dism 公式サイト / Skream!',
        publishedNote: '2017年4月19日 作品データ・特集記事',
        url: 'https://skream.jp/',
        summary:
          'M1『始まりの朝』、M2『犬かキャットかで死ぬまで喧嘩しよう！』、M3『異端なスター』など全7曲の制作背景を解説。',
      },
      {
        title: '115万キロのファンノート 全86曲データベース（『異端なスター』音域・楽曲分析）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲分析データ',
        url: 'https://higedan.com/',
        summary:
          '地声最高音hiE (E5)を記録する『異端なスター』の音域構成とライブ定番曲としての位置づけを解説。',
      },
    ],
  },
  {
    id: 'q55',
    difficulty: 'brothers',
    category: 'ディスコグラフィ・映画主題歌',
    prompt:
      '2022年1月配信（『ミックスナッツ EP』M2収録）の映画『コンフィデンスマンJP 英雄編』主題歌であり、アルバム『Rejoice』M11にはブラッシュアップされた「Rejoice ver.」として収録されたダーク・ファンクロックは？',
    hint: 'タイトルは英語で「無秩序・混沌・アナーキー」を意味します。',
    options: ['ホワイトノイズ', 'Choral A', 'Anarchy', '破顔'],
    correctIndex: 2,
    explanation:
      '正解は「Anarchy」（2022年1月7日配信）。トラップ風のタイトなビートと重厚なホーン・ロックギターが絡み合うクールなナンバーで、アルバム『Rejoice』にはさらにバンドのダイナミズムを増強した「Anarchy (Rejoice ver.)」が収録されました。',
    relatedSongId: 'anarchy-song',
    sources: [
      {
        title: 'Official髭男dism、映画「コンフィデンスマンJP 英雄編」主題歌「Anarchy」配信＆MV公開',
        publisher: '音楽ナタリー',
        publishedNote: '2022年1月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          'シリーズ第3作『英雄編』の主題歌として書き下ろされた『Anarchy』のクールな世界観を紹介。',
      },
      {
        title: 'Official髭男dism『Rejoice』インタビュー：「Anarchy (Rejoice ver.)」の再構築',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2024年7月24日 公式特設サイト',
        url: 'https://higedan.com/',
        summary:
          'アルバム収録にあたりブラッシュアップされた「Rejoice ver.」のサウンド意図を解説。',
      },
    ],
  },
  {
    id: 'q56',
    difficulty: 'brothers',
    category: 'メンバープロフィール・好物',
    prompt:
      'ベース＆サックスを担当する楢﨑誠（ならちゃん）が、島根大学教育学部時代に実際に取得している教員免許はどれ？',
    hint: '大学でサックスや吹奏楽に打ち込みながら取得した、バンドマンならではの教科の免許です。',
    options: [
      '数学の教員免許',
      '保健体育の教員免許',
      '英語の教員免許',
      '音楽の教員免許',
    ],
    correctIndex: 3,
    explanation:
      '正解は「音楽の教員免許」。楢﨑誠は島根大学教育学部で音楽を専攻して音楽科の教員免許を取得しており、卒業後は島根県警察音楽隊でのサックス演奏を経て、Official髭男dismのベーシスト兼マルチプレイヤーとして活躍しています。',
    sources: [
      {
        title: 'Official髭男dism 楢﨑誠 プロフィール（島根大学教育学部・音楽教員免許）',
        publisher: 'Wikipedia / UtaTen アーティスト特集',
        publishedNote: 'アーティスト人物資料',
        url: 'https://ja.wikipedia.org/wiki/Official%E9%AB%AD%E7%94%B7dism',
        summary:
          '広島県福山市出身、島根大学教育学部卒業で音楽の教員免許を所持する楢﨑誠の経歴を解説。',
      },
      {
        title: 'Official髭男dism ベース＆サックス・楢﨑誠の音楽的ルーツとマルチプレイヤーとしての魅力',
        publisher: 'Real Sound（リアルサウンド）',
        publishedNote: 'コラム・メンバー分析記事',
        url: 'https://realsound.jp/',
        summary:
          'エレキベース、ウッドベース、シンセベース、サックスを自在に操る楢﨑誠の音楽的背景を紹介。',
      },
    ],
  },
  {
    id: 'q57',
    difficulty: 'brothers',
    category: 'メンバープロフィール・好物',
    prompt:
      'ボーカル＆ピアノの藤原聡が、鳥取県立米子東高校時代に所属していた吹奏楽部で担当していた楽器パートは？（※この経験がヒゲダンの緻密なリズムアレンジやドラムへのこだわりに直結しています）',
    hint: '管楽器ではなく、バンドのビートの要となる「打楽器」パートです。',
    options: [
      'パーカッション（打楽器）',
      'トランペット',
      'アルトサックス',
      'コントラバス',
    ],
    correctIndex: 0,
    explanation:
      '正解は「パーカッション（打楽器）」。藤原聡は幼少期からクラシックピアノとエレクトーンを習う一方、高校の吹奏楽部ではパーカッションを担当し、島根大学進学当初も軽音楽部でドラマーとしてバンドを組んでいました。この打楽器経験が、ヒゲダン楽曲の卓越したリズム構造の源泉となっています。',
    sources: [
      {
        title: 'Official髭男dism 藤原聡 プロフィール＆音楽的ルーツ（ピアノ・エレクトーン・打楽器）',
        publisher: 'Wikipedia / 音楽ナタリー 特集インタビュー',
        publishedNote: 'アーティスト人物資料',
        url: 'https://natalie.mu/music/pp/higedan',
        summary:
          '米子東高校の吹奏楽部でパーカッションを担当し、大学軽音部でもドラムを叩いていた藤原聡のルーツを紹介。',
      },
      {
        title: '藤原聡が語るソングライティングとリズム・ビート構築の秘密',
        publisher: 'Sound & Recording Magazine（サンレコ）',
        publishedNote: '制作・DTMインタビュー',
        url: 'https://www.rittor-music.co.jp/magazine/sr/',
        summary:
          'ボーカリストでありながらドラマー・打楽器奏者としての視点を持つ藤原聡のデモ制作術を解説。',
      },
    ],
  },
  {
    id: 'q58',
    difficulty: 'brothers',
    category: 'タイアップ・最新曲',
    prompt:
      '2025年12月29日にデジタルリリースされた、うめざわしゅん原作のTVアニメ『ダーウィン事変』オープニング主題歌として書き下ろされた楽曲は？',
    hint: 'タイトルは英語3語で「私を驚かせる／不思議に思わせる」といった意味を持ちます。',
    options: ['Sanitizer', 'Make Me Wonder', 'Same Blue', 'SOULSOUP'],
    correctIndex: 1,
    explanation:
      '正解は「Make Me Wonder」（2025年12月29日配信）。半分ヒトで半分チンパンジーの主人公・チャーリーをめぐる社会派SFサスペンス『ダーウィン事変』のオープニング主題歌として書き下ろされたスリリングなロックナンバーです。',
    sources: [
      {
        title: 'Official髭男dism、TVアニメ『ダーウィン事変』OP主題歌「Make Me Wonder」配信リリース',
        publisher: '音楽ナタリー / ポニーキャニオン公式',
        publishedNote: '2025年12月 ニュース記事',
        url: 'https://natalie.mu/music/artist/10323',
        summary:
          '2025年12月29日に配信された『Make Me Wonder』のタイアップ情報と制作背景を紹介。',
      },
      {
        title: 'Official髭男dism 7th Single『スターダスト / エルダーフラワー』ライブBlu-ray収録情報',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2026年4月22日 公式リリース情報',
        url: 'https://higedan.com/',
        summary:
          'Zepp Nagoya公演での『Make Me Wonder』『Sanitizer』ライブ映像収録について掲載。',
      },
    ],
  },
  {
    id: 'q59',
    difficulty: 'brothers',
    category: 'タイアップ・最新曲',
    prompt:
      '2026年4月22日にリリースされたOfficial髭男dismの7枚目となる両A面CDシングル『スターダスト / エルダーフラワー』のうち、TBS系日曜劇場『GIFT』の主題歌として書き下ろされた楽曲は？',
    hint: 'タイトルは英語・カタカナで「星くず」を意味します。',
    options: ['エルダーフラワー', 'Sanitizer', 'スターダスト', 'らしさ'],
    correctIndex: 2,
    explanation:
      '正解は「スターダスト」（2026年4月22日発売 7thシングル『スターダスト / エルダーフラワー』M1収録）。TBS系日曜劇場『GIFT』の主題歌『スターダスト』と、映画『人はなぜラブレターを書くのか』の主題歌『エルダーフラワー』をカップリングした超強力な両A面シングルです。',
    sources: [
      {
        title: 'Official髭男dism、日曜劇場『GIFT』主題歌「スターダスト」＆映画主題歌「エルダーフラワー」両A面シングル発売',
        publisher: '音楽ナタリー / THE FIRST TIMES',
        publishedNote: '2026年3月〜4月 ニュース記事',
        url: 'https://www.thefirsttimes.jp/',
        summary:
          '2026年4月22日発売の7th CDシングル『スターダスト / エルダーフラワー』の収録内容と大型タイアップ情報を紹介。',
      },
      {
        title: 'Official髭男dism 7th Single『スターダスト / エルダーフラワー』特設ページ',
        publisher: 'Official髭男dism 公式サイト',
        publishedNote: '2026年4月22日 公式ディスコグラフィ',
        url: 'https://higedan.com/',
        summary:
          'CD＋Blu-ray/DVD形態の収録曲およびZepp Nagoyaライブ映像の収録詳細を掲載。',
      },
    ],
  },
  {
    id: 'q60',
    difficulty: 'brothers',
    category: '転調・楽曲構造',
    prompt:
      '当サイトの全86曲ボーカル音域データベースにおいて、地声最高音「hiE (E5)」を記録している楽曲が3曲存在します。『Stand By You』『FIRE GROUND』ともう1曲はどれ？',
    hint: '2017年の3rdミニアルバム『レポート』M3に収録されている、インディーズ期からのライブ定番曲です。',
    options: ['Pretender', 'Subtitle', 'I LOVE...', '異端なスター'],
    correctIndex: 3,
    explanation:
      '正解は「異端なスター」。当サイトの全86曲音域データベースで「地声最高音順」に並べ替えると、地声hiE (E5) に到達するトップ3曲は『Stand By You』『FIRE GROUND』『異端なスター』であることがひと目で確認できます。',
    relatedSongId: 'itan-na-star',
    sources: [
      {
        title: '115万キロのファンノート 全86曲ボーカル音域分析（地声最高音 hiE 到達曲データ）',
        publisher: '115万キロのファンノート 編集部',
        publishedNote: '2026年11月7日版 サイト内全曲音域データ',
        url: 'https://higedan.com/',
        summary:
          '全86曲の地声最高音スコア（chestSemitoneScore: 76 = hiE）を持つ3曲（『Stand By You』『FIRE GROUND』『異端なスター』）を抽出・検証。',
      },
      {
        title: 'Official髭男dism 楽曲音域・ハイトーンボーカル徹底分析',
        publisher: 'Real Sound / ボイストレーニング分析コラム',
        publishedNote: 'ボーカル分析記事',
        url: 'https://realsound.jp/',
        summary:
          '藤原聡のミックスボイスとhiD〜hiE帯域の驚異的なコントロール技術を解説。',
      },
    ],
  },
];

