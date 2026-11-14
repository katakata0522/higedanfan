interface PrivacyPolicyProps {
  onExportRecords?: () => void;
  onImportRecords?: (file: File) => Promise<void>;
  onResetAllUserData?: () => void;
}

export function PrivacyPolicy({
  onExportRecords,
  onImportRecords,
  onResetAllUserData,
}: PrivacyPolicyProps) {
  return (
    <article aria-labelledby="privacy-title" className="space-y-4 text-base leading-7 text-[#292524] [&_a]:text-[#1E3A5F] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-bold">
      <h1 id="privacy-title" className="font-note-serif text-2xl font-bold tracking-[.04em] text-[#253331] sm:text-3xl">プライバシーポリシー</h1>
      <p><a href="#editor">編集者（かたかた）</a>（<a href="https://katakatalab.com/who-is-katakata.html">KatakataLab</a>）が運営する「115万キロのファンノート」では、マイセトリなどの記録を、お使いのブラウザに保存します。人気投票と感想ノートは現在非公開です。過去に保存した投票・感想は、非公開にしただけでは消えません。</p>

      <h2>ブラウザに保存する記録</h2>
      <p>次に開いたときも続きから使えるよう、以下の記録をブラウザの保存領域（ローカルストレージ）に残します。</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>マイセトリの名前、曲順、本編とアンコールの区別、保存した複数のセットリスト一覧</li>
        <li>過去の投票で選んだ曲と部門、感想に付けた「共感」</li>
        <li>過去に保存した感想のニックネーム、ファン歴、選んだ曲、分類、タイトル、本文、記録日</li>
        <li>訪問した聖地、参戦・視聴したツアー、検定の最高正答率</li>
      </ul>
      <p>ファンノートはこれらの記録を運営者のサーバーに送りません。同じ端末でブラウザのプロフィールを共用している人は、記録を閲覧できます。</p>
      <p>マイセトリへの曲の追加は、再読み込みに備えて、保存が完了するまで同じタブの一時保存領域（セッションストレージ）にも記録します。</p>
      <p>診断の回答とクイズの途中経過も、ページを移動したり再読み込みしたりしても続きから使えるよう、同じタブに一時保存します。楽曲ガイドから曲ページへ移動するときは、一覧へ戻るための絞り込み条件なども一時保存します。これらはタブを閉じると消えます。</p>

      <h2>記録の消去・書き出し・コピー</h2>
      <p>このページの最下部にある「このブラウザの保存記録をすべて初期化」を選び、確認画面で実行すると、マイセトリは最初の見本に戻り、感想や投票などの記録、診断の回答とクイズの途中経過は消えます。</p>
      <p>また、同じ欄から画面上の記録をJSONファイルとして書き出したり、保存したファイルから復元したりできます。ファイルには感想やニックネームも含まれます。初期化した後もファイルは端末に残るため、不要になったらダウンロード先から削除してください。</p>
      <p>マイセトリ、診断結果、検定の認定証は、コピーや画像保存などで手元に残せます。SNSなどに共有したい場合は、ご自身で貼り付けて投稿してください。</p>

      <h2>ページの配信とアクセス解析</h2>
      <p>ページを表示すると、配信元のエックスサーバーがIPアドレスや要求されたページ・ファイルのパスを受け取ります。アクセス日時やブラウザの種類とともに、サーバーのアクセスログに記録される場合があります。<a href="https://www.xserver.ne.jp/manual/man_server_log.php">エックスサーバーのアクセスログについて</a></p>
      <p>KatakataLabの一部のページではGoogle アナリティクスを使っています。このファンサイトのページには、Google アナリティクスなどのアクセス解析タグを組み込んでいません。</p>

      <h2>聖地巡礼マップ・動画と外部リンク</h2>
      <p>聖地巡礼マップで地図が読み込まれると、ブラウザは表示地点の名前と所在地をGoogleに送ります。地図を操作する前にも、この通信は発生します。GoogleはIPアドレスやブラウザの情報を受け取り、設定に応じてCookieなどの識別子も利用します。地図を使わずに、ほかのコーナーを利用できます。<a href="https://policies.google.com/privacy?hl=ja">Googleのプライバシーポリシー</a></p>
      <p>マイソング診断の結果にYouTubeの動画やサムネイルが表示されると、再生する前にもブラウザがYouTubeに接続し、IPアドレスやブラウザの情報などが送られます。埋め込み動画にはYouTubeのプライバシー強化モードを使用しています。詳しくは<a href="https://policies.google.com/privacy?hl=ja">Googleのプライバシーポリシー</a>をご覧ください。</p>
      <p>経路検索や楽曲の出典のリンクを開くと、リンク先のサービスにもアクセスします。移動先での情報の取り扱いは、各サービスの方針をご覧ください。</p>

      <h2>お問い合わせ</h2>
      <p>ファンノートでの情報の取り扱いについては、KatakataLabの窓口で受け付けています。フォームやメールでお知らせいただいた内容と連絡先は、お問い合わせに回答するために使います。<a href="https://katakatalab.com/contact.html">KatakataLabのお問い合わせ窓口</a></p>
      <p><a href="https://katakatalab.com/privacy.html">KatakataLab全体のプライバシーポリシー</a></p>
      <p className="text-sm text-[#57534E]"><time dateTime="2026-11-14">2026年11月14日更新</time></p>

      <section
        aria-labelledby="privacy-data-controls"
        className="mt-8 rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 space-y-4"
      >
        <h2 id="privacy-data-controls" className="!mt-0 text-lg font-bold text-[#253331]">
          記録の保存・引き継ぎ・初期化
        </h2>
        <p className="text-sm leading-relaxed text-[#57534E]">
          マイセトリや参戦・訪問の記録はこのブラウザに保存されます。機種変更やブラウザのデータ削除に備えてファイルに書き出したり、初期状態に戻したりできます。
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <button
            type="button"
            onClick={onExportRecords}
            disabled={!onExportRecords}
            className="min-h-11 rounded-lg border border-[#253331] bg-white px-4 py-2 text-sm font-bold text-[#253331] hover:bg-[#f4efe4] transition-colors cursor-pointer disabled:opacity-50"
          >
            記録を書き出す
          </button>
          <label className="block text-sm font-bold text-[#253331]">
            ファイルから記録を戻す
            <input
              type="file"
              accept=".json,application/json"
              disabled={!onImportRecords}
              className="mt-1 block max-w-full text-xs font-normal"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = '';
                if (file && onImportRecords) void onImportRecords(file);
              }}
            />
          </label>
        </div>
        <p className="text-xs leading-relaxed text-[#57534E]">
          読み込み時は、このブラウザの記録をファイルの内容に置き換えるか確認します。診断やクイズの途中経過は含みません。
        </p>
        <div className="border-t border-[#e5dccb] pt-4">
          <button
            type="button"
            onClick={onResetAllUserData}
            disabled={!onResetAllUserData}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffdf8] px-4 py-2 text-xs font-bold text-[#9B3021] hover:border-[#9B3021] hover:bg-[#FDF3F1] transition-colors cursor-pointer disabled:opacity-50"
          >
            このブラウザの保存記録をすべて初期化
          </button>
        </div>
      </section>
    </article>
  );
}
