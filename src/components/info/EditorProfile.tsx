import { isPlainLeftClick, tabPath } from '../../config/siteFeatures';
import type { SiteTab } from '../SiteHeader';

const RELATED_PAGE_LINKS: readonly { id: SiteTab; label: string; highlight?: boolean }[] = [
  { id: 'discography', label: '楽曲ガイドを見る', highlight: true },
  { id: 'sources', label: '参考資料・謝辞' },
  { id: 'privacy', label: 'プライバシーポリシー' },
  { id: 'terms', label: '利用規約' },
  { id: 'home', label: 'トップページへ戻る' },
];

export function EditorProfile({ onSelectTab }: { onSelectTab?: (tab: SiteTab) => void }) {
  return (
    <article
      aria-labelledby="editor-title"
      className="space-y-6 text-base leading-7 text-[#292524]"
    >
      <header className="border-b border-[#e5dccb] pb-4">
        <h1
          id="editor-title"
          className="font-note-serif text-2xl font-bold text-[#253331] sm:text-3xl"
        >
          編集者について（かたかた）
        </h1>
      </header>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          自己紹介
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[#292524]">
          「Pretender」をきっかけにOfficial髭男dismのファンになり、楽曲ごとの背景や音域、ライブの記録、ゆかりの聖地を手元のノートのように見返せる場所を目指して「115万キロのファンノート」を制作・編集しています。
        </p>
      </section>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          おすすめの楽しみ方
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[#292524]">
          ピアノがきらめく王道ポップから、重厚なブラス＆ファンク、心に寄り添うバラードやスタジアムロックまで——気分や場面に合わせて「今日の1曲診断」で1曲を見つけたり、「掲載90曲の音域・発売日一覧」で自分の声に合う曲を探したり、「MYセトリ作成」で夢のライブを組んだりして、ご自身のペースで楽しんでいただけたらうれしいです。
        </p>
      </section>

      <section className="rounded-xl border border-[#dfd7c7] bg-[#fffdf8] p-5 sm:p-6 space-y-2">
        <h2 className="font-note-serif text-lg font-bold text-[#253331]">
          運営・訂正のご連絡について
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[#292524]">
          当サイトは <a href="https://katakatalab.com/who-is-katakata.html" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1E3A5F] underline underline-offset-2 hover:text-[#C83E2B]">KatakataLab（かたかた）</a> が個人で制作・管理している非公式ファンサイトです。表記の誤りや出典の補足・削除依頼などがございましたら、<a href="https://katakatalab.com/contact.html" target="_blank" rel="noopener noreferrer" className="font-bold text-[#1E3A5F] underline underline-offset-2 hover:text-[#C83E2B]">KatakataLabのお問い合わせ窓口</a>よりお知らせください。
        </p>
      </section>

      <nav aria-label="関連ページ" className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm">
        {RELATED_PAGE_LINKS.map((link) => (
          <a
            key={link.id}
            href={tabPath(link.id, import.meta.env.BASE_URL)}
            onClick={(e) => {
              if (isPlainLeftClick(e) && onSelectTab) {
                e.preventDefault();
                onSelectTab(link.id);
              }
            }}
            className={`font-bold underline underline-offset-4 hover:text-[#C83E2B] ${
              link.highlight ? 'text-[#1E3A5F]' : 'text-[#253331]'
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </article>
  );
}
