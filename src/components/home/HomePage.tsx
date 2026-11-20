import type { CSSProperties, ReactNode } from 'react';
import { ArrowRight, Mic2, Newspaper } from 'lucide-react';
import { HIGEDAN_MEMBERS, type EraTag, type SongItem } from '../../data/higedanData';
import { isPlainLeftClick, tabPath } from '../../config/siteFeatures';
import type { ActiveFeatureTab } from '../SiteHeader';
import { songPagePath } from '../../songPages/publishedSongPageIds';
import { saveSongReturnTab } from '../../utils/guideReturnState';
import { HOME_STICKY_NOTES, type HomeStickyNote } from './homeContent';

const MEMBER_TAPE_COLORS = ['#f5c6be', '#f6e39c', '#bce3f8', '#c0e6c7'] as const;

function renderFusenMotif(id: HomeStickyNote['id']) {
  let paths: ReactNode = null;
  switch (id) {
    case 'discography':
      paths = (
        <>
          <path d="M18 35V14l18-4v21" />
          <circle cx="14" cy="35" r="4" />
          <circle cx="32" cy="31" r="4" />
          <path d="M18 20l18-4" />
        </>
      );
      break;
    case 'tour_archive':
      paths = (
        <>
          <path d="M8 16a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v4a3 3 0 0 0 0 6v4a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-4a3 3 0 0 0 0-6Z" />
          <path d="M28 14v18" strokeDasharray="2.5 2.5" />
          <path d="M14 21h9M14 26h6" />
        </>
      );
      break;
    case 'sacred_map':
      paths = (
        <>
          <path d="M24 38s10-9.6 10-18a10 10 0 1 0-20 0c0 8.4 10 18 10 18Z" />
          <circle cx="24" cy="20" r="3.5" />
          <path d="M10 40c5-2.5 9-2.5 14 0s9 2.5 14 0" opacity="0.7" />
        </>
      );
      break;
    case 'setlist':
      paths = (
        <>
          <path d="M12 14h20M12 22h16M12 30h12" />
          <path d="M32 25l1.6 3.5 3.8.5-2.8 2.6.7 3.8-3.3-1.8-3.3 1.8.7-3.8-2.8-2.6 3.8-.5z" />
        </>
      );
      break;
    case 'mood':
      paths = (
        <>
          <path d="M12 22h18v7a9 9 0 0 1-18 0v-7Z" />
          <path d="M30 24h3.5a3.5 3.5 0 0 1 0 7H30" />
          <path d="M10 38h22" />
          <path d="M17 16c0-2.5 2-3.5 1-6M23 16c0-2.5 2-3.5 1-6" />
        </>
      );
      break;
    case 'quiz':
      paths = (
        <>
          <path d="M29 11l8 8-17 17-9 1 1-9Z" />
          <path d="M25 15l8 8" />
        </>
      );
      break;
    default:
      return null;
  }

  return (
    <svg
      className="fusen-motif"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}

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
          <p className="mt-3 mx-auto max-w-3xl text-[14.5px] sm:text-[17px] font-bold leading-[1.75] text-[#57534E]">
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
                className="fusen-card fusen-note-lines has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#253331]"
                style={noteStyle}
              >
                <a
                  href={tabPath(note.id, import.meta.env.BASE_URL)}
                  aria-label={`${note.title}をひらく`}
                  onClick={(e) => {
                    if (isPlainLeftClick(e)) {
                      e.preventDefault();
                      onSelectTab(note.id);
                    }
                  }}
                  className="flex flex-1 flex-col justify-between text-inherit no-underline focus-visible:outline-none after:absolute after:inset-0 after:z-[1] after:rounded-[4px] after:content-['']"
                >
                  <div className="relative z-[2] pointer-events-none">
                    <h2 className="fusen-title">{note.title}</h2>
                    <p className="fusen-desc">{note.description}</p>
                  </div>
                  <div className="relative z-[2] pointer-events-none mt-1.5 flex items-center justify-end">
                    <span
                      className="text-[12px] font-bold tracking-[0.04em]"
                      style={{ color: 'var(--accent)' }}
                    >
                      {note.ctaLabel}
                    </span>
                  </div>
                </a>
                {renderFusenMotif(note.id)}
              </article>
            );
          })}
        </div>

        {/* 音域比較表・資料一覧への直接索引（.fusen-card 数を6枚に維持） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href={tabPath('vocal_range', import.meta.env.BASE_URL)}
            onClick={(e) => {
              if (isPlainLeftClick(e)) {
                e.preventDefault();
                onSelectTab('vocal_range');
              }
            }}
            className="notebook-paper flex min-h-[52px] items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-inherit no-underline transition-colors hover:border-[#253331]/40 hover:bg-[#fffbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Mic2 aria-hidden="true" className="h-4 w-4 shrink-0 text-[#1d5a7a]" />
              <span className="min-w-0">
                <span className="block font-note-serif text-sm font-bold text-[#253331]">
                  掲載90曲の音域・発売日一覧
                </span>
                <span className="block text-[11px] text-[#57534E]">
                  カラオケ選曲の目安に、最高音／最低音・BPM・発売日を比較
                </span>
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[#78716C]" />
          </a>

          <a
            href={tabPath('quiz_archive', import.meta.env.BASE_URL)}
            onClick={(e) => {
              if (isPlainLeftClick(e)) {
                e.preventDefault();
                onSelectTab('quiz_archive');
              }
            }}
            className="notebook-paper flex min-h-[52px] items-center justify-between gap-3 rounded-lg px-4 py-3 text-left text-inherit no-underline transition-colors hover:border-[#253331]/40 hover:bg-[#fffbf2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253331]"
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
          </a>
        </div>
      </section>

      {/* メンバー紹介（ノートの索引メモ風・控えめで落ち着いた佇まい） */}
      <section
        aria-labelledby="members-heading"
        className="mt-[47px] sm:mt-[55px]"
      >
        <div className="relative flex items-center justify-center mb-[15px]" aria-hidden="true">
          <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#e5dccb]" />
          <span className="relative z-[1] inline-flex items-center justify-center bg-[#faf6eb] px-4">
            <svg viewBox="0 0 100 55" width="64" height="36" className="overflow-visible">
              <g transform="translate(50 28) scale(0.125) translate(-370 -125)">
                <path
                  fill="#78716C"
                  d="M370 86 C356 66 338 62 316 62 C254 62 234 156 174 156 C138 156 112 142 112 120 C112 102 125 94 140 94 C153 94 160 103 160 114 C160 124 151 130 142 130 C136 130 132 126 132 121 C132 117 125 117 125 122 C125 132 133 139 144 139 C159 139 170 128 170 112 C170 94 155 82 136 82 C108 82 88 104 88 134 C88 172 144 188 214 188 C286 188 336 156 362 128 C366 124 368 122 370 122 C372 122 374 124 378 128 C404 156 454 188 526 188 C596 188 652 172 652 134 C652 104 632 82 604 82 C585 82 570 94 570 112 C570 128 581 139 596 139 C607 139 615 132 615 122 C615 117 608 117 608 121 C608 126 604 130 598 130 C589 130 580 124 580 114 C580 103 587 94 600 94 C615 94 628 102 628 120 C628 142 602 156 566 156 C506 156 486 62 424 62 C402 62 384 66 370 86 Z"
                />
              </g>
            </svg>
          </span>
        </div>

        <h2
          id="members-heading"
          className="font-note-serif text-xl font-bold tracking-[.04em] text-[#253331]"
        >
          Official髭男dism メンバー紹介
        </h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
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
