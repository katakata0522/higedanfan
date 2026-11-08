import { Fragment } from 'react';
import { ArrowRight, BookOpen, Compass, Sparkles, Users } from 'lucide-react';
import { HIGEDAN_MEMBERS, type EraTag, type SongItem } from '../../data/higedanData';
import { isSafeAssetUrl } from '../../utils/fanLogic';
import { GuideArtwork } from '../GuideArtwork';
import type { ActiveFeatureTab } from '../SiteHeader';
import { HERO_JACKET_SHOWCASE, HOME_FEATURE_CARDS } from './homeContent';

interface HomePageProps {
  songs: SongItem[];
  onSelectTab: (tab: ActiveFeatureTab, eraPreset?: EraTag | 'all') => void;
  onSelectSong: (id: string) => void;
}

export function HomePage({ songs, onSelectTab, onSelectSong }: HomePageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-12">
      {/* Hero Spread (Removed decorative English filler like MATSUE/TOKYO/STADIUM) */}
      <div className="overflow-hidden rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-8 lg:p-10 shadow-[0_2px_16px_rgba(28,25,23,0.03)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center">
          {/* Left: Intro & Primary Entry Actions */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-bold text-[#C83E2B]">
                Official髭男dism 非公式ファンサイト
              </p>
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-[#1C1917] leading-[1.2] text-balance">
                115万キロのファンノート
              </h1>
            </div>

            <p className="text-xs sm:text-base text-[#57534E] leading-relaxed max-w-2xl">
              いつもの一曲に、まだ知らない話があるかもしれない。
              曲の背景をたどったり、今日の気分に合う音を探したり。
              ヒゲダンを好きな時間を、ここでゆっくり楽しんでください。
            </p>

            <div className="pt-1 grid grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectTab('discography', 'all')}
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C83E2B] px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>90曲の物語をたどる</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('mood')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-5 py-3 text-xs sm:text-sm font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Compass className="h-4 w-4 text-[#1E3A5F]" />
                <span>今日の1曲を探す</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('setlist')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#D5CEC2] bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>マイセトリを作る</span>
              </button>
            </div>
            <div className="border-l-2 border-[#C83E2B] pl-3">
              <p className="text-[11px] font-bold text-[#78716C]">曲の小さな裏話</p>
              <button type="button" onClick={() => onSelectSong('pretender')}
                className="mt-1 text-left text-xs sm:text-sm font-bold leading-relaxed text-[#1E3A5F] underline decoration-[#B9AEA0] underline-offset-4 hover:text-[#C83E2B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C1917]">
                「Pretender」の「世界線」、アニメとのつながりを読む →
              </button>
            </div>
          </div>

          {/* Right: 2x2 Album Jacket Showcase (Clicking filters Song Guide by that Era!) */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-[#F2EFE9] p-3.5 sm:p-4 border border-[#E6E1D6]">
              <div className="grid grid-cols-2 gap-3">
                {HERO_JACKET_SHOWCASE.map((art) => (
                  <button
                    key={art.label}
                    type="button"
                    onClick={() => onSelectTab('discography', art.era)}
                    aria-label={`${art.label}の時代から曲を探す`}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-[#1C1917] ring-1 ring-black/10 shadow-xs text-left cursor-pointer"
                  >
                    {isSafeAssetUrl(art.src) && (
                      <GuideArtwork
                        src={art.src}
                        alt={`${art.label}  オリジナル図柄`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
                      <span className="block text-[10px] font-mono-num text-white/75">
                        {art.year}
                      </span>
                      <span className="block text-xs font-bold text-white min-w-0 wrap-anywhere whitespace-normal">
                        {art.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#57534E] px-0.5">
                <span>好きな時期から曲を探す</span>
                <span className="font-bold text-[#1C1917]">選んで見る →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Content Appeal Cards (Direct Access to Every Feature & Sub-Feature) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#E6E1D6] pb-3.5">
          <h2 className="text-lg sm:text-xl font-bold text-[#1C1917]">
            今日はどこから楽しむ？
          </h2>
        </div>

        {/* Featured Lead Card: 01 My Song Diagnosis */}
        <article className="rounded-2xl border border-[#D5CEC2] bg-white p-5 sm:p-8 transition-colors hover:border-[#1C1917]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-baseline gap-2.5">
                <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#C83E2B] font-mono-num">
                  {HOME_FEATURE_CARDS[0].stepNum}.
                </span>
                <span className="text-xs font-bold text-[#78716C]">
                  {HOME_FEATURE_CARDS[0].subtitle}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                {HOME_FEATURE_CARDS[0].title}
              </h3>

              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed max-w-2xl">
                {HOME_FEATURE_CARDS[0].description}
              </p>

              <div className="pt-2 border-t border-[#E6E1D6] flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57534E]">
                {HOME_FEATURE_CARDS[0].points.map((pt, i) => (
                  <Fragment key={pt}>
                    {i > 0 && (
                      <span aria-hidden="true" className="text-[#D5CEC2]">
                        ·
                      </span>
                    )}
                    <span>{pt}</span>
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={() => onSelectTab('mood')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#C83E2B] px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-[#A93020] transition-colors min-h-[44px] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{HOME_FEATURE_CARDS[0].ctaLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>

        {/* Other 4 Content Appeal Cards in a Clean, Unified 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {HOME_FEATURE_CARDS.slice(1).map((card) => (
            <article
              key={card.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6 transition-colors hover:border-[#1C1917]"
            >
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2 border-b border-[#E6E1D6] pb-3">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917] group-hover:text-[#C83E2B] transition-colors font-mono-num">
                      {card.stepNum}.
                    </span>
                    <span className="text-xs font-bold text-[#78716C]">
                      {card.subtitle}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-[#1C1917]">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {card.description}
                </p>

                <div className="pt-2 space-y-1 text-xs text-[#78716C]">
                  {card.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-[#C83E2B]">
                        —
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E6E1D6] flex flex-wrap items-center justify-end gap-2">
                {card.secondaryId && card.secondaryCtaLabel && (
                  <button
                    type="button"
                    onClick={() => onSelectTab(card.secondaryId!)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3.5 py-2.5 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{card.secondaryCtaLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectTab(card.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#1C1917] px-4 py-2.5 text-xs font-bold text-[#FBF9F5] hover:bg-[#C83E2B] transition-colors min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{card.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* メンバー本人の取材からたどる紹介 */}
      <section
        aria-labelledby="members-heading"
        className="space-y-4 pt-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[#E6E1D6] pb-3.5">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#C83E2B]" />
            <h2
              id="members-heading"
              className="text-lg sm:text-xl font-bold text-[#1C1917]"
            >
              Official髭男dism メンバー紹介 ＆ 演奏の聴きどころ
            </h2>
          </div>
          <span className="text-xs text-[#78716C]">
            2012年6月7日 島根・松江にて結成
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {HIGEDAN_MEMBERS.map((member) => {
            const sigSong = songs.find((s) => s.id === member.signatureSongId);
            return (
              <article
                key={member.id}
                className="flex flex-col justify-between rounded-xl border border-[#E6E1D6] bg-white p-5 sm:p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-[#78716C]">
                    <span className="font-bold text-[#C83E2B]">{member.role}</span>
                    <span>{member.birthplace}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[#1C1917]">
                      {member.name}
                    </h3>
                    <span className="text-xs text-[#78716C]">
                      （{member.nickname}）
                    </span>
                  </div>
                  <p className="mt-3 text-base font-bold leading-relaxed text-[#1C1917]">
                    {member.headline}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#57534E]">{member.biography}</p>
                  <div className="mt-4 border-l-2 border-[#C83E2B] bg-[#FBF9F5] px-3 py-2.5">
                    <p className="text-[11px] font-bold tracking-wide text-[#9A341F]">こんな話も</p>
                    <p className="mt-1 text-sm leading-6 text-[#44403C]">{member.extra}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#78716C]">
                    <span>取材・出典</span>
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
                  <div className="mt-4 pt-3 border-t border-[#E6E1D6]">
                    <button
                      type="button"
                      onClick={() => onSelectSong(sigSong.id)}
                      className="w-full inline-flex items-center justify-between gap-2 text-xs font-bold text-[#1E3A5F] hover:text-[#C83E2B] transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5 min-w-0">
                        <BookOpen className="h-3.5 w-3.5 shrink-0" />
                        <span className="min-w-0 wrap-anywhere whitespace-normal">
                          この話から聴く1曲：『{member.signatureSongTitle}』
                        </span>
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
