/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { HIGEDAN_SONGS, SACRED_SPOTS, type EraTag } from './data/higedanData';
import { sanitizeUserText } from './utils/fanLogic';
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
  home: {
    title: '115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dismの楽曲ガイド・音域一覧、今日の1曲診断、聖地巡礼マップ、MYセトリ作成、歴代ツアー公演記録、Official髭男dism検定を楽しめる非公式ファンサイト。',
  },
  mood: {
    title: '今日の1曲診断｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: '5つの質問から今の気分にぴったりのOfficial髭男dismの3曲を診断。曲調や聴きどころとあわせて楽しめます。',
  },
  discography: {
    title: '楽曲ガイド（全90曲）｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dismの全90曲を網羅した楽曲ガイド。タイアップ・収録アルバム・演奏時間・音域・曲別解説を検索できます。',
  },
  vocal_range: {
    title: '音域一覧・カラオケ選曲ガイド｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dism全90曲の地声最高音・ファルセット最高音・最低音を一覧比較。カラオケで歌いやすい曲探しもできます。',
  },
  sacred_map: {
    title: '聖地巡礼マップ｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: `島根・松江・米子から東京・海外ロケ地まで、Official髭男dismゆかりの聖地${SACRED_SPOTS.length}か所を地図とエピソードで辿る巡礼ガイド。`,
  },
  setlist: {
    title: 'MYセトリ作成｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dismの楽曲で自分だけの理想のライブセットリストを作成。本編・アンコール構成や合計演奏時間を自動計算します。',
  },
  tour_archive: {
    title: '歴代ツアー・公演記録｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dismの2015年以降のワンマンツアー・単独公演・配信ライブの日程・会場とセットリスト記録を年代順に辿れます。',
  },
  community: {
    title: '人気曲ランキング投票｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'お使いのブラウザ内でOfficial髭男dismの推し曲に投票・記録できるファン投票コーナー。',
  },
  fan_reviews: {
    title: '感想・考察ノート｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: '好きな曲の感想やライブの思い出をお使いのブラウザ内に書き残せるメモノート。',
  },
  quiz: {
    title: 'Official髭男dism検定｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: '楽曲エピソードから制作秘話まで、解説と出典を読みながらOfficial髭男dismの歩みを楽しく深掘りできる検定コーナー。',
  },
  quiz_archive: {
    title: '参考記事・インタビュー｜115万キロのファンノート — Official髭男dism 非公式ファンサイト',
    description: 'Official髭男dismの楽曲ガイドや検定で参照した公式インタビュー、ディスクレビュー、メディア記事を媒体・曲名別に探せる資料集。',
  },
};

function updateMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content);
}

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<SiteTab>(() => readLocation().tab);
  const prevTabRef = React.useRef<SiteTab>(activeFeatureTab);
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
    setDiscographyEraPreset(eraPreset);
    setActiveFeatureTab(tab);
    window.location.hash = tab;
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
            <React.Suspense fallback={<p role="status" className="p-5">読み込み中…</p>}>
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
