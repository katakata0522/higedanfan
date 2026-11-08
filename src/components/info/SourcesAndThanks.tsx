type SourceLink = readonly [label: string, url: string];

interface SourceGroup {
  title: string;
  body: string;
  links: SourceLink[];
}

const groups: SourceGroup[] = [
  {
    title: "歌の音域",
    body: "90曲の音域を掲載するにあたり、73曲は「J-POP 音域の沼」、17曲は「音域データ！＠ウィキ」の採譜を参照しました。「ミックスナッツ」のように、最後のフェイク（歌詞のない歌い回し）を含めるかどうかで裏声の最高音が変わる曲もあります。",
    links: [
      ["J-POP 音域の沼「ミックスナッツ」の採譜", "https://vocal-range.com/archives/post-6815.html"],
      ["音域データ！＠ウィキ「Official髭男dism」の採譜表", "https://w.atwiki.jp/saikouon_dokoda/pages/1008.html"],
    ],
  },
  {
    title: "演奏時間・発売日・収録曲順",
    body: "演奏時間と配信掲載日は、90曲それぞれの収録音源をApple Musicで確認しました。CDの発売日や曲順は、バンドとレーベルの公式作品情報に基づいています。",
    links: [
      ["Apple Music『Traveler』収録の「Pretender」", "https://music.apple.com/jp/album/pretender/1479397582?i=1479397873"],
      ["Official髭男dism『Rejoice』の作品情報", "https://higedan.com/news/detail/100958"],
      ["Official髭男dism『ミックスナッツ EP』の収録曲", "https://higedan.com/discography/detail/33/"],
      ["ポニーキャニオン「スターダスト／エルダーフラワー」特設サイト", "https://stardust-elderflower.ponycanyon.co.jp/"],
    ],
  },
  {
    title: "テンポと曲の聴きどころ",
    body: "テンポは楽譜やコード譜、各種の楽曲データを参考にした目安です。拍の数え方によって倍・半分の表記があり、資料によって数値も異なるため、曲ごとに採用した出典と主な別表記を示しています。リズムやアレンジの解説には、採譜やメンバーのインタビュー、楽曲レビューも参照しました。",
    links: [
      ["KHUFRUDAMO NOTESのテンポ一覧", "https://khufrudamonotes.com/officialhigedism-data"],
      ["リンネのコードブック「Official髭男dism」の曲一覧", "https://www.chord-rinne.jp/artist_song_list.php?art_id=Official%E9%AB%AD%E7%94%B7dism"],
      ["ミュージックエイト「Pretender」の楽譜", "https://www.music8.com/upload/save_image/00000118480_sample_pdf.pdf"],
      ["Piascore「115万キロのフィルム」ドラム譜", "https://store.piascore.com/scores/287235"],
      ["KeyTube「らしさ」", "https://keytube.net/song/detail/144873"],
      ["SongBPM「Anarchy (Rejoice ver.)」", "https://songbpm.com/%40official-hige-dandism/anarchy-rejoice-ver-rqmur"],
      ["KeyTube「50%」", "https://keytube.net/song/detail/116949"],
      ["ChordWiki「parade」のコードと拍子", "https://ja.chordwiki.org/wiki/parade"],
      ["U-フレット「Happy Birthday To You」のコード譜", "https://www.ufret.jp/song.php?data=127864"],
      ["『Rejoice』全曲解説", "https://au.utapass.auone.jp/lp/higedan-rejoice"],
      ["ヒゲみこの日常「未完成なままで」", "https://micohige.blog.jp/archives/19946360.html"],
      ["RAG Music「ESCAPADE」の紹介", "https://www.ragnet.co.jp/ranking-higedan-karaoke-songs/5"],
      ["歌ネット「エスカパレード」インタビュー", "https://www.uta-net.com/user/interview/1804_higedan/index3.html"],
      ["Real Sound「可能性」の楽曲分析", "https://realsound.jp/2019/08/post-397913.html"],
      ["rockin’on.com『Traveler』レビュー", "https://rockinon.com/disc/detail/189748"],
      ["コレキケ「Editorial」の楽曲解説", "https://corekike.com/artist/hgd-editorial/"],
    ],
  },
  {
    title: "曲名の読み",
    body: "曲名をかなでも探せるよう、82曲はUtaTenの「よみ」、7曲はJOYSOUNDのフリガナを使っています。「Make Me Wonder」のかな表記は当サイトの検索補助です。「Anarchy (Rejoice ver.)」は基本の曲名「あなーきー」でも探せます。",
    links: [
      ["UtaTen「Pretender」", "https://utaten.com/lyric/qk19044046/"],
      ["JOYSOUND「I LOVE...」", "https://www.joysound.com/web/search/song/818051"],
    ],
  },
  {
    title: "作詞・作曲者とタイアップ",
    body: "作詞・作曲者はメンバーの発言やJASRACの受賞記録で、主題歌やCMソングは作品の公式発表や取材記事で確認しました。曲ごとの出典は楽曲ガイドの「音域・解説を見る」から開けます。",
    links: [
      ["ポニーキャニオン『Traveler』メンバーインタビュー", "https://officialhigedandism.ponycanyon.co.jp/interview/index.html"],
      ["JASRAC賞「Pretender」の受賞記録", "https://www.jasrac.or.jp/magazine/jasrac-awards/21/210519.html"],
      ["ポニーキャニオン「フィラメント」と出雲駅伝", "https://news.ponycanyon.co.jp/2021/10/60674"],
      ["ポニーキャニオン『Editorial』メンバーインタビュー", "https://editorial.ponycanyon.co.jp/interview/"],
      ["FM FUJI『ロヂウラベース』の「Choral A」紹介（radiko news）", "https://news.radiko.jp/article/station/FM-FUJI/71384/"],
      ["ポニーキャニオン『Rejoice』特設サイト", "https://rejoice.ponycanyon.co.jp/"],
      ["ラストラム「Driver」と『デルサタ』", "https://www.lastrum.co.jp/news/10521/"],
      ["ローム「115万キロのフィルム」起用の発表", "https://www.rohm.co.jp/news-detail?defaultGroupId=false&news-title=2019-12-25_news_tv-cm"],
      ["フジテレビ『コンフィデンスマンJP』", "https://www.fujitv.co.jp/confidenceman_jp/cast-staff/index.html"],
      ["TBS『恋はつづくよどこまでも』", "https://www.tbs.co.jp/koitsudu_tbs/caststaff/"],
      ["TVアニメ『東京リベンジャーズ』の主題歌発表", "https://tokyo-revengers-anime.com/news/archives/103"],
      ["TVアニメ『アオのハコ』のオープニング主題歌", "https://aonohako-anime.com/music/opening.html"],
      ["映画『ひゃくえむ。』の主題歌発表", "https://hyakuemu-anime.com/info/91/"],
      ["Official髭男dism「破顔」JR東日本CM起用の発表", "https://higedan.com/news/detail/101743"],
      ["ワーナー・ブラザース『はたらく細胞』", "https://www.warnerbros.co.jp/home_entertainment/hfozviq72ubt/"],
    ],
  },
  {
    title: "検定クイズ",
    body: "結成当時のことやメンバーについての出題には、本人が出演した番組やインタビュー、公演を取材した記事を参照しました。各問題の出典は解答後の解説にも載せています。",
    links: [
      ["LINEのメンバーインタビュー", "https://guide.line.me/ja/features-and-columns/interview001.html"],
      ["ORICON NEWSの日本武道館公演レポート", "https://www.oricon.co.jp/news/2139557/full/"],
      ["J-WAVEの藤原聡インタビュー", "https://news.j-wave.co.jp/2016/06/officialdism.amp.html"],
      ["J-WAVE『TOKIO HOT 100』のゲスト記録", "https://www.j-wave.co.jp/original/tokiohot100/guest_past/past_20180520.htm"],
      ["FM802の楢﨑誠出演回", "https://funky802.com/infinity/article/119970"],
      ["日本サウナ・スパ協会のインタビュー（PDF）", "https://sauna.or.jp/sauna_news/back_number/pdf_files/2011-2030/newspaper492.pdf"],
      ["ギャガ『異動辞令は音楽隊！』の主題歌発表", "https://gaga.ne.jp/pt/news/detail.php?id=1514"],
      ["Real Sound「Same Blue」の拍子の解説", "https://realsound.jp/2024/11/post-1842973.html"],
    ],
  },
  {
    title: "聖地巡礼マップ・ツアーの記録",
    body: "地図に載せた場所の住所と行き方は、施設や観光協会の案内で確認しました。公演日・会場はLiveRepoの公開記録とヒゲダンセトリの公演一覧を照合し、2016年の3公演は公式告知とも照合しました。個別公演のセトリはリンク先の掲載情報を案内しています。松江での活動については、藤原聡が当時を振り返ったインタビューを参照しました。",
    links: [
      ["松江観光協会の宍道湖夕日スポット案内", "https://www.kankou-matsue.jp/omoshiro/sunset/264"],
      ["DISK GARAGEの藤原聡インタビュー", "https://www.diskgarage.com/digaonline/pleasure/55307"],
      ["Official髭男dism「LIVE at STADIUM 2025」", "https://event.higedan.com/feature/stadium_2025"],
      ["AZTiC 松江canova", "https://aztic.net/canova/"],
      ["AZTiC 米子laughs", "https://aztic.net/laughs/"],
      ["島根大学 松江キャンパスマップ", "https://www.shimane-u.ac.jp/campus_maps/map_matsue.html"],
      ["日産スタジアムのアクセス", "https://www.nissan-stadium.jp/access/"],
      ["Kアリーナ横浜のアクセス", "https://k-arena.com/access/"],
      ["『HELLO EP』収録のHall Travelers横浜公演", "https://hello-ep.jp/"],
      ["ポニーキャニオン「Editorial」さいたまスーパーアリーナ公演", "https://editorial-saitamasuperarena.ponycanyon.co.jp/"],
      ["Official髭男dism「one-man tour 2026」", "https://event.higedan.com/feature/zepp2025_hall2026"],
      ["LiveRepo 公演記録", "https://liverepo.katakatalab.com/"],
      ["ヒゲダンセトリ 公演一覧", "https://higedan-setlist.net/"],
    ],
  },
];

