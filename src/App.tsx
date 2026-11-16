/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HIGEDAN_SONGS, type EraTag } from './data/higedanData';
import { sanitizeUserText } from './utils/fanLogic';
import { CORNER_BY_ID, HOME_PAGE_META, SITE_FULL_TITLE, tabFromPathname } from './config/siteFeatures';
import { HomePage } from './components/home/HomePage';
import {
  KurunIntroOverlay,
  isKurunIntroSeen,
  markKurunIntroSeen,
} from './components/KurunIntroOverlay';
import { useFanRecords } from './hooks/useFanRecords';
import { SiteHeader, ActiveFeatureTab, type SiteTab, SITE_NAV_ITEMS } from './components/SiteHeader';
import { infoPages, infoPageDescriptions, isInfoPage } from './components/info/infoPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiscographySection } from './components/DiscographySection';
import type { QuizSession } from './components/quiz/quizSession';
import { clearStaleQuizSession } from './components/quiz/quizSessionClear';
import type { MoodSession } from './components/mood/moodSession';
import { songPagePath } from './songPages/publishedSongPageIds';
import { PUBLIC_FEATURES } from './config/publicFeatures';
import { clearArchiveReturnState, clearGuideListReturnState, clearGuideReturnState, clearSongReturnTab, clearTourReturnState, saveSongReturnTab } from './utils/guideReturnState';

const MoodFinderSection = React.lazy(() =>
  import('./components/MoodFinderSection').then(module => ({default: module.MoodFinderSection}))
);
const SetlistBuilderSection = React.lazy(() =>
  import('./components/SetlistBuilderSection').then(module => ({default: module.SetlistBuilderSection}))
);
const FanCommunitySection = React.lazy(() =>
  import('./components/FanCommunitySection').then(module => ({default: module.FanCommunitySection}))
);
const QuizSection = React.lazy(() =>
  import('./components/QuizSection').then(module => ({default: module.QuizSection}))
);
const InfoPage = React.lazy(() => import('./components/info/InfoPage'));

const FEATURE_TAB_META: Record<ActiveFeatureTab, { title: string; description: string }> = {
  home: HOME_PAGE_META,
  mood: CORNER_BY_ID.get('mood')!,
  discography: CORNER_BY_ID.get('discography')!,
  vocal_range: CORNER_BY_ID.get('vocal_range')!,
  sacred_map: CORNER_BY_ID.get('sacred_map')!,
  setlist: CORNER_BY_ID.get('setlist')!,
  tour_archive: CORNER_BY_ID.get('tour_archive')!,
  community: {
    title: `人気曲ランキング投票｜${SITE_FULL_TITLE}`,
    description: 'お使いのブラウザ内でOfficial髭男dismの推し曲に投票・記録できるファン投票コーナー。',
  },
  fan_reviews: {
    title: `感想・考察ノート｜${SITE_FULL_TITLE}`,
    description: '好きな曲の感想やライブの思い出をお使いのブラウザ内に書き残せるメモノート。',
  },
  quiz: CORNER_BY_ID.get('quiz')!,
  quiz_archive: CORNER_BY_ID.get('quiz_archive')!,
};

function updateMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

function isUnpublishedHash(feature: string) {
  return (feature === 'community' && !PUBLIC_FEATURES.ranking) ||
    (feature === 'fan_reviews' && !PUBLIC_FEATURES.reviews);
}

function readLocation(): { tab: SiteTab; songId: string | null } {
  const [feature, song] = window.location.hash.slice(1).split('/');
  if (feature) {
    if (isUnpublishedHash(feature)) return {tab: 'home' as const, songId: null};
    if (isInfoPage(feature)) return {tab: feature, songId: null};
    const tab = SITE_NAV_ITEMS.find(item => item.id === feature)?.id ?? 'home';
    const songId = HIGEDAN_SONGS.find(item => item.id === song)?.id ?? null;
    return {tab, songId};
  }
  const initialDataTab = typeof document !== 'undefined'
    ? document.getElementById('root')?.dataset.initialTab
    : undefined;
  if (initialDataTab && SITE_NAV_ITEMS.some(item => item.id === initialDataTab)) {
    return { tab: initialDataTab as ActiveFeatureTab, songId: null };
  }
  const pathTab = tabFromPathname(window.location.pathname, import.meta.env.BASE_URL);
  return { tab: pathTab ?? 'home', songId: null };
}

