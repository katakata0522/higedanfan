import { Fragment, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, ExternalLink, Menu, NotebookPen, Play, Plus } from 'lucide-react';
import { verifiedSongs as HIGEDAN_SONGS } from '../data/fullCatalogSongs';
import { songEvidence } from '../data/fullCatalogSongs';
import { useFanRecords } from '../hooks/useFanRecords';
import { formatSongBpm, formatDuration } from '../utils/format';
import { tempoAlternatives } from '../data/tempoAlternatives';
import { isTempoUnderReview } from '../data/tempoReviewStatus';
import { songReturnDestination } from '../utils/songReturnTab';
import { tabPath } from '../config/siteFeatures';
import { SITE_NAV_ITEMS } from '../components/SiteHeader';
import { infoPages } from '../components/info/infoPages';
import {
  officialVideoDescription,
  officialVideoId,
  officialVideos,
  relatedSongs,
  youtubeExternalOnlySongs,
} from './songConnections';
import { songAppleArtwork } from '../data/songAppleArtwork';
import { getQuoteSizeTier, splitCreditChunks, splitQuoteLinePhrases } from './quoteTypography';
import { formatAlbumDisplayName } from '../utils/songCatalog';
import { recordMyNoteSongRead } from '../utils/myNoteProfile';
import { usePwaInstallAction } from '../utils/pwaInstall';
import { MustacheMark } from '../components/MustacheMark';
import { writeQuickAddSetlistId } from '../utils/quickAddSession';
import { songPagePath } from './publishedSongPageIds';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { EditorialSongPageData } from './EditorialSongPageData';

const MyNoteModal = lazy(() =>
  import('../components/MyNoteModal').then(module => ({ default: module.MyNoteModal }))
);

const KurunIntroOverlay = lazy(() =>
  import('../components/KurunIntroOverlay').then(module => ({ default: module.KurunIntroOverlay }))
);

const base = import.meta.env.BASE_URL;