function ReferenceList({ links }: { links: SourceLink[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 marker:text-[#827466]">
      {links.map(([label, url]) => (
        <li key={url}>
          <a href={url} className="wrap-anywhere text-[#1E3A5F] underline decoration-[#ACA49A] underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4">
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SourcesAndThanks() {
  return (
    <article aria-labelledby="sources-title" className="my-4 text-[#1C1917]">
      <header className="mb-7 border-b border-[#D5CEC2] pb-6">
        <h1 id="sources-title" className="text-3xl font-bold tracking-tight sm:text-4xl">参考資料・謝辞</h1>
        <p className="mt-3 text-base leading-7 text-[#57534E]">楽曲ガイド、検定クイズ、聖地巡礼マップ、ツアー記録で参照した資料を紹介します。</p>
      </header>

      <div className="space-y-4">
        {groups.map(({ title, body, links }) => (
          <section key={title} className="min-w-0 rounded-xl border border-[#E6E1D6] bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
            <p className="mt-2 mb-3 text-sm leading-7 text-[#44403C] sm:text-base">{body}</p>
            <ReferenceList links={links.slice(0, 3)} />
            {links.length > 3 && (
              <details className="mt-2">
                <summary className="w-fit cursor-pointer rounded py-2 text-sm font-semibold text-[#57534E] focus-visible:outline-2 focus-visible:outline-offset-4">
                  この項目のほかの資料（{links.length - 3}件）
                </summary>
                <ReferenceList links={links.slice(3)} />
              </details>
            )}
          </section>
        ))}
      </div>

      <section className="mt-7 border-t border-[#D5CEC2] pt-5">
        <h2 className="text-lg font-bold sm:text-xl">
          サイト制作・編集　<a href="https://katakatalab.com/who-is-katakata.html" rel="author" className="text-[#1E3A5F] underline underline-offset-4">
            かたかた<span className="sr-only">のプロフィール</span>
          </a>
        </h2>
        <p className="mt-2 text-sm leading-7 text-[#44403C] sm:text-base">「Pretender」をきっかけに髭男のファンになりました。</p>
      </section>

      <section className="mt-7 border-t border-[#D5CEC2] pt-5">
        <h2 className="text-lg font-bold sm:text-xl">謝辞</h2>
        <p className="mt-2 text-sm leading-7 text-[#44403C] sm:text-base">一曲ずつ歌を聴き取り、採譜を公開してくださった「J-POP 音域の沼」の管理人の方と「音域データ！＠ウィキ」の編集者の皆さんに感謝します。作品や公演の記録を残してくださった皆さん、取材記事や会場案内の作成に携わった皆さんにもお礼を申し上げます。</p>
      </section>
    </article>
  );
}
