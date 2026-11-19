import React, { useEffect, useState } from 'react';
import { isPlainLeftClick, tabPath } from '../config/siteFeatures';
import { PUBLIC_FEATURES } from '../config/publicFeatures';
import { pwaInstallOutcomeMessage, usePwaInstall } from '../utils/pwaInstall';
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
  NotebookPen,
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
    id: 'discography',
    label: '楽曲ガイド（掲載90曲）',
    shortDesc: '一曲ごとの音域やテンポ、生まれた背景や聴きどころまで',
    icon: <Disc className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'vocal_range',
    label: '掲載90曲の音域・発売日一覧',
    shortDesc: '歌いやすさの目安や発売日の歩みを一覧で見比べる',
    icon: <Mic2 className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'tour_archive',
    label: '歴代ツアー記録',
    shortDesc: '記憶に残るツアーとセトリの歩み、参戦メモの記録',
    icon: <Ticket className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'sacred_map',
    label: '聖地巡礼マップ',
    shortDesc: '松江の原点やライブ会場、MVの景色をめぐる旅マップ',
    icon: <Compass className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'setlist',
    label: 'MYセトリ作成',
    shortDesc: '好きな曲順で夢のライブを編み、画像でも残せる工房',
    icon: <ListMusic className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'mood',
    label: '今日の1曲診断',
    shortDesc: '今の気分や空気感に、しっくり寄り添う1曲と出会う',
    icon: <Sparkles className="h-4 w-4 shrink-0" />,
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
  onSelectTab: (tab: SiteTab) => void;
  onReplayIntro?: () => void;
  onMenuOpenChange?: (open: boolean) => void;
  onOpenMyNote?: () => void;
  onInstallFeedback?: (message: string) => void;
  isMyNoteOpen?: boolean;
  setlistCount?: number;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  activeTab,
  onSelectTab,
  onReplayIntro,
  onMenuOpenChange,
  onOpenMyNote,
  onInstallFeedback,
  isMyNoteOpen = false,
  setlistCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = React.useRef<HTMLButtonElement>(null);
  const menuDrawer = React.useRef<HTMLElement>(null);
  const pwaInstall = usePwaInstall();

  const handleInstallClick = async () => {
    if (pwaInstall.isInstalling) return;
    const outcome = await pwaInstall.install();
    const message = pwaInstallOutcomeMessage(outcome);
    if (message) onInstallFeedback?.(message);
    if (outcome === 'accepted') {
      setIsMenuOpen(false);
      menuButton.current?.focus();
    } else if (outcome !== 'unavailable') {
      requestAnimationFrame(() => {
        if (!document.getElementById('pwa-install-btn') && document.activeElement === document.body) {
          document.getElementById('kurun-replay-btn')?.focus();
        }
      });
    }
  };

  useEffect(() => {
    onMenuOpenChange?.(isMenuOpen);
  }, [isMenuOpen, onMenuOpenChange]);

  // Close drawer when activeTab changes from any trigger
  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeTab]);

  // Move focus into drawer when opened; close on Escape or outside pointerdown
  useEffect(() => {
    if (!isMenuOpen) return;
    menuDrawer.current
      ?.querySelector<HTMLElement>('button, a[href]')
      ?.focus({ preventScroll: true });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (e.key === 'Tab' && menuDrawer.current) {
        const drawerFocusables = Array.from(
          menuDrawer.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
        );
        const focusables = [
          ...(menuButton.current ? [menuButton.current] : []),
          ...drawerFocusables,
        ];
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const activeEl = document.activeElement;
        if (e.shiftKey) {
          if (activeEl === first || !focusables.includes(activeEl as HTMLElement)) {
            e.preventDefault();
            last.focus();
          }
        } else if (activeEl === last || !focusables.includes(activeEl as HTMLElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (menuDrawer.current?.contains(target) || menuButton.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isMenuOpen]);

  const currentNav =
    SITE_NAV_ITEMS.find((item) => item.id === activeTab) || SITE_NAV_ITEMS[0];

  const handleNavigate = (tab: SiteTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7dfd0] bg-[#f9f5eb]/95 backdrop-blur-md">
      <div className="relative mx-auto max-w-6xl px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Hand-drawn Mustache Emblem & Kiwi Maru Brand */}
        <a
          href={tabPath('home', import.meta.env.BASE_URL)}
          onClick={(e) => {
            if (isPlainLeftClick(e)) {
              e.preventDefault();
              handleNavigate('home');
            }
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 text-left min-w-0 group no-underline text-inherit"
        >
          <svg
            viewBox="0 0 100 55"
            aria-hidden="true"
            className="h-5 w-7 sm:h-7 sm:w-11 shrink-0 overflow-visible transition-transform duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3"
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
          <span className="min-w-0">
            <span className="block font-note-serif text-[11px] min-[380px]:text-[13px] sm:text-base font-bold tracking-normal sm:tracking-[.03em] leading-tight text-[#253331] group-hover:text-[#C83E2B] transition-colors min-w-0">
              <span className="whitespace-nowrap">115万キロの</span><wbr /><span className="whitespace-nowrap">ファンノート</span>
            </span>
            {' '}
            <span className="sr-only sm:not-sr-only sm:block text-[10.5px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
              Official髭男dism 非公式ファンサイト
            </span>
          </span>
        </a>

        {/* Right: Current Corner + My Note + Notebook Menu */}
        <div className="flex items-center gap-1 min-[380px]:gap-1.5 sm:gap-2.5 shrink-0">
          {activeTab !== 'home' && (
            <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#e7dfd0] bg-[#fffdf8] px-3 py-1.5 text-xs font-bold text-[#253331]">
              {!isInfoPage(activeTab) && <span className="text-[#C83E2B]">{currentNav.icon}</span>}
              <span>{isInfoPage(activeTab) ? infoPages[activeTab] : currentNav.label}</span>
            </div>
          )}

          {onOpenMyNote && (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenMyNote();
              }}
              aria-haspopup="dialog"
              aria-expanded={isMyNoteOpen}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full border border-[#dfd7c7] bg-[#fffcf5] hover:border-[#253331] hover:bg-[#f2ece0] text-[#253331] px-2 min-[380px]:px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] min-[380px]:text-xs sm:text-sm font-bold transition-colors min-h-[36px] sm:min-h-[38px] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <NotebookPen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#C83E2B] shrink-0" aria-hidden="true" />
              <span>マイノート</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            ref={menuButton}
            aria-expanded={isMenuOpen}
            aria-controls="global-nav-drawer"
            aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-full border px-2 min-[380px]:px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] min-[380px]:text-xs sm:text-sm font-bold transition-colors min-h-[36px] sm:min-h-[38px] whitespace-nowrap shrink-0 cursor-pointer ${
              isMenuOpen
                ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                : 'border-[#dfd7c7] bg-[#fffcf5] text-[#253331] hover:border-[#253331] hover:bg-[#f2ece0]'
            }`}
          >
            {isMenuOpen ? (
              <>
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>閉じる</span>
              </>
            ) : (
              <>
                <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
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
              ref={menuDrawer}
              id="global-nav-drawer"
              aria-label="サイト内メニュー"
              className="fixed sm:absolute right-0 sm:right-6 lg:right-8 top-16 z-40 w-full sm:w-[424px] max-h-[calc(100vh-4rem)] overflow-y-auto sm:rounded-b-2xl border-b sm:border border-[#dfd7c7] bg-[#faf6eb] shadow-xl"
            >
              <div className="p-3.5 sm:p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-1.5 mb-2.5 sm:mb-1.5 border-b border-[#e5dccb] px-1">
                  <span className="font-note-serif text-xs font-bold text-[#253331]">
                    ファンノートの目次
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    コーナー一覧
                  </span>
                </div>

                {/* Vertical Stack of Content Items */}
                <div className="flex flex-col gap-1.5 sm:gap-1">
                  {SITE_NAV_ITEMS.map((item) => {
                    const isCurrent = activeTab === item.id;
                    return (
                      <a
                        key={item.id}
                        href={tabPath(item.id, import.meta.env.BASE_URL)}
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={(e) => {
                          if (isPlainLeftClick(e)) {
                            e.preventDefault();
                            handleNavigate(item.id);
                          } else {
                            setIsMenuOpen(false);
                          }
                        }}
                        className={`group flex items-center justify-between gap-3 rounded-lg border px-3.5 sm:px-3 py-2.5 sm:py-1.5 text-left no-underline transition-all ${
                          isCurrent
                            ? 'border-[#253331] bg-[#253331] text-[#faf6eb]'
                            : 'border-[#e5dccb] bg-[#fffdf8] text-[#253331] hover:border-[#253331]/50 hover:bg-[#f4efe4]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-8 w-8 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
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
                                {item.id === 'setlist' && typeof setlistCount === 'number' && setlistCount > 0 && (
                                  <span
                                    className={`ml-1 font-mono-num text-xs font-semibold ${
                                      isCurrent ? 'text-[#f5d0c9]' : 'text-[#57534E]'
                                    }`}
                                  >
                                    （{setlistCount}曲）
                                  </span>
                                )}
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
                      </a>
                    );
                  })}
                </div>
                <div className="mt-3 sm:mt-1.5 border-t border-[#e5dccb] pt-2 sm:pt-1.5">
                  {onReplayIntro && (
                    <button
                      id="kurun-replay-btn"
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onReplayIntro();
                      }}
                      className="flex w-full min-h-11 sm:min-h-7 items-center rounded-lg px-3 sm:px-2.5 text-left text-sm sm:text-xs font-medium text-[#253331] hover:bg-[#f4efe4] cursor-pointer"
                    >
                      オープニングをもう一度見る
                    </button>
                  )}
                  {pwaInstall.canInstall && (
                    <button
                      id="pwa-install-btn"
                      type="button"
                      aria-disabled={pwaInstall.isInstalling ? 'true' : undefined}
                      onClick={() => {
                        void handleInstallClick();
                      }}
                      className="flex w-full min-h-11 sm:min-h-7 items-center rounded-lg px-3 sm:px-2.5 text-left text-sm sm:text-xs font-medium text-[#253331] hover:bg-[#f4efe4] cursor-pointer"
                    >
                      スマホアプリとしてインストール
                    </button>
                  )}
                  <div className="flex flex-col sm:grid sm:grid-cols-2 sm:gap-x-1">
                    {Object.entries(infoPages).map(([id, label]) => (
                      <a
                        key={id}
                        href={tabPath(id, import.meta.env.BASE_URL)}
                        aria-current={id === activeTab ? 'page' : undefined}
                        onClick={(e) => {
                          if (isPlainLeftClick(e)) {
                            e.preventDefault();
                            handleNavigate(id as SiteTab);
                          } else {
                            setIsMenuOpen(false);
                          }
                        }}
                        className="flex min-h-11 sm:min-h-7 items-center rounded-lg px-3 sm:px-2.5 text-sm sm:text-xs font-medium text-[#253331] hover:bg-[#f4efe4] aria-[current=page]:font-bold"
                      >{label}</a>
                    ))}
                  </div>
                </div>
              </div>
            </nav>
          </>
        )}
        <p role="status" className="sr-only">
          {pwaInstall.statusMessage ?? ''}
        </p>
      </div>
    </header>
  );
};