export default function App() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<SiteTab>(() => readLocation().tab);
  const prevTabRef = React.useRef<SiteTab>(activeFeatureTab);
  const pendingFocusTabRef = React.useRef<SiteTab | null>(null);
  const mainRef = React.useRef<HTMLElement>(null);
  const [discographyEraPreset, setDiscographyEraPreset] = useState<EraTag | 'all'>('all');
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('intro') === '1') return true;
    const initial = readLocation();
    return initial.tab === 'home' && !initial.songId && !isKurunIntroSeen();
  });
  const [introReplayToken, setIntroReplayToken] = useState(0);

  const handleCloseIntro = React.useCallback(() => {
    markKurunIntroSeen();
    setIsIntroOpen(false);
  }, []);

  const handleReplayIntro = React.useCallback(() => {
    setIntroReplayToken((n) => n + 1);
    setIsIntroOpen(true);
  }, []);

  const toastTimerRef = React.useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    const safeMsg = sanitizeUserText(msg, 120);
    setToastMessage(safeMsg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  useEffect(() => {
    const restore = () => {
      if (isUnpublishedHash(window.location.hash.slice(1).split('/')[0])) {
        window.history.replaceState(null, '', '#home');
      }
      if (
        window.location.hash.length > 1 &&
        window.location.pathname !== import.meta.env.BASE_URL &&
        tabFromPathname(window.location.pathname, import.meta.env.BASE_URL)
      ) {
        window.history.replaceState(null, '', `${import.meta.env.BASE_URL}${window.location.hash}`);
      }
      const {tab, songId} = readLocation();
      const pagePath = songId ? songPagePath(songId) : null;
      if (pagePath) {
        saveSongReturnTab(tab);
        window.location.replace(`${import.meta.env.BASE_URL}${pagePath}`);
        return;
      }
      if (tab !== 'discography' && tab !== 'vocal_range' && tab !== 'quiz_archive' && tab !== 'tour_archive') {
        clearGuideReturnState();
      } else {
        clearSongReturnTab();
        if (tab === 'quiz_archive') {
          clearGuideListReturnState();
          clearTourReturnState();
        } else if (tab === 'tour_archive') {
          clearGuideListReturnState();
          clearArchiveReturnState();
        } else {
          clearArchiveReturnState();
          clearTourReturnState();
        }
      }
      const tabChanged = prevTabRef.current !== tab;
      prevTabRef.current = tab;
      if (tabChanged && !songId) {
        pendingFocusTabRef.current = tab;
      }
      setActiveFeatureTab(tab);
      if (tabChanged && !songId) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('hashchange', restore);
    restore();
    return () => window.removeEventListener('hashchange', restore);
  }, []);

  const selectSong = (id: string | null) => {
    const editorialPath = id ? songPagePath(id) : null;
    if (editorialPath) {
      saveSongReturnTab(activeFeatureTab);
      window.location.assign(`${import.meta.env.BASE_URL}${editorialPath}`);
      return;
    }
    if (id === null) {
      if (window.history.state?.songParent === activeFeatureTab) {
        window.history.back();
        return;
      }
      window.history.replaceState(null, '', '#' + activeFeatureTab);
    } else {
      window.history.pushState({songParent: activeFeatureTab}, '', '#' + activeFeatureTab + '/' + id);
    }
  };

  const handleSelectTab = (tab: ActiveFeatureTab, eraPreset: EraTag | 'all' = 'all') => {
    clearGuideReturnState();
    prevTabRef.current = tab;
    pendingFocusTabRef.current = tab;
    setDiscographyEraPreset(eraPreset);
    setActiveFeatureTab(tab);
    if (window.location.pathname !== import.meta.env.BASE_URL) {
      window.history.replaceState(null, '', `${import.meta.env.BASE_URL}#${tab}`);
    } else {
      window.location.hash = tab;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const meta = isInfoPage(activeFeatureTab)
      ? {
          title: `${infoPages[activeFeatureTab]}｜115万キロのファンノート — Official髭男dism 非公式ファンサイト`,
          description: infoPageDescriptions[activeFeatureTab],
        }
      : FEATURE_TAB_META[activeFeatureTab];
    document.title = meta.title;
    updateMetaContent('meta[name="description"]', meta.description);
    updateMetaContent('meta[property="og:title"]', meta.title);
    updateMetaContent('meta[property="og:description"]', meta.description);
    updateMetaContent('meta[name="twitter:title"]', meta.title);
    updateMetaContent('meta[name="twitter:description"]', meta.description);
  }, [activeFeatureTab]);

  const records = useFanRecords(showToast);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  useEffect(() => {
    if (pendingFocusTabRef.current !== activeFeatureTab || isIntroOpen || isMenuOpen) return undefined;
    let attempts = 0;
    let timerId: number | null = null;
    const focusHeadingOrMain = () => {
      const container = mainRef.current;
      if (!container) return;
      const heading = container.querySelector<HTMLElement>('h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
        pendingFocusTabRef.current = null;
        return;
      }
      if (attempts < 15) {
        attempts += 1;
        timerId = window.setTimeout(focusHeadingOrMain, 50);
      } else {
        container.focus({ preventScroll: true });
        pendingFocusTabRef.current = null;
      }
    };
    const rafId = window.requestAnimationFrame(focusHeadingOrMain);
    return () => {
      window.cancelAnimationFrame(rafId);
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, [activeFeatureTab, isIntroOpen, isMenuOpen]);
  const quizSession = React.useMemo<{current: QuizSession | null}>(() => ({current: null}), [records.resetEpoch]);
  const moodSession = React.useMemo<{current: MoodSession | null}>(() => ({current: null}), [records.resetEpoch]);
  const { songs, setlist, votedKeys } = records;

  useEffect(() => {
    if (!records.resetEpoch) return;
    const epoch = records.resetEpoch;
    clearStaleQuizSession(epoch);
    void import('./components/mood/moodSession').then(({ clearStaleMoodSession }) => clearStaleMoodSession(epoch));
    void import('./utils/savedSetlists').then(({ clearStaleSavedSetlists }) => clearStaleSavedSetlists(epoch));
  }, [records.resetEpoch]);

  const setlistSongIds = setlist.map((s) => s.songId);

  return (
    <div className="min-h-screen flex flex-col notebook-canvas text-[#253331]">
      <KurunIntroOverlay
        isOpen={isIntroOpen}
        replayToken={introReplayToken}
        onClose={handleCloseIntro}
      />
      <div
        className="flex flex-1 flex-col"
        aria-hidden={isIntroOpen || undefined}
        inert={isIntroOpen || undefined}
      >
      <a href="#top" className="skip-link">本文へ移動</a>
      {records.storageNotice && (
        <p role="alert" className="bg-amber-100 p-3 text-sm">
          {records.storageNotice}{' '}
          <button className="underline" onClick={records.downloadRecords}>画面上の記録を書き出す</button>
        </p>
      )}
      <SiteHeader
        activeTab={activeFeatureTab}
        onSelectTab={handleSelectTab}
        onReplayIntro={handleReplayIntro}
        onMenuOpenChange={setIsMenuOpen}
      />

      {/* Main Content Area Protected by ErrorBoundary */}
      <ErrorBoundary onResetApp={() => handleSelectTab('home', 'all')}>
        <main
          ref={mainRef}
          id="top"
          tabIndex={-1}
          aria-hidden={isMenuOpen || undefined}
          inert={isIntroOpen || isMenuOpen || undefined}
          className="flex-1 outline-none"
        >
          {activeFeatureTab === 'home' ? (
            <HomePage
              songs={songs}
              onSelectTab={handleSelectTab}
              onSelectSong={selectSong}
            />
          ) : isInfoPage(activeFeatureTab) ? (
            <React.Suspense fallback={<div role="status" aria-label="読み込み中" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 min-h-[50vh]"><span className="sr-only">読み込み中…</span></div>}>
              <InfoPage
                page={activeFeatureTab}
                onExportRecords={records.downloadRecords}
                onImportRecords={records.importRecords}
                onResetAllUserData={records.resetAllUserData}
                onBackHome={() => handleSelectTab('home')}
              />
            </React.Suspense>
          ) : (
            /* 各コンテンツの画面 */
            <div>

              <React.Suspense fallback={<div role="status" aria-label="読み込み中" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 min-h-[50vh]"><span className="sr-only">読み込み中…</span></div>}>
                {activeFeatureTab === 'mood' && (
                  <MoodFinderSection
                    key={records.resetEpoch}
                    resetEpoch={records.resetEpoch}
                    sessionRef={moodSession}
                    songs={songs}
                    onSelectSong={(song) => selectSong(song.id)}
                    onAddToSetlist={records.addToSetlist}
                    setlistSongIds={setlistSongIds}
                    onBackHome={() => handleSelectTab('home')}
                  />
                )}

                {(activeFeatureTab === 'discography' ||
                  activeFeatureTab === 'vocal_range' ||
                  activeFeatureTab === 'sacred_map') && (
                  <DiscographySection
                    songs={songs}
                    onSelectSong={(song) => selectSong(song.id)}
                    onAddToSetlist={records.addToSetlist}
                    setlistSongIds={setlistSongIds}
                    visitedSpotIds={records.visitedSpotIds}
                    onToggleVisitedSpot={records.toggleVisitedSpot}
                    initialSubView={
                      activeFeatureTab === 'sacred_map'
                        ? 'sacred_map'
                        : activeFeatureTab === 'vocal_range'
                        ? 'vocal_range'
                        : 'discography'
                    }
                    initialEraFilter={discographyEraPreset}
                    onBackHome={() => handleSelectTab('home')}
                  />
                )}

                {(activeFeatureTab === 'setlist' ||
                  activeFeatureTab === 'tour_archive') && (
                  <SetlistBuilderSection
                    key={`${activeFeatureTab === 'tour_archive' ? 'tours' : 'builder'}:${records.resetEpoch}`}
                    songs={songs}
                    setlist={setlist}
                    setlistTitle={records.setlistTitle}
                    resetEpoch={records.resetEpoch}
                    onChangeTitle={records.changeTitle}
                    onAddSong={records.addToSetlist}
                    onRemoveSong={records.removeFromSetlist}
                    onMoveSong={records.moveSetlistSong}
                    onToggleEncore={records.toggleEncore}
                    onLoadPresetSetlist={records.loadPresetSetlist}
                    onCreateSetlistFromTour={(entries, title) => {
                      if (records.loadPresetSetlist(entries, title, { skipConfirm: true })) {
                        handleSelectTab('setlist');
                      }
                    }}
                    onReplaceSetlistSilently={records.replaceSetlistSilently}
                    attendedTourIds={records.attendedTourIds}
                    onToggleAttendedTour={records.toggleAttendedTour}
                    onExportRecords={records.downloadRecords}
                    onImportRecords={records.importRecords}
                    onSelectSong={(song) => selectSong(song.id)}
                    initialSubTab={
                      activeFeatureTab === 'tour_archive' ? 'tours' : 'builder'
                    }
                    onBackHome={() => handleSelectTab('home')}
                  />
                )}

                {(PUBLIC_FEATURES.ranking || PUBLIC_FEATURES.reviews) && (activeFeatureTab === 'community' ||
                  activeFeatureTab === 'fan_reviews') && (
                  <FanCommunitySection
                    key={records.resetEpoch}
                    songs={songs}
                    votedSongIds={votedKeys}
                    onVoteSong={records.voteSong}
                    onSelectSong={(song) => selectSong(song.id)}
                    reviews={records.reviews}
                    likedReviewIds={records.likedReviewIds}
                    onLikeReview={records.likeReview}
                    onSubmitReview={records.submitReview}
                    onExportRecords={records.downloadRecords}
                    storageNotice={records.storageNotice}
                    onEditReview={records.editReview}
                    onDeleteReview={records.deleteReview}
                    initialSubTab={
                      activeFeatureTab === 'fan_reviews' ? 'reviews' : 'ranking'
                    }
                  />
                )}

                {(activeFeatureTab === 'quiz' ||
                  activeFeatureTab === 'quiz_archive') && (
                  <QuizSection
                    key={records.resetEpoch}
                    resetEpoch={records.resetEpoch}
                    sessionRef={quizSession}
                    songs={songs}
                    onSelectSong={(song) => selectSong(song.id)}
                    initialTab={
                      activeFeatureTab === 'quiz_archive' ? 'archive' : 'quiz'
                    }
                    onBackHome={() => handleSelectTab('home')}
                    bestQuizScore={records.bestQuizScore}
                    onUpdateBestScore={records.updateBestQuizScore}
                  />
                )}
              </React.Suspense>
            </div>
          )}
        </main>
      </ErrorBoundary>

      {/* Clean Archival Notebook Footer */}
      <footer
        aria-hidden={isMenuOpen || undefined}
        inert={isIntroOpen || isMenuOpen || undefined}
        className="border-t border-[#e2d8c5] bg-[#f4efe4]/90 py-8 mt-8"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-1.5 text-xs text-[#57534E]">
          <p className="font-note-serif text-sm font-bold text-[#253331]">
            © 115万キロのファンノート — Official髭男dism 非公式ファンサイト
          </p>
          <p className="leading-relaxed">
            ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
          </p>
          <p className="text-[11px] leading-relaxed text-[#57534E]">
            ※MYセトリや参戦・訪問記録はお使いのブラウザ内に保存されます（書き出し・初期化は<a href="#privacy" className="inline-flex min-h-[28px] items-center py-0.5 underline underline-offset-2 hover:text-[#C83E2B]">プライバシーポリシー</a>から行えます）。
          </p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 rounded-lg border border-[#1C1917] bg-[#1C1917] px-4 py-3 text-xs font-bold text-[#FBF9F5] shadow-lg"
        >
          {toastMessage}
        </div>
      )}
      </div>
    </div>
  );
}
