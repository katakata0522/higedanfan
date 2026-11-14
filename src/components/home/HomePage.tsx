import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { HIGEDAN_MEMBERS, type EraTag, type SongItem } from '../../data/higedanData';
import type { ActiveFeatureTab } from '../SiteHeader';
import { HOME_STICKY_NOTES } from './homeContent';

const MEMBER_TAPE_COLORS = ['#f5c6be', '#f6e39c', '#bce3f8', '#c0e6c7'] as const;

interface HomePageProps {
  songs: SongItem[];
  onSelectTab: (tab: ActiveFeatureTab, eraPreset?: EraTag | 'all') => void;
  onSelectSong: (id: string) => void;
}

export function HomePage({ songs, onSelectTab, onSelectSong }: HomePageProps) {
  return (
    <div className="mx-auto max-w-[960px] px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20">
      {/* ノート机トップ：リードコピー ＋ 6枚のパステル付箋 */}
      <section aria-labelledby="home-desk-heading" className="space-y-9 sm:space-y-11">
        <header className="text-center">
          <h1
            id="home-desk-heading"
            className="font-note-serif text-2xl sm:text-[36px] font-bold tracking-[.05em] leading-[1.45] text-[#253331] text-balance"
          >
            好きな音を、手元に集めたファンノート。
          </h1>
          <p className="mt-3 mx-auto max-w-xl text-xs sm:text-[13.5px] leading-[1.9] text-[#57534E]">
            Official髭男dismの楽曲や思い出を、自由にめくって楽しむためのノートです。
            <br className="hidden sm:inline" />
            気になる付箋を開いて、好きなページをのぞいてみてください。
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
                  <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                    {note.secondaryId && note.secondaryCtaLabel ? (
                      <button
                        type="button"
                        onClick={() => onSelectTab(note.secondaryId!)}
                        className="pointer-events-auto relative z-[3] inline-flex items-center rounded border border-[#253331]/15 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-[#253331] hover:border-[#253331]/45 hover:bg-white transition-colors cursor-pointer"
                      >
                        {note.secondaryCtaLabel}
                      </button>
                    ) : (
                      <span />
                    )}
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
      </section>

      {/* メンバー紹介（ノートの索引メモ風・控えめで落ち着いた佇まい） */}
      <section
        aria-labelledby="members-heading"
        className="mt-16 sm:mt-20 pt-10 border-t border-[#e5dccb] space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <h2
            id="members-heading"
            className="font-note-serif text-lg sm:text-xl font-bold tracking-[.04em] text-[#253331]"
          >
            Official髭男dism メンバー紹介
          </h2>
          <span className="text-xs text-[#78716C]">
            2012年6月7日 島根・松江にて結成
          </span>
        </div>

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
                        className="underline underline-offset-2 hover:text-[#C83E2B]"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>

                {sigSong && (
                  <div className="mt-4 pt-2.5 border-t border-[#ece3d2]">
                    <button
                      type="button"
                      onClick={() => onSelectSong(sigSong.id)}
                      className="w-full inline-flex items-center justify-between gap-2 text-xs font-bold text-[#253331] hover:text-[#C83E2B] transition-colors cursor-pointer"
                    >
                      <span className="min-w-0 wrap-anywhere whitespace-normal text-left">
                        関連する楽曲ページ：『{member.signatureSongTitle}』
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </button>
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