export function EditorialSongPage({ page }: { page: EditorialSongPageData }) {
  const song = HIGEDAN_SONGS.find(item => item.id === page.id)!;
  const fact = songEvidence[page.id as keyof typeof songEvidence];
  const appleArtwork = songAppleArtwork[page.id];
  const otherTempos = tempoAlternatives[page.id];
  const tempoUnderReview = isTempoUnderReview(page.id);
  const quoteTier = page.feature.kind === 'lyric-quote' ? getQuoteSizeTier(page.feature.text) : null;
  const quoteLines = page.feature.kind === 'lyric-quote'
    ? page.feature.text.split('\n').map(splitQuoteLinePhrases)
    : [];
  const creditParts = splitCreditChunks(page.feature.credit);
  const related = relatedSongs(page.id);
  const video = officialVideos[page.id];
  const videoId = officialVideoId(page.id);
  const videoDescription = officialVideoDescription(page.id);
  const isExternalOnlyVideo = Boolean(videoId && youtubeExternalOnlySongs.has(page.id));
  const [toast, setToast] = useState<string | null>(null);
  const [readable, setReadable] = useState(false);
  const [artworkFailed, setArtworkFailed] = useState(false);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [hasOpenedIntro, setHasOpenedIntro] = useState(false);
  const [introReplayToken, setIntroReplayToken] = useState(0);
  const handleCloseIntro = useCallback(() => setIsIntroOpen(false), []);
  const [hasLoadedMyNote, setHasLoadedMyNote] = useState(false);
  const [isMyNoteOpen, setIsMyNoteOpen] = useState(false);
  const sourcesRef = useRef<HTMLDetailsElement>(null);
  const siteMenuRef = useRef<HTMLDetailsElement>(null);
  const toastTimer = useRef<number | null>(null);
  const showBanner = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);
  const records = useFanRecords(showBanner);
  const handleInstallAccepted = useCallback(() => {
    siteMenuRef.current?.removeAttribute('open');
    siteMenuRef.current?.querySelector('summary')?.focus();
  }, []);
  const pwaInstall = usePwaInstallAction({
    onFeedback: showBanner,
    onAccepted: handleInstallAccepted,
  });
  const handleInstallClick = pwaInstall.triggerInstall;
  const inSetlist = records.setlist.some(item => item.songId === song.id);
  const [returnDest] = useState(songReturnDestination);

  useEffect(() => {
    setArtworkFailed(false);
    setIsPlayerLoaded(false);
  }, [page.id]);

  useEffect(() => {
    recordMyNoteSongRead(page.id, records.resetEpoch);
  }, [page.id, records.resetEpoch]);

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        siteMenuRef.current?.open &&
        event.target instanceof Node &&
        !siteMenuRef.current.contains(event.target)
      ) {
        siteMenuRef.current.open = false;
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <div className="song-page">
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          {hasOpenedIntro && (
            <KurunIntroOverlay
              isOpen={isIntroOpen}
              replayToken={introReplayToken}
              onClose={handleCloseIntro}
            />
          )}
        </Suspense>
      </ErrorBoundary>
      <a className="skip-link" href="#main" aria-hidden={isIntroOpen || undefined} inert={isIntroOpen || undefined}>本文へ移動</a>
      <header className="site-topbar" aria-hidden={isIntroOpen || undefined} inert={isIntroOpen || undefined}>
        <div className="site-topbar-inner">
          <a className="site-brand" href={base}>
            <MustacheMark className="site-brand-logo" />
            <span className="site-brand-text">
              <span className="site-brand-title">
                <span>115万キロの</span><wbr /><span>ファンノート</span>
              </span>
              {' '}
              <span className="site-brand-sub">Official髭男dism 非公式ファンサイト</span>
              <span className="sr-only"> トップへ</span>
            </span>
          </a>
          <div className="site-topbar-actions">
            <button
              type="button"
              className="song-mynote-btn"
              aria-haspopup="dialog"
              aria-expanded={isMyNoteOpen}
              onClick={() => {
                siteMenuRef.current?.removeAttribute('open');
                setHasLoadedMyNote(true);
                setIsMyNoteOpen(true);
              }}
            >
              <NotebookPen className="song-menu-trigger-icon song-mynote-icon" aria-hidden="true" />
              <span>マイノート</span>
            </button>

            <details className="song-site-menu" ref={siteMenuRef}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                siteMenuRef.current?.removeAttribute('open');
                siteMenuRef.current?.querySelector('summary')?.focus();
              }
            }}>
            <summary aria-label="サイト内メニュー">
              <Menu className="song-menu-trigger-icon" aria-hidden="true" />
              <span className="song-menu-trigger-label">メニュー</span>
            </summary>
            <nav className="song-menu-panel" aria-label="サイト内メニュー">
              <div className="song-menu-header">
                <span className="song-menu-heading">ファンノートの目次</span>
                <span className="song-menu-note">コーナー一覧</span>
              </div>
              <div className="song-menu-items">
                {SITE_NAV_ITEMS.map(item => (
                  <a key={item.id} className="song-menu-card" href={tabPath(item.id, base)}>
                    <span className="song-menu-icon">{item.icon}</span>
                    <span className="song-menu-copy">
                      <span className="song-menu-label">{item.label}</span>
                      <span className="song-menu-desc">{item.shortDesc}</span>
                    </span>
                    <ChevronRight className="song-menu-chevron" aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="song-menu-footer">
                <button
                  id="kurun-replay-btn"
                  type="button"
                  className="song-menu-sublink"
                  onClick={() => {
                    siteMenuRef.current?.removeAttribute('open');
                    setHasOpenedIntro(true);
                    setIntroReplayToken(token => token + 1);
                    setIsIntroOpen(true);
                  }}
                >
                  オープニングをもう一度見る
                </button>
                {pwaInstall.canInstall && (
                  <button
                    id="pwa-install-btn"
                    type="button"
                    className="song-menu-sublink"
                    aria-disabled={pwaInstall.isInstalling ? 'true' : undefined}
                    onClick={() => {
                      void handleInstallClick();
                    }}
                  >
                    スマホアプリとしてインストール
                  </button>
                )}
                <div className="song-menu-info-grid">
                  {Object.entries(infoPages).map(([id, label]) => (
                    <a key={id} className="song-menu-sublink" href={tabPath(id, base)}>{label}</a>
                  ))}
                </div>
                <button
                  className="reading-toggle"
                  type="button"
                  aria-pressed={readable}
                  onClick={() => {
                    setReadable(value => !value);
                    siteMenuRef.current?.removeAttribute('open');
                    siteMenuRef.current?.querySelector('summary')?.focus({ preventScroll: true });
                  }}
                >
                  {readable ? '標準の文字に戻す' : '大きな文字で読む'}
                </button>
              </div>
            </nav>
          </details>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="page-main" aria-hidden={isIntroOpen || undefined} inert={isIntroOpen || undefined}>
        <div className={`sheet-frame${readable ? ' sheet-frame--readable' : ''}`}>
        <div className="sheet-top-bar">
          <a className="sheet-top-back" href={tabPath(returnDest.hash, base)}>
            <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
            <span>{returnDest.label}</span>
          </a>
          {inSetlist ? (
            <a className="sheet-top-setlist sheet-top-setlist--saved" href={tabPath('setlist', base)}>
              <Check size={14} strokeWidth={2.3} aria-hidden="true" />
              <span>MYセトリで確認</span>
            </a>
          ) : (
            <button
              type="button"
              className="sheet-top-setlist"
              onClick={() => void records.addToSetlist(song.id)}
            >
              <Plus size={14} strokeWidth={2.3} aria-hidden="true" />
              <span>MYセトリに追加</span>
            </button>
          )}
        </div>
        <article className="song-sheet" aria-labelledby="song-title">
          <header className="song-hero">
            <figure className="cover">
              {appleArtwork && !artworkFailed ? (
                <img
                  className="cover-art"
                  src={appleArtwork.artworkUrl}
                  alt={`「${fact.recording}」（${appleArtwork.albumName}）ジャケット画像`}
                  width={225}
                  height={225}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setArtworkFailed(true)}
                />
              ) : (
                <div className="cover-placeholder" aria-hidden="true" />
              )}
              <figcaption className="cover-caption">
                <a
                  className="cover-apple-badge"
                  href={appleArtwork?.appleUrl ?? fact.apple}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Apple Musicで「${fact.recording}」を聴く`}
                >
                  <img
                    className="cover-apple-badge-img"
                    src={`${base}badges/listen-on-apple-music-ja.svg`}
                    alt="Apple Musicで聴く"
                    width={140}
                    height={40}
                  />
                </a>
              </figcaption>
            </figure>
            <div className="hero-content">
              <h1 id="song-title">{song.title}</h1>
              <p className="recording">収録作品：<span>{formatAlbumDisplayName(fact.album)}</span></p>

              <dl className="song-facts">
                <div className="fact-item"><dt>演奏時間</dt><dd>{formatDuration(fact.seconds)}</dd></div>
                <div className="fact-item"><dt>テンポ</dt><dd>{formatSongBpm(page.id, fact.tempo)}{!tempoUnderReview && <> <small>BPM</small></>}</dd></div>
                <div className="fact-item"><dt>地声最低</dt><dd>{fact.low}</dd></div>
                <div className="fact-item"><dt>地声最高</dt><dd>{fact.chest}</dd></div>
                <div className={fact.falsetto ? 'fact-item' : 'fact-item fact-item--missing'}><dt>裏声最高</dt><dd>{fact.falsetto ?? '—'}</dd></div>
              </dl>
              {tempoUnderReview && <p className="tempo-explanation">テンポは資料によって値が異なるため、確認中です。</p>}
            </div>
          </header>

          {page.feature.kind === 'lyric-quote' ? (
            <figure className="feature-line feature-line--quote" aria-label="歌詞の引用">
              <blockquote
                className={`feature-phrase feature-phrase--quote${quoteTier && quoteTier !== 'standard' ? ` feature-phrase--quote-${quoteTier}` : ''}`}
                cite={page.feature.citeUrl}
              >
                <span className="feature-quote-body">
                  {quoteLines.map((phrases, lineIndex) => (
                    <Fragment key={lineIndex}>
                      {lineIndex > 0 ? '\n' : null}
                      {phrases.map((phrase, phraseIndex) => (
                        <Fragment key={phraseIndex}>
                          {phraseIndex > 0 ? ' ' : null}
                          <span className="feature-quote-phrase">{phrase}</span>
                        </Fragment>
                      ))}
                    </Fragment>
                  ))}
                </span>
              </blockquote>
              <figcaption className="feature-credit">
                {creditParts ? (
                  <>
                    <span className="feature-credit-chunk">{creditParts[0]}</span>
                    <span className="feature-credit-chunk">{creditParts[1]}</span>
                  </>
                ) : (
                  page.feature.credit
                )}
              </figcaption>
            </figure>
          ) : (
            <div className="feature-line" aria-label="当サイトによる曲の紹介文">
              <p className="feature-phrase">{page.feature.text}</p>
              <p className="feature-credit">{page.feature.credit}</p>
            </div>
          )}

          <section className="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">この曲について</h2>
            <div className="overview-copy">
              {page.overview.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {page.rangeNote && <p className="range-note">{page.rangeNote}</p>}
            </div>
            <p className="overview-sources">参考にした資料：{' '}
              {page.sources.slice(0, 2).map((source, index) => (
                <span key={`${source.label}-${index}`}>{index > 0 && '、'}<a href={source.evidence ? fact[source.evidence] : source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></span>
              ))}
              {' '}<a href="#song-sources" onClick={() => { if (sourcesRef.current) sourcesRef.current.open = true; }}>ほかの資料を見る</a>
            </p>
          </section>

          <section className="listen-section" aria-labelledby="listen-title">
            <div>
              <h2 id="listen-title">この曲を聴く</h2>
              <p>気になったら、実際の楽曲も聴いてみませんか。</p>
            </div>
            {videoId && video && isExternalOnlyVideo ? (
              <a
                href={video}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${song.title}をYouTubeで聴く${videoDescription ? `（${videoDescription}）` : ''}（新しいタブ）`}
                className="listen-video-card"
              >
                <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" />
                <span className="listen-video-play">
                  <Play size={16} aria-hidden="true" />
                  <span>YouTubeで聴く{videoDescription ? `（${videoDescription}）` : ''}</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </span>
              </a>
            ) : videoId && video ? (
              isPlayerLoaded ? (
                <div className="listen-video-wrap">
                  <iframe
                    className="listen-video-frame"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1`}
                    title={`${song.title}の公式動画・音源`}
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlayerLoaded(true)}
                  aria-label={`${song.title}の公式動画をこのページで再生`}
                  className="listen-video-card"
                >
                  <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" />
                  <span className="listen-video-play">
                    <Play size={16} aria-hidden="true" />
                    <span>このページで動画を再生</span>
                  </span>
                </button>
              )
            ) : null}
            <div className="listen-links">
              <a href={fact.apple} target="_blank" rel="noopener noreferrer">Apple Musicで聴く <span aria-hidden="true">↗</span></a>
              {video && (!videoId || !isExternalOnlyVideo) && (
                <a href={video} target="_blank" rel="noopener noreferrer">
                  YouTubeで開く{videoDescription && `（${videoDescription}）`} <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
            <p className="listen-note">※ ジャケット画像および配信情報は Apple Music の公開情報から参照しています。</p>
          </section>

          {related.length > 0 && <section className="related-section" aria-labelledby="related-title">
            <h2 id="related-title">次に聴きたい曲</h2>
            <ul>{related.map(item => <li key={item.id}>
              <a href={`${base}songs/${item.id}/`}><span>{item.title}</span><span aria-hidden="true">→</span></a>
              <p>{item.reason}</p>
            </li>)}</ul>
          </section>}

          <details ref={sourcesRef} id="song-sources" className="sources">
            <summary><strong>データと出典</strong><span>楽曲データ・参考資料を確認する <span aria-hidden="true">▼</span></span></summary>
            <div className="sources-body">
              <dl className="source-facts">
                <div><dt>配信日</dt><dd>{fact.release}</dd></div>
                <div><dt>収録作品</dt><dd>{formatAlbumDisplayName(fact.album)}{page.albumTrack ? `（${page.albumTrack}曲目）` : ''}</dd></div>
              </dl>
              {page.vocalVariants?.map(variant => (
                <p className="vocal-variant" key={variant.label}>
                  <strong>{variant.label}：</strong>{variant.value}（<a href={variant.sourceUrl} target="_blank" rel="noopener noreferrer">{variant.sourceLabel}</a>の調査）
                </p>
              ))}
              {fact.otherRange && !page.vocalVariants?.length && (
                <p className="vocal-variant">
                  <strong>別サイトの音域データ：</strong>地声最低 {fact.otherRange[0]} ／ 地声最高 {fact.otherRange[1]} ／ 裏声最高 {fact.otherRange[2] === '記載なし' ? '—' : fact.otherRange[2]}（<a href={fact.otherSource} target="_blank" rel="noopener noreferrer">音域データ！＠ウィキ</a>の調査）
                </p>
              )}
              <ul className="source-list">
                {page.sources.map((source, index) => (
                  <li key={`${source.label}-${index}`}>
                    <a href={source.evidence ? fact[source.evidence] : source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>：{source.purpose}
                  </li>
                ))}
              </ul>
              {tempoUnderReview && <p className="source-caveat">資料によって数値が異なるため、テンポは調査中です。参考資料には<a href={fact.tempoSource} target="_blank" rel="noopener noreferrer">約{fact.tempo} BPM</a>との表記があります。</p>}
              {otherTempos && (
                <p className="source-caveat">別の資料では{otherTempos.map((tempo, index) => (
                  <span key={`${tempo.url}-${tempo.value}`}>{index > 0 && '、'}<a href={tempo.url} target="_blank" rel="noopener noreferrer">約{tempo.value} BPM</a></span>
                ))}との表記もあります。拍の数え方や計測方法などによって数値が異なる場合があります。</p>
              )}
              <p className="source-caveat">{page.sourceCaveat}</p>
              <p className="source-caveat">BPMは資料の小数を四捨五入して表示しています。</p>
            </div>
          </details>

          {records.storageNotice && (
            <p className="storage-notice" role="alert">
              {records.storageNotice}{' '}
              <button type="button" onClick={records.downloadRecords}>画面上の記録を書き出す</button>
            </p>
          )}
          <div className="song-actions">
            {inSetlist ? (
              <a className="add-button add-button--saved" href={tabPath('setlist', base)}>
                <span aria-hidden="true">✓</span>MYセトリで確認
              </a>
            ) : (
              <button type="button" className="add-button" onClick={() => void records.addToSetlist(song.id)}>
                <span aria-hidden="true">+</span>MYセトリに追加
              </button>
            )}
            <a className="back-button" href={tabPath(returnDest.hash, base)}>{returnDest.label}</a>
          </div>
          {toast && <p className="toast" role="status" aria-live="polite">{toast}</p>}
        </article>
        </div>
      </main>

      <footer className="song-site-footer" aria-hidden={isIntroOpen || undefined} inert={isIntroOpen || undefined}>
        <div className="song-site-footer-inner">
          <p className="song-site-footer-brand">
            © 115万キロのファンノート — Official髭男dism 非公式ファンサイト
          </p>
          <p className="song-site-footer-note">
            ※当サイトはファンによる非公式ファンサイトであり、Official髭男dism公式および所属事務所・レコード会社とは一切関係ありません。
          </p>
          <p className="song-site-footer-storage">
            ※MYセトリや参戦・訪問記録はお使いのブラウザ内に保存されます（書き出し・初期化は<a href={tabPath('privacy', base)}>プライバシーポリシー</a>から行えます）。
          </p>
        </div>
      </footer>

      {hasLoadedMyNote && (
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <MyNoteModal
              isOpen={isMyNoteOpen}
              onClose={() => setIsMyNoteOpen(false)}
              songs={records.songs}
              setlist={records.setlist}
              setlistTitle={records.setlistTitle}
              resetEpoch={records.resetEpoch}
              visitedSpotIds={records.visitedSpotIds}
              attendedTourIds={records.attendedTourIds}
              bestQuizScore={records.bestQuizScore}
              votedKeys={records.votedKeys}
              reviews={records.reviews}
              onNavigateTab={tab => {
                setIsMyNoteOpen(false);
                window.location.assign(tabPath(tab, base));
              }}
              onNavigateSong={id => {
                setIsMyNoteOpen(false);
                const nextPath = songPagePath(id);
                if (nextPath) {
                  window.location.assign(`${base}${nextPath}`);
                }
              }}
              onSwitchSavedSetlist={(entries, title) => {
                writeQuickAddSetlistId(null, records.resetEpoch);
                records.replaceSetlistSilently(entries, title);
              }}
              onExportRecords={records.downloadRecords}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
