/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, RotateCcw, ShieldCheck } from 'lucide-react';
import { HIGEDAN_SONGS, type EraTag } from './data/higedanData';
import { sanitizeUserText } from './utils/fanLogic';
import { HomePage } from './components/home/HomePage';
import { useFanRecords } from './hooks/useFanRecords';
import { SiteHeader, ActiveFeatureTab, type SiteTab, SITE_NAV_ITEMS } from './components/SiteHeader';
import { infoPages, isInfoPage } from './components/info/infoPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiscographySection } from './components/DiscographySection';
import type { QuizSession } from './components/quiz/quizSession';
import type { MoodSession } from './components/mood/moodSession';
import { songPagePath } from './songPages/publishedSongPageIds';
import { PUBLIC_FEATURES } from './config/publicFeatures';

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
const SongDetailModal = React.lazy(() =>
  import('./components/SongDetailModal').then(module => ({default: module.SongDetailModal}))
);

function isUnpublishedHash(feature: string) {
  return (feature === 'community' && !PUBLIC_FEATURES.ranking) ||
    (feature === 'fan_reviews' && !PUBLIC_FEATURES.reviews);
}

function readLocation() {
  const [feature, song] = window.location.hash.slice(1).split('/');
  if (isUnpublishedHash(feature)) return {tab: 'home' as const, songId: null};
  if (isInfoPage(feature)) return {tab: feature, songId: null};
  const tab = SITE_NAV_ITEMS.find(item => item.id === feature)?.id ?? 'home';
  const songId = HIGEDAN_SONGS.find(item => item.id === song)?.id ?? null;
  return {tab, songId};
}

