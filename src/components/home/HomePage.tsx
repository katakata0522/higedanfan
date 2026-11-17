import type { CSSProperties } from 'react';
import { ArrowRight, Mic2, Newspaper } from 'lucide-react';
import { HIGEDAN_MEMBERS, type EraTag, type SongItem } from '../../data/higedanData';
import type { ActiveFeatureTab } from '../SiteHeader';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { saveSongReturnTab } from '../../utils/guideReturnState';
import { HOME_STICKY_NOTES } from './homeContent';

const MEMBER_TAPE_COLORS = ['#f5c6be', '#f6e39c', '#bce3f8', '#c0e6c7'] as const;

interface HomePageProps {
  songs: SongItem[];
  onSelectTab: (tab: ActiveFeatureTab, eraPreset?: EraTag | 'all') => void;
  onSelectSong: (id: string) => void;
}

export function HomePage({ songs, onSelectTab }: HomePageProps) {
  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20">
      {/* ノート机トップ：リードコピー ＋ 6枚のパステル付箋 */}
      <section aria-labelledby="home-desk-heading" className="space-y-9 sm:space-y-11">
        <header className="text-center">
          <h1
            id="home-desk-heading"
            className="font-note-serif text-[23px] sm:text-[34px] font-medium tracking-[.04em] leading-[1.45] text-[#253331]"
          >
            <span className="inline-block whitespace-nowrap">いつもの日常に</span>
            <span className="inline-block whitespace-nowrap">ひとかけのヒゲダンを</span>
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-xs sm:text-[13.5px] leading-[1.9] text-[#57534E]">
            溢れる髭男への想いをあなたにも受け取ってほしくて<span className="inline-block whitespace-nowrap">形にしました。</span><span className="inline-block whitespace-nowrap">Have Fun!</span>
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-7">
          {HOME_STICKY_NOTES.map((note) => {
            const noteStyle = {
              '--note-bg': note.noteBg,
              '--tape-bg': note.tapeBg,
              '--press-rot': note.pressRot,
              '--accent': note.accent,
            } as CSSProperties;

            return (
              <article
                key={note.id}
                className="fusen-card fusen-note-lines"
                style={noteStyle}
              >
                <button
                  type="button"
                  onClick={() => onSelectTab(note.id)}
                  aria-label={`${note.title}をひらく`}
                  className="absolute inset-0 z-[1] rounded-[4px] bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]"
                />
                <div className="pointer-events-none relative z-[2] flex h-full flex-col justify-between">
                  <div>
                    <h2 className="fusen-title">{note.title}</h2>
                    <p className="fusen-desc">{note.description}</p>
                  </div>
                  <div className="mt-1.5 flex items-center justify-end">
                    <span
                      className="text-[12px] font-bold tracking-[0.04em]"
                      style={{ color: 'var(--accent)' }}
                    >
                      {note.ctaLabel}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* 音域比較表・資料一覧への直接索引（.fusen-card 数を6枚に維持） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => onSelectTab('vocal_range')}
            className="notebook-paper flex min-h-[52px] items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:border-[#253331]/40 hover:bg-[#fffbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331] cursor-pointer"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Mic2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1d5a7a]" />
              <span className="min-w-0">
                <span className="block font-note-serif text-sm font-bold text-[#253331]">
                  掲載90曲の音域・発売日一覧
                </span>
                <span className="block text-[11px] text-[#57534E]">
                  カラオケ選曲・最高音／最低音・キー変更を比較
                </span>
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#78716C]" />
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('quiz_archive')}
            className="notebook-paper flex min-h-[52px] items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:border-[#253331]/40 hover:bg-[#fffbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331] cursor-pointer"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Newspaper aria-hidden="true" className="h-4 w-4 shrink-0 text-[#265c34]" />
              <span className="min-w-0">
                <span className="block font-note-serif text-sm font-bold text-[#253331]">
                  参考記事・インタビュー一覧
                </span>
                <span className="block text-[11px] text-[#57534E]">
                  曲の背景や検定で参照した公式・取材記事を探す
                </span>
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#78716C]" />
          </button>
        </div>
      </section>

      {/* メンバー紹介（ノートの索引メモ風・控えめで落ち着いた佇まい） */}
      <section
        aria-labelledby="members-heading"
        className="mt-16 sm:mt-20 pt-10 border-t border-[#e5dccb] space-y-6"
      >
        <h2
          id="members-heading"
          className="font-note-serif text-lg sm:text-xl font-bold tracking-[.04em] text-[#253331]"
        >
          Official髭男dism メンバー紹介
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {HIGEDAN_MEMBERS.map((member, index) => {
            const sigSong = songs.find((s) => s.id === member.signatureSongId);
            const tapeStyle = {
              '--tape-bg': MEMBER_TAPE_COLORS[index % MEMBER_TAPE_COLORS.length],
            } as CSSProperties;

            return (
              <article
                key={member.id}
                className="fusen-memo-card"
                style={tapeStyle}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[#78716C]">
                    <span className="font-bold text-[#C83E2B]">{member.role}</span>
                    <span>{member.birthplace}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2 border-b border-[#ece3d2] pb-2">
                    <h3 className="font-note-serif text-base sm:text-lg font-bold text-[#253331]">
                      {member.name}
                    </h3>
                    <span className="text-xs text-[#78716C]">
                      （{member.nickname}）
                    </span>
                  </div>
                  <p className="mt-3 font-note-serif text-[13.5px] font-bold leading-snug text-[#253331]">
                    {member.headline}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#57534E]">
                    {member.biography}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#78716C]">
                    <span>取材・出典：</span>
                    {member.sourceLinks.map((source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[28px] items-center py-1 underline underline-offset-2 hover:text-[#C83E2B]"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>

                {sigSong && (
                  <div className="mt-3 pt-2 border-t border-[#ece3d2]">
                    <a
                      href={`${import.meta.env.BASE_URL}${songPagePath(sigSong.id) ?? ''}`}
                      onClick={() => saveSongReturnTab('home')}
                      className="w-full min-h-[32px] py-1 inline-flex items-center justify-between gap-2 text-xs font-bold text-[#253331] hover:text-[#C83E2B] transition-colors"
                    >
                      <span className="min-w-0 wrap-anywhere whitespace-normal text-left">
                        『{member.signatureSongTitle}』の解説ページへ
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
