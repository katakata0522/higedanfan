export function EditorProfile() {
  return (
    <article
      aria-labelledby="editor-title"
      className="space-y-6 text-base leading-7 text-[#292524]"
    >
      <header className="space-y-2 border-b border-[#e5dccb] pb-5">
        <p className="text-xs font-bold tracking-wider text-[#C83E2B]">
          ノートをつくっている人
        </p>
        <h1
          id="editor-title"
          className="font-note-serif text-2xl font-bold text-[#253331] sm:text-3xl"
        >
          編集者について（かたかた）
        </h1>
        <p className="text-sm text-[#57534E]">
          「115万キロのファンノート」の制作・編集をしている人のメモページです。
        </p>
      </header>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          ファンになったきっかけ
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[#292524]">
          「Pretender」をきっかけにOfficial髭男dismのファンになり、楽曲ごとの背景や音域、ライブの記録、ゆかりの聖地を手元のノートのように見返せる場所を目指して「115万キロのファンノート」を制作・編集しています。
        </p>
      </section>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2.5">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          このノートで大切にしている3つのこと
        </h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base leading-relaxed text-[#292524]">
          <li>
            <strong>出典・公式資料への誠実さ：</strong>
            作品情報・音域の採譜・インタビュー引用など、確認した原典をたどれるように出典リンクをできる限り明記しています。
          </li>
          <li>
            <strong>ログイン不要で気楽に残せる手元ノート：</strong>
            マイセトリや参戦・聖地訪問の記録はアカウント登録なしで、お使いのブラウザにそのまま保存・書き出しできます。
          </li>
          <li>
            <strong>全90曲それぞれの背景をていねいに：</strong>
            代表曲からインディーズ期・アルバム収録曲まで、曲調・テンポ・聴きどころを1曲ずつ見返せる形を目指しています。
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          おすすめの楽しみ方
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[#292524]">
          ピアノがきらめく王道ポップから、重厚なブラス＆ファンク、心に寄り添うバラードやスタジアムロックまで——気分や場面に合わせて「マイソング診断」で1曲を見つけたり、「音域・発売日比較表」で自分の声に合う曲を探したり、「マイセトリ作成」で夢のライブを組んだりして、ご自身のペースで楽しんでいただけたらうれしいです。
        </p>
      </section>

      <nav aria-label="関連ページ" className="flex flex-wrap gap-4 pt-2 text-sm">
        <a href="#discography" className="font-bold text-[#1E3A5F] underline underline-offset-4 hover:text-[#C83E2B]">
          楽曲ガイドを見る
        </a>
        <a href="#home" className="font-bold text-[#253331] underline underline-offset-4 hover:text-[#C83E2B]">
          トップページへ戻る
        </a>
      </nav>
    </article>
  );
}