export default function App() {
  const [selectedModalSongId, setSelectedModalSongId] = useState<string | null>(() => readLocation().songId);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<SiteTab>(() => readLocation().tab);
  const [discographyEraPreset, setDiscographyEraPreset] = useState<EraTag | 'all'>('all');

  const toastTimerRef = React.useRef<number | null>(null);
  const featureNavRef = React.useRef<HTMLElement | null>(null);
  const activeFeatureRef = React.useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const revealCurrentFeature = () => {
      const nav = featureNavRef.current;
      const focused = document.activeElement;
      const current = nav && focused instanceof HTMLButtonElement && nav.contains(focused) && focused.matches(':focus-visible')
        ? focused
        : activeFeatureRef.current;
      if (!nav || !current) return;
      const bounds = nav.getBoundingClientRect();
      const item = current.getBoundingClientRect();
      const padding = 8;
      const home = nav.querySelector<HTMLElement>('[data-feature-home]');
      const homeWidth = home && getComputedStyle(home).position === 'sticky' ? home.getBoundingClientRect().width : 0;
      const visibleLeft = bounds.left + padding + homeWidth;
      const delta = item.left < visibleLeft || item.right > bounds.right - padding
        ? item.left - visibleLeft
        : 0;
      if (delta) nav.scrollLeft += delta;
    };
    revealCurrentFeature();
    window.addEventListener('resize', revealCurrentFeature);
    return () => window.removeEventListener('resize', revealCurrentFeature);
  }, [activeFeatureTab]);

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
      const {tab, songId} = readLocation();
      const pagePath = songId ? songPagePath(songId) : null;
      if (pagePath) {
        window.location.replace(`${import.meta.env.BASE_URL}${pagePath}`);
        return;
      }
      setActiveFeatureTab(tab);
      setSelectedModalSongId(songId);
    };
    window.addEventListener('hashchange', restore);
    restore();
    return () => window.removeEventListener('hashchange', restore);
  }, []);

  const selectSong = (id: string | null) => {
    const editorialPath = id ? songPagePath(id) : null;
    if (editorialPath) {
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
    setSelectedModalSongId(id);
  };

  const handleSelectTab = (tab: ActiveFeatureTab, eraPreset: EraTag | 'all' = 'all') => {
    setDiscographyEraPreset(eraPreset);
    setActiveFeatureTab(tab);
    setSelectedModalSongId(null);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const records = useFanRecords(showToast);
  const quizSession = React.useMemo<{current: QuizSession | null}>(() => ({current: null}), [records.resetEpoch]);
  const moodSession = React.useMemo<{current: MoodSession | null}>(() => ({current: null}), [records.resetEpoch]);
  const { songs, setlist, votedKeys } = records;

  useEffect(() => {
    if (!records.resetEpoch) return;
    const epoch = records.resetEpoch;
    void import('./components/quiz/quizSessionStorage').then(({ clearStaleQuizSession }) => clearStaleQuizSession(epoch));
    void import('./components/mood/moodSession').then(({ clearStaleMoodSession }) => clearStaleMoodSession(epoch));
  }, [records.resetEpoch]);

  const modalSong = selectedModalSongId
    ? songs.find((s) => s.id === selectedModalSongId) || null
    : null;

  const setlistSongIds = setlist.map((s) => s.songId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {records.storageNotice && (
        <p role="alert" className="bg-amber-100 p-3 text-sm">
          {records.storageNotice}{' '}
          <button className="underline" onClick={records.downloadRecords}>画面上の記録を書き出す</button>
        </p>
      )}
      <SiteHeader
        activeTab={activeFeatureTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main Content Area Protected by ErrorBoundary */}
      <ErrorBoundary onResetApp={() => handleSelectTab('home', 'all')}>
        <main id="top" className="flex-1">
          {activeFeatureTab === 'home' ? (
            <HomePage songs={songs} onSelectTab={handleSelectTab} onSelectSong={selectSong} />
          ) : isInfoPage(activeFeatureTab) ? (
            <React.Suspense fallback={<p role="status" className="p-5">読み込み中…</p>}>
              <InfoPage page={activeFeatureTab} />
            </React.Suspense>
          ) : (
            /* Feature Screen View with Direct Cross-Feature Switch Bar */
            <div>
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-3.5">
                <nav
                  aria-label="コーナー切り替えナビゲーション"
                  ref={featureNavRef}
                  className="flex items-center gap-1.5 overflow-x-auto [scroll-padding-left:5.75rem] sm:[scroll-padding-left:0px] sm:flex-wrap rounded-xl border border-[#E6E1D6] bg-white p-1.5 sm:p-2"
                >
                  <button
                    type="button"
                    data-feature-home
                    onClick={() => handleSelectTab('home', 'all')}
                    className="sticky left-0 z-10 sm:static inline-flex items-center gap-1 rounded-lg border border-[#D5CEC2] bg-[#FBF9F5] px-3 py-1.5 text-xs font-bold text-[#1C1917] shadow-[-10px_0_0_0_#fff] sm:shadow-none hover:border-[#1C1917] hover:bg-[#F2EFE9] transition-colors cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    トップへ
                  </button>

                  <span aria-hidden="true" className="text-[#D5CEC2] px-0.5 hidden sm:inline">
                    |
                  </span>

                  {(
                    [
                      { id: 'mood', label: 'マイソング診断' },
                      { id: 'discography', label: '楽曲ガイド(90曲)' },
                      { id: 'vocal_range', label: '音域・発売日表' },
                      { id: 'sacred_map', label: '聖地マップ' },
                      { id: 'setlist', label: 'マイセトリ作成' },
                      { id: 'tour_archive', label: '歴代ツアー記録' },
                      ...(PUBLIC_FEATURES.ranking ? [{ id: 'community' as const, label: '人気曲投票' }] : []),
                      ...(PUBLIC_FEATURES.reviews ? [{ id: 'fan_reviews' as const, label: '感想ノート' }] : []),
                      { id: 'quiz', label: '検定クイズ(60問)' },
                      { id: 'quiz_archive', label: '出典図鑑' },
                    ] as { id: ActiveFeatureTab; label: string }[]
                  ).map((navItem) => {
                    const isCurrent = activeFeatureTab === navItem.id;
                    return (
                      <button
                        key={navItem.id}
                        type="button"
                        ref={isCurrent ? activeFeatureRef : undefined}
                        aria-current={isCurrent ? 'page' : undefined}
                        onClick={() => handleSelectTab(navItem.id, 'all')}
                        className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#1C1917] text-[#FBF9F5]'
                            : 'text-[#57534E] hover:bg-[#F2EFE9] hover:text-[#1C1917]'
                        }`}
                      >
                        {navItem.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <React.Suspense fallback={<p role="status" className="p-5">読み込み中…</p>}>
                {activeFeatureTab === 'mood' && (
                  <MoodFinderSection
                    key={records.resetEpoch}
                    resetEpoch={records.resetEpoch}
                    sessionRef={moodSession}
                    songs={songs}
                    onSelectSong={(song) => selectSong(song.id)}
                    onAddToSetlist={records.addToSetlist}
                    setlistSongIds={setlistSongIds}
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
                  />
                )}

                {(activeFeatureTab === 'setlist' ||
                  activeFeatureTab === 'tour_archive') && (
                  <SetlistBuilderSection
                    songs={songs}
                    setlist={setlist}
                    setlistTitle={records.setlistTitle}
                    onChangeTitle={records.changeTitle}
                    onAddSong={records.addToSetlist}
                    onRemoveSong={records.removeFromSetlist}
                    onMoveSong={records.moveSetlistSong}
                    onToggleEncore={records.toggleEncore}
                    onLoadPresetSetlist={records.loadPresetSetlist}
                    attendedTourIds={records.attendedTourIds}
                    onToggleAttendedTour={records.toggleAttendedTour}
                    onExportRecords={records.downloadRecords}
                    onImportRecords={records.importRecords}
                    onSelectSong={(song) => selectSong(song.id)}
                    initialSubTab={
                      activeFeatureTab === 'tour_archive' ? 'tours' : 'builder'
                    }
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
                  />
                )}
              </React.Suspense>
            </div>
          )}
        </main>
      </ErrorBoundary>

      {/* Clean Archival Footer */}
      <footer className="border-t border-[#E6E1D6] bg-[#F2EFE9] py-7 mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-[#57534E]">
          <div className="space-y-1.5">
            <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
              <span>サイト作成者</span>
              <a href="https://katakatalab.com/who-is-katakata.html" rel="author" className="inline-block py-1 font-bold text-[#1C1917] underline underline-offset-4">
                かたかた<span className="sr-only">のプロフィール</span>
              </a>
            </p>
            <nav aria-label="サイト情報" className="flex flex-wrap gap-x-4">
              {Object.entries(infoPages).map(([id, label]) => (
                <a key={id} href={'#' + id} className="py-1 underline">{label}</a>
              ))}
            </nav>
            <p className="font-bold text-[#1C1917]">
              115万キロのファンノート — Official髭男dism 非公式ファンサイト
            </p>
            <p>
              <a href="https://katakatalab.com/" className="underline">KatakataLab トップ</a> ／ ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#57534E]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
              <span>
                マイセトリや参戦・訪問記録は、このブラウザ内に保存されます。非公開中の投票・感想も、過去の保存分は初期化するまで残ります。
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={records.resetAllUserData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEC2] bg-white px-3.5 py-2 text-xs font-bold text-[#1C1917] hover:border-[#1C1917] hover:bg-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#57534E]" />
              このブラウザの保存記録をすべて初期化
            </button>
          </div>
        </div>
      </footer>

      {/* Song Liner Notes Modal */}
      {modalSong && <React.Suspense fallback={null}><SongDetailModal
        song={modalSong}
        onClose={() => selectSong(null)}
        onAddToSetlist={records.addToSetlist}
        isInSetlist={modalSong ? setlistSongIds.includes(modalSong.id) : false}
        onVoteSong={records.voteSong}
        hasVoted={
          modalSong ? votedKeys.includes(`${modalSong.id}:overall`) : false
        }
      /></React.Suspense>}

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
  );
}
