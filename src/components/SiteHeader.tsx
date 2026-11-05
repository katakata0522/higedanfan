import React, { useEffect, useState } from 'react';
import {
  Menu,
  X,
  Home,
  Sparkles,
  Disc,
  ListMusic,
  Heart,
  HelpCircle,
  ArrowUpRight,
  Music4,
} from 'lucide-react';

export type ActiveFeatureTab =
  | 'home'
  | 'mood'
  | 'discography'
  | 'setlist'
  | 'community'
  | 'quiz';

export interface NavMenuItem {
  id: ActiveFeatureTab;
  indexLabel: string;
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
}

export const SITE_NAV_ITEMS: NavMenuItem[] = [
  {
    id: 'home',
    indexLabel: '00',
    label: 'トップページ',
    shortDesc: 'ファンサイト全体の案内・コンテンツ目次',
    icon: <Home className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'mood',
    indexLabel: '01',
    label: 'マイソング診断',
    shortDesc: '3つの質問に1問ずつ答えて今の気分に合う1曲を診断',
    icon: <Sparkles className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'discography',
    indexLabel: '02',
    label: '楽曲ガイド・聖地巡礼',
    shortDesc: '時代別ライナーノーツ解説と松江〜横浜の聖地マップ',
    icon: <Disc className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'setlist',
    indexLabel: '03',
    label: 'マイセトリ・ライブ記録',
    shortDesc: '理想のセットリスト編成と歴代ツアー参戦アーカイブ',
    icon: <ListMusic className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'community',
    indexLabel: '04',
    label: '人気投票・感想ノート',
    shortDesc: '4部門の人気曲ランキング投票と歌詞考察・感想シェア',
    icon: <Heart className="h-4 w-4 shrink-0" />,
  },
  {
    id: 'quiz',
    indexLabel: '05',
    label: 'ヒゲダン検定クイズ',
    shortDesc: 'コース別で挑戦できる歌詞フレーズ＆転調トリビアクイズ',
    icon: <HelpCircle className="h-4 w-4 shrink-0" />,
  },
];

interface SiteHeaderProps {
  activeTab: ActiveFeatureTab;
  onSelectTab: (tab: ActiveFeatureTab) => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Emblem & Single-Line Wordmark */}
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-3 text-left min-w-0 group focus:outline-none cursor-pointer"
        >
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1917] text-[#FBF9F5] group-hover:bg-[#C83E2B] transition-colors">
            <Music4 className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm sm:text-base font-bold tracking-tight text-[#1C1917] group-hover:text-[#C83E2B] transition-colors truncate">
              115万キロのファンノート
            </span>
            <span className="hidden sm:block text-[11px] text-[#78716C] tracking-wide truncate">
              Official髭男dism Unofficial Editorial Archive
            </span>
          </span>
        </button>

        {/* Zone 3: Current Section Indicator + Top-Right Hamburger Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#57534E]">
            <span className="font-mono-num text-[11px] text-[#78716C]">
              {currentNav.indexLabel}
            </span>
            <span aria-hidden="true" className="text-[#D5CEC2]">
              /
            </span>
            <span className="font-bold text-[#1C1917]">{currentNav.label}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
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
      </div>

      {/* Top-Right Hamburger Navigation Drawer & Backdrop */}
      {isMenuOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-x-0 top-14 sm:top-16 bottom-0 z-30 bg-[#1C1917]/40 backdrop-blur-[1px]"
          />
          <nav
            id="global-nav-drawer"
            aria-label="サイト内メニュー"
            className="relative z-40 border-t border-[#E6E1D6] bg-[#FBF9F5] shadow-xl"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E6E1D6]">
                <span className="text-[11px] font-bold tracking-widest uppercase text-[#78716C]">
                  EDITORIAL DIRECTORY · 移動したいページを選択
                </span>
                <span className="text-[11px] text-[#78716C] hidden sm:inline">
                  Escキーまたは枠外クリックで閉じます
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SITE_NAV_ITEMS.map((item) => {
                  const isCurrent = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`group flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#1C1917] bg-[#1C1917] text-[#FBF9F5]'
                          : 'border-[#E6E1D6] bg-white text-[#1C1917] hover:border-[#1C1917] hover:bg-[#F2EFE9]/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono-num text-xs font-bold ${
                            isCurrent
                              ? 'bg-[#C83E2B] text-white'
                              : 'bg-[#F2EFE9] text-[#1C1917] group-hover:bg-[#1C1917] group-hover:text-white transition-colors'
                          }`}
                        >
                          {item.indexLabel}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold truncate">
                              {item.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-medium text-[#F5D0C9] whitespace-nowrap">
                                · 表示中
                              </span>
                            )}
                          </div>
                          <p
                            className={`mt-1 text-xs leading-relaxed ${
                              isCurrent ? 'text-[#E6E1D6]' : 'text-[#57534E]'
                            }`}
                          >
                            {item.shortDesc}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        className={`h-4 w-4 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                          isCurrent ? 'text-[#F5D0C9]' : 'text-[#78716C] group-hover:text-[#1C1917]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};
