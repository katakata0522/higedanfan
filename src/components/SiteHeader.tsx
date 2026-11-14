import React, { useEffect, useState } from 'react';
import { PUBLIC_FEATURES } from '../config/publicFeatures';
import { infoPages, isInfoPage, type InfoPageId } from './info/infoPages';
import {
  Menu,
  X,
  Home,
  Sparkles,
  Disc,
  Compass,
  ListMusic,
  Ticket,
  Trophy,
  MessageSquarePlus,
  HelpCircle,
  ChevronRight,
  Mic2,
  Newspaper,
} from 'lucide-react';

export type ActiveFeatureTab =
  | 'home'
  | 'mood'
  | 'discography'
  | 'vocal_range'
  | 'sacred_map'
  | 'setlist'
  | 'tour_archive'
  | 'community'
  | 'fan_reviews'
  | 'quiz'
  | 'quiz_archive';

export interface NavMenuItem {
  id: ActiveFeatureTab;
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
}

export const SITE_NAV_ITEMS: NavMenuItem[] = ([
  {
    id: 'home',
    label: 'トップページ',
    shortDesc: 'サイト案内・メンバー紹介・コンテンツ一覧',
    icon: <Home className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'mood',
    label: 'マイソング診断',
    shortDesc: '今の気分や空気感に、しっくり寄り添う1曲と出会う',
    icon: <Sparkles className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'discography',
    label: '楽曲ガイド（掲載90曲）',
    shortDesc: '曲が生まれた背景や音の聴きどころ、音域まで深掘り',
    icon: <Disc className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'vocal_range',
    label: '掲載90曲の音域・発売日一覧',
    shortDesc: '歌いやすさの目安や発売日の歩みを一覧で見比べる',
    icon: <Mic2 className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'sacred_map',
    label: '聖地巡礼マップ',
    shortDesc: '松江の原点やライブ会場、MVの景色をめぐる旅マップ',
    icon: <Compass className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'setlist',
    label: 'マイセトリ作成',
    shortDesc: '好きな曲順で夢のライブを編み、画像でも残せる工房',
    icon: <ListMusic className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'tour_archive',
    label: '歴代ツアー記録',
    shortDesc: '記憶に残るツアーとセトリの歩み、参戦メモの記録',
    icon: <Ticket className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'community',
    label: '人気曲ランキング投票',
    shortDesc: 'このブラウザで推し曲に投票する4部門のランキング',
    icon: <Trophy className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'fan_reviews',
    label: '感想・考察ノート',
    shortDesc: '好きな曲の感想やライブの思い出を、このブラウザに記録',
    icon: <MessageSquarePlus className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'quiz',
    label: 'Official髭男dism検定',
    shortDesc: '名曲エピソードやメンバーの言葉から挑む検定',
    icon: <HelpCircle className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'quiz_archive',
    label: '参考記事・インタビュー',
    shortDesc: '曲の物語・検定で参考にした記事と公式資料',
    icon: <Newspaper className="h-4 w-4 shrink-0" />,
  },
] satisfies NavMenuItem[]).filter(item =>
  (item.id !== 'community' || PUBLIC_FEATURES.ranking) &&
  (item.id !== 'fan_reviews' || PUBLIC_FEATURES.reviews)
);

export type SiteTab = ActiveFeatureTab | InfoPageId;

interface SiteHeaderProps {
  activeTab: SiteTab;
  onSelectTab: (tab: ActiveFeatureTab) => void;
  onReplayIntro?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  activeTab,
  onSelectTab,
  onReplayIntro,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = React.useRef<HTMLButtonElement>(null);

