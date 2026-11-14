/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HIGEDAN_SONGS, type EraTag } from './data/higedanData';
import { sanitizeUserText } from './utils/fanLogic';
import { HomePage } from './components/home/HomePage';
import {
  KurunIntroOverlay,
  isKurunIntroSeen,
  markKurunIntroSeen,
} from './components/KurunIntroOverlay';
import { useFanRecords } from './hooks/useFanRecords';
import { SiteHeader, ActiveFeatureTab, type SiteTab, SITE_NAV_ITEMS } from './components/SiteHeader';
import { isInfoPage } from './components/info/infoPages';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DiscographySection } from './components/DiscographySection';
import type { QuizSession } from './components/quiz/quizSession';
import type { MoodSession } from './components/mood/moodSession';
import { songPagePath } from './songPages/publishedSongPageIds';
import { PUBLIC_FEATURES } from './config/publicFeatures';
import { clearSongReturnTab, saveSongReturnTab } from './utils/guideReturnState';

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
      const {tab, songId} = readLocation();
      const pagePath = songId ? songPagePath(songId) : null;
      if (pagePath) {
        saveSongReturnTab(tab);
        window.location.replace(`${import.meta.env.BASE_URL}${pagePath}`);
        return;
      }
      clearSongReturnTab();
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
    <div className="min-h-screen flex flex-col notebook-canvas text-[#253331]">
      <KurunIntroOverlay
        isOpen={isIntroOpen}
        replayToken={introReplayToken}
        onClose={handleCloseIntro}
      />
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
      />

      {/* Main Content Area Protected by ErrorBoundary */}
      <ErrorBoundary onResetApp={() => handleSelectTab('home', 'all')}>
        <main id="top" className="flex-1">
          {activeFeatureTab === 'home' ? (
            <HomePage
              songs={songs}
              onSelectTab={handleSelectTab}
              onSelectSong={selectSong}
            />
          ) : isInfoPage(activeFeatureTab) ? (
            <React.Suspense fallback={<p role="status" className="p-5">読み込み中…</p>}>
              <InfoPage
                page={activeFeatureTab}
                onExportRecords={records.downloadRecords}
                onImportRecords={records.importRecords}
                onResetAllUserData={records.resetAllUserData}
              />
            </React.Suspense>
          ) : (
            /* 各コンテンツの画面 */
            <div>

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
                    onBackHome={() => handleSelectTab('home')}
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
                    onReplaceSetlistSilently={records.replaceSetlistSilently}
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

      {/* Clean Archival Notebook Footer */}
      <footer className="border-t border-[#e2d8c5] bg-[#f4efe4]/90 py-8 mt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-1.5 text-xs text-[#57534E]">
          <p className="font-note-serif text-sm font-bold text-[#253331]">
            © 115万キロのファンノート — Official髭男dism 非公式ファンサイト
          </p>
          <p className="leading-relaxed">
            ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
          </p>
          <p className="text-[11px] leading-relaxed text-[#57534E]">
            ※マイセトリや参戦・訪問記録はお使いのブラウザ内に保存されます（書き出し・初期化は<a href="#privacy" className="underline underline-offset-2 hover:text-[#C83E2B]">プライバシーポリシー</a>から行えます）。
          </p>
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
