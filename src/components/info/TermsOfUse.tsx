import { isPlainLeftClick, tabPath } from '../../config/siteFeatures';
import type { SiteTab } from '../SiteHeader';

export function TermsOfUse({ onSelectTab }: { onSelectTab?: (tab: SiteTab) => void }) {
  return (
    <article aria-labelledby="terms-title" className="space-y-4 text-base leading-7 text-[#292524] [&_a]:text-[#1E3A5F] [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-bold">
      <h1 id="terms-title" className="font-note-serif text-2xl font-bold tracking-[.04em] text-[#253331] sm:text-3xl">利用規約</h1>
      <p>「115万キロのファンノート」は、<a
        href={tabPath('editor', import.meta.env.BASE_URL)}
        onClick={(e) => {
          if (isPlainLeftClick(e) && onSelectTab) {
            e.preventDefault();
            onSelectTab('editor');
          }
        }}
      >編集者（かたかた）</a>（<a href="https://katakatalab.com/who-is-katakata.html">KatakataLab</a>）が制作・運営するOfficial髭男dismの非公式ファンサイトです。<a href="https://katakatalab.com/terms.html">KatakataLab共通の利用規約</a>が適用されます。</p>
      <h2>楽曲情報と公演記録</h2>
      <p>音域は各曲の出典にある音域調査データをもとにしています。音源や地声・裏声の判定によって、資料ごとに値が異なることがあります。演奏時間は参照した配信音源の長さです。公演日・会場およびセットリストは公開資料を照合した参考記録であり、当サイトが実際の実演順を完全に保証するものではありません。</p>
      <h2>共有・引用・転載</h2>
      <p>このサイトへのリンクや、ご自身で作ったMYセトリは自由に共有できます。楽曲、歌詞、音源、写真、出典に挙げた記事の権利は、それぞれの権利者に帰属します。</p>
      <p>公表された文章を引用するときは、引用部分を自分の文章と区別して出典を示し、公正な慣行に沿って目的に必要な範囲でお使いください。楽曲解説の転載や、他の人が作った譜面・音源の公開には、法律で認められた利用を除き、権利者の許諾が必要です。</p>
      <h2>ブラウザに保存する記録</h2>
      <p>MYセトリ、マイノート（お名前や閲覧した楽曲ページ・探索スタンプの進捗）、訪問・ツアー参戦記録、検定の最高正答率・セット別の記録は、使っているブラウザに保存されます。現在非公開の人気投票と感想ノートで過去に保存した記録も、非公開にしただけでは消えません。このサイトのデータをブラウザから削除すると、これらの記録も消えます。</p>
      <h2>掲載内容や権利に関するお問い合わせ</h2>
      <p>掲載内容の訂正や権利に関するご連絡は、対象のページや曲名を添えて<a href="https://katakatalab.com/contact.html">KatakataLabのお問い合わせ窓口</a>にお寄せください。</p>
    </article>
  );
}