  // Close drawer when activeTab changes from any trigger
  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeTab]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const currentNav =
    SITE_NAV_ITEMS.find((item) => item.id === activeTab) || SITE_NAV_ITEMS[0];

  const handleNavigate = (tab: ActiveFeatureTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7dfd0] bg-[#f9f5eb]/95 backdrop-blur-md">
      <div className="relative mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Hand-drawn Mustache Emblem & Kaisei Decol Brand */}
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          aria-label="115万キロのファンノート"
          className="flex items-center gap-1.5 sm:gap-2.5 text-left min-w-0 group cursor-pointer"
        >
          <svg
            viewBox="0 0 100 55"
            aria-hidden="true"
            className="h-6 w-9 sm:h-7 sm:w-11 shrink-0 overflow-visible transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3"
          >
            <g transform="translate(50 28) scale(0.145) translate(-370 -125)">
              <path
                fill="#2d3c3a"
                d="M370 86 C356 66 338 62 316 62 C254 62 234 156 174 156 C138 156 112 142 112 120 C112 102 125 94 140 94 C153 94 160 103 160 114 C160 124 151 130 142 130 C136 130 132 126 132 121 C132 117 125 117 125 122 C125 132 133 139 144 139 C159 139 170 128 170 112 C170 94 155 82 136 82 C108 82 88 104 88 134 C88 172 144 188 214 188 C286 188 336 156 362 128 C366 124 368 122 370 122 C372 122 374 124 378 128 C404 156 454 188 526 188 C596 188 652 172 652 134 C652 104 632 82 604 82 C585 82 570 94 570 112 C570 128 581 139 596 139 C607 139 615 132 615 122 C615 117 608 117 608 121 C608 126 604 130 598 130 C589 130 580 124 580 114 C580 103 587 94 600 94 C615 94 628 102 628 120 C628 142 602 156 566 156 C506 156 486 62 424 62 C402 62 384 66 370 86 Z"
              />
              <path
                d="M370 96 C360 82 346 88 349 101 C351 110 370 120 370 120 C370 120 389 110 391 101 C394 88 380 82 370 96 Z"
                fill="#bd604e"
              />
            </g>
          </svg>
          <span aria-hidden="true" className="min-w-0">
            <span className="block font-note-serif text-[13px] sm:text-base font-bold tracking-normal sm:tracking-[.03em] leading-tight text-[#253331] group-hover:text-[#C83E2B] transition-colors min-w-0">
              <span className="inline-block whitespace-nowrap">115万キロの</span>
              <span className="inline-block whitespace-nowrap">ファンノート</span>
            </span>
            <span className="hidden sm:block text-[10.5px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
              Official髭男dism 非公式ファンサイト
            </span>
          </span>
        </button>

        {/* Right: Current Corner + Notebook Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {activeTab !== 'home' && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#e7dfd0] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#253331]">
              {!isInfoPage(activeTab) && <span className="text-[#C83E2B]">{currentNav.icon}</span>}
              <span>{isInfoPage(activeTab) ? infoPages[activeTab] : currentNav.label}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            ref={menuButton}
            onBlur={(event) => {
              if (!event.relatedTarget?.closest('#global-nav-drawer')) setIsMenuOpen(false);
            }}
            aria-expanded={isMenuOpen}
            aria-controls="global-nav-drawer"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full border px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors min-h-[38px] whitespace-nowrap shrink-0 cursor-pointer ${
              isMenuOpen
                ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                : 'border-[#dfd7c7] bg-[#fffcf5] text-[#253331] hover:border-[#253331] hover:bg-[#f2ece0]'
            }`}
          >
            {isMenuOpen ? (
              <>
                <X className="h-4 w-4 shrink-0" />
                <span>閉じる</span>
              </>
            ) : (
              <>
                <Menu className="h-4 w-4 shrink-0" />
                <span>メニュー</span>
              </>
            )}
          </button>
        </div>

        {/* Notebook Index Drawer */}
        {isMenuOpen && (
          <>
            <div
              aria-hidden="true"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-x-0 top-16 bottom-0 z-30 bg-[#253331]/25 backdrop-blur-[1px]"
            />
            <nav
              id="global-nav-drawer"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButton.current) {
                  setIsMenuOpen(false);
                }
              }}
              aria-label="サイト内メニュー"
              className="fixed sm:absolute right-0 sm:right-6 lg:right-8 top-16 z-40 w-full sm:w-[400px] max-h-[calc(100vh-4rem)] overflow-y-auto sm:rounded-b-2xl border-b sm:border border-[#dfd7c7] bg-[#faf6eb] shadow-xl"
            >
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#e5dccb] px-1">
                  <span className="font-note-serif text-xs font-bold text-[#253331]">
                    ファンノートの目次
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    押すと各ページへ移動します
                  </span>
                </div>

                {/* Vertical Stack of Content Items */}
                <div className="flex flex-col gap-1.5">
                  {SITE_NAV_ITEMS.map((item) => {
                    const isCurrent = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`group flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                            : 'border-[#e5dccb] bg-[#fffdf8] text-[#253331] hover:border-[#253331]/50 hover:bg-[#f4efe4]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                              isCurrent
                                ? 'bg-[#C83E2B] text-white'
                                : 'bg-[#f4efe4] text-[#253331] group-hover:bg-[#C83E2B] group-hover:text-white'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold min-w-0 wrap-anywhere whitespace-normal">
                                {item.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-medium text-[#f5d0c9] whitespace-nowrap">
                                  · 表示中
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] leading-snug min-w-0 wrap-anywhere whitespace-normal ${
                                isCurrent ? 'text-[#e6e1d6]' : 'text-[#57534E]'
                              }`}
                            >
                              {item.shortDesc}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            isCurrent
                              ? 'text-[#f5d0c9]'
                              : 'text-[#78716C] group-hover:text-[#253331]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 border-t border-[#e5dccb] pt-2">
                  {onReplayIntro && (
                    <button
                      id="kurun-replay-btn"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReplayIntro();
                      }}
                      className="flex w-full min-h-11 items-center rounded-lg px-3 text-left text-sm font-medium text-[#253331] hover:bg-[#f4efe4] cursor-pointer"
                    >
                      オープニングをもう一度見る
                    </button>
                  )}
                  {Object.entries(infoPages).map(([id, label]) => (
                    <a
                      key={id} href={'#' + id}
                      aria-current={id === activeTab ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#253331] hover:bg-[#f4efe4] aria-[current=page]:font-bold"
                    >{label}</a>
                  ))}
                </div>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};
