import React, { useEffect, useState } from 'react';
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

export const SITE_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    label: 'トップページ',
    shortDesc: 'サイト案内・メンバー紹介・コンテンツ一覧',
    icon: <Home className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'mood',
    label: 'マイソング診断',
    shortDesc: '3つの質問で今の気分に合う1曲を診断＆SNSシェアカード生成',
    icon: <Sparkles className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'discography',
    label: '楽曲ガイド（掲載86曲）',
    shortDesc: '曲調・BPM・長さを確認できる86曲のガイド',
    icon: <Disc className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'vocal_range',
    label: '掲載86曲の音域・発売日一覧',
    shortDesc: '地声・裏声の採譜、配信掲載日とCD発売日',
    icon: <Mic2 className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'sacred_map',
    label: '聖地巡礼マップ',
    shortDesc: '結成の地・松江や米子、日産スタジアムなどゆかりの地',
    icon: <Compass className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'setlist',
    label: 'マイセトリ作成',
    shortDesc: '理想の曲順づくりと合計演奏時間・盛り上がり計算',
    icon: <ListMusic className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'tour_archive',
    label: '歴代ツアー記録',
    shortDesc: 'ツアー別の選曲例とライブ参戦チェック',
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
    label: 'ヒゲダン検定クイズ（全60問）',
    shortDesc: '4択＆1〜4番目並び替え！各20問・全60問の本格検定',
    icon: <HelpCircle className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'quiz_archive',
    label: '出典記事＆トリビア図鑑',
    shortDesc: '解答の根拠になった作品情報・曲別資料',
    icon: <Newspaper className="h-4 w-4 shrink-0" />,
  },
];

export type SiteTab = ActiveFeatureTab | InfoPageId;

interface SiteHeaderProps {
  activeTab: SiteTab;
  onSelectTab: (tab: ActiveFeatureTab) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  activeTab,
  onSelectTab,
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
    <header className="sticky top-0 z-40 border-b border-[#E6E1D6] bg-[#FBF9F5]/95 backdrop-blur-md">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Left: Site Title (Clean Japanese, Zero Decorative English Clutter) */}
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-3 text-left min-w-0 group cursor-pointer"
        >
          <img src={import.meta.env.BASE_URL + 'hige-mark.svg'} alt="" width="36" height="36" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
          <span className="min-w-0">
            <span className="block text-sm sm:text-base font-bold tracking-tight text-[#1C1917] group-hover:text-[#C83E2B] transition-colors min-w-0 wrap-anywhere whitespace-normal">
              115万キロのファンノート
            </span>
            <span className="hidden sm:block text-[11px] text-[#78716C] min-w-0 wrap-anywhere whitespace-normal">
              Official髭男dism 非公式ファンサイト
            </span>
          </span>
        </button>

        {/* Right: Current Section Label + Top-Right Hamburger Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#1C1917]">
            {!isInfoPage(activeTab) && <span className="text-[#C83E2B]">{currentNav.icon}</span>}
            <span>{isInfoPage(activeTab) ? infoPages[activeTab] : currentNav.label}</span>
          </div>

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
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors min-h-[40px] whitespace-nowrap shrink-0 cursor-pointer ${
              isMenuOpen
                ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                : 'border-[#D5CEC2] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]'
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

        {/* Top-Right Vertical Content Menu Panel */}
        {isMenuOpen && (
          <>
            <div
              aria-hidden="true"
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-x-0 top-14 sm:top-16 bottom-0 z-30 bg-[#1C1917]/35 backdrop-blur-[1px]"
            />
            <nav
              id="global-nav-drawer"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButton.current) {
                  setIsMenuOpen(false);
                }
              }}
              aria-label="サイト内メニュー"
              className="fixed sm:absolute right-0 sm:right-6 lg:right-8 top-14 sm:top-16 z-40 w-full sm:w-[400px] max-h-[calc(100vh-4rem)] overflow-y-auto sm:rounded-b-2xl border-b sm:border border-[#D5CEC2] bg-[#FBF9F5] shadow-2xl"
            >
              <div className="p-3.5 sm:p-4">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#E6E1D6] px-1">
                  <span className="text-xs font-bold text-[#1C1917]">
                    コンテンツメニュー（縦一覧）
                  </span>
                  <span className="text-[11px] text-[#78716C]">
                    押すと各画面へ移動します
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
                        className={`group flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                            : 'border-[#E6E1D6] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-[#C83E2B] text-white'
                                : 'bg-[#F2EFE9] text-[#1C1917] group-hover:bg-[#C83E2B] group-hover:text-white'
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
                                <span className="text-[10px] font-medium text-[#F5D0C9] whitespace-nowrap">
                                  · 表示中
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[11px] leading-snug min-w-0 wrap-anywhere whitespace-normal ${
                                isCurrent ? 'text-[#E6E1D6]' : 'text-[#57534E]'
                              }`}
                            >
                              {item.shortDesc}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                            isCurrent
                              ? 'text-[#F5D0C9]'
                              : 'text-[#78716C] group-hover:text-[#1C1917]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 border-t border-[#E6E1D6] pt-2">
                  {Object.entries(infoPages).map(([id, label]) => (
                    <a
                      key={id} href={'#' + id}
                      aria-current={id === activeTab ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-[#F2EFE9] aria-[current=page]:font-bold"
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
